const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const orderId = (req.query.orderId || "").trim();
    const phone = (req.query.phone || "").trim();

    if (!orderId || !phone) {
      return res.status(400).json({ error: "Please enter both Order ID and phone number." });
    }

    const { rows } = await sql`
      SELECT order_id, customer_name, village, mandal, district, state, pincode,
             items, total, status, created_at
      FROM orders
      WHERE order_id = ${orderId} AND phone = ${phone};
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "No order found for that Order ID and phone number." });
    }

    res.status(200).json({ order: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not track order." });
  }
};
