import { useEffect, useState } from "react";
import Heatmap from "./Heatmap";
import MyLineChart from "./LineChart";
import { getActivity } from "../service/AIServices";
import useAuth from "../context/authContext";

export default function Dashboard() {
    const { token } = useAuth();
    const [data, setData] = useState<{"date": string, "count": number}[] | null>(null);

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            const activityData = await getActivity(token);
            setData(activityData);
        };
        fetchData();
    }, [token]);

    if (!data) return <div>Loading...</div>; // You can customize this

    return (
        <>
            <Heatmap data={data} />
            <MyLineChart data={data} />
        </>
    );
}
