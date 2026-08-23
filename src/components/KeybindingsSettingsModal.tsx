import React, { useState, useEffect } from 'react';
import { KeybindingsConfig } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Keyboard, RotateCcw, Check, Sparkles, AlertTriangle, Shield } from 'lucide-react';

export const DEFAULT_KEYBINDINGS: KeybindingsConfig = {
  skills: 'KeyK',
  crafting: 'KeyC',
  vehicle: 'KeyV',
  inventory: 'KeyI',
  chat: 'KeyM',
  quests: 'KeyJ',
  companionAI: 'KeyP',
  tutorial: 'F1',
  radio: 'KeyR',
};

interface KeybindingsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keybindings: KeybindingsConfig;
  onSaveKeybindings: (newConfig: KeybindingsConfig) => void;
}

interface ActionKeyDef {
  key: keyof KeybindingsConfig;
  label: string;
  category: 'ui' | 'system';
  description: string;
  icon: string;
}

const ACTION_DEFINITIONS: ActionKeyDef[] = [
  { key: 'skills', label: 'Kỹ Năng Sinh Tồn', category: 'ui', description: 'Mở cây thiên phú & nâng cấp kỹ năng', icon: '⚡' },
  { key: 'crafting', label: 'Bàn Rèn & Chế Tạo', category: 'ui', description: 'Mở xưởng rèn, chế tạo vũ khí, đồ bảo hộ', icon: '🔨' },
  { key: 'vehicle', label: 'Xe Nhà & Tùy Biến', category: 'ui', description: 'Mở bảng nâng cấp xe, điều hòa, bồn nước & radio', icon: '🚐' },
  { key: 'inventory', label: 'Nhẫn Trữ Vật (Túi Đồ)', category: 'ui', description: 'Mở kho đồ cá nhân & quản lý thú cưng', icon: '🎒' },
  { key: 'chat', label: 'Chợ & Kênh Thế Giới', category: 'ui', description: 'Trao đổi vật phẩm & trò chuyện với người chơi khác', icon: '💬' },
  { key: 'quests', label: 'Nhiệm Vụ & Thành Tựu', category: 'ui', description: 'Xem nhiệm vụ cốt truyện và nhận thưởng', icon: '🏆' },
  { key: 'companionAI', label: 'Trợ Lý Cố Vấn AI', category: 'ui', description: 'Tham vấn Gemini AI về chiến thuật sinh tồn', icon: '🤖' },
  { key: 'radio', label: 'Đài Radio Xa Lộ', category: 'ui', description: 'Bật/Tắt và nghe bản tin radio thời tiết & lore', icon: '📻' },
  { key: 'tutorial', label: 'Sổ Tay Hướng Dẫn', category: 'system', description: 'Xem hướng dẫn tân thủ & mẹo chơi', icon: '📖' },
];

