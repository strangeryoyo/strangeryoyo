
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Procedural sound generators
export const createEngineSynth = (ctx: AudioContext) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = 'sawtooth';
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.value = 0;
  oscillator.start();

  return {
    update: (speed: number, isPlaying: boolean) => {
      if (!isPlaying) {
        gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        return;
      }
      const frequency = 40 + (speed * 2);
      oscillator.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.1);
      gainNode.gain.setTargetAtTime(0.05 + (speed / 100), ctx.currentTime, 0.1);
      filter.frequency.setTargetAtTime(200 + (speed * 10), ctx.currentTime, 0.1);
    },
    stop: () => oscillator.stop()
  };
};

export const playCollisionSound = (ctx: AudioContext) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};
