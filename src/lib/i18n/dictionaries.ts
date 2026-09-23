// English + Swahili parity from day one (Masterplan §3, §7 Stage 1).
// Keys are dot-namespaced. Add both languages whenever you add a string.

export type Locale = "en" | "sw";

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "sw", label: "Kiswahili", short: "SW" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.buy": "Buy",
  "nav.rent": "Rent",
  "nav.land": "Land",
  "nav.commercial": "Commercial",
  "nav.offplan": "Off-plan",
  "nav.shortlet": "Short-let",
  "nav.areaGuides": "Area guides",
  "nav.list": "List a property",
  "nav.signin": "Sign in",

  "hero.eyebrow": "East Africa's trust-first property portal",
  "hero.title": "Every listing verified. So you never chase a ghost again.",
  "hero.subtitle":
    "We check the agent, the agency, the listing and — for land — the title, before it reaches you. Search with confidence across Kenya — sales, rentals, land, commercial and off-plan.",
  "hero.searchPlaceholder": "Try “3 bed in Kilimani” or “land near Nairobi”",
  "hero.search": "Search",

  "search.title": "Search properties",
  "search.results": "properties",
  "search.filters": "Filters",
  "search.sort": "Sort",
  "search.sort.relevance": "Relevance",
  "search.sort.priceAsc": "Price: low to high",
  "search.sort.priceDesc": "Price: high to low",
  "search.sort.newest": "Newest",
  "search.sort.mostViewed": "Most viewed",
  "search.verifiedOnly": "Verified only",
  "search.clear": "Clear all",
  "search.empty.title": "No properties match those filters",
  "search.empty.body": "Try widening your price range or clearing a filter.",

  "card.save": "Save",
  "card.saved": "Saved",
  "card.compare": "Compare",
  "card.perMonth": "/mo",
  "card.reduced": "Price reduced",
  "card.new": "New",

  "pdp.enquire": "Enquire",
  "pdp.whatsapp": "WhatsApp",
  "pdp.call": "Masked call",
  "pdp.book": "Book viewing",
  "pdp.reserve": "Reserve",
  "pdp.offer": "Make offer",
  "pdp.trueCost": "True monthly cost",
  "pdp.mortgage": "Mortgage snapshot",
  "pdp.amenities": "Amenities",
  "pdp.location": "Location intelligence",
  "pdp.similar": "Similar homes nearby",
  "pdp.report": "Report this listing",
  "pdp.aiNote": "AI-assisted, human-approved",
  "pdp.daysOnMarket": "days on market",
  "pdp.views": "views",

  "footer.tagline": "Verification is the moat — not a footnote.",
  "footer.rights": "All rights reserved.",

  "common.beds": "beds",
  "common.baths": "baths",
  "common.verified": "Verified",
};

const sw: Dict = {
  "nav.buy": "Nunua",
  "nav.rent": "Kodisha",
  "nav.land": "Ardhi",
  "nav.commercial": "Biashara",
  "nav.offplan": "Ujenzi mpya",
  "nav.shortlet": "Kukaa kifupi",
  "nav.areaGuides": "Miongozo ya maeneo",
  "nav.list": "Orodhesha mali",
  "nav.signin": "Ingia",

  "hero.eyebrow": "Lango la mali linaloaminika zaidi Afrika Mashariki",
  "hero.title": "Kila tangazo limehakikiwa. Usifukuzie tangazo la uongo tena.",
  "hero.subtitle":
    "Tunamhakiki wakala, kampuni, tangazo na — kwa ardhi — hati, kabla halijakufikia. Tafuta kwa uhakika kote Kenya: mauzo, kodi, ardhi, biashara na ujenzi mpya.",
  "hero.searchPlaceholder": "Jaribu “vyumba 3 Kilimani” au “ardhi karibu na Nairobi”",
  "hero.search": "Tafuta",

  "search.title": "Tafuta mali",
  "search.results": "mali",
  "search.filters": "Vichujio",
  "search.sort": "Panga",
  "search.sort.relevance": "Umuhimu",
  "search.sort.priceAsc": "Bei: chini kwenda juu",
  "search.sort.priceDesc": "Bei: juu kwenda chini",
  "search.sort.newest": "Mpya zaidi",
  "search.sort.mostViewed": "Zilizotazamwa zaidi",
  "search.verifiedOnly": "Zilizohakikiwa pekee",
  "search.clear": "Futa zote",
  "search.empty.title": "Hakuna mali inayolingana na vichujio hivyo",
  "search.empty.body": "Jaribu kupanua bei au kuondoa kichujio.",

  "card.save": "Hifadhi",
  "card.saved": "Imehifadhiwa",
  "card.compare": "Linganisha",
  "card.perMonth": "/mwezi",
  "card.reduced": "Bei imepunguzwa",
  "card.new": "Mpya",

  "pdp.enquire": "Uliza",
  "pdp.whatsapp": "WhatsApp",
  "pdp.call": "Simu iliyofichwa",
  "pdp.book": "Panga kutembelea",
  "pdp.reserve": "Weka nafasi",
  "pdp.offer": "Toa zabuni",
  "pdp.trueCost": "Gharama halisi ya mwezi",
  "pdp.mortgage": "Muhtasari wa mkopo",
  "pdp.amenities": "Huduma",
  "pdp.location": "Akili ya eneo",
  "pdp.similar": "Nyumba zinazofanana karibu",
  "pdp.report": "Ripoti tangazo hili",
  "pdp.aiNote": "Imesaidiwa na AI, imeidhinishwa na binadamu",
  "pdp.daysOnMarket": "siku sokoni",
  "pdp.views": "mionekano",

  "footer.tagline": "Uhakiki ndio ngome — si jambo dogo.",
  "footer.rights": "Haki zote zimehifadhiwa.",

  "common.beds": "vyumba",
  "common.baths": "bafu",
  "common.verified": "Imehakikiwa",
};

export const DICTIONARIES: Record<Locale, Dict> = { en, sw };

export function translate(locale: Locale, key: string): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
}
