import "dotenv/config";

import { Temporal as PolyfillTemporal } from "@js-temporal/polyfill";
import redis from "../config/redis.js";
import { invalidateCache } from "../utils/cache.js";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("./db.js");
const { ingestReport } = await import("../modules/ingestion/ingestion.service.js");

const MarketCategory = db.orm.public!.MarketCategory!;
const MarketReport = db.orm.public!.MarketReport!;

const reports = [
  // --- FINTECH & FINANCIAL SERVICES ---
  {
    title: "Nepal Digital Payments Market 2026",
    summary: "Analysis of digital wallets, QR payments, mobile banking, and merchant adoption in Nepal.",
    content: "Detailed analysis of QR payment inter-operability, digital wallet growth driven by Fonepay and eSewa, and regulatory directives from Nepal Rastra Bank (NRB) shaping digital transactions.",
    industry: "Financial Services - Nepal",
    region: "Nepal",
    categorySlug: "fintech",
    source: "https://example.com/source-1",
    datasets: [
      {
        name: "Nepal Digital Payment Channels Share",
        description: "Breakdown of total transaction volume by payment channel.",
        data: {
          QR_Payments: 42,
          Mobile_Banking: 31,
          Digital_Wallets: 18,
          Cards_and_POS: 9,
        },
      },
    ],
  },
  {
    title: "Nepal Cross-Border Remittance & Digital Channels 2026",
    summary: "Evaluation of remittance inflows, formal banking channels, and crypto-asset compliance in Nepal.",
    content: "Examines remittance pipelines from GCC countries, Malaysia, and Australia, focusing on API integrations with foreign exchange platforms and instant deposit services.",
    industry: "Financial Services - Nepal",
    region: "Nepal",
    categorySlug: "fintech",
    source: "https://example.com/source-2",
    datasets: [
      {
        name: "Remittance Source Regions Share",
        description: "Distribution of inbound remittance by geographic origin.",
        data: {
          GCC_Countries: 48,
          Malaysia: 18,
          Australia: 14,
          North_America: 12,
          Europe_and_Others: 8,
        },
      },
    ],
  },
  {
    title: "Nepal Microfinance & Rural Inclusion 2026",
    summary: "Assessment of MFI reach, digital credit scoring, and women-led rural entrepreneurship in Nepal.",
    content: "Covers consolidation among microfinance institutions (MFIs), digital onboarding strategies for unbanked rural populations, and micro-loan recovery performance.",
    industry: "Financial Services - Nepal",
    region: "Nepal",
    categorySlug: "fintech",
    source: "https://example.com/source-3",
    datasets: [
      {
        name: "MFI Loan Portfolio Distribution",
        description: "Percentage breakdown of MFI loan allocations by sector.",
        data: {
          Agriculture_and_Livestock: 45,
          Micro_Retail: 28,
          Cottage_Industries: 15,
          Personal_Emergency: 12,
        },
      },
    ],
  },
  {
    title: "Nepal Insurance & InsurTech Landscape 2026",
    summary: "Strategic overview of life, health, and agricultural insurance penetration and digital claims processing.",
    content: "Insights into micro-insurance products for smallholder farmers, mobile app-based insurance renewals, and regulatory shifts under the Nepal Insurance Authority.",
    industry: "Financial Services - Nepal",
    region: "Nepal",
    categorySlug: "fintech",
    source: "https://example.com/source-4",
    datasets: [
      {
        name: "Insurance Product Penetration",
        description: "Market share by premium collected per insurance line.",
        data: {
          Life_Insurance: 64,
          Motor_Vehicle: 16,
          Property_and_Fire: 12,
          Agriculture_and_Health: 8,
        },
      },
    ],
  },
  {
    title: "Nepal Neobanking & Open Banking Framework 2026",
    summary: "Exploration of open API adoption among commercial banks and emerging non-bank financial interfaces.",
    content: "Analyzes bank-fintech partnerships enabling embedded finance, automated payroll processing, and personal financial management tools for young urban professionals.",
    industry: "Financial Services - Nepal",
    region: "Nepal",
    categorySlug: "fintech",
    source: "https://example.com/source-5",
    datasets: [
      {
        name: "Open API Integration Priorities",
        description: "Focus areas for API integrations among commercial banks.",
        data: {
          Payment_Gateways: 40,
          Credit_Scoring: 25,
          KYC_Verification: 20,
          Wealth_Management: 15,
        },
      },
    ],
  },

  // --- FOOD, AGRICULTURE & AGTECH ---
  {
    title: "Nepal Food and Beverage Market 2026",
    summary: "Analysis of restaurants, packaged foods, beverages, street food, and food delivery in Nepal.",
    content: "Examines the shift toward packaged organic staples, rapid growth of QSR chains in Pokhara and Kathmandu, and online food aggregation platforms.",
    industry: "Food and Beverage - Nepal",
    region: "Nepal",
    categorySlug: "food",
    source: "https://example.com/source-6",
    datasets: [
      {
        name: "Nepal Food Market Segments",
        description: "Estimated market share by food segment.",
        data: {
          Restaurants: 32,
          PackagedFoods: 25,
          Beverages: 21,
          StreetFood: 14,
          OrganicFoods: 8,
        },
      },
    ],
  },
  {
    title: "Nepal Agriculture Technology Market 2026",
    summary: "Analysis of farm technology, digital marketplaces, irrigation systems, and agricultural supply chains in Nepal.",
    content: "Covers precision agriculture adoption, drone spraying in Terai plains, IoT-driven soil monitoring, and direct-to-consumer farm produce marketplaces.",
    industry: "Agriculture Technology - Nepal",
    region: "Nepal",
    categorySlug: "food",
    source: "https://example.com/source-7",
    datasets: [
      {
        name: "AgTech Solution Adoption",
        description: "Adoption rates among modern farming cooperatives.",
        data: {
          Solar_Pumping: 38,
          Digital_Marketplaces: 26,
          Soil_Sensors: 20,
          Drone_Spraying: 16,
        },
      },
    ],
  },
  {
    title: "Nepal Dairy Processing & Cold Chain Logistics 2026",
    summary: "Study of dairy output, pasteurization technologies, and refrigerated logistics across provincial corridors.",
    content: "Analyzes private and cooperative dairy processing plants, cold storage deficits, and smart temperature tracking for perishable milk products.",
    industry: "Agriculture - Nepal",
    region: "Nepal",
    categorySlug: "food",
    source: "https://example.com/source-8",
    datasets: [
      {
        name: "Dairy Product Volume Breakdown",
        description: "Share of processed milk volume by final product.",
        data: {
          Fluid_Pasteurized_Milk: 55,
          Ghee_and_Butter: 22,
          Paneer_and_Cheese: 15,
          Curd_and_Yogurt: 8,
        },
      },
    ],
  },
  {
    title: "Nepal Commercial Poultry & Feeds Market 2026",
    summary: "Evaluation of poultry farming, automated feed production, and disease surveillance networks.",
    content: "Detailed breakdown of broiler and layer chicken farms, feed raw material sourcing, and farm-to-table traceability adoption.",
    industry: "Agriculture - Nepal",
    region: "Nepal",
    categorySlug: "food",
    source: "https://example.com/source-9",
    datasets: [
      {
        name: "Poultry Market Value Share",
        description: "Revenue breakdown across the commercial poultry value chain.",
        data: {
          Broiler_Meat: 58,
          Egg_Production: 27,
          Hatchery_and_Chicks: 10,
          Value_Added_Poultry: 5,
        },
      },
    ],
  },
  {
    title: "Nepal Tea & Coffee Export Ecosystem 2026",
    summary: "Analysis of high-altitude orthodox tea, specialty Arabica coffee production, and international branding.",
    content: "Focuses on processing technology, organic certification challenges, direct export corridors to Europe and North America, and boutique tasting tourism.",
    industry: "Agriculture - Nepal",
    region: "Nepal",
    categorySlug: "food",
    source: "https://example.com/source-10",
    datasets: [
      {
        name: "Specialty Tea and Coffee Exports",
        description: "Export destination percentage breakdown for premium tea and coffee.",
        data: {
          India: 40,
          Europe: 28,
          North_America: 18,
          Japan_and_East_Asia: 14,
        },
      },
    ],
  },

  // --- HEALTHCARE & BIOTECH ---
  {
    title: "Nepal Healthcare Technology Market 2026",
    summary: "Analysis of telehealth, digital records, remote monitoring, and healthcare software in Nepal.",
    content: "Reviews rural telemedicine expansion, hospital management information system (HMIS) integration, and diagnostic lab booking apps.",
    industry: "Healthcare Technology - Nepal",
    region: "Nepal",
    categorySlug: "healthcare",
    source: "https://example.com/source-11",
    datasets: [
      {
        name: "HealthTech Adoption by Segment",
        description: "Distribution of software investment across healthcare providers.",
        data: {
          Hospital_Management_Systems: 42,
          Teleconsultation_Apps: 28,
          Diagnostic_Lab_Portals: 18,
          Pharmacy_Inventory_Tech: 12,
        },
      },
    ],
  },
  {
    title: "Nepal Pharmaceutical Manufacturing Industry 2026",
    summary: "Assessment of domestic drug synthesis, active pharmaceutical ingredient (API) sourcing, and regulatory compliance.",
    content: "Examines self-sufficiency goals in essential medicines, WHO-GMP certification among domestic producers, and supply chain vulnerabilities.",
    industry: "Healthcare - Nepal",
    region: "Nepal",
    categorySlug: "healthcare",
    source: "https://example.com/source-12",
    datasets: [
      {
        name: "Domestic vs Imported Pharma Supply",
        description: "Market share of essential and specialized pharmaceuticals.",
        data: {
          Domestic_Formulations: 48,
          Imported_Formulations: 52,
        },
      },
    ],
  },
  {
    title: "Nepal Diagnostic Infrastructure & Medical Devices 2026",
    summary: "Insights into advanced imaging, automated laboratory equipment, and import trends for specialized care.",
    content: "Analyzes public-private partnerships in diagnostic lab operations, tertiary care centers, and point-of-care testing equipment in hilly regions.",
    industry: "Healthcare - Nepal",
    region: "Nepal",
    categorySlug: "healthcare",
    source: "https://example.com/source-13",
    datasets: [
      {
        name: "Diagnostic Services Revenue Share",
        description: "Breakdown of total revenue in domestic diagnostic centers.",
        data: {
          Pathology_Testing: 54,
          Radiology_and_Imaging: 31,
          Specialized_Genomic_Tests: 15,
        },
      },
    ],
  },

  // --- RENEWABLE ENERGY & INFRASTRUCTURE ---
  {
    title: "Nepal Hydroelectric Power Generation 2026",
    summary: "Comprehensive study of operational plants, cross-border energy trading with India and Bangladesh, and grid expansion.",
    content: "Covers run-of-river vs. storage hydro projects, transmission line construction along river basins, and Power Purchase Agreement (PPA) policies.",
    industry: "Renewable Energy - Nepal",
    region: "Nepal",
    categorySlug: "renewable-energy",
    source: "https://example.com/source-14",
    datasets: [
      {
        name: "Hydro Power Generation Distribution",
        description: "Share of installed hydropower capacity by developer type.",
        data: {
          Independent_Power_Producers: 58,
          NEA_Subsidiaries: 24,
          NEA_Direct_Ownership: 18,
        },
      },
    ],
  },
  {
    title: "Nepal Solar Energy Market 2026",
    summary: "Analysis of solar generation, batteries, microgrids, and clean energy investment in Nepal.",
    content: "Examines utility-scale grid-tied solar farms, commercial rooftop installations in industrial corridors, and off-grid mini-grids for remote municipalities.",
    industry: "Renewable Energy - Nepal",
    region: "Nepal",
    categorySlug: "renewable-energy",
    source: "https://example.com/source-15",
    datasets: [
      {
        name: "Installed Solar Capacity Share",
        description: "Breakdown of solar energy output by installation format.",
        data: {
          Utility_Scale_Grid_Tied: 45,
          Commercial_Rooftop: 32,
          Off_Grid_Microgrids: 23,
        },
      },
    ],
  },
  {
    title: "Nepal Electric Vehicle (EV) Ecosystem 2026",
    summary: "Analysis of EV adoption, fast-charging station networks, battery recycling, and tax policy impact.",
    content: "Evaluates passenger EV market share, electric two-wheeler assembly units, and charger infrastructure along major highway routes.",
    industry: "Automotive & Energy - Nepal",
    region: "Nepal",
    categorySlug: "renewable-energy",
    source: "https://example.com/source-16",
    datasets: [
      {
        name: "EV Market Share in New Registrations",
        description: "Percentage of new vehicles registered that are battery electric.",
        data: {
          Passenger_Cars: 62,
          Two_Wheelers: 24,
          Three_Wheelers_and_Microbus: 14,
        },
      },
    ],
  },
  {
    title: "Nepal Cement & Building Materials Industry 2026",
    summary: "Production capacities, clinker self-sufficiency, and green construction materials in Nepal.",
    content: "Reviews limestone mining, energy efficiency in cement kilns, and structural material demand driven by major infrastructure projects.",
    industry: "Infrastructure - Nepal",
    region: "Nepal",
    categorySlug: "infrastructure",
    source: "https://example.com/source-17",
    datasets: [
      {
        name: "Cement Consumption by End-Use",
        description: "Distribution of cement sales across key building sectors.",
        data: {
          Residential_Housing: 50,
          Hydropower_Infrastructure: 25,
          Roads_and_Bridges: 15,
          Commercial_Buildings: 10,
        },
      },
    ],
  },
  {
    title: "Nepal Smart Cities & Urban Infrastructure 2026",
    summary: "Overview of municipal waste-to-energy, smart traffic control, and water management projects.",
    content: "Focuses on urban planning initiatives in Kathmandu Valley, Pokhara, and Bharatpur, including intelligent transport systems and sewage treatment facilities.",
    industry: "Infrastructure - Nepal",
    region: "Nepal",
    categorySlug: "infrastructure",
    source: "https://example.com/source-18",
    datasets: [
      {
        name: "Municipal Smart Project Allocation",
        description: "Budget allocation for smart urban infrastructure investments.",
        data: {
          Smart_Water_Management: 35,
          Waste_to_Energy: 28,
          Intelligent_Traffic_Systems: 22,
          Public_WiFi_and_CCTV: 15,
        },
      },
    ],
  },

  // --- E-COMMERCE & RETAIL ---
  {
    title: "Nepal E-Commerce Market 2026",
    summary: "Analysis of online retail, social commerce, digital payments, and last-mile delivery in Nepal.",
    content: "Covers major platform strategies, social media commerce via Instagram/TikTok, cash-on-delivery reduction, and warehouse automation.",
    industry: "E-Commerce - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-19",
    datasets: [
      {
        name: "Online Sales Channel Share",
        description: "Breakdown of e-commerce gross merchandise value (GMV).",
        data: {
          Marketplace_Platforms: 52,
          Social_Commerce: 30,
          Direct_Brand_Websites: 18,
        },
      },
    ],
  },
  {
    title: "Nepal Express Logistics & Freight Courier 2026",
    summary: "Market research on domestic parcel delivery, inter-city logistics networks, and fleet management.",
    content: "Evaluates last-mile delivery challenges in terrain-heavy districts, hub-and-spoke sorting centers, and real-time tracking platforms.",
    industry: "Logistics - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-20",
    datasets: [
      {
        name: "Parcel Delivery Destination Breakdown",
        description: "Distribution of parcel destinations in Nepal.",
        data: {
          Kathmandu_Valley: 58,
          Provincial_Hubs: 27,
          Remote_Districts: 15,
        },
      },
    ],
  },
  {
    title: "Nepal Quick-Commerce & Grocery Delivery 2026",
    summary: "Study on micro-fulfillment centers, dark stores, and 30-minute grocery delivery in metropolitan centers.",
    content: "Examines consumer density, basket size dynamics, dark store operational costs, and inventory management in Kathmandu and Lalitpur.",
    industry: "Retail & E-Commerce - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-21",
    datasets: [
      {
        name: "Quick Commerce Category Orders",
        description: "Percentage of total orders per product category.",
        data: {
          Fresh_Produce: 36,
          Packaged_Snacks: 28,
          Dairy_and_Bakery: 22,
          Personal_Care: 14,
        },
      },
    ],
  },
  {
    title: "Nepal Apparel & FMCG Modern Retail 2026",
    summary: "Transition from traditional family-owned shops to modern supermarkets and chain retail stores.",
    content: "Analyzes supermarket expansion, private-label branding strategies, and shopper behavior across Tier-1 and Tier-2 cities in Nepal.",
    industry: "Retail - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-22",
    datasets: [
      {
        name: "Retail Format Market Share",
        description: "Total FMCG sales breakdown by store format.",
        data: {
          Traditional_Kirana_Stores: 68,
          Supermarkets_and_Malls: 22,
          Online_Grocery: 10,
        },
      },
    ],
  },

  // --- TECHNOLOGY, IT & AI ---
  {
    title: "Nepal Artificial Intelligence Market 2026",
    summary: "Analysis of AI software, automation, cloud services, and enterprise AI adoption in Nepal.",
    content: "Focuses on NLP models for Nepali language, conversational AI bots for banking, automated document scanning, and local AI talent availability.",
    industry: "Artificial Intelligence - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-23",
    datasets: [
      {
        name: "Enterprise AI Adoption Use Cases",
        description: "Primary enterprise applications deploying AI.",
        data: {
          Customer_Support_Bots: 38,
          OCR_and_Document_Parsing: 27,
          Fraud_Detection: 21,
          Predictive_Analytics: 14,
        },
      },
    ],
  },
  {
    title: "Nepal IT Export & Offshore Software Services 2026",
    summary: "Assessment of software export revenue, IT outsourcing firms, global client acquisition, and remote work infrastructure.",
    content: "Examines tax incentives for technology exports, talent retention in domestic dev shops, and service niches like DevOps, QA, and web development.",
    industry: "Information Technology - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-24",
    datasets: [
      {
        name: "Software Export Destination Markets",
        description: "Revenue distribution by overseas client region.",
        data: {
          United_States: 45,
          Europe: 25,
          Australia: 18,
          Japan_and_Others: 12,
        },
      },
    ],
  },
  {
    title: "Nepal Cybersecurity Market 2026",
    summary: "Analysis of cybersecurity services, data protection, cloud security, and digital risk in Nepal.",
    content: "Reviews critical infrastructure security for banks and government portals, SOC management, and compliance with national privacy frameworks.",
    industry: "Cybersecurity - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-25",
    datasets: [
      {
        name: "Cybersecurity Expenditure Breakdown",
        description: "Budget allocation by cybersecurity service line.",
        data: {
          Network_and_Firewall_Security: 35,
          Managed_SOC_Services: 28,
          Penetration_Testing: 22,
          Employee_Training: 15,
        },
      },
    ],
  },
  {
    title: "Nepal Cloud Computing & Data Center Market 2026",
    summary: "Study of colocation facilities, hyperscale cloud adoption, data residency laws, and edge computing.",
    content: "Covers local commercial data center builds, government cloud deployments, and enterprise cloud migrations among telecom and BFSI sectors.",
    industry: "Information Technology - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-26",
    datasets: [
      {
        name: "Cloud Architecture Models in Use",
        description: "Distribution of infrastructure setups among enterprises.",
        data: {
          Hybrid_Cloud: 48,
          On_Premise_Private: 32,
          Public_Cloud: 20,
        },
      },
    ],
  },
  {
    title: "Nepal Broadband & 5G Telecom Landscape 2026",
    summary: "Overview of fiber-to-the-home (FTTH) expansion, mobile broadband penetration, and trial 5G deployments.",
    content: "Analyzes competition between major ISPs, spectrum allocation, rural telecom development funds (RTDF), and infrastructure sharing policies.",
    industry: "Telecommunications - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-27",
    datasets: [
      {
        name: "Internet Connection Types",
        description: "Active subscriber distribution across access methods.",
        data: {
          Mobile_4G_5G: 68,
          FTTH_Fiber: 28,
          Fixed_Wireless_and_Others: 4,
        },
      },
    ],
  },
  {
    title: "Nepal Digital Learning Market 2026",
    summary: "Analysis of online learning, digital classrooms, training platforms, and education technology in Nepal.",
    content: "Covers EdTech platforms for SEE/NEB exam preparation, skill-upgrading portals for IT professionals, and digital content distribution for schools.",
    industry: "Education Technology - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-28",
    datasets: [
      {
        name: "EdTech Platform User Segment",
        description: "Share of platform usage across educational tiers.",
        data: {
          Secondary_School_Exam_Prep: 40,
          Professional_Skill_Upgrading: 32,
          Higher_Education_Test_Prep: 18,
          Primary_K8_Learning: 10,
        },
      },
    ],
  },

  // --- TOURISM, HOSPITALITY & TRAVEL TECH ---
  {
    title: "Nepal Tourism Technology Market 2026",
    summary: "Analysis of travel platforms, digital booking, hospitality technology, and tourism services in Nepal.",
    content: "Reviews direct-booking engines for hotels, digital trekking permits, GPS tracking systems for mountaineering safety, and online travel agencies.",
    industry: "Tourism Technology - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-29",
    datasets: [
      {
        name: "Tour Booking Channels",
        description: "Method used by international tourists to book travel in Nepal.",
        data: {
          Online_Travel_Agencies: 44,
          Direct_Hotel_Agency_Site: 31,
          Offline_Traditional_Agencies: 25,
        },
      },
    ],
  },
  {
    title: "Nepal Boutique Hospitality & Eco-Resorts 2026",
    summary: "Trends in sustainable tourism, eco-lodge developments, and luxury experiential stays across mountain destinations.",
    content: "Insights into sustainable building standards, farm-to-table culinary experiences for high-net-worth travelers, and community-based homestay networks.",
    industry: "Hospitality - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-30",
    datasets: [
      {
        name: "Accommodation Preferences",
        description: "Percentage choice of stay types among trekking tourists.",
        data: {
          Boutique_Eco_Lodges: 40,
          Standard_Tea_Houses: 38,
          Luxury_Resorts: 12,
          Community_Homestays: 10,
        },
      },
    ],
  },
  {
    title: "Nepal Aviation & Regional Airport Expansion 2026",
    summary: "Analysis of domestic air traffic, new international airport operations, and fleet expansion.",
    content: "Analyzes passenger growth at Pokhara and Gautam Buddha International Airports, STOL (Short Take-Off and Landing) airfield reliability, and airline logistics.",
    industry: "Aviation & Travel - Nepal",
    region: "Nepal",
    categorySlug: "infrastructure",
    source: "https://example.com/source-31",
    datasets: [
      {
        name: "Domestic Passenger Volume Share",
        description: "Flight volume breakdown by key trunk routes.",
        data: {
          Kathmandu_Pokhara: 35,
          Kathmandu_Bhairahawa: 22,
          Kathmandu_Biratnagar: 18,
          Mountain_STOL_Routes: 25,
        },
      },
    ],
  },
  {
    title: "Nepal Adventure Sports & Trekking Industry 2026",
    summary: "Evaluation of high-altitude expedition safety, trail infrastructure, local guide digitialization, and equipment retail.",
    content: "Covers regulations for Everest and Annapurna trekking circuits, helicopter rescue services, gear rental platforms, and environmental footprint management.",
    industry: "Tourism - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-32",
    datasets: [
      {
        name: "Popular Trekking Regions Share",
        description: "Percentage distribution of trekking permit issues.",
        data: {
          Annapurna_Region: 42,
          Everest_Khumbu_Region: 33,
          Langtang_Region: 14,
          Manaslu_and_Restricted: 11,
        },
      },
    ],
  },

  // --- MANUFACTURING & INDUSTRIAL ---
  {
    title: "Nepal Herbal & Medicinal Plant Processing 2026",
    summary: "Study of Non-Timber Forest Products (NTFP), essential oil extraction, and export supply chains.",
    content: "Focuses on high-altitude medicinal herbs (e.g., Yarsagumba, Chiraito), extraction technologies, quality testing labs, and export channels to Asia and Europe.",
    industry: "Manufacturing - Nepal",
    region: "Nepal",
    categorySlug: "food",
    source: "https://example.com/source-33",
    datasets: [
      {
        name: "Herbal Product Form Exports",
        description: "Export volume breakdown by processed state.",
        data: {
          Raw_Dried_Herbs: 52,
          Essential_Oils_Extracts: 30,
          Finished_Ayurvedic_Goods: 18,
        },
      },
    ],
  },
  {
    title: "Nepal Handicraft & Artisanal Export Market 2026",
    summary: "Analysis of singing bowls, Pashmina, felt products, and digital cross-border selling platforms.",
    content: "Covers handicraft cluster production, fair-trade certifications, digital story-telling marketing, and logistics integration with international postal services.",
    industry: "Manufacturing & Retail - Nepal",
    region: "Nepal",
    categorySlug: "e-commerce",
    source: "https://example.com/source-34",
    datasets: [
      {
        name: "Handicraft Export Category Share",
        description: "Revenue share of major artisanal exports.",
        data: {
          Pashmina_and_Woolens: 34,
          Metal_Craft_and_Singing_Bowls: 28,
          Felt_Products: 22,
          Handmade_Paper_Goods: 16,
        },
      },
    ],
  },
  {
    title: "Nepal Steel & Iron Rebar Manufacturing 2026",
    summary: "Industrial analysis of melting furnaces, billet imports, and structural steel manufacturing for national construction projects.",
    content: "Evaluates raw material procurement from India, energy consumption patterns, quality compliance under Nepal Standards (NS), and pricing trends.",
    industry: "Manufacturing - Nepal",
    region: "Nepal",
    categorySlug: "infrastructure",
    source: "https://example.com/source-35",
    datasets: [
      {
        name: "Raw Material Sourcing Method",
        description: "Share of steel manufacturing inputs.",
        data: {
          Imported_Sponge_Iron_Billets: 72,
          Domestic_Scrap_Recycling: 28,
        },
      },
    ],
  },
  {
    title: "Nepal Plastic Waste Management & Circular Economy 2026",
    summary: "Assessment of plastic recycling plants, biodegradable packaging alternatives, and EPR regulations.",
    content: "Reviews municipal recycling infrastructure, extended producer responsibility (EPR) mandates, and industrial adoption of eco-friendly packaging.",
    industry: "CleanTech - Nepal",
    region: "Nepal",
    categorySlug: "renewable-energy",
    source: "https://example.com/source-36",
    datasets: [
      {
        name: "Plastic Waste Destination",
        description: "Distribution of urban plastic waste end-state.",
        data: {
          Landfill_or_Dumped: 58,
          Recycled_Domestically: 26,
          Exported_for_Processing: 16,
        },
      },
    ],
  },

  // --- REAL ESTATE, MEDIA & CREATIVE ECONOMY ---
  {
    title: "Nepal Commercial Real Estate & PropTech 2026",
    summary: "Market research on Grade-A office space demand, retail malls, and digital property listings.",
    content: "Examines workspace demand from IT and financial firms, commercial lease trends in Kathmandu/Lalitpur, and virtual property tour platforms.",
    industry: "Real Estate - Nepal",
    region: "Nepal",
    categorySlug: "infrastructure",
    source: "https://example.com/source-37",
    datasets: [
      {
        name: "Commercial Tenant Demand Share",
        description: "Leased commercial area by occupier sector.",
        data: {
          IT_and_BPO_Companies: 40,
          Banks_and_Financial_Inst: 32,
          Retail_and_Restaurants: 18,
          Diplomatic_and_NGOs: 10,
        },
      },
    ],
  },
  {
    title: "Nepal Digital Media & OTT Entertainment Market 2026",
    summary: "Analysis of local content streaming platforms, podcasting, digital news monetization, and influencer marketing.",
    content: "Covers mobile video consumption trends, local OTT platforms competing with global giants, digital advertising spend, and copyright monetization.",
    industry: "Media & Entertainment - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-38",
    datasets: [
      {
        name: "Digital Ad Spend Channels",
        description: "Distribution of advertiser spend across media platforms.",
        data: {
          Social_Media_Ads: 46,
          YouTube_and_Video_Streaming: 31,
          Local_Digital_News_Portals: 23,
        },
      },
    ],
  },
  {
    title: "Nepal Gaming & Esports Industry 2026",
    summary: "In-depth overview of competitive gaming, mobile esports tournaments, local game development studios, and streaming monetization.",
    content: "Analyzes player demography, tournament prize pools, sponsor brands, and early-stage game development teams targeting global app stores.",
    industry: "Entertainment & Tech - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-39",
    datasets: [
      {
        name: "Gaming Platform Preference",
        description: "Active gamer distribution by device preference.",
        data: {
          Mobile_Gaming: 82,
          PC_Gaming: 14,
          Console_Gaming: 4,
        },
      },
    ],
  },
  {
    title: "Nepal Vocational Skills & Workforce Mobility 2026",
    summary: "Analysis of technical education platforms, blue-collar job portals, and pre-departure digital training.",
    content: "Evaluates TVET (Technical and Vocational Education and Training) institute output, digital skill certifications, and tech platforms connecting skilled workers with employers.",
    industry: "Education & Workforce - Nepal",
    region: "Nepal",
    categorySlug: "technology",
    source: "https://example.com/source-40",
    datasets: [
      {
        name: "Vocational Training Demand",
        description: "Enrollees distribution by trade field.",
        data: {
          Electrician_and_Electronics: 32,
          Welding_and_Construction: 28,
          Culinary_and_Hospitality: 24,
          Automobile_Repair: 16,
        },
      },
    ],
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log(`Starting ingestion of ${reports.length} reports...`);

  const infrastructureCategory = await MarketCategory.where({ slug: "infrastructure" }).all().first();

  if (!infrastructureCategory) {
    await MarketCategory.create({
      name: "Infrastructure",
      slug: "infrastructure",
      description: "Infrastructure, construction, transport, and urban development markets.",
    });
    console.log("Created missing category: Infrastructure");
  }

  for (const report of reports) {
    const existing = await MarketReport.where({ slug: slugify(report.title) }).all().first();

    if (existing) {
      if (existing.status !== "PUBLISHED") {
        await MarketReport.where({ id: existing.id }).update({ status: "PUBLISHED" });
        console.log(`Published existing: ${report.title}`);
      } else {
        console.log(`Skipped existing: ${report.title}`);
      }
      continue;
    }

    await ingestReport(report, "PUBLISHED");
    console.log(`Created: ${report.title}`);
  }

  await invalidateCache("reports:list:v2:*");

  console.log("Ingestion completed successfully.");
  await db.close();
  await redis.quit();
}

main().catch(async (error) => {
  console.error("Ingestion failed:", error);
  await db.close();
  await redis.quit();
  process.exit(1);
});