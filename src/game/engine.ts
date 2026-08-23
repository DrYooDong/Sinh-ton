import {
  BeastEntity,
  ChestEntity,
  GameDifficulty,
  HazardZoneEntity,
  ItemRarity,
  PetStats,
  PlayerStats,
  RandomEncounter,
  SupplyStationEntity,
  TimeOfDayPhase,
  VehicleStats,
} from '../types';
import { soundEngine } from '../audio/soundEngine';
import { RANDOM_HIGHWAY_ENCOUNTERS } from './encounters';

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
  isCrit?: boolean;
  scale?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  type?: 'circle' | 'spark' | 'smoke' | 'rain' | 'snow' | 'shockwave' | 'spore' | 'ember' | 'laser_beam';
  rotation?: number;
  vRot?: number;
}

export interface SkidMark {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  damage: number;
  type: 'bullet' | 'stone' | 'bait';
  life: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;

  // Viewport & World
  public width: number = 800;
  public height: number = 600;
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Game Mode: 'driving' (in car) or 'onfoot' (outside car)
  public mode: 'driving' | 'onfoot' = 'driving';

  // Positions & Coordinates (Vertical Highway System: Forward = Upwards / -Y)
  public carDistance: number = 200; // Distance in pixels along highway (1m = 10px, 1km = 10,000px)
  public carX: number = 0; // Lateral lane offset (-125 to +125 px across road)
  public carY: number = -200; // World Y position (-carDistance)
  public carAngle: number = 0; // Steering tilt yaw angle (0 = straight UP)
  public carSpeed: number = 0; // Current speed in km/h

  // Compatibility getter/setters for legacy references
  public get carLaneY(): number { return this.carX; }
  public set carLaneY(v: number) { this.carX = v; }

  // Smooth Vehicle Physics & Powertrain
  public maxSpeed: number = 90; // Default max speed in km/h
  public accelerationRate: number = 42; // km/h per second acceleration
  public brakeDeceleration: number = 88; // km/h per second braking power
  public coastDeceleration: number = 14; // km/h per second natural rolling friction
  public hasFuel: boolean = true;
  public fuelEfficiency: number = 8.5; // L / 100km
  public isAccelerating: boolean = false;
  public isBraking: boolean = false;
  public nitroBoostActive: boolean = false;

  public playerDistance: number = 200;
  public playerX: number = 0;
  public playerY: number = -200;
  public playerFacing: number = 1; // 1 = right, -1 = left
  public isPlayerMoving: boolean = false;
  public walkAnimFrame: number = 0;

  // Input states
  public keys: Record<string, boolean> = {};

  // Entities on road
  public beasts: BeastEntity[] = [];
  public chests: ChestEntity[] = [];
  public stations: SupplyStationEntity[] = [];
  public hazardZones: HazardZoneEntity[] = [];
  public projectiles: Projectile[] = [];

  // Memory Pooled Effects
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public skidMarks: SkidMark[] = [];

  // Weather & Atmosphere FX
  public heatShimmerOffset: number = 0;
  public activeHazardZone: HazardZoneEntity | null = null;

  // Screen Shake FX
  public screenShakeIntensity: number = 0;
  public screenShakeDuration: number = 0;
  public screenShakeTimer: number = 0;

  // Day/Night, Weather & Difficulty
  public timeOfDayHours: number = 8.0; // 0.0 - 24.0
  public timePhase: TimeOfDayPhase = 'day';
  public dayCount: number = 1;
  public ambientTemp: number = 36;
  public isNight: boolean = false;
  public headlightsOn: boolean = true;
  public difficulty: GameDifficulty = 'normal';

  // Pet companion state inside engine
  public petActive: boolean = true;
  public petAttackCooldown: number = 0;

  // Attack timer for beasts damaging vehicle/player
  private beastAttackCooldowns: Record<string, number> = {};

  // Survival Skills Tree & Stage state
  public skills: Record<string, number> = {};
  public currentStageId: string = 'stage1_wasteland';
  public lastEncounterKm: number = 0;
  private spatialAudioTimer: number = 0;

  // Callback hooks for state changes
  public onOpenChest?: (chest: ChestEntity) => void;
  public onVisitStation?: (station: SupplyStationEntity) => void;
  public onHarvestBeast?: (beast: BeastEntity) => void;
  public onPlayerDamaged?: (dmg: number) => void;
  public onVehicleDamaged?: (dmg: number) => void;
  public onVehicleDriveTick?: (distKm: number, fuelUsed: number, currentSpeed: number) => void;
  public onTimeTick?: (hours: number, isNight: boolean, phase: TimeOfDayPhase, temp: number) => void;
  public onEncounterRoadblock?: (distKm: number) => void;
  public onEnterHazardZone?: (zone: HazardZoneEntity) => void;
  public onTriggerEncounter?: (encounter: RandomEncounter) => void;

  private lastTime: number = 0;
  private animId: number | null = null;
  public roadGenerationDistance: number = 0;

  constructor() {
    this.spawnInitialWorldEntities();
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.start();
  }

  public detach() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 600;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  private spawnInitialWorldEntities() {
    // Generate initial chests, beasts and packs along the first 150km (150,000 px)
    this.roadGenerationDistance = 150000;
    this.generateWorldSegment(0, 150000);
  }

  public generateWorldSegment(startPx: number, endPx: number) {
    // Spawn rate multiplier by difficulty
    const diffFactor = this.difficulty === 'nightmare' ? 2.2 : this.difficulty === 'hard' ? 1.6 : 1.0;
    // Chests are made sparser and fewer (every 1800 - 2800px instead of 1000px)
    const baseSpacing = (1800 / diffFactor) + Math.random() * (1200 / diffFactor);

    for (let x = startPx + 800; x < endPx; x += baseSpacing) {
      const roundedX = Math.round(x);
      const chestId = `chest_${roundedX}`;
      if (this.chests.some((c) => c.id === chestId || Math.abs(c.x - x) < 60)) {
        continue;
      }

      const laneOffset = (Math.random() - 0.5) * 260; // highway width is ~300px
      const distKm = x / 10000;

      let chestRarity: ItemRarity = 'common';
      if (distKm > 20) chestRarity = 'brilliant';
      else if (distKm > 12) chestRarity = 'epic';
      else if (distKm > 6) chestRarity = 'perfect';
      else if (distKm > 3) chestRarity = 'superior';
      else if (distKm > 1) chestRarity = 'good';

      this.chests.push({
        id: chestId,
        x,
        laneOffset,
        rarity: chestRarity,
        isOpened: false,
        items: this.generateLootForRarity(chestRarity),
      });

      // Determine beast pack size (1 to 3 beasts per cluster)
      const packSize = this.difficulty === 'nightmare' ? (Math.random() > 0.4 ? 3 : 2) : (this.difficulty === 'hard' && Math.random() > 0.5 ? 2 : 1);

      for (let p = 0; p < packSize; p++) {
        const beastOffsetX = (Math.random() - 0.5) * 90;
        const beastOffsetY = (Math.random() - 0.5) * 60;
        const beastX = x + beastOffsetX;
        const beastY = Math.max(-130, Math.min(130, laneOffset + beastOffsetY));

        const beast = this.createBeastForDistance(beastX, beastY, distKm, chestRarity, chestId);
        this.beasts.push(beast);
      }
    }

    // Additional wandering predatory packs along the road
    const packStep = 2200 / diffFactor;
    for (let x = startPx + 1500; x < endPx; x += packStep) {
      const distKm = x / 10000;
      const laneOffset = (Math.random() - 0.5) * 240;
      const isNightPack = Math.random() > 0.4;
      const beast = this.createBeastForDistance(x, laneOffset, distKm, 'superior', undefined, isNightPack);
      this.beasts.push(beast);

      if (this.difficulty !== 'normal' && Math.random() > 0.5) {
        // Add a pack partner
        const partner = this.createBeastForDistance(x + 40, laneOffset + (Math.random() - 0.5) * 40, distKm, 'good', undefined, isNightPack);
        this.beasts.push(partner);
      }
    }

    // Spawn Hazard Zones every ~6km to 9km
    const hazardTypes: { type: HazardZoneEntity['type']; name: string; icon: string; desc: string; danger: number; tempMod?: number }[] = [
      { type: 'sandstorm', name: 'Khu Vực Bão Cát Sa Mạc', icon: '🌪️', desc: 'Gió cát mù mịt cản trở tầm nhìn, ma sát thân xe!', danger: 3, tempMod: 5 },
      { type: 'bandit_ambush', name: 'Ổ Phục Kích Cướp Xa Lộ', icon: '⚔️', desc: 'Băng cướp hoang dã mai phục cản đường, vũ khí nguy hiểm!', danger: 4 },
      { type: 'heatwave', name: 'Vùng Sóng Nhiệt Cực Đoan 65°C', icon: '🌡️', desc: 'Nhiệt độ mặt đường đạt đỉnh, động cơ dễ quá nhiệt và mất nước!', danger: 4, tempMod: 18 },
      { type: 'toxic_mire', name: 'Đầm Lầy Khí Độc Biến Dị', icon: '☠️', desc: 'Khí độc ăn mòn lốp xe và làm tụt thể lực nhanh chóng!', danger: 3 },
      { type: 'predator_den', name: 'Lãnh Địa Cự Trùng & Dạ Ma', icon: '💀', desc: 'Nơi quy tụ các bầy quái vật khát máu cấp cao!', danger: 5 },
    ];

    for (let x = startPx + 35000; x < endPx; x += 38000) {
      const roundedX = Math.round(x);
      const hazardId = `hazard_${roundedX}`;
      if (this.hazardZones.some((h) => h.id === hazardId || Math.abs(h.x - x) < 2000)) {
        continue;
      }

      const hIdx = Math.floor((x / 38000) % hazardTypes.length);
      const hData = hazardTypes[hIdx];
      const lengthPx = 6000 + Math.random() * 3000; // 600m - 900m long

      this.hazardZones.push({
        id: hazardId,
        x,
        length: lengthPx,
        type: hData.type,
        name: `${hData.name} (KM ${Math.round(x / 10000)})`,
        icon: hData.icon,
        description: hData.desc,
        dangerLevel: hData.danger,
        ambientTempMod: hData.tempMod,
      });
    }

    // Spawn supply stations every ~20km
    for (let x = startPx + 15000; x < endPx; x += 22000) {
      const roundedX = Math.round(x);
      const stationId = `station_${roundedX}`;
      if (this.stations.some((s) => s.id === stationId || Math.abs(s.x - x) < 1000)) {
        continue;
      }

      this.stations.push({
        id: stationId,
        x,
        laneOffset: 160,
        name: `Trạm Tiếp Tế Cao Tốc KM ${Math.round(x / 10000)}`,
        isVisited: false,
        supplies: [
          { itemId: 'purified_water_500ml', price: 1, stock: 30, maxStock: 30 },
          { itemId: 'bread', price: 1, stock: 30, maxStock: 30 },
          { itemId: 'high_grade_fuel', price: 2, stock: 40, maxStock: 40 },
          { itemId: 'salt', price: 1, stock: 20, maxStock: 20 },
          { itemId: 'iron_plate', price: 1, stock: 25, maxStock: 25 },
          { itemId: 'rubber', price: 1, stock: 20, maxStock: 20 },
        ],
      });
    }
  }

