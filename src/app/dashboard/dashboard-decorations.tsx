import { Activity, Bot, CalendarCheck, Stethoscope } from "lucide-react"

const ITEMS = [
  { icon: Stethoscope, x: "1%",  y: "8%",  size: 64, rot: -20, opacity: 0.07, dur: "7s",   delay: "0s"   },
  { icon: CalendarCheck, x: "93%", y: "12%", size: 48, rot:  15, opacity: 0.06, dur: "8.5s", delay: "0.8s" },
  { icon: Activity,    x: "96%", y: "55%", size: 34, rot:  -8, opacity: 0.05, dur: "9s",   delay: "2.2s" },
  { icon: Stethoscope, x: "0%",  y: "68%", size: 42, rot:  10, opacity: 0.05, dur: "7.8s", delay: "1.6s" },
  { icon: Bot,         x: "88%", y: "82%", size: 40, rot: -14, opacity: 0.05, dur: "8.8s", delay: "2.8s" },
  { icon: CalendarCheck, x: "24%", y: "86%", size: 32, rot: -10, opacity: 0.05, dur: "7.4s", delay: "0.5s" },
]

export function DashboardDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {ITEMS.map(({ icon: Icon, ...item }, i) => (
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
