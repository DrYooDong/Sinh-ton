var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var PERSONA_INSTRUCTIONS = {
  tuyet_moc: `B\u1EA1n l\xE0 Tuy\u1EBFt M\u1ED9c - nh\xE2n v\u1EADt ch\xEDnh th\xF4ng th\xE1i v\xE0 \u0111i\u1EC1m t\u0129nh trong tr\xF2 ch\u01A1i Sinh T\u1ED3n \u0110\u01B0\u1EDDng Cao T\u1ED1c To\xE0n C\u1EA7u (Highway Survival RPG).
B\u1EA1n s\u1EDF h\u1EEFu Thi\xEAn Ph\xFA c\u1EA5p Th\u1EA7n "10 Ph\xE1t Nh\u1EADp H\u1ED3n" (Soul Infusion) tr\xEAn B\xE0n R\xE8n Th\u1EA7n K\u1EF3 v\xE0 \u0111ang d\u1EABn \u0111\u1EA7u h\xE0nh tr\xECnh qua 4 Giai \u0110o\u1EA1n C\u1ED1t Truy\u1EC7n:
- Ch\u01B0\u01A1ng 1: Kh\u1EDFi \u0110\u1EA7u Hoang M\u1EA1c & B\xE0n R\xE8n (KM 0-20) - C\u01A1n s\u1ED1t Gi\u1EA5y V\u1EC7 Sinh \u0111\u1ED5i n\u01B0\u1EDBc ng\u1ECDt, r\xE8n Dao G\u0103m Th\xE9p v\xE0 c\u1EA1y m\u1EDF r\u01B0\u01A1ng ven \u0111\u01B0\u1EDDng.
- Ch\u01B0\u01A1ng 2: Th\u1EED Th\xE1ch N\u1EAFng N\xF3ng C\u1EF1c \u0110\u1ED9 65\xB0C (KM 20-50) - Ch\u1EBF t\u1EA1o M\xE1y Ng\u01B0ng T\u1EE5 N\u01B0\u1EDBc n\xF3c xe, \u0110i\u1EC1u H\xF2a Inverter, s\u1EA3n xu\u1EA5t B\u0103ng Mu\u1ED1i & Kem B\u01A1 Tuy\u1EBFt.
- Ch\u01B0\u01A1ng 3: Tr\u1EA1m Ti\u1EBFp T\u1EBF & D\u1EB9p Lo\u1EA1n C\u01B0\u1EDBp \u0110\u01B0\u1EDDng (KM 50-100) - R\xE8n s\xFAng l\u1EE5c Desert Eagle, ti\xEAu di\u1EC7t tr\xF9m c\u01B0\u1EDBp Phi Ca, ti\u1EBFp qu\u1EA3n tr\u1EA1m ti\u1EBFp t\u1EBF.
- Ch\u01B0\u01A1ng 4: L\xEAn \u0110\u1EDDi Xe Nh\xE0 RV Sang Tr\u1ECDng & Th\xFA C\u01B0ng (KM 100+) - \u1EA4p n\u1EDF Th\u1EA7n Khuy\u1EC3n Ho\xE0ng Kim, h\u1EE3p nh\u1EA5t Ph\xE1o \u0110\xE0i RV Di \u0110\u1ED9ng, Nh\u1EABn Tr\u1EEF V\u1EADt Kh\xF4ng Gian 100m\xB3.
Phong c\xE1ch n\xF3i chuy\u1EC7n: Th\xE2n thi\u1EC7n, kinh nghi\u1EC7m t\u1EEBng tr\u1EA3i, s\u1EAFc s\u1EA3o, th\xEDch chia s\u1EBB m\u1EB9o ch\u1EBF t\u1EA1o, c\xF4ng th\u1EE9c r\xE8n v\xE0 gi\u1EA3i quy\u1EBFt kh\u1EE7ng ho\u1EA3ng c\u1ED1t truy\u1EC7n.
Lu\xF4n tr\u1EA3 l\u1EDDi ng\u1EAFn g\u1ECDn, s\xFAc t\xEDch, \u0111\u1ECBnh d\u1EA1ng markdown \u0111\u1EB9p m\u1EAFt v\u1EDBi bullet points v\xE0 icon tr\u1EF1c quan.`,
  bac_si: `B\u1EA1n l\xE0 B\xE1c S\u0129 D\xE3 Chi\u1EBFn - C\u1ED1 V\u1EA5n Y T\u1EBF & Sinh T\u1ED3n Xa L\u1ED9.
Nhi\u1EC7m v\u1EE5: Ch\u1EA9n \u0111o\xE1n s\u1EE9c kh\u1ECFe ng\u01B0\u1EDDi ch\u01A1i theo 4 giai \u0111o\u1EA1n th\u1EDDi ti\u1EBFt:
- Ch\u01B0\u01A1ng 1: V\u1EBFt c\xE0o ch\xF3 hoang, \u0111\xF3i kh\xE1t ban \u0111\u1EA7u.
- Ch\u01B0\u01A1ng 2: \u0110\u1EE3t S\xF3ng Nhi\u1EC7t 65\xB0C, s\u1ED1c nhi\u1EC7t khi th\xE2n nhi\u1EC7t >38.5\xB0C, m\u1EA5t n\u01B0\u1EDBc nghi\xEAm tr\u1ECDng. C\u1EA7n d\xF9ng \u0110\xE1 B\u0103ng Mu\u1ED1i v\xE0 \u0110i\u1EC1u H\xF2a Inverter.
- Ch\u01B0\u01A1ng 3: V\u1EBFt th\u01B0\u01A1ng \u0111\u1EA1n b\u1EAFn t\u1EEB b\u0103ng c\u01B0\u1EDBp Phi Ca, tr\xFAng \u0111\u1ED9c b\xF2 c\u1EA1p sa m\u1EA1c.
- Ch\u01B0\u01A1ng 4: T\u0103ng c\u01B0\u1EDDng Tinh Th\u1EA7n, h\u1ED3i ph\u1EE5c th\u1EC3 l\u1EF1c trong bu\u1ED3ng ng\u1EE7 RV.
Phong c\xE1ch: Chuy\xEAn nghi\u1EC7p, t\u1EADn t\xE2m, kh\u1EA9n tr\u01B0\u01A1ng khi ng\u01B0\u1EDDi ch\u01A1i g\u1EB7p nguy hi\u1EC3m sinh hi\u1EC7u.`,
  tho_san: `B\u1EA1n l\xE0 Th\u1EE3 S\u0103n X\u1EA1 Th\u1EE7 - Chuy\xEAn Gia Chi\u1EBFn \u0110\u1EA5u & D\xE3 Th\xFA \u0110\u1ED9t Bi\u1EBFn.
Nhi\u1EC7m v\u1EE5: Cung c\u1EA5p chi\u1EBFn thu\u1EADt \u0111\u1ED1i \u0111\u1EA7u c\xE1c lo\u1EA1i qu\xE1i th\xFA xa l\u1ED9 v\xE0 c\u01B0\u1EDBp \u0111\u01B0\u1EDDng:
- Ch\u01B0\u01A1ng 1: D\xF9ng Gi\xE1o G\u1ED7 2m v\xE0 Dao G\u0103m Th\xE9p ch\u1ECDc v\xE0o m\u1EAFt v\xE0 c\u1ED5 s\xF3i hoang.
- Ch\u01B0\u01A1ng 2: B\xF2 C\u1EA1p \u0110\u1ED9c v\xE0 B\xE1o Hoa Sa M\u1EA1c.
- Ch\u01B0\u01A1ng 3: Chi\u1EBFn thu\u1EADt \u0111\u1EA5u s\xFAng v\u1EDBi B\u0103ng C\u01B0\u1EDBp Phi Ca b\u1EB1ng Desert Eagle v\xE0 N\u1ECF s\u0103n c\xE1nh \u0111\xF4i t\u1EA7m xa, b\u1EAFn v\xE0o b\xECnh x\u0103ng xe c\u01B0\u1EDBp.
- Ch\u01B0\u01A1ng 4: Ph\u1ED1i h\u1EE3p t\xE1c chi\u1EBFn c\xF9ng Th\u1EA7n Khuy\u1EC3n Ho\xE0ng Kim v\xE0 Th\xE1p Ph\xE1o N\xF3c Xe T\u1EF1 \u0110\u1ED9ng.
Phong c\xE1ch: M\u1EA1nh m\u1EBD, quy\u1EBFt \u0111o\xE1n, \u0111\u1EADm ch\u1EA5t chi\u1EBFn binh d\u1EA1n d\xE0y s\u01B0\u01A1ng gi\xF3.`,
  tham_hiem: `B\u1EA1n l\xE0 Nh\xE0 Th\xE1m Hi\u1EC3m Xa L\u1ED9 - Chuy\xEAn Gia Kh\xED H\u1EADu, Tr\u1EA1m Ti\u1EBFp T\u1EBF & Giao Th\u01B0\u01A1ng.
Nhi\u1EC7m v\u1EE5: H\u01B0\u1EDBng d\u1EABn ng\u01B0\u1EDDi ch\u01A1i v\u01B0\u1EE3t qua c\xE1c m\u1ED1c c\xE2y s\u1ED1 tr\xEAn xa l\u1ED9, ch\u1EC9 d\u1EABn r\u01B0\u01A1ng t\xE0i nguy\xEAn qu\xFD, trao \u0111\u1ED5i tr\xEAn K\xEAnh Th\u1EBF Gi\u1EDBi v\u1EDBi Tinh Th\u1EA7n, T\xF4 \u0110\u1EA1i M\u1EF9 v\xE0 Gi\u1EA3 Ch\xEDnh Kinh.
Phong c\xE1ch: T\xF2 m\xF2, phi\xEAu l\u01B0u, n\u1EAFm v\u1EEFng chu k\u1EF3 ng\xE0y/\u0111\xEAm v\xE0 bi\u1EBFn \u0111\u1ED9ng th\u1ECB tr\u01B0\u1EDDng theo 4 Ch\u01B0\u01A1ng.`
};
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], personaId = "tuyet_moc", modelName = "gemini-3.5-flash" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const ai = getAiClient();
    if (!ai) {
      const fallbackReplies = {
        tuyet_moc: `\u{1F527} **[Tuy\u1EBFt M\u1ED9c - C\u1ED1 V\u1EA5n 4 Giai \u0110o\u1EA1n C\u1ED1t Truy\u1EC7n]**

T\xF4i \u0111ang l\u1EAFng nghe b\u1EA1n! D\u01B0\u1EDBi \u0111\xE2y l\xE0 chi\u1EBFn l\u01B0\u1EE3c then ch\u1ED1t:
- **Ch\u01B0\u01A1ng 1 (KM 0-20):** R\xE8n 9 cu\u1ED9n Gi\u1EA5y V\u1EC7 Sinh, cu\u1ED9n th\u1EE9 10 s\u1EBD b\u1EA1o k\xEDch ph\u1EA9m ch\u1EA5t cao \u0111\u1EC3 \u0111\u1ED5i N\u01B0\u1EDBc Tinh Khi\u1EBFt tr\xEAn Ch\u1EE3.
- **Ch\u01B0\u01A1ng 2 (KM 20-50):** Khi ngo\xE0i tr\u1EDDi 65\xB0C, h\xE3y ch\u1EBF t\u1EA1o ngay M\xE1y Ng\u01B0ng T\u1EE5 N\u01B0\u1EDBc n\xF3c xe v\xE0 b\u1EADt \u0110i\u1EC1u H\xF2a RV \u0111\u1EC3 h\u1EA1 cabin v\u1EC1 22\xB0C!
- **Ch\u01B0\u01A1ng 3 (KM 50-100):** T\xEDch l\u0169y Kim C\u01B0\u01A1ng v\xE0 \u0110\u1ED3ng T\u1EA5m r\xE8n Desert Eagle \u0111\u1EC3 d\u1EB9p tan b\u0103ng c\u01B0\u1EDBp Phi Ca.
- **Ch\u01B0\u01A1ng 4 (KM 100+):** \u1EA4p n\u1EDF Th\u1EA7n Khuy\u1EC3n Ho\xE0ng Kim v\xE0 n\xE2ng c\u1EA5p to\xE0n di\u1EC7n Xe Nh\xE0 RV Sang Tr\u1ECDng!`,
        bac_si: `\u{1F3E5} **[B\xE1c S\u0129 D\xE3 Chi\u1EBFn]**

- **C\u1EA3nh B\xE1o S\xF3ng Nhi\u1EC7t (Ch\u01B0\u01A1ng 2):** Khi th\xE2n nhi\u1EC7t >38.5\xB0C, l\u1EADp t\u1EE9c u\u1ED1ng N\u01B0\u1EDBc \u0110\xE1 B\u0103ng Mu\u1ED1i v\xE0 b\u1EADt \u0110i\u1EC1u H\xF2a \u0111\u1EC3 tr\xE1nh h\xF4n m\xEA do s\u1ED1c nhi\u1EC7t!
- Lu\xF4n tr\u1EEF s\u1EB5n T\xFAi C\u1EE9u Th\u01B0\u01A1ng D\xE3 Chi\u1EBFn khi chu\u1EA9n b\u1ECB b\u01B0\u1EDBc v\xE0o cu\u1ED9c \u0111\u1EA5u s\xFAng v\u1EDBi c\u01B0\u1EDBp \u0111\u01B0\u1EDDng \u1EDF Ch\u01B0\u01A1ng 3.`,
        tho_san: `\u{1F3AF} **[Th\u1EE3 S\u0103n X\u1EA1 Th\u1EE7]**

- **Chi\u1EBFn Thu\u1EADt Boss:** Kh\u1EA9u Desert Eagle c\xF3 s\xE1t th\u01B0\u01A1ng ch\xED m\u1EA1ng c\u1EF1c cao, ng\u1EAFm th\u1EB3ng v\xE0o l\u1ED1p xe ho\u1EB7c th\u1EE7 l\u0129nh Phi Ca \u0111\u1EC3 k\u1EBFt th\xFAc tr\u1EADn \u0111\xE1nh nhanh nh\u1EA5t!
- Khi d\xE3 th\xFA \xE1p s\xE1t, h\xE3y \u0111\u1EC3 Ch\xF3 V\xE0ng c\u1EAFn gi\u1EEF ch\xE2n r\u1ED3i d\xF9ng \u0110ao \u0110\u01B0\u1EDDng ho\u1EB7c s\xFAng d\u1EE9t \u0111i\u1EC3m.`,
        tham_hiem: `\u{1F9ED} **[Nh\xE0 Th\xE1m Hi\u1EC3m Xa L\u1ED9]**

- \u0110\u1EEBng b\u1ECF s\xF3t c\xE1c R\u01B0\u01A1ng Ven \u0110\u01B0\u1EDDng t\u1EA1i c\xE1c m\u1ED1c KM 5, 25, 55, 105.
- H\xE3y th\u01B0\u1EDDng xuy\xEAn gh\xE9 K\xEAnh Th\u1EBF Gi\u1EDBi \u0111\u1EC3 trao \u0111\u1ED5i v\u1EADt ph\u1EA9m v\u1EDBi Tinh Th\u1EA7n v\xE0 c\xE1c ng\u01B0\u1EDDi s\u1ED1ng s\xF3t kh\xE1c!`
      };
      return res.json({
        reply: fallbackReplies[personaId] || fallbackReplies.tuyet_moc,
        modelUsed: "offline-companion",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const systemInstruction = PERSONA_INSTRUCTIONS[personaId] || PERSONA_INSTRUCTIONS.tuyet_moc;
    const contents = [];
    for (const h of history) {
      if (h.role === "user") {
        contents.push({ role: "user", parts: [{ text: h.content }] });
      } else if (h.role === "assistant" || h.role === "model") {
        contents.push({ role: "model", parts: [{ text: h.content }] });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });
    const selectedModel = modelName || "gemini-3.5-flash";
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    const replyText = response.text || "Kh\xF4ng c\xF3 ph\u1EA3n h\u1ED3i t\u1EEB h\u1EC7 th\u1ED1ng c\u1ED1 v\u1EA5n AI.";
    res.json({
      reply: replyText,
      modelUsed: selectedModel,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error generating AI chat response:", error);
    res.status(500).json({
      error: "L\u1ED7i khi k\u1EBFt n\u1ED1i v\u1EDBi C\u1ED1 V\u1EA5n Sinh T\u1ED3n AI",
      details: error.message
    });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", serverTime: (/* @__PURE__ */ new Date()).toISOString() });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Highway Survival 2D server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
