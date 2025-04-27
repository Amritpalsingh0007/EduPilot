import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const MyLineChart = () => {
    const [data, setData] = useState<{ date: string; value: number; }[]>([]);
    const today = new Date();
    // Generate static data only once
      useEffect(() => {
        const generatedValues = Array.from({ length: 12 }, (_, i) => ({
          date: format(subDays(today, i), "yyyy-MM-dd"),
          value: Math.floor(Math.random() * 11), 
        }));
        setData(generatedValues);
        console.log(generatedValues)
      }, []);
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ResponsiveContainer width="80%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MyLineChart;
