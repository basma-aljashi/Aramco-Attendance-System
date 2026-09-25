// *************** UI Logic ***************

const API_ENDPOINT = '/submit_attendance';
const STATUS_ENDPOINT = '/get_status';

const STATUS_TEXT = {
    present_ar: 'حاضر',
    absent_ar: 'غائب',
    time_not_set_ar: 'لم يسجل',

    present_en: 'Present',
    absent_en: 'Absent',
    time_not_set_en: 'Not Registered'
};

// ************************************************************
// Language
// ************************************************************

let currentLang = 'ar';

function switchLanguage(lang) {
    currentLang = lang;

    const isArabic = lang === 'ar';
    const direction = isArabic ? 'rtl' : 'ltr';

    document.documentElement.lang = lang;
    document.body.dir = direction;

    document.querySelectorAll('[data-ar]').forEach(element => {
        const text =
            element.getAttribute(`data-${lang}`) ||
            element.getAttribute('data-ar');

        if (text) {
            element.textContent = text;
        }
    });

    document.querySelectorAll('[data-ar-prefix]').forEach(element => {
        const prefix =
            element.getAttribute(`data-${lang}-prefix`) ||
            element.getAttribute('data-ar-prefix');

        if (prefix && element.childNodes.length > 0) {
            element.childNodes[0].nodeValue = prefix;
        }
    });

    document.querySelectorAll('[data-ar-placeholder]').forEach(element => {
        const placeholder =
            element.getAttribute(`data-${lang}-placeholder`) ||
            element.getAttribute('data-ar-placeholder');

        if (placeholder) {
            element.placeholder = placeholder;
        }
    });

    const langToggle = document.getElementById('langToggle');

    if (isArabic) {
        langToggle.textContent = 'English';
        langToggle.setAttribute('data-lang', 'en');
    } else {
        langToggle.textContent = 'العربية';
        langToggle.setAttribute('data-lang', 'ar');
    }

    fetchStatus();
}

// ************************************************************
// Theme
// ************************************************************

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

// ************************************************************
// Font Size
// ************************************************************

function adjustFontSize(change) {
    let currentSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize);

    let newSize = currentSize + change;

    if (newSize < 10) {
        newSize = 10;
    }

    if (newSize > 20) {
        newSize = 20;
    }

    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', newSize);
}

// ************************************************************
// Attendance Table
// ************************************************************

function updateDashboard(attendanceData) {
    const tableBody =
        document.getElementById('studentsTableBody');

    const presentCountElement =
        document.getElementById('presentCount');

    const absentCountElement =
        document.getElementById('absentCount');

    tableBody.innerHTML = '';

    let presentCount = 0;

    attendanceData.forEach(record => {

        const row = tableBody.insertRow();

        const studentName =
            currentLang === 'ar'
                ? record.name_ar
                : record.name_en;

        const statusText =
            currentLang === 'ar'
                ? record.status_ar
                : record.status_en;

        const statusClass =
            record.isPresent
                ? 'present'
                : 'absent';

        const timeText =
            record.checkInTime
                ? record.checkInTime
                : (
                    currentLang === 'ar'
                        ? STATUS_TEXT.time_not_set_ar
                        : STATUS_TEXT.time_not_set_en
                );

        const checkTypeText =
            currentLang === 'ar'
                ? record.checkType_ar
                : record.checkType_en;

        const checkTypeClass =
            checkTypeText &&
            (
                checkTypeText.includes('استثنائي') ||
                checkTypeText.includes('Exceptional')
            )
                ? 'exceptional'
                : '';

        const failedAttempts =
            record.failedAttempts || 0;

        const attemptsClass =
            failedAttempts >= 3
                ? 'danger-attempts'
                : '';

        if (record.isPresent) {
            presentCount++;
        }

        row.innerHTML = `
            <td>${record.sn}</td>
            <td>${studentName}</td>
            <td class="${statusClass}">
                ${statusText}
            </td>
            <td>${timeText}</td>
            <td class="${checkTypeClass}">
                ${checkTypeText}
            </td>
            <td class="${attemptsClass}">
                ${failedAttempts}
            </td>
        `;
    });

    presentCountElement.textContent = presentCount;

    const attendanceFinished =
        attendanceData.length > 0 &&
        attendanceData[0].attendanceFinished;

    if (attendanceFinished) {
        absentCountElement.textContent =
            attendanceData.length - presentCount;
    } else {
        absentCountElement.textContent =
            attendanceData.filter(
                record => !record.isPresent
            ).length;
    }

    document.getElementById('totalCount').textContent =
        attendanceData.length;
}

// ************************************************************
// System Status
// ************************************************************

function updateSystemStatus(data) {

    const timerElement =
        document.getElementById('timerMessage');

    const statusText =
        currentLang === 'ar'
            ? data.status_ar
            : data.status_en;

    timerElement.textContent = statusText;

    if (data.status_ar.includes('مغلق')) {
        timerElement.style.color =
            'var(--danger-color)';
    } else {
        timerElement.style.color =
            'var(--success-color)';
    }

    updateDashboard(data.attendance);
}

