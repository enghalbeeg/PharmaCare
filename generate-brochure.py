# -*- coding: utf-8 -*-
# PharmaCare brochure generator.
# Run:  pip install reportlab   then   python generate-brochure.py
# Output: PharmaCare-Brochure.pdf (next to this script)
import os
"""PharmaCare — professional bilingual sales brochure (A4, multi-page)."""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, Color
from reportlab.lib.utils import simpleSplit

W, H = A4  # 595.27 x 841.89

TEAL   = HexColor('#0d9488')
TEAL_D = HexColor('#0f766e')
TEAL_DD= HexColor('#0b4f4a')
TEAL_SOFT = HexColor('#ccfbf1')
TEAL_50= HexColor('#e6fbf6')
INK    = HexColor('#0f172a')
MUTED  = HexColor('#475569')
MUTED2 = HexColor('#64748b')
LIGHT  = HexColor('#f8fafc')
BORDER = HexColor('#e2e8f0')
AMBER  = HexColor('#f59e0b')
AMBER_S= HexColor('#fef3c7')
GREEN  = HexColor('#16a34a')
GREEN_S= HexColor('#dcfce7')
INDIGO = HexColor('#6366f1')
INDIGO_S=HexColor('#e0e7ff')
VIOLET = HexColor('#8b5cf6')
VIOLET_S=HexColor('#ede9fe')
ROSE   = HexColor('#e11d48')
ROSE_S = HexColor('#ffe4e6')
BLUE   = HexColor('#2563eb')
BLUE_S = HexColor('#dbeafe')

c = canvas.Canvas(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PharmaCare-Brochure.pdf'), pagesize=A4)

def lerp(a, b, t):
    return Color(a.red+(b.red-a.red)*t, a.green+(b.green-a.green)*t, a.blue+(b.blue-a.blue)*t)

def vgrad(x, y, w, h, ctop, cbot, steps=160):
    step = h/steps
    for i in range(steps):
        t = i/(steps-1)
        c.setFillColor(lerp(ctop, cbot, t))
        c.rect(x, y+h-(i+1)*step, w, step+0.8, fill=1, stroke=0)

def dgrad(x, y, w, h, c1, c2, steps=160):
    # diagonal-ish gradient (top-left c1 -> bottom-right c2) approximated by vertical
    vgrad(x, y, w, h, c1, c2, steps)

def card(x, y, w, h, r=12, fill=white, stroke=BORDER, sw=1, shadow=False):
    if shadow:
        c.setFillColor(HexColor('#e2e8f0'))
        c.roundRect(x+1.5, y-2.5, w, h, r, fill=1, stroke=0)
    c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke); c.setLineWidth(sw)
        c.roundRect(x, y, w, h, r, fill=1, stroke=1)
    else:
        c.roundRect(x, y, w, h, r, fill=1, stroke=0)

def text(x, y, s, size=11, font='Helvetica', color=INK, align='left'):
    c.setFont(font, size); c.setFillColor(color)
    if align=='left': c.drawString(x, y, s)
    elif align=='center': c.drawCentredString(x, y, s)
    elif align=='right': c.drawRightString(x, y, s)

def para(x, y, s, size=10.5, font='Helvetica', color=MUTED, width=200, leading=15):
    c.setFont(font, size); c.setFillColor(color)
    lines = simpleSplit(s, font, size, width)
    for ln in lines:
        c.drawString(x, y, ln); y -= leading
    return y

