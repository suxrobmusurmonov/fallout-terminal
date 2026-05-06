import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ text: "ОШИБКА: КЛЮЧ API НЕ НАЙДЕН." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        const prompt = `Ты — ИИ ROBCO OS. Отвечай кратко и сурово в стиле Fallout. Помогай с JS. Юзер: ${query}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ text: text });
    } catch (error) {
        console.error("SYSTEM ERROR:", error);
        
        res.status(500).json({ 
            text: "ROBCO-AI: ОШИБКА ЯДРА. МОДЕЛЬ НЕ НАЙДЕНА ИЛИ ДОСТУП ОГРАНИЧЕН.",
            details: error.message 
        });
    }
}