import crypto from "node:crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const GITHUB_API = "https://api.github.com";
const MAX_BODY_SIZE = 5 * 1024 * 1024;

async function readRawBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;

    if (size > MAX_BODY_SIZE) {
      throw new Error("Payload too large");
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function verifySignature(rawBody, signature, secret) {
  if (
    typeof signature !== "string" ||
    !/^sha256=[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const receivedBuffer = Buffer.from(signature.toLowerCase());
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function createAppJwt(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iat: now - 60,
    exp: now + 540,
    iss: appId,
  };

  const unsignedToken =
    `${base64url(JSON.stringify(header))}.` +
    base64url(JSON.stringify(payload));

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(privateKey).toString("base64url");

  return `${unsignedToken}.${signature}`;
}

async function githubRequest(path, token) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "BOODA-Intelligence",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const error = new Error(`GitHub API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function createInstallationToken(installationId) {
  const appId = process.env.GITHUB_APP_ID;
  const rawPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !rawPrivateKey) {
    throw new Error("GitHub App credentials are not configured");
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const jwt = createAppJwt(appId, privateKey);

  const response = await fetch(
    `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${jwt}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "BOODA-Intelligence",
      },
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Could not create installation token: GitHub returned ${response.status}`
    );
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error("GitHub did not return an installation token");
  }

  return data.token;
}

function isAllowedRepository(fullName) {
  const configured = process.env.GITHUB_ALLOWED_REPOS;

  // If configured, only process repositories in this comma-separated list.
  if (!configured) return true;

  const allowed = configured
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(fullName.toLowerCase());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: "Webhook secret not configured",
    });
  }

  let rawBody;

  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return res.status(status).json({ error: error.message });
  }

  const signature = req.headers["x-hub-signature-256"];
  const event = req.headers["x-github-event"];
  const delivery = req.headers["x-github-delivery"];

  if (!verifySignature(rawBody, signature, secret)) {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  if (event === "ping") {
    return res.status(200).json({
      message: "BOODA Intelligence webhook connected",
      status: "ok",
    });
  }

  if (event !== "push") {
    return res.status(200).json({
      message: "Event ignored",
      event,
    });
  }

  let payload;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  try {
    const repo = payload.repository;
    const installationId = payload.installation?.id;
    const commitSha = payload.after;
    const branch = payload.ref?.replace("refs/heads/", "");

    if (!repo?.full_name || !installationId || !commitSha || !branch) {
      return res.status(400).json({
        error: "Missing repository, installation, commit, or branch data",
      });
    }

    if (repo.private) {
      return res.status(200).json({
        message: "Private repository ignored",
        repository: repo.full_name,
      });
    }

    if (!isAllowedRepository(repo.full_name)) {
      return res.status(200).json({
        message: "Repository is not in the allowlist",
        repository: repo.full_name,
      });
    }

    // Ignore branch deletion events and empty commit references.
    if (payload.deleted || /^0+$/.test(commitSha)) {
      return res.status(200).json({
        message: "Branch deletion or empty commit ignored",
        repository: repo.full_name,
        branch,
      });
    }

    const appId = process.env.GITHUB_APP_ID;
    const targetAppId =
      req.headers["x-github-hook-installation-target-id"];

    if (targetAppId && appId && String(targetAppId) !== String(appId)) {
      return res.status(403).json({
        error: "Unexpected GitHub App target",
      });
    }

    const [owner, repoName] = repo.full_name.split("/");

    if (!owner || !repoName) {
      return res.status(400).json({ error: "Invalid repository name" });
    }

    // Create a short-lived token scoped to this installation.
    const token = await createInstallationToken(installationId);

    // Fetch the pushed commit and its changed files.
    const commit = await githubRequest(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repoName
      )}/commits/${encodeURIComponent(commitSha)}`,
      token
    );

    const files = (commit.files || []).map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
    }));

    const result = {
      status: "processed",
      delivery,
      repository: repo.full_name,
      branch,
      commit: {
        sha: commit.sha,
        message: commit.commit?.message,
        author: commit.commit?.author?.name,
        date: commit.commit?.author?.date,
        url: commit.html_url,
        stats: commit.stats,
        files,
        filesReturned: files.length,
      },
      processedAt: new Date().toISOString(),
    };

    console.log("BOODA push processed:", {
      delivery,
      repository: repo.full_name,
      branch,
      commit: commit.sha,
      files: files.length,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("BOODA webhook processing failed:", {
      delivery,
      message: error.message,
      status: error.status,
    });

    return res.status(502).json({
      error: "Push received, but processing failed",
      delivery,
    });
  }
}
