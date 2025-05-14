import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
export function ArticleCard({ article }) {
  return (
    <div className="grid md:grid-cols-3 gap-3 h-full">
      {/* Konten Artikel */}
      <div className="md:col-span-2 h-full">
        <div className="article-card h-full">
          <div className="article-card-accent"></div>
          <div className="p-6">
            <div className="mb-2">
              <span className="article-tag">NEW</span>
            </div>
            <Link href="#" className="group">
              <h3 className="mb-2 text-xl font-bold group-hover:text-blue-500">
                {article.title}
              </h3>
            </Link>
            <div className="article-meta mb-4">
              <div className="article-meta-item">
                <Avatar className="h-5 w-5">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>JK</AvatarFallback>
                </Avatar>
                <span>{article.author}</span>
              </div>
              <div className="article-meta-item">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
              <div className="article-meta-item">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <p className="text-muted-foreground">{article.excerpt}</p>
          </div>
        </div>
      </div>
      <div className="article-card h-full">
        <Image
          src={article.image}
          alt={article.title}
          width={400}
          height={300}
          className="object-cover w-full h-full rounded-lg"
          style={{ height: "100%", minHeight: "300px" }}
        />
        {/* <div className="h-full bg-gray-200"></div> */}
      </div>
    </div>
  );
}
