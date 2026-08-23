import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { soundEngine } from '../audio/soundEngine';
import { ChestEntity, BeastEntity, SupplyStationEntity, InventoryItem } from '../types';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Footprints,
  Navigation,
  Lightbulb,
  Package,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

interface MobileTouchControlsProps {
  engine: GameEngine;
  isDriving: boolean;
  equippedWeapon?: InventoryItem;
  nearbyChest: ChestEntity | null;
  nearbyDeadBeast: BeastEntity | null;
  nearbyStation: SupplyStationEntity | null;
  onAttack: () => void;
  onThrowBait: () => void;
  onToggleMode: () => void;
  onToggleHeadlights: () => void;
  onInteract: () => void;
  autoCruise?: boolean;
  onToggleAutoCruise?: () => void;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  engine,
  isDriving,
  equippedWeapon,
  nearbyChest,
  nearbyDeadBeast,
  nearbyStation,
  onAttack,
  onThrowBait,
  onToggleMode,
  onToggleHeadlights,
  onInteract,
  autoCruise = false,
  onToggleAutoCruise,
}) => {
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [opacityLevel, setOpacityLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Handle D-pad directional presses with real-time key simulation
  const handleDirectionPress = (key: string, isPressed: boolean) => {
    engine.keys[key] = isPressed;
    if (key === 'ArrowUp' || key === 'KeyW') {
      engine.keys['KeyW'] = isPressed;
      engine.keys['ArrowUp'] = isPressed;
    } else if (key === 'ArrowDown' || key === 'KeyS') {
      engine.keys['KeyS'] = isPressed;
      engine.keys['ArrowDown'] = isPressed;
    } else if (key === 'ArrowLeft' || key === 'KeyA') {
      engine.keys['KeyA'] = isPressed;
      engine.keys['ArrowLeft'] = isPressed;
    } else if (key === 'ArrowRight' || key === 'KeyD') {
      engine.keys['KeyD'] = isPressed;
      engine.keys['ArrowRight'] = isPressed;
    }
  };

  const opacityClass =
    opacityLevel === 'low'
      ? 'opacity-40'
      : opacityLevel === 'medium'
      ? 'opacity-75'
      : 'opacity-95';

  const hasNearbyInteractable = Boolean(nearbyChest || nearbyDeadBeast || nearbyStation);

  return (
    <div className="md:hidden pointer-events-none fixed inset-0 z-30 select-none font-mono">
      {/* Visibility Toggle Button floating discreetly in top right */}
      <div className="absolute top-12 right-2 pointer-events-auto flex items-center gap-1 z-40 bg-[#0c0c0e]/80 border border-[#2d2d30] rounded-full p-1 backdrop-blur-sm">
        <button
          onClick={() => {
            soundEngine.playClick();
            setControlsVisible(!controlsVisible);
          }}
          className="p-1.5 rounded-full bg-[#18181b] text-gray-300 hover:text-[#00f2ff] text-xs transition"
          title={controlsVisible ? 'Ẩn phím ảo' : 'Hiện phím ảo'}
        >
          {controlsVisible ? <Eye className="w-3.5 h-3.5 text-[#00f2ff]" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
        </button>

        {controlsVisible && (
          <button
            onClick={() => {
              soundEngine.playClick();
              setOpacityLevel((prev) => (prev === 'low' ? 'medium' : prev === 'medium' ? 'high' : 'low'));
            }}
            className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#131315] text-[#ffcc00] border border-[#ffcc00]/30"
            title="Độ mờ phím ảo"
          >
            {opacityLevel.toUpperCase()}
          </button>
        )}
      </div>

      {controlsVisible && (
        <div className={`w-full h-full relative transition-opacity duration-200 ${opacityClass}`}>
          
          {/* ==========================================
              LEFT CLUSTER: COMPACT ERGONOMIC D-PAD
             ========================================== */}
          <div className="absolute bottom-20 left-2 pointer-events-auto flex flex-col items-center">
            {/* Up / Accelerate */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                handleDirectionPress('KeyW', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDirectionPress('KeyW', false);
              }}
              onMouseDown={() => handleDirectionPress('KeyW', true)}
              onMouseUp={() => handleDirectionPress('KeyW', false)}
              onMouseLeave={() => handleDirectionPress('KeyW', false)}
              className="w-12 h-12 bg-[#161622]/85 active:bg-[#00f2ff]/40 text-white rounded-xl border border-[#00f2ff]/40 shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
            >
              <ChevronUp className="w-5 h-5 text-[#00f2ff]" />
              <span className="text-[7px] font-bold text-gray-300 leading-none">
                {isDriving ? 'GA' : 'LÊN'}
              </span>
            </button>

            {/* Middle Row: Left, Center Hub, Right */}
            <div className="flex items-center gap-1.5 my-1">
              {/* Left */}
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDirectionPress('KeyA', true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDirectionPress('KeyA', false);
                }}
                onMouseDown={() => handleDirectionPress('KeyA', true)}
                onMouseUp={() => handleDirectionPress('KeyA', false)}
                onMouseLeave={() => handleDirectionPress('KeyA', false)}
                className="w-12 h-12 bg-[#161622]/85 active:bg-[#00f2ff]/40 text-white rounded-xl border border-[#00f2ff]/40 shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
              >
                <ChevronLeft className="w-5 h-5 text-[#00f2ff]" />
                <span className="text-[7px] font-bold text-gray-300 leading-none">TRÁI</span>
              </button>

              {/* Center D-Pad Hub */}
              <div className="w-7 h-7 rounded-full bg-[#0c0c14] border border-[#232332] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#00f2ff]" />
              </div>

              {/* Right */}
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDirectionPress('KeyD', true);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDirectionPress('KeyD', false);
                }}
                onMouseDown={() => handleDirectionPress('KeyD', true)}
                onMouseUp={() => handleDirectionPress('KeyD', false)}
                onMouseLeave={() => handleDirectionPress('KeyD', false)}
                className="w-12 h-12 bg-[#161622]/85 active:bg-[#00f2ff]/40 text-white rounded-xl border border-[#00f2ff]/40 shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
              >
                <ChevronRight className="w-5 h-5 text-[#00f2ff]" />
                <span className="text-[7px] font-bold text-gray-300 leading-none">PHẢI</span>
              </button>
            </div>

            {/* Down / Brake / Move Down */}
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                handleDirectionPress('KeyS', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDirectionPress('KeyS', false);
              }}
              onMouseDown={() => handleDirectionPress('KeyS', true)}
              onMouseUp={() => handleDirectionPress('KeyS', false)}
              onMouseLeave={() => handleDirectionPress('KeyS', false)}
              className="w-12 h-12 bg-[#161622]/85 active:bg-[#00f2ff]/40 text-white rounded-xl border border-[#00f2ff]/40 shadow-lg flex flex-col items-center justify-center active:scale-95 transition"
            >
              <ChevronDown className="w-5 h-5 text-[#00f2ff]" />
              <span className="text-[7px] font-bold text-gray-300 leading-none">
                {isDriving ? 'HÃM' : 'LÙI'}
              </span>
            </button>
          </div>

          {/* ==========================================
              RIGHT CLUSTER: CLEAN ACTION BUTTONS
             ========================================== */}
          <div className="absolute bottom-20 right-2 pointer-events-auto flex flex-col items-end gap-2">
            
            {/* Quick Mode & Utility Bar */}
            <div className="flex items-center gap-1.5">
              {/* Auto Cruise Toggle (When Driving) */}
              {isDriving && onToggleAutoCruise && (
                <button
                  onClick={onToggleAutoCruise}
                  className={`w-9 h-9 border rounded-full flex flex-col items-center justify-center shadow-md active:scale-90 transition ${
                    autoCruise
                      ? 'bg-emerald-500 text-black border-emerald-400 font-black animate-pulse'
                      : 'bg-[#161622]/85 text-emerald-400 border-emerald-500/40'
                  }`}
                  title="Ga tự động Cruise Control"
                >
                  <span className="text-[10px] font-black leading-none">⚡</span>
                  <span className="text-[6px] font-bold">{autoCruise ? 'CRUISE' : 'TỰ ĐỘNG'}</span>
                </button>
              )}

              {/* Throw Bait */}
              <button
                onClick={onThrowBait}
                className="w-9 h-9 bg-[#161622]/85 active:bg-[#ff416c]/40 text-[#ff416c] border border-[#ff416c]/50 rounded-full flex flex-col items-center justify-center shadow-md active:scale-90 transition"
                title="Ném mồi dụ thú"
              >
                <Flame className="w-3.5 h-3.5 text-[#ff416c]" />
                <span className="text-[6px] font-bold">MỒI</span>
              </button>

              {/* Headlights */}
              <button
                onClick={onToggleHeadlights}
                className={`w-9 h-9 border rounded-full flex flex-col items-center justify-center shadow-md active:scale-90 transition ${
                  engine.headlightsOn
                    ? 'bg-[#ffcc00] text-black border-[#ffcc00]'
                    : 'bg-[#161622]/85 text-gray-400 border-[#2d2d35]'
                }`}
                title="Đèn pha"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="text-[6px] font-bold">ĐÈN</span>
              </button>

              {/* Drive / Walk Toggle */}
              <button
                onClick={onToggleMode}
                className={`px-2.5 h-9 rounded-full border flex items-center gap-1 shadow-md active:scale-95 transition font-bold text-[10px] ${
                  isDriving
                    ? 'bg-[#1a1a24] text-[#ffcc00] border-[#ffcc00]/60'
                    : 'bg-[#161622] text-[#00f2ff] border-[#00f2ff]/60'
                }`}
              >
                {isDriving ? <Footprints className="w-3.5 h-3.5 text-[#ffcc00]" /> : <Navigation className="w-3.5 h-3.5 text-[#00f2ff]" />}
                <span>{isDriving ? 'ĐI BỘ' : 'LÊN XE'}</span>
              </button>
            </div>

            {/* Contextual Interact Button (Chest / Harvest / Station) */}
            {hasNearbyInteractable && (
              <button
                onClick={onInteract}
                className="py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black rounded-xl border border-yellow-300 shadow-xl flex items-center justify-center gap-1.5 active:scale-95 transition animate-bounce text-[11px] uppercase tracking-wider"
              >
                <Package className="w-3.5 h-3.5 text-black" />
                <span>
                  {nearbyChest
                    ? `MỞ RƯƠNG ${nearbyChest.rarity.toUpperCase()}`
                    : nearbyDeadBeast
                    ? 'THU HOẠCH THÚ'
                    : 'VÀO TRẠM'}
                </span>
              </button>
            )}

            {/* Main Primary Attack Button */}
            <button
              onClick={onAttack}
              className="w-16 h-16 bg-gradient-to-br from-[#ff4b2b] to-[#ff416c] active:from-[#d63031] active:to-[#e84118] text-white rounded-2xl border-2 border-[#ff7675] shadow-[0_0_20px_rgba(255,75,43,0.4)] flex flex-col items-center justify-center active:scale-90 transition font-black"
            >
              <Crosshair className="w-6 h-6 text-white animate-pulse" />
              <span className="text-[8px] uppercase tracking-tight mt-0.5 truncate max-w-[55px]">
                {equippedWeapon ? equippedWeapon.name : 'TẤN CÔNG'}
              </span>
            </button>

          </div>

        </div>
      )}
    </div>
  );
};
