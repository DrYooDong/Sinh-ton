import React from 'react';
import { GameDifficulty, PlayerStats, SurvivalStage, TimeOfDayPhase, VehicleStats } from '../types';
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
  Zap,
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
  onToggleMute: () => void;
  onChangeDifficulty: (difficulty: GameDifficulty) => void;
  onRepairVehicle: () => void;
  onOpenCrafting: () => void;
  onOpenSkills: () => void;
  onOpenVehicle: () => void;
  onOpenInventory: () => void;
  onOpenChat: () => void;
  onOpenQuests: () => void;
  onOpenSave: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  player,
  vehicle,
  stage,
  gameTimeMinutes,
  gameDifficulty,
  timePhase,
  ambientTemp,
  isMuted,
  onToggleMute,
  onChangeDifficulty,
  onRepairVehicle,
  onOpenCrafting,
  onOpenSkills,
  onOpenVehicle,
  onOpenInventory,
  onOpenChat,
  onOpenQuests,
  onOpenSave,
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
      : 'text-[#4cd137] font-bold';

  const durability = vehicle.durability ?? 100;
  const maxDurability = vehicle.maxDurability ?? 100;
  const durabilityPct = Math.max(0, Math.min(100, (durability / maxDurability) * 100));

  // Time Phase details
  const phaseInfo = {
    dawn: { label: 'Bình Minh', icon: Sunrise, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    day: { label: 'Ban Ngày', icon: Sun, color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
    dusk: { label: 'Hoàng Hôn', icon: Sunset, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    night: { label: 'Đêm Tối', icon: Moon, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  }[timePhase];

  const PhaseIcon = phaseInfo.icon;

  return (
    <header className="bg-[#0c0c0e] border-b border-[#2d2d30] px-3 sm:px-5 py-2 flex flex-col gap-2 text-[#e0e0e0] z-30 select-none shadow-2xl relative">
      {/* Top row: Player Survival Meters + Quick Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Player Survival Meters (HP, Hunger, Thirst, Vehicle Durability, Temp, Fuel) */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* HP Bar */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] mb-0.5 font-bold text-[#ff416c]">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#ff4b2b]" /> HP
              </span>
              <span className="text-white font-bold ml-2">
                {Math.round(player.hp)}/{player.maxHp}
              </span>
            </div>
            <div className="w-28 sm:w-36 h-2 bg-[#1a1a1d] rounded-sm overflow-hidden border border-[#333336]">
              <div
                className="h-full bg-gradient-to-r from-[#ff4b2b] to-[#ff416c] transition-all duration-300"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Vehicle Durability */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] mb-0.5 font-bold text-[#38bdf8]">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#38bdf8]" /> BỀN XE
              </span>
              <span className="text-white font-bold ml-1.5">{Math.round(durabilityPct)}%</span>
            </div>
            <div className="w-24 sm:w-32 h-2 bg-[#1a1a1d] rounded-sm overflow-hidden border border-[#333336]">
              <div
                className={`h-full transition-all duration-300 ${
                  durabilityPct < 30
                    ? 'bg-[#ef4444] animate-pulse'
                    : durabilityPct < 60
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#38bdf8]'
                }`}
                style={{ width: `${durabilityPct}%` }}
              />
            </div>
          </div>

          {/* Hunger & Thirst */}
          <div className="flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.15em] mb-0.5 font-bold text-[#ffcc00] flex items-center gap-2">
              <span>NO / KHÁT</span>
            </div>
            <div className="flex gap-1.5">
              <div
                className="w-14 sm:w-16 h-2 bg-[#1a1a1d] border border-[#333336] rounded-sm overflow-hidden"
                title={`Độ no: ${Math.round(player.hunger)}%`}
              >
                <div className="h-full bg-[#4cd137] transition-all duration-300" style={{ width: `${player.hunger}%` }} />
              </div>
              <div
                className="w-14 sm:w-16 h-2 bg-[#1a1a1d] border border-[#333336] rounded-sm overflow-hidden"
                title={`Độ khát: ${Math.round(player.thirst)}%`}
              >
                <div className="h-full bg-[#00a8ff] transition-all duration-300" style={{ width: `${player.thirst}%` }} />
              </div>
            </div>
          </div>

          {/* Body Temperature */}
          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] text-[#00f2ff] uppercase tracking-[0.15em] mb-0.5 font-bold">THÂN NHIỆT</span>
            <div className="flex items-center gap-1 h-2 text-[11px] font-bold">
              <Thermometer className="w-3 h-3 text-[#00f2ff]" />
              <span className={tempColor}>{player.bodyTemp.toFixed(1)}°C</span>
            </div>
          </div>

          {/* Fuel Status */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ffcc00] uppercase tracking-[0.15em] mb-0.5 font-bold">XĂNG</span>
            <div className="flex items-center gap-1 h-2 text-[11px]">
              <Fuel className="w-3 h-3 text-[#ffcc00]" />
              <span className="font-bold text-[#ffcc00]">{vehicle.currentFuel.toFixed(1)}L</span>
              <span className="text-gray-500 text-[10px]">({vehicle.mileage.toFixed(1)}km)</span>
            </div>
          </div>
        </div>

        {/* Right: Navigation Modals Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap font-mono">
          {/* Quick Repair Button if Vehicle Damaged */}
          {durabilityPct < 85 && (
            <button
              onClick={() => {
                soundEngine.playCraftAnvil();
                onRepairVehicle();
              }}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white font-bold rounded border border-amber-500/50 text-[11px] flex items-center gap-1 transition"
              title="Dùng 1 Tấm Sắt sửa xe (+20% độ bền)"
            >
              <Wrench className="w-3 h-3 text-amber-400" />
              <span>SỬA XE [1 TẤM SẮT]</span>
            </button>
          )}

          {/* Bàn Rèn */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCrafting();
            }}
            className="px-2.5 py-1.5 bg-[#1a1a1d] hover:bg-[#252529] text-[#ffcc00] hover:text-white font-bold rounded border border-[#ffcc00]/60 hover:border-[#ffcc00] text-xs flex items-center gap-1 shadow-lg transition"
          >
            <Hammer className="w-3.5 h-3.5 text-[#ffcc00]" />
            <span>[C] BÀN RÈN ({player.talentCount}/10)</span>
          </button>

          {/* Kỹ Năng Sinh Tồn */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSkills();
            }}
            className="px-2.5 py-1.5 bg-[#171324] hover:bg-[#241c38] text-amber-300 hover:text-white font-bold rounded border border-amber-500/50 hover:border-amber-400 text-xs flex items-center gap-1 shadow-lg transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>[K] KỸ NĂNG</span>
          </button>

          {/* Xe Nhà RV */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenVehicle();
            }}
            className="px-2.5 py-1.5 bg-[#131315] hover:bg-[#1a1a1d] text-[#00f2ff] hover:text-white font-bold rounded text-xs border border-[#2d2d30] hover:border-[#00f2ff]/50 flex items-center gap-1 transition"
          >
            <Car className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span className="hidden sm:inline">[V] XE NHÀ</span>
          </button>

          {/* Túi đồ */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenInventory();
            }}
            className="px-2.5 py-1.5 bg-[#131315] hover:bg-[#1a1a1d] text-gray-300 hover:text-white font-bold rounded text-xs border border-[#2d2d30] hover:border-[#ffcc00]/50 flex items-center gap-1 transition"
          >
            <Package className="w-3.5 h-3.5 text-[#ffcc00]" />
            <span className="hidden sm:inline">[I] TÚI ĐỒ</span>
          </button>

          {/* Chợ & Chat */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenChat();
            }}
            className="px-2.5 py-1.5 bg-[#131315] hover:bg-[#1a1a1d] text-[#00f2ff] hover:text-white font-bold rounded text-xs border border-[#2d2d30] hover:border-[#00f2ff]/50 flex items-center gap-1 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span className="hidden sm:inline">[M] CHỢ/CHAT</span>
          </button>

          {/* Nhiệm Vụ */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenQuests();
            }}
            className="px-2.5 py-1.5 bg-[#131315] hover:bg-[#1a1a1d] text-[#a855f7] hover:text-white font-bold rounded text-xs border border-[#2d2d30] hover:border-[#a855f7]/50 flex items-center gap-1 transition"
          >
            <Trophy className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="hidden sm:inline">[J] NHIỆM VỤ</span>
          </button>

          {/* Lưu File & Game */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSave();
            }}
            className="p-1.5 bg-[#131315] hover:bg-[#1a1a1d] text-gray-300 hover:text-[#00f2ff] rounded border border-[#2d2d30] hover:border-[#00f2ff]/50 transition"
            title="Lưu Dữ Liệu & File C++"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Mute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-[#131315] hover:bg-[#1a1a1d] text-gray-300 hover:text-white rounded border border-[#2d2d30] transition"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#ff4b2b]" /> : <Volume2 className="w-4 h-4 text-[#4cd137]" />}
          </button>
        </div>
      </div>

      {/* Bottom Sub-bar: Day/Night Cycle, Time Clock, Game Difficulty & Stage Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#131315] rounded border border-[#2d2d30] text-xs font-mono">
        {/* Left: Day/Night Phase Badge & Clock */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Day / Time */}
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="px-1.5 py-0.5 bg-[#1f1f23] rounded border border-[#333336] text-[11px] text-[#ffcc00]">
              NGÀY {dayNumber}
            </span>
            <span className="text-[#00f2ff] tracking-wider text-xs font-bold">{timeFormatted}</span>
          </div>

          {/* Phase Badge */}
          <div className={`px-2 py-0.5 rounded border text-[11px] font-bold flex items-center gap-1.5 ${phaseInfo.color}`}>
            <PhaseIcon className="w-3.5 h-3.5" />
            <span>{phaseInfo.label.toUpperCase()}</span>
            {timePhase === 'night' && <span className="text-[10px] text-rose-300 animate-pulse">(QUÁI TĂNG TỐC & DMG)</span>}
          </div>

          {/* Stage / Area */}
          <div className="hidden md:flex items-center gap-1.5 text-gray-400 text-[11px]">
            <span className="font-bold uppercase text-gray-500">VÙNG:</span>
            <span className="font-bold text-[#00f2ff]">{stage.name}</span>
            <span className="text-gray-500">({ambientTemp}°C)</span>
          </div>
        </div>

        {/* Right: Difficulty Selector & Courage Badges */}
        <div className="flex items-center gap-3">
          {/* Difficulty Dropdown Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-[10px] font-bold uppercase hidden sm:inline">ĐỘ KHÓ:</span>
            <select
              value={gameDifficulty}
              onChange={(e) => {
                soundEngine.playClick();
                onChangeDifficulty(e.target.value as GameDifficulty);
              }}
              className={`text-[11px] font-bold px-2 py-0.5 rounded border bg-[#18181b] cursor-pointer focus:outline-none transition ${
                gameDifficulty === 'nightmare'
                  ? 'text-rose-400 border-rose-500/60'
                  : gameDifficulty === 'hard'
                  ? 'text-amber-400 border-amber-500/60'
                  : 'text-emerald-400 border-emerald-500/60'
              }`}
            >
              <option value="normal">🟢 BÌNH THƯỜNG (1x)</option>
              <option value="hard">🟡 GIAN NAN (1.6x)</option>
              <option value="nightmare">🔴 ÁC MỘNG (2.2x)</option>
            </select>
          </div>

          {/* Badges Counter */}
          <span className="text-[#ffcc00] font-bold text-[11px] flex items-center gap-1">
            <span>🎖️</span> {player.courageBadges} HUY HIỆU
          </span>
        </div>
      </div>
    </header>
  );
};
