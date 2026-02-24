import { NextResponse } from "next/server";
import { RekognitionClient, CreateFaceLivenessSessionCommand } from "@aws-sdk/client-rekognition";

export async function POST() {
  try {
    if (!process.env.AWS_REGION) throw new Error("Missing AWS_REGION");
    if (!process.env.AWS_ACCESS_KEY_ID) throw new Error("Missing AWS_ACCESS_KEY_ID");
    if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error("Missing AWS_SECRET_ACCESS_KEY");

    const client = new RekognitionClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new CreateFaceLivenessSessionCommand({});
    const response = await client.send(command);

    return NextResponse.json({ sessionId: response.SessionId });
  } catch (err: any) {
    console.error("LIVENESS_START_ERROR:", err);
    return NextResponse.json(
      {
        error: "Failed to create liveness session",
        details: err?.name ?? "UnknownError",
        message: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}