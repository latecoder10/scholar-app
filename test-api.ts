import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  console.log("Starting test call to Gemini...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "Output a list of 3 computer science topics."
    });
    console.log("Success! Response text:");
    console.log(response.text);
  } catch (error: any) {
    console.error("Failed call:", error.message || error);
  }
}

run();
