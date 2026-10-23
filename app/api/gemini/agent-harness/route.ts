import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { cardNode, transcript, allNodes } = await req.json();

    if (!transcript || !cardNode) {
      return NextResponse.json(
        { error: "Missing cardNode or transcript" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the Aetherial 3D Spatial Agentic Harness.
The user is holding a 3D Polyhedron Bubble on a spatial information canvas and speaking a command to manipulate or act on it.

Current Card Data:
- ID: ${cardNode.id}
- Title: ${cardNode.title}
- Summary: ${cardNode.summary}
- Status: ${cardNode.status}
- Source: ${cardNode.source}
- Priority: ${cardNode.facets?.metadata?.priority || 'medium'}
- ScheduledAt: ${cardNode.scheduledAt || 'none'}
- QuickActions: ${JSON.stringify(cardNode.facets?.quickActions || [])}

Spoken Command: "${transcript}"

Your task is to analyze the user's intent and return a structured JSON response executing the action.
Possible actions:
1. 'update_card': modify title, summary, status (idle, in_progress, completed, ci_running, approved, failed), priority, or scheduledAt (e.g. if user says "push to Friday").
2. 'archive_node': if user says "archive", "remove", or "done".
3. 'cluster_nodes': if user says "group this with..." or "cluster with related tasks".
4. 'request_workspace_mutation': if user command requires changing live Gmail, Calendar, or Drive data (e.g., "archive this email", "reschedule this meeting to Friday 3pm", "save this as a Google Drive doc").
Always include a short 1-sentence spoken feedback string to read back to the user, and set kineticFlipTrigger to true when the card visually morphs.`;

    // Try gemini-4-argon first; if rate-limited or unavailable, fall back to gemini-3.8-flash
    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-argon",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: {
                type: Type.STRING,
                description: "The action taken: update_card, archive_node, cluster_nodes, request_workspace_mutation",
              },
              title: {
                type: Type.STRING,
                description: "Updated title of the card",
              },
              summary: {
                type: Type.STRING,
                description: "Updated concise 1-2 sentence summary",
              },
              status: {
                type: Type.STRING,
                description: "idle, in_progress, completed, ci_running, approved, or failed",
              },
              priority: {
                type: Type.STRING,
                description: "low, medium, high, or urgent",
              },
              scheduledAt: {
                type: Type.STRING,
                description: "ISO date string if rescheduled, or empty string",
              },
              quickActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Updated list of 2-3 short action verbs",
              },
              feedbackSpeech: {
                type: Type.STRING,
                description: "Short 1-sentence response explaining what was updated",
              },
              kineticFlipTrigger: {
                type: Type.BOOLEAN,
                description: "True to trigger kinetic letter backflip",
              },
              workspaceMutation: {
                type: Type.OBJECT,
                properties: {
                  required: { type: Type.BOOLEAN },
                  service: { type: Type.STRING },
                  action: { type: Type.STRING },
                  targetId: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            required: ["actionType", "title", "summary", "status", "feedbackSpeech", "kineticFlipTrigger"],
          },
        },
      });
      responseText = response.text || "{}";
    } catch (primaryErr) {
      console.warn("Falling back to gemini-3.8-flash for agent harness:", primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              status: { type: Type.STRING },
              priority: { type: Type.STRING },
              scheduledAt: { type: Type.STRING },
              quickActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              feedbackSpeech: { type: Type.STRING },
              kineticFlipTrigger: { type: Type.BOOLEAN },
              workspaceMutation: {
                type: Type.OBJECT,
                properties: {
                  required: { type: Type.BOOLEAN },
                  service: { type: Type.STRING },
                  action: { type: Type.STRING },
                  targetId: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            required: ["actionType", "title", "summary", "status", "feedbackSpeech", "kineticFlipTrigger"],
          },
        },
      });
      responseText = fallbackResponse.text || "{}";
    }

    const parsed = JSON.parse(responseText);
    return NextResponse.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error("Agent harness error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute agent harness" },
      { status: 500 }
    );
  }
}
