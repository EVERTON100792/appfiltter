
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: 'AIzaSyDg0z6_7tfqZ8wKb5zLqTqEeXSUsOZewCU' });

export async function changeFilterColor(
  base64Image: string,
  targetColorName: string,
  targetHex: string
): Promise<string> {
  // Remove the data:image/png;base64, prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `This is an image of an industrial filter. Please change the color of the filter body to exactly "${targetColorName}" (hex: ${targetHex}). 
            CRITICAL REQUIREMENTS:
            1. Maintain all original lighting, highlights, shadows, and metallic/mesh textures to make it look hyper-realistic, as if it were factory-painted.
            2. Only change the color of the main filter component. Do not alter the background, metallic rings, or labels if they exist.
            3. The output must look like a high-quality professional product photo.
            4. Return ONLY the modified image.`,
          },
        ],
      },
    });

    let resultImageUrl = '';

    // Iterate through candidates and parts to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          resultImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!resultImageUrl) {
      throw new Error("A IA não retornou uma imagem válida. Tente novamente.");
    }

    return resultImageUrl;
  } catch (error) {
    console.error("Erro no processamento da imagem:", error);
    throw error;
  }
}
