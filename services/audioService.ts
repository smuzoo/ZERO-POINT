
class AudioService {
  private volume: number = 0.5;
  private ambience: HTMLAudioElement | null = null;
  private sfx: Record<string, HTMLAudioElement> = {};

  constructor() {
    // These are placeholders. User can replace the URLs with real file paths.
    if (typeof window !== 'undefined') {
      this.ambience = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
      this.ambience.loop = true;
      
      this.sfx = {
        click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
        move: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
        capture: new Audio('https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'),
        warning: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
        death: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
      };
    }
  }

  setVolume(val: number) {
    this.volume = val;
    if (this.ambience) this.ambience.volume = val * 0.4;
    Object.values(this.sfx).forEach(s => s.volume = val);
  }

  startMusic() {
    if (this.ambience) {
      this.ambience.play().catch(() => console.log("Audio play blocked by browser"));
    }
  }

  stopMusic() {
    if (this.ambience) this.ambience.pause();
  }

  play(key: string) {
    if (this.sfx[key]) {
      this.sfx[key].currentTime = 0;
      this.sfx[key].play().catch(() => {});
    }
  }
}

export const audio = new AudioService();
