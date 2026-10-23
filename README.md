# Dholera Site Transport

Staff vehicle booking with one transport admin, for the TSMPL Dholera FAB site.

## How it works
1. **Staff** open the site and request a vehicle:
   - **Shared ride** (default): leaves when 4 people are going from the same point to the same place.
   - **Urgent**: meeting or emergency, with a reason. The admin decides whether to send a vehicle for one person.
   - **Going home**: airport or railway station. The admin approves and groups people leaving at the same time.
2. **Admin** (signed in) sees every request grouped by route on **Admin · Dispatch**. The admin phone rings and shows a notification for each new request once alerts are turned on.
   - A group with 4 or more people shows **Assign vehicle**. Pick a free vehicle (nearest first).
   - A group below 4 shows **Send now as urgent**, which needs a second tap to confirm and is counted in Records.
3. After assigning, tap **Send trip to driver on WhatsApp**. WhatsApp opens with the pickup, drop and passenger list ready; tap send.
4. **Driver** opens the Driver screen, taps **Passengers picked up**, then **Dropped at destination**.
5. **Records** (admin only): vehicle trips, people per vehicle, waiting time, urgent single trips, routes, departments, CSV export.

Messages are sent through WhatsApp from the admin's phone (one tap). Fully automatic SMS needs a paid server; see the end of this file.

## One-time setup in Firebase
1. **Authentication → Sign-in method**: turn on **Anonymous** and **Email/Password**.
2. **Authentication → Users → Add user**: create the admin's email and password.
3. **Authentication → Settings → Authorized domains**: `gauravkumar07june-dot.github.io` must be listed.
4. In this repo, put the admin email in two places:
   - `firebase-config.js` → `window.ADMIN_EMAILS = ["admin@example.com"];`
   - `firestore.rules` → replace `'paste_admin_email'` with the same email **in lowercase**.
5. **Firestore Database → Rules**: paste the whole `firestore.rules` file and click **Publish**.

## First use
- Sign in on **Admin · Dispatch**, open **Fleet & setup**, set the admin WhatsApp number, and add vehicles with each driver's WhatsApp mobile.
- On the admin phone, open Dispatch and tap **Turn on alerts**. Keep the page open with the screen on.
- Print QR codes for each pickup point using the links under Fleet & setup.

## Automatic SMS (optional, later)
Sending SMS without anyone tapping needs Firebase's pay-as-you-go plan (Cloud Functions) plus an Indian SMS provider registered on DLT (for example MSG91). Cost is small per message but needs a billing account and DLT template approval.
