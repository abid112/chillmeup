import { useState, useCallback } from 'react';

export type MoodState = 'idle' | 'requesting-location' | 'analyzing' | 'result';
export type EnergyLevel = 'Low' | 'Medium' | 'High';

export interface MoodResult {
  moodLabel: string;
  weatherText: string;
  timeText: string;
  playlistName: string;
  playlistDescription: string;
  playlistId: string;
  playlistImageUrl: string | null;
  detectedEnergy: EnergyLevel;
}

// All IDs live-verified against Spotify oEmbed — names reflect real titles.
const P = {
  // Calm / Focus / Sleep
  peacefulPiano:  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano' },
  deepFocus:      { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus' },
  sleep:          { id: '37i9dQZF1DWZd79rJ6a7lp', name: 'Sleep' },
  jazzVibes:      { id: '37i9dQZF1DXbITWG1ZJKYt', name: 'Jazz Classics' },
  chillHits:      { id: '37i9dQZF1DX4WYpdgoIcn6', name: 'Chill Hits' },
  chillVibes:     { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Mood Booster' },
  morningMood:    { id: '37i9dQZF1DX0jgyAiPl8Af', name: 'Peaceful Guitar' },
  loungeVibes:    { id: '37i9dQZF1DX9uKNf5jGX6m', name: 'Yoga & Meditation' },

  // Rain & Indie
  rainyDay:       { id: '37i9dQZF1DXbvABJXBIyiY', name: 'Rainy Day' },
  indiePop:       { id: '37i9dQZF1DXdbXrPNafg9d', name: 'All New Indie' },
  vivaLatino:     { id: '37i9dQZF1DXbSbnqxMTGx9', name: 'Reggae Classics' },

  // Happy & Pop
  happyHits:      { id: '37i9dQZF1DXdPec7aLTmlC', name: 'Happy Hits!' },
  topHits:        { id: '37i9dQZF1DXcBWIGoYBM5M', name: "Today's Top Hits" },
  mint:           { id: '37i9dQZF1DX4dyzvuaRJ0n', name: 'mint' },
  popRising:      { id: '37i9dQZF1DWUa8ZRTfalHk', name: 'Pop Rising' },

  // Rock & Workout
  rockClassics:   { id: '37i9dQZF1DWXRqgorJj26U', name: 'Rock Classics' },
  powerWorkout:   { id: '37i9dQZF1DX76Wlfdnj7AP', name: 'Beast Mode' },
  cardio:         { id: '37i9dQZF1DXdxcBWuJkbcy', name: 'Gym Hits' },
  danceHits:      { id: '37i9dQZF1DX8FwnYE6PRvL', name: 'Rock Party' },

  // Throwback / Decades
  dancePop:       { id: '37i9dQZF1DXaKIA8E7WcJj', name: 'All Out 60s' },
  allOut90s:      { id: '37i9dQZF1DXbTxeAdrVG2l', name: 'All Out 90s' },
  allOut2010s:    { id: '37i9dQZF1DX5Ejj0EkURtP', name: 'All Out 2010s' },

  // Hip-Hop
  rapCaviar:      { id: '37i9dQZF1DX0XUsuxWHRQd', name: 'RapCaviar' },
} as const;

type PlaylistKey = keyof typeof P;

// Each mood → pool per energy level. Random pick each run → variety.
// Keys must match: timeMod.toLowerCase().replace(' ', '')
type EnergyPool = { Low: PlaylistKey[]; Medium: PlaylistKey[]; High: PlaylistKey[] };
const MOOD_MAP: Record<string, EnergyPool> = {
  rain: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'sleep', 'loungeVibes', 'morningMood'],
    Medium: ['rainyDay', 'peacefulPiano', 'jazzVibes', 'chillHits', 'indiePop', 'vivaLatino'],
    High:   ['rainyDay', 'topHits', 'chillVibes', 'happyHits', 'indiePop', 'popRising'],
  },
  sunnyDay: {
    Low:    ['peacefulPiano', 'deepFocus', 'morningMood', 'chillHits', 'jazzVibes', 'loungeVibes'],
    Medium: ['happyHits', 'topHits', 'chillVibes', 'mint', 'popRising', 'vivaLatino'],
    High:   ['happyHits', 'topHits', 'mint', 'allOut2010s', 'cardio', 'powerWorkout'],
  },
  clearNight: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'sleep', 'loungeVibes', 'morningMood'],
    Medium: ['peacefulPiano', 'jazzVibes', 'chillHits', 'indiePop', 'allOut90s', 'vivaLatino'],
    High:   ['happyHits', 'topHits', 'mint', 'allOut2010s', 'rapCaviar', 'danceHits'],
  },
  cloudy: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'chillHits', 'morningMood', 'loungeVibes'],
    Medium: ['rainyDay', 'peacefulPiano', 'jazzVibes', 'chillHits', 'indiePop', 'allOut90s'],
    High:   ['happyHits', 'topHits', 'chillVibes', 'mint', 'allOut2010s', 'indiePop'],
  },
  snow: {
    Low:    ['peacefulPiano', 'rainyDay', 'jazzVibes', 'sleep', 'deepFocus', 'loungeVibes'],
    Medium: ['peacefulPiano', 'morningMood', 'jazzVibes', 'chillHits', 'allOut90s', 'vivaLatino'],
    High:   ['happyHits', 'topHits', 'chillVibes', 'allOut2010s', 'allOut90s', 'dancePop'],
  },
  thunder: {
    Low:    ['rockClassics', 'deepFocus', 'jazzVibes', 'chillHits', 'morningMood', 'loungeVibes'],
    Medium: ['rockClassics', 'topHits', 'allOut2010s', 'allOut90s', 'rapCaviar', 'danceHits'],
    High:   ['rockClassics', 'topHits', 'powerWorkout', 'cardio', 'danceHits', 'allOut2010s'],
  },
  morning: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'morningMood', 'loungeVibes', 'chillHits'],
    Medium: ['happyHits', 'topHits', 'chillVibes', 'mint', 'popRising', 'vivaLatino'],
    High:   ['happyHits', 'topHits', 'mint', 'allOut2010s', 'cardio', 'powerWorkout'],
  },
  afternoon: {
    Low:    ['deepFocus', 'peacefulPiano', 'jazzVibes', 'morningMood', 'chillHits', 'loungeVibes'],
    Medium: ['happyHits', 'topHits', 'chillVibes', 'mint', 'allOut2010s', 'allOut90s'],
    High:   ['topHits', 'happyHits', 'mint', 'allOut2010s', 'rapCaviar', 'danceHits'],
  },
  evening: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'chillHits', 'morningMood', 'sleep'],
    Medium: ['happyHits', 'jazzVibes', 'chillHits', 'mint', 'allOut90s', 'vivaLatino'],
    High:   ['happyHits', 'topHits', 'mint', 'allOut2010s', 'rapCaviar', 'danceHits'],
  },
  latenight: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'sleep', 'loungeVibes', 'morningMood'],
    Medium: ['rainyDay', 'jazzVibes', 'chillHits', 'deepFocus', 'allOut90s', 'vivaLatino'],
    High:   ['topHits', 'happyHits', 'chillVibes', 'allOut2010s', 'rapCaviar', 'mint'],
  },
};

