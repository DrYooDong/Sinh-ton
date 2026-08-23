---
name: modal-ui-builder
description: >-
  Quy chuẩn thiết kế và mẫu code giao diện High-Density Sci-Fi, HUD,
  Hologram Modals, Tailwind CSS tokens, Motion animations và Audio hooks.
---

# Skill: High-Density Tactical UI & Modal Builder

Hướng dẫn xây dựng các thành phần UI / Modal theo phong cách **Sci-Fi Dystopian High-Density HUD** của dự án.

## 1. Cấu Trúc Khung Chuẩn Của Một Modal

Mọi modal đều tuân thủ cấu trúc responsive, viền neon, badge nổi trên đầu và âm thanh khi tương tác:

```tsx
import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-3xl bg-neutral-950 border-2 border-cyan-500/50 p-5 shadow-2xl text-neutral-100 flex flex-col max-h-[90vh] relative"
      >
        {/* Floating Top Badge */}
        <div className="absolute -top-3.5 left-6 bg-cyan-500 text-neutral-950 px-3 py-0.5 text-[11px] font-black uppercase tracking-tighter flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TIÊU ĐỀ HUY HIỆU MODAL</span>
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-3 mt-1">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Tên Tính Năng Chi Tiết
            </h3>
            <p className="text-[10px] text-neutral-400">
              Mô tả ngắn gọn công dụng và hướng dẫn thao tác
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.play('click');
              onClose();
            }}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          {/* Content elements */}
        </div>
      </motion.div>
    </div>
  );
};
```

## 2. Màu Sắc & Token Quy Ước

- **Hệ Thống / Công Nghệ / Thám Hiểm**: `cyan-400`, `cyan-500`, `cyan-950`
- **Chúa Tể / Hoàng Gia / Tiền Vàng / Lò Rèn**: `amber-400`, `yellow-500`, `amber-950`
- **Chiến Đấu / Boss / Nguy Hiểm / Máu**: `red-500`, `rose-500`, `rose-950`
- **Sinh Lực / Thú Cưng / Cư Dân / An Toàn**: `emerald-400`, `emerald-500`, `emerald-950`
- **Đột Phá EX / Thiên Phú / Tinh Thể**: `purple-400`, `purple-500`, `purple-950`
- **Bách Khoa / Nhật Ký Thế Giới**: `indigo-400`, `indigo-500`, `indigo-950`
