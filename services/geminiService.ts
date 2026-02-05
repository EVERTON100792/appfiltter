
import { GoogleGenAI } from "@google/genai";

// Configure aqui se você está usando um backend (Supabase) ou chamada direta
const USE_SUPABASE = true; // Mude para true quando configurar sua Edge Function
const SUPABASE_URL = 'https://uylytpmsbsxuivrmauvw.supabase.co/functions/v1/change-color';

/**
 * Função principal que decide se chama a API diretamente ou via Proxy (Supabase)
 */
export async function changeFilterColor(
  base64Image: string,
  targetColorName: string,
  targetHex: string
): Promise<string> {

  if (USE_SUPABASE) {
    return callSupabaseProxy(base64Image, targetColorName, targetHex);
  }

  return callGeminiDirectly(base64Image, targetColorName, targetHex);
}

/**
 * Chamada Direta (O que você está tentando usar agora)
 * Nota: Geralmente falha em localhost/produção sem proxy devido a CORS.
 */
async function callGeminiDirectly(base64Image: string, targetColorName: string, targetHex: string): Promise<string> {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API_KEY não encontrada. Se estiver rodando localmente, verifique o arquivo .env ou a configuração de variáveis de ambiente.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          {
            text: `This is an industrial filter. Change the color of the filter body to: "${targetColorName}" (${targetHex}). 
            Keep all original textures, metallic reflections, and lighting. Return ONLY the modified image.`,
          },
        ],
      },
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("A IA não retornou dados de imagem.");

    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error: any) {
    console.error("Erro detalhado na chamada direta:", error);
    if (error.message?.includes('CORS')) {
      throw new Error("Erro de CORS: O Google bloqueou a chamada vinda do seu navegador. Use o Supabase como ponte.");
    }
    throw error;
  }
}

/**
 * Chamada via Supabase (Solução Definitiva)
 */
async function callSupabaseProxy(base64Image: string, targetColorName: string, targetHex: string): Promise<string> {
  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, colorName: targetColorName, hex: targetHex })
    });

    if (!response.ok) throw new Error("Erro na função do Supabase");
    const data = await response.json();
    return data.image; // Retorna a imagem já processada
  } catch (error) {
    console.error("Erro na ponte Supabase:", error);
    throw new Error("Não foi possível conectar ao Supabase.");
  }
}