# ---- simple white vector icons inside a colored tile ----
def icon_tile(x, y, s, kind, tile, glyph=white, r=11):
    c.setFillColor(tile); c.roundRect(x, y, s, s, r, fill=1, stroke=0)
    cx, cy = x+s/2, y+s/2
    c.setStrokeColor(glyph); c.setFillColor(glyph)
    c.setLineWidth(2.0); c.setLineCap(1); c.setLineJoin(1)
    u = s*0.28
    if kind=='pill':
        c.saveState(); c.translate(cx,cy); c.rotate(45)
        c.setLineWidth(2.2); c.roundRect(-u, -u*0.55, 2*u, u*1.1, u*0.55, fill=0, stroke=1)
        c.line(0,-u*0.55,0,u*0.55); c.restoreState()
    elif kind=='cart':
        c.setLineWidth(2.0)
        c.line(cx-u, cy+u*0.7, cx-u*0.55, cy+u*0.7)
        c.line(cx-u*0.55, cy+u*0.7, cx-u*0.2, cy-u*0.25)
        c.line(cx-u*0.2, cy-u*0.25, cx+u, cy-u*0.25)
        c.line(cx+u, cy-u*0.25, cx+u*1.15, cy+u*0.35)
        c.line(cx-u*0.55, cy+u*0.35, cx+u*1.05, cy+u*0.35)
        c.circle(cx-u*0.05, cy-u*0.75, u*0.16, fill=1, stroke=0)
        c.circle(cx+u*0.8, cy-u*0.75, u*0.16, fill=1, stroke=0)
    elif kind=='coin':
        c.setLineWidth(2.0); c.circle(cx, cy, u, fill=0, stroke=1)
        c.setFont('Helvetica-Bold', s*0.36); c.drawCentredString(cx, cy-s*0.13, '$')
    elif kind=='flask':
        c.setLineWidth(2.0)
        p = c.beginPath(); p.moveTo(cx-u*0.4, cy+u); p.lineTo(cx-u*0.4, cy+u*0.1)
        p.lineTo(cx-u, cy-u); p.lineTo(cx+u, cy-u); p.lineTo(cx+u*0.4, cy+u*0.1)
        p.lineTo(cx+u*0.4, cy+u); c.drawPath(p, fill=0, stroke=1)
        c.line(cx-u*0.6, cy-u, cx+u*0.6, cy-u)
    elif kind=='chart':
        bw=u*0.5
        for i,hh in enumerate([0.5,0.9,0.7]):
            bx=cx-u+ i*(bw+u*0.25)
            c.rect(bx, cy-u, bw, 2*u*hh, fill=1, stroke=0)
    elif kind=='cloud':
        c.setLineWidth(2.0)
        c.circle(cx-u*0.35, cy, u*0.5, fill=1, stroke=0)
        c.circle(cx+u*0.35, cy, u*0.6, fill=1, stroke=0)
        c.rect(cx-u*0.7, cy-u*0.55, u*1.5, u*0.75, fill=1, stroke=0)
    elif kind=='globe':
        c.setLineWidth(1.8); c.circle(cx,cy,u,fill=0,stroke=1)
        c.line(cx-u,cy,cx+u,cy); c.line(cx,cy-u,cx,cy+u)
        c.ellipse(cx-u*0.45, cy-u, cx+u*0.45, cy+u, fill=0, stroke=1)
    elif kind=='users':
        c.setLineWidth(2.0)
        c.circle(cx-u*0.45, cy+u*0.25, u*0.42, fill=1, stroke=0)
        c.circle(cx+u*0.55, cy+u*0.3, u*0.34, fill=1, stroke=0)
        p=c.beginPath(); p.moveTo(cx-u,cy-u*0.7); p.curveTo(cx-u,cy-u*0.1,cx+u*0.1,cy-u*0.1,cx+u*0.1,cy-u*0.7)
        c.drawPath(p,fill=1,stroke=0)
    elif kind=='box':
        c.setLineWidth(2.0); c.rect(cx-u, cy-u, 2*u, 2*u, fill=0, stroke=1)
        c.line(cx-u, cy, cx+u, cy); c.line(cx, cy, cx, cy+u)
    elif kind=='shield':
        c.setLineWidth(2.0)
        p=c.beginPath(); p.moveTo(cx,cy+u); p.lineTo(cx+u,cy+u*0.4); p.lineTo(cx+u,cy-u*0.2)
        p.curveTo(cx+u,cy-u,cx,cy-u,cx,cy-u); p.curveTo(cx,cy-u,cx-u,cy-u,cx-u,cy-u*0.2)
        p.lineTo(cx-u,cy+u*0.4); p.close(); c.drawPath(p,fill=0,stroke=1)
        c.line(cx-u*0.4,cy,cx-u*0.05,cy-u*0.35); c.line(cx-u*0.05,cy-u*0.35,cx+u*0.5,cy+u*0.35)
    elif kind=='truck':
        c.setLineWidth(2.0); c.rect(cx-u, cy-u*0.3, u*1.1, u*0.9, fill=0, stroke=1)
        p=c.beginPath(); p.moveTo(cx+u*0.1,cy+u*0.2); p.lineTo(cx+u*0.7,cy+u*0.2); p.lineTo(cx+u,cy-u*0.1); p.lineTo(cx+u,cy-u*0.3); p.lineTo(cx+u*0.1,cy-u*0.3)
        c.drawPath(p,fill=0,stroke=1)
        c.circle(cx-u*0.45,cy-u*0.55,u*0.2,fill=1,stroke=0); c.circle(cx+u*0.6,cy-u*0.55,u*0.2,fill=1,stroke=0)
    elif kind=='check':
        c.setLineWidth(2.6)
        c.line(cx-u*0.6, cy, cx-u*0.1, cy-u*0.5); c.line(cx-u*0.1, cy-u*0.5, cx+u*0.7, cy+u*0.6)
    elif kind=='mail':
        c.setLineWidth(1.9); c.rect(cx-u, cy-u*0.62, 2*u, u*1.24, fill=0, stroke=1)
        c.line(cx-u, cy+u*0.62, cx, cy); c.line(cx, cy, cx+u, cy+u*0.62)
    elif kind=='phone':
        c.setLineWidth(2.0); c.roundRect(cx-u*0.62, cy-u, u*1.24, 2*u, u*0.32, fill=0, stroke=1)
        c.circle(cx, cy-u*0.68, u*0.13, fill=1, stroke=0)

