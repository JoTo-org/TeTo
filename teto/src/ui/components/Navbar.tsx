import React from 'react';
import './Navbar.css';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { key: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
    { key: 'students', label: 'Students', icon: '👨‍🎓' },
    { key: 'courses', label: 'Courses', icon: '🏫' },
    { key: 'support', label: 'Support Us', icon: '💰' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>🎓 School Management</h2>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.key}>
            <button
              className={`nav-button ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};