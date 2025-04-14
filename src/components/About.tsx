import { MedalIcon, MapIcon, PlaneIcon, LightBulbIcon } from "./Icons";

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
                  Revolutionizing e-commerce returns in townships. We turn local spaza shops into convenient parcel drop-off points, benefiting both shop owners and online shoppers through our accessible, affordable network.
                </p>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-4 md:text-4xl font-darker text-white">How it Works</h3>
                <div className="grid gap-4">
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6 shadow-lg">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-black flex items-center justify-center text-white font-semibold text-base md:text-lg mr-3 md:mr-4">1</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-darker font-medium text-xl md:text-2xl leading-relaxed">
                          Customer drops off their parcel at a registered spaza shop
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6 shadow-lg">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-black flex items-center justify-center text-white font-semibold text-base md:text-lg mr-3 md:mr-4">2</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-darker font-medium text-xl md:text-2xl leading-relaxed">
                          Shop owner logs the return using our simple mobile app
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6 shadow-lg">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-black flex items-center justify-center text-white font-semibold text-base md:text-lg mr-3 md:mr-4">3</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-darker font-medium text-xl md:text-2xl leading-relaxed">
                          Courier is notified and collects the parcel
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-black rounded-2xl p-4 md:p-6 shadow-lg">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-black flex items-center justify-center text-white font-semibold text-base md:text-lg mr-3 md:mr-4">4</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-darker font-medium text-xl md:text-2xl leading-relaxed">
                          Everyone involved gets notified throughout the process
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 lg:mt-8">
            <img
              src="/Map.png"
              alt="Coverage Map"
              className="w-full max-w-[700px] mx-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
