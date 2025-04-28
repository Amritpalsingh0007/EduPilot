import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../context/authContext";
import { getQuiz } from "../service/AIServices";

export default function Quiz() {
  const [data, setData] = useState<{ question: string; a: string; b: string; c: string; d: string, correct_answer: string, concept:string, explanation:string }[] | []>([]);
  const [index, setIndex] = useState(0);
  const [answerList, setAnswerList] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { fileID, lessonID } = useParams<{ fileID: string, lessonID: string }>();
  const {token} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !lessonID) return;
    setIsLoading(true);
    getQuiz(token, lessonID) 
      .then((resp) => setData(processData(resp)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [token, lessonID]);

  useEffect(() => {
    makeAnswerList(answer, index);
  }, [answer]);
  
  function processData(resp: {question: string; concept: string; correct_answer: string; explanation: string; options: string[]}[]){
    let dataResp = resp.map((item) => ({  
      question: item.question,
      a: item.options[0],
      b: item.options[1],
      c: item.options[2],
      d: item.options[3],
      correct_answer: item.correct_answer === item.options[0] ? 'a' : item.options[1] === item.correct_answer ? 'b' : item.options[2] === item.correct_answer ? 'c' : 'd',
      concept: item.concept,
      explanation: item.explanation
    }));
    
    return dataResp;
  }

  function submitQuiz(){
    if (token === '') {
      return;
    }
    navigate('/answer', {state: {quizData: data, listOfAnswers: answerList, fileID}});
  }

  function makeAnswerList(ans: string, i: number) {
    let answers = [...answerList];
    answers[i] = ans;
    setAnswerList(answers);
  }

  return (
    <div className="w-full  bg-gradient-to-br from-purple-50 to-blue-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
          <h1 className="font-bold text-2xl">Quiz</h1>
          <p className="text-purple-100 text-sm">Question {index + 1} of {data.length}</p>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-indigo-200 w-12 h-12 mb-4"></div>
              <div className="h-4 bg-indigo-200 rounded w-32 mb-6"></div>
              <p className="text-indigo-500">Loading questions...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">{data[index]?.question}</h2>
              
              <div className="space-y-3">
                {['a', 'b', 'c', 'd'].map((option) => (
                  <button
                    key={option}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 
                      ${answer === option 
                        ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-800' 
                        : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'}`}
                    onClick={() => setAnswer(option)}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                        ${answer === option ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-400'}`}>
                        {answer === option && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{data[index]?.[option as keyof typeof data[number]]}</span>
                    </div>
                  </button>
                ))}
              </div>
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
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200"
                  onClick={submitQuiz}
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}