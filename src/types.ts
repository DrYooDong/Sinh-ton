export type ItemRarity = 'common' | 'good' | 'superior' | 'perfect' | 'epic' | 'brilliant';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'material' | 'consumable' | 'weapon' | 'armor' | 'part' | 'blueprint' | 'special';
  rarity: ItemRarity;
  quantity: number;
  description: string;
  icon: string;
  blueprintId?: string; // If this is a blueprint item, the associated blueprint id
  stats?: {
    damage?: number;
    ammoCapacity?: number;
    currentAmmo?: number;
    ammoType?: string;
    defense?: number;
    speedBonus?: number;
    fuelValue?: number;
    waterValue?: number;
    hungerValue?: number;
    healValue?: number;
    tempMod?: number;
    spiritBonus?: number;
    durability?: number;
  };
}

export interface LootModalItem {
  id?: string;
  itemId?: string;
  name: string;
  quantity: number;
  rarity?: ItemRarity;
  icon?: string;
}

export interface LootModalData {
  title: string;
  items: LootModalItem[];
}

export interface Blueprint {
  id: string;
  name: string;
  rarity: ItemRarity;
  resultItemId: string;
  resultQuantity: number;
  ingredients: { itemId: string; quantity: number }[];
  learned: boolean;
  craftTimeMs?: number;
  description: string;
  category: 'basic' | 'survival' | 'vehicle' | 'weapon' | 'luxury';
  sourceHint?: string; // Where this blueprint is found (e.g. 'Rương Kim Cương KM 15+', 'Nhiệm Vụ Cốt Truyện', 'Trạm Tiếp Tế')
}

export type GameDifficulty = 'normal' | 'hard' | 'nightmare';
export type TimeOfDayPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface VehicleStats {
  tier: 'scrap' | 'common' | 'superior' | 'rv_luxury' | 'nuclear_beast' | 'celestial_carrier';
  name: string;
  maxSpeed: number; // km/h
  currentSpeed: number;
  maxFuel: number; // Liters
  currentFuel: number;
  fuelEfficiency: number; // Liters per 100km
  mileage: number; // km travelled
  durability: number; // 0-100 (Damaged by beast attacks and high speed crashes)
  maxDurability: number;
  radarRange: number; // meters
  interiorTemp: number; // Celsius
  engineLevel: ItemRarity;
  transmissionLevel: ItemRarity;
  tiresLevel: ItemRarity;
  chassisLevel: ItemRarity;
  armorLevel: ItemRarity;
  glassLevel: ItemRarity;
  fuelTankLevel: ItemRarity;
  seatsLevel: ItemRarity;
  hasAC: boolean;
  acLevel: ItemRarity;
  waterPurifierLevel: ItemRarity; // Máy lọc nước
  waterTankCapacity: number; // Liters
  currentWaterTank: number;
  waterTankTemp: number; // 1-100 C
  hasRefrigerator: boolean;
  refrigeratorLevel: ItemRarity;
  hasIceCreamMaker: boolean;
  iceCreamMakerLevel: ItemRarity;
  coreLevel: ItemRarity;
  autoCruise?: boolean; // Ga tự động giữ tốc độ
  autoLootMagnet?: boolean; // Nam châm hút rương tự động
  roofTurretLevel?: ItemRarity; // Tháp pháo nóc xe tự động bắn
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  hunger: number; // 0-100
  thirst: number; // 0-100
  bodyTemp: number; // 36.5 - 42.0 C
  spirit: number; // 100+ (augmented by Focus Cigarettes)
  courageBadges: number; // Huy hiệu dũng khí
  superiorCourageBadges: number;
  equippedWeaponId?: string;
  equippedArmorId?: string;
  equippedRingId?: string; // Nhẫn trữ vật
  hasStorageRing: boolean;
  storageRingLevel: ItemRarity;
  talentCount: number; // 0 to 10 (10th craft = 100% crit)
  totalCrafts: number;
  workbenchExp: number;
  workbenchLevel: ItemRarity;
  unlockedSkills?: Record<string, number>; // Skill ID -> Level (0, 1, 2, 3...)
  survivorRealmLevel: number; // Cảnh giới sinh tồn (1 to 7)
  killsCount: number; // Số lượng quái đã diệt
  chestsOpenedCount: number; // Số rương đã mở
  hydroponicUnlocked: boolean; // Mở khóa khoang thủy canh RV
}

