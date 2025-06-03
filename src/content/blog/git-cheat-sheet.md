
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
