const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "https://antiliadas.vercel.app"
}));

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

    const { mensaje, perfil, modo } = req.body;
const modoAnalisis = modo || "enviar";

    if (!mensaje || mensaje.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        error: "Escribe un mensaje un poco más largo para poder analizarlo bien.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Falta OPENAI_API_KEY en Render o en el archivo .env local.",
      });
    }

    const contextoPareja = `
Perfil de la pareja/persona:
- Nombre: ${perfil?.nombre || "la otra persona"}
- Estilo de comunicación: ${perfil?.estilo || "no especificado"}
- Cosas que le suelen sentar mal: ${perfil?.gatillos || "no especificado"}
- Cosas que suelen funcionar con esta persona: ${perfil?.funciona || "no especificado"}
- Fase actual de la relación: ${perfil?.fase || "no especificada"}
`;

    let prompt = "";

if (modoAnalisis === "decodificar") {

  prompt = `
Eres AntiLiadas.

El usuario ha recibido un mensaje de su pareja y quiere entenderlo sin rayarse ni interpretar mal.

Mensaje recibido:
"${mensaje}"

Contexto:
${contextoPareja}

Reglas:
- No inventes certezas.
- No alimentes paranoia.
- Da interpretación probable, no absoluta.
- Calma emocional primero.
- Señala qué NO debería asumir.
- Da una recomendación clara.

Formato:

💬 Validación:
[1 frase breve]

🧠 Qué puede significar:
[2-3 interpretaciones realistas]

🚫 Qué no deberías asumir:
[errores comunes de interpretación]

👉 Qué hacer ahora:
[recomendación clara]

💬 Respuesta sugerida (si responde):
"[mensaje opcional]"
`;

} else {

  prompt = `
Eres AntiLiadas.

El usuario está a punto de enviar este mensaje a su pareja.

Mensaje:
"${mensaje}"

Contexto:
${contextoPareja}

Reglas:
- Sé directo y humano.
- Detecta riesgo emocional.
- Si puede empeorar la situación, dilo.
- Da una única recomendación clara.
- No des múltiples versiones.

Formato:

💬 Validación:
[1 frase breve]

🧠 Qué está pasando:
[explicación clara]

👀 Cómo lo puede recibir:
[interpretación de la otra persona]

⛔ ¿Conviene enviarlo?
[sí / no / esperar + razón]

✅ Mensaje recomendado:
"[mensaje listo para copiar]"

🔮 Probable reacción:
[realista]
`;
}

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultado = completion.choices[0].message.content;

    console.log("Análisis generado correctamente");

    return res.json({
      ok: true,
      resultado,
    });

  } catch (error) {
    console.error("ERROR EN /analizar:", error);

    return res.status(500).json({
      ok: false,
      error: error.message || "Fallo al analizar el mensaje.",
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});