export type SurvivalSkillCategory = 'survival' | 'engineering' | 'combat' | 'scavenging';

export interface SurvivalSkillNode {
  id: string;
  name: string;
  category: SurvivalSkillCategory;
  maxLevel: number;
  costPerLevel: number[]; // e.g. [5, 10, 20] badges
  icon: string;
  description: string;
  effectDescription: (level: number) => string;
  requiredParentId?: string;
  requiredParentLevel?: number;
}

export interface EncounterChoice {
  id: string;
  label: string;
  description: string;
  icon?: string;
  requiredItemId?: string;
  requiredItemName?: string;
  requiredItemQty?: number;
  requiredBadges?: number;
  requiredSkillId?: string;
  requiredSkillName?: string;
  minVehicleSpeed?: number;
  riskLevel?: 'safe' | 'moderate' | 'dangerous';
  action: 'give_item' | 'pay_badges' | 'ram_vehicle' | 'fight' | 'scan' | 'leave' | 'explore' | 'barter';
  outcome: {
    title: string;
    description: string;
    rewardBadges?: number;
    rewardHp?: number;
    damageHp?: number;
    vehicleDurabilityDelta?: number;
    rewardFuel?: number;
    consumeFuel?: number;
    rewardItems?: { itemId: string; name: string; quantity: number; icon: string; rarity?: ItemRarity }[];
    rewardBlueprintId?: string;
    rewardBlueprintName?: string;
    craftExpReward?: number;
  };
}

export interface RandomEncounter {
  id: string;
  title: string;
  subtitle: string;
  category: 'traveler' | 'cache' | 'bandits' | 'merchant' | 'anomaly' | 'oasis';
  dangerLevel: number; // 1 to 5
  narrative: string;
  imageIcon: string;
  bgGradient: string;
  choices: EncounterChoice[];
}

export interface PetAbility {
  id: string;
  name: string;
  minLevel: number;
  icon: string;
  description: string;
  effectValue: string;
}

export interface PetStats {
  unlocked: boolean;
  name: string;
  level: number;
  rarity: ItemRarity;
  hunger: number; // 0 - 100
  hp: number;
  maxHp: number;
  exp: number; // Current EXP
  maxExp: number; // EXP required to level up
  attackPower: number;
  alertness: number; // Danger detection radius in meters
  defense: number;
  unlockedAbilities: string[]; // List of ability IDs
  evolutionStage?: number; // 1: Chó Vàng, 2: Thiết Giáp Khuyển, 3: Lôi Điện Linh Khuyển, 4: Thần Khuyển Thao Thiết
  evolutionName?: string;
  autoLootRange?: number; // Metres range for automatic loot gathering
}

export type SurvivalStageId =
  | 'stage1_wasteland'
  | 'stage2_extreme_heat'
  | 'stage3_crossroads_bandits'
  | 'stage4_nightmare_spirits'
  | 'stage5_eternal_frost'
  | 'stage6_radiation_zone'
  | 'stage7_infernal_abyss'
  | 'stage8_cosmic_elevator';

export interface SurvivalStage {
  id: SurvivalStageId;
  name: string;
  dayNumber: number;
  ambientTemp: number;
  weatherCondition:
    | 'Hoang mạc vô tận'
    | 'Nắng nóng cực độ (45°C - 65°C)'
    | 'Ngã rẽ sa mạc & cướp đường'
    | 'Đêm đen quỷ dị & Bão cát'
    | 'Bão tuyết & Băng giá vĩnh cửu (-35°C)'
    | 'Rừng phóng xạ & Quái dị đột biến'
    | 'Vực thẳm dung nham & Hỏa ngục'
    | 'Thang máy không gian tối thượng';
  description: string;
  dangerLevel: number;
  roadDifficulty: number;
  activeSurvivingPlayers: number;
  minKm: number;
  unlockedBonus?: string;
}

