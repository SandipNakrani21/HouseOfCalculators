import {
  Activity, ArrowLeftRight, Banknote, BarChart3, Bike, BookOpen, Box,
  Briefcase, Building2, Cake, Calculator, Calendar, CalendarDays, CalendarPlus,
  CalendarRange, Car, ChartLine, ChefHat, Clock, Coins, Cog, Columns3, Cookie,
  Database, Dices, Divide, Droplets, FileText, Flame, Footprints, Fuel, Gauge,
  Globe, GraduationCap, Grid3x3, Hammer, HardHat, Hash, HeartHandshake, HeartPulse, Home, Info,
  Landmark, Lightbulb, LineChart, Lock, Mail, Megaphone, Paintbrush, Percent,
  PieChart, PiggyBank, Plug, Receipt, Ruler, Scale, Scroll, Shield, ShieldCheck,
  Shuffle, Sigma, Smartphone, Sparkles, Superscript, Table2, Tag, Target, Thermometer,
  Timer, TrendingUp, Triangle, Type, Users, Utensils, Wallet, Weight, Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { IconName, Tone, Visual } from "@/lib/visuals";

/**
 * Icon names to components. Listed explicitly rather than looked up on the
 * whole `lucide-react` namespace, so only these icons reach the bundle.
 */
const ICONS: Record<IconName, LucideIcon> = {
  Activity, ArrowLeftRight, Banknote, BarChart3, Bike, BookOpen, Box,
  Briefcase, Building2, Cake, Calculator, Calendar, CalendarDays, CalendarPlus,
  CalendarRange, Car, ChartLine, ChefHat, Clock, Coins, Cog, Columns3, Cookie,
  Database, Dices, Divide, Droplets, FileText, Flame, Footprints, Fuel, Gauge,
  Globe, GraduationCap, Grid3x3, Hammer, HardHat, Hash, HeartHandshake, HeartPulse, Home, Info,
  Landmark, Lightbulb, LineChart, Lock, Mail, Megaphone, Paintbrush, Percent,
  PieChart, PiggyBank, Plug, Receipt, Ruler, Scale, Scroll, Shield, ShieldCheck,
  Shuffle, Sigma, Smartphone, Sparkles, Superscript, Table2, Tag, Target, Thermometer,
  Timer, TrendingUp, Triangle, Type, Users, Utensils, Wallet, Weight, Wrench,
  Zap,
};

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 2,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  const Component = ICONS[name] ?? Calculator;
  return <Component aria-hidden className={className} strokeWidth={strokeWidth} />;
}

const TILE_SIZES = {
  xs: { box: "h-7 w-7", icon: "h-4 w-4" },
  sm: { box: "h-10 w-10", icon: "h-5 w-5" },
  md: { box: "h-12 w-12", icon: "h-6 w-6" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7" },
  xl: { box: "h-16 w-16", icon: "h-8 w-8" },
} as const;

/**
 * The pastel circle every card leads with. Its colours come from the tone
 * classes in src/styles/components.css, which read the tokens.
 */
export function IconTile({
  visual,
  size = "md",
  shape = "circle",
  className = "",
}: {
  visual: Visual;
  size?: keyof typeof TILE_SIZES;
  shape?: "circle" | "rounded";
  className?: string;
}) {
  const dims = TILE_SIZES[size];
  return (
    <span
      aria-hidden
      className={`tile tone-${visual.tone} ${dims.box} ${
        shape === "circle" ? "rounded-full" : "rounded-lg"
      } ${className}`}
    >
      <Icon name={visual.icon} className={dims.icon} />
    </span>
  );
}

export type { Tone };
