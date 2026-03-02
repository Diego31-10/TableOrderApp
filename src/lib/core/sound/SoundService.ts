import { Audio } from 'expo-av';

/**
 * Swap this URL for a local require() once you have an assets/sounds/beep.mp3:
 *   const BEEP_SOURCE = require('@/assets/sounds/beep.mp3');
 *
 * Using a remote URI here keeps the bundle lean and avoids bundling a binary asset
 * during development, while still demonstrating the expo-av integration.
 */
const BEEP_SOURCE = {
  uri: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

let soundInstance: Audio.Sound | null = null;

/**
 * Preload the beep sound so the first call is instant.
 * Call this once during app startup (e.g. in RootLayout useEffect).
 */
export async function preloadBeep(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(BEEP_SOURCE, {
      shouldPlay: false,
      volume: 0.8,
    });
    soundInstance = sound;
  } catch {
    // Graceful degradation — haptics already cover the feedback
  }
}

/**
 * Play the preloaded beep. If the sound is not ready (no network, no file),
 * this fails silently so it never disrupts the core scan flow.
 */
export async function playBeep(): Promise<void> {
  try {
    if (!soundInstance) {
      // Lazy-load on first call if preloadBeep was not called
      await preloadBeep();
    }
    await soundInstance?.setPositionAsync(0);
    await soundInstance?.playAsync();
  } catch {
    // Intentionally swallowed — haptic feedback is the primary signal
  }
}

/**
 * Release the Audio.Sound resource. Call on app unmount.
 */
export async function unloadBeep(): Promise<void> {
  try {
    await soundInstance?.unloadAsync();
    soundInstance = null;
  } catch {
    // no-op
  }
}
