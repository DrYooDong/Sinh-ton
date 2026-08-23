import React, { useState } from 'react';
import { InventoryItem, ItemRarity, PetStats, PlayerStats } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { Package, Shield, Swords, Sparkles, Heart, Flame, Dog, Check, Droplets } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/30 rounded">
              <Package className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
                NHẪN TRỮ VẬT KHÔNG GIAN
                <span className="text-[10px] px-2 py-0.5 rounded border border-[#ffcc00]/60 bg-[#ffcc00]/10 text-[#ffcc00] font-bold">
                  SỬ THI (10x10x10M)
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Không gian trữ đồ vô hạn, liên kết linh hồn không thể bị cướp đoạt</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('inventory');
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
                activeTab === 'inventory'
                  ? 'bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]'
                  : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
              }`}
            >
              TÚI ĐỒ ({inventory.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('pet');
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                activeTab === 'pet'
                  ? 'bg-[#1a1a1d] text-[#ffcc00] border-[#ffcc00]'
                  : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
              }`}
            >
              <Dog className="w-3.5 h-3.5 text-[#ffcc00]" />
              THÚ CƯNG {petStats.unlocked ? '(CHÓ VÀNG)' : '(TRỨNG)'}
            </button>
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
        </div>

        {/* Tab 1: INVENTORY GRID */}
        {activeTab === 'inventory' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            
            {/* Left side category + items grid */}
            <div className="md:col-span-8 border-r border-[#2d2d30] flex flex-col bg-[#08080a] overflow-hidden">
              {/* Filter Tabs */}
              <div className="flex border-b border-[#2d2d30] p-2 gap-1 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: 'TẤT CẢ' },
                  { id: 'material', label: 'NGUYÊN LIỆU' },
                  { id: 'consumable', label: 'ẨM THỰC & THUỐC' },
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
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition whitespace-nowrap border ${
                      selectedCategory === cat.id
                        ? 'bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]/60'
                        : 'text-gray-400 hover:text-white border-transparent hover:border-[#2d2d30]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="flex-1 p-3 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 auto-rows-max">
                {filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isEquipped = playerStats.equippedWeaponId === item.id;
                  const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedItemId(item.id);
                      }}
                      className={`relative aspect-square p-2 rounded border flex flex-col items-center justify-between text-center transition ${
                        isSelected
                          ? 'border-[#00f2ff] bg-[#1a1a1d] shadow-md ring-1 ring-[#00f2ff]/50'
                          : 'border-[#2d2d30] bg-[#131315] hover:bg-[#1a1a1d]'
                      }`}
                    >
                      {isEquipped && (
                        <span className="absolute top-1 left-1 bg-[#ffcc00] text-black font-bold text-[8px] px-1 py-0.2 rounded">
                          ĐANG DÙNG
                        </span>
                      )}

                      <span className="text-2xl mt-1">{item.icon || '📦'}</span>

                      <div className="w-full">
                        <div className="text-[10px] font-bold text-gray-200 truncate">{item.name}</div>
                        <div className="text-[10px] text-[#ffcc00] font-bold">x{item.quantity}</div>
                      </div>

                      <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${rarityStyle.bg}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side item detail & actions */}
            <div className="md:col-span-4 p-5 flex flex-col justify-between overflow-y-auto bg-[#0c0c0e]">
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-[#131315] rounded border border-[#2d2d30]">
                    <div className="text-3xl mb-2">{selectedItem.icon || '📦'}</div>
                    <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5 uppercase">
                      {selectedItem.name}
                    </h3>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border ${RARITY_COLORS[selectedItem.rarity].bg} ${RARITY_COLORS[selectedItem.rarity].text} ${RARITY_COLORS[selectedItem.rarity].border}`}>
                      {RARITY_COLORS[selectedItem.rarity].label.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-400 mt-2 font-bold uppercase">
                      SỐ LƯỢNG: <span className="text-[#ffcc00]">{selectedItem.quantity}</span>
                    </div>
                  </div>

                  {/* Description & Stats */}
                  <div className="p-3 bg-[#131315] rounded border border-[#2d2d30] space-y-2 text-xs">
                    <p className="text-gray-300 text-[11px]">{selectedItem.description}</p>
                    {selectedItem.stats && (
                      <div className="pt-2 border-t border-[#2d2d30] space-y-1 text-gray-400 text-[11px]">
                        {selectedItem.stats.damage && (
                          <div className="text-[#ff416c] font-bold">🗡️ Sát thương: +{selectedItem.stats.damage}</div>
                        )}
                        {selectedItem.stats.hungerValue && (
                          <div className="text-[#ffcc00] font-bold">🍖 Hồi đói: +{selectedItem.stats.hungerValue}</div>
                        )}
                        {selectedItem.stats.waterValue && (
                          <div className="text-[#00f2ff] font-bold">💧 Giải khát: +{selectedItem.stats.waterValue}</div>
                        )}
                        {selectedItem.stats.tempMod && (
                          <div className="text-[#00a8ff] font-bold">❄️ Hạ nhiệt cơ thể: {selectedItem.stats.tempMod}°C</div>
                        )}
                        {selectedItem.stats.spiritBonus && (
                          <div className="text-[#c084fc] font-bold">✨ Tinh thần: +{selectedItem.stats.spiritBonus}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {selectedItem.category === 'weapon' && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onEquipWeapon(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#1a1a1d] hover:bg-[#252529] text-[#00f2ff] border border-[#00f2ff]/50 font-bold rounded text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        <Swords className="w-4 h-4" />
                        {playerStats.equippedWeaponId === selectedItem.id ? 'ĐANG TRANG BỊ' : 'TRANG BỊ VŨ KHÍ'}
                      </button>
                    )}

                    {selectedItem.category === 'consumable' && (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onUseItem(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#4cd137] hover:bg-[#68d856] text-black font-bold rounded text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        <Heart className="w-4 h-4" />
                        SỬ DỤNG / ĂN / UỐNG
                      </button>
                    )}

                    {(selectedItem.category === 'blueprint' || selectedItem.id.startsWith('blueprint_') || selectedItem.id.startsWith('bp_')) && onLearnBlueprint && (
                      <button
                        onClick={() => {
                          soundEngine.playCritFanfare();
                          const bpId = selectedItem.id.replace('blueprint_', '');
                          onLearnBlueprint(bpId);
                          onUseItem(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#00f2ff] hover:bg-[#80f8ff] text-black font-bold rounded text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider shadow"
                      >
                        <Sparkles className="w-4 h-4" />
                        HỌC BẢN THIẾT KẾ & MỞ KHÓA
                      </button>
                    )}

                    {petStats.unlocked && (selectedItem.category === 'consumable' || selectedItem.name.includes('Thịt')) && (
                      <button
                        onClick={() => {
                          soundEngine.playDogBark();
                          onFeedPet(selectedItem.id);
                        }}
                        className="w-full py-2 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-bold rounded text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        <Dog className="w-4 h-4" />
                        CHO CHÓ VÀNG ĂN (+EXP, +HP)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 my-auto">Chọn một vật phẩm để xem chi tiết</div>
              )}
            </div>

          </div>
        ) : (
          /* Tab 2: PET SYSTEM (CHÓ VÀNG TRUNG HOA) */
          <div className="p-6 overflow-y-auto space-y-6 bg-[#0c0c0e]">
            {petStats.unlocked ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pet Identity Card */}
                <div className="p-5 bg-[#131315] rounded border border-[#ffcc00]/40 flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 rounded bg-[#ffcc00]/10 border border-[#ffcc00]/50 flex items-center justify-center text-4xl shadow-lg">
                    🐕
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#ffcc00] flex items-center justify-center gap-2 uppercase tracking-wide">
                      {petStats.name}
                      <span className="text-[9px] bg-[#ff416c]/20 text-[#ff416c] px-2 py-0.5 rounded border border-[#ff416c]/40 font-bold">
                        RỰC RỠ (CHIẾN ĐẤU)
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Giống Chó Vườn Trung Hoa thông minh, tâm linh tương thông, tự động cảnh báo dã thú và cướp đường!
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-[#2d2d30] text-xs">
                    <div className="p-2 bg-[#08080a] border border-[#2d2d30] rounded">
                      <span className="text-gray-400 text-[10px] uppercase">CẤP:</span>{' '}
                      <span className="font-bold text-[#ffcc00]">LV. {petStats.level}</span>
                    </div>
                    <div className="p-2 bg-[#08080a] border border-[#2d2d30] rounded">
                      <span className="text-gray-400 text-[10px] uppercase">SÁT THƯƠNG:</span>{' '}
                      <span className="font-bold text-[#ff416c]">{petStats.attackPower} DMG</span>
                    </div>
                    <div className="p-2 bg-[#08080a] border border-[#2d2d30] rounded">
                      <span className="text-gray-400 text-[10px] uppercase">CẢNH GIÁC:</span>{' '}
                      <span className="font-bold text-[#00f2ff]">{petStats.alertness}M</span>
                    </div>
                    <div className="p-2 bg-[#08080a] border border-[#2d2d30] rounded">
                      <span className="text-gray-400 text-[10px] uppercase">NO BỤNG:</span>{' '}
                      <span className="font-bold text-[#4cd137]">{petStats.hunger}%</span>
                    </div>
                  </div>
                </div>

                {/* Pet Skills & Growth */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-[0.15em]">KỸ NĂNG THIÊN PHÚ</h4>
                  
                  <div className="p-3 bg-[#131315] rounded border border-[#2d2d30] flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-xs font-bold text-[#ffcc00]">CẢNH BÁO SỚM 500M</div>
                      <p className="text-[11px] text-gray-400">Tự động sủa inh ỏi khi bầy sói hoặc đám cướp có súng tiến lại gần xe.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#131315] rounded border border-[#2d2d30] flex items-start gap-3">
                    <span className="text-2xl">🦷</span>
                    <div>
                      <div className="text-xs font-bold text-[#ff416c]">NANH SẮC CẮN XÉ</div>
                      <p className="text-[11px] text-gray-400">Lao vào tấn công hỗ trợ Tuyết Mộc khi đánh cận chiến ngoài đường.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#131315] border border-[#ffcc00]/30 rounded text-xs text-[#ffcc00]/90">
                    <span className="font-bold">MẸO NUÔI THÚ:</span> Cho Chó Vàng ăn thịt lợn rừng, thịt sư tử hoặc thịt hổ để tăng cấp và kích thước trưởng thành nhanh chóng!
                  </div>
                </div>

              </div>
            ) : (
              /* Egg Hatching Screen */
              <div className="text-center p-8 bg-[#131315] rounded border border-[#2d2d30] space-y-4 max-w-lg mx-auto">
                <div className="w-20 h-20 mx-auto rounded bg-[#c084fc]/10 border border-[#c084fc]/50 flex items-center justify-center text-4xl animate-bounce">
                  🥚
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#c084fc] uppercase tracking-wide">TRỨNG THÚ CƯNG CHIẾN ĐẤU</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Thu được từ rương tài nguyên cấp Hoàn Hảo. Cần nhỏ máu và kích hoạt thiên phú Bàn Rèn để ấp nở!
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playCritFanfare();
                    onHatchPetEgg();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#ff4b2b] to-[#ffcc00] text-black font-bold rounded text-xs border border-[#ffcc00] shadow-lg transition uppercase tracking-wider"
                >
                  🩸 NHỎ MÁU NHẬN CHỦ & ẤP NỞ NGAY
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#08080a] border-t border-[#2d2d30] flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2 bg-[#131315] hover:bg-[#1a1a1d] border border-[#2d2d30] text-gray-200 font-bold rounded text-xs transition uppercase tracking-wider"
          >
            ĐÓNG [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
