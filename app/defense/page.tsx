"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDefenseStore, TOWER_CONFIGS } from "@/stores/defense-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Heart,
  Coins,
  Waves,
  Trophy,
  Skull,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingTooltip } from "@/components/onboarding-tooltip";

const TOWER_PRIMES = [2, 3, 5, 7, 11, 13] as const;

export default function DefensePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const {
    towers,
    enemies,
    money,
    lives,
    wave,
    waveInProgress,
    gameStatus,
    path,
    selectedTowerPrime,
    gridSize,
    cellSize,
    highestWave,
    bestLivesRemaining,
    initGame,
    placeTower,
    selectTowerPrime,
    startWave,
    updateGame,
    removeTower,
    resetGame,
    loadProgress,
  } = useDefenseStore();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (waveInProgress) {
        updateGame(deltaTime);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStatus, waveInProgress, updateGame]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = gridSize * cellSize;
    const height = gridSize * cellSize;
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= gridSize; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height);
      ctx.stroke();
    }
    for (let y = 0; y <= gridSize; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width, y * cellSize);
      ctx.stroke();
    }

    // Draw path
    ctx.fillStyle = "rgba(100, 100, 120, 0.5)";
    path.forEach((p) => {
      ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
    });

    // Draw path connections
    ctx.strokeStyle = "#4a4a6a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    path.forEach((p, i) => {
      const x = p.x * cellSize + cellSize / 2;
      const y = p.y * cellSize + cellSize / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw towers
    towers.forEach((tower) => {
      const x = tower.x * cellSize + cellSize / 2;
      const y = tower.y * cellSize + cellSize / 2;

      // Draw range circle
      if (selectedTowerPrime === null) {
        ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw tower base
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(x, y, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw tower prime number
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tower.prime.toString(), x, y);
    });

    // Draw enemies
    enemies.forEach((enemy) => {
      // Health bar background
      ctx.fillStyle = "#333";
      ctx.fillRect(enemy.x - 15, enemy.y - 20, 30, 4);

      // Health bar fill
      const healthPercent = enemy.hp / enemy.maxHp;
      ctx.fillStyle = healthPercent > 0.5 ? "#22c55e" : healthPercent > 0.25 ? "#f59e0b" : "#ef4444";
      ctx.fillRect(enemy.x - 15, enemy.y - 20, 30 * healthPercent, 4);

      // Enemy body
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Enemy HP text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(enemy.hp.toString(), enemy.x, enemy.y);
    });

    // Draw tower placement preview
    if (selectedTowerPrime !== null && gameStatus === "playing") {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "default";
    }
  }, [towers, enemies, path, gridSize, cellSize, selectedTowerPrime, gameStatus]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selectedTowerPrime || gameStatus !== "playing") return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      placeTower(x, y);
    },
    [selectedTowerPrime, gameStatus, cellSize, placeTower]
  );

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Prime Defense</h1>
        <p className="text-muted-foreground">
          Place prime towers that only damage enemies with divisible HP
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="relative overflow-hidden">
          <OnboardingTooltip
            featureKey="defense"
            steps={[
              {
                title: "Prime Tower Defense",
                content: "Place towers using prime numbers to defend against enemies walking the path.",
                position: "top-right",
              },
              {
                title: "The Divisibility Mechanic",
                content: "This is the key: a tower with prime P can ONLY damage enemies whose HP is divisible by P. Tower 7 hits enemies with HP 14, 21, 35, etc. You need diverse primes!",
                position: "top-right",
              },
              {
                title: "Strategy Tips",
                content: "Tower 2 hits any even-HP enemy (most common). Tower 3 and 5 cover many others. Higher primes are niche but powerful. Mix your towers for full coverage!",
                position: "top-right",
              },
            ]}
          />
          <CardContent className="p-4">
            {gameStatus === "idle" ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Prime Defense</h2>
                  <p className="text-muted-foreground max-w-md">
                    Build towers using prime numbers. Each tower can only damage
                    enemies whose HP is divisible by the tower&apos;s prime!
                  </p>
                </div>
                <Button size="lg" onClick={initGame}>
                  <Play className="h-5 w-5 mr-2" />
                  Start Game
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Game stats */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="font-bold">{lives}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-5 w-5 text-amber-500" />
                      <span className="font-bold">{money}</span>
                    </div>
                    <Badge variant="outline" className="py-1 px-3">
                      <Waves className="h-4 w-4 mr-1" />
                      Wave {wave}/10
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={startWave}
                      disabled={waveInProgress || gameStatus !== "playing"}
                    >
                      {waveInProgress ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          In Progress
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Start Wave
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetGame}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Game canvas */}
                <div className="flex justify-center overflow-auto">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="rounded-lg border"
                  />
                </div>

                {/* Tower selection */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {TOWER_PRIMES.map((prime) => {
                    const config = TOWER_CONFIGS[prime];
                    const canAfford = money >= config.cost;
                    return (
                      <Button
                        key={prime}
                        variant={selectedTowerPrime === prime ? "default" : "outline"}
                        className={cn(
                          "flex-col h-auto py-2 px-4",
                          !canAfford && "opacity-50"
                        )}
                        onClick={() =>
                          selectTowerPrime(
                            selectedTowerPrime === prime ? null : prime
                          )
                        }
                        disabled={!canAfford || gameStatus !== "playing"}
                      >
                        <span className="text-xl font-bold">{prime}</span>
                        <span className="text-xs text-muted-foreground">
                          ${config.cost}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Game over / Win overlays */}
            <AnimatePresence>
              {gameStatus === "won" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm"
                >
                  <div className="text-center space-y-4">
                    <Trophy className="h-16 w-16 mx-auto text-amber-500" />
                    <h2 className="text-2xl font-bold">Victory!</h2>
                    <p className="text-muted-foreground">
                      You defended against all 10 waves!
                    </p>
                    <Button onClick={resetGame}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}

              {gameStatus === "lost" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm"
                >
                  <div className="text-center space-y-4">
                    <Skull className="h-16 w-16 mx-auto text-red-500" />
                    <h2 className="text-2xl font-bold">Defeated!</h2>
                    <p className="text-muted-foreground">
                      You survived {wave} waves
                    </p>
                    <Button onClick={resetGame}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Build <strong className="text-primary">prime towers</strong> to
                defend against enemies walking the path.
              </p>
              <p>
                <strong>Key mechanic:</strong> A tower with prime P can ONLY
                damage enemies whose HP is divisible by P.
              </p>
              <p>
                Tower 7 hits enemies with HP: 14, 21, 35, 49...
              </p>
              <p>
                You need diverse primes to handle all enemy types!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tower Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {TOWER_PRIMES.map((prime) => {
                const config = TOWER_CONFIGS[prime];
                return (
                  <div
                    key={prime}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {prime}
                      </div>
                      <div>
                        <p className="font-medium">Prime {prime}</p>
                        <p className="text-xs text-muted-foreground">
                          DMG: {config.damage} | Range: {config.range}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">${config.cost}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {highestWave > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Best Records</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Highest Wave</span>
                  <span className="font-bold font-mono">{highestWave}/10</span>
                </div>
                {bestLivesRemaining > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Finish</span>
                    <span className="font-bold font-mono">{bestLivesRemaining} lives</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Towers</CardTitle>
            </CardHeader>
            <CardContent>
              {towers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No towers placed yet
                </p>
              ) : (
                <div className="space-y-2">
                  {towers.map((tower) => (
                    <div
                      key={tower.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        Tower {tower.prime} at ({tower.x}, {tower.y})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive"
                        onClick={() => removeTower(tower.id)}
                      >
                        Sell
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
