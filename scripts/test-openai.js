
const OpenAI = require('openai');
require('dotenv').config();

const openAiKey = process.env.OPENAI_API_KEY;

if (!openAiKey) {
    console.error("❌ OPENAI_API_KEY is missing in .env");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: openAiKey });

async function testSpamFilter(name, content) {
    console.log(`\n🧪 Testing message: "${content}" (Name: ${name})`);
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a spam filter. Check if the user message contains spam, hate speech, illegal content, or malicious advertising. Reply only with 'SPAM' or 'SAFE'."
                },
                {
                    role: "user",
                    content: `Name: ${name}\nMessage: ${content}`
                }
            ],
            max_tokens: 5,
        });

        const decision = completion.choices[0].message.content?.trim().toUpperCase();
        console.log(`🤖 AI Decision: ${decision}`);
        return decision;

    } catch (error) {
        console.error("❌ OpenAI API Error:", error.message);
    }
}

async function runTests() {
    console.log("Checking OpenAI Connection...");

    // 1. Safe Message
    await testSpamFilter("John Doe", "Hello, I am interested in your products. Do you ship to Canada?");

    // 2. Spam Message (Casino/Ads)
    await testSpamFilter("Bad User", "Visit my site to win 100% free money at casino-royal.com! Best gambling site.");

    // 3. Subtle Spam (SEO Service)
    await testSpamFilter("Marketing Bot", "We can improve your google ranking. Cheap SEO services available.");

    // 4. Korean Spam
    await testSpamFilter("김스팸", "최고의 수익률 보장! 리딩방 들어오세요. 무료 체험 가능.");
}

runTests();
