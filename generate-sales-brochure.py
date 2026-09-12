# -*- coding: utf-8 -*-
"""
PharmaCare — Sales / Marketing Brochure (Af-Soomaali)
Iibinta farmashiyada magaalada. Build: python generate-sales-brochure.py
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth

W, H = A4
OUT = "PharmaCare-Sales-Brochure.pdf"

# ---- Brand palette ----
TEAL   = HexColor("#0d9488")
TEAL_D = HexColor("#0f766e")
TEAL_DD= HexColor("#115e59")
TEAL_50= HexColor("#f0fdfa")
TEAL_SOFT=HexColor("#ccfbf1")
INK    = HexColor("#0f172a")
SLATE  = HexColor("#475569")
SLATE3 = HexColor("#94a3b8")
LINE   = HexColor("#e2e8f0")
BG     = HexColor("#f8fafc")
AMBER  = HexColor("#d97706")
AMBER_S= HexColor("#fef3c7")
INDIGO = HexColor("#6366f1")
WHITE  = HexColor("#ffffff")

c = canvas.Canvas(OUT, pagesize=A4)

# ---------- helpers ----------
def rrect(x, y, w, h, r, fill=None, stroke=None, sw=1):
    if fill is not None:
        c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke); c.setLineWidth(sw)
    c.roundRect(x, y, w, h, r, stroke=1 if stroke is not None else 0,
                fill=1 if fill is not None else 0)

def text(x, y, s, size=11, font="Helvetica", color=INK, center=False, right=False):
    c.setFont(font, size); c.setFillColor(color)
    if center: c.drawCentredString(x, y, s)
    elif right: c.drawRightString(x, y, s)
    else: c.drawString(x, y, s)

def wrap(s, font, size, maxw):
    words = s.split(); lines=[]; cur=""
    for w_ in words:
        t = (cur+" "+w_).strip()
        if stringWidth(t, font, size) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w_
    if cur: lines.append(cur)
    return lines

def para(x, y, s, size=10.5, font="Helvetica", color=SLATE, maxw=170*mm, leading=15):
    for ln in wrap(s, font, size, maxw):
        text(x, y, ln, size, font, color); y -= leading
    return y

def check_badge(x, y, color=TEAL, r=8):
    c.setFillColor(color); c.circle(x, y, r, fill=1, stroke=0)
    c.setStrokeColor(WHITE); c.setLineWidth(1.7); c.setLineCap(1)
    c.line(x-3.4, y-0.2, x-1.0, y-2.6); c.line(x-1.0, y-2.6, x+3.6, y+3.2)

def footer(page):
    text(20*mm, 12*mm, "PharmaCare — Nidaamka Maamulka Farmashiga", 8.5, "Helvetica", SLATE3)
    text(W-20*mm, 12*mm, "WhatsApp 063-6759479  ·  abdilaahimohamed374@gmail.com",
         8.5, "Helvetica", SLATE3, right=True)

# ============================================================ PAGE 1 — COVER
c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)

# top brand band
band_h = 118*mm
c.setFillColor(TEAL_DD); c.rect(0, H-band_h, W, band_h, fill=1, stroke=0)
c.setFillColor(TEAL_D);  c.rect(0, H-band_h, W, band_h-30*mm, fill=1, stroke=0)
c.setFillColor(TEAL);    c.rect(0, H-band_h, W, 8*mm, fill=1, stroke=0)
# soft blobs
c.setFillColor(HexColor("#14b8a6"))
c.circle(W-24*mm, H-30*mm, 30*mm, fill=1, stroke=0)
c.setFillColor(TEAL_D); c.circle(W-24*mm, H-30*mm, 22*mm, fill=1, stroke=0)

# logo tile
rrect(20*mm, H-42*mm, 16*mm, 16*mm, 5*mm, fill=WHITE)
text(28*mm, H-36.5*mm, "+", 26, "Helvetica-Bold", TEAL, center=True)
text(41*mm, H-33*mm, "PharmaCare", 25, "Helvetica-Bold", WHITE)
text(41*mm, H-39.5*mm, "Nidaamka Casriga ah ee Maamulka Farmashiga", 10.5, "Helvetica", TEAL_SOFT)

# headline
text(20*mm, H-64*mm, "Maamul farmashigaaga oo dhan —", 22, "Helvetica-Bold", WHITE)
text(20*mm, H-74*mm, "hal meel, si fudud oo casri ah.", 22, "Helvetica-Bold", WHITE)
y = H-86*mm
text(20*mm, y, "Iib · Bakhaar · Deyn · Shaybaadh · Warbixino — Af-Soomaali & English.",
     11.5, "Helvetica", TEAL_SOFT)

# offer ribbon
ry = H-band_h+14*mm
rrect(20*mm, ry, W-40*mm, 16*mm, 8*mm, fill=AMBER_S, stroke=AMBER, sw=1.2)
text(28*mm, ry+9.5*mm, "BILAASH", 13, "Helvetica-Bold", AMBER)
text(28*mm, ry+3.5*mm, "Bishii 1aad LACAG LA'AAN  +  Tababar bilaash ah oo shaqaalaha",
     10.5, "Helvetica-Bold", INK)

# value props (3)
props = [
    ("Xisaab sax ah", "Iyo warbixino toos ah — buugaag & khalad gacan waa dhammaadeen."),
    ("Xogtaadu waa amaan", "Cloud (online) — ma lumeyso, meel kastana ka eeg ganacsigaaga."),
    ("Fudud in la barto", "Af-Soomaali, muuqaal nadiif ah — shaqaaluhu hal maalin buu bartaa."),
]
py = ry-16*mm
for t_, d_ in props:
    check_badge(24*mm, py+2*mm)
    text(32*mm, py+3.5*mm, t_, 12, "Helvetica-Bold", INK)
    para(32*mm, py-3*mm, d_, 10, "Helvetica", SLATE, maxw=W-52*mm, leading=13)
    py -= 20*mm

# --- dashboard mockup card (fills the cover, shows the product) ---
mx, my, mw, mh = 20*mm, 48*mm, W-40*mm, 70*mm
rrect(mx, my, mw, mh, 10*mm, fill=WHITE, stroke=LINE, sw=1)
c.setFillColor(TEAL); c.circle(mx+10*mm, my+mh-9*mm, 2.2*mm, fill=1, stroke=0)
text(mx+16*mm, my+mh-10.5*mm, "Dashboard", 12, "Helvetica-Bold", INK)
text(mx+mw-8*mm, my+mh-10.5*mm, "Isniin, 8 Sept", 9, "Helvetica", SLATE3, right=True)
# 3 mini KPI cards
kpis = [("Dakhli maanta", "$1,240", TEAL_50, TEAL_DD),
        ("Iib", "58 dalab", HexColor("#eef2ff"), INDIGO),
        ("Faa'iido", "$291", HexColor("#dcfce7"), HexColor("#16a34a"))]
kw = (mw-20*mm-2*6*mm)/3
for i,(lbl,val,bg,cl) in enumerate(kpis):
    kx = mx+10*mm + i*(kw+6*mm)
    rrect(kx, my+mh-34*mm, kw, 20*mm, 5*mm, fill=bg)
    text(kx+5*mm, my+mh-22*mm, lbl, 8.2, "Helvetica", SLATE)
    text(kx+5*mm, my+mh-29*mm, val, 14, "Helvetica-Bold", cl)
# mini bar chart
bx, by = mx+12*mm, my+9*mm
text(bx, my+22*mm, "Dakhliga 7 maalmood", 8.5, "Helvetica-Bold", SLATE)
bars = [10, 15, 9, 18, 13, 20, 16]; bw = 7*mm; gap = ((mw-24*mm)-len(bars)*bw)/(len(bars)-1)
for i,v in enumerate(bars):
    c.setFillColor(TEAL if i != 5 else TEAL_DD)
    c.roundRect(bx+i*(bw+gap), by, bw, v*0.6*mm+2*mm, 2, fill=1, stroke=0)

# contact strip
rrect(20*mm, 22*mm, W-40*mm, 16*mm, 8*mm, fill=INK)
text(W/2, 31.5*mm, "Wac hadda si aad u bilowdo isku-daygaaga bilaashka ah",
     11, "Helvetica-Bold", WHITE, center=True)
text(W/2, 25.5*mm, "WhatsApp 063-6759479   ·   abdilaahimohamed374@gmail.com",
     10, "Helvetica", TEAL_SOFT, center=True)
c.showPage()

# ============================================================ PAGE 2 — PROBLEMS / WHY
c.setFillColor(WHITE); c.rect(0,0,W,H,fill=1,stroke=0)
text(20*mm, H-26*mm, "Dhibaatadaada — xalkeenna", 20, "Helvetica-Bold", INK)
text(20*mm, H-33*mm, "Waxa farmashiyadu maalin walba la kulmaan — iyo sida PharmaCare u xalliyo.",
     11, "Helvetica", SLATE)

pairs = [
    ("Xisaabaad gacan & buugaag lumaya", "Dhammaan iibka & xisaabta si toos ah — hal guji."),
    ("Lacagta khasnadda oo aan la ogayn", "Cash Close: maalintii & habeenkii (shift) + shortage/over."),
    ("Daawooyin dhaca oo lumiya lacag", "Digniin expiry ah + batch tracking — waqti hore ayaad ogaataa."),
    ("Stock dhammaada si lama filaan ah", "Digniin low-stock + liis dib-dalab (reorder) oo diyaar ah."),
    ("Deynta macaamiisha oo la illoobo", "Diiwaanka Deyn: qof kasta intuu ku leeyahay + lacag-bixin."),
    ("Rasiidh aan professional ahayn", "Rasiidh qurux badan oo logo leh — thermal 58/80mm."),
]
yy = H-46*mm
for prob, sol in pairs:
    rrect(20*mm, yy-16*mm, W-40*mm, 15*mm, 6*mm, fill=BG, stroke=LINE, sw=0.8)
    # problem
    c.setFillColor(HexColor("#fee2e2")); c.circle(28*mm, yy-8.5*mm, 3.4*mm, fill=1, stroke=0)
    text(28*mm, yy-10*mm, "!", 11, "Helvetica-Bold", HexColor("#dc2626"), center=True)
    text(35*mm, yy-6.5*mm, prob, 11, "Helvetica-Bold", INK)
    text(35*mm, yy-12*mm, sol, 9.7, "Helvetica", SLATE)
    yy -= 18.5*mm

# why-choose band
rrect(20*mm, 24*mm, W-40*mm, 34*mm, 9*mm, fill=TEAL_50, stroke=TEAL_SOFT, sw=1)
text(30*mm, 50*mm, "Sababta ay farmashiyadu u doortaan PharmaCare", 13, "Helvetica-Bold", TEAL_DD)
whys = ["Hal nidaam: iib + bakhaar + deyn + shaybaadh + warbixino",
        "Shaqeeya offline (internet la'aan) + app telefoonka",
        "Taageero & tababar Soomaali ah oo joogto ah"]
wy = 42*mm
for w_ in whys:
    check_badge(32*mm, wy+1.5*mm, r=6)
    text(38*mm, wy, w_, 10.3, "Helvetica", INK); wy -= 7.5*mm
footer(2)
c.showPage()

# ============================================================ PAGE 3 — FEATURES
c.setFillColor(WHITE); c.rect(0,0,W,H,fill=1,stroke=0)
text(20*mm, H-26*mm, "Waxa PharmaCare qaban karo", 20, "Helvetica-Bold", INK)
text(20*mm, H-33*mm, "Features-ka muhiimka ah ee shaqadaada kuu fududaynaya.",
     11, "Helvetica", SLATE)

features = [
    ("POS — Iib degdeg ah", "Barcode scanner, discount, mobile money (EVC/Zaad/Sahal/eDahab), rasiidh."),
    ("Bakhaar (Inventory)", "Batch, expiry, barcode, reorder level — digniino automatic ah."),
    ("Deyn (Credit)", "Diiwaanka deynta macaamiisha, lacag-bixin, taariikh buuxda."),
    ("Shaybaadh (Lab)", "~115 baadhitaan (dhiig, kaadi, candhuuf...), natiijo & warbixin."),
    ("Cash Close", "Isku-xisaabinta khasnadda shift kasta — maalin & habeen."),
    ("Reports & Dashboard", "Dakhli, faa'iido, profit margin %, Z-report, iib shaqaale kasta."),
    ("Returns / Refunds", "Soo-celinta alaabta + stock si toos ah dib loogu celiyo."),
    ("Doorar Shaqaale", "Cashier / Pharmacist / Admin — mid kasta wixii u gaar ah."),
    ("Backup & Amni", "Xogta cloud + backup — nabadgelyo buuxda oo ma lumeyso."),
]
col_w = (W-40*mm-10*mm)/2
gx = [20*mm, 20*mm+col_w+10*mm]
gy = H-46*mm
card_h = 26*mm
for i, (t_, d_) in enumerate(features):
    col = i % 2; row = i // 2
    x = gx[col]; y = gy - row*(card_h+6*mm)
    rrect(x, y-card_h, col_w, card_h, 8*mm, fill=BG, stroke=LINE, sw=0.8)
    rrect(x+6*mm, y-11*mm, 8*mm, 8*mm, 2.5*mm, fill=TEAL_SOFT)
    text(x+10*mm, y-9.4*mm, str(i+1), 11, "Helvetica-Bold", TEAL_DD, center=True)
    text(x+18*mm, y-9*mm, t_, 11.3, "Helvetica-Bold", INK)
    para(x+6*mm, y-16*mm, d_, 9.4, "Helvetica", SLATE, maxw=col_w-12*mm, leading=12)
footer(3)
c.showPage()

# ============================================================ PAGE 4 — OFFER + CTA
c.setFillColor(WHITE); c.rect(0,0,W,H,fill=1,stroke=0)

# big offer card
rrect(20*mm, H-96*mm, W-40*mm, 70*mm, 12*mm, fill=TEAL_DD)
c.setFillColor(TEAL); c.rect(20*mm, H-32*mm, W-40*mm, 6*mm, fill=1, stroke=0)
text(W/2, H-46*mm, "DALAB GAAR AH", 12, "Helvetica-Bold", TEAL_SOFT, center=True)
text(W/2, H-60*mm, "Bishii 1aad — LACAG LA'AAN", 24, "Helvetica-Bold", WHITE, center=True)
text(W/2, H-70*mm, "+ Tababar bilaash ah oo shaqaalaha oo dhan", 13, "Helvetica", TEAL_SOFT, center=True)
text(W/2, H-84*mm, "Isku day dhab ah — farmashigaaga ku maamul, ka dib go'aanka gaadh.",
     10.5, "Helvetica", WHITE, center=True)

# how to start — 3 steps
text(20*mm, H-112*mm, "Sida loo bilaabo — 3 tallaabo", 15, "Helvetica-Bold", INK)
steps = [
    ("1", "Nala soo xiriir", "Wac WhatsApp ama email — daqiiqado gudahood."),
    ("2", "Dejin & tababar", "Waan kuu dejinaa systemka, shaqaalahana waan baraa — bilaash."),
    ("3", "Bilow iibka", "Isla maalinta ayaad isticmaali kartaa — bishii 1aad free."),
]
sy = H-122*mm
for n, t_, d_ in steps:
    rrect(20*mm, sy-20*mm, W-40*mm, 18*mm, 8*mm, fill=BG, stroke=LINE, sw=0.8)
    c.setFillColor(TEAL); c.circle(31*mm, sy-11*mm, 6.5*mm, fill=1, stroke=0)
    text(31*mm, sy-13.4*mm, n, 15, "Helvetica-Bold", WHITE, center=True)
    text(42*mm, sy-8*mm, t_, 12.5, "Helvetica-Bold", INK)
    text(42*mm, sy-14.5*mm, d_, 10, "Helvetica", SLATE)
    sy -= 22*mm

# CTA contact
rrect(20*mm, 26*mm, W-40*mm, 30*mm, 10*mm, fill=INK)
text(W/2, 48*mm, "Diyaar ma u tahay inaad farmashigaaga casriyeyso?", 13, "Helvetica-Bold", WHITE, center=True)
text(W/2, 39*mm, "WhatsApp / Call:  063-6759479", 13, "Helvetica-Bold", TEAL_SOFT, center=True)
text(W/2, 32*mm, "Email:  abdilaahimohamed374@gmail.com", 11, "Helvetica", WHITE, center=True)
c.showPage()

c.save()
print("Saved", OUT)
