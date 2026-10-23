import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing Authorization header" }, { status: 401 });
    }

    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?pageSize=8&orderBy=modifiedTime%20desc&fields=files(id,name,mimeType,modifiedTime,webViewLink,description)",
      {
        headers: { Authorization: authHeader },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err?.error?.message || "Failed to fetch Drive files" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, files: data.files || [] });
  } catch (error: any) {
    console.error("Drive route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
