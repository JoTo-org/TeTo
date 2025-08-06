import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentsPage } from './pages/Students';
import { CoursesPage} from './pages/Courses';
import { TeachersPage } from './pages/Teachers';
import { SupportUsPage } from './pages/SupportUs';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('support');

  const renderPage = () => {
    switch (currentPage) {
      case 'teachers':
        return <TeachersPage />;
      case 'students':
        return <StudentsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'support':
        return <SupportUsPage />;
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
