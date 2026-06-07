import type { PlayerRole } from "./truco/types";

class AudioManager {
  private static instance: AudioManager;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private currentTheme: HTMLAudioElement | null = null;
  private isThemeActive: boolean = false;
  private volume: number = 0.6;
  private hasInteracted: boolean = false;
  private pendingPlay: boolean = false;

  private soundMap: Record<string, string> = {
    'theme': '/audios/the-official-fifa-world-cup-26-theme.mp3',
    'countdown-1': '/audios/arrancando-en-1.mp3',
    'countdown-2': '/audios/arrancando-en-2.mp3',
    'countdown-3': '/audios/arrancando-en-3.mp3',
    'cpu-envido': '/audios/cpu-envido.mp3',
    'cpu-no-quiero': '/audios/cpu-no-quiero.mp3',
    'cpu-falta-envido': '/audios/cpu-falta-envido.mp3',
    'cpu-re-truco': '/audios/cpu-quiero-re-truco.mp3',
    'cpu-real-envido': '/audios/cpu-quiero-real-envido.mp3',
    'cpu-vale-cuatro': '/audios/cpu-quiero-vale-cuatro.mp3',
    'cpu-quiero-falta-envido': '/audios/cpu-quiero-falta-envido.mp3',
    'cpu-quiero-re-truco': '/audios/cpu-quiero-re-truco.mp3',
    'cpu-quiero-real-envido': '/audios/cpu-quiero-real-envido.mp3',
    'cpu-quiero-vale-cuatro': '/audios/cpu-quiero-vale-cuatro.mp3',
    'cpu-quiero': '/audios/cpu-quiero.mp3',
    'cpu-truco': '/audios/cpu-truco.mp3',
    'player-al-mazo': '/audios/player-al-mazo.mp3',
    'player-envido': '/audios/player-envido.mp3',
    'player-falta-envido': '/audios/player-falta-envido.mp3',
    'player-re-truco': '/audios/player-quiero-re-truco.mp3',
    'player-real-envido': '/audios/player-quiero-real-envido.mp3',
    'player-vale-cuatro': '/audios/player-quiero-vale-cuatro.mp3',
    'player-no-quiero': '/audios/player-no-quiero.mp3',
    'player-quiero-falta-envido': '/audios/player-quiero-falta-envido.mp3',
    'player-quiero-re-truco': '/audios/player-quiero-re-truco.mp3',
    'player-quiero-real-envido': '/audios/player-quiero-real-envido.mp3',
    'player-quiero-vale-cuatro': '/audios/player-quiero-vale-cuatro.mp3',
    'player-quiero': '/audios/player-quiero.mp3',
    'player-truco': '/audios/player-truco.mp3',
    'cpu-el-envido-esta-primero': '/audios/cpu-el-envido-esta-primero.mp3',
    'player-el-envido-esta-primero': '/audios/player-el-envido-esta-primero.mp3',
  };

