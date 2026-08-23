import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import { ChestEntity, BeastEntity, SupplyStationEntity, ItemRarity, InventoryItem } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { MiniMap } from './MiniMap';
import { Crosshair, Swords, Disc, Lightbulb, Compass, Navigation, Zap, Shield, Footprints, AlertTriangle } from 'lucide-react';

interface GameCanvasProps {
  engine: GameEngine;
  equippedWeapon?: InventoryItem;
  hasBaitItem: boolean;
  vehicleSpeed?: number;
  onOpenChestModal: (chest: ChestEntity) => void;
  onVisitStationModal: (station: SupplyStationEntity) => void;
  onHarvestBeastModal: (beast: BeastEntity) => void;
  onDriveToggle: (isDriving: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  equippedWeapon,
  hasBaitItem,
  vehicleSpeed = 0,
  onOpenChestModal,
  onVisitStationModal,
  onHarvestBeastModal,
  onDriveToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nearbyChest, setNearbyChest] = useState<ChestEntity | null>(null);
  const [nearbyDeadBeast, setNearbyDeadBeast] = useState<BeastEntity | null>(null);
  const [nearbyStation, setNearbyStation] = useState<SupplyStationEntity | null>(null);
  const [isDriving, setIsDriving] = useState<boolean>(true);
  const [radarCount, setRadarCount] = useState<number>(0);
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    engine.attachCanvas(canvasRef.current);

    // Engine Event Hooks
    engine.onOpenChest = (chest) => onOpenChestModal(chest);
    engine.onVisitStation = (station) => onVisitStationModal(station);
    engine.onHarvestBeast = (beast) => onHarvestBeastModal(beast);

