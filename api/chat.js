export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { query } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) return res.status(500).json({ text: "ROBCO-AI: КЛЮЧ API GROQ ОТСУТСТВУЕТ." });

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "Ты — ИИ терминала ROBCO INDUSTRIES. Твой стиль: Fallout, суровый, краткий, работаешь в 2077 году. Помогай с JavaScript."
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Ошибка Groq API");
        }

        const text = data.choices[0].message.content;
        res.status(200).json({ text });

    } catch (error) {
        console.error("GROQ ERROR:", error);
        res.status(500).json({ 
            text: `ROBCO-AI: КРИТИЧЕСКИЙ СБОЙ ВНЕШНЕГО ЯДРА. [${error.message.substring(0, 30)}]` 
        });
    }
}