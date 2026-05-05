export default async function handler(req, res) {
    const { query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Ты — ИИ ROBCO OS. Отвечай кратко и сурово в стиле Fallout. Помогай с JS. Юзер: ${query}` }] }]
            })
        });

        const data = await response.json();
        res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: "Ошибка связи с ядром ИИ" });
    }
}