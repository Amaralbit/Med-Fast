import { Activity, Bot, CalendarCheck, HeartPulse, Stethoscope } from "lucide-react"

type DecorationItem = {
  icon: typeof Activity
  x: string
  y: string
  size: number
  rot: number
  opacity: number
  dur: string
  delay: string
}

const DECORATIONS: Record<"auth" | "legal" | "profile", DecorationItem[]> = {
  auth: [
    { icon: Stethoscope, x: "6%", y: "12%", size: 62, rot: -20, opacity: 0.1, dur: "7.4s", delay: "0s" },
    { icon: HeartPulse, x: "82%", y: "15%", size: 42, rot: 12, opacity: 0.08, dur: "8.6s", delay: "1.2s" },
    { icon: CalendarCheck, x: "10%", y: "78%", size: 38, rot: 9, opacity: 0.1, dur: "7.8s", delay: "2s" },
    { icon: Bot, x: "88%", y: "72%", size: 50, rot: -14, opacity: 0.08, dur: "9s", delay: "0.7s" },
  ],
  legal: [
    { icon: Stethoscope, x: "3%", y: "14%", size: 58, rot: -20, opacity: 0.07, dur: "8.2s", delay: "0s" },
    { icon: Activity, x: "87%", y: "10%", size: 44, rot: 10, opacity: 0.06, dur: "9.2s", delay: "1.3s" },
    { icon: CalendarCheck, x: "6%", y: "54%", size: 36, rot: 12, opacity: 0.06, dur: "7.6s", delay: "2.1s" },
    { icon: Bot, x: "91%", y: "72%", size: 48, rot: -12, opacity: 0.06, dur: "8.8s", delay: "0.8s" },
  ],
  profile: [
    { icon: Stethoscope, x: "4%", y: "9%", size: 64, rot: -18, opacity: 0.1, dur: "7.2s", delay: "0s" },
    { icon: CalendarCheck, x: "86%", y: "12%", size: 48, rot: 14, opacity: 0.09, dur: "8.4s", delay: "0.9s" },
    { icon: HeartPulse, x: "7%", y: "64%", size: 40, rot: -12, opacity: 0.07, dur: "7.8s", delay: "1.8s" },
    { icon: Bot, x: "90%", y: "67%", size: 50, rot: 16, opacity: 0.07, dur: "9.4s", delay: "2.4s" },
  ],
}

export function MedicalDecorations({ variant }: { variant: keyof typeof DECORATIONS }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {DECORATIONS[variant].map(({ icon: Icon, ...item }, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: item.x, top: item.y, transform: `rotate(${item.rot}deg)` }}
        >
          <div style={{ animation: `hero-float ${item.dur} ease-in-out ${item.delay} infinite` }}>
            <Icon
              size={item.size}
              className="text-blue-500 dark:text-cyan-400"
              style={{ opacity: item.opacity }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
