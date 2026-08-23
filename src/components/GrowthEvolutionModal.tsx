import React, { useState, useEffect } from 'react';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  PlayerStats,
  VehicleStats,
  PetStats,
  InventoryItem,
  SurvivalStageId,
  FarmPlot,
} from '../types';
import {
  SURVIVAL_STAGES,
  SURVIVOR_REALMS,
  FARM_CROPS_CONFIG,
  VEHICLE_TIERS_CONFIG,
  PET_EVOLUTION_CONFIG,
} from '../game/constants';
import {
  Sparkles,
  Award,
  Sprout,
  Truck,
  Heart,
  Zap,
  MapPin,
  X,
  Droplet,
  ChevronRight,
  Shield,
  Crosshair,
  Flame,
  CheckCircle2,
  Lock,
  Compass,
  ArrowUpCircle,
  Radio,
  Gauge,
  Bot,
} from 'lucide-react';

interface GrowthEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats;
  onUpdatePlayerStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  vehicleStats: VehicleStats;
  onUpdateVehicleStats: (updater: (prev: VehicleStats) => VehicleStats) => void;
  petStats: PetStats;
  onUpdatePetStats: (updater: (prev: PetStats) => PetStats) => void;
  inventory: InventoryItem[];
  onAddItem: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string, qty: number) => boolean;
  currentDistance: number;
  currentStageId: SurvivalStageId;
  farmPlots: FarmPlot[];
  onUpdateFarmPlots: (plots: FarmPlot[]) => void;
}

