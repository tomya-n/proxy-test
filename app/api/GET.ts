export default async function GET(req, res) {
  const { url } = req.query;
  const url = "http://localhost:3000/api/?url=https://www.yahoo.co.jp/";
  console.log(url);
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await fetch(url);
    const body = await response.text();
    // const metadata = extractMetadata(body);
    // res.status(200).json(url);
    res.json({ test: "test" });
  } catch (error) {
    res.status(500).json({ error: "Error fetching the URL" });
  }
}
