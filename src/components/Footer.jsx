import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div>? {new Date().getFullYear()} MCP Portal - Model Context Protocol Community</div>
      <div className="footer-links">
        <a href="https://github.com/ajeetraina/mcp-portal" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;