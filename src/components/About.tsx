export const About = () => {
  return (
    <section
      id="about"
      className="container py-8 sm:py-16"
    >
      <div className="border border-black backdrop-blur-sm rounded-xl p-8 sm:p-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl font-darker text-white">
                SpazaXParcel
              </h2>
              <img
                src="/Vector 104.png"
                alt="Vector"
                className="h-12 w-auto md:h-16"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-semibold mb-4 md:text-4xl font-darker text-white">Why Sparcel?</h3>
                <p className="text-white font-darker font-medium text-xl md:text-2xl leading-relaxed">
                  We're transforming how parcels move through townships.
                </p>
                <p className="text-white font-darker font-medium text-xl md:text-2xl leading-relaxed mt-4">
                  By partnering with local spaza shops, Sparcel turns trusted community stores into parcel drop-off and pick-up points — connecting online shoppers, couriers, and small businesses through a reliable local network.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 lg:mt-8">
            <img
              src="/Map.png"
              alt="Coverage Map"
              className="w-full h-auto max-w-[700px] mx-auto rounded-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