// ************************************************************
// Get Status From Server
// ************************************************************

function fetchStatus() {

    fetch(STATUS_ENDPOINT)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            return response.json();
        })

        .then(data => {
            updateSystemStatus(data);
        })

        .catch(error => {

            console.error(
                'Error fetching status:',
                error
            );

            const msg =
                currentLang === 'ar'
                    ? '❌ تعذر الاتصال بالخادم. تأكد من تشغيل server1.py'
                    : '❌ Failed to connect to the server. Please try again.';

            document.getElementById(
                'timerMessage'
            ).textContent = msg;

            document.getElementById(
                'timerMessage'
            ).style.color =
                'var(--danger-color)';
        });
}

// ************************************************************
// Attendance Registration
// ************************************************************

document
    .getElementById('studentForm')
    .addEventListener('submit', function (e) {

        e.preventDefault();

        const inputName =
            document
                .getElementById('studentNameInput')
                .value
                .trim();

        const msgElement =
            document.getElementById(
                'submissionMessage'
            );

        if (!inputName) {
            msgElement.textContent =
                currentLang === 'ar'
                    ? '❌ يرجى إدخال الاسم.'
                    : '❌ Please enter your name.';

            msgElement.style.backgroundColor =
                'var(--danger-color)';

            msgElement.style.color = 'white';

            return;
        }

        const processingMsg =
            currentLang === 'ar'
                ? 'جاري التحقق الأمني (الموقع)...'
                : 'Processing security check (Location)...';

        msgElement.textContent = processingMsg;

        msgElement.style.backgroundColor =
            'var(--light-accent)';

        msgElement.style.color =
            'var(--text-color)';

        if ('geolocation' in navigator) {

            navigator.geolocation.getCurrentPosition(

                position => {

                    const userLat =
                        position.coords.latitude;

                    const userLon =
                        position.coords.longitude;

                    submitDataToServer(
                        inputName,
                        userLat,
                        userLon
                    );
                },

                error => {

                    console.error(
                        'Geolocation Error:',
                        error
                    );

                    submitDataToServer(
                        inputName,
                        null,
                        null
                    );
                },

                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );

        } else {

            submitDataToServer(
                inputName,
                null,
                null
            );
        }
    });

// ************************************************************
// Send Attendance Data
// ************************************************************

function submitDataToServer(name, lat, lon) {

    const msgElement =
        document.getElementById(
            'submissionMessage'
        );

    fetch(API_ENDPOINT, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            name: name,
            lat: lat,
            lon: lon
        })

    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        return response.json();
    })

    .then(data => {

        const message =
            currentLang === 'ar'
                ? data.message_ar
                : data.message_en;

        msgElement.textContent = message;

        if (data.success) {

            msgElement.style.backgroundColor =
                'var(--success-color)';

            msgElement.style.color = 'white';

            document.getElementById(
                'studentNameInput'
            ).value = '';

            fetchStatus();

        } else {

            msgElement.style.backgroundColor =
                'var(--danger-color)';

            msgElement.style.color = 'white';
        }
    })

    .catch(error => {

        console.error(
            'Submission Error:',
            error
        );

        const failMsg =
            currentLang === 'ar'
                ? '❌ فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.'
                : '❌ Failed to connect to the server. Please try again.';

        msgElement.textContent = failMsg;

        msgElement.style.backgroundColor =
            'var(--danger-color)';

        msgElement.style.color = 'white';
    });
}

// ************************************************************
// Initialization
// ************************************************************

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const savedLang =
            localStorage.getItem('language') || 'ar';

        const savedTheme =
            localStorage.getItem('theme') || 'light';

        const savedFontSize =
            localStorage.getItem('fontSize');

        switchLanguage(savedLang);

        switchTheme(savedTheme);

        if (savedFontSize) {
            document.documentElement.style.fontSize =
                `${savedFontSize}px`;
        }

        document
            .getElementById('langToggle')
            .addEventListener('click', e => {

                const newLang =
                    e.target.getAttribute('data-lang');

                switchLanguage(newLang);

                localStorage.setItem(
                    'language',
                    newLang
                );
            });

        document
            .getElementById('themeToggle')
            .addEventListener('click', () => {

                const currentTheme =
                    document.body.getAttribute(
                        'data-theme'
                    );

                const newTheme =
                    currentTheme === 'light'
                        ? 'dark'
                        : 'light';

                switchTheme(newTheme);
            });

        document
            .getElementById('fontUp')
            .addEventListener(
                'click',
                () => adjustFontSize(1)
            );

        document
            .getElementById('fontDown')
            .addEventListener(
                'click',
                () => adjustFontSize(-1)
            );

        fetchStatus();

        setInterval(
            fetchStatus,
            5000
        );
    }
);
