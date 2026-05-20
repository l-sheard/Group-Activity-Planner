# Summer Planner

A shared web app for you and your flatmates to plan out activities for the month — month-view calendar with drag-and-drop, per-event categories, cost, location, who's coming, and notes. Everyone with the same "house code" sees the same calendar in real time.

It's one HTML file. The only setup is creating a free Firebase project so the data is shared between you and your flatmates.

---

## Quick start (about 10 minutes)

### 1. Create a free Firebase project

1. Go to https://console.firebase.google.com and click **Add project**. Name it anything (e.g. `summer-planner`).
2. You can skip Google Analytics.
3. Once the project is created, in the left sidebar go to **Build → Authentication → Get started**, then under **Sign-in method** enable **Anonymous**.
4. In the left sidebar go to **Build → Firestore Database → Create database**. Pick the region closest to you. Start in **production mode** (we'll set the rules in step 3).

### 2. Get your config and put it in `config.js`

1. In the Firebase console, click the gear icon → **Project settings**.
2. Scroll to **Your apps** and click the `</>` (Web) icon to register a new web app. Give it any nickname. You don't need Firebase Hosting yet.
3. Firebase shows you a `firebaseConfig` block. Copy the values.
4. In this project folder, copy `config.example.js` to a new file called `config.js`, then replace each placeholder with the matching value from Firebase. It should look like:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "summer-planner-xxxx.firebaseapp.com",
  projectId: "summer-planner-xxxx",
  storageBucket: "summer-planner-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef...",
};
```

> `config.js` is listed in `.gitignore` so it never gets pushed to a public repo. Firebase web API keys aren't strictly secret — they identify your project, not authenticate it — but keeping them out of source control is good hygiene and makes rotating them easier later.

### 3. Set Firestore rules

In the Firebase console, go to **Firestore Database → Rules** and replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /houses/{houseId}/events/{eventId} {
      allow read, write: if request.auth != null;
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    match /houses/{houseId}/wishlist/{itemId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish**. This lets any signed-in user (anonymous auth counts) read and write events, per-event chat messages, and shared activity ideas. Because the house code acts as a shared password, only people you give the code to can find your data.

> Want stricter rules later? You can add a `members` doc per house and check membership. For now, keep the house code something only your group knows.

### 4. Open the app

Just double-click `index.html`, or host it anywhere static — GitHub Pages, Netlify Drop (drag-and-drop the file), Vercel, Cloudflare Pages. Firebase Hosting works too if you want to keep everything in one place.

The first time you open it, you'll be asked for your name and a **house code**. Pick something memorable like `flat-42` or `croft-road-summer`. Give the same code to your flatmates — that's how you all see the same calendar.

### 5. Invite people

Click the **Invite** button at the top right to copy a link. The link looks like:

```
https://your-app-url/index.html?house=flat-42
```

Anyone who opens it will pre-fill the house code and just needs to type their name.

---

## Using the app

- **Add an event** — click `+ New event` or click any empty day on the calendar.
- **Move an event** — drag it to a different day. The change syncs to everyone instantly.
- **Edit / delete** — click an event, then use the Edit / Delete buttons in the side panel.
- **Switch views** — Month or List, top right of the calendar.
- **Categories** — colour-coded: Social, Day trip, Food, Night out, Chill, Other.
- **Costs** — set a per-person cost on each event; the side panel shows a running total for the month.

## Calendar sync

In the right sidebar, the **📅 Calendar sync** card has up to three buttons:

- **📤 Export group** downloads a `.ics` file of the shared house calendar. Import it into Apple Calendar, Google Calendar (Settings → Import & Export), Outlook, etc. Re-export to refresh — it's a snapshot.
- **📡 Live subscribe** (appears only after you set up the Cloudflare Worker — see below) copies a `webcal://` URL that calendar apps will subscribe to. New events from the app auto-appear in your phone calendar within a few hours.
- **📥 Import mine** uploads your own `.ics` (export from your personal calendar app first) so private events show as dashed-purple "🔒" blocks on top of the shared calendar. **These never leave your device** — they're stored only in your browser's localStorage and never sync to Firestore, so your flatmates can't see them.

### Live calendar subscription (optional, ~10 minutes)

The `.ics` download is a one-shot snapshot. For a live feed that auto-refreshes on everyone's phone, deploy the included `cloudflare-worker.js`. Cloudflare's free tier covers up to 100k requests/day — way more than you'll need.

1. **Fill in your Firebase values in `cloudflare-worker.js`.** Open the file in this repo, find the two placeholders at the top, and replace them with the same values from `config.js`:
   ```js
   const FIREBASE_API_KEY = "AIzaSy...";        // same as config.js apiKey
   const FIREBASE_PROJECT = "summer-planner-xxxx"; // same as config.js projectId
   ```
2. **Create a free Cloudflare account.** Go to https://dash.cloudflare.com → sign up. No credit card needed for the Workers free tier.
3. **Create a Worker.** In the Cloudflare dashboard, go to **Workers & Pages → Create → Create Worker**. Pick any name (e.g. `summer-planner-feed`) — that becomes your worker URL.
4. **Paste in the code.** Click **Edit code**, delete the default template, paste the contents of `cloudflare-worker.js` (with your filled-in Firebase values), then click **Deploy**.
5. **Copy the worker URL.** Cloudflare gives you a URL like `https://summer-planner-feed.YOUR-NAME.workers.dev`. Copy it.
6. **Paste it into `config.js`.** Open `config.js`, find `window.WORKER_URL = "";`, and put the worker URL inside the quotes:
   ```js
   window.WORKER_URL = "https://summer-planner-feed.YOUR-NAME.workers.dev";
   ```
7. **Push to GitHub.** Once GitHub Pages redeploys, a new **📡 Live subscribe** button appears in the sync card. Click it to copy a `webcal://` URL, then paste that into your calendar app:
   - **iOS Calendar**: Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar.
   - **Google Calendar**: Other calendars → + → From URL.
   - **macOS Calendar**: File → New Calendar Subscription.
   - **Outlook**: Add calendar → Subscribe from web.

Refresh interval is set by the calendar app (usually every few hours on phones, hourly on desktops). The worker itself caches for 15 minutes at the edge to keep Firestore reads low.

⚠️ The worker uses **anonymous Firebase sign-in** under the hood, which creates a fresh anonymous user account every time a calendar refresh hits the worker. These pile up in Firebase Auth's Users list over time — harmless, but every few months you can bulk-delete the anonymous ones in the Firebase console if you care about housekeeping.

## Inviting non-flatmates (guest mode)

Each event has two share buttons: **🔗 Copy event link** (for flatmates — opens the app focused on that event) and **👋 Copy guest invite** (for outsiders — opens a single-event view with no access to the rest of the calendar). Guests can RSVP, bring +1s, and chat on that event only; they can't see other events or use the calendar.

⚠️ **Security caveat:** guest mode is a UI restriction, not a hard security boundary. The Firestore rules above still let any signed-in user read any event in the house if they query directly. For close friends this is fine. If you ever want to share with strangers, you'd need stricter rules (e.g., per-event allow-lists).

## Privacy note

Anyone who knows your house code can read and write to your events (assuming the Firestore rules above). Don't share the code publicly. If you want to revoke access, just change the code — your flatmates re-join with the new one and the old one becomes an orphan collection in Firestore (you can delete it from the console if you like).

## Tech

Single HTML file, no build step. Uses Firebase (Firestore for storage, anonymous auth) and FullCalendar 6 (month view + drag-and-drop). All loaded from CDNs.
