import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export const prerender = false;

export async function GET(context) {
  function getExcerpt(html, count = 1) {
    if (!html) return "";

    const plainText = html.replace(/<[^>]*>/g, " ");

    const cleanText = plainText.replace(/\s+/g, " ").trim();

    const sentences = cleanText.split(".").filter(sentence => sentence.trim() !== "");
    const excerpt = sentences.slice(0, count).join(".");

    return excerpt.trim();
  }

  const posts = await getCollection("blog");

  return rss(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      site: context.site,
      customData: '<language>en-us</language>',
      items: posts.map((post) => ({
        categories: post.data.tags,
        author: 'Andika',
        link: `/blog/${post.data.slug}/`,
        title: post.data.title || '=--',
        pubDate: new Date(post.data.pubDate),
        description: post.data.title,
      })),
    }

  );
}
