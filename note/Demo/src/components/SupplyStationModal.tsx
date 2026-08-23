import React from 'react';
import { SupplyStationEntity } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Store, Droplets, Fuel, Utensils, ShieldCheck, Check } from 'lucide-react';

interface SupplyStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: SupplyStationEntity | null;
  courageBadges: number;
  onBuySupply: (itemId: string, quantity: number, pricePerUnit: number) => void;
}

export const SupplyStationModal: React.FC<SupplyStationModalProps> = ({
  isOpen,
  onClose,
  station,
  courageBadges,
  onBuySupply,
}) => {
  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded w-full max-w-2xl shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 rounded">
              <Store className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
                {station.name}
                <span className="text-[10px] px-2 py-0.5 rounded border border-[#00f2ff]/60 bg-[#00f2ff]/10 text-[#00f2ff] font-bold">
                  MÁY BÁN HÀNG TỰ ĐỘNG
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Sử dụng Huy hiệu Dũng khí để mua vật tư sinh tồn (Giới hạn 50 phần/loại)
              </p>
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

        {/* Currency balance bar */}
        <div className="p-3 bg-[#08080a] border-b border-[#2d2d30] flex items-center justify-between px-6 text-xs">
          <div className="text-gray-400 uppercase text-[10px]">SỐ DƯ HIỆN TẠI:</div>
          <div className="flex items-center gap-2 font-bold text-[#ffcc00] text-xs">
            <span>🎖️ {courageBadges} HUY HIỆU DŨNG KHÍ</span>
          </div>
        </div>

        {/* Supplies Items Grid */}
        <div className="p-5 overflow-y-auto space-y-3 max-h-[60vh] bg-[#0c0c0e]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {station.supplies.map((sup) => {
              const canAfford = courageBadges >= sup.price;
              const hasStock = sup.stock > 0;

              return (
                <div
                  key={sup.itemId}
                  className="p-3.5 bg-[#131315] rounded border border-[#2d2d30] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white uppercase">{sup.itemId}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        CÒN LẠI: <span className="text-[#00f2ff] font-bold">{sup.stock}/{sup.maxStock}</span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-gray-500 text-[9px] uppercase">ĐƠN GIÁ:</div>
                      <div className="font-bold text-[#ffcc00] text-xs">{sup.price} HH</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={!canAfford || !hasStock}
                      onClick={() => {
                        soundEngine.playLootChest();
                        onBuySupply(sup.itemId, 1, sup.price);
                      }}
                      className="flex-1 py-1.5 bg-[#1a1a1d] hover:bg-[#252529] border border-[#00f2ff]/50 disabled:opacity-40 text-[#00f2ff] rounded font-bold text-xs transition uppercase"
                    >
                      MUA X1
                    </button>

                    <button
                      disabled={courageBadges < sup.price * 10 || sup.stock < 10}
                      onClick={() => {
                        soundEngine.playLootChest();
                        onBuySupply(sup.itemId, 10, sup.price);
                      }}
                      className="flex-1 py-1.5 bg-[#ffcc00] hover:bg-[#ffe066] disabled:opacity-40 text-black font-bold rounded text-xs transition uppercase"
                    >
                      MUA X10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#08080a] border-t border-[#2d2d30] flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2 bg-[#131315] hover:bg-[#1a1a1d] border border-[#2d2d30] text-gray-200 font-bold rounded text-xs transition uppercase tracking-wider"
          >
            ĐÓNG TRẠM [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
