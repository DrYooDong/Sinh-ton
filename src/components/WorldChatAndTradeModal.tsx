import React, { useState } from 'react';
import { ChatMessage, InventoryItem, MarketListing } from '../types';
import { RARITY_COLORS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import {
  MessageSquare,
  ShoppingBag,
  Send,
  User,
  Users,
  ShieldAlert,
  Sparkles,
  ArrowRightLeft,
  Check,
  Plus,
  Flame,
  AlertTriangle,
  Radio,
  Package,
} from 'lucide-react';

interface WorldChatAndTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];
  marketListings: MarketListing[];
  inventory: InventoryItem[];
  courageBadges: number;
  onSendMessage: (channel: 'world' | 'private_tinh_than', content: string) => void;
  onBuyMarketItem: (listingId: string) => void;
  onCreateMarketListing: (offeredItemId: string, offeredQty: number, reqItemId: string, reqQty: number) => void;
  onDirectChatTrade?: (offer: NonNullable<ChatMessage['tradeOffer']>, msgId: string) => void;
}

export const WorldChatAndTradeModal: React.FC<WorldChatAndTradeModalProps> = ({
  isOpen,
  onClose,
  chatHistory,
  marketListings,
  inventory,
  courageBadges,
  onSendMessage,
  onBuyMarketItem,
  onCreateMarketListing,
  onDirectChatTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'world_chat' | 'private_chat' | 'market'>('world_chat');
  const [inputMsg, setInputMsg] = useState<string>('');
  const [selectedPrivateNpc, setSelectedPrivateNpc] = useState<'tinh_than' | 'to_dai_my' | 'gia_chinh_kinh'>('tinh_than');
  const [marketFilter, setMarketFilter] = useState<'all' | 'urgent' | 'rare' | 'barter'>('all');

  // Market create form states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [sellItemId, setSellItemId] = useState<string>(inventory[0]?.id || 'wood');
  const [sellQty, setSellQty] = useState<number>(2);
  const [reqItemId, setReqItemId] = useState<string>('purified_water_500ml');
  const [reqQty, setReqQty] = useState<number>(1);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    soundEngine.playClick();
    onSendMessage(activeTab === 'private_chat' ? 'private_tinh_than' : 'world', inputMsg);
    setInputMsg('');
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    onCreateMarketListing(sellItemId, sellQty, reqItemId, reqQty);
    setShowCreateModal(false);
  };

  const worldMessages = chatHistory.filter((m) => m.channel === 'world' || m.channel === 'system');
  const privateMessages = chatHistory.filter((m) => m.channel === 'private_tinh_than' || m.channel === 'private_other');

  const filteredMarketListings = marketListings.filter((l) => {
    if (marketFilter === 'all') return true;
    return l.tag === marketFilter;
  });

  const getInventoryItemCount = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="bg-[#0c0c0e] border border-[#2d2d30] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 rounded-lg">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-wide text-white">
                MẠNG LƯỚI GIAO DỊCH & THẢO LUẬN CAO TỐC
                <span className="text-[10px] px-2 py-0.5 rounded border border-[#00f2ff]/60 bg-[#00f2ff]/10 text-[#00f2ff] font-bold">
                  10.000 NGƯỜI SỐNG SÓT
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Rương trên đường khan hiếm — Hãy tích cực trao đổi vật phẩm với những người sinh tồn khác!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('world_chat');
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                activeTab === 'world_chat'
                  ? 'bg-[#1a1a1d] text-[#00f2ff] border-[#00f2ff]'
                  : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              KÊNH THẾ GIỚI
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('private_chat');
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                activeTab === 'private_chat'
                  ? 'bg-[#1a1a1d] text-[#ff416c] border-[#ff416c]'
                  : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              TIN RIÊNG (TINH THẦN)
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('market');
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                activeTab === 'market'
                  ? 'bg-[#1a1a1d] text-[#ffcc00] border-[#ffcc00]'
                  : 'bg-[#131315] text-gray-400 border-[#2d2d30] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              CHỢ GIAO DỊCH
            </button>
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
        </div>

        {/* TAB 1: WORLD CHAT */}
        {activeTab === 'world_chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0e]">
            {/* Live Ticker banner */}
            <div className="bg-[#111116] border-b border-[#232328] px-3 py-1.5 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1.5 text-[#00f2ff]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                ĐANG KẾT NỐI TẦN SỐ VÔ TUYẾN TOÀN KHU VỰC
              </span>
              <span className="text-yellow-400 font-bold">
                Mẹo: Bạn có thể bấm [ĐỔI NGAY] trực tiếp trên tin nhắn của người sống sót!
              </span>
            </div>

            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {worldMessages.map((msg) => {
                const isTuyếtMộc = msg.isPlayer || msg.sender.includes('Tuyết Mộc');
                const isTinhThân = msg.sender.includes('Tinh Thần');
                const isGiaChinhKinh = msg.sender.includes('Giả Chính Kinh');
                const hasOffer = !!msg.tradeOffer;
                const canAfford = hasOffer ? getInventoryItemCount(msg.tradeOffer!.requestedItemId) >= msg.tradeOffer!.requestedQuantity : false;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isTuyếtMộc ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1d] border border-[#2d2d30] flex items-center justify-center text-sm shrink-0">
                      {msg.avatar || '👤'}
                    </div>

                    <div className={`max-w-[80%] rounded-lg p-3 text-xs space-y-2 ${
                      isTuyếtMộc
                        ? 'bg-[#1a1a1d] border border-[#00f2ff]/60 text-white rounded-tr-none'
                        : isTinhThân
                        ? 'bg-[#1a1a1d] border border-[#ff416c]/60 text-rose-200 rounded-tl-none'
                        : isGiaChinhKinh
                        ? 'bg-[#1a1a1d] border border-[#c084fc]/60 text-purple-200 rounded-tl-none'
                        : msg.isSystem
                        ? 'bg-[#131315] border border-[#ffcc00]/40 text-[#ffcc00] mx-auto w-full text-center'
                        : 'bg-[#131315] border border-[#2d2d30] text-gray-300 rounded-tl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-4 font-bold text-[10px] text-gray-400">
                        <span className={isTuyếtMộc ? 'text-[#00f2ff]' : isTinhThân ? 'text-[#ff416c]' : 'text-gray-300'}>
                          {msg.sender}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed text-[11px]">{msg.content}</p>

                      {/* Attached Direct Trade Offer Card */}
                      {hasOffer && (
                        <div className="mt-2 p-2 bg-[#08080a] border border-[#ffcc00]/50 rounded text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-yellow-400 font-bold">
                            <span>LỜI MỜI TRAO ĐỔI VẬT TƯ:</span>
                            {msg.tradeOffer!.isClaimed ? (
                              <span className="text-emerald-400">✓ ĐÃ HOÀN TẤT</span>
                            ) : (
                              <span className={canAfford ? 'text-emerald-400' : 'text-gray-500'}>
                                {canAfford ? 'BẠN ĐỦ VẬT TƯ' : 'BẠN THIẾU VẬT TƯ'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 p-1.5 bg-[#121216] rounded border border-[#232328]">
                            <div className="text-left">
                              <span className="text-[8px] text-gray-500 block">BẠN NHẬN:</span>
                              <span className="text-[#ffcc00] font-bold text-[11px]">
                                {msg.tradeOffer!.offeredItemName || msg.tradeOffer!.offeredItemId} x{msg.tradeOffer!.offeredQuantity}
                              </span>
                            </div>

                            <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500" />

                            <div className="text-right">
                              <span className="text-[8px] text-gray-500 block">BẠN TRẢ:</span>
                              <span className="text-[#00f2ff] font-bold text-[11px]">
                                {msg.tradeOffer!.requestedItemName || msg.tradeOffer!.requestedItemId} x{msg.tradeOffer!.requestedQuantity}
                              </span>
                            </div>
                          </div>

                          {!msg.tradeOffer!.isClaimed && !isTuyếtMộc && (
                            <button
                              onClick={() => {
                                if (onDirectChatTrade && msg.tradeOffer) {
                                  onDirectChatTrade(msg.tradeOffer, msg.id);
                                }
                              }}
                              disabled={!canAfford}
                              className={`w-full py-1.5 rounded font-bold text-[10px] uppercase transition flex items-center justify-center gap-1 ${
                                canAfford
                                  ? 'bg-[#4cd137] hover:bg-[#62e04e] text-black shadow-md cursor-pointer'
                                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              {canAfford ? 'ĐỔI NGAY TRỰC TIẾP' : 'KHÔNG ĐỦ VẬT PHẨM TRẢ'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input bar */}
            <div className="p-3 bg-[#08080a] border-t border-[#2d2d30] flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Gõ tin nhắn gửi lên kênh thế giới (10.000 người sinh tồn)..."
                className="flex-1 bg-[#131315] border border-[#2d2d30] rounded-lg px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00f2ff]"
              />
              <button
                onClick={handleSend}
                className="p-2.5 bg-[#00f2ff] hover:bg-[#33f5ff] text-black rounded-lg font-bold transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRIVATE MESSAGES (TINH THẦN) */}
        {activeTab === 'private_chat' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#0c0c0e]">
            
            {/* Left Contact list */}
            <div className="md:col-span-4 border-r border-[#2d2d30] p-2 space-y-1.5 bg-[#08080a]">
              {[
                { id: 'tinh_than', name: 'Tinh Thần (Nữ Hiệp Võ Thuật)', avatar: '🥋', status: 'Đang lái xe gần bạn (Online)', color: 'text-[#ff416c]' },
                { id: 'to_dai_my', name: 'Tô Đại Mỹ', avatar: '💃', status: 'Đã đổi xe (Offline)', color: 'text-[#ffcc00]' },
                { id: 'gia_chinh_kinh', name: 'Giả Chính Kinh', avatar: '🕵️', status: 'Trưởng nhóm tự phong', color: 'text-[#c084fc]' },
              ].map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedPrivateNpc(contact.id as unknown as typeof selectedPrivateNpc);
                  }}
                  className={`w-full text-left p-2.5 rounded border transition flex items-center gap-3 ${
                    selectedPrivateNpc === contact.id
                      ? 'bg-[#1a1a1d] border-[#ff416c]/60'
                      : 'bg-[#131315] border-[#2d2d30] hover:bg-[#1a1a1d]'
                  }`}
                >
                  <span className="text-2xl">{contact.avatar}</span>
                  <div>
                    <div className={`text-xs font-bold ${contact.color}`}>{contact.name}</div>
                    <div className="text-[10px] text-gray-400">{contact.status}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Chat History */}
            <div className="md:col-span-8 flex flex-col overflow-hidden bg-[#0c0c0e]">
              <div className="p-3 bg-[#131315] border-b border-[#2d2d30] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥋</span>
                  <div>
                    <div className="text-xs font-bold text-[#ff416c] uppercase">Tinh Thần (Bạn Đồng Hành Thân Thiết)</div>
                    <div className="text-[10px] text-[#4cd137]">Sẵn sàng hỗ trợ và trao đổi vật tư quý hiếm</div>
                  </div>
                </div>
              </div>

              {/* Private Msg List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {privateMessages.map((msg) => {
                  const isTuyếtMộc = msg.isPlayer || msg.sender.includes('Tuyết Mộc');
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isTuyếtMộc ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-7 h-7 rounded bg-[#1a1a1d] border border-[#2d2d30] flex items-center justify-center text-xs shrink-0">
                        {msg.avatar || '🥋'}
                      </div>
                      <div className={`max-w-[80%] p-3 rounded text-xs space-y-1 ${
                        isTuyếtMộc
                          ? 'bg-[#1a1a1d] border border-[#ff416c]/60 text-white rounded-tr-none'
                          : 'bg-[#131315] border border-[#ff416c]/30 text-rose-100 rounded-tl-none'
                      }`}>
                        <div className="text-[10px] font-bold text-gray-400">{msg.sender}</div>
                        <p className="text-[11px]">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Private Input */}
              <div className="p-3 bg-[#08080a] border-t border-[#2d2d30] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Gửi tin nhắn riêng tới Tinh Thần..."
                  className="flex-1 bg-[#131315] border border-[#2d2d30] rounded px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff416c]"
                />
                <button
                  onClick={handleSend}
                  className="p-2.5 bg-[#ff416c] hover:bg-[#ff5a80] text-white rounded font-bold transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PUBLIC TRADE MARKETPLACE */}
        {activeTab === 'market' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0c0c0e]">
            {/* Header and Filter Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131318] p-3 rounded-lg border border-[#232328]">
              <div>
                <h3 className="text-xs font-black text-[#ffcc00] uppercase tracking-wide flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#ffcc00]" />
                  SÀN GIAO DỊCH TOÀN CẦU (CHỢ TRAO ĐỔI)
                </h3>
                <p className="text-[11px] text-gray-400">
                  Người chơi khác sẽ tự động mua hàng bạn đăng sau 10-20 giây!
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Category Filters */}
                <div className="flex items-center bg-[#08080a] p-0.5 rounded border border-[#232328] text-[10px]">
                  <button
                    onClick={() => setMarketFilter('all')}
                    className={`px-2.5 py-1 rounded transition ${
                      marketFilter === 'all' ? 'bg-[#ffcc00] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    TẤT CẢ
                  </button>
                  <button
                    onClick={() => setMarketFilter('urgent')}
                    className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                      marketFilter === 'urgent' ? 'bg-red-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    KHẨN CẤP
                  </button>
                  <button
                    onClick={() => setMarketFilter('rare')}
                    className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                      marketFilter === 'rare' ? 'bg-purple-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    BẢN VẼ / HIẾM
                  </button>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-1.5 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-black rounded text-xs flex items-center gap-1.5 transition shadow-lg uppercase tracking-wider shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  ĐĂNG BÁN HÀNG
                </button>
              </div>
            </div>

            {/* Market Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredMarketListings.map((listing) => {
                const isSold = listing.isSold;
                const canAfford = getInventoryItemCount(listing.requestedItemId) >= listing.requestedQuantity;

                return (
                  <div
                    key={listing.id}
                    className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-3 transition ${
                      isSold
                        ? 'bg-[#08080a] border-[#222225] opacity-50'
                        : 'bg-[#131315] border-[#2d2d30] hover:border-[#ffcc00]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span className="font-bold text-gray-300 uppercase text-[11px] flex items-center gap-1.5">
                          <span>{listing.sellerAvatar || '👤'}</span>
                          <span>{listing.seller}</span>
                        </span>
                        {listing.isPlayerListing ? (
                          <span className="text-[9px] bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/40 font-bold px-1.5 py-0.5 rounded">
                            GIAN CỦA BẠN
                          </span>
                        ) : listing.tag === 'urgent' ? (
                          <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            CẦN GẤP
                          </span>
                        ) : listing.tag === 'rare' ? (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            ĐỒ HIẾM
                          </span>
                        ) : null}
                      </div>

                      {/* Trade Visual Box */}
                      <div className="p-2.5 bg-[#08080a] rounded border border-[#2d2d30] flex items-center justify-between text-xs">
                        <div className="text-left">
                          <div className="text-gray-500 text-[9px] uppercase font-bold">BÁN RA:</div>
                          <div className="font-black text-[#ffcc00] text-[11px] truncate max-w-[100px]">
                            {listing.offeredItemName || listing.offeredItemId} x{listing.offeredQuantity}
                          </div>
                        </div>

                        <ArrowRightLeft className="w-4 h-4 text-gray-500 shrink-0" />

                        <div className="text-right">
                          <div className="text-gray-500 text-[9px] uppercase font-bold">CẦN ĐỔI:</div>
                          <div className="font-black text-[#00f2ff] text-[11px] truncate max-w-[100px]">
                            {listing.requestedItemName || listing.requestedItemId} x{listing.requestedQuantity}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isSold && !listing.isPlayerListing && (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            soundEngine.playLootChest();
                            onBuyMarketItem(listing.id);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 font-black rounded text-xs transition uppercase flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-[#4cd137] hover:bg-[#68d856] text-black shadow cursor-pointer'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        {canAfford ? 'CHẤP NHẬN ĐỔI' : 'THIẾU VẬT PHẨM TRẢ'}
                      </button>
                    )}

                    {!isSold && listing.isPlayerListing && (
                      <div className="text-center text-xs text-yellow-400 font-bold py-1 uppercase bg-yellow-950/30 rounded border border-yellow-800/40">
                        ⏳ ĐANG TREO BÁN...
                      </div>
                    )}

                    {isSold && (
                      <div className="text-center text-xs text-gray-500 font-bold py-1 uppercase">
                        ✓ ĐÃ GIAO DỊCH XONG
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create Listing Submodal */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="p-4 bg-[#131315] border-2 border-[#ffcc00] rounded-xl space-y-3 max-w-md w-full shadow-2xl">
                  <h4 className="text-xs font-black text-[#ffcc00] uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    Tạo Gian Hàng Trao Đổi Lên Kênh Thế Giới
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Vật phẩm của bạn sẽ được 10.000 người sinh tồn trên mạng lưới mua lại trong vài giây!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1 text-[11px] font-bold">Món đồ bạn bán:</label>
                      <select
                        value={sellItemId}
                        onChange={(e) => setSellItemId(e.target.value)}
                        className="w-full bg-[#08080a] border border-[#2d2d30] p-2 rounded text-white text-xs focus:border-[#ffcc00]"
                      >
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} (còn {inv.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 text-[11px] font-bold">Số lượng bán:</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={sellQty}
                        onChange={(e) => setSellQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#08080a] border border-[#2d2d30] p-2 rounded text-white text-xs focus:border-[#ffcc00]"
                      >
                      </input>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1 text-[11px] font-bold">Món đồ bạn muốn nhận:</label>
                      <select
                        value={reqItemId}
                        onChange={(e) => setReqItemId(e.target.value)}
                        className="w-full bg-[#08080a] border border-[#2d2d30] p-2 rounded text-white text-xs focus:border-[#00f2ff]"
                      >
                        <option value="purified_water_500ml">💧 Nước tinh khiết 500ml</option>
                        <option value="bread">🍞 Bánh mì sinh tồn</option>
                        <option value="high_grade_fuel">⛽ Xăng cao cấp</option>
                        <option value="iron_plate">🔩 Tấm sắt</option>
                        <option value="rubber">🧱 Cao su</option>
                        <option value="copper_plate">🟫 Tấm đồng</option>
                        <option value="space_crystal">💎 Tinh thể không gian</option>
                        <option value="diamond">✨ Kim cương</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1 text-[11px] font-bold">Số lượng cần:</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={reqQty}
                        onChange={(e) => setReqQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#08080a] border border-[#2d2d30] p-2 rounded text-white text-xs focus:border-[#00f2ff]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-[#1a1a1d] text-gray-400 text-xs rounded border border-[#2d2d30] uppercase font-bold hover:text-white"
                    >
                      HỦY
                    </button>
                    <button
                      onClick={handleCreateOffer}
                      className="px-5 py-2 bg-[#ffcc00] hover:bg-[#ffe066] text-black font-black text-xs rounded uppercase shadow-lg"
                    >
                      TREO LÊN SÀN THẾ GIỚI
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-[#08080a] border-t border-[#2d2d30] flex justify-between items-center">
          <div className="text-[11px] text-gray-400 flex items-center gap-2">
            <span>Huy hiệu dũng khí:</span>
            <span className="text-[#ffcc00] font-black">{courageBadges} 🏅</span>
          </div>

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
