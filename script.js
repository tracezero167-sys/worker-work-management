// ============================================
// PROFESSIONAL WORKER WORK MANAGEMENT SYSTEM
// Advanced JavaScript with Enhanced Features
// ============================================

// Data Management
let workers = [];
let currentWorker = null;
let currentWorkType = null;
let currentFilter = 'all';
let activities = [];
let notifications = [];
let currentCardColorWorkerId = null;
let notes = [];
let inputStylingSettings = {};

// Supabase Functions
async function loadWorkersFromSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase not initialized');
        }
        
        const { data, error } = await window.supabase
            .from('Workers')
            .select('*');
        
        if (error) throw error;
        
        // Initialize work arrays if not arrays
        const workersWithArrays = (data || []).map(worker => ({
            ...worker,
            dailyWork: Array.isArray(worker.dailyWork) ? worker.dailyWork : [],
            monthlyWork: Array.isArray(worker.monthlyWork) ? worker.monthlyWork : [],
            yearlyWork: Array.isArray(worker.yearlyWork) ? worker.yearlyWork : []
        }));
        
        workers = workersWithArrays;
        console.log('Workers loaded from Supabase:', workers.length);
    } catch (error) {
        console.error('Error loading workers:', error);
        // Fallback to localStorage if Supabase fails
        workers = JSON.parse(localStorage.getItem('workers')) || [];
    }
}

async function saveWorkerToSupabase(worker) {
    try {
        // Only include columns that exist in the Workers table
        // Avatar URL will be stored if uploaded to Supabase Storage
        const workerData = {
            id: worker.id,
            name: worker.name,
            mobile: worker.mobile,
            department: worker.department,
            details: worker.details,
            avatar: worker.avatar || '', // Store avatar URL or empty string
            cardColor: worker.cardColor,
            dailyWork: worker.dailyWork,
            monthlyWork: worker.monthlyWork,
            yearlyWork: worker.yearlyWork,
            createdAt: worker.createdAt,
            status: worker.status
        };
        
        const { error } = await window.supabase
            .from('Workers')
            .upsert(workerData);
        
        if (error) throw error;
        console.log('Worker saved to Supabase:', worker.id);
    } catch (error) {
        console.error('Error saving worker:', error);
        // Fallback to localStorage
        const localWorkers = JSON.parse(localStorage.getItem('workers')) || [];
        const index = localWorkers.findIndex(w => w.id === worker.id);
        if (index !== -1) {
            localWorkers[index] = worker;
        } else {
            localWorkers.push(worker);
        }
        localStorage.setItem('workers', JSON.stringify(localWorkers));
    }
}

