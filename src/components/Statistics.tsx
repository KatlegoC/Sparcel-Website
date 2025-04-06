export const Statistics = () => {
  interface StepProps {
    number: string;
    title: string;
    description: string;
  }

  const steps: StepProps[] = [
    {
      number: "1",
      title: "Drop Off",
      description: "Shopper returns parcel at a nearby spaza shop.",
    },
    {
      number: "2",
      title: "Log Return",
      description: "Shopkeeper logs the return using our easy mobile app.",
    },
    {
      number: "3",
      title: "Collection",
      description: "Courier is notified to collect the package.",
    },
    {
      number: "4",
      title: "Win-Win",
      description: "Everyone wins – shopper, spaza owner, courier, and the online store.",
    },
  ];

  return (
    <section id="how-it-works" className="pt-4 md:pt-12 pb-8 bg-[#B33D19]">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-16">
          <span className="text-[#FF8E65]">How It </span>
          <span className="text-white">Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ number, title, description }: StepProps) => (
            <div
              key={number}
              className="bg-white rounded-lg p-6 flex flex-col items-start min-h-[260px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF5823] flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">{number}</span>
              </div>
              <h3 className="text-[#FF5823] text-xl font-bold mb-3">{title}</h3>
              <p className="text-[#FF5823] text-base leading-relaxed opacity-90">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
