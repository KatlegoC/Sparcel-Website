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
      description: "Customer drops off their parcel at a registered spaza shop",
    },
    {
      number: "2",
      title: "Log Return",
      description: "Shop owner logs the return using our simple mobile app",
    },
    {
      number: "3",
      title: "Collection",
      description: "Courier is notified and collects the parcel",
    },
    {
      number: "4",
      title: "Notifications",
      description: "Everyone involved gets notified throughout the process",
    },
  ];

  return (
    <section id="how-it-works" className="pt-4 md:pt-12 pb-8 bg-[#FF5823]">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">
          How it Works
        </h2>
        <div className="grid grid-cols-1 gap-8">
          {steps.map(({ number, title, description }: StepProps) => (
            <div
              key={number}
              className="bg-white rounded-[40px] py-10 px-12 flex items-center gap-10"
            >
              <div className="w-[100px] h-[100px] rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white text-5xl font-bold">{number}</span>
              </div>
              <p className="text-3xl md:text-4xl font-medium leading-tight">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
