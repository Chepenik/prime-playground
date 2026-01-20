/**
 * Check if a number is prime
 * Uses trial division with 6k +/- 1 optimization
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Generate primes up to n using Sieve of Eratosthenes
 */
export function sieveOfEratosthenes(n: number): number[] {
  if (n < 2) return [];

  const sieve = new Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;

  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false;
      }
    }
  }

  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i]) primes.push(i);
  }
  return primes;
}

/**
 * Get prime factorization of a number
 * Returns array of prime factors (with repetition)
 */
export function factorize(n: number): number[] {
  if (n <= 1) return [];

  const factors: number[] = [];
  let remaining = n;

  while (remaining % 2 === 0) {
    factors.push(2);
    remaining /= 2;
  }

  for (let i = 3; i * i <= remaining; i += 2) {
    while (remaining % i === 0) {
      factors.push(i);
      remaining /= i;
    }
  }

  if (remaining > 1) {
    factors.push(remaining);
  }

  return factors;
}

/**
 * Get unique prime factors with their exponents
 */
export function factorizeWithExponents(
  n: number
): { prime: number; exponent: number }[] {
  const factors = factorize(n);
  const result: { prime: number; exponent: number }[] = [];

  let i = 0;
  while (i < factors.length) {
    const prime = factors[i];
    let count = 0;
    while (i < factors.length && factors[i] === prime) {
      count++;
      i++;
    }
    result.push({ prime, exponent: count });
  }

  return result;
}

/**
 * Check if a number is a twin prime (p where p+2 or p-2 is also prime)
 */
export function isTwinPrime(n: number): boolean {
  if (!isPrime(n)) return false;
  return isPrime(n - 2) || isPrime(n + 2);
}

/**
 * Check if a number is a Sophie Germain prime (p where 2p+1 is also prime)
 */
export function isSophieGermainPrime(n: number): boolean {
  if (!isPrime(n)) return false;
  return isPrime(2 * n + 1);
}

/**
 * Check if a number is a Mersenne prime (2^p - 1 where the result is prime)
 */
export function isMersennePrime(n: number): boolean {
  if (!isPrime(n)) return false;
  // Check if n = 2^p - 1 for some p
  const log = Math.log2(n + 1);
  return Number.isInteger(log) && isPrime(log);
}

/**
 * Get the nth prime number
 */
export function nthPrime(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 2;

  let count = 1;
  let candidate = 3;

  while (count < n) {
    if (isPrime(candidate)) {
      count++;
      if (count === n) return candidate;
    }
    candidate += 2;
  }

  return candidate;
}

/**
 * Generate Ulam spiral coordinates
 * Returns position in spiral for a given number
 */
export function getUlamSpiralPosition(n: number): { x: number; y: number } {
  if (n === 1) return { x: 0, y: 0 };

  // Find which ring the number is in
  const k = Math.ceil((Math.sqrt(n) - 1) / 2);
  const maxInRing = (2 * k + 1) ** 2;
  const sideLength = 2 * k;

  const position = maxInRing - n;

  // Determine which side of the ring
  const side = Math.floor(position / sideLength);
  const offset = position % sideLength;

  switch (side) {
    case 0: // Right side going up
      return { x: k, y: k - offset };
    case 1: // Top side going left
      return { x: k - offset, y: -k };
    case 2: // Left side going down
      return { x: -k, y: -k + offset };
    case 3: // Bottom side going right
      return { x: -k + offset, y: k };
    default:
      return { x: k, y: k };
  }
}

/**
 * Generate Ulam spiral data for rendering
 */
export function generateUlamSpiral(
  size: number
): { n: number; x: number; y: number; isPrime: boolean }[] {
  const points: { n: number; x: number; y: number; isPrime: boolean }[] = [];
  const primeSet = new Set(sieveOfEratosthenes(size));

  for (let n = 1; n <= size; n++) {
    const pos = getUlamSpiralPosition(n);
    points.push({
      n,
      ...pos,
      isPrime: primeSet.has(n),
    });
  }

  return points;
}

/**
 * Generate Sacks spiral coordinates (polar)
 * Returns angle and radius for a given number
 */
export function getSacksSpiralPosition(n: number): {
  angle: number;
  radius: number;
  x: number;
  y: number;
} {
  const sqrtN = Math.sqrt(n);
  const angle = sqrtN * 2 * Math.PI;
  const radius = sqrtN;

  return {
    angle,
    radius,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Generate Sacks spiral data for rendering
 */
export function generateSacksSpiral(
  size: number
): { n: number; x: number; y: number; angle: number; radius: number; isPrime: boolean }[] {
  const points: {
    n: number;
    x: number;
    y: number;
    angle: number;
    radius: number;
    isPrime: boolean;
  }[] = [];
  const primeSet = new Set(sieveOfEratosthenes(size));

  for (let n = 1; n <= size; n++) {
    const pos = getSacksSpiralPosition(n);
    points.push({
      n,
      ...pos,
      isPrime: primeSet.has(n),
    });
  }

  return points;
}

/**
 * Build a factor tree structure for visualization
 */
export interface FactorTreeNode {
  value: number;
  isPrime: boolean;
  children: FactorTreeNode[];
}

export function buildFactorTree(n: number): FactorTreeNode {
  if (n <= 1) {
    return { value: n, isPrime: false, children: [] };
  }

  if (isPrime(n)) {
    return { value: n, isPrime: true, children: [] };
  }

  // Find smallest factor
  let factor = 2;
  while (n % factor !== 0) {
    factor++;
  }

  const other = n / factor;

  return {
    value: n,
    isPrime: false,
    children: [buildFactorTree(factor), buildFactorTree(other)],
  };
}

/**
 * Get all prime numbers up to n as a Set (for efficient lookups)
 */
export function getPrimeSet(n: number): Set<number> {
  return new Set(sieveOfEratosthenes(n));
}

/**
 * Count primes up to n (prime counting function)
 */
export function countPrimes(n: number): number {
  return sieveOfEratosthenes(n).length;
}

/**
 * Get prime gap (distance to next prime)
 */
export function getPrimeGap(n: number): number {
  if (!isPrime(n)) return 0;

  let next = n + 1;
  while (!isPrime(next)) {
    next++;
  }
  return next - n;
}

/**
 * Check if two numbers are coprime (GCD = 1)
 */
export function areCoprime(a: number, b: number): boolean {
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  return gcd(a, b) === 1;
}

/**
 * Goldbach conjecture: find two primes that sum to n (for even n > 2)
 */
export function goldbachPartition(
  n: number
): { p1: number; p2: number } | null {
  if (n <= 2 || n % 2 !== 0) return null;

  for (let p = 2; p <= n / 2; p++) {
    if (isPrime(p) && isPrime(n - p)) {
      return { p1: p, p2: n - p };
    }
  }
  return null;
}
