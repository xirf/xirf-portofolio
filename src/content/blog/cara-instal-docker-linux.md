---
title: "Cara Install Docker Linux"
description: "tutorial menginstall docker di os linux"
pubDate: "Jun 4 2025"
---
Berikut adalah **tutorial lengkap step-by-step untuk menginstal Docker di Linux (Ubuntu/Debian)** — aman, cepat, dan bisa langsung kamu tempel ke Blogger jika mau.

---

## 🐳 Tutorial Instal Docker di Linux (Ubuntu/Debian)

> Docker adalah platform untuk menjalankan aplikasi dalam container. Berikut cara menginstalnya di sistem Linux berbasis Debian seperti Ubuntu.

---

### ✅ Persyaratan

* Sistem: Ubuntu 20.04 / 22.04 atau Debian 10 / 11
* Akses root atau user dengan `sudo`
* Internet aktif

---

### 🧱 Langkah 1: Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
```

---

### 📦 Langkah 2: Instal Dependensi

```bash
sudo apt install ca-certificates curl gnupg lsb-release -y
```

---

### 🔑 Langkah 3: Tambahkan GPG Key Docker

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

> Jika kamu pakai Debian, ganti `ubuntu` jadi `debian` di URL di atas.

---

### 📚 Langkah 4: Tambahkan Repository Docker

```bash
echo \
"deb [arch=$(dpkg --print-architecture) \
signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

---

### 🚀 Langkah 5: Instal Docker Engine

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

---

### 🔄 Langkah 6: Cek Versi Docker

```bash
docker --version
```

Contoh output:

```
Docker version 24.0.5, build ced0996
```

---

### 👤 Langkah 7: (Opsional) Jalankan Docker tanpa Sudo

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

### ✅ Langkah 8: Tes Docker Berfungsi

```bash
docker run hello-world
```

Jika berhasil, kamu akan melihat pesan:

```
Hello from Docker!
```

---

### 🧼 Uninstall Docker (Jika Dibutuhkan)

```bash
sudo apt purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
sudo rm -rf /var/lib/docker
```

---

## 🎉 Selesai!

Docker kini siap kamu gunakan untuk:

* Deploy aplikasi (Node.js, PHP, Python, dll)
* Jalankan database (MySQL, MongoDB, Redis)
* Build image dan deploy via Dockerfile

---
