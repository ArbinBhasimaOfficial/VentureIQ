import SectionPage from "@/components/layout/SectionPage";

export default function ReportsPage() {
  return (
    <SectionPage
      eyebrow="Reports and perspectives"
      title="The signal behind the headline."
      description="Go deeper with practical research on consumer behavior, emerging categories, and the macro shifts that are redefining growth."
      metrics={[
        { value: "240+", label: "Reports published" },
        { value: "36", label: "Category lenses" },
        { value: "Monthly", label: "New insights" },
        { value: "Free", label: "Selected downloads" },
      ]}
      cards={[
        {
          title: "Global consumer predictions",
          description:
            "A grounded view of the behaviors and expectations likely to shape the next year of growth.",
        },
        {
          title: "Category deep dives",
          description:
            "Research-led perspectives that help teams understand opportunities in the markets they serve.",
        },
        {
          title: "Executive briefings",
          description:
            "Concise, decision-ready summaries for leadership teams that need the story and the implication.",
        },
      ]}
      highlights={[
        {
          title: "Choose your question",
          description:
            "Start with the market problem, category shift, or strategic decision your team is facing.",
        },
        {
          title: "Read the evidence",
          description:
            "Explore clear analysis supported by consumer signals, market data, and expert perspective.",
        },
        {
          title: "Put it to work",
          description:
            "Use the implications and recommendations to shape planning, workshops, and leadership conversations.",
        },
      ]}
      downloads={[
        {
          title: "Consumer predictions 2026",
          description: "A compact dataset of consumer behavior signals across six growth themes.",
          format: "CSV · 6 KB",
          href: "/downloads/consumer-predictions-2026.csv",
        },
        {
          title: "AI whitespace opportunities",
          description: "Market opportunity scores for emerging AI use cases and audience segments.",
          format: "JSON · 4 KB",
          href: "/downloads/ai-whitespace-opportunities.json",
        },
        {
          title: "Mega trends briefing",
          description: "A plain-text snapshot of five macro trends shaping the 2026/27 outlook.",
          format: "TXT · 3 KB",
          href: "/downloads/mega-trends-2026-27.txt",
        },
        {
          title: "Category growth outlook",
          description: "Growth, momentum, and confidence scores across six priority categories.",
          format: "CSV · 5 KB",
          href: "/downloads/category-growth-outlook.csv",
        },
        {
          title: "Consumer segments snapshot",
          description: "Audience segment profiles with needs, behaviors, and opportunity signals.",
          format: "JSON · 5 KB",
          href: "/downloads/consumer-segments-snapshot.json",
        },
        {
          title: "Research planning checklist",
          description:
            "A practical checklist for turning a market question into an actionable research brief.",
          format: "MD · 2 KB",
          href: "/downloads/research-planning-checklist.md",
        },
      ]}
      linkLabel="Request a briefing"
      linkHref="/contact"
    />
  );
}
