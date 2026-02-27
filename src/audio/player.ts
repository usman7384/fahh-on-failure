import * as path from "node:path";
import * as fs from "node:fs";
import { execFile } from "node:child_process";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const playerFactory = require("play-sound");

export class AudioPlayer {
  private readonly soundPath: string;
  private readonly player: ReturnType<typeof playerFactory>;
  private isPlaying = false;
  private errorLogged = false;
  public outputChannel?: { appendLine(value: string): void };

  constructor(extensionPath: string) {
    this.soundPath = path.join(extensionPath, "media", "FAHH.wav");
    this.player = playerFactory({});
  }

  private log(msg: string): void {
    this.outputChannel?.appendLine(msg);
  }

  private playWindowsSound(): Promise<void> {
    // Use a hidden PowerShell process to play the wav via .NET without
    // triggering Windows' file association UI (e.g., Windows Media Player).
    const escapedPath = this.soundPath.replace(/'/g, "''");
    const script = [
      "$ErrorActionPreference = 'Stop'",
      `$p = '${escapedPath}'`,
      "$sp = New-Object System.Media.SoundPlayer $p",
      "$sp.Load()",
      "$sp.PlaySync()",
    ].join("; ");

    const encoded = Buffer.from(script, "utf16le").toString("base64");

    return new Promise<void>((resolve, reject) => {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-EncodedCommand",
          encoded,
        ],
        { windowsHide: true },
        (err: Error | null) => (err ? reject(err) : resolve()),
      );
    });
  }

  async playFahh(volume: number): Promise<void> {
    if (this.isPlaying) return;
    if (!fs.existsSync(this.soundPath)) {
      this.log(`[Fahh] Sound file not found: ${this.soundPath}`);
      return;
    }

    this.isPlaying = true;
    try {
      if (process.platform === "win32") {
        await this.playWindowsSound();
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const opts: Record<string, string[]> = {
          afplay: ["-v", String(Math.max(0, Math.min(1, volume)))],
        };
        this.player.play(this.soundPath, opts, (err: Error | null) =>
          err ? reject(err) : resolve(),
        );
      });
    } catch (err) {
      if (!this.errorLogged) {
        console.warn("[Fahh] Audio playback failed:", err);
        this.errorLogged = true;
      }
    } finally {
      this.isPlaying = false;
    }
  }
}

export function createAudioPlayer(extensionPath: string): AudioPlayer {
  return new AudioPlayer(extensionPath);
}
