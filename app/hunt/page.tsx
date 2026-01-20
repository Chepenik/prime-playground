"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHuntStore } from "@/stores/hunt-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heart,
  Trophy,
  RotateCcw,
  Play,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HuntPage() {
  const {
    grid,
    lives,
    score,
    level,
    gameStatus,
    initGame,
    movePlayer,
    resetGame,
  } = useHuntStore();

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer("right");
          break;
      }
    },
    [gameStatus, movePlayer]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleNextLevel = () => {
    initGame(level + 1);
  };

  const handleRestart = () => {
    resetGame();
    initGame(1);
  };

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Prime Hunt</h1>
        <p className="text-muted-foreground">
          Navigate to the goal by stepping only on prime numbers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardContent className="p-4 sm:p-6">
            {gameStatus === "idle" ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Ready to Hunt?</h2>
                  <p className="text-muted-foreground max-w-md">
                    Move through the grid by stepping only on prime numbers.
                    Reach the goal to advance to the next level!
                  </p>
                </div>
                <Button size="lg" onClick={() => initGame(1)}>
                  <Play className="h-5 w-5 mr-2" />
                  Start Game
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Game status bar */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-base py-1 px-3">
                      Level {level}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < lives
                              ? "text-red-500 fill-red-500"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    Score: {score}
                  </div>
                </div>

                {/* Game grid */}
                <div className="flex justify-center overflow-auto py-4">
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${grid[0]?.length || 5}, minmax(0, 1fr))`,
                    }}
                  >
                    {grid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-md text-sm sm:text-base font-bold border-2 transition-colors",
                            cell.isPlayer
                              ? "bg-primary text-primary-foreground border-primary"
                              : cell.isGoal
                              ? "bg-amber-500 text-white border-amber-500"
                              : cell.visited
                              ? "bg-muted text-muted-foreground border-muted"
                              : cell.isPrime
                              ? "bg-prime/20 text-prime border-prime/50 hover:bg-prime/30"
                              : "bg-secondary/50 text-secondary-foreground border-secondary hover:bg-secondary"
                          )}
                          whileHover={
                            !cell.isPlayer && !cell.visited
                              ? { scale: 1.05 }
                              : {}
                          }
                        >
                          {cell.isPlayer ? (
                            <div className="w-6 h-6 rounded-full bg-primary-foreground" />
                          ) : cell.isGoal ? (
                            <Target className="h-6 w-6" />
                          ) : (
                            cell.value
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mobile controls */}
                <div className="lg:hidden flex flex-col items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => movePlayer("up")}
                    disabled={gameStatus !== "playing"}
                  >
                    <ArrowUp className="h-6 w-6" />
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => movePlayer("left")}
                      disabled={gameStatus !== "playing"}
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => movePlayer("down")}
                      disabled={gameStatus !== "playing"}
                    >
                      <ArrowDown className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => movePlayer("right")}
                      disabled={gameStatus !== "playing"}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Game over / Win overlays */}
                <AnimatePresence>
                  {gameStatus === "won" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
                    >
                      <div className="text-center space-y-4">
                        <Trophy className="h-16 w-16 mx-auto text-amber-500" />
                        <h2 className="text-2xl font-bold">Level Complete!</h2>
                        <p className="text-muted-foreground">
                          Score: {score}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleNextLevel}>
                            Next Level
                          </Button>
                          <Button variant="outline" onClick={handleRestart}>
                            Restart
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {gameStatus === "lost" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
                    >
                      <div className="text-center space-y-4">
                        <div className="text-6xl">💀</div>
                        <h2 className="text-2xl font-bold">Game Over!</h2>
                        <p className="text-muted-foreground">
                          Final Score: {score}
                        </p>
                        <Button onClick={handleRestart}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Move from your starting position to the goal by stepping only
                on <strong className="text-prime">prime numbers</strong>.
              </p>
              <p>
                Stepping on a composite number costs you a life. Lose all 3
                lives and its game over!
              </p>
              <div className="hidden lg:block space-y-2 pt-2">
                <p className="font-medium text-foreground">Controls:</p>
                <ul className="space-y-1">
                  <li>Arrow keys or WASD to move</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary-foreground" />
                </div>
                <span>Your position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span>Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-prime/20 border-2 border-prime/50 flex items-center justify-center text-prime font-bold text-sm">
                  7
                </div>
                <span>Prime (safe)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-secondary/50 border-2 border-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
                  9
                </div>
                <span>Composite (danger)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Prime Numbers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">Primes under 30:</p>
              <p className="font-mono">
                2, 3, 5, 7, 11, 13, 17, 19, 23, 29
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
