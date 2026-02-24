import { NextResponse } from "next/server";
import { RekognitionClient, GetFaceLivenessSessionResultsCommand } from "@aws-sdk/client-rekognition";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensures Vercel runs this in Node (not Edge)

type VerifyBody = {
  sessionId: string;
  userId: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<VerifyBody>;
    const sessionId = body.sessionId;
    const userId = body.userId;

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "Missing sessionId or userId" }, { status: 400 });
    }

    const rek = new RekognitionClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const results = await rek.send(new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId }));
    const confidence = results.Confidence ?? 0;

    const threshold = Number(process.env.LIVENESS_CONFIDENCE_THRESHOLD ?? "85");
    const passed = confidence >= threshold;

    if (!passed) {
      return NextResponse.json({ passed: false, confidence });
    }

    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { error } = await supabase
      .from("profiles")
      .update({ verified_status: true, verified_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update verified status", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ passed: true, confidence });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("LIVENESS_VERIFY_ERROR:", err);
    return NextResponse.json({ error: "Verification failed", message: msg }, { status: 500 });
  }
}