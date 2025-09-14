import React, { useMemo, useState } from "react";

export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());

  const currYear = viewDate.getFullYear();
  const currMonth = viewDate.getMonth();

  const mois = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const { label, days } = useMemo(() => {
    const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay();
    const lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate();
    const lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay();
    const lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate();

    const li = [];

    for (let i = firstDayOfMonth; i > 0; i--) {
      li.push({ key: `prev-${i}`, label: lastDateOfLastMonth - i + 1, className: "inactive" });
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday =
        i === today.getDate() &&
        currMonth === today.getMonth() &&
        currYear === today.getFullYear();
      li.push({ key: `curr-${i}`, label: i, className: isToday ? "active" : undefined });
    }

    for (let i = lastDayOfMonth; i < 6; i++) {
      li.push({ key: `next-${i}`, label: i - lastDayOfMonth + 1, className: "inactive" });
    }

    return { label: `${mois[currMonth]} ${currYear}`, days: li };
  }, [currMonth, currYear, today]);

  const goPrev = () => {
    const prev = new Date(currYear, currMonth - 1, 1);
    setViewDate(prev);
  };

  const goNext = () => {
    const next = new Date(currYear, currMonth + 1, 1);
    setViewDate(next);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div className="wrapper">
        <div className="wrapper-header">
          <p className="date">{label}</p>
          <div className="icons">
            <span id="prev" className="material-symbols-rounded" onClick={goPrev} role="button" aria-label="Mois précédent">chevron_left</span>
            <span id="next" className="material-symbols-rounded" onClick={goNext} role="button" aria-label="Mois suivant">chevron_right</span>
          </div>
        </div>

        <div className="calendrier">
          <ul className="semaines">
            <li>Lun</li>
            <li>Mar</li>
            <li>Mer</li>
            <li>Jeu</li>
            <li>Ven</li>
            <li>Sam</li>
            <li>Dim</li>
          </ul>
          <ul className="jours">
            {days.map((d) => (
              <li key={d.key} className={d.className}>{d.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
