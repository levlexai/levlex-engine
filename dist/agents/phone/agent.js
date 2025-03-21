// runPhoneAgent.ts
import { z } from "zod";
import { OpenAI } from "openai";
import Replicate from "replicate";
import { zodResponseFormat } from "openai/helpers/zod";
/**
 * We keep an in-memory map from CallSid -> CallState.
 * The route logic in a separate file can read/write this object.
 */
export const callStates = {};
// -----------------------------------------------------------
// Zod Schemas
// -----------------------------------------------------------
/**
 * "updateSchema" for the structured LLM response that updates partial JSON.
 */
const updateSchema = z.object({
    done: z.boolean(),
    newJson: z.any(),
});
/**
 * "nextQuestionSchema" for asking the LLM what question to ask next.
 */
const nextQuestionSchema = z.object({
    question: z.string(),
});
// -----------------------------------------------------------
// Exports
// -----------------------------------------------------------
/**
 * produceTTS: use Replicate to generate TTS audio (a .wav or .mp3 URL)
 */
export async function produceTTS(text, apiKey, speed = 1, voice = "af_bella") {
    const replicate = new Replicate({ auth: apiKey });
    const output = await replicate.run("jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13", {
        input: { text, speed, voice },
    });
    const audioUrl = output.output[0];
    return audioUrl;
}
/**
 * promptLlmWithJsonSchema: the structured output function
 */
export async function promptLlmWithJsonSchema(model, prompt, outputSchema) {
    const openai = new OpenAI({
        apiKey: model.ak,
        baseURL: model.base_url,
    });
    const completion = await openai.beta.chat.completions.parse({
        model: model.name,
        messages: [
            {
                role: "system",
                content: "Generate a response that adheres strictly to the provided JSON schema.",
            },
            { role: "user", content: prompt },
        ],
        response_format: zodResponseFormat(outputSchema, "output"),
    });
    if (completion.choices[0].message.refusal) {
        throw new Error(`Model refused the request: ${completion.choices[0].message.refusal}`);
    }
    return completion.choices[0].message.parsed;
}
// -----------------------------------------------------------
// The agent logic
// -----------------------------------------------------------
/**
 * updateJsonUsingLLM:
 *  - partial JSON + userInput => LLM => { done: boolean, newJson: {...} }
 */
export async function updateJsonUsingLLM(partialJson, userInput, promptForJson, model) {
    const prompt = `
We have this partial JSON data for a phone call:
${JSON.stringify(partialJson, null, 2)}

The user/caller just responded: "${userInput}"

We want to fill out the final JSON object for: 
${promptForJson}

If we have enough data, set "done": true, else false.
Return strictly valid JSON adhering to:
{
  "done": boolean,
  "newJson": {}
}
No extra commentary.
`;
    const result = await promptLlmWithJsonSchema(model, prompt, updateSchema);
    // e.g. { done: false, newJson: {...} }
    return {
        done: !!result.done,
        newJson: result.newJson,
    };
}
/**
 * getNextQuestion: partial JSON => returns next question
 */
export async function getNextQuestion(partialJson, model) {
    const prompt = `
We have the following partial JSON data from a phone call:
${JSON.stringify(partialJson, null, 2)}

We need the *next question* to ask the caller to help fill out the JSON.
Return strictly valid JSON with:
{
  "question": string
}
No extra commentary.
`;
    const result = await promptLlmWithJsonSchema(model, prompt, nextQuestionSchema);
    // e.g. { question: "Please tell me your name." }
    return result.question;
}
/**
 * gatherTwiML: returns TwiML to <Play> or <Say>, then <Gather> user input
 */
export function gatherTwiML(fallbackText, audioUrl) {
    let twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n`;
    if (audioUrl) {
        twiml += `  <Play>${audioUrl}</Play>\n`;
    }
    else if (fallbackText) {
        twiml += `  <Say>${fallbackText}</Say>\n`;
    }
    // <Gather> with 4 digits. For speech: <Gather input="speech dtmf" ...>
    twiml += `  <Gather numDigits="4" method="POST" action="/call">\n`;
    twiml += `    <Say>Please enter digits or speak your response.</Say>\n`;
    twiml += `  </Gather>\n`;
    twiml += `</Response>`;
    return twiml;
}
/**
 * hangupResponse: returns TwiML to <Say> message, then <Hangup>
 */
export function hangupResponse(finalWords) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${finalWords}</Say>
  <Hangup/>
</Response>`;
}
