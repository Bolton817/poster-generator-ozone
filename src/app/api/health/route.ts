import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "ozone-lounge-poster-generator",
    stage: "01-project-bootstrap",
    timestamp: new Date().toISOString(),
    canvas: {
      defaultWidth: 1080,
      defaultHeight: 1350,
      aspectRatio: "4:5",
    },
  });
}
