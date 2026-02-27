import * as vscode from "vscode";
import { detectError } from "./errorDetector.js";
import { getConfig, type FahhConfig } from "../config/settings.js";
import { CooldownGuard } from "../utils/debounce.js";
import { AudioPlayer } from "../audio/player.js";

const MAX_BUFFER = 4096;

export class TerminalWatcher {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly buffers = new Map<vscode.TerminalShellExecution, string>();
  private readonly cooldown: CooldownGuard;
  private readonly audioPlayer: AudioPlayer;
  private readonly out: vscode.OutputChannel;

  constructor(
    cooldown: CooldownGuard,
    audioPlayer: AudioPlayer,
    outputChannel: vscode.OutputChannel,
  ) {
    this.cooldown = cooldown;
    this.audioPlayer = audioPlayer;
    this.out = outputChannel;

    this.disposables.push(
      vscode.window.onDidStartTerminalShellExecution((e) =>
        this.onStart(e),
      ),
      vscode.window.onDidEndTerminalShellExecution((e) =>
        this.onEnd(e),
      ),
    );
  }

  private onStart(event: vscode.TerminalShellExecutionStartEvent): void {
    try {
      this.buffers.set(event.execution, "");
      this.readStream(event.execution);
    } catch (err) {
      console.error("[Fahh]", err);
    }
  }

  private async readStream(exec: vscode.TerminalShellExecution): Promise<void> {
    try {
      for await (const chunk of exec.read()) {
        let buf = this.buffers.get(exec);
        if (buf === undefined) break;
        buf += chunk;
        if (buf.length > MAX_BUFFER) buf = buf.slice(-MAX_BUFFER);
        this.buffers.set(exec, buf);
      }
    } catch {
      // Stream closed — expected on rapid terminal reuse.
    }
  }

  private onEnd(event: vscode.TerminalShellExecutionEndEvent): void {
    try {
      const { execution, exitCode } = event;
      const buffer = this.buffers.get(execution) ?? "";
      this.buffers.delete(execution);

      const config: FahhConfig = getConfig();
      if (!config.enabled) return;

      const failed = exitCode !== undefined && exitCode !== 0;
      const triggered =
        failed || detectError(buffer, config.sensitivity);

      if (!triggered || !this.cooldown.canFire()) return;

      const cmd = execution.commandLine?.value ?? "?";
      this.out.appendLine(
        `[Fahh] exit=${exitCode ?? "?"} cmd="${cmd.slice(0, 80)}"`,
      );
      void this.audioPlayer.playFahh(config.volume);
    } catch (err) {
      console.error("[Fahh]", err);
    }
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables.length = 0;
    this.buffers.clear();
  }
}
