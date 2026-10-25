// Programmatic Web Audio API Sound Synthesizer for high-quality, distinctive order notification sounds
class AudioSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  private resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error('AudioContext resume failed:', e));
    }
  }

  public playChime(notes: number[], type: OscillatorType = 'sine', duration = 0.3, volume = 0.08, delayStep = 0.12) {
    try {
      this.resume();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(volume, now);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, now + (notes.length * delayStep) + duration);
      mainGain.connect(this.ctx.destination);

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteStart = now + idx * delayStep;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, noteStart);
        
        // Attack/decay envelope
        gainNode.gain.setValueAtTime(0, noteStart);
        gainNode.gain.linearRampToValueAtTime(1, noteStart + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
        
        osc.connect(gainNode);
        gainNode.connect(mainGain);
        
        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.05);
      });
    } catch (e) {
      console.warn('Could not play synthesized sound:', e);
    }
  }
}

const synth = new AudioSynth();

// Toggle utility to verify if sound notification is enabled (default true)
export const isSoundEnabled = (): boolean => {
  return localStorage.getItem('sound_notifications_enabled') !== 'false';
};

export const setSoundEnabled = (enabled: boolean) => {
  localStorage.setItem('sound_notifications_enabled', enabled ? 'true' : 'false');
};

// 1. Order Placed Sound (Friendly, rising chime)
export const playOrderPlacedSound = () => {
  if (!isSoundEnabled()) return;
  synth.playChime([392, 523.25, 659.25], 'triangle', 0.25, 0.08, 0.1);
};

// 2. Order Approved Sound (Bright, reward chord)
export const playOrderApprovedSound = () => {
  if (!isSoundEnabled()) return;
  synth.playChime([523.25, 659.25, 783.99, 1046.5], 'sine', 0.35, 0.07, 0.08);
};

// 3. Order Rejected Sound (Soft, low-toned descending warning)
export const playOrderRejectedSound = () => {
  if (!isSoundEnabled()) return;
  synth.playChime([349.23, 293.66, 220], 'triangle', 0.4, 0.06, 0.15);
};

// 4. Admin New Order Incoming Alert (Unique double chime)
export const playAdminIncomingOrderSound = () => {
  if (!isSoundEnabled()) return;
  synth.playChime([587.33, 880, 1174.66], 'sine', 0.3, 0.09, 0.09);
};

// 5. Success General Sound
export const playSuccessSound = () => {
  if (!isSoundEnabled()) return;
  synth.playChime([523.25, 783.99], 'sine', 0.2, 0.05, 0.1);
};
