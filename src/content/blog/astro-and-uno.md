---
title: "Frontend Simpel dengan Astro dan Uno"
description: "Bingung cari techstack?, bikin yang simple aja pake astro dan unocss"
pubDate: "Aug 1 2024"
heroImage: "/images/astro-and-uno.png"
---

Protofolio kalian pakai apa?, kebanyakan pasti jawab React atau turunannya kaya Nextjs. Nextjs itu seru, ekosistemnya bagus komunitas nya gede dan banyak banget library yang dapat kalian gunakan buat mempercantik portofolio kalian.


Tapi kalian ngerasa gak kalo kadang untuk web portofolio aja harus pake React yang menurutku sedikit berlebihan untuk orang yang pengen simple kek aku. Aku kepikiran ada gak sih yang lebih sederhana dan gak ribet hingga akhirnya ketemu sama 2 pilihan yaitu Vitepress atau Astro Starlight walau akhirnya malah pilih Astro tanpa starlight 🤣.

Eh Astro seru lho kalian bisa pake React, Vue, Svelte bahkan sampe Solidjs dan kawan-kawannya. Aku pilih Astro cuman karena dia outputnya static dan dah kaya ngetik html biasa tapi tetep dapat power dari library lain kek reusable code nya.

Terus untuk CSS awalnya kepikiran Tailwind karena udah lama pake tailwind, tapi kemudian ngerasa ada yang kurang dan sintaknya bisa jadi panjang banget terutama kalo udah masuk responsive layout `md:grid md:grid-cols-2 md:gap-2` njer ngulang mulu `md:`karena di tailwind belum ada grouping. Terus temenku ngasih tau soal [UnoCSS](https://unocss.dev/), awalnya mikir ini apaan njer dokumentasinya mana, eh ternyata dokumentasinya dia bisa dibaca di tailwind karena dia CSS Engine bukan framework.

CSS Engine disini maksudnya dia bisa ngecompile class ke style, kalo Tailwind kan framework jadi kita tinggal pake aja apa yang disediakan. Di UnoCSS dia beda, kita bisa pilih preset kita sesukanya baik itu pake sintaks yang mirip tailwind pake preset tailwind atau yang lain. Di web ini aku pake cukup banyak preset sih.

-   **Preset Uno**: Preset bawaan dari UnoCSS yang pake preset tailwind
-   **Preset Typography**: Untuk load prose (default typography) di halaman blog
-   **Preset Web Fonts**: Unutk load fonts pake Lexend dan JetBrains Mono
-   **Preset Icons**: Untuk icon, dia pake CSS jadi gak perlu file tambahan buat icon

Terus buat ngatasin masalah ku sama tailwind soal grouping aku pakai UnoCSS Transformers yang bakalan ngubah class menjadi apa yang ku mau. Jadi aku gak perlu ngetik `md:grid md:grid-cols-2 md:gap-2` tapi tinggal ketik `md:(grid grid-cols-2 gap-2)` kode nya jadi lebih mudah dibaca dan gak bingung cari "Ini apaan njer buat apa?".

Btw UnoCSS pakai regex buat deteksi class nya jadi kita pake `px6` bakalan tetep ke detect seditaknya bisa hemat berapa btye wkwkw. tapi kalian bisa juga ubah jadi kelas lain yang lebih singkat pake _[Compile Class Transformers](https://unocss.dev/transformers/compile-class)_

```html
<div class=":uno: text-center sm:text-left">
	<div class=":uno: text-sm font-bold hover:text-red" />
</div>
```

Akan menjadi:

```html
<div class="uno-qlmcrp">
	<div class="uno-0qw2gr" />
</div>
```
<br />

```css
.uno-qlmcrp {
	text-align: center;
}
.uno-0qw2gr {
	font-size: 0.875rem;
	line-height: 1.25rem;
	font-weight: 700;
}
.uno-0qw2gr:hover {
	--un-text-opacity: 1;
	color: rgb(248 113 113 / var(--un-text-opacity));
}
@media (min-width: 640px) {
	.uno-qlmcrp {
		text-align: left;
	}
}
```
Jadi simplenya aku milih Astro karena fleksibel bisa pake react dan framework lainnya, development nya juga simple plugin dan integrasi banyak bet gak kalah sama meta framwork lainya.

Milih UnoCSS karena dia itu CSS Engine dimana dia itu fleksibel dan gampang di perluas. Uno cuman *generate* CSS ketika digunakan dalam kode. UnoCSS juga memiliki banyak fitur, kaya pintasan, attribut, variantgrup, dan bisa di compile. Yang jadinya jauh lebih powerfull daripada Tailwind, kalo library mu pure ngandelin class tailwind tuh library juga bisa langsung dipake di Uno.