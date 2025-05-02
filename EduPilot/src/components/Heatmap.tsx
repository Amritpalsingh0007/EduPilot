import { useState, useEffect } from "react";
import CalendarHeatmap, { ReactCalendarHeatmapValue } from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays } from "date-fns";

const Heatmap = ({ data }: { data: { date: string; count: number }[] }) => {
  const today = new Date();
  const [values, setValues] = useState<{date: string, count: number}[]>([]);

  useEffect(() => {
    setValues(data);
    console.log(data);
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
              if (!value || value.count === undefined || value.count === 0) return "color-empty";
              return `color-scale-${Math.min(value.count, 10)}`;
            }}
            gutterSize={3}
            showWeekdayLabels={true}
            onMouseOver={(event: React.MouseEvent<SVGRectElement, MouseEvent>, value: ReactCalendarHeatmapValue<string> | undefined) => {
              if (!value) return;
              setTooltip({
                show: true,
                x: event.clientX,
                y: event.clientY,
                text: `${value.date}: ${value.count ?? 0} quiz${value.count <= 1 ? "" : "es"}`,
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
