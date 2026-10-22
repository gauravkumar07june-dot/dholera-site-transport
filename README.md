# Dholera Site Transport

Staff vehicle booking, live dispatch board, driver screen and trip records for the TSMPL Dholera FAB site.

- **Book a ride**: staff request a vehicle (within site, priority meeting pickup, or going home to airport/station).
- **Dispatch**: the dispatcher sees who is waiting and where every vehicle is, and assigns with one tap.
- **Driver**: drivers mark "picked up" and "dropped" (Hindi labels included).
- **Records**: trips, waiting times, meeting on-time %, routes, departments, vehicle use, CSV export.
- **Fleet & setup**: vehicles, pickup points, destinations, QR link endings.

The website is static (hosted free on GitHub Pages). Bookings are stored in Firebase Firestore so every phone sees the same live data. Without Firebase settings it runs in demo mode with example data.

## Setup (about 15 minutes, one time)

### 1. Create the Firebase database (free)
1. Go to https://console.firebase.google.com and click **Create a project** (e.g. `dholera-site-transport`). Google Analytics is not needed.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.**
3. **Build → Firestore Database → Create database.** Choose location **asia-south1 (Mumbai)**, start in **production mode**.
4. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules` from this repo, and click **Publish**.
5. **Project settings (gear icon) → General → Your apps → Web (`</>`)**. Register the app (any nickname, no hosting needed). Copy the `firebaseConfig` values.
6. Paste those values into `firebase-config.js` in this repo and commit.
7. **Authentication → Settings → Authorized domains → Add domain**: `YOUR-GITHUB-USERNAME.github.io`.

### 2. Turn on GitHub Pages
Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save.**
After a minute the site is live at `https://YOUR-GITHUB-USERNAME.github.io/dholera-site-transport/`.

### 3. First use
- Open **Fleet & setup** and add your real vehicles, pickup points and destinations. To demo first, click **Load sample data**; remove it with **Remove sample data** before going live.
- Print QR codes for each pickup point using the link endings shown under Fleet & setup, e.g. `.../dholera-site-transport/#from-fab-building`.
- Bookmark `#dispatch` on the dispatcher's phone and `#driver` on each driver's phone.

## Notes
- The Firebase `apiKey` in `firebase-config.js` is not a secret; Firebase web keys are meant to be public. Access is controlled by the Firestore rules.
- Anyone who has the link can book. For a company-wide rollout, add employee login (e.g. email sign-in limited to the company domain) and get IT approval for storing staff names and mobile numbers.
- Free Firebase (Spark) plan: 50,000 reads and 20,000 writes per day, enough for a pilot with a few hundred trips a day.
