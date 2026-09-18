import "dotenv/config";

import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("./db.js");
const { createTrend } = await import("../modules/trends/trends.service.js");

const MarketCategory = db.orm.public!.MarketCategory!;
const Trend = db.orm.public!.Trend!;

const trends = [
  // --- FINTECH & FINANCIAL SERVICES ---
  {
    title: "Nepal Digital Payments Expansion 2026",
    description:
      "Digital wallets, QR payments, mobile banking, and merchant acceptance are expanding across Nepal as consumers and small businesses adopt faster cashless payment experiences.",
    industry: "Financial Services - Nepal",
    category: "Fintech",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Cross-Border Remittance Digitalization 2026",
    description:
      "Migration toward API-integrated digital remittance channels and instant bank deposits is reducing transfer friction for migrant workers in the GCC and East Asia.",
    industry: "Financial Services - Nepal",
    category: "Fintech",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Rural Microfinance Automation 2026",
    description:
      "Microfinance institutions are adopting cloud-based core banking systems and mobile loan collection apps to streamline rural lending operations.",
    industry: "Financial Services - Nepal",
    category: "Fintech",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Embedded Micro-Insurance 2026",
    description:
      "Digital payment and e-commerce platforms are embedding instant crop, health, and travel micro-insurance products directly into transaction flows.",
    industry: "Financial Services - Nepal",
    category: "Fintech",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Open Banking API Adoption 2026",
    description:
      "Commercial banks are opening secure developer APIs to enable third-party fintechs to build custom wealth management and automated payroll solutions.",
    industry: "Financial Services - Nepal",
    category: "Fintech",
    direction: "RISING" as const,
  },

  // --- HEALTHCARE & BIOTECH ---
  {
    title: "Nepal Telehealth Access Growth 2026",
    description:
      "Telemedicine, remote consultations, digital records, and connected care services are improving healthcare access for communities beyond Nepal's major urban centers.",
    industry: "Healthcare Technology - Nepal",
    category: "Healthcare",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Domestic Pharma Self-Sufficiency 2026",
    description:
      "Local pharmaceutical manufacturers are expanding WHO-GMP certified facilities to increase domestic market share in essential generic medicines.",
    industry: "Healthcare - Nepal",
    category: "Healthcare",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Diagnostic Lab Digitalization 2026",
    description:
      "Pathology networks are implementing automated sample tracking, home sample collection apps, and online report delivery to lower diagnostic turnaround times.",
    industry: "Healthcare - Nepal",
    category: "Healthcare",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Electronic Health Record Standardization 2026",
    description:
      "Private and public hospital chains are moving toward centralized electronic medical record systems to facilitate seamless patient transfers.",
    industry: "Healthcare Technology - Nepal",
    category: "Healthcare",
    direction: "RISING" as const,
  },

  // --- RENEWABLE ENERGY & INFRASTRUCTURE ---
  {
    title: "Nepal Solar and Microgrid Adoption 2026",
    description:
      "Distributed solar, battery storage, and community microgrids are gaining momentum in Nepal as organizations seek resilient and lower-cost energy solutions.",
    industry: "Renewable Energy - Nepal",
    category: "Renewable Energy",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Hydroelectric Power Export Shift 2026",
    description:
      "Operational capacity growth is enabling increased seasonal cross-border energy trading with regional neighbors like India and Bangladesh.",
    industry: "Renewable Energy - Nepal",
    category: "Renewable Energy",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Electric Vehicle Charging Infrastructure 2026",
    description:
      "Public highway fast-charging networks and commercial fleet electrification are accelerating the adoption of EV passenger cars and two-wheelers.",
    industry: "Automotive & Energy - Nepal",
    category: "Renewable Energy",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Green Building Materials Transition 2026",
    description:
      "Construction projects in major urban centers are prioritizing energy-efficient cement, lightweight fly-ash bricks, and eco-friendly structural designs.",
    industry: "Infrastructure - Nepal",
    category: "Infrastructure",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Urban Smart Water & Waste Management 2026",
    description:
      "Municipalities are testing IoT-based water distribution monitoring and organized waste-to-energy recovery programs to modernize city utilities.",
    industry: "Infrastructure - Nepal",
    category: "Infrastructure",
    direction: "RISING" as const,
  },

  // --- E-COMMERCE & LOGISTICS ---
  {
    title: "Nepal Online Retail Logistics 2026",
    description:
      "Local e-commerce platforms, social commerce, digital payments, and last-mile delivery networks are making online shopping more practical across Nepal.",
    industry: "E-Commerce - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Direct-to-Consumer Social Commerce 2026",
    description:
      "Micro-entrepreneurs are turning social channels into primary storefronts using integrated mobile wallet checkout and localized courier pickups.",
    industry: "Retail & E-Commerce - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Inter-City Express Freight Networks 2026",
    description:
      "Logistics providers are deploying hub-and-spoke parcel sorting centers along major national highways to improve next-day inter-city deliveries.",
    industry: "Logistics - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Metro Quick-Commerce Expansion 2026",
    description:
      "Sub-30-minute grocery and daily essential delivery models using dark stores are expanding rapidly across Kathmandu Valley and Lalitpur.",
    industry: "Retail & E-Commerce - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Cold-Chain Logistics Modernization 2026",
    description:
      "Temperature-controlled refrigerated transport fleets are growing to minimize post-harvest loss and support perishable pharmaceutical shipping.",
    industry: "Logistics - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },

  // --- FOOD, AGRICULTURE & AGTECH ---
  {
    title: "Nepal Precision Agriculture & Drone Spraying 2026",
    description:
      "Commercial farming cooperatives in the Terai region are adopting agricultural drones and soil sensors to optimize crop yield and chemical application.",
    industry: "Agriculture Technology - Nepal",
    category: "Food",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Farm-to-Table Supply Chain Traceability 2026",
    description:
      "High-value organic crop producers are utilizing digital marketplaces to connect directly with urban supermarkets and export channels.",
    industry: "Agriculture - Nepal",
    category: "Food",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Packaged Organic Food Shift 2026",
    description:
      "Urban consumers are moving away from loose commodity staples toward pre-packaged, quality-certified organic pulses, rice, and spices.",
    industry: "Food and Beverage - Nepal",
    category: "Food",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Commercial Poultry Automation 2026",
    description:
      "Poultry producers are installing climate-controlled brooding equipment and automated feed delivery to stabilize seasonal output.",
    industry: "Agriculture - Nepal",
    category: "Food",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Specialty Coffee & Orthodox Tea Exports 2026",
    description:
      "High-altitude specialty coffee beans and single-estate orthodox teas are gaining traction in premium niche markets across Europe and North America.",
    industry: "Agriculture - Nepal",
    category: "Food",
    direction: "RISING" as const,
  },

  // --- TECHNOLOGY, IT & AI ---
  {
    title: "Nepal AI Services Adoption 2026",
    description:
      "Small businesses, education providers, and service companies in Nepal are beginning to adopt localized AI tools for productivity, customer support, and business operations.",
    industry: "Artificial Intelligence - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Local Language NLP Models 2026",
    description:
      "Developers and academic institutes are building specialized Nepali language processing models for automated voice assistants, OCR, and banking bots.",
    industry: "Artificial Intelligence - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal IT Offshore Export Growth 2026",
    description:
      "Custom software engineering, DevOps, and QA outsourcing firms are scaling remote engineering teams to service international enterprise clients.",
    industry: "Information Technology - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Commercial Data Center Expansion 2026",
    description:
      "Enterprises and financial institutions are shifting on-premise infrastructure into tier-rated local colocation data centers to comply with data residency rules.",
    industry: "Information Technology - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Financial Enterprise Cybersecurity 2026",
    description:
      "Banking and telecom sectors are elevating investments in dedicated Security Operations Centers (SOC) and proactive vulnerability assessments.",
    industry: "Cybersecurity - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal FTTH Fiber Infrastructure Surge 2026",
    description:
      "Major ISPs are expanding fiber-to-the-home networks into secondary cities and rural municipal centers to meet high-bandwidth demand.",
    industry: "Telecommunications - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal EdTech Exam Prep Digitization 2026",
    description:
      "Digital learning apps and live class portals are witnessing widespread adoption among students preparing for national SEE, NEB, and entrance exams.",
    industry: "Education Technology - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },

  // --- TOURISM, HOSPITALITY & MEDIA ---
  {
    title: "Nepal Digital Trekking Permit Systems 2026",
    description:
      "Tourism boards and local authorities are digitizing trek registration and mountain emergency location beacons for international climbers.",
    industry: "Tourism Technology - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Boutique Eco-Resort Development 2026",
    description:
      "Hospitality investors are prioritizing high-value, low-impact sustainable mountain resorts over mass commercial hotel properties.",
    industry: "Hospitality - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Regional Airport Connectivity 2026",
    description:
      "Increased domestic flight frequency to newly expanded regional airports is opening up less-visited province corridors to domestic and foreign travel.",
    industry: "Aviation & Travel - Nepal",
    category: "Infrastructure",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Artisan Handicraft Cross-Border E-Commerce 2026",
    description:
      "Artisanal manufacturers of singing bowls, Pashmina, and felt crafts are leveraging global digital platforms to market products directly to consumers.",
    industry: "Manufacturing & Retail - Nepal",
    category: "E-Commerce",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Local OTT Content Streaming 2026",
    description:
      "Domestic digital media streaming platforms are investing in original web series and digital cinema releases tailored for local audiences.",
    industry: "Media & Entertainment - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Mobile Esports Ecosystem 2026",
    description:
      "Mobile game tournaments and local esports leagues are drawing major corporate sponsorships and growing a dedicated youth audience.",
    industry: "Entertainment & Tech - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Vocational Skill Portal Adoption 2026",
    description:
      "Skilled trade platforms are connecting certified electricians, plumbers, and technicians with household consumers via mobile request apps.",
    industry: "Education & Workforce - Nepal",
    category: "Technology",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Commercial PropTech & Virtual Touring 2026",
    description:
      "Real estate developers are using 3D virtual walkthroughs and digital portal listings to streamline commercial office leasing in city hubs.",
    industry: "Real Estate - Nepal",
    category: "Infrastructure",
    direction: "RISING" as const,
  },
  {
    title: "Nepal Circular Plastic Recycling 2026",
    description:
      "Industrial recyclers are introducing closed-loop processing plants to turn municipal plastic waste into industrial packaging materials.",
    industry: "CleanTech - Nepal",
    category: "Renewable Energy",
    direction: "RISING" as const,
  },
];

async function main() {
  console.log(`Starting trend ingestion (${trends.length} total)...`);

  for (const input of trends) {
    const category = await MarketCategory.where({ name: input.category }).all().first();

    if (!category) {
      console.warn(`Skipping '${input.title}': category '${input.category}' was not found.`);
      continue;
    }

    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await Trend.where({ slug }).all().first();

    if (existing) {
      console.log(`Already exists: ${input.title}`);
      continue;
    }

    const trend = await createTrend({
      title: input.title,
      description: input.description,
      industry: input.industry,
      direction: input.direction,
      categoryId: category.id,
    });

    console.log(`Created: ${trend.title}`);
  }

  console.log("Trend seeding completed.");
  await db.close();
}

main().catch(async (error) => {
  console.error("Trend seeding error:", error);
  await db.close();
  process.exit(1);
});