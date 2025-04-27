import { useEffect, useState } from "react";
import { getAuth, signOut } from 'firebase/auth';
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContextProvider } from './context/authContext';
import Login from "./components/Login";

function App() {
  const [auth, setAuth] = useState(
    false || window.localStorage.getItem('auth') === 'true'
  );
  const [token, setToken] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  // We won't use photoURL directly in state
  
  const firebaseAuth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((userCred) => {
      if (userCred) {
        setAuth(true);
        window.localStorage.setItem('auth', 'true');
        userCred.getIdToken().then((token) => {
          setToken(token);
        });
        // Store name and email separately
        setUserName(userCred.displayName || 'User');
        setUserEmail(userCred.email || '');
      } else {
        setAuth(false);
        window.localStorage.setItem('auth', 'false');
        setToken('');
        setUserName('User');
        setUserEmail('');
      }
    });
  }, []);

//   const loginWithGoogle = () => {
//     signInWithPopup(firebaseAuth, new GoogleAuthProvider())
//       .then((userCred) => {
//         if (userCred) {
//           setAuth(true);
//           window.localStorage.setItem('auth', 'true');
//         }
//       });
//   };

  const handleLogout = () => {
    signOut(firebaseAuth);
    navigate('/');
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {auth ? (
        <>
          {/* Header */}
          <header className="bg-white shadow-md relative z-10">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg mr-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  EduPath
                </h1>
              </div>
              
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  {/* Using initials instead of trying to load an image */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                    {userName.charAt(0)}
                  </div>
                  <span className="hidden md:inline-block text-gray-700">
                    {userName}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-700 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                    
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                    
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6">
            <AuthContextProvider value={{ token }}>
              <Outlet />
            </AuthContextProvider>
          </main>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;