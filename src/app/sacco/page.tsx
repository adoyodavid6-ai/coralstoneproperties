import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Users, Check, Trend, CheckShield } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "SACCO & group-buying — CoralStone",
  description: "How SACCOs and cooperative group-buying unlock property ownership in East Africa — and how CoralStone facilitates it.",
};

const HOW_IT_WORKS = [
  { n: "01", title: "Form or join a group", detail: "A SACCO, chama or informal cooperative of 5–50+ members agrees on a target property type and budget. Groups can be colleagues, church members, family, alumni — any trusted network." },
  { n: "02", title: "Pool deposits on CoralStone", detail: "Members contribute monthly to a group account. CoralStone tracks group targets and notifies the group when a matching off-plan or plot becomes available." },
  { n: "03", title: "CoralStone negotiates block rates", detail: "Developers offer significant discounts (10–25%) for block purchases of 5+ units. Our commercial team negotiates on behalf of your group before the deal is presented." },
  { n: "04", title: "Legal setup", detail: "A registered legal entity (company or cooperative society) is formed to hold the property. Our verified conveyancers handle the structure at preferential rates for CoralStone groups." },
  { n: "05", title: "Title per member", detail: "On completion, each member receives their individual title deed. The group entity is dissolved and each person owns their unit outright." },
];

const BENEFITS = [
  "Access off-plan discounts not available to individual buyers",
  "Lower deposit requirement per member",
  "Stronger negotiating position with developers",
  "Shared legal and due diligence costs",
  "Build credit history through SACCO membership",
  "Pool resources for high-value plots or commercial property",
];

export default function SaccoPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">Collective ownership</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          SACCO &amp; group-buying
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
          Property ownership does not have to be a solo journey. SACCOs and chamas have been
          financing homes across East Africa for decades. CoralStone connects groups to verified
          developers and helps them get the deal done safely.
        </p>
      </section>

      {/* What is a SACCO */}
      <section className="container-page py-14 sm:py-18">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">What is a SACCO?</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">
              East Africa&apos;s most powerful savings tool
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
              <p>
                A SACCO (Savings and Credit Co-operative) is a member-owned financial cooperative where
                members save regularly and can borrow at low interest rates — often 12% per annum compared
                to bank mortgage rates of 18–25%.
              </p>
              <p>
                Kenya alone has over 14,000 registered SACCOs with combined assets exceeding KSh 1.1 trillion.
                It is the deepest cooperative savings culture in the region — a natural
                engine for the group property ownership CoralStone is built to serve.
              </p>
              <p>
                For property, SACCOs offer two key advantages: low-interest loans for deposits, and collective
                purchasing power for block buys from developers.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/mortgage" className="text-sm font-semibold text-accent hover:brightness-90">
                Calculate SACCO vs bank mortgage costs →
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">Why group-buying works</p>
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-raised px-4 py-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-ink-soft">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <p className="eyebrow">The CoralStone group-buying process</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">From savings pool to title deed</h2>
          <div className="mt-8 space-y-5">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} className="flex gap-5 rounded-2xl border border-line bg-surface-raised px-6 py-5 shadow-card">
                <span className="figure grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{s.n}</span>
                <div>
                  <h3 className="font-semibold text-primary">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer discount example */}
      <section className="container-page py-14 sm:py-18">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Real numbers</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">What a group discount looks like</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="pb-3 font-semibold text-primary">Scenario</th>
                  <th className="pb-3 font-semibold text-primary">Individual buyer</th>
                  <th className="pb-3 font-semibold text-accent">Group of 10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { label: "Unit price", solo: "KSh 6,500,000", group: "KSh 5,525,000" },
                  { label: "Discount",   solo: "—",             group: "15% (KSh 975,000 saved)" },
                  { label: "Legal fees", solo: "KSh 195,000",   group: "KSh 90,000 (shared)" },
                  { label: "Deposit (10%)", solo: "KSh 650,000", group: "KSh 552,500 (per member)" },
                  { label: "Total saving per member", solo: "—", group: "≈ KSh 1,027,500" },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-3 text-ink-soft">{row.label}</td>
                    <td className="py-3 figure text-ink-soft">{row.solo}</td>
                    <td className="py-3 figure font-semibold text-accent">{row.group}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-ink-soft">Example based on 2BR off-plan apartment in Kilimani, Nairobi. Prices illustrative.</p>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-surface-muted py-14">
        <div className="container-page max-w-2xl mx-auto">
          <p className="eyebrow">Eligibility</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">Requirements for group buying via CoralStone</h2>
          <div className="mt-6 space-y-3 text-sm text-ink-soft">
            {[
              "Minimum 5 members per group (maximum no limit)",
              "Each member must be verified on CoralStone (name, ID, contact)",
              "Group must form a legal entity (limited company or cooperative society) before title transfer",
              "At least 30% combined deposit available at signing",
              "All members must agree to the purchase terms in writing",
              "CoralStone recommends (but does not require) a group agreement covering exit rights, default rules and voting",
            ].map((r) => (
              <div key={r} className="flex items-start gap-2.5 bg-surface-raised rounded-lg border border-line px-4 py-3">
                <CheckShield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Register your group or SACCO</p>
        <p className="mt-1 text-sm text-white/55">We will match you with developer block deals and walk you through the legal setup.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact" variant="coral">Register your group</ButtonLink>
          <ButtonLink href="/search?type=off_plan" variant="inverse">Browse off-plan listings</ButtonLink>
        </div>
      </section>
    </>
  );
}
