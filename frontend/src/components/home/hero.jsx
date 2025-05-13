"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Hero = () => {
  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Badge
            variant="outline"
            className="px-4 py-1 rounded-full bg-white text-gray-700 border-gray-200"
          >
            Mental Health Matters
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-blue-500">Healthy Minds,</span>
              <br />
              Happy Lives
            </h1>
            <p className="text-gray-500">
              Lorem ipsum dolor sit amet consectetur adipiscing elit
            </p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 rounded-full px-6">
            Get Started Now!
          </Button>
        </div>
        <div className="relative">
          <div className="relative h-80 w-80 mx-auto">
            <div className="absolute inset-0 rounded-full bg-purple-200"></div>
            <Image
              src="/doctor.svg"
              alt="Doctor illustration"
              width={400}
              height={400}
              className="relative z-10"
            />
            {/* <div className="absolute top-4 right-4 bg-purple-700 text-white p-2 rounded-full">
                  <Phone className="h-5 w-5" />
                </div> */}
            <div className="absolute bottom-10 left-0 bg-orange-200 h-3 w-3 rounded-full"></div>
            <div className="absolute top-10 right-0 bg-orange-200 h-3 w-3 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
