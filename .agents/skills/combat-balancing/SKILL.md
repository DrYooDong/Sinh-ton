---
name: combat-balancing
description: >-
  Cẩm nang và công thức tính toán cân bằng chiến đấu (Combat Mechanics, Damage Formulas,
  Turn-based Logic, Scaling, Critical Strikes, Defense Mitigation, Infinite Extract).
---

# Skill: Combat Balancing & Damage Formulas

Tài liệu tham chiếu chuẩn về công thức và quy luật chiến đấu trong Game Sinh Tồn KTX.

## 1. Công Thức Tính Sát Thương Người Chơi (Player Damage)

### Tấn Công Thường (Basic Attack)
```ts
BaseAtk = playerStats.str * 3 + (equipment.weapon?.stats?.atk || 0) + ((equipment.weapon?.enhanceLevel || 0) * 4);
Variance = Math.floor(Math.random() * 5) - 2; // Dao động [-2, +2]
IsCrit = Math.random() < (playerStats.lck * 0.02); // 2% mỗi điểm LCK
RawDamage = Math.max(5, BaseAtk - (enemy.defense || 0) + Variance);
FinalDamage = IsCrit ? Math.floor(RawDamage * 1.5) : RawDamage;
```

### Kích Hoạt Kỹ Năng (Skill Attack)
```ts
SkillDamage = playerSkill.power + (playerStats.int * 2);
if (playerSkill.id === 'skill_sss_extract' || playerSkill.effectType === 'extract') {
  // Trích xuất chỉ số vĩnh viễn
  extractedStats = { str: 1, vit: 1 };
  SkillDamage += 15;
}
FinalSkillDamage = Math.max(10, SkillDamage - Math.floor((enemy.defense || 0) * 0.5));
```

### Đồng Đội Hỗ Trợ (Companion Support)
```ts
CompanionDamage = 8 + (companion.level * 3);
```

## 2. Công Thức Tính Sát Thương Kẻ Địch (Enemy Attack)

```ts
TotalPlayerDef = playerStats.vit * 2 + (equipment.armor?.stats?.def || 0) + ((equipment.armor?.enhanceLevel || 0) * 3);
RawEnemyDamage = enemy.attack || 10;
MitigatedDamage = Math.max(3, RawEnemyDamage - Math.floor(TotalPlayerDef * 0.4));

if (isDefending) {
  FinalEnemyDamage = Math.max(2, Math.floor(MitigatedDamage * 0.5)); // Giảm 50% khi phòng thủ
} else {
  FinalEnemyDamage = MitigatedDamage;
}
```

## 3. Cân Bằng Cường Hóa Lò Rèn (+1 đến +15)

- **Chi Phí Mảnh Kim Loại**: `(cấp_hiện_tại + 1) * 3` mảnh.
- **Tỉ Lệ Thành Công**: `Math.max(25, 95 - (cấp_hiện_tại * 6))%`.
- **Chỉ Số Gia Tăng**:
  - Vũ khí: `+4 ATK` mỗi cấp cường hóa.
  - Áo giáp: `+3 DEF` mỗi cấp cường hóa.
