import React, { useState, useEffect, useRef } from 'react';
import { Blueprint, CraftQueueItem, InventoryItem, ItemRarity } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Hammer,
  Sparkles,
  Zap,
  Flame,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ListOrdered,
  FastForward,
  Plus,
  X
} from 'lucide-react';

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
  const [craftQueue, setCraftQueue] = useState<CraftQueueItem[]>([]);
  const [completedList, setCompletedList] = useState<{ id: string; name: string; isCrit: boolean; rarity: ItemRarity; timestamp: string }[]>([]);

  // Simulation timer for craft queue
  useEffect(() => {
    if (craftQueue.length === 0) return;

    const interval = setInterval(() => {
      setCraftQueue((prevQueue) => {
        if (prevQueue.length === 0) return prevQueue;

        const current = prevQueue[0];
        const nextProgress = current.progressMs + 200;

        if (nextProgress >= current.durationMs) {
          // Finished this craft
          soundEngine.playCraftAnvil();
          if (current.isCrit) {
            soundEngine.playCritFanfare();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'],
            });
          }

          onCraft(current.blueprintId, current.resultQuantity, current.isCrit);

          setCompletedList((logs) => [
            {
              id: `${current.id}-${Date.now()}`,
              name: current.blueprintName,
              isCrit: current.isCrit,
              rarity: current.isCrit ? 'perfect' : current.blueprintRarity,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
            ...logs.slice(0, 7),
          ]);

          return prevQueue.slice(1);
        } else {
          return [
            {
              ...current,
              progressMs: nextProgress,
              status: 'crafting',
            },
            ...prevQueue.slice(1),
          ];
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, [craftQueue, onCraft]);

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

  // Calculate projected talent count after queue
  const projectedTalentCount = (talentCount + craftQueue.length) % 10;

  // Add recipe(s) to craft queue
  const handleAddToQueue = (count: number) => {
    if (!selectedBp || !checkCanCraft(selectedBp, count)) return;

    soundEngine.playClick();

    const newQueueItems: CraftQueueItem[] = [];
    let currentTalentTracker = (talentCount + craftQueue.length) % 10;

    for (let i = 0; i < count; i++) {
      currentTalentTracker = (currentTalentTracker + 1) % 10;
      const isSoulInfusion = currentTalentTracker === 0; // The 10th craft

      // Craft duration based on rarity (1.8s for common up to 4s for luxury/perfect)
      const baseDuration =
        selectedBp.rarity === 'common'
          ? 1800
          : selectedBp.rarity === 'good'
          ? 2400
          : selectedBp.rarity === 'superior'
          ? 3200
          : 4000;

      newQueueItems.push({
        id: `craft-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        blueprintId: selectedBp.id,
        blueprintName: selectedBp.name,
        blueprintRarity: selectedBp.rarity,
        resultQuantity: selectedBp.resultQuantity,
        durationMs: baseDuration,
        progressMs: 0,
        isCrit: isSoulInfusion,
        status: 'pending',
      });
    }

    setCraftQueue((prev) => [...prev, ...newQueueItems]);
  };

  const handleCancelQueueItem = (id: string) => {
    soundEngine.playClick();
    setCraftQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearEntireQueue = () => {
    soundEngine.playClick();
    setCraftQueue([]);
  };

  const handleSpeedUpCurrent = () => {
    if (craftQueue.length === 0) return;
    soundEngine.playCraftTick();
    setCraftQueue((prev) => {
      if (prev.length === 0) return prev;
      return [
        {
          ...prev[0],
          progressMs: prev[0].durationMs - 200,
        },
        ...prev.slice(1),
      ];
    });
  };

  const currentCrafting = craftQueue[0];
  const currentProgressPct = currentCrafting
    ? Math.min(100, Math.floor((currentCrafting.progressMs / currentCrafting.durationMs) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-3 md:p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border-2 border-[#2d2d30] rounded-xl w-full max-w-5xl h-[95vh] sm:h-[92vh] md:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Modal Header */}
        <div className="p-2.5 sm:p-3.5 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="p-1.5 sm:p-2 bg-[#ffcc00]/10 text-[#ffcc00] rounded-lg border border-[#ffcc00]/30 shrink-0">
              <Hammer className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide uppercase text-white truncate">
                  BÀN RÈN THẦN KỲ
                </h2>
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border ${RARITY_COLORS[workbenchLevel].border} ${RARITY_COLORS[workbenchLevel].bg} ${RARITY_COLORS[workbenchLevel].text} font-bold whitespace-nowrap`}>
                  CẤP: {RARITY_COLORS[workbenchLevel].label.toUpperCase()} ({workbenchExp}/100)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate hidden sm:block">
                Rèn trang bị, vũ khí, phụ tùng RV & hàng chờ chế tạo thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg border border-transparent hover:border-[#2d2d30] hover:bg-[#1a1a1d] transition text-xs sm:text-sm font-bold cursor-pointer shrink-0"
          >
            [✕]
          </button>
        </div>

        {/* 10 PHÁT NHẬP HỒN TALENT BANNER */}
        <div className="px-2.5 sm:px-4 py-2 bg-[#131315]/95 border-b border-[#2d2d30] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="p-1 bg-[#ff416c]/10 text-[#ff416c] border border-[#ff416c]/30 rounded shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] sm:text-xs font-bold text-[#ffcc00] flex items-center gap-1.5 tracking-wider uppercase">
                <span>10 PHÁT NHẬP HỒN</span>
                <span className="text-[8px] sm:text-[9px] bg-[#ff416c]/20 text-[#ff416c] px-1.5 py-0.2 rounded border border-[#ff416c]/40 font-bold whitespace-nowrap">
                  BẠO KÍCH PHẨM CHẤT
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">
                Lần rèn thứ 10 <strong className="text-[#ffcc00]">100% +1 bậc</strong> (30% +2 bậc, 5% Cực Phẩm!)
              </p>
            </div>
          </div>

          {/* Meter 1-10 */}
          <div className="flex items-center gap-1 bg-[#050506] px-2 sm:px-3 py-1 rounded border border-[#2d2d30] shrink-0">
            <div className="text-[10px] sm:text-xs font-bold text-[#ffcc00] mr-1">{talentCount}/10</div>
            {Array.from({ length: 10 }).map((_, idx) => {
              const isFilled = idx < talentCount;
              const isTenth = idx === 9;
              return (
                <div
                  key={idx}
                  className={`w-2.5 sm:w-3.5 h-4 sm:h-5 rounded-sm flex items-center justify-center transition-all ${
                    isFilled
                      ? isTenth
                        ? 'bg-gradient-to-t from-[#ff4b2b] to-[#ffcc00] shadow-md scale-105'
                        : 'bg-[#ffcc00]'
                      : 'bg-[#1a1a1d] border border-[#333336]'
                  }`}
                >
                  {isTenth && <Flame className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isFilled ? 'text-black' : 'text-gray-600'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CRAFTING QUEUE PROGRESS BAR */}
        {craftQueue.length > 0 && (
          <div className="px-2.5 sm:px-4 py-2 bg-gradient-to-r from-amber-950/40 via-[#131315] to-cyan-950/40 border-b border-amber-500/40 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Hammer className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
                <span className="font-bold text-white uppercase truncate">
                  ĐANG RÈN: {currentCrafting?.blueprintName}
                </span>
                {currentCrafting?.isCrit && (
                  <span className="text-[8px] sm:text-[9px] bg-gradient-to-r from-[#ff416c] to-[#ffcc00] text-black font-black px-1.5 py-0.5 rounded shadow animate-pulse shrink-0">
                    ✨ NHẬP HỒN!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400 shrink-0">
                <span>Hàng: <strong className="text-cyan-400">{craftQueue.length}</strong></span>
                <button
                  onClick={handleSpeedUpCurrent}
                  className="px-1.5 sm:px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded border border-amber-500/40 font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                  title="Tăng tốc độ rèn"
                >
                  <FastForward className="w-2.5 h-2.5" />
                  <span>TỐC ĐỘ</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1a1a1d] h-3 rounded-full overflow-hidden border border-[#333336] relative">
              <div
                className={`h-full transition-all duration-200 ${
                  currentCrafting?.isCrit
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${currentProgressPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white drop-shadow">
                {currentProgressPct}% ({((currentCrafting.durationMs - currentCrafting.progressMs) / 1000).toFixed(1)}s)
              </span>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* Left Column: Blueprint Directory */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[#2d2d30] flex flex-col bg-[#08080a] min-h-[160px] max-h-[38vh] md:max-h-full overflow-hidden">
            {/* Category Tabs */}
            <div className="flex border-b border-[#2d2d30] p-1.5 gap-1 overflow-x-auto no-scrollbar text-xs shrink-0">
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
                  className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-bold transition whitespace-nowrap border cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]/60 shadow-sm'
                      : 'text-gray-400 hover:text-white border-transparent hover:border-[#2d2d30]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5">
              {filteredBps.map((bp) => {
                const isSelected = selectedBp?.id === bp.id;
                const canCraft = checkCanCraft(bp);
                const rarityStyle = RARITY_COLORS[bp.rarity] || RARITY_COLORS.common;

                return (
                  <div
                    key={bp.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        soundEngine.playClick();
                        setSelectedBpId(bp.id);
                      }
                    }}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedBpId(bp.id);
                    }}
                    className={`w-full text-left p-2 rounded-lg border transition flex items-center justify-between cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#1a1a1d] border-[#00f2ff]/70 text-white shadow-sm'
                        : 'bg-[#131315]/80 border-[#2d2d30] hover:bg-[#1a1a1d] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-xs sm:text-sm shrink-0 ${rarityStyle.bg} border ${rarityStyle.border}`}>
                        {bp.category === 'weapon' ? '🗡️' : bp.category === 'vehicle' ? '⚙️' : bp.category === 'luxury' ? '✨' : '📜'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold flex items-center gap-1 truncate">
                          <span className="truncate">{bp.name}</span>
                          {!bp.learned && (
                            <span className="text-[8px] bg-red-950 text-red-400 px-1 py-0.2 rounded border border-red-800 shrink-0">
                              CHƯA HỌC
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-gray-400">
                          x{bp.resultQuantity} • {rarityStyle.label}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-1">
                      {bp.learned ? (
                        canCraft ? (
                          <span className="text-[9px] sm:text-[10px] bg-[#4cd137]/10 text-[#4cd137] px-1.5 py-0.5 rounded border border-[#4cd137]/40 font-bold">
                            ĐỦ ĐỒ
                          </span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] bg-[#1a1a1d] text-gray-500 px-1.5 py-0.5 rounded border border-[#333336]">
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
                          className="text-[9px] sm:text-[10px] bg-[#00f2ff] hover:bg-[#80f8ff] text-black font-bold px-2 py-0.5 rounded shadow cursor-pointer"
                        >
                          HỌC
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Blueprint Detail & Craft Queue Manager */}
          <div className="md:col-span-7 p-3 sm:p-4 md:p-5 flex flex-col justify-between overflow-y-auto bg-[#0c0c0e]">
            {selectedBp ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Header detail */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <span>{selectedBp.name}</span>
                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded ${RARITY_COLORS[selectedBp.rarity].bg} ${RARITY_COLORS[selectedBp.rarity].text} border ${RARITY_COLORS[selectedBp.rarity].border}`}>
                        {RARITY_COLORS[selectedBp.rarity].label.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed">{selectedBp.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase">SẢN LƯỢNG:</div>
                    <div className="text-sm sm:text-base font-bold text-[#ffcc00]">x{selectedBp.resultQuantity}</div>
                  </div>
                </div>

                {/* Ingredients Required */}
                <div className="bg-[#131315] p-2.5 sm:p-3.5 rounded-lg border border-[#2d2d30] space-y-2">
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#00f2ff] uppercase tracking-[0.15em]">
                    NGUYÊN LIỆU YÊU CẦU (X{craftMultiplier} LẦN):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {selectedBp.ingredients.map((ing) => {
                      const userItem = inventory.find((i) => i.id === ing.itemId);
                      const userQty = userItem ? userItem.quantity : 0;
                      const neededQty = ing.quantity * craftMultiplier;
                      const isEnough = userQty >= neededQty;

                      return (
                        <div
                          key={ing.itemId}
                          className={`p-1.5 sm:p-2 rounded border flex items-center justify-between ${
                            isEnough
                              ? 'bg-[#1a1a1d] border-[#333336]'
                              : 'bg-red-950/20 border-red-900/50'
                          }`}
                        >
                          <span className="text-[11px] sm:text-xs text-gray-200 font-medium truncate mr-1">{ing.itemId}</span>
                          <div className="text-[11px] sm:text-xs flex items-center gap-1 font-bold shrink-0">
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

                {/* Multiplier buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-400">SỐ LƯỢNG:</span>
                  {[1, 5, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        soundEngine.playClick();
                        setCraftMultiplier(num);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition border cursor-pointer ${
                        craftMultiplier === num
                          ? 'bg-[#1a1a1d] text-[#ffcc00] border-[#ffcc00]'
                          : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
                      }`}
                    >
                      x{num} {num === 9 ? '(TÍCH 9)' : num === 10 ? '(ĐỘT PHÁ)' : ''}
                    </button>
                  ))}
                </div>

                {/* Strategy hint from Tuyết Mộc story */}
                <div className="p-2 sm:p-2.5 bg-[#131315] border border-[#ffcc00]/30 rounded-lg text-[10px] sm:text-[11px] text-[#ffcc00]/90 flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#ffcc00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#ffcc00]">MẸO TUYẾT MỘC:</span> Rèn 9 món cơ bản trước để tích lũy lên 9/10, sau đó rèn trang bị quý ở lần thứ 10 để chắc chắn bạo kích thăng phẩm!
                  </div>
                </div>

                {/* QUEUE DETAILS */}
                {craftQueue.length > 1 && (
                  <div className="bg-[#131315] p-2.5 rounded-lg border border-[#2d2d30] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                      <span className="flex items-center gap-1">
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span>HÀNG CHỜ ({craftQueue.length - 1} MÓN)</span>
                      </span>
                      <button
                        onClick={handleClearEntireQueue}
                        className="text-[9px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>XÓA HÀNG</span>
                      </button>
                    </div>

                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {craftQueue.slice(1).map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-1 bg-[#18181b] rounded border border-[#2d2d30] text-[10px]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-gray-500 font-bold">#{idx + 2}</span>
                            <span className="font-medium text-white truncate">{item.blueprintName}</span>
                            {item.isCrit && (
                              <span className="text-[8px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-700 font-bold shrink-0">
                                ✨ NHẬP HỒN
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleCancelQueueItem(item.id)}
                            className="p-1 text-gray-500 hover:text-rose-400 cursor-pointer"
                            title="Hủy món này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent completed log */}
                {completedList.length > 0 && (
                  <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-[10px] sm:text-[11px] space-y-0.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VỪA RÈN XONG:</span>
                    </div>
                    <div className="text-gray-300 truncate">
                      {completedList[0].isCrit ? '💥 [BẠO KÍCH] ' : '✅ '}
                      <strong>{completedList[0].name}</strong> ({RARITY_COLORS[completedList[0].rarity]?.label.toUpperCase()}) lúc {completedList[0].timestamp}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 my-auto text-xs">Chọn một bản thiết kế để rèn</div>
            )}

            {/* Action Bottom */}
            <div className="pt-3 border-t border-[#2d2d30] flex flex-wrap items-center justify-between gap-2 mt-3">
              <div className="text-[11px] text-gray-400">
                THIÊN PHÚ: <span className="text-[#ffcc00] font-bold">{talentCount}/10</span>
              </div>

              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
                <button
                  disabled={!selectedBp || !checkCanCraft(selectedBp, 1)}
                  onClick={() => handleAddToQueue(1)}
                  className="px-2.5 sm:px-3 py-2 bg-[#131315] hover:bg-[#1a1a1d] disabled:opacity-40 text-gray-200 border border-[#2d2d30] rounded-lg font-bold text-[11px] sm:text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>X1</span>
                </button>

                <button
                  disabled={!selectedBp || !checkCanCraft(selectedBp, craftMultiplier)}
                  onClick={() => handleAddToQueue(craftMultiplier)}
                  className="px-3 sm:px-5 py-2 bg-gradient-to-r from-[#ff4b2b] to-[#ff416c] hover:opacity-90 disabled:opacity-40 text-white font-bold rounded-lg text-[11px] sm:text-xs border border-[#ff4b2b] shadow-lg transition flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>RÈN X{craftMultiplier}</span>
                  {craftMultiplier === 10 || talentCount + craftMultiplier >= 10 ? '✨' : ''}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
