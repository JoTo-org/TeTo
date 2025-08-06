import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentsPage } from './pages/Students';
import { CoursesPage} from './pages/Courses';
import { TeachersPage } from './pages/Teachers';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('teachers');

  const renderPage = () => {
    switch (currentPage) {
      case 'teachers':
        return <TeachersPage />;
      case 'students':
        return <StudentsPage />;
      case 'courses':
        return <CoursesPage />;
      default:
        return <TeachersPage />;
    }
  };

  return (
    <>
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </>
  );
}

export default App;
