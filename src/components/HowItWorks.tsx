import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MedalIcon, MapIcon, PlaneIcon, WalletIcon } from "../components/Icons";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Accessibility",
    description:
      "Spaza shops are everywhere – over 200,000 in South Africa, making them ideal last-mile touchpoints.",
  },
  {
    icon: <MapIcon />,
    title: "Community",
    description:
      "Trusted, hyperlocal community hubs that people already know and rely on.",
  },
  {
    icon: <PlaneIcon />,
    title: "Scalability",
    description:
      "A nationwird network of safe, secure locations with storage capacity and room to grow.",
  },
  {
    icon: <WalletIcon className="fill-[#FF5823]" />,
    title: "Earning Potential",
    description:
      "Spaza owners earn income for every parcel handled, turning logistics into local economic opportunity.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="Built"
      className="relative isolate overflow-hidden py-16 sm:py-24"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url("/township layout.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[#B33D19]/70" />
      </div>

      {/* Content */}
      <div className="container text-center py-20 sm:py-24 relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 font-poppins text-white">
          <span className="text-white">
            Built for the{" "}
          </span>
          <span className="text-white">
            Township Economy
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon, title, description }: FeatureProps) => (
            <Card
              key={title}
              className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="grid gap-4 place-items-center">
                  {icon}
                  <span className="font-poppins text-[#FF5823] text-xl">{title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="font-poppins text-[#FF5823]/80">{description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