// Upload image to Supabase Storage
async function uploadAvatarToSupabase(file, workerId) {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase not initialized');
        }

        const fileName = `${workerId}_${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `avatars/${fileName}`;

        const { data, error } = await window.supabase.storage
            .from('worker-avatars')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = window.supabase.storage
            .from('worker-avatars')
            .getPublicUrl(filePath);

        console.log('Avatar uploaded to Supabase:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }
}

async function deleteWorkerFromSupabase(workerId) {
    try {
        const { error } = await window.supabase
            .from('Workers')
            .delete()
            .eq('id', workerId);
        
        if (error) throw error;
        console.log('Worker deleted from Supabase:', workerId);
    } catch (error) {
        console.error('Error deleting worker:', error);
        // Fallback to localStorage
        const localWorkers = JSON.parse(localStorage.getItem('workers')) || [];
        const filtered = localWorkers.filter(w => w.id !== workerId);
        localStorage.setItem('workers', JSON.stringify(filtered));
    }
}

async function loadActivitiesFromSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase not initialized');
        }
        
        const { data, error } = await window.supabase
            .from('activities')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        activities = data || [];
        console.log('Activities loaded from Supabase:', activities.length);
    } catch (error) {
        console.error('Error loading activities:', error);
        activities = JSON.parse(localStorage.getItem('activities')) || [];
    }
}

async function saveActivityToSupabase(activity) {
    try {
        const { error } = await window.supabase
            .from('activities')
            .upsert(activity);
        
        if (error) throw error;
        console.log('Activity saved to Supabase:', activity.id);
    } catch (error) {
        console.error('Error saving activity:', error);
        const localActivities = JSON.parse(localStorage.getItem('activities')) || [];
        localActivities.unshift(activity);
        if (localActivities.length > 10) {
            localActivities.pop();
        }
        localStorage.setItem('activities', JSON.stringify(localActivities));
    }
}

async function loadNotesFromSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase not initialized');
        }
        
        const { data, error } = await window.supabase
            .from('notes')
            .select('*');
        
        if (error) throw error;
        notes = data || [];
        
        if (notes.length === 0) {
            // Add default notes if none exist
            notes = [
                {
                    id: 'note-demo-1',
                    title: 'Delivery Plan',
                    text: 'Need to verify route timings and assign extra support for Sunday shifts.',
                    color: 'yellow',
                    rotate: -2
                },
                {
                    id: 'note-demo-2',
                    title: 'Safety Check',
                    text: 'Inspect helmets and check maintenance tools before the next shift.',
                    color: 'pink',
                    rotate: 2
                }
            ];
            // Save default notes to Supabase
            for (const note of notes) {
                await window.supabase.from('notes').upsert(note);
            }
        }
        console.log('Notes loaded from Supabase:', notes.length);
    } catch (error) {
        console.error('Error loading notes:', error);
        notes = JSON.parse(localStorage.getItem('stickyNotes')) || [
            {
                id: 'note-demo-1',
                title: 'Delivery Plan',
                text: 'Need to verify route timings and assign extra support for Sunday shifts.',
                color: 'yellow',
                rotate: -2
            },
            {
                id: 'note-demo-2',
                title: 'Safety Check',
                text: 'Inspect helmets and check maintenance tools before the next shift.',
                color: 'pink',
                rotate: 2
            }
        ];
    }
}

async function saveNoteToSupabase(note) {
    try {
        const { error } = await window.supabase
            .from('notes')
            .upsert(note);
        
        if (error) throw error;
        console.log('Note saved to Supabase:', note.id);
    } catch (error) {
        console.error('Error saving note:', error);
        const localNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        const index = localNotes.findIndex(n => n.id === note.id);
        if (index !== -1) {
            localNotes[index] = note;
        } else {
            localNotes.unshift(note);
        }
        localStorage.setItem('stickyNotes', JSON.stringify(localNotes));
    }
}

async function deleteNoteFromSupabase(noteId) {
    try {
        const { error } = await window.supabase
            .from('notes')
            .delete()
            .eq('id', noteId);
        
        if (error) throw error;
        console.log('Note deleted from Supabase:', noteId);
    } catch (error) {
        console.error('Error deleting note:', error);
        const localNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        const filtered = localNotes.filter(n => n.id !== noteId);
        localStorage.setItem('stickyNotes', JSON.stringify(filtered));
    }
}

async function loadSettingsFromSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase not initialized');
        }
        
        const { data, error } = await window.supabase
            .from('settings')
            .select('*')
            .eq('id', 'inputStyling')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data && data.data) {
            inputStylingSettings = data.data;
            console.log('Settings loaded from Supabase');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        inputStylingSettings = JSON.parse(localStorage.getItem('inputStylingSettings')) || {};
    }
}

async function saveSettingsToSupabase() {
    try {
        // Only save data column with id
        const settingsData = {
            id: 'inputStyling',
            data: inputStylingSettings
        };
        const { error } = await window.supabase
            .from('settings')
            .upsert(settingsData);
        
        if (error) throw error;
        console.log('Settings saved to Supabase');
    } catch (error) {
        console.error('Error saving settings:', error);
        localStorage.setItem('inputStylingSettings', JSON.stringify(inputStylingSettings));
    }
}

// Load all data on page load
async function loadAllData() {
    await Promise.all([
        loadWorkersFromSupabase(),
        loadActivitiesFromSupabase(),
        loadNotesFromSupabase(),
        loadSettingsFromSupabase()
    ]);
    console.log('All data loaded from Supabase');
}

// DOM Elements
const screens = {
    home: document.getElementById('homeScreen'),
    addWorker: document.getElementById('addWorkerScreen'),
    workerList: document.getElementById('workerListScreen'),
    workerProfile: document.getElementById('workerProfileScreen'),
    dailyWork: document.getElementById('dailyWorkScreen'),
    monthlyWork: document.getElementById('monthlyWorkScreen'),
    yearlyWork: document.getElementById('yearlyWorkScreen'),
    analytics: document.getElementById('analyticsScreen')
};

const fontSelector = document.getElementById('fontSelector');
const noteTitleInput = document.getElementById('noteTitle');
const noteTextInput = document.getElementById('noteText');
const noteColorSelect = document.getElementById('noteColor');
const notesContainer = document.getElementById('notesContainer');

// Apply theme colors
function applyTheme(theme) {
    const root = document.documentElement;
    
    const themes = {
        default: {
            primary: '#667eea',
            secondary: '#764ba2',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        green: {
            primary: '#00b894',
            secondary: '#00cec9',
            gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)'
        },
        orange: {
            primary: '#fd79a8',
            secondary: '#e84393',
            gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
        },
        red: {
            primary: '#d63031',
            secondary: '#e17055',
            gradient: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)'
        }
    };
    
    const selectedTheme = themes[theme] || themes.default;
    root.style.setProperty('--gradient-primary', selectedTheme.gradient);
}

function applySavedFont() {
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    const savedFont = settings.font || localStorage.getItem('selectedFont') || "'Segoe UI', sans-serif";
    
    console.log('Applying saved font:', savedFont);
    
    // Apply to document element
    document.documentElement.style.setProperty('--app-font', savedFont);
    
    // Also apply directly to body for better mobile support
    document.body.style.fontFamily = savedFont;
    
    if (fontSelector) {
        fontSelector.value = savedFont;
    }
    
    // Apply theme if saved
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    console.log('Font applied successfully');
}

function saveNotes() {
    // Firebase sync handled by individual note save functions
    // This is kept for backward compatibility
}

function renderNotes() {
    if (!notesContainer) return;

    if (!notes.length) {
        notesContainer.innerHTML = '<div class="empty-notes">✨ No notes yet. Add a colorful reminder for your team!</div>';
        return;
    }

    const noteMarkup = notes.map((note, index) => `
        <article class="sticky-note ${note.color}" style="--note-rotate: ${note.rotate || 0}deg; animation-delay: ${index * 0.1}s;">
            <div class="note-pin"></div>
            <h4>${escapeHtml(note.title || 'Untitled')}</h4>
            <p>${escapeHtml(note.text || '')}</p>
            <div class="note-actions">
                <button class="note-delete" data-note-id="${note.id}" type="button">🗑️ Delete</button>
            </div>
        </article>
    `).join('');

    notesContainer.innerHTML = noteMarkup;

    document.querySelectorAll('.note-delete').forEach((button) => {
        button.addEventListener('click', () => {
            const { noteId } = button.dataset;
            const noteElement = button.closest('.sticky-note');
            noteElement.style.transform = 'scale(0.8) rotate(10deg)';
            noteElement.style.opacity = '0';
            
            setTimeout(() => {
                notes = notes.filter((note) => note.id !== noteId);
                deleteNoteFromSupabase(noteId);
                renderNotes();
            }, 300);
        });
    });
}

function addNote() {
    const title = noteTitleInput.value.trim();
    const text = noteTextInput.value.trim();
    const color = noteColorSelect.value;

    if (!text) {
        noteTextInput.focus();
        return;
    }

    const newNote = {
        id: Date.now().toString(),
        title: title || 'Quick Note',
        text,
        color,
        rotate: ((Math.random() * 5) - 2.5)
    };

    notes.unshift(newNote);
    saveNoteToSupabase(newNote);
    renderNotes();
    noteTitleInput.value = '';
    noteTextInput.value = '';
    noteColorSelect.value = 'yellow';
    noteTitleInput.focus();
}

if (fontSelector) {
    fontSelector.addEventListener('change', (event) => {
        const selectedFont = event.target.value;
        console.log('Font changed to:', selectedFont);
        
        // Apply to document element
        document.documentElement.style.setProperty('--app-font', selectedFont);
        
        // Also apply directly to body for better mobile support
        document.body.style.fontFamily = selectedFont;
        
        // Force reflow for mobile browsers
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Update settings
        const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
        settings.font = selectedFont;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        // Also save to selectedFont for backward compatibility
        localStorage.setItem('selectedFont', selectedFont);
        
        console.log('Font applied successfully');
    });
}

if (document.getElementById('saveNoteBtn')) {
    document.getElementById('saveNoteBtn').addEventListener('click', addNote);
}

if (document.getElementById('clearNoteBtn')) {
    document.getElementById('clearNoteBtn').addEventListener('click', () => {
        noteTitleInput.value = '';
        noteTextInput.value = '';
        noteColorSelect.value = 'yellow';
        noteTitleInput.focus();
    });
}

if (document.getElementById('addNoteBtn')) {
    document.getElementById('addNoteBtn').addEventListener('click', () => {
        noteTitleInput.focus();
        const composer = document.getElementById('noteComposer');
        composer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// Initialize Supabase and load data
if (typeof window.supabase !== 'undefined') {
    loadAllData().then(() => {
        applySavedFont();
        renderNotes();
        updateDashboardStats();
    });
} else {
    // Fallback to localStorage if Supabase not initialized
    console.log('Supabase not initialized, using localStorage');
    workers = JSON.parse(localStorage.getItem('workers')) || [];
    activities = JSON.parse(localStorage.getItem('activities')) || [];
    notes = JSON.parse(localStorage.getItem('stickyNotes')) || [
        {
            id: 'note-demo-1',
            title: 'Delivery Plan',
            text: 'Need to verify route timings and assign extra support for Sunday shifts.',
            color: 'yellow',
            rotate: -2
        },
        {
            id: 'note-demo-2',
            title: 'Safety Check',
            text: 'Inspect helmets and check maintenance tools before the next shift.',
            color: 'pink',
            rotate: 2
        }
    ];
    inputStylingSettings = JSON.parse(localStorage.getItem('inputStylingSettings')) || {};
    applySavedFont();
    renderNotes();
    updateDashboardStats();
}

// ============================================
// NAVIGATION SYSTEM
// ============================================

// Global function to close sidebar (for inline onclick)
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
        removeBackdrop();
        console.log('Sidebar closed via global function');
    }
}

// Create backdrop for mobile sidebar
function createBackdrop() {
    // Remove existing backdrop if any
    removeBackdrop();
    
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop active';
    
    backdrop.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
        removeBackdrop();
    });
    
    document.body.appendChild(backdrop);
    console.log('Backdrop created');
}

// Remove backdrop
function removeBackdrop() {
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
    
    // Update page title
    const titles = {
        home: 'Dashboard',
        addWorker: 'Add Worker',
        workerList: 'Worker Management',
        workerProfile: 'Worker Profile',
        dailyWork: 'Daily Work',
        monthlyWork: 'Monthly Work',
        yearlyWork: 'Yearly Work',
        analytics: 'Analytics'
    };
    
    document.getElementById('pageTitle').textContent = titles[screenName] || 'Dashboard';
    
    // Update sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenName) {
            item.classList.add('active');
        }
    });
    
    // Close sidebar on mobile when navigating
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        removeBackdrop();
    }
    
    // Update screen-specific data
    if (screenName === 'home') {
        updateDashboardStats();
    } else if (screenName === 'workerList') {
        renderWorkerList();
    } else if (screenName === 'analytics') {
        updateAnalytics();
    }
}

// Sidebar Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const screenName = item.dataset.screen;
        if (screenName) {
            currentWorker = null;
            currentWorkType = null;
            showScreen(screenName);
        }
    });
});

// Mobile Menu Toggle
document.getElementById('menuToggle').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sidebar = document.querySelector('.sidebar');
    const isOpen = sidebar.classList.contains('active');
    
    console.log('Menu toggle clicked, currently open:', isOpen);
    
    // Toggle sidebar
    sidebar.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        // Open sidebar
        createBackdrop();
        console.log('Sidebar opened');
        
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = 'hidden';
    } else {
        // Close sidebar
        removeBackdrop();
        console.log('Sidebar closed');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
});



// Handle browser back button
window.addEventListener('popstate', (e) => {
    const sidebar = document.querySelector('.sidebar');
    console.log('Popstate event fired, sidebar active:', sidebar.classList.contains('active'), 'state:', e.state);
    
    // If sidebar is open and back button is pressed, close sidebar
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        removeBackdrop();
        console.log('Sidebar closed via back button');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Don't prevent default - let the browser handle the back navigation
        // Just close the sidebar and let the browser navigate back
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    
    // Show/hide backdrop based on screen size
    if (backdrop) {
        if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
            backdrop.style.display = 'block';
        } else {
            backdrop.style.display = 'none';
        }
    }
});



// ============================================
// DASHBOARD FUNCTIONALITY
// ============================================

document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
        const targetScreen = card.dataset.screen;
        if (targetScreen) {
            showScreen(targetScreen);
        }
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const targetScreen = card.dataset.screen;
            if (targetScreen) {
                showScreen(targetScreen);
            }
        }
    });
});

function updateDashboardStats() {
    const totalWorkers = workers.length;
    let activeTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    
    workers.forEach(worker => {
        ['dailyWork', 'monthlyWork', 'yearlyWork'].forEach(workType => {
            if (Array.isArray(worker[workType])) {
                worker[workType].forEach(work => {
                    if (work.status === 'pending') {
                        activeTasks++;
                        pendingTasks++;
                    } else if (work.status === 'done') {
                        completedTasks++;
                    }
                });
            }
        });
    });
    
    document.getElementById('totalWorkers').textContent = totalWorkers;
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// Quick Action Buttons
document.getElementById('addWorkerBtn').addEventListener('click', () => {
    showScreen('addWorker');
});

document.getElementById('workerListBtn').addEventListener('click', () => {
    showScreen('workerList');
});

document.getElementById('analyticsBtn').addEventListener('click', () => {
    showScreen('analytics');
});

// ============================================
// WORKER MANAGEMENT
// ============================================

document.getElementById('addWorkerFromList').addEventListener('click', () => {
    showScreen('addWorker');
});

document.getElementById('addFirstWorker').addEventListener('click', () => {
    showScreen('addWorker');
});

document.getElementById('cancelAddWorker').addEventListener('click', () => {
    document.getElementById('addWorkerForm').reset();
    showScreen('home');
});

// Prevent duplicate submissions
let isSubmitting = false;

document.getElementById('addWorkerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
        console.log('Form already submitting, preventing duplicate');
        return;
    }
    
    isSubmitting = true;
    
    const name = document.getElementById('workerName').value.trim();
    const mobile = document.getElementById('workerMobile').value.trim();
    const whatsapp = document.getElementById('workerWhatsApp').value.trim();
    const department = document.getElementById('workerDepartment').value;
    const details = document.getElementById('workerDetails').value.trim();
    const avatarInput = document.getElementById('workerAvatarInput');
    
    // Handle avatar upload to Supabase Storage
    let avatarUrl = null;
    if (avatarInput.files && avatarInput.files[0]) {
        const workerId = Date.now().toString();
        avatarUrl = await uploadAvatarToSupabase(avatarInput.files[0], workerId);
        saveWorkerWithAvatar(avatarUrl, workerId);
    } else {
        saveWorkerWithAvatar(null, Date.now().toString());
    }
    
    function saveWorkerWithAvatar(avatarUrl, workerId) {
        if (name && mobile) {
            const newWorker = {
                id: workerId,
                name: name,
                mobile: mobile,
                // Note: whatsapp field not in Workers table yet, will add it later
                department: department,
                details: details,
                avatar: avatarUrl,
                cardColor: '#667eea',
                dailyWork: [],
                monthlyWork: [],
                yearlyWork: [],
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            workers.push(newWorker);
            saveWorkerToSupabase(newWorker);
            addActivity('New worker added', `${name} has been added to the system`, 'worker');
            
            document.getElementById('addWorkerForm').reset();
            showScreen('workerList');
            
            // Reset submission flag after a delay
            setTimeout(() => {
                isSubmitting = false;
            }, 1000);
        } else {
            isSubmitting = false;
        }
    }
});

function saveWorkers() {
    // Firebase sync handled by individual worker save functions
    // This is kept for backward compatibility
}

function renderWorkerList() {
    const workerList = document.getElementById('workerList');
    const noWorkers = document.getElementById('noWorkers');
    const searchTerm = document.getElementById('workerSearch').value.toLowerCase();
    
    let filteredWorkers = workers;
    
    if (searchTerm) {
        filteredWorkers = workers.filter(worker => 
            worker.name.toLowerCase().includes(searchTerm) ||
            worker.mobile.includes(searchTerm) ||
            (worker.email && worker.email.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filteredWorkers.length === 0) {
        workerList.innerHTML = '';
        noWorkers.style.display = 'block';
        return;
    }
    
    noWorkers.style.display = 'none';
    workerList.innerHTML = filteredWorkers.map(worker => {
        const cardColor = worker.cardColor || 'var(--white)';
        const textColor = getContrastColor(cardColor);
        
        return `
        <div class="worker-card" data-worker-id="${worker.id}" style="background-color: ${cardColor}; color: ${textColor};">
            <button class="card-color-btn" data-worker-id="${worker.id}" title="Change card color">
                <i class="fas fa-palette"></i>
            </button>
            <div class="worker-card-avatar">
                ${worker.avatar 
                    ? `<img src="${worker.avatar}" alt="${escapeHtml(worker.name)}">` 
                    : `<i class="fas fa-user"></i>`
                }
            </div>
            <h3 style="color: ${textColor};">${escapeHtml(worker.name)}</h3>
            <p style="color: ${textColor};"><i class="fas fa-phone"></i> ${escapeHtml(worker.mobile)}</p>
            ${worker.department ? `<p style="color: ${textColor};"><i class="fas fa-building"></i> ${escapeHtml(worker.department)}</p>` : ''}
        </div>
    `;
    }).join('');
    
    // Add click listeners to worker cards
    document.querySelectorAll('.worker-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if color button was clicked
            if (e.target.closest('.card-color-btn')) {
                e.stopPropagation();
                const workerId = e.target.closest('.card-color-btn').dataset.workerId;
                showCardColorPicker(workerId);
                return;
            }
            
            const workerId = card.dataset.workerId;
            currentWorker = workers.find(w => w.id === workerId);
            if (currentWorker) {
                showWorkerProfile();
            }
        });
    });
}

// Worker Search
document.getElementById('workerSearch').addEventListener('input', () => {
    renderWorkerList();
});

// Filter Buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Implement filtering logic
        renderWorkerList();
    });
});

// Worker Card Color Picker
function showCardColorPicker(workerId) {
    currentCardColorWorkerId = workerId;
    const worker = workers.find(w => w.id === workerId);
    
    if (worker) {
        const cardColorPicker = document.getElementById('workerCardColorPicker');
        const colorPicker = document.getElementById('cardColorPicker');
        
        colorPicker.value = worker.cardColor || '#667eea';
        cardColorPicker.style.display = 'flex';
        setTimeout(() => {
            cardColorPicker.classList.add('active');
        }, 10);
    }
}

function hideCardColorPicker() {
    const cardColorPicker = document.getElementById('workerCardColorPicker');
    cardColorPicker.classList.remove('active');
    setTimeout(() => {
        cardColorPicker.style.display = 'none';
    }, 300);
    currentCardColorWorkerId = null;
}

document.getElementById('cardColorPicker').addEventListener('input', (e) => {
    if (currentCardColorWorkerId) {
        const workerIndex = workers.findIndex(w => w.id === currentCardColorWorkerId);
        if (workerIndex !== -1) {
            workers[workerIndex].cardColor = e.target.value;
            saveWorkerToSupabase(workers[workerIndex]);
            renderWorkerList();
        }
    }
});

document.getElementById('closeCardColorPicker').addEventListener('click', hideCardColorPicker);

// Close color picker when clicking outside
document.addEventListener('click', (e) => {
    const cardColorPicker = document.getElementById('workerCardColorPicker');
    if (!e.target.closest('.worker-card-color-picker') && !e.target.closest('.card-color-btn')) {
        hideCardColorPicker();
    }
});

// ============================================
// WORKER PROFILE
// ============================================

function showWorkerProfile() {
    if (!currentWorker) return;
    
    document.getElementById('workerProfileName').textContent = currentWorker.name;
    document.getElementById('workerProfileMobile').textContent = currentWorker.mobile;
    document.getElementById('workerProfileWhatsApp').textContent = currentWorker.mobile; // Use mobile since whatsapp column not in table yet
    document.getElementById('workerProfileEmail').textContent = currentWorker.email || 'Not provided';
    document.getElementById('workerProfileDepartment').textContent = currentWorker.department || 'Not assigned';
    document.getElementById('workerProfileDetails').textContent = currentWorker.details || 'No additional details';
    
    // Update avatar
    const avatarContainer = document.getElementById('workerProfileAvatar');
    const icon = avatarContainer.querySelector('.fas.fa-user');
    
    // Remove existing image if any
    const existingImg = avatarContainer.querySelector('img');
    if (existingImg) {
        existingImg.remove();
    }
    
    console.log('Worker avatar URL:', currentWorker.avatar);
    
    if (currentWorker.avatar) {
        const img = document.createElement('img');
        img.src = currentWorker.avatar;
        img.alt = currentWorker.name;
        img.onload = () => console.log('Avatar image loaded successfully');
        img.onerror = () => console.error('Avatar image failed to load');
        avatarContainer.appendChild(img);
        icon.style.display = 'none';
    } else {
        icon.style.display = 'block';
    }
    
    // Update profile card color
    const workerInfoCard = document.querySelector('.worker-info-card');
    if (workerInfoCard) {
        const cardColor = currentWorker.cardColor || 'var(--white)';
        workerInfoCard.style.backgroundColor = cardColor;
        
        // Adjust text color based on background brightness
        const textColor = getContrastColor(cardColor);
        workerInfoCard.style.color = textColor;
        workerInfoCard.querySelectorAll('h2, p, span').forEach(el => {
            el.style.color = textColor;
        });
    }
    
    // Update color picker value
    const profileColorPicker = document.getElementById('workerColorPicker');
    if (profileColorPicker) {
        profileColorPicker.value = currentWorker.cardColor || '#667eea';
    }
    
    // Update stats
    document.getElementById('dailyTaskCount').textContent = currentWorker.dailyWork.length;
    document.getElementById('monthlyTaskCount').textContent = currentWorker.monthlyWork.length;
    document.getElementById('yearlyTaskCount').textContent = currentWorker.yearlyWork.length;
    
    // Calculate completion rate
    const totalTasks = currentWorker.dailyWork.length + currentWorker.monthlyWork.length + currentWorker.yearlyWork.length;
    const completedTasks = currentWorker.dailyWork.filter(w => w.status === 'done').length +
                          currentWorker.monthlyWork.filter(w => w.status === 'done').length +
                          currentWorker.yearlyWork.filter(w => w.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    // Update work counts
    document.getElementById('dailyWorkCount').textContent = `${currentWorker.dailyWork.length} tasks`;
    document.getElementById('monthlyWorkCount').textContent = `${currentWorker.monthlyWork.length} tasks`;
    document.getElementById('yearlyWorkCount').textContent = `${currentWorker.yearlyWork.length} tasks`;
    
    showScreen('workerProfile');
}

document.getElementById('backToWorkerList').addEventListener('click', () => {
    currentWorker = null;
    renderWorkerList();
    showScreen('workerList');
});

// Avatar upload in profile screen
document.getElementById('avatarUploadBtn').addEventListener('click', () => {
    document.getElementById('avatarUpload').click();
});

document.getElementById('avatarUpload').addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
        // Upload to Supabase Storage
        const avatarUrl = await uploadAvatarToSupabase(e.target.files[0], currentWorker.id);
        
        if (avatarUrl) {
            // Update current worker's avatar
            currentWorker.avatar = avatarUrl;
            
            // Update in workers array
            const workerIndex = workers.findIndex(w => w.id === currentWorker.id);
            if (workerIndex !== -1) {
                workers[workerIndex] = currentWorker;
                saveWorkerToSupabase(currentWorker);
            }
            
            // Update UI
            const avatarContainer = document.getElementById('workerProfileAvatar');
            const icon = avatarContainer.querySelector('.fas.fa-user');
            
            // Remove existing image if any
            const existingImg = avatarContainer.querySelector('img');
            if (existingImg) {
                existingImg.remove();
            }
            
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = currentWorker.name;
            avatarContainer.appendChild(img);
            icon.style.display = 'none';
            
            addActivity('Profile photo updated', `${currentWorker.name}'s profile photo has been updated`, 'worker');
        }
    }
});

