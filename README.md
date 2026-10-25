# Dholera Site Transport

Staff vehicle booking for the TSMPL Dholera FAB site, with one transport admin, delivery-style ride tracking and full ride records.

## How a ride works
1. **Staff book** from the link or a QR poster. Name, mobile and cadre are asked once and remembered on that phone.
   - Junior cadres (DET, GET, TC1–TC4, S1, S2, O1, O2, M1A, M1B): **Shared ride** (leaves at 4 people) or **Emergency** single car.
   - Senior cadres (M1C, M2A–M2C, M3A–M3C, PD, VP): **Single car** automatically.
   - Anyone: **Going home** (airport / railway station).
2. After booking, staff tap **Send to admin on WhatsApp** (or SMS). The message has the booking time, the request and a list of free drivers, each with a one-tap **assign** link.
3. **Admin** taps a driver's link (or uses Admin · Dispatch), checks the pickup point, and taps **Assign and notify**. Then sends the trip to the driver and the tracking link to the staff, one tap each.
4. **Tracking** (like a delivery app): Booked → Approved / vehicle assigned → Vehicle arrived at pickup → On board → Reached. Every step is time-stamped.
   - Driver taps **Arrived**, **Passengers on board**, **Dropped** on the trip link.
   - Staff tap **Vehicle arrived · I'm on board** and **I reached** on their tracking link; each also opens a WhatsApp message to the admin.
5. **Speedometer (km):** at ride start staff (or the driver) enter the speedometer reading; at the end they enter it again. The site calculates km travelled for every ride and shows it in Records and Excel.
6. **Long distance** (factory visit, home, airport, station): needs the **immediate supervisor's (IS) approval** first. Staff send the request to their IS on WhatsApp; the IS opens the link and taps Approve; then it reaches the admin. The admin can also mark "IS approved by phone".
7. **Staff & IS directory** (Fleet & setup): paste staff from Excel (PS no, Name, Cadre, Department, Mobile, IS name, IS WhatsApp). When staff type their PS no. while booking, everything fills in.
8. **Many bookings at once:** Admin · Dispatch shows "Auto-assign all ready", which gives the nearest free vehicle to every ready request, then lists the WhatsApp messages to send.
9. **Records** (admin and managers): every ride with all times, by route, cadre, department and vehicle. **Download Excel** gives the full list.

## Setup
1. Firebase → Authentication → Sign-in method: **Anonymous** and **Email/Password** on.
2. Firebase → Authentication → Users: admin `gaurav.kumar21@lntecc.com` (already in `firebase-config.js` and `firestore.rules`). Add a user for each manager too.
3. Firestore → Rules: paste `firestore.rules`, Publish.
4. GitHub: upload all files in this folder, commit.
5. On the site: Fleet & setup → add managers' emails, check the senior cadre list, add vehicles with driver WhatsApp numbers, print the QR posters.

## Note on messages
WhatsApp/SMS messages open ready-filled and need one tap on Send. Fully automatic messages need Firebase's pay-as-you-go plan plus a WhatsApp Business API or DLT-registered SMS provider.
