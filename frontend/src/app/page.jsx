"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, BookOpen, BarChart2, Bot } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/home/hero";
import { Footer } from "@/components/footer";
import { Pricing } from "@/components/home/pricing";
import { Features } from "@/components/home/features";

const pricingPackages = [
  {
    name: "Basic",
    price: 69.99,
    features: [
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
    ],
    isHighlighted: false,
  },
  {
    name: "Standard",
    price: 79.99,
    features: [
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
    ],
    isHighlighted: false,
  },
  {
    name: "Premium",
    price: 99.99,
    features: [
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
      "Lorem ipsum dolor sit amet cons.",
    ],
    isHighlighted: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navigation> </Navigation>
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Pricing Section */}
        <Pricing packages={pricingPackages} />
        {/* Newsletter Section */}
        <section className="py-16 bg-blue-500 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join To Our Newsletter</h2>
            <p className="max-w-2xl mx-auto mb-8 text-blue-100">
              Lorem ipsum dolor sit amet consectetur. Consequat vel vitae
              ullamcorper tristique nulla etiam ipsum nisi mauris. Ultrices
              aliquam at ipsum ullamcorper tortor rhoncus massa. Placerat libero
              nulla amet vel. Ut ultrices dignissim.
            </p>
            <div className="flex max-w-md mx-auto">
              <Input
                placeholder="Your email"
                className="rounded-r-none bg-white/20 border-0 text-white placeholder:text-blue-100"
              />
              <Button className="rounded-l-none bg-orange-500 hover:bg-orange-600">
                Subscribe Us
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonial" className="py-16">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-sm font-medium mb-2">Testimonials</h3>
                <h2 className="text-3xl font-bold mb-4">
                  Healing Words
                  <br />
                  Testimonials from a<br />
                  Mental Health
                  <br />
                  Consultant
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-blue-500 text-white">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-orange-400 mb-2"></div>
                      <p className="font-medium">George J. Client</p>
                    </div>
                    <p className="text-sm text-blue-100">
                      Lorem ipsum dolor sit amet consectetur. Consequat vel
                      vitae ullamcorper tristique nulla etiam ipsum nisi mauris.
                      Ultrices aliquam at ipsum ullamcorper tortor rhoncus
                      massa.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-500 mb-2"></div>
                      <p className="font-medium">George J. Client</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Lorem ipsum dolor sit amet consectetur. Consequat vel
                      vitae ullamcorper tristique nulla etiam ipsum nisi mauris.
                      Ultrices aliquam at ipsum ullamcorper tortor rhoncus
                      massa.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer Section */}
      <Footer />
    </div>
  );
}
