import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sidebarMenu } from '../data/sidebar-menu';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    // Default to expanding the Docker MCP section
    dockerMcp: true
  });

  const toggleSection = (key) => {
    setExpandedSections({
      ...expandedSections,
      [key]: !expandedSections[key]
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>MCP Tutorials</h2>
      </div>
      <nav className="sidebar-nav">
        {Object.keys(sidebarMenu).map((sectionKey) => {
          const section = sidebarMenu[sectionKey];
          const isExpanded = expandedSections[sectionKey];
          
          return (
            <div key={sectionKey} className="sidebar-section">
              <div 
                className="sidebar-section-header" 
                onClick={() => toggleSection(sectionKey)}
              >
                <h3>{section.title}</h3>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                  {isExpanded ? '?' : '?'}
                </span>
              </div>
              
              {isExpanded && (
                <ul className="sidebar-links">
                  {section.items.map((item, index) => (
                    <li key={index} className={location.pathname === item.path ? 'active' : ''}>
                      <Link to={item.path}>{item.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;