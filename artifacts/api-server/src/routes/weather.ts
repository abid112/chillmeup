import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: "lat and lon query params are required" });
    return;
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    res.status(503).json({ error: "Weather API key not configured" });
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      req.log.warn({ status: response.status }, "OpenWeatherMap error");
      res.status(response.status).json({ error: "Weather API error" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch weather");
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
