export class CooldownGuard {
  private cooldownMs: number;
  private lastFiredAt = 0;

  constructor(cooldownMs: number) {
    this.cooldownMs = cooldownMs;
  }

  canFire(): boolean {
    const now = Date.now();
    if (now - this.lastFiredAt < this.cooldownMs) return false;
    this.lastFiredAt = now;
    return true;
  }

  updateCooldown(ms: number): void {
    this.cooldownMs = ms;
  }
}
