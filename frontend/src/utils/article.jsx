import articleContent from "../data/articles-content.json";
export const fetchArticles = async () => {
  // In a real app, this would be a fetch() call
  const response = await import("../data/articles.json");
  return response.default;
};
// utils/api.js

export const getArticleById = async (id) => {
  // Simulasi delay API
  await new Promise((resolve) => setTimeout(resolve, 100));

  const article = articleContent.find((item) => item.id === parseInt(id));

  if (!article) {
    throw new Error("Article not found");
  }

  return article;
};
