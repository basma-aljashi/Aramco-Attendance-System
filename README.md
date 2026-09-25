# Advantage Academy Attendance System

A web-based attendance system developed during my cooperative training at Saudi Aramco to support the attendance registration process at Advantage Academy.

## Live Demo

[Open the Attendance System](https://aramco-attendance-system.onrender.com/)

## Project Overview

Advantage Academy is an educational program for orphaned students supported by Benaa Charitable Association in collaboration with Saudi Aramco. The program provides students with English and Mathematics classes.

As part of my cooperative training, I developed a website to support the attendance registration process at the academy.

The system allows students to register their attendance by selecting their full name and verifying their location. I also added features to make the process more organized, including location verification, prevention of duplicate attendance registration, failed-attempt tracking, attendance status tracking, Arabic and English language support, and interface customization.

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
- Gunicorn
- Render

## Project Structure

```text
Aramco-Attendance-System/
│
├── server1.py
├── requirements.txt
│
├── static/
│   ├── script.js
│   └── style.css
│
└── templates/
    └── index.html
