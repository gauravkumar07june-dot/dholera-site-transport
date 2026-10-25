# Dholera Site Transport (v6)

Staff vehicle booking for the TSMPL Dholera FAB site: name dropdown, IS approval for long distance, speedometer km per ride, km per driver per day, WhatsApp booking for staff who cannot use the website.

## Setup
1. Firebase → Authentication → Sign-in method: turn on **Anonymous** and **Email/Password**.
2. Firebase → Authentication → Users: admin `gaurav.kumar21@lntecc.com` (in `firebase-config.js` and `firestore.rules`). Add a user for each manager.
3. Firebase → Firestore → Rules: paste `firestore.rules` and **Publish**.
4. GitHub: upload all 5 files (`index.html`, `sw.js`, `firebase-config.js`, `firestore.rules`, `README.md`) and commit.
5. Site → Fleet & setup:
   - **Upload the staff list** (Excel or CSV). Columns: PS no · Name · Cadre · Department · Mobile · IS name · IS WhatsApp. Headings are read automatically; upload again to update.
   - Add vehicles with driver WhatsApp numbers.
   - Set **Rate per km** if you pay drivers per km (optional).
   - Print the QR code for all bookings.

## How it works
- **Booking:** staff type their name and pick it from the list; mobile, cadre, department and IS details fill in. Long-distance rides go to the IS for approval first.
- **WhatsApp booking:** staff who cannot use the site tap **Book on WhatsApp**. The admin enters the request in **Admin · Dispatch → Booking came on WhatsApp?** (about 30 seconds).
- **Speedometer:** start reading when the vehicle arrives, end reading when dropped. Km is calculated per ride.
- **Km per driver:** Records shows km per vehicle and driver for the period, and km per day. Download Excel for the full sheets.
- **Notes:** WhatsApp and SMS messages open ready-filled and need one tap to send.