  public createBeastForDistance(
    x: number,
    y: number,
    distKm: number,
    rarity: ItemRarity,
    guardingChestId?: string,
    preferNightPredator?: boolean
  ): BeastEntity {
    let beastType: BeastEntity['type'] = 'snake';
    let hp = 35;
    let dmg = 8;
    let speed = 1.6;
    let beastName = 'Rắn Độc Sa Mạc';
    let isNightPred = false;
    let isBoss = false;
    let element: BeastEntity['element'] = 'physical';
    let specialSkillName = 'Cắn Xé';

    // Difficulty multipliers
    const hpMult = this.difficulty === 'nightmare' ? 1.6 : this.difficulty === 'hard' ? 1.3 : 1.0;
    const dmgMult = this.difficulty === 'nightmare' ? 1.7 : this.difficulty === 'hard' ? 1.35 : 1.0;
    const distBonus = 1 + distKm * 0.05; // +5% stat per KM

    // World Boss Encounter Spawns (rare epic milestones or brilliant chests)
    if ((distKm > 20 && Math.random() < 0.2) || (rarity === 'brilliant' && Math.random() < 0.5)) {
      const bossChoices: BeastEntity['type'][] = ['sand_behemoth', 'mecha_chimera', 'golden_scorpion', 'twin_vulture'];
      beastType = bossChoices[Math.floor(Math.random() * bossChoices.length)];
      isBoss = true;

      if (beastType === 'sand_behemoth') {
        hp = 850;
        dmg = 75;
        speed = 1.6;
        beastName = '👑 [BOSS] CỰ THÚ SA MẠC BEHEMOTH';
        element = 'fire';
        specialSkillName = 'Đại Địa Chấn Động & Nham Thạch';
      } else if (beastType === 'mecha_chimera') {
        hp = 780;
        dmg = 80;
        speed = 2.1;
        beastName = '👑 [BOSS] CƠ GIÁP ĐỘT BIẾN CHIMERA';
        element = 'cyber';
        specialSkillName = 'Tia Xung Kích Plasma & Đột Kích Laser';
      } else if (beastType === 'golden_scorpion') {
        hp = 680;
        dmg = 68;
        speed = 1.9;
        beastName = '👑 [BOSS] BỌ CẠP HOÀNG KIM CỔ ĐẠI';
        element = 'poison';
        specialSkillName = 'Độc Tố Vô Tận & Giáp Kim Cương';
      } else {
        hp = 620;
        dmg = 72;
        speed = 2.6;
        beastName = '👑 [BOSS] KỀN KỀN TỬ THẦN 2 ĐẦU';
        element = 'dark';
        specialSkillName = 'Cuồng Phong Hắc Ám';
      }
    } else if (preferNightPredator || Math.random() < 0.28) {
      // Night Predatory / Exotic Spawns
      const nightTypes: BeastEntity['type'][] = [
        'night_stalker',
        'infernal_hound',
        'frost_specter',
        'desert_scorpion',
        'evil_spirit',
        'desert_hyena',
        'mutant_vulture',
      ];
      beastType = nightTypes[Math.floor(Math.random() * nightTypes.length)];
      isNightPred = true;

      if (beastType === 'night_stalker') {
        hp = 260;
        dmg = 42;
        speed = 2.4;
        beastName = 'Dạ Ma Khát Máu';
        element = 'dark';
        specialSkillName = 'Vuốt Quỷ Hư Không';
      } else if (beastType === 'infernal_hound') {
        hp = 220;
        dmg = 38;
        speed = 2.5;
        beastName = 'Ma Khuyển Địa Ngục';
        element = 'fire';
        specialSkillName = 'Hơi Thở Hỏa Ngục';
      } else if (beastType === 'frost_specter') {
        hp = 200;
        dmg = 36;
        speed = 2.0;
        beastName = 'U Hồn Băng Tuyết';
        element = 'frost';
        specialSkillName = 'Băng Giá Thấu Cốt';
      } else if (beastType === 'desert_scorpion') {
        hp = 160;
        dmg = 26;
        speed = 1.8;
        beastName = 'Bọ Cạp Sa Mạc Khổng Lồ';
        element = 'poison';
        specialSkillName = 'Kim Tiêm Độc Axit';
      } else if (beastType === 'desert_hyena') {
        hp = 120;
        dmg = 22;
        speed = 2.2;
        beastName = 'Linh Cẩu Xương Xám';
        element = 'physical';
        specialSkillName = 'Gặm Xương';
      } else if (beastType === 'mutant_vulture') {
        hp = 110;
        dmg = 24;
        speed = 2.5;
        beastName = 'Kền Kền Đột Biến Sa Mạc';
        element = 'dark';
        specialSkillName = 'Bổ Nhào Tốc Biến';
      } else {
        hp = 180;
        dmg = 32;
        speed = 1.9;
        beastName = 'Oán Hồn Đêm Sa Mạc';
        element = 'dark';
        specialSkillName = 'Tiếng Khóc Hồn Ma';
      }
    } else if (distKm > 15 || rarity === 'brilliant') {
      const choices: BeastEntity['type'][] = ['tiger', 'lion', 'sand_wyrm', 'armored_rhino'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      if (beastType === 'sand_wyrm') {
        hp = 380;
        dmg = 55;
        speed = 1.8;
        beastName = 'Cự Trùng Cát Tử Thần';
        element = 'physical';
        specialSkillName = 'Hàm Răng Bão Cát';
      } else if (beastType === 'armored_rhino') {
        hp = 460;
        dmg = 48;
        speed = 1.7;
        beastName = 'Tê Giác Sa Mạc Bọc Giáp';
        element = 'physical';
        specialSkillName = 'Cú Húc Thiết Giáp';
      } else if (beastType === 'tiger') {
        hp = 320;
        dmg = 52;
        speed = 2.3;
        beastName = 'Hổ Rừng Bạo Kích';
        element = 'physical';
        specialSkillName = 'Trảo Phách Bạo Kích';
      } else {
        hp = 350;
        dmg = 56;
        speed = 2.2;
        beastName = 'Sư Tử Sa Mạc Chúa';
        element = 'physical';
        specialSkillName = 'Gầm Rú Vương Giả';
      }
    } else if (distKm > 8 || rarity === 'epic') {
      const choices: BeastEntity['type'][] = ['bear', 'buffalo', 'desert_scorpion', 'bandit'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      if (beastType === 'bear') {
        hp = 240;
        dmg = 38;
        speed = 1.7;
        beastName = 'Gấu Khổng Lồ Đêm Đen';
        element = 'physical';
        specialSkillName = 'Gấu Tát Ngàn Cân';
      } else if (beastType === 'buffalo') {
        hp = 280;
        dmg = 32;
        speed = 1.8;
        beastName = 'Trâu Rừng Thiết Giáp';
        element = 'physical';
        specialSkillName = 'Ủi Càn Quét';
      } else if (beastType === 'bandit') {
        hp = 180;
        dmg = 35;
        speed = 2.0;
        beastName = 'Toán Cướp Xa Lộ Vũ Trang';
        element = 'cyber';
        specialSkillName = 'Xả Đạn Tự Động';
      } else {
        hp = 170;
        dmg = 28;
        speed = 1.8;
        beastName = 'Bọ Cạp Độc Khổng Lồ';
        element = 'poison';
        specialSkillName = 'Phun Axit Ăn Mòn';
      }
    } else if (distKm > 4 || rarity === 'perfect' || rarity === 'superior') {
      const choices: BeastEntity['type'][] = ['leopard', 'wolf', 'desert_hyena', 'desert_scorpion'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      if (beastType === 'leopard') {
        hp = 120;
        dmg = 24;
        speed = 2.3;
        beastName = 'Báo Hoa Sa Mạc';
        element = 'physical';
        specialSkillName = 'Vồ Mồi Tốc Độ';
      } else if (beastType === 'desert_hyena') {
        hp = 105;
        dmg = 20;
        speed = 2.1;
        beastName = 'Linh Cẩu Sa Mạc';
        element = 'physical';
        specialSkillName = 'Cắn Xé Hội Đồng';
      } else if (beastType === 'desert_scorpion') {
        hp = 130;
        dmg = 22;
        speed = 1.7;
        beastName = 'Bọ Cạp Gai Độc';
        element = 'poison';
        specialSkillName = 'Châm Độc';
      } else {
        hp = 95;
        dmg = 18;
        speed = 2.0;
        beastName = 'Sói Hoang Đói Khát';
        element = 'physical';
        specialSkillName = 'Tiếng Hú Đêm';
      }
    } else if (distKm > 1 || rarity === 'good') {
      const choices: BeastEntity['type'][] = ['cat', 'wolf', 'snake'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      hp = beastType === 'wolf' ? 70 : 50;
      dmg = beastType === 'wolf' ? 15 : 11;
      speed = 1.8;
      beastName = beastType === 'wolf' ? 'Sói Con Rình Rập' : beastType === 'cat' ? 'Mèo Hoang Sa Mạc' : 'Rắn Chuông Sa Mạc';
      element = beastType === 'snake' ? 'poison' : 'physical';
      specialSkillName = beastType === 'snake' ? 'Cắn Nọc Độc' : 'Cào Cấu';
    } else {
      beastType = Math.random() > 0.5 ? 'snake' : 'mouse';
      hp = 35;
      dmg = 8;
      speed = 1.5;
      beastName = beastType === 'snake' ? 'Rắn Độc Núp Bụi' : 'Chuột Đồng Đột Biến';
      element = beastType === 'snake' ? 'poison' : 'physical';
      specialSkillName = 'Cắn Trộm';
    }

    const finalHp = Math.round(hp * hpMult * distBonus);
    const finalDmg = Math.round(dmg * dmgMult * distBonus);

    return {
      id: `beast_${Math.round(x)}_${Math.round(Math.random() * 10000)}`,
      type: beastType,
      name: beastName,
      x,
      laneOffset: y,
      hp: finalHp,
      maxHp: finalHp,
      speed: speed * (this.difficulty === 'nightmare' ? 1.25 : 1.0) * (isBoss ? 1.15 : 1.0),
      attackDamage: finalDmg,
      rarity,
      element,
      isBoss,
      isNightPredator: isNightPred,
      isEnraged: false,
      enrageThreshold: isBoss ? 0.4 : 0.3,
      isDead: false,
      drops: this.generateBeastDrops(beastType),
      badgesDrop: isBoss ? 100 : rarity === 'brilliant' ? 35 : rarity === 'perfect' ? 18 : rarity === 'superior' ? 10 : 5,
      guardingChestId,
      specialSkillName,
    };
  }

  private generateLootForRarity(rarity: ItemRarity): { itemId: string; quantity: number }[] {
    if (rarity === 'brilliant') {
      const topTier = [
        [{ itemId: 'space_crystal', quantity: 2 }, { itemId: 'ammo_ap', quantity: 30 }],
        [{ itemId: 'diamond', quantity: 2 }, { itemId: 'titanium_alloy', quantity: 5 }],
        [{ itemId: 'special_crystal', quantity: 3 }, { itemId: 'copper_plate', quantity: 15 }],
      ];
      return topTier[Math.floor(Math.random() * topTier.length)];
    }
    if (rarity === 'perfect' || rarity === 'superior') {
      const highTier = [
        [{ itemId: 'iron_plate', quantity: 8 }, { itemId: 'copper_plate', quantity: 6 }],
        [{ itemId: 'gunpowder', quantity: 10 }, { itemId: 'purified_water_500ml', quantity: 3 }],
        [{ itemId: 'ammo_standard', quantity: 25 }, { itemId: 'electronic_chip', quantity: 2 }],
      ];
      return highTier[Math.floor(Math.random() * highTier.length)];
    }
    const commonLootPool = [
      [{ itemId: 'wood', quantity: 4 }, { itemId: 'purified_water_500ml', quantity: 1 }],
      [{ itemId: 'iron_plate', quantity: 3 }, { itemId: 'bread', quantity: 1 }],
      [{ itemId: 'rubber', quantity: 2 }, { itemId: 'wood', quantity: 2 }],
      [{ itemId: 'rubber', quantity: 1 }, { itemId: 'iron_plate', quantity: 1 }],
    ];
    return commonLootPool[Math.floor(Math.random() * commonLootPool.length)];
  }

  private generateBeastDrops(type: BeastEntity['type']): { itemId: string; quantity: number; chance: number }[] {
    switch (type) {
      case 'sand_behemoth':
        return [
          { itemId: 'meat', quantity: 300, chance: 1 },
          { itemId: 'space_crystal', quantity: 3, chance: 0.9 },
          { itemId: 'diamond', quantity: 2, chance: 0.8 },
          { itemId: 'copper_plate', quantity: 30, chance: 1 },
        ];
      case 'mecha_chimera':
        return [
          { itemId: 'iron_plate', quantity: 40, chance: 1 },
          { itemId: 'space_crystal', quantity: 2, chance: 0.85 },
          { itemId: 'ammo_ap', quantity: 50, chance: 1 },
          { itemId: 'gunpowder', quantity: 25, chance: 1 },
        ];
      case 'golden_scorpion':
        return [
          { itemId: 'meat', quantity: 200, chance: 1 },
          { itemId: 'diamond', quantity: 2, chance: 0.9 },
          { itemId: 'space_crystal', quantity: 2, chance: 0.75 },
          { itemId: 'gunpowder', quantity: 20, chance: 1 },
        ];
      case 'twin_vulture':
        return [
          { itemId: 'meat', quantity: 180, chance: 1 },
          { itemId: 'space_crystal', quantity: 2, chance: 0.8 },
          { itemId: 'cotton', quantity: 20, chance: 1 },
          { itemId: 'copper_plate', quantity: 20, chance: 0.9 },
        ];
      case 'infernal_hound':
        return [
          { itemId: 'wolf_meat', quantity: 40, chance: 1 },
          { itemId: 'gunpowder', quantity: 15, chance: 0.9 },
          { itemId: 'space_crystal', quantity: 1, chance: 0.4 },
        ];
      case 'frost_specter':
        return [
          { itemId: 'space_crystal', quantity: 2, chance: 0.7 },
          { itemId: 'diamond', quantity: 1, chance: 0.5 },
        ];
      case 'snake':
        return [{ itemId: 'snake_meat', quantity: 1, chance: 1 }];
      case 'mouse':
        return [{ itemId: 'mouse_meat', quantity: 2, chance: 1 }];
      case 'cat':
        return [{ itemId: 'cat_meat', quantity: 2, chance: 1 }];
      case 'wolf':
        return [{ itemId: 'wolf_meat', quantity: 10, chance: 1 }];
      case 'desert_hyena':
        return [
          { itemId: 'wolf_meat', quantity: 15, chance: 1 },
          { itemId: 'iron_plate', quantity: 3, chance: 0.5 },
        ];
      case 'leopard':
        return [{ itemId: 'leopard_meat', quantity: 25, chance: 1 }];
      case 'desert_scorpion':
        return [
          { itemId: 'meat', quantity: 10, chance: 1 },
          { itemId: 'gunpowder', quantity: 4, chance: 0.7 },
        ];
      case 'mutant_vulture':
        return [
          { itemId: 'meat', quantity: 15, chance: 1 },
          { itemId: 'cotton', quantity: 6, chance: 0.8 },
        ];
      case 'buffalo':
        return [{ itemId: 'buffalo_meat', quantity: 60, chance: 1 }];
      case 'bear':
        return [
          { itemId: 'bear_meat', quantity: 80, chance: 1 },
          { itemId: 'bear_paw', quantity: 4, chance: 1 },
        ];
      case 'tiger':
        return [
          { itemId: 'tiger_meat', quantity: 100, chance: 1 },
          { itemId: 'tiger_bone_powder', quantity: 2, chance: 0.9 },
        ];
      case 'lion':
        return [{ itemId: 'lion_meat', quantity: 120, chance: 1 }];
      case 'sand_wyrm':
        return [
          { itemId: 'meat', quantity: 150, chance: 1 },
          { itemId: 'diamond', quantity: 1, chance: 0.6 },
          { itemId: 'copper_plate', quantity: 15, chance: 0.9 },
        ];
      case 'armored_rhino':
        return [
          { itemId: 'buffalo_meat', quantity: 140, chance: 1 },
          { itemId: 'iron_plate', quantity: 30, chance: 1 },
        ];
      case 'night_stalker':
        return [
          { itemId: 'meat', quantity: 80, chance: 1 },
          { itemId: 'space_crystal', quantity: 1, chance: 0.3 },
          { itemId: 'diamond', quantity: 1, chance: 0.5 },
        ];
      case 'evil_spirit':
        return [
          { itemId: 'space_crystal', quantity: 1, chance: 0.5 },
          { itemId: 'gunpowder', quantity: 12, chance: 1 },
        ];
      case 'bandit':
        return [
          { itemId: 'iron_plate', quantity: 15, chance: 1 },
          { itemId: 'gunpowder', quantity: 8, chance: 0.9 },
          { itemId: 'ammo_ap', quantity: 20, chance: 0.5 },
        ];
      default:
        return [{ itemId: 'meat', quantity: 2, chance: 1 }];
    }
  }

  // Shoot a projectile from player/vehicle towards screen target
  public playerAttack(
    type: 'bullet' | 'stone' | 'bait',
    damage: number,
    targetScreenX: number,
    targetScreenY: number
  ) {
    const originX = this.mode === 'driving' ? this.carX : this.playerX;
    const originY = this.mode === 'driving' ? this.carY : this.playerY;

    // Convert screen coordinates to world coordinates
    const targetWorldX = targetScreenX + this.cameraX - this.width / 2;
    const targetWorldY = targetScreenY + this.cameraY - this.height / 2;

    const dx = targetWorldX - originX;
    const dy = targetWorldY - originY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = type === 'bullet' ? 18 : 8;

    this.projectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      x: originX,
      y: originY,
      targetX: targetWorldX,
      targetY: targetWorldY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage,
      type,
      life: 60,
    });

    // Muzzle flash particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: originX,
        y: originY,
        vx: (dx / dist) * speed * 0.3 + (Math.random() - 0.5) * 3,
        vy: (dy / dist) * speed * 0.3 + (Math.random() - 0.5) * 3,
        color: type === 'bullet' ? '#fbbf24' : '#9ca3af',
        size: 3 + Math.random() * 3,
        life: 0,
        maxLife: 15,
        alpha: 1,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#fde047', isCrit: boolean = false) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: isCrit ? -1.8 : -1.2,
      life: 0,
      isCrit,
    });
  }

