#include "../include/Card.hpp"

namespace PvZ2 {

CardDatabase::CardDatabase() {
    initializeCards();
}

CardDatabase& CardDatabase::getInstance() {
    static CardDatabase instance;
    return instance;
}

const CardDefinition* CardDatabase::getCard(const std::string& id) const {
    auto it = m_cards.find(id);
    if (it != m_cards.end()) {
        return it->second.get();
    }
    return nullptr;
}

const std::unordered_map<std::string, std::shared_ptr<CardDefinition>>& CardDatabase::getAllCards() const {
    return m_cards;
}

void CardDatabase::initializeCards() {
    // 1. Sunflower
    m_cards["sunflower"] = std::make_shared<CardDefinition>(
        "sunflower", "Hoa Hướng Dương", "Hoa Hướng Dương Quang Năng", "Dương Dương",
        CardRarity::C, CardCategory::Plant,
        50, 4.0f, 300, 0, 0.0f,
        "Sản xuất +50 Ánh Sáng Mặt Trời định kỳ mỗi 5 giây.",
        "Loài hoa nền tảng được Tuyết Mộc ươm mầm đầu tiên tại Bí Cảnh.",
        "Mặt trời tỏa sáng, sức sống dạt dào!",
        "Phun trào 150 Mặt Trời tức thì và hồi 100% máu cho đồng đội xung quanh.",
        std::vector<std::string>{"kinh_te", "ho_tro"}
    );

    // 2. Peashooter Devourer (Tiểu Thôn)
    m_cards["peashooter_devourer"] = std::make_shared<CardDefinition>(
        "peashooter_devourer", "Xạ Thủ Nuốt Chửng", "Xạ Thủ Nuốt Chửng (Tiểu Thôn)", "Tiểu Thôn",
        CardRarity::S, CardCategory::Plant,
        125, 5.0f, 450, 45, 1.2f,
        "Bắn đạn đậu sát thương cao. Có thể nuốt vũ khí để chuyển dạng súng Gatling.",
        "Tính tình độc mồm, khinh bỉ vũ khí tầm thường nhưng trung thành tuyệt đối.",
        "Chủ nhân gà mờ, mau ném vũ khí xịn đây cho ta nuốt!",
        "Hóa thân thành Đại Bác Gatling xả 100 viên đạn xuyên thấu toàn bộ làn đường.",
        std::vector<std::string>{"chu_luc", "tien_hoa"}
    );

    // 3. Giant Walnut (Hạt Dẻ Khổng Lồ)
    m_cards["giant_walnut"] = std::make_shared<CardDefinition>(
        "giant_walnut", "Bức Tường Hạt Dẻ", "Hạt Dẻ Khổng Lồ Cấp S", "Đại Lực Hạt",
        CardRarity::A, CardCategory::Plant,
        75, 12.0f, 4000, 15, 0.0f,
        "Lá chắn thép chịu đòn cực trâu, chặn đứng quái vật và Boss tiến công.",
        "Từng lăn nát hàng trăm Zombie từ sân thượng xuống sảnh, mở đường máu cho La Quân.",
        "Cứ đánh vào đây, ta chẳng thấy đau chút nào!",
        "Khoác áo giáp Titan phát quang, tạo lá chắn phản đòn 50% sát thương.",
        std::vector<std::string>{"phong_thu", "la_chan"}
    );

    // 4. Newspaper Zombie (Nhị Gia)
    m_cards["newspaper_zombie"] = std::make_shared<CardDefinition>(
        "newspaper_zombie", "Zombie Đọc Báo", "Thây Ma Đọc Báo (Nhị Gia)", "Nhị Gia",
        CardRarity::SS, CardCategory::Zombie,
        175, 8.0f, 1800, 80, 1.0f,
        "Phòng thủ tuyệt đối khi tờ báo còn nguyên. Khi báo rách, cuồng nộ tăng 300% tốc đánh.",
        "Mặc quần lót hồng phấn, dáng vẻ bỉ ổi nhưng khiến bạo chúa Vô Năng sụp đổ tâm lý.",
        "Ai dám làm rách trang nhất của bổn gia?!",
        "Mở bản tin Thời Sự Tận Thế, ru ngủ toàn bộ kẻ địch trong 4 giây.",
        std::vector<std::string>{"phan_kich", "khong_che"}
    );

    // 5. Chomper (Hoa Ăn Thịt)
    m_cards["chomper"] = std::make_shared<CardDefinition>(
        "chomper", "Hoa Ăn Thịt Tinh Hồn", "Hoa Ngoạm Tinh Hồn", "Đại Vị Vương",
        CardRarity::A, CardCategory::Plant,
        150, 7.0f, 600, 350, 6.0f,
        "Nuốt chửng ngay lập tức quái thường và lưu trữ Tinh Hồn.",
        "Túi không gian sống của Tuyết Mộc, chuyên thu nhặt Tinh Hạch và vũ khí.",
        "Ngoạm... ngon tuyệt cú mèo!",
        "Nuốt 3 mục tiêu cùng lúc và chuyển hóa thành 100 Tinh Hồn.",
        std::vector<std::string>{"sat_thu", "thu_thap"}
    );

    // 6. Cherry Bomb (Bom Anh Đào)
    m_cards["cherry_bomb"] = std::make_shared<CardDefinition>(
        "cherry_bomb", "Bom Anh Đào", "Cặp Đôi Hạt Nhân Anh Đào", "Song Sát",
        CardRarity::Pi, CardCategory::PiSpecial,
        150, 18.0f, 100, 1800, 0.0f,
        "Thẻ Tiêu Hao (Chữ Pi): Phát nổ diện rộng 3x3 gây sát thương hủy diệt.",
        "Thẻ bài dùng một lần quý giá, vũ khí dọn sân thượng đỉnh của Tuyết Mộc.",
        "BÙMMMMMM! Tro bụi về với tro bụi!",
        "Tạo vụ nổ liên hoàn hình chữ thập, thiêu rụi mọi chướng ngại vật.",
        std::vector<std::string>{"huy_diet", "dien_rong"}
    );

    // 7. Magnet Shroom (Nấm Từ Lực)
    m_cards["magnet_shroom"] = std::make_shared<CardDefinition>(
        "magnet_shroom", "Nấm Từ Lực", "Nấm Nam Châm Hút Giáp", "Nam Châm Nhỏ",
        CardRarity::S, CardCategory::Plant,
        100, 10.0f, 500, 20, 3.0f,
        "Hút giáp sắt, vũ khí kim loại và tước đoạt súng RPG của địch.",
        "Cơn ác mộng tước vũ khí của Bạo Chúa Vô Năng và binh đoàn cơ giới.",
        "Keng keng! Toàn bộ súng đạn đều là của ta!",
        "Kích hoạt bão từ trường cực đại, giật tung vũ khí của toàn bộ kẻ địch trên sân.",
        std::vector<std::string>{"khong_che", "tuoc_vu_khi"}
    );

    // 8. Watermelon Pult (Máy Bắn Dưa Hấu)
    m_cards["watermelon_pult"] = std::make_shared<CardDefinition>(
        "watermelon_pult", "Máy Bắn Dưa Hấu", "Pháo Binh Dưa Hấu", "Dưa Hấu Đại Vương",
        CardRarity::S, CardCategory::Plant,
        300, 8.0f, 600, 200, 2.5f,
        "Ném dưa hấu nổ lan sát thương khủng khiếp. Món khoái khẩu của Yagu Yosuke.",
        "Lý do khiến Samurai Yagu Yosuke cam tâm tình nguyện làm vệ sĩ cho Tuyết Mộc.",
        "Dưa ngọt nước nổ tung chiến trường!",
        "Bắn đại bác Dưa Băng Mát Lạnh nổ chậm làm đông cứng toàn bộ quân địch.",
        std::vector<std::string>{"dien_rong", "sat_thu_nang"}
    );
}

} // namespace PvZ2
