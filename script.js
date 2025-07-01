// Global data storage
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let medications = JSON.parse(localStorage.getItem('medications')) || [];
let routines = JSON.parse(localStorage.getItem('routines')) || [];
let caregivers = JSON.parse(localStorage.getItem('caregivers')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadDashboard();
    renderAllSections();
});

// Initialize the application
function initializeApp() {
    // Set default dates for forms
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = document.getElementById('appointment-date');
    const medicationStart = document.getElementById('medication-start');
    
    if (appointmentDate) appointmentDate.value = today;
    if (medicationStart) medicationStart.value = today;
    
    // Setup medication frequency change handler
    const frequencySelect = document.getElementById('medication-frequency');
    if (frequencySelect) {
        frequencySelect.addEventListener('change', handleFrequencyChange);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Form submissions
    document.getElementById('appointment-form').addEventListener('submit', handleAppointmentSubmit);
    document.getElementById('medication-form').addEventListener('submit', handleMedicationSubmit);
    document.getElementById('routine-form').addEventListener('submit', handleRoutineSubmit);
    document.getElementById('caregiver-form').addEventListener('submit', handleCaregiverSubmit);
    
    // Modal close events
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Navigation handler
function handleNavigation(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    this.classList.add('active');
    
    // Show target section
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        // Hide custom times group if it exists
        const customGroup = document.getElementById('custom-times-group');
        if (customGroup) customGroup.style.display = 'none';
    }
}

// Handle medication frequency change
function handleFrequencyChange() {
    const frequency = this.value;
    const customGroup = document.getElementById('custom-times-group');
    
    if (frequency === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

// Add time input for custom medication times
function addTimeInput() {
    const customTimes = document.getElementById('custom-times');
    const timeInput = document.createElement('div');
    timeInput.className = 'time-input';
    timeInput.innerHTML = `
        <input type="time" class="custom-time">
        <button type="button" class="btn btn-small" onclick="removeTime(this)">제거</button>
    `;
    customTimes.appendChild(timeInput);
}

// Remove time input
function removeTime(button) {
    button.parentElement.remove();
}

// Form submission handlers
function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const appointment = {
        id: Date.now(),
        title: document.getElementById('appointment-title').value,
        doctor: document.getElementById('appointment-doctor').value,
        location: document.getElementById('appointment-location').value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        notes: document.getElementById('appointment-notes').value,
        reminder: parseInt(document.getElementById('appointment-reminder').value),
        createdAt: new Date().toISOString()
    };
    
    appointments.push(appointment);
    saveData('appointments', appointments);
    
    closeModal('appointment-modal');
    showMessage('진료 예약이 성공적으로 추가되었습니다!', 'success');
    renderAllSections();
}

function handleMedicationSubmit(e) {
    e.preventDefault();
    
    const frequency = document.getElementById('medication-frequency').value;
    let times = [];
    
    if (frequency === 'custom') {
        const customTimes = document.querySelectorAll('.custom-time');
        customTimes.forEach(input => {
            if (input.value) times.push(input.value);
        });
    } else {
        // Set default times based on frequency
        switch(frequency) {
            case 'once': times = ['09:00']; break;
            case 'twice': times = ['09:00', '21:00']; break;
            case 'thrice': times = ['08:00', '14:00', '20:00']; break;
        }
    }
    
    const medication = {
        id: Date.now(),
        name: document.getElementById('medication-name').value,
        dosage: document.getElementById('medication-dosage').value,
        frequency: frequency,
        times: times,
        startDate: document.getElementById('medication-start').value,
        endDate: document.getElementById('medication-end').value || null,
        notes: document.getElementById('medication-notes').value,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    
    medications.push(medication);
    saveData('medications', medications);
    
    closeModal('medication-modal');
    showMessage('약물이 성공적으로 추가되었습니다!', 'success');
    renderAllSections();
}

function handleRoutineSubmit(e) {
    e.preventDefault();
    
    const selectedDays = [];
    document.querySelectorAll('input[name="routine-days"]:checked').forEach(checkbox => {
        selectedDays.push(checkbox.value);
    });
    
    if (selectedDays.length === 0) {
        showMessage('최소 하나의 요일을 선택해주세요.', 'error');
        return;
    }
    
    const routine = {
        id: Date.now(),
        title: document.getElementById('routine-title').value,
        time: document.getElementById('routine-time').value,
        days: selectedDays,
        description: document.getElementById('routine-description').value,
        reminder: parseInt(document.getElementById('routine-reminder').value),
        isActive: true,
        createdAt: new Date().toISOString()
    };
    
    routines.push(routine);
    saveData('routines', routines);
    
    closeModal('routine-modal');
    showMessage('일상 루틴이 성공적으로 추가되었습니다!', 'success');
    renderAllSections();
}

function handleCaregiverSubmit(e) {
    e.preventDefault();
    
    const permissions = [];
    document.querySelectorAll('input[name="caregiver-permissions"]:checked').forEach(checkbox => {
        permissions.push(checkbox.value);
    });
    
    const caregiver = {
        id: Date.now(),
        name: document.getElementById('caregiver-name').value,
        email: document.getElementById('caregiver-email').value,
        phone: document.getElementById('caregiver-phone').value,
        role: document.getElementById('caregiver-role').value,
        permissions: permissions,
        createdAt: new Date().toISOString()
    };
    
    caregivers.push(caregiver);
    saveData('caregivers', caregivers);
    
    closeModal('caregiver-modal');
    showMessage('케어팀원이 성공적으로 추가되었습니다!', 'success');
    renderAllSections();
}

// Save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load dashboard data
function loadDashboard() {
    updateCareSummary();
    loadTodaySchedule();
    loadUpcomingReminders();
    loadCareTeam();
    initializeMonthlyCalendar();
}

// Update care summary
function updateCareSummary() {
    const totalAppointments = appointments.length;
    const activeMedications = medications.filter(m => m.isActive).length;
    const dailyRoutines = routines.filter(r => r.isActive).length;
    
    document.getElementById('total-appointments').textContent = totalAppointments;
    document.getElementById('active-medications').textContent = activeMedications;
    document.getElementById('daily-routines').textContent = dailyRoutines;
}

// Load today's schedule
function loadTodaySchedule() {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = document.getElementById('today-schedule');
    
    const todayItems = [];
    
    // Get today's appointments
    appointments.forEach(appointment => {
        if (appointment.date === today) {
            todayItems.push({
                type: 'appointment',
                title: appointment.title,
                time: appointment.time,
                details: `${appointment.doctor} - ${appointment.location}`
            });
        }
    });
    
    // Get today's routines
    const dayOfWeek = new Date().toLocaleDateString('ko-KR', { weekday: 'lowercase' });
    routines.forEach(routine => {
        if (routine.days.includes(dayOfWeek) && routine.isActive) {
            todayItems.push({
                type: 'routine',
                title: routine.title,
                time: routine.time,
                details: routine.description
            });
        }
    });
    
    // Sort by time
    todayItems.sort((a, b) => a.time.localeCompare(b.time));
    
    if (todayItems.length === 0) {
        todaySchedule.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-day"></i><h3>예정된 일정이 없습니다</h3><p>오늘은 여유롭습니다! 진료 예약이나 루틴을 추가해보세요.</p></div>';
    } else {
        todaySchedule.innerHTML = todayItems.map(item => `
            <div class="schedule-item">
                <h4>${item.title}</h4>
                <p><i class="fas fa-clock"></i> ${formatTime(item.time)}</p>
                <p>${item.details}</p>
            </div>
        `).join('');
    }
}

// Load upcoming reminders
function loadUpcomingReminders() {
    const remindersContainer = document.getElementById('upcoming-reminders');
    const now = new Date();
    const upcomingReminders = [];
    
    // Get upcoming appointments
    appointments.forEach(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const timeDiff = appointmentDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 0 && hoursDiff <= 24) {
            upcomingReminders.push({
                type: 'appointment',
                title: appointment.title,
                time: `${appointment.date} ${appointment.time}`,
                urgency: hoursDiff <= 2 ? 'high' : 'medium'
            });
        }
    });
    
    // Get upcoming medications
    medications.forEach(medication => {
        if (medication.isActive) {
            medication.times.forEach(time => {
                const today = new Date().toISOString().split('T')[0];
                const medicationTime = new Date(`${today}T${time}`);
                const timeDiff = medicationTime - now;
                const hoursDiff = timeDiff / (1000 * 60 * 60);
                
                if (hoursDiff > 0 && hoursDiff <= 4) {
                    upcomingReminders.push({
                        type: 'medication',
                        title: `${medication.name} (${medication.dosage})`,
                        time: `오늘 ${time}`,
                        urgency: hoursDiff <= 1 ? 'high' : 'medium'
                    });
                }
            });
        }
    });
    
    // Sort by urgency and time
    upcomingReminders.sort((a, b) => {
        if (a.urgency === 'high' && b.urgency !== 'high') return -1;
        if (b.urgency === 'high' && a.urgency !== 'high') return 1;
        return 0;
    });
    
    if (upcomingReminders.length === 0) {
        remindersContainer.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><h3>예정된 알림이 없습니다</h3><p>모든 일정을 확인했습니다!</p></div>';
    } else {
        remindersContainer.innerHTML = upcomingReminders.slice(0, 5).map(reminder => `
            <div class="reminder-item ${reminder.urgency === 'high' ? 'urgent' : ''}">
                <h4>${reminder.title}</h4>
                <p><i class="fas fa-clock"></i> ${reminder.time}</p>
                <p><i class="fas fa-${reminder.type === 'appointment' ? 'calendar-check' : 'pills'}"></i> ${reminder.type === 'appointment' ? '진료 예약' : '약물'}</p>
            </div>
        `).join('');
    }
}

// Load care team
function loadCareTeam() {
    const careTeamContainer = document.getElementById('care-team');
    
    if (caregivers.length === 0) {
        careTeamContainer.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h3>케어팀원이 없습니다</h3><p>가족 구성원이나 케어기버를 추가하여 협업하세요.</p></div>';
    } else {
        careTeamContainer.innerHTML = caregivers.slice(0, 3).map(caregiver => `
            <div class="care-team-member">
                <div class="care-team-avatar">${caregiver.name.charAt(0).toUpperCase()}</div>
                <div class="care-team-info">
                    <h4>${caregiver.name}</h4>
                    <p>${formatRole(caregiver.role)}</p>
                </div>
            </div>
        `).join('');
    }
}

// Render all sections
function renderAllSections() {
    renderAppointments();
    renderMedications();
    renderRoutines();
    renderCaregivers();
    loadDashboard();
}

// Render appointments
function renderAppointments() {
    const appointmentsList = document.getElementById('appointments-list');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>예약된 진료가 없습니다</h3><p>진료 예약을 추가하여 건강관리 방문을 추적하세요.</p></div>';
        return;
    }
    
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    appointmentsList.innerHTML = sortedAppointments.map(appointment => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <div class="item-title">${appointment.title}</div>
                    <div class="item-meta">
                        <i class="fas fa-user-md"></i> ${appointment.doctor} | 
                        <i class="fas fa-map-marker-alt"></i> ${appointment.location} | 
                        <i class="fas fa-calendar"></i> ${formatDate(appointment.date)} ${formatTime(appointment.time)}
                    </div>
                </div>
                <span class="item-status ${getAppointmentStatus(appointment)}">${getAppointmentStatusText(appointment)}</span>
            </div>
            ${appointment.notes ? `<p class="mb-2">${appointment.notes}</p>` : ''}
            <div class="item-actions">
                <button class="btn btn-outline" onclick="editAppointment(${appointment.id})">
                    <i class="fas fa-edit"></i> 편집
                </button>
                <button class="btn btn-outline" onclick="showModal('share-modal')">
                    <i class="fas fa-share"></i> 공유
                </button>
                <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// Render medications
function renderMedications() {
    renderSupplementSummary();
    renderMedicationSchedule();
    renderMedicationList();
}

// Populate the supplement summary table
function renderSupplementSummary() {
    const tbody = document.getElementById('supplement-summary-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Only show active medications that are 영양제(=supplements)
    // For demo, treat all medications as supplements. You can filter by name or add a type property if needed.
    const today = new Date().toISOString().split('T')[0];
    const activeSupplements = medications.filter(med => med.isActive && (!med.endDate || new Date(med.endDate) >= new Date(today)) && new Date(med.startDate) <= new Date(today));

    // Collect rows by time
    let rows = [];
    activeSupplements.forEach(med => {
        med.times.forEach(time => {
            // Extract pill count from dosage if possible (e.g., "2정" or "2알" or "2캡슐")
            let count = '';
            const match = med.dosage.match(/([0-9]+)(정|알|캡슐|포|개)?/);
            if (match) count = match[1] + (match[2] || '');
            else count = med.dosage;
            rows.push({
                time,
                name: med.name,
                count
            });
        });
    });

    // Sort by time
    rows.sort((a, b) => a.time.localeCompare(b.time));

    // Render rows
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">오늘 섭취할 영양제가 없습니다</td></tr>';
    } else {
        rows.forEach(row => {
            tbody.innerHTML += `<tr><td>${row.time}</td><td>${row.name}</td><td>${row.count}</td></tr>`;
        });
    }
}

// Render medication schedule by time slots
function renderMedicationSchedule() {
    const timeSlots = {
        'morning': { id: 'morning-med-list', time: '08:00', icon: 'fas fa-sun' },
        'afternoon': { id: 'afternoon-med-list', time: '12:00', icon: 'fas fa-cloud-sun' },
        'evening': { id: 'evening-med-list', time: '18:00', icon: 'fas fa-moon' },
        'night': { id: 'night-med-list', time: '21:00', icon: 'fas fa-bed' }
    };
    
    // Clear all time slots
    Object.values(timeSlots).forEach(slot => {
        const container = document.getElementById(slot.id);
        if (container) {
            container.innerHTML = '';
        }
    });
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Filter active medications
    const activeMedications = medications.filter(medication => medication.isActive);
    
    activeMedications.forEach(medication => {
        // Check if medication should be taken today
        const startDate = new Date(medication.startDate);
        const endDate = medication.endDate ? new Date(medication.endDate) : null;
        const todayDate = new Date(today);
        
        if (startDate <= todayDate && (!endDate || endDate >= todayDate)) {
            // Check if medication should be taken at any of our time slots
            medication.times.forEach(time => {
                let timeSlot = null;
                
                // Determine which time slot this medication belongs to
                const hour = parseInt(time.split(':')[0]);
                if (hour >= 6 && hour < 11) {
                    timeSlot = 'morning';
                } else if (hour >= 11 && hour < 16) {
                    timeSlot = 'afternoon';
                } else if (hour >= 16 && hour < 20) {
                    timeSlot = 'evening';
                } else {
                    timeSlot = 'night';
                }
                
                if (timeSlot && timeSlots[timeSlot]) {
                    const container = document.getElementById(timeSlots[timeSlot].id);
                    if (container) {
                        const medicationElement = createMedicationScheduleItem(medication, time);
                        container.appendChild(medicationElement);
                    }
                }
            });
        }
    });
    
    // Add empty state messages for slots with no medications
    Object.values(timeSlots).forEach(slot => {
        const container = document.getElementById(slot.id);
        if (container && container.children.length === 0) {
            container.innerHTML = '<div class="empty-time-slot">복용할 약물이 없습니다</div>';
        }
    });
}

// Create medication schedule item
function createMedicationScheduleItem(medication, time) {
    const div = document.createElement('div');
    div.className = 'medication-item';
    div.innerHTML = `
        <div class="medication-info">
            <div class="medication-name">${medication.name}</div>
            <div class="medication-dosage">${medication.dosage} - ${time}</div>
        </div>
        <div class="medication-status">
            <input type="checkbox" class="status-checkbox" 
                   onchange="markMedicationTaken(${medication.id}, '${time}', this.checked)"
                   title="복용 완료">
        </div>
    `;
    return div;
}

// Render medication list (overview)
function renderMedicationList() {
    const medicationsList = document.getElementById('medications-list');
    
    if (medications.length === 0) {
        medicationsList.innerHTML = '<div class="empty-state"><i class="fas fa-pills"></i><h3>추가된 약물이 없습니다</h3><p>약물을 추가하여 용량과 일정을 추적하세요.</p></div>';
        return;
    }
    
    medicationsList.innerHTML = medications.map(medication => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <div class="item-title">${medication.name}</div>
                    <div class="item-meta">
                        <i class="fas fa-pills"></i> ${medication.dosage} | 
                        <i class="fas fa-clock"></i> ${formatMedicationTimes(medication.times)} | 
                        <i class="fas fa-calendar"></i> ${formatDate(medication.startDate)}
                        ${medication.endDate ? ` ~ ${formatDate(medication.endDate)}` : ''}
                    </div>
                </div>
                <span class="item-status ${medication.isActive ? 'status-active' : 'status-completed'}">
                    ${medication.isActive ? '복용 중' : '복용 완료'}
                </span>
            </div>
            ${medication.notes ? `<p class="mb-2">${medication.notes}</p>` : ''}
            <div class="item-actions">
                <button class="btn btn-outline" onclick="toggleMedicationStatus(${medication.id})">
                    <i class="fas fa-${medication.isActive ? 'pause' : 'play'}"></i> 
                    ${medication.isActive ? '일시정지' : '활성화'}
                </button>
                <button class="btn btn-outline" onclick="editMedication(${medication.id})">
                    <i class="fas fa-edit"></i> 편집
                </button>
                <button class="btn btn-danger" onclick="deleteMedication(${medication.id})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// Mark medication as taken
function markMedicationTaken(medicationId, time, taken) {
    const medication = medications.find(m => m.id === medicationId);
    if (medication) {
        if (!medication.takenToday) {
            medication.takenToday = {};
        }
        medication.takenToday[time] = taken;
        
        // Update visual state
        const medicationElement = event.target.closest('.medication-item');
        if (medicationElement) {
            if (taken) {
                medicationElement.classList.add('status-taken');
            } else {
                medicationElement.classList.remove('status-taken');
            }
        }
        
        saveData('medications', medications);
        showMessage(taken ? '복용 완료로 기록되었습니다.' : '복용 기록이 취소되었습니다.', 'success');
    }
}

// Render routines
function renderRoutines() {
    renderRoutineVisualSummary();
    const routinesList = document.getElementById('routines-list');
    
    if (routines.length === 0) {
        routinesList.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><h3>일상 루틴이 없습니다</h3><p>일상 루틴을 추가하여 케어의 일관성을 유지하세요.</p></div>';
        return;
    }
    
    routinesList.innerHTML = routines.map(routine => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <div class="item-title">${routine.title}</div>
                    <div class="item-meta">
                        <i class="fas fa-clock"></i> ${formatTime(routine.time)} | 
                        <i class="fas fa-calendar-week"></i> ${formatDays(routine.days)}
                    </div>
                </div>
                <span class="item-status ${routine.isActive ? 'status-active' : 'status-completed'}">
                    ${routine.isActive ? '활성' : '비활성'}
                </span>
            </div>
            <p class="mb-2">${routine.description}</p>
            <div class="item-actions">
                <button class="btn btn-outline" onclick="toggleRoutineStatus(${routine.id})">
                    <i class="fas fa-${routine.isActive ? 'pause' : 'play'}"></i> 
                    ${routine.isActive ? '일시정지' : '활성화'}
                </button>
                <button class="btn btn-outline" onclick="editRoutine(${routine.id})">
                    <i class="fas fa-edit"></i> 편집
                </button>
                <button class="btn btn-danger" onclick="deleteRoutine(${routine.id})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

function renderRoutineVisualSummary() {
    // 추천 기상/취침 시간 (간단 랜덤 예시)
    const wakeupTimes = ['06:30', '07:00', '07:30', '08:00'];
    const sleepTimes = ['22:30', '23:00', '23:30', '00:00'];
    const exercises = [
        {
            name: '걷기',
            effect: '심혈관 건강, 스트레스 해소',
            desc: '가볍게 30분 이상 걷기 운동을 해보세요.'
        },
        {
            name: '스트레칭',
            effect: '근육 이완, 유연성 향상',
            desc: '아침/저녁으로 10분간 전신 스트레칭을 해보세요.'
        },
        {
            name: '가벼운 근력운동',
            effect: '근육 유지, 신진대사 촉진',
            desc: '스쿼트, 팔굽혀펴기 등 집에서 할 수 있는 근력운동을 10~15분 해보세요.'
        },
        {
            name: '요가',
            effect: '유연성, 심신 안정',
            desc: '간단한 요가 동작으로 하루를 시작하거나 마무리해보세요.'
        }
    ];
    // 랜덤 추천
    const wakeup = wakeupTimes[Math.floor(Math.random() * wakeupTimes.length)];
    const sleep = sleepTimes[Math.floor(Math.random() * sleepTimes.length)];
    const exercise = exercises[Math.floor(Math.random() * exercises.length)];

    // DOM에 반영
    const wakeupEl = document.getElementById('recommended-wakeup');
    const sleepEl = document.getElementById('recommended-sleep');
    const exerciseEl = document.getElementById('recommended-exercise');
    if (wakeupEl) wakeupEl.textContent = wakeup;
    if (sleepEl) sleepEl.textContent = sleep;
    if (exerciseEl) {
        exerciseEl.innerHTML = `<span class='exercise-name'>${exercise.name}</span>
            <span class='exercise-effect'>${exercise.effect}</span>
            <div class='exercise-desc'>${exercise.desc}</div>`;
    }
}

// Render caregivers
function renderCaregivers() {
    const caregiversList = document.getElementById('caregivers-list');
    
    if (caregivers.length === 0) {
        caregiversList.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h3>케어팀원이 없습니다</h3><p>가족 구성원이나 전문 케어기버를 추가하여 협업하세요.</p></div>';
        return;
    }
    
    caregiversList.innerHTML = caregivers.map(caregiver => `
        <div class="caregiver-card">
            <div class="caregiver-header">
                <div class="caregiver-avatar">${caregiver.name.charAt(0).toUpperCase()}</div>
                <div class="caregiver-info">
                    <h3>${caregiver.name}</h3>
                    <p>${caregiver.email}</p>
                    <p>${caregiver.phone || '전화번호 없음'}</p>
                </div>
            </div>
            <p><strong>역할:</strong> ${formatRole(caregiver.role)}</p>
            <div class="caregiver-permissions">
                ${caregiver.permissions.map(permission => 
                    `<span class="permission-tag">${formatPermission(permission)}</span>`
                ).join('')}
            </div>
            <div class="item-actions mt-2">
                <button class="btn btn-outline" onclick="editCaregiver(${caregiver.id})">
                    <i class="fas fa-edit"></i> 편집
                </button>
                <button class="btn btn-outline" onclick="showModal('share-modal')">
                    <i class="fas fa-share"></i> 공유
                </button>
                <button class="btn btn-danger" onclick="deleteCaregiver(${caregiver.id})">
                    <i class="fas fa-trash"></i> 제거
                </button>
            </div>
        </div>
    `).join('');
}

// Filter functions
function filterAppointments() {
    const filter = document.getElementById('appointment-filter').value;
    const appointmentsList = document.getElementById('appointments-list');
    
    let filteredAppointments = [...appointments];
    const today = new Date().toISOString().split('T')[0];
    
    if (filter === 'upcoming') {
        filteredAppointments = appointments.filter(appointment => appointment.date >= today);
    } else if (filter === 'past') {
        filteredAppointments = appointments.filter(appointment => appointment.date < today);
    }
    
    // Re-render with filtered data
    if (filteredAppointments.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>예약을 찾을 수 없습니다</h3><p>필터 조건에 맞는 예약이 없습니다.</p></div>';
    } else {
        renderAppointments();
    }
}

function filterMedications() {
    const filter = document.getElementById('medication-filter').value;
    const medicationsList = document.getElementById('medications-list');
    
    let filteredMedications = [...medications];
    
    if (filter === 'active') {
        filteredMedications = medications.filter(medication => medication.isActive);
    } else if (filter === 'completed') {
        filteredMedications = medications.filter(medication => !medication.isActive);
    }
    
    // Re-render with filtered data
    if (filteredMedications.length === 0) {
        medicationsList.innerHTML = '<div class="empty-state"><i class="fas fa-pills"></i><h3>약물을 찾을 수 없습니다</h3><p>필터 조건에 맞는 약물이 없습니다.</p></div>';
    } else {
        renderMedications();
    }
}

function filterRoutines() {
    const filter = document.getElementById('routine-filter').value;
    const routinesList = document.getElementById('routines-list');
    
    let filteredRoutines = [...routines];
    
    if (filter !== 'all') {
        filteredRoutines = routines.filter(routine => {
            const routineTime = routine.time;
            const hour = parseInt(routineTime.split(':')[0]);
            
            switch(filter) {
                case 'morning': return hour >= 6 && hour < 12;
                case 'afternoon': return hour >= 12 && hour < 18;
                case 'evening': return hour >= 18 || hour < 6;
                default: return true;
            }
        });
    }
    
    // Re-render with filtered data
    if (filteredRoutines.length === 0) {
        routinesList.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><h3>루틴을 찾을 수 없습니다</h3><p>필터 조건에 맞는 루틴이 없습니다.</p></div>';
    } else {
        renderRoutines();
    }
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatMedicationTimes(times) {
    return times.map(time => formatTime(time)).join(', ');
}

function formatDays(days) {
    const dayNames = {
        'monday': '월',
        'tuesday': '화',
        'wednesday': '수',
        'thursday': '목',
        'friday': '금',
        'saturday': '토',
        'sunday': '일'
    };
    return days.map(day => dayNames[day]).join(', ');
}

function formatRole(role) {
    const roles = {
        'family': '가족 구성원',
        'professional': '전문 케어기버',
        'nurse': '간호사',
        'doctor': '의사',
        'other': '기타'
    };
    return roles[role] || role;
}

function formatPermission(permission) {
    const permissions = {
        'view': '일정 보기',
        'edit': '일정 편집',
        'notifications': '알림 수신'
    };
    return permissions[permission] || permission;
}

function getAppointmentStatus(appointment) {
    const today = new Date().toISOString().split('T')[0];
    if (appointment.date < today) return 'status-completed';
    if (appointment.date === today) return 'status-active';
    return 'status-upcoming';
}

function getAppointmentStatusText(appointment) {
    const today = new Date().toISOString().split('T')[0];
    if (appointment.date < today) return '완료';
    if (appointment.date === today) return '오늘';
    return '예정';
}

// Delete functions
function deleteAppointment(id) {
    if (confirm('이 진료 예약을 삭제하시겠습니까?')) {
        appointments = appointments.filter(appointment => appointment.id !== id);
        saveData('appointments', appointments);
        renderAllSections();
        showMessage('진료 예약이 성공적으로 삭제되었습니다!', 'success');
    }
}

function deleteMedication(id) {
    if (confirm('이 약물을 삭제하시겠습니까?')) {
        medications = medications.filter(medication => medication.id !== id);
        saveData('medications', medications);
        renderAllSections();
        showMessage('약물이 성공적으로 삭제되었습니다!', 'success');
    }
}

function deleteRoutine(id) {
    if (confirm('이 루틴을 삭제하시겠습니까?')) {
        routines = routines.filter(routine => routine.id !== id);
        saveData('routines', routines);
        renderAllSections();
        showMessage('루틴이 성공적으로 삭제되었습니다!', 'success');
    }
}

function deleteCaregiver(id) {
    if (confirm('이 케어팀원을 제거하시겠습니까?')) {
        caregivers = caregivers.filter(caregiver => caregiver.id !== id);
        saveData('caregivers', caregivers);
        renderAllSections();
        showMessage('케어팀원이 성공적으로 제거되었습니다!', 'success');
    }
}

// Toggle status functions
function toggleMedicationStatus(id) {
    const medication = medications.find(m => m.id === id);
    if (medication) {
        medication.isActive = !medication.isActive;
        saveData('medications', medications);
        renderAllSections();
        showMessage(`약물이 성공적으로 ${medication.isActive ? '활성화' : '일시정지'}되었습니다!`, 'success');
    }
}

function toggleRoutineStatus(id) {
    const routine = routines.find(r => r.id === id);
    if (routine) {
        routine.isActive = !routine.isActive;
        saveData('routines', routines);
        renderAllSections();
        showMessage(`루틴이 성공적으로 ${routine.isActive ? '활성화' : '일시정지'}되었습니다!`, 'success');
    }
}

// Share schedule function
function shareSchedule() {
    const email = document.getElementById('share-email').value;
    const message = document.getElementById('share-message').value;
    
    if (!email) {
        showMessage('이메일 주소를 입력해주세요.', 'error');
        return;
    }
    
    // In a real application, this would send an email
    // For now, we'll just show a success message
    closeModal('share-modal');
    showMessage(`${email}에게 일정이 성공적으로 공유되었습니다!`, 'success');
}

// Show message function
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content .container');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Edit functions (placeholder implementations)
function editAppointment(id) {
    showMessage('편집 기능은 다음 버전에서 구현될 예정입니다.', 'warning');
}

function editMedication(id) {
    showMessage('편집 기능은 다음 버전에서 구현될 예정입니다.', 'warning');
}

function editRoutine(id) {
    showMessage('편집 기능은 다음 버전에서 구현될 예정입니다.', 'warning');
}

function editCaregiver(id) {
    showMessage('편집 기능은 다음 버전에서 구현될 예정입니다.', 'warning');
}

// Check for notifications every minute
setInterval(() => {
    checkNotifications();
}, 60000);

function checkNotifications() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check appointments
    appointments.forEach(appointment => {
        if (appointment.date === today) {
            const appointmentTime = new Date(`${appointment.date}T${appointment.time}`);
            const timeDiff = appointmentTime - now;
            const minutesDiff = timeDiff / (1000 * 60);
            
            if (minutesDiff > 0 && minutesDiff <= appointment.reminder) {
                showNotification(`진료 예약 알림: ${appointment.title} ${Math.round(minutesDiff)}분 후`);
            }
        }
    });
    
    // Check medications
    medications.forEach(medication => {
        if (medication.isActive) {
            medication.times.forEach(time => {
                const medicationTime = new Date(`${today}T${time}`);
                const timeDiff = medicationTime - now;
                const minutesDiff = timeDiff / (1000 * 60);
                
                if (minutesDiff > 0 && minutesDiff <= 15) {
                    showNotification(`약물 알림: ${medication.name} (${medication.dosage}) ${Math.round(minutesDiff)}분 후 복용`);
                }
            });
        }
    });
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('돌봄온', { body: message });
    }
}

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// --- Weekly Calendar Functions ---
let currentWeekStart = new Date();

// Initialize calendar when appointments section is loaded
function initializeCalendar() {
    currentWeekStart = getWeekStart(new Date());
    renderCalendar();
}

// Get the start of the week (Sunday)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

// Render the weekly calendar
function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const calendarTitle = document.getElementById('calendar-title');
    
    if (!calendarDays) return;
    
    // Update title
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    calendarTitle.textContent = `${formatDate(currentWeekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}`;
    
    // Clear calendar
    calendarDays.innerHTML = '';
    
    // Generate calendar days
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        
        const dayElement = createCalendarDay(date);
        calendarDays.appendChild(dayElement);
    }
}

// Create a calendar day element
function createCalendarDay(date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isOtherMonth = date.getMonth() !== currentWeekStart.getMonth();
    
    if (isToday) dayElement.classList.add('today');
    if (isOtherMonth) dayElement.classList.add('other-month');
    
    // Check if day has appointments
    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length > 0) {
        dayElement.classList.add('has-appointment');
    }
    
    dayElement.innerHTML = `
        <div class="day-number">${date.getDate()}</div>
        <div class="day-appointments">
            ${dayAppointments.length > 0 ? `${dayAppointments.length}개 예약` : ''}
        </div>
    `;
    
    // Add click event to show appointments for this day
    dayElement.addEventListener('click', () => {
        showDayAppointments(date, dayAppointments);
    });
    
    return dayElement;
}

// Get appointments for a specific date
function getAppointmentsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === dateString);
}