def check_bullet(x, y, s, size=10.5, color=INK, w=220):
    c.setStrokeColor(GREEN); c.setLineWidth(2.2); c.setLineCap(1)
    c.setFillColor(GREEN_S); c.circle(x+6, y+3, 8, fill=1, stroke=0)
    c.setStrokeColor(GREEN)
    c.line(x+2.5, y+3, x+5, y-0.5); c.line(x+5, y-0.5, x+9.5, y+6.5)
    c.setFont('Helvetica', size); c.setFillColor(color)
    lines = simpleSplit(s, 'Helvetica', size, w)
    yy=y
    for ln in lines:
        c.drawString(x+20, yy, ln); yy-=14
    return yy

def detail_card(x, y, w, h, ic, cl, sf, tso, ten, desc, example):
    card(x, y, w, h, 12, fill=white, stroke=BORDER, sw=1)
    icon_tile(x+16, y+h-54, 42, ic, sf, cl, r=12)
    text(x+72, y+h-26, tso, 14, 'Helvetica-Bold', INK)
    text(x+72, y+h-41, ten, 8.6, 'Helvetica-Oblique', MUTED2)
    para(x+72, y+h-57, desc, 9.4, 'Helvetica', MUTED, w-92, 12.5)
    # example strip
    ebx, eby, ebw, ebh = x+72, y+12, w-92, 22
    c.setFillColor(TEAL_50); c.roundRect(ebx, eby, ebw, ebh, 6, fill=1, stroke=0)
    c.setFillColor(TEAL); c.roundRect(ebx, eby, 3, ebh, 1.5, fill=1, stroke=0)
    c.setFont('Helvetica-Bold', 8.3); c.setFillColor(TEAL_D)
    c.drawString(ebx+12, eby+7.5, 'Tusaale:')
    lw = c.stringWidth('Tusaale:', 'Helvetica-Bold', 8.3)
    c.setFont('Helvetica', 8.3); c.setFillColor(MUTED)
    c.drawString(ebx+12+lw+5, eby+7.5, example)

def footer(page):
    c.setFillColor(MUTED2); c.setFont('Helvetica', 8)
    c.drawString(40, 26, 'PharmaCare  ·  Pharmacy & Lab Management System')
    c.drawRightString(W-40, 26, 'pharmency-management-system.web.app')
    c.setStrokeColor(BORDER); c.setLineWidth(0.7); c.line(40, 38, W-40, 38)

# =====================================================================
# PAGE 1 — COVER
# =====================================================================
vgrad(0, 0, W, H, TEAL_DD, TEAL)
# decorative circles
c.setFillColor(Color(1,1,1,alpha=0.06))
c.circle(W-40, H-60, 190, fill=1, stroke=0)
c.circle(60, 120, 150, fill=1, stroke=0)
c.setFillColor(Color(1,1,1,alpha=0.05)); c.circle(W-120, 180, 90, fill=1, stroke=0)

# logo tile
c.setFillColor(Color(1,1,1,alpha=0.18))
c.roundRect(W/2-34, H-176, 68, 68, 18, fill=1, stroke=0)
c.setStrokeColor(white); c.setLineWidth(4); c.setLineCap(1); c.setLineJoin(1)
lx, ly = W/2, H-142
c.line(lx-15, ly+8, lx, ly-6); c.line(lx, ly-6, lx+15, ly+8)
c.line(lx, ly-6, lx, ly+16); c.setFillColor(white); c.circle(lx, ly-18, 5, fill=1, stroke=0)

text(W/2, H-230, 'PharmaCare', 46, 'Helvetica-Bold', white, 'center')
c.setFillColor(TEAL_SOFT)
text(W/2, H-256, 'MODERN PHARMACY & LAB MANAGEMENT SYSTEM', 11, 'Helvetica-Bold', TEAL_SOFT, 'center')

# tagline pill
c.setFillColor(Color(1,1,1,alpha=0.14)); c.roundRect(W/2-190, H-330, 380, 46, 23, fill=1, stroke=0)
text(W/2, H-312, 'Maamul Farmashigaaga si Casri ah', 17, 'Helvetica-Bold', white, 'center')

text(W/2, H-370, 'Iibinta, Bakhaarka, Deynta, Shaybaadhka & Warbixinta — meel keliya.', 12, 'Helvetica', TEAL_SOFT, 'center')
text(W/2, H-388, 'Sales, Inventory, Credit, Laboratory & Reports — all in one.', 10, 'Helvetica-Oblique', Color(1,1,1,alpha=0.75), 'center')