  private constructor() {

    // Handle browser autoplay restrictions
    if (typeof window !== 'undefined') {
      const handleInteraction = () => {
        this.hasInteracted = true;
        if (this.pendingPlay && this.isThemeActive && !this.isMuted) {
          const audio = this.getAudioElement('theme');
          if (audio && audio.paused) {
            audio.play().catch(e => console.warn(e));
          }
          this.pendingPlay = false;
        }
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      };

      window.addEventListener('click', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public preloadAll() {
    Object.keys(this.soundMap).forEach(key => {
      this.getAudioElement(key);
    });
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('truco-audio-muted', this.isMuted.toString());

    // Stop any currently playing audio if we just muted
    if (this.isMuted) {
      this.audioCache.forEach(audio => {
        audio.pause();
      });
    } else {
      if (this.isThemeActive) {
        this.playTheme();
      }
    }

    return this.isMuted;
  }

  public playTheme() {
    this.isThemeActive = true;
    if (this.isMuted) return;

    const audio = this.getAudioElement('theme');
    if (audio) {
      audio.loop = true;
      audio.volume = this.volume * 0.23; // Scale max volume to 30%
      this.currentTheme = audio;

      if (typeof window !== 'undefined') {
        const savedTime = sessionStorage.getItem('truco-theme-time');
        if (savedTime && audio.currentTime === 0) {
          const parsedTime = parseFloat(savedTime);
          if (!isNaN(parsedTime) && isFinite(parsedTime)) {
            audio.currentTime = parsedTime;
          }
        }
        audio.ontimeupdate = () => {
          sessionStorage.setItem('truco-theme-time', audio.currentTime.toString());
        };
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Theme auto-play prevented:", e);
          if (!this.hasInteracted) {
            this.pendingPlay = true;
          }
        });
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = vol;
    
    // Auto-sync mute state when volume hits 0
    const shouldBeMuted = vol === 0;
    if (this.isMuted !== shouldBeMuted) {
      this.isMuted = shouldBeMuted;
      if (this.isMuted) {
        this.audioCache.forEach(audio => audio.pause());
      } else if (this.isThemeActive) {
        this.playTheme();
      }
    }

    if (this.currentTheme) {
      this.currentTheme.volume = vol * 0.23; // Scale max volume to 30%
    }
    
    // Notify React components of volume change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('truco-volume-change', { detail: vol }));
    }
  }

  public getVolume() {
    return this.volume;
  }

  public stopTheme() {
    this.isThemeActive = false;
    if (this.currentTheme) {
      this.currentTheme.pause();
    }
  }

  private getAudioElement(key: string): HTMLAudioElement | null {
    if (!this.soundMap[key]) return null;

    if (!this.audioCache.has(key)) {
      const audio = new Audio(this.soundMap[key]);
      this.audioCache.set(key, audio);
    }
    return this.audioCache.get(key) || null;
  }

  public play(key: string) {
    if (this.isMuted) return;

    // Prevent overlapping countdown sounds
    if (key.startsWith('countdown-')) {
      this.audioCache.forEach((audio, cacheKey) => {
        if (cacheKey.startsWith('countdown-') && cacheKey !== key) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }

    const audio = this.getAudioElement(key);
    if (audio) {
      // If it's already playing, reset to start so it plays again immediately
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Auto-play prevented by browser:", e));
    }
  }

  public playCall(type: string, rawCaller: PlayerRole | 'rival') {
    let caller = (rawCaller === 'partner' || rawCaller === 'player') ? 'player' : 'cpu';

    // Normalize call type keys to match audio filenames
    let normalizedType = type.toLowerCase().replace(/ /g, '-');

    // Some logic mappings for variations
    if (normalizedType === 'real envido') normalizedType = 'real-envido';
    if (normalizedType === 'falta envido') normalizedType = 'falta-envido';
    if (normalizedType === 'retruco') normalizedType = 're-truco';
    if (normalizedType === 'vale cuatro') normalizedType = 'vale-cuatro';

    const key = `${caller}-${normalizedType}`;
    if (this.soundMap[key]) {
      this.play(key);
    } else {
      console.warn(`No audio found for call: ${key}`);
    }
  }

  public playResponse(wants: boolean, rawCaller: PlayerRole | 'rival') {
    let caller = (rawCaller === 'partner' || rawCaller === 'player') ? 'player' : 'cpu';
    const responseType = wants ? 'quiero' : 'no-quiero';
    const key = `${caller}-${responseType}`;
    if (this.soundMap[key]) {
      this.play(key);
    } else {
      console.warn(`No audio found for response: ${key}`);
    }
  }

  public playAlMazo(rawCaller: PlayerRole | 'rival') {
    let caller = (rawCaller === 'partner' || rawCaller === 'player') ? 'player' : 'cpu';
    const key = caller === 'cpu' ? 'cpu-me-voy-al-mazo' : 'player-al-mazo';
    if (!this.soundMap[key]) {
      this.soundMap[key] = `/audios/${key}.mp3`;
    }
    this.play(key);
  }

  public playTengo(points: number, rawCaller: PlayerRole | 'rival') {
    let caller = (rawCaller === 'partner' || rawCaller === 'player') ? 'player' : 'cpu';
    const key = `${caller}-tengo-${points}`;
    if (!this.soundMap[key]) {
      this.soundMap[key] = `/audios/${key}.mp3`;
    }
    this.play(key);
  }

  public playSonBuenas(rawCaller: PlayerRole | 'rival') {
    let caller = (rawCaller === 'partner' || rawCaller === 'player') ? 'player' : 'cpu';
    const key = `${caller}-son-buenas`;
    if (!this.soundMap[key]) {
      this.soundMap[key] = `/audios/${key}.mp3`;
    }
    this.play(key);
  }

  public playSonMejores(points: number, rawCaller: PlayerRole | 'rival') {
    let caller = (rawCaller === 'partner' || rawCaller === 'player') ? 'player' : 'cpu';

    const key = `${caller}-son-mejores-${points}`;
    if (!this.soundMap[key]) {
      this.soundMap[key] = `/audios/${key}.mp3`;
    }
    this.play(key);
  }

  public playSystemSound(key: "ganaste" | "perdiste" | "parda-la-mejor" | "proxima-ronda" | "aplausos" | "card-placement" | "ganaste-la-ronda" | "perdiste-la-ronda" | "sonido-de-carta-ganadora") {
    if (!this.soundMap[key]) {
      this.soundMap[key] = `/audios/${key}.mp3`;
    }
    this.play(key);
  }
}

export const audioManager = AudioManager.getInstance();
