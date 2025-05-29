"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Hero = () => {
  return (
    <section className="bg-slate-50 min-h-screen py-16 relative overflow-hidden">
      {/* Add Background */}
      <Image
        src="/hero/background.svg"
        alt="Background"
        fill
        className="absolute top-20 left-10"
      />
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
        <div className="space-y-6">
          <Badge
            variant="outline"
            className="xl:text-lg px-4 py-1 rounded-full w-fit bg-white text-gray-700 border-gray-200 flex items-center gap-1"
          >
            Mental Health Matters
            <Image
              src="/hero/love.svg"
              alt="Heart"
              width={32}
              height={32}
              className="ml-1"
            />
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl xl:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-700 to-blue-400 text-transparent bg-clip-text">
                Healthy Minds,
              </span>
              <br />
              Happy Lives
            </h1>
            <p className="text-gray-500">
              Warasin is a mental health platform dedicated to providing
                accessible tools and resources for self-reflection, emotional
                well-being, and personal growth. Our mission is to empower
                individuals to better understand their thoughts and feelings,
                fostering a supportive environment for mental wellness.
            </p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 rounded-full px-6 py-5">
            Get Started Now!
          </Button>
        </div>
        {/* Doctor image with proper z-index hierarchy */}
        <div className="relative z-10 flex justify-center items-center">
          <div className="relative h-[400px] w-[400px] md:h-[500px] md:w-[500px]">
            {/* Purple circle background */}
            {/* <div className="absolute inset-0 rounded-full bg-purple-200 z-0"></div> */}

            {/* Doctor image - now with higher z-index and responsive sizing */}
            <div className="relative z-20 h-full w-full">
              <Image
                src="/doctor.svg"
                alt="Doctor illustration"
                fill
                className="object-contain p-4" // Added padding to prevent touching edges
              />
            </div>

            {/* Decorative dots */}
            <div className="absolute bottom-10 left-0 bg-orange-200 h-3 w-3 rounded-full z-10"></div>
            <div className="absolute top-10 right-0 bg-orange-200 h-3 w-3 rounded-full z-10"></div>
          </div>

          {/* <div className="relative">
          <div className="relative h-80 w-80 mx-auto">
            <div className="absolute inset-0 rounded-full bg-purple-200"></div>
            <Image
              src="/doctor.svg"
              alt="Doctor illustration"
              width={400}
              height={400}
              className="relative z-10"
            />
            // {/* <div className="absolute top-4 right-4 bg-purple-700 text-white p-2 rounded-full">
            //       <Phone className="h-5 w-5" />
            //     </div> 
            <div className="absolute bottom-10 left-0 bg-orange-200 h-3 w-3 rounded-full"></div>
            <div className="absolute top-10 right-0 bg-orange-200 h-3 w-3 rounded-full"></div>
          </div> */}
        </div>
      </div>
    </section>
  );
};
