const { sql } = require('@vercel/postgres');

const VALID_STATUSES = ["Payment Submitted", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const key = req.headers["x-admin-key"];
    if (!key || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId, status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    const { rows } = await sql`
      UPDATE orders SET status = ${status}
      WHERE order_id = ${orderId}
      RETURNING *;
    `;
    if (rows.length === 0) return res.status(404).json({ error: "Order not found." });

    res.status(200).json({ order: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update order." });
  }
};
