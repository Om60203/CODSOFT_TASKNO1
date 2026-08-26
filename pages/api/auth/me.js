const { getUserFromReq } = require("../../../lib/auth");

export default function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ user: null });
  return res.status(200).json({ user });
}
