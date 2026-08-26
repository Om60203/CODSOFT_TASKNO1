const cookie = require("cookie");
const { destroySession, clearSessionCookie, COOKIE_NAME } = require("../../../lib/auth");

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }
  const cookies = cookie.parse(req.headers.cookie || "");
  destroySession(cookies[COOKIE_NAME]);
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
