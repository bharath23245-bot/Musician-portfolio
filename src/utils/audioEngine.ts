/**
 * Web Audio API Synth Engine for Maestro
 * Generates warm, evocative acoustic piano and cinematic ambient chord progressions
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private intervalId: any = null;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private currentTime = 0;
  private trackDuration = 272; // default seconds
  private volume = 0.8;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  // Frequency mapping for notes
  private noteFreq(note: string): number {
    const notes: Record<string, number> = {
      'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'F#3': 185.00, 'G#3': 207.65, 'A#3': 233.08, 'C#4': 277.18, 'D#4': 311.13, 'F#4': 369.99, 'G#4': 415.30,
      'A#4': 466.16, 'C#5': 554.37, 'D#5': 622.25, 'F#5': 739.99, 'G#5': 830.61, 'A#5': 932.33
    };
    return notes[note] || 440;
  }

  private playPianoNote(freq: number, startTime: number, duration: number, velocity: number = 0.4) {
    if (!this.ctx || !this.masterGain) return;

    // Multi-harmonic oscillator for rich warm piano timbre
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Subtle detune for natural warmth
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // octave overtone

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, startTime); // 3rd harmonic

    // Piano-like ADSR Envelope
    const attack = 0.015;
    const decay = duration * 0.7;
    const peakGain = velocity * 0.45;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(peakGain * 0.3, startTime + attack + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Warm Low-pass filter to simulate piano body resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 4, 3200), startTime);
    filter.Q.setValueAtTime(1.5, startTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);
  }

  // Continuous arpeggiated piano melody generator based on track
  private scheduleMelodyLoop(trackId: string) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Different motifs for different tracks
    let chords: string[][] = [];
    if (trackId === '1') {
      // Nocturne in D minor: Dm - Gm - A7 - Dm
      chords = [
        ['D3', 'F3', 'A3', 'D4', 'F4', 'A4'],
        ['G2', 'D3', 'G3', 'A#3', 'D4', 'G4'],
        ['A2', 'E3', 'G3', 'C#4', 'E4', 'A4'],
        ['D3', 'A3', 'D4', 'F4', 'A4', 'D5'],
      ];
    } else if (trackId === '2') {
      // Whispers in the Void: Em - Cmaj7 - G - D
      chords = [
        ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
        ['C3', 'G3', 'C4', 'E4', 'G4', 'B4'],
        ['G2', 'D3', 'G3', 'B3', 'D4', 'G4'],
        ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5'],
      ];
    } else {
      // Awakening: Am - F - C - G
      chords = [
        ['A2', 'E3', 'A3', 'C4', 'E4', 'A4'],
        ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
        ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'],
        ['G2', 'D3', 'G3', 'B3', 'D4', 'G4'],
      ];
    }

    const chordDuration = 2.4;
    chords.forEach((chord, chordIdx) => {
      const chordStart = now + chordIdx * chordDuration;
      // Bass note
      this.playPianoNote(this.noteFreq(chord[0]), chordStart, chordDuration * 1.5, 0.5);
      
      // Arpeggiate remaining notes
      chord.slice(1).forEach((note, noteIdx) => {
        const noteStart = chordStart + (noteIdx * 0.35);
        this.playPianoNote(this.noteFreq(note), noteStart, 1.8, 0.35);
      });
    });
  }

  public play(trackId: string, durationSec: number = 272, startFrom: number = 0) {
    this.initContext();
    this.isPlaying = true;
    this.currentTrackId = trackId;
    this.trackDuration = durationSec;
    this.currentTime = startFrom;

    if (this.intervalId) clearInterval(this.intervalId);

    // Trigger initial melody pattern
    this.scheduleMelodyLoop(trackId);

    // Loop periodic musical phrases
    let loopCycle = 0;
    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += 0.5;
      loopCycle += 0.5;

      if (loopCycle >= 9.6) {
        this.scheduleMelodyLoop(this.currentTrackId || '1');
        loopCycle = 0;
      }

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime, this.trackDuration);
      }

      if (this.currentTime >= this.trackDuration) {
        this.stop();
        if (this.onEndCallback) this.onEndCallback();
      }
    }, 500);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public stop() {
    this.pause();
    this.currentTime = 0;
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0, this.trackDuration);
    }
  }

  public seek(seconds: number) {
    this.currentTime = seconds;
    if (this.isPlaying && this.currentTrackId) {
      this.scheduleMelodyLoop(this.currentTrackId);
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.trackDuration);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public onTimeUpdate(cb: (time: number, duration: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndCallback = cb;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }
}

export const audioEngine = new AudioEngine();
