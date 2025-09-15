import { useMemo, useState, useEffect, useRef } from "react";

const getIsoWeekStart = (date) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
const addDays = (date, n) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
};
const pad2 = (n) => String(n).padStart(2, "0");

const mergeTimeRanges = (ranges) => {
  if (!ranges?.length) return [];
  const sorted = ranges
    .map((r) => ({ start: new Date(r.start), end: new Date(r.end) }))
    .sort((a, b) => a.start - b.start);

  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    // chevauchement OU contigu (cur.start <= last.end)
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
    } else {
      merged.push(cur);
    }
  }
  return merged;
};
const addAndMergeTimeRange = (ranges, newRange) =>
  mergeTimeRanges([...(ranges || []), newRange]);

export default function WeekCalendar({
  anchorDate,
  startHour = 6,
  endHour = 21,
  selectable = true,
  // callback vers le parent : reçoit un tableau de DTO {startTime,endTime,isActive}
  onWeekSlotsChange,
}) {
  if (!anchorDate) {
    return (
      <div className="week-calendar">
        <div className="week-calendar__empty">Sélectionnez un jour dans le calendrier.</div>
      </div>
    );
  }

  // Semainier
  const weekStartDate = useMemo(() => getIsoWeekStart(anchorDate), [anchorDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)),
    [weekStartDate]
  );

  // Grille demi-heure : [HH:00, HH:30, ...]
  const gridHalfHourSlots = useMemo(() => {
    const list = [];
    for (let h = startHour; h <= endHour; h++) {
      list.push({ kind: "full", hour: h }); // HH:00
      if (h < endHour) list.push({ kind: "half", hour: h }); // HH:30
    }
    return list;
  }, [startHour, endHour]);

  // Plages par jour (plusieurs possibles) — reset quand la semaine change
  const [dayTimeRanges, setDayTimeRanges] = useState(() =>
    Array.from({ length: 7 }, () => [])
  );
  useEffect(() => {
    setDayTimeRanges(Array.from({ length: 7 }, () => []));
  }, [weekStartDate]);

  // Drag-to-select (snap 00/30)
  const [dragSelection, setDragSelection] = useState(null); // { dayIndex, startSlotIndex, hoverSlotIndex }

  const getDateTimeForSlot = (dayIndex, slotIndex) => {
    const base = weekDays[dayIndex];
    const slot = gridHalfHourSlots[slotIndex];
    const H = slot.hour;
    const M = slot.kind === "half" ? 30 : 0;
    const d = new Date(base);
    d.setHours(H, M, 0, 0);
    return d;
  };

  const isDraggingSlot = (dayIndex, slotIndex) => {
    if (!dragSelection || dayIndex !== dragSelection.dayIndex) return false;
    const a = Math.min(
      dragSelection.startSlotIndex,
      dragSelection.hoverSlotIndex ?? dragSelection.startSlotIndex
    );
    const b = Math.max(
      dragSelection.startSlotIndex,
      dragSelection.hoverSlotIndex ?? dragSelection.startSlotIndex
    );
    return slotIndex >= a && slotIndex <= b;
  };

  const isSavedSlot = (dayIndex, slotIndex) => {
    const t = getDateTimeForSlot(dayIndex, slotIndex).getTime();
    const ranges = dayTimeRanges[dayIndex] || [];
    // un slot appartient à une plage ssi t ∈ [start, end)
    return ranges.some(({ start, end }) => t >= start.getTime() && t < end.getTime());
  };

  const handleMouseDown = (dayIndex, slotIndex, e) => {
    if (!selectable) return;
    e.preventDefault();
    setDragSelection({
      dayIndex,
      startSlotIndex: slotIndex,
      hoverSlotIndex: slotIndex,
    });
  };

  const handleMouseEnter = (dayIndex, slotIndex) => {
    if (!selectable || !dragSelection) return;
    if (dayIndex !== dragSelection.dayIndex) return;
    setDragSelection((prev) => ({ ...prev, hoverSlotIndex: slotIndex }));
  };

  const handleMouseUp = (dayIndex) => {
    if (!selectable || !dragSelection) return;
    if (dayIndex !== dragSelection.dayIndex) {
      setDragSelection(null);
      return;
    }

    const a = Math.min(
      dragSelection.startSlotIndex,
      dragSelection.hoverSlotIndex ?? dragSelection.startSlotIndex
    );
    const b = Math.max(
      dragSelection.startSlotIndex,
      dragSelection.hoverSlotIndex ?? dragSelection.startSlotIndex
    );

    const start = getDateTimeForSlot(dragSelection.dayIndex, a);
    const end = new Date(
      getDateTimeForSlot(dragSelection.dayIndex, b).getTime() + 30 * 60 * 1000
    );

    setDayTimeRanges((prev) => {
      const next = prev.slice();
      next[dayIndex] = addAndMergeTimeRange(prev[dayIndex], { start, end });
      return next;
    });

    setDragSelection(null);
  };

  const changeCallbackRef = useRef(onWeekSlotsChange);
  useEffect(() => {
    changeCallbackRef.current = onWeekSlotsChange;
  }, [onWeekSlotsChange]);

  // Notifie le parent avec DTO (1 plage = 1 créneau)
  useEffect(() => {
    const dtos = [];
    for (let i = 0; i < 7; i++) {
      const ranges = (dayTimeRanges[i] || [])
        .slice()
        .sort((r1, r2) => r1.start - r2.start);
      for (const r of ranges) {
        dtos.push({
          startTime: r.start.toISOString(),
          endTime: r.end.toISOString(),
          isActive: true,
        });
      }
    }
    changeCallbackRef.current?.(dtos);
  }, [dayTimeRanges]);

  const formatDayShort = (d) =>
    d
      .toLocaleDateString("fr-FR", { weekday: "short" })
      .replace(".", "")
      .replace(/^\w/, (c) => c.toUpperCase());

  // Couleurs de feedback
  const COLOR_DRAG = "rgba(59, 130, 246, 0.35)"; // bleu sélection (drag)
  const COLOR_SAVED = "rgba(59, 130, 246, 0.18)"; // bleu doux (plages sauvegardées)

  return (
    <div className={`week-calendar${selectable ? " selectable" : ""}`}>
      <div className="week-calendar__header">
        <div className="range">
          {formatDayShort(weekDays[0])} {weekDays[0].getDate()} —{" "}
          {formatDayShort(weekDays[6])} {weekDays[6].getDate()}
        </div>
      </div>

      <div className="week-calendar__days">
        <div className="day-head empty" />
        {weekDays.map((d, i) => (
          <div key={i} className="day-head">
            <div className="day-name">{formatDayShort(d)}</div>
            <div className="day-date">{d.getDate()}</div>
          </div>
        ))}
        <div className="day-head empty" />
      </div>

      <div className="week-calendar__grid">
        <div className="col time-left">
          {gridHalfHourSlots.map((s, i) => (
            <div key={i} className={`slot ${s.kind === "half" ? "slot--half" : "slot--full"}`}>
              {s.kind === "full" ? (
                <span className="label-left">{String(s.hour).padStart(2, "0")}:00</span>
              ) : null}
            </div>
          ))}
        </div>

        {weekDays.map((d, dayIndex) => (
          <div
            key={dayIndex}
            className="col day-col"
            aria-label={d.toDateString()}
            onMouseUp={() => handleMouseUp(dayIndex)}
          >
            {gridHalfHourSlots.map((s, slotIndex) => {
              const dragging = isDraggingSlot(dayIndex, slotIndex);
              const saved = isSavedSlot(dayIndex, slotIndex);
              const classNames = [
                "slot",
                s.kind === "half" ? "slot--half" : "slot--full",
                dragging ? "slot--dragging" : "",
                saved ? "slot--saved" : "",
              ]
                .join(" ")
                .trim();

              return (
                <div
                  key={slotIndex}
                  role={selectable ? "button" : undefined}
                  className={classNames}
                  data-time={`${String(s.hour).padStart(2, "0")}:${s.kind === "half" ? "30" : "00"}`}
                  onMouseDown={(e) => handleMouseDown(dayIndex, slotIndex, e)}
                  onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex)}
                  style={{
                    backgroundColor: dragging
                      ? COLOR_DRAG
                      : saved
                      ? COLOR_SAVED
                      : undefined,
                    transition: dragging ? "none" : "background-color 80ms linear",
                  }}
                />
              );
            })}
          </div>
        ))}

        <div className="col time-right">
          {gridHalfHourSlots.map((s, i) => (
            <div key={i} className={`slot ${s.kind === "half" ? "slot--half" : "slot--full"}`}>
              {s.kind === "half" ? (
                <span className="label-right">{String(s.hour).padStart(2, "0")}:30</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}