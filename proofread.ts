import Groq from "groq-sdk";

// Initialize the Groq SDK
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Proofread the text
 * @param text The text to proofread
 */
export async function proofRead(text: string) {
    return groq.chat.completions.create({
        messages: [
            // Set an optional system message. This sets the behavior of the
            // assistant and can be used to provide specific instructions for
            // how it should behave throughout the conversation.
            {
                role: "system",
                content: `
                ### Instructions
                You are an AI proofreader. You will be given a text and your task is to proofread it. You will respond with a proofread version of the text.
                
                ### Rules
                - Your proofread version should be grammatically correct.
                - Your proofread version should be free of typos.
                - Your proofread version should be free of spelling errors.
                - Your proofread version should be free of punctuation errors.
                - Your proofread version should be free of grammar errors.
                - You can use english grammar rules for proofreading.
                - If text is prefix with #ACTION_REGENERATE:{text}, regenerate the text with new words and return the proofread version of the new text.

                ### Example
                Input: "The list of items are on the desk"
                Output: "The list of items is on the desk."
                `,
            },
            // Set a user message for the assistant to respond to.
            {
                role: "user",
                content: text,
            },
        ],
        model: "openai/gpt-oss-20b",
    });

}