// Show appointments for a specific day
function showDayAppointments(date, dayAppointments) {
    const dateString = formatDate(date.toISOString());
    
    if (dayAppointments.length === 0) {
        showMessage(`${dateString}에는 예약이 없습니다.`, 'info');
        return;
    }
    
    let message = `${dateString} 예약 목록:\n\n`;
    dayAppointments.forEach(appointment => {
        message += `• ${appointment.title} (${appointment.time})\n`;
        message += `  ${appointment.doctor} - ${appointment.location}\n\n`;
    });
    
    alert(message);
}

// Navigate to previous week
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderCalendar();
}

// Navigate to next week
function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderCalendar();
}

// Update calendar when appointments change
function updateCalendar() {
    if (document.getElementById('calendar-days')) {
        renderCalendar();
    }
}

// Modify the existing renderAppointments function to also update calendar
const originalRenderAppointments = renderAppointments;
function renderAppointments() {
    originalRenderAppointments();
    updateCalendar();
    updateMonthlyCalendar();
}

// Initialize calendar when appointments section becomes active
document.addEventListener('DOMContentLoaded', function() {
    // Add observer to detect when appointments section becomes active
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const appointmentsSection = document.getElementById('appointments');
                if (appointmentsSection && appointmentsSection.classList.contains('active')) {
                    initializeCalendar();
                }
            }
        });
    });
    
    const appointmentsSection = document.getElementById('appointments');
    if (appointmentsSection) {
        observer.observe(appointmentsSection, { attributes: true });
    }
    
    // Initialize calendar if appointments section is already active
    if (appointmentsSection && appointmentsSection.classList.contains('active')) {
        initializeCalendar();
    }
});

