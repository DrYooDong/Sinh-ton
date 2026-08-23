import React, { useState } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  Radio,
  ShieldAlert,
  Store,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Flame,
  Wind,
  Skull,
  AlertTriangle,
} from 'lucide-react';
import { BeastEntity, ChestEntity, HazardZoneEntity, SupplyStationEntity } from '../types';

interface MiniMapProps {
  playerX: number; // in pixels (10,000 px = 1 km)
  carX: number;
  mode: 'driving' | 'onfoot';
  speed: number;
  stations: SupplyStationEntity[];
  beasts: BeastEntity[];
  hazardZones: HazardZoneEntity[];
  chests: ChestEntity[];
  radarRangeMeters?: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  playerX,
  carX,
  mode,
  speed,
  stations,
  beasts,
  hazardZones,
  chests,
  radarRangeMeters = 5000,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [zoomKm, setZoomKm] = useState<number>(5); // 2km, 5km, 15km
  const [showLegend, setShowLegend] = useState<boolean>(false);

  const currentPx = mode === 'driving' ? carX : playerX;
  const currentKm = currentPx / 10000;

  // Radar view range in px
  const viewRangePx = zoomKm * 10000;
  const minX = Math.max(0, currentPx - viewRangePx * 0.2);
  const maxX = currentPx + viewRangePx * 0.8;
  const totalViewWidthPx = maxX - minX;

  // Filter entities within radar range
  const visibleStations = stations.filter((s) => s.x >= minX && s.x <= maxX);
  const visibleBeasts = beasts.filter((b) => !b.isDead && b.x >= minX && b.x <= maxX);
  const visibleHazards = hazardZones.filter(
    (h) => h.x + h.length / 2 >= minX && h.x - h.length / 2 <= maxX
  );
  const visibleChests = chests.filter((c) => !c.isOpened && c.x >= minX && c.x <= maxX);

  // Proximity alerts (nearest upcoming items in next 3km)
  const upcomingStations = stations
    .filter((s) => s.x > currentPx && s.x <= currentPx + 30000)
    .sort((a, b) => a.x - b.x);
  const nearestStation = upcomingStations[0];

  const upcomingHazards = hazardZones
    .filter((h) => h.x + h.length / 2 > currentPx && h.x - h.length / 2 <= currentPx + 30000)
    .sort((a, b) => a.x - b.x);
  const nearestHazard = upcomingHazards[0];

  const upcomingBeasts = beasts
    .filter((b) => !b.isDead && b.x > currentPx && b.x <= currentPx + 15000)
    .sort((a, b) => a.x - b.x);
  const nearestBeast = upcomingBeasts[0];

  // Helper to convert highway X to percentage (0% to 100%)
  const getPercentX = (x: number) => {
    return Math.max(0, Math.min(100, ((x - minX) / totalViewWidthPx) * 100));
  };

  const getHazardIcon = (type: HazardZoneEntity['type']) => {
    switch (type) {
      case 'sandstorm':
        return <Wind className="w-3 h-3 text-amber-400" />;
      case 'heatwave':
        return <Flame className="w-3 h-3 text-orange-500" />;
      case 'bandit_ambush':
        return <ShieldAlert className="w-3 h-3 text-rose-500" />;
      case 'toxic_mire':
        return <AlertTriangle className="w-3 h-3 text-emerald-400" />;
      case 'predator_den':
        return <Skull className="w-3 h-3 text-purple-400" />;
      default:
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
    }
  };

