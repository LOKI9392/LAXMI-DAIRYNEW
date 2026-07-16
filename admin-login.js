module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ error: "Server not configured. Set ADMIN_KEY in Vercel environment variables." });
  }

  const { password } = req.body;
  if (password && password === process.env.ADMIN_KEY) {
    return res.status(200).json({ key: process.env.ADMIN_KEY });
  }
  res.status(401).json({ error: "Incorrect password." });
};