  public triggerScreenShake(intensity: number = 6, duration: number = 0.25) {
    this.screenShakeIntensity = intensity;
    this.screenShakeDuration = duration;
    this.screenShakeTimer = duration;
  }

  public start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  // Update Game Physics & Simulation
  public update(dt: number) {
    // Update Screen Shake Decay
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
      if (this.screenShakeTimer <= 0) {
        this.screenShakeIntensity = 0;
        this.screenShakeDuration = 0;
      }
    }

    // 1. Day / Night Clock Cycle Progression
    // 1 real second = ~0.5 in-game hours or synchronised with timer
    this.timeOfDayHours = (this.timeOfDayHours + (dt * 0.05)) % 24.0;

    // Determine Time Phase
    if (this.timeOfDayHours >= 5.0 && this.timeOfDayHours < 7.0) {
      this.timePhase = 'dawn';
      this.isNight = false;
      this.ambientTemp = 26;
    } else if (this.timeOfDayHours >= 7.0 && this.timeOfDayHours < 17.0) {
      this.timePhase = 'day';
      this.isNight = false;
      // Peak heat in daytime
      const noonFactor = 1 - Math.abs(this.timeOfDayHours - 12) / 6;
      this.ambientTemp = Math.round(42 + noonFactor * 16);
    } else if (this.timeOfDayHours >= 17.0 && this.timeOfDayHours < 19.5) {
      this.timePhase = 'dusk';
      this.isNight = false;
      this.ambientTemp = 30;
    } else {
      this.timePhase = 'night';
      this.isNight = true;
      // Cold desert night
      this.ambientTemp = 10;
    }

    if (this.onTimeTick) {
      this.onTimeTick(this.timeOfDayHours, this.isNight, this.timePhase, this.ambientTemp);
    }

    // 1.1 Spatial Audio & Ambient Tracks Sync
    this.spatialAudioTimer += dt;
    if (this.spatialAudioTimer >= 1.5) {
      this.spatialAudioTimer = 0;

      // Update ambient soundscape crossfades smoothly
      soundEngine.setAmbientEnvironment(this.timePhase, this.currentStageId, this.activeHazardZone?.type);

      const targetPx = this.mode === 'driving' ? this.carX : this.playerX;
      const targetPy = this.mode === 'driving' ? this.carY : this.playerY;

      // Check nearest beast for spatial audio growl
      for (const b of this.beasts) {
        if (b.isDead) continue;
        const d = Math.hypot(b.laneOffset - targetPx, (-b.x) - targetPy);
        if (d < 380) {
          soundEngine.playSpatialSound('beast_growl', b.laneOffset, -b.x, targetPx, targetPy, 500);
          break;
        }
      }

      // Check nearest supply station for spatial chime
      for (const s of this.stations) {
        const d = Math.hypot(140 + 65 - targetPx, (-s.x) - targetPy);
        if (d < 500) {
          soundEngine.playSpatialSound('station_beacon', 140 + 65, -s.x, targetPx, targetPy, 700);
          break;
        }
      }

      // Check hazard zone for spatial wind howl
      if (this.activeHazardZone) {
        soundEngine.playSpatialSound('wind_howl', 0, -this.activeHazardZone.x, targetPx, targetPy, 600);
      }
    }

    // 1.2 Random World Encounter Trigger while Driving
    if (this.mode === 'driving') {
      const currentDistKm = this.carDistance / 10000;
      if (currentDistKm >= 1.5 && currentDistKm - this.lastEncounterKm >= 3.5) {
        this.lastEncounterKm = currentDistKm;
        if (this.onTriggerEncounter) {
          const encChoices = RANDOM_HIGHWAY_ENCOUNTERS;
          const randomEnc = encChoices[Math.floor(Math.random() * encChoices.length)];
          this.onTriggerEncounter(randomEnc);
        }
      }
    }

    // Generate endless road ahead
    const currentFrontier = Math.max(this.carDistance, this.playerDistance) + 15000;
    if (currentFrontier > this.roadGenerationDistance) {
      this.generateWorldSegment(this.roadGenerationDistance, currentFrontier);
      this.roadGenerationDistance = currentFrontier;
    }

    // Mode handling
    if (this.mode === 'driving') {
      let steer = 0;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer = -1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) steer = 1;

      this.isAccelerating = (this.keys['KeyW'] || this.keys['ArrowUp'] || false) && this.hasFuel;
      this.isBraking = this.keys['KeyS'] || this.keys['ArrowDown'] || false;

      // 1. Throttle / Acceleration & Braking Dynamics
      const effectiveMaxSpeed = this.nitroBoostActive ? this.maxSpeed * 1.35 : this.maxSpeed;
      if (this.isAccelerating) {
        this.carSpeed = Math.min(effectiveMaxSpeed, this.carSpeed + this.accelerationRate * dt);
      } else if (this.isBraking) {
        this.carSpeed = Math.max(0, this.carSpeed - this.brakeDeceleration * dt);
      } else {
        // Natural rolling resistance friction
        this.carSpeed = Math.max(0, this.carSpeed - this.coastDeceleration * dt);
      }

      // 2. High-Precision Frame-by-Frame Forward Velocity (100km/h = ~380px/s forward UPWARDS)
      const forwardVelocityPx = this.carSpeed * 3.8;
      this.carDistance += forwardVelocityPx * dt;
      this.carY = -this.carDistance;

      // 3. Mileage & Fuel Consumption Tick Synchronization
      if (this.carSpeed > 0) {
        const distKm = (this.carSpeed / 3600) * dt;
        const fuelUsed = (distKm * this.fuelEfficiency) / 100;
        if (this.onVehicleDriveTick) {
          this.onVehicleDriveTick(distKm, fuelUsed, this.carSpeed);
        }
      }

      // 4. Smooth Frame-Rate Independent Lane Steering (200 px/s)
      const steerSpeed = 200;
      this.carX += steer * steerSpeed * dt;
      this.carX = Math.max(-125, Math.min(125, this.carX)); // highway bounds

      // Dynamic Angular Yaw with Inertia
      const targetAngle = steer * 0.10 * Math.min(1, Math.max(0.15, this.carSpeed / 25));
      this.carAngle += (targetAngle - this.carAngle) * (1 - Math.exp(-14 * dt));

      // 5. Dynamic Camera Following with Speed-Based Forward Horizon Lead (Looking UP)
      const cameraLookAhead = Math.min(220, this.carSpeed * 1.6);
      const targetCamX = this.carX * 0.65;
      const targetCamY = this.carY - cameraLookAhead;

      this.cameraX += (targetCamX - this.cameraX) * (1 - Math.exp(-7.5 * dt));
      this.cameraY += (targetCamY - this.cameraY) * (1 - Math.exp(-9.0 * dt));

      // 6. Generate Tire Skid Marks & Screech Smoke on Sharp Turns or Heavy Braking
      if ((Math.abs(steer) > 0.45 && this.carSpeed > 30) || (this.isBraking && this.carSpeed > 20)) {
        if (Math.random() < 0.4) {
          const backWheelY = this.carY + 24;
          this.skidMarks.push(
            { x: this.carX - 15, y: backWheelY, angle: this.carAngle, alpha: 0.75 },
            { x: this.carX + 15, y: backWheelY, angle: this.carAngle, alpha: 0.75 }
          );
          this.particles.push({
            x: this.carX + (Math.random() - 0.5) * 20,
            y: backWheelY,
            vx: (Math.random() - 0.5) * 1.2,
            vy: 1 + Math.random() * 1.5,
            color: '#e2e8f0',
            size: 3 + Math.random() * 3,
            life: 0,
            maxLife: 20,
            alpha: 0.7,
            type: 'smoke',
          });
        }
      }

