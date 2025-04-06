import { Button } from "./ui/button";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-[#CC461C]/70 py-12 my-16 sm:my-24"
    >
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-poppins">
            Simplifying Returns in Underserved Communities
          </h2>
          <p className="mt-4 text-xl font-semibold text-white font-poppins">
            Drop Off. Log. Collect. Done.
          </p>
          <p className="mt-6 text-lg leading-8 text-white font-poppins">
            We turn everyday spaza shops into smart parcel return hubs, cutting costs and making e-commerce returns more accessible in townships and informal areas. No more missed pickups or long waits—just a quick stop at your local shop.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">
          <Button className="w-full md:mr-4 md:w-auto font-poppins">Request a Demo</Button>
          <Button
            variant="outline"
            className="w-full md:w-auto font-poppins"
          >
            View all features
          </Button>
        </div>
      </div>
    </section>
  );
};
