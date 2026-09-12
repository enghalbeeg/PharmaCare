# 💊 PharmaCare — Pharmacy Management System

Nidaam casri ah oo maamulka farmasiga (pharmacy) ah. Wuxuu leeyahay **2 mode**:

- 💾 **Local mode** — fur `index.html`, browser kaliya, offline, demo. Wax setup ah uma baahna.
- ☁️ **Cloud mode (SaaS)** — Firebase Hosting + Firestore + Auth. Online, **realtime sync**, multi-user, multi-pharmacy, **PWA installable**. Eeg 👉 [DEPLOY.md](DEPLOY.md).

App-ku wuxuu si toos ah ugu beddelmaa Cloud mode marka `assets/js/firebase-config.js` la buuxiyo.

### 🔗 Live
- **Live app:** https://pharmency-management-system.web.app
- **Overview / features:** https://pharmency-management-system.web.app/promo/

### 🛠️ Tech Stack
`JavaScript (ES modules, buildless)` · `Firebase Auth` · `Cloud Firestore (realtime)` · `Firebase Hosting` · `PWA / Service Worker` · `HTML5` · `CSS3` · bilingual `Af-Soomaali / English`

> **Note on security:** the Firebase web config in `firebase-config.js` is safe to be public (client keys); access is enforced by `firestore.rules` (per-pharmacy tenant isolation + Auth).

---

## 🚀 Sida loo bilaabo (Getting Started)

1. Fur faylka **`index.html`** browser kasta (Chrome, Edge, Firefox).
2. Gal (Login):
   - Username: **`admin`**
   - Password: **`admin`**
3. Diyaar! Xogta tijaabada (demo) ayaa horeba u jirta si aad wax u tijaabiso.

> Xogtaadu waxay ku kaydsantaa **browser-kaaga** (localStorage). Si aad u kaydiso ama u wareejiso, isticmaal **Settings → Export Backup**.

### Accounts kale oo tijaabo ah
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Administrator |
| `pharmacist` | `1234` | Pharmacist |
| `cashier` | `1234` | Cashier |

---

## ✨ Features-ka

| Module | Waxa uu qabto |
|--------|---------------|
| 📊 **Dashboard** | KPIs (iib maanta, qiimaha bakhaarka), charts, digniinaha stock-ga & dhicitaanka |
| 💊 **Medicines (Inventory)** | Kor u qaad / wax ka beddel / tirtir dawooyinka · raadi · filter category/status · Export CSV |
| 🛒 **Point of Sale (POS)** | Cart, discount, tax, dhowr habab lacag-bixin, rasiidh la daabici karo |
| 🧾 **Sales History** | Diiwaanka iibka oo dhan, faa'iidada, fiiri/daabac rasiidh |
| 👥 **Customers** | Macaamiisha, taariikhda iibsiga, wadarta la kharash gareeyay |
| 🚚 **Suppliers** | Alaab-qeybiyeyaasha & xiriirkooda |
| 📥 **Purchases** | Soo-gelinta stock-ga — si toos ah ayuu u kordhiyaa bakhaarka |
| 📈 **Reports** | Iib, faa'iido, dawada ugu iibka badan, habab lacag-bixin, category breakdown |
| ⚙️ **Settings** | Magaca farmasiga, lacagta (currency), canshuurta, threshold-ka, Backup/Restore |

### Astaamo dheeraad ah
- 🌙 **Dark / Light mode** (badhanka topbar-ka)
- 🔔 **Digniino** — stock yar & dawooyin dhacaya
- 📱 **Responsive** — wuu ku shaqeeyaa mobile, tablet, iyo desktop
- 💾 **Backup/Restore** — JSON export/import
- 🖨️ **Print** — rasiidhada si toos ah loo daabaco

---

## 📁 Qaab-dhismeedka (Structure)

```
hospital system/
├── index.html               # Bogga ugu weyn (login + app shell + PWA)
├── manifest.webmanifest     # PWA manifest (installable)
├── service-worker.js        # Offline cache (app shell)
├── firebase.json            # Hosting + Firestore config
├── .firebaserc              # Firebase project id
├── firestore.rules          # Security rules (tenant isolation)
├── firestore.indexes.json
├── README.md  ·  DEPLOY.md
├── tools/
│   └── generate-icons.mjs   # (Dib-u-abuur icons; sharp ku shaqeeya)
└── assets/
    ├── icons/               # PWA icons (192, 512, maskable)
    ├── css/styles.css       # Design system (light/dark)
    └── js/
        ├── firebase-config.js  # 👉 Geli keys-kaaga halkan
        ├── store.js            # Data layer (dual-mode: local ⇆ cloud)
        ├── cloud.js            # Firebase Auth + Firestore (realtime)
        ├── ui.js               # Icons, toasts, modals
        ├── charts.js           # SVG charts (offline)
        └── app.js              # Router + dhammaan views-ka
```

---

## 💡 Talooyin
- **Currency beddel:** Settings → Sales Configuration → Currency Symbol (tusaale `$`, `Sh`, `KSh`).
- **Canshuur la'aan:** Tax Rate samee `0`.
- **Dib u bilow demo data:** Settings → Data Management → *Reload Demo Data*.
- **Tirtir xogta oo dhan:** Settings → Danger Zone → *Erase All Data*.

---

*Built with vanilla HTML, CSS & JavaScript — wax dependencies ah ma leh.*

## 👤 Author

**Abdalla Mohamed** — *Eng.Halbeeg*
Full-stack & Cloud SaaS Engineer · Burao, Somaliland

- 🌐 Portfolio: https://enghalbeeg.web.app
- 💻 GitHub: https://github.com/enghalbeeg
- ✉️ abdilaahimohamed374@gmail.com

> Sole architect & engineer of PharmaCare — designed and built end-to-end, now live in production for real pharmacies.
