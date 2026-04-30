import { Activity, Bot, CalendarCheck, Stethoscope } from "lucide-react"

const ITEMS = [
  { icon: Stethoscope, x: "3%",  y: "10%", size: 76, rot: -22, opacity: 0.12, dur: "7s",    delay: "0s"    },
  { icon: Bot,         x: "86%", y: "8%",  size: 52, rot:  18, opacity: 0.10, dur: "9s",    delay: "1.4s"  },
  { icon: Activity,    x: "1%",  y: "58%", size: 42, rot: -16, opacity: 0.10, dur: "6.5s",  delay: "2.8s"  },
  { icon: Stethoscope, x: "91%", y: "62%", size: 66, rot:  16, opacity: 0.08, dur: "8.2s",  delay: "0.6s"  },
  { icon: CalendarCheck, x: "13%", y: "84%", size: 36, rot:  10, opacity: 0.12, dur: "7.5s", delay: "2s" },
  { icon: Bot,         x: "73%", y: "80%", size: 48, rot: -14, opacity: 0.09, dur: "8.5s",  delay: "0.9s"  },
  { icon: Activity,    x: "43%", y: "2%",  size: 46, rot:   6, opacity: 0.07, dur: "10.5s", delay: "2.3s"  },
  { icon: CalendarCheck, x: "58%", y: "88%", size: 38, rot: -12, opacity: 0.08, dur: "7.8s", delay: "3.5s" },
]

export function HeroDecorations() {
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
