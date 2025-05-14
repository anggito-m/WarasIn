import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArticleCard } from "@/components/article-card";
import { Footer } from "@/components/footer";

export default function Home() {
  const articles = [
    {
      id: 1,
      title:
        "I Created A Developer Rap Video - Here's What I Learned From It. Check It Out",
      author: "Jessica Kim",
      date: "02 December 2022",
      readTime: "3 Min To Read",
      excerpt:
        "Dynamically underwhelm integrated outsourcing via timely models. Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change. Completely streamline functionalized models.",
      image: "/kesehatan-mental.jpg",
    },
    {
      id: 2,
      title: "I Created A Developer Rap",
      author: "Jessica Kim",
      date: "02 December 2022",
      readTime: "3 Min To Read",
      excerpt:
        "Dynamically underwhelm integrated outsourcing via timely models. Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change. Completely streamline functionalized models.",
      image: "/kesehatan-mental.jpg",
    },
    {
      id: 3,
      title: "I Created A Developer Rap Video - Here's What I Learned",
      author: "Jessica Kim",
      date: "02 December 2022",
      readTime: "3 Min To Read",
      excerpt:
        "Dynamically underwhelm integrated outsourcing via timely models. Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change. Completely streamline functionalized models.",
      image: "/kesehatan-mental.jpg",
    },
    {
      id: 4,
      title:
        "I Created A Developer Rap Video - Here's What I Learned From It. Check It Out",
      author: "Jessica Kim",
      date: "02 December 2022",
      readTime: "3 Min To Read",
      excerpt:
        "Dynamically underwhelm integrated outsourcing via timely models. Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change. Completely streamline functionalized models.",
      image: "/kesehatan-mental.jpg",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 pb-12">
          <div className="container mx-auto px-6 py-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Hello, User</h1>
                <p className="text-xl">How Are You Today</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Button
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Button
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Button
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-orange-200 px-4"
                >
                  <span className="mr-2 text-orange-500">User</span>
                  <Avatar className="h-6 w-6 border border-orange-200">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-orange-100 text-orange-500">
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </div>
            </div>

            {/* Articles */}
            <div className="grid gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