// Profile card color picker
if (document.getElementById('workerColorPicker')) {
    document.getElementById('workerColorPicker').addEventListener('input', (e) => {
        if (currentWorker) {
            const color = e.target.value;
            currentWorker.cardColor = color;
            
            // Update UI
            const workerInfoCard = document.querySelector('.worker-info-card');
            if (workerInfoCard) {
                workerInfoCard.style.backgroundColor = color;
                
                // Adjust text color based on background brightness
                const textColor = getContrastColor(color);
                workerInfoCard.style.color = textColor;
                workerInfoCard.querySelectorAll('h2, p, span').forEach(el => {
                    el.style.color = textColor;
                });
            }
            
            // Save to workers array
            const workerIndex = workers.findIndex(w => w.id === currentWorker.id);
            if (workerIndex !== -1) {
                workers[workerIndex] = currentWorker;
                saveWorkerToSupabase(currentWorker);
            }
        }
    });
}

// Helper function to determine contrast color (black or white based on background)
function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#2d3436' : '#ffffff';
}

// ============================================
// WORK MANAGEMENT
// ============================================

document.getElementById('dailyWorkBtn').addEventListener('click', () => {
    currentWorkType = 'daily';
    document.getElementById('dailyWorkerName').textContent = currentWorker.name;
    renderWorkList('daily');
    showScreen('dailyWork');
});

