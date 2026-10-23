import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing Authorization header" }, { status: 401 });
    }

    const { service, action, payload } = await req.json();

    if (service === "gmail" && action === "archive") {
      // Remove INBOX label from Gmail message
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${payload.messageId}/modify`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            removeLabelIds: ["INBOX"],
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err?.error?.message || "Failed to archive email" }, { status: res.status });
      }
      return NextResponse.json({ success: true, message: "Email archived from Inbox" });
    }

    if (service === "calendar" && action === "create_event") {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: payload.summary,
            description: payload.description || "Created from Aetherial 3D Spatial Canvas",
            start: { dateTime: payload.startDateTime },
            end: { dateTime: payload.endDateTime },
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err?.error?.message || "Failed to create calendar event" }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json({ success: true, event: data });
    }

    if (service === "drive" && action === "create_note") {
      // Create a markdown or plain text note file in user's Drive root or app folder
      const metadata = {
        name: `${payload.title || "Note"}.md`,
        mimeType: "text/markdown",
        description: "Created from Aetherial 3D Spatial Canvas",
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", new Blob([payload.content || ""], { type: "text/markdown" }));

      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err?.error?.message || "Failed to save Drive file" }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json({ success: true, file: data });
    }

    return NextResponse.json({ error: "Unsupported service or action" }, { status: 400 });
  } catch (error: any) {
    console.error("Workspace mutate error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute workspace mutation" }, { status: 500 });
  }
}
