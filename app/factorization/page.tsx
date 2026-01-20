"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFactorizationStore } from "@/stores/factorization-store";
import { buildFactorTree, factorizeWithExponents, isPrime } from "@/lib/prime";
import type { FactorTreeNode } from "@/lib/prime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";

interface TreeNodeProps {
  node: FactorTreeNode;
  level: number;
  maxLevel: number;
  animationLevel: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function TreeNode({
  node,
  level,
  maxLevel,
  animationLevel,
  x,
  y,
  parentX,
  parentY,
}: TreeNodeProps) {
  const isVisible = level <= animationLevel;
  const nodeSize = 50;
  const verticalSpacing = 80;
  const horizontalSpread = Math.pow(2, maxLevel - level) * 40;

  if (!isVisible) return null;

  return (
    <>
      {/* Connection line to parent */}
      {parentX !== undefined && parentY !== undefined && (
        <motion.line
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          x1={parentX}
          y1={parentY + nodeSize / 2}
          x2={x}
          y2={y - nodeSize / 2}
          stroke="hsl(var(--border))"
          strokeWidth={2}
        />
      )}

      {/* Node circle */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={node.isPrime ? "hsl(var(--prime))" : "hsl(var(--secondary))"}
          stroke={node.isPrime ? "hsl(var(--prime))" : "hsl(var(--border))"}
          strokeWidth={2}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={node.isPrime ? "hsl(var(--prime-foreground))" : "hsl(var(--foreground))"}
          fontSize={node.value > 999 ? 12 : node.value > 99 ? 14 : 16}
          fontWeight="bold"
        >
          {node.value}
        </text>
      </motion.g>

      {/* Children */}
      {node.children.length > 0 && (
        <>
          {node.children.map((child, index) => {
            const childX = x + (index === 0 ? -horizontalSpread / 2 : horizontalSpread / 2);
            const childY = y + verticalSpacing;
            return (
              <TreeNode
                key={`${child.value}-${index}`}
                node={child}
                level={level + 1}
                maxLevel={maxLevel}
                animationLevel={animationLevel}
                x={childX}
                y={childY}
                parentX={x}
                parentY={y}
              />
            );
          })}
        </>
      )}
    </>
  );
}

function getTreeDepth(node: FactorTreeNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getTreeDepth));
}

export default function FactorizationPage() {
  const {
    inputNumber,
    tree,
    animationLevel,
    isAnimating,
    setInputNumber,
    setTree,
    setAnimationLevel,
    setIsAnimating,
    reset,
  } = useFactorizationStore();

  const [inputValue, setInputValue] = useState(inputNumber.toString());
  const [maxLevel, setMaxLevel] = useState(0);

  const handleBuildTree = useCallback(() => {
    const num = parseInt(inputValue);
    if (isNaN(num) || num < 2 || num > 1000000) return;

    setInputNumber(num);
    const newTree = buildFactorTree(num);
    setTree(newTree);
    const depth = getTreeDepth(newTree);
    setMaxLevel(depth);
    setAnimationLevel(0);
    setIsAnimating(true);
  }, [inputValue, setInputNumber, setTree, setAnimationLevel, setIsAnimating]);

  // Animate tree building
  useEffect(() => {
    if (!isAnimating || !tree) return;

    if (animationLevel < maxLevel) {
      const timer = setTimeout(() => {
        setAnimationLevel(animationLevel + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isAnimating, animationLevel, maxLevel, tree, setAnimationLevel, setIsAnimating]);

  const handleReset = () => {
    reset();
    setInputValue("60");
  };

  const factorization = inputNumber > 1 ? factorizeWithExponents(inputNumber) : [];
  const factorizationString = factorization
    .map((f) => (f.exponent > 1 ? `${f.prime}^${f.exponent}` : f.prime.toString()))
    .join(" × ");

  // Calculate SVG dimensions based on tree depth
  const svgWidth = Math.max(400, Math.pow(2, maxLevel) * 60);
  const svgHeight = Math.max(300, maxLevel * 80 + 100);

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Prime Factorization Tree</h1>
        <p className="text-muted-foreground">
          Visualize the prime factorization of any number as an animated tree
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-auto bg-muted/20" style={{ maxHeight: "70vh" }}>
              <svg
                width={svgWidth}
                height={svgHeight}
                className="mx-auto"
                style={{ minWidth: "100%" }}
              >
                <AnimatePresence>
                  {tree && (
                    <TreeNode
                      node={tree}
                      level={1}
                      maxLevel={maxLevel}
                      animationLevel={animationLevel}
                      x={svgWidth / 2}
                      y={50}
                    />
                  )}
                </AnimatePresence>
              </svg>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">Number to factorize</Label>
                <Input
                  id="number"
                  type="number"
                  min={2}
                  max={1000000}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuildTree()}
                  placeholder="Enter a number"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBuildTree}
                  disabled={isAnimating}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Build Tree
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-sm font-medium">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[60, 120, 360, 1000, 2310].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue(num.toString());
                        setInputNumber(num);
                        const newTree = buildFactorTree(num);
                        setTree(newTree);
                        const depth = getTreeDepth(newTree);
                        setMaxLevel(depth);
                        setAnimationLevel(0);
                        setIsAnimating(true);
                      }}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {tree && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Number</p>
                  <p className="text-2xl font-bold">{inputNumber}</p>
                </div>

                {isPrime(inputNumber) ? (
                  <Badge variant="prime" className="text-base py-1 px-3">
                    Prime Number
                  </Badge>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Factorization</p>
                    <p className="font-mono text-lg">{factorizationString}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prime factors</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(factorization.map((f) => f.prime))).map((prime) => (
                      <Badge key={prime} variant="outline">
                        {prime}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-prime" />
                <span>Prime number (leaf)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary border" />
                <span>Composite number</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