document.getElementById('monthlyWorkBtn').addEventListener('click', () => {
    currentWorkType = 'monthly';
    document.getElementById('monthlyWorkerName').textContent = currentWorker.name;
    renderWorkList('monthly');
    showScreen('monthlyWork');
});

document.getElementById('yearlyWorkBtn').addEventListener('click', () => {
    currentWorkType = 'yearly';
    document.getElementById('yearlyWorkerName').textContent = currentWorker.name;
    renderWorkList('yearly');
    showScreen('yearlyWork');
});

document.getElementById('addDailyWork').addEventListener('click', () => {
    currentWorkType = 'daily';
    openAddWorkModal('Daily Work');
});

document.getElementById('addMonthlyWork').addEventListener('click', () => {
    currentWorkType = 'monthly';
    openAddWorkModal('Monthly Work');
});

document.getElementById('addYearlyWork').addEventListener('click', () => {
    currentWorkType = 'yearly';
    openAddWorkModal('Yearly Work');
});

// Add first task buttons
document.querySelectorAll('.add-first-task').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        currentWorkType = type;
        openAddWorkModal(`${type.charAt(0).toUpperCase() + type.slice(1)} Work`);
    });
});

// Work filter buttons
document.querySelectorAll('.filter-work-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-work-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderWorkList(currentWorkType);
    });
});

