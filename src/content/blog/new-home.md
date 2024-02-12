---
title: "Building a New Home"
description: "I've been meaning to start a blog for a while now. I've always enjoyed writing, and I've been eager to share my thoughts and experiences with the world."
pubDate: "Jan 13 2024"
---

I've been meaning to start a blog for a while now. I've always enjoyed writing, and I've been eager to share my thoughts and experiences with the world. However, I've been held back by the complexity of setting up a blog. I wanted something simple, fast, and easy to maintain. I didn't want to deal with databases, server-side rendering, or complex build processes. I wanted to focus on writing and sharing my thoughts without worrying about the technical details.

## Discovering JAMStack

Enter JAMStack, a modern web development architecture. When I stumbled upon it, I thought it might be the perfect fit for my needs. The beauty of JAMStack is the array of free hosting and platforms available, such as [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), [Github Pages](https://pages.github.com/), and [Cloudflare Pages](https://pages.cloudflare.com/). After considering my options, I opted for [Vercel](https://vercel.com/) due to its user-friendly interface and free personal use option.

For the static site generator, I chose [Astro](https://astro.build/). Its framework-agnostic approach and familiar HTML-like coding environment won me over. Although I experimented with [NextJS](https://nextjs.org/) and [NuxtJS](https://nuxtjs.org/), I found Astro's lightweight nature and optimal performance more suitable for a simple blog.

## Simplifying CSS with UnoCSS

CSS can be challenging, not just in terms of syntax but also when dealing with bundling and maintaining a modular and reusable codebase. Various CSS frameworks like [TailwindCSS](https://tailwindcss.com/), [Bootstrap](https://getbootstrap.com/), and [Bulma](https://bulma.io/) aim to ease this pain, but choosing the right one can be a headache.

That's when I stumbled upon [UnoCSS](https://unocss.dev/), a CSS engine rather than a framework. It proved to be powerful and enjoyable, especially when combined with its Uno Preset, akin to [Tailwind](https://tailwindcss.com/) and [WindiCSS](https://windicss.org/). The syntax is familiar, as shown below:

```html
<div class="bg-#272d44 text-white p-4 rounded-lg text-20px">
  Hello World
</div>
```

This UnoCSS snippet compiles to the following CSS, handling custom properties like `bg-#272d44` and `text-20px` with ease:

```css
.bg-\#272d44 {
  --un-bg-opacity: 1;
  background-color: rgb(39 45 68 / var(--un-bg-opacity));
}
.text-20px {
  font-size: 20px;
}
```

UnoCSS's engine capabilities make it a standout choice, providing both power and simplicity. The best part? It's lightning-fast and remarkably easy to use. Oh! did i mention that unocss support a lot of preset from icon, atributify, transformers, and extractor.

## Wrapping Up

That's all for now. I'm excited about the future possibilities with this tech stack and can't wait to share more in the coming days. Stay tuned!