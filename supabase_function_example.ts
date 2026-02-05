
/**
 * INSTRUÇÕES:
 * 1. Crie uma Edge Function no Supabase: `supabase functions new change-color`
 * 2. Cole este código no arquivo `index.ts` da função.
 * 3. Configure a variável de ambiente no Supabase: 
 *    `supabase secrets set GEMINI_API_KEY=sua_chave_aqui`
 */

/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/genai@1.40.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { image, colorName, hex } = await req.json()
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" })

    const base64Data = image.split(',')[1]
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      },
      `Change filter color to ${colorName} (${hex}). Keep textures.`
    ])

    const response = result.response
    const outputBase64 = response.candidates[0].content.parts[0].inlineData.data

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${outputBase64}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
*/
