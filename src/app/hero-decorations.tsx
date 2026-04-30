import { Stethoscope } from "lucide-react"

const ITEMS = [
  { x: "3%",  y: "8%",  size: 76, rot: -22, opacity: 0.10, dur: "7s",    delay: "0s"    },
  { x: "86%", y: "6%",  size: 54, rot:  28, opacity: 0.09, dur: "9s",    delay: "1.4s"  },
  { x: "1%",  y: "54%", size: 42, rot: -50, opacity: 0.08, dur: "6.5s",  delay: "2.8s"  },
  { x: "88%", y: "58%", size: 66, rot:  16, opacity: 0.07, dur: "8.2s",  delay: "0.6s"  },
  { x: "13%", y: "84%", size: 34, rot:  42, opacity: 0.10, dur: "7.5s",  delay: "2s"    },
  { x: "75%", y: "78%", size: 50, rot: -14, opacity: 0.08, dur: "8.5s",  delay: "0.9s"  },
  { x: "43%", y: "2%",  size: 46, rot:   6, opacity: 0.05, dur: "10.5s", delay: "2.3s"  },
  { x: "58%", y: "86%", size: 38, rot: -32, opacity: 0.07, dur: "7.8s",  delay: "3.5s"  },
]

export function HeroDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {ITEMS.map((item, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: item.x, top: item.y, transform: `rotate(${item.rot}deg)` }}
        >
          <div style={{ animation: `hero-float ${item.dur} ease-in-out ${item.delay} infinite` }}>
            <Stethoscope
              size={item.size}
              className="text-blue-400 dark:text-cyan-500"
              style={{ opacity: item.opacity }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}