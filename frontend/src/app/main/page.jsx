import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArticleCard } from "@/components/article-card";
import { Footer } from "@/components/footer";
import { fetchArticles } from "utils/article";

const articles = await fetchArticles();
export default function Home() {
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
