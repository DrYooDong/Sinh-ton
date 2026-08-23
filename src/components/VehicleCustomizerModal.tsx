import React, { useState, useEffect } from 'react';
import { ItemRarity, VehicleStats, RadioBroadcast } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { RADIO_STATIONS, generateProceduralBroadcast } from '../game/radioStations';
import {
  Car,
  Gauge,
  Fuel,
  Thermometer,
  Wind,
  Droplets,
  Snowflake,
  Sparkles,
  Shield,
  Disc,
  Zap,
  CheckCircle2,
  Radio,
  Volume2,
  VolumeX,
  RefreshCw,
  Activity,
  TowerControl as Antenna,
} from 'lucide-react';

interface VehicleCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleStats;
  onUpgradePart?: (partName: keyof VehicleStats, targetLevel: ItemRarity) => void;
  onUpgradeCore: () => void;
  onToggleAC: () => void;
  onSetWaterTemp: (temp: number) => void;
  onMakeIce: () => void;
  onMakeIceCream: () => void;
  currentStageName?: string;
  currentMileage?: number;
  courageBadges?: number;
  ambientTemp?: number;
  isNight?: boolean;
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
  currentStageName = 'Hoang Mạc Sa Mạc',
  currentMileage = 0,
  courageBadges = 20,
  ambientTemp = 36,
  isNight = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'radio' | 'amenities'>('upgrades');

  // Radio state
  const [isRadioOn, setIsRadioOn] = useState(true);
  const [activeStationId, setActiveStationId] = useState<string>('highway_emergency');
  const [frequency, setFrequency] = useState<number>(104.5);
  const [currentBroadcast, setCurrentBroadcast] = useState<RadioBroadcast | null>(null);
  const [isTuning, setIsTuning] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<RadioBroadcast[]>([]);

  // Initialize broadcast
  useEffect(() => {
    if (isOpen && isRadioOn) {
      fetchNewBroadcast(activeStationId);
    }
  }, [isOpen, activeStationId]);

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

  const activeStation = RADIO_STATIONS.find((s) => s.id === activeStationId) || RADIO_STATIONS[0];

  const fetchNewBroadcast = (stationId: string) => {
    setIsTuning(true);
    soundEngine.playRadioTune();

    setTimeout(() => {
      soundEngine.playRadioStatic();
      const bc = generateProceduralBroadcast(stationId, {
        mileage: vehicle.mileage || currentMileage,
        stageName: currentStageName,
        temperature: ambientTemp,
        hour: isNight ? 22 : 14,
        isNight,
        courageBadges,
      });

      if (stationId === 'distress_beacon') {
        soundEngine.playMorseCode();
      } else {
        soundEngine.playRadioChime();
      }

      setCurrentBroadcast(bc);
      setBroadcastHistory((prev) => [bc, ...prev.slice(0, 5)]);
      setIsTuning(false);
    }, 250);
  };

  const handleSelectStation = (st: typeof RADIO_STATIONS[0]) => {
    setActiveStationId(st.id);
    setFrequency(st.frequency);
    fetchNewBroadcast(st.id);
  };

  const handleFrequencySlider = (newFreq: number) => {
    setFrequency(newFreq);
    soundEngine.playRadioTune();

    // Check if close to any station (within 0.4 MHz)
    const matchingStation = RADIO_STATIONS.find((s) => Math.abs(s.frequency - newFreq) < 0.4);
    if (matchingStation && matchingStation.id !== activeStationId) {
      setActiveStationId(matchingStation.id);
      fetchNewBroadcast(matchingStation.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-3 md:p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border-2 border-[#2d2d30] rounded-xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Modal Header */}
        <div className="p-2.5 sm:p-3.5 bg-[#131315] border-b border-[#2d2d30] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1.5 sm:p-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 rounded-lg shrink-0">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-white truncate">
                    XE NHÀ & RADIO
                  </h2>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border border-[#ffcc00]/60 bg-[#ffcc00]/10 text-[#ffcc00] font-bold whitespace-nowrap">
                    {vehicle.tier === 'rv_luxury' ? '🚐 XE NHÀ RV' : vehicle.tier === 'superior' ? '🚐 XE VAN+' : '🚗 XE VAN'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 truncate hidden sm:block">
                  Nâng cấp 8 bộ phận, tiện nghi sinh tồn và đài radio đa tần số
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
            {/* Tab switchers */}
            <div className="flex bg-[#08080a] p-0.5 sm:p-1 rounded-lg border border-[#2d2d30] text-[10px] sm:text-xs shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('upgrades');
                }}
                className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'upgrades'
                    ? 'bg-[#1a1a1d] text-[#00f2ff] border border-[#00f2ff]/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>NÂNG CẤP</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('radio');
                }}
                className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'radio'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse" />
                <span>ĐÀI RADIO</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('amenities');
                }}
                className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                  activeTab === 'amenities'
                    ? 'bg-[#1a1a1d] text-[#4cd137] border border-[#4cd137]/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4cd137]" />
                <span>TIỆN NGHI</span>
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

        {/* Vehicle Stats Overview Bar */}
        <div className="p-2 sm:p-3 bg-[#08080a] border-b border-[#2d2d30] grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 text-xs shrink-0">
          <div className="p-1.5 sm:p-2 bg-[#131315] rounded-lg border border-[#2d2d30] flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f2ff] shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase truncate">TỐC ĐỘ TỐI ĐA</div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">{vehicle.maxSpeed} KM/H</div>
            </div>
          </div>

          <div className="p-1.5 sm:p-2 bg-[#131315] rounded-lg border border-[#2d2d30] flex items-center gap-2">
            <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffcc00] shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase truncate">BÌNH XĂNG</div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                {vehicle.currentFuel.toFixed(1)} / {vehicle.maxFuel}L
              </div>
            </div>
          </div>

          <div className="p-1.5 sm:p-2 bg-[#131315] rounded-lg border border-[#2d2d30] flex items-center gap-2">
            <Disc className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c084fc] shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase truncate">RADAR DÒ RƯƠNG</div>
              <div className="text-[11px] sm:text-xs font-bold text-[#c084fc] truncate">{vehicle.radarRange}M</div>
            </div>
          </div>

          <div className="p-1.5 sm:p-2 bg-[#131315] rounded-lg border border-[#2d2d30] flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff4b2b] shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase truncate">NHIỆT ĐỘ TRONG XE</div>
              <div className="text-[11px] sm:text-xs font-bold text-[#4cd137] truncate">{vehicle.interiorTemp}°C (AC)</div>
            </div>
          </div>
        </div>

        {/* Tab 1: UPGRADES & CORE */}
        {activeTab === 'upgrades' && (
          <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-[#0c0c0e]">
            
            {/* CORE UPGRADE / REVOLUTION SECTION */}
            <div className="p-3 sm:p-4 bg-[#131315] rounded-lg border border-[#c084fc]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <div className="p-2 sm:p-2.5 bg-[#c084fc]/10 text-[#c084fc] rounded-lg border border-[#c084fc]/30 shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#c084fc] flex items-center gap-2 tracking-wider uppercase">
                    <span>LÕI XE (CORE FUSION)</span>
                    <span className="text-[8px] sm:text-[9px] bg-[#c084fc]/20 text-[#c084fc] px-1.5 py-0.5 rounded border border-[#c084fc]/40">
                      {RARITY_COLORS[vehicle.coreLevel]?.label.toUpperCase() || 'THÔNG THƯỜNG'}
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                    {vehicle.tier === 'rv_luxury'
                      ? '✨ Đã nâng cấp thành công thành Xe Nhà RV sang trọng hoàn hảo!'
                      : 'Nâng cấp toàn bộ 8 bộ phận xe để hợp nhất lõi xe biến thành Xe Nhà RV!'}
                  </p>
                </div>
              </div>

              {vehicle.tier !== 'rv_luxury' && (
                <button
                  onClick={() => {
                    soundEngine.playCritFanfare();
                    onUpgradeCore();
                  }}
                  className={`w-full sm:w-auto px-3.5 sm:px-4 py-2 rounded-lg font-bold text-[11px] sm:text-xs shadow-lg transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    allPartsUpgraded
                      ? 'bg-gradient-to-r from-[#ff4b2b] to-[#ffcc00] text-black border-[#ffcc00] animate-bounce uppercase tracking-wider'
                      : 'bg-[#1a1a1d] text-gray-600 border-[#2d2d30] cursor-not-allowed uppercase'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>HỢP NHẤT LÕI XE RV</span>
                </button>
              )}
            </div>

            {/* 8 COMPONENTS GRID */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-[0.15em] mb-2 sm:mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00f2ff]" />
                <span>8 BỘ PHẬN CHÍNH CỦA XE</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {parts.map((p) => {
                  const rarityStyle = RARITY_COLORS[p.level] || RARITY_COLORS.common;
                  return (
                    <div
                      key={p.key}
                      className="p-2.5 sm:p-3 bg-[#131315] rounded-lg border border-[#2d2d30] flex flex-col justify-between space-y-2 hover:border-[#00f2ff]/40 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">{p.name}</span>
                          <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}>
                            {rarityStyle.label.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
                      </div>

                      <div className="text-[9px] sm:text-[10px] text-[#4cd137] flex items-center gap-1 font-bold pt-1 border-t border-[#1f1f23]">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{p.level !== 'common' ? 'ĐÃ TRANG BỊ CẤP CAO' : 'CẦN RÈN TẠI BÀN RÈN'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: VEHICLE RADIO SYSTEM */}
        {activeTab === 'radio' && (
          <div className="flex-1 p-2.5 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-[#09090b]">
            
            {/* Radio Main Unit Frame */}
            <div className="p-3 sm:p-4 md:p-5 bg-[#121216] rounded-xl border-2 border-[#2d2d30] shadow-2xl space-y-3 sm:space-y-4">
              
              {/* Radio Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d2d30] pb-2.5 sm:pb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg shrink-0">
                    <Antenna className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5 tracking-wider uppercase">
                      <span>ĐÀI RADIO XA LỘ (FM)</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block">
                      Kênh khẩn cấp, dự báo bão cát, thám hiểm và tín hiệu SOS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundEngine.playRadioTune();
                      setIsRadioOn(!isRadioOn);
                    }}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 border cursor-pointer ${
                      isRadioOn
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-[#1a1a1d] text-gray-500 border-[#2d2d30]'
                    }`}
                  >
                    {isRadioOn ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3" />}
                    <span>{isRadioOn ? 'RADIO: BẬT' : 'RADIO: TẮT'}</span>
                  </button>

                  <button
                    onClick={() => fetchNewBroadcast(activeStationId)}
                    disabled={!isRadioOn || isTuning}
                    className="px-2.5 sm:px-3 py-1 bg-[#1a1a1d] hover:bg-[#252529] text-[#00f2ff] hover:text-white rounded-lg border border-[#00f2ff]/40 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    title="Dò bản tin mới"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTuning ? 'animate-spin' : ''}`} />
                    <span>DÒ BẢN TIN</span>
                  </button>
                </div>
              </div>

              {/* Stations Switcher Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
                {RADIO_STATIONS.map((st) => {
                  const isSelected = activeStationId === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleSelectStation(st)}
                      disabled={!isRadioOn}
                      className={`p-2 sm:p-2.5 rounded-lg border text-left transition flex flex-col justify-between space-y-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                          : 'bg-[#18181c] border-[#2d2d30] text-gray-400 hover:text-white hover:border-[#444448]'
                      } ${!isRadioOn ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-sm sm:text-base">{st.icon}</span>
                        <span className="font-bold text-[9px] sm:text-[10px] px-1 py-0.2 rounded bg-black/40 border border-white/10 text-amber-300">
                          {st.frequency}M
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold truncate">{st.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Frequency Tuning Slider Dial */}
              <div className="p-2.5 sm:p-3 bg-[#0c0c0e] rounded-lg border border-[#2d2d30] space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-amber-400" /> <span>TẦN SỐ:</span>
                  </span>
                  <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-wider">
                    {frequency.toFixed(1)} MHz
                  </span>
                  <span className="text-[10px] text-gray-500 hidden sm:inline">FM 87.5 - 108.0 MHz</span>
                </div>

                <input
                  type="range"
                  min="87.5"
                  max="108.0"
                  step="0.1"
                  value={frequency}
                  disabled={!isRadioOn}
                  onChange={(e) => handleFrequencySlider(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#1f1f24] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex justify-between text-[8px] sm:text-[9px] text-gray-500 font-mono overflow-x-auto no-scrollbar gap-1">
                  <span>88.7 (Dị Thú)</span>
                  <span>92.4 (Lofi)</span>
                  <span>98.2 (Khí Tượng)</span>
                  <span>104.5 (Khẩn Cấp)</span>
                  <span>107.9 (SOS)</span>
                </div>
              </div>

              {/* Live Broadcast Player View */}
              {isRadioOn ? (
                <div className="p-3 sm:p-4 bg-[#0c0c0e] rounded-lg border border-amber-500/40 relative overflow-hidden">
                  {/* Decorative background scanline */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none animate-pulse" />

                  {isTuning ? (
                    <div className="py-6 sm:py-8 flex flex-col items-center justify-center space-y-2 text-amber-400">
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-amber-400" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase animate-pulse text-center">
                        ĐANG BẮT TÍN HIỆU {frequency.toFixed(1)} MHZ...
                      </span>
                    </div>
                  ) : currentBroadcast ? (
                    <div className="space-y-2 sm:space-y-3 relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#2d2d30] pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] sm:text-[10px] font-bold">
                            {currentBroadcast.tag}
                          </span>
                          <span className="text-gray-400 text-[9px] sm:text-[10px]">
                            {currentBroadcast.speaker} • {currentBroadcast.timestamp}
                          </span>
                        </div>
                        {currentBroadcast.isImportant && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[9px] sm:text-[10px] font-bold animate-pulse">
                            ⚠️ QUAN TRỌNG
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>📢</span> <span>{currentBroadcast.title}</span>
                      </h4>

                      <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed bg-[#131317] p-2.5 sm:p-3 rounded-lg border border-[#26262b]">
                        "{currentBroadcast.content}"
                      </p>

                      {/* Equalizer animation */}
                      <div className="flex items-end gap-1 h-3.5 pt-1">
                        {[40, 75, 100, 60, 85, 30, 90, 65, 45, 80, 50, 95, 70].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-amber-400/80 rounded-t-sm transition-all duration-300"
                            style={{ height: `${(h * Math.sin(Date.now() / 300 + i) + h) / 2}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 sm:py-6 text-center text-gray-500 text-[11px] sm:text-xs">
                      Không có tín hiệu trên băng tần này. Hãy chọn một đài phát thanh ở trên!
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 sm:py-10 text-center text-gray-500 text-[11px] sm:text-xs border border-dashed border-[#2d2d30] rounded-lg">
                  Radio đang tắt. Nhấn nút "RADIO: BẬT" để lắng nghe bản tin thế giới.
                </div>
              )}

              {/* Station Description */}
              <div className="p-2.5 sm:p-3 bg-[#16161a] rounded-lg border border-[#2d2d30] text-[10px] sm:text-xs text-gray-400 flex items-center justify-between">
                <div>
                  <strong className="text-white">{activeStation.name}:</strong> {activeStation.description}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: LUXURY RV AMENITIES */}
        {activeTab === 'amenities' && (
          <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-[#0c0c0e]">
            <h3 className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-[#4cd137]" />
              <span>TIỆN NGHI SINH TỒN TRÊN XE NHÀ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
              
              {/* 1. CAR AIR CONDITIONING */}
              <div className="p-3 sm:p-4 bg-[#131315] rounded-lg border border-[#2d2d30] flex flex-col justify-between space-y-2.5 sm:space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                      <Wind className="w-3.5 h-3.5 text-[#00f2ff]" />
                      <span>ĐIỀU HÒA XE</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded border border-[#00f2ff]/30 font-bold">
                      {vehicle.hasAC ? 'BẬT (22°C)' : 'TẮT'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Bảo vệ sinh mạng khỏi sốc nhiệt giữa đợt nắng nóng sa mạc 65°C.
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onToggleAC();
                  }}
                  className="w-full py-2 bg-[#1a1a1d] hover:bg-[#252529] text-[#00f2ff] border border-[#00f2ff]/50 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>{vehicle.hasAC ? 'TẮT ĐIỀU HÒA' : 'BẬT ĐIỀU HÒA'}</span>
                </button>
              </div>

              {/* 2. ROOF WATER TANK 1000L */}
              <div className="p-3 sm:p-4 bg-[#131315] rounded-lg border border-[#2d2d30] flex flex-col justify-between space-y-2.5 sm:space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                      <Droplets className="w-3.5 h-3.5 text-[#00a8ff]" />
                      <span>BỒN NƯỚC NÓC XE</span>
                    </span>
                    <span className="text-[10px] text-[#00a8ff] font-bold">
                      {vehicle.currentWaterTank} / {vehicle.waterTankCapacity}L
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Tự ngưng tụ nước. Chỉnh nhiệt độ bồn: <strong className="text-cyan-300">{vehicle.waterTankTemp}°C</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase">CHỌN:</span>
                  {[10, 25, 45, 80].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        soundEngine.playClick();
                        onSetWaterTemp(t);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition border cursor-pointer ${
                        vehicle.waterTankTemp === t ? 'bg-[#00a8ff] text-black border-[#00a8ff]' : 'bg-[#1a1a1d] text-gray-400 border-[#2d2d30] hover:text-white'
                      }`}
                    >
                      {t}°C
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. REFRIGERATOR & ICE CREAM MAKER */}
              <div className="p-3 sm:p-4 bg-[#131315] rounded-lg border border-[#2d2d30] flex flex-col justify-between space-y-2.5 sm:space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                      <Snowflake className="w-3.5 h-3.5 text-[#00f2ff]" />
                      <span>TỦ LẠNH & LÀM KEM</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded border border-[#00f2ff]/30 font-bold">
                      HOÀN HẢO
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Đông đá nước muối, ướp lạnh hoa quả và làm kem bơ tuyết giải nhiệt.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onMakeIce();
                    }}
                    className="flex-1 py-1.5 bg-[#1a1a1d] hover:bg-[#252529] border border-[#00f2ff]/50 text-[#00f2ff] rounded-lg font-bold text-xs transition uppercase cursor-pointer"
                  >
                    ❄️ ĐÁ MUỐI
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onMakeIceCream();
                    }}
                    className="flex-1 py-1.5 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-bold rounded-lg text-xs transition uppercase cursor-pointer shadow"
                  >
                    🍦 KEM BƠ
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal Footer */}
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
