import React, { useState } from 'react';
import { EncounterChoice, InventoryItem, PlayerStats, RandomEncounter, VehicleStats } from '../types';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Skull,
  Award,
  Heart,
  Shield,
  Fuel,
  Package,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface EncounterModalProps {
  encounter: RandomEncounter | null;
  isOpen: boolean;
  inventory: InventoryItem[];
  playerStats: PlayerStats;
  vehicleStats: VehicleStats;
  onResolveEncounter: (choice: EncounterChoice) => void;
  onClose: () => void;
}

export const EncounterModal: React.FC<EncounterModalProps> = ({
  encounter,
  isOpen,
  inventory,
  playerStats,
  vehicleStats,
  onResolveEncounter,
  onClose,
}) => {
  const [resolvedChoice, setResolvedChoice] = useState<EncounterChoice | null>(null);

  if (!isOpen || !encounter) return null;

  const handleSelectChoice = (choice: EncounterChoice) => {
    // Requirements verification
    if (choice.requiredItemId) {
      const item = inventory.find(
        (i) =>
          i.id === choice.requiredItemId ||
          i.name.toLowerCase().includes((choice.requiredItemName || '').toLowerCase())
      );
      if (!item || item.quantity < (choice.requiredItemQty || 1)) {
        return;
      }
    }

    if (choice.requiredBadges && (playerStats.courageBadges || 0) < choice.requiredBadges) {
      return;
    }

    if (choice.minVehicleSpeed && (vehicleStats.currentSpeed || 0) < choice.minVehicleSpeed) {
      return;
    }

    soundEngine.playCritFanfare();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });

    setResolvedChoice(choice);
  };

  const handleFinish = () => {
    if (resolvedChoice) {
      onResolveEncounter(resolvedChoice);
    }
    setResolvedChoice(null);
    onClose();
  };

  const dangerRating = Array.from({ length: 5 }).map((_, idx) => (
    <Skull
      key={idx}
      className={`w-3.5 h-3.5 ${
        idx < encounter.dangerLevel ? 'text-rose-500 fill-rose-500/20' : 'text-gray-700'
      }`}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0d0d12] border-2 border-[#ff9900]/70 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-gray-200 flex flex-col relative animate-scaleUp">
        {/* TOP CINEMATIC BANNER */}
        <div className={`bg-gradient-to-r ${encounter.bgGradient} px-5 py-4 border-b border-[#2d2d38] flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/50 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg">
              {encounter.imageIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40 uppercase tracking-wider">
                  BIẾN CỐ XA LỘ (RANDOM ENCOUNTER)
                </span>
                <div className="flex items-center gap-0.5 ml-1">{dangerRating}</div>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide mt-0.5">
                {encounter.title}
              </h2>
              <p className="text-[11px] text-amber-300/80">{encounter.subtitle}</p>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* NARRATIVE TEXT */}
          {!resolvedChoice ? (
            <>
              <div className="bg-[#14141c] p-4 rounded-xl border border-[#2d2d38] text-xs sm:text-sm text-gray-200 leading-relaxed italic relative">
                <div className="absolute top-2 left-2 text-2xl text-amber-500/20 font-serif leading-none">
                  “
                </div>
                <p className="pl-4">{encounter.narrative}</p>
              </div>

              {/* CHOICES LIST */}
              <div className="flex flex-col gap-2.5 mt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  LỰA CHỌN PHẢN ỨNG CỦA BẠN:
                </span>

                {encounter.choices.map((choice) => {
                  let hasReq = true;
                  let missingReason = '';

                  if (choice.requiredItemId) {
                    const item = inventory.find(
                      (i) =>
                        i.id === choice.requiredItemId ||
                        i.name.toLowerCase().includes((choice.requiredItemName || '').toLowerCase())
                    );
                    if (!item || item.quantity < (choice.requiredItemQty || 1)) {
                      hasReq = false;
                      missingReason = `Thiếu ${choice.requiredItemQty || 1}x ${choice.requiredItemName || 'Vật phẩm'}`;
                    }
                  }

                  if (choice.requiredBadges && (playerStats.courageBadges || 0) < choice.requiredBadges) {
                    hasReq = false;
                    missingReason = `Thiếu ${choice.requiredBadges} Huy Hiệu Dũng Khí`;
                  }

                  if (choice.minVehicleSpeed && (vehicleStats.currentSpeed || 0) < choice.minVehicleSpeed) {
                    hasReq = false;
                    missingReason = `Cần tốc độ xe tối thiểu ${choice.minVehicleSpeed} km/h (Hiện tại: ${Math.round(vehicleStats.currentSpeed || 0)} km/h)`;
                  }

                  const riskBadge = {
                    safe: { text: 'AN TOÀN', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                    moderate: { text: 'THẬN TRỌNG', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                    dangerous: { text: 'NGUY HIỂM', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                  }[choice.riskLevel || 'safe'];

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice)}
                      disabled={!hasReq}
                      className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                        hasReq
                          ? 'bg-[#15151f] hover:bg-[#1f1f2e] border-[#333342] hover:border-amber-500/70 shadow-lg cursor-pointer group active:scale-98'
                          : 'bg-[#111116] border-[#22222a] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1e1e2b] border border-[#333344] flex items-center justify-center text-lg mt-0.5 group-hover:scale-110 transition">
                          {choice.icon || '👉'}
                        </div>
                        <div className="flex flex-col">
                          <div className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition flex items-center gap-2">
                            <span>{choice.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${riskBadge.color}`}>
                              {riskBadge.text}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                            {choice.description}
                          </p>

                          {!hasReq && (
                            <div className="text-[10px] text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>{missingReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0 mt-2" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* RESOLUTION OUTCOME CARD */
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-[#181824] to-[#101016] p-5 rounded-xl border border-amber-500/50 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{resolvedChoice.outcome.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {resolvedChoice.outcome.description}
                </p>

                {/* REWARDS & STATS DELTAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#2d2d38]">
                  {resolvedChoice.outcome.rewardBadges && (
                    <div className="bg-[#12121a] p-2 rounded-lg border border-amber-500/30 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Huy Hiệu</span>
                        <span className="text-xs font-black text-amber-400">
                          {resolvedChoice.outcome.rewardBadges > 0 ? `+${resolvedChoice.outcome.rewardBadges}` : resolvedChoice.outcome.rewardBadges}
                        </span>
                      </div>
                    </div>
                  )}

                  {resolvedChoice.outcome.rewardHp && (
                    <div className="bg-[#12121a] p-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Hồi Máu</span>
                        <span className="text-xs font-black text-emerald-400">
                          +{resolvedChoice.outcome.rewardHp} HP
                        </span>
                      </div>
                    </div>
                  )}

                  {resolvedChoice.outcome.damageHp && (
                    <div className="bg-[#12121a] p-2 rounded-lg border border-rose-500/30 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Mất Máu</span>
                        <span className="text-xs font-black text-rose-400">
                          -{resolvedChoice.outcome.damageHp} HP
                        </span>
                      </div>
                    </div>
                  )}

                  {resolvedChoice.outcome.rewardFuel && (
                    <div className="bg-[#12121a] p-2 rounded-lg border border-amber-500/30 flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-amber-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Nhiên Liệu</span>
                        <span className="text-xs font-black text-amber-400">
                          +{resolvedChoice.outcome.rewardFuel}L Xăng
                        </span>
                      </div>
                    </div>
                  )}

                  {resolvedChoice.outcome.vehicleDurabilityDelta && (
                    <div className="bg-[#12121a] p-2 rounded-lg border border-cyan-500/30 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Độ Bền Xe</span>
                        <span
                          className={`text-xs font-black ${
                            resolvedChoice.outcome.vehicleDurabilityDelta > 0
                              ? 'text-cyan-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {resolvedChoice.outcome.vehicleDurabilityDelta > 0
                            ? `+${resolvedChoice.outcome.vehicleDurabilityDelta}%`
                            : `${resolvedChoice.outcome.vehicleDurabilityDelta}%`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ITEMS RECEIVED */}
                {resolvedChoice.outcome.rewardItems && resolvedChoice.outcome.rewardItems.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      VẬT PHẨM THU ĐƯỢC:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resolvedChoice.outcome.rewardItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0f0f15] border border-[#2d2d38] px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-white shadow-inner"
                        >
                          <span>{item.icon}</span>
                          <span>
                            {item.name} <span className="text-amber-400">x{item.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CONTINUE BUTTON */}
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl active:scale-98 transition"
              >
                <span>TIẾP TỤC HÀNH TRÌNH XA LỘ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
