# Advantage Academy Attendance System

A web-based attendance system developed during my cooperative training at Saudi Aramco to support the attendance registration process at Advantage Academy.

## Live Demo

[Open the Attendance System](https://aramco-attendance-system.onrender.com/)

## Project Overview

Advantage Academy is an educational program for orphaned students supported by Benaa Charitable Association in collaboration with Saudi Aramco. The program provides students with English and Mathematics classes.

As part of my cooperative training, I developed a website to support the attendance registration process at the academy.

The system allows students to register their attendance by selecting their full name and verifying their location. I added features such as location verification, duplicate attendance prevention, failed-attempt tracking, attendance status tracking, Arabic and English language support, and interface customization.

## Project Files

This repository includes both the web-based attendance system and an Excel-based attendance and participation system developed for Advantage Academy.

### Web-Based Attendance System

The web application allows students to register their attendance using location verification. It also includes attendance status tracking, failed-attempt tracking, duplicate attendance prevention, and Arabic and English language support.

### Excel-Based Attendance and Participation System

The Excel system was developed to organize student attendance and participation records digitally. The process was previously managed using paper-based attendance records, which required manual data entry and organization.

The workbook includes records for Grade 10, Grade 11, and Grade 12, with separate records for male and female students. It includes attendance records, participation records, and general student information.

The workbook uses Excel formulas such as `VLOOKUP` and `COUNTIF`, along with calculated fields, to retrieve data, calculate attendance information, and organize student records.

For privacy and portfolio purposes, the original student identities and personal information were replaced with fictional Arabic and English names and fictional Academic IDs.

## Main Features

- Digital attendance registration
- Location-based verification
- Arabic and English interface
- Full-name search and selection
- Attendance time recording
- Present, Not Registered, and Absent statuses
- Duplicate attendance prevention
- Failed verification attempt tracking
- Light and dark mode
- Font size controls
- Responsive web interface
- Excel-based attendance and participation records

## How It Works

1. The student selects her full name.
2. The website requests the device location.
3. The system checks the distance between the device location and the specified attendance location.
4. If the location meets the required distance, the attendance is registered.
5. The system records the attendance time and updates the attendance status.
6. If the location cannot be verified or the device is outside the permitted distance, the attendance is not registered and the failed attempt is recorded.

## Attendance Status

- **Present** — attendance has been successfully registered.
- **Not Registered** — attendance has not been registered while the attendance period is open.
- **Absent** — attendance has not been registered after the attendance period ends.

## Technology Stack

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- Browser Geolocation API
- Microsoft Excel
- Gunicorn
- Render

## Project Structure

```text
Aramco-Attendance-System/
│
├── server1.py
├── requirements.txt
├── Advantage Academy Attendance Participation System 2025.xlsx
│
├── static/
│   ├── script.js
│   └── style.css
│
└── templates/
    └── index.html

## Application Components

### `server1.py`

The Flask backend that handles attendance registration, location verification, attendance status, failed attempts, duplicate registration prevention, and server-side validation.

### `templates/index.html`

The main page of the attendance system, including the student registration form and attendance tracking section.

### `static/style.css`

The styling and layout of the website, including the light and dark modes, font styling, table design, and responsive layout.

### `static/script.js`

The JavaScript functionality for language switching, location access, attendance registration, attendance status updates, theme switching, and font size controls.

### `requirements.txt`

Contains the Python packages required to run the web application.

### `Advantage Academy Attendance Participation System 2025.xlsx`

The Excel-based attendance and participation system containing attendance records, participation records, and general student information for Grade 10, Grade 11, and Grade 12.

## Development

The project was developed as a practical solution for the attendance and participation process at Advantage Academy.

I worked on the website interface, Flask backend, location verification, attendance tracking, bilingual support, and additional controls for the registration process.

I also developed an Excel-based system to organize attendance and participation records digitally and reduce the manual work involved in the previous paper-based process.

## Deployment

The web application is deployed as a Python web service using Gunicorn on Render.

## Privacy

The public version of this repository uses fictional student names and fictional Academic IDs. It does not contain the original student identities or personal information.