// --- Monthly Calendar Functions ---
let currentMonth = new Date();

// Initialize monthly calendar when dashboard is loaded
function initializeMonthlyCalendar() {
    currentMonth = new Date();
    renderMonthlyCalendar();
}

// Get the first day of the month
function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Get the last day of the month
function getMonthEnd(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Render the monthly calendar
function renderMonthlyCalendar() {
    const calendarDays = document.getElementById('monthly-calendar-days');
    const calendarTitle = document.getElementById('monthly-calendar-title');
    
    if (!calendarDays) return;
    
    // Update title
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    calendarTitle.textContent = `${currentMonth.getFullYear()}년 ${monthNames[currentMonth.getMonth()]}`;
    
    // Clear calendar
    calendarDays.innerHTML = '';
    
    const monthStart = getMonthStart(currentMonth);
    const monthEnd = getMonthEnd(currentMonth);
    const startDate = new Date(monthStart);
    
    // Adjust to start from Sunday
    const dayOfWeek = monthStart.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Generate calendar days (6 weeks = 42 days to ensure full month coverage)
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = createMonthlyCalendarDay(date, monthStart, monthEnd);
        calendarDays.appendChild(dayElement);
    }
}

// Create a monthly calendar day element
function createMonthlyCalendarDay(date, monthStart, monthEnd) {
    const dayElement = document.createElement('div');
    dayElement.className = 'monthly-calendar-day';
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isOtherMonth = date < monthStart || date > monthEnd;
    
    if (isToday) dayElement.classList.add('today');
    if (isOtherMonth) dayElement.classList.add('other-month');
    
    // Check if day has appointments
    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length > 0) {
        dayElement.classList.add('has-appointment');
    }
    
    dayElement.innerHTML = `
        <div class="monthly-day-number">${date.getDate()}</div>
        <div class="monthly-day-appointments">
            ${dayAppointments.length > 0 ? `${dayAppointments.length}` : ''}
        </div>
    `;
    
    // Add click event to show appointments for this day
    dayElement.addEventListener('click', () => {
        if (!isOtherMonth) {
            showDayAppointments(date, dayAppointments);
        }
    });
    
    return dayElement;
}

// Navigate to previous month
function previousMonth() {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderMonthlyCalendar();
}

// Navigate to next month
function nextMonth() {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderMonthlyCalendar();
}

// Update monthly calendar when appointments change
function updateMonthlyCalendar() {
    if (document.getElementById('monthly-calendar-days')) {
        renderMonthlyCalendar();
    }
}

 