# feature chips on cover
chips = ['Online & Offline', 'Af-Soomaali / English', 'Phone · Tablet · PC', 'Shaybaadh + Farmashi']
cy = H-450; total=0; gaps=14
c.setFont('Helvetica-Bold', 10)
widths=[c.stringWidth(t,'Helvetica-Bold',10)+28 for t in chips]
total=sum(widths)+gaps*(len(chips)-1); sx=W/2-total/2
for t,w in zip(chips,widths):
    c.setFillColor(Color(1,1,1,alpha=0.16)); c.roundRect(sx, cy-14, w, 26, 13, fill=1, stroke=0)
    text(sx+w/2, cy-5, t, 10, 'Helvetica-Bold', white, 'center'); sx+=w+gaps

# bottom CTA band
c.setFillColor(Color(1,1,1,alpha=0.12)); c.roundRect(40, 70, W-80, 92, 16, fill=1, stroke=0)
text(70, 128, 'Tijaabo bilaash ah — hadda', 15, 'Helvetica-Bold', white)
text(70, 108, 'Try the live demo today:', 9.5, 'Helvetica-Oblique', TEAL_SOFT)
text(70, 88, 'pharmency-management-system.web.app', 12, 'Helvetica-Bold', white)
# contact quick
c.setFillColor(white); c.roundRect(W-250, 84, 190, 62, 12, fill=1, stroke=0)
text(W-240, 128, 'Xiriir / Contact', 9, 'Helvetica-Bold', TEAL_D)
text(W-240, 112, 'WhatsApp: 063-6759479', 9.5, 'Helvetica-Bold', INK)
text(W-240, 96, 'abdilaahimohamed374@gmail.com', 8.2, 'Helvetica', MUTED)
c.showPage()

# =====================================================================
# PAGE 2 — PROBLEM + SOLUTION + DASHBOARD MOCKUP
# =====================================================================
def page_header(kicker, title_so, title_en):
    c.setFillColor(TEAL); c.roundRect(40, H-70, 5, 40, 2.5, fill=1, stroke=0)
    text(56, H-48, kicker, 10, 'Helvetica-Bold', TEAL)
    text(56, H-68, title_so, 22, 'Helvetica-Bold', INK)
    c.setFont('Helvetica', 11); c.setFillColor(MUTED2)
    c.drawString(56+c.stringWidth(title_so,'Helvetica-Bold',22)+10, H-68, '')
    text(56, H-84, title_en, 11, 'Helvetica-Oblique', MUTED2)

page_header('WAA MAXAY DHIBAATADU?', 'Dhibaatooyinka Maanta', 'The problems pharmacies face today')

pains = [
    ('Deyn la illoobo', 'Macaamiil badan ayaa deyn qaata — lacag badan baa lumaysa markii aan la raad-raacin.'),
    ('Daawo dhacda (expired)', 'La\'aanta digniin, daawooyinku way dhacaan — khasaare iyo khatar caafimaad.'),
    ('Cash aan la xisaabin', 'Khasnadda maalintii/habeenkii lama hubiyo — khaladaad iyo xatooyo lama ogaado.'),
    ('Warbixin la\'aan', 'Ma ogtahay faa\'iidadaada dhabta ah iyo waxa iibka badan? Badanaa maya.'),
]
yy = H-120
for i,(t,d) in enumerate(pains):
    col = i%2; row=i//2
    x = 40 + col*((W-80)/2+8); y = yy - row*82
    card(x, y-64, (W-80)/2-8, 64, 12, fill=HexColor('#fff5f5'), stroke=ROSE_S, sw=1.2)
    c.setFillColor(ROSE); c.circle(x+22, y-22, 12, fill=1, stroke=0)
    c.setFont('Helvetica-Bold', 13); c.setFillColor(white); c.drawCentredString(x+22, y-27, '!')
    text(x+42, y-20, t, 12, 'Helvetica-Bold', INK)
    para(x+42, y-36, d, 8.8, 'Helvetica', MUTED, (W-80)/2-58, 11.5)

# Solution band
sy = H-300
vgrad(40, sy-92, W-80, 92, TEAL, TEAL_D)
c.setFillColor(white)
text(60, sy-28, 'Xalka — PharmaCare', 18, 'Helvetica-Bold', white)
para(60, sy-48, 'Hal nidaam oo casri ah oo dhammaan howlahaas si toos ah u xalliya: iibinta degdega ah, '
     'raad-raaca deynta, digniinta stock-ga & dhicitaanka, xisaabinta khasnadda, iyo warbixin saxda ah — '
     'online iyo offline labadaba.', 9.6, 'Helvetica', TEAL_SOFT, W-140, 13)