      // 7. Driving Exhaust Smoke & Blue Plasma Flame Particles (Shooting DOWNWARDS)
      const exhaustRate = this.isAccelerating ? 0.8 : this.carSpeed > 10 ? 0.35 : 0.1;
      if (Math.random() < exhaustRate) {
        const flameSpeed = this.isAccelerating ? 4.5 + Math.random() * 3.5 : 2.5 + Math.random() * 1.5;
        this.particles.push({
          x: this.carX + (Math.random() - 0.5) * 12,
          y: this.carY + 34,
          vx: (Math.random() - 0.5) * 1,
          vy: flameSpeed,
          color: this.isAccelerating ? (Math.random() > 0.4 ? '#38bdf8' : '#00f2ff') : '#94a3b8',
          size: 2 + Math.random() * (this.isAccelerating ? 5 : 3),
          life: 0,
          maxLife: 24,
          alpha: 0.8,
          type: 'smoke',
        });
      }
    } else {
      // On foot controls
      let moveX = 0;
      let moveY = 0;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        const playerWalkSpeed = 220; // 220 px/s
        this.playerX += (moveX / len) * playerWalkSpeed * dt;
        this.playerY += (moveY / len) * playerWalkSpeed * dt;
        this.playerX = Math.max(-160, Math.min(160, this.playerX));
        this.playerDistance = -this.playerY;
        this.isPlayerMoving = true;
        this.walkAnimFrame += dt * 8;
        if (moveX !== 0) this.playerFacing = moveX > 0 ? 1 : -1;

        // Footstep dust particle puffs
        if (Math.random() < 0.35) {
          this.particles.push({
            x: this.playerX - this.playerFacing * 6,
            y: this.playerY + 12,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 0.4 + Math.random() * 0.4,
            color: '#cbd5e1',
            size: 2 + Math.random() * 2,
            life: 0,
            maxLife: 16,
            alpha: 0.6,
          });
        }
      } else {
        this.isPlayerMoving = false;
      }

      // Camera smoothly tracks player on foot
      this.cameraX += (this.playerX - this.cameraX) * (1 - Math.exp(-9.0 * dt));
      this.cameraY += (this.playerY - this.cameraY) * (1 - Math.exp(-9.0 * dt));
    }

    // Check Hazard Zone Proximity & Entry
    const currentDistPx = this.mode === 'driving' ? this.carDistance : this.playerDistance;
    let foundZone: HazardZoneEntity | null = null;
    for (const zone of this.hazardZones) {
      if (Math.abs(currentDistPx - zone.x) <= zone.length / 2) {
        foundZone = zone;
        break;
      }
    }

    if (foundZone && (!this.activeHazardZone || this.activeHazardZone.id !== foundZone.id)) {
      this.activeHazardZone = foundZone;
      if (this.onEnterHazardZone) {
        this.onEnterHazardZone(foundZone);
      }
      this.addFloatingText(this.mode === 'driving' ? this.carX : this.playerX, (this.mode === 'driving' ? this.carY : this.playerY) - 50, `⚠️ TIẾN VÀO: ${foundZone.name.toUpperCase()}!`, '#f97316');
    } else if (!foundZone && this.activeHazardZone) {
      this.activeHazardZone = null;
    }

    // Dynamic Atmospheric Weather Particle Spawner
    this.heatShimmerOffset = (this.heatShimmerOffset + dt * 4) % (Math.PI * 2);

    // Sandstorm Particles (if in sandstorm or high heat)
    if (this.activeHazardZone?.type === 'sandstorm' || (this.ambientTemp > 45 && Math.random() < 0.4)) {
      for (let s = 0; s < 2; s++) {
        this.particles.push({
          x: this.cameraX - this.width / 2 + Math.random() * this.width,
          y: (Math.random() - 0.5) * 350,
          vx: 8 + Math.random() * 8, // fast horizontal wind
          vy: (Math.random() - 0.5) * 2,
          color: Math.random() > 0.5 ? '#d97706' : '#f59e0b',
          size: 2 + Math.random() * 3.5,
          life: 0,
          maxLife: 30,
          alpha: 0.65,
        });
      }
    }

    // Toxic Mire Green Spores
    if (this.activeHazardZone?.type === 'toxic_mire') {
      if (Math.random() < 0.6) {
        this.particles.push({
          x: this.cameraX - this.width / 2 + Math.random() * this.width,
          y: (Math.random() - 0.5) * 260,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.2 - Math.random() * 1.5,
          color: '#22c55e',
          size: 2 + Math.random() * 4,
          life: 0,
          maxLife: 40,
          alpha: 0.75,
        });
      }
    }

    // Night Fireflies / Eerie Glowing Orbs
    if (this.isNight && Math.random() < 0.25) {
      this.particles.push({
        x: this.cameraX - this.width / 2 + Math.random() * this.width,
        y: (Math.random() - 0.5) * 280,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.6 ? '#67e8f9' : '#fef08a',
        size: 1.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 50,
        alpha: 0.8,
      });
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // Check collision with beasts
      let hit = false;
      for (const beast of this.beasts) {
        if (beast.isDead) continue;
        const dx = beast.laneOffset - p.x;
        const dy = (-beast.x) - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 32) {
          hit = true;
          if (p.type === 'bait') {
            beast.isPacified = true;
            this.addFloatingText(beast.laneOffset, -beast.x - 20, 'ĐÃ TRÚNG THẤT TÌNH DƯỢC! 💫', '#ec4899');
          } else {
            // Apply Survival Skill Tree bonuses:
            let finalDmg = p.damage;
            const beastSlayerLvl = this.skills['beast_slayer'] || 0;
            if (beastSlayerLvl > 0) {
              finalDmg = Math.round(finalDmg * (1 + beastSlayerLvl * 0.25));
            }

            const nightBaneLvl = this.skills['night_hunter_bane'] || 0;
            if (nightBaneLvl > 0 && (beast.isNightPredator || beast.type === 'night_stalker' || beast.type === 'evil_spirit' || beast.type === 'bandit')) {
              finalDmg = Math.round(finalDmg * (1 + nightBaneLvl * 0.4));
            }

            // Deadly precision crit roll
            const critLvl = this.skills['deadly_precision'] || 0;
            const critChance = 0.05 + critLvl * 0.15;
            const isCrit = Math.random() < critChance;
            if (isCrit) {
              finalDmg = Math.round(finalDmg * 2.5);
              soundEngine.playCritFanfare();
              this.triggerScreenShake(7, 0.22);
              this.addFloatingText(beast.laneOffset, -beast.x - 35, `⚡ BẠO KÍCH! -${finalDmg}`, '#fde047', true);
            } else {
              this.addFloatingText(beast.laneOffset, -beast.x - 20, `-${finalDmg}`, '#ef4444');
            }

            beast.hp -= finalDmg;
            beast.hitFlash = 10;
            soundEngine.playMonsterHit();

            // Check Enrage mode trigger
            const enrageThresh = beast.enrageThreshold || 0.35;
            if (!beast.isEnraged && beast.hp > 0 && beast.hp / beast.maxHp <= enrageThresh) {
              beast.isEnraged = true;
              beast.speed *= 1.4;
              beast.attackDamage = Math.round(beast.attackDamage * 1.35);
              soundEngine.playBeastEnrage();
              this.triggerScreenShake(12, 0.45);
              this.addFloatingText(beast.laneOffset, -beast.x - 55, '🔥 CUỒNG NỘ! HÓA QUỶ!', '#ef4444', true);

              for (let k = 0; k < 18; k++) {
                this.particles.push({
                  x: beast.laneOffset,
                  y: -beast.x,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: '#ef4444',
                  size: 4,
                  life: 0,
                  maxLife: 28,
                  alpha: 1,
                  type: 'ember',
                });
              }
            }

            // Blood/elemental impact particles
            const particleColor = beast.element === 'poison' ? '#22c55e' : beast.element === 'cyber' ? '#00f2ff' : beast.element === 'dark' ? '#a855f7' : beast.element === 'frost' ? '#67e8f9' : isCrit ? '#f59e0b' : '#dc2626';
            for (let k = 0; k < 8; k++) {
              this.particles.push({
                x: beast.laneOffset,
                y: -beast.x,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                color: particleColor,
                size: isCrit ? 5 : 3.5,
                life: 0,
                maxLife: 22,
                alpha: 1,
                type: 'spark',
              });
            }

            if (beast.hp <= 0) {
              beast.isDead = true;
              beast.hp = 0;
              soundEngine.playMonsterDeath();
              this.addFloatingText(beast.laneOffset, -beast.x - 45, beast.isBoss ? '👑 TRẢM BOSS CHIẾN TÍCH! 🏆' : 'ĐÃ TIÊU DIỆT! 💀', '#fbbf24', true);

              // Death explosion of elemental particles
              for (let k = 0; k < 20; k++) {
                this.particles.push({
                  x: beast.laneOffset,
                  y: -beast.x,
                  vx: (Math.random() - 0.5) * 9,
                  vy: (Math.random() - 0.5) * 9,
                  color: beast.isBoss ? '#f59e0b' : particleColor,
                  size: 4,
                  life: 0,
                  maxLife: 35,
                  alpha: 1,
                  type: 'spark',
                });
              }
            }
          }
          break;
        }
      }

      if (hit || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update beasts AI & Aggro
    const targetPx = this.mode === 'driving' ? this.carX : this.playerX;
    const targetPy = this.mode === 'driving' ? this.carY : this.playerY;

    // Night buff: Beasts are faster & more aggressive
    const nightSpeedMult = this.isNight ? 1.35 : 1.0;
    const nightDmgMult = this.isNight ? 1.3 : 1.0;
    const aggroDist = this.isNight ? 350 : 250;

    for (const beast of this.beasts) {
      if (beast.hitFlash && beast.hitFlash > 0) {
        beast.hitFlash--;
      }

      if (beast.isDead) continue;

      if (beast.isPacified) {
        // Confused wandering
        beast.laneOffset += (Math.random() - 0.5) * 0.6;
        beast.x += (Math.random() - 0.5) * 0.6;
        continue;
      }

      const dx = targetPx - beast.laneOffset;
      const dy = targetPy - (-beast.x);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Enraged / Boss aura emissions
      if ((beast.isEnraged || beast.isBoss) && Math.random() < 0.3) {
        this.particles.push({
          x: beast.laneOffset + (Math.random() - 0.5) * 20,
          y: -beast.x + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3,
          color: beast.isEnraged ? '#ef4444' : (beast.element === 'cyber' ? '#00f2ff' : '#f59e0b'),
          size: 3,
          life: 0,
          maxLife: 25,
          alpha: 0.8,
          type: 'ember',
        });
      }

      // Aggro chase
      if (dist < aggroDist && dist > 15) {
        const beastSpeed = beast.speed * nightSpeedMult * (beast.isEnraged ? 1.25 : 1.0);
        beast.laneOffset += (dx / dist) * beastSpeed * 0.8;
        beast.x -= (dy / dist) * beastSpeed * 0.8; // Moving towards target in vertical space
      }

      // Attack player on foot if too close
      if (this.mode === 'onfoot' && dist < 26) {
        const lastAtk = this.beastAttackCooldowns[beast.id] || 0;
        if (performance.now() - lastAtk > (beast.isEnraged ? 650 : 900)) {
          this.beastAttackCooldowns[beast.id] = performance.now();
          this.triggerScreenShake(beast.isBoss ? 15 : 9, 0.3);
          const finalAtkDmg = beast.attackDamage * nightDmgMult * (beast.isEnraged ? 1.3 : 1.0);
          if (this.onPlayerDamaged) {
            this.onPlayerDamaged(finalAtkDmg);
          }
          this.addFloatingText(this.playerX, this.playerY - 25, `⚠️ ${beast.specialSkillName || 'BỊ CẮN'}! -${Math.round(finalAtkDmg)}`, '#ef4444');
          if (beast.element === 'poison') soundEngine.playPoisonSpit();
          else soundEngine.playBeastRoar(beast.isBoss);
        }
      }

      // Attack / Slam into Car when in driving mode
      if (this.mode === 'driving' && dist < 42) {
        const lastAtk = this.beastAttackCooldowns[beast.id] || 0;
        if (performance.now() - lastAtk > (beast.isEnraged ? 700 : 1000)) {
          this.beastAttackCooldowns[beast.id] = performance.now();
          this.triggerScreenShake(beast.isBoss ? 16 : 12, 0.35);
          
          // Heavy ram bumper skill: deals return ramming damage to the beast
          const ramBumperLvl = this.skills['heavy_ram_bumper'] || 0;
          const ramDmg = Math.round(45 + ramBumperLvl * 35);
          beast.hp -= ramDmg;
          beast.hitFlash = 10;
          this.addFloatingText(beast.laneOffset, -beast.x - 25, `🚗 TÔNG XE! -${ramDmg}`, '#38bdf8');

          if (beast.hp <= 0) {
            beast.isDead = true;
            beast.hp = 0;
            soundEngine.playMonsterDeath();
            this.addFloatingText(beast.laneOffset, -beast.x - 40, beast.isBoss ? '👑 TRẢM BOSS! 💀' : 'ĐÃ HẠ GỤC! 💀', '#eab308');
          }

          // Durability reduction reduced by ram bumper skill
          const baseVehDmg = Math.max(3, Math.round(beast.attackDamage * 0.3 * nightDmgMult * (beast.isEnraged ? 1.3 : 1.0)));
          const vehDmg = Math.max(1, Math.round(baseVehDmg * (1 - ramBumperLvl * 0.25)));

          if (this.onVehicleDamaged) {
            this.onVehicleDamaged(vehDmg);
          }
          this.addFloatingText(this.carX, this.carY - 30, `💥 VA CHẠM XE! -${vehDmg} ĐỘ BỀN`, '#f97316');
          soundEngine.playCrash();

          // Spark particles on car impact
          for (let k = 0; k < 10; k++) {
            this.particles.push({
              x: this.carX,
              y: this.carY,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#fbbf24',
              size: 3.5,
              life: 0,
              maxLife: 18,
              alpha: 1,
              type: 'spark',
            });
          }
        }
      }
    }

    // Companion Pet Dog Auto-Combat (Attacks closest living beast within 160px)
    if (this.mode === 'onfoot') {
      this.petAttackCooldown += dt;
      if (this.petAttackCooldown >= 0.85) {
        let closestBeast: BeastEntity | null = null;
        let minDist = 190;
        for (const b of this.beasts) {
          if (b.isDead) continue;
          const d = Math.hypot(b.laneOffset - this.playerX, (-b.x) - this.playerY);
          if (d < minDist) {
            minDist = d;
            closestBeast = b;
          }
        }

        if (closestBeast) {
          this.petAttackCooldown = 0;
          const petDmg = 38;
          closestBeast.hp -= petDmg;
          closestBeast.hitFlash = 10;
          this.addFloatingText(closestBeast.laneOffset, -closestBeast.x - 25, `🐕 CHÓ CẮN! -${petDmg}`, '#fde047');
          if (closestBeast.hp <= 0) {
            closestBeast.isDead = true;
            closestBeast.hp = 0;
            soundEngine.playMonsterDeath();
            this.addFloatingText(closestBeast.laneOffset, -closestBeast.x - 40, 'ĐÃ HẠ GỤC! 💀', '#4ade80');
          }
        }
      }
    }

    // Skid marks & Particles update
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      this.skidMarks[i].alpha -= dt * 0.04;
      if (this.skidMarks[i].alpha <= 0) {
        this.skidMarks.splice(i, 1);
      }
    }
    if (this.skidMarks.length > 250) {
      this.skidMarks.splice(0, this.skidMarks.length - 250);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.rotation !== undefined && pt.vRot !== undefined) {
        pt.rotation += pt.vRot;
      }
      pt.life++;
      pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life += dt;
      ft.alpha = Math.max(0, 1 - ft.life / 1.5);
      if (ft.life >= 1.5) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // Render 2D Graphics onto Canvas with High-Fidelity Visuals
  public render() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Dynamic Biome & Time-of-Day Sky & Background Base
    this.drawWorldBackground(ctx);

    ctx.save();
    // Screen Shake Calculation
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTimer > 0 && this.screenShakeIntensity > 0) {
      const decay = this.screenShakeTimer / (this.screenShakeDuration || 1);
      const currentIntensity = this.screenShakeIntensity * decay;
      shakeX = (Math.random() - 0.5) * 2 * currentIntensity;
      shakeY = (Math.random() - 0.5) * 2 * currentIntensity;
    }

    // Center camera on target with subpixel smoothing and screen shake
    ctx.translate(this.width / 2 - this.cameraX + shakeX, this.height / 2 - this.cameraY + shakeY);

    // 2. Draw Endless Highway with Biome Terrain, Asphalt Details, Skid Marks & Milestones
    this.drawHighway(ctx);

    // 2.1 Dynamic Aerodynamic Highway Speed Lines
    this.drawSpeedLines(ctx);

    // 3. Draw Hazard Zones with Animated Danger Beacons & Volumetric Mist
    this.drawHazardZones(ctx);

    // 4. Draw Cyberpunk Supply Stations with Neon Signs, Floodlights & Fuel Pumps
    this.drawSupplyStations(ctx);

    // 5. Draw Sci-Fi Resource Chests with Holographic Beacon Columns & Orbiting Aura
    this.drawChests(ctx);

    // 6. Draw High-Detail Beasts & Night Predators with Piercing Eyes & Animated Carapaces
    this.drawBeasts(ctx);

    // 7. Draw RV Camper with Volumetric Dual Headlights, Solar Matrix, LED Tail Bar & Exhaust
    this.drawCar(ctx);

    // 8. Draw Player Survivor (if on foot) & Animated Faithful Pet Dog
    if (this.mode === 'onfoot') {
      this.drawPlayer(ctx);
    }

    // 9. Draw Projectiles with Glowing Tracers
    this.drawProjectiles(ctx);

    // 10. Draw Rich Multi-Type Particle System (Sparks, Smoke, Snow, Acid Spores, Shockwaves)
    this.drawParticles(ctx);

    // 11. Draw Dynamic Floating Combat Numbers & Critical Alerts
    this.drawFloatingTexts(ctx);

    ctx.restore();

    // 12. Dynamic 2D Lighting Mask, Celestial Night Sky & Screen-Space Weather FX
    this.drawAtmosphereOverlay(ctx);
  }

  private drawWorldBackground(ctx: CanvasRenderingContext2D) {
    const isStage2 = this.currentStageId.includes('stage2') || this.currentStageId.includes('toxic');
    const isStage3 = this.currentStageId.includes('stage3') || this.currentStageId.includes('snow') || this.currentStageId.includes('tundra');

    let bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);

    if (this.isNight) {
      bgGrad.addColorStop(0, '#050711');
      bgGrad.addColorStop(0.5, '#0b0f1d');
      bgGrad.addColorStop(1, '#080a14');
    } else if (this.timePhase === 'dawn') {
      bgGrad.addColorStop(0, '#fdba74');
      bgGrad.addColorStop(0.4, '#fb923c');
      bgGrad.addColorStop(0.7, '#c2410c');
      bgGrad.addColorStop(1, '#9a3412');
    } else if (this.timePhase === 'dusk') {
      bgGrad.addColorStop(0, '#a855f7');
      bgGrad.addColorStop(0.3, '#ec4899');
      bgGrad.addColorStop(0.6, '#9333ea');
      bgGrad.addColorStop(1, '#4c1d95');
    } else if (isStage2) {
      // Toxic mire greenish atmosphere
      bgGrad.addColorStop(0, '#14532d');
      bgGrad.addColorStop(0.5, '#166534');
      bgGrad.addColorStop(1, '#052e16');
    } else if (isStage3) {
      // Snowy frozen tundra
      bgGrad.addColorStop(0, '#93c5fd');
      bgGrad.addColorStop(0.5, '#bfdbfe');
      bgGrad.addColorStop(1, '#dbeafe');
    } else {
      // Desert sunlit terrain
      bgGrad.addColorStop(0, '#d97706');
      bgGrad.addColorStop(0.3, '#b45309');
      bgGrad.addColorStop(0.7, '#92400e');
      bgGrad.addColorStop(1, '#78350f');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawHighway(ctx: CanvasRenderingContext2D) {
    const startY = this.cameraY - this.height - 200;
    const endY = this.cameraY + this.height + 200;
    const roadWidth = 280;

    const isStage2 = this.currentStageId.includes('stage2') || this.currentStageId.includes('toxic');
    const isStage3 = this.currentStageId.includes('stage3') || this.currentStageId.includes('snow') || this.currentStageId.includes('tundra');

    // 1. Layered Parallax Biome Dunes / Ridges on Left & Right Sides
    const duneStep = 320;
    const firstDune = Math.floor(startY / duneStep) * duneStep;

    // Distant Left Dunes / Ridges
    ctx.fillStyle = this.isNight ? '#0e111a' : isStage3 ? '#e2e8f0' : isStage2 ? '#14381d' : '#855b2f';
    for (let y = firstDune - duneStep; y < endY + duneStep; y += duneStep) {
      ctx.beginPath();
      ctx.moveTo(-roadWidth / 2 - 120, y);
      ctx.quadraticCurveTo(-roadWidth / 2 - 180 + Math.sin(y * 0.01) * 30, y + duneStep / 2, -roadWidth / 2 - 120, y + duneStep);
      ctx.lineTo(-roadWidth / 2, y + duneStep);
      ctx.lineTo(-roadWidth / 2, y);
      ctx.closePath();
      ctx.fill();
    }

    // Distant Right Dunes / Ridges
    ctx.fillStyle = this.isNight ? '#0b0d15' : isStage3 ? '#cbd5e1' : isStage2 ? '#0f2915' : '#714c24';
    for (let y = firstDune - duneStep; y < endY + duneStep; y += duneStep) {
      ctx.beginPath();
      ctx.moveTo(roadWidth / 2 + 120, y);
      ctx.quadraticCurveTo(roadWidth / 2 + 180 + Math.cos(y * 0.01) * 30, y + duneStep / 2, roadWidth / 2 + 120, y + duneStep);
      ctx.lineTo(roadWidth / 2, y + duneStep);
      ctx.lineTo(roadWidth / 2, y);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Road Gravel Shoulders with Texturing
    ctx.fillStyle = this.isNight ? '#171923' : isStage3 ? '#94a3b8' : isStage2 ? '#1e3a1e' : '#5c482c';
    ctx.fillRect(-roadWidth / 2 - 28, startY, 28, endY - startY);
    ctx.fillRect(roadWidth / 2, startY, 28, endY - startY);

    // Shoulder Gravel Stones & Texture Spots
    ctx.fillStyle = this.isNight ? '#0a0b0f' : isStage3 ? '#64748b' : isStage2 ? '#0d1f0d' : '#3d2f1a';
    const pebbleStep = 48;
    const firstPebble = Math.floor(startY / pebbleStep) * pebbleStep;
    for (let y = firstPebble; y < endY; y += pebbleStep) {
      ctx.fillRect(-roadWidth / 2 - 18, y + 10, 4, 6);
      ctx.fillRect(-roadWidth / 2 - 8, y + 28, 3, 4);
      ctx.fillRect(roadWidth / 2 + 8, y + 18, 4, 8);
      ctx.fillRect(roadWidth / 2 + 16, y + 36, 3, 5);
    }

    // 3. Main Asphalt Highway Surface with Gradient Depth
    const asphaltGrad = ctx.createLinearGradient(-roadWidth / 2, 0, roadWidth / 2, 0);
    if (this.isNight) {
      asphaltGrad.addColorStop(0, '#0a0b0e');
      asphaltGrad.addColorStop(0.5, '#12141a');
      asphaltGrad.addColorStop(1, '#0a0b0e');
    } else if (isStage3) {
      asphaltGrad.addColorStop(0, '#334155');
      asphaltGrad.addColorStop(0.5, '#475569');
      asphaltGrad.addColorStop(1, '#334155');
    } else if (isStage2) {
      asphaltGrad.addColorStop(0, '#131b14');
      asphaltGrad.addColorStop(0.5, '#1a271c');
      asphaltGrad.addColorStop(1, '#131b14');
    } else {
      asphaltGrad.addColorStop(0, '#17181c');
      asphaltGrad.addColorStop(0.5, '#22232a');
      asphaltGrad.addColorStop(1, '#17181c');
    }

    ctx.fillStyle = asphaltGrad;
    ctx.fillRect(-roadWidth / 2, startY, roadWidth, endY - startY);

    // 4. Asphalt Micro-Cracks & Wear Marks
    ctx.strokeStyle = this.isNight ? '#050608' : 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1.2;
    for (let y = firstPebble; y < endY; y += 140) {
      ctx.beginPath();
      ctx.moveTo(-50, y + 20);
      ctx.lineTo(-42, y + 35);
      ctx.lineTo(-45, y + 50);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(60, y + 80);
      ctx.lineTo(68, y + 95);
      ctx.lineTo(62, y + 110);
      ctx.stroke();
    }

    // 5. Dynamic Tire Skid Marks
    for (const sm of this.skidMarks) {
      if (sm.y < startY || sm.y > endY) continue;
      ctx.save();
      ctx.translate(sm.x, sm.y);
      ctx.rotate(sm.angle);
      ctx.fillStyle = `rgba(10, 10, 12, ${sm.alpha * 0.75})`;
      ctx.fillRect(-3, -12, 6, 24);
      ctx.restore();
    }

    // 6. Solid Outer Highway Borders (White / Red-White Curbs)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-roadWidth / 2 + 2, startY, 4, endY - startY);
    ctx.fillRect(roadWidth / 2 - 6, startY, 4, endY - startY);

    // Red-White Hazard Curb Strips
    const curbStep = 30;
    const firstCurb = Math.floor(startY / curbStep) * curbStep;
    for (let y = firstCurb; y < endY; y += curbStep) {
      ctx.fillStyle = (Math.floor(y / curbStep) % 2 === 0) ? '#dc2626' : '#ffffff';
      ctx.fillRect(-roadWidth / 2 - 2, y, 4, curbStep);
      ctx.fillRect(roadWidth / 2 - 2, y, 4, curbStep);
    }

    // 7. Center Double Yellow Dashed Lines with Glowing Reflective Cat-Eye Studs
    const dashLength = 45;
    const gapLength = 28;
    const step = dashLength + gapLength;
    const firstDash = Math.floor(startY / step) * step;

    for (let y = firstDash; y < endY; y += step) {
      // Double Yellow Strips
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-7, y, 3.5, dashLength);
      ctx.fillRect(3.5, y, 3.5, dashLength);

      // Solar Reflective Road Stud (Cat-Eye) with Bloom
      const studY = y + dashLength - 5;
      ctx.fillStyle = this.isNight ? '#fde047' : '#fef08a';
      ctx.fillRect(-2, studY, 4, 5);

      if (this.isNight) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
        ctx.beginPath();
        ctx.arc(0, studY + 2.5, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. Lane Divider White Dashes (4 Lanes total)
    ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
    for (let y = firstDash; y < endY; y += step) {
      ctx.fillRect(-roadWidth / 4, y, 2, dashLength * 0.65);
      ctx.fillRect(roadWidth / 4, y, 2, dashLength * 0.65);
    }

    // 9. Roadside Highway Solar Light Poles (at night with volumetric ground light pools)
    const lampStep = 800;
    const firstLamp = Math.floor(startY / lampStep) * lampStep;
    for (let y = firstLamp; y < endY; y += lampStep) {
      // Lamp Base & Pole
      ctx.fillStyle = '#334155';
      ctx.fillRect(-roadWidth / 2 - 45, y - 3, 45, 6);
      // Arm & Lamp Head
      ctx.fillRect(-roadWidth / 2 - 45, y - 3, 4, 24);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-roadWidth / 2 - 43, y + 18, 6, 8);

      // Solar panel on top
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-roadWidth / 2 - 49, y - 8, 4, 16);

      // Lamp Light Emitting Core
      ctx.fillStyle = this.isNight ? '#67e8f9' : '#e2e8f0';
      ctx.fillRect(-roadWidth / 2 - 39, y + 19, 3, 6);

      // Volumetric Ground Light Pool at Night
      if (this.isNight) {
        const lampLight = ctx.createRadialGradient(-roadWidth / 4, y + 22, 10, -roadWidth / 4, y + 22, 120);
        lampLight.addColorStop(0, 'rgba(103, 232, 249, 0.22)');
        lampLight.addColorStop(0.6, 'rgba(103, 232, 249, 0.08)');
        lampLight.addColorStop(1, 'rgba(103, 232, 249, 0)');
        ctx.fillStyle = lampLight;
        ctx.beginPath();
        ctx.ellipse(-roadWidth / 4, y + 22, 60, 100, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 10. Roadside Milestone Marker Posts (Cột Mốc KM)
    const kmStep = 1000;
    const firstKm = Math.floor(startY / kmStep) * kmStep;
    for (let y = firstKm; y < endY; y += kmStep) {
      const kmDistance = -y;
      if (kmDistance < 0) continue;
      const kmNumber = (kmDistance / 10000).toFixed(1);
      ctx.save();
      ctx.translate(-roadWidth / 2 - 28, y);
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(6, -10, 4, 20);
      // Concrete Post
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-18, -10, 24, 20);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-18, -10, 8, 20);
      // Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`KM`, 0, -2);
      ctx.fillText(`${kmNumber}`, 0, 5);
      ctx.restore();
    }

    // 11. Biome Roadside Flora & Rocks
    const plantStep = 240;
    const firstPlant = Math.floor(startY / plantStep) * plantStep;
    for (let y = firstPlant; y < endY; y += plantStep) {
      if (isStage3) {
        // Frosted Pine Tree
        ctx.fillStyle = '#334155';
        ctx.fillRect(-roadWidth / 2 - 40, y + 20, 20, 6);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-roadWidth / 2 - 58, y + 23);
        ctx.lineTo(-roadWidth / 2 - 38, y + 36);
        ctx.lineTo(-roadWidth / 2 - 38, y + 10);
        ctx.closePath();
        ctx.fill();
      } else if (isStage2) {
        // Bioluminescent Toxic Fungi
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-roadWidth / 2 - 32, y + 18, 16, 6);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-roadWidth / 2 - 34, y + 21, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#86efac';
        ctx.fillRect(-roadWidth / 2 - 37, y + 18, 3, 3);
        ctx.fillRect(-roadWidth / 2 - 36, y + 23, 2, 2);
      } else {
        // Desert Saguaro Cactus
        ctx.fillStyle = this.isNight ? '#16381b' : '#2d5a27';
        ctx.fillRect(-roadWidth / 2 - 45, y + 20, 30, 10);
        ctx.fillRect(-roadWidth / 2 - 38, y + 10, 6, 10);
        ctx.fillRect(-roadWidth / 2 - 46, y + 10, 12, 6);
        ctx.fillRect(-roadWidth / 2 - 32, y + 24, 6, 12);
        ctx.fillRect(-roadWidth / 2 - 42, y + 30, 14, 6);

        // Cactus Blossom
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-roadWidth / 2 - 48, y + 23, 4, 4);

        // Weathered Desert Rocks
        ctx.fillStyle = this.isNight ? '#2a1b10' : '#854d0e';
        ctx.beginPath();
        ctx.ellipse(roadWidth / 2 + 32, y + 85, 11, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 12. Heat Shimmer Mirage distortion waves (when ambientTemp >= 40 C)
    if (this.ambientTemp >= 40 && !this.isNight) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.8;
      const shimmerStep = 100;
      const firstShimmer = Math.floor(startY / shimmerStep) * shimmerStep;
      for (let sy = firstShimmer; sy < endY; sy += shimmerStep) {
        ctx.beginPath();
        for (let seg = 0; seg < 70; seg += 10) {
          const waveX = Math.sin(this.heatShimmerOffset + (sy + seg) * 0.06) * 4.5;
          if (seg === 0) ctx.moveTo(-25 + waveX, sy + seg);
          else ctx.lineTo(-25 + waveX, sy + seg);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let seg = 0; seg < 70; seg += 10) {
          const waveX = Math.sin(this.heatShimmerOffset + (sy + seg) * 0.06 + 1.5) * 4.5;
          if (seg === 0) ctx.moveTo(25 + waveX, sy + seg);
          else ctx.lineTo(25 + waveX, sy + seg);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawHazardZones(ctx: CanvasRenderingContext2D) {
    const roadWidth = 280;
    const time = performance.now() / 1000;

    for (const zone of this.hazardZones) {
      const zoneStart = -(zone.x + zone.length / 2);
      const zoneEnd = -(zone.x - zone.length / 2);

      if (zoneStart > this.cameraY + this.height || zoneEnd < this.cameraY - this.height) continue;

      ctx.save();

      // Zone Road Atmospheric Tint
      if (zone.type === 'sandstorm') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
      } else if (zone.type === 'toxic_mire') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      } else if (zone.type === 'heatwave') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      } else if (zone.type === 'bandit_ambush') {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.25)';
      } else {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.25)';
      }
      ctx.fillRect(-roadWidth / 2, zoneStart, roadWidth, zone.length);

      // Warning Diagonal Stripes on Road Edges
      const stripeStep = 45;
      const startStripe = Math.floor(zoneStart / stripeStep) * stripeStep;
      for (let sy = startStripe; sy < zoneEnd; sy += stripeStep) {
        ctx.fillStyle = (Math.floor(sy / stripeStep) % 2 === 0) ? '#eab308' : '#000000';
        ctx.fillRect(-roadWidth / 2, sy, 6, stripeStep);
        ctx.fillRect(roadWidth / 2 - 6, sy, 6, stripeStep);
      }

      // Warning Entry & Exit Pylons with Flashing Emergency Strobes
      [zoneStart, zoneEnd].forEach((signY, idx) => {
        ctx.save();
        ctx.translate(-roadWidth / 2 - 38, signY);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, -3, 38, 6);

        // Warning Triangle Sign
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(0, 22);
        ctx.lineTo(0, -22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', -6, 4);

        // Flashing Strobe Light on top of Sign
        const strobePulse = Math.sin(time * 8 + signY) > 0;
        ctx.fillStyle = strobePulse ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(-32, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        if (strobePulse) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.beginPath();
          ctx.arc(-32, 0, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Zone Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(idx === 0 ? `⚠️ VÀO: ${zone.name}` : `✓ HẾT: ${zone.name}`, 0, -18);
        ctx.restore();
      });

      // Animated Floating Center Hologram Icon
      const iconBob = Math.sin(time * 3 + zone.x) * 6;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.icon, -roadWidth / 2 - 14 + iconBob, -zone.x);

      ctx.restore();
    }
  }

  private drawSupplyStations(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;

    for (const station of this.stations) {
      const stationWorldY = -station.x;
      if (Math.abs(stationWorldY - this.cameraY) > this.height + 100) continue;

      ctx.save();
      ctx.translate(140 + 65, stationWorldY);

      // Station Pavement Foundation
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-35, -70, 70, 140);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(-35, -70, 70, 140);

      // Parking Bay Markings
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-25, -55, 50, 110);

      // Volumetric Canopy Floodlights (Light pool on ground)
      const floodGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
      floodGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      floodGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.1)');
      floodGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = floodGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();

      // Dual High-Tech Fuel Pump Terminals
      [-40, 30].forEach((pumpY) => {
        // Pump Column
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-22, pumpY, 44, 22);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-22, pumpY, 44, 22);

        // Digital LED Meter Screen
        ctx.fillStyle = '#082f49';
        ctx.fillRect(-16, pumpY + 3, 12, 16);
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('99L', -10, pumpY + 13);

        // Nozzle & Hose
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, pumpY + 18, 14, 3);
      });

      // Futuristic Canopy Roof Architecture
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-42, -60);
      ctx.lineTo(-42, 60);
      ctx.lineTo(-60, 50);
      ctx.lineTo(-60, -50);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Cyber Neon Signboard (`POST-APOCALYPSE OASIS`)
      const neonGlow = Math.sin(time * 4) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(0, 242, 255, ${neonGlow})`;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ ${station.name.toUpperCase()} ⚡`, 0, -78);

      // Interaction Prompt Badge
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('🛒 [E] MUA TIẾP TẾ & NẠP XĂNG', 0, 84);

      ctx.restore();
    }
  }

  private drawChests(ctx: CanvasRenderingContext2D) {
    const rarityConfig: Record<ItemRarity, { main: string; light: string; glow: string; border: string; particleColor: string; beamAlpha: number }> = {
      common: { main: '#71717a', light: '#a1a1aa', glow: 'rgba(161, 161, 170, 0.45)', border: '#3f3f46', particleColor: '#e4e4e7', beamAlpha: 0.15 },
      good: { main: '#16a34a', light: '#4ade80', glow: 'rgba(74, 222, 128, 0.55)', border: '#15803d', particleColor: '#86efac', beamAlpha: 0.25 },
      superior: { main: '#0284c7', light: '#38bdf8', glow: 'rgba(56, 189, 248, 0.65)', border: '#0369a1', particleColor: '#7dd3fc', beamAlpha: 0.35 },
      perfect: { main: '#9333ea', light: '#c084fc', glow: 'rgba(192, 132, 252, 0.75)', border: '#7e22ce', particleColor: '#e9d5ff', beamAlpha: 0.45 },
      epic: { main: '#d97706', light: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)', border: '#b45309', particleColor: '#fde68a', beamAlpha: 0.55 },
      brilliant: { main: '#e11d48', light: '#fb7185', glow: 'rgba(244, 63, 94, 0.95)', border: '#be123c', particleColor: '#fda4af', beamAlpha: 0.7 },
    };

    const time = performance.now() / 1000;

    for (const chest of this.chests) {
      const chestWorldY = -chest.x;
      if (Math.abs(chestWorldY - this.cameraY) > this.height + 80) continue;

      ctx.save();
      const bobY = !chest.isOpened ? Math.sin(time * 3 + chest.x) * 3 : 0;
      ctx.translate(chest.laneOffset, chestWorldY + bobY);

      const color = rarityConfig[chest.rarity] || rarityConfig.common;

      if (!chest.isOpened) {
        // 1. Holographic Vertical Sky Beacon Column
        const beamGrad = ctx.createLinearGradient(0, 0, 0, -220);
        beamGrad.addColorStop(0, color.glow);
        beamGrad.addColorStop(0.7, color.glow.replace(/[\d\.]+\)$/, `${color.beamAlpha})`));
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(-12, -220, 24, 220);

        // 2. Pulsating Planetary Glow Aura
        ctx.fillStyle = color.glow;
        ctx.beginPath();
        ctx.arc(0, 0, 28 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
        ctx.fill();

        // 3. Orbiting Sparkle Dust
        const orbitAngle = time * 2.8 + chest.x;
        ctx.fillStyle = color.particleColor;
        const sparkX1 = Math.cos(orbitAngle) * 24;
        const sparkY1 = Math.sin(orbitAngle) * 14;
        ctx.fillRect(sparkX1 - 2, sparkY1 - 2, 4, 4);

        const sparkX2 = Math.cos(orbitAngle + Math.PI) * 24;
        const sparkY2 = Math.sin(orbitAngle + Math.PI) * 14;
        ctx.fillRect(sparkX2 - 2, sparkY2 - 2, 4, 4);
      }

      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 12 - bobY, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chest Main Body
      ctx.fillStyle = chest.isOpened ? '#3f3f46' : color.main;
      ctx.fillRect(-16, -11, 32, 22);

      // Chest Lid with Specular Edge
      ctx.fillStyle = chest.isOpened ? '#52525b' : color.light;
      ctx.fillRect(-16, -11, 32, 7);

      // Metallic Reinforced Corner Straps
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-16, -11, 5, 5);
      ctx.fillRect(11, -11, 5, 5);
      ctx.fillRect(-16, 6, 5, 5);
      ctx.fillRect(11, 6, 5, 5);

      // Sci-Fi Glowing Energy Core / Keyhole Latch
      ctx.fillStyle = chest.isOpened ? '#18181b' : '#00f2ff';
      ctx.fillRect(-4, -6, 8, 12);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-1.5, -2, 3, 5);

      ctx.strokeStyle = color.border;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-16, -11, 32, 22);

      // Chest Rarity & Interaction Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const label = chest.isOpened ? '📦 ĐÃ MỞ' : `✨ [E] RƯƠNG ${chest.rarity.toUpperCase()}`;
      ctx.fillText(label, 0, -20);

      ctx.restore();
    }
  }

  private drawBeasts(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;

    for (const beast of this.beasts) {
      const beastWorldY = -beast.x;
      if (Math.abs(beastWorldY - this.cameraY) > this.height + 90) continue;

      ctx.save();
      ctx.translate(beast.laneOffset, beastWorldY);

      if (beast.isDead) {
        // Corpse Remains with Translucent Cyber / Bio Glow & Pulsing Extraction Beacon
        const corpsePulse = Math.sin(time * 3 + beast.x) * 0.25 + 0.75;
        
        // Ground blood / residue puddle
        ctx.fillStyle = beast.element === 'poison' ? 'rgba(34, 197, 94, 0.4)' : beast.element === 'cyber' ? 'rgba(0, 242, 255, 0.35)' : beast.element === 'dark' ? 'rgba(147, 51, 234, 0.4)' : 'rgba(153, 27, 27, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Skeletal Remains / Broken Chassis
        ctx.fillStyle = '#27272a';
        ctx.fillRect(-14, -6, 28, 12);
        ctx.fillStyle = '#52525b';
        ctx.fillRect(-10, -4, 20, 8);

        // Holographic Harvest Beacon
        const beaconGrad = ctx.createLinearGradient(0, 0, 0, -45);
        beaconGrad.addColorStop(0, `rgba(250, 204, 21, ${0.8 * corpsePulse})`);
        beaconGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = beaconGrad;
        ctx.fillRect(-8, -45, 16, 45);

        // Interaction Tag
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 6;
        ctx.fillText('🥩 [E] THU HOẠCH NGUYÊN LIỆU', 0, -18);
        ctx.shadowBlur = 0;
        ctx.restore();
        continue;
      }

      // Dynamic Movement & Breathing Bobbing
      const walkCycle = Math.sin(time * 6 + beast.x);
      const breathY = Math.sin(time * 4 + beast.x) * 2.5;
      let size = 26;

      // Realistic Dynamic Ground Shadow
      const shadowScale = (beast.isBoss ? 1.8 : 1.0);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 18 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Enraged Aura (Flames & Red Vortex)
      if (beast.isEnraged) {
        ctx.save();
        const rageGrad = ctx.createRadialGradient(0, breathY, 10, 0, breathY, 36);
        rageGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
        rageGrad.addColorStop(0.6, 'rgba(220, 38, 38, 0.3)');
        rageGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = rageGrad;
        ctx.beginPath();
        ctx.arc(0, breathY, 36 + Math.sin(time * 8) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Hit Flash Overlay
      const isHitFlashing = beast.hitFlash && beast.hitFlash > 0;

      // ==========================================
      // HIGH-FIDELITY PROCEDURAL BEAST RENDERING
      // ==========================================
      ctx.save();
      if (isHitFlashing) {
        ctx.filter = 'brightness(2.2) drop-shadow(0 0 8px white)';
      }

      // 1. NIGHT STALKER (Dạ Ma Khát Máu - Dark Void Assassin)
      if (beast.type === 'night_stalker') {
        size = 34;
        // Swirling Dark Matter Void Aura
        const voidGrad = ctx.createRadialGradient(0, breathY, 8, 0, breathY, 28);
        voidGrad.addColorStop(0, 'rgba(126, 34, 206, 0.9)');
        voidGrad.addColorStop(0.6, 'rgba(59, 7, 100, 0.6)');
        voidGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = voidGrad;
        ctx.beginPath();
        ctx.arc(0, breathY, 28, 0, Math.PI * 2);
        ctx.fill();

        // Animated Shadow Scythe Tentacles
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 3;
        for (let i = -1; i <= 1; i += 2) {
          const tentacleAngle = time * 4 + i;
          ctx.beginPath();
          ctx.moveTo(i * 12, breathY);
          ctx.quadraticCurveTo(i * 26 + Math.sin(tentacleAngle) * 6, breathY - 14, i * 20, breathY + 14);
          ctx.stroke();
        }

        // Obsidian Torso Core
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(0, breathY, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4 Piercing Demon Crimson Eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-7, breathY - 6, 3, 3);
        ctx.fillRect(4, breathY - 6, 3, 3);
        ctx.fillRect(-4, breathY - 1, 3, 3);
        ctx.fillRect(1, breathY - 1, 3, 3);
      }

      // 2. DESERT SCORPION & GOLDEN SCORPION (Articulated Chitin & Toxic Tail)
      else if (beast.type === 'desert_scorpion' || beast.type === 'golden_scorpion') {
        const isGold = beast.type === 'golden_scorpion';
        size = isGold ? 42 : 28;

        // Animated Walking Legs
        ctx.strokeStyle = isGold ? '#d97706' : '#78350f';
        ctx.lineWidth = 2;
        for (let leg = -2; leg <= 2; leg++) {
          const legPhase = walkCycle * 4 + leg;
          // Left leg
          ctx.beginPath();
          ctx.moveTo(-10, breathY + leg * 5);
          ctx.lineTo(-20 + Math.sin(legPhase) * 4, breathY + leg * 5 + 6);
          ctx.stroke();
          // Right leg
          ctx.beginPath();
          ctx.moveTo(10, breathY + leg * 5);
          ctx.lineTo(20 + Math.cos(legPhase) * 4, breathY + leg * 5 + 6);
          ctx.stroke();
        }

        // Segmented Chitin Carapace Plates
        for (let seg = 0; seg < 4; seg++) {
          const segWidth = (18 - seg * 3) * (isGold ? 1.3 : 1.0);
          const segY = breathY - 6 + seg * 6;
          ctx.fillStyle = isGold ? (seg % 2 === 0 ? '#fbbf24' : '#d97706') : (seg % 2 === 0 ? '#92400e' : '#78350f');
          ctx.fillRect(-segWidth / 2, segY, segWidth, 5);
          ctx.strokeStyle = isGold ? '#fef08a' : '#451a03';
          ctx.lineWidth = 1;
          ctx.strokeRect(-segWidth / 2, segY, segWidth, 5);
        }

        // Dual Pincer Claws with Spikes
        const pincerGrip = Math.sin(time * 5) * 3;
        ctx.fillStyle = isGold ? '#f59e0b' : '#b45309';
        // Left Pincer
        ctx.fillRect(-18, breathY - 18, 8, 10);
        ctx.fillRect(-22, breathY - 24 + pincerGrip, 5, 8);
        ctx.fillRect(-15, breathY - 24 - pincerGrip, 5, 8);
        // Right Pincer
        ctx.fillRect(10, breathY - 18, 8, 10);
        ctx.fillRect(10, breathY - 24 + pincerGrip, 5, 8);
        ctx.fillRect(17, breathY - 24 - pincerGrip, 5, 8);

        // Arched Tail & Toxic Bulb
        ctx.strokeStyle = isGold ? '#b45309' : '#451a03';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, breathY + 14);
        ctx.quadraticCurveTo(18, breathY + 22, 14, breathY - 18);
        ctx.stroke();

        // Pulsating Venom Stinger Bulb
        const venomGlow = Math.sin(time * 6) * 0.3 + 0.7;
        ctx.fillStyle = isGold ? `rgba(250, 204, 21, ${venomGlow})` : `rgba(34, 197, 94, ${venomGlow})`;
        ctx.beginPath();
        ctx.arc(14, breathY - 18, isGold ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isGold ? '#ffffff' : '#4ade80';
        ctx.fillRect(16, breathY - 22, 3, 5);
      }

      // 3. SAND WYRM & SAND BEHEMOTH (Colossal Sand Leviathan & Magma Maw)
      else if (beast.type === 'sand_wyrm' || beast.type === 'sand_behemoth') {
        const isBoss = beast.type === 'sand_behemoth';
        size = isBoss ? 52 : 38;

        // Sand Dust Whirlpool underneath
        ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, breathY, size * 0.9, size * 0.55, time * 2, 0, Math.PI * 2);
        ctx.fill();

        // Segmented Serpentine Body
        for (let i = 4; i >= 0; i--) {
          const segOffset = Math.sin(time * 5 + i * 0.8) * 8;
          const segRadius = (size * 0.6) - i * 3;
          ctx.fillStyle = isBoss ? (i % 2 === 0 ? '#b91c1c' : '#7f1d1d') : (i % 2 === 0 ? '#b45309' : '#78350f');
          ctx.beginPath();
          ctx.ellipse(segOffset, breathY + i * 9, segRadius, segRadius * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isBoss ? '#f87171' : '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Giant Primary Head & Serrated Maw
        ctx.fillStyle = isBoss ? '#991b1b' : '#92400e';
        ctx.beginPath();
        ctx.ellipse(0, breathY - 6, size * 0.65, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gaping Maw with Magma Core
        const mawGlow = ctx.createRadialGradient(0, breathY - 6, 2, 0, breathY - 6, 12);
        mawGlow.addColorStop(0, isBoss ? '#fef08a' : '#fde047');
        mawGlow.addColorStop(0.7, isBoss ? '#ef4444' : '#d97706');
        mawGlow.addColorStop(1, '#000000');
        ctx.fillStyle = mawGlow;
        ctx.beginPath();
        ctx.ellipse(0, breathY - 6, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sharp Razor White Teeth Rings
        ctx.fillStyle = '#ffffff';
        for (let t = 0; t < 6; t++) {
          const angle = (t / 6) * Math.PI * 2;
          const tx = Math.cos(angle) * 11;
          const ty = Math.sin(angle) * 7;
          ctx.fillRect(tx - 1, breathY - 6 + ty - 1, 2.5, 2.5);
        }
      }

      // 4. MECHA CHIMERA (Cybernetic Augmented Apex Boss)
      else if (beast.type === 'mecha_chimera') {
        size = 46;
        // Titanium Angular Chassis Armor
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-22, breathY - 14, 44, 28);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, breathY - 10, 36, 20);

        // Neon Cyber Circuitry Paths (Cyan & Orange)
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, breathY - 8);
        ctx.lineTo(-4, breathY);
        ctx.lineTo(-14, breathY + 8);
        ctx.stroke();

        ctx.strokeStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(16, breathY - 8);
        ctx.lineTo(4, breathY);
        ctx.lineTo(14, breathY + 8);
        ctx.stroke();

        // Dual Shoulder Plasma Cannons
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-26, breathY - 20, 10, 16);
        ctx.fillRect(16, breathY - 20, 10, 16);
        ctx.fillStyle = '#00f2ff';
        ctx.fillRect(-24, breathY - 24, 6, 6);
        ctx.fillRect(18, breathY - 24, 6, 6);

        // Laser Aiming Beam
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, breathY - 14);
        ctx.lineTo(0, breathY - 90);
        ctx.stroke();

        // Optical Laser Eye Visor
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, breathY - 12, 16, 4);
      }

      // 5. MUTANT VULTURE & TWIN-HEAD DEATH VULTURE
      else if (beast.type === 'mutant_vulture' || beast.type === 'twin_vulture') {
        const isTwin = beast.type === 'twin_vulture';
        size = isTwin ? 44 : 30;

        // Animated Flapping Wings
        const wingFlap = Math.sin(time * 8) * 16;
        ctx.fillStyle = isTwin ? '#450a0a' : '#27272a';
        ctx.beginPath();
        ctx.moveTo(0, breathY);
        ctx.lineTo(-30, breathY - 10 + wingFlap);
        ctx.lineTo(-18, breathY + 12);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, breathY);
        ctx.lineTo(30, breathY - 10 + wingFlap);
        ctx.lineTo(18, breathY + 12);
        ctx.closePath();
        ctx.fill();

        // Skeletal Feathered Body
        ctx.fillStyle = isTwin ? '#7f1d1d' : '#3f3f46';
        ctx.fillRect(-10, breathY - 12, 20, 24);

        // Heads & Beaks
        if (isTwin) {
          // Left Head
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(-14, breathY - 20, 9, 10);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-18, breathY - 18, 5, 4);
          // Right Head
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(5, breathY - 20, 9, 10);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(13, breathY - 18, 5, 4);
        } else {
          ctx.fillStyle = '#52525b';
          ctx.fillRect(-5, breathY - 18, 10, 10);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-2, breathY - 22, 4, 6);
        }
      }

      // 6. INFERNAL HOUND, WOLF & DESERT HYENA
      else if (beast.type === 'infernal_hound' || beast.type === 'wolf' || beast.type === 'desert_hyena') {
        const isFire = beast.type === 'infernal_hound';
        size = 28;

        // Muscular Quadruped Body
        ctx.fillStyle = isFire ? '#7f1d1d' : beast.type === 'desert_hyena' ? '#78716c' : '#475569';
        ctx.fillRect(-10, breathY - 8, 20, 18);

        // Fiery Mane / Spines
        if (isFire) {
          ctx.fillStyle = '#f97316';
          for (let m = -3; m <= 3; m++) {
            ctx.fillRect(m * 3, breathY - 14 + Math.sin(time * 8 + m) * 3, 2.5, 7);
          }
        }

        // Snout & Fangs
        ctx.fillStyle = isFire ? '#991b1b' : '#334155';
        ctx.fillRect(-7, breathY - 15, 14, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, breathY - 8, 2.5, 3);
        ctx.fillRect(2.5, breathY - 8, 2.5, 3);

        // Animated Paws
        ctx.fillStyle = isFire ? '#450a0a' : '#1e293b';
        ctx.fillRect(-12 + Math.sin(walkCycle * 4) * 3, breathY + 8, 5, 7);
        ctx.fillRect(7 - Math.sin(walkCycle * 4) * 3, breathY + 8, 5, 7);
      }

      // 7. FROST SPECTER & EVIL SPIRIT (Ethereal Hovering Apparitions)
      else if (beast.type === 'frost_specter' || beast.type === 'evil_spirit') {
        const isFrost = beast.type === 'frost_specter';
        size = 32;

        // Ethereal Mist Aura
        const mistGrad = ctx.createRadialGradient(0, breathY, 4, 0, breathY, 24);
        mistGrad.addColorStop(0, isFrost ? 'rgba(103, 232, 249, 0.85)' : 'rgba(192, 132, 252, 0.85)');
        mistGrad.addColorStop(0.7, isFrost ? 'rgba(14, 116, 144, 0.4)' : 'rgba(107, 33, 168, 0.4)');
        mistGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(0, breathY, 24, 0, Math.PI * 2);
        ctx.fill();

        // Spectral Cloak with Flowing Wisps
        ctx.fillStyle = isFrost ? '#0891b2' : '#6b21a8';
        ctx.beginPath();
        ctx.moveTo(-12, breathY - 14);
        ctx.quadraticCurveTo(0, breathY - 20, 12, breathY - 14);
        ctx.lineTo(16 + Math.sin(time * 4) * 4, breathY + 16);
        ctx.lineTo(0, breathY + 10);
        ctx.lineTo(-16 - Math.sin(time * 4) * 4, breathY + 16);
        ctx.closePath();
        ctx.fill();

        // Spectral Eyes / Core
        ctx.fillStyle = isFrost ? '#e0f2fe' : '#f3e8ff';
        ctx.fillRect(-6, breathY - 8, 3, 5);
        ctx.fillRect(3, breathY - 8, 3, 5);
      }

      // 8. TIGER, LION, LEOPARD & BEAR
      else if (beast.type === 'tiger' || beast.type === 'lion' || beast.type === 'leopard' || beast.type === 'bear') {
        size = beast.type === 'bear' ? 36 : 30;

        // Heavy Predator Body
        ctx.fillStyle = beast.type === 'tiger' ? '#ea580c' : beast.type === 'lion' ? '#ca8a04' : beast.type === 'bear' ? '#451a03' : '#eab308';
        ctx.fillRect(-12, breathY - 10, 24, 20);

        // Distinctive Coat Markings
        if (beast.type === 'tiger') {
          ctx.fillStyle = '#09090b';
          ctx.fillRect(-10, breathY - 7, 5, 2);
          ctx.fillRect(5, breathY - 7, 5, 2);
          ctx.fillRect(-10, breathY + 2, 5, 2);
          ctx.fillRect(5, breathY + 2, 5, 2);
        } else if (beast.type === 'lion') {
          // Glorious Lion Mane
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(0, breathY - 10, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Head
        ctx.fillStyle = beast.type === 'tiger' ? '#ea580c' : beast.type === 'bear' ? '#58240c' : '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, breathY - 10, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      // 9. ARMORED RHINO & BUFFALO
      else if (beast.type === 'armored_rhino' || beast.type === 'buffalo') {
        size = 38;
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, breathY - 12, 36, 24);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-14, breathY - 9, 28, 18);

        // Horn / Battering Ram
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(16, breathY - 9);
        ctx.lineTo(30, breathY - 2);
        ctx.lineTo(16, breathY + 5);
        ctx.closePath();
        ctx.fill();
      }

      // 10. BANDIT (Cyber Raider)
      else if (beast.type === 'bandit') {
        size = 26;
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(-9, breathY - 11, 18, 22);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(2, breathY - 8, 8, 4);

        // Tactical Rifle & Aiming Laser Beam
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(7, breathY, 14, 5);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(21, breathY + 2);
        ctx.lineTo(85, breathY + 2);
        ctx.stroke();
      }

      // 11. SNAKE, CAT, MOUSE (Small Wildlife)
      else {
        size = 20;
        if (beast.type === 'snake') {
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(-14, breathY + Math.sin(time * 6) * 4);
          ctx.quadraticCurveTo(0, breathY - 8, 14, breathY + Math.cos(time * 6) * 4);
          ctx.stroke();
        } else {
          ctx.fillStyle = beast.type === 'cat' ? '#ca8a04' : '#71717a';
          ctx.beginPath();
          ctx.arc(0, breathY, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Glowing Predator Eyes
      ctx.fillStyle = beast.isPacified ? '#ec4899' : (beast.isEnraged ? '#ef4444' : this.isNight ? '#f87171' : '#fef08a');
      ctx.fillRect(4, breathY - 4, 3.5, 3.5);
      ctx.fillRect(4, breathY + 2, 3.5, 3.5);

      ctx.restore(); // End hit flash / model rendering

      // ==========================================
      // SCI-FI HOLOGRAM HEALTH BAR & STATUS TAGS
      // ==========================================
      const hpPct = Math.max(0, beast.hp / beast.maxHp);
      const barWidth = beast.isBoss ? 56 : 42;
      const barY = -size / 2 - 14;

      // Bar Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-barWidth / 2, barY, barWidth, 6);

      // HP Bar Fill with Enraged / Boss styling
      const hpGrad = ctx.createLinearGradient(-barWidth / 2, 0, barWidth / 2, 0);
      if (beast.isEnraged) {
        hpGrad.addColorStop(0, '#ef4444');
        hpGrad.addColorStop(1, '#f97316');
      } else if (hpPct > 0.5) {
        hpGrad.addColorStop(0, '#10b981');
        hpGrad.addColorStop(1, '#34d399');
      } else if (hpPct > 0.25) {
        hpGrad.addColorStop(0, '#f59e0b');
        hpGrad.addColorStop(1, '#fbbf24');
      } else {
        hpGrad.addColorStop(0, '#dc2626');
        hpGrad.addColorStop(1, '#ef4444');
      }
      ctx.fillStyle = hpGrad;
      ctx.fillRect(-barWidth / 2, barY, barWidth * hpPct, 6);

      // Bar Outline Frame
      ctx.strokeStyle = beast.isBoss ? '#fbbf24' : '#475569';
      ctx.lineWidth = beast.isBoss ? 1.5 : 1;
      ctx.strokeRect(-barWidth / 2, barY, barWidth, 6);

      // Element & Name Tag
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      
      let elementIcon = '⚔️';
      if (beast.element === 'poison') elementIcon = '🧪';
      else if (beast.element === 'fire') elementIcon = '🔥';
      else if (beast.element === 'dark') elementIcon = '🌑';
      else if (beast.element === 'cyber') elementIcon = '⚡';
      else if (beast.element === 'frost') elementIcon = '❄️';

      let title = `${elementIcon} ${beast.name}`;
      if (beast.isEnraged) title = `🔥 [CUỒNG NỘ] ${beast.name}`;
      if (beast.isPacified) title = `💖 [THÂN THIỆN] ${beast.name}`;

      ctx.fillStyle = beast.isBoss ? '#fde047' : beast.isEnraged ? '#f87171' : '#ffffff';
      ctx.shadowColor = beast.isBoss ? '#eab308' : '#000000';
      ctx.shadowBlur = beast.isBoss ? 6 : 3;
      ctx.fillText(title, 0, barY - 4);
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  private drawSpeedLines(ctx: CanvasRenderingContext2D) {
    if (this.mode !== 'driving' || this.carSpeed < 30) return;
    const speedRatio = Math.min(1, (this.carSpeed - 30) / 70);
    const numLines = Math.floor(6 + speedRatio * 14);
    const time = performance.now() / 1000;

    ctx.save();
    ctx.lineWidth = 1.4;

    for (let i = 0; i < numLines; i++) {
      const laneSeed = ((i * 47) % 240) - 120;
      const length = 50 + speedRatio * 130 + ((i * 29) % 50);
      const lineSpeed = 850 + speedRatio * 900;
      const yOffset = ((time * lineSpeed + i * 110) % (this.height + 400));
      const lineY = this.carY - 260 + yOffset;
      const lineX = this.carX + laneSeed;

      const alpha = 0.12 + speedRatio * 0.28;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX, lineY + length);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawCar(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.carX, this.carY);
    ctx.rotate(this.carAngle);

    const speedRatio = Math.min(1, this.carSpeed / Math.max(1, this.maxSpeed));
    const now = performance.now();

    // 1. Vehicle Dynamic Ground Shadow & Underglow Neon
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Underglow Neon Cyberpunk LED (Cyan Glow, brighter at high speed)
    const neonIntensity = 0.35 + speedRatio * 0.25;
    const underglow = ctx.createRadialGradient(0, 0, 10, 0, 0, 42);
    underglow.addColorStop(0, `rgba(0, 242, 255, ${neonIntensity})`);
    underglow.addColorStop(0.7, `rgba(0, 242, 255, ${neonIntensity * 0.35})`);
    underglow.addColorStop(1, 'rgba(0, 242, 255, 0)');
    ctx.fillStyle = underglow;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nitro Speed Flame from Dual Exhaust (Shooting DOWNWARDS)
    if (this.mode === 'driving' && this.carSpeed > 5) {
      const baseLen = 10 + speedRatio * 20;
      const accelBoost = this.isAccelerating ? 1.4 : 0.8;
      const flameLen = (baseLen + Math.sin(now * 0.06) * 6) * accelBoost;

      // Exhaust 1 (Left)
      ctx.fillStyle = this.isAccelerating ? '#00f2ff' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-10, 35);
      ctx.lineTo(-7, 35 + flameLen);
      ctx.lineTo(-4, 35);
      ctx.closePath();
      ctx.fill();

      // Exhaust 1 Core (White hot)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-9, 35);
      ctx.lineTo(-7, 35 + flameLen * 0.55);
      ctx.lineTo(-5, 35);
      ctx.closePath();
      ctx.fill();

      // Exhaust 2 (Right) when accelerating hard
      if (this.isAccelerating) {
        ctx.fillStyle = '#00f2ff';
        ctx.beginPath();
        ctx.moveTo(4, 35);
        ctx.lineTo(7, 35 + flameLen * 0.85);
        ctx.lineTo(10, 35);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(5, 35);
        ctx.lineTo(7, 35 + flameLen * 0.45);
        ctx.lineTo(9, 35);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 2. 4 Heavy All-Terrain Tires (Left & Right)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-25, -28, 8, 16);
    ctx.fillRect(17, -28, 8, 16);
    ctx.fillRect(-25, 16, 8, 16);
    ctx.fillRect(17, 16, 8, 16);

    // Alloy Wheel Rims with Dynamic Rotation Strobe based on carDistance
    const rimPhase = (this.carDistance * 0.4) % (Math.PI * 2);
    const rimOffset = Math.sin(rimPhase) * 3;
    ctx.fillStyle = this.carSpeed > 50 ? '#cbd5e1' : '#94a3b8';
    ctx.fillRect(-23, -24 + rimOffset * 0.5, 4, 8);
    ctx.fillRect(19, -24 + rimOffset * 0.5, 4, 8);
    ctx.fillRect(-23, 20 + rimOffset * 0.5, 4, 8);
    ctx.fillRect(19, 20 + rimOffset * 0.5, 4, 8);

    // 3. Camper RV Chassis with Metallic Gradient & Aerodynamic Body (Vertical Layout)
    const bodyGrad = ctx.createLinearGradient(-18, 0, 18, 0);
    bodyGrad.addColorStop(0, '#f8fafc');
    bodyGrad.addColorStop(0.4, '#e2e8f0');
    bodyGrad.addColorStop(0.8, '#cbd5e1');
    bodyGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-18, -34, 36, 68);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -34, 36, 68);

    // Front Bumper Bull-Bar (Bọc Thép Chống Va Chạm ở phía trên)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-16, -38, 32, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-12, -39, 24, 3);

    // 4. Tinted Windshield & Cockpit Dashboard Glow
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-14, -28, 28, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-12, -26, 24, 10);

    // Diagonal Glass Specular Reflection Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(8, -26);
    ctx.stroke();

    // Side Tinted Windows
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-16, -6, 4, 18);
    ctx.fillRect(12, -6, 4, 18);
    ctx.fillRect(-16, 16, 32, 14);

    // 5. Roof Amenities (Solar Photovoltaic Grid + Water Reservoir Gauge)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-10, -4, 20, 20);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -4, 20, 20);

    // Solar Cell Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.lineTo(10, 6);
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 16);
    ctx.stroke();

    // Water Tank with Level Bar
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-9, 18, 18, 10);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-7, 20, 14, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1000L', 0, 24);

    // 6. Volumetric Dual Headlights Beam Cones (Shooting UPWARDS)
    if (this.headlightsOn) {
      const beamGrad = ctx.createRadialGradient(0, -36, 10, 0, -240, 190);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
      beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.25)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -36);
      ctx.lineTo(-95, -260);
      ctx.lineTo(95, -260);
      ctx.lineTo(14, -36);
      ctx.closePath();
      ctx.fill();

      // Dual Projector Lenses
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-13, -36, 5, 4);
      ctx.fillRect(8, -36, 5, 4);
    }

    // 7. Dynamic LED Tail-Light Bar with Ground Brake Flare
    const isBraking = this.keys['KeyS'] || this.keys['ArrowDown'];
    ctx.fillStyle = isBraking ? '#ef4444' : '#dc2626';
    ctx.fillRect(-15, 34, 6, 3);
    ctx.fillRect(9, 34, 6, 3);

    if (isBraking) {
      const brakeGlow = ctx.createRadialGradient(0, 40, 5, 0, 40, 50);
      brakeGlow.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      brakeGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = brakeGlow;
      ctx.beginPath();
      ctx.arc(0, 40, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Status Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    const carStatus = this.mode === 'driving' ? '🚐 TUYẾT MỘC (ĐANG LÁI XE)' : '🚐 XE NHÀ RV (ĐANG ĐỖ)';
    ctx.fillText(carStatus, 0, -46);

    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.playerX, this.playerY);
    ctx.scale(this.playerFacing, 1);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluid Running / Walking Legs Animation
    const legOffset = this.isPlayerMoving ? Math.sin(this.walkAnimFrame) * 6 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7 + legOffset, 9, 6, 10);
    ctx.fillRect(2 - legOffset, 9, 6, 10);

    // Cyber Survivor Exosuit Jacket
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-8, -7, 16, 16);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-8, 3, 16, 5);

    // Glowing Cyan Energy Seam
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(-2, -6, 4, 14);

    // Tactical Survival Backpack & Antenna
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-13, -5, 5, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-12, -14, 2, 9);

    // Character Head & Tactical Visor Goggles
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-6, -18, 12, 11);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7, -21, 14, 6);
    // Glowing Cyan Visor
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(2, -16, 6, 4);

    // Equipped Weapon (Plasma Machete / Pistol)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, -3, 12, 4);
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(16, -4, 4, 2);

    // Tactical Flashlight Beam at Night
    if (this.isNight) {
      const flashGrad = ctx.createRadialGradient(12, 0, 5, 140, 0, 90);
      flashGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      flashGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.15)');
      flashGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(150, -50);
      ctx.lineTo(150, 50);
      ctx.closePath();
      ctx.fill();
    }

    // Name Label
    ctx.scale(this.playerFacing, 1);
    ctx.fillStyle = '#00f2ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TUYẾT MỘC', 0, -28);

    ctx.restore();

    this.drawPetDog(ctx);
  }

  private drawPetDog(ctx: CanvasRenderingContext2D) {
    const petX = this.playerX - 26 * this.playerFacing;
    const petY = this.playerY + 12;
    const time = performance.now() / 1000;

    ctx.save();
    ctx.translate(petX, petY);
    ctx.scale(this.playerFacing, 1);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-11, -6, 22, 12);

    // Glowing Cyber GPS Collar
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(7, -8, 3, 8);

    // Head & Floppy Ears
    ctx.fillStyle = '#d97706';
    ctx.fillRect(9, -11, 9, 9);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, -14, 5, 5);
    ctx.fillRect(16, -8, 4, 4);

    // Running Paws Animation
    const dogWalk = this.isPlayerMoving ? Math.sin(time * 11) * 5 : 0;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-9 + dogWalk, 6, 5, 6);
    ctx.fillRect(5 - dogWalk, 6, 5, 6);

    // Wagging Tail
    const tailWag = Math.sin(time * 14) * 5;
    ctx.fillRect(-15, -8 + tailWag, 5, 7);

    // Threat Alert Sonar Soundwave
    let nearBeast = false;
    for (const b of this.beasts) {
      if (!b.isDead && Math.hypot(b.laneOffset - this.playerX, (-b.x) - this.playerY) < 190) {
        nearBeast = true;
        break;
      }
    }

    if (nearBeast) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🐾 GÂU! CÓ QUÁI VẬT!', 0, -24);
    } else {
      ctx.scale(this.playerFacing, 1);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🐕 CHÓ VÀNG TRỢ THỦ', 0, -18);
    }

    ctx.restore();
  }

  private drawAtmosphereOverlay(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;
    const isStage2 = this.currentStageId.includes('stage2') || this.currentStageId.includes('toxic');
    const isStage3 = this.currentStageId.includes('stage3') || this.currentStageId.includes('snow') || this.currentStageId.includes('tundra');

    if (this.isNight) {
      // 1. Deep Nocturnal Darkness Overlay
      ctx.fillStyle = 'rgba(4, 7, 16, 0.76)';
      ctx.fillRect(0, 0, this.width, this.height);

      // 2. Realistic Celestial Night Sky: Twinkling Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const starX = (i * 97 + time * 2) % this.width;
        const starY = (i * 37) % (this.height * 0.42);
        const starAlpha = 0.25 + Math.sin(time * 3 + i) * 0.35;
        ctx.globalAlpha = Math.max(0.05, starAlpha);
        ctx.fillRect(starX, starY, (i % 3 === 0) ? 2.5 : 1.5, (i % 3 === 0) ? 2.5 : 1.5);
      }
      ctx.globalAlpha = 1.0;

      // 3. Desert Moon with Soft Luminous Halo & Craters
      const moonX = this.width - 70;
      const moonY = 55;
      const moonHalo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 65);
      moonHalo.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      moonHalo.addColorStop(0.5, 'rgba(254, 240, 138, 0.12)');
      moonHalo.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = moonHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Moon Body
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Moon Shadow Crescent
      ctx.fillStyle = '#080c18';
      ctx.beginPath();
      ctx.arc(moonX + 7, moonY - 4, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.timePhase === 'dawn') {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.timePhase === 'dusk') {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.ambientTemp >= 48) {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.18)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Stage Atmospheric Weather Tint
    if (isStage3) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.12)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (isStage2) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Subtle Cinematic Radial Vignette
    const vignette = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      Math.min(this.width, this.height) * 0.45,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, this.isNight ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.type === 'bullet') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.beginPath();
        ctx.arc(-p.vx * 0.8, -p.vy * 0.8, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bait') {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const pt of this.particles) {
      if (pt.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, pt.alpha));
      ctx.translate(pt.x, pt.y);

      if (pt.rotation !== undefined) {
        ctx.rotate(pt.rotation);
      }

      if (pt.type === 'spark') {
        // Bright starburst spark with glowing core
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.moveTo(0, -pt.size * 1.8);
        ctx.lineTo(pt.size * 0.4, -pt.size * 0.4);
        ctx.lineTo(pt.size * 1.8, 0);
        ctx.lineTo(pt.size * 0.4, pt.size * 0.4);
        ctx.lineTo(0, pt.size * 1.8);
        ctx.lineTo(-pt.size * 0.4, pt.size * 0.4);
        ctx.lineTo(-pt.size * 1.8, 0);
        ctx.lineTo(-pt.size * 0.4, -pt.size * 0.4);
        ctx.closePath();
        ctx.fill();

        // White hot center
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-pt.size * 0.3, -pt.size * 0.3, pt.size * 0.6, pt.size * 0.6);
      } else if (pt.type === 'smoke') {
        // Soft volumetric smoke puff
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pt.size);
        grad.addColorStop(0, pt.color);
        grad.addColorStop(0.6, pt.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.type === 'rain') {
        // Angled rain streak
        ctx.strokeStyle = pt.color || '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-pt.vx * 1.5, -pt.vy * 1.5);
        ctx.lineTo(0, 0);
        ctx.stroke();
      } else if (pt.type === 'snow') {
        // Crystal snowflake
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-pt.size * 1.4, 0);
        ctx.lineTo(pt.size * 1.4, 0);
        ctx.moveTo(0, -pt.size * 1.4);
        ctx.lineTo(0, pt.size * 1.4);
        ctx.stroke();
      } else if (pt.type === 'shockwave') {
        // Expanding thin glowing energy ring
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = Math.max(1, 3 * pt.alpha);
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (pt.type === 'spore') {
        // Bioluminescent glowing spore
        const sporeGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, pt.size * 2);
        sporeGrad.addColorStop(0, '#ffffff');
        sporeGrad.addColorStop(0.3, pt.color);
        sporeGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = sporeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.type === 'ember') {
        // Floating flame ember with bright yellow core
        ctx.fillStyle = pt.color || '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.type === 'laser_beam') {
        // High-energy laser plasma beam
        ctx.strokeStyle = pt.color || '#00f2ff';
        ctx.lineWidth = pt.size * 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-pt.vx * 2, -pt.vy * 2);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = pt.size;
        ctx.stroke();
      } else {
        // Default glowing circle
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      if (ft.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, ft.alpha));
      ctx.font = ft.isCrit ? '900 16px monospace' : 'bold 12px monospace';
      ctx.textAlign = 'center';

      // High-contrast deep outline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = ft.isCrit ? 4 : 3;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Foreground text
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
