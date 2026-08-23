// 8-Bit Retro Sound Synthesizer & Spatial Ambient Audio Engine using Web Audio API
export type AmbientBiome = 'desert' | 'heatwave' | 'sandstorm' | 'toxic_mire' | 'nightmare_spirits' | 'highway_peace';
export type AmbientTimePhase = 'dawn' | 'day' | 'dusk' | 'night';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;

  // Dynamic Ambient Soundscape nodes
  private ambientGainMaster: GainNode | null = null;
  private ambientDayGain: GainNode | null = null;
  private ambientNightGain: GainNode | null = null;
  private ambientHazardGain: GainNode | null = null;
  private isAmbientRunning: boolean = false;
  private currentPhase: AmbientTimePhase = 'day';
  private currentBiome: AmbientBiome = 'desert';
  private activeHazard: string | null = null;

  // Active looping sound sources
  private ambientSources: AudioNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.ambientGainMaster) {
      const targetGain = muted ? 0 : 0.09;
      this.ambientGainMaster.gain.setValueAtTime(this.ambientGainMaster.gain.value, this.ctx.currentTime);
      this.ambientGainMaster.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, this.ctx.currentTime);
      this.musicGainNode.gain.linearRampToValueAtTime(muted ? 0 : 0.08, this.ctx.currentTime + 0.3);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // ==========================================
  // SPATIAL 2D AUDIO HOOK
  // Positional sound with distance falloff & stereo panning
  // ==========================================
  public playSpatialSound(
    type:
      | 'beast_growl'
      | 'beast_roar'
      | 'station_beacon'
      | 'chest_sparkle'
      | 'bandit_gunshot'
      | 'wind_howl'
      | 'hazard_siren'
      | 'engine_whoosh',
    sourceX: number,
    sourceY: number,
    listenerX: number,
    listenerY: number,
    maxDistance: number = 800
  ) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const dx = sourceX - listenerX;
    const dy = sourceY - listenerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) return;

    // Attenuation: smooth quadratic falloff
    const normalizedDist = distance / maxDistance;
    const volume = Math.max(0, (1 - normalizedDist) * (1 - normalizedDist));
    if (volume < 0.01) return;

    // Pan: -1 (full left) to +1 (full right)
    const pan = Math.max(-1, Math.min(1, dx / (maxDistance * 0.45)));

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.28, now);

    // Create Stereo Panning
    let panNode: AudioNode = gainNode;
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, now);
      gainNode.connect(panner);
      panNode = panner;
    }
    panNode.connect(this.ctx.destination);

    switch (type) {
      case 'beast_growl': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'beast_roar': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.45);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }
      case 'station_beacon': {
        const notes = [587.33, 880.0, 1174.66]; // D5, A5, D6
        notes.forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          noteGain.gain.setValueAtTime(0.3, now + i * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.3);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.3);
        });
        break;
      }
      case 'chest_sparkle': {
        [659.25, 987.77, 1318.51].forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.06);
          noteGain.gain.setValueAtTime(0.2, now + i * 0.06);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.2);
        });
        break;
      }
      case 'bandit_gunshot': {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case 'wind_howl': {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260 + (pan + 1) * 40, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'hazard_siren': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.15);
        osc.frequency.linearRampToValueAtTime(600, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'engine_whoosh': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }

  // ==========================================
  // DYNAMIC AMBIENT SOUNDSCAPES & CROSSFADE
  // Day / Night / Biomes / Hazard Zone Transitions
  // ==========================================
  public setAmbientEnvironment(
    phase: AmbientTimePhase,
    stageId: string,
    activeHazardType?: string | null
  ) {
    this.currentPhase = phase;
    this.activeHazard = activeHazardType || null;

    if (stageId.includes('extreme_heat')) this.currentBiome = 'heatwave';
    else if (stageId.includes('nightmare')) this.currentBiome = 'nightmare_spirits';
    else if (activeHazardType === 'sandstorm') this.currentBiome = 'sandstorm';
    else if (activeHazardType === 'toxic_mire') this.currentBiome = 'toxic_mire';
    else this.currentBiome = 'desert';

    if (!this.isAmbientRunning) {
      this.startAmbientGenerators();
    } else {
      this.updateAmbientMix();
    }
  }

  private startAmbientGenerators() {
    this.initContext();
    if (!this.ctx || this.isAmbientRunning) return;
    this.isAmbientRunning = true;

    const now = this.ctx.currentTime;

    // Master ambient gain
    this.ambientGainMaster = this.ctx.createGain();
    this.ambientGainMaster.gain.setValueAtTime(this.isMuted ? 0 : 0.08, now);
    this.ambientGainMaster.connect(this.ctx.destination);

    // 1. Day Layer: Warm highway asphalt hum + airy desert breeze
    this.ambientDayGain = this.ctx.createGain();
    this.ambientDayGain.gain.setValueAtTime(0.05, now);
    this.ambientDayGain.connect(this.ambientGainMaster);

    const dayDrone = this.ctx.createOscillator();
    dayDrone.type = 'triangle';
    dayDrone.frequency.setValueAtTime(110, now); // A2 warm drone
    dayDrone.connect(this.ambientDayGain);
    dayDrone.start();
    this.ambientSources.push(dayDrone);

    // 2. Night Layer: Eerie deep sub drone + cricket harmonics
    this.ambientNightGain = this.ctx.createGain();
    this.ambientNightGain.gain.setValueAtTime(0.001, now);
    this.ambientNightGain.connect(this.ambientGainMaster);

    const nightSub = this.ctx.createOscillator();
    nightSub.type = 'sine';
    nightSub.frequency.setValueAtTime(55, now); // Deep A1 sub bass
    nightSub.connect(this.ambientNightGain);
    nightSub.start();
    this.ambientSources.push(nightSub);

    // 3. Hazard/Weather Layer: Filtered wind & environmental resonance
    this.ambientHazardGain = this.ctx.createGain();
    this.ambientHazardGain.gain.setValueAtTime(0.001, now);
    this.ambientHazardGain.connect(this.ambientGainMaster);

    const hazardOsc = this.ctx.createOscillator();
    hazardOsc.type = 'sawtooth';
    hazardOsc.frequency.setValueAtTime(130, now);

    const hazardFilter = this.ctx.createBiquadFilter();
    hazardFilter.type = 'bandpass';
    hazardFilter.frequency.setValueAtTime(400, now);
    hazardFilter.Q.setValueAtTime(3.0, now);

    hazardOsc.connect(hazardFilter);
    hazardFilter.connect(this.ambientHazardGain);
    hazardOsc.start();
    this.ambientSources.push(hazardOsc);

    this.updateAmbientMix();
  }

  private updateAmbientMix() {
    if (!this.ctx || !this.ambientDayGain || !this.ambientNightGain || !this.ambientHazardGain) return;
    const now = this.ctx.currentTime;
    const rampTime = 1.8; // Smooth 1.8s crossfade between stages/time

    // Calculate Day vs Night gain
    let targetDay = 0.01;
    let targetNight = 0.01;

    if (this.currentPhase === 'day') {
      targetDay = 0.06;
      targetNight = 0.001;
    } else if (this.currentPhase === 'night') {
      targetDay = 0.001;
      targetNight = 0.06;
    } else if (this.currentPhase === 'dawn') {
      targetDay = 0.04;
      targetNight = 0.02;
    } else if (this.currentPhase === 'dusk') {
      targetDay = 0.02;
      targetNight = 0.04;
    }

    // Calculate Hazard gain
    let targetHazard = 0.001;
    if (this.activeHazard || this.currentBiome !== 'desert') {
      targetHazard = 0.05;
    }

    this.ambientDayGain.gain.setValueAtTime(this.ambientDayGain.gain.value, now);
    this.ambientDayGain.gain.linearRampToValueAtTime(targetDay, now + rampTime);

    this.ambientNightGain.gain.setValueAtTime(this.ambientNightGain.gain.value, now);
    this.ambientNightGain.gain.linearRampToValueAtTime(targetNight, now + rampTime);

    this.ambientHazardGain.gain.setValueAtTime(this.ambientHazardGain.gain.value, now);
    this.ambientHazardGain.gain.linearRampToValueAtTime(targetHazard, now + rampTime);
  }

  // ==========================================
  // EVENT STINGERS & SPECIAL SOUND EFFECTS
  // ==========================================

  // Play Random Highway Encounter Stinger
  public playEncounterStinger(category: string = 'traveler') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords: Record<string, number[]> = {
      traveler: [392.0, 493.88, 587.33, 783.99], // G Major Warm Hopeful
      cache: [440.0, 554.37, 659.25, 880.0], // A Major Discovery
      bandits: [220.0, 261.63, 311.13, 440.0], // Diminished Danger Chord
      anomaly: [329.63, 415.3, 493.88, 659.25], // Mystic E Major
      oasis: [349.23, 440.0, 523.25, 698.46], // F Major Pure Serene
    };

    const notes = chords[category] || chords.traveler;
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = category === 'bandits' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }

  // Play Skill Unlock / Tech Upgrade Fanfare
  public playSkillUnlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 to G6 Cyber sweep
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.16, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.25);
    });
  }

  // Play UI Click
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Play Crafting Anvil Hammer (Keng keng!)
  public playCraftAnvil() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.12, 0.24].forEach((delay, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = idx === 2 ? 1200 : 800 + idx * 150;
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(200, now + delay + 0.1);

      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  // Play Craft Progress Tick / Speedup
  public playCraftTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Play 10-Craft Crit "10 Phát Nhập Hồn" Epic Fanfare!
  public playCritFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.2, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        now + i * 0.09 + (i === notes.length - 1 ? 0.4 : 0.08)
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + (i === notes.length - 1 ? 0.4 : 0.08));
    });
  }

  // Play Gunshot (Desert Eagle / Súng lục Rực Rỡ)
  public playGunshot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.linearRampToValueAtTime(80, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.2);
  }

  // Play Melee Blade Slash (Dao găm / Đao Đường)
  public playSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Play Chest Open / Loot Shimmer
  public playLootChest() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    arpeggio.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  // Play Beast Roar / Hit
  public playMonsterHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Play Pet Dog Bark (Chó Vàng sủa)
  public playDogBark() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Play Engine Rev
  public playEngineRev() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Play Hazard Alert Beep
  public playAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.15].forEach((delay) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now + delay);
      osc.frequency.exponentialRampToValueAtTime(440, now + delay + 0.1);

      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  public musicMode: 'safe' | 'driving' | 'combat' | 'night' | 'station' = 'safe';

  // Set context-aware music mode (combat, night, driving, safe, station)
  public setMusicContext(mode: 'safe' | 'driving' | 'combat' | 'night' | 'station') {
    if (this.musicMode === mode) return;
    this.musicMode = mode;
    if (this.isBgmPlaying) {
      // Re-trigger with new timing / progression
      this.restartBgmInterval();
    }
  }

  public getMusicContext(): 'safe' | 'driving' | 'combat' | 'night' | 'station' {
    return this.musicMode;
  }

  // Toggle or start background synth music with context awareness
  public toggleBgm(play: boolean) {
    if (!play) {
      if (this.bgmInterval) {
        window.clearInterval(this.bgmInterval);
        this.bgmInterval = null;
      }
      this.isBgmPlaying = false;
      return;
    }

    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.restartBgmInterval();
  }

  private restartBgmInterval() {
    if (this.bgmInterval) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (!this.isBgmPlaying || !this.ctx) return;

    let step = 0;
    const tickInterval = this.musicMode === 'combat' ? 450 : this.musicMode === 'driving' ? 700 : this.musicMode === 'night' ? 1800 : 1200;

    const playContextStep = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.musicMode === 'combat') {
        // High-tempo combat theme (D Minor Aggressive Tension)
        const combatNotes = [146.83, 174.61, 220.0, 293.66, 349.23, 440.0]; // D, F, A, D, F, A
        const baseFreq = combatNotes[step % combatNotes.length];
        step++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq * 0.5, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, now + 0.35);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);

        // Percussive synth kick
        if (step % 2 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(120, now);
          kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
          kickGain.gain.setValueAtTime(0.06, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          kickOsc.connect(kickGain);
          kickGain.connect(this.ctx.destination);
          kickOsc.start(now);
          kickOsc.stop(now + 0.12);
        }
      } else if (this.musicMode === 'driving') {
        // Driving Synthwave pulse (Upbeat Highway Rush)
        const drivingChords = [
          [220.0, 277.18, 329.63], // A Major
          [196.0, 246.94, 293.66], // G Major
          [174.61, 220.0, 261.63], // F Major
          [164.81, 207.65, 246.94], // E Major
        ];
        const chord = drivingChords[step % drivingChords.length];
        step++;

        chord.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 0.5, now + i * 0.08);

          gain.gain.setValueAtTime(0.03, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.003, now + i * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.6);
        });
      } else if (this.musicMode === 'night') {
        // Eerie Mysterious Night Ambience (Dissonant minor pads)
        const nightChords = [
          [110.0, 130.81, 155.56], // A minor b5
          [98.0, 123.47, 146.83], // G minor
          [87.31, 110.0, 130.81], // F dim
        ];
        const chord = nightChords[step % nightChords.length];
        step++;

        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.002, now + 1.7);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.7);
        });
      } else if (this.musicMode === 'station') {
        // Serene acoustic / peaceful shelter music
        const stationChords = [
          [261.63, 329.63, 392.0, 523.25], // C Major 7
          [293.66, 369.99, 440.0, 587.33], // D Major
          [246.94, 329.63, 392.0, 493.88], // E Minor 7
        ];
        const chord = stationChords[step % stationChords.length];
        step++;

        chord.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 0.5, now + idx * 0.12);

          gain.gain.setValueAtTime(0.025, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.12 + 1.1);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.1);
        });
      } else {
        // Default safe cruising chord progression
        const chords = [
          [261.63, 329.63, 392.0], // C
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
          [196.0, 246.94, 293.66], // G
        ];
        const chord = chords[step % chords.length];
        step++;

        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 0.5, now);

          gain.gain.setValueAtTime(0.025, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 1.1);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.1);
        });
      }
    };

    playContextStep();
    this.bgmInterval = window.setInterval(playContextStep, tickInterval);
  }

  // ==========================================
  // RADIO SOUND EFFECTS & MORSE CODE
  // ==========================================

  // Play Radio Frequency Dial Tuning Click
  public playRadioTune() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Play Radio Static White-Noise Burst
  public playRadioStatic() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(2.0, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Play Radio Broadcast Chime Announcement
  public playRadioChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const tones = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    tones.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  // Play Morse Code Beacon Bleeps
  public playMorseCode() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const pattern = [0.05, 0.05, 0.15, 0.05, 0.15]; // Short, short, long, short, long
    let curTime = now;

    pattern.forEach((duration) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, curTime);

      gain.gain.setValueAtTime(0.09, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + duration);

      curTime += duration + 0.06;
    });
  }

  // Play Level Up Fanfare
  public playLevelUp() {
    this.playPetLevelUp();
  }

  // Play Success chime
  public playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  // Play Error / Denied Buzz
  public playError() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.18);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Play Pet Level Up Fanfare
  public playPetLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [392.0, 493.88, 587.33, 783.99, 987.77]; // G Major Happy Arpeggio
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  }

  // Play Equip Weapon / Armor Sound
  public playEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Play Drink / Eat / Heal Consumable Sound
  public playDrinkHeal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Play Vehicle Crash / Ramming Beast Impact
  public playCrash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundEngine = new SoundEngine();
