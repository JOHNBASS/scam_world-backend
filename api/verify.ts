import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { payload, action, signal } = req.body;

    // 這裡請填入你的 World ID App ID
    const app_id = process.env.WLD_APP_ID;

    // 呼叫 World ID 官方 API 驗證 proof
    const verifyRes = await fetch("https://developer.worldcoin.org/api/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id,
        action_id: action,
        signal,
        proof: payload.proof,
        merkle_root: payload.merkle_root,
        nullifier_hash: payload.nullifier_hash,
        credential_type: payload.credential_type,
      }),
    });

    // globalThis.fetch 回傳 Response 型別，需明確斷言
    const result = await (verifyRes as any).json();

    if ((verifyRes as any).ok && result.success) {
      return res.status(200).json({ status: 200, message: "Verification success", result });
    } else {
      return res.status(400).json({ status: 400, message: "Verification failed", result });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, error: (error as Error).message });
  }
}
