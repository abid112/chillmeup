import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Clock, Cloud, Music, RefreshCcw, Activity, Zap, MapPin, Navigation } from "lucide-react";
import { useMoodAnalyzer } from "@/hooks/useMoodAnalyzer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const {
    state,
    progress,
    stepText,
    fakeMessage,
    result,
    requestLocation,
    skipLocation,
    analyze,
    reset,
  } = useMoodAnalyzer();

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [locationPending, setLocationPending] = useState(false);

  const handleStart = () => {
    requestLocation();
  };

  const handleAllowAndAnalyze = async () => {
    setLocationPending(true);
    // Ask browser for position — this triggers the native permission dialog
    let resolvedCoords: { lat: number; lon: number } | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 30000,
          enableHighAccuracy: false,
        });
      });
      resolvedCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    } catch (_) {
      resolvedCoords = null;
    }
    setLocationPending(false);
    analyze(resolvedCoords);
  };

  const handleSkip = () => {
    skipLocation();
    analyze(null);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30">
      {/* Background ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[90px] mix-blend-screen" />
      </div>
      <AnimatePresence mode="wait">

        {/* ── LANDING ── */}
        {state === "idle" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 max-w-2xl mx-auto"
          >
            <div className="text-center mb-12 space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(168,85,247,0.4)] border border-primary/30"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                Chill Me Up!
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
                Find the perfect song for your mood — powered by your location, the weather, and the time of day.
              </p>
            </div>

            <div className="w-full space-y-8 bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary/90">
                <Zap className="w-4 h-4 shrink-0" />
                <span>Energy level will be detected automatically from your browser activity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Age Range (Optional)</label>
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    data-testid="select-age"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white/90 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="" disabled className="bg-background">Select age</option>
                    <option value="teens" className="bg-background">Teens</option>
                    <option value="20s" className="bg-background">20s</option>
                    <option value="30s" className="bg-background">30s</option>
                    <option value="40s+" className="bg-background">40s+</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Gender (Optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    data-testid="select-gender"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white/90 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="" disabled className="bg-background">Select gender</option>
                    <option value="prefer-not" className="bg-background">Prefer not to say</option>
                    <option value="male" className="bg-background">Male</option>
                    <option value="female" className="bg-background">Female</option>
                    <option value="non-binary" className="bg-background">Non-binary</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleStart}
                className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
                data-testid="button-start"
              >
                Boost My Mood
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── LOCATION PERMISSION ── */}
        {state === "requesting-location" && (
          <motion.div
            key="location"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 max-w-md mx-auto text-center"
          >
            {/* Pulsing location icon */}
            <div className="relative w-36 h-36 mb-10 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0.5, 0.25] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-primary/40"
              />
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.15, 0.3, 0.15] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-blue-500/30"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 blur-xl animate-pulse" />
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <MapPin className="w-14 h-14 text-primary relative z-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-4 mb-10"
            >
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                Allow Location Access
              </h2>
              <p className="text-white/60 leading-relaxed text-base">
                Chill Me Up! uses your <strong className="text-white/80">device's exact location</strong> to fetch live local weather — so your playlist matches the sky above you right now.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                <Navigation className="w-3 h-3" />
                Your coordinates stay on your device and are never stored
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="w-full space-y-3"
            >
              <Button
                onClick={handleAllowAndAnalyze}
                disabled={locationPending}
                className="w-full py-5 text-base rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                data-testid="button-allow-location"
              >
                {locationPending ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Waiting for permission…
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <MapPin className="w-4 h-4" />
                    Allow Location &amp; Continue
                  </span>
                )}
              </Button>

              <button
                onClick={handleSkip}
                disabled={locationPending}
                data-testid="button-skip-location"
                className="w-full py-3 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-30"
              >
                Skip — use time of day only
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── ANALYZING ── */}
        {state === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 max-w-lg mx-auto"
          >
            <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-primary/50"
              />
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-blue-500/40"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 blur-xl animate-pulse" />
              <Activity className="w-16 h-16 text-primary relative z-10" />
            </div>

            <div className="w-full space-y-6 text-center">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="space-y-2">
                <motion.p
                  key={stepText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-medium text-white"
                >
                  {stepText}
                </motion.p>
                <motion.p
                  key={fakeMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-primary/70 font-mono tracking-wider"
                >
                  {fakeMessage}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {state === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] py-12 px-6 max-w-3xl mx-auto w-full"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-10 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 mb-4 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary" />
                Vibe Confirmed
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">
                {result.moodLabel}
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/60 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex items-center gap-1.5"
                >
                  <Cloud className="w-4 h-4" />
                  <span data-testid="text-weather">{result.weatherText}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                  className="w-1 h-1 rounded-full bg-white/20"
                />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span data-testid="text-time">{result.timeText}</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  className="w-1 h-1 rounded-full bg-white/20"
                />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7, duration: 0.6 }}
                  className="flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-primary/80" />
                  <span data-testid="text-energy" className="text-primary/80">
                    {result.detectedEnergy} Energy
                  </span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="w-full bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-10">
                <div className="w-48 h-48 shrink-0 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-purple-800 shadow-[0_0_40px_rgba(168,85,247,0.3)] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
                  <Music className="w-20 h-20 text-white/80" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-4">
                  <h3 className="text-3xl font-bold text-white" data-testid="text-playlist-name">
                    {result.playlistName}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {result.playlistDescription}
                  </p>
                  <div className="pt-4">
                    <a
                      href={`https://open.spotify.com/playlist/${result.playlistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-spotify"
                      className="inline-flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(29,185,84,0.3)]"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Open on Spotify
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <button
                onClick={reset}
                data-testid="button-reset"
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
