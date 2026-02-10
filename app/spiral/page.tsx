"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSpiralStore } from "@/stores/spiral-store";
import {
  generateUlamSpiral,
  generateSacksSpiral,
  isTwinPrime,
  isSophieGermainPrime,
  isPrime,
  factorize,
} from "@/lib/prime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OnboardingTooltip } from "@/components/onboarding-tooltip";

export default function SpiralPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const {
    spiralType,
    size,
    zoom,
    highlightTwins,
    highlightSophieGermain,
    hoveredNumber,
    setSpiralType,
    setSize,
    setZoom,
    setHoveredNumber,
  } = useSpiralStore();

  // Generate spiral data
  const spiralData = useMemo(() => {
    if (spiralType === "ulam") {
      return generateUlamSpiral(size);
    } else {
      return generateSacksSpiral(size);
    }
  }, [spiralType, size]);

  // Update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.min(rect.width * 0.75, window.innerHeight - 200),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Draw spiral
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2 + offset.x;
    const centerY = height / 2 + offset.y;
    const pointSize = Math.max(1, 3 * zoom);
    const spacing = spiralType === "ulam" ? 8 * zoom : 4 * zoom;

    // Draw spiral points
    spiralData.forEach((point) => {
      const x = centerX + point.x * spacing;
      const y = centerY - point.y * spacing; // Flip y for canvas coordinates

      // Skip points outside visible area
      if (x < -pointSize || x > width + pointSize || y < -pointSize || y > height + pointSize) {
        return;
      }

      if (point.isPrime) {
        let color = "hsl(var(--primary))";

        if (highlightTwins && isTwinPrime(point.n)) {
          color = "hsl(142 76% 36%)"; // Green for twins
        }
        if (highlightSophieGermain && isSophieGermainPrime(point.n)) {
          color = "hsl(45 93% 47%)"; // Gold for Sophie Germain
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw non-primes as small dots
        ctx.fillStyle = "hsl(var(--muted-foreground) / 0.2)";
        ctx.beginPath();
        ctx.arc(x, y, pointSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [spiralData, dimensions, zoom, offset, highlightTwins, highlightSophieGermain, spiralType]);

  // Handle mouse events for dragging and hover
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Find hovered number
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = dimensions.width / 2 + offset.x;
    const centerY = dimensions.height / 2 + offset.y;
    const spacing = spiralType === "ulam" ? 8 * zoom : 4 * zoom;

    // Find closest point
    let closestPoint = null;
    let minDist = 20;

    for (const point of spiralData) {
      const x = centerX + point.x * spacing;
      const y = centerY - point.y * spacing;
      const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    }

    setHoveredNumber(closestPoint?.n ?? null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(Math.max(0.1, Math.min(5, zoom * delta)));
  };

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Prime Spiral Visualizer</h1>
        <p className="text-muted-foreground">
          Explore the fascinating patterns of primes in Ulam and Sacks spirals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div
          ref={containerRef}
          className="relative rounded-lg border bg-card overflow-hidden"
        >
          <OnboardingTooltip
            featureKey="spiral"
            steps={[
              {
                title: "The Ulam Spiral",
                content: "Numbers are arranged in a square spiral starting from the center. Prime numbers are highlighted — notice how they cluster along diagonal lines!",
                position: "top-right",
              },
              {
                title: "Why Diagonals?",
                content: "The diagonal patterns appear because many prime-generating polynomials (like n\u00B2 + n + 41) produce values that align diagonally in the spiral. This was discovered by Stanislaw Ulam in 1963 while doodling in a boring meeting!",
                position: "top-right",
              },
              {
                title: "Explore Further",
                content: "Drag to pan, scroll to zoom. Try switching to the Sacks spiral for a polar view, or toggle twin prime highlighting to see paired primes.",
                position: "top-right",
              },
            ]}
          />
          <canvas
            ref={canvasRef}
            className="cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDragging(false);
              setHoveredNumber(null);
            }}
            onWheel={handleWheel}
          />

          {hoveredNumber && (
            <div className="absolute top-4 left-4 p-3 rounded-lg bg-popover border shadow-lg">
              <p className="font-mono text-lg font-bold">{hoveredNumber}</p>
              <p className="text-sm text-muted-foreground">
                {isPrime(hoveredNumber) ? (
                  <Badge variant="prime" className="mr-1">Prime</Badge>
                ) : (
                  <span>Factors: {factorize(hoveredNumber).join(" × ")}</span>
                )}
              </p>
              {isPrime(hoveredNumber) && isTwinPrime(hoveredNumber) && (
                <Badge variant="outline" className="mr-1 mt-1">Twin Prime</Badge>
              )}
              {isPrime(hoveredNumber) && isSophieGermainPrime(hoveredNumber) && (
                <Badge variant="outline" className="mt-1">Sophie Germain</Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Spiral Type</Label>
                <Tabs
                  value={spiralType}
                  onValueChange={(v) => setSpiralType(v as "ulam" | "sacks")}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="ulam" className="flex-1">Ulam</TabsTrigger>
                    <TabsTrigger value="sacks" className="flex-1">Sacks</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Size</Label>
                  <span className="text-sm text-muted-foreground">{size.toLocaleString()}</span>
                </div>
                <Slider
                  value={[size]}
                  onValueChange={([v]) => setSize(v)}
                  min={100}
                  max={50000}
                  step={100}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Zoom</Label>
                  <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={([v]) => setZoom(v)}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twins">Highlight Twin Primes</Label>
                  <Switch
                    id="twins"
                    checked={highlightTwins}
                    onCheckedChange={useSpiralStore.getState().setHighlightTwins}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sophie">Highlight Sophie Germain</Label>
                  <Switch
                    id="sophie"
                    checked={highlightSophieGermain}
                    onCheckedChange={useSpiralStore.getState().setHighlightSophieGermain}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Ulam Spiral:</strong> Numbers arranged in a square spiral
                reveal diagonal patterns in prime distribution.
              </p>
              <p>
                <strong>Sacks Spiral:</strong> Numbers on an Archimedean spiral
                where each revolution represents perfect squares.
              </p>
              <p className="text-xs mt-4">
                Drag to pan, scroll to zoom. Hover over points to see details.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
