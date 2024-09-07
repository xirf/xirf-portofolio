---
title: "Memahami Matematika dengan Kode #1 - Aritmatika"
description: "Belajar matematika kadang berasa melelahkan dan sulit untuk dipahami, apalagi jika sudah masuk ke dalam konsep yang kopleks seperti aljabar abstrak, kalkulus, atau teori bilangan."
pubDate: "Sep 7 2024"
heroImage: "/images/math-p1.png"
idOnly: true
hasMath: true
---

Belajar matematika kadang berasa melelahkan dan sulit untuk dipahami, apalagi jika sudah masuk ke dalam konsep yang kopleks seperti aljabar abstrak, kalkulus, atau teori bilangan. Tapi sebenarnya, matematika bisa lebih mudah dipahami kalo kita menggunakan pendekatan yang berbeda sesuai dengan minat masing-masing, dalam kasus ku, aku lebih suka mengerjakan matematika sebagai suatu barisan kode karena programming dan matematika adalah dua hal yang tidak bisa dipisahkan.

Di artikel kali ini aku akan membahas tentang bagaimana kita bisa memahami matematika dengan kode, dan bagaimana kode bisa membantu kita dalam memahami konsep-konsep matematika yang sulit dengan menggunakan javascript. Kita akan mulai dari yang paling sederhana, yaitu penjumlahan dan pengurangan.

## Aritmatika Dasar

Aritmatika sendiri merupakan cabang ilmu matematika, di mana dasar dari operasi aritmatika adalah penjumlahan pengurangan, perkalian, dan pembagian. Aritmatika dipakai di semua cabang matematika seperti geometri, aljabar, kalkulus, dan lain-lain.

Operasi ini juga bisa kita lakukan dengan menggunakan kode, berikut adalah contoh kode untuk penjumlahan, pengurangan, perkalian, dan pembagian.

```javascript title="aritmatikaDasar.js"
let penjumlahan = 1 + 1;
let pengurangan = 2 - 1;
let pembagian = 4 / 2;
let perkalian = 2 * 2;
```

Disini hampir semua operator yang digunakan sama dengan apa yang kita pelajari disekolah. seperti, `+` untuk penjumlahan, `-` untuk pengurangan.

Namun di dalam dunia programming, untuk perkalian dan pembagian menggunakan simbol yang berbeda yakni `*` untuk perkalian dan `/` untuk pembagian. Hal ini karena simbol `x` atau `.` sudah digunakan oleh kode dimana `x` yang merupakan huruf biasanya digunakan untuk variabel, sedangkan `.` digunakan untuk menghubungkan sesuatu seperti `app().run()`. Di sisi lain kenapa pembagian tidak menggunakan `:` karena sering kali digunakan untuk hal lain, seperti pemisah di dalam sintaks tertentu.

### Urutan Operasi

Di dalam matematika, kita tahu bahwa urutan operasi adalah perkalian dan pembagian terlebih dahulu, kemudian penjumlahan dan pengurangan. Hal ini juga berlaku di dalam kode, berikut adalah contoh kode yang menunjukkan urutan operasi.

```javascript title="urutanOperasi.js"
let hasil1 = 1 + 2 * 3; // hasil = 7
let hasil2 = (1 + 2) * 3; // hasil2 = 9
```

Di dalam kode diatas, kita bisa melihat bahwa hasil1 dari `1 + 2 * 3` adalah 7, karena perkalian dilakukan terlebih dahulu sebelum penjumlahan. Sedangkan pada `hasil2` kita menggunakan tanda kurung untuk memberikan prioritas operasi, sehingga penjumlahan dilakukan terlebih dahulu sebelum perkalian sehingga hasilnya adalah 9.

### Pangkat dan Akar

Bagaimana dengan pangkat dan akar?, Pangkat sendiri bisa kita lakukan dengan menggunakan operator bintang 2 (`**`) tapi di javascript kita juga bisa menggunakan fungsi `Math.pow()` untuk melakukan pangkat. Berikut adalah contoh kode untuk pangkat dan akar.

```javascript title="pangkat.js"
let pangkatBiasa = 2 ** 3; // Hasil: 8
let pangkatFungsi = Math.pow(2, 3); // Hasil: 8
```

Angka 3 di kode diatas merupakan pangkat dan angka 2 adalah bilangan yang di pangkatkan. Bagaimana dengan akar? untuk akar sendiri kita bisa pakai fungsi `Math.sqrt()` (square root) seperti kode di bawah ini:

```javascript title="akar.js"
let akar = Math.sqrt(100); // Hasil 10
```

Kode diatas menujukkan nilai dari $\sqrt{100}$ yang hasilnya adalah 10. Lalu bagaimana jika akarnya bukan 2? misalnya akar pangkat 3, kita bisa menggunakan `Math.cbrt()` (cube root) seperti kode di bawah ini:

```javascript title="akarPangkat3.js"
let akarPangkat3 = Math.cbrt(27); // Hasil 3
```

bagaimana jika lebih dari 3? kita bisa menggunakan `Math.pow()` dengan pangkat 1/n, dimana n adalah pangkat akar. Berikut adalah contoh kode untuk akar pangkat 4:

```javascript title="akarPangkat4.js"
let akarPangkat4 = Math.pow(16, 1 / 4); // Hasil 2
```

Kode diatas menujukkan nilai dari $\sqrt[4]{16}$ yang hasilnya adalah 2. perlu diingat bahwa akar pangkat $n$ sama dengan $x^{1/n}$ atau nilai dari $x$ pangkat $1/n$.

MUngkin sampai sini saja dulu, karena akan ada cukup banyak materi yang dibahas selanjutnya :3 see you later