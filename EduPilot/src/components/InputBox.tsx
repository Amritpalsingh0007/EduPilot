import sendSVG from "../assets/upload_white.svg";
import loadingSVG from "../assets/loading_svg.svg";


function InputBox({ onSend, input, setInput, loading }: { onSend: (message: string) => void; input:string; setInput:Function, loading:boolean }) {
  
  function submitPrompt() {
    onSend(input);
    setInput("");
  }
  return (
    <div className="w-full max-w-2xl mx-auto my-4 pt-4 bg-white shadow-lg rounded-lg flex flex-col">

      <textarea
        id="prompt"
        value={input}
        placeholder="Type your message..."
        onChange={(e)=>{setInput(e.target.value)}}
        className="w-full h-24 p-3 border border-none rounded-md resize-none focus:outline-none "
      ></textarea>

      <div className="flex justify-end mt-2">
        <button
          onClick={submitPrompt}
          className="flex items-center gap-2  px-4 py-2 rounded-lg transition duration-200"
          disabled ={loading}
        >
          {
            loading ? <img src={loadingSVG} alt="Send" className="w-8 h-8 bg-black rounded-lg" /> : <img src={sendSVG} alt="Send" className="w-7 h-7" />
          }
        </button>
      </div>
    </div>
  );
}
export default InputBox;
