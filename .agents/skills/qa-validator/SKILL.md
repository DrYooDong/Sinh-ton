---
name: qa-validator
description: >-
  Quy trình kiểm thử, rà soát lỗi (QA & Validation Workflow), kiểm tra build,
  TypeScript compilation, data integrity checklist và audit trước khi release.
---

# Skill: QA & Data Integrity Validator

Quy trình kiểm thử chất lượng phần mềm và tính toàn vẹn dữ liệu cho Game Ký Túc Xá Sinh Tồn.

## 1. Lệnh Kiểm Tra Bắt Buộc

Thực thi 2 lệnh này trong terminal trước khi hoàn thành bất kỳ tính năng mới nào:

```powershell
# 1. Kiểm tra toàn bộ lỗi kiểu dữ liệu TypeScript (không sinh file)
npm run lint

# 2. Kiểm tra đóng gói tài nguyên và bundling với Vite
npx vite build
```

## 2. Checklist Kiểm Tra Dữ Liệu Tĩnh (Data Integrity Checklist)

- [ ] **Item IDs**: Mọi ID trong `drops` của `ENEMIES` và `materials` của `CRAFTING_RECIPES` có tồn tại trong `INITIAL_ITEMS` không?
- [ ] **Skill properties**: Tất cả kỹ năng sử dụng trường `mpCost` thay vì `costMp`?
- [ ] **Lương thực & Nước**: Logic kiểm tra thức ăn hỗ trợ cả `food_bread` và `food_noodle`?
- [ ] **Market Offers**: Người chơi có bị chặn nếu không đủ vật phẩm yêu cầu đổi (`askingItem`) không?
- [ ] **Quests Claim**: Nhận đúng vật phẩm phần thưởng thay vì dựa vào index mảng cố định?
- [ ] **Sound Manager**: Mọi nút bấm tương tác quan trọng có gọi `soundManager.play(...)` không?
- [ ] **LocalStorage**: Dữ liệu có lưu thành công vào `isekai_survival_rpg_save_v2` và tải lại nguyên vẹn không?
