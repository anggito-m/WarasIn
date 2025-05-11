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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Warasio Logo"
              width={96}
              height={96}
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
            <Link href="#testimonial" className="text-sm font-medium">
              Testimonial
            </Link>
            <Link href="#pricing" className="text-sm font-medium">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-medium">
              About Us
            </Link>
          </nav>
          <Button className="bg-blue-500 hover:bg-blue-600">Log In</Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="px-4 py-1 rounded-full bg-white text-gray-700 border-gray-200"
              >
                Mental Health Matters ❤️
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
                <div className="absolute top-4 right-4 bg-purple-700 text-white p-2 rounded-full">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="absolute bottom-10 left-0 bg-orange-200 h-3 w-3 rounded-full"></div>
                <div className="absolute top-10 right-0 bg-orange-200 h-3 w-3 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="container mx-auto text-center">
            <h3 className="text-blue-500 font-medium mb-4">
              FEATURES WE PROVIDE
            </h3>
            <h2 className="text-3xl font-bold mb-2">
              Maintain <span className="text-blue-500">mental health</span>{" "}
              easily 💙
            </h2>
            <p className="text-gray-500 mb-12">
              We help you to maintain your mental health with easy way.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
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
            </div>

            <div className="flex justify-center mt-8 gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <div className="h-2 w-2 rounded-full bg-black"></div>
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16">
          <div className="container mx-auto text-center">
            <h3 className="text-blue-500 font-medium mb-4">PRICING</h3>
            <h2 className="text-3xl font-bold mb-12">
              Choose Packages for Your Needs
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardHeader className="text-center">
                  <h3 className="font-bold">Basic</h3>
                  <div className="text-3xl font-bold">
                    $69.99
                    <span className="text-sm font-normal text-gray-500">
                      /month
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="min-w-4 mt-1">•</div>
                      <p className="text-sm text-gray-500 text-left">
                        Lorem ipsum dolor sit amet cons.
                      </p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full rounded-full bg-orange-100 text-orange-500 border-orange-200 hover:bg-orange-200"
                  >
                    Choose now
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2">
                <CardHeader className="text-center">
                  <h3 className="font-bold">Standard</h3>
                  <div className="text-3xl font-bold">
                    $79.99
                    <span className="text-sm font-normal text-gray-500">
                      /month
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="min-w-4 mt-1">•</div>
                      <p className="text-sm text-gray-500 text-left">
                        Lorem ipsum dolor sit amet cons.
                      </p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full rounded-full bg-orange-100 text-orange-500 border-orange-200 hover:bg-orange-200"
                  >
                    Choose now
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-0 bg-blue-500 text-white">
                <CardHeader className="text-center">
                  <h3 className="font-bold">Premium</h3>
                  <div className="text-3xl font-bold">
                    $99.99
                    <span className="text-sm font-normal text-blue-100">
                      /month
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="min-w-4 mt-1">•</div>
                      <p className="text-sm text-blue-100 text-left">
                        Lorem ipsum dolor sit amet cons.
                      </p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                    Choose now
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

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

      {/* Footer */}
      <footer className="py-16 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Warasio Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="text-blue-500 font-bold text-xl">Warasio</span>
                <div className="relative">
                  <div className="absolute -top-1 -right-4 h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <p className="text-gray-500 mb-4">
                Lorem ipsum dolor sit amet consectetur adipiscing elit
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">YouTube</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Case studies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Updates
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Culture
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Getting started
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Help center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Server status
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Report a bug
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Chat support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Contacts us</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">hi@warasio.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    (+1) 555-0123 - 5582
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    JL Diponegoro, Tegalrejo
                    <br />
                    Yogyakarta, 55292
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">Copyright © 2023</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Terms and Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
