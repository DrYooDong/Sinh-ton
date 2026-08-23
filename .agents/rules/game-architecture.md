---
description: Kiến trúc hệ thống, quy chuẩn thiết kế và tiêu chuẩn kỹ thuật cho dự án Game Ký Túc Xá Sinh Tồn RPG.
always_on: true
---

# Kiến Trúc Dự Án: Ký Túc Xá Sinh Tồn RPG (Isekai Survival RPG)

Dự án là một ứng dụng Web Game RPG Sinh Tồn High-Density được xây dựng bằng React 19, TypeScript, Vite, Tailwind CSS v4 và tích hợp Google Gemini AI.

## 1. Cấu Trúc Thư Mục & Phân Tách Trách Nhiệm

```
d:/Games/Game sinh tồn/
├── src/
│   ├── components/         # Toàn bộ Modal, HUD và View tương tác người chơi
│   ├── data/
│   │   └── initialData.ts  # Cơ sở dữ liệu tĩnh (Skills, Items, Enemies, Tenants, Stages, Quests)
│   ├── utils/
│   │   ├── audio.ts        # Bộ tổng hợp âm thanh Web Audio API (soundManager)
│   │   └── gemini.ts       # Client giao tiếp với backend Gemini AI endpoints
│   ├── types.ts            # Khai báo TypeScript Interfaces & Types toàn dự án
│   ├── App.tsx             # Quản lý State trung tâm & LocalStorage persistence
│   ├── index.css           # Cấu hình Tailwind, CSS tokens, HUD animations
│   └── main.tsx            # Entry point React
├── server.ts               # Express Backend kết nối Gemini 2.5/3.7 Flash & SPA server
└── .agents/                # Antigravity Skills, Rules & Workflows
```

## 2. Tiêu Chuẩn Quản Lý State & Lưu Game (Persistence)

- **State Trung Tâm**: Đặt tại `App.tsx` với key `STORAGE_KEY = 'isekai_survival_rpg_save_v2'`.
- **Đồng Bộ Dữ Liệu**: Mọi cập nhật tài nguyên (`lordCoins`, `inventory`, `stats`, `facilities`, `roomTenants`) phải cập nhật qua `setStats`, `setInventory`, `setLordRoomData`, v.v... để kích hoạt hook lưu tự động `localStorage`.
- **Thông Báo Hệ Thống**: Dùng hàm `triggerNotification(title, message, type, actionLabel)` để phát âm thanh thông báo và lưu vào lịch sử thông báo (`notificationHistory`).

## 3. Hệ Thống Âm Thanh (Procedural Web Audio API)

Không sử dụng file mp3 bên ngoài; tất cả hiệu ứng âm thanh được tổng hợp qua `soundManager.play(type)` trong `src/utils/audio.ts`:
- `'click'`: Nhấp nút giao diện
- `'system_alert'`: Âm báo hologram hệ thống
- `'level_up'`: Thăng cấp nhân vật / đột phá kỹ năng
- `'item_get'`: Nhặt chiến lợi phẩm / mua sắm
- `'attack'`: Tấn công thường / đâm chém
- `'skill'`: Kích hoạt kỹ năng phép thuật
- `'craft'`: Rèn đồ / nâng cấp cơ sở vật chất
- `'rest'`: Nghỉ ngơi hồi phục sinh lực
- `'danger'`: Còi báo động sóng quái / nguy hiểm
- `'victory'`: Khúc khải hoàn chiến thắng
