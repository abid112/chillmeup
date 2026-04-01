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
  detectedEnergy: EnergyLevel;
}

// ---------------------------------------------------------------------------
// 50 Spotify editorial playlist IDs across all genres and moods.
// ---------------------------------------------------------------------------
const P = {
  // Chill & Ambient
  peacefulPiano:    { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano' },
  deepFocus:        { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus' },
  vocalChills:      { id: '37i9dQZF1DX9oc9LtHUgJi', name: 'Vocal Chills' },
  sleep:            { id: '37i9dQZF1DWZd79rJ6a7lp', name: 'Sleep' },
  jazzVibes:        { id: '37i9dQZF1DXbITWG1ZJKYt', name: 'Jazz Vibes' },
  afternoonAco:     { id: '37i9dQZF1DX2sk7MV3rcaX', name: 'Afternoon Acoustic' },
  chillHits:        { id: '37i9dQZF1DX4WYpdgoIcn6', name: 'Chill Hits' },
  bedroomPop:       { id: '37i9dQZF1DXcrsgIhaq5KG', name: 'Bedroom Pop' },
  lofiMorning:      { id: '37i9dQZF1DXZXTi1Rll8OO', name: 'Lofi Morning' },
  chillVibes:       { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Chill Vibes' },
  classicalFocus:   { id: '37i9dQZF1DX7K31eHFPCZn', name: 'Classical Focus' },
  epicConcentration:{ id: '37i9dQZF1DX9sIqqvKsjEL', name: 'Epic Concentration' },

  // Rain & Melancholic
  rainyDay:         { id: '37i9dQZF1DXbvABJXBIyiY', name: 'Rainy Day' },
  softPop:          { id: '37i9dQZF1DX1clOuib1KtQ', name: 'Soft Pop Hits' },
  indiefolk:        { id: '37i9dQZF1DX9B7LXpDLxLg', name: 'Indie Folk' },
  indiePop:         { id: '37i9dQZF1DXdbXrPNafg9d', name: 'Indie Pop' },

  // Happy & Upbeat
  happyHits:        { id: '37i9dQZF1DXdPec7aLTmlC', name: 'Happy Hits!' },
  topHits:          { id: '37i9dQZF1DXcBWIGoYBM5M', name: "Today's Top Hits" },
  moodBooster:      { id: '37i9dQZF1DXe5W6diBIV3E', name: 'Mood Booster' },
  mint:             { id: '37i9dQZF1DX4dyzvuaRJ0n', name: 'mint' },
  popRising:        { id: '37i9dQZF1DWUa8ZRTfalHk', name: 'Pop Rising' },
  popRemix:         { id: '37i9dQZF1DXfNsLX1B3E3I', name: 'Pop Remix' },
  morningMood:      { id: '37i9dQZF1DX0jgyAiPl8Af', name: 'Morning Mood' },
  singInTheCar:     { id: '37i9dQZF1DX5IDZzS80KTq', name: 'Songs to Sing in the Car' },
  summerHits:       { id: '37i9dQZF1DX2TOBHkh9KhS', name: 'Summer Hits' },
  feelGoodFriday:   { id: '37i9dQZF1DXaXDsfgi6FrY', name: 'Feel-Good Friday' },

  // Rock & High Energy
  rockClassics:     { id: '37i9dQZF1DWXRqgorJj26U', name: 'Rock Classics' },
  powerWorkout:     { id: '37i9dQZF1DX76Wlfdnj7AP', name: 'Power Workout' },
  cardio:           { id: '37i9dQZF1DXdxcBWuJkbcy', name: 'Cardio' },
  danceHits:        { id: '37i9dQZF1DX8FwnYE6PRvL', name: 'Dance Hits' },
  dancePop:         { id: '37i9dQZF1DXaKIA8E7WcJj', name: 'Dance Pop' },

  // Throwback Decades
  allOut80s:        { id: '37i9dQZF1DXb57XqZUeg1f', name: 'All Out 80s' },
  allOut90s:        { id: '37i9dQZF1DXbTxeAdrVG2l', name: 'All Out 90s' },
  allOut2000s:      { id: '37i9dQZF1DX4o1uurG5WgQ', name: 'All Out 2000s' },
  allOut2010s:      { id: '37i9dQZF1DX5Ejj0EkURtP', name: 'All Out 2010s' },
  roadTrip:         { id: '37i9dQZF1DX8a8notNMX0H', name: 'Road Trip' },

  // Hip-Hop & R&B
  rapCaviar:        { id: '37i9dQZF1DX0XUsuxWHRQd', name: 'RapCaviar' },
  goldSchool:       { id: '37i9dQZF1DXa0SIGtfBBUS', name: 'Gold School' },
  rbHits:           { id: '37i9dQZF1DWXbap5R9HFCq', name: 'R&B Hits' },

  // World / Latin / K-Pop
  vivaLatino:       { id: '37i9dQZF1DXbSbnqxMTGx9', name: 'Viva Latino' },
  kPopDaebak:       { id: '37i9dQZF1DX9tPFwdkgD8w', name: 'K-Pop Daebak' },
  latinPop:         { id: '37i9dQZF1DX10zKzsJ2jyd', name: 'Latin Pop Hits' },

  // Country
  hotCountry:       { id: '37i9dQZF1DX1lVhptIYs6Z', name: 'Hot Country' },

  // Electronic
  electronicRising: { id: '37i9dQZF1DX8tZsk88tuQB', name: 'Electronic Rising' },

  // Focus extras
  brainFood:        { id: '37i9dQZF1DXWLeA8Omikj7', name: 'Brain Food' },

  // Additional variety
  acousticMorning:  { id: '37i9dQZF1DXZZbwlv3Vmtr', name: 'Acoustic Morning' },
  loungeVibes:      { id: '37i9dQZF1DX9uKNf5jGX6m', name: 'Lounge Vibes' },
  altHits:          { id: '37i9dQZF1DX1zVr5PvBOEP', name: 'Alternative Hits' },
} as const;

type PlaylistKey = keyof typeof P;

// Each mood → pool per energy level. Random pick each run → max variety.
// Keys must match: timeMod.toLowerCase().replace(' ', '')
type EnergyPool = { Low: PlaylistKey[]; Medium: PlaylistKey[]; High: PlaylistKey[] };
const MOOD_MAP: Record<string, EnergyPool> = {
  rain: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'sleep', 'vocalChills', 'lofiMorning', 'chillVibes', 'classicalFocus', 'acousticMorning', 'loungeVibes'],
    Medium: ['rainyDay', 'peacefulPiano', 'jazzVibes', 'afternoonAco', 'vocalChills', 'indiefolk', 'softPop', 'chillHits', 'altHits', 'acousticMorning'],
    High:   ['rainyDay', 'topHits', 'moodBooster', 'happyHits', 'softPop', 'indiePop', 'popRising', 'singInTheCar', 'altHits', 'electronicRising'],
  },
  sunnyDay: {
    Low:    ['peacefulPiano', 'deepFocus', 'afternoonAco', 'softPop', 'jazzVibes', 'morningMood', 'chillVibes', 'chillHits', 'acousticMorning', 'hotCountry'],
    Medium: ['happyHits', 'topHits', 'moodBooster', 'mint', 'softPop', 'popRising', 'feelGoodFriday', 'summerHits', 'vivaLatino', 'kPopDaebak'],
    High:   ['happyHits', 'topHits', 'moodBooster', 'mint', 'allOut2010s', 'danceHits', 'dancePop', 'cardio', 'electronicRising', 'vivaLatino'],
  },
  clearNight: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'vocalChills', 'sleep', 'lofiMorning', 'chillVibes', 'classicalFocus', 'loungeVibes', 'acousticMorning'],
    Medium: ['peacefulPiano', 'jazzVibes', 'vocalChills', 'softPop', 'afternoonAco', 'bedroomPop', 'chillHits', 'indiePop', 'rbHits', 'loungeVibes'],
    High:   ['happyHits', 'topHits', 'moodBooster', 'allOut2010s', 'mint', 'dancePop', 'danceHits', 'summerHits', 'rapCaviar', 'electronicRising'],
  },
  cloudy: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'vocalChills', 'afternoonAco', 'lofiMorning', 'chillVibes', 'brainFood', 'acousticMorning', 'loungeVibes'],
    Medium: ['rainyDay', 'peacefulPiano', 'jazzVibes', 'deepFocus', 'softPop', 'bedroomPop', 'indiefolk', 'chillHits', 'altHits', 'goldSchool'],
    High:   ['happyHits', 'topHits', 'moodBooster', 'mint', 'allOut2010s', 'indiePop', 'popRising', 'feelGoodFriday', 'altHits', 'electronicRising'],
  },
  snow: {
    Low:    ['peacefulPiano', 'rainyDay', 'jazzVibes', 'sleep', 'deepFocus', 'vocalChills', 'classicalFocus', 'chillVibes', 'acousticMorning', 'loungeVibes'],
    Medium: ['peacefulPiano', 'afternoonAco', 'jazzVibes', 'vocalChills', 'softPop', 'chillHits', 'indiefolk', 'lofiMorning', 'hotCountry', 'acousticMorning'],
    High:   ['happyHits', 'topHits', 'moodBooster', 'allOut2010s', 'mint', 'allOut80s', 'allOut90s', 'singInTheCar', 'hotCountry', 'roadTrip'],
  },
  thunder: {
    Low:    ['rockClassics', 'deepFocus', 'epicConcentration', 'jazzVibes', 'brainFood', 'classicalFocus', 'vocalChills', 'chillVibes', 'altHits', 'loungeVibes'],
    Medium: ['rockClassics', 'epicConcentration', 'topHits', 'allOut2010s', 'happyHits', 'allOut90s', 'rapCaviar', 'danceHits', 'altHits', 'goldSchool'],
    High:   ['rockClassics', 'topHits', 'epicConcentration', 'allOut2010s', 'moodBooster', 'powerWorkout', 'cardio', 'danceHits', 'electronicRising', 'altHits'],
  },
  morning: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'afternoonAco', 'vocalChills', 'morningMood', 'lofiMorning', 'chillVibes', 'acousticMorning', 'classicalFocus'],
    Medium: ['happyHits', 'topHits', 'moodBooster', 'mint', 'softPop', 'popRising', 'feelGoodFriday', 'morningMood', 'kPopDaebak', 'hotCountry'],
    High:   ['happyHits', 'topHits', 'moodBooster', 'allOut2010s', 'mint', 'danceHits', 'cardio', 'powerWorkout', 'vivaLatino', 'electronicRising'],
  },
  afternoon: {
    Low:    ['deepFocus', 'peacefulPiano', 'afternoonAco', 'jazzVibes', 'softPop', 'brainFood', 'chillHits', 'lofiMorning', 'loungeVibes', 'acousticMorning'],
    Medium: ['happyHits', 'topHits', 'moodBooster', 'mint', 'allOut2010s', 'popRemix', 'vivaLatino', 'kPopDaebak', 'latinPop', 'goldSchool'],
    High:   ['topHits', 'happyHits', 'moodBooster', 'allOut2010s', 'mint', 'rapCaviar', 'danceHits', 'dancePop', 'electronicRising', 'roadTrip'],
  },
  evening: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'vocalChills', 'afternoonAco', 'chillVibes', 'bedroomPop', 'sleep', 'loungeVibes', 'acousticMorning'],
    Medium: ['happyHits', 'jazzVibes', 'vocalChills', 'softPop', 'mint', 'rbHits', 'allOut90s', 'allOut2000s', 'latinPop', 'goldSchool'],
    High:   ['happyHits', 'topHits', 'moodBooster', 'allOut2010s', 'mint', 'danceHits', 'dancePop', 'rapCaviar', 'electronicRising', 'roadTrip'],
  },
  latenight: {
    Low:    ['peacefulPiano', 'deepFocus', 'jazzVibes', 'sleep', 'vocalChills', 'lofiMorning', 'classicalFocus', 'chillVibes', 'loungeVibes', 'acousticMorning'],
    Medium: ['rainyDay', 'jazzVibes', 'vocalChills', 'deepFocus', 'softPop', 'rbHits', 'bedroomPop', 'chillHits', 'goldSchool', 'latinPop'],
    High:   ['topHits', 'happyHits', 'moodBooster', 'allOut2010s', 'mint', 'rapCaviar', 'danceHits', 'allOut2000s', 'electronicRising', 'roadTrip'],
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
  { progress: 100, text: "Curating your playlist…" },
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

    const randomMoods = ['Chill', 'Nostalgic', 'Focus', 'Party', 'Romantic', 'Adventure', 'Deep Thinking'];
    const randomMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];

    setResult({
      moodLabel: `${randomMood} ${moodLabel}`,
      weatherText,
      timeText,
      playlistName,
      playlistDescription: `A curated Spotify playlist for your ${energy.toLowerCase()} energy and ${timeText.toLowerCase()} mood.`,
      playlistId,
      detectedEnergy: energy,
    });
    setState('result');
  }, []);

  return { state, coords, progress, stepText, fakeMessage, result, requestLocation, grantLocation, skipLocation, analyze, reset };
}
