import SectionPage from "@/components/layout/SectionPage";

export default function ResourcesPage() {
  return (
    <SectionPage
      eyebrow="Resources"
      title="Useful thinking for the work ahead."
      description="Browse practical guides, field notes, events, and conversations designed to help ambitious teams make better market decisions."
      metrics={[
        { value: "Weekly", label: "New field notes" },
        { value: "50+", label: "Practical guides" },
        { value: "Live", label: "Expert events" },
        { value: "Open", label: "Knowledge library" },
      ]}
      cards={[
        {
          title: "Articles and field notes",
          description:
            "Short, useful perspectives on the shifts influencing markets and the people within them.",
        },
        {
          title: "Guides and downloads",
          description:
            "Frameworks and research tools your team can put to work in the next planning cycle.",
        },
        {
          title: "Events and podcasts",
          description:
            "Hear directly from researchers, operators, and strategists working through change in real time.",
        },
      ]}
      highlights={[
        {
          title: "Browse by need",
          description:
            "Find practical material for research, planning, innovation, leadership, and team workshops.",
        },
        {
          title: "Learn from the field",
          description:
            "Go beyond theory with perspectives from the people studying and navigating market change every day.",
        },
        {
          title: "Bring it to your team",
          description:
            "Share frameworks, recordings, and point-of-view content to create a common language for decisions.",
        },
      ]}
      linkLabel="Browse latest insights"
      linkHref="/reports"
    />
  );
}
