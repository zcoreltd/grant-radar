import { checkConnection } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connected = await checkConnection();

    if (!connected) {
      return Response.json({ status: "unavailable" }, { status: 503 });
    }

    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
