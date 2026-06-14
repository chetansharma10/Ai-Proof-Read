import Groq from "groq-sdk";

/**
 * Groq service
 * 
 * @class GroqService
 */
export class GroqService{

    // Groq SDK
    private readonly _groq: Groq;

    // API key
    private readonly API_KEY = process.env.GROQ_API_KEY || '';

    // Constructor
    constructor() {

        // Initialize the Groq SDK
        this._groq = new Groq({
            apiKey: this.API_KEY
        });
    }

    // Getter for the Groq SDK
    get groq() {
        return this._groq;
    }
}