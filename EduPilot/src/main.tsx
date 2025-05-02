import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './service/firebase_init.js'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Roadmap from './components/Roadmap.tsx'
import Home from './components/Home.tsx'
import Dashboard from './components/Dashboard.tsx'
import Lesson from './components/Lesson.tsx'
import Quiz from './components/Quiz.tsx'
import Topic from './components/Topic.tsx'
import QuizAnswer from './components/QuizAnswer.tsx'
import StudyHub from './components/StudyHub.tsx'
import NotFound from './components/NotFound.tsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path='/' element={<App/>}>
      <Route path='' element={<StudyHub/>}/>
      <Route path='roadmap/:fileId' element={<Roadmap/>}/>
      <Route path='chat' element={<Home/>}/>
      <Route path='profile' element={<Dashboard/>}/>
      <Route path='lesson/:fileID/:lessonID' element={<Lesson/>}/>
      <Route path='quiz/:fileID/:lessonID' element={<Quiz/>}/>
      <Route path='topic' element={<Topic/>}/>
      <Route path='answer' element={<QuizAnswer/>}/>
    </Route>
    <Route path="*" element={<NotFound/>}/>
    </>
  )
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
