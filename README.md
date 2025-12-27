# SkillTrack - Udemy Course Tracker

A modern, engaging web application to track and manage your online learning progress from Udemy courses.

## Features

### Core Features
- **Course Display & Filtering** - View courses with clean design, filter by category and status
- **Course Management** - Add, edit, and manage course details
- **Progress Tracking** - Visual progress bars with completion percentages
- **Status Labels** - Track courses as Pending, In Progress, Up Next, or Completed
- **Favorites/Pinning** - Star courses and pin them to your dashboard
- **Dashboard Pinning** - Choose exactly which courses appear in your Active Learning section
- **Course Reordering** - Use ↑↓ buttons to prioritize courses in any list

### Dashboard
- **Progress Summary** - Monthly goal tracker, total completed, in progress, and average progress
- **Stat Cards** - Clickable cards to quickly filter by status
- **Active Learning Section** - Your pinned courses for focused learning
- **Up Next Section** - Courses marked as "Up Next" for planning

## Roadmap & Feature List

### Implemented ✅

1. - [x] **Quick Progress Update** - Click +/- buttons on progress bar to bump by 5%
2. - [ ] Search Keyboard Shortcut - Press `/` or `Cmd+K` to focus search
3. - [ ] Last Studied Indicator - Show when you last updated a course
4. - [ ] Bulk Status Change - Select multiple courses and change status at once
5. - [x] **Sidebar Counters** - Course counts displayed next to each tab
6. - [x] **Weekly/Monthly Progress Summary** - Stats card showing monthly progress
7. - [x] **Category Progress View** - Aggregate stats when viewing Personal/Improvement tabs
8. - [ ] Export/Backup Button - One-click export data as JSON
9. - [ ] Collapsible Course Notes - Expandable notes with clickable URLs
10. - [ ] Confirmation on Destructive Actions - "Are you sure?" dialogs
11. - [ ] Empty State Improvements - Helpful prompts when no results
12. - [x] **Mobile Bottom Navigation** - Tab bar for mobile users
13. - [ ] Duplicate Course Button - Quick copy of similar courses
14. - [ ] Course Count Badge on Dashboard Stats - Show exact counts
15. - [ ] Persist View Preference - Remember last tab visited
16. - [ ] Sort Options for Pinned Courses - Sort by deadline, progress, etc.
17. - [ ] Tags System - Add optional tags beyond categories
18. - [x] **Simple Goal Setting** - Set and track monthly completion goals
19. - [x] **Archive Completed Courses** - Hide completed courses from main views

### Coming Soon
- Deadline tracking with visual alerts
- Gamification elements (streaks, achievements)
- Course notes with GitHub/markdown integration

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Charts and visualizations
- **Lucide React** - Icons
- **LocalStorage** - Data persistence

## Data

Course data is loaded from `constants.ts` which contains the CSV data. Changes are persisted to localStorage automatically.

## License

MIT
