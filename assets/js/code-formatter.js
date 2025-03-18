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
    
    // Ensure code blocks are properly contained
    codeBlock.style.maxWidth = '100%';
    codeBlock.style.overflowX = 'auto';
    codeBlock.style.whiteSpace = 'pre';
    codeBlock.style.wordWrap = 'normal';
    
    // Add additional styles to ensure proper box model
    codeBlock.style.boxSizing = 'border-box';
    
    // Make sure any code element inside is also properly styled
    if (code) {
      code.style.whiteSpace = 'pre';
      code.style.overflow = 'auto';
      code.style.display = 'block';
      code.style.maxWidth = '100%';
    }
  });

  // Special handling for command lines
  document.querySelectorAll('code').forEach(function(codeElement) {
    if (codeElement.className.includes('language-bash')) {
      if (codeElement.textContent.trim().startsWith('$')) {
        codeElement.classList.add('has-prompt');
      }
    }
    
    // Ensure all code elements respect container width
    codeElement.style.maxWidth = '100%';
    codeElement.style.overflow = 'auto';
  });
  
  // Add boxed styling to headings within content
  document.querySelectorAll('main h1:not(.lab-step-header h1), main h2:not(.lab-step-header h2), main h3:not(.lab-step-header h3)').forEach(function(heading) {
    // Don't apply to headings that are already styled
    if (!heading.closest('.lab-prerequisites') && 
        !heading.closest('.learning-objectives') && 
        !heading.closest('.lab-conclusion') &&
        !heading.closest('.lab-note') &&
        !heading.closest('.lab-tip') &&
        !heading.closest('.next-steps')) {
      
      heading.style.backgroundColor = '#f8f9fa';
      heading.style.padding = '0.75rem 1rem';
      heading.style.borderRadius = '6px';
      heading.style.borderLeft = '4px solid #0db7ed';
      heading.style.wordWrap = 'break-word';
    }
  });
});
