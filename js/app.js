/**
 * SFL Tools Integrated Portal - Main Controller (app.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Helper to prevent Same-Origin localStorage pollution on shared domains (like GitHub Pages)
    const getStorageKey = (key) => {
        const pathPrefix = window.location.pathname.replace(/\/[^\/]*$/, '/');
        return `sfl_${pathPrefix}_${key}`;
    };

    // 1. Navigation View Switcher Logic
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    function switchView(viewId, isInit = false) {
        viewSections.forEach(section => {
            if (section.id === `view-${viewId}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        navItems.forEach(item => {
            if (item.dataset.view === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Save view state
        localStorage.setItem(getStorageKey('last_view'), viewId);

        // Scroll to top on view switch
        if (!isInit) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Trigger updates if necessary when switching views
        if (viewId === 'cards' && typeof window.updateCardsGallery === 'function') {
            window.updateCardsGallery();
        }
        if (viewId === 'skills' && typeof window.calculateSkillUpgrades === 'function') {
            window.calculateSkillUpgrades();
        }
    }

    // Bind nav sidebar items click
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.dataset.view;
            switchView(viewId);
        });
    });

    // Expose switchView globally so lobby cards can call it
    window.switchView = switchView;

    // Restore last visited view (default to 'home')
    const lastView = localStorage.getItem(getStorageKey('last_view')) || 'home';
    switchView(lastView, true);

    // Collapsible Sidebar Toggle and State Persistence
    const appContainer = document.querySelector('.app-container');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    
    // Restore state from localStorage (Defaults to collapsed/true if first visit)
    const storedState = localStorage.getItem(getStorageKey('sidebar_collapsed'));
    if (storedState === 'false') {
        if (appContainer) appContainer.classList.remove('sidebar-collapsed');
    } else {
        // If storedState is 'true' or null (meaning first visit), ensure it remains collapsed
        if (appContainer) appContainer.classList.add('sidebar-collapsed');
    }

    if (sidebarToggleBtn && appContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
            localStorage.setItem(getStorageKey('sidebar_collapsed'), appContainer.classList.contains('sidebar-collapsed'));
        });
    }

    // 2. Global Toast Notification System
    const toast = document.getElementById('toast-message');
    function showToast(message, duration = 3000) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    // Expose showToast globally
    window.showToast = showToast;

    // 3. Scroll to Top Floating Button
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. Subtab Switcher Logic (Cards View & Dungeon View)
    const innerTabButtons = document.querySelectorAll('.inner-tabs .tab-btn');
    innerTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            const container = btn.closest('.view-section');
            
            // Toggle active state on buttons
            container.querySelectorAll('.inner-tabs .tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            // Toggle active state on subtab content panes
            container.querySelectorAll('.inner-tab-content').forEach(pane => {
                if (pane.id === tabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            // Trigger internal refreshes on tab switch
        });
    });
});
