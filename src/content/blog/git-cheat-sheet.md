---
title: "Git Cheat Sheet"
description: "Git Cheat Sheet"
pubDate: "Jun 4 2025"
---
# 🧠 Git Cheat Sheet

## 🔧 Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.editor "code --wait"
```

## 📁 Memulai Repository

```bash
git init                      # Buat repo baru
git clone <url>               # Clone repo dari remote
```

## 📄 Workflow Dasar

```bash
git status                    # Cek status file
git add <file>                # Stage file tertentu
git add .                     # Stage semua file
git commit -m "pesan"         # Commit dengan pesan
git push                      # Push ke remote
git pull                      # Tarik perubahan terbaru
```

## 🌿 Branching & Merging

```bash
git branch                    # Lihat semua branch
git branch <nama>             # Buat branch baru
git checkout <nama>           # Pindah ke branch
git checkout -b <nama>        # Buat + pindah ke branch baru
git merge <branch>            # Gabungkan branch ke saat ini
```

## 🌐 Remote Repository

```bash
git remote -v                 # Tampilkan remote yang ada
git remote add origin <url>   # Tambahkan remote baru
git push -u origin <branch>   # Push dan set upstream
```

## 🕵️ Melihat Riwayat

```bash
git log                       # Tampilkan log lengkap
git log --oneline             # Tampilkan log ringkas
git diff                      # Lihat perubahan belum distage
git diff --staged             # Lihat perubahan yang sudah distage
```

## ❌ Membatalkan Perubahan

```bash
git restore <file>            # Kembalikan perubahan lokal
git restore --staged <file>   # Unstage file
git reset --soft HEAD~1       # Undo commit terakhir (simpan perubahan)
git reset --hard HEAD~1       # Undo commit terakhir (hapus perubahan)
```

## 📦 Stash (Simpan Sementara)

```bash
git stash                     # Simpan sementara perubahan
git stash list                # Lihat daftar stash
git stash pop                 # Terapkan dan hapus stash
git stash apply               # Terapkan stash tanpa menghapus
```

## 🧼 Membersihkan Repo

```bash
git clean -fd                 # Hapus file/folder untracked
```

## 🧪 Lanjutan

```bash
git rebase <branch>           # Rebase dari branch lain
git cherry-pick <commit>      # Ambil commit tertentu
git tag <tag-name>            # Tandai commit
```
Berikut adalah **Git Workflow Cheatsheet Lengkap untuk Developer**, dirancang agar kamu bisa kerja cepat, rapi, dan sesuai standar tim. Cocok untuk GitHub, GitLab, Bitbucket, dan CI/CD modern (Vercel, Netlify, dll).

---

# 🧾 **GIT WORKFLOW CHEATSHEET — FULL VERSION**

## 🔁 1. **Sync branch utama**

```bash
git checkout main         # Pindah ke branch utama
git pull origin main      # Ambil update terbaru dari remote
```

## 🌿 2. **Buat branch baru**

```bash
git checkout -b feature/123-deskripsi-singkat
# Format: <type>/<issue-id>-<deskripsi-kebab-case>
```

## 🧑‍💻 3. **Kerja di branch ➜ Commit perubahan**

```bash
git status                # Lihat file yang berubah
git add .                 # Stage semua perubahan
git commit                # Buka editor dengan template
# atau langsung:
git commit -m "feat(login): tambah form login pengguna"
```

## ⬆️ 4. **Push ke remote**

```bash
git push origin HEAD      # Push branch saat ini
```

## 🔀 5. **Buat Pull Request**

* Di GitHub/GitLab/Bitbucket
* Judul: `feat: Tambah halaman login`
* Deskripsi: Jelaskan apa yang diubah, referensikan issue (`#123`)
* Assign reviewer

## 👀 6. **Review + Merge**

* Lakukan **code review**
* Jika sudah OK, **merge (squash preferred)** ke `main`
* Hapus branch jika tidak diperlukan

## 🚀 7. **CI/CD (otomatis)**

* Branch preview deploy (Vercel, Netlify, dsb)
* Merge ke `main` ➜ deploy ke production

---

# 📦 Tipe Branch

| Tipe       | Kegunaan                  | Contoh Branch                |
| ---------- | ------------------------- | ---------------------------- |
| `feature`  | Fitur baru                | `feature/123-login-page`     |
| `bugfix`   | Perbaikan bug             | `bugfix/321-fix-navbar`      |
| `hotfix`   | Patch darurat (prod)      | `hotfix/911-critical-error`  |
| `refactor` | Perbaikan struktur kode   | `refactor/202-clean-auth`    |
| `docs`     | Dokumentasi               | `docs/update-readme`         |
| `chore`    | Tugas rutin (build, deps) | `chore/upgrade-dependencies` |
| `test`     | Unit test / integrasi     | `test/add-login-tests`       |

---

# 🧠 Conventional Commits (Format Commit)

```txt
<type>(<scope>): <deskripsi singkat>

Contoh:
feat(auth): tambahkan login dengan Google
fix(form): perbaiki validasi email kosong
refactor(auth): pisahkan middleware auth
docs(readme): perbarui petunjuk instalasi
```

---

# 🧼 Branch Cleanup

```bash
git branch -d nama-branch                # Hapus branch lokal
git push origin --delete nama-branch    # Hapus branch di remote
```

---

# 🧰 Lainnya

### Undo changes

```bash
git restore file.js              # Batalin perubahan lokal
git reset HEAD~1                # Undo 1 commit terakhir (local)
git revert <hash>               # Buat commit baru yang membatalkan perubahan
```

### Cek commit log

```bash
git log --oneline --graph --all
```

### Fetch semua + prune

```bash
git fetch --all --prune
```

---

# 🛠️ Tools Tambahan Disarankan

| Tool                 | Fungsi                                              |
| -------------------- | --------------------------------------------------- |
| **Husky**            | Hook Git (cek commit format, tes sebelum push, dll) |
| **Commitlint**       | Validasi format commit (Conventional Commits)       |
| **Semantic-release** | Rilis otomatis berdasarkan commit                   |
| **GitHub CLI**       | `gh pr create`, `gh pr merge`, dll.                 |

---

Kalau kamu mau, aku bisa kirim versi PDF / markdown / Notion dari cheatsheet ini. Atau mau aku bantu setup proyek Git kamu agar semua otomatis (template `.gitmessage`, `husky`, CI/CD, dll)?