function renderWorkList(workType) {
    if (!currentWorker) return;
    
    const workList = document.getElementById(`${workType}WorkList`);
    const noWork = document.getElementById(`no${workType.charAt(0).toUpperCase() + workType.slice(1)}Work`);
    const workArray = currentWorker[`${workType}Work`];
    
    // Update summary
    const completed = workArray.filter(w => w.status === 'done').length;
    const pending = workArray.filter(w => w.status === 'pending').length;
    document.getElementById(`${workType}Completed`).textContent = completed;
    document.getElementById(`${workType}Pending`).textContent = pending;
    
    // Filter work based on current filter
    let filteredWork = workArray;
    if (currentFilter === 'pending') {
        filteredWork = workArray.filter(w => w.status === 'pending');
    } else if (currentFilter === 'completed') {
        filteredWork = workArray.filter(w => w.status === 'done');
    }
    
    if (filteredWork.length === 0) {
        workList.innerHTML = '';
        noWork.style.display = 'block';
        return;
    }
    
    noWork.style.display = 'none';
    workList.innerHTML = filteredWork.map(work => `
        <div class="work-item ${work.status}" data-work-id="${work.id}">
            <div class="work-item-header">
                <div class="work-item-description">${escapeHtml(work.description)}</div>
                <div class="work-item-status">
                    <span class="status-badge ${work.status}">
                        ${work.status === 'done' ? '<i class="fas fa-check-circle"></i> Done' : 'Pending'}
                    </span>
                </div>
            </div>
            ${work.priority ? `<div class="work-priority priority-${work.priority}">${work.priority.charAt(0).toUpperCase() + work.priority.slice(1)} Priority</div>` : ''}
            ${work.dueDate ? `<div class="work-due-date"><i class="fas fa-calendar"></i> Due: ${formatDate(work.dueDate)}</div>` : ''}
            <div class="work-item-actions">
                ${work.status === 'pending' ? `
                    <button class="btn-mark-done" onclick="markAsDone('${work.id}')">
                        <i class="fas fa-check"></i> Mark as Done
                    </button>
                ` : `
                    <button class="btn-mark-done" onclick="markAsPending('${work.id}')">
                        <i class="fas fa-undo"></i> Mark as Pending
                    </button>
                `}
                <button class="btn-reminder" onclick="sendReminder('${work.id}')">
                    <i class="fab fa-whatsapp"></i> Reminder
                </button>
                <button class="btn-delete" onclick="deleteWork('${work.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function markAsDone(workId) {
    if (!currentWorker || !currentWorkType) return;
    
    const workKey = `${currentWorkType}Work`;
    const work = currentWorker[workKey].find(w => w.id === workId);
    
    if (work) {
        work.status = 'done';
        work.completedAt = new Date().toISOString();
        
        updateWorkerAndRefresh();
        addActivity('Task completed', `"${work.description.substring(0, 30)}..." marked as done`, 'task');
    }
}

function markAsPending(workId) {
    if (!currentWorker || !currentWorkType) return;
    
    const workKey = `${currentWorkType}Work`;
    const work = currentWorker[workKey].find(w => w.id === workId);
    
    if (work) {
        work.status = 'pending';
        delete work.completedAt;
        
        updateWorkerAndRefresh();
    }
}

function deleteWork(workId) {
    if (!currentWorker || !currentWorkType) return;
    
    if (confirm('Are you sure you want to delete this work item?')) {
        const workKey = `${currentWorkType}Work`;
        const workIndex = currentWorker[workKey].findIndex(w => w.id === workId);
        
        if (workIndex !== -1) {
            const deletedWork = currentWorker[workKey][workIndex];
            currentWorker[workKey].splice(workIndex, 1);
            
            updateWorkerAndRefresh();
            addActivity('Task deleted', `"${deletedWork.description.substring(0, 30)}..." removed`, 'task');
        }
    }
}

function sendReminder(workId) {
    if (!currentWorker) return;
    
    const workKey = `${currentWorkType}Work`;
    const work = currentWorker[workKey].find(w => w.id === workId);
    
    // Use mobile number (whatsapp column not in table yet)
    const mobileNumber = currentWorker.mobile;
    
    if (work && mobileNumber) {
        // Clean mobile number (remove spaces, dashes, etc.)
        let cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
        
        // If number starts with 0, replace with country code
        if (cleanNumber.startsWith('0')) {
            cleanNumber = '91' + cleanNumber.substring(1);
        }
        
        // If number doesn't have country code, add it
        if (!cleanNumber.startsWith('91') && cleanNumber.length === 10) {
            cleanNumber = '91' + cleanNumber;
        }
        
        // Default message as requested
        const message = `Your work is ending soon, please complete your work as soon as possible.\n\nTask: ${work.description}`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        
        addActivity('Reminder sent', `Reminder sent to ${currentWorker.name} for task: "${work.description.substring(0, 30)}..."`, 'task');
    }
}

function updateWorkerAndRefresh() {
    const workerIndex = workers.findIndex(w => w.id === currentWorker.id);
    if (workerIndex !== -1) {
        workers[workerIndex] = currentWorker;
        saveWorkerToSupabase(currentWorker);
    }
    renderWorkList(currentWorkType);
}

// ============================================
// MODAL MANAGEMENT
// ============================================

const modal = document.getElementById('addWorkModal');
const modalTitle = document.getElementById('modalTitle');

function openAddWorkModal(title) {
    modalTitle.textContent = `Add ${title}`;
    modal.classList.add('active');
    document.getElementById('workDescription').focus();
}

document.getElementById('closeModal').addEventListener('click', () => {
    modal.classList.remove('active');
    document.getElementById('addWorkForm').reset();
});

document.getElementById('cancelAddWork').addEventListener('click', () => {
    modal.classList.remove('active');
    document.getElementById('addWorkForm').reset();
});

document.getElementById('addWorkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('workDescription').value.trim();
    const priority = document.getElementById('workPriority').value;
    const dueDate = document.getElementById('workDueDate').value;
    
    if (description && currentWorker && currentWorkType) {
        const newWork = {
            id: Date.now().toString(),
            description: description,
            status: 'pending',
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };
        
        const workKey = `${currentWorkType}Work`;
        currentWorker[workKey].push(newWork);
        
        updateWorkerAndRefresh();
        addActivity('New task added', `"${description.substring(0, 30)}..." assigned to ${currentWorker.name}`, 'task');
        
        modal.classList.remove('active');
        document.getElementById('addWorkForm').reset();
    }
});

// Close modal on backdrop click
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
        modal.classList.remove('active');
        document.getElementById('addWorkForm').reset();
    }
});

// ============================================
// BACK NAVIGATION
// ============================================

document.getElementById('backToProfileDaily').addEventListener('click', () => {
    currentFilter = 'all';
    document.querySelectorAll('.filter-work-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-work-btn[data-filter="all"]').classList.add('active');
    showWorkerProfile();
});

document.getElementById('backToProfileMonthly').addEventListener('click', () => {
    currentFilter = 'all';
    document.querySelectorAll('.filter-work-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-work-btn[data-filter="all"]').classList.add('active');
    showWorkerProfile();
});

document.getElementById('backToProfileYearly').addEventListener('click', () => {
    currentFilter = 'all';
    document.querySelectorAll('.filter-work-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-work-btn[data-filter="all"]').classList.add('active');
    showWorkerProfile();
});

// ============================================
// ANALYTICS
// ============================================

function updateAnalytics() {
    // Calculate task distribution
    let dailyCount = 0, monthlyCount = 0, yearlyCount = 0;
    let totalTasks = 0;
    
    workers.forEach(worker => {
        dailyCount += worker.dailyWork.length;
        monthlyCount += worker.monthlyWork.length;
        yearlyCount += worker.yearlyWork.length;
    });
    
    totalTasks = dailyCount + monthlyCount + yearlyCount;
    
    if (totalTasks > 0) {
        document.getElementById('distDaily').textContent = Math.round((dailyCount / totalTasks) * 100) + '%';
        document.getElementById('distMonthly').textContent = Math.round((monthlyCount / totalTasks) * 100) + '%';
        document.getElementById('distYearly').textContent = Math.round((yearlyCount / totalTasks) * 100) + '%';
    }
    
    // Update top performers
    updateTopPerformers();
}

function updateTopPerformers() {
    const performersList = document.getElementById('topPerformersList');
    
    if (workers.length === 0) {
        performersList.innerHTML = '<p class="text-center">No workers to display</p>';
        return;
    }
    
    // Calculate performance metrics for each worker
    const workerPerformance = workers.map(worker => {
        const totalTasks = worker.dailyWork.length + worker.monthlyWork.length + worker.yearlyWork.length;
        const completedTasks = worker.dailyWork.filter(w => w.status === 'done').length +
                              worker.monthlyWork.filter(w => w.status === 'done').length +
                              worker.yearlyWork.filter(w => w.status === 'done').length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return {
            ...worker,
            completionRate,
            totalTasks,
            completedTasks
        };
    });
    
    // Sort by completion rate
    workerPerformance.sort((a, b) => b.completionRate - a.completionRate);
    
    // Display top 5 performers
    const topPerformers = workerPerformance.slice(0, 5);
    
    performersList.innerHTML = topPerformers.map((worker, index) => `
        <div class="performer-item">
            <div class="performer-rank">${index + 1}</div>
            <div class="performer-info">
                <h4>${escapeHtml(worker.name)}</h4>
                <p>${worker.completedTasks}/${worker.totalTasks} tasks completed</p>
            </div>
            <div class="performer-rate">
                <span class="rate-value">${Math.round(worker.completionRate)}%</span>
                <span class="rate-label">Completion</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// ACTIVITY TRACKING
// ============================================

function addActivity(title, description, type = 'system') {
    const activity = {
        id: Date.now().toString(),
        title,
        description,
        timestamp: new Date().toISOString()
    };
    
    activities.unshift(activity);
    
    // Keep only last 10 activities
    if (activities.length > 10) {
        activities = activities.slice(0, 10);
    }
    
    saveActivityToSupabase(activity);
    updateActivityList();
    
    // Also add as notification
    addNotification(type, title, description);
}

function updateActivityList() {
    const activityList = document.getElementById('activityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-content">
                    <p class="activity-text">No recent activity</p>
                </div>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="activity-content">
                <p class="activity-text">${escapeHtml(activity.title)}</p>
                <p class="activity-description">${escapeHtml(activity.description)}</p>
                <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(timestamp);
}

// Global Search
document.getElementById('globalSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // Implement global search logic
    console.log('Global search:', searchTerm);
});

// ============================================
// INPUT STYLING FEATURE
// ============================================

const inputStylingToolbar = document.getElementById('inputStylingToolbar');
const inputFontSelector = document.getElementById('inputFontSelector');
const inputColorPicker = document.getElementById('inputColorPicker');
const inputFontSize = document.getElementById('inputFontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const closeToolbarBtn = document.getElementById('closeToolbar');

let currentActiveInput = null;

// Apply saved styling to inputs on page load
function applySavedInputStyling() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
    inputs.forEach(input => {
        const inputId = input.id || input.name || input.classList[0];
        const settings = inputStylingSettings[inputId];
        
        if (settings) {
            input.style.fontFamily = settings.fontFamily;
            input.style.color = settings.color;
            input.style.fontSize = settings.fontSize;
        }
    });
}

// Show toolbar when input is focused
function showInputToolbar(input) {
    currentActiveInput = input;
    
    console.log('Toolbar shown for input:', input.id || input.name);
    
    // Calculate position relative to input
    const inputRect = input.getBoundingClientRect();
    const toolbarWidth = inputStylingToolbar.offsetWidth || 400;
    
    // Position toolbar above the input
    inputStylingToolbar.style.position = 'fixed';
    inputStylingToolbar.style.left = inputRect.left + 'px';
    inputStylingToolbar.style.top = (inputRect.top - 60) + 'px';
    
    // Ensure toolbar doesn't go off screen
    if (inputRect.left + toolbarWidth > window.innerWidth) {
        inputStylingToolbar.style.left = (window.innerWidth - toolbarWidth - 20) + 'px';
    }
    
    inputStylingToolbar.classList.add('active');
    
    // Load current input's settings or use defaults
    const inputId = input.id || input.name || input.classList[0];
    const settings = inputStylingSettings[inputId] || {
        fontFamily: "'Segoe UI', sans-serif",
        color: "#2d3436",
        fontSize: "16px"
    };
    
    console.log('Loaded settings:', settings);
    
    // Update toolbar controls
    inputFontSelector.value = settings.fontFamily;
    inputColorPicker.value = settings.color;
    inputFontSize.value = parseInt(settings.fontSize);
    fontSizeValue.textContent = settings.fontSize;
    
    // Apply saved styling immediately when input is focused
    applyInputStyling();
}

// Hide toolbar
function hideInputToolbar() {
    inputStylingToolbar.classList.remove('active');
    currentActiveInput = null;
}

// Apply styling to current input
function applyInputStyling() {
    if (!currentActiveInput) return;
    
    const fontFamily = inputFontSelector.value;
    const color = inputColorPicker.value;
    const fontSize = inputFontSize.value + 'px';
    
    console.log('Applying styling to:', currentActiveInput.id || currentActiveInput.name);
    console.log('Before:', {
        fontFamily: currentActiveInput.style.fontFamily,
        color: currentActiveInput.style.color,
        fontSize: currentActiveInput.style.fontSize
    });
    
    // Apply to current input immediately with !important
    currentActiveInput.style.setProperty('font-family', fontFamily, 'important');
    currentActiveInput.style.setProperty('color', color, 'important');
    currentActiveInput.style.setProperty('font-size', fontSize, 'important');
    
    // Also apply directly to style for better compatibility
    currentActiveInput.style.fontFamily = fontFamily;
    currentActiveInput.style.color = color;
    currentActiveInput.style.fontSize = fontSize;
    
    // Force reflow to ensure styles are applied
    currentActiveInput.style.display = 'none';
    currentActiveInput.offsetHeight; // Trigger reflow
    currentActiveInput.style.display = '';
    
    console.log('After:', {
        fontFamily: currentActiveInput.style.fontFamily,
        color: currentActiveInput.style.color,
        fontSize: currentActiveInput.style.fontSize
    });
    
    // Save settings for this input
    const inputId = currentActiveInput.id || currentActiveInput.name || currentActiveInput.classList[0];
    inputStylingSettings[inputId] = {
        fontFamily,
        color,
        fontSize
    };
    
    saveSettingsToSupabase();
    
    // Update font size display
    fontSizeValue.textContent = fontSize;
    
    console.log('Applied styling:', { fontFamily, color, fontSize, inputId });
}

// Add focus event listeners to all inputs
function setupInputStyling() {
    const inputs = document.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), textarea');
    
    inputs.forEach(input => {
        // Skip toolbar inputs themselves
        if (input.closest('.input-styling-toolbar')) return;
        
        input.addEventListener('focus', () => {
            showInputToolbar(input);
        });
        
        // Apply any saved styling
        const inputId = input.id || input.name || input.classList[0];
        const settings = inputStylingSettings[inputId];
        if (settings) {
            input.style.fontFamily = settings.fontFamily;
            input.style.color = settings.color;
            input.style.fontSize = settings.fontSize;
        }
    });
}

// Toolbar event listeners - use 'input' for real-time updates
inputFontSelector.addEventListener('input', applyInputStyling);
inputColorPicker.addEventListener('input', applyInputStyling);
inputFontSize.addEventListener('input', applyInputStyling);

closeToolbarBtn.addEventListener('click', hideInputToolbar);

// Hide toolbar when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-styling-toolbar') && !e.target.matches('input[type="text"], input[type="tel"], textarea')) {
        hideInputToolbar();
    }
});

