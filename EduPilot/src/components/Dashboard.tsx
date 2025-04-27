import Heatmap from "./Heatmap";
import MyLineChart from "./LineChart";
import useAuth from "../context/authContext";


export default function Dashboard(){
    const {token} = useAuth()
    return(
        <>
            <Heatmap token={token}/>
            <MyLineChart token={token} />
        </> 
    );
}