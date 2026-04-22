import type Phaser from 'phaser';
import { getSession } from '../../state/gameSession';

type ToneKind = 'move' | 'confirm' | 'success' | 'error';

type ToneSpec = {
  frequency: number;
  durationSeconds: number;
  gain: number;
  type: OscillatorType;
};

const TONES: Record<ToneKind, ToneSpec> = {
  move: { frequency: 420, durationSeconds: 0.04, gain: 0.018, type: 'triangle' },
  confirm: { frequency: 520, durationSeconds: 0.07, gain: 0.024, type: 'triangle' },
  success: { frequency: 640, durationSeconds: 0.09, gain: 0.026, type: 'sine' },
  error: { frequency: 240, durationSeconds: 0.12, gain: 0.03, type: 'sawtooth' },
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextCtor = window.AudioContext
    ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  audioContext ??= new AudioContextCtor();
  return audioContext;
}

export function playUiTone(scene: Phaser.Scene, toneKind: ToneKind): void {
  if (getSession(scene).saveData.settings.muted) {
    return;
  }

  const context = getAudioContext();

  if (!context) {
    return;
  }

  const spec = TONES[toneKind];
  const startAt = context.currentTime;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = spec.type;
  oscillator.frequency.setValueAtTime(spec.frequency, startAt);
  gainNode.gain.setValueAtTime(spec.gain, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + spec.durationSeconds);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  void context.resume();
  oscillator.start(startAt);
  oscillator.stop(startAt + spec.durationSeconds);
}

