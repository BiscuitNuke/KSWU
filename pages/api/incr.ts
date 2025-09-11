// pages/api/incr.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "node:crypto";

function getIP(req: NextApiRequest): string | undefined {
  const xf = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
  return xf || req.socket.remoteAddress || undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("use POST");
  }

  const ct = (req.headers["content-type"] || "").toString();
  if (!ct.includes("application/json")) {
    return res.status(400).send("must be json");
  }

  const body = req.body ?? {};
  const slug = typeof body.slug === "string" && body.slug.length ? body.slug : undefined;
  if (!slug) {
    return res.status(400).send("Slug not found");
  }

  const ip = getIP(req);
  let ipHash: string | undefined;
  if (ip) {
    ipHash = createHash("sha256").update(ip).digest("hex");
    // TODO: increment your counter here, keyed by { slug, ipHash } to de-dup
  }

  return res.status(200).json({ ok: true, slug, ipHash: ipHash ?? null });
}
