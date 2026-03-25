import { NextResponse } from "next/server";
import { db } from "@/db";
import { designs } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { image, garmentType, blousePattern } = await req.json();

    if (!image || !garmentType) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // 🔹 1. TRY FABRIC ANALYSIS (Improved)
    // PRO TIP: Ask Gemini to be specific. Example: "gold floral pattern on magenta silk"
    let fabricDesc = "beautiful textured fabric";
    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-2.5-flash as it is extremely fast, accurate, and has a great free tier
        const visionModel = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const analysis = await visionModel.generateContent([
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          "Act as a fashion textile expert. Describe this fabric's exact color, primary floral/geometric motif, and material texture (e.g., silk, cotton, embroidered zari) in 20 words.",
        ]);

        if (analysis.response.text()) {
          fabricDesc = analysis.response.text().trim();
          console.log("Gemini Fabric Description:", fabricDesc);
        }
      }
    } catch (e: any) {
      console.warn(
        "Vision API failed, using fallback fabric description. Error:",
        e.message,
      );
    }

    // 🔥 2. GARMENT-SPECIFIC PROMPTS (Fixed with Weighted Keywords)
    const PROMPTS: Record<string, string> = {
      blouse: `A high-end fashion catalog photography flat-lay of a beautiful single Indian saree blouse. The blouse features a ${blousePattern || "traditional"} neckline. The entire blouse is made strictly of this exact material: ${fabricDesc}. The blouse is displayed on an invisible ghost mannequin, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus on the blouse tailoring and stitching.`,

      lehenga: `A high-end fashion catalog photography flat-lay of a luxurious flared lehenga skirt and matching dupatta. The garments are made strictly of this exact material: ${fabricDesc}. Displayed on an invisible ghost mannequin, rich volume, elegant folds, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus.`,

      western: `A high-end fashion catalog photography flat-lay of a chic A-line modern midi dress. The dress is made strictly of this exact material: ${fabricDesc}. Displayed on an invisible ghost mannequin, elegant styling, clean seams, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus.`,

      suit: `A high-end fashion catalog photography flat-lay of a formal tailored women's pantsuit with blazer and trousers. The pantsuit is made strictly of this exact material: ${fabricDesc}. Displayed on an invisible ghost mannequin, sharp lapels, modern fit, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus.`,
    };

    const prompt =
      PROMPTS[garmentType] ||
      `A high-end fashion catalog photography flat-lay of a garment made entirely of ${fabricDesc}, invisible ghost mannequin, solid neutral light-grey studio background, 8k resolution.`;

    // ❌ NEGATIVE PROMPT (CRITICAL FIX: Bans Literal Boats and V-Necks without breaking SDXL parser)
    const negativePrompt = `literal boat, ship, water, ocean, nautical, person, face, skin, model, woman, human neck, different fabric, plain cloth, wrong color, blurry, low quality, distorted shape, extra limbs, bad stitching, text, watermark, background props, flat fabric, unstitched cloth`;

    // 🔥 3. IMAGE GENERATION
    const imageResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt,
            guidance_scale: 8.5,
            num_inference_steps: 40,
          },
        }),
      },
    );

    if (!imageResponse.ok) {
      const errText = await imageResponse.text();
      throw new Error(`Image API failed: ${errText}`);
    }

    const blob = await imageResponse.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const generatedBase64 = `data:image/png;base64,${buffer.toString(
      "base64",
    )}`;

    // 🔹 4. SAVE TO DB (OPTIONAL)
    try {
      await db.insert(designs).values({
        rawClothImageUrl: image.substring(0, 100),
        garmentType,
        generatedImageUrls: [generatedBase64],
      });
    } catch (e) {
      console.warn("DB insert skipped");
    }

    return NextResponse.json({
      success: true,
      images: [generatedBase64],
      promptUsed: prompt,
    });
  } catch (err: any) {
    console.error("API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
