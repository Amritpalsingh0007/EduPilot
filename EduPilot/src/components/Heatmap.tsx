import React, { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, format } from "date-fns";

const Heatmap = ({token}:{token:string}) => {
  const today = new Date();
  const [values, setValues] = useState([]);

  // Generate static data only once
  useEffect(() => {
    const generatedValues = Array.from({ length: 365 }, (_, i) => ({
      date: format(subDays(today, i), "yyyy-MM-dd"),
      count: Math.floor(Math.random() * 11), // Random count (0–10)
    }));
    setValues(generatedValues);
  }, []);

  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: "" });

  return (
    <div className="relative flex flex-col items-center justify-center w-[80vw] overflow-x-auto">
      <h2 className="text-xl font-bold mb-2">Daily Lesson Calender</h2>
      <div className="min-w-[700px]">
          <CalendarHeatmap
            startDate={subDays(today, 365)}
            endDate={today}
            values={values}
            classForValue={(value) => {
              if (!value || value.count === 0) return "color-empty";
              return `color-scale-${Math.min(value.count, 10)}`;
            }}
            gutterSize={3}
            showWeekdayLabels={true}
            onMouseOver={(event, value) => {
              if (!value) return;
              setTooltip({
                show: true,
                x: event.clientX,
                y: event.clientY,
                text: `${value.date}: ${value.count} contributions`,
              });
            }}
            onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
          />
      </div>
      

      {tooltip.show && (
        <div
          className="absolute bg-black text-white text-sm px-2 py-1 rounded"
          style={{
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            pointerEvents: "none",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default Heatmap;
