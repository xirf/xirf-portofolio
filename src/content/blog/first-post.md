---
title: "A New House"
description: "Welcome to my new blog"
pubDate: "Jan 13 2024"
---

I have always wondering how about getting new blog to write something that i want to share with ot.

At fist i was thinking about using some CMS like wordpress, but i think it's too much for me. I wouldn't write that much and the free version of wordpress is too limited.

### That time i found out about SSG

Then when i start heard about [JAMStack](https://jamstack.org/), i think it's a good idea to try it out. And the bestpart is there are a lot of free hosting and platform for jamstack like [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), [Github Pages](https://pages.github.com/), [Cloudflare Pages](https://pages.cloudflare.com/), etc. I choose to use [Vercel](https://vercel.com/) because it's easy to use and it's free for personal use.

For the static site generator, i choose [Astro](https://astro.build/) because their framework agnostic approach and coding in Astro feels like home, it's just like coding in HTML but with some extra features.

I've try another SSG like [NextJS](https://nextjs.org/) and [NuxtJS](https://nuxtjs.org/). The DX is great i can do a lot of things with it, but later i feel the performance that i get from it is not that great. I mean yeah it was great but for just a blog why i need so much power. So i choose Astro because it's more lightweight and i can get the performance that i want.

### What about CSS?

Wrinting CSS is hard, not because the syntax but working with bundling size writing CSS per components can be painfull, just for one page it can be more than 100 lines of CSS. Implementing more complex design can be a nightmare. That why we need to maintain reusability and modularity of our CSS.

Fotunately there are a lot of CSS framework that can help us with that like [TailwindCSS](https://tailwindcss.com/), [Bootstrap](https://getbootstrap.com/), [Bulma](https://bulma.io/), [Materialize](https://materializecss.com/), etc. But chosing framework is another pain.

And then i found [UnoCSS](https://unocss.dev/), It's not a CSS Framework but an CSS Engine. It's really powerfull and joyful. Usually i combine UnoCSS with its Uno Preset that equivalent with [Tailwind](https://tailwindcss.com/) and [WindiCSS](https://windicss.org/). the syntax just same with more features and it's really easy to use like:

```html
<div class="bg-#272d44 text-white p-4 rounded-lg text-20px">Hello World</div>
```

that will output this element below:

<div class="bg-#272d44 text-white p-4 rounded-lg text-20px"> Hello World </div>

But if that in tailwind it will be like this:

<div class=" text-white p-4 rounded-lg "> Hello World </div>

Because tailwind doesn't have rule for `bg-#272d44` and `text-20px` so it will be ignored. but in UnoCSS it will be compiled to:

```css
.bg-\#272d44{--un-bg-opacity:1;background-color:rgb(39 45 68 / var(--un-bg-opacity));}
.text-20px{font-size:20px;}
```
Uno is CSS engine thats why it can do that and it's really powerfull. And the best part is it's really easy to use and it's really fast. I can't wait to see what UnoCSS can do in the future.

### That's it

That's all for now, i hope i can write more in the future.