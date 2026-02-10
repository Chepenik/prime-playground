"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCryptarithmStore, PUZZLES } from "@/stores/cryptarithm-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CryptarithmPage() {
  const {
    currentPuzzle,
    puzzleIndex,
    letterMapping,
    isSolved,
    hintsUsed,
    showHint,
    totalSolved,
    solvedPuzzleIds,
    loadPuzzle,
    nextPuzzle,
    setLetterValue,
    checkSolution,
    toggleHint,
    resetPuzzle,
    loadProgress,
    completionPercent,
  } = useCryptarithmStore();

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    if (!currentPuzzle) {
      loadPuzzle(0);
    }
  }, [currentPuzzle, loadPuzzle]);

  const handleDigitClick = (digit: number) => {
    if (!selectedLetter || isSolved) return;
    setLetterValue(selectedLetter, digit);
    setSelectedLetter(null);
  };

  const handleLetterClick = (letter: string) => {
    if (isSolved) return;
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  const handleCheck = () => {
    const result = checkSolution();
    if (!result) {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
    }
  };

  const uniqueLetters = currentPuzzle
    ? Array.from(new Set([...currentPuzzle.words, currentPuzzle.result].join("").split("")))
    : [];

  const usedDigits = new Set(
    Object.values(letterMapping).filter((v): v is number => v !== null)
  );

  if (!currentPuzzle) {
    return (
      <div className="container py-6 px-4 md:px-6">
        <p>Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Cryptarithm Puzzles</h1>
        <p className="text-muted-foreground">
          Replace letters with digits to make the equation true
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            {/* Puzzle header */}
            <div className="flex justify-between items-center mb-6">
              <Badge variant="outline" className="text-base py-1 px-3">
                Puzzle {puzzleIndex + 1} / {PUZZLES.length}
              </Badge>
              <Badge
                variant={
                  currentPuzzle.difficulty === "easy"
                    ? "secondary"
                    : currentPuzzle.difficulty === "medium"
                    ? "default"
                    : "destructive"
                }
              >
                {currentPuzzle.difficulty}
              </Badge>
            </div>

            {/* Puzzle display */}
            <div className="text-center space-y-4 mb-8">
              {currentPuzzle.words.map((word, wordIndex) => (
                <div key={`word-${wordIndex}`} className="flex justify-center items-center gap-2">
                  {wordIndex > 0 && (
                    <span className="text-3xl font-bold text-primary w-8">
                      {currentPuzzle.operator}
                    </span>
                  )}
                  <div className="flex gap-1">
                    {word.split("").map((letter, i) => (
                      <motion.button
                        key={`${wordIndex}-${i}`}
                        className={cn(
                          "w-12 h-14 sm:w-14 sm:h-16 rounded-lg border-2 text-xl sm:text-2xl font-bold flex flex-col items-center justify-center transition-colors",
                          selectedLetter === letter
                            ? "border-primary bg-primary text-primary-foreground"
                            : letterMapping[letter] !== null
                            ? "border-prime bg-prime/20 text-prime"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleLetterClick(letter)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{letter}</span>
                        <span className="text-sm opacity-70">
                          {letterMapping[letter] ?? "?"}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Separator line */}
              <div className="flex justify-center">
                <div className="w-64 h-1 bg-border rounded" />
              </div>

              {/* Result */}
              <div className="flex justify-center items-center gap-2">
                <span className="text-3xl font-bold w-8">=</span>
                <div className="flex gap-1">
                  {currentPuzzle.result.split("").map((letter, i) => (
                    <motion.button
                      key={`result-${i}`}
                      className={cn(
                        "w-12 h-14 sm:w-14 sm:h-16 rounded-lg border-2 text-xl sm:text-2xl font-bold flex flex-col items-center justify-center transition-colors",
                        selectedLetter === letter
                          ? "border-primary bg-primary text-primary-foreground"
                          : letterMapping[letter] !== null
                          ? "border-prime bg-prime/20 text-prime"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleLetterClick(letter)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{letter}</span>
                      <span className="text-sm opacity-70">
                        {letterMapping[letter] ?? "?"}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Digit selection */}
            <div className="flex justify-center gap-2 flex-wrap mb-6">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <Button
                  key={digit}
                  variant={usedDigits.has(digit) ? "secondary" : "outline"}
                  size="lg"
                  className={cn(
                    "w-12 h-12 text-xl font-bold",
                    usedDigits.has(digit) && "opacity-50"
                  )}
                  onClick={() => handleDigitClick(digit)}
                  disabled={!selectedLetter || isSolved}
                >
                  {digit}
                </Button>
              ))}
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && currentPuzzle.hint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 mb-6"
                >
                  <Lightbulb className="h-4 w-4 inline mr-2" />
                  {currentPuzzle.hint}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={toggleHint}
                disabled={isSolved}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
              <Button
                variant="outline"
                onClick={resetPuzzle}
                disabled={isSolved}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleCheck}
                disabled={isSolved || Object.values(letterMapping).some((v) => v === null)}
                className={cn(showError && "bg-destructive")}
              >
                {showError ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Wrong!
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Check
                  </>
                )}
              </Button>
            </div>

            {/* Success overlay */}
            <AnimatePresence>
              {isSolved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm"
                >
                  <div className="text-center space-y-4">
                    <Trophy className="h-16 w-16 mx-auto text-amber-500" />
                    <h2 className="text-2xl font-bold">Solved!</h2>
                    <Button onClick={nextPuzzle}>
                      Next Puzzle
                      <ArrowRight className="h-4 w-4 ml-2" />
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
              <CardTitle className="text-lg">Letter Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {uniqueLetters.sort().map((letter) => (
                  <div
                    key={letter}
                    className={cn(
                      "flex items-center justify-between p-2 rounded border",
                      selectedLetter === letter
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <span className="font-bold text-lg">{letter}</span>
                    <span className="font-mono text-lg text-muted-foreground">
                      {letterMapping[letter] ?? "-"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Puzzles Solved</span>
                <span className="font-bold">{totalSolved} / {PUZZLES.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-bold">{completionPercent()}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-prime h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent()}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hints Used</span>
                <span className="font-bold">{hintsUsed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Each letter represents a unique digit (0-9). Replace the letters
                to make the equation true.
              </p>
              <p>
                <strong>Rules:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Each letter maps to one digit</li>
                <li>Different letters = different digits</li>
                <li>Leading zeros not allowed</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Jump to Puzzle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PUZZLES.map((puzzle, i) => {
                  const solved = solvedPuzzleIds.includes(puzzle.id);
                  return (
                    <Button
                      key={i}
                      variant={i === puzzleIndex ? "default" : solved ? "secondary" : "outline"}
                      size="sm"
                      className={cn("w-9 h-9", solved && i !== puzzleIndex && "border-prime/50 text-prime")}
                      onClick={() => loadPuzzle(i)}
                    >
                      {solved ? <Check className="h-3 w-3" /> : i + 1}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
