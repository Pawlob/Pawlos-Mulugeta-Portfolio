class SoundService {
  private isMuted: boolean = true;

  constructor() {}

  toggleMute(): boolean {
    return true;
  }

  getMuteState(): boolean {
    return true;
  }

  playHover() {
    // No-op: Sound effects removed
  }

  playTap() {
    // No-op: Sound effects removed
  }

  playSuccess() {
    // No-op: Sound effects removed
  }
}

export const soundService = new SoundService();
