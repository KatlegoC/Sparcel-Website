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
    <section id="team" className="container py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3 font-poppins text-white">
            Meet the Founders
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-poppins max-w-2xl mx-auto">
            Experienced Product Managers who've transformed township economy through innovative tech solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="bg-[#CC461C]/70 border border-white/20 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center relative pb-0 pt-6">
              <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto">
                <img
                  src="/Katlego.png"
                  alt="Katlego Tshabangu"
                  className="rounded-full object-cover w-full h-full border-2 border-white/20"
                />
              </div>
              <CardTitle className="mt-4 text-lg sm:text-xl font-semibold text-white font-poppins">
                Katlego Tshabangu
              </CardTitle>
              <CardDescription className="text-white font-poppins text-sm sm:text-base">
                Co-Founder
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pt-3 pb-6">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:text-white/80"
                })}
              >
                <Linkedin size="20" />
              </a>
            </CardFooter>
          </Card>

          <Card className="bg-[#CC461C]/70 border border-white/20 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center relative pb-0 pt-6">
              <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto">
                <img
                  src="/Talent.png"
                  alt="Talent Muzondo"
                  className="rounded-full object-cover w-full h-full border-2 border-white/20"
                />
              </div>
              <CardTitle className="mt-4 text-lg sm:text-xl font-semibold text-white font-poppins">
                Talent Muzondo
              </CardTitle>
              <CardDescription className="text-white font-poppins text-sm sm:text-base">
                Co-Founder
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pt-3 pb-6">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-white hover:text-white/80"
                })}
              >
                <Linkedin size="20" />
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};
