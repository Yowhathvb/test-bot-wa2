// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch'); // sudah ada di node18+

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot sudah siap!');
});

client.on('message', async (msg) => {
  // Private chat -> selalu log
  if (!msg.from.endsWith("@g.us")) {
    console.log(`📩 [PRIVAT] ${msg.from}: ${msg.body}`);
  } else {
    // Grup -> log hanya kalau ada !ai atau mention bot
    if (msg.body.startsWith("!ai") || msg.mentionedIds.includes(client.info.wid._serialized)) {
      console.log(`👥 [GRUP] ${msg.from}: ${msg.body}`);
    }
  }

  // === lanjut handler AI ===
  if (msg.body.startsWith("!ai")) {
    const prompt = msg.body.replace("!ai", "").trim();
    if (!prompt) {
      return msg.reply("❌ Tolong tulis pertanyaan setelah !ai");
    }

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCMhDb133aVQBFNQPfG7B7nzKGhOkj7kag",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await response.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Tidak ada jawaban dari AI";

      msg.reply(aiReply);
    } catch (err) {
      console.error(err);
      msg.reply("❌ Terjadi error saat hubungin AI");
    }
  }
});

client.initialize();
