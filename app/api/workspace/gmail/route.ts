import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing Authorization header" }, { status: 401 });
    }

    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=6&q=in:inbox",
      {
        headers: { Authorization: authHeader },
      }
    );

    if (!listRes.ok) {
      const err = await listRes.json();
      return NextResponse.json({ error: err?.error?.message || "Failed to fetch Gmail list" }, { status: listRes.status });
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];

    // Fetch individual snippets
    const messageDetails = await Promise.all(
      messages.slice(0, 6).map(async (msg: { id: string }) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: authHeader } }
          );
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
          const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown";
          const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";

          return {
            id: msg.id,
            subject,
            from,
            date,
            snippet: detail.snippet || "",
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      success: true,
      messages: messageDetails.filter(Boolean),
    });
  } catch (error: any) {
    console.error("Gmail route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
