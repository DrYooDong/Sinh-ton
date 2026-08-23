import React from 'react';
import { ItemRarity, VehicleStats } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { Car, Gauge, Fuel, Thermometer, Wind, Droplets, Snowflake, Sparkles, Shield, Disc, Zap, CheckCircle2 } from 'lucide-react';

interface VehicleCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleStats;
  onUpgradePart: (partName: keyof VehicleStats, targetLevel: ItemRarity) => void;
  onUpgradeCore: () => void;
  onToggleAC: () => void;
  onSetWaterTemp: (temp: number) => void;
  onMakeIce: () => void;
  onMakeIceCream: () => void;
}

export const VehicleCustomizerModal: React.FC<VehicleCustomizerModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onUpgradeCore,
  onToggleAC,
  onSetWaterTemp,
  onMakeIce,
  onMakeIceCream,
}) => {
  if (!isOpen) return null;

  const parts = [
    { key: 'engineLevel', name: 'Động cơ', level: vehicle.engineLevel, desc: 'Tăng tốc độ tối đa & công suất kéo' },
    { key: 'transmissionLevel', name: 'Hộp số', level: vehicle.transmissionLevel, desc: 'Giảm tiêu thụ xăng xuống 3L/100km' },
    { key: 'tiresLevel', name: 'Lốp xe', level: vehicle.tiresLevel, desc: 'Tăng độ bám đường, chống nổ lốp' },
    { key: 'chassisLevel', name: 'Khung gầm', level: vehicle.chassisLevel, desc: 'Giảm rung lắc, tăng độ cân bằng' },
    { key: 'armorLevel', name: 'Vỏ xe', level: vehicle.armorLevel, desc: 'Chống móng vuốt thú dữ và va quẹt' },
    { key: 'glassLevel', name: 'Kính chống đạn', level: vehicle.glassLevel, desc: 'Chặn đứng đạn súng cướp đường' },
    { key: 'fuelTankLevel', name: 'Bình xăng', level: vehicle.fuelTankLevel, desc: 'Mở rộng dung tích lên 65L - 150L' },
    { key: 'seatsLevel', name: 'Ghế & Giường đơn', level: vehicle.seatsLevel, desc: 'Giường êm hồi phục thể lực khi ngủ' },
  ];

  const allPartsUpgraded = parts.every((p) => p.level !== 'common');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 rounded">
              <Car className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
                TRUNG TÂM NÂNG CẤP PHƯƠNG TIỆN
                <span className="text-[10px] px-2 py-0.5 rounded border border-[#ffcc00]/60 bg-[#ffcc00]/10 text-[#ffcc00] font-bold">
                  {vehicle.tier === 'rv_luxury' ? '🚐 XE NHÀ RV SANG TRỌNG' : vehicle.tier === 'superior' ? '🚐 XE VAN NÂNG CẤP' : '🚗 XE VAN CŨ NÁT'}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Nâng cấp 8 bộ phận & hợp nhất lõi xe mở rộng radar lên 500m</p>
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

        {/* Vehicle Stats Overview Bar */}
        <div className="p-4 bg-[#08080a] border-b border-[#2d2d30] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-[#131315] rounded border border-[#2d2d30] flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-[#00f2ff] shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] uppercase">TỐC ĐỘ TỐI ĐA</div>
              <div className="text-sm font-bold text-white">{vehicle.maxSpeed} KM/H</div>
            </div>
          </div>

          <div className="p-2.5 bg-[#131315] rounded border border-[#2d2d30] flex items-center gap-2.5">
            <Fuel className="w-4 h-4 text-[#ffcc00] shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] uppercase">BÌNH XĂNG & HAO</div>
              <div className="text-sm font-bold text-white">
                {vehicle.currentFuel.toFixed(1)} / {vehicle.maxFuel}L ({vehicle.fuelEfficiency}L/100KM)
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#131315] rounded border border-[#2d2d30] flex items-center gap-2.5">
            <Disc className="w-4 h-4 text-[#c084fc] shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] uppercase">RADAR DÒ RƯƠNG</div>
              <div className="text-sm font-bold text-[#c084fc]">PHẠM VI {vehicle.radarRange}M</div>
            </div>
          </div>

          <div className="p-2.5 bg-[#131315] rounded border border-[#2d2d30] flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-[#ff4b2b] shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] uppercase">NHIỆT ĐỘ TRONG XE</div>
              <div className="text-sm font-bold text-[#4cd137]">{vehicle.interiorTemp}°C (ĐIỀU HÒA)</div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#0c0c0e]">
          
          {/* CORE UPGRADE / REVOLUTION SECTION */}
          <div className="p-4 bg-[#131315] rounded border border-[#c084fc]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#c084fc]/10 text-[#c084fc] rounded border border-[#c084fc]/30">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#c084fc] flex items-center gap-2 tracking-wider uppercase">
                  LÕI XE (CORE FUSION)
                  <span className="text-[9px] bg-[#c084fc]/20 text-[#c084fc] px-2 py-0.5 rounded border border-[#c084fc]/40">
                    CẤP: {RARITY_COLORS[vehicle.coreLevel]?.label.toUpperCase() || 'THÔNG THƯỜNG'}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {vehicle.tier === 'rv_luxury'
                    ? '✨ Đã nâng cấp thành công thành Xe Nhà RV sang trọng hoàn hảo!'
                    : 'Nâng cấp toàn bộ 8 bộ phận xe để hợp nhất lõi xe biến thành Xe Nhà RV (tốc độ 120km/h, radar 500m)!'}
                </p>
              </div>
            </div>

            {vehicle.tier !== 'rv_luxury' && (
              <button
                onClick={() => {
                  soundEngine.playCritFanfare();
                  onUpgradeCore();
                }}
                className={`px-4 py-2 rounded font-bold text-xs shadow-lg transition flex items-center gap-2 border ${
                  allPartsUpgraded
                    ? 'bg-gradient-to-r from-[#ff4b2b] to-[#ffcc00] text-black border-[#ffcc00] animate-bounce uppercase tracking-wider'
                    : 'bg-[#1a1a1d] text-gray-600 border-[#2d2d30] cursor-not-allowed uppercase'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                HỢP NHẤT LÕI XE NHÀ RV
              </button>
            )}
          </div>

          {/* 8 COMPONENTS GRID */}
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00f2ff]" />
              8 BỘ PHẬN CHÍNH CỦA XE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {parts.map((p) => {
                const rarityStyle = RARITY_COLORS[p.level] || RARITY_COLORS.common;
                return (
                  <div
                    key={p.key}
                    className="p-3 bg-[#131315] rounded border border-[#2d2d30] flex flex-col justify-between space-y-2 hover:border-[#00f2ff]/40 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}>
                          {rarityStyle.label.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{p.desc}</p>
                    </div>

                    <div className="text-[10px] text-[#4cd137] flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {p.level !== 'common' ? 'ĐÃ TRANG BỊ CẤP CAO' : 'CẦN RÈN TẠI BÀN RÈN'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LUXURY RV AMENITIES & CABIN FACILITIES */}
          <div className="border-t border-[#2d2d30] pt-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-[0.15em] flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#4cd137]" />
              TIỆN NGHI SINH TỒN TRÊN XE NHÀ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* 1. CAR AIR CONDITIONING */}
              <div className="p-4 bg-[#131315] rounded border border-[#2d2d30] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2 uppercase">
                      <Wind className="w-4 h-4 text-[#00f2ff]" />
                      ĐIỀU HÒA XE
                    </span>
                    <span className="text-[10px] bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded border border-[#00f2ff]/30 font-bold">
                      {vehicle.hasAC ? 'BẬT (22°C)' : 'TẮT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Cực kỳ quan trọng giữa đợt nắng nóng sa mạc 65°C. Bảo vệ không bị sốc nhiệt.
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onToggleAC();
                  }}
                  className="w-full py-2 bg-[#1a1a1d] hover:bg-[#252529] text-[#00f2ff] border border-[#00f2ff]/50 rounded font-bold text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Wind className="w-3.5 h-3.5" />
                  {vehicle.hasAC ? 'TẮT ĐIỀU HÒA' : 'BẬT ĐIỀU HÒA'}
                </button>
              </div>

              {/* 2. ROOF WATER TANK 1000L */}
              <div className="p-4 bg-[#131315] rounded border border-[#2d2d30] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2 uppercase">
                      <Droplets className="w-4 h-4 text-[#00a8ff]" />
                      BỒN NƯỚC NÓC XE
                    </span>
                    <span className="text-[10px] text-[#00a8ff] font-bold">
                      {vehicle.currentWaterTank} / {vehicle.waterTankCapacity}L
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tự ngưng tụ nước từ máy lọc. Điều chỉnh nhiệt độ bồn nước: {vehicle.waterTankTemp}°C
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase">NHIỆT ĐỘ:</span>
                  {[10, 25, 45, 80].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        soundEngine.playClick();
                        onSetWaterTemp(t);
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition border ${
                        vehicle.waterTankTemp === t ? 'bg-[#00a8ff] text-black border-[#00a8ff]' : 'bg-[#1a1a1d] text-gray-400 border-[#2d2d30]'
                      }`}
                    >
                      {t}°C
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. REFRIGERATOR & ICE CREAM MAKER */}
              <div className="p-4 bg-[#131315] rounded border border-[#2d2d30] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2 uppercase">
                      <Snowflake className="w-4 h-4 text-[#00f2ff]" />
                      TỦ LẠNH & LÀM KEM
                    </span>
                    <span className="text-[10px] bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded border border-[#00f2ff]/30 font-bold">
                      HOÀN HẢO
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Đông đá nước muối, ướp lạnh hoa quả và sản xuất kem bơ tuyết giải nhiệt cực đỉnh.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onMakeIce();
                    }}
                    className="flex-1 py-1.5 bg-[#1a1a1d] hover:bg-[#252529] border border-[#00f2ff]/50 text-[#00f2ff] rounded font-bold text-xs transition uppercase"
                  >
                    ❄️ ĐÁ MUỐI
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onMakeIceCream();
                    }}
                    className="flex-1 py-1.5 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-bold rounded text-xs transition uppercase"
                  >
                    🍦 KEM BƠ
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
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
