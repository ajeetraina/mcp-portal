// Sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add mobile sidebar toggle button
  const mainContainer = document.querySelector('.main-container');
  const sidebarToggle = document.createElement('button');
  sidebarToggle.className = 'mobile-sidebar-toggle';
  sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
  document.body.appendChild(sidebarToggle);
  
  // Create body overlay for mobile
  const bodyOverlay = document.createElement('div');
  bodyOverlay.className = 'body-overlay';
  document.body.appendChild(bodyOverlay);
  
  // Sidebar toggle functionality
  sidebarToggle.addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    bodyOverlay.classList.toggle('active');
    
    // Change icon
    if (sidebar.classList.contains('active')) {
      sidebarToggle.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
  
  // Close sidebar when clicking outside
  bodyOverlay.addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('active');
    bodyOverlay.classList.remove('active');
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
  });
  
  // Collapsible menu items with children
  const menuItemsWithChildren = document.querySelectorAll('.menu-item > a + .submenu');
  
  menuItemsWithChildren.forEach(function(submenu) {
    const parentLink = submenu.previousElementSibling;
    
    // Add dropdown icon to parent links with submenus
    const dropdownIcon = document.createElement('i');
    dropdownIcon.className = 'fas fa-chevron-down';
    dropdownIcon.style.marginLeft = 'auto';
    dropdownIcon.style.fontSize = '0.75rem';
    dropdownIcon.style.transition = 'transform 0.3s ease';
    parentLink.appendChild(dropdownIcon);
    
    // Add click event to toggle submenu
    parentLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle submenu visibility
      if (submenu.style.maxHeight) {
        submenu.style.maxHeight = null;
        dropdownIcon.style.transform = 'rotate(0deg)';
      } else {
        submenu.style.maxHeight = submenu.scrollHeight + 'px';
        dropdownIcon.style.transform = 'rotate(180deg)';
      }
    });
    
    // Auto-expand submenu if it contains active item
    if (submenu.querySelector('.active')) {
      submenu.style.maxHeight = submenu.scrollHeight + 'px';
      dropdownIcon.style.transform = 'rotate(180deg)';
    } else {
      // Initially collapse submenus
      submenu.style.maxHeight = '0';
      submenu.style.overflow = 'hidden';
      submenu.style.transition = 'max-height 0.3s ease';
    }
  });
});