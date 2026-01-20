import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Circle,
  TreeDeciduous,
  Footprints,
  Shield,
  KeyRound,
  Music,
  Palette,
} from "lucide-react";

const features = [
  {
    href: "/spiral",
    icon: Circle,
    title: "Prime Spiral",
    description: "Explore Ulam and Sacks spirals revealing hidden patterns in prime distribution",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    href: "/factorization",
    icon: TreeDeciduous,
    title: "Factor Tree",
    description: "Visualize prime factorization as animated tree structures",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    href: "/hunt",
    icon: Footprints,
    title: "Prime Hunt",
    description: "Navigate through a grid by stepping only on prime numbers",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    href: "/defense",
    icon: Shield,
    title: "Prime Defense",
    description: "Tower defense where prime towers only damage divisible enemies",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    href: "/cryptarithm",
    icon: KeyRound,
    title: "Cryptarithm",
    description: "Solve word-math puzzles where letters represent digits",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    href: "/soundscape",
    icon: Music,
    title: "Soundscape",
    description: "Convert prime number sequences into musical compositions",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    href: "/art",
    icon: Palette,
    title: "Prime Art",
    description: "Generate beautiful art from prime number distributions",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome to Prime Playground
        </h1>
        <p className="text-muted-foreground text-lg">
          Explore the fascinating world of prime numbers through interactive
          visualizations, games, and creative tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-lg border bg-card">
        <h2 className="text-xl font-semibold mb-4">Quick Facts About Primes</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-primary">2</p>
            <p className="text-sm text-muted-foreground">
              The only even prime number
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">25</p>
            <p className="text-sm text-muted-foreground">
              Primes below 100
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">Infinite</p>
            <p className="text-sm text-muted-foreground">
              Total count of prime numbers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
