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

    const { mensaje, perfil } = req.body;
const contextoPareja = `
Perfil de la pareja/persona:
- Nombre: ${perfil?.nombre || "la otra persona"}
- Estilo de comunicación: ${perfil?.estilo || "no especificado"}
- Cosas que le suelen sentar mal: ${perfil?.gatillos || "no especificado"}
- Cosas que suelen funcionar con esta persona: ${perfil?.funciona || "no especificado"}
- Fase actual de la relación: ${perfil?.fase || "no especificada"}
`;
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

    const prompt = `
Eres AntiLiadas.

Analiza este mensaje que alguien está a punto de enviar a su pareja.

No seas genérico. Sé específico, directo y humano.
No manipules. No prometas salvar relaciones. Ayuda a expresar mejor el mensaje.

Mensaje:
"${mensaje}"

Contexto adicional:
${contextoPareja}

Reglas importantes:
- Usa el nombre de la otra persona si está disponible.
- Adapta el análisis a su estilo de comunicación.
- No respondas como una IA genérica.
- Valida primero la emoción del usuario en una frase breve.
- Si el mensaje puede empeorar la situación, dilo claramente.
- Incluye una frase tipo: "Probable reacción de [nombre]: ..."
- Da SOLO un mensaje recomendado, no tres versiones principales.

Responde EXACTAMENTE en este formato:

💬 Validación:
[1 frase breve validando lo que puede estar sintiendo el usuario]

🧠 Qué está pasando realmente:
[2-3 líneas claras, humanas y sin tecnicismos]

👀 Cómo puede recibirlo [nombre]:
[explicación breve adaptada al perfil]

⛔ ¿Conviene enviarlo ahora?
[sí / no / mejor esperar, con una razón breve]

✅ Mensaje recomendado:
"[mensaje listo para copiar]"

🔮 Probable reacción de [nombre]:
[2-3 líneas realistas]
`;

Reglas importantes:
- Usa el nombre de la otra persona si está disponible.
- Adapta el análisis a su estilo de comunicación.
- No respondas como una IA genérica.
- Valida primero la emoción del usuario en una frase breve.
- Si el mensaje puede empeorar la situación, dilo claramente.
- Incluye una frase tipo: "Probable reacción de [nombre]: ..."
- Da SOLO un mensaje recomendado, no tres versiones principales.

💬 Validación:
[1 frase breve validando lo que puede estar sintiendo el usuario]

🧠 Qué está pasando realmente:
[2-3 líneas claras, humanas y sin tecnicismos]

👀 Cómo puede recibirlo [nombre]:
[explicación breve adaptada al perfil]

⛔ ¿Conviene enviarlo ahora?
[sí / no / mejor esperar, con una razón breve]

✅ Mensaje recomendado:
"[mensaje listo para copiar]"

🔮 Probable reacción de [nombre]:
[2-3 líneas realistas]

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
