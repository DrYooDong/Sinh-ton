#include "../include/KtxTypes.hpp"
#include "../include/Character.hpp"
#include "../include/Skill.hpp"
#include "../include/Item.hpp"
#include "../include/Roommate.hpp"
#include "../include/FortressRoom.hpp"
#include "../include/CombatEngine.hpp"
#include "../include/StoryCampaign.hpp"

#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>

using namespace Ktx;

void printBanner(const std::string& title) {
    std::cout << "\n====================================================================================================\n";
    std::cout << "  🏢 " << title << " ⚔️\n";
    std::cout << "====================================================================================================\n";
}

void showPlayerStatus(const Character& player, const FortressRoom& room) {
    int totalBonus = 0;
    const auto& roommates = RoommateManager::getInstance().getAllRoommates();
    for (const auto& r : roommates) {
        if (r.isRecruited) totalBonus += r.bonusCoinPct;
    }
    int hourlyRate = room.calculateHourlyCoinRate(totalBonus);

    std::cout << "\n[👤 CARD MASTER / CHÚA TỂ: " << player.name << " | Cấp " << player.level
              << " (" << player.exp << "/" << player.maxExp << " EXP)]\n";
    std::cout << "❤️ HP: " << player.hp << "/" << player.maxHp
              << " | 🔷 MP: " << player.mp << "/" << player.maxMp
              << " | ⚡ Thể Lực: " << player.stamina << "/100"
              << " | 🍗 Đói: " << player.hunger << "/100"
              << " | 💧 Khát: " << player.thirst << "/100"
              << " | 🧠 Tâm Trí: " << player.sanity << "/100\n";
    std::cout << "👑 Tiền Chúa Tể: " << player.lordCoins
              << " | 🔮 Dị Biến: " << player.mutationPoints
              << " | 🎯 Thù Hận: " << player.aggroScore
              << " | 🏆 Điểm Phong Vương: " << player.pioneerRankPoints << "\n";
    std::cout << "🛏️ Sản Lượng Giường Ngủ: " << hourlyRate << " Tiền Chúa Tể / Giờ (Cộng hưởng Đồng đội: +" << totalBonus << "%)\n";
    std::cout << "🚪 Cửa Phòng 200: " << room.doorName << " [" << room.doorHp << "/" << room.doorMaxHp << " HP] (DEF: " << room.doorDef << ")\n";
    std::cout << "----------------------------------------------------------------------------------------------------\n";
}

