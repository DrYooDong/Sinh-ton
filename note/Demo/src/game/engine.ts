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

  // Positions
  public carX: number = 200; // Distance in pixels along highway (1m = 10px, 1km = 10,000px)
  public carLaneY: number = 0; // -120 to +120
  public carAngle: number = 0;

  public playerX: number = 200;
  public playerY: number = 50;
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

  // Weather & Atmosphere FX
  public heatShimmerOffset: number = 0;
  public activeHazardZone: HazardZoneEntity | null = null;

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
  public onTimeTick?: (hours: number, isNight: boolean, phase: TimeOfDayPhase, temp: number) => void;
  public onEncounterRoadblock?: (distKm: number) => void;
  public onEnterHazardZone?: (zone: HazardZoneEntity) => void;
  public onTriggerEncounter?: (encounter: RandomEncounter) => void;

  private lastTime: number = 0;
  private animId: number | null = null;
  private roadGenerationDistance: number = 0;

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
    // Generate initial chests, beasts and packs along the first 120km (1,200,000 px)
    this.generateWorldSegment(0, 150000);
  }

  public generateWorldSegment(startPx: number, endPx: number) {
    // Spawn rate multiplier by difficulty
    const diffFactor = this.difficulty === 'nightmare' ? 2.2 : this.difficulty === 'hard' ? 1.6 : 1.0;
    // Chests are made sparser and fewer (every 1800 - 2800px instead of 1000px)
    const baseSpacing = (1800 / diffFactor) + Math.random() * (1200 / diffFactor);

    for (let x = startPx + 800; x < endPx; x += baseSpacing) {
      const laneOffset = (Math.random() - 0.5) * 260; // highway width is ~300px
      const distKm = x / 10000;

      let chestRarity: ItemRarity = 'common';
      if (distKm > 20) chestRarity = 'brilliant';
      else if (distKm > 12) chestRarity = 'epic';
      else if (distKm > 6) chestRarity = 'perfect';
      else if (distKm > 3) chestRarity = 'superior';
      else if (distKm > 1) chestRarity = 'good';

      const chestId = `chest_${Math.round(x)}`;
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
      const hIdx = Math.floor((x / 38000) % hazardTypes.length);
      const hData = hazardTypes[hIdx];
      const lengthPx = 6000 + Math.random() * 3000; // 600m - 900m long

      this.hazardZones.push({
        id: `hazard_${Math.round(x)}`,
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
      this.stations.push({
        id: `station_${Math.round(x)}`,
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

  private createBeastForDistance(
    x: number,
    y: number,
    distKm: number,
    rarity: ItemRarity,
    guardingChestId?: string,
    preferNightPredator?: boolean
  ): BeastEntity {
    let beastType: BeastEntity['type'] = 'snake';
    let hp = 30;
    let dmg = 8;
    let speed = 1.6;
    let beastName = 'Rắn Độc Sa Mạc';
    let isNightPred = false;

    // Difficulty multipliers
    const hpMult = this.difficulty === 'nightmare' ? 1.6 : this.difficulty === 'hard' ? 1.3 : 1.0;
    const dmgMult = this.difficulty === 'nightmare' ? 1.7 : this.difficulty === 'hard' ? 1.35 : 1.0;
    const distBonus = 1 + (distKm * 0.05); // +5% stat per KM

    if (preferNightPredator || Math.random() < 0.25) {
      // Night Predatory / Exotic Spawns
      const nightTypes: BeastEntity['type'][] = ['night_stalker', 'desert_hyena', 'mutant_vulture', 'desert_scorpion', 'evil_spirit'];
      beastType = nightTypes[Math.floor(Math.random() * nightTypes.length)];
      isNightPred = true;

      if (beastType === 'night_stalker') {
        hp = 220;
        dmg = 38;
        speed = 2.4;
        beastName = 'Dạ Ma Khát Máu';
      } else if (beastType === 'desert_scorpion') {
        hp = 140;
        dmg = 24;
        speed = 1.8;
        beastName = 'Bọ Cạp Sa Mạc Khổng Lồ';
      } else if (beastType === 'desert_hyena') {
        hp = 110;
        dmg = 20;
        speed = 2.2;
        beastName = 'Linh Cẩu Xương Xám';
      } else if (beastType === 'mutant_vulture') {
        hp = 95;
        dmg = 22;
        speed = 2.5;
        beastName = 'Kền Kền Đột Biến Sa Mạc';
      } else {
        hp = 160;
        dmg = 30;
        speed = 1.9;
        beastName = 'Oán Hồn Đêm Sa Mạc';
      }
    } else if (distKm > 15 || rarity === 'brilliant') {
      const choices: BeastEntity['type'][] = ['tiger', 'lion', 'sand_wyrm', 'armored_rhino'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      if (beastType === 'sand_wyrm') {
        hp = 340;
        dmg = 50;
        speed = 1.7;
        beastName = 'Cự Trùng Cát Tử Thần';
      } else if (beastType === 'armored_rhino') {
        hp = 420;
        dmg = 45;
        speed = 1.6;
        beastName = 'Tê Giác Sa Mạc Bọc Giáp';
      } else if (beastType === 'tiger') {
        hp = 300;
        dmg = 48;
        speed = 2.3;
        beastName = 'Hổ Rừng Bạo Kích';
      } else {
        hp = 320;
        dmg = 52;
        speed = 2.2;
        beastName = 'Sư Tử Sa Mạc Chúa';
      }
    } else if (distKm > 8 || rarity === 'epic') {
      const choices: BeastEntity['type'][] = ['bear', 'buffalo', 'desert_scorpion', 'bandit'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      if (beastType === 'bear') {
        hp = 220;
        dmg = 35;
        speed = 1.7;
        beastName = 'Gấu Khổng Lồ Đêm Đen';
      } else if (beastType === 'buffalo') {
        hp = 250;
        dmg = 30;
        speed = 1.8;
        beastName = 'Trâu Rừng Thiết Giáp';
      } else if (beastType === 'bandit') {
        hp = 160;
        dmg = 32;
        speed = 2.0;
        beastName = 'Toán Cướp Xa Lộ Vũ Trang';
      } else {
        hp = 150;
        dmg = 26;
        speed = 1.8;
        beastName = 'Bọ Cạp Độc Khổng Lồ';
      }
    } else if (distKm > 4 || rarity === 'perfect' || rarity === 'superior') {
      const choices: BeastEntity['type'][] = ['leopard', 'wolf', 'desert_hyena', 'desert_scorpion'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      if (beastType === 'leopard') {
        hp = 110;
        dmg = 22;
        speed = 2.3;
        beastName = 'Báo Hoa Sa Mạc';
      } else if (beastType === 'desert_hyena') {
        hp = 95;
        dmg = 18;
        speed = 2.1;
        beastName = 'Linh Cẩu Sa Mạc';
      } else if (beastType === 'desert_scorpion') {
        hp = 120;
        dmg = 20;
        speed = 1.7;
        beastName = 'Bọ Cạp Gai Độc';
      } else {
        hp = 85;
        dmg = 16;
        speed = 2.0;
        beastName = 'Sói Hoang Đói Khát';
      }
    } else if (distKm > 1 || rarity === 'good') {
      const choices: BeastEntity['type'][] = ['cat', 'wolf', 'snake'];
      beastType = choices[Math.floor(Math.random() * choices.length)];
      hp = beastType === 'wolf' ? 65 : 45;
      dmg = beastType === 'wolf' ? 14 : 10;
      speed = 1.8;
      beastName = beastType === 'wolf' ? 'Sói Con Rình Rập' : beastType === 'cat' ? 'Mèo Hoang Sa Mạc' : 'Rắn Chuông Sa Mạc';
    } else {
      beastType = Math.random() > 0.5 ? 'snake' : 'mouse';
      hp = 30;
      dmg = 7;
      speed = 1.5;
      beastName = beastType === 'snake' ? 'Rắn Độc Núp Bụi' : 'Chuột Đồng Đột Biến';
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
      speed: speed * (this.difficulty === 'nightmare' ? 1.25 : 1.0),
      attackDamage: finalDmg,
      rarity,
      isNightPredator: isNightPred,
      isDead: false,
      drops: this.generateBeastDrops(beastType),
      badgesDrop: rarity === 'brilliant' ? 30 : rarity === 'perfect' ? 15 : rarity === 'superior' ? 8 : 4,
      guardingChestId,
    };
  }

  private generateLootForRarity(rarity: ItemRarity): { itemId: string; quantity: number }[] {
    if (rarity === 'brilliant') {
      const bpChoices = ['blueprint_bp_desert_eagle', 'blueprint_bp_ice_cream_maker', 'blueprint_bp_hunting_rifle'];
      const chosenBp = bpChoices[Math.floor(Math.random() * bpChoices.length)];
      return [
        { itemId: 'diamond', quantity: 1 },
        { itemId: chosenBp, quantity: 1 },
        { itemId: 'high_grade_fuel', quantity: 15 },
        { itemId: 'copper_plate', quantity: 3 },
      ];
    }
    if (rarity === 'epic') {
      const bpChoices = ['blueprint_bp_storage_ring', 'blueprint_bp_hunting_rifle', 'blueprint_bp_ice_cream_maker'];
      const chosenBp = bpChoices[Math.floor(Math.random() * bpChoices.length)];
      return [
        { itemId: 'space_crystal', quantity: 1 },
        { itemId: chosenBp, quantity: 1 },
        { itemId: 'iron_plate', quantity: 4 },
      ];
    }
    if (rarity === 'perfect') {
      const bpChoices = [
        'blueprint_bp_roof_water_tank',
        'blueprint_bp_car_fridge',
        'blueprint_bp_tang_dao',
        'blueprint_bp_focus_cigarette',
        'blueprint_bp_kevlar_vest',
        'blueprint_bp_radar_scanner',
      ];
      const chosenBp = bpChoices[Math.floor(Math.random() * bpChoices.length)];
      return [
        { itemId: chosenBp, quantity: 1 },
        { itemId: 'gunpowder', quantity: 3 },
        { itemId: 'iron_plate', quantity: 3 },
      ];
    }
    if (rarity === 'superior') {
      const bpChoices = [
        'blueprint_bp_car_ac',
        'blueprint_bp_car_engine',
        'blueprint_bp_water_purifier',
        'blueprint_bp_car_transmission',
        'blueprint_bp_reinforced_crossbow',
        'blueprint_bp_ammo_ap',
        'blueprint_bp_bulletproof_glass',
      ];
      const chosenBp = bpChoices[Math.floor(Math.random() * bpChoices.length)];
      return [
        { itemId: chosenBp, quantity: 1 },
        { itemId: 'iron_plate', quantity: 2 },
        { itemId: 'rubber', quantity: 2 },
      ];
    }
    if (rarity === 'good') {
      const bpChoices = ['blueprint_bp_steel_dagger', 'blueprint_bp_car_tires', 'blueprint_bp_medical_kit'];
      const chosenBp = bpChoices[Math.floor(Math.random() * bpChoices.length)];
      return [
        Math.random() > 0.4 ? { itemId: chosenBp, quantity: 1 } : { itemId: 'iron_plate', quantity: 2 },
        { itemId: 'purified_water_500ml', quantity: 1 },
      ];
    }
    // common: scarce supplies (1 wood or 1 bread or 1 water)
    const commonLootPool = [
      [{ itemId: 'wood', quantity: 2 }, { itemId: 'purified_water_500ml', quantity: 1 }],
      [{ itemId: 'wood', quantity: 3 }],
      [{ itemId: 'bread', quantity: 1 }, { itemId: 'salt', quantity: 1 }],
      [{ itemId: 'rubber', quantity: 1 }, { itemId: 'iron_plate', quantity: 1 }],
    ];
    return commonLootPool[Math.floor(Math.random() * commonLootPool.length)];
  }

  private generateBeastDrops(type: BeastEntity['type']): { itemId: string; quantity: number; chance: number }[] {
    switch (type) {
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
    const originY = this.mode === 'driving' ? this.carLaneY : this.playerY;

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

  public addFloatingText(x: number, y: number, text: string, color: string = '#fde047') {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.2,
      life: 0,
    });
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
      const targetPy = this.mode === 'driving' ? this.carLaneY : this.playerY;

      // Check nearest beast for spatial audio growl
      for (const b of this.beasts) {
        if (b.isDead) continue;
        const d = Math.hypot(b.x - targetPx, b.laneOffset - targetPy);
        if (d < 380) {
          soundEngine.playSpatialSound('beast_growl', b.x, b.laneOffset, targetPx, targetPy, 500);
          break;
        }
      }

      // Check nearest supply station for spatial chime
      for (const s of this.stations) {
        const d = Math.hypot(s.x - targetPx, s.laneOffset - targetPy);
        if (d < 500) {
          soundEngine.playSpatialSound('station_beacon', s.x, s.laneOffset, targetPx, targetPy, 700);
          break;
        }
      }

      // Check hazard zone for spatial wind howl
      if (this.activeHazardZone) {
        soundEngine.playSpatialSound('wind_howl', this.activeHazardZone.x, 0, targetPx, targetPy, 600);
      }
    }

    // 1.2 Random World Encounter Trigger while Driving
    if (this.mode === 'driving') {
      const currentDistKm = this.carX / 10000;
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
    const currentFrontier = Math.max(this.carX, this.playerX) + 15000;
    if (currentFrontier > this.roadGenerationDistance) {
      this.generateWorldSegment(this.roadGenerationDistance, currentFrontier);
      this.roadGenerationDistance = currentFrontier;
    }

    // Mode handling
    if (this.mode === 'driving') {
      let steer = 0;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer = -1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) steer = 1;

      // Handle car movement
      this.carLaneY += steer * 2.4;
      this.carLaneY = Math.max(-130, Math.min(130, this.carLaneY)); // highway bounds
      this.carAngle = steer * 0.08;

      // Camera smoothly tracks car
      this.cameraX += (this.carX - this.cameraX) * 0.12;
      this.cameraY += (this.carLaneY - this.cameraY) * 0.12;

      // Driving exhaust particles
      if (Math.random() < 0.45) {
        this.particles.push({
          x: this.carX - 28,
          y: this.carLaneY + (Math.random() - 0.5) * 10,
          vx: -2.5 - Math.random() * 2,
          vy: (Math.random() - 0.5) * 1,
          color: '#d1d5db',
          size: 2 + Math.random() * 4,
          life: 0,
          maxLife: 25,
          alpha: 0.7,
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
        this.playerX += (moveX / len) * 3.8;
        this.playerY += (moveY / len) * 3.8;
        this.playerY = Math.max(-160, Math.min(160, this.playerY));
        this.isPlayerMoving = true;
        this.walkAnimFrame += dt * 8;
        if (moveX !== 0) this.playerFacing = moveX > 0 ? 1 : -1;

        // Footstep dust particle puffs
        if (Math.random() < 0.35) {
          this.particles.push({
            x: this.playerX - this.playerFacing * 6,
            y: this.playerY + 12,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.4 - Math.random() * 0.4,
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

      // Camera tracks player on foot
      this.cameraX += (this.playerX - this.cameraX) * 0.15;
      this.cameraY += (this.playerY - this.cameraY) * 0.15;
    }

    // Check Hazard Zone Proximity & Entry
    const currentLocX = this.mode === 'driving' ? this.carX : this.playerX;
    let foundZone: HazardZoneEntity | null = null;
    for (const zone of this.hazardZones) {
      if (Math.abs(currentLocX - zone.x) <= zone.length / 2) {
        foundZone = zone;
        break;
      }
    }

    if (foundZone && (!this.activeHazardZone || this.activeHazardZone.id !== foundZone.id)) {
      this.activeHazardZone = foundZone;
      if (this.onEnterHazardZone) {
        this.onEnterHazardZone(foundZone);
      }
      this.addFloatingText(currentLocX, -60, `⚠️ TIẾN VÀO: ${foundZone.name.toUpperCase()}!`, '#f97316');
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
        const dx = beast.x - p.x;
        const dy = beast.laneOffset - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 32) {
          hit = true;
          if (p.type === 'bait') {
            beast.isPacified = true;
            this.addFloatingText(beast.x, beast.laneOffset - 20, 'ĐÃ TRÚNG THẤT TÌNH DƯỢC! 💫', '#ec4899');
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
              this.addFloatingText(beast.x, beast.laneOffset - 35, `⚡ BẠO KÍCH! -${finalDmg}`, '#fde047');
            } else {
              this.addFloatingText(beast.x, beast.laneOffset - 20, `-${finalDmg}`, '#ef4444');
            }

            beast.hp -= finalDmg;

            // Blood/impact particles
            for (let k = 0; k < 6; k++) {
              this.particles.push({
                x: beast.x,
                y: beast.laneOffset,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: isCrit ? '#f59e0b' : '#dc2626',
                size: isCrit ? 4.5 : 3,
                life: 0,
                maxLife: 20,
                alpha: 1,
              });
            }

            if (beast.hp <= 0) {
              beast.isDead = true;
              beast.hp = 0;
              this.addFloatingText(beast.x, beast.laneOffset - 45, 'ĐÃ TIÊU DIỆT! 💀', '#eab308');
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
    const targetPy = this.mode === 'driving' ? this.carLaneY : this.playerY;

    // Night buff: Beasts are faster & more aggressive
    const nightSpeedMult = this.isNight ? 1.35 : 1.0;
    const nightDmgMult = this.isNight ? 1.3 : 1.0;
    const aggroDist = this.isNight ? 320 : 220;

    for (const beast of this.beasts) {
      if (beast.isDead) continue;

      if (beast.isPacified) {
        // Confused wandering
        beast.x += (Math.random() - 0.5) * 0.6;
        beast.laneOffset += (Math.random() - 0.5) * 0.6;
        continue;
      }

      const dx = targetPx - beast.x;
      const dy = targetPy - beast.laneOffset;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Aggro chase
      if (dist < aggroDist && dist > 15) {
        const beastSpeed = beast.speed * nightSpeedMult;
        beast.x += (dx / dist) * beastSpeed * 0.8;
        beast.laneOffset += (dy / dist) * beastSpeed * 0.8;
      }

      // Attack player on foot if too close
      if (this.mode === 'onfoot' && dist < 24) {
        const lastAtk = this.beastAttackCooldowns[beast.id] || 0;
        if (performance.now() - lastAtk > 900) {
          this.beastAttackCooldowns[beast.id] = performance.now();
          if (this.onPlayerDamaged) {
            this.onPlayerDamaged(beast.attackDamage * nightDmgMult);
          }
          this.addFloatingText(this.playerX, this.playerY - 25, `BỊ CẮN! -${Math.round(beast.attackDamage * nightDmgMult)}`, '#ef4444');
        }
      }

      // Attack / Slam into Car when in driving mode
      if (this.mode === 'driving' && dist < 38) {
        const lastAtk = this.beastAttackCooldowns[beast.id] || 0;
        if (performance.now() - lastAtk > 1000) {
          this.beastAttackCooldowns[beast.id] = performance.now();
          
          // Heavy ram bumper skill: deals return ramming damage to the beast
          const ramBumperLvl = this.skills['heavy_ram_bumper'] || 0;
          const ramDmg = Math.round(45 + ramBumperLvl * 35);
          beast.hp -= ramDmg;
          this.addFloatingText(beast.x, beast.laneOffset - 25, `🚗 TÔNG XE! -${ramDmg}`, '#38bdf8');

          if (beast.hp <= 0) {
            beast.isDead = true;
            beast.hp = 0;
            this.addFloatingText(beast.x, beast.laneOffset - 40, 'ĐÃ HẠ GỤC! 💀', '#eab308');
          }

          // Durability reduction reduced by ram bumper skill
          const baseVehDmg = Math.max(3, Math.round(beast.attackDamage * 0.3 * nightDmgMult));
          const vehDmg = Math.max(1, Math.round(baseVehDmg * (1 - ramBumperLvl * 0.25)));

          if (this.onVehicleDamaged) {
            this.onVehicleDamaged(vehDmg);
          }
          this.addFloatingText(this.carX, this.carLaneY - 30, `💥 VA CHẠM XE! -${vehDmg} ĐỘ BỀN`, '#f97316');
          soundEngine.playCrash();

          // Spark particles on car impact
          for (let k = 0; k < 6; k++) {
            this.particles.push({
              x: this.carX,
              y: this.carLaneY,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#fbbf24',
              size: 3,
              life: 0,
              maxLife: 15,
              alpha: 1,
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
        let minDist = 180;
        for (const b of this.beasts) {
          if (b.isDead) continue;
          const d = Math.hypot(b.x - this.playerX, b.laneOffset - this.playerY);
          if (d < minDist) {
            minDist = d;
            closestBeast = b;
          }
        }

        if (closestBeast) {
          this.petAttackCooldown = 0;
          const petDmg = 35;
          closestBeast.hp -= petDmg;
          this.addFloatingText(closestBeast.x, closestBeast.laneOffset - 25, `🐕 CHÓ CẮN! -${petDmg}`, '#fde047');
          if (closestBeast.hp <= 0) {
            closestBeast.isDead = true;
            closestBeast.hp = 0;
            this.addFloatingText(closestBeast.x, closestBeast.laneOffset - 40, 'ĐÃ HẠ GỤC! 💀', '#4ade80');
          }
        }
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life++;
      pt.alpha = 1 - pt.life / pt.maxLife;
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

  // Render 2D Graphics onto Canvas
  public render() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Background color based on Time Phase
    if (this.timePhase === 'dawn') {
      ctx.fillStyle = '#b08359'; // Warm golden-pink sand
    } else if (this.timePhase === 'dusk') {
      ctx.fillStyle = '#995a4d'; // Crimson twilight sand
    } else if (this.timePhase === 'night') {
      ctx.fillStyle = '#1c1c24'; // Midnight dark terrain
    } else {
      ctx.fillStyle = '#b49666'; // Standard bright desert sand
    }
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    // Center camera on target
    ctx.translate(this.width / 2 - this.cameraX, this.height / 2 - this.cameraY);

    // 1. Draw Endless Highway
    this.drawHighway(ctx);

    // 1.5 Draw Hazard Zones & Road Warning Pylons
    this.drawHazardZones(ctx);

    // 2. Draw Supply Stations
    this.drawSupplyStations(ctx);

    // 3. Draw Resource Chests
    this.drawChests(ctx);

    // 4. Draw Beasts & Night Predators
    this.drawBeasts(ctx);

    // 5. Draw Car RV
    this.drawCar(ctx);

    // 6. Draw Player (if on foot) & Pet
    if (this.mode === 'onfoot') {
      this.drawPlayer(ctx);
    }

    // 7. Draw Projectiles
    this.drawProjectiles(ctx);

    // 8. Draw Particles
    this.drawParticles(ctx);

    // 9. Draw Floating Texts
    this.drawFloatingTexts(ctx);

    ctx.restore();

    // 10. Dynamic Sky Lighting & Night Headlight Cutouts Overlay
    this.drawAtmosphereOverlay(ctx);
  }

  private drawHighway(ctx: CanvasRenderingContext2D) {
    const startX = this.cameraX - this.width;
    const endX = this.cameraX + this.width;
    const roadWidth = 280; // Highway width representation

    // Layered Desert Sand Dune background texture
    ctx.fillStyle = this.isNight ? '#16161d' : '#947a4f';
    ctx.fillRect(startX, -roadWidth / 2 - 80, endX - startX, 60);
    ctx.fillRect(startX, roadWidth / 2 + 20, endX - startX, 60);

    // Road Gravel Shoulders with stone details
    ctx.fillStyle = this.isNight ? '#22222b' : '#6e5d3b';
    ctx.fillRect(startX, -roadWidth / 2 - 20, endX - startX, 20);
    ctx.fillRect(startX, roadWidth / 2, endX - startX, 20);

    // Road shoulder pebbles
    ctx.fillStyle = this.isNight ? '#111116' : '#4a3f28';
    const pebbleStep = 60;
    const firstPebble = Math.floor(startX / pebbleStep) * pebbleStep;
    for (let x = firstPebble; x < endX; x += pebbleStep) {
      ctx.fillRect(x + 12, -roadWidth / 2 - 12, 5, 3);
      ctx.fillRect(x + 35, -roadWidth / 2 - 6, 4, 3);
      ctx.fillRect(x + 20, roadWidth / 2 + 8, 6, 4);
    }

    // Main Asphalt Highway
    ctx.fillStyle = this.isNight ? '#0d0e12' : '#1c1d21';
    ctx.fillRect(startX, -roadWidth / 2, endX - startX, roadWidth);

    // Skid marks
    ctx.fillStyle = '#08080a';
    for (let x = firstPebble; x < endX; x += 180) {
      ctx.fillRect(x + 30, -35, 45, 6);
      ctx.fillRect(x + 30, 25, 45, 6);
    }

    // Highway Borders (Solid White Curbs)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, -roadWidth / 2 + 4, endX - startX, 4);
    ctx.fillRect(startX, roadWidth / 2 - 8, endX - startX, 4);

    // Center Double Yellow Dashed Lines with Reflective Studs
    ctx.fillStyle = '#f59e0b';
    const dashLength = 45;
    const gapLength = 30;
    const step = dashLength + gapLength;
    const firstDash = Math.floor(startX / step) * step;

    for (let x = firstDash; x < endX; x += step) {
      ctx.fillRect(x, -6, dashLength, 3);
      ctx.fillRect(x, 3, dashLength, 3);

      // Reflective Cat-Eye Studs (glows at night)
      ctx.fillStyle = this.isNight ? '#fde047' : '#fef08a';
      ctx.fillRect(x + dashLength - 4, -2, 4, 4);
      ctx.fillStyle = '#f59e0b';
    }

    // Lane divider white dashes (4 lanes total)
    ctx.fillStyle = 'rgba(209, 213, 219, 0.6)';
    for (let x = firstDash; x < endX; x += step) {
      ctx.fillRect(x, -roadWidth / 4, dashLength * 0.7, 2);
      ctx.fillRect(x, roadWidth / 4, dashLength * 0.7, 2);
    }

    // Roadside Kilometer Milestone Posts (Cột Mốc KM)
    const kmStep = 1000;
    const firstKm = Math.floor(startX / kmStep) * kmStep;
    for (let x = firstKm; x < endX; x += kmStep) {
      const kmNumber = (x / 10000).toFixed(1);
      ctx.save();
      ctx.translate(x, -roadWidth / 2 - 28);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-10, -18, 20, 24);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-10, -18, 20, 7);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`KM`, 0, -3);
      ctx.fillText(`${kmNumber}`, 0, 4);
      ctx.restore();
    }

    // Roadside Cacti
    const plantStep = 220;
    const firstPlant = Math.floor(startX / plantStep) * plantStep;
    for (let x = firstPlant; x < endX; x += plantStep) {
      ctx.fillStyle = this.isNight ? '#16381b' : '#2d5a27';
      ctx.fillRect(x + 20, -roadWidth / 2 - 45, 10, 30);
      ctx.fillRect(x + 10, -roadWidth / 2 - 38, 10, 6);
      ctx.fillRect(x + 10, -roadWidth / 2 - 46, 6, 12);
      ctx.fillRect(x + 24, -roadWidth / 2 - 32, 12, 6);
      ctx.fillRect(x + 30, -roadWidth / 2 - 42, 6, 14);

      // Blossom
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x + 23, -roadWidth / 2 - 48, 4, 4);

      // Rocks
      ctx.fillStyle = this.isNight ? '#3a2512' : '#a16207';
      ctx.beginPath();
      ctx.ellipse(x + 80, roadWidth / 2 + 35, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heat Shimmer Mirage distortion lines (when temp >= 40 C)
    if (this.ambientTemp >= 40 && !this.isNight) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      const shimmerStep = 120;
      const firstShimmer = Math.floor(startX / shimmerStep) * shimmerStep;
      for (let sx = firstShimmer; sx < endX; sx += shimmerStep) {
        ctx.beginPath();
        for (let seg = 0; seg < 60; seg += 10) {
          const waveY = Math.sin(this.heatShimmerOffset + (sx + seg) * 0.05) * 4;
          if (seg === 0) ctx.moveTo(sx + seg, -20 + waveY);
          else ctx.lineTo(sx + seg, -20 + waveY);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let seg = 0; seg < 60; seg += 10) {
          const waveY = Math.sin(this.heatShimmerOffset + (sx + seg) * 0.05 + 1) * 4;
          if (seg === 0) ctx.moveTo(sx + seg, 20 + waveY);
          else ctx.lineTo(sx + seg, 20 + waveY);
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
      const zoneStart = zone.x - zone.length / 2;
      const zoneEnd = zone.x + zone.length / 2;

      // Only render if within camera view
      if (zoneEnd < this.cameraX - this.width || zoneStart > this.cameraX + this.width) continue;

      ctx.save();

      // Hazard Zone Road Overlay Tint
      if (zone.type === 'sandstorm') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.16)';
      } else if (zone.type === 'toxic_mire') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.14)';
      } else if (zone.type === 'heatwave') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      } else if (zone.type === 'bandit_ambush') {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.18)';
      } else {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.18)';
      }
      ctx.fillRect(zoneStart, -roadWidth / 2, zone.length, roadWidth);

      // Warning Diagonal Stripes on road edges
      const stripeStep = 50;
      const startStripe = Math.floor(zoneStart / stripeStep) * stripeStep;
      for (let sx = startStripe; sx < zoneEnd; sx += stripeStep) {
        ctx.fillStyle = (Math.floor(sx / stripeStep) % 2 === 0) ? '#eab308' : '#000000';
        ctx.fillRect(sx, -roadWidth / 2, stripeStep, 6);
        ctx.fillRect(sx, roadWidth / 2 - 6, stripeStep, 6);
      }

      // Warning Signboards at entrance and exit
      [zoneStart, zoneEnd].forEach((signX, idx) => {
        ctx.save();
        ctx.translate(signX, -roadWidth / 2 - 35);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-2, 0, 4, 35); // Pole
        // Sign board
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(20, 0);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, -6);

        // Sign text label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(idx === 0 ? `⚠️ VÀO: ${zone.name}` : `✓ HẾT: ${zone.name}`, 0, -32);
        ctx.restore();
      });

      // Animated floating hazard icon along zone center
      const iconBob = Math.sin(time * 3 + zone.x) * 6;
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.icon, zone.x, -roadWidth / 2 - 12 + iconBob);

      ctx.restore();
    }
  }

  private drawSupplyStations(ctx: CanvasRenderingContext2D) {
    for (const station of this.stations) {
      if (Math.abs(station.x - this.cameraX) > this.width) continue;

      ctx.save();
      ctx.translate(station.x, station.laneOffset);

      // Station Floor
      ctx.fillStyle = '#334155';
      ctx.fillRect(-60, -30, 120, 60);

      // Gas Pump Units
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-45, -20, 22, 40);
      ctx.fillRect(25, -20, 22, 40);

      // Digital Screen Display
      ctx.fillStyle = '#00f2ff';
      ctx.fillRect(-41, -14, 14, 10);
      ctx.fillRect(29, -14, 14, 10);

      // Canopy Awning
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(-45, -36);
      ctx.lineTo(45, -36);
      ctx.lineTo(35, -52);
      ctx.lineTo(-35, -52);
      ctx.closePath();
      ctx.fill();

      // Station Name Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(station.name.toUpperCase(), 0, -58);

      ctx.fillStyle = '#00f2ff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('[E] VÀO MUA TIẾP TẾ', 0, 48);

      ctx.restore();
    }
  }

  private drawChests(ctx: CanvasRenderingContext2D) {
    const rarityColors: Record<ItemRarity, { main: string; light: string; glow: string; border: string; particleColor: string }> = {
      common: { main: '#71717a', light: '#a1a1aa', glow: 'rgba(161, 161, 170, 0.4)', border: '#3f3f46', particleColor: '#e4e4e7' },
      good: { main: '#16a34a', light: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', border: '#15803d', particleColor: '#86efac' },
      superior: { main: '#0284c7', light: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)', border: '#0369a1', particleColor: '#7dd3fc' },
      perfect: { main: '#9333ea', light: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)', border: '#7e22ce', particleColor: '#e9d5ff' },
      epic: { main: '#d97706', light: '#fbbf24', glow: 'rgba(251, 191, 36, 0.8)', border: '#b45309', particleColor: '#fde68a' },
      brilliant: { main: '#e11d48', light: '#fb7185', glow: 'rgba(244, 63, 94, 0.9)', border: '#be123c', particleColor: '#fda4af' },
    };

    const time = performance.now() / 1000;

    for (const chest of this.chests) {
      if (Math.abs(chest.x - this.cameraX) > this.width) continue;

      ctx.save();
      const bobY = !chest.isOpened ? Math.sin(time * 3 + chest.x) * 3 : 0;
      ctx.translate(chest.x, chest.laneOffset + bobY);

      const color = rarityColors[chest.rarity] || rarityColors.common;

      if (!chest.isOpened) {
        ctx.fillStyle = color.glow;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Sparkles
        const orbitAngle = time * 2.5 + chest.x;
        ctx.fillStyle = color.particleColor;
        const sparkX = Math.cos(orbitAngle) * 22;
        const sparkY = Math.sin(orbitAngle) * 14;
        ctx.fillRect(sparkX - 2, sparkY - 2, 4, 4);

        const sparkX2 = Math.cos(orbitAngle + Math.PI) * 22;
        const sparkY2 = Math.sin(orbitAngle + Math.PI) * 14;
        ctx.fillRect(sparkX2 - 2, sparkY2 - 2, 4, 4);
      }

      // Chest Base
      ctx.fillStyle = chest.isOpened ? '#3f3f46' : color.main;
      ctx.fillRect(-14, -10, 28, 20);

      // Chest Lid
      ctx.fillStyle = chest.isOpened ? '#52525b' : color.light;
      ctx.fillRect(-14, -10, 28, 6);

      // Metallic corners
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-14, -10, 4, 4);
      ctx.fillRect(10, -10, 4, 4);
      ctx.fillRect(-14, 6, 4, 4);
      ctx.fillRect(10, 6, 4, 4);

      // Lock latch
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-4, -6, 8, 12);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-1.5, -2, 3, 5);

      ctx.strokeStyle = color.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -10, 28, 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const label = chest.isOpened ? 'ĐÃ MỞ' : `[E] RƯƠNG ${chest.rarity.toUpperCase()}`;
      ctx.fillText(label, 0, -16);

      ctx.restore();
    }
  }

  private drawBeasts(ctx: CanvasRenderingContext2D) {
    const time = performance.now() / 1000;

    for (const beast of this.beasts) {
      if (Math.abs(beast.x - this.cameraX) > this.width) continue;

      ctx.save();
      ctx.translate(beast.x, beast.laneOffset);

      if (beast.isDead) {
        // Corpse
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(-14, -7, 28, 14);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-10, -5, 20, 10);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🥩 [E] THU HOẠCH', 0, -12);
        ctx.restore();
        continue;
      }

      // Breathing bounce
      const breathY = Math.sin(time * 4 + beast.x) * 1.5;
      let size = 20;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Individual Beast Drawing
      if (beast.type === 'night_stalker') {
        size = 28;
        // Dark Void Body with shadow trails
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, breathY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Razor Claws
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-16, breathY + 4, 6, 4);
        ctx.fillRect(10, breathY + 4, 6, 4);

        // Glowing Crimson Red Eyes (Piercing darkness)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-5, breathY - 3, 4, 4);
        ctx.fillRect(2, breathY - 3, 4, 4);
      } else if (beast.type === 'desert_scorpion') {
        size = 22;
        // Amber/Black Carapace
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, breathY - 6, 20, 12);

        // Pincers
        ctx.fillStyle = '#92400e';
        ctx.fillRect(8, breathY - 10, 8, 5);
        ctx.fillRect(8, breathY + 5, 8, 5);

        // Curved Tail with Poison Needle
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-16, breathY - 14, 6, 12);
        ctx.fillStyle = '#22c55e'; // Dripping green venom
        ctx.fillRect(-18, breathY - 16, 4, 4);
      } else if (beast.type === 'sand_wyrm') {
        size = 36;
        // Giant Segmented Body
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, breathY, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-8, breathY - 6, 16, 12);

        // Fangs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, breathY - 5, 5, 3);
        ctx.fillRect(14, breathY + 2, 5, 3);
      } else if (beast.type === 'desert_hyena') {
        size = 22;
        ctx.fillStyle = '#a16207';
        ctx.beginPath();
        ctx.arc(0, breathY, 11, 0, Math.PI * 2);
        ctx.fill();
        // Spots
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-4, breathY - 4, 3, 3);
        ctx.fillRect(2, breathY + 2, 3, 3);
        // Snout
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(8, breathY - 2, 4, 4);
      } else if (beast.type === 'mutant_vulture') {
        size = 24;
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(0, breathY - 6, 10, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-18, breathY - 8, 10, 5);
        ctx.fillRect(8, breathY - 8, 10, 5);
        // Beak
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(4, breathY - 6, 6, 3);
      } else if (beast.type === 'armored_rhino') {
        size = 34;
        ctx.fillStyle = '#475569';
        ctx.fillRect(-16, breathY - 10, 32, 20);
        // Giant Steel Horn
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(16, breathY - 6);
        ctx.lineTo(26, breathY - 2);
        ctx.lineTo(16, breathY + 2);
        ctx.closePath();
        ctx.fill();
      } else if (beast.type === 'tiger') {
        size = 28;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, breathY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6, breathY - 8, 3, 16);
        ctx.fillRect(2, breathY - 8, 3, 16);
      } else if (beast.type === 'lion') {
        size = 28;
        ctx.fillStyle = '#78350f'; // Mane
        ctx.beginPath();
        ctx.arc(0, breathY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, breathY, 11, 0, Math.PI * 2);
        ctx.fill();
      } else if (beast.type === 'bear') {
        size = 30;
        ctx.fillStyle = '#3e1f0e';
        ctx.beginPath();
        ctx.arc(0, breathY, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (beast.type === 'buffalo') {
        size = 28;
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, breathY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-12, breathY - 12, 6, 6);
        ctx.fillRect(6, breathY - 12, 6, 6);
      } else if (beast.type === 'wolf') {
        size = 22;
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, breathY, 11, 0, Math.PI * 2);
        ctx.fill();
      } else if (beast.type === 'leopard') {
        size = 24;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, breathY, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (beast.type === 'bandit') {
        size = 22;
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(-8, breathY - 10, 16, 20);
        ctx.fillStyle = '#dc2626'; // Bandana
        ctx.fillRect(-8, breathY - 10, 16, 4);
        ctx.fillStyle = '#1e293b'; // Gun
        ctx.fillRect(6, breathY, 12, 4);
      } else {
        // Small beasts (snake, mouse, cat)
        size = 16;
        ctx.fillStyle = beast.type === 'snake' ? '#65a30d' : beast.type === 'cat' ? '#f97316' : '#78716c';
        ctx.beginPath();
        ctx.arc(0, breathY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing Predator Eyes
      ctx.fillStyle = beast.isPacified ? '#ec4899' : (this.isNight ? '#ef4444' : '#fef08a');
      ctx.fillRect(4, breathY - 3, 3, 3);
      ctx.fillRect(4, breathY + 2, 3, 3);

      // Health Bar
      const hpPct = Math.max(0, beast.hp / beast.maxHp);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-18, -size / 2 - 12, 36, 5);
      ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(-18, -size / 2 - 12, 36 * hpPct, 5);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(-18, -size / 2 - 12, 36, 5);

      // Name & Pacified Status Tag
      ctx.fillStyle = this.isNight && beast.isNightPredator ? '#f87171' : '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      const label = beast.isPacified ? `💫 ${beast.name}` : beast.name;
      ctx.fillText(label, 0, -size / 2 - 16);

      ctx.restore();
    }
  }

  private drawCar(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.carX, this.carLaneY);
    ctx.rotate(this.carAngle);

    // Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Wheels
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-26, -23, 14, 7);
    ctx.fillRect(14, -23, 14, 7);
    ctx.fillRect(-26, 16, 14, 7);
    ctx.fillRect(14, 16, 14, 7);

    // Rims
    ctx.fillStyle = '#71717a';
    ctx.fillRect(-22, -21, 6, 3);
    ctx.fillRect(18, -21, 6, 3);
    ctx.fillRect(-22, 18, 6, 3);
    ctx.fillRect(18, 18, 6, 3);

    // Camper RV Chassis
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-30, -17, 60, 34);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -17, 60, 34);

    // Bumper & Headlights
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(28, -14, 4, 28);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(28, -12, 3, 4);
    ctx.fillRect(28, 8, 3, 4);

    // Windshield & Windows
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14, -13, 12, 26);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(16, -11, 8, 22);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -15, 16, 4);
    ctx.fillRect(-6, 11, 16, 4);
    ctx.fillRect(-26, -15, 12, 30);

    // Roof Amenities (Water Tank + Solar Grid)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-18, -9, 20, 18);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(-18, -9, 20, 18);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-16, -7, 16, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('1000L 22°C', -8, 5);

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(3, -8, 10, 16);
    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(3, -8, 10, 16);

    // Volumetric Headlight Cone
    if (this.headlightsOn) {
      const grad = ctx.createRadialGradient(30, 0, 10, 220, 0, 180);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
      grad.addColorStop(0.6, 'rgba(254, 240, 138, 0.2)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(30, -12);
      ctx.lineTo(240, -85);
      ctx.lineTo(240, 85);
      ctx.lineTo(30, 12);
      ctx.closePath();
      ctx.fill();
    }

    // Tail Lights
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-31, -14, 3, 5);
    ctx.fillRect(-31, 9, 3, 5);

    // Status Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    const carStatus = this.mode === 'driving' ? '🚐 TUYẾT MỘC (LÁI XE RV)' : '🚐 XE NHÀ RV (ĐỖ TẠM)';
    ctx.fillText(carStatus, 0, -28);

    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.playerX, this.playerY);
    ctx.scale(this.playerFacing, 1);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking legs
    const legOffset = this.isPlayerMoving ? Math.sin(this.walkAnimFrame) * 5 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6 + legOffset, 8, 5, 9);
    ctx.fillRect(1 - legOffset, 8, 5, 9);

    // Jacket & Armor
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-7, -6, 14, 14);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-7, 2, 14, 4);

    // Backpack
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-11, -4, 4, 10);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-5, -16, 10, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -19, 12, 5);

    // Weapon
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(7, -2, 10, 4);

    // Tactical Flashlight beam at night
    if (this.isNight) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(120, -40);
      ctx.lineTo(120, 40);
      ctx.closePath();
      ctx.fill();
    }

    // Name
    ctx.scale(this.playerFacing, 1);
    ctx.fillStyle = '#00f2ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TUYẾT MỘC', 0, -25);

    ctx.restore();

    this.drawPetDog(ctx);
  }

  private drawPetDog(ctx: CanvasRenderingContext2D) {
    const petX = this.playerX - 24 * this.playerFacing;
    const petY = this.playerY + 10;
    const time = performance.now() / 1000;

    ctx.save();
    ctx.translate(petX, petY);
    ctx.scale(this.playerFacing, 1);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 9, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-10, -5, 20, 10);

    // Head
    ctx.fillStyle = '#d97706';
    ctx.fillRect(8, -10, 8, 8);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(7, -13, 4, 4);
    ctx.fillRect(15, -7, 3, 3);

    // Legs
    const dogWalk = this.isPlayerMoving ? Math.sin(time * 10) * 4 : 0;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-8 + dogWalk, 5, 4, 5);
    ctx.fillRect(4 - dogWalk, 5, 4, 5);

    // Tail
    const tailWag = Math.sin(time * 12) * 4;
    ctx.fillRect(-13, -7 + tailWag, 4, 6);

    // Alert Soundwave bubble
    let nearBeast = false;
    for (const b of this.beasts) {
      if (!b.isDead && Math.hypot(b.x - this.playerX, b.laneOffset - this.playerY) < 180) {
        nearBeast = true;
        break;
      }
    }

    if (nearBeast) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🐾 GÂU! GÂU!', 0, -22);
    } else {
      ctx.scale(this.playerFacing, 1);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🐕 CHÓ VÀNG', 0, -16);
    }

    ctx.restore();
  }

  private drawAtmosphereOverlay(ctx: CanvasRenderingContext2D) {
    if (this.isNight) {
      // 1. Draw Starry Night Canvas Overlay
      ctx.fillStyle = 'rgba(6, 9, 18, 0.78)';
      ctx.fillRect(0, 0, this.width, this.height);

      // Twinkling stars
      ctx.fillStyle = '#ffffff';
      const starTime = performance.now() / 1000;
      for (let i = 0; i < 25; i++) {
        const starX = (i * 73 + starTime * 2) % this.width;
        const starY = (i * 37) % (this.height * 0.4);
        const starAlpha = 0.3 + Math.sin(starTime * 3 + i) * 0.3;
        ctx.globalAlpha = Math.max(0.1, starAlpha);
        ctx.fillRect(starX, starY, 2, 2);
      }
      ctx.globalAlpha = 1.0;

      // Desert Moon in top corner
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(this.width - 50, 45, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(this.width - 44, 40, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.timePhase === 'dawn') {
      // Golden morning glow
      ctx.fillStyle = 'rgba(251, 146, 60, 0.12)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.timePhase === 'dusk') {
      // Purple-crimson sunset
      ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.ambientTemp >= 48) {
      // Heatwave Orange Glow
      ctx.fillStyle = 'rgba(249, 115, 22, 0.14)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.type === 'bullet') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bait') {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
