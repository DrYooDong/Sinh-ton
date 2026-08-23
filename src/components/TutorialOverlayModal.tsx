import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Keyboard,
  Car,
  Hammer,
  Bot,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Compass,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Clock,
  Thermometer,
  Award
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface TutorialOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrafting?: () => void;
  onOpenVehicle?: () => void;
}

export const TutorialOverlayModal: React.FC<TutorialOverlayModalProps> = ({
  isOpen,
  onClose,
  onOpenCrafting,
  onOpenVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'survival' | 'crafting' | 'ai'>('shortcuts');

  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playClick();
    localStorage.setItem('highway_tutorial_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md font-mono text-[#e0e0e0]">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-4xl bg-[#09090b] border-2 border-cyan-500/60 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] relative rounded-lg overflow-hidden"
      >
        {/* Floating Top Badge */}
        <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 px-3.5 py-0.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 rounded-full shadow-lg">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SỔ TAY HƯỚNG DẪN SINH TỒN XA LỘ 2D</span>
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3 mt-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span className="text-cyan-400">HƯỚNG DẪN TÂN THỦ</span>
              <span className="text-xs bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/50">
                PHIÊN BẢN TUYẾT MỘC
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Nắm vững hệ thống điều khiển, bàn rèn 10 Phát Nhập Hồn và cơ chế sinh tồn trên xa lộ vô tận
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded border border-transparent hover:border-neutral-700 transition cursor-pointer text-xs font-bold flex items-center gap-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 pb-2 mb-3 gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'shortcuts', label: '⌨️ BẢNG PHÍM TẮT', icon: Keyboard },
            { id: 'survival', label: '🚗 CƠ CHẾ SINH TỒN & XE RV', icon: Car },
            { id: 'crafting', label: '🔨 BÀN RÈN 10 PHÁT NHẬP HỒN', icon: Hammer },
            { id: 'ai', label: '🤖 TRỢ LÝ AI GEMINI', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Lái Xe & Tác Vụ */}
                <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-2.5">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-1.5">
                    <Car className="w-4 h-4" />
                    <span>ĐIỀU KHIỂN LÁI XE & TÁC CHIẾN</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Tăng ga / Tiến lên:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-cyan-300 font-bold text-[11px] shadow">W</kbd>
                        <span className="text-neutral-500">hoặc</span>
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-cyan-300 font-bold text-[11px] shadow">↑</kbd>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Phanh / Giảm tốc:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-cyan-300 font-bold text-[11px] shadow">S</kbd>
                        <span className="text-neutral-500">hoặc</span>
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-cyan-300 font-bold text-[11px] shadow">↓</kbd>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Chuyển làn Trái / Phải:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-cyan-300 font-bold text-[11px] shadow">A</kbd>
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-cyan-300 font-bold text-[11px] shadow">D</kbd>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Tấn công / Bắn súng:</span>
                      <div className="flex gap-1 items-center">
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-red-400 font-bold text-[11px] shadow">F</kbd>
                        <span className="text-neutral-500">/</span>
                        <span className="text-neutral-400 text-[10px]">Chuột Trái</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Bấm Còi Xua Đuổi Quái:</span>
                      <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-amber-300 font-bold text-[11px] shadow">H</kbd>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Bật/Tắt Đèn Pha Đêm:</span>
                      <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-yellow-300 font-bold text-[11px] shadow">L</kbd>
                    </div>
                  </div>
                </div>

                {/* Phím Tắt Mở Cửa Sổ Modal */}
                <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-2.5">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>TRUY CẬP NHANH CỬA SỔ (MODALS)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">🔨 Bàn Rèn & Chế Tạo:</span>
                      <kbd className="px-2.5 py-0.5 bg-neutral-800 border border-amber-600/60 rounded text-amber-300 font-bold text-[11px] shadow">C</kbd>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">🚗 Xe RV & Nâng Cấp:</span>
                      <kbd className="px-2.5 py-0.5 bg-neutral-800 border border-cyan-600/60 rounded text-cyan-300 font-bold text-[11px] shadow">V</kbd>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">🎒 Túi Đồ & Trang Bị:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-emerald-600/60 rounded text-emerald-300 font-bold text-[11px] shadow">I</kbd>
                        <span className="text-neutral-500">/</span>
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-emerald-600/60 rounded text-emerald-300 font-bold text-[11px] shadow">B</kbd>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">🌐 Kênh Thế Giới & Chợ:</span>
                      <kbd className="px-2.5 py-0.5 bg-neutral-800 border border-blue-600/60 rounded text-blue-300 font-bold text-[11px] shadow">M</kbd>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">⚡ Cây Kỹ Năng Sinh Tồn:</span>
                      <kbd className="px-2.5 py-0.5 bg-neutral-800 border border-purple-600/60 rounded text-purple-300 font-bold text-[11px] shadow">K</kbd>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">🏆 Nhiệm Vụ & Thành Tựu:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-purple-600/60 rounded text-purple-300 font-bold text-[11px] shadow">J</kbd>
                        <span className="text-neutral-500">/</span>
                        <kbd className="px-2 py-0.5 bg-neutral-800 border border-purple-600/60 rounded text-purple-300 font-bold text-[11px] shadow">Q</kbd>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">🤖 Cố Vấn Gemini AI:</span>
                      <kbd className="px-2.5 py-0.5 bg-neutral-800 border border-cyan-500 rounded text-cyan-300 font-bold text-[11px] shadow">P</kbd>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">✕ Đóng cửa sổ đang mở:</span>
                      <kbd className="px-2.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-neutral-400 font-bold text-[11px] shadow">ESC</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Mẹo Nhanh */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-lg flex items-center justify-between text-cyan-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Bạn có thể mở lại bảng hướng dẫn này bất cứ lúc nào bằng nút <strong>[?] HƯỚNG DẪN</strong> trên thanh HUD trên cùng!</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SURVIVAL MECHANICS */}
          {activeTab === 'survival' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Quản lý sinh hiệu */}
                <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                    <Thermometer className="w-4 h-4" />
                    <span>4 CHỈ SỐ SINH TỒN SỐNG CÒN</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                    <li>❤️ <strong>Sinh Lực (HP):</strong> Giảm khi bị dã thú cắn hoặc va chạm chướng ngại vật ở tốc độ cao.</li>
                    <li>🍗 <strong>Độ No & Cơn Đói:</strong> Tiêu hao theo thời gian, ăn Thịt Nướng hoặc Lương Khô để bổ sung.</li>
                    <li>💧 <strong>Nước Uống:</strong> Cần thiết để duy trì thể lực và làm mát cơ thể khi nhiệt độ sa mạc lên cao.</li>
                    <li>🌡️ <strong>Thân Nhiệt (Body Temp):</strong> Nguy hiểm nhất! Vượt quá 39.5°C sẽ bị sốc nhiệt kiệt sức. Cần bật Điều Hòa RV [V], uống nước đá hoặc làm kem từ tủ lạnh.</li>
                  </ul>
                </div>

                {/* Quản lý Xe RV */}
                <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-2">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                    <Car className="w-4 h-4" />
                    <span>VẬN HÀNH XE RV & NHIÊN LIỆU</span>
                  </div>
                  <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                    <li>⛽ <strong>Xăng Dầu:</strong> Xe tiêu hao xăng khi di chuyển. Lượm Thùng Xăng ven đường hoặc ghé Trạm Dịch.</li>
                    <li>🛡️ <strong>Độ Bền Xe:</strong> Khi quái thú tấn công hoặc đâm chướng ngại vật, xe sẽ hư hại. Hãy bấm [SỬA XE] khi dừng lại.</li>
                    <li>❄️ <strong>Điều Hòa & Bồn Nước:</strong> Nâng cấp Lõi RV để mở rộng bồn nước tắm, tạo đá viên giải nhiệt.</li>
                    <li>🐾 <strong>Thú Cưng Đồng Hành:</strong> Đừng quên ấp Trứng Thú Cưng trong Túi Đồ [I] để có Pet trợ chiến!</li>
                  </ul>
                </div>
              </div>

              {/* Chu Kỳ Ngày Đêm */}
              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-2">
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                  <Clock className="w-4 h-4" />
                  <span>CHU KỲ NGÀY / ĐÊM & CÁC CHẶNG XA LỘ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300 text-[11px]">
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                    <strong className="text-yellow-400">☀️ Ban Ngày (06:00 - 18:00):</strong> Tầm nhìn xa, nhiệt độ tăng cao. Thời điểm tốt để gom rương báu và tích lũy nguyên liệu.
                  </div>
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                    <strong className="text-rose-400">🌙 Ban Đêm (18:00 - 06:00):</strong> Quái vật tăng 30% tốc độ và sát thương! Nhớ bật Đèn Pha [L] và chuẩn bị vũ khí.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRAFTING & 10-TALENT SOUL INFUSION */}
          {activeTab === 'crafting' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-950 border border-amber-500/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                    THIÊN PHÚ ĐỘC NHẤT: 10 PHÁT NHẬP HỒN (SOUL INFUSION)
                  </h4>
                </div>

                <p className="text-neutral-300 leading-relaxed">
                  Bạn mang theo Thiên Phú độc quyền của Tuyết Mộc: Cứ sau <strong className="text-amber-400">9 lần chế tạo bất kỳ</strong>, phát rèn thứ 10 <strong className="text-amber-300 underline">CHẮC CHẮN 100% KÍCH HOẠT NHẬP HỒN</strong> thăng phẩm chất trang bị lên cấp Tinh Xảo, Hoàn Hảo hoặc Rực Rỡ!
                </p>

                <div className="p-3 bg-neutral-950/80 rounded border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>CHIẾN THUẬT RÈN CỦA TUYẾT MỘC:</span>
                  </div>
                  <p>1. Rèn 9 cuộn Giấy Vệ Sinh hoặc Đinh Sắt rẻ tiền để đẩy đồng hồ đếm lên 9/10.</p>
                  <p>2. Ở lần thứ 10, chọn rèn các món vũ khí, giáp, phụ tùng xe RV cao cấp để nhận bạo kích chỉ số cực lớn!</p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-lg space-y-2">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-800 pb-1">
                  <Hammer className="w-4 h-4" />
                  <span>HỆ THỐNG HÀNG CHỜ CHẾ TẠO (CRAFTING QUEUE)</span>
                </div>
                <p className="text-neutral-300 text-[11px]">
                  Bàn rèn hỗ trợ <strong>xếp hàng nhiều công thức chế tạo</strong> cùng lúc với thanh tiến trình tự động. Bạn có thể thêm nhiều món vào hàng chờ và tiếp tục lái xe mà không cần đợi từng món!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI AI COMPANION */}
          {activeTab === 'ai' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-neutral-950 border border-cyan-500/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h4 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                    TRỢ LÝ SINH TỒN GEMINI AI (MULTI-TURN CHAT)
                  </h4>
                </div>

                <p className="text-neutral-300 leading-relaxed text-[11px]">
                  Tích hợp hệ thống AI Cố Vấn Sinh Tồn thời gian thực hỗ trợ đắc lực mọi hành trình. Bạn có thể bấm <kbd className="px-1.5 py-0.5 bg-neutral-800 text-cyan-300 rounded border border-neutral-600 font-bold">[P]</kbd> hoặc nút <strong>[P] TRỢ LÝ AI</strong> trên HUD để tham vấn bất cứ lúc nào.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-neutral-950 rounded border border-cyan-800/40">
                    <strong className="text-cyan-400">🔧 Tuyết Mộc:</strong> Chuyên gia Bàn Rèn & Thiên Phú 10 Phát Nhập Hồn, tối ưu nâng cấp xe RV.
                  </div>
                  <div className="p-2.5 bg-neutral-950 rounded border border-emerald-800/40">
                    <strong className="text-emerald-400">🏥 Bác Sĩ Dã Chiến:</strong> Tư vấn xử lý sốc nhiệt, mất nước, đói khát và độc tố dã thú.
                  </div>
                  <div className="p-2.5 bg-neutral-950 rounded border border-rose-800/40">
                    <strong className="text-rose-400">🎯 Thợ Săn Xạ Thủ:</strong> Phân tích điểm yếu dã thú, gợi ý vũ khí và chiến thuật đêm.
                  </div>
                  <div className="p-2.5 bg-neutral-950 rounded border border-purple-800/40">
                    <strong className="text-purple-400">🧭 Nhà Thám Hiểm:</strong> Thông tin về Trạm Tiếp Tế, giá cả thị trường và bí ẩn xa lộ.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-800 mt-3 flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-400 hidden sm:block">
            Mẹo: Nhấn <kbd className="px-1.5 py-0.5 bg-neutral-800 text-cyan-300 rounded border border-neutral-700">ESC</kbd> để đóng
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onOpenCrafting && (
              <button
                onClick={() => {
                  handleClose();
                  onOpenCrafting();
                }}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold rounded text-xs border border-amber-600/40 transition flex items-center gap-1 cursor-pointer"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>MỞ BÀN RÈN [C]</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-black rounded text-xs transition shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>BẮT ĐẦU SINH TỒN!</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
