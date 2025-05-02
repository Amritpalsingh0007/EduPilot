import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-center">
          <div className="text-6xl font-bold text-white flex items-center justify-center">
            404
          </div>
        </div>
        
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={goHome}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700"
            >
              Return Home
            </button>
            
            <button 
              onClick={goBack}
              className="px-5 py-2 border border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}