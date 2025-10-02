import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;
let apiKey: string | null = null;

// This function must be called once before any other function in this file.
export function setApiKey(key: string) {
    if (!key) {
        throw new Error("API key is not set.");
    }
    apiKey = key;
    ai = new GoogleGenAI({ apiKey: key });
}

function getAiInstance(): GoogleGenAI {
    if (!ai) {
        throw new Error("Gemini AI has not been initialized. Please set the API key first.");
    }
    return ai;
}

export async function editImageWithNanoBanana(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  // This function remains unchanged
  try {
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const candidate of response.candidates) {
        if (candidate.content?.parts && candidate.content.parts.length > 0) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const { data, mimeType } = part.inlineData;
              return `data:${mimeType};base64,${data}`;
            }
          }
        }
      }
    }

    const textResponse = response.text?.trim();
    if (textResponse) {
      throw new Error(`API returned a text response instead of an image: ${textResponse}`);
    }

    if (response.promptFeedback?.blockReason) {
      throw new Error(`Request was blocked: ${response.promptFeedback.blockReason}`);
    }

    throw new Error("The API response did not contain an edited image.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.startsWith('Failed to edit image:')) {
        throw error;
      }
      throw new Error(`Failed to edit image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while editing the image.");
  }
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateVideoWithVeo(
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  onProgress: (message: string) => void
): Promise<string> {
  try {
    const aiInstance = getAiInstance();
    onProgress("Initializing video generation...");
    
    // --- FIX: Using the corrected parameters as you provided ---
    let operation = await aiInstance.models.generateVideos({
      model: 'veo-3.0-fast-generate-001',
      prompt: prompt,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: '9:16', // Correct string value
      }
    });

    onProgress("Video generation started. This may take a few minutes...");
    let pollCount = 0;
    while (!operation.done) {
      pollCount++;
      await delay(10000);
      onProgress(`Checking status (attempt ${pollCount})... Please wait.`);
      operation = await aiInstance.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        const errorMessage = operation.error.message || JSON.stringify(operation.error);
        throw new Error(`Video generation failed during operation: ${errorMessage}`);
    }

    onProgress("Video generation complete. Fetching video data...");
    
    const videoResponse = operation.response;

    if (!videoResponse || !videoResponse.generatedVideos || videoResponse.generatedVideos.length === 0) {
        const feedback = (videoResponse as any)?.promptFeedback;
        if (feedback?.blockReason) {
            throw new Error(`Video generation was blocked: ${feedback.blockReason}.`);
        }
        console.error("VEO response contained no generated videos:", videoResponse);
        throw new Error("Video generation completed, but the response contained no videos.");
    }

    const downloadLink = videoResponse.generatedVideos[0]?.video?.uri;

    if (!downloadLink) {
      console.error("VEO response missing download link in video object:", videoResponse.generatedVideos[0]);
      throw new Error("Video generation succeeded, but no download link was found in the video data.");
    }
    
    if (!apiKey) {
      throw new Error("API_KEY is not available to download the video.");
    }

    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    onProgress("Video downloaded successfully.");
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error calling VEO API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate video: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the video.");
  }
}