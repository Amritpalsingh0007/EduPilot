import { useEffect, useRef, useState } from "react";
import ChatView from "./ChatView";
import InputBox from "./InputBox";
import {getResponse} from "../service/AIServices";
import useAuth from "../context/authContext"

function Home() {
    const {token} = useAuth()
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function sendMessage() {
        if (!input.trim()) return;
        let temp = input
        setMessages((prev) => [...prev, { text: input, sender: "user" }]);
        setInput("");
        setLoading(true);
    
        let res = await getResponse(token,temp);
        setMessages((prev)=>[...prev, {text: res, sender: "ai"}])
        setLoading(false);
      }
      
    return (
        <>

            <div className="ChatBody bg-white w-full h-full flex flex-col items-center justify-center ">
                <div className="flex flex-col w-full h-full min-h-[94vh] ">
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300">
                        <ChatView messages={messages} loading={loading} />
                        <div ref={chatEndRef}></div>
                    </div>

                    <div className="p-2">
                        <InputBox
                        onSend={sendMessage}
                        input={input}
                        setInput={setInput}
                        loading={loading}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;