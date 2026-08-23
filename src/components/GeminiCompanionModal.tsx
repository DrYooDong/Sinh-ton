import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bot,
  Sparkles,
  Send,
  Trash2,
  Cpu,
  Shield,
  Heart,
  Target,
  Compass,
  Hammer,
  RotateCcw,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { GeminiChatMessage } from '../types';
import { soundEngine } from '../audio/soundEngine';

interface GeminiCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameStats?: {
    distance: number;
    hp: number;
    fuel: number;
    temp: number;
    stageName: string;
    courageBadges: number;
    talentCount: number;
  };
}

export const GeminiCompanionModal: React.FC<GeminiCompanionModalProps> = ({
  isOpen,
  onClose,
  gameStats,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>('tuyet_moc');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 Chào bạn! Tôi là **Tuyết Mộc**, người sở hữu thiên phú **10 Phát Nhập Hồn** trên Xa Lộ Sinh Tồn.
Tôi có thể tư vấn bạn về:
- 🔨 **Chiến lược rèn 10 phát nhập hồn** tối ưu phẩm chất.
- 🚗 **Nâng cấp và quản lý điều hòa / bồn nước xe RV**.
- 🌡️ **Chống sốc nhiệt khi vượt Sa Mạc Rực Lửa**.

Bạn muốn hỏi về điều gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId: 'tuyet_moc',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const personas = [
    {
      id: 'tuyet_moc',
      name: 'Tuyết Mộc (Bàn Rèn & RV)',
      icon: Hammer,
      badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
      description: 'Chuyên gia rèn 10 Phát Nhập Hồn, nâng cấp xe RV & phụ tùng.',
      intro: 'Tuyết Mộc đã sẵn sàng hỗ trợ bạn tối ưu Bàn Rèn và chiến lược rèn trang bị!',
    },
    {
      id: 'bac_si',
      name: 'Bác Sĩ Dã Chiến',
      icon: Heart,
      badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      description: 'Chẩn đoán sốc nhiệt, mất nước, đói khát và độc tố dã thú.',
      intro: 'Bác Sĩ Dã Chiến luôn túc trực kiểm tra chỉ số sinh mạng và thân nhiệt của bạn.',
    },
    {
      id: 'tho_san',
      name: 'Thợ Săn Xạ Thủ',
      icon: Target,
      badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
      description: 'Phân tích điểm yếu dã thú, gợi ý vũ khí và săn Boss.',
      intro: 'Thợ Săn Xạ Thủ sẽ chỉ cho bạn cách bắn hạ lũ quái vật biến dị nhanh nhất.',
    },
    {
      id: 'tham_hiem',
      name: 'Nhà Thám Hiểm',
      icon: Compass,
      badgeColor: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
      description: 'Bản đồ, trạm tiếp tế, thời tiết ngày/đêm và bí mật xa lộ.',
      intro: 'Nhà Thám Hiểm cung cấp thông tin các chặng đường cao tốc và trạm dịch.',
    },
  ];

  const suggestedQuestions: Record<string, string[]> = {
    tuyet_moc: [
      'Làm thế nào để kích hoạt 10 phát nhập hồn hiệu quả nhất?',
      'Tôi nên nâng cấp bộ phận nào của xe RV trước?',
      'Cách rèn Đao Đường Cắt Gió phẩm chất Rực Rỡ?',
    ],
    bac_si: [
      'Thân nhiệt của tôi tăng cao trên 39°C thì phải làm gì?',
      'Cách chữa trúng độc khi bị Bò Cạp Sa Mạc cắn?',
      'Làm sao để nấu nước mát và làm kem trong xe RV?',
    ],
    tho_san: [
      'Chiến thuật đối đầu Sói Đột Biến vào ban đêm?',
      'Nên dùng Súng Săn hay Đao Cận Chiến khi dã thú áp sát?',
      'Cách tăng sát thương bạo kích lên quái vật?',
    ],
    tham_hiem: [
      'Trạm Tiếp Tế Xa Lộ bán những mặt hàng gì quý giá?',
      'Làm sao để kiếm được nhiều Huy Hiệu Dũng Khí?',
      'Vùng Sa Mạc KM 10 có những cạm bẫy nào?',
    ],
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    soundEngine.playClick();

    const userMessage: GeminiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId: selectedPersona,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history to send
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      // Enrich query with game stats context if available
      let enrichedPrompt = query;
      if (gameStats) {
        enrichedPrompt += `\n\n[Trạng thái game hiện tại: KM ${gameStats.distance.toFixed(1)}, HP: ${gameStats.hp}%, Thân nhiệt: ${gameStats.temp}°C, Xăng: ${gameStats.fuel}L, Vùng: ${gameStats.stageName}, Huy hiệu: ${gameStats.courageBadges}, Nhập Hồn: ${gameStats.talentCount}/10]`;
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: enrichedPrompt,
          history: historyPayload,
          personaId: selectedPersona,
          modelName: selectedModel,
        }),
      });

      const data = await response.json();

      if (data.reply) {
        soundEngine.playCraftTick();
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            personaId: selectedPersona,
          },
        ]);
      } else {
        throw new Error(data.error || 'Không nhận được câu trả lời từ máy chủ');
      }
    } catch (err: any) {
      console.error('Gemini companion error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Không thể kết nối:** ${err.message || 'Vui lòng kiểm tra lại kết nối mạng.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          personaId: selectedPersona,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    soundEngine.playClick();
    const currentPersonaObj = personas.find((p) => p.id === selectedPersona);
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Đã làm mới cuộc hội thoại! ${currentPersonaObj?.intro || 'Tôi có thể giúp gì cho chuyến sinh tồn của bạn?'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personaId: selectedPersona,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-3 md:p-4 bg-black/90 backdrop-blur-md font-mono text-[#e0e0e0]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#09090b] border-2 border-cyan-500/60 p-3 sm:p-4 md:p-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col h-[95vh] sm:h-[90vh] relative rounded-xl overflow-hidden"
      >
        {/* Floating Top Badge */}
        <div className="absolute -top-3.5 left-4 sm:left-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-neutral-950 px-2.5 sm:px-3.5 py-0.5 text-[9px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 rounded-full shadow-lg">
          <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>TRỢ LÝ SINH TỒN GEMINI AI</span>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-2.5 mb-2.5 mt-1 gap-2 shrink-0">
          <div>
            <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-wide flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-cyan-400">CỐ VẤN CHIẾN LƯỢC XA LỘ</span>
              <span className="text-[9px] sm:text-[10px] bg-cyan-950/80 text-cyan-300 px-1.5 sm:px-2 py-0.5 rounded border border-cyan-700/50">
                GEMINI 3.5 FLASH
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">
              Trò chuyện đa lượt thời gian thực hỗ trợ công thức bàn rèn, sức khỏe & chiến thuật quái thú
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            {/* Model selector */}
            <select
              value={selectedModel}
              onChange={(e) => {
                soundEngine.playClick();
                setSelectedModel(e.target.value);
              }}
              className="text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (Chuẩn)</option>
              <option value="gemini-3.1-pro-preview">🧠 Gemini 3.1 Pro (Chiến thuật)</option>
              <option value="gemini-3.1-flash-lite">🚀 Gemini 3.1 Flash-Lite (Nhanh)</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Xóa lịch sử trò chuyện"
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg border border-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Persona Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-2.5 shrink-0">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedPersona(p.id);
                }}
                className={`p-1.5 sm:p-2 rounded-lg border text-left transition flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                  isSelected
                    ? `${p.badgeColor} border-current shadow-[0_0_15px_rgba(6,182,212,0.15)]`
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <div className="overflow-hidden min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold truncate">{p.name}</div>
                  <div className="text-[8px] sm:text-[9px] text-neutral-500 truncate hidden xs:block sm:block">{p.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 text-xs bg-[#050506] p-2.5 sm:p-3 rounded-lg border border-neutral-800 min-h-0">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-neutral-500 mb-0.5 px-1">
                  <span>{isUser ? 'Bạn' : 'Cố Vấn AI'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-xl whitespace-pre-wrap leading-relaxed shadow-md text-[11px] sm:text-xs ${
                    isUser
                      ? 'bg-cyan-950/80 border border-cyan-600/60 text-cyan-100 rounded-tr-none'
                      : 'bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs p-2 bg-neutral-900/80 border border-neutral-800 rounded-lg w-fit animate-pulse">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span className="text-[11px] sm:text-xs">Cố vấn AI đang phân tích dữ liệu...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px] sm:text-[11px] shrink-0">
          <span className="text-neutral-500 shrink-0 flex items-center gap-1 font-bold">
            <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>GỢI Ý:</span>
          </span>
          {(suggestedQuestions[selectedPersona] || suggestedQuestions.tuyet_moc).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-2 sm:px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-300 hover:text-cyan-300 rounded-lg border border-neutral-800 hover:border-cyan-700/60 transition whitespace-nowrap cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-1.5 flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-neutral-800 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Hỏi ${personas.find((p) => p.id === selectedPersona)?.name}...`}
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 sm:py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-neutral-950 font-black rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GỬI</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
