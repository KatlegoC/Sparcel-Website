import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MagnifierIcon, WalletIcon, ChartIcon } from "./Icons";

interface ServiceProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const serviceList: ServiceProps[] = [
  {
    title: "Log & Scan Returns",
    description:
      "Easily log parcel details and scan return codes with our simple, user-friendly interface. No complicated steps, just quick and efficient processing.",
    icon: <ChartIcon />,
  },
  {
    title: "Upload & Track",
    description:
      "Upload customer information and parcel images in seconds. Keep track of all returns in one place and trigger courier pickups when you're ready.",
    icon: <MagnifierIcon />,
  },
  {
    title: "Earn Per Return",
    description:
      "Turn your spaza shop into a return point and earn up to R20 for every parcel processed. Simple tasks, reliable income.",
    icon: <WalletIcon />,
  },
];

export const Services = () => {
  return (
    <section className="container py-16 sm:py-24">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-darker">
            <span className="text-white">
              The Sparcel{" "}
            </span>
            Owner App
          </h2>

          <p className="text-white text-xl mt-4 mb-8 font-darker">
            Simple. Quick. No clutter. Everything you need to manage parcels with ease.
          </p>

          <div className="flex flex-col gap-8">
            <Card className="bg-white border-black rounded-xl">
              <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                <div className="mt-1 text-black">
                  <ChartIcon />
                </div>
                <div>
                  <CardTitle className="text-black font-darker text-xl md:text-2xl font-bold">Log & Scan Parcels</CardTitle>
                  <CardDescription className="text-black text-lg mt-2 font-darker">
                    Easily record parcel details and scan QR codes with a simple, user-friendly interface. No complicated steps — just fast, reliable parcel handling.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white border-black rounded-xl">
              <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                <div className="mt-1 text-black">
                  <MagnifierIcon />
                </div>
                <div>
                  <CardTitle className="text-black font-darker text-xl md:text-2xl font-bold">Upload & Track</CardTitle>
                  <CardDescription className="text-black text-lg mt-2 font-darker">
                    Upload customer info and parcel images in seconds. Keep track of all parcels — incoming, outgoing, or awaiting pickup — and trigger courier collections when ready.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-white border-black rounded-xl">
              <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                <div className="mt-1 text-black">
                  <WalletIcon />
                </div>
                <div>
                  <CardTitle className="text-black font-darker text-xl md:text-2xl font-bold">Earn Per Parcel</CardTitle>
                  <CardDescription className="text-black text-lg mt-2 font-darker">
                    Turn your spaza shop into a trusted delivery and collection point. Handle parcels for your community while growing your business.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        <img
          src="/Phone1.png"
          className="w-[300px] md:w-[500px] lg:w-[600px] object-contain"
          alt="Sparcel App Interface"
        />
      </div>
    </section>
  );
};