# Dashboard mockup
mx, my, mw, mh = 40, 90, W-80, sy-92-108
card(mx, my, mw, mh, 14, fill=white, stroke=BORDER, sw=1, shadow=True)
# window bar
c.setFillColor(LIGHT); c.roundRect(mx, my+mh-30, mw, 30, 14, fill=1, stroke=0)
c.setFillColor(LIGHT); c.rect(mx, my+mh-40, mw, 12, fill=1, stroke=0)
for i,cl in enumerate([ROSE,AMBER,GREEN]):
    c.setFillColor(cl); c.circle(mx+18+i*14, my+mh-15, 4, fill=1, stroke=0)
text(mx+mw/2, my+mh-19, 'PharmaCare — Dashboard', 9, 'Helvetica-Bold', MUTED2, 'center')
# KPI cards
kpis = [('Dakhliga (Bisha)', '$4,820', TEAL, TEAL_SOFT, 'coin'),
        ('Iibka', '312', INDIGO, INDIGO_S, 'cart'),
        ('Stock Yar', '7', AMBER, AMBER_S, 'box'),
        ('Macaamiil', '148', GREEN, GREEN_S, 'users')]
kpw = (mw-40-3*10)/4
for i,(lab,val,cl,sf,ic) in enumerate(kpis):
    kx = mx+20 + i*(kpw+10); ky = my+mh-140
    card(kx, ky, kpw, 78, 12, fill=white, stroke=BORDER, sw=1)
    icon_tile(kx+12, ky+44, 24, ic, sf, cl, r=8)
    text(kx+12, ky+30, lab, 7.5, 'Helvetica', MUTED2)
    text(kx+12, ky+12, val, 17, 'Helvetica-Bold', INK)
# chart area
chx, chy, chw, chh = mx+20, my+24, mw*0.58-20, my+mh-160-my-24
card(chx, chy, chw, chh, 12, fill=white, stroke=BORDER, sw=1)
text(chx+14, chy+chh-20, 'Dakhliga 7 maalmood', 9.5, 'Helvetica-Bold', INK)
vals=[0.45,0.62,0.5,0.8,0.68,0.9,0.75]
bw=(chw-40)/len(vals)
for i,v in enumerate(vals):
    bx=chx+20+i*bw; bh=(chh-52)*v
    c.setFillColor(TEAL_SOFT); c.roundRect(bx, chy+22, bw*0.6, chh-52, 3, fill=1, stroke=0)
    c.setFillColor(TEAL); c.roundRect(bx, chy+22, bw*0.6, bh, 3, fill=1, stroke=0)
# recent sales panel
rpx = chx+chw+16; rpw = mx+mw-20-rpx
card(rpx, chy, rpw, chh, 12, fill=white, stroke=BORDER, sw=1)
text(rpx+12, chy+chh-20, 'Iibkii dambe', 9.5, 'Helvetica-Bold', INK)
rows=[('INV-1042','$28.50'),('INV-1041','$12.00'),('INV-1040','$44.75'),('INV-1039','$9.20')]
for i,(a,b) in enumerate(rows):
    ry=chy+chh-42-i*20
    c.setFillColor(TEAL_50); c.circle(rpx+18, ry+3, 7, fill=1, stroke=0)
    text(rpx+32, ry, a, 8.5, 'Helvetica-Bold', INK)
    text(rpx+rpw-12, ry, b, 8.5, 'Helvetica-Bold', TEAL_D, 'right')
footer(2)
c.showPage()

# =====================================================================
# PAGE 3 — FEATURES GRID
# =====================================================================
page_header('WAXA UU QABTO', 'Astaamaha Nidaamka', 'Everything your pharmacy needs — in one place')
feats = [
 ('cart', TEAL, TEAL_SOFT, 'Iibinta (POS)', 'Point of Sale', 'Iib degdeg ah, dhimis, cashuur, rasiidh professional ah.'),
 ('coin', GREEN, GREEN_S, 'Deyn & Lacag-bixin', 'Credit & Payments', 'Cash, Card, Mobile Money & Deyn. Ogow cidda ku leh & bixinta.'),
 ('pill', INDIGO, INDIGO_S, 'Bakhaarka Daawada', 'Inventory', 'Qaybo, batch, barcode, taariikh dhicid, digniin stock yar.'),
 ('flask', VIOLET, VIOLET_S, 'Shaybaadhka', 'Laboratory', '51 baadhitaan, natiijo + calaamad Sare/Hoose, warbixin la daabaco.'),
 ('box', AMBER, AMBER_S, 'Xidhitaanka Khasnadda', 'Cash Close', 'Maalin & Habeen (shifts), ogaanshaha naaqus/dheeraad.'),
 ('chart', BLUE, BLUE_S, 'Warbixin & Falanqayn', 'Reports', 'Dakhli, faa\'iido, alaabta iibka badan, qaybaha.'),
 ('cloud', TEAL, TEAL_SOFT, 'Online & Offline', 'Works Offline (PWA)', 'Ka shaqee internet la\'aan; wuu is-sync gareeyaa markuu soo laabto.'),
 ('globe', INDIGO, INDIGO_S, 'Laba Luqadood', 'Bilingual + Dark mode', 'Af-Soomaali & English, mode madow/iftiin.'),
 ('users', VIOLET, VIOLET_S, 'Shaqaale & Doorar', 'Staff & Roles', 'Admin, Pharmacist, Cashier — amni & furaha sir ah.'),
 ('truck', GREEN, GREEN_S, 'Alaab-qeybiyeyaal', 'Suppliers & Stock-in', 'Iibsi & soo-gelin alaab, raad-raac keyd.'),
]
cols=2; cw=(W-80-14)/cols; ch=78; gx=14; gy=12
sy=H-108
for i,(ic,cl,sf,tso,ten,desc) in enumerate(feats):
    col=i%cols; row=i//cols
    x=40+col*(cw+gx); y=sy-row*(ch+gy)-ch
    card(x, y, cw, ch, 12, fill=white, stroke=BORDER, sw=1)
    icon_tile(x+14, y+ch-52, 38, ic, sf, cl, r=11)
    text(x+64, y+ch-26, tso, 12.5, 'Helvetica-Bold', INK)
    text(x+64, y+ch-40, ten, 8.5, 'Helvetica-Oblique', MUTED2)
    para(x+64, y+ch-56, desc, 8.6, 'Helvetica', MUTED, cw-76, 11)
