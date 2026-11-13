
import crypto from "node:crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];
    const delivery = req.headers["x-github-delivery"];

    if (
      typeof signature !== "string" ||
      !/^sha256=[a-f0-9]{64}$/i.test(signature)
    ) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const expected =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    if (event === "ping") {
      return res.status(200).json({ message: "BOODA webhook connected" });
    }

    if (event !== "push") {
      return res.status(200).json({ message: "Event ignored", event });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const repo = payload.repository;

    if (!repo || repo.private || !repo.full_name) {
      return res.status(200).json({ message: "Repository ignored" });
    }

    return res.status(200).json({
      message: "Push received by BOODA",
      repository: repo.full_name,
      branch: payload.ref,
      delivery,
      status: "received",
    });
  } catch {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }
}
