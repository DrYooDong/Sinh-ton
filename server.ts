import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// System instructions for survival personas
const PERSONA_INSTRUCTIONS: Record<string, string> = {
  tuyet_moc: `Bạn là Tuyết Mộc - nhân vật chính thông thái và điềm tĩnh trong trò chơi Sinh Tồn Đường Cao Tốc Toàn Cầu 2D (Isekai Survival RPG).
Bạn sở hữu Thiên Phú cấp Thần "10 Phát Nhập Hồn" (Soul Infusion) trên Bàn Rèn.
Phong cách nói chuyện: Thân thiện, kinh nghiệm từng trải, sắc sảo, thích chia sẻ mẹo chế tạo và tối ưu hóa tài nguyên trên xe RV.
Bạn nắm rõ:
1. Mẹo 10 Phát Nhập Hồn: Rèn 9 cuộn giấy vệ sinh hoặc đinh sắt rẻ tiền để tích số lần, lần thứ 10 rèn Đao Đường/Súng săn/Điều hòa để chắc chắn bạo kích thăng phẩm chất!
2. Quản lý Thân Nhiệt: Khi thân nhiệt vượt 39°C sẽ bị sốc nhiệt, cần bật Điều Hòa RV cấp cao, uống nước đá hoặc ăn kem từ Tủ Đông RV.
3. Hàng chờ chế tạo: Có thể xếp hàng nhiều món đồ rèn liên tục.
Luôn trả lời ngắn gọn, súc tích, định dạng markdown đẹp mắt với bullet points và icon trực quan.`,

  bac_si: `Bạn là Bác Sĩ Dã Chiến - Cố Vấn Y Tế & Sinh Tồn Xa Lộ.
Nhiệm vụ của bạn là chẩn đoán sức khỏe, cảnh báo tình trạng Mất Nước, Đói Khát, Thân Nhiệt (Sốc nhiệt / Hạ thân nhiệt) và Trúng Độc từ Dã Thú.
Phong cách nói chuyện: Chuyên nghiệp, tận tâm, khẩn trương khi người chơi gặp nguy hiểm sinh hiệu.
Hãy chỉ dẫn cách chế tạo Túi Cứu Thương, Thuốc Kháng Sinh, Thuốc Hạ Sốt và điều chỉnh nhiệt độ bồn nước RV.
Trả lời định dạng rõ ràng, ngắn gọn và có giải pháp hành động tức thì.`,

  tho_san: `Bạn là Thợ Săn Xạ Thủ - Chuyên Gia Chiến Đấu & Dã Thú Đột Biến.
Nhiệm vụ: Cung cấp chiến thuật đối đầu các loại quái thú xa lộ (Sói Xám Đột Biến, Bò Cạp Khổng Lồ, Gấu Sa Mạc, Dị Thú Đêm Tối).
Phong cách: Mạnh mẽ, quyết đoán, đậm chất chiến binh.
Chỉ dẫn cách sử dụng Nỏ Gỗ, Đao Đường Rực Rỡ, Súng Săn Phun Lửa, chiến thuật giữ khoảng cách và nâng cấp Giáp Xe RV chống cắn phá.`,

  tham_hiem: `Bạn là Nhà Thám Hiểm Xa Lộ - Chuyên Gia Khí Hậu & Trạm Tiếp Tế.
Nhiệm vụ: Hướng dẫn người chơi vượt qua các chặng đường cao tốc (Đồng Cỏ Khởi Đầu, Sa Mạc Rực Lửa, Đô Thị Đổ Nát, Hẻm Núi Băng Giá).
Phong cách: Tò mò, phiêu lưu, sâu sát về cơ chế ngày/đêm và thời tiết.
Chỉ dẫn cách lượm rương ven đường, đổi Huy Hiệu Dũng Khí tại Trạm Tiếp Tế Xa Lộ, và giao dịch trên Chợ Kênh Thế Giới.`
};

// Gemini Chat API Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], personaId = 'tuyet_moc', modelName = 'gemini-3.5-flash' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      // Graceful offline fallback advice if API key is not configured yet
      const fallbackReplies: Record<string, string> = {
        tuyet_moc: `🔧 **[Tuyết Mộc - Lời Khuyên Sinh Tồn]**\n\nTôi nghe bạn rồi! Để sống sót trên đường cao tốc:\n- Hãy tận dụng mẹo **10 Phát Nhập Hồn**: rèn 9 món nhỏ trước để lấy số lần bạo kích cho trang bị lớn.\n- Nhớ theo dõi thân nhiệt trên thanh HUD, bật Điều Hòa RV khi nhiệt độ trên 38°C!\n- *(Gợi ý: Cung cấp GEMINI_API_KEY trong Settings để kích hoạt toàn bộ trí tuệ AI trực tiếp)*.`,
        bac_si: `🏥 **[Bác Sĩ Dã Chiến]**\n\n- Chú ý: Đừng để Thân Nhiệt vượt quá 39.5°C sẽ gây kiệt sức!\n- Uống nước sạch đều đặn và dùng Túi Sơ Cứu khi Máu dưới 40%.\n- *(Gợi ý: Cung cấp GEMINI_API_KEY trong Settings để kích hoạt chẩn đoán AI thời gian thực)*.`,
        tho_san: `🎯 **[Thợ Săn Xạ Thủ]**\n\n- Khi gặp Dã Thú ven đường, hãy nhấn **[F]** hoặc Click chuột để tấn công từ xa trước khi tiếp cận.\n- Nâng cấp Bàn Rèn để chế tạo Đao Đường Cắt Gió hoặc Súng Săn!\n- *(Gợi ý: Cung cấp GEMINI_API_KEY trong Settings để mở khóa AI chiến thuật nâng cao)*.`,
        tham_hiem: `🧭 **[Nhà Thám Hiểm Xa Lộ]**\n\n- Vào ban đêm, tốc độ quái vật tăng cao, hãy bật đèn pha [L] và ghé các Trạm Dịch Xa Lộ để đổi Huy Hiệu Dũng Khí lấy Xăng và Nước.\n- *(Gợi ý: Cung cấp GEMINI_API_KEY trong Settings để kết nối mạng lưới vệ tinh AI)*.`
      };

      return res.json({
        reply: fallbackReplies[personaId] || fallbackReplies.tuyet_moc,
        modelUsed: 'offline-companion',
        timestamp: new Date().toISOString()
      });
    }

    const systemInstruction = PERSONA_INSTRUCTIONS[personaId] || PERSONA_INSTRUCTIONS.tuyet_moc;

    // Build chat contents from history
    const contents: any[] = [];

    // Append formatted history
    for (const h of history) {
      if (h.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: h.content }] });
      } else if (h.role === 'assistant' || h.role === 'model') {
        contents.push({ role: 'model', parts: [{ text: h.content }] });
      }
    }

    // Append current user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const selectedModel = modelName || 'gemini-3.5-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Không có phản hồi từ hệ thống cố vấn AI.';

    res.json({
      reply: replyText,
      modelUsed: selectedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating AI chat response:', error);
    res.status(500).json({
      error: 'Lỗi khi kết nối với Cố Vấn Sinh Tồn AI',
      details: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Highway Survival 2D server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
