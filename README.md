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

## Inviting non-flatmates (guest mode)

Each event has two share buttons: **🔗 Copy event link** (for flatmates — opens the app focused on that event) and **👋 Copy guest invite** (for outsiders — opens a single-event view with no access to the rest of the calendar). Guests can RSVP, bring +1s, and chat on that event only; they can't see other events or use the calendar.

⚠️ **Security caveat:** guest mode is a UI restriction, not a hard security boundary. The Firestore rules above still let any signed-in user read any event in the house if they query directly. For close friends this is fine. If you ever want to share with strangers, you'd need stricter rules (e.g., per-event allow-lists).

## Privacy note

Anyone who knows your house code can read and write to your events (assuming the Firestore rules above). Don't share the code publicly. If you want to revoke access, just change the code — your flatmates re-join with the new one and the old one becomes an orphan collection in Firestore (you can delete it from the console if you like).

## Tech

Single HTML file, no build step. Uses Firebase (Firestore for storage, anonymous auth) and FullCalendar 6 (month view + drag-and-drop). All loaded from CDNs.
