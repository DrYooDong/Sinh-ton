---
name: game-content-creator
description: >-
  Quy trình (Workflow) từng bước để thiết kế và bổ sung nội dung game mới:
  Vũ khí, Áo giáp, Kỹ năng thức tỉnh (Tier F->SSS/EX), Quái vật Boss, Bạn cùng phòng (Tenants),
  Chương cốt truyện, Nhiệm vụ và Tần số Radio mà không gây xung đột dữ liệu.
---

# Skill: Game Content Creator Workflow

Skill này cung cấp quy trình chuẩn khi bạn cần thêm nội dung mới vào Game Ký Túc Xá Sinh Tồn.

## 1. Thêm Kỹ Năng Mới (Skill)

1. Mở file [types.ts](file:///d:/Games/Game%20sinh%20t%E1%BB%93n/src/types.ts) để kiểm tra các trường bắt buộc của interface `Skill`:
   - `id`: Bắt đầu bằng `skill_<tier>_<name>`
   - `name`: Tên kỹ năng kèm Rank (ví dụ: `Minh Hỏa Song Tính (S)`)
   - `tier`: Một trong các giá trị `'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'EX'`
   - `mpCost`: Tiêu hao MP (không đặt là `costMp`)
   - `cooldownTurns`: Số lượt hồi chiêu
   - `effectType`: `'damage' | 'heal' | 'buff' | 'control' | 'passive' | 'extract' | 'shield'`
   - `power`: Điểm uy lực cơ bản
   - `level`: Cấp độ hiện tại (thường là 1)
   - `maxLevel`: Cấp độ tối đa
   - `flavor`: Câu mô tả nguồn gốc / cốt truyện
2. Thêm đối tượng vào mảng `SKILL_POOL` trong [initialData.ts](file:///d:/Games/Game%20sinh%20t%E1%BB%93n/src/data/initialData.ts).

## 2. Thêm Trang Bị & Vật Phẩm Mới (Item & Recipe)

1. Thêm vào mảng `INITIAL_ITEMS` trong [initialData.ts](file:///d:/Games/Game%20sinh%20t%E1%BB%93n/src/data/initialData.ts):
   ```ts
   {
     id: 'weapon_ten_vu_khi',
     name: 'Tên Vũ Khí',
     description: 'Mô tả chi tiết',
     rarity: 'rare',
     tier: 'A',
     category: 'weapon',
     icon: '🗡️',
     quantity: 1,
     stackable: false,
     value: 150,
     enhanceLevel: 0,
     stats: { atk: 45, critRate: 10 }
   }
   ```
2. Nếu là vật phẩm chế tạo được, khai báo trong `CRAFTING_RECIPES` với trường `craftRecipe.materials` trỏ đúng ID của các nguyên liệu đã có (`mat_scrap`, `mat_wood`, `special_crystal`, `item_lord_coin`, v.v.).

## 3. Thêm Quái Vật Hoặc Boss Mới (Enemy)

1. Khai báo trong mảng `ENEMIES` trong [initialData.ts](file:///d:/Games/Game%20sinh%20t%E1%BB%93n/src/data/initialData.ts):
   - Đảm bảo `stageId` tương ứng với giai đoạn xuất hiện.
   - `drops`: Mọi `itemId` trong mảng phần thưởng rơi ra phải khớp với `id` trong `INITIAL_ITEMS`.
   - Nếu là Boss, đặt `isBoss: true` và cung cấp ít nhất 2 kỹ năng đặc biệt trong `skills`.
2. Đồng thời thêm mục tương ứng vào mảng `INITIAL_BESTIARY` (Bách khoa quái vật) với thông tin điểm yếu chiến thuật.

## 4. Thêm Bạn Cùng Phòng Mới (Room Tenant)

1. Thêm vào `INITIAL_ROOM_TENANTS` trong [initialData.ts](file:///d:/Games/Game%20sinh%20t%E1%BB%93n/src/data/initialData.ts):
   - `conversionBonusPct`: Tỉ lệ phần trăm cộng thêm vào sản lượng Tiền Chúa Tể (ví dụ: `90%`).
   - `comfortScore`: Điểm tiện nghi ban đầu.
   - `assignedGear`: Tên trang bị hoặc vũ khí sở trường.
   - `dialogue`: Câu thoại nhập vai đặc trưng.
