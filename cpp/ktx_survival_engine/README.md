# Ký Túc Xá Sinh Tồn: Chúa Tể Thức Tỉnh (C++ Game Engine)

Mã nguồn C++ độc lập mô phỏng toàn bộ logic game **Ký Túc Xá Sinh Tồn RPG (Isekai Dormitory Survival)** dựa trên cốt truyện `note/Ký túc xá.md` và mã nguồn tại `src/ktx/`.

---

## 📂 Cấu Trúc Thư Mục C++

```
cpp/ktx_survival_engine/
├── CMakeLists.txt              # Cấu hình biên dịch đa nền tảng
├── README.md                   # Hướng dẫn build & sử dụng
├── include/
│   ├── KtxTypes.hpp            # Định nghĩa Enums (SkillTier F->EX, ItemRarity, WeatherType)
│   ├── Skill.hpp               # Hệ thống Kỹ Năng & Thiên Phú (Chúa Tể Dung Hợp, Siêu Trực Giác...)
│   ├── Item.hpp                # Hệ thống Trang Bị, Vũ Khí, Áo Giáp, Huyết Thanh & Đạo Cụ Ẩn
│   ├── Roommate.hpp            # 5 Bạn Cùng Phòng (Tinh Thần, Như Huyên, Thanh Nhiên, Như Yên, Lô Nương)
│   ├── FortressRoom.hpp        # Pháo Đài Phòng 200: Cửa Hợp Kim, Giường Ngủ, Tháp Pháo, Máy Lọc Nước
│   ├── Character.hpp           # Tuyết Mộc: Chỉ số sinh tồn, Thuộc tính, Tiền Chúa Tể, Điểm Thù Hận
│   ├── CombatEngine.hpp        # Vòng lặp chiến đấu theo lượt, Boss hành lang, HUD ASCII
│   └── StoryCampaign.hpp       # 7 Chương Cốt Truyện chi tiết
└── src/
    ├── Skill.cpp               # Khởi tạo các kỹ năng thức tỉnh
    ├── Item.cpp                # Khởi tạo vũ khí (Glock-17, Đao Trảm Hồn, Giáp Ngọc Y...)
    ├── Roommate.cpp            # Khởi tạo chỉ số & đặc trường của bạn cùng phòng
    ├── FortressRoom.cpp        # Nâng cấp kiến trúc, tính sản lượng tiền khi ngủ
    ├── Character.cpp           # Quản lý EXP, thăng cấp, phân bổ điểm tiềm năng
    ├── CombatEngine.cpp        # Xử lý turn chiến đấu, hỗ trợ từ đồng đội & nỏ tháp tự động
    ├── StoryCampaign.cpp       # 7 Chương cốt truyện bám sát nội dung truyện
    └── main.cpp                # Chương trình CLI tương tác & mô phỏng trận đánh phòng thủ
```

---

## 🛠️ Hướng Dẫn Biên Dịch (Build Instructions)

### Cách 1: Sử dụng CMake (Khuyên dùng)
```bash
cd cpp/ktx_survival_engine
mkdir build && cd build
cmake ..
cmake --build .
./ktx_engine
```

### Cách 2: Sử dụng g++ (MinGW / Linux / macOS) trực tiếp
```bash
cd cpp/ktx_survival_engine
g++ -std=c++17 -O2 -Iinclude src/*.cpp -o ktx_engine.exe
./ktx_engine.exe
```

### Cách 3: Sử dụng MSVC (Visual Studio Developer Command Prompt)
```cmd
cd cpp\ktx_survival_engine
cl /EHsc /std:c++17 /utf-8 /Iinclude src\*.cpp /Fektx_engine.exe
ktx_engine.exe
```

---

## 🎮 Các Tính Năng Đã Chuyển Đổi Sang C++

1. **Thiên Phú Chúa Tể & Sản Sinh Tiền**: Tích lũy Tiền Chúa Tể theo cơ chế ngủ nghỉ, khuếch đại sản lượng nhờ bạn cùng phòng (+96% Tinh Thần, +90% Như Huyên, +120% Lô Nương).
2. **Cường Hóa Pháo Đài Phòng 200**: Nâng cấp Giường ngủ, Cửa Hợp Kim, Tháp Nỏ Hắc Thiết, Pháo Đài Kẻ Phân Tách Không Gian, Máy Lọc Nước Cấp 2 và Thần Khám Quỷ Đồng Hộ Mệnh.
3. **Chiến Đấu Theo Lượt & Yểm Trợ Đồng Đội**: Đồng đội tự động ra chiêu hỗ trợ, nỏ tháp tự động xả đạn, Quỷ Đồng khống chế cứng kẻ địch.
4. **Hệ Thống Điểm Thù Hận & Sinh Tồn**: Chỉ số Đói, Khát, Thể Lực, Tâm Trí, Siêu Trực Giác phát hiện mục tiêu tàng hình.
5. **Máy Thu Thanh Đa Chiều (Radio 107.5MHz)**: Bắt sóng Hội Tương Trợ Huyết Vụ và Đao Khách Dạ Vũ Top 97.
6. **7 Chương Cốt Truyện Hoàn Chỉnh**: Trải nghiệm từ lúc xuyên không phòng 200, săn Thập Đại Ác Nhân, Đêm Cực Hàn $-40^\circ\text{C}$ đến Quyết chiến Song Quỷ Chi Vương Asith.
