import { Button } from "./ui/button";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-white py-12 my-16 sm:my-24 border-y border-black"
    >
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl font-poppins">
            Simplifying Returns in Underserved Communities
          </h2>
          <p className="mt-4 text-xl font-semibold text-black font-poppins">
            Drop Off. Log. Collect. Done.
          </p>
          <p className="mt-6 text-lg leading-8 text-black font-poppins">
            We turn everyday spaza shops into smart parcel return hubs, cutting costs and making e-commerce returns more accessible in townships and informal areas. No more missed pickups or long waits—just a quick stop at your local shop.
          </p>
        </div>

        <div className="mt-8 lg:mt-0 text-center lg:text-right lg:col-start-2">
          <Button className="font-poppins bg-[#FF5823] hover:bg-[#FF5823]/90 text-white">Request a Demo</Button>
        </div>
      </div>
    </section>
  );
};
