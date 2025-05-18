import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">MCP Portal</Link>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/tutorials/docker-mcp">Tutorials</Link>
          <Link to="/documentation">Documentation</Link>
          <Link to="/community">Community</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;