export const GrowthEvolutionModal: React.FC<GrowthEvolutionModalProps> = ({
  isOpen,
  onClose,
  playerStats,
  onUpdatePlayerStats,
  vehicleStats,
  onUpdateVehicleStats,
  petStats,
  onUpdatePetStats,
  inventory,
  onAddItem,
  onRemoveItem,
  currentDistance,
  currentStageId,
  farmPlots,
  onUpdateFarmPlots,
}) => {
  const [activeTab, setActiveTab] = useState<'realm' | 'farm' | 'vehicle' | 'pet' | 'stages'>('realm');
  const [selectedCropToPlant, setSelectedCropToPlant] = useState<string>('crop_desert_wheat');
  const [, setTick] = useState(0);

  // Periodic timer to refresh farm plot timers
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRealmLevel = playerStats.survivorRealmLevel || 1;
  const currentRealm = SURVIVOR_REALMS[currentRealmLevel] || SURVIVOR_REALMS[1];
  const nextRealm = SURVIVOR_REALMS[currentRealmLevel + 1];

  const currentKm = Math.floor(currentDistance);
  const kills = playerStats.killsCount || 0;
  const chests = playerStats.chestsOpenedCount || 0;
  const badges = playerStats.courageBadges;

  // Check Realm Upgrade conditions
  const canUpgradeRealm =
    nextRealm &&
    currentKm >= nextRealm.requiredKm &&
    kills >= nextRealm.requiredKills &&
    chests >= nextRealm.requiredChests &&
    badges >= nextRealm.requiredBadges;

  const handleUpgradeRealm = () => {
    if (!canUpgradeRealm || !nextRealm) return;
    soundEngine.playSuccess();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    onUpdatePlayerStats((prev) => ({
      ...prev,
      survivorRealmLevel: nextRealm.level,
      courageBadges: prev.courageBadges - nextRealm.requiredBadges,
      maxHp: prev.maxHp + nextRealm.hpBonus,
      hp: Math.min(prev.maxHp + nextRealm.hpBonus, prev.hp + nextRealm.hpBonus),
    }));
  };

  // Vehicle Evolution
  const vehicleTierIndex = VEHICLE_TIERS_CONFIG.findIndex((t) => t.tier === vehicleStats.tier);
  const currentVehicleConfig = VEHICLE_TIERS_CONFIG[vehicleTierIndex] || VEHICLE_TIERS_CONFIG[0];
  const nextVehicleConfig = VEHICLE_TIERS_CONFIG[vehicleTierIndex + 1];

  const canUpgradeVehicle =
    nextVehicleConfig &&
    badges >= nextVehicleConfig.requiredBadges &&
    currentKm >= nextVehicleConfig.requiredKm;

  const handleUpgradeVehicle = () => {
    if (!canUpgradeVehicle || !nextVehicleConfig) return;
    soundEngine.playSuccess();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    onUpdatePlayerStats((prev) => ({
      ...prev,
      courageBadges: prev.courageBadges - nextVehicleConfig.requiredBadges,
    }));

    onUpdateVehicleStats((prev) => ({
      ...prev,
      tier: nextVehicleConfig.tier as any,
      name: nextVehicleConfig.name,
      maxSpeed: nextVehicleConfig.maxSpeed,
      maxFuel: nextVehicleConfig.maxFuel,
      currentFuel: Math.min(nextVehicleConfig.maxFuel, prev.currentFuel + 20),
      maxDurability: nextVehicleConfig.maxDurability,
      durability: nextVehicleConfig.maxDurability,
      radarRange: nextVehicleConfig.radarRange,
      autoCruise: true,
      autoLootMagnet: nextVehicleConfig.tier === 'rv_luxury' || nextVehicleConfig.tier === 'nuclear_beast' || nextVehicleConfig.tier === 'celestial_carrier',
      roofTurretLevel: nextVehicleConfig.tier === 'nuclear_beast' || nextVehicleConfig.tier === 'celestial_carrier' ? 'perfect' : prev.roofTurretLevel,
    }));
  };

  // Pet Evolution
  const currentPetStage = petStats.evolutionStage || 1;
  const currentPetConfig = PET_EVOLUTION_CONFIG.find((p) => p.stage === currentPetStage) || PET_EVOLUTION_CONFIG[0];
  const nextPetConfig = PET_EVOLUTION_CONFIG.find((p) => p.stage === currentPetStage + 1);

  const canEvolvePet =
    nextPetConfig &&
    petStats.level >= nextPetConfig.requiredLevel &&
    petStats.exp >= nextPetConfig.requiredExp;

  const handleEvolvePet = () => {
    if (!canEvolvePet || !nextPetConfig) return;
    soundEngine.playSuccess();
    confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });

    onUpdatePetStats((prev) => ({
      ...prev,
      evolutionStage: nextPetConfig.stage,
      evolutionName: nextPetConfig.name,
      name: nextPetConfig.name,
      rarity: nextPetConfig.rarity,
      attackPower: prev.attackPower + nextPetConfig.atkBonus,
      defense: prev.defense + nextPetConfig.defBonus,
      maxHp: prev.maxHp + 100,
      hp: prev.maxHp + 100,
      autoLootRange: nextPetConfig.stage >= 2 ? 25 : 0,
    }));
  };

  // Farm Actions
  const handlePlantSeed = (plotId: number) => {
    const crop = FARM_CROPS_CONFIG[selectedCropToPlant];
    if (!crop) return;

    const hasSeed = inventory.some((i) => i.id === crop.seedItemId && i.quantity > 0);
    if (!hasSeed) {
      soundEngine.playError();
      return;
    }

    const removed = onRemoveItem(crop.seedItemId, 1);
    if (!removed) return;

    soundEngine.playClick();
    const updated = farmPlots.map((plot) => {
      if (plot.id === plotId) {
        return {
          ...plot,
          cropId: crop.id,
          cropName: crop.name,
          cropIcon: crop.icon,
          plantedAt: Date.now(),
          growDurationMs: crop.growDurationSec * 1000,
          waterLevel: 80,
          isReady: false,
          yieldItemId: crop.yieldItemId,
          yieldQuantity: crop.yieldQuantity,
        };
      }
      return plot;
    });
    onUpdateFarmPlots(updated);
  };

  const handleWaterPlot = (plotId: number) => {
    if (vehicleStats.currentWaterTank < 2) {
      soundEngine.playError();
      return;
    }

    soundEngine.playClick();
    onUpdateVehicleStats((prev) => ({
      ...prev,
      currentWaterTank: Math.max(0, prev.currentWaterTank - 2),
    }));

    const updated = farmPlots.map((plot) => {
      if (plot.id === plotId) {
        return {
          ...plot,
          waterLevel: Math.min(100, plot.waterLevel + 50),
        };
      }
      return plot;
    });
    onUpdateFarmPlots(updated);
  };

  const handleHarvestPlot = (plotId: number) => {
    const plot = farmPlots.find((p) => p.id === plotId);
    if (!plot || !plot.yieldItemId) return;

    soundEngine.playSuccess();
    onAddItem(plot.yieldItemId, plot.yieldQuantity);

    const updated = farmPlots.map((p) => {
      if (p.id === plotId) {
        return {
          ...p,
          cropId: null,
          cropName: null,
          cropIcon: null,
          plantedAt: null,
          isReady: false,
          yieldItemId: null,
          yieldQuantity: 0,
        };
      }
      return p;
    });
    onUpdateFarmPlots(updated);
  };

  const handleHarvestAll = () => {
    let harvestedAny = false;
    const updated = farmPlots.map((plot) => {
      const isReady =
        plot.plantedAt &&
        Date.now() - plot.plantedAt >= plot.growDurationMs &&
        plot.yieldItemId;
      if (isReady && plot.yieldItemId) {
        harvestedAny = true;
        onAddItem(plot.yieldItemId, plot.yieldQuantity);
        return {
          ...plot,
          cropId: null,
          cropName: null,
          cropIcon: null,
          plantedAt: null,
          isReady: false,
          yieldItemId: null,
          yieldQuantity: 0,
        };
      }
      return plot;
    });

    if (harvestedAny) {
      soundEngine.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onUpdateFarmPlots(updated);
    } else {
      soundEngine.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none font-mono">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0c10] border-2 border-[#00f2ff]/60 rounded-2xl shadow-[0_0_40px_rgba(0,242,255,0.25)] overflow-hidden text-gray-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#11121a] via-[#16192b] to-[#11121a] border-b border-[#00f2ff]/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.4)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  TRUNG TÂM TRƯỞNG THÀNH & ĐỘT PHÁ
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  BẬC {currentRealmLevel}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Tiến hóa Cảnh giới, Chiến xa RV, Thần thú & Nông trại thủy canh
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#1a1b26] hover:bg-[#25283d] text-gray-400 hover:text-white border border-[#2e324d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Responsive Scrollable) */}
        <div className="flex items-center gap-1.5 p-2 bg-[#090a0e] border-b border-[#1f2338] overflow-x-auto no-scrollbar">
          {[
            { id: 'realm', label: 'Cảnh Giới Sinh Tồn', icon: Award, color: 'text-amber-400' },
            { id: 'farm', label: 'Vườn Thủy Canh RV', icon: Sprout, color: 'text-emerald-400' },
            { id: 'vehicle', label: 'Đột Phá Chiến Xa', icon: Truck, color: 'text-sky-400' },
            { id: 'pet', label: 'Tiến Hóa Thần Thú', icon: Heart, color: 'text-rose-400' },
            { id: 'stages', label: '8 Giai Đoạn Kỷ Nguyên', icon: Compass, color: 'text-purple-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00f2ff]/15 text-white border border-[#00f2ff]/60 shadow-[0_0_12px_rgba(0,242,255,0.3)]'
                    : 'bg-[#12131c] text-gray-400 hover:text-gray-200 border border-[#21253b] hover:bg-[#1a1c29]'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto max-h-[calc(92vh-130px)] space-y-4">
          
          {/* ================= TAB 1: SURVIVOR REALM ================= */}
          {activeTab === 'realm' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Current Realm Hero Card */}
              <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#181926] via-[#141522] to-[#0d0e17] border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    {currentRealm.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                      CẢNH GIỚI HIỆN TẠI (CẤP {currentRealm.level}/7)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{currentRealm.name}</h3>
                    <p className="text-xs text-gray-300 italic">{currentRealm.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        +{currentRealm.hpBonus} HP Max
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        +{currentRealm.critRateBonus}% Tỉ lệ Bạo Kích
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                        +{currentRealm.speedBonus}% Tốc độ
                      </span>
                    </div>
                  </div>
                </div>

                {nextRealm ? (
                  <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                    <button
                      onClick={handleUpgradeRealm}
                      disabled={!canUpgradeRealm}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                        canUpgradeRealm
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/40 cursor-pointer animate-pulse'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                      <span>ĐỘT PHÁ CẢNH GIỚI {nextRealm.level}</span>
                    </button>
                    {!canUpgradeRealm && (
                      <span className="text-[10px] text-amber-400/80">Chưa đủ điều kiện hành trình</span>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs uppercase">
                    👑 ĐẠT CẢNH GIỚI TỐI THƯỢNG
                  </div>
                )}
              </div>

              {/* Progress to next realm */}
              {nextRealm && (
                <div className="p-4 rounded-xl bg-[#12131d] border border-[#25283d] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                    <span>ĐIỀU KIỆN ĐỘT PHÁ CẢNH GIỚI TIẾP THEO: {nextRealm.name}</span>
                    <span className="text-amber-400">{canUpgradeRealm ? 'SẴN SÀNG' : 'ĐANG THỰC HIỆN'}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* KM Requirement */}
                    <div className="p-2.5 rounded-lg bg-[#181926] border border-[#2b2f48]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Hành trình KM</span>
                        <span className={currentKm >= nextRealm.requiredKm ? 'text-emerald-400' : 'text-amber-400'}>
                          {currentKm}/{nextRealm.requiredKm} km
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-400 h-full transition-all"
                          style={{ width: `${Math.min(100, (currentKm / nextRealm.requiredKm) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Kills Requirement */}
                    <div className="p-2.5 rounded-lg bg-[#181926] border border-[#2b2f48]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Diệt Dã Thú</span>
                        <span className={kills >= nextRealm.requiredKills ? 'text-emerald-400' : 'text-amber-400'}>
                          {kills}/{nextRealm.requiredKills}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full transition-all"
                          style={{ width: `${Math.min(100, (kills / nextRealm.requiredKills) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Chests Requirement */}
                    <div className="p-2.5 rounded-lg bg-[#181926] border border-[#2b2f48]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Cạy Mở Rương</span>
                        <span className={chests >= nextRealm.requiredChests ? 'text-emerald-400' : 'text-amber-400'}>
                          {chests}/{nextRealm.requiredChests}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full transition-all"
                          style={{ width: `${Math.min(100, (chests / nextRealm.requiredChests) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Badges Requirement */}
                    <div className="p-2.5 rounded-lg bg-[#181926] border border-[#2b2f48]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-400">Huy Hiệu Dũng Khí</span>
                        <span className={badges >= nextRealm.requiredBadges ? 'text-emerald-400' : 'text-amber-400'}>
                          {badges}/{nextRealm.requiredBadges}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full transition-all"
                          style={{ width: `${Math.min(100, (badges / nextRealm.requiredBadges) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All 7 Realms List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  7 BẬC CẢNH GIỚI TIẾN HÓA XA LỘ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {Object.values(SURVIVOR_REALMS).map((realm) => {
                    const isUnlocked = currentRealmLevel >= realm.level;
                    const isCurrent = currentRealmLevel === realm.level;
                    return (
                      <div
                        key={realm.level}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : isUnlocked
                            ? 'bg-[#13141f] border-emerald-500/40 text-gray-300'
                            : 'bg-[#0e0f17]/70 border-[#202235] opacity-60'
                        }`}
                      >
                        <div className="text-2xl p-2 rounded-lg bg-black/40 border border-zinc-700/50">
                          {realm.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className={`font-bold text-xs ${isCurrent ? 'text-amber-300' : isUnlocked ? 'text-emerald-300' : 'text-gray-400'}`}>
                              {realm.level}. {realm.name}
                            </h5>
                            {isUnlocked ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đã Mở
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3" /> KM {realm.requiredKm}+
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{realm.title}</p>
                          <ul className="mt-1 space-y-0.5">
                            {realm.passives.map((p, idx) => (
                              <li key={idx} className="text-[10px] text-gray-300 flex items-center gap-1">
                                <span className="text-cyan-400">•</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: HYDROPONIC FARM ================= */}
          {activeTab === 'farm' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Farm Overview Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d2217] via-[#102a1d] to-[#0c1c14] border-2 border-emerald-500/40 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-2xl">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase">KHOANG THỦY CANH NÔNG TRẠI RV</h3>
                    <p className="text-xs text-gray-300">
                      Trồng trọt nông sản cao cấp ngay trong xe bằng nước ngưng tụ sạch
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-sky-400" />
                    <span>Nước xe: {vehicleStats.currentWaterTank.toFixed(1)}L / {vehicleStats.waterTankCapacity}L</span>
                  </div>
                  <button
                    onClick={handleHarvestAll}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition shadow-md shadow-emerald-900/40"
                  >
                    Thu Hoạch Tất Cả
                  </button>
                </div>
              </div>

              {/* Seed Selector */}
              <div className="p-3 rounded-xl bg-[#12131d] border border-[#23273e] space-y-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  CHỌN LOẠI HẠT GIỐNG ĐỂ GIEO:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.values(FARM_CROPS_CONFIG).map((crop) => {
                    const isSelected = selectedCropToPlant === crop.id;
                    const seedItem = inventory.find((i) => i.id === crop.seedItemId);
                    const count = seedItem?.quantity || 0;
                    return (
                      <button
                        key={crop.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedCropToPlant(crop.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-[#171926] border-[#292e47] hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{crop.icon}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${count > 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 text-rose-400'}`}>
                            {count > 0 ? `${count} hạt` : 'Hết hạt'}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <div className="font-bold text-xs text-white truncate">{crop.name}</div>
                          <div className="text-[10px] text-gray-400">⏱️ {crop.growDurationSec}s | 💧 {crop.waterCostLiters}L</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Hydroponic Plots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {farmPlots.map((plot) => {
                  const hasCrop = Boolean(plot.cropId && plot.plantedAt);
                  const elapsedMs = hasCrop ? Date.now() - (plot.plantedAt || 0) : 0;
                  const progressPct = hasCrop ? Math.min(100, (elapsedMs / plot.growDurationMs) * 100) : 0;
                  const isPlotReady = hasCrop && progressPct >= 100;
                  const remainingSec = hasCrop ? Math.max(0, Math.ceil((plot.growDurationMs - elapsedMs) / 1000)) : 0;

                  return (
                    <div
                      key={plot.id}
                      className="p-4 rounded-xl bg-gradient-to-b from-[#151724] to-[#0f1019] border border-[#2b2f48] shadow-lg flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#23263b]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            Ô TRỒNG #{plot.id}
                          </span>
                          <span className="text-xs font-bold text-gray-200">
                            {hasCrop ? plot.cropName : 'Đất Trống'}
                          </span>
                        </div>
                        {hasCrop && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isPlotReady ? 'bg-emerald-500/30 text-emerald-300 animate-pulse' : 'bg-amber-500/20 text-amber-300'}`}>
                            {isPlotReady ? 'SẴN SÀNG THU HOẠCH' : `Đang lớn (${remainingSec}s)`}
                          </span>
                        )}
                      </div>

                      {hasCrop ? (
                        <div className="space-y-2.5 py-1">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl p-2 rounded-xl bg-black/40 border border-emerald-500/40">
                              {plot.cropIcon}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Tiến độ sinh trưởng</span>
                                <span className="font-bold text-emerald-400">{Math.floor(progressPct)}%</span>
                              </div>
                              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-400 h-full transition-all duration-500"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Moisture / Water */}
                          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-black/30 border border-[#23273e]">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Droplet className="w-3.5 h-3.5 text-sky-400" /> Độ ẩm đất:
                            </span>
                            <span className="text-sky-300 font-bold">{plot.waterLevel}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center justify-center text-gray-500">
                          <Sprout className="w-8 h-8 opacity-40 mb-1" />
                          <span className="text-xs">Chưa có cây trồng</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#23263b]">
                        {hasCrop ? (
                          <>
                            <button
                              onClick={() => handleWaterPlot(plot.id)}
                              className="flex-1 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-600/50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <Droplet className="w-3.5 h-3.5" /> Tưới Nước (-2L)
                            </button>
                            {isPlotReady && (
                              <button
                                onClick={() => handleHarvestPlot(plot.id)}
                                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/50 animate-bounce"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Thu Hoạch
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handlePlantSeed(plot.id)}
                            className="w-full py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5"
                          >
                            <Sprout className="w-4 h-4" /> Gieo {FARM_CROPS_CONFIG[selectedCropToPlant]?.name}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: VEHICLE EVOLUTION ================= */}
          {activeTab === 'vehicle' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Current Vehicle Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#11192e] via-[#15203b] to-[#0f1629] border-2 border-sky-500/50 shadow-[0_0_25px_rgba(14,165,233,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    {currentVehicleConfig.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                      CHIẾN XA HIỆN TẠI ({currentVehicleConfig.tier.toUpperCase()})
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{vehicleStats.name}</h3>
                    <p className="text-xs text-gray-300">{currentVehicleConfig.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                        ⚡ {vehicleStats.maxSpeed} km/h Max
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        ⛽ {vehicleStats.maxFuel}L Xăng
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        🛡️ {vehicleStats.maxDurability} Độ Bền
                      </span>
                    </div>
                  </div>
                </div>

                {nextVehicleConfig ? (
                  <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                    <button
                      onClick={handleUpgradeVehicle}
                      disabled={!canUpgradeVehicle}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                        canUpgradeVehicle
                          ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-black shadow-sky-500/40 cursor-pointer animate-pulse'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                      <span>ĐỘT PHÁ LÊN {nextVehicleConfig.name}</span>
                    </button>
                    {!canUpgradeVehicle && (
                      <span className="text-[10px] text-sky-400/80">
                        Cần {nextVehicleConfig.requiredBadges} Huy hiệu & KM {nextVehicleConfig.requiredKm}+
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs uppercase">
                    🛸 CHIẾN XA BẬC VŨ TRỤ
                  </div>
                )}
              </div>

              {/* Vehicle Evolution Tree */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  6 BẬC TIẾN HÓA CHIẾN XA CAO TỐC
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {VEHICLE_TIERS_CONFIG.map((tierCfg, idx) => {
                    const isCurrent = vehicleStats.tier === tierCfg.tier;
                    const isUnlocked = vehicleTierIndex >= idx;
                    return (
                      <div
                        key={tierCfg.tier}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                          isCurrent
                            ? 'bg-sky-500/10 border-sky-500/70 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                            : isUnlocked
                            ? 'bg-[#131522] border-emerald-500/40 text-gray-300'
                            : 'bg-[#0d0e17]/70 border-[#1f2238] opacity-60'
                        }`}
                      >
                        <div className="text-3xl p-2.5 rounded-xl bg-black/40 border border-zinc-700/60">
                          {tierCfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className={`font-bold text-xs ${isCurrent ? 'text-sky-300 font-black' : isUnlocked ? 'text-emerald-300' : 'text-gray-400'}`}>
                              {idx + 1}. {tierCfg.name}
                            </h5>
                            {isUnlocked ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đã Mở
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" /> {tierCfg.requiredBadges} Huy hiệu
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tierCfg.description}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {tierCfg.bonuses.map((b, bIdx) => (
                              <span key={bIdx} className="px-1.5 py-0.5 rounded bg-black/40 border border-zinc-700/50 text-[9px] text-gray-300">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: PET EVOLUTION ================= */}
          {activeTab === 'pet' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Current Pet Hero */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#29121a] via-[#331823] to-[#1f0d14] border-2 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    {currentPetConfig.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
                      THẦN THÚ ĐỒNG HÀNH (BẬC {currentPetConfig.stage}/4)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{petStats.name}</h3>
                    <p className="text-xs text-gray-300">{currentPetConfig.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        ⚔️ Công {petStats.attackPower}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        🛡️ Giáp {petStats.defense}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                        ❤️ {petStats.hp}/{petStats.maxHp} HP
                      </span>
                    </div>
                  </div>
                </div>

                {nextPetConfig ? (
                  <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                    <button
                      onClick={handleEvolvePet}
                      disabled={!canEvolvePet}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                        canEvolvePet
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-rose-500/40 cursor-pointer animate-pulse'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>THỨC TỈNH TIẾN HÓA BẬC {nextPetConfig.stage}</span>
                    </button>
                    {!canEvolvePet && (
                      <span className="text-[10px] text-rose-400/80">
                        Cần Cấp {nextPetConfig.requiredLevel} & {nextPetConfig.requiredExp} EXP (Hiện tại: Cấp {petStats.level}, {petStats.exp} EXP)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-300 font-bold text-xs uppercase">
                    🐺 THẦN KHUYỂN THAO THIẾT TỐI THƯỢNG
                  </div>
                )}
              </div>

              {/* 4 Pet Evolution Stages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PET_EVOLUTION_CONFIG.map((petCfg) => {
                  const isCurrent = (petStats.evolutionStage || 1) === petCfg.stage;
                  const isUnlocked = (petStats.evolutionStage || 1) >= petCfg.stage;
                  return (
                    <div
                      key={petCfg.stage}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                        isCurrent
                          ? 'bg-rose-500/10 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                          : isUnlocked
                          ? 'bg-[#14121a] border-emerald-500/40 text-gray-300'
                          : 'bg-[#0e0c12]/70 border-[#231e2b] opacity-60'
                      }`}
                    >
                      <div className="text-3xl p-2.5 rounded-xl bg-black/40 border border-zinc-700/60">
                        {petCfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-bold text-xs ${isCurrent ? 'text-rose-300 font-black' : isUnlocked ? 'text-emerald-300' : 'text-gray-400'}`}>
                            Bậc {petCfg.stage}: {petCfg.name}
                          </h5>
                          {isUnlocked ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đã Mở
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 font-bold">
                              Cấp {petCfg.requiredLevel}+
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{petCfg.description}</p>
                        <div className="mt-2 space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Tuyệt chiêu thức tỉnh:</span>
                          <div className="flex flex-wrap gap-1">
                            {petCfg.abilities.map((ab, abIdx) => (
                              <span key={abIdx} className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-[9px] text-rose-200">
                                ⚡ {ab}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 5: 8 SURVIVAL STAGES ================= */}
          {activeTab === 'stages' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#170e2b] via-[#231540] to-[#170e2b] border border-purple-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-6 h-6 text-purple-400 animate-spin-slow" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase">BẢN ĐỒ 8 KỶ NGUYÊN SINH TỒN XA LỘ</h3>
                    <p className="text-[11px] text-gray-300">
                      Từ Hoang Mạc Vô Tận đến Thang Máy Không Gian Vũ Trụ (800+ KM)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
                  KM Hiện Tại: {currentKm} km
                </span>
              </div>

              {/* 8 Stages Timeline Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SURVIVAL_STAGES.map((stage, idx) => {
                  const isCurrent = currentStageId === stage.id;
                  const isPassed = currentKm >= stage.minKm;
                  return (
                    <div
                      key={stage.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition ${
                        isCurrent
                          ? 'bg-purple-500/15 border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.3)]'
                          : isPassed
                          ? 'bg-[#13111f] border-emerald-500/40 text-gray-300'
                          : 'bg-[#0d0c14]/70 border-[#201d2e] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                              KM {stage.minKm}+
                            </span>
                            <h4 className={`text-xs font-bold ${isCurrent ? 'text-purple-300 font-black' : isPassed ? 'text-emerald-300' : 'text-gray-400'}`}>
                              {stage.name}
                            </h4>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{stage.description}</p>
                        </div>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400 text-[9px] font-black animate-pulse">
                            VÙNG HIỆN TẠI
                          </span>
                        ) : isPassed ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Vượt
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Khóa
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#221f33] flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">
                          🌡️ {stage.ambientTemp}°C | ⚠️ Nguy hiểm Lv.{stage.dangerLevel}
                        </span>
                        <span className="text-amber-400/90 font-medium">
                          👥 {stage.activeSurvivingPlayers.toLocaleString()} sống sót
                        </span>
                      </div>

                      {stage.unlockedBonus && (
                        <div className="px-2 py-1 rounded bg-black/40 border border-purple-500/20 text-[9px] text-purple-200">
                          🎁 {stage.unlockedBonus}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#090a0e] border-t border-[#1f2338] text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Huy hiệu: <strong className="text-white">{badges}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> KM: <strong className="text-white">{currentKm} km</strong>
            </span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#181926] hover:bg-[#25273d] text-gray-200 border border-[#2d314d] text-xs font-bold transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
