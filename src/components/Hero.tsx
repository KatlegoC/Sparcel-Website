import { Button } from "./ui/button";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { MapDialog } from "./MapDialog";

export const Hero = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <section className="relative min-h-[100vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/background.png"
          alt="Background" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Navigation */}
      <div className="relative container mx-auto py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-0">
            <img 
              src="/Vector 104.png"
              alt="Vector" 
              className="h-20 sm:h-32 w-auto"
            />
            <img 
              src="/SparcelReturnsWhite.png"
              alt="Sparcel Returns" 
              className="h-8 sm:h-12 w-auto -ml-4"
            />
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <a href="#" className="text-[#FF5823] hover:text-[#FF5823]/90 font-bold text-base sm:text-lg font-poppins">about sparcel</a>
            <a href="#" className="text-[#FF5823] hover:text-[#FF5823]/90 font-bold text-base sm:text-lg font-poppins">shop owner</a>
          </div>
        </div>
      </div>
      
      <div className="container relative grid place-items-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-6 -mt-20 px-4 sm:px-0 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Returns Made Simple for the Township Economy
            </h1>
            <div className="text-xl sm:text-2xl md:text-3xl text-white/90 font-medium">
              📦 Reverse logistics, powered by the spaza shops.
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
              Sparcel is a smart, community-first solution that transforms local spaza shops into trusted parcel return points for online shoppers—especially in townships and underserved areas where courier access is limited.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
            <Button 
              className="w-full md:w-[300px] bg-white hover:bg-white/90 text-gray-900 px-4 sm:px-8 py-3 flex items-center justify-center font-bold text-sm sm:text-base"
              onClick={() => setIsMapOpen(true)}
            >
              <MagnifyingGlassIcon className="mr-2 h-5 w-5 text-gray-500" />
              find your sparcel point
            </Button>
            <Button className="w-full md:w-[300px] bg-[#FF5823] hover:bg-[#FF5823]/90 text-white px-4 sm:px-8 py-3 font-bold text-sm sm:text-base">
              spaza owner? download the app
            </Button>
          </div>
        </div>
      </div>

      <MapDialog open={isMapOpen} onOpenChange={setIsMapOpen} />
    </section>
  );
};
