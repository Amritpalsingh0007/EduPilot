import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../context/authContext";
import { getContent } from "../service/AIServices";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function Lesson() {
  const { token } = useAuth();
  const { fileID, lessonID } = useParams<{ fileID:string,lessonID: string }>();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !lessonID) return;
    setLoading(true);
    getContent(token, lessonID)
      .then((resp) => setContent(String(resp)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, lessonID]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const startQuiz = () => {
    console.log("Starting quiz for lesson:", lessonID);
    navigate(`/quiz/${fileID}/${lessonID}`);

  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
          <h1 className="font-bold text-2xl">Lesson </h1>
        </div>

        <div className="p-6 flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="w-12 h-12 rounded-full border-4 border-t-purple-600 border-r-indigo-600 border-b-purple-600 border-l-indigo-600 border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh] mb-4 prose prose-indigo">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // 1) Unwrap <pre> or <code> from paragraphs
                  p({ node, children }) {
                    // if the paragraph node has a single child
                    // that is a code or pre element, return the child directly
                    if (
                      node.children.length === 1 &&
                      (node.children[0].type === "element" &&
                      ["code", "pre"].includes(
                        (node.children[0] as any).tagName
                      ))
                    ) {
                      return <>{children}</>;
                    }
                    return <p className="my-3 text-gray-700">{children}</p>;
                  },
                  // 2) Explicitly render <pre> blocks
                  pre({ node, children, ...props }) {
                    return (
                      <pre
                        className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-x-auto my-4"
                        {...props}
                      >
                        {children}
                      </pre>
                    );
                  },
                  // 3) Render inline vs block code
                  code({ node, inline, children, ...props }) {
                    if (inline) {
                      return (
                        <code
                          className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    // block code is already handled by <pre> override
                    return <code {...props}>{children}</code>;
                  },
                  // you can keep your custom headings, lists, etc.
                  h1: ({...props}) => <h1 className="text-2xl font-bold text-indigo-800 mt-6 mb-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold text-indigo-700 mt-5 mb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-bold text-indigo-600 mt-4 mb-2" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-5 my-3" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-5 my-3" {...props} />,
                  li: ({...props}) => <li className="ml-2 mb-1" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-600" {...props} />
                  ),
                  img: ({...props}) => <img className="max-w-full h-auto rounded-md my-4" {...props} />
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 border-t pt-4">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full">
                {/* SVG icon */}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                Reading time: {calculateReadingTime(content)} minutes
              </span>
            </div>
            <button
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium transition-colors duration-200 hover:from-indigo-600 hover:to-purple-600 flex items-center"
              onClick={startQuiz}
            >
              Start Quiz
              <svg className="w-4 h-4 ml-2" /*...*/ />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
