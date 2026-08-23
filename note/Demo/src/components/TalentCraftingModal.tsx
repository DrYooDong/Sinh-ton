import React, { useState } from 'react';
import { Blueprint, InventoryItem, ItemRarity } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Hammer, Sparkles, Zap, Flame, Shield, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface TalentCraftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprints: Blueprint[];
  inventory: InventoryItem[];
  talentCount: number; // 0 to 10
  workbenchLevel: ItemRarity;
  workbenchExp: number;
  onCraft: (blueprintId: string, quantity: number, isSoulInfusion: boolean) => void;
  onLearnBlueprint: (blueprintId: string) => void;
}

export const TalentCraftingModal: React.FC<TalentCraftingModalProps> = ({
  isOpen,
  onClose,
  blueprints,
  inventory,
  talentCount,
  workbenchLevel,
  workbenchExp,
  onCraft,
  onLearnBlueprint,
}) => {
  const [selectedBpId, setSelectedBpId] = useState<string>(blueprints[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [craftMultiplier, setCraftMultiplier] = useState<number>(1);
  const [lastCraftResult, setLastCraftResult] = useState<{ name: string; rarity: ItemRarity; isCrit: boolean } | null>(null);

  if (!isOpen) return null;

  const selectedBp = blueprints.find((b) => b.id === selectedBpId) || blueprints[0];

  // Helper to check if player has enough materials
  const checkCanCraft = (bp: Blueprint, count: number = 1) => {
    if (!bp.learned) return false;
    for (const ing of bp.ingredients) {
      const item = inventory.find((i) => i.id === ing.itemId);
      if (!item || item.quantity < ing.quantity * count) {
        return false;
      }
    }
    return true;
  };

  const filteredBps = blueprints.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const handleExecuteCraft = (count: number) => {
    if (!selectedBp || !checkCanCraft(selectedBp, count)) return;

    soundEngine.playCraftAnvil();

    // Check if any craft in this batch triggers 10th soul infusion
    let isCrit = false;
    const nextTalent = (talentCount + count) % 10;
    if (talentCount + count >= 10 || count === 10) {
      isCrit = true;
      soundEngine.playCritFanfare();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'],
      });
    }

    onCraft(selectedBp.id, count, isCrit);

    setLastCraftResult({
      name: selectedBp.name,
      rarity: isCrit ? 'perfect' : selectedBp.rarity,
      isCrit,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffcc00]/10 text-[#ffcc00] rounded border border-[#ffcc00]/30">
              <Hammer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 tracking-wide uppercase">
                BÀN RÈN THẦN KỲ
                <span className={`text-[10px] px-2 py-0.5 rounded border ${RARITY_COLORS[workbenchLevel].border} ${RARITY_COLORS[workbenchLevel].bg} ${RARITY_COLORS[workbenchLevel].text}`}>
                  CẤP: {RARITY_COLORS[workbenchLevel].label.toUpperCase()} ({workbenchExp}/100 EXP)
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Rèn trang bị, vũ khí, linh kiện RV & kích hoạt thiên phú</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded border border-transparent hover:border-[#2d2d30] hover:bg-[#1a1a1d] transition text-sm font-bold"
          >
            [✕]
          </button>
        </div>

        {/* 10 PHÁT NHẬP HỒN TALENT BANNER */}
        <div className="px-5 py-2.5 bg-[#131315]/90 border-b border-[#2d2d30] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#ff416c]/10 text-[#ff416c] border border-[#ff416c]/30 rounded">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#ffcc00] flex items-center gap-1.5 tracking-wider uppercase">
                THIÊN PHÚ: 10 PHÁT NHẬP HỒN
                <span className="text-[9px] bg-[#ff416c]/20 text-[#ff416c] px-1.5 py-0.5 rounded border border-[#ff416c]/40 font-bold">
                  BẠO KÍCH PHẨM CHẤT
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Lần rèn thứ 10 <span className="text-[#ffcc00] font-bold">100% +1 bậc phẩm chất</span> (30% +2 bậc, 5% cực phẩm Rực Rỡ!)
              </p>
            </div>
          </div>

          {/* Meter 1-10 */}
          <div className="flex items-center gap-1.5 bg-[#050506] px-3 py-1.5 rounded border border-[#2d2d30]">
            <div className="text-xs font-bold text-[#ffcc00] mr-1">{talentCount}/10</div>
            {Array.from({ length: 10 }).map((_, idx) => {
              const isFilled = idx < talentCount;
              const isTenth = idx === 9;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-5 rounded-sm flex items-center justify-center transition-all ${
                    isFilled
                      ? isTenth
                        ? 'bg-gradient-to-t from-[#ff4b2b] to-[#ffcc00] shadow-md scale-110'
                        : 'bg-[#ffcc00]'
                      : 'bg-[#1a1a1d] border border-[#333336]'
                  }`}
                >
                  {isTenth && <Flame className={`w-2.5 h-2.5 ${isFilled ? 'text-black' : 'text-gray-600'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Blueprint Directory */}
          <div className="md:col-span-5 border-r border-[#2d2d30] flex flex-col bg-[#08080a] overflow-hidden">
            {/* Category Tabs */}
            <div className="flex border-b border-[#2d2d30] p-2 gap-1 overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'basic', label: 'CƠ BẢN' },
                { id: 'weapon', label: 'VŨ KHÍ' },
                { id: 'vehicle', label: 'PHỤ TÙNG' },
                { id: 'survival', label: 'SINH TỒN' },
                { id: 'luxury', label: 'CAO CẤP' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveCategory(tab.id);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition whitespace-nowrap border ${
                    activeCategory === tab.id
                      ? 'bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]/60'
                      : 'text-gray-400 hover:text-white border-transparent hover:border-[#2d2d30]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredBps.map((bp) => {
                const isSelected = selectedBp?.id === bp.id;
                const canCraft = checkCanCraft(bp);
                const rarityStyle = RARITY_COLORS[bp.rarity] || RARITY_COLORS.common;

                return (
                  <button
                    key={bp.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedBpId(bp.id);
                    }}
                    className={`w-full text-left p-2.5 rounded border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1a1a1d] border-[#00f2ff]/70 text-white'
                        : 'bg-[#131315]/80 border-[#2d2d30] hover:bg-[#1a1a1d] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded flex items-center justify-center text-sm ${rarityStyle.bg} border ${rarityStyle.border}`}>
                        {bp.category === 'weapon' ? '🗡️' : bp.category === 'vehicle' ? '⚙️' : bp.category === 'luxury' ? '✨' : '📜'}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          {bp.name}
                          {!bp.learned && (
                            <span className="text-[9px] bg-red-950 text-red-400 px-1 py-0.2 rounded border border-red-800">
                              CHƯA HỌC
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          x{bp.resultQuantity} • {rarityStyle.label}
                        </div>
                      </div>
                    </div>

                    <div>
                      {bp.learned ? (
                        canCraft ? (
                          <span className="text-[10px] bg-[#4cd137]/10 text-[#4cd137] px-2 py-0.5 rounded border border-[#4cd137]/40 font-bold">
                            ĐỦ ĐỒ
                          </span>
                        ) : (
                          <span className="text-[10px] bg-[#1a1a1d] text-gray-500 px-2 py-0.5 rounded border border-[#333336]">
                            THIẾU
                          </span>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            onLearnBlueprint(bp.id);
                          }}
                          className="text-[10px] bg-[#00f2ff] hover:bg-[#80f8ff] text-black font-bold px-2 py-0.5 rounded shadow"
                        >
                          HỌC
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Blueprint Detail & Craft Station */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between overflow-y-auto bg-[#0c0c0e]">
            {selectedBp ? (
              <div className="space-y-4">
                {/* Header detail */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                      {selectedBp.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded ${RARITY_COLORS[selectedBp.rarity].bg} ${RARITY_COLORS[selectedBp.rarity].text} border ${RARITY_COLORS[selectedBp.rarity].border}`}>
                        {RARITY_COLORS[selectedBp.rarity].label.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{selectedBp.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase">SẢN LƯỢNG:</div>
                    <div className="text-base font-bold text-[#ffcc00]">x{selectedBp.resultQuantity}</div>
                  </div>
                </div>

                {/* Ingredients Required */}
                <div className="bg-[#131315] p-3.5 rounded border border-[#2d2d30] space-y-2.5">
                  <div className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-[0.15em]">
                    NGUYÊN LIỆU YÊU CẦU (X{craftMultiplier} LẦN RÈN):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBp.ingredients.map((ing) => {
                      const userItem = inventory.find((i) => i.id === ing.itemId);
                      const userQty = userItem ? userItem.quantity : 0;
                      const neededQty = ing.quantity * craftMultiplier;
                      const isEnough = userQty >= neededQty;

                      return (
                        <div
                          key={ing.itemId}
                          className={`p-2 rounded border flex items-center justify-between ${
                            isEnough
                              ? 'bg-[#1a1a1d] border-[#333336]'
                              : 'bg-red-950/20 border-red-900/50'
                          }`}
                        >
                          <span className="text-xs text-gray-200 font-medium">{ing.itemId}</span>
                          <div className="text-xs flex items-center gap-1 font-bold">
                            <span className={isEnough ? 'text-[#4cd137]' : 'text-[#ff4b2b]'}>
                              {userQty}
                            </span>
                            <span className="text-gray-500">/ {neededQty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Multiplier / Strategy buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">SỐ LƯỢNG:</span>
                  {[1, 5, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        soundEngine.playClick();
                        setCraftMultiplier(num);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition border ${
                        craftMultiplier === num
                          ? 'bg-[#1a1a1d] text-[#ffcc00] border-[#ffcc00]'
                          : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
                      }`}
                    >
                      x{num} {num === 9 ? '(TÍCH LẦN)' : num === 10 ? '(ĐỘT PHÁ!)' : ''}
                    </button>
                  ))}
                </div>

                {/* Strategy hint from Tuyết Mộc story */}
                <div className="p-3 bg-[#131315] border border-[#ffcc00]/30 rounded text-xs text-[#ffcc00]/90 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-[#ffcc00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#ffcc00]">BÍ KÍP TUYẾT MỘC:</span> Rèn 9 cuộn Giấy Vệ Sinh trước để tích số lần, sau đó rèn trang bị quý (Súng, Đao Đường, Điều Hòa, Bồn Nước) ở lần thứ 10 để chắc chắn bạo kích thăng phẩm chất!
                  </div>
                </div>

                {/* Last Craft notification if any */}
                {lastCraftResult && (
                  <div className={`p-3 rounded border flex items-center gap-2 ${
                    lastCraftResult.isCrit
                      ? 'bg-rose-950/30 border-[#ff416c] text-[#ff416c] animate-pulse'
                      : 'bg-emerald-950/30 border-[#4cd137] text-[#4cd137]'
                  }`}>
                    <Sparkles className="w-4 h-4 text-[#ffcc00]" />
                    <div className="text-xs font-bold">
                      {lastCraftResult.isCrit ? '💥 THIÊN PHÚ NHẬP HỒN BẠO KÍCH! ' : '✅ '}
                      RÈN THÀNH CÔNG: {lastCraftResult.name.toUpperCase()} ({RARITY_COLORS[lastCraftResult.rarity].label.toUpperCase()})
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 my-auto">Chọn một bản thiết kế để rèn</div>
            )}

            {/* Action Bottom */}
            <div className="pt-4 border-t border-[#2d2d30] flex items-center justify-between gap-3">
              <div className="text-xs text-gray-400">
                THIÊN PHÚ: <span className="text-[#ffcc00] font-bold">{talentCount}/10</span>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!selectedBp || !checkCanCraft(selectedBp, 1)}
                  onClick={() => handleExecuteCraft(1)}
                  className="px-4 py-2 bg-[#131315] hover:bg-[#1a1a1d] disabled:opacity-40 text-gray-200 border border-[#2d2d30] rounded font-bold text-xs transition"
                >
                  RÈN X1
                </button>

                <button
                  disabled={!selectedBp || !checkCanCraft(selectedBp, craftMultiplier)}
                  onClick={() => handleExecuteCraft(craftMultiplier)}
                  className="px-5 py-2 bg-gradient-to-r from-[#ff4b2b] to-[#ff416c] hover:opacity-90 disabled:opacity-40 text-white font-bold rounded text-xs border border-[#ff4b2b] shadow-lg transition flex items-center gap-2 uppercase tracking-wider"
                >
                  <Hammer className="w-4 h-4" />
                  RÈN X{craftMultiplier} {craftMultiplier === 10 || talentCount + craftMultiplier >= 10 ? '✨ NHẬP HỒN!' : ''}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
