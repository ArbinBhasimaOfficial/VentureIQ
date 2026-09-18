import SectionPage from "@/components/layout/SectionPage";

export default function IndustriesPage() {
  return (
    <SectionPage
      eyebrow="Industry intelligence"
      title="Context that understands your category."
      description="Every market has its own language, constraints, and opportunities. Explore intelligence shaped around the decisions your industry needs to make next."
      metrics={[
        { value: "16", label: "Industries covered" },
        { value: "60+", label: "Specialist lenses" },
        { value: "Global", label: "Market coverage" },
        { value: "On", label: "Demand support" },
      ]}
      cardGridClassName="lg:grid-cols-4"
      cards={[
        {
          title: "Advertising and Marketing",
          description:
            "Understand audience shifts, creative effectiveness, and the signals shaping brand growth.",
        },
        {
          title: "Beauty and Personal Care",
          description:
            "Track changing routines, wellness priorities, and the values influencing personal care choices.",
        },
        {
          title: "Education and Libraries",
          description:
            "Explore how learners, educators, and communities are adapting to new ways of accessing knowledge.",
        },
        {
          title: "Financial services",
          description:
            "Decode changing trust, value, and customer expectations across a regulated landscape.",
        },
        {
          title: "Food and Drink",
          description:
            "Identify evolving tastes, occasions, and purchase behaviors across food and beverage categories.",
        },
        {
          title: "Government",
          description:
            "Build a clearer view of public needs, policy environments, and the services communities expect.",
        },
        {
          title: "Household",
          description:
            "Understand how homes are changing and what that means for products, services, and daily routines.",
        },
        {
          title: "Ingredients, Flavours and Fragrances",
          description:
            "Spot formulation, sensory, and sourcing trends influencing products across consumer markets.",
        },
        {
          title: "Insurance",
          description:
            "Explore changing risk perceptions, customer expectations, and the future of protection services.",
        },
        {
          title: "Media and Content Producers",
          description:
            "Map attention, formats, and audience behaviors across an increasingly fragmented media landscape.",
        },
        {
          title: "Packaging",
          description:
            "Follow sustainability, convenience, and design signals shaping the next generation of packaging.",
        },
        {
          title: "Retail",
          description:
            "Understand shopper journeys, category movement, and the forces changing the retail experience.",
        },
        {
          title: "Sports, Gaming and Entertainment",
          description:
            "Identify the communities, formats, and experiences driving participation and loyalty.",
        },
        {
          title: "Technology",
          description:
            "Identify the adoption signals and whitespace shaping the next wave of digital products.",
        },
        {
          title: "Travel and Tourism",
          description:
            "Track changing travel motivations, destinations, and expectations across the visitor economy.",
        },
        {
          title: "TV, Phone and Internet",
          description:
            "Explore how connectivity, platforms, and changing consumption habits are reshaping communication.",
        },
      ]}
      highlights={[
        {
          title: "Start with your context",
          description:
            "Select the industry, market, and customer environment that best matches your growth question.",
        },
        {
          title: "Layer in expertise",
          description:
            "Combine broad market signals with specialist lenses built around the realities of your category.",
        },
        {
          title: "Move from insight to action",
          description:
            "Build a practical point of view that supports product, marketing, expansion, and investment decisions.",
        },
      ]}
      linkLabel="Find your industry"
      linkHref="/contact"
    />
  );
}
