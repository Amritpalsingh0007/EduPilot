import ReactMarkdown from 'react-markdown'

function ChatView(
  { messages, 
    loading}:{
      messages:{ text: string; sender: "user" | "ai" }[], 
      loading:boolean}) {
  

  return (
    <div className="flex flex-col h-auto">
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg w-fit  ${
              msg.sender === "user" ? "ml-auto bg-blue-500 max-w-xs text-white" : "bg-gray-200"
            }`}
          >
            {
            
              msg.sender === "user" ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>
            }
          </div>
        ))}

        {loading && <div className="text-gray-500 italic">AI is typing...</div>}
      </div>

      
    </div>
  );
}

export default ChatView;
