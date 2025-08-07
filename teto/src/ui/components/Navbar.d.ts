import React from 'react';
import './Navbar.css';
interface NavbarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}
export declare const Navbar: React.FC<NavbarProps>;
export {};
