#include "../include/Types.hpp"
#include "../include/Card.hpp"
#include "../include/Player.hpp"
#include "../include/Battlefield.hpp"
#include "../include/StoryManager.hpp"
#include "../include/GachaSystem.hpp"
#include "../include/FusionSystem.hpp"

#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>

using namespace PvZ2;

void printHeader(const std::string& title) {
    std::cout << "\n======================================================================\n";
    std::cout << "  🌻 " << title << " 🧟\n";
    std::cout << "======================================================================\n";
}

void showPlayerStatus(const Player& player) {
    std::cout << "\n[👤 CARD MASTER: " << player.getName() << " | Cấp " << player.getLevel()
              << " (" << player.getExp() << "/" << player.getMaxExp() << " EXP)]\n";
    std::cout << "💎 Kim Cương: " << player.getDiamonds()
              << " | ☀️ Mặt Trời: " << player.getSunlight()
              << " | 🔮 Tinh Hồn: " << player.getSpiritSouls()
              << " | 🍃 Hạt NL: " << player.getPlantFood()
              << " | 🧬 Nhập Thể: " << player.getEquippedFusion() << "\n";
    std::cout << "----------------------------------------------------------------------\n";
}

void playBattleSimulation(Player& player, const StoryArc* arc) {
    printHeader("TRẬN ĐÁNH BÍ CẢNH: " + arc->title);
    std::cout << "📍 Địa Điểm: " << arc->location << "\n";
    std::cout << "👑 Trùm Cuối: " << arc->bossName << " (Cấp " << arc->bossLevel << ")\n";

    Battlefield battle;
    battle.reset(400, player.getPlantFood());

    // Spawn initial wave
    battle.spawnEnemy("zombie_cone", "Zombie Nón Giao Thông", 1, 350, 20, 4.0f);
    battle.spawnEnemy("zombie_bucket", "Zombie Đầu Thùng Sắt", 3, 700, 25, 3.5f, false, true);
    
    // Auto deploy starter tactical defense
    battle.placeCard("sunflower", 1, 0);
    battle.placeCard("sunflower", 3, 0);
    battle.placeCard("peashooter_devourer", 1, 1);
    battle.placeCard("giant_walnut", 1, 3);
    battle.placeCard("peashooter_devourer", 3, 1);
    battle.placeCard("watermelon_pult", 2, 1);

    // Spawn Boss after a short time
    battle.spawnEnemy("boss_octopus", arc->bossName, 2, 1800, 45, 2.5f, true, true);

    std::cout << "\n[BẮT ĐẦU MÔ PHỎNG CHIẾN ĐẤU REAL-TIME 5 HÀNG]...\n";

    // Simulate 12 combat ticks with visual updates
    for (int tick = 1; tick <= 8; ++tick) {
        battle.update(1.0f);

        // At tick 3, trigger Plant Food ultimate on Devourer
        if (tick == 3) {
            battle.triggerPlantFood(1, 1);
        }

        // At tick 5, deploy Cherry Bomb Pi Card on Boss lane
        if (tick == 5) {
            battle.placeCard("cherry_bomb", 2, 4);
        }

        // Render live grid state
        std::cout << battle.renderAsciiGrid();

        // Print recent logs
        const auto& logs = battle.getCombatLogs();
        int start = std::max(0, (int)logs.size() - 4);
        std::cout << "📜 [NHẬT KÝ CHIẾN TRƯỜNG]:\n";
        for (size_t i = start; i < logs.size(); ++i) {
            std::cout << "  > " << logs[i] << "\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }

    // Award victory rewards
    int rewardExp = arc->bossLevel * 50;
    int rewardSouls = arc->bossLevel * 20;
    int rewardSun = 200;
    
    std::cout << "\n🎉 [CHIẾN THẮNG BÍ CẢNH!] Quét sạch quân địch và trảm sát " << arc->bossName << "!\n";
    std::cout << "🎁 Phần Thưởng: +" << rewardExp << " EXP, +" << rewardSouls << " 🔮 Tinh Hồn, +" << rewardSun << " ☀️ Mặt Trời\n";

    player.addExp(rewardExp);
    player.addSpiritSouls(rewardSouls);
    player.addSunlight(rewardSun);
    player.completeArc(arc->id);
}

void showStoryArcMenu(Player& player) {
    printHeader("5 GIAI ĐOẠN BÍ CẢNH CỐT TRUYỆN");
    const auto& arcs = StoryManager::getInstance().getAllArcs();

    for (const auto& arc : arcs) {
        bool unlocked = player.getCurrentArcId() >= arc.id;
        std::cout << "[" << arc.id << "] " << (unlocked ? "🔓 " : "🔒 ")
                  << arc.title << " - " << arc.subtitle << "\n";
        if (unlocked) {
            std::cout << "    Địa điểm: " << arc.location << " | Boss: " << arc.bossName << "\n";
        }
    }

    std::cout << "\nChọn Giai Đoạn Bí Cảnh để khám phá (1-5, hoặc 0 để quay lại): ";
    int choice = 1;
    if (std::cin >> choice && choice >= 1 && choice <= 5) {
        const StoryArc* arc = StoryManager::getInstance().getArc(choice);
        if (arc) {
            printHeader(arc->title + " - " + arc->subtitle);
            std::cout << "📖 [TÓM TẮT]: " << arc->synopsis << "\n\n";
            std::cout << "📜 [CHI TIẾT]: " << arc->fullStory << "\n\n";

            std::cout << "⚖️ [LỰA CHỌN PHÂN NHÁNH CỐT TRUYỆN]:\n";
            for (size_t i = 0; i < arc->choices.size(); ++i) {
                std::cout << "  (" << (i + 1) << ") " << arc->choices[i].text << "\n";
            }

            std::cout << "\nNhập lựa chọn của bạn (1-" << arc->choices.size() << "): ";
            int branch = 1;
            if (std::cin >> branch && branch >= 1 && branch <= (int)arc->choices.size()) {
                const auto& ch = arc->choices[branch - 1];
                std::cout << "\n✨ [KẾT QUẢ]: " << ch.outcomeText << "\n";
                if (ch.rewardSun > 0) player.addSunlight(ch.rewardSun);
                if (ch.rewardSouls > 0) player.addSpiritSouls(ch.rewardSouls);
                if (!ch.grantCardId.empty()) player.unlockCard(ch.grantCardId);
            }

            std::cout << "\nBạn có muốn tiến vào Trận Đánh Bí Cảnh này ngay không? (1: Có / 0: Không): ";
            int fight = 1;
            if (std::cin >> fight && fight == 1) {
                playBattleSimulation(player, arc);
            }
        }
    }
}

void showGachaMenu(Player& player, GachaSystem& gacha) {
    printHeader("TRIỆU HỒI GACHA THẺ LINH & THẺ PI ĐẶC BIỆT");
    std::cout << "💎 Kim Cương hiện có: " << player.getDiamonds() << " 💎\n";
    std::cout << "🎯 Đếm bảo hiểm Pity: " << gacha.getPityCount() << "/10 (Bảo đảm Thẻ S/SS ở lần 10)\n";
    std::cout << "[1] Rút Đơn x1 (15 💎)\n";
    std::cout << "[2] Rút x10 Thần Thánh (135 💎 - Ưu đãi 10%)\n";
    std::cout << "[0] Quay lại Sảnh\n";
    std::cout << "Lựa chọn: ";

    int opt = 0;
    if (std::cin >> opt) {
        if (opt == 1 || opt == 2) {
            int times = (opt == 2) ? 10 : 1;
            auto results = gacha.performSummon(player, times);
            if (!results.empty()) {
                printHeader("KẾT QUẢ CHIÊU MỘ");
                for (const auto& res : results) {
                    std::cout << "✨ [" << rarityToString(res.rarity) << "] " << res.cardName;
                    if (res.isNew) {
                        std::cout << " 🌟 [MỚI! Mở Khóa]";
                    } else {
                        std::cout << " 🔁 [Trùng Lặp] -> Quy đổi +" << res.convertedSouls << " 🔮 Tinh Hồn";
                    }
                    std::cout << "\n";
                }
            }
        }
    }
}

void showAlmanac(const Player& player) {
    printHeader("BÁCH KHOA TOÀN THƯ THẺ BÀI SÂN VƯỜN");
    const auto& cards = CardDatabase::getInstance().getAllCards();
    const auto& unlocked = player.getUnlockedCards();

    for (const auto& pair : cards) {
        const auto& c = *pair.second;
        bool isUnlocked = std::find(unlocked.begin(), unlocked.end(), c.id) != unlocked.end();
        int lvl = player.getCardLevel(c.id);

        std::cout << "🃏 [" << c.name << "] (" << c.vietnameseTitle << ")\n";
        std::cout << "   Phẩm cấp: " << rarityToString(c.rarity) << " | Loại: " << categoryToString(c.category)
                  << " | Cấp: Lv." << lvl << " | Trạng thái: " << (isUnlocked ? "Đã Sở Hữu ✅" : "Chưa Khai Phá 🔒") << "\n";
        std::cout << "   Chi phí: " << c.sunCost << " ☀️ | Máu: " << c.health << " | Sát thương: " << c.damage << "\n";
        std::cout << "   Mô tả: " << c.description << "\n";
        std::cout << "   Lời thoại: \"" << c.voiceQuote << "\"\n";
        std::cout << "   Chiêu Cuối (Plant Food): " << c.plantFoodEffect << "\n";
        std::cout << "----------------------------------------------------------------------\n";
    }
}

void showFusionMenu(Player& player) {
    printHeader("HỆ THỐNG NHẬP THỂ DUNG HỢP (FUSION)");
    const auto& fusions = FusionSystem::getInstance().getAllFusions();

    for (size_t i = 0; i < fusions.size(); ++i) {
        const auto& f = fusions[i];
        bool isEquipped = (player.getEquippedFusion() == f.id);
        std::cout << "[" << (i + 1) << "] " << f.name << (isEquipped ? " [ĐANG TRANG BỊ ⚡]" : "") << "\n";
        std::cout << "    Hiệu quả: " << f.buffEffect << "\n";
        std::cout << "    Điển tích: " << f.lore << "\n";
    }

    std::cout << "\nChọn hình thái Nhập Thể để trang bị (1-" << fusions.size() << ", hoặc 0 để quay lại): ";
    int choice = 0;
    if (std::cin >> choice && choice >= 1 && choice <= (int)fusions.size()) {
        player.setEquippedFusion(fusions[choice - 1].id);
        std::cout << "⚡ Đã kích hoạt hình thái: " << fusions[choice - 1].name << "!\n";
    }
}

void showCampMenu(Player& player) {
    printHeader("HẬU CỨ TRẠI SINH TỒN");
    const auto& b = player.getCampUpgrades();

    std::cout << "[1] Doanh Trại Quản Lý La Quân (Cấp " << b.laQuanHeadquarters << ") - Tăng sản lượng Tinh Hồn\n";
    std::cout << "[2] Đội Trinh Sát Thỏ Tuyết Tĩnh (Cấp " << b.tuyetTinhScouts << ") - Thám hiểm Bí Cảnh tự động\n";
    std::cout << "[3] Võ Quán Kiếm Thuật Yosuke (Cấp " << b.yosukeDojo << ") - Tăng 15% Sát thương Vật lý\n";
    std::cout << "[4] Vườn Cổ Vật Nước Vàng (Cấp " << b.goldenGarden << ") - Tăng khả năng hồi phục sinh mệnh\n";
    std::cout << "[0] Quay lại Sảnh\n";
    std::cout << "Chọn công trình muốn nâng cấp bằng Tinh Hồn 🔮: ";

    int choice = 0;
    if (std::cin >> choice) {
        if (choice == 1 && player.upgradeCampBuilding("laQuan")) std::cout << "✅ Nâng cấp Doanh trại thành công!\n";
        else if (choice == 2 && player.upgradeCampBuilding("tuyetTinh")) std::cout << "✅ Nâng cấp Đội trinh sát thành công!\n";
        else if (choice == 3 && player.upgradeCampBuilding("yosuke")) std::cout << "✅ Nâng cấp Võ quán Samurai thành công!\n";
        else if (choice == 4 && player.upgradeCampBuilding("goldenGarden")) std::cout << "✅ Nâng cấp Vườn Vàng thành công!\n";
        else if (choice != 0) std::cout << "❌ Không đủ Tinh Hồn để nâng cấp!\n";
    }
}

int main() {
    printHeader("PLANTS VS. ZOMBIES: KỶ NGUYÊN VẬN MỆNH QUỐC GIA - PHẦN 2 (C++ ENGINE)");
    std::cout << "Chào mừng bạn đến với Game Engine C++ cho PvZ Phần 2 (Thần Bài Sân Vườn).\n";

    Player player("Tuyết Mộc");
    GachaSystem gacha;

    bool running = true;
    while (running) {
        showPlayerStatus(player);
        std::cout << "=== MENU CHÍNH ===\n";
        std::cout << "1. 📖 Khám Phá 5 Giai Đoạn Cốt Truyện & Trận Đánh Bí Cảnh\n";
        std::cout << "2. 🔮 Chiêu Mộ Gacha Thần Bài (Thẻ SSS & Thẻ Pi)\n";
        std::cout << "3. 🃏 Bách Khoa Toàn Thư & Cường Hóa Thẻ Bài\n";
        std::cout << "4. 🧬 Hệ Thống Nhập Thể / Dung Hợp (Fusion)\n";
        std::cout << "5. 🏰 Nâng Cấp Hậu Cứ Trại Sinh Tồn\n";
        std::cout << "6. ⚔️ Mô Phỏng Nhanh Trận Chiến 5 Hàng với Siêu Boss Bạch Tuộc\n";
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
                showStoryArcMenu(player);
                break;
            case 2:
                showGachaMenu(player, gacha);
                break;
            case 3:
                showAlmanac(player);
                break;
            case 4:
                showFusionMenu(player);
                break;
            case 5:
                showCampMenu(player);
                break;
            case 6: {
                const StoryArc* arc3 = StoryManager::getInstance().getArc(3);
                playBattleSimulation(player, arc3);
                break;
            }
            case 0:
                running = false;
                std::cout << "\nĐã lưu trữ dữ liệu Card Master Tuyết Mộc. Hẹn gặp lại!\n";
                break;
            default:
                std::cout << "Lựa chọn không hợp lệ. Vui lòng thử lại.\n";
                break;
        }
    }

    return 0;
}
