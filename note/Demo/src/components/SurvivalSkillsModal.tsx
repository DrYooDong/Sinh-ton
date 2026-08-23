import React, { useState } from 'react';
import { PlayerStats, SurvivalSkillCategory, SurvivalSkillNode } from '../types';
import { SURVIVAL_SKILL_TREE } from '../game/skills';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Shield,
  Zap,
  Wrench,
  Crosshair,
  Compass,
  Award,
  Lock,
  CheckCircle2,
  RotateCcw,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SurvivalSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats;
  onUpgradeSkill: (skillId: string, cost: number) => void;
  onResetSkills: () => void;
}

export const SurvivalSkillsModal: React.FC<SurvivalSkillsModalProps> = ({
  isOpen,
  onClose,
  playerStats,
  onUpgradeSkill,
  onResetSkills,
}) => {
  const [activeCategory, setActiveCategory] = useState<SurvivalSkillCategory>('survival');
  const [selectedSkill, setSelectedSkill] = useState<SurvivalSkillNode>(SURVIVAL_SKILL_TREE[0]);

  if (!isOpen) return null;

  const unlockedSkills = playerStats.unlockedSkills || {};
  const courageBadges = playerStats.courageBadges || 0;

  // Calculate total spent badges
  let totalSpentBadges = 0;
  SURVIVAL_SKILL_TREE.forEach((node) => {
    const lvl = unlockedSkills[node.id] || 0;
    for (let i = 0; i < lvl; i++) {
      totalSpentBadges += node.costPerLevel[i] || 0;
    }
  });

  const categoryInfo: Record<
    SurvivalSkillCategory,
    { label: string; icon: React.ReactNode; color: string; border: string; bg: string }
  > = {
    survival: {
      label: 'Sinh Tồn Thể Chất',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
    },
    engineering: {
      label: 'Cơ Khí & Xe RV',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
    },
    combat: {
      label: 'Săn Bắn & Chiến Đấu',
      icon: <Crosshair className="w-4 h-4 text-rose-400" />,
      color: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
    },
    scavenging: {
      label: 'Trinh Sát & Thu Thập',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
    },
  };

  const currentCategorySkills = SURVIVAL_SKILL_TREE.filter(
    (skill) => skill.category === activeCategory
  );

  const handleUpgrade = (skill: SurvivalSkillNode) => {
    const currentLvl = unlockedSkills[skill.id] || 0;
    if (currentLvl >= skill.maxLevel) return;

    const cost = skill.costPerLevel[currentLvl];
    if (courageBadges < cost) return;

    // Check Parent Prerequisite
    if (skill.requiredParentId) {
      const parentLvl = unlockedSkills[skill.requiredParentId] || 0;
      if (parentLvl < (skill.requiredParentLevel || 1)) return;
    }

    soundEngine.playSkillUnlock();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onUpgradeSkill(skill.id, cost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0e0e12] border border-[#2d2d35] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-gray-200">
        {/* MODAL HEADER */}
        <div className="bg-[#14141a] border-b border-[#2d2d35] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/40 rounded-lg text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wider uppercase">
                  CÂY KỸ NĂNG SINH TỒN
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                  SURVIVAL TALENT TREE
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Tiêu hao Huy Hiệu Dũng Khí để mở khóa vĩnh viễn các hiệu ứng bị động cao cấp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* BADGES BALANCE */}
            <div className="bg-[#1a1a24] border border-amber-500/50 rounded-lg px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
              <Award className="w-4 h-4 text-amber-400 animate-bounce" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  HUY HIỆU DŨNG KHÍ
                </span>
                <span className="text-sm font-black text-amber-400 leading-none">
                  {courageBadges} <span className="text-xs text-gray-400">ĐIỂM</span>
                </span>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 hover:bg-[#252530] text-gray-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BRANCH TABS */}
        <div className="bg-[#111116] border-b border-[#2d2d35] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {(Object.keys(categoryInfo) as SurvivalSkillCategory[]).map((catKey) => {
              const cat = categoryInfo[catKey];
              const isSelected = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveCategory(catKey);
                    const firstSkill = SURVIVAL_SKILL_TREE.find((s) => s.category === catKey);
                    if (firstSkill) setSelectedSkill(firstSkill);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition border whitespace-nowrap ${
                    isSelected
                      ? `${cat.bg} ${cat.border} ${cat.color} shadow-lg`
                      : 'bg-[#181820] border-[#2d2d35] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* RESET SKILLS BUTTON */}
          {totalSpentBadges > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`Bạn có muốn tẩy toàn bộ kỹ năng và hoàn lại ${totalSpentBadges} Huy Hiệu Dũng Khí không?`)) {
                  soundEngine.playClick();
                  onResetSkills();
                }
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-gray-400 hover:text-rose-400 bg-[#181820] hover:bg-rose-500/10 border border-[#2d2d35] hover:border-rose-500/40 rounded flex items-center gap-1 transition"
              title="Hoàn trả 100% Huy hiệu đã dùng"
            >
              <RotateCcw className="w-3 h-3" />
              <span>TẨY ĐIỂM ({totalSpentBadges} ĐÃ DÙNG)</span>
            </button>
          )}
        </div>

        {/* MAIN BODY: 2-COLUMN VIEW (SKILL NODES & DETAIL PANEL) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* LEFT: SKILL NODES GRID (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>CÁC KỸ NĂNG NHÁNH {categoryInfo[activeCategory].label.toUpperCase()}</span>
              <span className="text-[10px] text-gray-500">NHẤP ĐỂ XEM CHI TIẾT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCategorySkills.map((skill) => {
                const lvl = unlockedSkills[skill.id] || 0;
                const isMax = lvl >= skill.maxLevel;
                const nextCost = !isMax ? skill.costPerLevel[lvl] : null;
                const isSelected = selectedSkill.id === skill.id;

                let isLocked = false;
                let lockReason = '';
                if (skill.requiredParentId) {
                  const parentLvl = unlockedSkills[skill.requiredParentId] || 0;
                  const reqLvl = skill.requiredParentLevel || 1;
                  if (parentLvl < reqLvl) {
                    isLocked = true;
                    const parentNode = SURVIVAL_SKILL_TREE.find((s) => s.id === skill.requiredParentId);
                    lockReason = `Cần ${parentNode?.name || 'Kỹ năng trước'} Cấp ${reqLvl}`;
                  }
                }

                const canAfford = nextCost !== null && courageBadges >= nextCost && !isLocked;

                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedSkill(skill);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#1e1e28] border-amber-500/80 shadow-xl ring-1 ring-amber-500/40'
                        : isLocked
                        ? 'bg-[#121216] border-[#23232a] opacity-60'
                        : lvl > 0
                        ? 'bg-[#15151c] border-emerald-500/30 hover:border-emerald-500/60'
                        : 'bg-[#14141a] border-[#2d2d35] hover:border-gray-500'
                    }`}
                  >
                    {/* TOP NODE INFO */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border shadow-inner ${
                            lvl > 0
                              ? 'bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border-amber-500/40 text-amber-300'
                              : isLocked
                              ? 'bg-gray-800/40 border-gray-700 text-gray-500'
                              : 'bg-[#1c1c24] border-[#33333e] text-gray-300'
                          }`}
                        >
                          {isLocked ? <Lock className="w-4 h-4 text-gray-500" /> : skill.icon}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white leading-tight flex items-center gap-1.5">
                            <span>{skill.name}</span>
                            {lvl >= skill.maxLevel && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Cấp độ:{' '}
                            <span
                              className={`font-black ${
                                lvl > 0 ? 'text-amber-400' : 'text-gray-500'
                              }`}
                            >
                              {lvl}/{skill.maxLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* LEVEL INDICATOR DOTS */}
                      <div className="flex gap-1">
                        {Array.from({ length: skill.maxLevel }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-3 rounded-sm ${
                              idx < lvl
                                ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* BRIEF EFFECT */}
                    <div className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed bg-[#0d0d12] p-2 rounded border border-[#23232a]">
                      {lvl > 0 ? skill.effectDescription(lvl) : skill.effectDescription(1)}
                    </div>

                    {/* LOCK OR COST FOOTER */}
                    {isLocked ? (
                      <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>{lockReason}</span>
                      </div>
                    ) : isMax ? (
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ĐÃ ĐẠT CẤP ĐỘ TỐI ĐA</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Nâng cấp:</span>
                        <span
                          className={`font-black ${
                            canAfford ? 'text-amber-400' : 'text-rose-400'
                          }`}
                        >
                          {nextCost} HUY HIỆU
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SELECTED SKILL DETAIL PANEL (5 cols) */}
          <div className="md:col-span-5 bg-[#14141c] border border-[#2d2d35] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-4">
              {/* SKILL HEADER */}
              <div className="flex items-center gap-3 border-b border-[#282832] pb-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg">
                  {selectedSkill.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{selectedSkill.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-[#22222c] px-2 py-0.5 rounded text-gray-400 border border-[#333340]">
                      {categoryInfo[selectedSkill.category].label}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      Cấp {unlockedSkills[selectedSkill.id] || 0}/{selectedSkill.maxLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* LORE DESCRIPTION */}
              <div className="text-xs text-gray-300 leading-relaxed italic bg-[#0c0c10] p-3 rounded-lg border border-[#23232c]">
                "{selectedSkill.description}"
              </div>

              {/* CURRENT & NEXT EFFECT COMPARISON */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  HIỆU QUẢ KỸ NĂNG:
                </span>

                {/* Current level */}
                <div className="bg-[#181822] p-3 rounded-lg border border-[#2d2d38] flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-bold">HIỆN TẠI:</span>
                    <span className="text-amber-400 font-black">
                      CẤP {unlockedSkills[selectedSkill.id] || 0}
                    </span>
                  </div>
                  <div className="text-xs text-gray-200">
                    {(unlockedSkills[selectedSkill.id] || 0) > 0
                      ? selectedSkill.effectDescription(unlockedSkills[selectedSkill.id] || 0)
                      : 'Chưa mở khóa (0% hiệu quả bị động)'}
                  </div>
                </div>

                {/* Next level */}
                {(unlockedSkills[selectedSkill.id] || 0) < selectedSkill.maxLevel && (
                  <div className="bg-[#181822] p-3 rounded-lg border border-amber-500/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> CẤP KẾ TIẾP:
                      </span>
                      <span className="text-emerald-400 font-black">
                        CẤP {(unlockedSkills[selectedSkill.id] || 0) + 1}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-300">
                      {selectedSkill.effectDescription((unlockedSkills[selectedSkill.id] || 0) + 1)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* UPGRADE ACTION BUTTON */}
            <div className="pt-4 border-t border-[#282832] flex flex-col gap-2">
              {(() => {
                const currentLvl = unlockedSkills[selectedSkill.id] || 0;
                const isMax = currentLvl >= selectedSkill.maxLevel;
                const nextCost = !isMax ? selectedSkill.costPerLevel[currentLvl] : null;

                let isLocked = false;
                let lockMsg = '';
                if (selectedSkill.requiredParentId) {
                  const parentLvl = unlockedSkills[selectedSkill.requiredParentId] || 0;
                  const reqLvl = selectedSkill.requiredParentLevel || 1;
                  if (parentLvl < reqLvl) {
                    isLocked = true;
                    const parentNode = SURVIVAL_SKILL_TREE.find(
                      (s) => s.id === selectedSkill.requiredParentId
                    );
                    lockMsg = `Cần ${parentNode?.name || 'Kỹ năng trước'} đạt Cấp ${reqLvl} để mở khóa!`;
                  }
                }

                if (isMax) {
                  return (
                    <button
                      disabled
                      className="w-full py-3 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-not-allowed uppercase"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ĐÃ ĐẠT CẤP ĐỘ CAO NHẤT</span>
                    </button>
                  );
                }

                if (isLocked) {
                  return (
                    <div className="w-full py-3 bg-rose-950/20 border border-rose-500/40 text-rose-400 font-bold rounded-lg text-xs flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>{lockMsg}</span>
                    </div>
                  );
                }

                const canAfford = nextCost !== null && courageBadges >= nextCost;

                return (
                  <button
                    onClick={() => handleUpgrade(selectedSkill)}
                    disabled={!canAfford}
                    className={`w-full py-3 font-black rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-xl uppercase tracking-wider ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border border-amber-300 active:scale-98 cursor-pointer'
                        : 'bg-[#22222b] border-[#33333f] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      {canAfford
                        ? `MỞ KHÓA / NÂNG CẤP (${nextCost} HUY HIỆU)`
                        : `THIẾU HUY HIỆU (CẦN ${nextCost} - CÓ ${courageBadges})`}
                    </span>
                  </button>
                );
              })()}

              <div className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                <span>Huy Hiệu Dũng Khí nhận được khi diệt quái, mở rương và hoàn thành biến cố xa lộ.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
