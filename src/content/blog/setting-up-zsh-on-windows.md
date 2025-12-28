---
title: "Setting Up Zsh on Windows with Cygwin"
slug: "setting-up-zsh-on-windows"
pubDate: 2025-12-29
tags: ["windows", "zsh", "terminal", "vscode", "cygwin"]
thumbnail: "https://cdn.andka.my.id/blog/zsh-windows.png"
credit: ''
---

**Zsh** (Z shell) is a Unix shell that offers features like auto-completion, syntax highlighting, and customizable themes. While it's commonly used on Linux and macOS, you can also set it up on Windows using **Cygwin**.

This guide covers how to set up Zsh on Windows and integrate it with VS Code.

---

## Why Zsh on Windows?

Windows has come a long way with terminals, WSL exists but it runs in a separate Linux environment. Sometimes you want a Unix-like shell that works directly with your Windows filesystem without the overhead of a virtual environment.

Cygwin provides a POSIX-compatible environment that runs natively on Windows, giving you access to Unix tools including Zsh while maintaining direct access to your Windows files and programs.

---

## Prerequisites

Before we start, make sure you have:

- Windows 10 or 11
- Administrator access to install software
- VS Code installed (optional, but recommended)

---

## Step 1: Install Cygwin

1. Download the Cygwin installer from [cygwin.com](https://www.cygwin.com/)
2. Run `setup-x86_64.exe` as Administrator
3. Choose "Install from Internet"
4. Select your installation directory (default is `C:\cygwin64`)
5. Choose a mirror site close to your location
6. In the package selection screen, search for and select these packages:
   - `zsh` - The Z shell
   - `git` - Version control (useful for Oh My Zsh)
   - `curl` or `wget` - For downloading scripts
   - `nano` or `vim` - Text editors

```
💡 Tip: Click "Skip" next to each package to cycle through versions until you see the version number you want to install.
```

7. Complete the installation

---

## Step 2: Configure Zsh as Default Shell

After installation, open Cygwin Terminal and run:

```bash
# Check if zsh is installed
which zsh

# Set zsh as your default shell
chsh -s /bin/zsh
```

If `chsh` doesn't work, you can manually edit `/etc/passwd`:

```bash
nano /etc/passwd
```

Find your user line and change `/bin/bash` to `/bin/zsh`. Save and exit.

---

## Step 3: Install Oh My Zsh (Optional)

Oh My Zsh is a community-driven framework for managing Zsh configuration:

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

This will:
- Install Oh My Zsh to `~/.oh-my-zsh`
- Create a `.zshrc` configuration file
- Set a default theme (robbyrussell)

### Customize Your Theme

Edit your `.zshrc` to change themes:

```bash
nano ~/.zshrc
```

Find the `ZSH_THEME` line and change it:

```bash
ZSH_THEME="agnoster"  # Theme with git integration
# or
ZSH_THEME="powerlevel10k/powerlevel10k"  # Configurable theme
```

For Powerlevel10k, you'll need to install it first:

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

---

## Step 4: Configure VS Code

Now let's integrate Cygwin Zsh with VS Code. Open your VS Code settings (`Ctrl+,`) and click the JSON icon in the top right, or press `Ctrl+Shift+P` and search for "Preferences: Open User Settings (JSON)".

Add the following configuration:

```json
{
    "terminal.integrated.profiles.windows": {
        "Cygwin Zsh": {
            "path": "C:\\cygwin64\\bin\\zsh.exe",
            "args": ["-l"],
            "icon": "terminal-bash",
            "env": {
                "CHERE_INVOKING": "1"
            }
        }
    },
    "terminal.integrated.defaultProfile.windows": "Cygwin Zsh"
}
```

### Understanding the Configuration

| Property         | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `path`           | Points to the Zsh executable in your Cygwin installation           |
| `args: ["-l"]`   | Starts Zsh as a login shell, loading your `.zprofile` and `.zshrc` |
| `icon`           | The icon displayed in the terminal dropdown                        |
| `CHERE_INVOKING` | Tells Cygwin to start in the current directory instead of home     |

---

## Step 5: Fix Common Issues

### Issue: Terminal starts in wrong directory

Add this to your `.zshrc`:

```bash
# Start in the directory VS Code opened
if [[ -n "$CHERE_INVOKING" ]]; then
    unset CHERE_INVOKING
    cd "$PWD"
fi
```

### Issue: Colors or themes not displaying correctly

Install a Nerd Font that supports special characters:

1. Download a font from [nerdfonts.com](https://www.nerdfonts.com/) (e.g., "MesloLGS NF")
2. Install the font on Windows
3. Add to your VS Code settings:

```json
{
    "terminal.integrated.fontFamily": "MesloLGS NF"
}
```

### Issue: Windows paths with spaces

Cygwin translates Windows paths. Use `cygpath` to convert:

```bash
# Convert Windows path to Cygwin path
cygpath "C:\Program Files"
# Output: /cygdrive/c/Program Files

# Convert Cygwin path to Windows path
cygpath -w /home/username
# Output: C:\cygwin64\home\username
```

---

## Useful Plugins

Oh My Zsh comes with many plugins. Enable them in `.zshrc`:

```bash
plugins=(
    git                     # Git aliases and functions
    zsh-autosuggestions     # Fish-like autosuggestions
    zsh-syntax-highlighting # Syntax highlighting
    z                       # Jump to frequently used directories
)
```

For plugins not included by default:

```bash
# Install zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# Install zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

---

## Final `.zshrc` Example

Here's a basic configuration example:

```bash
# Path to Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"

# Theme
ZSH_THEME="agnoster"

# Plugins
plugins=(git z zsh-autosuggestions zsh-syntax-highlighting)

# Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Custom aliases
alias ll="ls -la"
alias cls="clear"
alias projects="cd /cygdrive/d/code"

# Fix for VS Code directory
if [[ -n "$CHERE_INVOKING" ]]; then
    unset CHERE_INVOKING
fi
```

---

## Conclusion

With these steps, you should have Zsh running on Windows through Cygwin, with optional Oh My Zsh configuration for themes and plugins. The VS Code integration allows you to use this shell directly in your editor.

Cygwin tools work alongside your Windows programs, so you can use both Unix and Windows commands as needed.

---

## Troubleshooting

**Q: Zsh is slow to start**
A: This is often caused by too many plugins. Comment out plugins one by one to find the culprit. You can also add cygwin folder to windows defender exclusion list.

**Q: Some commands don't work**
A: Make sure the required packages are installed via Cygwin setup. Run the installer again to add packages.

**Q: Git shows wrong line endings**
A: Configure git for Windows:
```bash
git config --global core.autocrlf input
```
