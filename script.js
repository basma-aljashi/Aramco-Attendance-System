// *************** منطق الواجهة ***************

const API_ENDPOINT = '/submit_attendance';
const STATUS_ENDPOINT = '/get_status';

// حالات الحضور باللغتين
const STATUS_TEXT = {
    present_ar: 'حاضر', absent_ar: 'غائب', time_not_set_ar: 'لم يسجل',
    present_en: 'Present', absent_en: 'Absent', time_not_set_en: 'Not Registered'
};

// ************************************************************
// وظائف التحكم في الـ UI/UX
// ************************************************************

// 1. التحكم في اللغة
let currentLang = 'ar';
const LTR_ELEMENTS = ['en', 'ltr'];
const RTL_ELEMENTS = ['ar', 'rtl'];

function switchLanguage(lang) {
    currentLang = lang;
    const isArabic = lang === 'ar';
    const direction = isArabic ? 'rtl' : 'ltr';

    document.documentElement.lang = lang;
    document.body.dir = direction;

    document.querySelectorAll('[data-ar]').forEach(element => {
        const key = isArabic ? 'ar' : 'en';
        const text = element.getAttribute(`data-${key}`) || element.getAttribute(`data-ar`);
        if (text) {
            element.textContent = text;
        }
    });

    document.querySelectorAll('[data-ar-prefix]').forEach(element => {
        const prefix = element.getAttribute(`data-${lang}-prefix`) || element.getAttribute('data-ar-prefix');
        if (prefix) {
            element.childNodes[0].nodeValue = prefix;
        }
    });

    document.querySelectorAll('[data-ar-placeholder]').forEach(element => {
        const placeholder = element.getAttribute(`data-${lang}-placeholder`) || element.getAttribute('data-ar-placeholder');
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
    
    // تحديث زر اللغة
    const langToggle = document.getElementById('langToggle');
    if (isArabic) {
        langToggle.textContent = 'English';
        langToggle.setAttribute('data-lang', 'en');
    } else {
        langToggle.textContent = 'العربية';
        langToggle.setAttribute('data-lang', 'ar');
    }

    // إعادة تحميل لوحة المتابعة لترجمة البيانات
    fetchStatus(); 
}

// 2. التحكم في الوضع الليلي/النهاري
function switchTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (theme === 'dark') {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// 3. التحكم في حجم الخط
function adjustFontSize(change) {
    let currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let newSize = currentSize + change;
    
    // حدود لحجم الخط لضمان القراءة الجيدة
    if (newSize < 10) newSize = 10;
    if (newSize > 20) newSize = 20;

    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', newSize);
}

// ************************************************************
// وظائف النظام الأساسية
// ************************************************************

// وظيفة تحديث لوحة المتابعة
function updateDashboard(attendanceData) {
    const tableBody = document.getElementById('studentsTableBody');
    const presentCountElement = document.getElementById('presentCount');
    const absentCountElement = document.getElementById('absentCount');
    
    tableBody.innerHTML = ''; 

    let presentCount = 0;
    const statusKey = currentLang === 'ar' ? '_ar' : '_en';

    attendanceData.forEach(record => {
        const row = tableBody.insertRow();
        const statusClass = record.isPresent ? 'present' : 'absent';
        const statusText = record.isPresent ? STATUS_TEXT['present' + statusKey] : STATUS_TEXT['absent' + statusKey];
        const timeText = record.checkInTime ? record.checkInTime : STATUS_TEXT['time_not_set' + statusKey];
        
        // نوع التسجيل: نستخدم اللغة المخزنة في الـ Back-end (العربية)
        const checkTypeText = record.checkType; 
        const checkTypeClass = checkTypeText.includes('استثنائي') ? 'exceptional' : '';
        
        const failedAttempts = record.failedAttempts || 0;
        const attemptsClass = failedAttempts >= 3 ? 'danger-attempts' : ''; 
        
        if(record.isPresent) {
            presentCount++;
        }

        row.innerHTML = `
            <td>${record.sn}</td>
            <td>${record.name}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>${timeText}</td>
            <td class="${checkTypeClass}">${checkTypeText}</td>
            <td class="${attemptsClass}">${failedAttempts}</td>
        `;
    });

    presentCountElement.textContent = presentCount;
    absentCountElement.textContent = attendanceData.length - presentCount;
    document.getElementById('totalCount').textContent = attendanceData.length;
}

// وظيفة تحديث حالة النظام
function updateSystemStatus(data) {
    const timerElement = document.getElementById('timerMessage');
    const statusText = currentLang === 'ar' ? data.status_ar : data.status_en;
    
    timerElement.textContent = statusText;

    if (data.status_ar.includes('مغلق')) {
        timerElement.style.color = 'var(--danger-color)';
    } else {
        timerElement.style.color = 'var(--success-color)';
    }

    updateDashboard(data.attendance);
}

// دالة طلب تحديث الحالة من الخادم (كل 5 ثواني)
function fetchStatus() {
    fetch(STATUS_ENDPOINT)
        .then(response => response.json())
        .then(data => {
            updateSystemStatus(data);
        })
        .catch(error => {
            console.error('Error fetching status:', error);
            const msg = currentLang === 'ar' ? '❌ تعذر الاتصال بالخادم. تأكد من تشغيل server.py' : '❌ Failed to connect to server. Ensure server.py is running.';
            document.getElementById('timerMessage').textContent = msg;
            document.getElementById('timerMessage').style.color = 'var(--danger-color)';
        });
}


// ************************************************************
// معالج التسجيل
// ************************************************************

document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const inputName = document.getElementById('studentNameInput').value.trim(); 
    const msgElement = document.getElementById('submissionMessage');
    const processingMsg = currentLang === 'ar' ? 'جاري التحقق الأمني (الموقع)...' : 'Processing security check (Location)...';
    
    msgElement.textContent = processingMsg;
    msgElement.style.backgroundColor = 'var(--light-accent)';
    msgElement.style.color = 'var(--dark-text)';

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                submitDataToServer(inputName, userLat, userLon);
            },
            (error) => {
                // إذا رفضت الطالبة تحديد الموقع، نرسل null/null
                console.error('Geolocation Error:', error);
                submitDataToServer(inputName, null, null); 
            },
            {
                enableHighAccuracy: true,
                timeout: 5000, 
                maximumAge: 0
            }
        );
    } else {
        // إذا كان الجهاز لا يدعم تحديد الموقع
        submitDataToServer(inputName, null, null);
    }
});


