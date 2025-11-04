import { Button } from "./ui/button";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export const Hero = () => {

  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-white md:bg-[#FF5823]">
      {/* Mobile: Full Background Image */}
      <div className="md:hidden absolute inset-0 w-full h-full">
        <img 
          src="/image copy 3.png"
          alt="Spaza Shop Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Navigation - Positioned over background/background */}
      <div className="relative container mx-auto py-4 sm:py-6 md:py-8 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-0">
            <img 
              src="/Vector 104.png"
              alt="Vector" 
              className="h-20 sm:h-32 w-auto"
            />
            <img 
              src="/Sparcel copy.png"
              alt="Sparcel Returns" 
              className="h-8 sm:h-12 w-auto -ml-4"
            />
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <a href="#" className="text-white hover:text-white/90 font-bold text-base sm:text-lg font-poppins">about sparcel</a>
            <a href="#" className="text-white hover:text-white/90 font-bold text-base sm:text-lg font-poppins">shop owner</a>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative">
      
      <div className="container relative grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-8rem)] px-4 sm:px-0">
        {/* Left Side: Text Content */}
        <div className="text-center md:text-left space-y-6 mt-4 md:-mt-8 relative z-10">
          <div className="space-y-6">
            <p className="hidden md:inline bg-black text-white px-2 py-0.5 text-2xl md:text-3xl font-semibold mb-2 rounded-sm">
              Spaza + Parcel = Sparcel
            </p>
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              If You Trust Your Spaza with Your Bread, You Can Trust Them with Your Parcel.
            </h1>
            <div className="text-white/90 text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed">
              Sparcel works through the shops that communities already know and trust. Every parcel is in familiar, reliable hands — not just another delivery point, but a place you visit every day.
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4 mt-8 md:mt-12">
            <Button 
              className="w-full md:w-[300px] bg-white hover:bg-white/90 text-gray-900 px-4 sm:px-8 py-3 flex items-center justify-center font-bold text-sm sm:text-base border-2 border-gray-200"
              onClick={() => window.location.href = '/sparcelpoints'}
            >
              <MagnifyingGlassIcon className="mr-2 h-5 w-5 text-gray-500" />
              find your sparcel point
            </Button>
            <Button className="w-full md:w-[300px] bg-[#FF5823] md:bg-black md:hover:bg-gray-800 text-white px-4 sm:px-8 py-3 font-bold text-sm sm:text-base">
              spaza owner? download the app
            </Button>
          </div>
        </div>

        {/* Right Side: Image (Desktop only) */}
        <div className="hidden md:block">
          <img 
            src="/image copy 3.png"
            alt="Spaza Shop" 
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>
      </div>
      </div>
    </section>
  );
};
