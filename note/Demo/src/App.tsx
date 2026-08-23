import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/engine';
import {
  INITIAL_ITEMS,
  INITIAL_BLUEPRINTS,
  INITIAL_QUESTS,
  INITIAL_ACHIEVEMENTS,
  SURVIVAL_STAGES,
  RARITY_COLORS,
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
} from './types';
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
import { SURVIVAL_SKILL_NODES } from './game/skills';

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
    rarity: 'brilliant',
    hunger: 90,
    hp: 120,
    maxHp: 120,
    attackPower: 35,
    alertness: 300,
  });

  // Game Stage, Difficulty & Clock
  const [currentStageId, setCurrentStageId] = useState<SurvivalStageId>('stage1_wasteland');
  const [gameDifficulty, setGameDifficulty] = useState<GameDifficulty>('normal');
  const [gameTimeMinutes, setGameTimeMinutes] = useState<number>(480); // Starts at 8:00 AM (480 mins)
  const [timePhase, setTimePhase] = useState<TimeOfDayPhase>('day');
  const [ambientTemp, setAmbientTemp] = useState<number>(36);
  const [isMuted, setIsMuted] = useState<boolean>(false);

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
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [activeStation, setActiveStation] = useState<SupplyStationEntity | null>(null);
  const [activeEncounter, setActiveEncounter] = useState<RandomEncounter | null>(null);

  // Active Loot Dialog Modal
  const [lootModalData, setLootModalData] = useState<{ title: string; items: { name: string; quantity: number }[] } | null>(null);

  const currentStage = SURVIVAL_STAGES.find((s) => s.id === currentStageId) || SURVIVAL_STAGES[0];

  // Equipped Weapon helper
  const equippedWeapon = inventory.find((i) => i.id === playerStats.equippedWeaponId);

  // Sync engine skills & stage
  useEffect(() => {
    engine.skills = playerStats.unlockedSkills || {};
    engine.currentStageId = currentStageId;
  }, [engine, playerStats.unlockedSkills, currentStageId]);

  // Sync engine events
  useEffect(() => {
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
    engine.generateWorldSegment(Math.max(engine.carX, engine.playerX), Math.max(engine.carX, engine.playerX) + 60000);
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

      // Driving speed & fuel consumption update
      if (engine.mode === 'driving') {
        setVehicleStats((v) => {
          const speed = engine.keys['KeyW'] || engine.keys['ArrowUp'] ? v.maxSpeed : 0;
          const distKm = (speed / 3600) * 1;
          const fuelUsed = (distKm * v.fuelEfficiency) / 100;
          const remainingFuel = Math.max(0, v.currentFuel - fuelUsed);

          // Update engine position
          if (remainingFuel > 0 && speed > 0) {
            engine.carX += speed * 0.4;
          }

          return {
            ...v,
            currentSpeed: remainingFuel > 0 ? speed : 0,
            mileage: v.mileage + distKm,
            currentFuel: remainingFuel,
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

    const lootedSummary: { name: string; quantity: number }[] = [];

    // Add items to inventory & unlock blueprints
    setInventory((inv) => {
      const nextInv = [...inv];
      for (const item of chest.items) {
        lootedSummary.push({ name: item.itemId, quantity: item.quantity });

        // If looted item is a blueprint (e.g. blueprint_bp_tang_dao or bp_tang_dao)
        if (item.itemId.startsWith('blueprint_') || item.itemId.startsWith('bp_')) {
          const bpId = item.itemId.replace('blueprint_', '');
          handleLearnBlueprint(bpId);
        }

        const idx = nextInv.findIndex((i) => i.id === item.itemId);
        if (idx >= 0) {
          nextInv[idx] = { ...nextInv[idx], quantity: nextInv[idx].quantity + item.quantity };
        } else {
          const isBp = item.itemId.startsWith('blueprint_') || item.itemId.startsWith('bp_');
          nextInv.push({
            id: item.itemId,
            name: isBp ? `Bản Thiết Kế: ${item.itemId.replace('blueprint_', '').replace('bp_', '')}` : item.itemId,
            category: isBp ? 'blueprint' : 'material',
            rarity: chest.rarity,
            quantity: item.quantity,
            description: isBp
              ? 'Bản thiết kế chế tạo mở khóa công thức tại Bàn Rèn Thần Kỳ.'
              : 'Vật phẩm thu được từ rương tài nguyên.',
            icon: isBp ? '📜' : '📦',
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
    const lootedSummary: { name: string; quantity: number }[] = [];

    setInventory((inv) => {
      const nextInv = [...inv];
      for (const drop of beast.drops) {
        lootedSummary.push({ name: drop.itemId, quantity: drop.quantity });
        const idx = nextInv.findIndex((i) => i.id === drop.itemId);
        if (idx >= 0) {
          nextInv[idx] = { ...nextInv[idx], quantity: nextInv[idx].quantity + drop.quantity };
        } else {
          nextInv.push({
            id: drop.itemId,
            name: drop.itemId,
            category: 'consumable',
            rarity: beast.rarity,
            quantity: drop.quantity,
            description: `Thu hoạch từ xác ${beast.name}`,
            icon: '🥩',
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
      setInventory((inv) => {
        const next = [...inv];
        for (const rew of choice.outcome.rewardItems!) {
          const isBp = rew.itemId.startsWith('blueprint_') || rew.itemId.startsWith('bp_');
          if (isBp) {
            handleLearnBlueprint(rew.itemId.replace('blueprint_', ''));
          }
          const idx = next.findIndex((i) => i.id === rew.itemId || i.name === rew.name);
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + rew.quantity };
          } else {
            next.push({
              id: rew.itemId,
              name: rew.name,
              category: isBp ? 'blueprint' : 'material',
              rarity: rew.rarity || 'brilliant',
              quantity: rew.quantity,
              description: 'Chiến lợi phẩm từ biến cố xa lộ.',
              icon: rew.icon || '📦',
            });
          }
        }
        return next;
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
  // GLOBAL KEYBOARD SHORTCUTS
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

      if (e.code === 'KeyK') {
        e.preventDefault();
        setIsSkillsOpen((prev) => !prev);
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setIsCraftingOpen((prev) => !prev);
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        setIsVehicleOpen((prev) => !prev);
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        setIsInventoryOpen((prev) => !prev);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsChatOpen((prev) => !prev);
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        setIsQuestsOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        setIsSkillsOpen(false);
        setIsCraftingOpen(false);
        setIsVehicleOpen(false);
        setIsInventoryOpen(false);
        setIsChatOpen(false);
        setIsQuestsOpen(false);
        setIsSaveOpen(false);
        setActiveStation(null);
        setLootModalData(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          soundEngine.setMuted(next);
        }}
        onChangeDifficulty={handleChangeDifficulty}
        onRepairVehicle={handleRepairVehicle}
        onOpenCrafting={() => setIsCraftingOpen(true)}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenVehicle={() => setIsVehicleOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenQuests={() => setIsQuestsOpen(true)}
        onOpenSave={() => setIsSaveOpen(true)}
      />

      {/* 2. 2D PIXEL HIGHWAY CANVAS GAME WORLD */}
      <main className="flex-1 relative overflow-hidden flex">
        <GameCanvas
          engine={engine}
          equippedWeapon={equippedWeapon}
          hasBaitItem={inventory.some((i) => i.id.includes('bait') || i.id.includes('poison'))}
          vehicleSpeed={vehicleStats.currentSpeed}
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
        player={playerStats}
        onCraft={handleCraftItem}
      />

      {/* MODAL 2: XE NHÀ RV & NÂNG CẤP */}
      <VehicleCustomizerModal
        isOpen={isVehicleOpen}
        onClose={() => setIsVehicleOpen(false)}
        vehicle={vehicleStats}
        player={playerStats}
        inventory={inventory}
        onUpgradeCore={handleUpgradeVehicleCore}
        onToggleAC={handleToggleAC}
        onMakeIce={handleMakeIce}
        onMakeIceCream={handleMakeIceCream}
      />

      {/* MODAL 3: NHẪN TRỮ VẬT (TÚI ĐỒ) */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        equippedWeaponId={playerStats.equippedWeaponId}
        onUseItem={handleUseItem}
      />

      {/* MODAL 4: KÊNH THẾ GIỚI & GIAO DỊCH CHỢ */}
      <WorldChatAndTradeModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatHistory={chatHistory}
        marketListings={marketListings}
        inventory={inventory}
        onSendMessage={(msg, ch) => {
          setChatHistory((prev) => [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              sender: 'Tuyết Mộc',
              avatar: '🚗',
              isNpc: false,
              isPlayer: true,
              isSystem: false,
              content: msg,
              timestamp: `${Math.floor((gameTimeMinutes % 1440) / 60)
                .toString()
                .padStart(2, '0')}:${(gameTimeMinutes % 60).toString().padStart(2, '0')}`,
              channel: ch,
            },
          ]);
        }}
        onDirectChatTrade={(messageId, offer) => {
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
        onBuyListing={(listingId) => {
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
        onCreateListing={(offeredItem, reqItem, reqQty) => {
          soundEngine.playClick();
          // Deduct 1 offered item from inventory
          setInventory((inv) =>
            inv
              .map((i) => (i.id === offeredItem.id ? { ...i, quantity: i.quantity - 1 } : i))
              .filter((i) => i.quantity > 0)
          );

          const newListingId = `mk_${Date.now()}`;
          setMarketListings((prev) => [
            {
              id: newListingId,
              seller: 'Tuyết Mộc (Tôi)',
              offeredItemId: offeredItem.name,
              offeredQuantity: 1,
              offeredItemRarity: offeredItem.rarity,
              requestedItemId: reqItem,
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
                (i) => i.id === reqItem || i.name.toLowerCase() === reqItem.toLowerCase()
              );
              if (idx >= 0) {
                return inv.map((i, idx2) =>
                  idx2 === idx ? { ...i, quantity: i.quantity + reqQty } : i
                );
              }
              return [
                ...inv,
                {
                  id: reqItem,
                  name: reqItem,
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
                content: `[GIAO DỊCH THÀNH CÔNG] Vật phẩm "${offeredItem.name}" của bạn đã được bán với giá ${reqQty}x ${reqItem}!`,
                timestamp: `${Math.floor((gameTimeMinutes % 1440) / 60)
                  .toString()
                  .padStart(2, '0')}:${(gameTimeMinutes % 60).toString().padStart(2, '0')}`,
                channel: 'market',
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

          setPlayerStats((p) => ({
            ...p,
            courageBadges: p.courageBadges + q.rewardBadges,
          }));

          // Add items to inventory & unlock blueprints if reward is a blueprint
          setInventory((inv) => {
            const next = [...inv];
            for (const r of q.rewards) {
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
        playerBadges={playerStats.courageBadges}
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
        playerBadges={playerStats.courageBadges}
        unlockedSkills={playerStats.unlockedSkills || {}}
        onUnlockSkill={handleUnlockSkill}
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

      {/* REWARD / LOOT POPUP DIALOG */}
      {lootModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200 font-mono">
          <div className="bg-[#0c0c0e] border-2 border-[#ffcc00] rounded p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="text-4xl animate-bounce">🎁</div>
            <h3 className="text-base font-bold text-[#ffcc00] uppercase tracking-[0.15em]">{lootModalData.title}</h3>

            <div className="p-3 bg-[#131315] rounded border border-[#2d2d30] space-y-2 text-xs">
              <div className="text-gray-400 font-bold uppercase tracking-wider mb-2 text-[10px]">VẬT PHẨM THU ĐƯỢC:</div>
              {lootModalData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-gray-200 border-b border-[#222225] pb-1 last:border-b-0"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="font-bold text-[#ffcc00]">+{item.quantity}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setLootModalData(null);
              }}
              className="w-full py-2.5 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-bold rounded text-xs transition uppercase tracking-wider shadow-lg"
            >
              THU NHẬN TOÀN BỘ [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
