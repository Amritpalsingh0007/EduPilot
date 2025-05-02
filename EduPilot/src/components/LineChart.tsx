import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const MyLineChart = ({data}:{data:{"date":string, "count":number}[]}) => {
    const [Values, setValues] = useState<{ date: string; count: number; }[]>([]);

      useEffect(() => {
        setValues(data);
        console.log(data)
      }, []);
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ResponsiveContainer width="80%" height="100%">
        <LineChart data={Values}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MyLineChart;
