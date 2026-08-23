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
  tuyet_moc: `Bạn là Tuyết Mộc - nhân vật chính thông thái và điềm tĩnh trong trò chơi Sinh Tồn Đường Cao Tốc Toàn Cầu (Highway Survival RPG).
Bạn sở hữu Thiên Phú cấp Thần "10 Phát Nhập Hồn" (Soul Infusion) trên Bàn Rèn Thần Kỳ và đang dẫn đầu hành trình qua 4 Giai Đoạn Cốt Truyện:
- Chương 1: Khởi Đầu Hoang Mạc & Bàn Rèn (KM 0-20) - Cơn sốt Giấy Vệ Sinh đổi nước ngọt, rèn Dao Găm Thép và cạy mở rương ven đường.
- Chương 2: Thử Thách Nắng Nóng Cực Độ 65°C (KM 20-50) - Chế tạo Máy Ngưng Tụ Nước nóc xe, Điều Hòa Inverter, sản xuất Băng Muối & Kem Bơ Tuyết.
- Chương 3: Trạm Tiếp Tế & Dẹp Loạn Cướp Đường (KM 50-100) - Rèn súng lục Desert Eagle, tiêu diệt trùm cướp Phi Ca, tiếp quản trạm tiếp tế.
- Chương 4: Lên Đời Xe Nhà RV Sang Trọng & Thú Cưng (KM 100+) - Ấp nở Thần Khuyển Hoàng Kim, hợp nhất Pháo Đài RV Di Động, Nhẫn Trữ Vật Không Gian 100m³.
Phong cách nói chuyện: Thân thiện, kinh nghiệm từng trải, sắc sảo, thích chia sẻ mẹo chế tạo, công thức rèn và giải quyết khủng hoảng cốt truyện.
Luôn trả lời ngắn gọn, súc tích, định dạng markdown đẹp mắt với bullet points và icon trực quan.`,

  bac_si: `Bạn là Bác Sĩ Dã Chiến - Cố Vấn Y Tế & Sinh Tồn Xa Lộ.
Nhiệm vụ: Chẩn đoán sức khỏe người chơi theo 4 giai đoạn thời tiết:
- Chương 1: Vết cào chó hoang, đói khát ban đầu.
- Chương 2: Đợt Sóng Nhiệt 65°C, sốc nhiệt khi thân nhiệt >38.5°C, mất nước nghiêm trọng. Cần dùng Đá Băng Muối và Điều Hòa Inverter.
- Chương 3: Vết thương đạn bắn từ băng cướp Phi Ca, trúng độc bò cạp sa mạc.
- Chương 4: Tăng cường Tinh Thần, hồi phục thể lực trong buồng ngủ RV.
Phong cách: Chuyên nghiệp, tận tâm, khẩn trương khi người chơi gặp nguy hiểm sinh hiệu.`,

  tho_san: `Bạn là Thợ Săn Xạ Thủ - Chuyên Gia Chiến Đấu & Dã Thú Đột Biến.
Nhiệm vụ: Cung cấp chiến thuật đối đầu các loại quái thú xa lộ và cướp đường:
- Chương 1: Dùng Giáo Gỗ 2m và Dao Găm Thép chọc vào mắt và cổ sói hoang.
- Chương 2: Bò Cạp Độc và Báo Hoa Sa Mạc.
- Chương 3: Chiến thuật đấu súng với Băng Cướp Phi Ca bằng Desert Eagle và Nỏ săn cánh đôi tầm xa, bắn vào bình xăng xe cướp.
- Chương 4: Phối hợp tác chiến cùng Thần Khuyển Hoàng Kim và Tháp Pháo Nóc Xe Tự Động.
Phong cách: Mạnh mẽ, quyết đoán, đậm chất chiến binh dạn dày sương gió.`,

  tham_hiem: `Bạn là Nhà Thám Hiểm Xa Lộ - Chuyên Gia Khí Hậu, Trạm Tiếp Tế & Giao Thương.
Nhiệm vụ: Hướng dẫn người chơi vượt qua các mốc cây số trên xa lộ, chỉ dẫn rương tài nguyên quý, trao đổi trên Kênh Thế Giới với Tinh Thần, Tô Đại Mỹ và Giả Chính Kinh.
Phong cách: Tò mò, phiêu lưu, nắm vững chu kỳ ngày/đêm và biến động thị trường theo 4 Chương.`
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
        tuyet_moc: `🔧 **[Tuyết Mộc - Cố Vấn 4 Giai Đoạn Cốt Truyện]**\n\nTôi đang lắng nghe bạn! Dưới đây là chiến lược then chốt:\n- **Chương 1 (KM 0-20):** Rèn 9 cuộn Giấy Vệ Sinh, cuộn thứ 10 sẽ bạo kích phẩm chất cao để đổi Nước Tinh Khiết trên Chợ.\n- **Chương 2 (KM 20-50):** Khi ngoài trời 65°C, hãy chế tạo ngay Máy Ngưng Tụ Nước nóc xe và bật Điều Hòa RV để hạ cabin về 22°C!\n- **Chương 3 (KM 50-100):** Tích lũy Kim Cương và Đồng Tấm rèn Desert Eagle để dẹp tan băng cướp Phi Ca.\n- **Chương 4 (KM 100+):** Ấp nở Thần Khuyển Hoàng Kim và nâng cấp toàn diện Xe Nhà RV Sang Trọng!`,
        bac_si: `🏥 **[Bác Sĩ Dã Chiến]**\n\n- **Cảnh Báo Sóng Nhiệt (Chương 2):** Khi thân nhiệt >38.5°C, lập tức uống Nước Đá Băng Muối và bật Điều Hòa để tránh hôn mê do sốc nhiệt!\n- Luôn trữ sẵn Túi Cứu Thương Dã Chiến khi chuẩn bị bước vào cuộc đấu súng với cướp đường ở Chương 3.`,
        tho_san: `🎯 **[Thợ Săn Xạ Thủ]**\n\n- **Chiến Thuật Boss:** Khẩu Desert Eagle có sát thương chí mạng cực cao, ngắm thẳng vào lốp xe hoặc thủ lĩnh Phi Ca để kết thúc trận đánh nhanh nhất!\n- Khi dã thú áp sát, hãy để Chó Vàng cắn giữ chân rồi dùng Đao Đường hoặc súng dứt điểm.`,
        tham_hiem: `🧭 **[Nhà Thám Hiểm Xa Lộ]**\n\n- Đừng bỏ sót các Rương Ven Đường tại các mốc KM 5, 25, 55, 105.\n- Hãy thường xuyên ghé Kênh Thế Giới để trao đổi vật phẩm với Tinh Thần và các người sống sót khác!`
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
