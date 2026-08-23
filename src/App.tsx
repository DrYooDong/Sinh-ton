import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameEngine } from './game/engine';
import {
  INITIAL_ITEMS,
  INITIAL_BLUEPRINTS,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  SURVIVAL_STAGES,
  RARITY_COLORS,
  RARITY_SORT_WEIGHT,
  resolveItemInfo,
} from './game/constants';
import {
  GameSaveData,
  InventoryItem,
  Blueprint,
  Quest,
  Achievement,
  ChatMessage,
  MarketListing,
  PlayerStats,
  VehicleStats,
  PetStats,
  SurvivalStageId,
  ChestEntity,
  BeastEntity,
  SupplyStationEntity,
  ItemRarity,
  GameDifficulty,
  TimeOfDayPhase,
  RandomEncounter,
  EncounterChoice,
  KeybindingsConfig,
  LootModalItem,
  LootModalData,
} from './types';
import { Trash2 } from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import confetti from 'canvas-confetti';
import { HeaderHUD } from './components/HeaderHUD';
import { GameCanvas } from './components/GameCanvas';
import { TalentCraftingModal } from './components/TalentCraftingModal';
import { VehicleCustomizerModal } from './components/VehicleCustomizerModal';
import { InventoryModal } from './components/InventoryModal';
import { WorldChatAndTradeModal } from './components/WorldChatAndTradeModal';
import { QuestAchievementModal } from './components/QuestAchievementModal';
import { SupplyStationModal } from './components/SupplyStationModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { SurvivalSkillsModal } from './components/SurvivalSkillsModal';
import { EncounterModal } from './components/EncounterModal';
import { TutorialOverlayModal } from './components/TutorialOverlayModal';
import { GeminiCompanionModal } from './components/GeminiCompanionModal';
import { KeybindingsSettingsModal, DEFAULT_KEYBINDINGS } from './components/KeybindingsSettingsModal';
import { GrowthEvolutionModal } from './components/GrowthEvolutionModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SURVIVAL_SKILL_NODES } from './game/skills';
import { PET_ABILITIES, getFoodFeedBonus, getRequiredPetExp } from './game/petAbilities';

const SAVE_KEY = 'global_highway_survival_save_v1';