function submitDataToServer(name, lat, lon) {
    const msgElement = document.getElementById('submissionMessage');
    
    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            lat: lat,
            lon: lon
        }),
    })
    .then(response => response.json())
    .then(data => {
        const message = currentLang === 'ar' ? data.message_ar : data.message_en;
        msgElement.textContent = message;

        if (data.success) {
            msgElement.style.backgroundColor = 'var(--success-color)';
            msgElement.style.color = 'white';
            document.getElementById('studentNameInput').value = ''; 
            fetchStatus(); 
        } else {
            msgElement.style.backgroundColor = 'var(--danger-color)';
            msgElement.style.color = 'white';
        }
    })
    .catch((error) => {
        console.error('Submission Error:', error);
        const failMsg = currentLang === 'ar' ? '❌ فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.' : '❌ Failed to connect to server. Please try again.';
        msgElement.textContent = failMsg;
        msgElement.style.backgroundColor = 'var(--danger-color)';
        msgElement.style.color = 'white';
    });
}


// ************************************************************
// التهيئة عند تحميل الصفحة
// ************************************************************

document.addEventListener('DOMContentLoaded', () => {
    // تحميل اللغة وحجم الخط والمظهر المحفوظ
    const savedLang = localStorage.getItem('language') || 'ar';
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFontSize = localStorage.getItem('fontSize');
    
    switchLanguage(savedLang);
    switchTheme(savedTheme);
    if (savedFontSize) {
        document.documentElement.style.fontSize = `${savedFontSize}px`;
    }

    // إعداد مستمعي الأحداث
    document.getElementById('langToggle').addEventListener('click', (e) => {
        const newLang = e.target.getAttribute('data-lang');
        switchLanguage(newLang);
        localStorage.setItem('language', newLang);
    });

    document.getElementById('themeToggle').addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        switchTheme(newTheme);
    });

    document.getElementById('fontUp').addEventListener('click', () => adjustFontSize(1));
    document.getElementById('fontDown').addEventListener('click', () => adjustFontSize(-1));

    fetchStatus(); 
    setInterval(fetchStatus, 5000); 
});