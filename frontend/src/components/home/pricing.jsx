"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Pricing({ packages = [] }) {
  return (
    <section id="pricing" className="py-16">
      <div className="container mx-auto text-center">
        <h3 className="text-blue-500 font-medium mb-4">PRICING</h3>
        <h2 className="text-3xl font-bold mb-12">
          Choose Packages for Your Needs
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className="min-h-[480px] flex flex-col justify-between border-2 transition-all duration-300 group hover:bg-gradient-to-r hover:from-gradient-start hover:to-gradient-end hover:border-0 text-black"
            >
              <CardHeader className="text-center">
                <h3 className="font-bold group-hover:text-white transition-colors">
                  {pkg.name}
                </h3>
                <div className="text-5xl font-bold group-hover:text-white transition-colors">
                  ${pkg.price}
                  <span className="text-sm font-normal group-hover:text-white text-gray-500 ml-1">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="min-w-4 mt-1 group-hover:text-white">•</div>
                    <p className="text-sm text-left text-black group-hover:text-white transition-colors">
                      {feature}
                    </p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full rounded-full bg-orange-100 text-orange-500 border-orange-200 hover:bg-orange-200 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors"
                >
                  Choose now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