// ---------------------------------------------------------------------------

const FAKE_MESSAGES = [
  "Scanning emotional signals…",
  "Matching your vibe with global music trends…",
  "Detecting hidden nostalgia levels…",
  "Cross-referencing your aura with 47 million songs…",
  "Calibrating nostalgia index…",
  "Harmonizing soundwaves…",
  "Synthesizing current frequency…",
  "Analyzing session entropy…",
  "Reading ambient engagement patterns…",
  "Parsing micro-interaction velocity…",
];

const ANALYSIS_STEPS = [
  { progress: 12, text: "Pinpointing your location…" },
  { progress: 28, text: "Analyzing local weather conditions…" },
  { progress: 41, text: "Scanning browser activity…" },
  { progress: 55, text: "Reading engagement patterns…" },
  { progress: 63, text: "Estimating your current mood…" },
  { progress: 75, text: "Checking time-of-day energy levels…" },
  { progress: 90, text: "Matching music vibes…" },
  { progress: 100, text: "Picking your playlist…" },
];

function detectEnergyFromBrowser(): EnergyLevel {
  const hour = new Date().getHours();
  let baseScore = 0;
  if (hour >= 6 && hour < 10) baseScore = 3;
  else if (hour >= 10 && hour < 13) baseScore = 4;
  else if (hour >= 13 && hour < 15) baseScore = 2;
  else if (hour >= 15 && hour < 18) baseScore = 3;
  else if (hour >= 18 && hour < 21) baseScore = 2;
  else baseScore = 1;

  try {
    const cookieCount = document.cookie ? document.cookie.split(';').length : 0;
    if (cookieCount > 5) baseScore += 1;
    if (cookieCount > 10) baseScore += 1;
  } catch (_) { /* ignore */ }

  try {
    const lsCount = localStorage.length;
    if (lsCount > 3) baseScore += 1;
    if (lsCount > 8) baseScore += 1;
  } catch (_) { /* ignore */ }

  try {
    const visits = parseInt(localStorage.getItem('chillmeup_visits') ?? '0', 10);
    const newVisits = visits + 1;
    localStorage.setItem('chillmeup_visits', String(newVisits));
    if (newVisits > 1) baseScore += 1;
    if (newVisits > 3) baseScore += 1;
  } catch (_) { /* ignore */ }

  try {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navTiming && navTiming.loadEventEnd - navTiming.startTime < 1000) baseScore += 1;
  } catch (_) { /* ignore */ }

  baseScore += Math.floor(Math.random() * 3) - 1;
  if (baseScore >= 6) return 'High';
  if (baseScore >= 3) return 'Medium';
  return 'Low';
}

