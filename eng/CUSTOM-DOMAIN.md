# 🌐 enghalbeeg.com — Sida loo xiro (Custom domain setup)

Hagahan wuxuu ku tusayaa sida aad website-kaaga (`eng/`) uga dhigto internet-ka adigoo
isticmaalaya domain-kaaga gaarka ah **enghalbeeg.com**. Waxa uu ku shaqeeyaa **Firebase
Hosting site-ka `enghalbeeg`** (maaha kan farmasiga).

> Adigu horeba waad iibsatay `enghalbeeg.com`. Tallaabooyinkan waa inaad ku samaysaa
> **Firebase Console** iyo bogga **DNS** ee registrar-kaaga (halka aad domain-ka ka iibsatay,
> tusaale Namecheap / GoDaddy / Squarespace/Google). Aniga (Claude) ma geli karo akoonkaaga,
> ee waan ku hagayaa.

---

## 1) Deploy website-ka marka hore
Ka hor domain-ka, hubi in nooca ugu dambeeya online yahay:

```bash
firebase deploy --only hosting:enghalbeeg
```

Ka dib waxaad ku eegtaa: **https://enghalbeeg.web.app** — waa inuu muuqdaa naqshadda cusub.

---

## 2) Firebase Console → Hosting → Add custom domain
1. Fur https://console.firebase.google.com → dooro project-ka
   **pharmency-management-system**.
2. Bar-ka bidix, guji **Hosting** → tab-ka **`enghalbeeg`** site (hubi inaad ka shaqaynaysid
   site-ka saxda ah).
3. Guji **Add custom domain** → geli **`enghalbeeg.com`** → **Continue**.
4. Sidoo kale ku dar **`www.enghalbeeg.com`** oo dooro **Redirect** → ku celi
   `enghalbeeg.com` (si labada u shaqeeyaan).

---

## 3) DNS records — geli registrar-kaaga
Firebase wuxuu ku siin doonaa qiyamka saxda ah. **Isticmaal kuwa Firebase kuu tusayo** —
IP-yadu way kala duwan yihiin project ilaa project, ha ka qorin meel kale.

**a. Xaqiijinta lahaanshaha (ownership) — haddii lagu weydiiyo:**
| Type | Host / Name | Value |
|------|-------------|-------|
| TXT  | `@`         | (qiimaha Firebase ku siiyo) |

**b. Tilmaamista domain-ka (A records) — apex `enghalbeeg.com`:**
| Type | Host / Name | Value (Firebase ka soo qaado) |
|------|-------------|-------------------------------|
| A    | `@`         | IP #1 ee Firebase muujiyo |
| A    | `@`         | IP #2 ee Firebase muujiyo |

**c. `www`:** ku dar isla A records-ka `www`, ama CNAME-ka Firebase ku siiyo.

> **Talooyin DNS:** haddii registrar-kaagu leeyahay "parking" ama A/CNAME records hore u
> jiray oo `@` ama `www` ah, tirtir kuwa hore si aynan isku dhicin.

---

## 4) Sug SSL + propagation
- Firebase si toos ah ayuu u sameeyaa **shahaado SSL (https) bilaash ah**.
- Isbeddelka DNS-ka wuxuu qaadan karaa **1 saac ilaa 24 saac**. Xaaladdu markay noqoto
  **"Connected"** (cagaaran), domain-ku diyaar ayuu yahay.
- Markaas: **https://enghalbeeg.com** wuxuu soo bandhigayaa website-kaaga, `www`na wuxuu ku
  celinayaa apex-ka.

---

## 5) Kadib
- Canonical-ka iyo social links-ka bogga (`eng/index.html`) horeba waxaa loo beddelay
  `https://enghalbeeg.com` — waafaqsan domain-ka cusub.
- Marka aad wax kasta cusboonaysiiso, isla `firebase deploy --only hosting:enghalbeeg`
  ayaa gaarsiinaya `enghalbeeg.com` (domain-ka mar keliya ayaa la xiraa).

---

## English quick reference
You already own `enghalbeeg.com`. In **Firebase Console → Hosting → `enghalbeeg` site →
Add custom domain**: enter `enghalbeeg.com` (and add `www.enghalbeeg.com` as a redirect).
Add the **TXT** record Firebase shows to verify ownership if asked, then add the **two A
records** it gives you at your registrar's DNS for the apex `@` (and A/CNAME for `www`).
**Use the exact values Firebase displays** — they are per-project. SSL is provisioned
automatically (up to ~24h). When the status reads **Connected**, `https://enghalbeeg.com`
is live. Deploy updates with `firebase deploy --only hosting:enghalbeeg`.
