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
    let fabricDesc;
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
    // Structural description for each blouse pattern/cut
    const blousePatternDescriptions: Record<string, string> = {
      "Princess Cut":
        "princess-cut vertical seam panels from shoulder to cropped hem, bust-flattering fitted silhouette, round scoop neckline, very short cap sleeves, cropped midriff length",
      "Madhubala Pattern": `
STRICT FRONT VIEW product photograph of a traditional Indian Madhubala katori saree blouse on a ghost mannequin.

DO NOT show back side. DO NOT show dori. ONLY front chest view.

BLOUSE STRUCTURE (must match exactly):
- Deep sweetheart katori neckline
- Two clearly separated rounded bust cups (left and right)
- Cups join at center forming a soft S-curve heart shape
- Strong visible cup seam lines (katori stitching)
- Fitted underbust contour
- No flat or straight neckline

SLEEVES:
- Short puff sleeves
- Heavy gathers at shoulder (balloon effect)
- Tapered tight sleeve hem
- Sleeve cuff finished with gold zari / banarasi border

FABRIC RULE (VERY IMPORTANT):
- Use EXACT fabric: ${fabricDesc}
- Preserve original print scale, motif shape, spacing, and alignment
- NO smoothing, NO redesign, NO pattern distortion

BORDERS:
- Thin gold piping along neckline and sleeve edges

FIT:
- Very short cropped blouse (ends below bust)
- Tight tailored silhouette
- Symmetrical left and right cups

PHOTOGRAPHY:
- Ghost mannequin
- Centered composition
- Camera facing directly at chest (straight angle)
- Studio lighting
- Plain light grey background

NEGATIVE:
- no back view
- no dori
- no flat blouse
- no normal neckline
- no wrong cup shape
- no merged cups
- no western top
- no shirt
- no kurti
- no fabric change
- no blur
`,
      "Boat Neck":
        "wide horizontal bateau neckline spanning shoulder to shoulder, clean hemline, fitted body, short sleeves, cropped midriff length",
      "High Neck":
        "high Chinese/mandarin stand collar about 2 inches tall, fully covered neck, fitted body, three-quarter length sleeves, hook-and-eye back closure, cropped midriff length",
      "Collar Neck":
        "small decorative peter-pan collar (NOT a western shirt collar), fitted body, short sleeves, hook-and-eye back closure, cropped midriff length",
      "Elbow Sleeve":
        "round neckline, elbow-length fitted sleeves, structured bodice with bust darts, clean piped edges, cropped midriff length",
      "Deep Back Neck":
        "round front neckline, dramatically deep plunging back neckline down to the waist, short cap sleeves, fitted body, cropped midriff length",
      "Dori (Tie-Up) Back":
        "round front neckline, open back with decorative dori drawstring tie-up laces crisscrossing the spine, short sleeves, cropped midriff length",
      "Keyhole Back":
        "round front neckline, elegant teardrop keyhole cutout at center back with button closure, short sleeves, fitted body, cropped midriff length",
      "Button Back":
        "round front neckline, decorative fabric-covered buttons along the center back, fitted body, short sleeves, cropped midriff length",
      "Off-Shoulder":
        "off-shoulder tube-top style, wide neckline sitting below both shoulders exposing the shoulders, fitted body, cropped midriff length",
    };

    const selectedPatternDesc =
      blousePattern && blousePatternDescriptions[blousePattern]
        ? blousePatternDescriptions[blousePattern]
        : "a classic round neckline, short sleeves, hook-and-eye back closure";

    const garmentBase: Record<string, string> = {
      blouse: `Product photography of a traditional Indian women's saree blouse (choli). This is a SHORT CROPPED garment — it ends at the midriff/waist and does NOT cover the stomach. It is NOT a shirt, NOT a kurta, NOT a western top. Specific style: ${selectedPatternDesc}. Construction: hook-and-eye back closure, piped seam edges, bust darts, neat interior finishing. The entire garment is made from this fabric: ${fabricDesc}. Ghost mannequin display, front-facing, solid light-grey studio background, 8k photorealistic fashion catalog, sharp focus on tailoring details.`,

      lehenga: `Product photography of a traditional Indian women's lehenga choli set — a heavily flared floor-length skirt paired with a short cropped choli blouse and a flowing dupatta. This is a ladies' ethnic Indian outfit for women, NOT for men. The garments are made strictly of this exact fabric: ${fabricDesc}. Rich volume, elegant pleated folds on the skirt, ghost mannequin display, front-facing, solid light-grey studio background, 8k photorealistic fashion catalog, sharp focus on the embroidery and fabric detail.`,

      western: `Product photography of a chic women's A-line midi dress — a feminine ladies' dress with a fitted bodice, flared skirt below the knee, and elegant silhouette. This is specifically a women's dress, NOT unisex, NOT men's clothing. The dress is made strictly of this exact fabric: ${fabricDesc}. Ghost mannequin display, front-facing, solid light-grey studio background, 8k photorealistic fashion catalog, sharp focus on the tailoring and fabric.`,

      suit: `Product photography of a traditional Indian ladies' suit set — a long straight-cut kurta (knee-length or longer) paired with matching straight-leg pants (salwar or palazzo) and a matching dupatta. This is a women's ethnic Indian outfit, NOT a western blazer or pantsuit. The entire 3-piece suit set is made from this fabric: ${fabricDesc}. Ghost mannequin display, front-facing, solid light-grey studio background, 8k photorealistic fashion catalog, sharp focus on the ethnic tailoring and embroidery details.`,
    };

    const base = garmentBase[garmentType] ?? "Indian garment, ghost mannequin";

    const patternLabel =
      garmentType === "blouse" && blousePattern
        ? `${blousePattern} Indian saree blouse`
        : garmentType;
    const masterPrompt =
      `GARMENT TYPE: ${patternLabel}. ` +
      (garmentType === "blouse" && blousePattern
        ? `BLOUSE SILHOUETTE: This must be a "${blousePattern}" style blouse — ${selectedPatternDesc}. Accurately render this specific cut and construction. `
        : ``) +
      `FABRIC SPECIFICATION (must be reproduced exactly on the entire garment): ${fabricDesc}. ` +
      `GARMENT DETAIL: ${base}. ` +
      `CRITICAL RULES: (1) The entire garment must show the above fabric — same base color, same motif shape, same repeat pattern. (2) The garment silhouette and cut must exactly match the specified style — do NOT substitute with any other garment type. ` +
      `NEGATIVE: no solid fabric, no plain cloth, no color shift, no blurry motif, no wrong garment type, no generic blouse. ` +
      `SHOT: ghost mannequin flat-lay, diffused studio softbox lighting, solid neutral grey background, 8K sharp, photorealistic.`;

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
            negative_prompt:
              "shirt, western shirt, men's shirt, button-down shirt, kurta, salwar, long top, full-length garment, covering stomach, solid color, plain fabric, no pattern, color mismatch, blurry, watermark, watercolor, illustration, painting, cartoon, text, logo",
            size: "1024x1024",
            response_format: "b64_json",
            enhance: false, // keep prompt faithful — no AI rewriting
            nologo: true,
            seed: 42,
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
