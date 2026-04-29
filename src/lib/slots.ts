const DAY_ENUM = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const
const BRAZIL_TIME_ZONE = "America/Sao_Paulo"
const BRAZIL_OFFSET = "-03:00"

export type Slot = { datetime: string; label: string }
export type SlotTime = { startAt: string; endAt: string; label: string }

type Availability = { dayOfWeek: string; startTime: string; endTime: string }
type TimeRange = { startAt: Date; endAt: Date }

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

function buildBrazilDate(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00${BRAZIL_OFFSET}`)
}

function getBrazilTodayDateStr() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  if (!year || !month || !day) {
    throw new Error("Failed to resolve Brazil date")
  }

  return `${year}-${month}-${day}`
}

function addDaysToDateStr(dateStr: string, days: number) {
  const date = buildBrazilDate(dateStr, "12:00")
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function overlaps(slotStart: Date, slotEnd: Date, ranges: TimeRange[]): boolean {
  return ranges.some((r) => slotStart < r.endAt && slotEnd > r.startAt)
}

function formatSlotLabel(date: Date) {
  return (
    date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone: BRAZIL_TIME_ZONE,
    }) +
    " às " +
    date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: BRAZIL_TIME_ZONE,
    })
  )
}

export function getAvailableSlotsForDate(
  availabilities: Availability[],
  appointments: TimeRange[],
  blockedSlots: TimeRange[],
  durationMinutes: number,
  dateStr: string,
  now = new Date()
): SlotTime[] {
  const dayOfWeek = DAY_ENUM[buildBrazilDate(dateStr, "00:00").getUTCDay()]
  const dayAvailabilities = availabilities.filter((a) => a.dayOfWeek === dayOfWeek)
  const slots: SlotTime[] = []

  for (const availability of dayAvailabilities) {
    const startMinutes = parseTimeToMinutes(availability.startTime)
    const endMinutes = parseTimeToMinutes(availability.endTime)
    let current = startMinutes

    while (current + durationMinutes <= endMinutes) {
      const slotStart = buildBrazilDate(dateStr, minutesToTime(current))
      const slotEnd = buildBrazilDate(dateStr, minutesToTime(current + durationMinutes))

      if (slotStart > now && !overlaps(slotStart, slotEnd, appointments) && !overlaps(slotStart, slotEnd, blockedSlots)) {
        slots.push({
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
          label: minutesToTime(current),
        })
      }

      current += durationMinutes
    }
  }

  return slots
}

export function getAvailableSlots(
  availabilities: Availability[],
  appointments: TimeRange[],
  blockedSlots: TimeRange[],
  durationMinutes: number,
  daysAhead: number,
  targetDate?: string
): Slot[] {
  const now = new Date()
  const bufferMs = 60 * 60 * 1000

  const dateStrings = targetDate
    ? [targetDate]
    : Array.from({ length: daysAhead }, (_, index) => addDaysToDateStr(getBrazilTodayDateStr(), index + 1))

  const slots = dateStrings.flatMap((dateStr) =>
    getAvailableSlotsForDate(
      availabilities,
      appointments,
      blockedSlots,
      durationMinutes,
      dateStr,
      new Date(now.getTime() + bufferMs)
    ).map((slot) => ({
      datetime: slot.startAt,
      label: formatSlotLabel(new Date(slot.startAt)),
    }))
  )

  return slots
}