async function fetchWeather(lat: number, lon: number): Promise<{ condition: string; weatherText: string }> {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json() as { condition: string; location: string | null };
      const condition = data.condition ?? 'Clear';
      const text = data.location ? `${condition} · ${data.location}` : condition;
      return { condition, weatherText: text };
    }
  } catch (_) { /* fall through */ }
  return { condition: 'Clear', weatherText: 'Weather unavailable' };
}

function resolvePlaylist(
  moodKey: string,
  energy: EnergyLevel,
): { id: string; name: string } {
  const pool = (MOOD_MAP[moodKey] ?? MOOD_MAP['afternoon'])[energy];
  const key = pool[Math.floor(Math.random() * pool.length)];
  return P[key];
}

export function useMoodAnalyzer() {
  const [state, setState] = useState<MoodState>('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');
  const [result, setResult] = useState<MoodResult | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setStepText('');
    setFakeMessage('');
    setResult(null);
    setCoords(null);
  }, []);

  const requestLocation = useCallback(() => {
    setState('requesting-location');
  }, []);

  const grantLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); resolve(); },
        () => { setCoords(null); resolve(); },
        { timeout: 30000, enableHighAccuracy: false },
      );
    });
  }, []);

  const skipLocation = useCallback(() => { setCoords(null); }, []);

  const analyze = useCallback(async (resolvedCoords: { lat: number; lon: number } | null) => {
    setState('analyzing');
    setProgress(0);

    const weatherPromise = resolvedCoords
      ? fetchWeather(resolvedCoords.lat, resolvedCoords.lon)
      : Promise.resolve({ condition: 'Clear', weatherText: 'Weather unavailable' });

    const messageInterval = setInterval(() => {
      setFakeMessage(FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]);
    }, 2600);

    for (const step of ANALYSIS_STEPS) {
      setStepText(step.text);
      setProgress(step.progress);
      await new Promise(r => setTimeout(r, 2800 + Math.random() * 1000));
    }

    clearInterval(messageInterval);

    const { condition: weatherCondition, weatherText } = await weatherPromise;
    const energy = detectEnergyFromBrowser();

    const hour = new Date().getHours();
    let timeMod = '';
    let timeText = '';
    if (hour >= 5 && hour < 11) { timeMod = 'Morning'; timeText = 'Morning 🌅'; }
    else if (hour >= 11 && hour < 17) { timeMod = 'Afternoon'; timeText = 'Afternoon ☀️'; }
    else if (hour >= 17 && hour < 21) { timeMod = 'Evening'; timeText = 'Evening 🌙'; }
    else { timeMod = 'Late Night'; timeText = 'Late Night 🌌'; }

    // Determine mood key from weather + time
    let moodKey = timeMod.toLowerCase().replace(' ', '');  // morning|afternoon|evening|latenight
    let moodLabel = `${timeMod} Flow`;

    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      moodKey = 'rain'; moodLabel = 'Rainy Day Reflection';
    } else if (weatherCondition.includes('Thunder')) {
      moodKey = 'thunder'; moodLabel = 'Storm Energy';
    } else if (weatherCondition.includes('Snow')) {
      moodKey = 'snow'; moodLabel = 'Winter Cozy';
    } else if (weatherCondition.includes('Cloud') || weatherCondition.includes('Fog')) {
      moodKey = 'cloudy'; moodLabel = 'Cloudy Indie Thoughts';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Morning' || timeMod === 'Afternoon')) {
      moodKey = 'sunnyDay'; moodLabel = 'Sunny Good Vibes';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Evening' || timeMod === 'Late Night')) {
      moodKey = 'clearNight'; moodLabel = 'Clear Night Chill';
    }

    if (energy === 'Low') moodLabel = 'Calm ' + moodLabel;
    else if (energy === 'High') moodLabel = 'Energetic ' + moodLabel;

    const { id: playlistId, name: playlistName } = resolvePlaylist(moodKey, energy);

    // Fetch the real playlist cover art from our proxy (Spotify oEmbed, no auth needed)
    let playlistImageUrl: string | null = null;
    try {
      const imgRes = await fetch(`/api/playlist-image?id=${encodeURIComponent(playlistId)}`);
      if (imgRes.ok) {
        const imgData = await imgRes.json() as { imageUrl: string | null };
        playlistImageUrl = imgData.imageUrl ?? null;
      }
    } catch (_) { /* fall through — UI will show gradient fallback */ }

    const randomMoods = ['Chill', 'Nostalgic', 'Focus', 'Party', 'Romantic', 'Adventure', 'Deep Thinking'];
    const randomMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];

    setResult({
      moodLabel: `${randomMood} ${moodLabel}`,
      weatherText,
      timeText,
      playlistName,
      playlistDescription: `A curated Spotify playlist for your ${energy.toLowerCase()} energy and ${timeText.toLowerCase()} mood.`,
      playlistId,
      playlistImageUrl,
      detectedEnergy: energy,
    });
    setState('result');
  }, []);

  return { state, coords, progress, stepText, fakeMessage, result, requestLocation, grantLocation, skipLocation, analyze, reset };
}
