"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useArtStore, COLOR_SCHEMES } from "@/stores/art-store";
import { sieveOfEratosthenes, getSacksSpiralPosition } from "@/lib/prime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Shuffle, Save, Trash2 } from "lucide-react";

export default function ArtPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const {
    mode,
    colorScheme,
    density,
    seed,
    animated,
    speed,
    primeCount,
    showNumbers,
    savedPresets,
    setMode,
    setColorScheme,
    setDensity,
    setSeed,
    setAnimated,
    setSpeed,
    setPrimeCount,
    randomize,
    savePreset,
    loadPreset,
    deletePreset,
    loadGallery,
  } = useArtStore();

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Generate primes
  const primes = useMemo(() => {
    return sieveOfEratosthenes(primeCount);
  }, [primeCount]);

  // Update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.min(rect.width * 0.75, window.innerHeight - 250),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Get color from scheme
  const getColor = useCallback(
    (index: number, alpha = 1) => {
      const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.cosmic;
      const color = colors[index % colors.length];
      if (alpha < 1) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return color;
    },
    [colorScheme]
  );

  // Draw art
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    let time = 0;
    let lastTime = 0;

    const draw = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      if (animated) {
        time += deltaTime * 0.001 * speed;
      }

      // Clear with dark background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      switch (mode) {
        case "spiral": {
          const scale = Math.min(width, height) / 100;
          primes.forEach((prime) => {
            const pos = getSacksSpiralPosition(prime);
            const x = centerX + pos.x * scale * (density / 50);
            const y = centerY + pos.y * scale * (density / 50);

            const animatedSize = animated
              ? 3 + Math.sin(time + prime * 0.1) * 2
              : 3;
            const colorIndex = Math.floor(prime / 10) % COLOR_SCHEMES[colorScheme].length;

            ctx.fillStyle = getColor(colorIndex, 0.8);
            ctx.beginPath();
            ctx.arc(x, y, animatedSize, 0, Math.PI * 2);
            ctx.fill();

            if (showNumbers && animatedSize > 2) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
              ctx.font = "8px monospace";
              ctx.fillText(prime.toString(), x + 5, y + 3);
            }
          });
          break;
        }

        case "particles": {
          primes.forEach((prime, i) => {
            const angle = (prime * 137.508) * (Math.PI / 180); // Golden angle
            const radius = Math.sqrt(prime) * (density / 10);
            const animatedRadius = animated
              ? radius + Math.sin(time * 2 + prime * 0.05) * 10
              : radius;

            const x = centerX + Math.cos(angle + time * 0.2) * animatedRadius;
            const y = centerY + Math.sin(angle + time * 0.2) * animatedRadius;

            const size = Math.max(1, 8 - Math.sqrt(prime) * 0.1);
            const colorIndex = prime % COLOR_SCHEMES[colorScheme].length;

            ctx.fillStyle = getColor(colorIndex, 0.7);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Draw connections to nearby primes
            if (i > 0 && i < primes.length - 1) {
              const prevPrime = primes[i - 1];
              const prevAngle = (prevPrime * 137.508) * (Math.PI / 180);
              const prevRadius = Math.sqrt(prevPrime) * (density / 10);
              const animatedPrevRadius = animated
                ? prevRadius + Math.sin(time * 2 + prevPrime * 0.05) * 10
                : prevRadius;
              const prevX = centerX + Math.cos(prevAngle + time * 0.2) * animatedPrevRadius;
              const prevY = centerY + Math.sin(prevAngle + time * 0.2) * animatedPrevRadius;

              ctx.strokeStyle = getColor(colorIndex, 0.1);
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(prevX, prevY);
              ctx.stroke();
            }
          });
          break;
        }

        case "waves": {
          const waveCount = 5;
          for (let w = 0; w < waveCount; w++) {
            ctx.beginPath();
            ctx.moveTo(0, centerY);

            for (let x = 0; x <= width; x += 2) {
              let y = centerY;
              primes.slice(0, 20).forEach((prime, i) => {
                const frequency = prime * 0.001 * (density / 50);
                const amplitude = 50 / (i + 1);
                const phaseOffset = w * Math.PI * 0.4;
                y += Math.sin(x * frequency + time + phaseOffset) * amplitude;
              });
              ctx.lineTo(x, y);
            }

            ctx.strokeStyle = getColor(w, 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
        }

        case "mandala": {
          const rings = Math.min(primes.length, 50);
          for (let i = 0; i < rings; i++) {
            const prime = primes[i];
            const ringRadius = (i + 1) * (Math.min(width, height) / rings / 2) * (density / 50);
            const segments = prime % 12 + 3;

            ctx.strokeStyle = getColor(i, 0.5);
            ctx.lineWidth = 2;

            for (let s = 0; s < segments; s++) {
              const angle = (s / segments) * Math.PI * 2 + (animated ? time * 0.5 : 0);
              const x1 = centerX + Math.cos(angle) * ringRadius;
              const y1 = centerY + Math.sin(angle) * ringRadius;
              ctx.beginPath();
              ctx.arc(x1, y1, 3, 0, Math.PI * 2);
              ctx.fillStyle = getColor(i);
              ctx.fill();

              if (i < rings - 1) {
                const nextPrime = primes[i + 1];
                const nextRingRadius = (i + 2) * (Math.min(width, height) / rings / 2) * (density / 50);
                const nextSegments = nextPrime % 12 + 3;
                const nextAngle = ((s % nextSegments) / nextSegments) * Math.PI * 2 + (animated ? time * 0.5 : 0);
                const nx = centerX + Math.cos(nextAngle) * nextRingRadius;
                const ny = centerY + Math.sin(nextAngle) * nextRingRadius;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(nx, ny);
                ctx.strokeStyle = getColor(i, 0.2);
                ctx.stroke();
              }
            }
          }
          break;
        }
      }

      if (animated) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, mode, primes, colorScheme, density, seed, animated, speed, showNumbers, getColor]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `prime-art-${mode}-${seed}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Prime Art Generator</h1>
        <p className="text-muted-foreground">
          Generate beautiful art from prime number distributions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div ref={containerRef} className="rounded-lg border bg-card overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="spiral">Spiral</TabsTrigger>
                  <TabsTrigger value="particles">Particles</TabsTrigger>
                </TabsList>
                <TabsList className="w-full grid grid-cols-2 mt-1">
                  <TabsTrigger value="waves">Waves</TabsTrigger>
                  <TabsTrigger value="mandala">Mandala</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(COLOR_SCHEMES).map((scheme) => (
                      <SelectItem key={scheme} value={scheme}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {COLOR_SCHEMES[scheme].slice(0, 4).map((color, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="capitalize">{scheme}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Density</Label>
                  <span className="text-sm text-muted-foreground">{density}%</span>
                </div>
                <Slider
                  value={[density]}
                  onValueChange={([v]) => setDensity(v)}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Prime Count</Label>
                  <span className="text-sm text-muted-foreground">{primeCount}</span>
                </div>
                <Slider
                  value={[primeCount]}
                  onValueChange={([v]) => setPrimeCount(v)}
                  min={100}
                  max={5000}
                  step={100}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Seed</Label>
                  <span className="text-sm text-muted-foreground font-mono">{seed}</span>
                </div>
                <Slider
                  value={[seed]}
                  onValueChange={([v]) => setSeed(v)}
                  min={0}
                  max={9999}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="animated">Animation</Label>
                <Switch
                  id="animated"
                  checked={animated}
                  onCheckedChange={setAnimated}
                />
              </div>

              {animated && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Speed</Label>
                    <span className="text-sm text-muted-foreground">{speed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={([v]) => setSpeed(v)}
                    min={0.1}
                    max={3}
                    step={0.1}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={randomize} variant="outline" className="flex-1">
              <Shuffle className="h-4 w-4 mr-2" />
              Randomize
            </Button>
            <Button onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const name = `${mode} - ${colorScheme} #${seed}`;
              savePreset(name);
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preset
          </Button>

          {savedPresets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Saved Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-2 rounded border text-sm hover:bg-accent cursor-pointer group"
                  >
                    <button
                      className="text-left flex-1 truncate"
                      onClick={() => loadPreset(preset)}
                    >
                      <span className="font-medium">{preset.name}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => deletePreset(preset.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
