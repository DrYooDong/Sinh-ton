import React, { useState } from 'react';
import { Achievement, Quest } from '../types';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Gift,
  MessageSquare,
  Bot,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Radio,
  Compass,
} from 'lucide-react';

interface QuestAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  achievements: Achievement[];
  onClaimQuestReward: (questId: string) => void;
  onClaimAchievementReward: (achId: string) => void;
  onAskAI?: (prompt: string) => void;
  onOpenTradeMarket?: () => void;
}

export const QuestAchievementModal: React.FC<QuestAchievementModalProps> = ({
  isOpen,
  onClose,
  quests,
  achievements,
  onClaimQuestReward,
  onClaimAchievementReward,
  onAskAI,
  onOpenTradeMarket,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'daily' | 'hidden' | 'achievements'>('main');
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [expandedDialogQuestId, setExpandedDialogQuestId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredQuests = quests.filter((q) => {
    if (activeTab === 'main') {
      if (q.type !== 'main') return false;
      if (selectedChapter !== 'all' && q.chapter !== selectedChapter) return false;
      return true;
    }
    if (activeTab === 'daily') return q.type === 'daily';
    if (activeTab === 'hidden') return q.type === 'hidden';
    return false;
  });

  const mainQuests = quests.filter((q) => q.type === 'main');
  const completedMainCount = mainQuests.filter((q) => q.completed).length;

  const chaptersMeta = [
    { num: 1, title: 'Chương 1: Khởi Đầu Hoang Mạc', km: '0 - 20 KM', icon: '🪵' },
    { num: 2, title: 'Chương 2: Sóng Nhiệt 65°C', km: '20 - 50 KM', icon: '🔥' },
    { num: 3, title: 'Chương 3: Trạm Tiếp Tế & Cướp Đường', km: '50 - 100 KM', icon: '🤠' },
    { num: 4, title: 'Chương 4: Xe Nhà RV & Thú Cưng', km: '100+ KM', icon: '🏰' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/30 rounded-lg">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide text-white">
                HỆ THỐNG CỐT TRUYỆN, NHIỆM VỤ & THÀNH TỰU
                <span className="text-[10px] px-2 py-0.5 rounded border border-[#ffcc00]/60 bg-[#ffcc00]/10 text-[#ffcc00] font-bold">
                  4 CHƯƠNG CAO TỐC
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Hành trình sinh tồn Tuyết Mộc: Thức tỉnh thiên phú, giải cứu đồng đội Tinh Thần, tiêu diệt băng cướp và lên đời Xe RV.
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

        {/* Tab Selection */}
        <div className="flex border-b border-[#2d2d30] px-4 pt-2 gap-2 bg-[#08080a] overflow-x-auto text-xs">
          {[
            { id: 'main', label: '📖 4 GIAI ĐOẠN CỐT TRUYỆN', count: quests.filter((q) => q.type === 'main' && q.completed && !q.claimed).length },
            { id: 'daily', label: '⏱️ THỬ THÁCH NGÀY', count: quests.filter((q) => q.type === 'daily' && q.completed && !q.claimed).length },
            { id: 'hidden', label: '🕵️ NHIỆM VỤ ẨN', count: quests.filter((q) => q.type === 'hidden' && q.completed && !q.claimed).length },
            { id: 'achievements', label: '🏆 THÀNH TỰU VINH DANH', count: achievements.filter((a) => a.unlocked).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab(tab.id as unknown as typeof activeTab);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t transition flex items-center gap-2 border-t border-x ${
                activeTab === tab.id
                  ? 'bg-[#131315] border-[#00f2ff] text-[#00f2ff]'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-[#131315]/50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="w-4 h-4 bg-[#ff416c] text-white rounded-full text-[9px] flex items-center justify-center font-bold animate-bounce">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chapter Filter Bar (When in Main Quest Tab) */}
        {activeTab === 'main' && (
          <div className="p-3 bg-[#111116] border-b border-[#232328] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-gray-400 font-bold mr-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#00f2ff]" /> CHƯƠNG:
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedChapter('all');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                  selectedChapter === 'all'
                    ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]'
                    : 'bg-[#18181c] text-gray-400 border-[#2d2d30] hover:text-white'
                }`}
              >
                TẤT CẢ (4 CHƯƠNG)
              </button>
              {chaptersMeta.map((ch) => {
                const chQuests = mainQuests.filter((q) => q.chapter === ch.num);
                const chCompleted = chQuests.filter((q) => q.completed).length;
                return (
                  <button
                    key={ch.num}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedChapter(ch.num);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 border ${
                      selectedChapter === ch.num
                        ? 'bg-[#ffcc00]/20 text-[#ffcc00] border-[#ffcc00]'
                        : 'bg-[#18181c] text-gray-400 border-[#2d2d30] hover:text-white'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span>Chương {ch.num}</span>
                    <span className="text-[9px] px-1 bg-black/40 rounded text-gray-400">
                      {chCompleted}/{chQuests.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-bold text-gray-400 flex items-center gap-2">
              <span>TIẾN ĐỘ CHUNG:</span>
              <span className="text-[#00f2ff]">{completedMainCount}/{mainQuests.length} NHIỆM VỤ</span>
              <div className="w-20 h-2 bg-[#1a1a1d] border border-[#2d2d30] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00f2ff] to-[#4cd137]"
                  style={{ width: `${(completedMainCount / (mainQuests.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-3.5 bg-[#0c0c0e]">
          {activeTab !== 'achievements' ? (
            /* Quests List */
            filteredQuests.map((quest) => {
              const progressPct = Math.min(100, (quest.currentCount / quest.targetCount) * 100);
              const isDialogueExpanded = expandedDialogQuestId === quest.id;

              return (
                <div
                  key={quest.id}
                  className={`rounded-lg border transition overflow-hidden ${
                    quest.claimed
                      ? 'bg-[#09090b] border-[#222225] opacity-60'
                      : quest.completed
                      ? 'bg-[#131317] border-[#ffcc00] shadow-lg shadow-[#ffcc00]/10'
                      : 'bg-[#131317] border-[#2d2d30]'
                  }`}
                >
                  {/* Quest Header & Status */}
                  <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {quest.chapter && (
                          <span className="text-[10px] bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded border border-[#00f2ff]/40 font-bold">
                            CHƯƠNG {quest.chapter}
                          </span>
                        )}
                        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                          {quest.title}
                        </h3>
                        {quest.rewards.title && (
                          <span className="text-[9px] bg-[#c084fc]/20 text-[#c084fc] px-2 py-0.5 rounded border border-[#c084fc]/40 font-bold">
                            DANH HIỆU: {quest.rewards.title.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed">{quest.description}</p>

                      {quest.storyLore && (
                        <p className="text-[11px] text-amber-200/80 italic bg-[#0a0a0d] p-2 rounded border border-[#2d2d30] border-l-2 border-l-amber-400">
                          📜 {quest.storyLore}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="w-full max-w-lg flex items-center gap-3 pt-1">
                        <div className="flex-1 h-2.5 bg-[#08080a] border border-[#2d2d30] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00f2ff] via-[#4cd137] to-[#ffcc00] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-300 shrink-0 font-bold">
                          {quest.currentCount} / {quest.targetCount} ({progressPct.toFixed(0)}%)
                        </span>
                      </div>

                      {/* Story Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {quest.storyDialogue && quest.storyDialogue.length > 0 && (
                          <button
                            onClick={() => {
                              soundEngine.playClick();
                              setExpandedDialogQuestId(isDialogueExpanded ? null : quest.id);
                            }}
                            className="px-2.5 py-1 bg-[#1a1a20] hover:bg-[#25252e] text-[#00f2ff] border border-[#00f2ff]/40 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {isDialogueExpanded ? 'ẨN ĐỐI THOẠI CỐT TRUYỆN' : 'XEM ĐỐI THOẠI CỐT TRUYỆN'}
                            {isDialogueExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}

                        {onAskAI && (
                          <button
                            onClick={() => {
                              soundEngine.playClick();
                              onAskAI(`Tôi đang thực hiện nhiệm vụ: "${quest.title}". Bạn có thể tư vấn cho tôi chiến lược, cách chế tạo hoặc điểm cần chú ý để hoàn thành nhanh nhất không?`);
                            }}
                            className="px-2.5 py-1 bg-[#1a1a20] hover:bg-[#25252e] text-[#c084fc] border border-[#c084fc]/40 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Bot className="w-3 h-3" />
                            HỎI TRỢ LÝ AI
                          </button>
                        )}

                        {onOpenTradeMarket && quest.marketListingTrigger && (
                          <button
                            onClick={() => {
                              soundEngine.playClick();
                              onOpenTradeMarket();
                            }}
                            className="px-2.5 py-1 bg-[#1a1a20] hover:bg-[#25252e] text-[#ffcc00] border border-[#ffcc00]/40 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            GIAO DỊCH CHỢ
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rewards & Action */}
                    <div className="flex md:flex-col items-end justify-between gap-3 shrink-0">
                      <div className="text-right text-[11px] space-y-1">
                        {quest.rewards.blueprintId && (
                          <div className="text-[#c084fc] font-bold text-[11px]">
                            📜 {quest.rewards.blueprintName || 'BẢN THIẾT KẾ'}
                          </div>
                        )}
                        {quest.rewards.badges && (
                          <div className="text-[#ffcc00] font-bold">+{quest.rewards.badges} HUY HIỆU</div>
                        )}
                        {quest.rewards.diamonds && (
                          <div className="text-[#00f2ff] font-bold">+{quest.rewards.diamonds} KIM CƯƠNG</div>
                        )}
                        {quest.rewards.items && quest.rewards.items.map((it) => (
                          <div key={it.itemId} className="text-[#4cd137] font-bold text-[10px]">
                            +{it.quantity} {it.itemId}
                          </div>
                        ))}
                      </div>

                      {quest.claimed ? (
                        <span className="px-3.5 py-1.5 bg-[#1a1a1d] text-gray-500 rounded border border-[#2d2d30] text-[11px] font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ NHẬN
                        </span>
                      ) : quest.completed ? (
                        <button
                          onClick={() => {
                            soundEngine.playCritFanfare();
                            confetti({ particleCount: 60, spread: 70 });
                            onClaimQuestReward(quest.id);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#ff4b2b] to-[#ffcc00] hover:opacity-90 text-black font-black rounded-lg text-xs border border-[#ffcc00] shadow-lg transition flex items-center gap-1.5 animate-pulse uppercase tracking-wider cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                          NHẬN THƯỞNG
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-[#131315] border border-[#2d2d30] text-gray-400 rounded text-[10px] font-bold uppercase">
                          CHƯA ĐẠT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable Story Dialogue Section */}
                  {isDialogueExpanded && quest.storyDialogue && (
                    <div className="bg-[#09090c] border-t border-[#232328] p-4 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider pb-1 border-b border-[#1c1c22]">
                        <BookOpen className="w-3.5 h-3.5 text-[#00f2ff]" />
                        ĐỐI THOẠI CỐT TRUYỆN: {quest.chapterName || quest.title}
                      </div>

                      <div className="space-y-2.5">
                        {quest.storyDialogue.map((diag, dIdx) => {
                          const isPlayer = diag.role === 'player';
                          const isSystem = diag.role === 'system';
                          const isCompanion = diag.role === 'companion';

                          return (
                            <div
                              key={dIdx}
                              className={`flex items-start gap-2.5 ${isPlayer ? 'flex-row-reverse' : ''}`}
                            >
                              <div className="w-7 h-7 rounded-full bg-[#18181c] border border-[#2d2d30] flex items-center justify-center text-sm shrink-0">
                                {diag.avatar}
                              </div>

                              <div
                                className={`max-w-[85%] rounded-lg p-2.5 text-xs space-y-1 ${
                                  isPlayer
                                    ? 'bg-[#18181e] border border-[#00f2ff]/50 text-white rounded-tr-none'
                                    : isCompanion
                                    ? 'bg-[#18181e] border border-[#ff416c]/50 text-rose-200 rounded-tl-none'
                                    : isSystem
                                    ? 'bg-[#18181e] border border-[#ffcc00]/50 text-amber-200 rounded-tl-none'
                                    : 'bg-[#131316] border border-[#2d2d30] text-gray-300 rounded-tl-none'
                                }`}
                              >
                                <div className="text-[10px] font-bold flex items-center justify-between gap-4">
                                  <span
                                    className={
                                      isPlayer
                                        ? 'text-[#00f2ff]'
                                        : isCompanion
                                        ? 'text-[#ff416c]'
                                        : isSystem
                                        ? 'text-[#ffcc00]'
                                        : 'text-gray-400'
                                    }
                                  >
                                    {diag.speaker}
                                  </span>
                                </div>
                                <p className="leading-relaxed text-[11px]">{diag.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {quest.systemBroadcast && (
                        <div className="p-2 bg-[#131316] border border-[#00f2ff]/30 rounded text-[10px] text-[#00f2ff] flex items-center gap-2">
                          <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
                          <span>{quest.systemBroadcast}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Achievements Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-lg border flex items-start gap-3.5 transition ${
                    ach.unlocked
                      ? 'bg-[#131315] border-[#ffcc00]/50 shadow-md'
                      : 'bg-[#08080a] border-[#222225] opacity-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded bg-[#1a1a1d] border border-[#2d2d30] flex items-center justify-center text-xl shrink-0">
                    {ach.icon}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase">{ach.title}</h4>
                      {ach.unlocked ? (
                        <span className="text-[9px] bg-[#4cd137]/10 text-[#4cd137] px-1.5 py-0.5 rounded border border-[#4cd137]/40 font-bold">
                          ĐÃ ĐẠT
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-500">CHƯA</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{ach.description}</p>
                    <div className="text-[10px] text-[#ffcc00] font-bold pt-1 uppercase">
                      THƯỞNG: +{ach.rewardBadges} HUY HIỆU • +{ach.rewardDiamonds} KIM CƯƠNG
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#08080a] border-t border-[#2d2d30] flex items-center justify-between">
          <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffcc00]" />
            <span>Mỗi nhiệm vụ cốt truyện hoàn thành sẽ mở khóa tin nhắn NPC, thị trường và danh hiệu mới!</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2 bg-[#131315] hover:bg-[#1a1a1d] border border-[#2d2d30] text-gray-200 font-bold rounded-lg text-xs transition uppercase tracking-wider ml-auto"
          >
            ĐÓNG [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
