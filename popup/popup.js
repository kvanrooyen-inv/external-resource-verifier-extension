const LIBRARY_DETECTION_METHODS = {
  bootstrap: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('bootstrap.css') ||
    line.toLowerCase().includes('bootstrap.min.css') ||
    line.toLowerCase().includes('cdn.jsdelivr.net/npm/bootstrap')
  ),
  vue: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('vue.js') ||
    line.toLowerCase().includes('vue.min.js') ||
    line.toLowerCase().includes('vue-router') ||
    line.toLowerCase().includes('vuex') ||
    line.toLowerCase().includes('vue.global.js')
  ),
  react: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('react.js') ||
    line.toLowerCase().includes('react.production.min.js') ||
    line.toLowerCase().includes('react.development.js') ||
    line.toLowerCase().includes('react-dom.development.js') ||
    line.toLowerCase().includes('react-dom.js')
  ),
  tailwind: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('tailwind.css') ||
    line.toLowerCase().includes('tailwindcss') ||
    line.toLowerCase().includes('cdn.tailwindcss.com')
  ),
  jquery: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('jquery.js') ||
    line.toLowerCase().includes('jquery.min.js')
  ),
  angular: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('angular.js') ||
    line.toLowerCase().includes('angular.min.js') ||
    line.toLowerCase().includes('@angular/core')
  ),
  fontAwesome: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('font-awesome') ||
    line.toLowerCase().includes('fontawesome') ||
    line.toLowerCase().includes('fa-')
  ),
  webgl: (htmlStr) => htmlStr.split('\n').filter(line =>
    line.toLowerCase().includes('webgl') ||
    line.toLowerCase().includes('three.js') ||
    line.toLowerCase().includes('babylon.js') ||
    line.toLowerCase().includes('gl-matrix.js') ||
    line.toLowerCase().includes('canvas.getcontext("webgl")')
  )
};

document.addEventListener('DOMContentLoaded', function() {
  const checkButton = document.getElementById('checkButton');
  const resultsDiv = document.getElementById('results');
  const librariesList = document.getElementById('librariesList');
  const noLibraries = document.getElementById('noLibraries');
  const errorDiv = document.getElementById('error');

  checkButton.addEventListener('click', async function() {
    // Reset UI
    resultsDiv.classList.add('hidden');
    noLibraries.classList.add('hidden');
    errorDiv.classList.add('hidden');
    librariesList.innerHTML = '';
    
    // Disable button while processing
    checkButton.disabled = true;
    checkButton.textContent = 'Checking...';

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      // Inject content script to get the page HTML
      const pageContent = await browser.tabs.executeScript(tab.id, {
        code: 'document.documentElement.outerHTML'
      });

      const html = pageContent[0];
      const detected = Object.entries(LIBRARY_DETECTION_METHODS).reduce((acc, [libName, detector]) => {
        const lines = detector(html);
        if (lines.length > 0) {
          acc.push({ name: libName, lines });
        }
        return acc;
      }, []);

      resultsDiv.classList.remove('hidden');

      if (detected.length === 0) {
        noLibraries.classList.remove('hidden');
      } else {
        detected.forEach(lib => {
          const libraryItem = createLibraryElement(lib);
          librariesList.appendChild(libraryItem);
        });
      }
    } catch (error) {
      errorDiv.textContent = 'Error: Unable to analyze page content.';
      errorDiv.classList.remove('hidden');
    } finally {
      checkButton.disabled = false;
      checkButton.textContent = 'Check Current Page';
    }
  });
});

function createLibraryElement(lib) {
  const item = document.createElement('div');
  item.className = 'library-item';

  const header = document.createElement('button');
  header.className = 'library-header';
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'library-name';
  nameSpan.innerHTML = `<span class="check-icon">✓</span> ${capitalizeFirst(lib.name)}`;
  
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.textContent = '▼';
  
  header.appendChild(nameSpan);
  header.appendChild(arrow);

  const content = document.createElement('div');
  content.className = 'library-content hidden';
  content.textContent = lib.lines.join('\n');

  header.addEventListener('click', () => {
    content.classList.toggle('hidden');
    arrow.classList.toggle('expanded');
  });

  item.appendChild(header);
  item.appendChild(content);

  return item;
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
