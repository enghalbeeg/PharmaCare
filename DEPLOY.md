# 🚀 Deploy PharmaCare to Firebase

Hage kooban oo aad **online** ku dhigto app-ka (Firebase Hosting + Firestore + Auth).
App-ku wuxuu leeyahay **2 mode**:

- **Local mode** (default) — `firebase-config.js` weli `PASTE_...` ayuu leeyahay → browser-only, demo.
- **Cloud mode** — markaad keys-ka dhabta ah gelisid → online, realtime, multi-user, multi-pharmacy.

---

## 1️⃣ Firebase Console (≈5 daqiiqo)

[console.firebase.google.com](https://console.firebase.google.com) → project-kaaga (ama abuur cusub).

| Tallaabo | Meesha |
|----------|--------|
| **a. Authentication** | Build → Authentication → *Get started* → **Sign-in method** → enable **Email/Password** |
| **b. Firestore** | Build → Firestore Database → *Create database* → **Production mode** → dooro region (tusaale `eur3`) |
| **c. Web App** | ⚙ Project Settings → *Your apps* → **`</>`** → register app → koobi **`firebaseConfig`** |

## 2️⃣ Geli keys-ka

Fur [assets/js/firebase-config.js](assets/js/firebase-config.js) → ku beddel qiimayaasha `PASTE_...` kuwa aad ka koobiday:

```js
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-app.firebaseapp.com",
  projectId:         "your-app-id",
  storageBucket:     "your-app.appspot.com",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abc123"
};
```

Sidoo kale, [.firebaserc](.firebaserc) ku beddel `PASTE_YOUR_PROJECT_ID` → `projectId`-kaaga.

## 3️⃣ Firebase CLI + Deploy

```bash
npm install -g firebase-tools     # mar keliya
firebase login                    # browser ayaa furmaya — gal Google-kaaga

# folder-ka mashruuca dhexdiisa:
firebase deploy
```

`firebase deploy` wuxuu wada geynayaa:
- **Hosting** (app-ka) → `https://YOUR_PROJECT_ID.web.app`
- **Firestore rules** ([firestore.rules](firestore.rules)) → amniga tenant isolation-ka
- **Firestore indexes**

> Kaliya rules: `firebase deploy --only firestore:rules`
> Kaliya hosting: `firebase deploy --only hosting`

## 4️⃣ Isticmaal

1. Fur URL-ka (`https://YOUR_PROJECT_ID.web.app`).
2. Riix **"Create a pharmacy account"** → geli magacaaga, magaca farmasiga, email, password.
3. Waxaad noqonaysaa **Administrator** farmasi cusub. Xogtaadu way ka go'an tahay farmasiyada kale.
4. **Add Staff** (Settings) si aad shaqaale ugu darto.
5. **Install** (PWA): browser-ka address bar → ⊕ "Install" / "Add to Home Screen".

---

## 🔒 Amniga (Security)
- Farmasi kasta xogtiisu way **ka go'an tahay** mid kale (Firestore rules: `isMember(pid)`).
- Qof kaliya wuxuu arki/wax ka beddeli karaa farmasiga uu xubin ka yahay.
- Shaqaaluhu ma beddeli karaan role-kooda ama pharmacyId-kooda (rules).

## 💰 Qiimaha
- **Spark (bilaash):** ku filan farmasi yar (50K read, 20K write /maalin, 1GB DB, 10GB hosting/bil).
- **Blaze (pay-as-you-go):** marka aad korodho — wuxuu kaloo furaa Cloud Functions (custom claims, haddii la rabo).

## 🆘 Troubleshooting
| Dhibaato | Xal |
|----------|-----|
| App-ku weli "Local demo" muujinayaa | Hubi inaad keys-ka saxda ah gelisay `firebase-config.js` (ma jiraan `PASTE_`) |
| `Missing or insufficient permissions` | Hubi inaad `firestore.rules` deploy gareysay |
| `firebase: command not found` | `npm install -g firebase-tools` |
| Login `auth/operation-not-allowed` | Email/Password ma aadan enable gareyn (Tallaabo 1a) |
| Custom domain | Hosting → Add custom domain (console) |
