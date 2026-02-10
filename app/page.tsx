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
  Globe,
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
  {
    href: "/universe",
    icon: Globe,
    title: "3D Universe",
    description: "Explore primes in an interactive 3D Ulam spiral with orbit controls",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
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

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="group h-full transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="space-y-3">
                <div
                  className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-xl border bg-gradient-to-br from-card to-primary/5">
        <h2 className="text-lg font-semibold mb-5 text-muted-foreground">Quick Facts About Primes</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-4xl font-bold text-primary font-mono">2</p>
            <p className="text-sm text-muted-foreground">
              The only even prime number
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold text-primary font-mono">25</p>
            <p className="text-sm text-muted-foreground">
              Primes below 100
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold text-primary">Infinite</p>
            <p className="text-sm text-muted-foreground">
              Total count of prime numbers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
