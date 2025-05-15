"use client";
// create for navigation component
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export const Navigation = () => {
  return (
    //   {
    //     /* Navigation */
    //   }
    <header className="container mx-auto py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Warasio Logo"
            width={100}
            height={100}
            // className="h-24 w-24"
          />
          {/* <span className="text-blue-500 font-bold text-xl">Warasio</span> */}
          {/* <div className="relative">
              <div className="absolute -top-1 -right-4 h-3 w-3 rounded-full bg-blue-500"></div>
            </div> */}
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium">
            Pricing
          </Link>
          <Link href="#testimonial" className="text-sm font-medium">
            Testimonial
          </Link>
          <Link href="#" className="text-sm font-medium">
            About Us
          </Link>
        </nav>
        <Button className="bg-blue-500 hover:bg-blue-600">Log In</Button>
      </div>
    </header>
  );
};
//   );
// export default Navigation;
