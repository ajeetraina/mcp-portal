// Code block formatter for Docker MCP Portal
document.addEventListener('DOMContentLoaded', function() {
  // Find all pre elements that don't already have code-header
  const codeBlocks = document.querySelectorAll('pre:not(:has(.code-header))');
  
  codeBlocks.forEach(function(codeBlock, index) {
    // Create code header
    const header = document.createElement('div');
    header.className = 'code-header';
    
    // Add file name or code type if available
    const code = codeBlock.querySelector('code');
    let language = '';
    if (code && code.className) {
      const classes = code.className.split(' ');
      for (const cls of classes) {
        if (cls.startsWith('language-')) {
          language = cls.replace('language-', '');
          break;
        }
      }
    }
    
    header.innerHTML = `<span>${language || 'bash'}</span>`;
    
    // Add copy button
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '<i class="far fa-copy"></i> Copy';
    button.addEventListener('click', function() {
      const text = codeBlock.querySelector('code') ? 
        codeBlock.querySelector('code').innerText : 
        codeBlock.innerText;
      
      navigator.clipboard.writeText(text).then(function() {
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(function() {
          button.innerHTML = '<i class="far fa-copy"></i> Copy';
        }, 2000);
      });
    });
    
    header.appendChild(button);
    codeBlock.parentNode.insertBefore(header, codeBlock);
  });

  // Special handling for command lines
  document.querySelectorAll('code').forEach(function(codeElement) {
    if (codeElement.className.includes('language-bash')) {
      if (codeElement.textContent.trim().startsWith('$')) {
        codeElement.classList.add('has-prompt');
      }
    }
  });
});
