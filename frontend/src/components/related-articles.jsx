import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RelatedArticles({ articles }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((article) => (
        <div key={article.id} className="article-card">
          <div className="article-card-accent"></div>
          <div className="p-6">
            <Link href={`/article/${article.id}`} className="group">
              <h3 className="mb-2 text-lg font-bold group-hover:text-blue-500">
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
      ))}
    </div>
  );
}
