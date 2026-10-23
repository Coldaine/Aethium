import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing Authorization header" }, { status: 401 });
    }

    const now = new Date().toISOString();
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        now
      )}&maxResults=8&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: authHeader },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err?.error?.message || "Failed to fetch Calendar events" }, { status: res.status });
    }

    const data = await res.json();
    const events = (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || "(Untitled Event)",
      description: item.description || "",
      start: item.start?.dateTime || item.start?.date || "",
      end: item.end?.dateTime || item.end?.date || "",
      htmlLink: item.htmlLink || "",
      location: item.location || "",
    }));

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("Calendar route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
