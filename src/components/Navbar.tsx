import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { buttonVariants } from "./ui/button";
import { Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { LogoIcon } from "./Icons";
import { Button } from "./ui/button";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#testimonials",
    label: "Testimonials",
  },
  {
    href: "#pricing",
    label: "Pricing",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const yOffset = -150; // Offset for fixed header
      const y = aboutSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FF5823]">
      <div className="max-w-[2000px] mx-auto">
        {/* Top section with logo and text */}
        <div className="flex items-center justify-between h-36">
          {/* Logo */}
          <div className="flex items-center ml-12">
            <img 
              src="/Logo.png" 
              alt="Logo" 
              className="h-32 w-auto"
            />
          </div>
          
          {/* About Button */}
          <div className="mr-12">
            <Button
              variant="outline"
              onClick={scrollToAbout}
              className="font-poppins text-white border-white hover:bg-white/20 transition-colors"
            >
              About Sparcel
            </Button>
          </div>
        </div>

        {/* Border line */}
        <div className="border-b-2 border-white/30"></div>
      </div>
    </nav>
  );
};
