import { createAnthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { CONCIERGE_SYSTEM } from "@/lib/chat/concierge";
import { searchListings } from "@/lib/chat/listing-search";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import { getListingBySlug } from "@/lib/data/listings";
import { priceLabel } from "@/lib/format";

// Chat replies stream token-by-token; allow a generous window for tool loops.
export const maxDuration = 60;

// Cost guards: cap how much context one request can carry to the model.
const MAX_MESSAGES = 40;
const MAX_INPUT_CHARS = 2_000;
const SESSION_COOKIE = "cs_chat";

// Reads ANTHROPIC_API_KEY from the environment. If the key is org-scoped rather
// than workspace-scoped, Anthropic requires an `anthropic-workspace-id` header —
// set ANTHROPIC_WORKSPACE_ID to supply it (a workspace-scoped key needs neither).
const anthropic = createAnthropic(
  process.env.ANTHROPIC_WORKSPACE_ID
    ? { headers: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } }
    : undefined,
);

function text(body: string, status: number, headers?: HeadersInit) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", ...headers } });
}

/** Stable per-browser key for rate limiting; falls back to client IP. */
function sessionKey(req: Request): { key: string; setCookie?: string } {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)cs_chat=([a-f0-9-]+)/i);
  if (match) return { key: match[1] };

  const id = crypto.randomUUID();
  const setCookie = `${SESSION_COOKIE}=${id}; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly`;
  return { key: id, setCookie };
}

function lastUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return "";
  return last.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ");
}

const INTENTS = ["sale", "rent", "short_let"] as const;
const TYPES = [
  "apartment",
  "house",
  "townhouse",
  "land",
  "commercial",
  "off_plan",
  "venue",
] as const;
const COUNTRIES = ["Kenya", "Uganda", "Tanzania", "Rwanda"] as const;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return text("The assistant isn't configured yet. Please try again later.", 503);
  }

  const { key, setCookie } = sessionKey(req);
  const cookieHeader = setCookie ? { "Set-Cookie": setCookie } : undefined;

  const limit = checkRateLimit(key);
  if (!limit.ok) {
    return text(
      "You're sending messages a little too quickly. Please wait a moment and try again.",
      429,
      { ...cookieHeader, "Retry-After": String(limit.retryAfter ?? 30) },
    );
  }

  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return text("Invalid request.", 400, cookieHeader);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return text("No message provided.", 400, cookieHeader);
  }
  if (messages.length > MAX_MESSAGES) {
    return text("This conversation is too long — please start a new chat.", 413, cookieHeader);
  }
  if (lastUserText(messages).length > MAX_INPUT_CHARS) {
    return text("That message is too long. Please shorten it and try again.", 413, cookieHeader);
  }

  const result = streamText({
    model: anthropic("claude-haiku-4-5"),
    system: CONCIERGE_SYSTEM,
    messages: await convertToModelMessages(messages),
    // Let the model call a tool, read the result, then answer in one turn.
    stopWhen: stepCountIs(5),
    tools: {
      searchListings: tool({
        description:
          "Search CoralStones' live, verified property inventory. Use whenever the visitor describes what they're looking for (budget, location, type, bedrooms, buy vs rent). Budgets are in the listing's local currency (KES for Kenya).",
        inputSchema: z.object({
          intent: z
            .enum(INTENTS)
            .optional()
            .describe("sale = to buy, rent = long-term rental, short_let = nightly/short stay"),
          type: z.enum(TYPES).optional(),
          country: z.enum(COUNTRIES).optional(),
          location: z
            .string()
            .optional()
            .describe("City, county, area or estate, e.g. 'Nairobi', 'Kilimani', 'Mombasa'"),
          minPrice: z.number().optional().describe("Minimum price in the listing currency"),
          maxPrice: z.number().optional().describe("Maximum budget in the listing currency"),
          minBeds: z.number().int().optional().describe("Minimum number of bedrooms"),
          limit: z.number().int().optional().describe("How many results to return (1-10, default 5)"),
        }),
        execute: async (filters) => searchListings(filters),
      }),

      getListingDetails: tool({
        description:
          "Fetch full detail for one property by its slug (returned as `slug` by searchListings). Use when the visitor asks about a specific listing.",
        inputSchema: z.object({
          slug: z.string().describe("The listing slug, e.g. 'kilimani-2br-apartment'"),
        }),
        execute: async ({ slug }) => {
          const p = await getListingBySlug(slug);
          if (!p) return { found: false as const, slug };
          return {
            found: true as const,
            slug: p.slug,
            title: p.title,
            type: p.type,
            intent: p.intent,
            status: p.status,
            price: priceLabel(p),
            location: [p.estate, p.area, p.county, p.country].filter(Boolean).join(", "),
            beds: p.beds,
            baths: p.baths,
            size: p.size ? `${p.size} ${p.sizeUnit ?? "sqm"}` : undefined,
            titleType: p.titleType,
            furnishing: p.furnishing,
            amenities: p.amenities,
            verified: p.verified.map((v) => v.kind),
            agent: { name: p.agent.name, agency: p.agent.agency, verified: p.agent.verified },
            description: p.description,
            url: `/property/${p.slug}`,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    ...(cookieHeader ? { headers: cookieHeader } : {}),
    onError: (error) => {
      // Log the real reason server-side (visible in Vercel logs); keep the
      // client message generic so provider details aren't leaked to visitors.
      console.error("[chat] stream error:", error);
      return "Sorry, I hit a problem answering that. Please try again.";
    },
  });
}