// Survivor Evolution Realm
export interface SurvivorRealm {
  level: number;
  name: string;
  title: string;
  icon: string;
  color: string;
  requiredKm: number;
  requiredKills: number;
  requiredChests: number;
  requiredBadges: number;
  passives: string[];
  hpBonus: number;
  critRateBonus: number;
  speedBonus: number;
  craftCritBonus: number;
}

// Hydroponic Farm Crop
export interface FarmPlot {
  id: number;
  cropId: string | null;
  cropName: string | null;
  cropIcon: string | null;
  plantedAt: number | null; // Timestamp ms
  growDurationMs: number;
  waterLevel: number; // 0-100%
  isReady: boolean;
  yieldItemId: string | null;
  yieldQuantity: number;
}

export interface FarmCropDef {
  id: string;
  name: string;
  icon: string;
  seedItemId: string;
  yieldItemId: string;
  yieldQuantity: number;
  growDurationMs: number;
  waterCost: number;
  requiredStageId: SurvivalStageId;
  description: string;
  effectDescription: string;
}

export type BeastElementType = 'physical' | 'poison' | 'fire' | 'dark' | 'cyber' | 'frost';

export interface BeastEntity {
  id: string;
  type:
    | 'snake'
    | 'mouse'
    | 'cat'
    | 'wolf'
    | 'leopard'
    | 'buffalo'
    | 'bear'
    | 'tiger'
    | 'lion'
    | 'bandit'
    | 'evil_spirit'
    | 'desert_scorpion'
    | 'night_stalker'
    | 'sand_wyrm'
    | 'desert_hyena'
    | 'mutant_vulture'
    | 'armored_rhino'
    | 'sand_behemoth'
    | 'mecha_chimera'
    | 'golden_scorpion'
    | 'twin_vulture'
    | 'infernal_hound'
    | 'frost_specter';
  name: string;
  x: number; // Distance along highway
  laneOffset: number; // Y offset from road center (-50 to 50)
  hp: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  rarity: ItemRarity;
  element?: BeastElementType;
  isBoss?: boolean;
  isNightPredator?: boolean;
  isPacified?: boolean; // Tẩm thuốc Thất Tình Lục Dục
  isEnraged?: boolean;
  enrageThreshold?: number; // % HP to trigger enrage (e.g. 0.35)
  isDead: boolean;
  drops: { itemId: string; quantity: number; chance: number }[];
  badgesDrop: number;
  guardingChestId?: string;
  hitFlash?: number; // duration of hit flash in ms/ticks
  attackCooldown?: number;
  specialSkillName?: string;
}

export interface ChestEntity {
  id: string;
  x: number; // Distance along highway
  laneOffset: number;
  rarity: ItemRarity;
  isOpened: boolean;
  items: { itemId: string; quantity: number; isBlueprint?: boolean; blueprintId?: string }[];
}

export interface HazardZoneEntity {
  id: string;
  x: number; // Center X in pixels
  length: number; // Length in pixels along highway
  type: 'sandstorm' | 'bandit_ambush' | 'heatwave' | 'toxic_mire' | 'predator_den' | 'spirit_fog';
  name: string;
  dangerLevel: number; // 1 to 5
  ambientTempMod?: number;
  description: string;
  icon: string;
}

export interface SupplyStationEntity {
  id: string;
  x: number;
  laneOffset: number;
  name: string;
  isVisited: boolean;
  supplies: {
    itemId: string;
    price: number; // badges
    stock: number;
    maxStock: number;
  }[];
}

export interface RoadblockEntity {
  id: string;
  x: number;
  name: string;
  enemyCount: number;
  isCleared: boolean;
  leaderName: string;
  hasGun: boolean;
}

