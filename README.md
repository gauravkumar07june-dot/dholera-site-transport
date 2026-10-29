# Dholera Site Transport (v7)

Ride booking for the TSMPL Dholera FAB site. Only L&T staff with a verified **@lntecc.com** email can sign in and book.

## What changed from v6
- **Sign-in with L&T email only.** Staff create an account with their @lntecc.com email and a password, then click the verification link once. No anonymous access; staff data is no longer public.
- **Booking like a ride app.** Pickup → drop, Now or Schedule, number of people, and a **dropdown of free vehicles and drivers** (nearest first). The admin approves and can change the vehicle.
- **Within-site rides are website only.** The WhatsApp booking button and the admin's "booking came on WhatsApp" form are removed. The admin sees requests in Dispatch (with a sound alert while the page is open).
- **Long distance needs IS approval.** The staff member sends the approval link to their IS on WhatsApp (and a copy to the admin). Only the IS named on the request can approve, after signing in with their own L&T email. If the staff list has the person's IS, the booking must use that IS.
- **Speedometer km.** The staff member types the reading before starting and at the drop. Km = end − start, checked by the database rules, then locked.
- **No driver login.** Drivers are a list (vehicle, driver name, mobile). Staff see the driver's name, vehicle and a Call button once assigned.
- **Works offline.** After the first sign-in, the app opens with no internet. Bookings and speedometer readings are saved on the phone and sent when the network is back. Staff can install it on the home screen ("Add to Home screen").

## Setup (one time)
1. **Firebase → Authentication → Sign-in method:** turn **Email/Password ON**. Turn **Anonymous OFF** (no longer used).
2. **Firebase → Authentication → Settings → Authorized domains:** make sure `gauravkumar07june-dot.github.io` is in the list.
3. **Firebase → Authentication → Templates:** optionally change the verification email sender name to "Dholera Site Transport".
4. **Firebase → Firestore → Rules:** paste `firestore.rules` and **Publish**.
5. **GitHub:** upload all files (`index.html`, `sw.js`, `firebase-config.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `firestore.rules`, `README.md`) and commit.
6. **Admin:** open the site, tap **Create account** with `gaurav.kumar21@lntecc.com`, verify the email. The Dispatch, Records and Setup tabs appear.
7. **Setup tab:**
   - Upload the **vehicle list** (Excel/CSV): Vehicle no · Type · Seats · Driver name · Driver mobile · Parked at.
   - Upload the **staff list** (Excel/CSV): PS no · Name · Email · Cadre · Department · Mobile · IS name · IS email · IS WhatsApp.
   - Enter the **admin WhatsApp number**, **manager emails** (they can see Records), and **rate per km** if drivers are paid per km.
   - Print the **QR code** for notice boards and pickup points.

To add another admin, add the email in **both** `firebase-config.js` (ADMIN_EMAILS) and `firestore.rules` (function isAdmin).

## Daily flow
1. **Staff** sign in → pick pickup, drop, time, people and a vehicle → **Request ride**.
2. **Admin** gets an alert in **Dispatch** → checks the vehicle → **Approve & assign** (optional: send the trip to the driver on WhatsApp).
3. **Staff** see the driver and vehicle → type the speedometer reading → **Start ride** → at the drop type the reading → **I reached**.
4. **Long distance:** staff send the link to the IS on WhatsApp → IS signs in and approves → IS taps "Tell the admin" → admin assigns from the link or Dispatch.
5. **Records:** km per vehicle and driver, km per day, every ride. **Download Excel** for payments.

## Good to know
- **Offline:** the first sign-in needs internet. A booking made offline reaches the admin only when the phone reconnects; the vehicle list may be out of date while offline.
- **Free-plan limits (Spark):** about 50,000 database reads and 1,000 verification emails per day. With 60–80 vehicles and hundreds of staff, reads can run out on busy days. Switching to the **Blaze** pay-as-you-go plan removes this; at this size it usually costs very little. Set a budget alert if you do.
- **Verification emails** sometimes land in Junk/Spam in Outlook. Tell staff to check there.
- **Updates:** when you change `index.html`, also change `VERSION` in `sw.js` (e.g. `dst-v7.1`) so phones load the new version.
