(function(){
  'use strict';
  try{
    const saved=localStorage.getItem('thunderresearch-theme');
    if(saved==='light'||saved==='dark')document.documentElement.dataset.theme=saved;
  }catch{
    // Theme preference is optional; the CSS system-preference fallback remains active.
  }
})();
