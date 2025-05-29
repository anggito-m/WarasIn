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
      "Individual therapy sessions (4 per month)",
      "Email support between sessions",
      "Self-assessment tools and worksheets",
      "Basic mindfulness and coping resources",
    ],
    isHighlighted: false,
  },
  {
    name: "Standard",
    price: 79.99,
    features: [
      "Individual therapy sessions (6 per month)",
      "Priority email and phone support",
      "Personalized treatment plan development",
      "Access to exclusive mental health resources",
    ],
    isHighlighted: false,
  },
  {
    name: "Premium",
    price: 99.99,
    features: [
      "Unlimited individual therapy sessions",
      "24/7 crisis support and intervention",
      "Family and couples counseling included",
      "Comprehensive mental health assessment",
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
        <section className="py-16 bg-gradient-to-l from-gradient-start to-gradient-end text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Join Our Mental Health Community
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-blue-100">
              Stay connected with our mental health community and receive weekly
              tips, self-care strategies, mindfulness exercises, and exclusive
              resources to support your journey toward better mental wellness
              and emotional balance.
            </p>
            <div className="flex max-w-md mx-auto">
              <Input
                placeholder="Your email"
                className="rounded-r-none bg-white/20 border-0 text-white placeholder:text-blue-100 
            focus:bg-white/80 focus:text-black focus:placeholder:text-gray-400 transition-colors duration-200"
              />
              <Button className="rounded-l-none bg-orange-500 hover:bg-orange-600">
                Subscribe Now
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
                  Real Stories from
                  <br />
                  Our Mental Health
                  <br />
                  Community
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-blue-500 text-white">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-orange-400 mb-2"></div>
                      <p className="font-medium">Sarah M.</p>
                    </div>
                    <p className="text-sm text-blue-100">
                      "The therapy sessions have been life-changing. I've
                      learned healthy coping mechanisms and finally feel like I
                      have the tools to manage my anxiety. Thank you for
                      creating such a safe and supportive environment."
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-500 mb-2"></div>
                      <p className="font-medium">Michael R.</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      "After struggling with depression for years, I finally
                      found the right support. The personalized approach and
                      genuine care made all the difference. I'm now living a
                      much more balanced and fulfilling life."
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
