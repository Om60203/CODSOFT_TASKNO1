const db = require("../../../lib/db");

export default function handler(req, res) {
  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const { status } = req.body;
    db.prepare("UPDATE fees SET status = ? WHERE id = ?").run(status, id);
    const fee = db.prepare("SELECT * FROM fees WHERE id = ?").get(id);
    return res.status(200).json(fee);
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM fees WHERE id = ?").run(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end();
}
