import { Navigate, Route, Routes } from 'react-router-dom'
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus'

import { OnboardingPage } from '../../pages/OnboardingPage'
import { LessonsPage } from '../../pages/LessonsPage'
import { LessonsGradePage } from '../../pages/LessonsGradePage'
import { LessonTopicPage } from '../../pages/LessonTopicPage'
import { LessonReaderPage } from '../../pages/LessonReaderPage'
import { LessonQuizPage } from '../../pages/LessonQuizPage'
import { TutorPage } from '../../pages/TutorPage'
import { LabPage } from '../../pages/LabPage'
import { BioScanPage } from '../../pages/BioScanPage'
import { AnatomyPage } from '../../pages/AnatomyPage'
import { ProgressPage } from '../../pages/ProgressPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { HomeScreen } from '../../features/home/HomeScreen'
import { LibraryBookPage } from '../../pages/LibraryBookPage'
import { AndroidDownloadPage } from '../../pages/AndroidDownloadPage'

export function MainScreens() {
  const onboarded = useOnboardingStatus()

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route path="/" element={onboarded ? <HomeScreen /> : <Navigate to="/onboarding" replace />} />
      <Route path="/lessons" element={onboarded ? <LessonsPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/library/book/:bookId" element={onboarded ? <LibraryBookPage /> : <Navigate to="/onboarding" replace />} />

      <Route path="/lessons/grade/:gradeId" element={<LessonsGradePage />} />
      <Route path="/lessons/grade/:gradeId/topic/:topicId" element={<LessonTopicPage />} />
      <Route path="/lessons/grade/:gradeId/lesson/:lessonId" element={<LessonReaderPage />} />
      <Route path="/lessons/grade/:gradeId/quiz/:lessonId" element={<LessonQuizPage />} />
      {/* Back-compat */}
      <Route path="/lessons/topic/:topicId" element={<LessonTopicPage />} />
      <Route path="/lessons/lesson/:topicId/:lessonId" element={<LessonReaderPage />} />
      <Route path="/lessons/quiz/:topicId/:lessonId" element={<LessonQuizPage />} />

      <Route path="/tutor" element={onboarded ? <TutorPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/lab" element={onboarded ? <LabPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/bioscan" element={onboarded ? <BioScanPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/anatomy" element={onboarded ? <AnatomyPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/android" element={onboarded ? <AndroidDownloadPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/progress" element={onboarded ? <ProgressPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/profile" element={onboarded ? <ProfilePage /> : <Navigate to="/onboarding" replace />} />
    </Routes>
  )
}

