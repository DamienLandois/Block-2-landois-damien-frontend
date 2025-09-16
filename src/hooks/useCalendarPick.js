import { useEffect } from "react";

const monthIndex = (label) => {
  const map = {
    Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
    Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11,
  };
  return map[label] ?? null;
};

export default function useCalendarPick(ref, setDate) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onClick = (e) => {
      const li = e.target.closest(".jours li");
      if (!li || !root.contains(li)) return;

      const ul = root.querySelector(".jours");
      const lis = Array.from(ul.querySelectorAll("li"));
      const idx = lis.indexOf(li);
      const first = lis.findIndex((el) => !el.classList.contains("inactive"));
      const last = lis.length - 1 - lis.slice().reverse().findIndex((el) => !el.classList.contains("inactive"));

      const header =
        root.querySelector(".wrapper-header .date") ||
        root.querySelector("header .date") ||
        root.querySelector(".date");

      const [label, yearStr] = (header?.textContent || "").trim().split(/\s+/);
      const month = monthIndex(label);
      const year = parseInt(yearStr, 10);
      if (month == null || !Number.isFinite(year)) return;

      let offset = 0;
      if (idx < first) offset = -1;
      else if (idx > last) offset = 1;

      const day = parseInt(li.textContent, 10);
      if (!Number.isFinite(day)) return;

      setDate(new Date(year, month + offset, day));
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [ref, setDate]);
}
