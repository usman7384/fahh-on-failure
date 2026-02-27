import * as vscode from "vscode";

export type Sensitivity = "strict" | "balanced" | "chaos";

export interface FahhConfig {
  enabled: boolean;
  cooldownMs: number;
  volume: number;
  sensitivity: Sensitivity;
}

export function getConfig(): FahhConfig {
  const cfg = vscode.workspace.getConfiguration("fahh");
  return {
    enabled: cfg.get<boolean>("enabled", true),
    cooldownMs: cfg.get<number>("cooldownMs", 3000),
    volume: cfg.get<number>("volume", 0.6),
    sensitivity: cfg.get<Sensitivity>("sensitivity", "balanced"),
  };
}
