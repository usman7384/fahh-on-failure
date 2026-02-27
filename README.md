# 🔊 Fahh on Failure

> Your code fails. You hear *fahh*. That's it. That's the extension.

Plays the viral **"fahh"** meme sound whenever a terminal command fails in VS Code.  
Python traceback? *Fahh.* Node crash? *Fahh.* `npm ERR`? ***Fahh.***

Fully offline. Zero telemetry. Pure auditory suffering.

## Install

**From VSIX:**

```bash
npm install && npm run compile
npx vsce package
code --install-extension fahh-on-failure-1.0.0.vsix
```

**From Marketplace:** Coming soon™

## Settings

| Setting | Default | Description |
|---|---|---|
| `fahh.enabled` | `true` | Master on/off switch |
| `fahh.cooldownMs` | `3000` | Min ms between sounds (prevents spam) |
| `fahh.volume` | `0.6` | Volume 0.0–1.0 (macOS only) |
| `fahh.sensitivity` | `"balanced"` | `strict` · `balanced` · `chaos` |

**Sensitivity modes:**

- **strict** — non-zero exit codes only
- **balanced** — exit codes + known error patterns (Python, Node, Rust, Java, npm, etc.)
- **chaos** — any "error" text or red ANSI output. You asked for it.

## Platform Notes

| Platform | Audio | Volume Control |
|---|---|---|
| macOS | `afplay` (built-in) | ✅ |
| Linux | `aplay` / `paplay` / `mpg123` | ❌ |
| Windows | PowerShell `SoundPlayer` | ❌ |

On Windows, audio playback uses a hidden PowerShell process via .NET `System.Media.SoundPlayer` to avoid launching your default `.wav` app (e.g., Windows Media Player).

Linux may need: `sudo apt install alsa-utils`

## Try It

```bash
bash -c "exit 1"
python3 -c "raise Exception('boom')"
node -e "throw new Error('nope')"
```

## Good to Know

- Requires VS Code **shell integration** (on by default for bash/zsh/PowerShell/fish)
- Click the 🔊 status bar icon to mute/unmute
- Sound file lives at `media/FAHH.wav` — swap it with your own if you want

## License

MIT

---

*Made with frustration and a microphone.* 🎤