  return (
    <div
      id="highway-mini-map"
      className={`transition-all duration-300 pointer-events-auto ${
        isExpanded
          ? 'fixed inset-x-4 top-20 z-40 bg-[#08080c]/95 border-2 border-[#00f2ff]/60 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-5xl mx-auto'
          : 'bg-[#09090d]/90 border border-[#00f2ff]/40 rounded-lg p-2.5 shadow-xl backdrop-blur-sm w-80'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Radio className="w-4 h-4 text-[#00f2ff] animate-pulse" />
            <div className="absolute w-2 h-2 rounded-full bg-[#00f2ff] animate-ping" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#00f2ff] flex items-center gap-1.5">
            RADAR CAO TỐC
            <span className="text-[9px] font-mono text-gray-400 font-normal">
              [KM {currentKm.toFixed(2)}]
            </span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Zoom Toggles */}
          <div className="flex items-center bg-[#13131a] rounded p-0.5 border border-[#232330] text-[9px] font-mono">
            {[2, 5, 15].map((z) => (
              <button
                key={z}
                onClick={() => setZoomKm(z)}
                className={`px-1.5 py-0.5 rounded transition ${
                  zoomKm === z
                    ? 'bg-[#00f2ff] text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {z}km
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowLegend(!showLegend)}
            title="Chú thích bản đồ"
            className="p-1 rounded bg-[#13131a] border border-[#232330] text-gray-400 hover:text-[#00f2ff] text-[10px]"
          >
            ?
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Thu nhỏ' : 'Phóng to Radar'}
            className="p-1 rounded bg-[#13131a] border border-[#232330] text-gray-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Radar Screen Display */}
      <div
        className={`relative w-full rounded-md border border-[#1a1a24] bg-[#050508] overflow-hidden ${
          isExpanded ? 'h-48' : 'h-24'
        }`}
      >
        {/* Radar Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00f2ff 1px, transparent 1px), linear-gradient(to bottom, #00f2ff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Animated Radar Sweep Beam Line */}
        <div
          className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#00f2ff]/20 to-transparent pointer-events-none animate-[pulse_2.5s_ease-in-out_infinite]"
          style={{
            left: `${getPercentX(currentPx)}%`,
            transform: 'translateX(-50%)',
          }}
        />

        {/* 1. Highway Road Representation */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-[#181820] border-y border-[#333344] flex items-center justify-center">
          {/* Road Center Dashed Line */}
          <div
            className="w-full h-0.5 border-b border-dashed border-yellow-500/70"
            style={{ backgroundSize: '12px 1px' }}
          />
        </div>

        {/* 2. Hazard Zones on Radar */}
        {visibleHazards.map((hazard) => {
          const startPct = getPercentX(hazard.x - hazard.length / 2);
          const endPct = getPercentX(hazard.x + hazard.length / 2);
          const widthPct = Math.max(2, endPct - startPct);

          const hazardColors = {
            sandstorm: 'bg-amber-500/30 border-amber-500 text-amber-300',
            heatwave: 'bg-red-500/30 border-red-500 text-red-300',
            bandit_ambush: 'bg-rose-600/30 border-rose-500 text-rose-200',
            toxic_mire: 'bg-emerald-500/30 border-emerald-500 text-emerald-300',
            predator_den: 'bg-purple-600/30 border-purple-500 text-purple-200',
            spirit_fog: 'bg-indigo-600/30 border-indigo-500 text-indigo-200',
          }[hazard.type] || 'bg-yellow-500/30 border-yellow-500 text-yellow-200';

          return (
            <div
              key={hazard.id}
              className={`absolute top-1/2 -translate-y-1/2 h-10 border border-dashed rounded flex items-center justify-center px-1 overflow-hidden transition ${hazardColors}`}
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
              }}
              title={`${hazard.name} (Độ nguy hiểm: ★${hazard.dangerLevel})`}
            >
              <span className="text-[10px] drop-shadow shrink-0 animate-bounce">{hazard.icon}</span>
              {isExpanded && (
                <span className="text-[8px] font-bold truncate ml-1 uppercase">
                  {hazard.name.split(' ')[0]}
                </span>
              )}
            </div>
          );
        })}

        {/* 3. Supply Stations on Radar */}
        {visibleStations.map((st) => {
          const pct = getPercentX(st.x);
          const distMeters = Math.round((st.x - currentPx) / 10);
          return (
            <div
              key={st.id}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
              style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
              title={`${st.name} (${distMeters > 0 ? `Cách ${distMeters}m` : 'Đã đến'})`}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/30 border-2 border-[#00f2ff] flex items-center justify-center text-white shadow-lg group-hover:scale-125 transition">
                <Store className="w-3 h-3 text-[#00f2ff]" />
              </div>
              <span className="text-[8px] font-mono text-[#00f2ff] bg-black/80 px-1 rounded mt-0.5 whitespace-nowrap border border-[#00f2ff]/30">
                TRẠM
              </span>
            </div>
          );
        })}

        {/* 4. Beast Clusters on Radar */}
        {visibleBeasts.map((beast) => {
          const pct = getPercentX(beast.x);
          const isBossOrNight = beast.rarity === 'brilliant' || beast.rarity === 'epic' || beast.isNightPredator;
          return (
            <div
              key={beast.id}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
              style={{
                left: `${pct}%`,
                transform: `translate(-50%, ${beast.laneOffset > 0 ? '12px' : '-22px'})`,
              }}
              title={`${beast.name} (${beast.hp}/${beast.maxHp} HP)`}
            >
              <div
                className={`rounded-full flex items-center justify-center shadow-lg transition ${
                  isBossOrNight
                    ? 'w-4 h-4 bg-red-600 border border-yellow-300 animate-ping'
                    : 'w-2.5 h-2.5 bg-red-500 border border-white'
                }`}
              >
                {isBossOrNight && <Skull className="w-2.5 h-2.5 text-white" />}
              </div>
            </div>
          );
        })}

        {/* 5. Resource Chests on Radar */}
        {visibleChests.map((chest) => {
          const pct = getPercentX(chest.x);
          const chestColor =
            chest.rarity === 'brilliant'
              ? 'bg-rose-500'
              : chest.rarity === 'epic'
              ? 'bg-amber-400'
              : chest.rarity === 'perfect'
              ? 'bg-purple-500'
              : chest.rarity === 'superior'
              ? 'bg-sky-400'
              : 'bg-emerald-400';

          return (
            <div
              key={chest.id}
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${pct}%`,
                transform: `translate(-50%, ${chest.laneOffset > 0 ? '6px' : '-14px'})`,
              }}
              title={`Rương ${chest.rarity.toUpperCase()}`}
            >
              <div className={`w-1.5 h-1.5 rounded-sm ${chestColor} shadow-sm`} />
            </div>
          );
        })}

        {/* 6. Player / RV Current Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
          style={{
            left: `${getPercentX(currentPx)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Beacon pulse circle */}
          <div className="absolute w-7 h-7 rounded-full bg-[#00f2ff]/20 animate-ping" />

          {/* Player marker icon */}
          <div className="relative w-4 h-4 rounded-full bg-[#00f2ff] border-2 border-white shadow-[0_0_12px_#00f2ff] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
          </div>

          <span className="text-[8px] font-black text-black bg-[#00f2ff] px-1 rounded-sm shadow-md font-mono mt-1 whitespace-nowrap">
            {mode === 'driving' ? `RV ${Math.round(speed)}km/h` : 'BẠN (ĐI BỘ)'}
          </span>
        </div>

        {/* Kilometer milestone tags at bottom of radar */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-[#050508]/80 border-t border-[#1a1a24] flex justify-between px-2 text-[8px] font-mono text-gray-500">
          <span>KM {(minX / 10000).toFixed(1)}</span>
          <span className="text-[#00f2ff] font-bold">VỊ TRÍ: KM {currentKm.toFixed(2)}</span>
          <span>KM {(maxX / 10000).toFixed(1)}</span>
        </div>
      </div>

      {/* Proximity Warning & Threat Tracker */}
      <div className="mt-2 pt-2 border-t border-[#1a1a24] space-y-1 text-[10px]">
        {/* Nearest Threat Notice */}
        {nearestHazard && (
          <div className="flex items-center justify-between text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2 py-1 rounded text-[10px]">
            <div className="flex items-center gap-1.5 truncate">
              <span>{nearestHazard.icon}</span>
              <span className="font-bold truncate">{nearestHazard.name}</span>
            </div>
            <span className="font-mono text-amber-200 font-bold shrink-0 ml-2">
              cách {Math.max(0, Math.round((nearestHazard.x - currentPx) / 10))}m
            </span>
          </div>
        )}

        {/* Nearest Beast Notice */}
        {nearestBeast && (
          <div className="flex items-center justify-between text-rose-300 bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded text-[9px]">
            <div className="flex items-center gap-1.5 truncate">
              <Skull className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">{nearestBeast.name}</span>
            </div>
            <span className="font-mono text-rose-200 font-bold shrink-0 ml-2">
              cách {Math.max(0, Math.round((nearestBeast.x - currentPx) / 10))}m
            </span>
          </div>
        )}

        {/* Nearest Supply Station */}
        {nearestStation && (
          <div className="flex items-center justify-between text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded text-[9px]">
            <div className="flex items-center gap-1.5 truncate">
              <Store className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{nearestStation.name}</span>
            </div>
            <span className="font-mono text-cyan-200 font-bold shrink-0 ml-2">
              cách {Math.max(0, ((nearestStation.x - currentPx) / 10000)).toFixed(2)}km
            </span>
          </div>
        )}
      </div>

      {/* Legend Drawer */}
      {showLegend && (
        <div className="mt-2 p-2 bg-[#0c0c12] border border-[#232330] rounded text-[9px] text-gray-300 space-y-1">
          <div className="font-bold text-[#00f2ff] uppercase text-[9px] mb-1">Ký Hiệu Radar:</div>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00f2ff]" />
              <span>Vị trí của bạn / RV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="w-3 h-3 text-[#00f2ff]" />
              <span>Trạm tiếp tế</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Dã thú / Quái vật</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Skull className="w-3 h-3 text-rose-500" />
              <span>Dã thú Săn đêm / Boss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">🌪️ 🌡️ ☠️</span>
              <span>Khu vực nguy hiểm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-yellow-400" />
              <span>Rương tài nguyên</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
