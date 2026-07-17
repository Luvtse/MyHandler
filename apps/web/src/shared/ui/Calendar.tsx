import * as React from "react"
import { cn } from "@/lib/utils"

type CalendarProps = {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  mode?: "single"
  disabled?: any
}

function toInputValue(d?: Date) {
  if (!d) return ""
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className }) => {
  return (
    <input
      type="date"
      value={toInputValue(selected)}
      onChange={(e) => {
        const val = e.target.value
        const date = val ? new Date(val) : undefined
        onSelect?.(date)
      }}
      className={cn("rounded-md border p-2 text-sm", className)}
    />
  )
}
