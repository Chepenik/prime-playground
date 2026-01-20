"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSoundscapeStore, SCALES, primeToNote } from "@/stores/soundscape-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SoundscapePage() {
  const {
    tempo,
    scale,
    baseOctave,
    isPlaying,
    primeSequence,
    currentIndex,
    maxPrime,
    volume,
    setTempo,
    setScale,
    setBaseOctave,
    setIsPlaying,
    setCurrentIndex,
    setMaxPrime,
    setVolume,
    generateSequence,
    nextNote,
  } = useSoundscapeStore();

  const [audioInitialized, setAudioInitialized] = useState(false);
  const [toneReady, setToneReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Tone.js
  useEffect(() => {
    const initTone = async () => {
      const Tone = (await import("tone")).default;
      synthRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.05,
          decay: 0.1,
          sustain: 0.3,
          release: 0.4,
        },
      }).toDestination();
      setToneReady(true);
    };
    initTone();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  // Generate sequence on mount
  useEffect(() => {
    if (primeSequence.length === 0) {
      generateSequence();
    }
  }, [primeSequence.length, generateSequence]);

  // Update volume
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume * 20 - 20; // Convert 0-1 to -20 to 0 dB
    }
  }, [volume]);

  // Play loop
  useEffect(() => {
    if (isPlaying && primeSequence.length > 0 && toneReady) {
      const intervalMs = (60 / tempo) * 1000;

      intervalRef.current = setInterval(() => {
        const prime = primeSequence[currentIndex];
        const note = primeToNote(prime, scale, baseOctave);

        if (synthRef.current) {
          synthRef.current.triggerAttackRelease(note, "8n");
        }

        nextNote();
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, scale, baseOctave, primeSequence, currentIndex, toneReady, nextNote]);

  const handlePlay = useCallback(async () => {
    if (!audioInitialized) {
      const Tone = (await import("tone")).default;
      await Tone.start();
      setAudioInitialized(true);
    }
    setIsPlaying(true);
  }, [audioInitialized, setIsPlaying]);

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentPrime = primeSequence[currentIndex];
  const currentNote = currentPrime ? primeToNote(currentPrime, scale, baseOctave) : "";

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Prime Soundscape</h1>
        <p className="text-muted-foreground">
          Convert prime number sequences into musical compositions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Visualizer */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary font-mono">
                  {currentPrime || "---"}
                </div>
                <div className="text-xl text-muted-foreground">
                  Note: <span className="font-mono text-foreground">{currentNote || "---"}</span>
                </div>
                <Badge variant={isPlaying ? "default" : "secondary"} className="text-sm">
                  {isPlaying ? "Playing" : "Stopped"}
                </Badge>
              </div>

              {/* Visual sequence display */}
              <div className="mt-8 overflow-hidden">
                <div className="flex gap-2 justify-center flex-wrap">
                  {primeSequence.slice(
                    Math.max(0, currentIndex - 5),
                    currentIndex + 10
                  ).map((prime, i) => {
                    const absoluteIndex = Math.max(0, currentIndex - 5) + i;
                    const isCurrent = absoluteIndex === currentIndex;
                    return (
                      <div
                        key={`${prime}-${absoluteIndex}`}
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center font-mono text-sm transition-all",
                          isCurrent
                            ? "bg-primary text-primary-foreground scale-125 shadow-lg"
                            : absoluteIndex < currentIndex
                            ? "bg-muted text-muted-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {prime}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex justify-center gap-4 mt-8">
                {!isPlaying ? (
                  <Button size="lg" onClick={handlePlay} disabled={!toneReady}>
                    <Play className="h-5 w-5 mr-2" />
                    Play
                  </Button>
                ) : (
                  <Button size="lg" onClick={handlePause}>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={handleStop}>
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </div>

              {!audioInitialized && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Click Play to start audio
                </p>
              )}
            </CardContent>
          </Card>

          {/* Waveform visualization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sequence Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end gap-px">
                {primeSequence.slice(0, 50).map((prime, i) => {
                  const height = (prime / Math.max(...primeSequence.slice(0, 50))) * 100;
                  const isCurrent = i === currentIndex;
                  return (
                    <div
                      key={`bar-${prime}-${i}`}
                      className={cn(
                        "flex-1 rounded-t transition-colors",
                        isCurrent ? "bg-primary" : i < currentIndex ? "bg-muted" : "bg-primary/30"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                First 50 primes (bar height = relative value)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Tempo (BPM)</Label>
                  <span className="text-sm text-muted-foreground">{tempo}</span>
                </div>
                <Slider
                  value={[tempo]}
                  onValueChange={([v]) => setTempo(v)}
                  min={30}
                  max={240}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Volume</Label>
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="space-y-3">
                <Label>Scale</Label>
                <Select value={scale} onValueChange={setScale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SCALES).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Base Octave</Label>
                <Select
                  value={baseOctave.toString()}
                  onValueChange={(v) => setBaseOctave(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((o) => (
                      <SelectItem key={o} value={o.toString()}>
                        Octave {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Prime Range</Label>
                  <span className="text-sm text-muted-foreground">Up to {maxPrime}</span>
                </div>
                <Slider
                  value={[maxPrime]}
                  onValueChange={([v]) => setMaxPrime(v)}
                  min={50}
                  max={500}
                  step={50}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Each prime number is mapped to a musical note based on the
                selected scale.
              </p>
              <p>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  note = prime mod scaleLength
                </code>
              </p>
              <p>
                The result is a unique musical sequence that reveals patterns
                in prime distribution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primes loaded:</span>
                <span className="font-mono">{primeSequence.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current position:</span>
                <span className="font-mono">{currentIndex + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scale notes:</span>
                <span className="font-mono">{SCALES[scale]?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
