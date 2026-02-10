"use client";

import { useMemo, useRef, useCallback } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useUniverseStore } from "@/stores/universe-store";
import {
  sieveOfEratosthenes,
  getUlamSpiralPosition,
  isTwinPrime,
  isSophieGermainPrime,
  isMersennePrime,
  isPrime,
  factorize,
} from "@/lib/prime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Colors
const PRIME_COLOR = new THREE.Color("#8b5cf6");
const TWIN_COLOR = new THREE.Color("#22c55e");
const SOPHIE_COLOR = new THREE.Color("#f59e0b");
const MERSENNE_COLOR = new THREE.Color("#ef4444");

interface PointData {
  n: number;
  position: THREE.Vector3;
  isPrime: boolean;
  isTwin: boolean;
  isSophie: boolean;
  isMersenne: boolean;
}

function PrimePoints({
  points,
  onSelect,
  highlightType,
  pointSize,
}: {
  points: PointData[];
  onSelect: (n: number | null) => void;
  highlightType: string;
  pointSize: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorArray = useRef<Float32Array>(new Float32Array(0));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const primePoints = useMemo(
    () => points.filter((p) => p.isPrime),
    [points]
  );

  useMemo(() => {
    if (!meshRef.current) return;

    const colors = new Float32Array(primePoints.length * 3);

    primePoints.forEach((point, i) => {
      dummy.position.copy(point.position);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      let color = PRIME_COLOR;
      if (highlightType === "twin" && point.isTwin) color = TWIN_COLOR;
      else if (highlightType === "sophie" && point.isSophie)
        color = SOPHIE_COLOR;
      else if (highlightType === "mersenne" && point.isMersenne)
        color = MERSENNE_COLOR;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    colorArray.current = colors;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [primePoints, dummy, highlightType]);

  // Separate memo for setting instance color attribute
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.3 * pointSize, 8, 6);
    return geo;
  }, [pointSize]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && e.instanceId < primePoints.length) {
        onSelect(primePoints[e.instanceId].n);
      }
    },
    [primePoints, onSelect]
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, primePoints.length]}
      onClick={handleClick}
    >
      <meshStandardMaterial color="#8b5cf6" />
    </instancedMesh>
  );
}

