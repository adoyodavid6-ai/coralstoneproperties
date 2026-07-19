import type { Agent } from "@/lib/types";

// Vetted agents — response time and completed deals are *earned* stats (§9).
export const AGENTS: Record<string, Agent> = {
  wanjiru: {
    id: "ag_wanjiru",
    name: "Wanjiru Kamau",
    agency: "Acacia Prime Realty",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=70",
    verified: ["agent", "agency"],
    responseMins: 14,
    completedDeals: 63,
    phone: "+254700100200",
    whatsapp: "254700100200",
  },
  otieno: {
    id: "ag_otieno",
    name: "Brian Otieno",
    agency: "Lakebridge Properties",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=70",
    verified: ["agent", "agency"],
    responseMins: 22,
    completedDeals: 41,
    phone: "+254711220330",
    whatsapp: "254711220330",
  },
  achieng: {
    id: "ag_achieng",
    name: "Achieng' Odhiambo",
    agency: "Coastline Homes",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=70",
    verified: ["agent", "agency"],
    responseMins: 9,
    completedDeals: 88,
    phone: "+254722330440",
    whatsapp: "254722330440",
  },
  mwangi: {
    id: "ag_mwangi",
    name: "Peter Mwangi",
    agency: "Highland Land & Survey",
    avatarUrl:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=70",
    verified: ["agent"],
    responseMins: 35,
    completedDeals: 27,
    phone: "+254733440550",
    whatsapp: "254733440550",
  },
  developer: {
    id: "ag_riverbourne",
    name: "Riverbourne Developments",
    agency: "Riverbourne Developments EA",
    avatarUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=200&q=70",
    verified: ["developer", "agency"],
    responseMins: 48,
    completedDeals: 12,
    phone: "+255744550660",
    whatsapp: "255744550660",
  },
  nakato: {
    id: "ag_nakato",
    name: "Sarah Nakato",
    agency: "Pearl Estates Kampala",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=70",
    verified: ["agent", "agency"],
    responseMins: 18,
    completedDeals: 54,
    phone: "+256772100200",
    whatsapp: "256772100200",
  },
  mugisha: {
    id: "ag_mugisha",
    name: "Eric Mugisha",
    agency: "Kigali Prime Realty",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=70",
    verified: ["agent", "agency"],
    responseMins: 12,
    completedDeals: 47,
    phone: "+250788330440",
    whatsapp: "250788330440",
  },
  salum: {
    id: "ag_salum",
    name: "Salum Rashid",
    agency: "Zanzibar Coast Homes",
    avatarUrl:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=70",
    verified: ["agent", "agency"],
    responseMins: 15,
    completedDeals: 72,
    phone: "+255715330440",
    whatsapp: "255715330440",
  },
};