    // Resize observer
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.keys[e.code] = true;
      if (e.code === 'KeyE') {
        // Quick interact key (loot / station / drive switch)
        if (nearbyChest) onOpenChestModal(nearbyChest);
        else if (nearbyDeadBeast) onHarvestBeastModal(nearbyDeadBeast);
        else if (nearbyStation) onVisitStationModal(nearbyStation);
      }
      if (e.code === 'KeyF') {
        // Toggle Driving / On-Foot mode
        handleToggleMode();
      }
      if (e.code === 'Space') {
        // Spacebar to attack / shoot
        handleAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Periodic detection loop for nearby objects & map sync
    const scanInterval = setInterval(() => {
      const px = engine.mode === 'driving' ? engine.carX : engine.playerX;
      const py = engine.mode === 'driving' ? engine.carLaneY : engine.playerY;

      // Scan nearby chests
      let foundChest: ChestEntity | null = null;
      let totalRadar = 0;
      for (const c of engine.chests) {
        if (c.isOpened) continue;
        const dist = Math.sqrt((c.x - px) ** 2 + (c.laneOffset - py) ** 2);
        if (dist < 500) totalRadar++;
        if (dist < 80) foundChest = c;
      }
      setNearbyChest(foundChest);
      setRadarCount(totalRadar);

      // Scan nearby dead beasts for harvesting
      let foundBeast: BeastEntity | null = null;
      for (const b of engine.beasts) {
        if (!b.isDead) continue;
        const dist = Math.sqrt((b.x - px) ** 2 + (b.laneOffset - py) ** 2);
        if (dist < 80) foundBeast = b;
      }
      setNearbyDeadBeast(foundBeast);

      // Scan nearby supply stations
      let foundStation: SupplyStationEntity | null = null;
      for (const s of engine.stations) {
        const dist = Math.sqrt((s.x - px) ** 2 + (s.laneOffset - py) ** 2);
        if (dist < 120) foundStation = s;
      }
      setNearbyStation(foundStation);

      setTick((t) => (t + 1) % 1000);
    }, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(scanInterval);
      engine.detach();
    };
  }, [engine]);

  const handleToggleMode = () => {
    soundEngine.playClick();
    const newMode = engine.mode === 'driving' ? 'onfoot' : 'driving';
    engine.mode = newMode;
    if (newMode === 'onfoot') {
      engine.playerX = engine.carX;
      engine.playerY = engine.carLaneY + 30;
    }
    setIsDriving(newMode === 'driving');
    onDriveToggle(newMode === 'driving');
  };

  const handleAttack = (e?: React.MouseEvent) => {
    let screenX = engine.width / 2 + 100;
    let screenY = engine.height / 2;

    if (e && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      screenX = e.clientX - rect.left;
      screenY = e.clientY - rect.top;
    }

    const isGun = equippedWeapon?.id.includes('gun') || equippedWeapon?.id.includes('desert_eagle');
    const isBlade = equippedWeapon?.id.includes('dagger') || equippedWeapon?.id.includes('dao');

    if (isGun) {
      soundEngine.playGunshot();
      engine.playerAttack('bullet', equippedWeapon?.stats?.damage || 80, screenX, screenY);
    } else if (isBlade) {
      soundEngine.playSlash();
      engine.playerAttack('stone', equippedWeapon?.stats?.damage || 35, screenX, screenY);
    } else {
      soundEngine.playClick();
      engine.playerAttack('stone', 15, screenX, screenY);
    }
  };

  const handleThrowBait = () => {
    soundEngine.playClick();
    engine.playerAttack('bait', 0, engine.width / 2 + 120, engine.height / 2);
  };

  return (
    <div className="relative w-full h-full flex-1 bg-[#050506] overflow-hidden select-none font-mono">
      
      {/* 2D Canvas Target */}
      <canvas
        ref={canvasRef}
        onClick={handleAttack}
        className="w-full h-full block cursor-crosshair"
      />

      {/* TOP-LEFT TACTICAL HIGHWAY MINI-MAP RADAR */}
      <div className="absolute top-3 left-3 z-30">
        <MiniMap
          playerX={engine.playerX}
          carX={engine.carX}
          mode={engine.mode}
          speed={vehicleSpeed}
          stations={engine.stations}
          beasts={engine.beasts}
          hazardZones={engine.hazardZones}
          chests={engine.chests}
        />
      </div>

      {/* DRIVING / ON-FOOT TOGGLE BUTTON */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
        <button
          onClick={handleToggleMode}
          className={`px-4 py-2 rounded font-bold text-xs shadow-2xl border flex items-center gap-2 transition tracking-wider ${
            isDriving
              ? 'bg-[#1a1a1d] hover:bg-[#252529] text-[#ffcc00] border-[#ffcc00]/60'
              : 'bg-[#131315] hover:bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]/60'
          }`}
        >
          {isDriving ? <Footprints className="w-4 h-4 text-[#ffcc00]" /> : <Navigation className="w-4 h-4 text-[#00f2ff]" />}
          {isDriving ? '[F] XUỐNG XE ĐI BỘ' : '[F] LÊN XE TIẾP TỤC'}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            engine.headlightsOn = !engine.headlightsOn;
          }}
          className={`p-2 rounded border text-xs font-bold transition ${
            engine.headlightsOn ? 'bg-[#ffcc00] text-black border-[#ffcc00]' : 'bg-[#131315] text-gray-400 border-[#2d2d30]'
          }`}
          title="Bật/Tắt Đèn Pha"
        >
          <Lightbulb className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK CONTEXT ACTION POPUPS (When near chest, dead beast, or station) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto z-30">
        {nearbyChest && !nearbyChest.isOpened && (
          <button
            onClick={() => {
              soundEngine.playLootChest();
              onOpenChestModal(nearbyChest);
            }}
            className="px-6 py-3 bg-[#131315] hover:bg-[#1a1a1d] text-[#ffcc00] font-black rounded border-2 border-[#ffcc00] text-sm shadow-2xl flex items-center gap-2 animate-bounce uppercase tracking-wider"
          >
            <span>[E] MỞ RƯƠNG {nearbyChest.rarity.toUpperCase()}</span>
          </button>
        )}

        {nearbyDeadBeast && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onHarvestBeastModal(nearbyDeadBeast);
            }}
            className="px-5 py-2.5 bg-[#131315] hover:bg-[#1a1a1d] text-[#4cd137] font-bold rounded border-2 border-[#4cd137] text-xs shadow-xl flex items-center gap-2 animate-pulse uppercase tracking-wider"
          >
            <span>[E] THU HOẠCH XÁC THÚ</span>
          </button>
        )}

        {nearbyStation && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onVisitStationModal(nearbyStation);
            }}
            className="px-5 py-2.5 bg-[#131315] hover:bg-[#1a1a1d] text-[#00f2ff] font-bold rounded border-2 border-[#00f2ff] text-xs shadow-xl flex items-center gap-2 animate-pulse uppercase tracking-wider"
          >
            <span>[E] VÀO TRẠM TIẾP TẾ</span>
          </button>
        )}
      </div>

      {/* ON-SCREEN VIRTUAL COMBAT & DRIVING CONTROLS */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-30">
        {/* Throw Bait Button */}
        <button
          onClick={handleThrowBait}
          className="px-3.5 py-2.5 bg-[#131315] hover:bg-[#1a1a1d] border border-[#ff416c]/60 text-[#ff416c] font-bold rounded text-xs shadow-xl flex items-center gap-1.5 transition active:scale-95 uppercase tracking-wider"
        >
          <span>NÉM MỒI DỤ THÚ</span>
        </button>

        {/* Primary Attack Button */}
        <button
          onClick={(e) => handleAttack(e)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#ff4b2b] to-[#ff416c] hover:opacity-90 text-white font-bold rounded text-xs shadow-2xl border border-[#ff4b2b] flex items-center gap-2 transition active:scale-95 uppercase tracking-wider"
        >
          <Crosshair className="w-4 h-4" />
          <span>{equippedWeapon ? equippedWeapon.name.toUpperCase() : 'TẤN CÔNG [SPACE]'}</span>
        </button>
      </div>

      {/* WASD / Driving Instructions Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#0c0c0e]/90 border border-[#2d2d30] rounded px-3 py-1.5 text-[10px] text-gray-400 pointer-events-none hidden sm:block z-30">
        <span className="text-[#00f2ff] font-bold">ĐIỀU KHIỂN:</span> [W/A/S/D] DI CHUYỂN • [SPACE] TẤN CÔNG • [E] MỞ RƯƠNG • [F] ĐI BỘ/LÁI XE
      </div>

    </div>
  );
};
