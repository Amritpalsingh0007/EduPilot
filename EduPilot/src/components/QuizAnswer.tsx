import { useEffect, useState } from "react";
import useAuth from "../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { submitQuiz } from "../service/AIServices";

export default function QuizAnswer() {
  const [data, setData] = useState<{ question: string; a: string; b: string; c: string; d: string; correct_answer: string; concept: string; explanation: string }[] | []>([]);
  const [index, setIndex] = useState(0);
  const [answerList, setAnswerList] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { quizData: typeof data; listOfAnswers: string[], fileID: string } | undefined;

  useEffect(() => {
    if (!state) return;
    setData(state.quizData || []);
    setAnswerList(state.listOfAnswers || []);
  }, [state]);

  useEffect(() => {
    if (!token) return;
    const {strengths, weaknesses, mcq_score}:{strengths:string[], weaknesses:string[], mcq_score:Number} = createStrengthAndWeaknesses();
    submitQuiz(token,state!.fileID, strengths, weaknesses, mcq_score);
    console.log("Successfully submitted strength and weakness data to the server.");
 }, [answerList]);

  useEffect(() => {
    setAnswer(answerList[index]);
  }, [answerList, index]);

  function createStrengthAndWeaknesses():{strengths:string[], weaknesses:string[], mcq_score:number} {
    const strengths = answerList.map((item, i) => item === data[i].correct_answer ? data[i].concept : undefined).filter((concept): concept is string => concept !== undefined);
    const weaknesses = answerList.map((item, i) => item !== data[i].correct_answer ? data[i].concept : undefined).filter((concept): concept is string => concept !== undefined);
    const mcq_score = Number(((strengths.length / data.length)).toFixed(2));
    console.log("answerList:", answerList);
    console.log("Strengths: ", strengths);
    console.log("Weaknesses: ", weaknesses);
    
    return { strengths, weaknesses, mcq_score };
  }
  
  function quizDone(fileID: string) {
  if (token === '') {
    return;}
  navigate(`/roadmap/${fileID}`)
  }

  if (!state) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">No quiz data found. Please start the quiz again.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
          <h1 className="font-bold text-2xl">Quiz Results</h1>
          <p className="text-purple-100 text-sm">Question {index + 1} of {data.length}</p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{data[index]?.question}</h2>
            
            <div className="space-y-3">
              {['a', 'b', 'c', 'd'].map((option) => {
                const isSelected = answer === option;
                const isCorrect = option === data[index]?.correct_answer;
                const isWrongSelection = isSelected && !isCorrect;
                
                let optionClass = "w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ";
                
                if (isCorrect) {
                  optionClass += "bg-green-100 border-green-500 text-green-800";
                } else if (isWrongSelection) {
                  optionClass += "bg-red-100 border-red-500 text-red-800";
                } else {
                  optionClass += "bg-gray-100 border-transparent";
                }
                
                return (
                  <div key={option} className={optionClass}>
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                        ${isCorrect ? 'bg-green-500 text-white' : 
                          isWrongSelection ? 'bg-red-500 text-white' : 
                          'bg-white border border-gray-400'}`}>
                        {isCorrect && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isWrongSelection && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{data[index]?.[option as keyof typeof data[number]]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <h3 className="font-semibold text-indigo-800 mb-2">Explanation:</h3>
            <p className="text-gray-700">{data[index]?.explanation}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button 
                  className={`px-4 py-2 rounded-lg font-medium flex items-center
                    ${index === 0 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  disabled={index === 0}
                  onClick={() => {
                    setIndex((prevIndex) => prevIndex - 1);
                    setAnswer(answerList[index - 1] || '');
                  }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-lg font-medium flex items-center
                    ${index === data.length - 1 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  disabled={index === data.length - 1}
                  onClick={() => {
                    setIndex((prevIndex) => prevIndex + 1);
                    setAnswer(answerList[index + 1] || '');
                  }}
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <button 
                onClick={() => quizDone(state.fileID)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}