// Update toolbar position on scroll
window.addEventListener('scroll', () => {
    if (currentActiveInput && inputStylingToolbar.classList.contains('active')) {
        const inputRect = currentActiveInput.getBoundingClientRect();
        const toolbarWidth = inputStylingToolbar.offsetWidth || 400;
        
        inputStylingToolbar.style.left = inputRect.left + 'px';
        inputStylingToolbar.style.top = (inputRect.top - 60) + 'px';
        
        if (inputRect.left + toolbarWidth > window.innerWidth) {
            inputStylingToolbar.style.left = (window.innerWidth - toolbarWidth - 20) + 'px';
        }
    }
});

// Update toolbar position on window resize
window.addEventListener('resize', () => {
    if (currentActiveInput && inputStylingToolbar.classList.contains('active')) {
        const inputRect = currentActiveInput.getBoundingClientRect();
        const toolbarWidth = inputStylingToolbar.offsetWidth || 400;
        
        inputStylingToolbar.style.left = inputRect.left + 'px';
        inputStylingToolbar.style.top = (inputRect.top - 60) + 'px';
        
        if (inputRect.left + toolbarWidth > window.innerWidth) {
            inputStylingToolbar.style.left = (window.innerWidth - toolbarWidth - 20) + 'px';
        }
    }
});

