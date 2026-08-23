#include "../include/Pvz1Types.hpp"
#include "../include/Plant.hpp"
#include "../include/Zombie.hpp"
#include "../include/LawnGrid.hpp"
#include "../include/NationalStream.hpp"
#include "../include/DaveShop.hpp"
#include "../include/CampaignManager.hpp"

#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>

using namespace PvZ1;

void printBanner(const std::string& title) {
    std::cout << "\n========================================================================================\n";
    std::cout << "  🌻 " << title << " 🧟\n";
    std::cout << "========================================================================================\n";
}

void showLiveFeed(const NationalStream& stream) {
    const auto& stats = stream.getStats();
    std::cout << "\n📺 [TRUYỀN HÌNH TRỰC TIẾP QUỐC VẬN - 10.5 TỶ KHÁN GIẢ TOÀN CẦU]\n";
    std::cout << "🌐 Xếp Hạng: Top #" << stats.globalRank
              << " | ⏳ Tuổi Thọ Toàn Dân: +" << stats.lifeExpectancyMonths << " Tháng"
              << " | 🛡️ Kháng Virus: +" << stats.virusResistancePct << "%"
              << " | 🗺️ Lãnh Thổ Tự Sinh: +" << stats.nationalTerritoryBonusKm2 << " km²\n";
    std::cout << "----------------------------------------------------------------------------------------\n";
    std::cout << "💬 [PHÒNG CHAT & BÌNH LUẬN TRỰC TIẾP]:\n";
    const auto& feed = stream.getLiveFeed();
    int start = std::max(0, (int)feed.size() - 4);
    for (size_t i = start; i < feed.size(); ++i) {
        std::cout << "  " << feed[i].flag << " [" << feed[i].author << "]: " << feed[i].content << "\n";
    }
    std::cout << "----------------------------------------------------------------------------------------\n";
}