footer(3)
c.showPage()

# =====================================================================
# PAGE 4 & 5 — FEATURES EXPLAINED (plain language for non-technical readers)
# =====================================================================
details = [
 ('cart', TEAL, TEAL_SOFT, 'Iibinta (POS)', 'Selling',
  'Markaad wax iibinayso, kaliya taabo daawada — nidaamku wuxuu si toos ah u xisaabiyaa lacagta, dhimista iyo cashuurta, wuuna kuu daabacaa rasiidh. Ma jirto xisaab gacan oo khalad ah.',
  'Riix 3 daawo — wadarta iyo baaqiga si toos ah ayey u soo baxaan.'),
 ('coin', GREEN, GREEN_S, 'Deyn (Amaah)', 'Credit tracking',
  'Markii macmiil deyn qaato, nidaamku wuu xasuustaa magaciisa iyo intii uu ku leeyahay. Mar walba waad arki kartaa cidda ku leh lacag iyo inta ay tahay — waxbana kuma luma.',
  'Xasan $6 ayuu weli ku leeyahay — nidaamku wuu xasuustaa oo dib kuuma illoobo.'),
 ('pill', INDIGO, INDIGO_S, 'Bakhaarka Daawada', 'Inventory',
  'Nidaamku wuxuu kuu haynayaa tirada daawo kasta iyo taariikhda ay dhacayso. Markii mid dhammaanayo ama dhicid ku dhow tahay, wuu ku digaa — si aadan u waayin ama u iibin daawo dhacday.',
  'Paracetamol 15 xabbo — digniin "Stock yar" ayaa kuu timaadda si aad dib u dalbato.'),
 ('flask', VIOLET, VIOLET_S, 'Shaybaadhka', 'Laboratory',
  'Haddii aad shaybaadh leedahay, diiwaan geli baadhitaanka bukaanka, geli natiijada, nidaamkuna si toos ah ayuu u calaamadiyaa Caadi/Sare/Hoose — kadibna wuxuu daabacaa warbixin nadiif ah.',
  'Sonkorta dhiigga — geli qiimaha, nidaamku wuxuu kuu sheegaa "Caadi", "Sare" ama "Hoose".'),
 ('box', AMBER, AMBER_S, 'Xidhitaanka Khasnadda', 'Cash Close',
  'Maalinta ama habeenka dhammaadkiisa, geli lacagta khasnadda ku jirta, nidaamkuna wuxuu ku sheegaa haddii ay saxan tahay, naaqus tahay ama dheeraad tahay — si aad u ogaato khalad ama xatooyo.',
  'Nidaamku wuxuu filayaa $200, jira $190 — wuxuu ku tusaa "$10 naaqus".'),
]
details2 = [
 ('chart', BLUE, BLUE_S, 'Warbixin & Falanqayn', 'Reports',
  'Nidaamku wuxuu si toos ah kuu sameeyaa jaantusyo iyo tirooyin muujinaya dakhligaaga, faa\'iidada dhabta ah, iyo daawooyinka ugu iibka badan — si aad go\'aan wanaagsan u gaadho.',
  'Bishii hore $4,820 — daawada ugu iibka badan waa Amoxicillin.'),
 ('cloud', TEAL, TEAL_SOFT, 'Online & Offline', 'Works Offline',
  'Nidaamku wuu shaqeeyaa xitaa markii internetku go\'o. Xogtaadu ma luma — markii internetku soo laabto wuu is-cusboonaysiiyaa. Waxaad ku rakibi kartaa taleefanka sida app kasta.',
  'Internet go\'ay? Waad iibin kartaa — markuu soo noqdo wax walba wuu sync gareeyaa.'),
 ('globe', INDIGO, INDIGO_S, 'Laba Luqadood', 'Bilingual + Dark mode',
  'Nidaamku wuxuu ku shaqeeyaa Af-Soomaali iyo Ingiriisi — riix hal batoon si aad u beddesho. Wuxuu kaloo leeyahay mode madow oo indhaha u fudud habeenkii.',
  'Riix hal batoon — Af-Soomaali ama English, mid kastoo aad doorato.'),
 ('users', VIOLET, VIOLET_S, 'Shaqaale & Doorar', 'Staff & Roles',
  'U samee shaqaale kasta akoon gaar ah, go\'aamina waxa uu arki karo. Furaha (password) waa sir, macluumaadkuna waa badbaado leh — mid waliba wuxuu qabtaa kaliya shaqadiisa.',
  'Khasnajigu wuu iibin karaa, laakiin qiimaha ma beddeli karo — kaliya maamulaha.'),
 ('truck', GREEN, GREEN_S, 'Alaab-qeybiyeyaal', 'Suppliers & Stock-in',
  'Diiwaan geli alaab-qeybiyeyaashaada iyo alaabta aad ka soo iibsato. Markaad soo-gelin sameyso, bakhaarku si toos ah ayuu u kordhaa — lama xisaabiyo gacan.',
  'Soo iibso 500 xabbo Paracetamol — bakhaarku si toos ah 500 ayuu u kordhaa.'),
]

