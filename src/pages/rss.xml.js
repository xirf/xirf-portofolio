import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export async function GET(context) {
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
