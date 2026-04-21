const DAY_ENUM = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

export type Slot = { datetime: string; label: string }

type Availability = { dayOfWeek: string; startTime: string; endTime: string }
type TimeRange = { startAt: Date; endAt: Date }

function parseTime(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

function overlaps(slotStart: Date, slotEnd: Date, ranges: TimeRange[]): boolean {
  return ranges.some((r) => slotStart < r.endAt && slotEnd > r.startAt)
}

export function getAvailableSlots(
  availabilities: Availability[],
  appointments: TimeRange[],
  blockedSlots: TimeRange[],
  durationMinutes: number,
  daysAhead: number
): Slot[] {
  const slots: Slot[] = []
  const now = new Date()
  const bufferMs = 60 * 60 * 1000 // 1h buffer — não mostrar slots na próxima 1h

  for (let d = 1; d <= daysAhead; d++) {
    const day = new Date(now)
    day.setDate(day.getDate() + d)
    day.setHours(0, 0, 0, 0)

    const dowEnum = DAY_ENUM[day.getDay()]
    const dayAvailabilities = availabilities.filter((a) => a.dayOfWeek === dowEnum)

    for (const av of dayAvailabilities) {
      const windowEnd = parseTime(day, av.endTime)
      let cursor = parseTime(day, av.startTime)

      while (true) {
        const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000)
        if (slotEnd > windowEnd) break

        const tooSoon = cursor.getTime() - now.getTime() < bufferMs
        if (!tooSoon && !overlaps(cursor, slotEnd, appointments) && !overlaps(cursor, slotEnd, blockedSlots)) {
          slots.push({
            datetime: cursor.toISOString(),
            label: cursor.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            }) + " às " + cursor.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          })
        }

        cursor = new Date(cursor.getTime() + durationMinutes * 60 * 1000)
      }
    }
  }

  return slots
}