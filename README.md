# Dholera Site Transport (v7.1)

Ride booking for the TSMPL Dholera FAB site. Only L&T staff with a verified **@lntecc.com** email can sign in and book.

## What changed from v6
- **Sign-in with L&T email + code, no password.** Staff type their @lntecc.com email, get a 6-digit code in their L&T inbox, type it, and are signed in. They stay signed in on that phone. No anonymous access; staff data is no longer public.
- **Booking like a ride app.** Pickup → drop, Now or Schedule, number of people, and a **dropdown of free vehicles and drivers** (nearest first). The admin approves and can change the vehicle.
- **Within-site rides are website only.** The WhatsApp booking button and the admin's "booking came on WhatsApp" form are removed. The admin sees requests in Dispatch (with a sound alert while the page is open).
- **Long distance needs IS approval.** The staff member sends the approval link to their IS on WhatsApp (and a copy to the admin). Only the IS named on the request can approve, after signing in with their own L&T email. If the staff list has the person's IS, the booking must use that IS.
- **Speedometer km.** The staff member types the reading before starting and at the drop. Km = end − start, checked by the database rules, then locked.
- **No driver login.** Drivers are a list (vehicle, driver name, mobile). Staff see the driver's name, vehicle and a Call button once assigned.
- **Works offline.** After the first sign-in, the app opens with no internet. Bookings and speedometer readings are saved on the phone and sent when the network is back. Staff can install it on the home screen ("Add to Home screen").

## Setup (one time)
1. **Firebase → Firestore → Rules:** paste `firestore.rules` and **Publish**.
2. **Firebase → Authentication → Sign-in method:** turn **Anonymous OFF**. Email/Password can be turned off too (login codes do not use it).
3. **Login codes by email** — follow the section below (about 15 minutes).
4. **GitHub:** upload all files (`index.html`, `sw.js`, `firebase-config.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `firestore.rules`, `README.md`) and commit. `login-code-script.gs` is for Google Apps Script; it does not need to be on GitHub.
5. **Admin:** open the site, enter `gaurav.kumar21@lntecc.com`, type the code from the email. The Dispatch, Records and Setup tabs appear.
6. **Setup tab:**
   - Upload the **vehicle list** (Excel/CSV): Vehicle no · Type · Seats · Driver name · Driver mobile · Parked at.
   - Upload the **staff list** (Excel/CSV): PS no · Name · Email · Cadre · Department · Mobile · IS name · IS email · IS WhatsApp.
   - Enter the **admin WhatsApp number**, **manager emails** (they can see Records), and **rate per km** if drivers are paid per km.
   - Print the **QR code** for notice boards and pickup points.

To add another admin, add the email in **both** `firebase-config.js` (ADMIN_EMAILS) and `firestore.rules` (function isAdmin).

## Login codes by email
Codes are sent from a Gmail account by a free Google Apps Script. Use the Gmail that should appear as the sender (for example `gauravkumar07june@gmail.com`).

**A. Check that Gmail reaches L&T (1 minute).** From that Gmail, send any email to `gaurav.kumar21@lntecc.com`. If it arrives in Outlook (Inbox or Junk), codes will arrive too. If it does not, ask L&T IT to allow that Gmail address.

**B. Get the Firebase key.** Firebase Console → ⚙ Project settings → **Service accounts** → **Generate new private key** → a `.json` file downloads. Keep it private; anyone with it can sign in as anyone.

**C. Create the script.**
1. Open https://script.google.com signed in with the sending Gmail → **New project**. Name it "Dholera login codes".
2. Delete what is in `Code.gs` and paste all of `login-code-script.gs`. Click 💾 Save.
3. ⚙ **Project Settings** (left bar) → **Script properties** → **Add script property**: name `SERVICE_ACCOUNT_JSON`, value = open the downloaded .json in Notepad, copy **everything**, paste. **Save script properties**.

**D. Test it.**
1. Back in **Editor**, choose `testSetup` in the function list at the top → **Run**. Allow the permissions it asks for (Advanced → Go to project → Allow). The log should show the admin's Firebase account.
2. Choose `testEmail` → **Run**. A code email should arrive in `gaurav.kumar21@lntecc.com` (check Junk).

**E. Publish it.**
1. **Deploy → New deployment** → ⚙ type **Web app**.
2. Execute as: **Me** · Who has access: **Anyone** → **Deploy**.
3. Copy the **Web app URL** (ends in `/exec`).
4. In `firebase-config.js`, replace `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL, then upload `firebase-config.js` to GitHub.

If you change the script later: **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy** (the URL stays the same).

**Limits and safety**
- A free Gmail can email **100 people per day**. Each person needs a code only once per phone, so roll out over a few days for large groups. A Google Workspace account allows 1,500 per day.
- A code works for 10 minutes and 5 tries. One code per email per minute, 5 per hour, and 60 for everyone per hour.
- To block someone: Firebase → Authentication → Users → ⋮ → **Disable account**.

## Daily flow
1. **Staff** sign in with email + code (once per phone) → pick pickup, drop, time, people and a vehicle → **Request ride**.
2. **Admin** gets an alert in **Dispatch** → checks the vehicle → **Approve & assign** (optional: send the trip to the driver on WhatsApp).
3. **Staff** see the driver and vehicle → type the speedometer reading → **Start ride** → at the drop type the reading → **I reached**.
4. **Long distance:** staff send the link to the IS on WhatsApp → IS signs in and approves → IS taps "Tell the admin" → admin assigns from the link or Dispatch.
5. **Records:** km per vehicle and driver, km per day, every ride. **Download Excel** for payments.

## Good to know
- **Offline:** the first sign-in needs internet. A booking made offline reaches the admin only when the phone reconnects; the vehicle list may be out of date while offline.
- **Free-plan limits (Spark):** about 50,000 database reads per day. With 60–80 vehicles and hundreds of staff, reads can run out on busy days. Switching to the **Blaze** pay-as-you-go plan removes this; at this size it usually costs very little. Set a budget alert if you do.
- **Login code emails** may land in Junk in Outlook the first time. Tell staff to check there, or ask IT to allow the sending Gmail.
- **Updates:** when you change `index.html`, also change `VERSION` in `sw.js` (e.g. `dst-v7.1`) so phones load the new version.
