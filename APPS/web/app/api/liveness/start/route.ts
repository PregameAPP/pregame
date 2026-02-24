import { NextResponse } from "next/server";
import { RekognitionClient, CreateFaceLivenessSessionCommand } from "@aws-sdk/client-rekognition";

export const runtime = "nodejs";

export async function POST() {
  try {
    const client = new RekognitionClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const resp = await client.send(new CreateFaceLivenessSessionCommand({}));
    return NextResponse.json({ sessionId: resp.SessionId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("LIVENESS_START_ERROR:", err);
    return NextResponse.json({ error: "Failed to create liveness session", message: msg }, { status: 500 });
  }
}