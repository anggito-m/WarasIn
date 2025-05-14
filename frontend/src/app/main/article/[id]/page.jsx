import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ThumbsUp,
  MessageSquare,
  Share2,
} from "lucide-react";
import { RelatedArticles } from "@/components/related-articles";

export default function ArticlePage({ params }) {
  // In a real app, you would fetch the article data based on the ID
  // For this example, we'll use mock data
  const article = {
    id: 1,
    title:
      "I Created A Developer Rap Video - Here's What I Learned From It. Check It Out",
    author: "Jessica Kim",
    date: "02 December 2022",
    readTime: "3 Min To Read",
    image: "/kesehatan-mental.jpg",
    content: [
      {
        type: "paragraph",
        text: "Dynamically underwhelm integrated outsourcing via timely models. Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change. Completely streamline functionalized models.",
      },
      {
        type: "paragraph",
        text: "Collaboratively fabricate excellent intellectual capital whereas effective process improvements. Synergistically transform accurate methods of empowerment before client-centered resources. Authoritatively optimize collaborative experiences with cross-platform data. Objectively strategize cost effective methods of empowerment and world-class imperatives.",
      },
      {
        type: "heading",
        text: "The Journey Begins",
      },
      {
        type: "paragraph",
        text: "Efficiently leverage existing cross-platform mindshare rather than enterprise experiences. Energistically incentivize B2C users and compelling applications. Monotonectally deliver cross-media potentialities before cross-platform e-business. Credibly disseminate resource maximizing methodologies vis-à-vis resource-leveling processes. Professionally optimize cross-unit systems without cross-media data.",
      },
      {
        type: "image",
        src: "/placeholder.svg?height=400&width=800",
        alt: "Developer rap video production",
        caption: "Behind the scenes of our developer rap video production",
      },
      {
        type: "paragraph",
        text: "Uniquely optimize enabled leadership skills via cross-media opportunities. Intrinsicly generate premier testing procedures for technically sound scenarios. Holisticly facilitate premier results rather than strategic data. Authoritatively optimize collaborative experiences with cross-platform data.",
      },
      {
        type: "heading",
        text: "Lessons Learned",
      },
      {
        type: "list",
        items: [
          "Creativity is essential in technical communication",
          "Video production requires careful planning",
          "Developer humor has a unique audience",
          "Collaboration makes content more engaging",
        ],
      },
      {
        type: "paragraph",
        text: "Objectively strategize cost effective methods of empowerment and world-class imperatives. Professionally optimize cross-unit systems without cross-media data. Dynamically underwhelm integrated outsourcing via timely models.",
      },
      {
        type: "quote",
        text: "The best technical content doesn't feel technical at all - it feels human.",
        author: "Jessica Kim",
      },
      {
        type: "paragraph",
        text: "Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change. Completely streamline functionalized models. Collaboratively fabricate excellent intellectual capital whereas effective process improvements.",
      },
    ],
    tags: [
      "Development",
      "Creativity",
      "Video Production",
      "Technical Content",
    ],
    likes: 124,
    comments: 37,
    shares: 18,
  };

  const relatedArticles = [
    {
      id: 2,
      title:
        "How to Create Engaging Technical Content That Developers Actually Want to Read",
      author: "Jessica Kim",
      date: "28 November 2022",
      readTime: "5 Min To Read",
      excerpt:
        "Dynamically underwhelm integrated outsourcing via timely models. Rapidiously reconceptualize visionary imperatives without 24/365 catalysts for change.",
    },
    {
      id: 3,
      title: "The Ultimate Guide to Developer Marketing in 2023",
      author: "Jessica Kim",
      date: "15 November 2022",
      readTime: "4 Min To Read",
      excerpt:
        "Completely streamline functionalized models. Collaboratively fabricate excellent intellectual capital whereas effective process improvements.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
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

            {/* Back button */}
            <div className="mb-6">
              <Link
                href="/main"
                className="inline-flex items-center text-blue-500 hover:text-blue-700"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Resource Hub
              </Link>
            </div>

            {/* Article */}
            <article className="mb-12">
              {/* Article header */}
              <div className="mb-8">
                <div className="mb-2">
                  <span className="article-tag">NEW</span>
                </div>
                <h1 className="mb-4 text-3xl font-bold">{article.title}</h1>
                <div className="article-meta mb-6">
                  <div className="article-meta-item">
                    <Avatar className="h-6 w-6">
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
              </div>

              {/* Article hero image */}
              <div className="mb-8 overflow-hidden rounded-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="aspect-video w-full bg-gray-200 object-cover"
                />
                {/* <div className="aspect-video w-full bg-gray-200"></div> */}
              </div>

              {/* Article content */}
              <div className="prose prose-blue max-w-none">
                {article.content.map((block, index) => {
                  if (block.type === "paragraph") {
                    return (
                      <p key={index} className="mb-6 text-gray-700">
                        {block.text}
                      </p>
                    );
                  } else if (block.type === "heading") {
                    return (
                      <h2 key={index} className="mb-4 mt-8 text-2xl font-bold">
                        {block.text}
                      </h2>
                    );
                  } else if (block.type === "image") {
                    return (
                      <figure key={index} className="mb-8 mt-8">
                        <div className="overflow-hidden rounded-lg">
                          <Image
                            src={block.src || "/placeholder.svg"}
                            alt={block.alt}
                            width={800}
                            height={400}
                            className="w-full"
                          />
                        </div>
                        {block.caption && (
                          <figcaption className="mt-2 text-center text-sm text-gray-500">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  } else if (block.type === "list") {
                    return (
                      <ul key={index} className="mb-6 ml-6 list-disc space-y-2">
                        {block.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-gray-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  } else if (block.type === "quote") {
                    return (
                      <blockquote
                        key={index}
                        className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4 italic text-gray-700"
                      >
                        <p className="mb-2">{block.text}</p>
                        {block.author && (
                          <cite className="text-sm font-medium">
                            — {block.author}
                          </cite>
                        )}
                      </blockquote>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Article tags */}
              <div className="mb-8 mt-8">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Article actions */}
              <div className="flex items-center justify-between border-t border-b py-4">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                    <ThumbsUp className="h-5 w-5" />
                    <span>{article.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                    <MessageSquare className="h-5 w-5" />
                    <span>{article.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                    <Share2 className="h-5 w-5" />
                    <span>{article.shares}</span>
                  </button>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Save Article
                </Button>
              </div>
            </article>

            {/* Author bio */}
            <div className="mb-12 rounded-lg border bg-gray-50 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-lg">JK</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{article.author}</h3>
                  <p className="text-gray-600">
                    Content Creator & Developer Advocate
                  </p>
                </div>
              </div>
              <p className="mt-4 text-gray-700">
                Jessica specializes in creating engaging technical content that
                bridges the gap between developers and users. With over 5 years
                of experience in developer relations, she brings a unique
                perspective to technical communication.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="text-blue-500 hover:bg-blue-50"
                >
                  Follow
                </Button>
              </div>
            </div>

            {/* Related articles */}
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
              <RelatedArticles articles={relatedArticles} />
            </div>

            {/* Comments section */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">
                Comments ({article.comments})
              </h2>
              <div className="mb-6 rounded-lg border bg-white p-4">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-orange-100 text-orange-500">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      className="min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Write a comment..."
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample comments */}
              <div className="space-y-6">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Michael Johnson</h4>
                        <span className="text-xs text-gray-500">
                          2 days ago
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">
                        This was incredibly helpful! I've been thinking about
                        creating developer-focused content and your insights are
                        exactly what I needed. The rap video was both
                        entertaining and educational.
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button className="text-sm text-gray-500 hover:text-blue-500">
                          Reply
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500">
                          <ThumbsUp className="h-4 w-4" />
                          <span>12</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>SL</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Sarah Lee</h4>
                        <span className="text-xs text-gray-500">
                          3 days ago
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">
                        I watched the rap video and it was surprisingly good!
                        The production quality was impressive and the lyrics
                        were actually informative. Would love to see more
                        content like this.
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button className="text-sm text-gray-500 hover:text-blue-500">
                          Reply
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500">
                          <ThumbsUp className="h-4 w-4" />
                          <span>8</span>
                        </button>
                      </div>

                      {/* Nested reply */}
                      <div className="mt-4 border-l-2 border-gray-200 pl-4">
                        <div className="flex gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>JK</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Jessica Kim</h4>
                              <span className="text-xs text-gray-500">
                                2 days ago
                              </span>
                            </div>
                            <p className="mt-2 text-gray-700">
                              Thanks Sarah! I'm glad you enjoyed it. I'm
                              definitely planning to create more content like
                              this in the future.
                            </p>
                            <div className="mt-2 flex items-center gap-4">
                              <button className="text-sm text-gray-500 hover:text-blue-500">
                                Reply
                              </button>
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500">
                                <ThumbsUp className="h-4 w-4" />
                                <span>4</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="text-blue-500 hover:bg-blue-50"
                >
                  Load More Comments
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
