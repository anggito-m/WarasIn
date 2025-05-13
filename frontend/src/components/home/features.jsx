"use client";
import React from "react";
import { Bot, BookOpen, BarChart2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

export function Features() {
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-red-500" />,
      bgColor: "bg-red-100",
      title: "Mood Analyzer",
      desc: "Analyze your mood from your smart journal.",
    },
    {
      icon: <Bot className="h-8 w-8 text-red-500" />,
      bgColor: "bg-red-100",
      title: "Anonymous Chatbot",
      desc: "Solve your queries by interacting with our bot.",
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-green-500" />,
      bgColor: "bg-green-100",
      title: "Monitoring & Report",
      desc: "Get all the report of your mental health.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-red-500" />,
      bgColor: "bg-red-100",
      title: "Smart Journal",
      desc: "Get all the nutritional values of your preferred dish.",
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-green-500" />,
      bgColor: "bg-green-100",
      title: "Resource Hub",
      desc: "Get all the knowledge you need to maintain your mental health.",
    },
  ];

  return (
    <section id="features" className="py-16">
      <div className="container mx-auto text-center">
        <h3 className="text-blue-500 font-medium mb-4">FEATURES WE PROVIDE</h3>
        <h2 className="text-3xl font-bold mb-2">
          Maintain <span className="text-blue-500">mental health</span> easily
        </h2>
        <p className="text-gray-500 mb-12">
          We help you to maintain your mental health with easy way.
        </p>

        {/* <div className="grid md:grid-cols-5 gap-8"> */}
        <div className="max-w-7xl mx-auto py-8">
          <Swiper
            className="my-swiper"
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={3}
            centeredSlides={true} // Tambahkan ini
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 3 },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              el: ".swiper-pagination", // Reference the pagination container
            }}
          >
            {features.map((feature, idx) => (
              <SwiperSlide key={idx}>
                <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow duration-300">
                  <div
                    className={`h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${feature.bgColor}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500">{feature.desc}</p>
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-pagination"></div>
            {/* Pagination container */}
          </Swiper>
        </div>

        {/* <div className="grid md:grid-cols-5 gap-8">
          <div className="text-center">
            <div className="bg-red-100 h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Mood Analyzer</h3>
            <p className="text-gray-500">
              Analyze your mood from your smart journal.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Anonymous Chatbot</h3>
            <p className="text-gray-500">
              Solve your queries by interacting with our bot.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Monitoring & Report</h3>
            <p className="text-gray-500">
              Get all the report of your mental health.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Journal</h3>
            <p className="text-gray-500">
              Get all the nutritional values of your preferred dish.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Resource Hub</h3>
            <p className="text-gray-500">
              Get all the knowledge you need to maintain your mental health.
            </p>
          </div>
        </div> */}

        {/* <div className="flex justify-center mt-8 gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          <div className="h-2 w-2 rounded-full bg-black"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        </div> */}
      </div>
    </section>
  );
}