// Initialize input styling on page load
document.addEventListener('DOMContentLoaded', () => {
    setupInputStyling();
});

// Also setup when dynamic content is added
const observer = new MutationObserver(() => {
    setupInputStyling();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Export functionality - Generate Professional PDF
document.getElementById('exportBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [102, 126, 234];
    const secondaryColor = [118, 75, 162];
    const textColor = [45, 52, 54];
    const lightGray = [233, 236, 239];
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Header Section
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('WorkForce Pro', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Worker Management Report', margin, 35);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 42);
    
    yPosition = 60;
    
    // Summary Statistics
    doc.setTextColor(...textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', margin, yPosition);
    yPosition += 10;
    
    const totalWorkers = workers.length;
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    
    workers.forEach(worker => {
        const allTasks = [...worker.dailyWork, ...worker.monthlyWork, ...worker.yearlyWork];
        totalTasks += allTasks.length;
        completedTasks += allTasks.filter(t => t.status === 'done').length;
        pendingTasks += allTasks.filter(t => t.status === 'pending').length;
    });
    
    // Stats Box
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Workers: ${totalWorkers}`, margin + 10, yPosition + 12);
    doc.text(`Total Tasks: ${totalTasks}`, margin + 10, yPosition + 22);
    doc.text(`Completed: ${completedTasks}`, margin + 80, yPosition + 12);
    doc.text(`Pending: ${pendingTasks}`, margin + 80, yPosition + 22);
    
    yPosition += 45;
    
    // Worker Details Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Worker Details', margin, yPosition);
    yPosition += 15;
    
    if (workers.length === 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('No workers found in the system.', margin, yPosition);
    } else {
        workers.forEach((worker, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 80) {
                doc.addPage();
                yPosition = margin;
                
                // Add header to new page
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, pageWidth, 30, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('WorkForce Pro - Worker Details (Continued)', margin, 20);
                yPosition = 45;
                
                doc.setTextColor(...textColor);
            }
            
            // Worker Card
            doc.setFillColor(...lightGray);
            doc.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F');
            
            // Worker info
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${worker.name}`, margin + 10, yPosition + 12);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Mobile: ${worker.mobile}`, margin + 10, yPosition + 22);
            doc.text(`Department: ${worker.department || 'Not assigned'}`, margin + 10, yPosition + 32);
            
            // Stats for this worker
            const workerTasks = [...worker.dailyWork, ...worker.monthlyWork, ...worker.yearlyWork];
            const workerCompleted = workerTasks.filter(t => t.status === 'done').length;
            const workerPending = workerTasks.filter(t => t.status === 'pending').length;
            
            doc.text(`Tasks: ${workerTasks.length} | Done: ${workerCompleted} | Pending: ${workerPending}`, margin + 120, yPosition + 22);
            
            yPosition += 50;
            
            // Work Details for this worker
            if (workerTasks.length > 0) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Work Tasks:', margin + 15, yPosition - 5);
                
                workerTasks.slice(0, 3).forEach((task, taskIndex) => {
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    
                    const taskText = `${taskIndex + 1}. ${task.description || 'No description'} (${task.status})`;
                    const truncatedText = taskText.length > 70 ? taskText.substring(0, 70) + '...' : taskText;
                    
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.text(truncatedText, margin + 20, yPosition);
                    yPosition += 8;
                });
                
                if (workerTasks.length > 3) {
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'italic');
                    doc.text(`... and ${workerTasks.length - 3} more tasks`, margin + 20, yPosition);
                    yPosition += 8;
                }
                
                yPosition += 5;
            }
        });
    }
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${totalPages} | WorkForce Pro Worker Management System`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }
    
    // Save the PDF
    const fileName = `worker-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    addActivity('PDF exported', `Worker report exported as ${fileName}`, 'system');
});

// Notifications button
document.getElementById('notificationsBtn').addEventListener('click', () => {
    openNotificationsModal();
});

// Notifications Modal Functions
function openNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    modal.classList.add('active');
    renderNotifications();
    updateNotificationBadge();
}

function closeNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    modal.classList.remove('active');
}

// Close notifications modal
document.getElementById('closeNotificationsModal').addEventListener('click', closeNotificationsModal);
document.getElementById('closeNotificationsFooterBtn').addEventListener('click', closeNotificationsModal);

// Close modal when clicking backdrop
document.getElementById('notificationsModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        closeNotificationsModal();
    }
});

// Add notification function
function addNotification(type, title, message) {
    const notification = {
        id: Date.now().toString(),
        type: type, // 'task', 'worker', 'system'
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

// Render notifications
function renderNotifications(filter = 'all') {
    const notificationsList = document.getElementById('notificationsList');
    const noNotifications = document.getElementById('noNotifications');
    
    let filteredNotifications = notifications;
    
    if (filter === 'unread') {
        filteredNotifications = notifications.filter(n => !n.read);
    } else if (filter === 'tasks') {
        filteredNotifications = notifications.filter(n => n.type === 'task');
    } else if (filter === 'workers') {
        filteredNotifications = notifications.filter(n => n.type === 'worker');
    }
    
    if (filteredNotifications.length === 0) {
        notificationsList.innerHTML = '';
        noNotifications.style.display = 'block';
        return;
    }
    
    noNotifications.style.display = 'none';
    
    const iconMap = {
        task: 'fa-tasks',
        worker: 'fa-user',
        system: 'fa-cog'
    };
    
    notificationsList.innerHTML = filteredNotifications.map(notification => `
        <div class="notification-item ${notification.type} ${notification.read ? '' : 'unread'}" data-notification-id="${notification.id}">
            <div class="notification-icon ${notification.type}">
                <i class="fas ${iconMap[notification.type] || 'fa-bell'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${escapeHtml(notification.title)}</div>
                <div class="notification-message">${escapeHtml(notification.message)}</div>
                <div class="notification-time">${formatTimeAgo(notification.timestamp)}</div>
            </div>
            <div class="notification-actions">
                <button class="notification-action-btn mark-read" title="Dismiss">
                    <i class="fas fa-check"></i>
                </button>
                <button class="notification-action-btn delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to notification actions
    document.querySelectorAll('.notification-action-btn.mark-read').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const notificationId = btn.closest('.notification-item').dataset.notificationId;
            markNotificationAsRead(notificationId);
        });
    });
    
    document.querySelectorAll('.notification-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const notificationId = btn.closest('.notification-item').dataset.notificationId;
            deleteNotification(notificationId);
        });
    });
    
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notificationId = item.dataset.notificationId;
            // Click on notification item also dismisses it
            deleteNotification(notificationId);
        });
    });
}

