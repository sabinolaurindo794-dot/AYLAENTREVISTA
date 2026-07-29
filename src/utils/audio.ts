let audioCtx: AudioContext | null = null;

function ensureAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTone(freq = 440, dur = 0.12, type: OscillatorType = "sine", delay = 0, enabled = true) {
  if (!enabled) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.02);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export function soundNovaPergunta(enabled: boolean) {
  playTone(660, 0.10, "sine", 0, enabled);
}

export function soundEnviar(enabled: boolean) {
  playTone(320, 0.07, "square", 0, enabled);
}

export function soundFim(enabled: boolean) {
  playTone(440, 0.14, "sine", 0, enabled);
  playTone(220, 0.18, "sine", 0.15, enabled);
}

export function falarPergunta(texto: string, modoVoz: boolean) {
  if (!modoVoz || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-PT";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn("SpeechSynthesis error:", e);
  }
}
