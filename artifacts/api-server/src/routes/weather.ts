import { Router, type IRouter } from "express";

const router: IRouter = Router();

// WMO weather code → condition string
function wmoToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Clouds";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain";
  if (code <= 86) return "Snow";
  if (code >= 95) return "Thunderstorm";
  return "Clear";
}

router.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: "lat and lon query params are required" });
    return;
  }

  try {
    // Open-Meteo: completely free, no API key needed
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&timezone=auto`;
    // Nominatim reverse geocoding: free, no API key
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const [weatherRes, geoRes] = await Promise.all([
      fetch(weatherUrl, { headers: { "Accept": "application/json" } }),
      fetch(geoUrl, { headers: { "Accept": "application/json", "User-Agent": "ChillMeUp/1.0" } }),
    ]);

    if (!weatherRes.ok) {
      req.log.warn({ status: weatherRes.status }, "Open-Meteo error");
      res.status(502).json({ error: "Weather API error" });
      return;
    }

    const weatherData = await weatherRes.json() as {
      current: { weather_code: number; temperature_2m: number };
    };

    const code = weatherData.current?.weather_code ?? 0;
    const temp = Math.round(weatherData.current?.temperature_2m ?? 20);
    const condition = wmoToCondition(code);

    let locationName: string | null = null;
    if (geoRes.ok) {
      const geoData = await geoRes.json() as {
        address?: { city?: string; town?: string; village?: string; country_code?: string };
      };
      const addr = geoData.address;
      const city = addr?.city ?? addr?.town ?? addr?.village ?? null;
      const country = addr?.country_code?.toUpperCase() ?? null;
      if (city && country) locationName = `${city}, ${country}`;
      else if (city) locationName = city;
    }

    res.json({ condition, temp, location: locationName });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch weather");
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