void playChapterBattle(const CampaignChapter* ch, NationalStream& stream, DaveShop& dave) {
    printBanner("TRẬN CHIẾN QUỐC VẬN: " + ch->title);
    std::cout << "📍 Địa Điểm: " << ch->location << "\n";
    std::cout << "👑 Đối Thủ: " << ch->bossName << " (HP: " << ch->bossHp << ")\n";

    LawnGrid lawn;
    lawn.reset(300);

    stream.triggerMcCommentary("boss_spawn", ch->bossName);

    // Initial plants setup
    lawn.plantAt("plant_sunflower", 1, 0);
    lawn.plantAt("plant_sunflower", 3, 0);
    lawn.plantAt("plant_peashooter", 1, 1);
    lawn.plantAt("plant_snow_pea", 2, 1);
    lawn.plantAt("plant_peashooter", 3, 1);
    lawn.plantAt("plant_zombie_wall", 2, 3); // 40 Zombie Shovel defender

    // Spawn waves
    lawn.spawnZombie("zombie_normal", 1);
    lawn.spawnZombie("zombie_bucket", 2);
    lawn.spawnZombie("zombie_armored_spore", 3);

    // Spawn Boss
    lawn.spawnZombie(ch->chapterNumber == 6 ? "zombie_boss_lion_king" : "zombie_strong_2", 2);

    std::cout << "\n[BẮT ĐẦU MÔ PHỎNG CHIẾN ĐẤU THỜI GIAN THỰC 5 HÀNG]...\n";

    for (int tick = 1; tick <= 10; ++tick) {
        lawn.update(1.0f);

        // Ult on tick 3
        if (tick == 3) {
            lawn.usePlantFood(1, 1);
        }

        // Jalapeno on tick 5
        if (tick == 5) {
            lawn.plantAt("plant_jalapeno", 2, 4);
        }

        // Render live state
        std::cout << lawn.renderAsciiLawn();

        // Print combat logs
        const auto& logs = lawn.getLogs();
        int start = std::max(0, (int)logs.size() - 4);
        std::cout << "📜 [DIỄN BIẾN CHIẾN TRƯỜNG]:\n";
        for (size_t i = start; i < logs.size(); ++i) {
            std::cout << "  > " << logs[i] << "\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }

    stream.triggerMcCommentary("boss_defeated", ch->bossName);
    stream.updateNationalStats(lawn.getZombiesKilled(), ch->chapterNumber);
    dave.addBeastCores(lawn.getBeastCores() + 2);

    std::cout << "\n🎉 [CHIẾN THẮNG RỰC RỠ] Quét sạch quân địch! Quốc gia nhận +"
              << ch->rewardSun << " ☀️ Mặt Trời và +" << ch->rewardEnergy << " ⚡ Năng Lượng!\n";
}

void showStoryMenu(NationalStream& stream, DaveShop& dave) {
    printBanner("7 CHƯƠNG CỐT TRUYỆN: PLANTS VS ZOMBIES QUỐC VẬN");
    const auto& chapters = CampaignManager::getInstance().getAllChapters();

    for (const auto& ch : chapters) {
        std::cout << "[" << ch.chapterNumber << "] " << ch.title << "\n";
        std::cout << "    Địa điểm: " << ch.location << " | Boss: " << ch.bossName << "\n";
    }

    std::cout << "\nChọn Chương Cốt Truyện để khám phá (1-7, hoặc 0 để quay lại): ";
    int choice = 1;
    if (std::cin >> choice && choice >= 1 && choice <= 7) {
        const CampaignChapter* ch = CampaignManager::getInstance().getChapter(choice);
        if (ch) {
            printBanner(ch->title);
            std::cout << "📖 [TÓM TẮT]: " << ch->synopsis << "\n\n";
            std::cout << "📜 [CHI TIẾT TRUYỆN]: " << ch->storyText << "\n\n";

            std::cout << "Bạn có muốn bước vào trận chiến phòng thủ của Chương này? (1: Có / 0: Không): ";
            int fight = 1;
            if (std::cin >> fight && fight == 1) {
                playChapterBattle(ch, stream, dave);
            }
        }
    }
}

void showDaveShop(int& playerEnergy, DaveShop& dave) {
    printBanner("CỬA HÀNG SÂN VƯỜN BÁC SĨ DAVE");
    std::cout << "⚡ Năng Lượng Hiện Có: " << playerEnergy << " ⚡ | Sức Chứa Quân Đoàn Thây Ma: " << dave.getShovelSquadCapacity() << "\n\n";

    const auto& ups = dave.getUpgrades();
    for (size_t i = 0; i < ups.size(); ++i) {
        const auto& u = ups[i];
        std::cout << "[" << (i + 1) << "] " << u.name << " (Cấp " << u.level << "/" << u.maxLevel << ")\n";
        std::cout << "    " << u.desc << " | Giá: " << u.costEnergy << " ⚡\n";
    }

    std::cout << "\nChọn nâng cấp muốn mua (1-" << ups.size() << ", hoặc 0 để quay lại): ";
    int opt = 0;
    if (std::cin >> opt && opt >= 1 && opt <= (int)ups.size()) {
        if (dave.buyUpgrade(ups[opt - 1].id, playerEnergy)) {
            std::cout << "✅ Nâng cấp thành công!\n";
        } else {
            std::cout << "❌ Không đủ Năng Lượng để nâng cấp!\n";
        }
    }
}

void showPlantAlmanac() {
    printBanner("BÁCH KHOA TOÀN THƯ THỰC VẬT QUỐC VẬN");
    const auto& plants = PlantRegistry::getInstance().getAllPlants();

    for (const auto& pair : plants) {
        const auto& p = *pair.second;
        std::cout << p.icon << " [" << p.name << "]\n";
        std::cout << "   Giá: " << p.sunCost << " ☀️ | Máu: " << p.maxHp << " | Sát thương: " << p.attackDmg << "\n";
        std::cout << "   Mô tả: " << p.description << "\n";
        std::cout << "   Chiêu Cuối (Plant Food): " << p.ult.name << " - " << p.ult.description << "\n";
        std::cout << "----------------------------------------------------------------------------------------\n";
    }
}

int main() {
    printBanner("PLANTS VS. ZOMBIES: VẬN MỆNH QUỐC GIA - PHẦN 1 (C++ GAME ENGINE)");
    std::cout << "Hệ thống mô phỏng Thủ Thành Thời Gian Thực & Live Stream Quốc Vận 10 Tỷ Khán Giả.\n";

    NationalStream stream;
    DaveShop dave;
    int playerEnergy = 200;

    bool running = true;
    while (running) {
        showLiveFeed(stream);
        std::cout << "=== MENU CHÍNH ===\n";
        std::cout << "1. 📖 7 Chương Cốt Truyện Vận Mệnh Quốc Gia & Trận Chiến Sân Vườn\n";
        std::cout << "2. 🛒 Cửa Hàng Sân Vườn Bác Sĩ Dave & Quân Đoàn 40 Thây Ma\n";
        std::cout << "3. 🔬 Viện Nghiên Cứu Y Sinh & Giải Mã Chuỗi Gen Virus (" << (int)dave.getDecryptionProgress() << "%)\n";
        std::cout << "4. 🌻 Bách Khoa Toàn Thư Thực Vật & Zombie\n";
        std::cout << "5. ⚔️ Mô Phỏng Nhanh Trận Chiến Sân Vận Động với Vua Sư Tử\n";
        std::cout << "0. 🚪 Thoát Trò Chơi\n";
        std::cout << "Nhập lựa chọn của bạn: ";

        int option = 0;
        if (!(std::cin >> option)) {
            std::cin.clear();
            std::string discard;
            std::cin >> discard;
            continue;
        }

        switch (option) {
            case 1:
                showStoryMenu(stream, dave);
                break;
            case 2:
                showDaveShop(playerEnergy, dave);
                break;
            case 3:
                printBanner("VIỆN NGHIÊN CỨU Y SINH DAVE");
                std::cout << "🧬 Tiến độ giải mã chuỗi Gen Virus: " << dave.getDecryptionProgress() << "%\n";
                std::cout << "Chiết xuất Huyết Thanh Thanh Tẩy giúp nâng cao kháng virus cho toàn bộ người dân Hoa Quốc.\n";
                break;
            case 4:
                showPlantAlmanac();
                break;
            case 5: {
                const CampaignChapter* ch6 = CampaignManager::getInstance().getChapter(6);
                playChapterBattle(ch6, stream, dave);
                break;
            }
            case 0:
                running = false;
                std::cout << "\nĐã lưu trữ dữ liệu Quốc Vận Tuyết Mộc. Hẹn gặp lại!\n";
                break;
            default:
                std::cout << "Lựa chọn không hợp lệ. Vui lòng thử lại.\n";
                break;
        }
    }

    return 0;
}
