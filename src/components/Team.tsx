import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Linkedin } from "lucide-react";

export const Team = () => {
  return (
    <section id="team" className="container py-8 sm:py-12 -mt-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-darker text-white">
            Meet the Founders
          </h2>
          <p className="text-xl md:text-2xl text-white font-darker max-w-3xl mx-auto">
            Experienced Product Managers who've transformed township economy through innovative tech solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="bg-white border border-black rounded-xl overflow-hidden">
            <CardHeader className="text-center relative pb-0 pt-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <img
                  src="/Katlego.png"
                  alt="Katlego Tshabangu"
                  className="rounded-full object-cover w-full h-full border-2 border-black"
                />
              </div>
              <CardTitle className="mt-3 text-lg md:text-xl font-bold text-black font-darker">
                Katlego Tshabangu
              </CardTitle>
              <CardDescription className="text-black font-darker text-base">
                Co-Founder
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pt-2 pb-4">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-black hover:text-black/80"
                })}
              >
                <Linkedin size="18" />
              </a>
            </CardFooter>
          </Card>

          <Card className="bg-white border border-black rounded-xl overflow-hidden">
            <CardHeader className="text-center relative pb-0 pt-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <img
                  src="/Talent.png"
                  alt="Talent Muzondo"
                  className="rounded-full object-cover w-full h-full border-2 border-black"
                />
              </div>
              <CardTitle className="mt-3 text-lg md:text-xl font-bold text-black font-darker">
                Talent Muzondo
              </CardTitle>
              <CardDescription className="text-black font-darker text-base">
                Co-Founder
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pt-2 pb-4">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-black hover:text-black/80"
                })}
              >
                <Linkedin size="18" />
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};
