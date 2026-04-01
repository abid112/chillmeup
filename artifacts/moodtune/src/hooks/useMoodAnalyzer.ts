import { useState, useCallback } from 'react';

export type MoodState = 'idle' | 'analyzing' | 'result';
export type EnergyLevel = 'Low' | 'Medium' | 'High' | null;

export interface MoodResult {
  moodLabel: string;
  weatherText: string;
  timeText: string;
  playlistName: string;
  playlistDescription: string;
  searchQuery: string;
}

const FAKE_MESSAGES = [
  "Scanning emotional signals…",
  "Matching your vibe with global music trends…",
  "Detecting hidden nostalgia levels…",
  "Cross-referencing your aura with 47 million songs…",
  "Calibrating nostalgia index…",
  "Harmonizing soundwaves…",
  "Synthesizing current frequency…"
];

const ANALYSIS_STEPS = [
  { progress: 12, text: "Detecting your location…" },
  { progress: 28, text: "Analyzing local weather conditions…" },
  { progress: 41, text: "Scanning browsing patterns…" },
  { progress: 63, text: "Estimating your current mood…" },
  { progress: 75, text: "Checking time-of-day energy levels…" },
  { progress: 90, text: "Matching music vibes…" },
  { progress: 100, text: "Generating playlist…" },
];

export function useMoodAnalyzer() {
  const [state, setState] = useState<MoodState>('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');
  const [result, setResult] = useState<MoodResult | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setStepText('');
    setFakeMessage('');
    setResult(null);
  }, []);

  const analyze = useCallback(async (energy: EnergyLevel) => {
    setState('analyzing');
    setProgress(0);
    
    // Start animation loop for fake messages
    let messageInterval = setInterval(() => {
      setFakeMessage(FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]);
    }, 1500);

    // Simulate steps
    for (const step of ANALYSIS_STEPS) {
      setStepText(step.text);
      setProgress(step.progress);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    }

    clearInterval(messageInterval);

    // Actual logic
    let weatherCondition = 'Clear';
    let weatherText = 'Unknown Weather';
    
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
      });
      const res = await fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      if (res.ok) {
        const data = await res.json();
        weatherCondition = data.condition || 'Clear';
        weatherText = `${data.condition} · ${data.location || 'Local'}`;
      } else {
        weatherText = 'Weather unavailable';
      }
    } catch (e) {
      weatherText = 'Weather unavailable';
    }

    const hour = new Date().getHours();
    let timeMod = '';
    let timeText = '';
    if (hour >= 5 && hour < 11) {
      timeMod = 'Morning';
      timeText = 'Morning 🌅';
    } else if (hour >= 11 && hour < 17) {
      timeMod = 'Afternoon';
      timeText = 'Afternoon ☀️';
    } else if (hour >= 17 && hour < 21) {
      timeMod = 'Evening';
      timeText = 'Evening 🌙';
    } else {
      timeMod = 'Late Night';
      timeText = 'Late Night 🌌';
    }

    let moodLabel = 'Vibes';
    let search = 'playlist';
    let playlistName = 'Your Mix';

    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      moodLabel = 'Rainy Day Reflection';
      search = 'rainy day acoustic playlist';
      playlistName = 'Rainy Day Acoustic';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Morning' || timeMod === 'Afternoon')) {
      moodLabel = 'Sunny Good Vibes';
      search = 'happy upbeat summer playlist';
      playlistName = 'Sunny Summer Vibes';
    } else if (weatherCondition.includes('Clear') && (timeMod === 'Evening' || timeMod === 'Late Night')) {
      moodLabel = 'Late Night Chill';
      search = 'late night chill playlist';
      playlistName = 'Late Night Chill';
    } else if (weatherCondition.includes('Cloud')) {
      moodLabel = 'Cloudy Indie Thoughts';
      search = 'indie chill cloudy day playlist';
      playlistName = 'Cloudy Indie';
    } else if (weatherCondition.includes('Snow')) {
      moodLabel = 'Winter Cozy';
      search = 'cozy winter ambient playlist';
      playlistName = 'Winter Cozy';
    } else if (weatherCondition.includes('Thunder')) {
      moodLabel = 'Storm Energy';
      search = 'epic dramatic playlist';
      playlistName = 'Storm Energy';
    } else {
      moodLabel = `${timeMod} Flow`;
      search = `${timeMod.toLowerCase()} flow playlist`;
      playlistName = `${timeMod} Flow`;
    }

    if (energy === 'Low') {
      search += ' chill ambient lo-fi';
      moodLabel = 'Calm ' + moodLabel;
    } else if (energy === 'High') {
      search += ' upbeat party dance';
      moodLabel = 'Energetic ' + moodLabel;
    }

    const randomMoods = ['Chill', 'Nostalgic', 'Focus', 'Party', 'Romantic', 'Adventure', 'Deep Thinking'];
    const randomMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];
    
    setResult({
      moodLabel: `${randomMood} ${moodLabel}`,
      weatherText,
      timeText,
      playlistName,
      playlistDescription: `A curated selection of tracks matching your current ${randomMood.toLowerCase()} energy and the ${timeText.toLowerCase()} atmosphere.`,
      searchQuery: encodeURIComponent(search)
    });
    setState('result');

  }, []);

  return { state, progress, stepText, fakeMessage, result, analyze, reset };
}
