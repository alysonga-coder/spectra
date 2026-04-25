import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Shared
import Landing from './pages/Landing';

// Teacher pages
import TeacherLogin    from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import UploadAssignment from './pages/teacher/UploadAssignment';
import StudentProfile   from './pages/teacher/StudentProfile';
import LiveMonitor      from './pages/teacher/LiveMonitor';
import TeacherReports   from './pages/teacher/TeacherReports';

// Student pages
import StudentLogin      from './pages/student/StudentLogin';
import StudentHome       from './pages/student/StudentHome';
import SelectAssignment  from './pages/student/SelectAssignment';
import CuratedLesson     from './pages/student/CuratedLesson';
import AutoReframe       from './pages/student/AutoReframe';
import CompletionScreen  from './pages/student/CompletionScreen';

// Layout wrappers
import TeacherLayout from './components/TeacherLayout';
import StudentLayout from './components/StudentLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared landing */}
        <Route path="/"        element={<Landing />} />

        {/* Teacher flow */}
        <Route path="/teacher/login"      element={<TeacherLogin />} />
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index                    element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"         element={<TeacherDashboard />} />
          <Route path="upload"            element={<UploadAssignment />} />
          <Route path="profile/:studentId" element={<StudentProfile />} />
          <Route path="monitor"           element={<LiveMonitor />} />
          <Route path="reports"           element={<TeacherReports />} />
        </Route>

        {/* Student flow */}
        <Route path="/student/login"      element={<StudentLogin />} />
        <Route path="/student" element={<StudentLayout />}>
          <Route index                    element={<Navigate to="home" replace />} />
          <Route path="home"              element={<StudentHome />} />
          <Route path="assignments"       element={<SelectAssignment />} />
          <Route path="lesson/:assignmentId" element={<CuratedLesson />} />
          <Route path="reframe"           element={<AutoReframe />} />
          <Route path="complete"          element={<CompletionScreen />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
