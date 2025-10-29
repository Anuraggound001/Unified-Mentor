## GYM Management System (Firebase + HTML/CSS/JS)

A modular, portable, and testable web app for managing a gym with Admin, Member, and User roles. Uses Firebase (Auth, Firestore, Storage) and vanilla HTML/CSS/JS. Digital receipts, notifications, exports, and responsive UI.

### Features
- Admin: login, members CRUD, fee packages, billing, monthly payment notifications, CSV export.
- Members: login, view receipts, notifications, diet details, supplement store (extensible placeholders).
- Users: login, view gym details, search records.
- Digital receipts in Firestore/Storage; automated alerts for dues and owner notifications.
- Action logging to console and Firestore.

### Repo Layout
```
index.html
admin.html
member.html
user.html
assets/
  css/styles.css
  js/
    firebase.sample.js  # copy to firebase.js and fill config
    firebase.js         # gitignored local file with your keys
    services/
      auth.js
      db.js
      logging.js
      notifications.js
      receipts.js
    pages/
      common.js
      admin.js
      member.js
      user.js
tests/
  test-runner.html
  services.test.js
functions/  (optional Cloud Functions for reminders)
  README.md
  index.js
```

### Prerequisites
- Node.js 18+ (for optional Cloud Functions/tests) and a modern browser.
- Firebase project with Auth, Firestore, Storage enabled.

### Setup (Local)
1) Clone repo, open the folder in a static server (or use VS Code Live Server).
2) Copy `assets/js/firebase.sample.js` to `assets/js/firebase.js` and update your config.
3) In Firebase Console:
   - Enable Email/Password auth (or Google, as you prefer).
   - Create Firestore in production or test mode.
   - Enable Storage.

### Running
- Open `index.html` via local server (required for Storage uploads in some browsers).

### Roles
- On first login, user document is created in `users/{uid}` with a `role` field (`admin` | `member` | `user`). Admin can update roles via Admin page.

### Security Rules (high level)
- Use Firestore/Storage rules to restrict per-role access. Example rules are documented in comments within `assets/js/services/db.js`.

### Tests
- Open `tests/test-runner.html` in a browser to run the lightweight unit tests for core services.

### Cloud Functions (Automated Alerts)
- Provided in `functions/` as a sample for scheduled fee due reminders and receipt-owner notifications. Deploy with `firebase deploy --only functions` after `firebase init functions`.

### Deployment Options
- Local: static server.
- Cloud hosting: Firebase Hosting, Netlify, Vercel, or any static host.
- Edge: Use CDN-hosted static files; Firebase services remain cloud-based.

### Logging
- All significant actions go through `LoggingService` and are recorded to console and optionally to Firestore `logs` collection.

### Export/Reports
- Admin can export CSV for members and receipts from the Admin page.

### Extensibility
- Add modules under `assets/js/services/` and `assets/js/pages/` (e.g., nutrition, personal training, supplement store) following the same patterns.

### Safety and Maintainability
- Role-checked operations in services.
- Centralized data access in `db.js`.
- No destructive operations without checks; soft-delete patterns can be added easily.

### Project Report (brief)
- Problem: Manage gym operations, avoid lost paper receipts, notify dues, and provide self-service.
- Architecture: Static frontend + Firebase (Auth, Firestore, Storage). Optional Cloud Functions for scheduled tasks.
- Modules: Auth, Members CRUD, Billing/Receipts, Notifications, Logging, Exports.
- Tests: Unit tests for core logic (auth role mapping, CSV export, formatters).
- Optimizations: Batched Firestore writes, lazy page initialization, minimal DOM reflows, modular services.

### How to Contribute
- Fork, create a feature branch, open a PR. Keep JS modular and add tests.


