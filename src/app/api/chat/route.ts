import { anthropic } from "@ai-sdk/anthropic";
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
import { getListingBySlug } from "@/lib/data/listings";
import { priceLabel } from "@/lib/format";

// Chat replies stream token-by-token; allow a generous window for tool loops.
export const maxDuration = 60;

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
    return Response.json(
      { error: "The assistant isn't configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
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

  return result.toUIMessageStreamResponse();
}