function CompositePoints({
  points,
  pointSize,
}: {
  points: PointData[];
  pointSize: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const compositePoints = useMemo(
    () => points.filter((p) => !p.isPrime),
    [points]
  );

  useMemo(() => {
    if (!meshRef.current) return;

    compositePoints.forEach((point, i) => {
      dummy.position.copy(point.position);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [compositePoints, dummy]);

  const geometry = useMemo(
    () => new THREE.SphereGeometry(0.12 * pointSize, 4, 4),
    [pointSize]
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, compositePoints.length]}
    >
      <meshStandardMaterial color="#334155" transparent opacity={0.3} />
    </instancedMesh>
  );
}

function TwinConnections({ points }: { points: PointData[] }) {
  const lineGeometry = useMemo(() => {
    const twinPairs: [THREE.Vector3, THREE.Vector3][] = [];
    const primeMap = new Map<number, PointData>();

    points.forEach((p) => {
      if (p.isPrime) primeMap.set(p.n, p);
    });

    primeMap.forEach((point, n) => {
      if (primeMap.has(n + 2)) {
        twinPairs.push([point.position, primeMap.get(n + 2)!.position]);
      }
    });

    const positions: number[] = [];
    twinPairs.forEach(([a, b]) => {
      positions.push(a.x, a.y, a.z);
      positions.push(b.x, b.y, b.z);
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, [points]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color="#22c55e" transparent opacity={0.3} />
    </lineSegments>
  );
}

function SelectedLabel({
  selectedNumber,
}: {
  selectedNumber: number | null;
}) {
  if (selectedNumber === null) return null;

  const prime = isPrime(selectedNumber);
  const factors = prime ? [] : factorize(selectedNumber);
  const twin = prime && isTwinPrime(selectedNumber);
  const sophie = prime && isSophieGermainPrime(selectedNumber);
  const mersenne = prime && isMersennePrime(selectedNumber);

  return (
    <Billboard position={[0, 0, 0]} follow={true}>
      <Text
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="bottom"
        position={[0, 25, 0]}
      >
        {`${selectedNumber}${prime ? " (Prime)" : ` = ${factors.join(" x ")}`}${twin ? " [Twin]" : ""}${sophie ? " [Sophie Germain]" : ""}${mersenne ? " [Mersenne]" : ""}`}
      </Text>
    </Billboard>
  );
}

function Scene() {
  const {
    pointCount,
    showTwinConnections,
    highlightType,
    selectedNumber,
    autoRotate,
    pointSize,
    setSelectedNumber,
  } = useUniverseStore();

  const points = useMemo(() => {
    const primeSet = new Set(sieveOfEratosthenes(pointCount));
    const result: PointData[] = [];

    for (let n = 1; n <= pointCount; n++) {
      const pos = getUlamSpiralPosition(n);
      // Add a Z component based on distance from center for 3D effect
      const distFromCenter = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
      const z = Math.sin(distFromCenter * 0.3) * 5;
      const prime = primeSet.has(n);

      result.push({
        n,
        position: new THREE.Vector3(pos.x * 0.8, pos.y * 0.8, z),
        isPrime: prime,
        isTwin: prime && isTwinPrime(n),
        isSophie: prime && isSophieGermainPrime(n),
        isMersenne: prime && isMersennePrime(n),
      });
    }

    return result;
  }, [pointCount]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[50, 50, 50]} intensity={1} />
      <pointLight position={[-50, -50, 50]} intensity={0.5} color="#6366f1" />

      <PrimePoints
        points={points}
        onSelect={setSelectedNumber}
        highlightType={highlightType}
        pointSize={pointSize}
      />
      <CompositePoints points={points} pointSize={pointSize} />

      {showTwinConnections && <TwinConnections points={points} />}
      <SelectedLabel selectedNumber={selectedNumber} />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        maxDistance={200}
        minDistance={10}
      />
    </>
  );
}

export default function UniversePage() {
  const {
    pointCount,
    showTwinConnections,
    highlightType,
    selectedNumber,
    autoRotate,
    pointSize,
    setPointCount,
    setShowTwinConnections,
    setHighlightType,
    setSelectedNumber,
    setAutoRotate,
    setPointSize,
  } = useUniverseStore();

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          3D Prime Universe
        </h1>
        <p className="text-muted-foreground">
          Explore prime number patterns in an interactive 3D Ulam spiral
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="relative rounded-lg border bg-card overflow-hidden">
          <div className="w-full" style={{ height: "calc(100vh - 250px)", minHeight: 400 }}>
            <Canvas
              camera={{ position: [0, 0, 60], fov: 60 }}
              onClick={() => setSelectedNumber(null)}
            >
              <color attach="background" args={["#0a0a1a"]} />
              <fog attach="fog" args={["#0a0a1a", 100, 250]} />
              <Scene />
            </Canvas>
          </div>

          {selectedNumber && (
            <div className="absolute top-4 left-4 p-3 rounded-lg bg-popover/90 border shadow-lg backdrop-blur-sm">
              <p className="font-mono text-lg font-bold">{selectedNumber}</p>
              <p className="text-sm text-muted-foreground">
                {isPrime(selectedNumber) ? (
                  <Badge variant="prime" className="mr-1">
                    Prime
                  </Badge>
                ) : (
                  <span>
                    Factors: {factorize(selectedNumber).join(" × ")}
                  </span>
                )}
              </p>
              {isPrime(selectedNumber) && isTwinPrime(selectedNumber) && (
                <Badge variant="outline" className="mr-1 mt-1">
                  Twin Prime
                </Badge>
              )}
              {isPrime(selectedNumber) &&
                isSophieGermainPrime(selectedNumber) && (
                  <Badge variant="outline" className="mr-1 mt-1">
                    Sophie Germain
                  </Badge>
                )}
              {isPrime(selectedNumber) && isMersennePrime(selectedNumber) && (
                <Badge variant="outline" className="mt-1">
                  Mersenne Prime
                </Badge>
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
                <div className="flex justify-between">
                  <Label>Points</Label>
                  <span className="text-sm text-muted-foreground">
                    {pointCount.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[pointCount]}
                  onValueChange={([v]) => setPointCount(v)}
                  min={500}
                  max={5000}
                  step={100}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Point Size</Label>
                  <span className="text-sm text-muted-foreground">
                    {pointSize.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[pointSize]}
                  onValueChange={([v]) => setPointSize(v)}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </div>

              <div className="space-y-3">
                <Label>Highlight Type</Label>
                <Select
                  value={highlightType}
                  onValueChange={(v) =>
                    setHighlightType(
                      v as "none" | "twin" | "sophie" | "mersenne"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="twin">Twin Primes</SelectItem>
                    <SelectItem value="sophie">Sophie Germain</SelectItem>
                    <SelectItem value="mersenne">Mersenne Primes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twin-connections">Twin Connections</Label>
                  <Switch
                    id="twin-connections"
                    checked={showTwinConnections}
                    onCheckedChange={setShowTwinConnections}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-rotate">Auto Rotate</Label>
                  <Switch
                    id="auto-rotate"
                    checked={autoRotate}
                    onCheckedChange={setAutoRotate}
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
                This 3D visualization extends the classic Ulam spiral into three
                dimensions, with height based on distance from center.
              </p>
              <p>
                <strong className="text-primary">Purple</strong> spheres are primes.
                Toggle highlighting to see{" "}
                <strong className="text-green-500">twin primes</strong>,{" "}
                <strong className="text-amber-500">Sophie Germain primes</strong>, or{" "}
                <strong className="text-red-500">Mersenne primes</strong>.
              </p>
              <p className="text-xs mt-4">
                Click on a prime sphere to inspect it. Drag to orbit, scroll to
                zoom.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
