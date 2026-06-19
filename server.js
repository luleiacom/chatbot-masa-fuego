// ============================================
//  SERVER.JS — Backend para Masa & Fuego (Groq)
// ============================================
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("⚠️  Falta la variable de entorno GROQ_API_KEY. Configurala en Railway > Variables.");
}

app.use(cors());
app.use(express.json());

// Sirve el frontend (index.html) desde la carpeta static/
app.use(express.static(path.join(__dirname, "static")));

// ============================================
//  POST /chat
// ============================================
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Falta el array 'messages' en el body." });
    }

    const respuestaGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!respuestaGroq.ok) {
      const errorTexto = await respuestaGroq.text();
      console.error("Error de Groq:", respuestaGroq.status, errorTexto);

      if (respuestaGroq.status === 429) {
        return res.status(429).json({ error: "rate_limit" });
      }
      return res.status(502).json({ error: "Error al consultar Groq." });
    }

    const data = await respuestaGroq.json();

    // Groq ya devuelve el formato { choices: [{ message: { content } }] }
    // así que se lo pasamos directo al frontend.
    res.json(data);
  } catch (err) {
    console.error("Error interno en /chat:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Healthcheck simple, útil para verificar que el servidor está vivo en Railway
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});