// Mark notification as read (and remove from list)
function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        // Remove the notification instead of just marking as read
        notifications = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications(document.querySelector('.notification-filter.active')?.dataset.filter || 'all');
        updateNotificationBadge();
    }
}

// Delete notification
function deleteNotification(notificationId) {
    notifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    renderNotifications(document.querySelector('.notification-filter.active')?.dataset.filter || 'all');
    updateNotificationBadge();
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
    openSettingsModal();
});

// Settings Modal Functions
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
    loadSettings();
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

// Close settings modal
document.getElementById('closeSettingsModal').addEventListener('click', closeSettingsModal);

// Close modal when clicking backdrop
document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        closeSettingsModal();
    }
});

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {
        font: "'Segoe UI', sans-serif",
        theme: 'default',
        taskReminders: true,
        workerUpdates: true
    };

    // Load font setting
    document.getElementById('settingsFont').value = settings.font;
    
    // Load theme setting
    document.getElementById('settingsTheme').value = settings.theme;
    
    // Load notification settings
    document.getElementById('taskReminders').checked = settings.taskReminders;
    document.getElementById('workerUpdates').checked = settings.workerUpdates;
    
    // Apply current settings
    applySettings(settings);
}

// Apply settings to the app
function applySettings(settings) {
    // Apply font
    document.documentElement.style.setProperty('--app-font', settings.font);
    document.body.style.fontFamily = settings.font; // Apply directly to body for mobile
    if (fontSelector) {
        fontSelector.value = settings.font;
    }
    
    // Apply theme
    applyTheme(settings.theme);
}

// Apply theme colors
function applyTheme(theme) {
    const root = document.documentElement;
    
    const themes = {
        default: {
            primary: '#667eea',
            secondary: '#764ba2',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        green: {
            primary: '#00b894',
            secondary: '#00cec9',
            gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)'
        },
        orange: {
            primary: '#fd79a8',
            secondary: '#e84393',
            gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
        },
        red: {
            primary: '#d63031',
            secondary: '#e17055',
            gradient: 'linear-gradient(135deg, #d63031 0%, #e17055 100%)'
        }
    };
    
    const selectedTheme = themes[theme] || themes.default;
    root.style.setProperty('--gradient-primary', selectedTheme.gradient);
}

// Save settings
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const settings = {
        font: document.getElementById('settingsFont').value,
        theme: document.getElementById('settingsTheme').value,
        taskReminders: document.getElementById('taskReminders').checked,
        workerUpdates: document.getElementById('workerUpdates').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    applySettings(settings);
    closeSettingsModal();
    
    addActivity('Settings updated', 'Your preferences have been saved', 'system');
});

// Reset settings to default
document.getElementById('resetSettingsBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        localStorage.removeItem('appSettings');
        loadSettings();
        addActivity('Settings reset', 'All settings have been reset to default', 'system');
    }
});

// Export all data from settings
document.getElementById('exportAllDataBtn').addEventListener('click', () => {
    // Trigger the existing export functionality
    document.getElementById('exportBtn').click();
});

// Clear all data
document.getElementById('clearAllDataBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
        if (confirm('This will permanently delete all workers, tasks, and settings from both local storage AND Supabase. Continue?')) {
            // Clear all localStorage data
            localStorage.removeItem('workers');
            localStorage.removeItem('stickyNotes');
            localStorage.removeItem('appSettings');
            localStorage.removeItem('selectedFont');
            localStorage.removeItem('activities');
            localStorage.removeItem('inputStylingSettings');
            
            // Reset in-memory data
            workers = [];
            notes = [];
            activities = [];
            inputStylingSettings = {};
            
            // Clear all data from Supabase
            try {
                if (typeof window.supabase !== 'undefined') {
                    console.log('Clearing data from Supabase...');
                    
                    // Delete all workers
                    await window.supabase.from('Workers').delete().neq('id', 'impossible-id');
                    console.log('All workers deleted from Supabase');
                    
                    // Delete all activities
                    await window.supabase.from('activities').delete().neq('id', 'impossible-id');
                    console.log('All activities deleted from Supabase');
                    
                    // Delete all notes
                    await window.supabase.from('notes').delete().neq('id', 'impossible-id');
                    console.log('All notes deleted from Supabase');
                    
                    // Delete all settings
                    await window.supabase.from('settings').delete().neq('id', 'impossible-id');
                    console.log('All settings deleted from Supabase');
                    
                    alert('All data cleared from both local storage and Supabase!');
                } else {
                    alert('Local storage cleared. Supabase not available.');
                }
            } catch (error) {
                console.error('Error clearing Supabase data:', error);
                alert('Local storage cleared. Error clearing Supabase: ' + error.message);
            }
            
            // Refresh the app
            renderWorkerList();
            renderNotes();
            updateDashboardStats();
            loadSettings();
            
            closeSettingsModal();
        }
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    showScreen('home');
    updateActivityList();
    updateNotificationBadge();
    
    console.log('App initialized, closeSidebar function available:', typeof closeSidebar);
    
    // Add some sample activities if none exist
    if (activities.length === 0) {
        addActivity('System initialized', 'Worker Work Management System is ready', 'system');
    }
    
    // Add sample notifications if none exist
    if (notifications.length === 0) {
        addNotification('system', 'Welcome to WorkForce Pro', 'Your worker management system is ready to use!');
        addNotification('task', 'Task Management', 'Start adding tasks to your workers to track their progress.');
        addNotification('worker', 'Worker Management', 'Add your first worker to get started with the system.');
    }
    
    // Notification filter buttons
    document.querySelectorAll('.notification-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.notification-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNotifications(btn.dataset.filter);
        });
    });
    
    // Mark all as read (and remove all notifications)
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            console.log('Mark all read button clicked');
            console.log('Total notifications:', notifications.length);
            
            // Remove all notifications instead of just marking as read
            notifications = [];
            localStorage.setItem('notifications', JSON.stringify(notifications));
            renderNotifications(document.querySelector('.notification-filter.active')?.dataset.filter || 'all');
            updateNotificationBadge();
            
            console.log('All notifications removed');
        });
    } else {
        console.log('Mark all read button not found');
    }
    
    // Clear all notifications
    const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
    if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all notifications?')) {
                notifications = [];
                localStorage.setItem('notifications', JSON.stringify(notifications));
                renderNotifications();
                updateNotificationBadge();
            }
        });
    } else {
        console.log('Clear notifications button not found');
    }
});