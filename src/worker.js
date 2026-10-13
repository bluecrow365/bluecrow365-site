import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "POST") return handleContact(request, env);
      return new Response("Method Not Allowed", { status: 405 });
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  // 連投対策。バインディングが無い環境(ローカル等)では素通しにする
  if (env.CONTACT_LIMITER) {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.CONTACT_LIMITER.limit({ key: ip });
    if (!success) return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const name    = String(formData.get("name")    ?? "").trim().slice(0, 200);
    const email   = String(formData.get("email")   ?? "").trim().slice(0, 200);
    const message = String(formData.get("message") ?? "").trim().slice(0, 5000);

    if (!name || !email || !message)
      return Response.json({ error: "missing" }, { status: 400 });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return Response.json({ error: "invalid_email" }, { status: 400 });

    // Reply-To の表示名に入るので、アドレスを差し込める記号 (< > , ; " \) も落とす
    const safeName  = name.replace(/[\r\n]/g, " ").replace(/[<>,;"\\]/g, "");
    const safeEmail = email.replace(/[\r\n]/g, "");

    const subjectText  = `[bluecrow Studio] お問い合わせ: ${safeName}`;
    const subjectBytes = new TextEncoder().encode(subjectText);
    const subjectB64   = btoa(String.fromCharCode(...subjectBytes));

    const raw = [
      `From: bluecrow Studio <contact@blue-crow365.com>`,
      `To: momizi20152512@gmail.com`,
      `Reply-To: ${safeName} <${safeEmail}>`,
      `Subject: =?UTF-8?B?${subjectB64}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      `お名前: ${safeName}`,
      `返信先: ${safeEmail}`,
      ``,
      `【お問い合わせ内容】`,
      message,
    ].join("\r\n");

    const msg = new EmailMessage(
      "contact@blue-crow365.com",
      "momizi20152512@gmail.com",
      raw
    );
    await env.CONTACT_EMAIL.send(msg);

    return Response.json({ ok: true });
  } catch (err) {
    console.error("contact send error:", err);
    return Response.json({ error: "send_failed" }, { status: 500 });
  }
}
