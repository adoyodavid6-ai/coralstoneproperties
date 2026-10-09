import { revalidatePath } from "next/cache";
import { Panel } from "@/components/admin/ui";
import {
  listOwners,
  listMediatedProperties,
  promoteToOwnerByEmail,
  assignPropertyOwner,
  findUserByEmail,
} from "@/lib/admin/owners";

// Live data from Supabase — always render per request.
export const dynamic = "force-dynamic";

async function promoteAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  await promoteToOwnerByEmail(email);
  revalidatePath("/admin/owners");
}

async function assignAction(formData: FormData) {
  "use server";
  const propertyId = String(formData.get("propertyId") ?? "");
  const ownerEmail = String(formData.get("ownerEmail") ?? "");
  const user = await findUserByEmail(ownerEmail);
  if (user && propertyId) await assignPropertyOwner(propertyId, user.id);
  revalidatePath("/admin/owners");
}

export default async function AdminOwners() {
  const [owners, properties] = await Promise.all([listOwners(), listMediatedProperties()]);
  const linked = properties.filter((p) => p.ownerId);
  const unlinked = properties.filter((p) => !p.ownerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Owners (hosts)</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Promote a signed-up account to a host, then link it to its short-let / venue listing. Hosts
          then self-manage payout details and bookings from their dashboard.
        </p>
      </div>

      <Panel title={`Hosts (${owners.length})`}>
        <form action={promoteAction} className="mb-4 flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[220px] text-sm">
            <span className="mb-1 block text-xs font-medium text-ink-soft">Promote account by email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="person@email.com"
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <button type="submit" className="rounded-full bg-ink-black px-5 py-2 text-sm font-medium text-white">
            Make host
          </button>
        </form>
        {owners.length === 0 ? (
          <p className="text-sm text-ink-soft">No hosts yet.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {owners.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <span className="text-primary">{o.fullName || "—"}</span>
                <span className="text-ink-soft">{o.email}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Mediated listings (${properties.length})`}>
        <form action={assignAction} className="mb-4 flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[180px] text-sm">
            <span className="mb-1 block text-xs font-medium text-ink-soft">Listing</span>
            <select
              name="propertyId"
              required
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.ownerId ? "(linked)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 min-w-[180px] text-sm">
            <span className="mb-1 block text-xs font-medium text-ink-soft">Host email</span>
            <input
              name="ownerEmail"
              type="email"
              required
              placeholder="host@email.com"
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <button type="submit" className="rounded-full bg-ink-black px-5 py-2 text-sm font-medium text-white">
            Link owner
          </button>
        </form>
        <p className="text-sm text-ink-soft">
          {linked.length} linked · {unlinked.length} awaiting an owner.
        </p>
      </Panel>
    </div>
  );
}