void playChapterBattle(const KtxChapter* ch, Character& player, FortressRoom& room) {
    printBanner("TRẬN CHIẾN KÝ TÚC XÁ: " + ch->title);
    std::cout << "📍 Địa Điểm: " << ch->location << "\n";
    std::cout << "👑 Đối Thủ: " << ch->bossName << " (HP: " << ch->bossHp << " | ATK: " << ch->bossAtk << " | DEF: " << ch->bossDef << ")\n";

    CombatEngine combat;
    std::vector<KtxEnemy> enemies;

    KtxEnemy boss;
    boss.id = "boss_" + std::to_string(ch->chapterNumber);
    boss.name = ch->bossName;
    boss.title = "Trùm Cốt Truyện";
    boss.hp = ch->bossHp;
    boss.maxHp = ch->bossHp;
    boss.atk = ch->bossAtk;
    boss.def = ch->bossDef;
    boss.isBoss = true;
    boss.isStealth = (ch->chapterNumber == 2);
    boss.rewardCoins = ch->rewardCoins;
    boss.rewardExp = ch->rewardExp;
    enemies.push_back(boss);

    combat.startEncounter(player, room, enemies);

    std::cout << "\n[BẮT ĐẦU MÔ PHỎNG PHÒNG THỦ PHÒNG 200]...\n";

    while (!combat.isBattleOver()) {
        std::cout << combat.renderAsciiBattleHUD(player, room);
        
        // Auto combat turn simulation
        if (player.mp >= 20) {
            combat.executePlayerSkill(player, room, "skill_silver_lightning", 0);
        } else {
            combat.executePlayerAttack(player, room, 0);
        }

        const auto& logs = combat.getLogs();
        int start = std::max(0, (int)logs.size() - 4);
        std::cout << "📜 [DIỄN BIẾN]:\n";
        for (size_t i = start; i < logs.size(); ++i) {
            std::cout << "  > " << logs[i] << "\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }

    if (combat.isVictory()) {
        std::cout << "\n🎉 [CHIẾN THẮNG!] Đã bảo vệ thành công phòng 200 và trảm sát " << ch->bossName << "!\n";
        std::cout << "🎁 Phần Thưởng: +" << ch->rewardCoins << " 👑 Tiền Chúa Tể, +" << ch->rewardExp << " EXP!\n";
        if (!ch->unlockItemOrSkill.empty()) {
            std::cout << "✨ Mở khóa thành tựu / Đạo cụ: " << ch->unlockItemOrSkill << "\n";
        }
    }
}

void showStoryMenu(Character& player, FortressRoom& room) {
    printBanner("7 CHƯƠNG CỐT TRUYỆN: KÝ TÚC XÁ SINH TỒN");
    const auto& chapters = StoryCampaign::getInstance().getAllChapters();

    for (const auto& ch : chapters) {
        std::cout << "[" << ch.chapterNumber << "] " << ch.title << "\n";
        std::cout << "    Địa điểm: " << ch.location << " | Boss: " << ch.bossName << "\n";
    }

    std::cout << "\nChọn Chương Cốt Truyện để trải nghiệm (1-7, hoặc 0 để quay lại): ";
    int choice = 1;
    if (std::cin >> choice && choice >= 1 && choice <= 7) {
        const KtxChapter* ch = StoryCampaign::getInstance().getChapter(choice);
        if (ch) {
            printBanner(ch->title);
            std::cout << "📖 [TÓM TẮT]: " << ch->synopsis << "\n\n";
            std::cout << "📜 [CHI TIẾT TRUYỆN]: " << ch->fullStory << "\n\n";

            std::cout << "Bạn có muốn bước vào trận chiến phòng thủ của Chương này? (1: Có / 0: Không): ";
            int fight = 1;
            if (std::cin >> fight && fight == 1) {
                playChapterBattle(ch, player, room);
            }
        }
    }
}

void showFortressMenu(Character& player, FortressRoom& room) {
    printBanner("PHÁO ĐÀI PHÒNG 200 - NÂNG CẤP KIẾN TRÚC");
    std::cout << "👑 Tiền Chúa Tể Hiện Có: " << player.lordCoins << " 👑\n\n";

    std::cout << "[1] Giường Ngủ Chúa Tể (Cấp " << room.bedLevel << ") -> Tăng sản lượng tiền (+30 xu/h) | Giá: " << (room.bedLevel * 100) << " 👑\n";
    std::cout << "[2] Cửa Siêu Hợp Kim (Cấp " << room.doorLevel << ") -> Tăng 800 Máu, 40 Thủ | Giá: " << (room.doorLevel * 150) << " 👑\n";
    std::cout << "[3] Nỏ & Pháo Đài Phân Tách Không Gian (Cấp " << room.turretLeft.level << ") -> Tăng hỏa lực | Giá: " << ((room.turretLeft.level + room.turretRight.level) * 120) << " 👑\n";
    std::cout << "[4] Máy Lọc Nước Hợp Kim (Cấp " << room.waterFilterLevel << ") -> Tăng sản lượng nước sạch | Giá: " << (room.waterFilterLevel * 80) << " 👑\n";
    std::cout << "[5] Sửa chữa Cửa phòng (+500 HP) -> Giá: 50 👑\n";
    std::cout << "[0] Quay lại Menu Chính\n";
    std::cout << "Nhập lựa chọn: ";

    int opt = 0;
    if (std::cin >> opt) {
        if (opt == 1 && room.upgradeBed(player.lordCoins)) std::cout << "✅ Nâng cấp Giường Ngủ thành công!\n";
        else if (opt == 2 && room.upgradeDoor(player.lordCoins)) std::cout << "✅ Cường hóa Cửa Hợp Kim thành công!\n";
        else if (opt == 3 && room.upgradeTurrets(player.lordCoins)) std::cout << "✅ Nâng cấp Tháp Pháo thành công!\n";
        else if (opt == 4 && room.upgradeWaterFilter(player.lordCoins)) std::cout << "✅ Nâng cấp Máy Lọc Nước thành công!\n";
        else if (opt == 5 && player.spendLordCoins(50)) {
            room.repairDoor(500);
            std::cout << "🔧 Đã gia cố và hồi phục độ bền cửa phòng!\n";
        } else if (opt != 0) {
            std::cout << "❌ Không đủ Tiền Chúa Tể hoặc lựa chọn không hợp lệ!\n";
        }
    }
}

void showSleepAndRest(Character& player, const FortressRoom& room) {
    printBanner("NGỦ & SẢN XUẤT TIỀN CHÚA TỂ");
    int totalBonus = 0;
    const auto& roommates = RoommateManager::getInstance().getAllRoommates();
    for (const auto& r : roommates) {
        if (r.isRecruited) totalBonus += r.bonusCoinPct;
    }
    int hourlyRate = room.calculateHourlyCoinRate(totalBonus);

    std::cout << "Tốc độ hiện tại: " << hourlyRate << " Tiền Chúa Tể / Giờ.\n";
    std::cout << "Nhập số giờ bạn muốn ngủ nghỉ (1 - 12 giờ, hoặc 0 để hủy): ";
    int hours = 0;
    if (std::cin >> hours && hours > 0 && hours <= 12) {
        player.restAndGenerateCoins(hours, hourlyRate);
    }
}

void showRoommatesMenu() {
    printBanner("BẠN CÙNG PHÒNG & ĐỒNG MINH PHÒNG 200");
    auto& roommates = RoommateManager::getInstance().getAllRoommates();

    for (size_t i = 0; i < roommates.size(); ++i) {
        const auto& r = roommates[i];
        std::cout << "[" << (i + 1) << "] " << r.avatar << " " << r.name << " (" << r.title << ") - "
                  << (r.isRecruited ? "Đã Chiêu Mộ ✅" : "Chưa Chiêu Mộ 🔒") << "\n";
        std::cout << "    Đặc trường: " << r.specialty << " | Buff Tiền: +" << r.bonusCoinPct << "%\n";
        std::cout << "    Tuyệt kỹ: " << r.signatureSkill << "\n";
        std::cout << "    Lời thoại: \"" << r.dialogue << "\"\n";
        std::cout << "----------------------------------------------------------------------------------------------------\n";
    }
}

void showRadioScreen(const FortressRoom& room) {
    printBanner("MÁY THU THANH ĐA CHIỀU - ĐÀI QUÂN SỰ 107.5MHz");
    std::cout << "📻 Tần số đang dò: " << room.currentFreq << " MHz (Hội Tương Trợ Huyết Vụ)\n";
    std::cout << "📡 [TÍN HIỆU ĐÃ BẮT ĐƯỢC TỪ TOP 100 TOÀN CẦU]:\n";
    std::cout << "  > [Đao Khách Dạ Vũ (Top 97)]: Ký Túc Xá chỉ là một Tế Đàn sơ cấp. Hãy chuẩn bị vũ khí chống bão tuyết!\n";
    std::cout << "  > [Kế Thư An (Bất Tử)]: Có những kẻ du hiệp đang tự do đi lại trong sương mù máu.\n";
    std::cout << "  > [Hội Tương Trợ]: Cảnh báo! Các tòa tháp lân cận sắp tiến hành sáp nhập không gian!\n";
}

int main() {
    printBanner("KÝ TÚC XÁ SINH TỒN RPG: CHÚA TỂ THỨC TỈNH (C++ ENGINE)");
    std::cout << "Hệ thống mô phỏng Sinh Tồn KTX, Pháo Đài Phòng 200 & Thiên Phú Chúa Tể.\n";

    Character player("Tuyết Mộc");
    FortressRoom room;

    bool running = true;
    while (running) {
        showPlayerStatus(player, room);
        std::cout << "=== MENU CHÍNH ===\n";
        std::cout << "1. 📖 7 Chương Cốt Truyện KTX & Đại Chiến Quái Vật Hành Lang\n";
        std::cout << "2. 🏰 Nâng Cấp Pháo Đài Phòng 200 (Giường, Cửa Hợp Kim, Tháp Pháo)\n";
        std::cout << "3. 🛌 Đi Ngủ Tích Lũy Tiền Chúa Tể\n";
        std::cout << "4. 👥 Quản Lý Bạn Cùng Phòng & Đồng Minh (Tinh Thần, Như Huyên...)\n";
        std::cout << "5. 📻 Bật Đài Radio 107.5MHz (Hội Tương Trợ Huyết Vụ)\n";
        std::cout << "6. ⚔️ Quyết Chiến Song Quỷ Chi Vương Asith (Boss Chương 7)\n";
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
                showStoryMenu(player, room);
                break;
            case 2:
                showFortressMenu(player, room);
                break;
            case 3:
                showSleepAndRest(player, room);
                break;
            case 4:
                showRoommatesMenu();
                break;
            case 5:
                showRadioScreen(room);
                break;
            case 6: {
                const KtxChapter* ch7 = StoryCampaign::getInstance().getChapter(7);
                playChapterBattle(ch7, player, room);
                break;
            }
            case 0:
                running = false;
                std::cout << "\nĐã lưu trữ dữ liệu Chúa Tể Tuyết Mộc. Hẹn gặp lại!\n";
                break;
            default:
                std::cout << "Lựa chọn không hợp lệ. Vui lòng thử lại.\n";
                break;
        }
    }

    return 0;
}
