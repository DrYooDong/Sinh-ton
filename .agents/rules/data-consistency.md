---
description: Quy chuẩn tính nhất quán dữ liệu (Data Consistency), bảng ID, công thức và mapping giữa các Model/Component.
always_on: true
---

# Quy Chuẩn Tính Nhất Quán Dữ Liệu (Data Consistency Rules)

Để tránh lỗi logic trong quá trình phát triển tính năng mới, toàn bộ dữ liệu phải tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Quy Định Đặt Mã Định Danh (ID Convention)

- **Vật phẩm (Items)**:
  - Bắt đầu với tiền tố phân loại: `weapon_*`, `armor_*`, `craft_*`, `food_*`, `drink_*`, `mat_*`, `special_*`, `item_*`.
  - Không truy xuất item bằng chỉ số mảng cố định (`INITIAL_ITEMS[7]`), luôn dùng `INITIAL_ITEMS.find(i => i.id === targetId)`.
- **Kỹ năng (Skills)**:
  - Cấu trúc: `skill_<tier>_<codename>` (Ví dụ: `skill_sss_extract`, `skill_ss_longtuong`).
  - Trường tiêu hao mana là `mpCost` (kiểu `number`), không dùng `costMp`.
- **Quái vật (Enemies)**:
  - Cấu trúc: `enemy_<type>_<name>` (Ví dụ: `enemy_boss_thi_khoi`, `enemy_zombie_tang_hinh`).
  - Mọi `itemId` trong mảng `drops` của Enemy phải tồn tại trong `INITIAL_ITEMS` hoặc `CRAFTING_RECIPES`.

## 2. Quy Chuẩn Chế Tạo & Nâng Cấp (Crafting & Upgrades)

- Mọi `itemId` trong `craftRecipe.materials` hoặc `facility.upgradeCost` phải là một Item ID hợp lệ có thể tìm thấy trong game.
- Khi người chơi chế tạo một món đồ hoặc đổi chợ, luôn kiểm tra xem người chơi có đủ số lượng vật phẩm yêu cầu trước khi trừ trong kho đồ.

## 3. Quy Chuẩn Đồng Bộ Sinh Lực & Năng Lượng

- HP luôn nằm trong khoảng `[0, stats.maxHp]`.
- Thể lực (Stamina/SP) luôn nằm trong khoảng `[0, stats.maxStamina]`.
- Năng lượng (MP) luôn nằm trong khoảng `[0, stats.maxMp]`.
- No đói (Hunger), Cơn khát (Thirst), Tinh thần (Sanity) luôn nằm trong khoảng `[0, 100]`.
