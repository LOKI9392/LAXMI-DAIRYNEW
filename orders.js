const { sql } = require('@vercel/postgres');

const PRODUCTS = {
  p01: { name: "Full Cream Milk", unit: "1 Litre Pouch", price: 68 },
  p02: { name: "Toned Milk", unit: "1 Litre Pouch", price: 54 },
  p03: { name: "Buffalo Milk", unit: "1 Litre Pouch", price: 74 },
  p04: { name: "Fresh Curd (Dahi)", unit: "500 g Cup", price: 45 },
  p05: { name: "Greek Yogurt", unit: "400 g Tub", price: 120 },
  p06: { name: "Fresh Paneer", unit: "200 g Block", price: 90 },
  p07: { name: "Pure Cow Ghee", unit: "500 ml Jar", price: 460 },
  p08: { name: "White Butter", unit: "200 g Pack", price: 95 },
  p09: { name: "Buttermilk (Chaas)", unit: "200 ml Cup", price: 15 },
  p10: { name: "Sweet Lassi", unit: "200 ml Cup", price: 28 },
  p11: { name: "Flavoured Milk — Badam", unit: "200 ml Bottle", price: 35 },
  p12: { name: "Khoya / Mawa", unit: "250 g Pack", price: 165 },
  p13: { name: "Cheese Slices", unit: "200 g Pack (10 pcs)", price: 115 },
  p14: { name: "Fresh Cream (Malai)", unit: "200 ml Cup", price: 62 },
  p15: { name: "Milk Powder", unit: "500 g Pack", price: 215 },
};

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house_no TEXT,
      street TEXT,
      landmark TEXT,
      village TEXT NOT NULL,
      mandal TEXT,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      items JSONB NOT NULL,
      total NUMERIC NOT NULL,
      payment_ref TEXT,
      status TEXT NOT NULL DEFAULT 'Payment Submitted',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
}

function generateOrderId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LXD-${y}${m}${d}-${rand}`;
}

module.exports = async function handler(req, res) {
  try {
    await ensureTable();

    if (req.method === "POST") {
      const body = req.body;
      const {
        customerName, phone, houseNo, street, landmark,
        village, mandal, district, state, pincode, items, paymentRef,
      } = body;

      if (!customerName || !phone || !village || !district || !state || !pincode) {
        return res.status(400).json({ error: "Missing required address fields." });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Cart is empty." });
      }
      if (!paymentRef || paymentRef.trim().length < 4) {
        return res.status(400).json({ error: "Payment reference is required to confirm an order." });
      }

      let total = 0;
      const resolvedItems = items.map((it) => {
        const p = PRODUCTS[it.id];
        if (!p) throw new Error("Invalid product: " + it.id);
        const qty = Math.max(1, parseInt(it.qty, 10) || 1);
        total += p.price * qty;
        return { id: it.id, name: p.name, unit: p.unit, price: p.price, qty };
      });

      const orderId = generateOrderId();

      await sql`
        INSERT INTO orders (
          order_id, customer_name, phone, house_no, street, landmark,
          village, mandal, district, state, pincode, items, total, payment_ref, status
        ) VALUES (
          ${orderId}, ${customerName}, ${phone}, ${houseNo || null}, ${street || null},
          ${landmark || null}, ${village}, ${mandal || null}, ${district}, ${state},
          ${pincode}, ${JSON.stringify(resolvedItems)}, ${total}, ${paymentRef}, 'Payment Submitted'
        );
      `;

      return res.status(200).json({ orderId, total });
    }

    if (req.method === "GET") {
      const key = req.headers["x-admin-key"];
      if (!key || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { rows } = await sql`SELECT * FROM orders ORDER BY created_at DESC;`;
      return res.status(200).json({ orders: rows });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error." });
  }
};
