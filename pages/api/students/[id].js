const db = require("../../../lib/db");

export default function handler(req, res) {
  const id = Number(req.query.id);

  if (req.method === "PUT") {
    const { name, rollNo, className, section, email, phone, guardian } = req.body;
    db.prepare(
      `UPDATE students SET name=?, rollNo=?, className=?, section=?, email=?, phone=?, guardian=? WHERE id=?`
    ).run(name, rollNo, className, section, email || "", phone || "", guardian || "", id);
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
    return res.status(200).json(student);
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM students WHERE id = ?").run(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end();
}
