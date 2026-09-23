# 🚀 Deploy website-ka — computer-kaaga (Local deploy)

Hagahan wuxuu ku tusayaa sida aad website-ka (`eng/`) uga geyso internet-ka adigoo
isticmaalaya **Firebase Hosting**, computer-kaaga. Deploy-ku wuxuu u baahan yahay
**gelitaankaaga Firebase (Google)**, sidaas darteed adigaa ka ordaa mashiinkaaga.

> Site-ka portfolio-ku waa **`enghalbeeg`** (maaha kan farmasiga). Project id:
> `pharmency-management-system`.

---

## Tallaabooyinka (Somali)

**1. Hel code-ka ugu dambeeya**
Merge garee **PR #1** → `main` (github.com/enghalbeeg/PharmaCare/pull/1), ka dibna:
```bash
git clone https://github.com/enghalbeeg/PharmaCare.git
cd PharmaCare
```
Ama haddaadan wali merge gareyn, isticmaal branch-ka:
```bash
git clone https://github.com/enghalbeeg/PharmaCare.git
cd PharmaCare
git checkout claude/website-dlaz0w
```

**2. Rakib Firebase CLI** (hal mar oo keliya)
```bash
npm install -g firebase-tools
```

**3. Gal akoonkaaga**
```bash
firebase login
```
(Browser ayuu furayaa — dooro akoonka Google ee leh project-ka.)

**4. Deploy — portfolio-ka keliya**
```bash
firebase deploy --only hosting:enghalbeeg
```
> **MUHIIM:** ka ord **repo root** (halka `firebase.json` ku jiro), **maaha** ZIP-ka.
> Haddii aad rabto in aad labada site (farmasiga + portfolio) wada deploy gareyso:
> `firebase deploy`

**5. Dhammaad**
- Website-ku wuxuu ku noqonayaa: **https://enghalbeeg.web.app**
- `https://enghalbeeg.com` markii aad domain-ka ku xirto (eeg `CUSTOM-DOMAIN.md`).

---

## Steps (English)

1. **Get the latest code** — merge PR #1 into `main`, then `git clone` the repo (or
   `git checkout claude/website-dlaz0w` if not merged yet). `cd PharmaCare`.
2. **Install the CLI** (once): `npm install -g firebase-tools`
3. **Log in**: `firebase login`
4. **Deploy the portfolio only**: `firebase deploy --only hosting:enghalbeeg`
   — run from the **repo root** (where `firebase.json` lives), not from the ZIP. Use plain
   `firebase deploy` to publish both sites.
5. Live at **https://enghalbeeg.web.app**, and **enghalbeeg.com** once the custom domain is
   connected (see `CUSTOM-DOMAIN.md`).

---

### Node / npm looma hayo? (No Node yet?)
Rakib Node.js (LTS) marka hore: https://nodejs.org → ka dibna ku noqo tallaabada 2.
