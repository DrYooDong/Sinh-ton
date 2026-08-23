import React, { useState } from 'react';
import { GameDifficulty, PlayerStats, SurvivalStage, TimeOfDayPhase, VehicleStats, KeybindingsConfig } from '../types';
import { soundEngine } from '../audio/soundEngine';
import {
  Heart,
  Utensils,
  Droplets,
  Thermometer,
  Fuel,
  Hammer,
  Car,
  Package,
  MessageSquare,
  Trophy,
  Save,
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ShieldAlert,
  Wrench,
  Flame,
  Skull,
  ShieldCheck,
  HelpCircle,
  Bot,
  Zap,
  Keyboard,
  Radio,
  Music,
  SlidersHorizontal,
  Award,
} from 'lucide-react';

interface HeaderHUDProps {
  player: PlayerStats;
  vehicle: VehicleStats;
  stage: SurvivalStage;
  gameTimeMinutes: number;
  gameDifficulty: GameDifficulty;
  timePhase: TimeOfDayPhase;
  ambientTemp: number;
  isMuted: boolean;
  isBgmPlaying?: boolean;
  keybindings?: KeybindingsConfig;
  onToggleMute: () => void;
  onToggleBgm?: () => void;
  onChangeDifficulty: (difficulty: GameDifficulty) => void;
  onRepairVehicle: () => void;
  onOpenCrafting: () => void;
  onOpenSkills: () => void;
  onOpenVehicle: () => void;
  onOpenInventory: () => void;
  onOpenChat: () => void;
  onOpenQuests: () => void;
  onOpenGrowth?: () => void;
  onOpenSave: () => void;
  onOpenTutorial: () => void;
  onOpenGeminiAI: () => void;
  onOpenKeybindings: () => void;
}

