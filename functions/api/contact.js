import { EmailMessage } from "cloudflare:email";

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();

    const name    = String(formData.get("name")    ?? "").trim().slice(0, 200);
    const email   = String(formData.get("email")   ?? "").trim().slice(0, 200);
    const message = String(formData.get("message") ?? "").trim().slice(0, 5000);

    if (!name || !email || !message) {
      return Response.json({ error: "missing" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "invalid_email" }, { status: 400 });
    }

    // ヘッダーインジェクション対策
    const safeName  = name.replace(/[\r\n]/g, " ");
    const safeEmail = email.replace(/[\r\n]/g, "");

    // 件名をBase64エンコード（日本語対応）
    const subjectText = `[bluecrow Studio] お問い合わせ: ${safeName}`;
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

export function onRequestOptions() {
  return new Response(null, { headers: { Allow: "POST, OPTIONS" } });
}
