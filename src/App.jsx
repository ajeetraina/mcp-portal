import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TutorialLayout from './layouts/TutorialLayout';
import Home from './pages/Home';
import DockerMcpIntro from './pages/tutorials/docker-mcp/index';
import Installation from './pages/tutorials/docker-mcp/installation';

// Import CSS
import './styles/global.css';
import './styles/tutorial.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />
        
        {/* Tutorial routes */}
        <Route path="/tutorials" element={<TutorialLayout />}>
          {/* Redirect /tutorials to the Docker MCP intro page */}
          <Route index element={<Navigate to="/tutorials/docker-mcp" replace />} />
          
          {/* Docker MCP tutorial routes */}
          <Route path="docker-mcp" element={<DockerMcpIntro />} />
          <Route path="docker-mcp/installation" element={<Installation />} />
          {/* Add more tutorial routes here as they're created */}
        </Route>
        
        {/* Catch-all route for 404s */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;