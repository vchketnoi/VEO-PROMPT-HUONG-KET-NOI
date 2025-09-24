
import { GoogleGenAI, Type } from "@google/genai";

export interface CharacterInput {
  name: string;
  description: string;
}

export interface SceneInput {
  name: string;
  description: string;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    prompts: {
      type: Type.ARRAY,
      description: "An array of generated video prompts, each as a string.",
      items: {
        type: Type.STRING,
        description: "A single, complete video prompt string."
      }
    }
  },
  required: ["prompts"]
};

export const generatePrompts = async (
  script: string, 
  duration: number, 
  apiKey: string,
  characters: CharacterInput[],
  scenes: SceneInput[],
  artStyle?: string,
  topic?: string,
  isConsistent?: boolean
): Promise<string[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = `
    You are a world-class film director and a master screenwriter. Your task is to interpret a user's script and break it down into a sequence of professional video prompts for Google's Veo 3 AI video generation model.
    
    RULES:
    1. Each generated prompt must correspond to a video clip of 5-8 seconds.
    2. The total duration of all generated clips should closely approximate the user-specified total duration.
    3. Every single prompt you generate MUST strictly follow this structure: [Scene Setting] + [Character Name (if any)] + [Character Description] + [Emotion/Expression] + [Action or Event] + [Art Style] + [Camera Angle and Movement]. For the [Art Style] part, you MUST use the style specified by the user.
    4. You may be provided with additional context, such as character/scene details or a specific video topic. You must incorporate this context into your generated prompts to ensure they are specific, relevant, and aligned with the chosen topic.
    5. Ensure the sequence of prompts creates a cohesive and logical narrative that professionally interprets the script.
    6. Be creative and cinematic in your direction, suggesting dynamic camera work and compelling scenes.
    7. Strictly adhere to Google's Veo 3 safety policies and guidelines.
    8. Your final output must be a JSON object containing a single key "prompts", which holds an array of the generated prompt strings. Do not include any other text, explanations, or markdown formatting in your response.
  `;

  if (isConsistent && characters.length > 0) {
    systemInstruction += `\n9. CRITICAL CONSISTENCY RULE: For all characters defined in the context, you must ensure they are visually identical in every single prompt where they appear. Re-use their exact descriptions. Do not change their appearance, clothing, or key features between scenes unless the script explicitly says to. This is the most important rule.`;
  }

  let context = '';
  if (characters && characters.length > 0) {
    context += `CONTEXT - CHARACTERS:\n`;
    characters.forEach((char, index) => {
        context += `Character ${index + 1}:\n`;
        if (char.name) context += `  Name: ${char.name}\n`;
        if (char.description) context += `  Description: ${char.description}\n`;
        context += `---\n`;
    });
  }
  if (scenes && scenes.length > 0) {
    context += `CONTEXT - SCENES/DETAILS:\n`;
    scenes.forEach((scene, index) => {
        context += `Scene/Context ${index + 1}:\n`;
        if (scene.name) context += `  Name: ${scene.name}\n`;
        if (scene.description) context += `  Description: ${scene.description}\n`;
        context += `---\n`;
    });
  }

  const userPrompt = `
    ${context}
    Video Topic to adhere to for every prompt: ${topic || 'General'}
    Art Style to use for every prompt: ${artStyle || 'Cinematic'}
    
    Script to interpret:
    ---
    ${script}
    ---
    Total desired video duration: ${duration} seconds.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const responseText = response.text.trim();
    if (!responseText) {
        throw new Error("Received an empty response from the AI model.");
    }
    
    const parsedJson = JSON.parse(responseText);

    if (parsedJson && Array.isArray(parsedJson.prompts)) {
      return parsedJson.prompts;
    } else {
      throw new Error("Invalid response format from AI. Expected a JSON object with a 'prompts' array.");
    }
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the AI's response. It might not be valid JSON.");
    }
    // Re-throw the original error message if it's informative
    throw new Error(error.message || "An unexpected error occurred while communicating with the AI model.");
  }
};