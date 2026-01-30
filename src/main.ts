import './style.css'
import { store } from './store';
import { renderHeader } from './components/Header';
import { renderSidebar } from './components/Sidebar';
import { renderCaseGrid } from './components/CaseGrid';
import { renderReader } from './components/Reader';
import { DATA } from './data';

const app = document.querySelector<HTMLDivElement>('#app')!;

// Initial Layout Shell
app.innerHTML = `
  <div class="flex h-[100dvh] w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
    <!-- Sidebar Container -->
    <aside id="sidebar-container"></aside>
    
    <!-- Main Area -->
    <div class="flex-1 flex flex-col h-full min-w-0 relative">
      <header id="header-container"></header>
      <main id="main-content" class="flex-1 relative"></main>
      
      <!-- Mobile Overlay -->
      <div id="mobile-overlay" class="fixed inset-0 bg-slate-900/50 z-20 transition-opacity duration-300 pointer-events-none opacity-0 md:hidden"></div>
    </div>
  </div>
`;

const sidebarContainer = document.getElementById('sidebar-container')!;
const headerContainer = document.getElementById('header-container')!;
const mainContainer = document.getElementById('main-content')!;
const mobileOverlay = document.getElementById('mobile-overlay')!;

// Initial Renders
renderSidebar(sidebarContainer);
renderHeader(headerContainer);

// Router / State Handler
store.subscribe((state) => {
  // Update Header (Breadcrumbs)
  renderHeader(headerContainer);

  // Hande Sidebar State (Mobile)
  const sidebarEl = sidebarContainer.firstElementChild;
  if (sidebarEl) {
    // Re-render sidebar to update selection highlight
    renderSidebar(sidebarContainer);
  }

  // Handle Overlay
  if (state.isSidebarOpen) {
    mobileOverlay.classList.remove('pointer-events-none', 'opacity-0');
    mobileOverlay.classList.add('opacity-100', 'pointer-events-auto');
  } else {
    mobileOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    mobileOverlay.classList.add('pointer-events-none', 'opacity-0');
  }

  // Main Content Routing
  mainContainer.innerHTML = '';
  mainContainer.className = "flex-1 relative bg-slate-50";

  if (state.selectedDeptId) {
    const dept = store.getDepartment(state.selectedDeptId);
    if (!dept) return;

    if (state.selectedCaseId) {
      const caseItem = store.getCase(state.selectedDeptId, state.selectedCaseId);
      if (caseItem) {
        mainContainer.classList.add('overflow-hidden', 'flex', 'flex-col');
        renderReader(mainContainer, caseItem);
      }
    } else {
      mainContainer.classList.add('overflow-y-auto', 'scroll-smooth');
      renderCaseGrid(mainContainer, dept);
    }
  } else {
    mainContainer.classList.add('overflow-y-auto', 'scroll-smooth');
    renderDashboard(mainContainer);
  }
});

function renderDashboard(container: HTMLElement) {
  const totalCases = DATA.reduce((acc, d) => acc + d.cases.length, 0);

  container.classList.add("p-8", "animate-fade-in", "max-w-5xl", "mx-auto");
  container.innerHTML = `
      <div class="mb-12 text-center md:text-left">
        <h1 class="text-4xl font-bold text-slate-900 tracking-tight mb-4">Welcome back, Dr. Sara</h1>
        <p class="text-slate-500 text-lg max-w-2xl">
          Select a department from the sidebar to view automated clinical note restructuring.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">${DATA.length}</div>
            <div class="text-sm font-medium text-slate-500">Departments</div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">${totalCases}</div>
            <div class="text-sm font-medium text-slate-500">Processed Cases</div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">100%</div>
            <div class="text-sm font-medium text-slate-500">Uptime</div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 class="text-xl font-bold text-slate-800 mb-6">Quick Navigation</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
           ${DATA.slice(0, 10).map(dept => `
             <button data-dept="${dept.name}" class="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-center group">
               <div class="font-medium text-slate-700 group-hover:text-indigo-600 truncate">${dept.name}</div>
               <div class="text-xs text-slate-400 mt-1">${dept.cases.length} cases</div>
             </button>
           `).join('')}
        </div>
      </div>
    `;

  container.querySelectorAll('button[data-dept]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setDepartment(btn.getAttribute('data-dept'));
    });
  });
}

// Initial Listener Trigger
mobileOverlay.addEventListener('click', () => store.toggleSidebar(false));
