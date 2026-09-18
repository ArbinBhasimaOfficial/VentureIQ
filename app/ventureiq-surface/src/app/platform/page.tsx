import SectionPage from "@/components/layout/SectionPage";

export default function PlatformPage() {
  return (
    <SectionPage
      eyebrow="The VentureIQ platform"
      title="One clear view of what moves your market."
      description="Bring demand signals, competitor shifts, and customer behavior into one decision layer. VentureIQ helps teams move from scattered research to confident action."
      metrics={[
        { value: "24/7", label: "Signal monitoring" },
        { value: "360°", label: "Market visibility" },
        { value: "1", label: "Decision workspace" },
        { value: "Live", label: "Data refresh" },
      ]}
      cards={[
        {
          title: "Signal intelligence",
          description:
            "See the changes that matter across customers, categories, and competitors before they become obvious.",
        },
        {
          title: "Decision workspaces",
          description:
            "Turn evidence into shared briefs, scenarios, and next steps your whole team can act on.",
        },
        {
          title: "Connected workflows",
          description:
            "Keep research, planning, and reporting aligned without rebuilding the same context in every tool.",
        },
      ]}
      highlights={[
        {
          title: "Connect your sources",
          description:
            "Bring internal knowledge and external market signals into one organized workspace.",
        },
        {
          title: "Focus the signal",
          description:
            "Use configurable views to filter by audience, category, geography, or business question.",
        },
        {
          title: "Share the decision",
          description:
            "Turn findings into briefs and recommendations that keep every stakeholder moving together.",
        },
      ]}
      linkLabel="Talk to our team"
      linkHref="/contact"
    />
  );
}
