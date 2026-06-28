import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioAlertService {
  private audioContext: AudioContext | null = null;

  /**
   * Lazily creates (or resumes) an AudioContext.
   * Browser autoplay policy requires a user gesture before audio can play,
   * so we create/resume the context on first call triggered by user interaction.
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as Record<string, unknown> as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  /**
   * Plays a short beep sound using the Web Audio API.
   * @param frequency Frequency in Hz (default 440).
   * @param durationMs Duration in milliseconds (default 500).
   */
  playBeep(frequency = 440, durationMs = 500): void {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Silently fail if Web Audio API is unavailable
    }
  }
}
