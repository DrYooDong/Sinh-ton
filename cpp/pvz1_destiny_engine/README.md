# Plants vs. Zombies: Vận Mệnh Quốc Gia - Phần 1 (C++ Game Engine)

Mã nguồn C++ độc lập mô phỏng toàn bộ logic game **PvZ Phần 1 (Sân Vườn Bác Sĩ Dave & Live Broadcast Quốc Vận)** dựa trên cốt truyện và mã nguồn React/TypeScript tại `src/pvz/`.

---

## 📂 Cấu Trúc Thư Mục C++

```
cpp/pvz1_destiny_engine/
├── CMakeLists.txt              # Cấu hình biên dịch đa nền tảng
├── README.md                   # Hướng dẫn build & sử dụng
├── include/
│   ├── Pvz1Types.hpp           # Kiểu dữ liệu (Enums, Projectiles, Helmets, NationalStats)
│   ├── Plant.hpp               # Hệ thống Thực Vật & Chiêu Cuối (Sunflower, Peashooter, Snow Pea...)
│   ├── Zombie.hpp              # Hệ thống Quái vật & Boss (Normal, Bucket, Armored, Lion King...)
│   ├── LawnGrid.hpp            # Sàn đấu 5 làn, Máy Cắt Cỏ, Đạn bay, Năng lượng & ASCII renderer
│   ├── NationalStream.hpp      # Phòng phát sóng trực tiếp 10.5 tỷ khán giả & MC Hồ Ca, Lý Băng
│   ├── DaveShop.hpp            # Cửa hàng Dave, Binh đoàn 40 Thây Ma & Viện Giải Mã Gen Virus
│   └── CampaignManager.hpp     # 7 Chương Cốt Truyện chi tiết
└── src/
    ├── Plant.cpp               # Khởi tạo thông số & Chiêu Cuối 25 loại Thực Vật
    ├── Zombie.cpp              # Khởi tạo chỉ số Máu, Giáp, Tốc độ của Quái Vật
    ├── LawnGrid.cpp            # Xử lý Logic thời gian thực, va chạm, nổ bom 3x3, Máy Cắt Cỏ
    ├── NationalStream.cpp      # Xử lý Chat bình luận viên & Cập nhật Buff Quốc Gia
    ├── DaveShop.cpp            # Xử lý Nâng cấp Xẻng Vàng, Bình Tưới & Giải mã Virus
    ├── CampaignManager.cpp     # 7 Chương cốt truyện bám sát nội dung truyện
    └── main.cpp                # Chương trình CLI tương tác & mô phỏng trận đánh 5 hàng
```

---

## 🛠️ Hướng Dẫn Biên Dịch (Build Instructions)

### Cách 1: Sử dụng CMake (Khuyên dùng)
```bash
cd cpp/pvz1_destiny_engine
mkdir build && cd build
cmake ..
cmake --build .
./pvz1_engine
```

### Cách 2: Sử dụng g++ (MinGW / Linux / macOS) trực tiếp
```bash
cd cpp/pvz1_destiny_engine
g++ -std=c++17 -O2 -Iinclude src/*.cpp -o pvz1_engine.exe
./pvz1_engine.exe
```

### Cách 3: Sử dụng MSVC (Visual Studio Developer Command Prompt)
```cmd
cd cpp\pvz1_destiny_engine
cl /EHsc /std:c++17 /utf-8 /Iinclude src\*.cpp /Fepvz1_engine.exe
pvz1_engine.exe
```

---

## 🎮 Các Tính Năng Đã Chuyển Đổi Sang C++

1. **Lưới Sân Vườn 5 Hàng & 5 Máy Cắt Cỏ**: Phòng ngự thời gian thực, Máy Cắt Cỏ tự kích hoạt khi quái vượt phòng tuyến.
2. **Chiêu Cuối Bác Sĩ Dave (Plant Food)**: Hướng Dương phun trào mặt trời, Đậu Pháo xả bão đạn súng máy, Nấm Hủy Diệt nổ hạt nhân.
3. **Phòng Phát Sóng 10.5 Tỷ Khán Giả**: Hệ thống MC bình luận thời gian thực và buff quốc gia (Tuổi thọ toàn dân, Kháng virus, Tăng lãnh thổ).
4. **Binh Đoàn 40 Thây Ma Cầm Xẻng & Chôn Xác**: Cơ chế đặc sắc từ cốt truyện cho phép triệu hồi và chỉ huy thây ma làm lá chắn.
5. **Viện Nghiên Cứu Y Sinh & Giải Mã Gen**: Thu thập Tinh Hạch Ma Thú để chiết xuất Huyết Thanh Thanh Tẩy cứu người dân.
6. **7 Chương Cốt Truyện Hoàn Chỉnh**: Bám sát 100% truyện từ lúc xuyên không đến trận đại chiến Vua Sư Tử sân vận động.
