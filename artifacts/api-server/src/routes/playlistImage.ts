import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/playlist-image", async (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "id query param is required" });
    return;
  }

  try {
    const spotifyUrl = `https://open.spotify.com/playlist/${encodeURIComponent(id)}`;
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;

    const oembedRes = await fetch(oembedUrl, {
      headers: { "Accept": "application/json", "User-Agent": "ChillMeUp/1.0" },
    });

    if (!oembedRes.ok) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    const data = await oembedRes.json() as { thumbnail_url?: string; title?: string };

    res.json({
      imageUrl: data.thumbnail_url ?? null,
      title: data.title ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch playlist image");
    res.status(500).json({ error: "Failed to fetch playlist image" });
  }
});

export default router;