def details_page(items, kicker, tso, ten):
    page_header(kicker, tso, ten)
    dh, gap = 118, 10
    sy = H-110
    for i,(ic,cl,sf,a,b,desc,ex) in enumerate(items):
        y = sy - i*(dh+gap) - dh
        detail_card(40, y, W-80, dh, ic, cl, sf, a, b, desc, ex)
    footer(0)
    c.showPage()

details_page(details,  'SIDA UU U SHAQEEYO (1/2)', 'Astaamaha oo Faahfaahsan', 'How each feature helps you - in plain language')
details_page(details2, 'SIDA UU U SHAQEEYO (2/2)', 'Astaamaha oo Faahfaahsan', 'How each feature helps you - in plain language')

# =====================================================================
# PAGE 6 — BENEFITS + HOW IT WORKS
# =====================================================================
page_header('WAA MAXAY FAA\'IIDADA?', 'Waa Maxay Faa\'iidada?', 'Why pharmacies choose PharmaCare')
benefits = [
 'Jooji luminta lacagta — raac deyn kasta & khasnad kasta.',
 'Ha iibin daawo dhacday — digniin dhicid & stock yar.',
 'Ogow faa\'iidadaada dhabta ah — warbixin cad.',
 'Ka shaqee internet la\'aan — loogu talagalay xaaladda Somaliland.',
 'U muuqo mid professional ah — rasiidh & warbixin nadiif ah.',
 'Farmashi + Shaybaadh hal nidaam — uma baahnid qalab kale.',
 'Fudud shaqaalaha — Af-Soomaali, dhakhso loo barto.',
 'Isticmaal meel kasta — taleefan, tablet, ama kombuyuutar.',
]
yy=H-118
for i,b in enumerate(benefits):
    col=i%2; row=i//2
    x=40+col*((W-80)/2+8); y=yy-row*40
    check_bullet(x, y, b, 9.8, INK, (W-80)/2-30)

# How it works
hy=H-118-4*40-24
c.setFillColor(INK); text(40, hy, 'Sida loo bilaabo — 3 tallaabo', 15, 'Helvetica-Bold', INK)
text(40, hy-16, 'Get started in 3 easy steps', 9.5, 'Helvetica-Oblique', MUTED2)
steps=[('1','Isdiiwaangeli','Register your pharmacy','Samee akoon — daqiiqado gudahood.'),
       ('2','Ku dar daawooyinka','Add your medicines','Isticmaal catalog-ga (95 daawo) — hal gujis.'),
       ('3','Bilow iibinta','Start selling','POS, deyn, shaybaadh — diyaar!')]
swm=(W-80-2*14)/3
for i,(n,tso,ten,d) in enumerate(steps):
    x=40+i*(swm+14); y=hy-118
    card(x, y, swm, 96, 12, fill=LIGHT, stroke=BORDER, sw=1)
    vgrad(x+16, y+96-42, 30, 30, TEAL, TEAL_D)  # will be circle-ish; overlay circle
    c.setFillColor(white); c.rect(x+16-2, y+96-12, 34, 14, fill=1, stroke=0)  # mask top
    c.setFillColor(TEAL); c.circle(x+30, y+96-26, 15, fill=1, stroke=0)
    text(x+30, y+96-31, n, 15, 'Helvetica-Bold', white, 'center')
    text(x+16, y+40, tso, 12, 'Helvetica-Bold', INK)
    text(x+16, y+27, ten, 8, 'Helvetica-Oblique', MUTED2)
    para(x+16, y+14, d, 8.4, 'Helvetica', MUTED, swm-30, 10.5)
