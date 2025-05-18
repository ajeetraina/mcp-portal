import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TutorialLayout = () => {
  return (
    <div className="tutorial-layout">
      <Header />
      <div className="tutorial-container">
        <Sidebar />
        <main className="tutorial-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TutorialLayout;