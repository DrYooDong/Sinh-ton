import React, { useState } from 'react';
import { Achievement, Quest } from '../types';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Trophy, Flame, Gift, Star, Clock } from 'lucide-react';

interface QuestAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  achievements: Achievement[];
  onClaimQuestReward: (questId: string) => void;
  onClaimAchievementReward: (achId: string) => void;
}

export const QuestAchievementModal: React.FC<QuestAchievementModalProps> = ({
  isOpen,
  onClose,
  quests,
  achievements,
  onClaimQuestReward,
  onClaimAchievementReward,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'daily' | 'hidden' | 'achievements'>('main');

  if (!isOpen) return null;

  const filteredQuests = quests.filter((q) => {
    if (activeTab === 'main') return q.type === 'main';
    if (activeTab === 'daily') return q.type === 'daily';
    if (activeTab === 'hidden') return q.type === 'hidden';
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/30 rounded">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
                HỆ THỐNG NHIỆM VỤ & THÀNH TỰU
                <span className="text-[10px] px-2 py-0.5 rounded border border-[#ffcc00]/60 bg-[#ffcc00]/10 text-[#ffcc00] font-bold">
                  PHẦN THƯỞNG ĐỘC QUYỀN
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Chuỗi cốt truyện Tuyết Mộc, thử thách hàng ngày và các danh hiệu ẩn</p>
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
            { id: 'main', label: '📖 CỐT TRUYỆN CHÍNH', count: quests.filter((q) => q.type === 'main' && q.completed && !q.claimed).length },
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
              className={`px-3 py-2 text-xs font-bold rounded-t transition flex items-center gap-2 border-t border-x ${
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

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#0c0c0e]">
          {activeTab !== 'achievements' ? (
            /* Quests List */
            filteredQuests.map((quest) => {
              const progressPct = Math.min(100, (quest.currentCount / quest.targetCount) * 100);

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                    quest.claimed
                      ? 'bg-[#08080a] border-[#222225] opacity-50'
                      : quest.completed
                      ? 'bg-[#131315] border-[#ffcc00] shadow-md shadow-[#ffcc00]/10'
                      : 'bg-[#131315] border-[#2d2d30]'
                  }`}
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        {quest.title}
                        {quest.rewards.title && (
                          <span className="text-[9px] bg-[#c084fc]/20 text-[#c084fc] px-2 py-0.5 rounded border border-[#c084fc]/40 font-bold">
                            DANH HIỆU: {quest.rewards.title.toUpperCase()}
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-400">{quest.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md flex items-center gap-3 pt-1">
                      <div className="flex-1 h-2 bg-[#08080a] border border-[#2d2d30] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00f2ff] to-[#4cd137] transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0 font-bold">
                        {quest.currentCount} / {quest.targetCount} ({progressPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Rewards & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-[11px] space-y-0.5">
                      {quest.rewards.blueprintId && (
                        <div className="text-[#c084fc] font-bold text-[10px]">
                          📜 BẢN THIẾT KẾ
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
                      <span className="px-3 py-1.5 bg-[#1a1a1d] text-gray-500 rounded border border-[#2d2d30] text-[10px] font-bold uppercase">
                        ✓ ĐÃ NHẬN
                      </span>
                    ) : quest.completed ? (
                      <button
                        onClick={() => {
                          soundEngine.playCritFanfare();
                          confetti({ particleCount: 50, spread: 60 });
                          onClaimQuestReward(quest.id);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#ff4b2b] to-[#ffcc00] hover:opacity-90 text-black font-bold rounded text-xs border border-[#ffcc00] shadow-lg transition flex items-center gap-1.5 animate-pulse uppercase tracking-wider"
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
              );
            })
          ) : (
            /* Achievements Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded border flex items-start gap-3.5 transition ${
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