export default function App() {
  // Game Engine instance (retains memory pooling & 60fps loop)
  const [engine] = useState(() => new GameEngine());

  // Player state
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    hunger: 80,
    thirst: 85,
    bodyTemp: 37.0,
    spirit: 100,
    courageBadges: 20,
    superiorCourageBadges: 0,
    equippedWeaponId: 'stone',
    hasStorageRing: false,
    storageRingLevel: 'common',
    talentCount: 0, // 0-10 for "10 Phát Nhập Hồn"
    totalCrafts: 0,
    workbenchExp: 0,
    workbenchLevel: 'common',
    survivorRealmLevel: 1,
    killsCount: 0,
    chestsOpenedCount: 0,
    hydroponicUnlocked: false,
    unlockedSkills: {},
  });

  // Vehicle state
  const [vehicleStats, setVehicleStats] = useState<VehicleStats>({
    tier: 'scrap',
    name: 'Xe Van Cũ Nát',
    maxSpeed: 35,
    currentSpeed: 0,
    maxFuel: 30,
    currentFuel: 30,
    fuelEfficiency: 10.0, // 10L/100km
    durability: 100,
    maxDurability: 100,
    mileage: 0,
    radarRange: 50,
    interiorTemp: 28,
    engineLevel: 'common',
    transmissionLevel: 'common',
    tiresLevel: 'common',
    chassisLevel: 'common',
    armorLevel: 'common',
    glassLevel: 'common',
    fuelTankLevel: 'common',
    seatsLevel: 'common',
    hasAC: false,
    acLevel: 'common',
    waterPurifierLevel: 'common',
    waterTankCapacity: 100,
    currentWaterTank: 10,
    waterTankTemp: 25,
    hasRefrigerator: false,
    refrigeratorLevel: 'common',
    hasIceCreamMaker: false,
    iceCreamMakerLevel: 'common',
    coreLevel: 'common',
  });

  // Pet state
  const [petStats, setPetStats] = useState<PetStats>({
    unlocked: true,
    name: 'Chó Vàng Trung Hoa',
    level: 1,
    exp: 0,
    maxExp: 100,
    rarity: 'brilliant',
    hunger: 90,
    hp: 120,
    maxHp: 120,
    attackPower: 35,
    defense: 10,
    alertness: 300,
    unlockedAbilities: ['keen_senses', 'loyal_bite'],
  });

  // Game Stage, Difficulty & Clock
  const [currentStageId, setCurrentStageId] = useState<SurvivalStageId>('stage1_wasteland');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('normal');
  const [gameTimeMinutes, setGameTimeMinutes] = useState<number>(480); // Starts at 8:00 AM (480 mins)
  const [timePhase, setTimePhase] = useState<TimeOfDayPhase>('day');
  const [ambientTemp, setAmbientTemp] = useState<number>(36);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(true);

  // Keybindings State
  const [keybindings, setKeybindings] = useState<KeybindingsConfig>(() => {
    try {
      const saved = localStorage.getItem('highway_survival_keybindings');
      return saved ? { ...DEFAULT_KEYBINDINGS, ...JSON.parse(saved) } : DEFAULT_KEYBINDINGS;
    } catch {
      return DEFAULT_KEYBINDINGS;
    }
  });

  // Collections
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [blueprints, setBlueprints] = useState<Blueprint[]>(INITIAL_BLUEPRINTS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Live Chat & Market
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Hệ Thống Sinh Tồn',
      avatar: '📢',
      isNpc: false,
      isPlayer: false,
      isSystem: true,
      content: 'Chào mừng tất cả 10.000 người chơi đến với Trò chơi Sinh tồn trên Đường Cao Tốc Toàn Cầu. Ban đêm quái thú sẽ hung hãn hơn gấp bội, hãy cẩn thận!',
      timestamp: '08:00',
      channel: 'world',
    },
    {
      id: 'm2',
      sender: 'Người sinh tồn #4829',
      avatar: '🧔',
      isNpc: true,
      isPlayer: false,
      isSystem: false,
      content: 'Trời ơi, xe van này rách nát quá, chạy có 30km/h! Ai có giấy vệ sinh không, tôi sắp điên rồi!',
      timestamp: '08:05',
      channel: 'world',
    },
    {
      id: 'm3',
      sender: 'Tinh Thần',
      avatar: '🥋',
      isNpc: true,
      isPlayer: false,
      isSystem: false,
      content: 'Chào anh bạn Tuyết Mộc! Tôi vừa thấy anh trên kênh thế giới. Tôi có vài bản thiết kế quý nhặt được từ rương màu xanh, khi nào cần cứ liên hệ tôi nhé!',
      timestamp: '08:10',
      channel: 'private_tinh_than',
    },
  ]);

  const [marketListings, setMarketListings] = useState<MarketListing[]>([
    {
      id: 'mk1',
      seller: 'Lý Dũng',
      offeredItemId: 'Khối gỗ tiêu chuẩn',
      offeredQuantity: 10,
      offeredItemRarity: 'common',
      requestedItemId: 'Giấy vệ sinh',
      requestedQuantity: 1,
      isSold: false,
      isPlayerListing: false,
    },
    {
      id: 'mk2',
      seller: 'Cư dân mạng #1024',
      offeredItemId: 'Tấm sắt',
      offeredQuantity: 8,
      offeredItemRarity: 'common',
      requestedItemId: 'Nước tinh khiết 500ml',
      requestedQuantity: 1,
      isSold: false,
      isPlayerListing: false,
    },
  ]);

  // Modals state
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => !localStorage.getItem('highway_tutorial_seen'));
  const [isGeminiAIOpen, setIsGeminiAIOpen] = useState(false);
  const [isKeybindingsOpen, setIsKeybindingsOpen] = useState(false);
  const [activeStation, setActiveStation] = useState<SupplyStationEntity | null>(null);
  const [activeEncounter, setActiveEncounter] = useState<RandomEncounter | null>(null);

  // Auto-Cruise control state
  const [autoCruise, setAutoCruise] = useState(false);

  // Hydroponic Farm plots state (4 plots inside RV)
  const [farmPlots, setFarmPlots] = useState<{
    id: number;
    cropId: string | null;
    cropName: string | null;
    cropIcon: string | null;
    plantedAt: number | null;
    growDurationMs: number;
    waterLevel: number;
    isReady: boolean;
    yieldItemId: string | null;
    yieldQuantity: number;
  }[]>([
    { id: 1, cropId: null, cropName: null, cropIcon: null, plantedAt: null, growDurationMs: 0, waterLevel: 100, isReady: false, yieldItemId: null, yieldQuantity: 0 },
    { id: 2, cropId: null, cropName: null, cropIcon: null, plantedAt: null, growDurationMs: 0, waterLevel: 100, isReady: false, yieldItemId: null, yieldQuantity: 0 },
    { id: 3, cropId: null, cropName: null, cropIcon: null, plantedAt: null, growDurationMs: 0, waterLevel: 100, isReady: false, yieldItemId: null, yieldQuantity: 0 },
    { id: 4, cropId: null, cropName: null, cropIcon: null, plantedAt: null, growDurationMs: 0, waterLevel: 100, isReady: false, yieldItemId: null, yieldQuantity: 0 },
  ]);

  // Active Loot Dialog Modal
  const [lootModalData, setLootModalData] = useState<LootModalData | null>(null);

  const currentStage = SURVIVAL_STAGES.find((s) => s.id === currentStageId) || SURVIVAL_STAGES[0];

  // Context-Aware Music Playback System (Switches dynamically based on game state)
  useEffect(() => {
    if (isMuted || !isBgmPlaying) {
      soundEngine.toggleBgm(false);
      return;
    }

    soundEngine.toggleBgm(true);

    // Context switching: combat, station, night, driving, safe
    const hasNearbyBeast = engine.beasts.some((b) => Math.abs(b.x - engine.carX) < 220);
    if (hasNearbyBeast) {
      soundEngine.setMusicContext('combat');
    } else if (activeStation) {
      soundEngine.setMusicContext('station');
    } else if (timePhase === 'night') {
      soundEngine.setMusicContext('night');
    } else if (engine.mode === 'driving' && vehicleStats.currentSpeed > 0) {
      soundEngine.setMusicContext('driving');
    } else {
      soundEngine.setMusicContext('safe');
    }
  }, [engine.mode, vehicleStats.currentSpeed, activeStation, timePhase, engine.beasts, isMuted, isBgmPlaying, engine.carX]);

  // Equipped Weapon helper
  const equippedWeapon = inventory.find((i) => i.id === playerStats.equippedWeaponId);

  // Sync engine skills & stage
  useEffect(() => {
    engine.skills = playerStats.unlockedSkills || {};
    engine.currentStageId = currentStageId;
  }, [engine, playerStats.unlockedSkills, currentStageId]);

  // Sync vehicle parameters with engine
  useEffect(() => {
    engine.maxSpeed = vehicleStats.maxSpeed || 90;
    engine.fuelEfficiency = vehicleStats.fuelEfficiency || 8.5;
    engine.hasFuel = (vehicleStats.currentFuel || 0) > 0;
  }, [engine, vehicleStats.maxSpeed, vehicleStats.fuelEfficiency, vehicleStats.currentFuel]);

  // Sync engine events
  useEffect(() => {
    let accumulatedDist = 0;
    let accumulatedFuel = 0;
    let lastUiSyncTime = performance.now();

    engine.onVehicleDriveTick = (distKm, fuelUsed, currentSpeed) => {
      accumulatedDist += distKm;
      accumulatedFuel += fuelUsed;

      const now = performance.now();
      // High-performance throttling for React UI state update (12 times/sec)
      if (now - lastUiSyncTime > 80 || currentSpeed === 0) {
        lastUiSyncTime = now;
        const dDist = accumulatedDist;
        const dFuel = accumulatedFuel;
        accumulatedDist = 0;
        accumulatedFuel = 0;

        setVehicleStats((prev) => {
          const nextFuel = Math.max(0, prev.currentFuel - dFuel);
          if (nextFuel <= 0 && prev.currentFuel > 0) {
            engine.hasFuel = false;
          }
          return {
            ...prev,
            currentSpeed: Math.round(currentSpeed),
            mileage: Number((prev.mileage + dDist).toFixed(2)),
            currentFuel: Number(nextFuel.toFixed(2)),
          };
        });
      }
    };

    engine.onPlayerDamaged = (dmg) => {
      setPlayerStats((prev) => {
        const nextHp = Math.max(0, prev.hp - dmg);
        if (nextHp <= 0) {
          soundEngine.playCritFanfare();
        }
        return { ...prev, hp: nextHp };
      });
    };

    engine.onVehicleDamaged = (dmg) => {
      setVehicleStats((prev) => ({
        ...prev,
        durability: Math.max(0, (prev.durability ?? 100) - dmg),
      }));
    };

    engine.onTimeTick = (hours, isNight, phase, temp) => {
      setTimePhase(phase);
      setAmbientTemp(temp);
    };

    engine.onEnterHazardZone = (zone) => {
      soundEngine.playAlert();
    };

    engine.onTriggerEncounter = (enc) => {
      soundEngine.playEncounterStinger();
      setActiveEncounter(enc);
    };
  }, [engine]);

  // ==========================================
  // AUTO STAGE MILESTONE ADVANCEMENT (8 STAGES)
  // ==========================================
  useEffect(() => {
    const km = vehicleStats.mileage;
    for (let i = SURVIVAL_STAGES.length - 1; i >= 0; i--) {
      if (km >= SURVIVAL_STAGES[i].minKm) {
        if (currentStageId !== SURVIVAL_STAGES[i].id) {
          setCurrentStageId(SURVIVAL_STAGES[i].id);
          soundEngine.playLevelUp();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        }
        break;
      }
    }
  }, [vehicleStats.mileage, currentStageId]);

  // ==========================================
  // AUTO CRUISE CONTROL SIMULATOR
  // ==========================================
  useEffect(() => {
    if (autoCruise && engine.mode === 'driving' && (vehicleStats.currentFuel || 0) > 0) {
      engine.keys['KeyW'] = true;
      engine.keys['ArrowUp'] = true;
    } else if (!autoCruise) {
      engine.keys['KeyW'] = false;
      engine.keys['ArrowUp'] = false;
    }
  }, [autoCruise, engine, engine.mode, vehicleStats.currentFuel]);

  // ==========================================
  // HYDROPONIC FARM PROGRESSION TICKER
  // ==========================================
  useEffect(() => {
    const farmInterval = setInterval(() => {
      setFarmPlots((plots) =>
        plots.map((plot) => {
          if (plot.cropId && plot.plantedAt && !plot.isReady) {
            const elapsed = Date.now() - plot.plantedAt;
            if (elapsed >= plot.growDurationMs) {
              return { ...plot, isReady: true };
            }
          }
          return plot;
        })
      );
    }, 2000);
    return () => clearInterval(farmInterval);
  }, []);

  // ==========================================
  // DYNAMIC WORLD CHAT BARTER BROADCASTER
  // ==========================================
  useEffect(() => {
    const dynamicNpcTrades = [
      {
        sender: 'Lâm Báo (Km 16)',
        avatar: '🤠',
        content: 'Tôi vừa nhặt được 5 Tấm Sắt và Khối Gỗ ở ven đường cao tốc, có ai đổi 1 Bánh Mì không? Đói quá rồi!',
        tradeOffer: {
          offeredItemId: 'iron_plate',
          offeredItemName: 'Tấm sắt',
          offeredQuantity: 5,
          requestedItemId: 'bread',
          requestedItemName: 'Bánh mì sinh tồn',
          requestedQuantity: 1,
          isClaimed: false,
        },
      },
      {
        sender: 'Mục Lan Nhi',
        avatar: '👩‍🦰',
        content: 'Bán 10L Xăng cao cấp cho ai đang cạn bình phía sau! Tôi cần 2 chai Nước Tinh Khiết để qua sa mạc.',
        tradeOffer: {
          offeredItemId: 'high_grade_fuel',
          offeredItemName: 'Xăng cao cấp',
          offeredQuantity: 10,
          requestedItemId: 'purified_water_500ml',
          requestedItemName: 'Nước tinh khiết 500ml',
          requestedQuantity: 2,
          isClaimed: false,
        },
      },
      {
        sender: 'Thợ Săn Độc Hành #902',
        avatar: '🏹',
        content: 'Có ai cần Bản vẽ Nỏ Gia Cường không? Tôi muốn đổi lấy 2 Tấm Đồng để gia cố khung xe!',
        tradeOffer: {
          offeredItemId: 'blueprint_bp_reinforced_crossbow',
          offeredItemName: 'Bản Thiết Kế: Nỏ Gia Cường',
          offeredQuantity: 1,
          requestedItemId: 'copper_plate',
          requestedItemName: 'Tấm đồng',
          requestedQuantity: 2,
          isClaimed: false,
        },
      },
      {
        sender: 'Bác Sĩ Trần',
        avatar: '🩺',
        content: 'Ai bị dã thú cắn không? Tôi đổi Bản vẽ Hộp Cứu Thương lấy 3 Khối Gỗ nhóm lửa chống lạnh đêm!',
        tradeOffer: {
          offeredItemId: 'blueprint_bp_medical_kit',
          offeredItemName: 'Bản Thiết Kế: Hộp Cứu Thương',
          offeredQuantity: 1,
          requestedItemId: 'wood',
          requestedItemName: 'Khối gỗ tiêu chuẩn',
          requestedQuantity: 3,
          isClaimed: false,
        },
      },
      {
        sender: 'Cư dân mạng #7712',
        avatar: '🧐',
        content: 'Bão Cát phía trước ghê quá, xe bị vỡ kính! Ai có 3 Cao Su không, đổi 1 Tinh Thể Không Gian này!',
        tradeOffer: {
          offeredItemId: 'space_crystal',
          offeredItemName: 'Tinh thể không gian',
          offeredQuantity: 1,
          requestedItemId: 'rubber',
          requestedItemName: 'Cao su',
          requestedQuantity: 3,
          isClaimed: false,
        },
      },
    ];

    let tradeIdx = 0;
    const chatInterval = setInterval(() => {
      const template = dynamicNpcTrades[tradeIdx % dynamicNpcTrades.length];
      tradeIdx++;

      setChatHistory((prev) => [
        ...prev,
        {
          id: `msg_dyn_${Date.now()}`,
          sender: template.sender,
          avatar: template.avatar,
          isNpc: true,
          isPlayer: false,
          isSystem: false,
          content: template.content,
          timestamp: `${Math.floor((gameTimeMinutes % 1440) / 60)
            .toString()
            .padStart(2, '0')}:${(gameTimeMinutes % 60).toString().padStart(2, '0')}`,
          channel: 'world',
          tradeOffer: { ...template.tradeOffer, isClaimed: false },
        },
      ]);
    }, 24000);

    return () => clearInterval(chatInterval);
  }, [gameTimeMinutes]);

  // ==========================================
  // AUTO LOAD / SAVE ENGINE
  // ==========================================
  useEffect(() => {
    const savedRaw = localStorage.getItem(SAVE_KEY);
    if (savedRaw) {
      try {
        const data: GameSaveData = JSON.parse(savedRaw);
        if (data && data.playerStats) {
          setPlayerStats(data.playerStats);
          setVehicleStats({
            ...data.vehicleStats,
            durability: data.vehicleStats.durability ?? 100,
            maxDurability: data.vehicleStats.maxDurability ?? 100,
          });
          setPetStats(data.petStats);
          setCurrentStageId(data.currentStage);
          setGameDifficulty(data.gameDifficulty || 'normal');
          setGameTimeMinutes(data.gameTimeMinutes);
          setInventory(data.inventory);
          setBlueprints(data.blueprints);
          setQuests(data.quests);
          setAchievements(data.achievements);
          setChatHistory(data.chatHistory);
          setMarketListings(data.marketListings);
          engine.difficulty = data.gameDifficulty || 'normal';
        }
      } catch (e) {
        console.error('Error loading save:', e);
      }
    }
  }, [engine]);

  const saveCurrentGame = (slot: number = 1) => {
    const data: GameSaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      saveSlot: slot,
      gameDifficulty,
      playerStats,
      vehicleStats,
      petStats,
      currentStage: currentStageId,
      gameTimeMinutes,
      currentDistance: vehicleStats.mileage,
      inventory,
      blueprints,
      quests,
      achievements,
      chatHistory,
      marketListings,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    localStorage.setItem(`${SAVE_KEY}_slot_${slot}`, JSON.stringify(data));
  };

  // Switch difficulty
  const handleChangeDifficulty = (newDiff: GameDifficulty) => {
    setGameDifficulty(newDiff);
    engine.difficulty = newDiff;
    const currentFrontier = Math.max(engine.carX, engine.playerX);
    if (currentFrontier + 60000 > engine.roadGenerationDistance) {
      engine.generateWorldSegment(engine.roadGenerationDistance, currentFrontier + 60000);
      engine.roadGenerationDistance = currentFrontier + 60000;
    }
  };

  // Repair vehicle using Iron Plate
  const handleRepairVehicle = () => {
    const ironItem = inventory.find((i) => i.id === 'iron_plate' || i.id === 'iron');
    if (!ironItem || ironItem.quantity < 1) {
      alert('⚠️ Bạn cần ít nhất 1 Tấm Sắt (iron_plate) trong túi đồ để sửa chữa xe!');
      return;
    }

    setInventory((inv) =>
      inv
        .map((i) => (i.id === ironItem.id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );

    setVehicleStats((v) => {
      const current = v.durability ?? 100;
      const max = v.maxDurability ?? 100;
      const nextDurability = Math.min(max, current + 20);
      return { ...v, durability: nextDurability };
    });

    engine.addFloatingText(engine.carX, engine.carLaneY - 20, '🛠️ ĐÃ SỬA XE: +20% ĐỘ BỀN!', '#38bdf8');
  };

  // ==========================================
  // IN-GAME SURVIVAL TIMER & TIME LOOP
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => {
      // 1 real sec = 1 in-game minute
      setGameTimeMinutes((prev) => prev + 1);

      // Decay multiplier based on difficulty
      const diffDecayMult = gameDifficulty === 'nightmare' ? 1.9 : gameDifficulty === 'hard' ? 1.4 : 1.0;

      // Survival decay
      setPlayerStats((prev) => {
        const newHunger = Math.max(0, prev.hunger - 0.04 * diffDecayMult);
        const newThirst = Math.max(0, prev.thirst - 0.08 * diffDecayMult);

        // Extreme heat / cold effects
        let tempDiff = ambientTemp - (vehicleStats.hasAC ? 24 : 37);
        let newBodyTemp = prev.bodyTemp;
        if (tempDiff > 0 && !vehicleStats.hasAC) {
          newBodyTemp = Math.min(42.0, newBodyTemp + 0.02 * diffDecayMult);
        } else if (tempDiff < -15) {
          newBodyTemp = Math.max(34.0, newBodyTemp - 0.02 * diffDecayMult);
        } else {
          newBodyTemp = Math.max(36.5, Math.min(37.5, newBodyTemp));
        }

        // Damage from hunger / thirst / heatstroke / hypothermia
        let newHp = prev.hp;
        if (newHunger <= 0 || newThirst <= 0 || newBodyTemp >= 40.5 || newBodyTemp <= 34.5) {
          newHp = Math.max(0, newHp - 0.35 * diffDecayMult);
        }

        return {
          ...prev,
          hunger: newHunger,
          thirst: newThirst,
          bodyTemp: newBodyTemp,
          hp: newHp,
        };
      });

      // Water Condenser (Máy Lọc Nước) generation into Water Tank
      if (vehicleStats.waterPurifierLevel !== 'common') {
        setVehicleStats((v) => {
          const generatedWater = 0.05;
          return {
            ...v,
            currentWaterTank: Math.min(v.waterTankCapacity, v.currentWaterTank + generatedWater),
          };
        });
      }

      // Stage Weather Progression
      const day = Math.floor(gameTimeMinutes / 1440) + 1;
      if (day >= 6 && currentStageId !== 'stage4_nightmare_spirits' && currentStageId !== 'stage3_crossroads_bandits') {
        setCurrentStageId('stage3_crossroads_bandits');
      } else if (day >= 3 && currentStageId === 'stage1_wasteland') {
        setCurrentStageId('stage2_extreme_heat');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStageId, gameTimeMinutes, gameDifficulty, ambientTemp, vehicleStats.hasAC, vehicleStats.waterPurifierLevel, engine]);

  // Periodic Auto-save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveCurrentGame(1);
    }, 15000);
    return () => clearInterval(saveInterval);
  });

  // ==========================================
  // REWARD & CRAFTING LOGIC (10 PHÁT NHẬP HỒN)
  // ==========================================
  const handleCraftItem = (blueprintId: string, count: number, isSoulInfusion: boolean) => {
    const bp = blueprints.find((b) => b.id === blueprintId);
    if (!bp) return;

    // Deduct ingredients
    setInventory((inv) => {
      const nextInv = [...inv];
      for (const ing of bp.ingredients) {
        const itemIdx = nextInv.findIndex((i) => i.id === ing.itemId);
        if (itemIdx >= 0) {
          nextInv[itemIdx] = {
            ...nextInv[itemIdx],
            quantity: Math.max(0, nextInv[itemIdx].quantity - ing.quantity * count),
          };
        }
      }

      // Add resulting item
      let resultRarity = bp.rarity;
      if (isSoulInfusion) {
        // Soul infusion upgrade: +1 to +3 rarity tiers
        const rand = Math.random();
        if (rand < 0.05) resultRarity = 'brilliant';
        else if (rand < 0.35) resultRarity = 'epic';
        else resultRarity = 'perfect';
      }

      const existingIdx = nextInv.findIndex((i) => i.id === bp.resultItemId);
      if (existingIdx >= 0) {
        nextInv[existingIdx] = {
          ...nextInv[existingIdx],
          quantity: nextInv[existingIdx].quantity + bp.resultQuantity * count,
          rarity: resultRarity,
        };
      } else {
        nextInv.push({
          id: bp.resultItemId,
          name: bp.name,
          category: bp.category === 'weapon' ? 'weapon' : bp.category === 'vehicle' ? 'part' : 'material',
          rarity: resultRarity,
          quantity: bp.resultQuantity * count,
          description: bp.description,
          icon: bp.category === 'weapon' ? '🗡️' : bp.category === 'vehicle' ? '⚙️' : '📦',
        });
      }

      return nextInv.filter((i) => i.quantity > 0);
    });

    // Update Talent Counter & Workbench Exp
    setPlayerStats((prev) => {
      const nextTalent = (prev.talentCount + count) % 10;
      const nextExp = prev.workbenchExp + count * 5;
      let nextWbLevel = prev.workbenchLevel;
      if (nextExp >= 100 && prev.workbenchLevel === 'common') nextWbLevel = 'good';
      if (nextExp >= 250 && prev.workbenchLevel === 'good') nextWbLevel = 'superior';
      if (nextExp >= 500 && prev.workbenchLevel === 'superior') nextWbLevel = 'perfect';

      return {
        ...prev,
        talentCount: nextTalent,
        totalCrafts: prev.totalCrafts + count,
        workbenchExp: nextExp,
        workbenchLevel: nextWbLevel,
      };
    });

    // Auto update quest counts
    updateQuestProgress('q_main_1', count);
    updateQuestProgress('q_daily_2', count);
    if (bp.id === 'bp_water_purifier') updateQuestProgress('q_main_2', 1);
    if (bp.id === 'bp_desert_eagle' || bp.id === 'bp_tang_dao') updateQuestProgress('q_main_4', 1);
  };

  const handleLearnBlueprint = (bpId: string) => {
    setBlueprints((bps) => bps.map((b) => (b.id === bpId ? { ...b, learned: true } : b)));
  };

  const updateQuestProgress = (questId: string, delta: number) => {
    setQuests((qs) =>
      qs.map((q) => {
        if (q.id === questId) {
          const nextCount = q.currentCount + delta;
          const completed = nextCount >= q.targetCount;
          return { ...q, currentCount: nextCount, completed };
        }
        return q;
      })
    );
  };

  // Chest loot handler
  const handleOpenChest = (chest: ChestEntity) => {
    chest.isOpened = true;
    soundEngine.playLootChest();

    const lootedSummary: LootModalItem[] = [];

    // Add items to inventory & unlock blueprints
    setInventory((inv) => {
      const nextInv = [...inv];
      for (const item of chest.items) {
        const isBp = item.itemId.startsWith('blueprint_') || item.itemId.startsWith('bp_');
        const bpId = item.itemId.replace('blueprint_', '');
        if (isBp) {
          handleLearnBlueprint(bpId);
        }

        const info = resolveItemInfo(item.itemId, chest.rarity);
        const itemName = isBp ? `Bản Thiết Kế: ${bpId.replace('bp_', '')}` : info.name;
        const itemRarity = info.rarity || chest.rarity;
        const itemIcon = isBp ? '📜' : info.icon;

        lootedSummary.push({
          id: `loot_${item.itemId}_${Date.now()}_${Math.random()}`,
          itemId: item.itemId,
          name: itemName,
          quantity: item.quantity,
          rarity: itemRarity,
          icon: itemIcon,
        });

        const idx = nextInv.findIndex((i) => i.id === item.itemId);
        if (idx >= 0) {
          nextInv[idx] = { ...nextInv[idx], quantity: nextInv[idx].quantity + item.quantity };
        } else {
          nextInv.push({
            id: item.itemId,
            name: itemName,
            category: isBp ? 'blueprint' : 'material',
            rarity: itemRarity,
            quantity: item.quantity,
            description: isBp
              ? 'Bản thiết kế chế tạo mở khóa công thức tại Bàn Rèn Thần Kỳ.'
              : 'Vật phẩm thu được từ rương tài nguyên.',
            icon: itemIcon,
          });
        }
      }
      return nextInv;
    });

    setPlayerStats((p) => ({
      ...p,
      courageBadges: p.courageBadges + (chest.rarity === 'brilliant' ? 30 : 5),
    }));

    setLootModalData({
      title: `RƯƠNG TÀI NGUYÊN (${chest.rarity.toUpperCase()})`,
      items: lootedSummary,
    });
  };

  // Harvest beast handler
  const handleHarvestBeast = (beast: BeastEntity) => {
    soundEngine.playClick();
    const lootedSummary: LootModalItem[] = [];

    setInventory((inv) => {
      const nextInv = [...inv];
      for (const drop of beast.drops) {
        const info = resolveItemInfo(drop.itemId, beast.rarity);
        lootedSummary.push({
          id: `loot_${drop.itemId}_${Date.now()}_${Math.random()}`,
          itemId: drop.itemId,
          name: info.name,
          quantity: drop.quantity,
          rarity: info.rarity || beast.rarity,
          icon: info.icon,
        });

        const idx = nextInv.findIndex((i) => i.id === drop.itemId);
        if (idx >= 0) {
          nextInv[idx] = { ...nextInv[idx], quantity: nextInv[idx].quantity + drop.quantity };
        } else {
          nextInv.push({
            id: drop.itemId,
            name: info.name,
            category: 'consumable',
            rarity: info.rarity || beast.rarity,
            quantity: drop.quantity,
            description: `Thu hoạch từ xác ${beast.name}`,
            icon: info.icon,
          });
        }
      }
      return nextInv;
    });

    setPlayerStats((p) => ({
      ...p,
      courageBadges: p.courageBadges + beast.badgesDrop,
    }));

    // Remove beast from scene
    engine.beasts = engine.beasts.filter((b) => b.id !== beast.id);

    setLootModalData({
      title: `THU HOẠCH: ${beast.name.toUpperCase()}`,
      items: lootedSummary,
    });

    updateQuestProgress('q_main_3', 1);
  };

  // Discard loot item directly from loot modal
  const handleDiscardLootItem = (itemToDiscard: LootModalItem) => {
    soundEngine.playClick();

    // 1. Remove or deduct from player's inventory
    setInventory((inv) => {
      let quantityToDeduct = itemToDiscard.quantity;
      const nextInv: InventoryItem[] = [];

      for (const invItem of inv) {
        const match =
          (itemToDiscard.itemId && invItem.id === itemToDiscard.itemId) ||
          invItem.name.toLowerCase() === itemToDiscard.name.toLowerCase();

        if (match && quantityToDeduct > 0) {
          const deduct = Math.min(invItem.quantity, quantityToDeduct);
          quantityToDeduct -= deduct;
          const remaining = invItem.quantity - deduct;
          if (remaining > 0) {
            nextInv.push({ ...invItem, quantity: remaining });
          }
        } else {
          nextInv.push(invItem);
        }
      }
      return nextInv;
    });

    // 2. Remove item from lootModalData
    setLootModalData((prev) => {
      if (!prev) return null;
      const remainingItems = prev.items.filter((it) => {
        if (itemToDiscard.id && it.id) {
          return it.id !== itemToDiscard.id;
        }
        return it !== itemToDiscard && it.name !== itemToDiscard.name;
      });

      if (remainingItems.length === 0) {
        return null;
      }
      return {
        ...prev,
        items: remainingItems,
      };
    });

    // 3. Audio & Floating Text feedback
    engine.addFloatingText(engine.carX, engine.carLaneY - 25, `🗑️ ĐÃ VỨT BỎ: ${itemToDiscard.name}`, '#ef4444');
  };

  // ==========================================
  // VEHICLE UPGRADES & FACILITIES
  // ==========================================
  const handleUpgradeVehicleCore = () => {
    setVehicleStats((v) => ({
      ...v,
      tier: 'rv_luxury',
      name: 'Xe Nhà RV Sang Trọng',
      maxSpeed: 120,
      maxFuel: 150,
      currentFuel: 150,
      fuelEfficiency: 3.0, // 3L/100km
      radarRange: 500,
      durability: 200,
      maxDurability: 200,
      hasAC: true,
      hasRefrigerator: true,
      hasIceCreamMaker: true,
      coreLevel: 'perfect',
    }));
    updateQuestProgress('q_main_5', 1);
  };

  const handleToggleAC = () => {
    setVehicleStats((v) => ({ ...v, hasAC: !v.hasAC }));
  };

  const handleMakeIce = () => {
    setInventory((inv) => {
      const water = inv.find((i) => i.id.includes('water'));
      if (!water || water.quantity < 1) {
        alert('Cần có Nước Tinh Khiết trong túi để làm đá!');
        return inv;
      }
      soundEngine.playLootChest();
      return [
        ...inv.filter((i) => i.id !== 'ice_salt'),
        {
          id: 'ice_salt',
          name: 'Băng Muối Giải Nhiệt (50ml)',
          category: 'consumable',
          rarity: 'perfect',
          quantity: 10,
          description: 'Cực phẩm hạ hỏa chống say nắng giữa sa mạc 65°C.',
          icon: '🧊',
          stats: { tempMod: -2.5, waterValue: 20 },
        },
      ];
    });
    updateQuestProgress('q_hidden_1', 10);
  };

  const handleMakeIceCream = () => {
    soundEngine.playCritFanfare();
    setInventory((inv) => [
      ...inv.filter((i) => i.id !== 'ice_cream'),
      {
        id: 'ice_cream',
        name: 'Kem Bơ Tuyết Ướp Lạnh',
        category: 'consumable',
        rarity: 'brilliant',
        quantity: 5,
        description: 'Kem bơ thượng hạng làm từ máy làm kem Tuyết Mộc.',
        icon: '🍦',
        stats: { hungerValue: 40, tempMod: -3.0, spiritBonus: 10 },
      },
    ]);
  };

  // ==========================================
  // SURVIVAL SKILLS SYSTEM
  // ==========================================
  const handleUnlockSkill = (skillId: string) => {
    const node = SURVIVAL_SKILL_NODES.find((s) => s.id === skillId);
    if (!node) return;

    const currentLvl = (playerStats.unlockedSkills && playerStats.unlockedSkills[skillId]) || 0;
    if (currentLvl >= node.maxLevel) return;

    const cost = node.costPerLevel[currentLvl];
    if (playerStats.courageBadges < cost) {
      alert(`Không đủ Huy Hiệu Dũng Khí! Cần ${cost} huy hiệu.`);
      return;
    }

    const nextLvl = currentLvl + 1;
    const newUnlocked = { ...(playerStats.unlockedSkills || {}), [skillId]: nextLvl };

    setPlayerStats((prev) => ({
      ...prev,
      courageBadges: prev.courageBadges - cost,
      unlockedSkills: newUnlocked,
    }));

    engine.skills = newUnlocked;

    // Apply immediate vehicle passives
    if (skillId === 'fuel_optimizer') {
      setVehicleStats((v) => ({
        ...v,
        fuelEfficiency: Math.max(2.0, 10.0 - nextLvl * 1.5),
      }));
    }

    soundEngine.playCritFanfare();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  // ==========================================
  // RANDOM HIGHWAY ENCOUNTERS HANDLER
  // ==========================================
  const handleResolveEncounter = (choice: EncounterChoice) => {
    // 1. Consume item if required
    if (choice.requiredItemId) {
      setInventory((inv) =>
        inv
          .map((i) => {
            if (
              i.id === choice.requiredItemId ||
              i.name.toLowerCase().includes((choice.requiredItemName || '').toLowerCase())
            ) {
              return { ...i, quantity: i.quantity - (choice.requiredItemQty || 1) };
            }
            return i;
          })
          .filter((i) => i.quantity > 0)
      );
    }

    // 2. Apply player badges & HP changes
    setPlayerStats((p) => {
      let nextBadges = p.courageBadges - (choice.requiredBadges || 0);
      if (choice.outcome.rewardBadges) nextBadges += choice.outcome.rewardBadges;

      let nextHp = p.hp;
      if (choice.outcome.rewardHp) nextHp = Math.min(p.maxHp, nextHp + choice.outcome.rewardHp);
      if (choice.outcome.damageHp) nextHp = Math.max(0, nextHp - choice.outcome.damageHp);

      return {
        ...p,
        courageBadges: Math.max(0, nextBadges),
        hp: nextHp,
      };
    });

    // 3. Apply vehicle changes
    if (choice.outcome.rewardFuel || choice.outcome.vehicleDurabilityDelta) {
      setVehicleStats((v) => {
        let fuel = v.currentFuel;
        if (choice.outcome.rewardFuel) {
          fuel = Math.min(v.maxFuel, fuel + choice.outcome.rewardFuel);
        }
        let dur = v.durability;
        if (choice.outcome.vehicleDurabilityDelta) {
          dur = Math.max(0, Math.min(v.maxDurability, dur + choice.outcome.vehicleDurabilityDelta));
        }
        return { ...v, currentFuel: fuel, durability: dur };
      });
    }

    // 4. Add reward items
    if (choice.outcome.rewardItems && choice.outcome.rewardItems.length > 0) {
      const lootedSummary: LootModalItem[] = [];
      setInventory((inv) => {
        const next = [...inv];
        for (const rew of choice.outcome.rewardItems!) {
          const isBp = rew.itemId.startsWith('blueprint_') || rew.itemId.startsWith('bp_');
          if (isBp) {
            handleLearnBlueprint(rew.itemId.replace('blueprint_', ''));
          }

          const info = resolveItemInfo(rew.itemId, rew.rarity || 'brilliant');
          const itemName = rew.name || info.name;
          const itemRarity = rew.rarity || info.rarity;
          const itemIcon = isBp ? '📜' : rew.icon || info.icon;

          lootedSummary.push({
            id: `loot_${rew.itemId}_${Date.now()}_${Math.random()}`,
            itemId: rew.itemId,
            name: itemName,
            quantity: rew.quantity,
            rarity: itemRarity,
            icon: itemIcon,
          });

          const idx = next.findIndex((i) => i.id === rew.itemId || i.name === rew.name);
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + rew.quantity };
          } else {
            next.push({
              id: rew.itemId,
              name: itemName,
              category: isBp ? 'blueprint' : 'material',
              rarity: itemRarity,
              quantity: rew.quantity,
              description: 'Chiến lợi phẩm từ biến cố xa lộ.',
              icon: itemIcon,
            });
          }
        }
        return next;
      });

      setLootModalData({
        title: `PHẦN THƯỞNG: ${choice.label.toUpperCase()}`,
        items: lootedSummary,
      });
    }

    soundEngine.playCritFanfare();
  };

  // ==========================================
  // INVENTORY ACTIONS & CONSUMABLES
  // ==========================================
  const handleUseItem = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    soundEngine.playClick();

    // Consume item
    if (item.category === 'consumable') {
      setPlayerStats((p) => {
        const stats = item.stats;
        return {
          ...p,
          hunger: Math.min(100, p.hunger + (stats?.hungerValue || 20)),
          thirst: Math.min(100, p.thirst + (stats?.waterValue || 25)),
          hp: Math.min(p.maxHp, p.hp + (stats?.healValue || 0)),
          bodyTemp: Math.max(36.5, p.bodyTemp + (stats?.tempMod || 0)),
          spirit: Math.min(100, p.spirit + (stats?.spiritBonus || 0)),
        };
      });

      // Deduct quantity
      setInventory((inv) =>
        inv
          .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0)
      );
    } else if (item.category === 'weapon') {
      setPlayerStats((p) => ({ ...p, equippedWeaponId: itemId }));
    }
  };

  // ==========================================
  // COMPANION PET LEVELING & INTERACTION
  // ==========================================
  const handleFeedPet = (itemId: string) => {
    const food = inventory.find((i) => i.id === itemId);
    if (!food) return;

    const bonus = getFoodFeedBonus(food.id, food.name);
    soundEngine.playDogBark();

    setPetStats((prev) => {
      const curExp = (prev.exp || 0) + bonus.exp;
      let nextExp = curExp;
      let nextLvl = prev.level || 1;
      let nextMaxExp = prev.maxExp || getRequiredPetExp(nextLvl);
      let nextMaxHp = prev.maxHp || 120;
      let nextHp = Math.min(nextMaxHp + bonus.hp, prev.hp + bonus.hp);
      let nextAtk = prev.attackPower;
      let nextAlert = prev.alertness;
      let nextDef = prev.defense || 10;
      let nextAbilities = [...(prev.unlockedAbilities || ['keen_senses', 'loyal_bite'])];

      // Check level up threshold
      while (nextExp >= nextMaxExp) {
        nextExp -= nextMaxExp;
        nextLvl += 1;
        nextMaxExp = getRequiredPetExp(nextLvl);
        nextMaxHp += 30;
        nextHp = nextMaxHp; // Full heal on level up
        nextAtk += 12;
        nextAlert += 50;
        nextDef += 5;

        soundEngine.playPetLevelUp();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        engine.addFloatingText(engine.carX, engine.carLaneY - 30, `🐕 CHÓ VÀNG ĐẠT CẤP ${nextLvl}!`, '#ffcc00');

        // Unlock abilities based on new level
        PET_ABILITIES.forEach((ab) => {
          if (nextLvl >= ab.minLevel && !nextAbilities.includes(ab.id)) {
            nextAbilities.push(ab.id);
          }
        });
      }

      return {
        ...prev,
        level: nextLvl,
        exp: nextExp,
        maxExp: nextMaxExp,
        hp: nextHp,
        maxHp: nextMaxHp,
        attackPower: nextAtk,
        alertness: nextAlert,
        defense: nextDef,
        hunger: Math.min(100, prev.hunger + 35),
        unlockedAbilities: nextAbilities,
      };
    });

    // Deduct consumed item
    setInventory((inv) =>
      inv
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handlePetPraise = () => {
    soundEngine.playDogBark();
    setPlayerStats((p) => ({
      ...p,
      spirit: Math.min(100, p.spirit + 15),
    }));
    engine.addFloatingText(engine.carX, engine.carLaneY - 20, '❤️ VUỐT VE CHÓ VÀNG: +15 TINH THẦN!', '#ff69b4');
  };

  // ==========================================
  // GLOBAL KEYBOARD SHORTCUTS (BOUND TO USER SETTINGS)
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === keybindings.skills) {
        e.preventDefault();
        setIsSkillsOpen((prev) => !prev);
      } else if (e.code === keybindings.crafting) {
        e.preventDefault();
        setIsCraftingOpen((prev) => !prev);
      } else if (e.code === keybindings.vehicle) {
        e.preventDefault();
        setIsVehicleOpen((prev) => !prev);
      } else if (e.code === keybindings.inventory) {
        e.preventDefault();
        setIsInventoryOpen((prev) => !prev);
      } else if (e.code === keybindings.chat) {
        e.preventDefault();
        setIsChatOpen((prev) => !prev);
      } else if (e.code === keybindings.quests) {
        e.preventDefault();
        setIsQuestsOpen((prev) => !prev);
      } else if (e.code === keybindings.companionAI) {
        e.preventDefault();
        setIsGeminiAIOpen((prev) => !prev);
      } else if (e.code === keybindings.tutorial) {
        e.preventDefault();
        setIsTutorialOpen((prev) => !prev);
      } else if (e.code === keybindings.radio) {
        e.preventDefault();
        setIsVehicleOpen(true);
      } else if (e.code === 'KeyG') {
        e.preventDefault();
        setIsGrowthOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setIsSkillsOpen(false);
        setIsCraftingOpen(false);
        setIsVehicleOpen(false);
        setIsInventoryOpen(false);
        setIsChatOpen(false);
        setIsQuestsOpen(false);
        setIsGrowthOpen(false);
        setIsSaveOpen(false);
        setIsTutorialOpen(false);
        setIsGeminiAIOpen(false);
        setIsKeybindingsOpen(false);
        setActiveStation(null);
        setLootModalData(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keybindings]);

  // General item grant handler
  const handleAddItem = (itemId: string, qty: number) => {
    const info = resolveItemInfo(itemId);
    setInventory((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          id: itemId,
          name: info.name,
          category: 'material',
          rarity: info.rarity || 'common',
          quantity: qty,
          description: (info as any).description || 'Vật phẩm thu hoạch và tài nguyên trưởng thành.',
          icon: info.icon || '📦',
        },
      ];
    });
  };

  // General item deduction handler (returns true if successful)
  const handleRemoveItem = (itemId: string, qty: number): boolean => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item || item.quantity < qty) return false;
    setInventory((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - qty) } : i))
        .filter((i) => i.quantity > 0)
    );
    return true;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050506] text-white overflow-hidden select-none font-mono">
      {/* 1. TOP HEADER HUD */}
      <HeaderHUD
        player={playerStats}
        vehicle={vehicleStats}
        stage={currentStage}
        gameTimeMinutes={gameTimeMinutes}
        gameDifficulty={gameDifficulty}
        timePhase={timePhase}
        ambientTemp={ambientTemp}
        isMuted={isMuted}
        isBgmPlaying={isBgmPlaying}
        keybindings={keybindings}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          soundEngine.setMuted(next);
        }}
        onToggleBgm={() => {
          const next = !isBgmPlaying;
          setIsBgmPlaying(next);
          soundEngine.toggleBgm(next);
        }}
        onChangeDifficulty={handleChangeDifficulty}
        onRepairVehicle={handleRepairVehicle}
        onOpenCrafting={() => setIsCraftingOpen(true)}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenVehicle={() => setIsVehicleOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenQuests={() => setIsQuestsOpen(true)}
        onOpenGrowth={() => setIsGrowthOpen(true)}
        onOpenSave={() => setIsSaveOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenGeminiAI={() => setIsGeminiAIOpen(true)}
        onOpenKeybindings={() => setIsKeybindingsOpen(true)}
      />

      {/* 2. 2D PIXEL HIGHWAY CANVAS GAME WORLD */}
      <main className="flex-1 relative overflow-hidden flex">
        <GameCanvas
          engine={engine}
          equippedWeapon={equippedWeapon}
          hasBaitItem={inventory.some((i) => i.id.includes('bait') || i.id.includes('poison'))}
          vehicleSpeed={vehicleStats.currentSpeed}
          autoCruise={autoCruise}
          onToggleAutoCruise={() => setAutoCruise((prev) => !prev)}
          onOpenChestModal={handleOpenChest}
          onVisitStationModal={(st) => setActiveStation(st)}
          onHarvestBeastModal={handleHarvestBeast}
          onDriveToggle={(isDriving) => {
            // mode toggled
          }}
        />
      </main>

      {/* ==========================================
          MODALS & SYSTEM OVERLAYS
          ========================================== */}

      {/* MODAL 1: BÀN RÈN THẦN KỲ (CRAFTING & 10 PHÁT NHẬP HỒN) */}
      <TalentCraftingModal
        isOpen={isCraftingOpen}
        onClose={() => setIsCraftingOpen(false)}
        blueprints={blueprints}
        inventory={inventory}
        talentCount={playerStats.talentCount}
        workbenchLevel={playerStats.workbenchLevel}
        workbenchExp={playerStats.workbenchExp}
        onCraft={handleCraftItem}
        onLearnBlueprint={handleLearnBlueprint}
      />

      {/* MODAL 2: XE NHÀ RV, RADIO & NÂNG CẤP */}
      <VehicleCustomizerModal
        isOpen={isVehicleOpen}
        onClose={() => setIsVehicleOpen(false)}
        vehicle={vehicleStats}
        onUpgradePart={(partName, targetLevel) => {
          setVehicleStats((v) => ({ ...v, [partName]: targetLevel }));
        }}
        onUpgradeCore={handleUpgradeVehicleCore}
        onToggleAC={handleToggleAC}
        onSetWaterTemp={(temp) => setVehicleStats((v) => ({ ...v, waterTankTemp: temp }))}
        onMakeIce={handleMakeIce}
        onMakeIceCream={handleMakeIceCream}
        currentStageName={currentStage.name}
        currentMileage={vehicleStats.mileage}
        courageBadges={playerStats.courageBadges}
        ambientTemp={ambientTemp}
        isNight={timePhase === 'night'}
      />

      {/* MODAL 3: NHẪN TRỮ VẬT & HUẤN LUYỆN THÚ CƯNG */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        playerStats={playerStats}
        petStats={petStats}
        onEquipWeapon={(wId) => setPlayerStats((p) => ({ ...p, equippedWeaponId: wId }))}
        onUseItem={handleUseItem}
        onFeedPet={handleFeedPet}
        onPetPraise={handlePetPraise}
        onHatchPetEgg={() => {
          soundEngine.playCritFanfare();
          setPetStats((pet) => ({ ...pet, unlocked: true }));
        }}
        onLearnBlueprint={handleLearnBlueprint}
      />

      {/* MODAL 4: KÊNH THẾ GIỚI & GIAO DỊCH CHỢ */}
      <WorldChatAndTradeModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatHistory={chatHistory}
        marketListings={marketListings}
        inventory={inventory}
        courageBadges={playerStats.courageBadges}
        onSendMessage={(channel, content) => {
          setChatHistory((prev) => [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              sender: 'Tuyết Mộc',
              avatar: '🚗',
              isNpc: false,
              isPlayer: true,
              isSystem: false,
              content,
              timestamp: `${Math.floor((gameTimeMinutes % 1440) / 60)
                .toString()
                .padStart(2, '0')}:${(gameTimeMinutes % 60).toString().padStart(2, '0')}`,
              channel,
            },
          ]);
        }}
        onDirectChatTrade={(offer, messageId) => {
          const reqItem = inventory.find(
            (i) =>
              i.id === offer.requestedItemId ||
              i.name.toLowerCase().includes(offer.requestedItemName.toLowerCase()) ||
              i.id.includes(offer.requestedItemId)
          );
          if (!reqItem || reqItem.quantity < offer.requestedQuantity) {
            alert(`Bạn không có đủ ${offer.requestedQuantity}x ${offer.requestedItemName} trong túi!`);
            return;
          }

          soundEngine.playCritFanfare();
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });

          // Deduct requested items & add offered items
          setInventory((inv) => {
            let next = inv
              .map((i) => {
                if (i.id === reqItem.id) {
                  return { ...i, quantity: i.quantity - offer.requestedQuantity };
                }
                return i;
              })
              .filter((i) => i.quantity > 0);

            const isBp =
              offer.offeredItemId.startsWith('blueprint_') || offer.offeredItemId.startsWith('bp_');
            if (isBp) {
              const bpId = offer.offeredItemId.replace('blueprint_', '');
              handleLearnBlueprint(bpId);
            }

            const existIdx = next.findIndex((i) => i.id === offer.offeredItemId);
            if (existIdx >= 0) {
              next[existIdx] = {
                ...next[existIdx],
                quantity: next[existIdx].quantity + offer.offeredQuantity,
              };
            } else {
              next.push({
                id: offer.offeredItemId,
                name: offer.offeredItemName,
                category: isBp ? 'blueprint' : 'material',
                rarity: isBp ? 'perfect' : 'common',
                quantity: offer.offeredQuantity,
                description: 'Vật phẩm nhận được từ trao đổi trực tiếp trên Kênh Thế Giới.',
                icon: isBp ? '📜' : '📦',
              });
            }
            return next;
          });

          // Mark trade offer as claimed
          setChatHistory((msgs) =>
            msgs.map((m) =>
              m.id === messageId && m.tradeOffer
                ? { ...m, tradeOffer: { ...m.tradeOffer, isClaimed: true } }
                : m
            )
          );

          setLootModalData({
            title: 'TRAO ĐỔI THÀNH CÔNG',
            items: [{ name: offer.offeredItemName, quantity: offer.offeredQuantity }],
          });
        }}
        onBuyMarketItem={(listingId) => {
          const l = marketListings.find((m) => m.id === listingId);
          if (!l || l.isSold) return;

          const reqItem = inventory.find(
            (i) =>
              i.name.toLowerCase().includes(l.requestedItemId.toLowerCase()) ||
              i.id.includes(l.requestedItemId)
          );
          if (!reqItem || reqItem.quantity < l.requestedQuantity) {
            alert(`Bạn không có đủ ${l.requestedQuantity}x ${l.requestedItemId} để mua!`);
            return;
          }

          soundEngine.playCritFanfare();
          // Deduct requested & add offered
          setInventory((inv) => {
            let next = inv
              .map((i) => {
                if (i.id === reqItem.id) {
                  return { ...i, quantity: i.quantity - l.requestedQuantity };
                }
                return i;
              })
              .filter((i) => i.quantity > 0);

            const isBp = l.offeredItemId.startsWith('blueprint_') || l.offeredItemId.startsWith('bp_');
            if (isBp) {
              const bpId = l.offeredItemId.replace('blueprint_', '');
              handleLearnBlueprint(bpId);
            }

            const existIdx = next.findIndex(
              (i) => i.name === l.offeredItemId || i.id === l.offeredItemId
            );
            if (existIdx >= 0) {
              next[existIdx] = {
                ...next[existIdx],
                quantity: next[existIdx].quantity + l.offeredQuantity,
              };
            } else {
              next.push({
                id: `mkt_${Date.now()}`,
                name: l.offeredItemId,
                category: isBp ? 'blueprint' : 'material',
                rarity: l.offeredItemRarity || 'common',
                quantity: l.offeredQuantity,
                description: 'Vật phẩm trao đổi từ Chợ Thế Giới.',
                icon: isBp ? '📜' : '📦',
              });
            }
            return next;
          });

          setMarketListings((mks) =>
            mks.map((m) => (m.id === listingId ? { ...m, isSold: true } : m))
          );
        }}
        onCreateMarketListing={(offeredItemId, offeredQty, reqItemId, reqQty) => {
          soundEngine.playClick();
          const offeredItem = inventory.find((i) => i.id === offeredItemId);
          if (!offeredItem) return;

          // Deduct offered items from inventory
          setInventory((inv) =>
            inv
              .map((i) => (i.id === offeredItemId ? { ...i, quantity: i.quantity - offeredQty } : i))
              .filter((i) => i.quantity > 0)
          );

          const newListingId = `mk_${Date.now()}`;
          setMarketListings((prev) => [
            {
              id: newListingId,
              seller: 'Tuyết Mộc (Tôi)',
              offeredItemId: offeredItem.name,
              offeredQuantity: offeredQty,
              offeredItemRarity: offeredItem.rarity,
              requestedItemId: reqItemId,
              requestedQuantity: reqQty,
              isSold: false,
              isPlayerListing: true,
            },
            ...prev,
          ]);

          // Simulate an NPC buyer buying player's listing after 12 seconds
          setTimeout(() => {
            setMarketListings((mks) =>
              mks.map((m) => (m.id === newListingId ? { ...m, isSold: true } : m))
            );
            // Give player requested items
            setInventory((inv) => {
              const idx = inv.findIndex(
                (i) => i.id === reqItemId || i.name.toLowerCase() === reqItemId.toLowerCase()
              );
              if (idx >= 0) {
                return inv.map((i, idx2) =>
                  idx2 === idx ? { ...i, quantity: i.quantity + reqQty } : i
                );
              }
              return [
                ...inv,
                {
                  id: reqItemId,
                  name: reqItemId,
                  category: 'material',
                  rarity: 'common',
                  quantity: reqQty,
                  description: 'Nhận từ đơn bán hàng trên Chợ Giao Dịch.',
                  icon: '💰',
                },
              ];
            });
            soundEngine.playCritFanfare();
            setChatHistory((prev) => [
              ...prev,
              {
                id: `msg_sold_${Date.now()}`,
                sender: 'HỆ THỐNG GIAO DỊCH',
                avatar: '💰',
                isNpc: false,
                isPlayer: false,
                isSystem: true,
                content: `[GIAO DỊCH THÀNH CÔNG] Vật phẩm "${offeredItem.name}" của bạn đã được bán với giá ${reqQty}x ${reqItemId}!`,
                timestamp: `${Math.floor((gameTimeMinutes % 1440) / 60)
                  .toString()
                  .padStart(2, '0')}:${(gameTimeMinutes % 60).toString().padStart(2, '0')}`,
                channel: 'system',
              },
            ]);
          }, 12000);
        }}
      />

      {/* MODAL 5: NHIỆM VỤ & THÀNH TỰU */}
      <QuestAchievementModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        quests={quests}
        achievements={achievements}
        onClaimQuestReward={(qId) => {
          const q = quests.find((item) => item.id === qId);
          if (!q || !q.completed) return;
          soundEngine.playCritFanfare();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

          setQuests((qs) => qs.map((item) => (item.id === qId ? { ...item, claimed: true } : item)));

          const rewardBadges = q.rewardBadges || q.rewards.badges || 0;
          setPlayerStats((p) => ({
            ...p,
            courageBadges: p.courageBadges + rewardBadges,
          }));

          // Add items to inventory & unlock blueprints if reward is a blueprint
          setInventory((inv) => {
            const next = [...inv];
            const rewardItems = q.rewards.items || [];
            for (const r of rewardItems) {
              if (r.itemId.startsWith('blueprint_') || r.itemId.startsWith('bp_')) {
                const bpId = r.itemId.replace('blueprint_', '');
                handleLearnBlueprint(bpId);
              }
              const idx = next.findIndex((i) => i.id === r.itemId);
              if (idx >= 0) {
                next[idx] = { ...next[idx], quantity: next[idx].quantity + r.quantity };
              } else {
                next.push({
                  id: r.itemId,
                  name: r.itemId,
                  category: r.itemId.startsWith('blueprint_') ? 'blueprint' : 'material',
                  rarity: 'perfect',
                  quantity: r.quantity,
                  description: 'Phần thưởng từ nhiệm vụ cốt truyện.',
                  icon: r.itemId.startsWith('blueprint_') ? '📜' : '🎁',
                });
              }
            }
            return next;
          });
        }}
        onClaimAchievementReward={(aId) => {
          const ach = achievements.find((a) => a.id === aId);
          if (!ach || !ach.unlocked || ach.claimed) return;
          soundEngine.playCritFanfare();
          setAchievements((achs) => achs.map((a) => (a.id === aId ? { ...a, claimed: true } : a)));
          setPlayerStats((p) => ({ ...p, courageBadges: p.courageBadges + ach.rewardBadges }));
        }}
      />

      {/* MODAL 6: TRẠM TIẾP TẾ TRÊN ĐƯỜNG */}
      <SupplyStationModal
        isOpen={!!activeStation}
        onClose={() => setActiveStation(null)}
        station={activeStation}
        courageBadges={playerStats.courageBadges}
        onBuySupply={(itemId, qty, cost) => {
          soundEngine.playClick();
          setPlayerStats((p) => ({ ...p, courageBadges: p.courageBadges - cost }));
          setInventory((inv) => {
            const idx = inv.findIndex((i) => i.id === itemId);
            if (idx >= 0) {
              return inv.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + qty } : i));
            }
            return [
              ...inv,
              {
                id: itemId,
                name: itemId,
                category: 'consumable',
                rarity: 'common',
                quantity: qty,
                description: 'Vật phẩm mua tại trạm tiếp tế cao tốc.',
                icon: '🛒',
              },
            ];
          });
        }}
      />

      {/* MODAL 7: SAVE / LOAD & C++ SDL2 ARCHITECTURE */}
      <SaveLoadModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        currentSaveData={{
          version: '1.0.0',
          timestamp: Date.now(),
          saveSlot: 1,
          gameDifficulty,
          playerStats,
          vehicleStats,
          petStats,
          currentStage: currentStageId,
          gameTimeMinutes,
          currentDistance: vehicleStats.mileage,
          inventory,
          blueprints,
          quests,
          achievements,
          chatHistory,
          marketListings,
        }}
        onSaveToSlot={(slot) => saveCurrentGame(slot)}
        onLoadFromSlot={(slot) => {
          const raw = localStorage.getItem(`${SAVE_KEY}_slot_${slot}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            setPlayerStats(parsed.playerStats);
            setVehicleStats(parsed.vehicleStats);
            setInventory(parsed.inventory);
            if (parsed.gameDifficulty) {
              setGameDifficulty(parsed.gameDifficulty);
              engine.difficulty = parsed.gameDifficulty;
            }
          }
        }}
        onImportSaveFile={(data) => {
          setPlayerStats(data.playerStats);
          setVehicleStats(data.vehicleStats);
          setInventory(data.inventory);
          if (data.gameDifficulty) {
            setGameDifficulty(data.gameDifficulty);
            engine.difficulty = data.gameDifficulty;
          }
        }}
        onResetGame={() => {
          localStorage.removeItem(SAVE_KEY);
          window.location.reload();
        }}
      />

      {/* MODAL 8: CÂY KỸ NĂNG SINH TỒN (SURVIVAL SKILLS TREE) */}
      <SurvivalSkillsModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        playerStats={playerStats}
        onUpgradeSkill={(skillId, cost) => {
          handleUnlockSkill(skillId);
          setPlayerStats((p) => ({ ...p, courageBadges: Math.max(0, p.courageBadges - cost) }));
        }}
        onResetSkills={() => {
          setPlayerStats((p) => ({ ...p, unlockedSkills: {} }));
        }}
      />

      {/* MODAL 9: BIẾN CỐ XA LỘ (RANDOM HIGHWAY ENCOUNTER) */}
      <EncounterModal
        isOpen={!!activeEncounter}
        encounter={activeEncounter}
        inventory={inventory}
        playerStats={playerStats}
        vehicleStats={vehicleStats}
        onResolveEncounter={handleResolveEncounter}
        onClose={() => setActiveEncounter(null)}
      />

      {/* MODAL 10: SỔ TAY HƯỚNG DẪN TÂN THỦ & PHÍM TẮT */}
      <TutorialOverlayModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onOpenCrafting={() => {
          setIsTutorialOpen(false);
          setIsCraftingOpen(true);
        }}
        onOpenVehicle={() => {
          setIsTutorialOpen(false);
          setIsVehicleOpen(true);
        }}
      />

      {/* MODAL 11: TRỢ LÝ CỐ VẤN SINH TỒN GEMINI AI */}
      <GeminiCompanionModal
        isOpen={isGeminiAIOpen}
        onClose={() => setIsGeminiAIOpen(false)}
        gameStats={{
          distance: vehicleStats.mileage,
          hp: playerStats.hp,
          fuel: vehicleStats.currentFuel,
          temp: playerStats.bodyTemp,
          stageName: currentStage.name,
          courageBadges: playerStats.courageBadges,
          talentCount: playerStats.talentCount,
        }}
      />

      {/* MODAL 12: ĐỘT PHÁ CẢNH GIỚI, TRỒNG TRỌT, TIẾN HÓA XE & PET */}
      <GrowthEvolutionModal
        isOpen={isGrowthOpen}
        onClose={() => setIsGrowthOpen(false)}
        playerStats={playerStats}
        vehicleStats={vehicleStats}
        petStats={petStats}
        inventory={inventory}
        currentStageId={currentStageId}
        currentDistance={vehicleStats.mileage}
        farmPlots={farmPlots}
        onUpdatePlayerStats={(updater) => setPlayerStats(updater)}
        onUpdateVehicleStats={(updater) => setVehicleStats(updater)}
        onUpdatePetStats={(updater) => setPetStats(updater)}
        onUpdateFarmPlots={(updater) => setFarmPlots(updater)}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />

      {/* MODAL 13: CÀI ĐẶT PHÍM TẮT (KEYBINDINGS REBINDING) */}
      <KeybindingsSettingsModal
        isOpen={isKeybindingsOpen}
        onClose={() => setIsKeybindingsOpen(false)}
        keybindings={keybindings}
        onSaveKeybindings={(newBindings) => {
          setKeybindings(newBindings);
          localStorage.setItem('highway_survival_keybindings', JSON.stringify(newBindings));
        }}
      />

      {/* REWARD / LOOT POPUP DIALOG */}
      {lootModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200 font-mono">
          <div className="bg-[#0e0e14] border-2 border-[#ffcc00] rounded-2xl p-5 max-w-md w-full shadow-[0_0_50px_rgba(255,204,0,0.25)] text-center space-y-4">
            <div className="flex items-center justify-center gap-2.5">
              <span className="text-3xl animate-bounce">🎁</span>
              <div className="text-left">
                <h3 className="text-sm font-black text-[#ffcc00] uppercase tracking-wider">{lootModalData.title}</h3>
                <p className="text-[10px] text-gray-400">Đã tự động cất vào Nhẫn Trữ Vật • Sắp xếp theo độ hiếm</p>
              </div>
            </div>

            <div className="p-3 bg-[#14141c] rounded-xl border border-[#2d2d3d] space-y-2 max-h-64 overflow-y-auto">
              <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px] text-left mb-1 flex items-center justify-between">
                <span>VẬT PHẨM NHẬN ĐƯỢC:</span>
                <span className="text-[#00f2ff]">{lootModalData.items.length} món</span>
              </div>
              
              {[...lootModalData.items]
                .sort((a, b) => {
                  const weightA = RARITY_SORT_WEIGHT[a.rarity || 'common'] || 1;
                  const weightB = RARITY_SORT_WEIGHT[b.rarity || 'common'] || 1;
                  return weightB - weightA; // Highest rarity first (Gold > Epic > Rare > Common)
                })
                .map((item, idx) => {
                  const rarity = item.rarity || 'common';
                  let borderClass = 'border-l-4 border-l-gray-400 bg-[#161622] hover:bg-[#1d1d2b] border-t border-r border-b border-[#2d2d3d]';
                  let badgeClass = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
                  let badgeText = 'Common';

                  if (rarity === 'brilliant') {
                    borderClass = 'border-l-4 border-l-amber-400 bg-[#1d170a] hover:bg-[#27200f] border-t border-r border-b border-[#4d3a12]';
                    badgeClass = 'bg-amber-400/20 text-amber-300 border-amber-400/40';
                    badgeText = 'Gold';
                  } else if (rarity === 'epic' || rarity === 'perfect') {
                    borderClass = 'border-l-4 border-l-purple-400 bg-[#171126] hover:bg-[#211836] border-t border-r border-b border-[#3b2857]';
                    badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-400/40';
                    badgeText = 'Epic';
                  } else if (rarity === 'superior' || rarity === 'good') {
                    borderClass = 'border-l-4 border-l-blue-400 bg-[#0d1829] hover:bg-[#13233b] border-t border-r border-b border-[#1f344f]';
                    badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-400/40';
                    badgeText = 'Rare';
                  }

                  const displayIcon =
                    item.icon ||
                    (item.name.toLowerCase().includes('xăng')
                      ? '⛽'
                      : item.name.toLowerCase().includes('nước')
                      ? '💧'
                      : item.name.toLowerCase().includes('thịt') || item.name.toLowerCase().includes('bánh')
                      ? '🥩'
                      : item.name.toLowerCase().includes('kim loại') || item.name.toLowerCase().includes('sắt')
                      ? '🔩'
                      : item.name.toLowerCase().includes('bản thiết kế') || item.name.toLowerCase().includes('thiết kế')
                      ? '📜'
                      : '📦');

                  return (
                    <div
                      key={item.id || idx}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${borderClass}`}
                    >
                      <div className="flex items-center gap-2.5 text-left min-w-0 flex-1 pr-2">
                        <span className="text-base shrink-0">{displayIcon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-100 truncate">{item.name}</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0 ${badgeClass}`}>
                              {badgeText}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 text-xs">
                          +{item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDiscardLootItem(item);
                          }}
                          className="px-2 py-1 bg-red-950/50 hover:bg-red-900/80 active:bg-red-800 text-red-400 hover:text-red-100 rounded border border-red-500/30 text-[10px] font-bold flex items-center gap-1 transition active:scale-95 group/btn"
                          title="Vứt bỏ vật phẩm này ngay lập tức (xóa khỏi túi đồ)"
                        >
                          <Trash2 className="w-3 h-3 group-hover/btn:scale-110 text-red-400 group-hover/btn:text-white transition-transform" />
                          <span>Vứt</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setLootModalData(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#ffcc00] to-[#f59e0b] hover:from-[#ffe066] hover:to-[#fbbf24] text-black font-black rounded-xl text-xs transition uppercase tracking-wider shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>THU NHẬN TOÀN BỘ [ESC]</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR & MENU */}
      <MobileBottomNav
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenCrafting={() => setIsCraftingOpen(true)}
        onOpenVehicle={() => setIsVehicleOpen(true)}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenQuests={() => setIsQuestsOpen(true)}
        onOpenGrowth={() => setIsGrowthOpen(true)}
        onOpenGeminiAI={() => setIsGeminiAIOpen(true)}
        onOpenSave={() => setIsSaveOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenKeybindings={() => setIsKeybindingsOpen(true)}
        isMuted={isMuted}
        isBgmPlaying={isBgmPlaying}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          soundEngine.setMuted(next);
        }}
        onToggleBgm={() => {
          const next = !isBgmPlaying;
          setIsBgmPlaying(next);
          soundEngine.toggleBgm(next);
        }}
        courageBadges={playerStats.courageBadges}
        inventoryCount={inventory.length}
      />
    </div>
  );
}
