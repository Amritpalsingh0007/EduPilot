import { useEffect, useRef, useState } from "react"

function Topic(){
    const demodata = [
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "1",
            progress: 100,
            title: "Topic 1"
        },
        {
            lessonID: "2",
            progress: 100,
            title: "Topic 2"
        },
        {
            lessonID: "3",
            progress: 0,
            title: "Topic 3"
        },
        {
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },{
            lessonID: "4",
            progress: 0,
            title: "Topic 4"
        },
    ]
    const [lesson, setlesson] = useState<{progress: number, title: string, lessonID : string}[] | []>([]);
    const currentTpoicRef = useRef<HTMLParagraphElement>(null)

    useEffect(()=>{
    //    const fetchlesson = async ()=>{setlesson(await getlesson(token))};
    //    fetchlesson()
        setlesson(demodata)
    }, [])

    useEffect(()=>{
        currentTpoicRef.current?.scrollIntoView({behavior:"smooth"})
    }, [lesson])

    function loadlesson(lessonID : string){
        console.log("loading lesson : ", lessonID)
    }

    return (
        <div className="lesson w-full h-full bg-teal-300 min-h-[100vh]">
            <div className="bg-blue-400 font-bold text-2xl text-white mb-4 p-2">Topic</div>
            {
                lesson.map((value, index) => {
                    let color;
                    let isCurrent = false;
                    if(value.progress !== 100 && index !== 0){
                        if(lesson[index - 1].progress === 100){
                            color = "blue";
                            isCurrent = true;
                        }else{
                            color = 'gray';
                        }
                    } else{
                        color = "green";
                    }
                    return <div className="w-full text-center flex items-center flex-col py-4">
                        {isCurrent ? <p ref={currentTpoicRef}></p> : <p></p>}
                        <button className="rounded-lg border p-3 font-bold text-white" style={{background:color}} onClick={()=>{loadlesson(value.lessonID)}} disabled={color==='gray'}>{value.title}</button>
                    </div>
                })
            }
        </div>
    )
}


export default Topic;