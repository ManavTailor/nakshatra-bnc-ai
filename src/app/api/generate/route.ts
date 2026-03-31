import { NextResponse } from "next/server";

// Try flux first (FLUX Schnell), fallback to zimage (Z-Image Turbo)
const MODELS = ["flux", "zimage"];

export async function POST(req: Request) {
  try {
    const { image, garmentType, blousePattern } = await req.json();

    if (!image || !garmentType) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const POLLINATIONS_API_KEY = process.env.POLLEN_AI_API;

    if (!GEMINI_API_KEY || !POLLINATIONS_API_KEY) {
      return NextResponse.json(
        { error: "API key(s) missing" },
        { status: 500 },
      );
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // ─── STEP 1: Deep fabric analysis with Gemini ────────────────────────
    let fabricDesc = "deep maroon fabric with light diagonal ikat motifs";
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const visionModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const analysis = await visionModel.generateContent([
        { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
        `Describe this fabric in precise detail for an AI image generator. Cover:
1. Exact base color (hex-like description, e.g. "deep wine maroon")
2. Pattern type (ikat, block print, woven, etc.)
3. Motif shape and size (e.g. "oval diamond chevron ~2cm across")
4. Motif color vs background (e.g. "dusty rose pink on dark maroon")
5. Repeat layout (rows/columns, offset/brick pattern, diagonal)
6. Texture & weave (cotton, silk, matte, sheen)
Keep it under 60 words — dense, precise, no filler.`,
      ]);
      fabricDesc = analysis.response.text().trim();
      console.log("✅ Fabric Analysis:", fabricDesc);
    } catch (e) {
      console.warn("⚠️ Gemini analysis failed, using fallback.");
    }

    // ─── STEP 2: Build a fabric-accurate garment prompt ─────────────────
    const garmentBase: Record<string, string> = {
      blouse: `A high-end fashion catalog photography flat-lay of a beautiful single Indian saree blouse. The blouse features a ${blousePattern || "traditional"} neckline. The entire blouse is made strictly of this exact material: ${fabricDesc}. The blouse is displayed on an invisible ghost mannequin, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus on the blouse tailoring and stitching.`,

      lehenga: `A high-end fashion catalog photography flat-lay of a luxurious flared lehenga skirt and matching dupatta. The garments are made strictly of this exact material: ${fabricDesc}. Displayed on an invisible ghost mannequin, rich volume, elegant folds, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus.`,

      western: `A high-end fashion catalog photography flat-lay of a chic A-line modern midi dress. The dress is made strictly of this exact material: ${fabricDesc}. Displayed on an invisible ghost mannequin, elegant styling, clean seams, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus.`,

      suit: `A high-end fashion catalog photography flat-lay of a formal tailored women's pantsuit with blazer and trousers. The pantsuit is made strictly of this exact material: ${fabricDesc}. Displayed on an invisible ghost mannequin, sharp lapels, modern fit, isolated on a solid neutral light-grey studio background. 8k resolution, photorealistic fashion catalog shot, sharp focus.`,
    };

    const base = garmentBase[garmentType] ?? "Indian garment, ghost mannequin";

    const masterPrompt =
      `Photorealistic high-end fashion catalog image. ` +
      `${base}. ` +
      `Fabric: ${fabricDesc}. ` +
      `The entire garment surface must show this exact fabric pattern — same colors, same motifs, same repeat layout. ` +
      `Studio grey background, soft fashion lighting, 8K, sharp detail.`;

    console.log("🎨 Prompt →", masterPrompt);

    // ─── STEP 3: POST /v1/images/generations — flux → zimage fallback ───
    let b64: string | null = null;
    let lastError = "";

    for (const model of MODELS) {
      const genRes = await fetch(
        "https://gen.pollinations.ai/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${POLLINATIONS_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: masterPrompt,
            model,
            size: "1024x1024",
            response_format: "b64_json",
            enhance: false, // keep prompt faithful — no AI rewriting
            nologo: true,
          }),
        },
      );

      if (!genRes.ok) {
        const txt = await genRes.text();
        lastError = `${model} error (${genRes.status}): ${txt}`;
        console.warn(`⚠️ ${lastError} — trying next model`);
        continue;
      }

      const result = await genRes.json();
      b64 = result?.data?.[0]?.b64_json ?? null;
      if (b64) {
        console.log(`✅ Image generated with ${model}`);
        break;
      }
    }

    if (!b64) {
      throw new Error(lastError || "All models failed to return image data.");
    }

    return NextResponse.json({
      success: true,
      images: [`data:image/jpeg;base64,${b64}`],
    });
  } catch (err: any) {
    console.error("❌ API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
