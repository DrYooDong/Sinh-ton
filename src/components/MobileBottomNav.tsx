import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import {
  Package,
  Hammer,
  Car,
  Zap,
  MessageSquare,
  Trophy,
  Bot,
  Menu,
  X,
  Save,
  HelpCircle,
  Keyboard,
  Volume2,
  VolumeX,
  Music,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sprout,
  Compass,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenInventory: () => void;
  onOpenCrafting: () => void;
  onOpenVehicle: () => void;
  onOpenSkills: () => void;
  onOpenChat: () => void;
  onOpenQuests: () => void;
  onOpenGeminiAI: () => void;
  onOpenGrowth?: () => void;
  onOpenSave: () => void;
  onOpenTutorial: () => void;
  onOpenKeybindings: () => void;
  isMuted: boolean;
  isBgmPlaying: boolean;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  courageBadges: number;
  inventoryCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenInventory,
  onOpenCrafting,
  onOpenVehicle,
  onOpenSkills,
  onOpenChat,
  onOpenQuests,
  onOpenGeminiAI,
  onOpenGrowth,
  onOpenSave,
  onOpenTutorial,
  onOpenKeybindings,
  isMuted,
  isBgmPlaying,
  onToggleMute,
  onToggleBgm,
  courageBadges,
  inventoryCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAction = (action?: () => void) => {
    if (!action) return;
    soundEngine.playClick();
    action();
  };

  return (
    <>
      {/* Mobile Expandable Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-fadeIn font-mono">
          <div className="bg-[#0e0e14] border-t-2 border-[#00f2ff]/60 rounded-t-2xl p-4 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#252530]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm uppercase tracking-wider block">
                    DANH MỤC TÍNH NĂNG
                  </span>
                  <span className="text-[10px] text-gray-400">Chọn bảng điều khiển để tương tác</span>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges Overview Card */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1a1505] to-[#161620] px-3.5 py-2.5 rounded-xl border border-amber-500/40 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-300 font-bold block">Huy Hiệu Dũng Khí:</span>
                  <span className="text-[9px] text-amber-300/80">Dùng để kích hoạt Thiên Phú & Đột Phá</span>
                </div>
              </div>
              <span className="text-base font-black text-amber-400 tracking-wider">{courageBadges} ĐIỂM</span>
            </div>

            {/* Group 1: SINH TỒN & TRƯỞNG THÀNH */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                ⚡ SINH TỒN & TRƯỞNG THÀNH
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {/* Trưởng Thành & Đột Phá */}
                {onOpenGrowth && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleAction(onOpenGrowth);
                    }}
                    className="p-3 bg-gradient-to-br from-[#1a102b] to-[#151224] hover:bg-[#201838] rounded-xl border border-purple-500/50 hover:border-purple-400 flex items-center gap-2.5 text-purple-300 active:scale-95 transition text-left shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
                    <div>
                      <div className="text-xs">TRƯỞNG THÀNH</div>
                      <div className="text-[9px] text-purple-300/80 font-normal">Cảnh giới & Vườn RV</div>
                    </div>
                  </button>
                )}

                {/* Thiên Phú */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAction(onOpenSkills);
                  }}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] hover:border-amber-500/50 flex items-center gap-2.5 text-amber-300 active:scale-95 transition text-left"
                >
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs">THIÊN PHÚ</div>
                    <div className="text-[9px] text-gray-400 font-normal">Cây kỹ năng 100%</div>
                  </div>
                </button>

                {/* Nhiệm Vụ */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAction(onOpenQuests);
                  }}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] hover:border-purple-500/50 flex items-center gap-2.5 text-purple-300 active:scale-95 transition text-left"
                >
                  <Trophy className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs">NHIỆM VỤ</div>
                    <div className="text-[9px] text-gray-400 font-normal">Cốt truyện & Danh hiệu</div>
                  </div>
                </button>

                {/* Chợ & Chat Thế Giới */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAction(onOpenChat);
                  }}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] hover:border-[#00f2ff]/50 flex items-center gap-2.5 text-[#00f2ff] active:scale-95 transition text-left"
                >
                  <MessageSquare className="w-4 h-4 text-[#00f2ff] shrink-0" />
                  <div>
                    <div className="text-xs">CHỢ & GIAO DỊCH</div>
                    <div className="text-[9px] text-gray-400 font-normal">Kênh chat xa lộ</div>
                  </div>
                </button>

                {/* Sổ tay tân thủ */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAction(onOpenTutorial);
                  }}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] hover:border-emerald-500/50 flex items-center gap-2.5 text-emerald-300 active:scale-95 transition text-left col-span-2 sm:col-span-1"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs">SỔ TAY TÂN THỦ</div>
                    <div className="text-[9px] text-gray-400 font-normal">Mẹo & Cơ chế sống còn</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Group 2: HỆ THỐNG & CÀI ĐẶT */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                ⚙️ HỆ THỐNG & CÀI ĐẶT
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {/* Lưu Game */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAction(onOpenSave);
                  }}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] flex items-center gap-2.5 text-gray-200 active:scale-95 transition text-left"
                >
                  <Save className="w-4 h-4 text-[#00f2ff] shrink-0" />
                  <div>
                    <div className="text-xs">LƯU & XUẤT FILE</div>
                    <div className="text-[9px] text-gray-400 font-normal">Backup dữ liệu</div>
                  </div>
                </button>

                {/* Cài đặt phím */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleAction(onOpenKeybindings);
                  }}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] flex items-center gap-2.5 text-gray-200 active:scale-95 transition text-left"
                >
                  <Keyboard className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs">CÀI ĐẶT PHÍM</div>
                    <div className="text-[9px] text-gray-400 font-normal">Tùy biến nút bấm</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Group 3: ÂM THANH */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                🔊 ÂM THANH
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {/* Âm thanh BGM */}
                <button
                  onClick={() => handleAction(onToggleBgm)}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] flex items-center justify-between text-gray-200 active:scale-95 transition"
                >
                  <div className="flex items-center gap-2">
                    <Music className={`w-4 h-4 ${isBgmPlaying ? 'text-purple-400' : 'text-gray-500'}`} />
                    <span>NHẠC NỀN</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isBgmPlaying ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40' : 'bg-gray-800 text-gray-500'}`}>
                    {isBgmPlaying ? 'BẬT' : 'TẮT'}
                  </span>
                </button>

                {/* Âm thanh SFX */}
                <button
                  onClick={() => handleAction(onToggleMute)}
                  className="p-3 bg-[#161620] hover:bg-[#20202e] rounded-xl border border-[#2d2d3d] flex items-center justify-between text-gray-200 active:scale-95 transition"
                >
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-4 h-4 text-[#ff4b2b]" /> : <Volume2 className="w-4 h-4 text-[#4cd137]" />}
                    <span>HIỆU ỨNG</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${!isMuted ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-rose-900/60 text-rose-300 border border-rose-500/40'}`}>
                    {!isMuted ? 'BẬT' : 'TẮT'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Tab when Collapsed */}
      {isCollapsed && (
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsCollapsed(false);
          }}
          className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-40 bg-[#0e0e14]/90 border border-[#00f2ff]/60 text-[#00f2ff] px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5 text-xs font-bold active:scale-95 transition select-none font-mono"
        >
          <ChevronUp className="w-4 h-4" />
          <span>MỞ THANH MENU</span>
        </button>
      )}

      {/* Streamlined Bottom Navigation Bar for Mobile & Tablet */}
      {!isCollapsed && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0c10]/95 border-t border-[#252530] backdrop-blur-lg px-2 py-1.5 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] select-none font-mono flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-1">
            {/* 1. Túi đồ */}
            <button
              onClick={() => handleAction(onOpenInventory)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl bg-[#14141c]/60 active:bg-[#1a1a24] text-gray-300 hover:text-white active:scale-95 transition"
            >
              <div className="relative">
                <Package className="w-5 h-5 text-[#ffcc00]" />
                {inventoryCount > 0 && (
                  <span className="absolute -top-1 -right-2 text-[8px] bg-[#ff416c] text-white rounded-full px-1 font-bold">
                    {inventoryCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-0.5 text-gray-300">TÚI ĐỒ</span>
            </button>

            {/* 2. Bàn rèn */}
            <button
              onClick={() => handleAction(onOpenCrafting)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl bg-[#14141c]/60 active:bg-[#1a1a24] text-gray-300 hover:text-white active:scale-95 transition"
            >
              <Hammer className="w-5 h-5 text-[#ff4b2b]" />
              <span className="text-[10px] font-bold mt-0.5 text-gray-300">BÀN RÈN</span>
            </button>

            {/* 3. Xe nhà */}
            <button
              onClick={() => handleAction(onOpenVehicle)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl bg-[#14141c]/60 active:bg-[#1a1a24] text-gray-300 hover:text-white active:scale-95 transition"
            >
              <Car className="w-5 h-5 text-[#00f2ff]" />
              <span className="text-[10px] font-bold mt-0.5 text-gray-300">XE NHÀ</span>
            </button>

            {/* 4. Trưởng Thành & Đột Phá */}
            {onOpenGrowth && (
              <button
                onClick={() => handleAction(onOpenGrowth)}
                className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 active:scale-95 transition"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] font-bold mt-0.5 text-purple-300">TIẾN HÓA</span>
              </button>
            )}

            {/* 5. Trợ lý Cố Vấn AI */}
            <button
              onClick={() => handleAction(onOpenGeminiAI)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl bg-[#00f2ff]/10 active:bg-[#00f2ff]/20 text-cyan-300 border border-[#00f2ff]/30 active:scale-95 transition"
            >
              <div className="relative">
                <Bot className="w-5 h-5 text-cyan-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <span className="text-[10px] font-black mt-0.5 text-cyan-300">CỐ VẤN AI</span>
            </button>

            {/* 6. Menu Thêm */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsMenuOpen(true);
              }}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl bg-[#14141c]/60 active:bg-[#1a1a24] text-gray-300 hover:text-white active:scale-95 transition"
            >
              <Menu className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-bold mt-0.5 text-amber-400">MENU</span>
            </button>
          </div>

          {/* Quick Collapse Arrow */}
          <div className="flex justify-center -mb-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsCollapsed(true);
              }}
              className="text-gray-500 hover:text-gray-300 p-0.5 active:scale-95 transition"
              title="Thu gọn thanh điều hướng"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      )}
    </>
  );
};
