// Code formatting and structure enhancements

document.addEventListener('DOMContentLoaded', function() {
  // Initialize code headers and copy buttons
  addCodeHeadersAndButtons();
  
  // Fix any improperly formatted code blocks
  fixImproperCodeBlocks();
  
  // Ensure proper structure for lab sections
  enhanceLabStructure();
});

function addCodeHeadersAndButtons() {
  const codeBlocks = document.querySelectorAll('pre');
  codeBlocks.forEach(function(codeBlock, index) {
    // Skip if this code block already has a header
    if (codeBlock.previousElementSibling && codeBlock.previousElementSibling.classList.contains('code-header')) {
      return;
    }
    
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
    
    // If no language class found, try to detect from content
    if (!language && code) {
      const content = code.textContent.trim();
      if (content.includes('docker') || content.startsWith('#') || content.includes('apt-get')) {
        language = 'bash';
        if (!code.className.includes('language-')) {
          code.className += ' language-bash';
        }
      } else if (content.includes('services:') || content.includes('image:')) {
        language = 'yaml';
        if (!code.className.includes('language-')) {
          code.className += ' language-yaml';
        }
      }
    }
    
    header.innerHTML = `<span>${language || 'bash'}</span>`;
    
    // Add copy button
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '<i class="far fa-copy"></i> Copy';
    button.addEventListener('click', function() {
      const text = code ? code.innerText : codeBlock.innerText;
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
}

function fixImproperCodeBlocks() {
  // Find code blocks that might be improperly formatted
  document.querySelectorAll('code').forEach(function(codeElement) {
    const parentIsPre = codeElement.parentNode.tagName === 'PRE';
    
    // If the code is not in a pre, but starts with ```bash or similar, it's likely an improperly rendered code block
    if (!parentIsPre && codeElement.textContent.trim().startsWith('```')) {
      const codeText = codeElement.textContent.trim();
      const lines = codeText.split('\n');
      
      if (lines.length >= 2 && lines[0].startsWith('```') && lines[lines.length-1].includes('```')) {
        // Extract language
        let language = lines[0].replace('```', '').trim();
        if (!language) language = 'bash'; // Default to bash if no language specified
        
        // Extract code content (excluding the opening and closing ```)  
        const codeContent = lines.slice(1, lines.length-1).join('\n');
        
        // Create a proper pre and code element
        const preElement = document.createElement('pre');
        const newCodeElement = document.createElement('code');
        newCodeElement.className = `language-${language}`;
        newCodeElement.textContent = codeContent;
        
        preElement.appendChild(newCodeElement);
        
        // Replace the old element with the properly formatted one
        codeElement.parentNode.insertBefore(preElement, codeElement);
        codeElement.parentNode.removeChild(codeElement);
        
        // Add header and copy button to this new code block
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `<span>${language}</span>`;
        
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = '<i class="far fa-copy"></i> Copy';
        button.addEventListener('click', function() {
          navigator.clipboard.writeText(codeContent).then(function() {
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(function() {
              button.innerHTML = '<i class="far fa-copy"></i> Copy';
            }, 2000);
          });
        });
        
        header.appendChild(button);
        preElement.parentNode.insertBefore(header, preElement);
      }
    }
  });
}

function enhanceLabStructure() {
  // Convert Prerequisites section if not properly formatted
  const prereqHeaders = document.querySelectorAll('h2:contains("Prerequisites"), strong:contains("Prerequisites")');
  prereqHeaders.forEach(function(header) {
    // Check if already in a proper lab-prerequisites div
    if (header.closest('.lab-prerequisites')) return;
    
    const prereqDiv = document.createElement('div');
    prereqDiv.className = 'lab-prerequisites';
    
    // Create proper header if needed
    const h2 = document.createElement('h2');
    h2.innerHTML = '<i class="fas fa-clipboard-list"></i> Prerequisites';
    prereqDiv.appendChild(h2);
    
    // Find the list that follows the header
    let list = header.nextElementSibling;
    while (list && (list.tagName !== 'UL' && list.tagName !== 'OL')) {
      list = list.nextElementSibling;
    }
    
    if (list) {
      prereqDiv.appendChild(list.cloneNode(true));
      list.parentNode.replaceChild(prereqDiv, list);
      header.parentNode.removeChild(header);
    }
  });
  
  // Convert Learning Objectives section if not properly formatted
  const objectiveHeaders = document.querySelectorAll('h2:contains("Learning Objectives"), strong:contains("Learning Objectives")');
  objectiveHeaders.forEach(function(header) {
    // Check if already in a proper learning-objectives div
    if (header.closest('.learning-objectives')) return;
    
    const objectivesDiv = document.createElement('div');
    objectivesDiv.className = 'learning-objectives';
    
    // Create proper header if needed
    const h2 = document.createElement('h2');
    h2.innerHTML = '<i class="fas fa-graduation-cap"></i> Learning Objectives';
    objectivesDiv.appendChild(h2);
    
    // Find the list that follows the header
    let list = header.nextElementSibling;
    while (list && (list.tagName !== 'UL' && list.tagName !== 'OL')) {
      list = list.nextElementSibling;
    }
    
    if (list) {
      objectivesDiv.appendChild(list.cloneNode(true));
      list.parentNode.replaceChild(objectivesDiv, list);
      header.parentNode.removeChild(header);
    }
  });
  
  // Fix tips sections
  const tipHeaders = document.querySelectorAll('h4:contains("Tip"), strong:contains("Tip")');
  tipHeaders.forEach(function(header) {
    // Check if already in a proper lab-tip div
    if (header.closest('.lab-tip')) return;
    
    const tipDiv = document.createElement('div');
    tipDiv.className = 'lab-tip';
    
    // Create proper header
    const h4 = document.createElement('h4');
    h4.innerHTML = '<i class="fas fa-lightbulb"></i> Tip';
    tipDiv.appendChild(h4);
    
    // Find the paragraph that follows
    let paragraph = header.nextElementSibling;
    while (paragraph && paragraph.tagName !== 'P') {
      paragraph = paragraph.nextElementSibling;
    }
    
    if (paragraph) {
      tipDiv.appendChild(paragraph.cloneNode(true));
      // Replace the original elements
      header.parentNode.insertBefore(tipDiv, header);
      header.parentNode.removeChild(header);
      paragraph.parentNode.removeChild(paragraph);
    }
  });
  
  // Fix Step sections
  const stepHeaders = document.querySelectorAll('h2:contains("Step"), h3:contains("Step")');
  stepHeaders.forEach(function(header) {
    // Check if already in a proper lab-step div
    if (header.closest('.lab-step')) return;
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'lab-step';
    
    // Create header div
    const headerDiv = document.createElement('div');
    headerDiv.className = 'lab-step-header';
    headerDiv.innerHTML = '<i class="fas fa-play-circle"></i> ' + header.textContent;
    stepDiv.appendChild(headerDiv);
    
    // Create content div
    const contentDiv = document.createElement('div');
    contentDiv.className = 'lab-step-content';
    
    // Collect all elements until the next header
    let sibling = header.nextElementSibling;
    const elementsToMove = [];
    while (sibling && !sibling.matches('h2, h3, .lab-step')) {
      elementsToMove.push(sibling);
      sibling = sibling.nextElementSibling;
    }
    
    // Move elements to the content div
    elementsToMove.forEach(element => {
      contentDiv.appendChild(element.cloneNode(true));
    });
    
    stepDiv.appendChild(contentDiv);
    
    // Replace the original header and content with our lab-step div
    header.parentNode.insertBefore(stepDiv, header);
    header.parentNode.removeChild(header);
    elementsToMove.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  });
}

// Helper to check if element contains text
Element.prototype.contains = function(text) {
  return this.textContent.includes(text);
};
