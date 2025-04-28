import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from "../context/authContext";
import { getLessons, createLesson } from '../service/AIServices';

export default function Roadmap() {
  const {token} = useAuth();
  // Sample roadmap data - replace with your actual data
  const [roadmap, setRoadmap] = useState<{id:string, title:string, isCompleted:boolean}[]>([]);
  
  const[generating, setGenerating] = useState(false);
  
  const {fileId} = useParams<{ fileId: string }>();
  // Function to handle loading a topic - replace with your implementation

  useEffect(()=>{
    console.log(`File ID from URL: ${fileId}`);
    if (!token) return;
    async function fetchLessons() {
      try {
        const lessons = await getLessons(token, fileId!);
        setRoadmap(lessons);
      } catch (error) {
        console.error("Failed to fetch user files:", error);
      }
    }

    fetchLessons();
  }, []);

  const loadTopic = (id : string) => {
    console.log(`Loading topic with ID: ${id}`);
    navigate(`/lesson/${fileId}/${id}`);
  };
  const navigate = useNavigate();

  const handleCreateLesson = () => {
    console.log("Creating new lesson");
    const newLesson = async () => {
      try {
        setGenerating(true);
        const response = await createLesson(token, fileId!);
        if(!response){
          setGenerating(false);
          return;
        }
        if (response.status == 1) {
          console.info("No more lessons to generate!");
          setGenerating(false);
          return;
        }
        setGenerating(false);
        navigate(`/lesson/${response.lesson_id}`);
      } catch (error) {
        console.error("Failed to fetch user files:", error);
        setGenerating(false);
      }
    }
    newLesson();
    
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-purple-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center max-w-md">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-purple-600 animate-spin"></div>
              <div className="w-24 h-24 rounded-full border-r-4 border-l-4 border-indigo-500 animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">Creating Lesson</h3>
            <p className="text-gray-600 text-center mb-4">Our AI is generating new content for your roadmap...</p>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-2xl text-white mb-8 p-4 rounded-lg shadow-lg">
        Roadmap
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmap.map((item, index) => {
          // Determine card style based on completion status
          let cardBg, statusBg, statusText, buttonColor, statusIcon;
          let isCurrent = false;
          
          if (!item.isCompleted ) {
            if(index === 0) {
              cardBg = "bg-white";
                statusBg = "bg-indigo-100";
                statusText = "Current";
                buttonColor = "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600";
                statusIcon = (
                  <svg className="w-5 h-5 mr-1 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                );
                isCurrent = true;
            }else{

              if (roadmap[index - 1].isCompleted) {
                cardBg = "bg-white";
                statusBg = "bg-indigo-100";
                statusText = "Current";
                buttonColor = "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600";
                statusIcon = (
                  <svg className="w-5 h-5 mr-1 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                );
                isCurrent = true;
              } else {
                cardBg = 'bg-white';
                statusBg = 'bg-gray-100';
                statusText = "Locked";
                buttonColor = 'bg-gray-200 text-gray-500 cursor-not-allowed';
                statusIcon = (
                  <svg className="w-5 h-5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                );
              }

            }
           
          } else {
            cardBg = "bg-white";
            statusBg = "bg-green-100";
            statusText = "Completed";
            buttonColor = "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600";
            statusIcon = (
              <svg className="w-5 h-5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            );
          }
          
          return (
            <div 
              key={item.id} 
              className={`${cardBg} rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${isCurrent ? 'ring-2 ring-indigo-400' : ''}`}
            >
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-4">Lesson {item.title}</h3>
                
                <div className="flex items-center justify-between mt-4">
                  <div className={`${statusBg} text-sm px-3 py-1 rounded-full flex items-center`}>
                    {statusIcon}
                    <span className={`${isCurrent ? 'text-indigo-600' : item.isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <button 
                    className={`px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 ${buttonColor}`}
                    onClick={() => loadTopic(item.id)}
                    disabled={statusText === "Locked"}
                  >
                    {item.isCompleted ? "Review" : isCurrent ? "Start" : "Locked"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Create Lesson Button Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 border-2 border-dashed border-purple-300 flex flex-col items-center justify-center p-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full p-3 mb-4 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          
          <h3 className="font-bold text-xl text-gray-800 mb-2 text-center">Create New Lesson</h3>
          <p className="text-gray-500 text-sm mb-4 text-center">Add custom content to your roadmap</p>
          
          <button 
            onClick={handleCreateLesson}
            disabled={generating}
            className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg flex items-center ${generating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                </svg>
                Create Lesson
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}