footer(4)
c.showPage()

# =====================================================================
# PAGE 5 — PRICING / CTA + CONTACT
# =====================================================================
vgrad(0, H-300, W, 300, TEAL_DD, TEAL)
c.setFillColor(Color(1,1,1,alpha=0.06)); c.circle(70, H-70, 130, fill=1, stroke=0)
text(W/2, H-90, 'Bilow Maanta', 34, 'Helvetica-Bold', white, 'center')
text(W/2, H-116, 'Start today — grow your pharmacy', 12, 'Helvetica-Oblique', TEAL_SOFT, 'center')
# subscription card
card(W/2-150, H-250, 300, 108, 16, fill=white, stroke=None, shadow=True)
text(W/2, H-172, 'Rukaab Bille ah', 13, 'Helvetica-Bold', TEAL_D, 'center')
text(W/2, H-150, 'Monthly Subscription', 9, 'Helvetica-Oblique', MUTED2, 'center')
text(W/2, H-205, 'Qiimo jaban', 22, 'Helvetica-Bold', INK, 'center')
text(W/2, H-226, '+ 3 maalmood nasiino haddii lacagtu daahdo', 8.5, 'Helvetica', MUTED, 'center')

# what's included quick list
inc = ['Dhammaan astaamaha', 'Cusboonaysiin bilaash ah', 'Taageero & hagid', 'Xogtaadu waa sir & badbaado leh']
iy=H-300-34
text(40, iy+6, 'Waxa ku jira / Included:', 12, 'Helvetica-Bold', INK)
for i,t in enumerate(inc):
    col=i%2; row=i//2
    check_bullet(40+col*((W-80)/2), iy-16-row*22, t, 9.8, INK, (W-80)/2-30)

# Trust band (fills the middle, adds reassurance)
tby=H-560; tbh=96
card(40, tby, W-80, tbh, 14, fill=LIGHT, stroke=BORDER, sw=1)
trust=[('shield', TEAL, TEAL_SOFT, 'Ammaan & Sir', 'Xogtaada waa la ilaaliyaa'),
       ('cloud', BLUE, BLUE_S, 'Offline-first', 'Ka shaqee internet la\'aan'),
       ('globe', VIOLET, VIOLET_S, 'Af-Soomaali', 'Fudud shaqaalaha')]
tcw=(W-80)/3
for i,(ic,cl,sf,tt,dd) in enumerate(trust):
    x=40+i*tcw+24; y=tby+tbh/2
    icon_tile(x, y-19, 38, ic, sf, cl, r=11)
    text(x+50, y+8, tt, 12.5, 'Helvetica-Bold', INK)
    text(x+50, y-8, dd, 9, 'Helvetica', MUTED)
    if i<2:
        c.setStrokeColor(BORDER); c.setLineWidth(1); c.line(40+(i+1)*tcw, tby+18, 40+(i+1)*tcw, tby+tbh-18)

# CONTACT big box
by=96; bh=176
card(40, by, W-80, bh, 16, fill=TEAL_50, stroke=TEAL_SOFT, sw=1.4)
text(60, by+bh-30, 'La xiriir — Contact us', 17, 'Helvetica-Bold', TEAL_D)
text(60, by+bh-48, 'Weydii demo, qiime, ama caawimaad dejin.', 9.5, 'Helvetica', MUTED)

def contact_row(x, y, ic, cl, sf, label, value, vsize=11):
    icon_tile(x, y, 36, ic, sf, cl, r=10)
    text(x+48, y+22, label, 8.2, 'Helvetica-Bold', MUTED2)
    text(x+48, y+6, value, vsize, 'Helvetica-Bold', INK)

colL=60; colR=W/2+14
contact_row(colL, by+66, 'phone', GREEN, GREEN_S, 'WHATSAPP', '063-6759479', 13)
contact_row(colL, by+16, 'mail', VIOLET, VIOLET_S, 'EMAIL', 'abdilaahimohamed374@gmail.com', 9.6)
contact_row(colR, by+66, 'cloud', BLUE, BLUE_S, 'WEBSITE', 'pharmency-management-system.web.app', 9.6)
contact_row(colR, by+16, 'check', TEAL, TEAL_SOFT, 'DEMO', 'Tijaabo bilaash ah', 12)

c.setFillColor(MUTED2); c.setFont('Helvetica', 8)
c.drawCentredString(W/2, 40, 'PharmaCare  ·  © 2026  ·  Made for pharmacies in Somaliland & Somalia')
c.showPage()

c.save()
print('PDF written')
