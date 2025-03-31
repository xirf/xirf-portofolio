import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export const prerender = false;

export async function GET(context) {
  function getExcerpt(html, wordCount = 100) {
    if (!html) return "";

    const plainText = html.replace(/<[^>]*>/g, " ");

    const cleanText = plainText.replace(/\s+/g, " ").trim();

    const words = cleanText.split(" ");
    const excerpt = words.slice(0, wordCount).join(" ");

    return words.length > wordCount ? `${excerpt}...` : excerpt;
  }

  const posts = await getCollection("blog");

  return rss(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      site: context.site,
      customData: '<language>en-us</language>',
      items: posts.map((post) => ({
        categories: post.data.properties.tags,
        author: 'Andika',
        link: `/blog/${post.data.properties.slug}/`,
        title: post.data.properties.Name || '=--',
        pubDate: new Date(post.data.properties.created_at.date.start),
        description: getExcerpt(post.rendered.html || ''),
        content: post.rendered.html,
      })),
    }

  );
}
