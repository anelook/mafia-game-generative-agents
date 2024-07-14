import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getStream(messages, callback) {
    const responseStream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
    });

    let finalResponse = '';
    for await (const part of responseStream) {
        const delta = part.choices[0].delta;
        if (delta && delta.content) {
            for (const char of delta.content) {
                // process.stdout.write(char);
                if(callback) {
                    callback(char);
                }
                finalResponse += char;
                await new Promise(resolve => setTimeout(resolve, 50)); // Delay of 50ms per character
            }
        }
    }
    console.log("LLM message", finalResponse)
    return finalResponse;
}


export function mostFrequentItems(arr) {
    // Create an object to count the occurrences of each item
    const itemCount = {};

    // Count the occurrences of each item
    arr.forEach(item => {
        itemCount[item] = (itemCount[item] || 0) + 1;
    });

    // Determine the maximum frequency
    const maxFrequency = Math.max(...Object.values(itemCount));

    // Collect all items with the maximum frequency
    const result = Object.keys(itemCount).filter(item => itemCount[item] === maxFrequency);

    return result;
}

export function pause(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export function clean(text) {
    return text.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
}