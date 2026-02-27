import type { Sensitivity } from "../config/settings.js";

const ANSI_RE = /\x1B\[[0-9;]*[A-Za-z]|\x1B\][^\x07]*\x07/g;

function stripAnsi(text: string): string {
  return text.replace(ANSI_RE, "");
}

const BALANCED_PATTERNS: string[] = [
  "Error:",
  "Exception:",
  "Traceback \\(most recent call last\\):",
  "panic:",
  "Segmentation fault",
  "SIGSEGV",
  "UnhandledPromiseRejection",
  "npm ERR!",
  "yarn error",
  "Command failed with exit code",
  "Build failed",
  "FAILED",
  "ModuleNotFoundError",
  "ImportError",
  "SyntaxError",
  "NameError",
  "at Object\\.<anonymous>",
  "node:internal",
  "ERR_MODULE_NOT_FOUND",
  "thread '.*' panicked at",
  "at .*\\(.*\\.java:\\d+\\)",
];

const BALANCED_RE = new RegExp(BALANCED_PATTERNS.join("|"));
const CHAOS_WORD_RE = /error/i;
const RED_ANSI_RE = /\x1B\[(31|91)m/;

export function detectError(output: string, sensitivity: Sensitivity): boolean {
  switch (sensitivity) {
    case "strict":
      return false;
    case "balanced":
      return BALANCED_RE.test(stripAnsi(output));
    case "chaos":
      return RED_ANSI_RE.test(output) || CHAOS_WORD_RE.test(stripAnsi(output));
    default:
      return false;
  }
}