export const KeybindingsSettingsModal: React.FC<KeybindingsSettingsModalProps> = ({
  isOpen,
  onClose,
  keybindings,
  onSaveKeybindings,
}) => {
  const [bindings, setBindings] = useState<KeybindingsConfig>(keybindings);
  const [listeningKey, setListeningKey] = useState<keyof KeybindingsConfig | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setBindings(keybindings);
  }, [keybindings, isOpen]);

  // Listen for keypress when rebinding
  useEffect(() => {
    if (!listeningKey) return;

    const handleKeyCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind Escape or tab
      if (e.code === 'Escape') {
        setListeningKey(null);
        setConflictMsg(null);
        return;
      }

      const newCode = e.code;
      
      // Check if this key is already bound to another action
      const duplicateAction = Object.entries(bindings).find(
        ([act, code]) => act !== listeningKey && code === newCode
      );

      if (duplicateAction) {
        const dupDef = ACTION_DEFINITIONS.find((d) => d.key === duplicateAction[0]);
        setConflictMsg(`⚠️ Phím này đã được gán cho "${dupDef?.label || duplicateAction[0]}". Hãy chọn phím khác!`);
        soundEngine.playAlert();
        return;
      }

      soundEngine.playClick();
      setBindings((prev) => ({
        ...prev,
        [listeningKey]: newCode,
      }));
      setListeningKey(null);
      setConflictMsg(null);
    };

    window.addEventListener('keydown', handleKeyCapture, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyCapture, { capture: true });
  }, [listeningKey, bindings]);

  if (!isOpen) return null;

  const formatKeyName = (code: string) => {
    if (code.startsWith('Key')) return code.replace('Key', '');
    if (code.startsWith('Digit')) return code.replace('Digit', '');
    if (code === 'Space') return 'SPACE';
    return code;
  };

  const handleResetDefaults = () => {
    soundEngine.playClick();
    setBindings(DEFAULT_KEYBINDINGS);
    setConflictMsg(null);
  };

  const handleSave = () => {
    soundEngine.playCritFanfare();
    onSaveKeybindings(bindings);
    localStorage.setItem('highway_survival_keybindings', JSON.stringify(bindings));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 rounded">
              <Keyboard className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
                CÀI ĐẶT PHÍM ĐIỀU KHIỂN (KEYBINDINGS)
              </h2>
              <p className="text-[11px] text-gray-400">Tùy chỉnh phím tắt theo thói quen bàn phím của bạn</p>
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

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#08080a]">
          
          {/* Rebinding Status Alert */}
          {listeningKey && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/60 rounded text-amber-300 text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Đang chờ bạn nhấn phím mới cho <strong>"{ACTION_DEFINITIONS.find((d) => d.key === listeningKey)?.label}"</strong>...
                </span>
              </div>
              <span className="text-[10px] text-gray-400">(Nhấn ESC để hủy)</span>
            </div>
          )}

          {conflictMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/60 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{conflictMsg}</span>
            </div>
          )}

          {/* Keybinding items list */}
          <div className="space-y-2">
            {ACTION_DEFINITIONS.map((def) => {
              const currentKey = bindings[def.key];
              const isEditing = listeningKey === def.key;

              return (
                <div
                  key={def.key}
                  className={`p-3 rounded border transition flex items-center justify-between ${
                    isEditing
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-[#131315] border-[#2d2d30] hover:border-[#00f2ff]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-1.5 bg-[#1a1a1d] rounded border border-[#333336]">{def.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {def.label}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{def.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setListeningKey(def.key);
                        setConflictMsg(null);
                      }}
                      className={`min-w-[70px] px-3 py-1.5 rounded font-mono text-xs font-bold transition flex items-center justify-center border shadow ${
                        isEditing
                          ? 'bg-amber-500 text-black border-amber-400 animate-bounce'
                          : 'bg-[#1a1a1d] hover:bg-[#252529] text-[#00f2ff] hover:text-white border-[#00f2ff]/40 hover:border-[#00f2ff]'
                      }`}
                    >
                      {isEditing ? '...' : `[ ${formatKeyName(currentKey)} ]`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reference: Fixed Movement & Combat Controls */}
          <div className="p-4 bg-[#111114] rounded border border-[#2d2d30] space-y-2 text-xs">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4cd137]" />
              PHÍM DI CHUYỂN & HÀNH ĐỘNG MẶC ĐỊNH
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-400">
              <div className="p-1.5 bg-[#08080a] rounded border border-[#222225]">
                <strong className="text-white">[W] / [↑]:</strong> Tăng Tốc / Lên
              </div>
              <div className="p-1.5 bg-[#08080a] rounded border border-[#222225]">
                <strong className="text-white">[S] / [↓]:</strong> Phanh / Lùi
              </div>
              <div className="p-1.5 bg-[#08080a] rounded border border-[#222225]">
                <strong className="text-white">[A] / [D]:</strong> Chuyển Làn Trái/Phải
              </div>
              <div className="p-1.5 bg-[#08080a] rounded border border-[#222225]">
                <strong className="text-white">[F]:</strong> Nhặt Đồ / Tương Tác
              </div>
              <div className="p-1.5 bg-[#08080a] rounded border border-[#222225]">
                <strong className="text-white">[H]:</strong> Bật/Tắt Đèn Pha Xe
              </div>
              <div className="p-1.5 bg-[#08080a] rounded border border-[#222225]">
                <strong className="text-white">[L]:</strong> Khóa Cửa Xe / Xuống Xe
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131315] border-t border-[#2d2d30] flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-[#1a1a1d] hover:bg-[#252529] text-gray-300 hover:text-white rounded border border-[#333336] text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            KHÔI PHỤC MẶC ĐỊNH
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-4 py-2 bg-[#131315] hover:bg-[#1a1a1d] border border-[#2d2d30] text-gray-400 hover:text-white font-bold rounded text-xs transition"
            >
              HỦY BỎ
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-[#00f2ff] to-[#00a8ff] text-black font-bold rounded text-xs border border-[#00f2ff] shadow-lg transition flex items-center gap-1.5 uppercase tracking-wider"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-black" /> : <Check className="w-4 h-4" />}
              {savedSuccess ? 'ĐÃ LƯU THÀNH CÔNG!' : 'LƯU CÀI ĐẶT'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