const formatKeyLabel = (code?: string, fallback = '') => {
  if (!code) return fallback;
  if (code.startsWith('Key')) return code.replace('Key', '');
  if (code.startsWith('Digit')) return code.replace('Digit', '');
  return code;
};

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  player,
  vehicle,
  stage,
  gameTimeMinutes,
  gameDifficulty,
  timePhase,
  ambientTemp,
  isMuted,
  isBgmPlaying = true,
  keybindings,
  onToggleMute,
  onToggleBgm,
  onChangeDifficulty,
  onRepairVehicle,
  onOpenCrafting,
  onOpenSkills,
  onOpenVehicle,
  onOpenInventory,
  onOpenChat,
  onOpenQuests,
  onOpenGrowth,
  onOpenSave,
  onOpenTutorial,
  onOpenGeminiAI,
  onOpenKeybindings,
}) => {
  // Format 24-hour clock
  const totalMinutes = Math.floor(gameTimeMinutes) % 1440;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeFormatted = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  const dayNumber = Math.floor(gameTimeMinutes / 1440) + 1;

  // Body temp safety color
  const tempColor =
    player.bodyTemp >= 39.5
      ? 'text-[#ff4b2b] animate-pulse font-bold'
      : player.bodyTemp >= 38.0
      ? 'text-[#ffcc00] font-bold'
      : player.bodyTemp <= 35.0
      ? 'text-[#00f2ff] animate-pulse font-bold'
      : 'text-gray-300';

  // Day/Night Phase config
  const phaseConfig = {
    dawn: { label: 'Bình Minh', icon: Sunrise, color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
    noon: { label: 'Chính Ngọ (Nắng gắt)', icon: Sun, color: 'text-orange-400 border-orange-500/50 bg-orange-500/10' },
    dusk: { label: 'Hoàng Hôn', icon: Sunset, color: 'text-rose-400 border-rose-500/50 bg-rose-500/10' },
    night: { label: 'Đêm Đen (Nguy Hiểm)', icon: Moon, color: 'text-purple-400 border-purple-500/50 bg-purple-500/10' },
  };
  const phaseInfo = phaseConfig[timePhase] || phaseConfig.noon;
  const PhaseIcon = phaseInfo.icon;

  const kSkill = formatKeyLabel(keybindings?.skills, 'K');
  const kCraft = formatKeyLabel(keybindings?.crafting, 'C');
  const kVehicle = formatKeyLabel(keybindings?.vehicle, 'V');
  const kInv = formatKeyLabel(keybindings?.inventory, 'I');
  const kChat = formatKeyLabel(keybindings?.chat, 'M');
  const kQuest = formatKeyLabel(keybindings?.quests, 'J');
  const kAI = formatKeyLabel(keybindings?.companionAI, 'P');

  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);

  return (
    <header className="bg-[#0c0c0e]/95 border-b border-[#2d2d30] backdrop-blur-md z-30 shadow-lg select-none font-mono">
      {/* =========================================================================
          MOBILE VIEW (md:hidden): Single compact, sleek, non-intrusive status bar
         ========================================================================= */}
      <div className="md:hidden px-2.5 py-1.5 flex items-center justify-between gap-1.5 text-xs">
        {/* Left: Player Mini Vitals (HP + Hunger/Thirst) */}
        <button
          onClick={() => setShowMobileDetails(!showMobileDetails)}
          className="flex items-center gap-1.5 bg-[#141418]/90 px-2 py-1 rounded-lg border border-[#2d2d35] active:scale-95 transition"
        >
          {/* HP */}
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#ff416c] fill-[#ff416c]" />
            <span className="font-bold text-[#ff416c] text-[11px]">
              {Math.round(player.hp)}
            </span>
          </div>

          <div className="w-px h-3 bg-[#2d2d35]" />

          {/* Hunger & Thirst */}
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span className={player.hunger < 25 ? 'text-red-400 animate-pulse' : 'text-[#ffcc00]'}>
              🍖{Math.round(player.hunger)}%
            </span>
            <span className={player.thirst < 25 ? 'text-red-400 animate-pulse' : 'text-[#00f2ff]'}>
              💧{Math.round(player.thirst)}%
            </span>
          </div>
        </button>

        {/* Center: Vehicle Quick Status (Fuel + Durability + Km) */}
        <button
          onClick={() => setShowMobileDetails(!showMobileDetails)}
          className="flex items-center gap-1 bg-[#141418]/90 px-2 py-1 rounded-lg border border-[#2d2d35] active:scale-95 transition text-[10px] font-bold"
        >
          <Car className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span className="text-[#00f2ff]">{vehicle.mileage.toFixed(1)}k</span>
          <span className="text-gray-500">•</span>
          <span className="text-[#ffcc00]">{vehicle.currentFuel.toFixed(0)}L</span>
          <span className="text-gray-500">•</span>
          <span className={(vehicle.durability ?? 100) < 30 ? 'text-red-400 animate-pulse' : 'text-[#4cd137]'}>
            {Math.round(vehicle.durability ?? 100)}%
          </span>
        </button>

        {/* Right: Time / Phase & Details Toggle */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-[#141418]/90 px-1.5 py-1 rounded-lg border border-[#2d2d35] text-[10px] font-bold text-gray-300">
            <PhaseIcon className="w-3 h-3 text-[#ffcc00]" />
            <span className="text-[#00f2ff]">{timeFormatted}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setShowMobileDetails(!showMobileDetails);
            }}
            className={`p-1 rounded-lg border transition ${
              showMobileDetails
                ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]'
                : 'bg-[#141418] text-gray-400 border-[#2d2d35]'
            }`}
            title="Chi tiết chỉ số"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDABLE DETAILS DRAWER */}
      {showMobileDetails && (
        <div className="md:hidden border-t border-[#2d2d35] bg-[#0d0d12]/98 p-3 flex flex-col gap-2.5 animate-fadeIn text-xs">
          <div className="grid grid-cols-2 gap-2">
            {/* Player Detailed Stats */}
            <div className="bg-[#14141a] p-2 rounded-lg border border-[#23232a] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">SINH LỰC NHÂN VẬT</span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">Máu:</span>
                <span className="font-bold text-[#ff416c]">{Math.round(player.hp)} / {player.maxHp}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">Thân nhiệt:</span>
                <span className={`font-bold ${tempColor}`}>{player.bodyTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">Huy hiệu:</span>
                <span className="font-bold text-[#ffcc00]">{player.courageBadges} Điểm</span>
              </div>
            </div>

            {/* Vehicle Detailed Stats */}
            <div className="bg-[#14141a] p-2 rounded-lg border border-[#23232a] flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">THÔNG SỐ XE NHÀ</span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">Bình xăng:</span>
                <span className="font-bold text-white">{vehicle.currentFuel.toFixed(1)} / {vehicle.maxFuel}L</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">Độ bền xe:</span>
                <span className="font-bold text-[#4cd137]">{Math.round(vehicle.durability ?? 100)}%</span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onRepairVehicle();
                }}
                className="mt-0.5 py-1 px-2 bg-[#1c1c24] hover:bg-[#252530] text-[#38bdf8] rounded border border-[#38bdf8]/40 text-[10px] font-bold flex items-center justify-center gap-1"
              >
                <Wrench className="w-3 h-3 text-[#38bdf8]" />
                SỬA XE (1 TẤM SẮT)
              </button>
            </div>
          </div>

          {/* Difficulty & Stage */}
          <div className="flex items-center justify-between bg-[#14141a] px-2.5 py-1.5 rounded-lg border border-[#23232a]">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 text-[10px] font-bold">ĐỘ KHÓ:</span>
              <select
                value={gameDifficulty}
                onChange={(e) => {
                  soundEngine.playClick();
                  onChangeDifficulty(e.target.value as GameDifficulty);
                }}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1c1c24] text-[#00f2ff] border border-[#2d2d35]"
              >
                <option value="normal">🟢 BÌNH THƯỜNG</option>
                <option value="hard">🟡 GIAN NAN</option>
                <option value="nightmare">🔴 ÁC MỘNG</option>
              </select>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">
              VÙNG: <span className="text-[#00f2ff]">{stage.name}</span> ({ambientTemp}°C)
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP VIEW (hidden md:flex): Professional Two-Deck Sci-Fi Command HUD
         ========================================================================= */}
      <div className="hidden md:flex flex-col gap-2 p-2 sm:px-3 sm:py-2">
        {/* UPPER DECK: Core Telemetry (Player Vitals, Environment & Time, Vehicle & Difficulty) */}
        <div className="grid grid-cols-12 gap-2 items-center">
          
          {/* Deck 1-A: Player Biometrics (Col 1-4) */}
          <div className="col-span-4 flex items-center justify-between gap-2 bg-[#121216] px-3 py-1.5 rounded-lg border border-[#26262e] text-xs shadow-inner">
            {/* HP */}
            <div className="flex items-center gap-1.5" title="Sinh Lực Nhân Vật">
              <div className="p-1 rounded bg-[#ff416c]/10 border border-[#ff416c]/30">
                <Heart className="w-3.5 h-3.5 text-[#ff416c] fill-[#ff416c]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">MÁU</span>
                <span className="font-black text-[#ff416c] text-xs leading-tight">
                  {Math.round(player.hp)}<span className="text-gray-500 font-normal">/{player.maxHp}</span>
                </span>
              </div>
            </div>

            <div className="w-px h-5 bg-[#26262e]" />

            {/* Hunger */}
            <div className="flex items-center gap-1.5" title="Độ No">
              <Utensils className="w-3.5 h-3.5 text-[#ffcc00]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">NO</span>
                <span className={`font-bold text-xs leading-tight ${player.hunger < 25 ? 'text-[#ff4b2b] animate-pulse' : 'text-[#ffcc00]'}`}>
                  {Math.round(player.hunger)}%
                </span>
              </div>
            </div>

            <div className="w-px h-5 bg-[#26262e]" />

            {/* Thirst */}
            <div className="flex items-center gap-1.5" title="Độ Khát Nước">
              <Droplets className="w-3.5 h-3.5 text-[#00f2ff]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">NƯỚC</span>
                <span className={`font-bold text-xs leading-tight ${player.thirst < 25 ? 'text-[#ff4b2b] animate-pulse' : 'text-[#00f2ff]'}`}>
                  {Math.round(player.thirst)}%
                </span>
              </div>
            </div>

            <div className="w-px h-5 bg-[#26262e]" />

            {/* Body Temp */}
            <div className="flex items-center gap-1.5" title="Thân Nhiệt (36.5 - 37.5°C)">
              <Thermometer className={`w-3.5 h-3.5 ${player.bodyTemp > 38.5 ? 'text-[#ff4b2b]' : player.bodyTemp < 35.5 ? 'text-[#00f2ff]' : 'text-gray-300'}`} />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">NHIỆT</span>
                <span className={`font-bold text-xs leading-tight ${tempColor}`}>
                  {player.bodyTemp.toFixed(1)}°C
                </span>
              </div>
            </div>
          </div>

          {/* Deck 1-B: Environment & Time Phase (Col 5-8) */}
          <div className="col-span-4 flex items-center justify-between gap-2 bg-[#121216] px-3 py-1.5 rounded-lg border border-[#26262e] text-xs shadow-inner">
            {/* Day & Time */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#1c1c24] text-[#ffcc00] rounded font-black text-[11px] border border-amber-500/30">
                NGÀY {dayNumber}
              </span>
              <span className="text-[#00f2ff] tracking-wider font-bold text-xs">
                {timeFormatted}
              </span>
            </div>

            {/* Phase Badge */}
            <div className={`px-2 py-0.5 rounded border text-[10px] font-black flex items-center gap-1.5 ${phaseInfo.color}`}>
              <PhaseIcon className="w-3 h-3" />
              <span>{phaseInfo.label.toUpperCase()}</span>
            </div>

            {/* Area & Ambient Temp */}
            <div className="flex items-center gap-1 text-gray-400 text-[11px]" title={`Khu vực: ${stage.name}`}>
              <span className="font-bold text-[#00f2ff] max-w-[90px] truncate">{stage.name}</span>
              <span className="text-gray-500 font-mono text-[10px]">({ambientTemp}°C)</span>
            </div>
          </div>

          {/* Deck 1-C: Vehicle Status & Difficulty (Col 9-12) */}
          <div className="col-span-4 flex items-center justify-between gap-2 bg-[#121216] px-3 py-1.5 rounded-lg border border-[#26262e] text-xs shadow-inner">
            {/* Fuel */}
            <div className="flex items-center gap-1.5" title="Nhiên Liệu Xe Nhà">
              <Fuel className="w-3.5 h-3.5 text-[#ffcc00]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">XĂNG</span>
                <span className="font-bold text-white text-xs leading-tight">
                  {vehicle.currentFuel.toFixed(1)}L
                </span>
              </div>
            </div>

            <div className="w-px h-5 bg-[#26262e]" />

            {/* Km */}
            <div className="flex items-center gap-1.5" title="Quãng Đường Đã Chạy">
              <Car className="w-3.5 h-3.5 text-[#00f2ff]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">KM</span>
                <span className="font-bold text-[#00f2ff] text-xs leading-tight">
                  {vehicle.mileage.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="w-px h-5 bg-[#26262e]" />

            {/* Durability & Quick Repair */}
            <div className="flex items-center gap-1.5" title="Độ Bền Thân Xe">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4cd137]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase leading-none">BỀN</span>
                <span className={`font-bold text-xs leading-tight ${(vehicle.durability ?? 100) < 30 ? 'text-[#ff4b2b] animate-pulse' : 'text-[#4cd137]'}`}>
                  {Math.round(vehicle.durability ?? 100)}%
                </span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onRepairVehicle();
                }}
                className="ml-1 px-1.5 py-0.5 bg-[#1c1c24] hover:bg-[#282834] text-[#38bdf8] hover:text-white rounded border border-[#38bdf8]/40 text-[10px] font-bold transition flex items-center gap-0.5 active:scale-95"
                title="Sửa xe: Tiêu hao 1 Tấm Sắt (+20% Bền)"
              >
                <Wrench className="w-2.5 h-2.5" />
                <span>SỬA</span>
              </button>
            </div>

            <div className="w-px h-5 bg-[#26262e]" />

            {/* Difficulty Selector */}
            <select
              value={gameDifficulty}
              onChange={(e) => {
                soundEngine.playClick();
                onChangeDifficulty(e.target.value as GameDifficulty);
              }}
              className={`text-[10px] font-bold px-1.5 py-1 rounded border bg-[#18181f] cursor-pointer focus:outline-none transition ${
                gameDifficulty === 'nightmare'
                  ? 'text-rose-400 border-rose-500/50'
                  : gameDifficulty === 'hard'
                  ? 'text-amber-400 border-amber-500/50'
                  : 'text-emerald-400 border-emerald-500/50'
              }`}
              title="Cài đặt độ khó của game"
            >
              <option value="normal">🟢 THƯỜNG</option>
              <option value="hard">🟡 GIAN NAN</option>
              <option value="nightmare">🔴 ÁC MỘNG</option>
            </select>
          </div>

        </div>

        {/* LOWER DECK: Navigation Operations & System Controls */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          
          {/* Left: Core Gameplay Navigation Action Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Thiên Phú */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenSkills();
              }}
              className="px-2.5 py-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-amber-300 hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-amber-400/60 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>[{kSkill}] THIÊN PHÚ</span>
            </button>

            {/* Bàn Rèn */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenCrafting();
              }}
              className="px-2.5 py-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-[#ff6b6b] hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-[#ff6b6b]/60 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Hammer className="w-3.5 h-3.5 text-[#ff6b6b]" />
              <span>[{kCraft}] BÀN RÈN</span>
            </button>

            {/* Xe Nhà */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenVehicle();
              }}
              className="px-2.5 py-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-[#00f2ff] hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-[#00f2ff]/60 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Car className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>[{kVehicle}] XE NHÀ</span>
            </button>

            {/* Túi Đồ */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenInventory();
              }}
              className="px-2.5 py-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-[#ffd166] hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-[#ffd166]/60 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Package className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>[{kInv}] TÚI ĐỒ</span>
            </button>

            {/* Chợ & Chat */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenChat();
              }}
              className="px-2.5 py-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-[#48cae4] hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-[#48cae4]/60 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#48cae4]" />
              <span>[{kChat}] CHỢ / CHAT</span>
            </button>

            {/* Nhiệm Vụ */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenQuests();
              }}
              className="px-2.5 py-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-[#c77dff] hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-[#c77dff]/60 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-[#c77dff]" />
              <span>[{kQuest}] NHIỆM VỤ</span>
            </button>

            {/* Trưởng Thành & Đột Phá */}
            {onOpenGrowth && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenGrowth();
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 text-purple-300 hover:text-white font-bold rounded-lg text-xs border border-purple-500/50 hover:border-purple-400 flex items-center gap-1.5 transition active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                title="Đột Phá Cảnh Giới, Xe Nhà, Thần Thú & Vườn Thủy Canh"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>TRƯỞNG THÀNH</span>
              </button>
            )}

            {/* Trợ Lý Gemini AI */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenGeminiAI();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 hover:text-white font-bold rounded-lg text-xs border border-cyan-500/60 flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95"
              title="Cố Vấn Sinh Tồn Gemini AI Thông Minh"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>[{kAI}] CỐ VẤN AI</span>
            </button>
          </div>

          {/* Right: Badges, Utilities & Settings */}
          <div className="flex items-center gap-1.5">
            {/* Badges Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#181822] text-[#ffcc00] font-black rounded-lg border border-amber-500/40 text-xs shadow-sm">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{player.courageBadges} ĐIỂM</span>
            </div>

            {/* Sổ tay Tân thủ */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenTutorial();
              }}
              className="px-2.5 py-1 bg-[#14141a] hover:bg-[#1e1e28] text-emerald-300 hover:text-white font-bold rounded-lg text-xs border border-[#2b2b38] hover:border-emerald-500/50 flex items-center gap-1 transition active:scale-95"
              title="Sổ Tay & Hướng Dẫn Sinh Tồn"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>[?] HƯỚNG DẪN</span>
            </button>

            {/* Keybindings */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenKeybindings();
              }}
              className="p-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-gray-300 hover:text-[#00f2ff] rounded-lg border border-[#2b2b38] hover:border-[#00f2ff]/50 transition active:scale-95"
              title="Cài Đặt Phím Bấm"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>

            {/* Lưu Game */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenSave();
              }}
              className="p-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-gray-300 hover:text-[#00f2ff] rounded-lg border border-[#2b2b38] hover:border-[#00f2ff]/50 transition active:scale-95"
              title="Lưu Dữ Liệu & Xuất File C++"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            {/* BGM Toggle */}
            {onToggleBgm && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onToggleBgm();
                }}
                className={`p-1.5 rounded-lg border transition active:scale-95 ${
                  isBgmPlaying
                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/60'
                    : 'bg-[#14141a] text-gray-500 border-[#2b2b38]'
                }`}
                title={isBgmPlaying ? 'Tắt BGM Nhạc Nền' : 'Bật BGM Nhạc Nền'}
              >
                <Music className={`w-3.5 h-3.5 ${isBgmPlaying ? 'animate-bounce' : ''}`} />
              </button>
            )}

            {/* SFX Mute */}
            <button
              onClick={onToggleMute}
              className="p-1.5 bg-[#14141a] hover:bg-[#1e1e28] text-gray-300 hover:text-white rounded-lg border border-[#2b2b38] transition active:scale-95"
              title={isMuted ? 'Bật Âm Thanh Hiệu Ứng' : 'Tắt Âm Thanh Hiệu Ứng'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ff4b2b]" /> : <Volume2 className="w-3.5 h-3.5 text-[#4cd137]" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
