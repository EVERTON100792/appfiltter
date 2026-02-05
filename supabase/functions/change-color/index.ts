// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, colorName, hex } = await req.json()
    // KEY must be safe here
    const apiKey = 'AIzaSyDg0z6_7tfqZ8wKb5zLqTqEeXSUsOZewCU';

    if (!apiKey) throw new Error('API Key missing');

    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    const systemInstruction = `You are an expert image editor. Your task is to change the color of the industrial filter in the image to "${colorName}" (${hex}).
    Maintain all original lighting, shadows, reflections, and metallic textures.
    The output must look photorealistic.
    Return ONLY the edited image in your response. Do not add any text or explanation.`

    // Using RAW FETCH to avoid SDK issues in Edge Runtime
    const model = 'gemini-2.0-flash-exp'; // or 'gemini-1.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: systemInstruction },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        response_mime_type: "image/jpeg"
      }
    };

    console.log("Sending request to Gemini API (raw fetch)...");

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API Failed (${geminiRes.status}): ${errorText}`);
    }

    // Gemini 2.0 / 1.5 with response_mime_type: image/jpeg returns the image directly? 
    // Wait, documentation says for image generation you receive base64 in the response candidates.
    // Let's parse JSON.
    const data = await geminiRes.json();
    console.log("Gemini Response structure:", Object.keys(data));

    // Check for candidates
    const part = data.candidates?.[0]?.content?.parts?.[0];

    // If it's an image
    if (part?.inline_data?.data) {
      return new Response(
        JSON.stringify({ image: `data:image/png;base64,${part.inline_data.data}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If we got text back (hallucination or refusal)
    if (part?.text) {
      // DO NOT THROW, return the error to the client
      return new Response(
        JSON.stringify({ error: `AI Output (Not Image): ${part.text}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If API returned error structure
    if (data.error) {
      return new Response(
        JSON.stringify({ error: `Gemini API Error: ${data.error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: "No valid output found. Raw response: " + JSON.stringify(data) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Handler Error:", error);
    // Return detailed error to client
    return new Response(JSON.stringify({ error: error.message, details: error.toString() }), {
      status: 200, // Return 200 so the frontend can read the JSON error message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
