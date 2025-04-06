import { PackageCheck, Smartphone, Truck, Bell } from "lucide-react";

export const About = () => {
  return (
    <section
      id="about"
      className="container py-16 sm:py-24"
    >
      <div className="bg-[#C03300]/90 border border-white/20 backdrop-blur-sm rounded-lg p-8 sm:p-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-poppins text-white">
                SpazaXParcel
              </h2>
              <img
                src="/Vector 104.png"
                alt="Vector"
                className="h-12 w-auto"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 font-poppins text-white">Why Sparcel?</h3>
                <p className="text-gray-300 font-poppins text-lg leading-relaxed">
                  We're making e-commerce returns accessible and affordable in townships. Our platform transforms local spaza shops into trusted parcel drop-off points, creating a win-win solution for both shop owners and online shoppers.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 font-poppins text-white">How it Works</h3>
                <div className="grid gap-4">
                  <div className="bg-white border border-white/10 rounded-lg p-4 shadow-lg">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF5823] flex items-center justify-center text-white font-semibold">1</span>
                      <div className="flex-1">
                        <p className="text-[#FF5823] font-poppins text-lg leading-relaxed">
                          Customer drops off their parcel at a registered spaza shop
                        </p>
                      </div>
                      <PackageCheck className="flex-shrink-0 w-6 h-6 text-[#FF5823]" />
                    </div>
                  </div>
                  <div className="bg-white border border-white/10 rounded-lg p-4 shadow-lg">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF5823] flex items-center justify-center text-white font-semibold">2</span>
                      <div className="flex-1">
                        <p className="text-[#FF5823] font-poppins text-lg leading-relaxed">
                          Shop owner logs the return using our simple mobile app
                        </p>
                      </div>
                      <Smartphone className="flex-shrink-0 w-6 h-6 text-[#FF5823]" />
                    </div>
                  </div>
                  <div className="bg-white border border-white/10 rounded-lg p-4 shadow-lg">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF5823] flex items-center justify-center text-white font-semibold">3</span>
                      <div className="flex-1">
                        <p className="text-[#FF5823] font-poppins text-lg leading-relaxed">
                          Courier is notified and collects the parcel
                        </p>
                      </div>
                      <Truck className="flex-shrink-0 w-6 h-6 text-[#FF5823]" />
                    </div>
                  </div>
                  <div className="bg-white border border-white/10 rounded-lg p-4 shadow-lg">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF5823] flex items-center justify-center text-white font-semibold">4</span>
                      <div className="flex-1">
                        <p className="text-[#FF5823] font-poppins text-lg leading-relaxed">
                          Everyone involved gets notified throughout the process
                        </p>
                      </div>
                      <Bell className="flex-shrink-0 w-6 h-6 text-[#FF5823]" />
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
