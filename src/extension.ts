import * as vscode from "vscode";
import { getConfig } from "./config/settings.js";
import { CooldownGuard } from "./utils/debounce.js";
import { createAudioPlayer } from "./audio/player.js";
import { TerminalWatcher } from "./terminal/terminalWatcher.js";

let terminalWatcher: TerminalWatcher | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel("Fahh on Failure");
  const config = getConfig();
  const cooldown = new CooldownGuard(config.cooldownMs);

  const audioPlayer = createAudioPlayer(context.extensionPath);
  audioPlayer.outputChannel = outputChannel;

  terminalWatcher = new TerminalWatcher(cooldown, audioPlayer, outputChannel);

  const statusBar = vscode.window.createStatusBarItem(
    "fahh.statusBar",
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBar.command = "fahh.toggleMute";
  updateStatusBar(statusBar, config.enabled);
  statusBar.show();

  const toggleCmd = vscode.commands.registerCommand(
    "fahh.toggleMute",
    async () => {
      const next = !getConfig().enabled;
      await vscode.workspace
        .getConfiguration("fahh")
        .update("enabled", next, vscode.ConfigurationTarget.Global);
      updateStatusBar(statusBar, next);
    },
  );

  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (!e.affectsConfiguration("fahh")) return;
    const updated = getConfig();
    cooldown.updateCooldown(updated.cooldownMs);
    updateStatusBar(statusBar, updated.enabled);
  });

  context.subscriptions.push(
    outputChannel,
    statusBar,
    toggleCmd,
    configListener,
    { dispose: () => terminalWatcher?.dispose() },
  );

  outputChannel.appendLine(
    `[Fahh] Ready — sensitivity=${config.sensitivity}, cooldown=${config.cooldownMs}ms`,
  );
}

export function deactivate(): void {}

function updateStatusBar(item: vscode.StatusBarItem, enabled: boolean): void {
  item.text = enabled ? "$(unmute) Fahh" : "$(mute) Fahh";
  item.tooltip = enabled
    ? "Fahh on Failure is ON — click to mute"
    : "Fahh on Failure is OFF — click to unmute";
}
