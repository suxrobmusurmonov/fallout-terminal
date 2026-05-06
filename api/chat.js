import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ text: "ROBCO-AI: КЛЮЧ API ОТСУТСТВУЕТ." });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Ты — ИИ терминала ROBCO INDUSTRIES. Fallout-стиль, сурово, кратко. Помогай с JS. Юзер: ${query}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.status(200).json({ text });
    } catch (error) {
        console.error("DETAILED ERROR:", error);
        res.status(500).json({ 
            text: `ROBCO-AI: ОШИБКА ЯДРА. [КОД: ${error.status || 'API_ERR'}]`
        });
    }
}