#include "../include/NationalStream.hpp"
#include <iostream>

namespace PvZ1 {

NationalStream::NationalStream() {
    m_stats.lifeExpectancyMonths = 1.0f;
    m_stats.virusResistancePct = 1.0f;
    m_stats.nationalTerritoryBonusKm2 = 10;
    m_stats.globalRank = 1;

    addComment("Hồ Ca (MC)", "Chào mừng 10.5 tỷ khán giả toàn cầu đến với phòng phát sóng Quốc Vận Hoa Quốc!", "🇻🇳", "MC");
    addComment("Lý Băng (Bình Luận)", "Tuyết Mộc đã chọn nghề Nông Dân, một quyết định gây chấn động toàn thế giới!", "🎙️", "MC");
    addComment("Giáo Sư Sinh Học", "Thực vật biết bắn đạn và nhả ra mặt trời là một bước đột phá phi thường!", "🔬", "Expert");
}

void NationalStream::addComment(const std::string& author, const std::string& content, const std::string& flag, const std::string& tag) {
    LiveComment c{author, content, flag, tag};
    m_comments.push_back(c);
    if (m_comments.size() > 30) {
        m_comments.pop_front();
    }
}

void NationalStream::triggerMcCommentary(const std::string& eventType, const std::string& context) {
    if (eventType == "plant_peashooter") {
        addComment("Hồ Ca (MC)", "Đậu Pháo đã khai hỏa! Uy lực kinh người, trực tiếp bắn rơi đầu Zombie!", "💥", "MC");
        addComment("Cư Dân Mạng 99", "Thực vật diệt Zombie! Còn mạnh hơn cả súng ống hiện đại!", "🇻🇳", "Fan");
    } else if (eventType == "boss_spawn") {
        addComment("Lý Băng (MC)", "CẢNH BÁO ĐỎ! " + context + " đã xuất hiện! Toàn quốc đang nín thở dõi theo Tuyết Mộc!", "🚨", "MC");
    } else if (eventType == "boss_defeated") {
        addComment("Hồ Ca (MC)", "CHIẾN THẮNG RỰC RỠ! Tuyết Mộc đã trảm sát Boss! Cả nước sục sôi ăn mừng!", "🏆", "MC");
        addComment("Khán Giả Quốc Tế", "Người Cửu Châu không thể ngăn cản! Quá phi thường!", "🌍", "Fan");
    } else if (eventType == "summon_zombie_corpse") {
        addComment("Lý Băng (MC)", "Trời đất ơi! Tuyết Mộc đang chôn xác và điều khiển quân đoàn Thây Ma cầm xẻng!", "🧟", "MC");
        addComment("Đại Diện Nước Ngoài", "Làm sao anh ta có thể biến quái vật thành lính phòng thủ?! Không thể tin được!", "😱", "Hater");
    }
}

void NationalStream::updateNationalStats(int zombiesKilled, int wavesCompleted) {
    m_stats.lifeExpectancyMonths = 1.0f + (wavesCompleted * 1.5f);
    m_stats.virusResistancePct = 1.0f + (wavesCompleted * 2.0f);
    m_stats.nationalTerritoryBonusKm2 = 10 + (zombiesKilled * 2);
}

} // namespace PvZ1
