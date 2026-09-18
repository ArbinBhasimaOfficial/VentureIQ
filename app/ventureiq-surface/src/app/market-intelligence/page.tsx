import SectionPage from "@/components/layout/SectionPage";

export default function MarketIntelligencePage() {
  return (
    <SectionPage
      eyebrow="Market intelligence"
      title="Read the market while it is still changing."
      description="Understand the forces shaping your category with real-time signals, trend analysis, and forward-looking context built for strategic teams."
      metrics={[
        { value: "180+", label: "Markets tracked" },
        { value: "12k", label: "Signals indexed" },
        { value: "3.4x", label: "Faster synthesis" },
        { value: "Real", label: "Time context" },
      ]}
      cards={[
        {
          title: "Consumer demand",
          description:
            "Track the needs, motivations, and behaviors changing the shape of demand in your category.",
        },
        {
          title: "Trend forecasting",
          description:
            "Separate durable shifts from short-lived noise with structured evidence and expert interpretation.",
        },
        {
          title: "Competitive context",
          description:
            "Map the moves around you so you can spot whitespace and respond with precision.",
        },
      ]}
      highlights={[
        {
          title: "Scan the landscape",
          description:
            "Monitor category, consumer, and competitor signals across the markets that matter to you.",
        },
        {
          title: "Find the pattern",
          description:
            "Connect related signals to understand what is changing, why it matters, and who is affected.",
        },
        {
          title: "Plan with confidence",
          description:
            "Translate forward-looking context into sharper priorities, scenarios, and investment decisions.",
        },
      ]}
      linkLabel="Explore the platform"
      linkHref="/platform"
    />
  );
}
