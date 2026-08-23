# Plants vs. Zombies: Kỷ Nguyên Vận Mệnh Quốc Gia - Phần 2 (C++ Engine)

Mã nguồn C++ hoàn chỉnh và độc lập mô phỏng toàn bộ logic game **PvZ Phần 2 (Thần Bài Sân Vườn - Card Master)** dựa trên cốt truyện và cơ chế thẻ bài.

---

## 📂 Cấu Trúc Thư Mục C++

```
cpp/pvz2_card_engine/
├── CMakeLists.txt              # Script cấu hình biên dịch đa nền tảng
├── README.md                   # Tài liệu hướng dẫn sử dụng & build
├── include/
│   ├── Types.hpp               # Định nghĩa Enums, Structs (Rarity, ProjectileType, StatusEffects)
│   ├── Card.hpp                # Hệ thống Thẻ bài (Plant, Zombie, Thẻ Pi, Chiêu Cuối)
│   ├── Battlefield.hpp         # Sàn đấu 5 hàng, đạn bay, hiệu ứng và vòng lặp combat
│   ├── Player.hpp              # Quản lý Tuyết Mộc (EXP, Level, Tiền tệ, Deck, Cường hóa)
│   ├── StoryManager.hpp        # 5 Giai Đoạn Bí Cảnh cốt truyện & Phân nhánh lựa chọn
│   ├── GachaSystem.hpp         # Triệu hồi x1 / x10, bảo hiểm Pity 10 lần, quy đổi Tinh Hồn
│   └── FusionSystem.hpp        # Dung hợp & Nhập thể (Zombie Bóng Bay, Súng Gatling, Xe Trượt Tuyết)
└── src/
    ├── Card.cpp                # Khởi tạo dữ liệu các Thẻ bài Huyền thoại
    ├── Battlefield.cpp         # Xử lý Logic trận đánh, nổ Bom Anh Đào, hồi máu, va chạm
    ├── Player.cpp              # Tiến trình người chơi, quản lý Deck 8 lá & Trại sinh tồn
    ├── StoryManager.cpp        # 5 Bí cảnh chi tiết và phần thưởng cốt truyện
    ├── GachaSystem.cpp         # Thuật toán quay thẻ ngẫu nhiên theo tỷ lệ chuẩn
    ├── FusionSystem.cpp        # Kích hoạt buff nhập thể cho Tuyết Mộc
    └── main.cpp                # Chương trình CLI tương tác & mô phỏng trận đánh ASCII
```

---

## 🛠️ Hướng Dẫn Biên Dịch (Build Instructions)

### Cách 1: Sử dụng CMake (Khuyên dùng)
```bash
cd cpp/pvz2_card_engine
mkdir build && cd build
cmake ..
cmake --build .
./pvz2_engine
```

### Cách 2: Sử dụng g++ (MinGW / Linux / macOS) trực tiếp
```bash
cd cpp/pvz2_card_engine
g++ -std=c++17 -O2 -Iinclude src/*.cpp -o pvz2_engine.exe
./pvz2_engine.exe
```

### Cách 3: Sử dụng MSVC (Visual Studio / Developer Command Prompt)
```cmd
cd cpp\pvz2_card_engine
cl /EHsc /std:c++17 /utf-8 /Iinclude src\*.cpp /Fepvz2_engine.exe
pvz2_engine.exe
```

---

## 🎮 Các Tính Năng Đã Chuyển Đổi Sang C++

1. **Hệ Thống Thẻ Bài Đa Dạng**: Phân loại độ hiếm (`C`, `B`, `A`, `S`, `SS`, `Pi`) với chỉ số Máu, Sát thương, Tốc đánh, Thời gian hồi chiêu và Chiêu cuối (Plant Food).
2. **Chiến Trường 5 Hàng (5-Lane Grid)**: Mô phỏng đạn bay (`Pea`, `Fire Pea`, `Melon Splash`), quái vật di chuyển, cắn phá thực thể, bom nổ 3x3 và cảnh báo Boss.
3. **5 Bí Cảnh Cốt Truyện**: Bám sát 100% nội dung truyện `Plants and zombie - P2.md` với các lựa chọn phân nhánh nhận phần thưởng.
4. **Hệ Thống Gacha & Pity**: Tỷ lệ mở thẻ, cơ chế bảo hiểm sau 10 lần quay và tự động quy đổi mảnh trùng lặp thành Tinh Hồn.
5. **Dung Hợp Thể (Fusion)**: Nhập thể với Thẻ linh để nhận hiệu ứng đặc biệt (né đòn mặt đất, buff hỏa lực).
6. **Dễ Dàng Mở Rộng Graphic Engine**: Code được viết phân tách hoàn toàn giữa Logic Engine và View, sẵn sàng gắn vào Raylib, SDL2, SFML, Unreal Engine hoặc Godot GDExtension.
