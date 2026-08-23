import React, { useState } from 'react';
import { InventoryItem, ItemRarity, PetStats, PlayerStats } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { PET_ABILITIES, getFoodFeedBonus } from '../game/petAbilities';
import {
  Package,
  Shield,
  Swords,
  Sparkles,
  Heart,
  Flame,
  Dog,
  Check,
  Droplets,
  Zap,
  Award,
  Smile,
  PlusCircle,
  Lock,
} from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  playerStats: PlayerStats;
  petStats: PetStats;
  onEquipWeapon: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  onFeedPet: (itemId: string) => void;
  onHatchPetEgg: () => void;
  onLearnBlueprint?: (bpId: string) => void;
  onPetPraise?: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  playerStats,
  petStats,
  onEquipWeapon,
  onUseItem,
  onFeedPet,
  onHatchPetEgg,
  onLearnBlueprint,
  onPetPraise,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'pet'>('inventory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = inventory.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const selectedItem = inventory.find((i) => i.id === selectedItemId) || filteredItems[0];

  // List of edible food items for the Pet
  const petFoodItems = inventory.filter(
    (item) => item.category === 'consumable' || item.name.toLowerCase().includes('thịt') || item.name.toLowerCase().includes('bánh')
  );

  const expPct = Math.min(100, Math.max(0, ((petStats.exp || 0) / (petStats.maxExp || 100)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-3 md:p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border-2 border-[#2d2d30] rounded-xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Header */}
        <div className="p-2.5 sm:p-3.5 bg-[#131315] border-b border-[#2d2d30] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1.5 sm:p-2 bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/30 rounded-lg shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-white truncate">
                    NHẪN TRỮ VẬT
                  </h2>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border border-[#ffcc00]/60 bg-[#ffcc00]/10 text-[#ffcc00] font-bold whitespace-nowrap">
                    10x10x10M
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 truncate hidden sm:block">
                  Không gian trữ đồ vô hạn, quản lý trang bị và thú cưng
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="sm:hidden p-1.5 text-gray-400 hover:text-white rounded-lg border border-transparent hover:border-[#2d2d30] text-xs font-bold shrink-0"
            >
              [✕]
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto no-scrollbar">
            <div className="flex bg-[#08080a] p-0.5 sm:p-1 rounded-lg border border-[#2d2d30] text-[10px] sm:text-xs shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('inventory');
                }}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-[#1a1a1d] text-[#00f2ff] border border-[#00f2ff]/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>TÚI ĐỒ ({inventory.length})</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('pet');
                }}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'pet'
                    ? 'bg-[#1a1a1d] text-[#ffcc00] border border-[#ffcc00]/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Dog className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ffcc00]" />
                <span>THÚ CƯNG {petStats.unlocked ? `(LV.${petStats.level})` : '(TRỨNG)'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="hidden sm:block p-1.5 text-gray-400 hover:text-white rounded-lg border border-transparent hover:border-[#2d2d30] hover:bg-[#1a1a1d] transition text-xs sm:text-sm font-bold cursor-pointer shrink-0"
            >
              [✕]
            </button>
          </div>
        </div>

        {/* Tab 1: INVENTORY GRID */}
        {activeTab === 'inventory' ? (
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-y-auto md:overflow-hidden min-h-0">
            
            {/* Left side category + items grid */}
            <div className="md:col-span-7 lg:col-span-8 border-b md:border-b-0 md:border-r border-[#2d2d30] flex flex-col bg-[#08080a] flex-1 md:overflow-hidden min-h-[300px] md:min-h-0">
              {/* Filter Tabs */}
              <div className="flex border-b border-[#2d2d30] p-1.5 sm:p-2 gap-1 overflow-x-auto no-scrollbar text-xs shrink-0 bg-[#0c0c0e]">
                {[
                  { id: 'all', label: 'TẤT CẢ' },
                  { id: 'material', label: 'NGUYÊN LIỆU' },
                  { id: 'consumable', label: 'ẨM THỰC' },
                  { id: 'weapon', label: 'VŨ KHÍ' },
                  { id: 'blueprint', label: 'BẢN THIẾT KẾ' },
                  { id: 'special', label: 'ĐẶC BIỆT' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold transition whitespace-nowrap border cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]/60 shadow-sm'
                        : 'text-gray-400 hover:text-white border-transparent hover:border-[#2d2d30]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="flex-1 p-2 sm:p-3 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 auto-rows-max">
                {filteredItems.map((item) => {
                  const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                  const isSelected = selectedItem?.id === item.id;
                  const isEquipped = playerStats.equippedWeaponId === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedItemId(item.id);
                      }}
                      className={`relative p-1.5 sm:p-2 rounded-lg border flex flex-col items-center justify-between text-center transition min-h-[78px] sm:min-h-[85px] cursor-pointer ${
                        isSelected
                          ? 'border-[#00f2ff] bg-[#1a1a1d] shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                          : 'border-[#2d2d30] bg-[#131315] hover:border-[#444448]'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl mb-0.5">{item.icon}</div>
                      <div className="text-[9px] sm:text-[10px] font-bold truncate w-full text-gray-200">{item.name}</div>
                      <div className="text-[8px] sm:text-[9px] text-gray-400 font-mono">x{item.quantity}</div>

                      {isEquipped && (
                        <span className="absolute top-1 right-1 text-[7px] sm:text-[8px] bg-[#4cd137] text-black px-1 rounded font-black">
                          ĐEO
                        </span>
                      )}

                      <div
                        className={`absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${rarityStyle.bg} border ${rarityStyle.border}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side item details panel */}
            <div className="md:col-span-5 lg:col-span-4 p-3 sm:p-4 bg-[#0c0c0e] flex flex-col justify-between overflow-y-auto border-t md:border-t-0 border-[#2d2d30] shrink-0">
              {selectedItem ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl bg-[#1a1a1d] border border-[#2d2d30] flex items-center justify-center text-2xl sm:text-3xl mb-2 sm:mb-3 shadow-inner">
                      {selectedItem.icon}
                    </div>

                    <div className="text-center">
                      <h3 className="text-xs sm:text-sm font-bold text-white">{selectedItem.name}</h3>
                      <span
                        className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded border inline-block mt-1 ${
                          RARITY_COLORS[selectedItem.rarity]?.bg
                        } ${RARITY_COLORS[selectedItem.rarity]?.text} ${
                          RARITY_COLORS[selectedItem.rarity]?.border
                        }`}
                      >
                        {RARITY_COLORS[selectedItem.rarity]?.label.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-400 bg-[#131315] p-2.5 sm:p-3 rounded-lg border border-[#222225] leading-relaxed">
                    {selectedItem.description}
                  </p>

                  {/* Actions */}
                  <div className="space-y-1.5 sm:space-y-2 pt-1">
                    {selectedItem.category === 'weapon' && (
                      <button
                        onClick={() => {
                          soundEngine.playEquip();
                          onEquipWeapon(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#00f2ff] hover:bg-[#33f5ff] text-black font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>{playerStats.equippedWeaponId === selectedItem.id ? 'ĐANG TRANG BỊ' : 'TRANG BỊ VŨ KHÍ'}</span>
                      </button>
                    )}

                    {selectedItem.category === 'consumable' && (
                      <button
                        onClick={() => {
                          soundEngine.playDrinkHeal();
                          onUseItem(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#4cd137] hover:bg-[#68e055] text-black font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>SỬ DỤNG VẬT PHẨM</span>
                      </button>
                    )}

                    {selectedItem.category === 'blueprint' && onLearnBlueprint && (
                      <button
                        onClick={() => {
                          soundEngine.playCritFanfare();
                          onLearnBlueprint(selectedItem.blueprintId || selectedItem.id.replace('blueprint_', ''));
                        }}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>LĨNH HỘI BẢN THIẾT KẾ</span>
                      </button>
                    )}

                    {petStats.unlocked && (selectedItem.category === 'consumable' || selectedItem.name.includes('Thịt')) && (
                      <button
                        onClick={() => {
                          soundEngine.playDogBark();
                          onFeedPet(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer shadow"
                      >
                        <Dog className="w-3.5 h-3.5" />
                        <span>CHO CHÓ VÀNG ĂN (+EXP)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 my-auto text-xs py-4">Chọn một vật phẩm để xem chi tiết</div>
              )}
            </div>

          </div>
        ) : (
          /* Tab 2: PET SYSTEM (CHÓ VÀNG TRUNG HOA - LEVELING & ABILITIES) */
          <div className="p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-[#09090b] flex-1">
            {petStats.unlocked ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                
                {/* Left Card: Pet Identity & EXP Leveling */}
                <div className="lg:col-span-5 p-3 sm:p-4 bg-[#121216] rounded-xl border border-amber-500/40 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3">
                    <div className="relative">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                        🐕
                      </div>
                      <span className="absolute bottom-0 right-0 px-1.5 py-0.2 bg-amber-500 text-black text-[9px] sm:text-[10px] font-bold rounded-full border border-black shadow">
                        LV.{petStats.level}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#ffcc00] flex items-center justify-center gap-1.5 uppercase tracking-wide">
                        <span>{petStats.name}</span>
                        <span className="text-[8px] sm:text-[9px] bg-[#ff416c]/20 text-[#ff416c] px-1.5 py-0.5 rounded border border-[#ff416c]/40 font-bold">
                          CHIẾN ĐẤU
                        </span>
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                        Chiến khuyển trung thành. Cho ăn để tăng cấp và mở khóa thiên phú!
                      </p>
                    </div>

                    {/* EXP Progress Bar */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-amber-300">
                        <span>KINH NGHIỆM (EXP)</span>
                        <span>
                          {petStats.exp || 0} / {petStats.maxExp || 100} ({Math.round(expPct)}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#08080a] border border-[#333336] rounded-sm overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-sm"
                          style={{ width: `${expPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Core Attributes Grid */}
                  <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                    <div className="p-1.5 sm:p-2 bg-[#08080a] border border-[#2d2d30] rounded-lg">
                      <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase">MÁU (HP):</div>
                      <div className="font-bold text-[11px] sm:text-xs text-[#ff416c]">{petStats.hp} / {petStats.maxHp} HP</div>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-[#08080a] border border-[#2d2d30] rounded-lg">
                      <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase">SÁT THƯƠNG:</div>
                      <div className="font-bold text-[11px] sm:text-xs text-amber-400">{petStats.attackPower} DMG</div>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-[#08080a] border border-[#2d2d30] rounded-lg">
                      <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase">CẢNH GIÁC:</div>
                      <div className="font-bold text-[11px] sm:text-xs text-[#00f2ff]">{petStats.alertness}M RADAR</div>
                    </div>
                    <div className="p-1.5 sm:p-2 bg-[#08080a] border border-[#2d2d30] rounded-lg">
                      <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase">NO BỤNG:</div>
                      <div className="font-bold text-[11px] sm:text-xs text-[#4cd137]">{petStats.hunger}%</div>
                    </div>
                  </div>

                  {/* Pet Praise / Interact button */}
                  <button
                    onClick={() => {
                      soundEngine.playDogBark();
                      if (onPetPraise) onPetPraise();
                    }}
                    className="w-full py-1.5 sm:py-2 bg-[#1a1a1d] hover:bg-[#252529] text-amber-300 hover:text-white rounded-lg border border-amber-500/40 text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5 text-amber-400" />
                    <span>VUỐT VE & ĐỘNG VIÊN (+TINH THẦN)</span>
                  </button>
                </div>

                {/* Right Side: Quick Feed & Abilities Tree */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  
                  {/* Quick Feeding Hub */}
                  <div className="p-3 sm:p-4 bg-[#121216] rounded-xl border border-[#2d2d30] space-y-2">
                    <h4 className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" /> CHO CHÓ CƯNG ĂN
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 font-normal">
                        ({petFoodItems.length} loại thức ăn)
                      </span>
                    </h4>

                    {petFoodItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-32 sm:max-h-36 overflow-y-auto pr-1">
                        {petFoodItems.map((food) => {
                          const bonus = getFoodFeedBonus(food.id, food.name);
                          return (
                            <div
                              key={food.id}
                              className="p-1.5 sm:p-2 bg-[#08080a] rounded-lg border border-[#26262b] flex items-center justify-between gap-1.5 hover:border-amber-500/40 transition"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-base sm:text-lg">{food.icon}</span>
                                <div className="truncate text-left">
                                  <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">{food.name} (x{food.quantity})</div>
                                  <div className="text-[8px] sm:text-[9px] text-amber-300">+{bonus.exp} EXP • +{bonus.hp} HP</div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  soundEngine.playDogBark();
                                  onFeedPet(food.id);
                                }}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[9px] sm:text-[10px] transition shrink-0 uppercase cursor-pointer"
                              >
                                CHO ĂN
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 sm:p-3 text-center text-gray-500 text-[10px] sm:text-xs bg-[#08080a] rounded-lg border border-dashed border-[#222225]">
                        Không có thức ăn hoặc thịt trong túi đồ. Hãy tìm rương tài nguyên hoặc săn dã thú!
                      </div>
                    )}
                  </div>

                  {/* Companion Pet Abilities Tree */}
                  <div className="p-3 sm:p-4 bg-[#121216] rounded-xl border border-[#2d2d30] space-y-2">
                    <h4 className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> CÂY THIÊN PHÚ & KỸ NĂNG
                    </h4>

                    <div className="space-y-1.5 sm:space-y-2 max-h-44 sm:max-h-52 overflow-y-auto pr-1">
                      {PET_ABILITIES.map((ab) => {
                        const isUnlocked = (petStats.level || 1) >= ab.minLevel;

                        return (
                          <div
                            key={ab.id}
                            className={`p-2 sm:p-2.5 rounded-lg border transition flex items-start gap-2.5 ${
                              isUnlocked
                                ? 'bg-[#08080a] border-amber-500/30 text-gray-200'
                                : 'bg-[#08080a]/60 border-[#222225] opacity-50'
                            }`}
                          >
                            <span className="text-lg p-1 bg-[#131315] rounded border border-[#2d2d30] shrink-0">
                              {ab.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs gap-1">
                                <span className={`font-bold text-[11px] sm:text-xs truncate ${isUnlocked ? 'text-amber-300' : 'text-gray-400'}`}>
                                  {ab.name}
                                </span>
                                <span
                                  className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                    isUnlocked
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                                  }`}
                                >
                                  {isUnlocked ? 'KÍCH HOẠT' : `LV.${ab.minLevel}`}
                                </span>
                              </div>
                              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 leading-relaxed">{ab.description}</p>
                              <div className="text-[9px] sm:text-[10px] text-[#00f2ff] font-bold mt-0.5">
                                ✨ Hiệu quả: {ab.effectValue}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* Egg Hatching Screen */
              <div className="text-center p-5 sm:p-8 bg-[#131315] rounded-xl border border-[#2d2d30] space-y-3 sm:space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#c084fc]/10 border border-[#c084fc]/50 flex items-center justify-center text-3xl sm:text-4xl animate-bounce">
                  🥚
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#c084fc] uppercase tracking-wide">TRỨNG THÚ CƯNG CHIẾN ĐẤU</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                    Thu được từ rương tài nguyên cấp Hoàn Hảo. Cần nhỏ máu và kích hoạt thiên phú Bàn Rèn để ấp nở!
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playCritFanfare();
                    onHatchPetEgg();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#ff4b2b] to-[#ffcc00] text-black font-bold rounded-lg text-xs border border-[#ffcc00] shadow-lg transition uppercase tracking-wider cursor-pointer"
                >
                  🩸 NHỎ MÁU NHẬN CHỦ & ẤP NỞ NGAY
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-2.5 sm:p-3 bg-[#08080a] border-t border-[#2d2d30] flex justify-end shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 sm:px-6 py-1.5 bg-[#131315] hover:bg-[#1a1a1d] border border-[#2d2d30] text-gray-200 font-bold rounded-lg text-xs transition uppercase tracking-wider cursor-pointer"
          >
            ĐÓNG [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
