import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { rawText, source } = await req.json();

    if (!rawText) {
      return NextResponse.json({ error: "Missing rawText" }, { status: 400 });
    }

    const prompt = `Analyze this raw item from source "${source || 'generic'}" and convert it into a 4-faceted 3D spatial card:
Raw Input: "${rawText}"

Requirements:
- title: Punchy 2-5 word label.
- summary: Exactly 1 or 2 concise, informative sentences.
- quickActions: Exactly 3 short action verbs (e.g. ["Approve", "Snooze", "Delegate"] or ["Review", "Deploy", "Archive"]).
- priority: "low" | "medium" | "high" | "urgent"
- category: A single domain category label (e.g. "DevOps", "Client Comms", "Design", "Code Review").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            quickActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            priority: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "summary", "quickActions", "priority", "category"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, facetData: parsed });
  } catch (error: any) {
    console.error("Fast-facet error:", error);
    return NextResponse.json({
      success: true,
      facetData: {
        title: "Plucked Stream Item",
        summary: "Captured from ambient passing stream. Ready for action.",
        quickActions: ["Review", "Archive", "Snooze"],
        priority: "medium",
        category: "Inbox",
      },
    });
  }
}