export interface QuestDialogue {
  speaker: string;
  avatar: string;
  text: string;
  role?: 'player' | 'system' | 'companion' | 'villain' | 'npc';
}

export interface Quest {
  id: string;
  title: string;
  type: 'main' | 'daily' | 'hidden';
  chapter?: number;
  chapterName?: string;
  description: string;
  storyLore?: string;
  storyDialogue?: QuestDialogue[];
  systemBroadcast?: string;
  npcPrivateChatTrigger?: {
    npcId: string;
    npcName: string;
    avatar: string;
    message: string;
    autoReplyOptions?: string[];
  };
  marketListingTrigger?: MarketListing;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  rewardBadges?: number;
  rewards: {
    badges?: number;
    diamonds?: number;
    items?: { itemId: string; quantity: number }[];
    blueprintId?: string;
    blueprintName?: string;
    title?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  claimed?: boolean;
  rewardBadges: number;
  rewardDiamonds: number;
  rewardBlueprintId?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  isNpc: boolean;
  isPlayer: boolean;
  isSystem: boolean;
  content: string;
  timestamp: string;
  channel: 'world' | 'private_tinh_than' | 'private_other' | 'system' | 'market';
  tradeOffer?: {
    offeredItemId: string;
    offeredItemName: string;
    offeredQuantity: number;
    requestedItemId: string;
    requestedItemName: string;
    requestedQuantity: number;
    isClaimed?: boolean;
  };
}

export interface MarketListing {
  id: string;
  seller: string;
  sellerAvatar?: string;
  offeredItemId: string;
  offeredItemName?: string;
  offeredQuantity: number;
  offeredItemRarity: ItemRarity;
  requestedItemId: string;
  requestedItemName?: string;
  requestedQuantity: number;
  isSold: boolean;
  isPlayerListing: boolean;
  tag?: 'urgent' | 'rare' | 'barter';
}

export interface CraftQueueItem {
  id: string;
  blueprintId: string;
  blueprintName: string;
  blueprintRarity: ItemRarity;
  resultQuantity: number;
  durationMs: number;
  progressMs: number;
  isCrit: boolean;
  status: 'pending' | 'crafting' | 'completed';
}

export interface GeminiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  personaId?: string;
}

export interface KeybindingsConfig {
  skills: string; // e.g. 'KeyK'
  crafting: string; // e.g. 'KeyC'
  vehicle: string; // e.g. 'KeyV'
  inventory: string; // e.g. 'KeyI'
  chat: string; // e.g. 'KeyM'
  quests: string; // e.g. 'KeyJ'
  companionAI: string; // e.g. 'KeyP'
  tutorial: string; // e.g. 'F1'
  radio: string; // e.g. 'KeyR'
}

export interface RadioStation {
  id: string;
  name: string;
  frequency: number; // e.g. 104.5 MHz
  category: 'emergency' | 'weather' | 'lore' | 'beast' | 'music' | 'distress';
  icon: string;
  color: string;
  description: string;
}

export interface RadioBroadcast {
  id: string;
  stationId: string;
  title: string;
  speaker: string;
  content: string;
  timestamp: string;
  tag: string;
  isImportant?: boolean;
}

export interface GameSaveData {
  version: string;
  timestamp: number;
  saveSlot: number;
  gameDifficulty?: GameDifficulty;
  playerStats: PlayerStats;
  vehicleStats: VehicleStats;
  petStats: PetStats;
  currentStage: SurvivalStageId;
  gameTimeMinutes: number; // Total in-game minutes elapsed (1 real sec = 1 in-game min)
  currentDistance: number; // Km
  inventory: InventoryItem[];
  blueprints: Blueprint[];
  quests: Quest[];
  achievements: Achievement[];
  chatHistory: ChatMessage[];
  marketListings: MarketListing[];
  hazardZones?: HazardZoneEntity[];
  farmPlots?: FarmPlot[];
}
