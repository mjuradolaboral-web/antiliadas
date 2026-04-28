const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AntiLiadas backend funcionando");
});

app.post("/analizar", async (req, res) => {
  try {
    console.log("Petición recibida:", req.body);

    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim().length < 3) {
      return res.status(400).json({
        error: "Escribe un mensaje válido.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Falta OPENAI_API_KEY en el archivo .env",
      });
    }

    const prompt = `
Eres AntiLiadas.

Analiza este mensaje que alguien está a punto de enviar a su pareja.

No seas genérico. Sé específico, directo y humano.

Mensaje:
"${mensaje}"

Responde EXACTAMENTE en este formato:

🔴 Riesgo de conflicto: [número entre 0 y 100]%

⚠️ Problemas detectados:
- Señala palabras concretas que escalan.
- Explica por qué activan conflicto.
- Indica el tono del mensaje.

💥 Cómo lo puede interpretar tu pareja:
Explica en 2-3 líneas lo que probablemente sentirá o pensará.

✔️ Versión asertiva:
"[misma idea pero clara y sin atacar]"

✔️ Versión conciliadora:
"[reduce conflicto al máximo]"

✔️ Versión vulnerable:
"[expresa emoción sin culpar]"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultado = completion.choices[0].message.content;

    console.log("Análisis generado correctamente");

    res.json({ resultado });
  } catch (error) {
    console.error("ERROR EN /analizar:", error);

    res.status(500).json({
      error: error.message || "Error desconocido en el servidor",
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});