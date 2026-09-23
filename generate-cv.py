# -*- coding: utf-8 -*-
"""Abdalla Mohamed — CV / Resume (A4). Build: python generate-cv.py"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth

W, H = A4
OUT = "eng/Abdalla-Mohamed-CV.pdf"
PHOTO = "eng/photo.jpg"

# palette
INK   = HexColor("#15181d")
SLATE = HexColor("#4a505a")
FAINT = HexColor("#8b929c")
LINE  = HexColor("#e4e5df")
AMBER = HexColor("#b26a12")
SIDE  = HexColor("#171b21")   # dark sidebar
SIDE2 = HexColor("#232833")
SWHITE= HexColor("#eef0f2")
SMUT  = HexColor("#9aa1ab")
SAMBER= HexColor("#e6a33c")
WHITE = HexColor("#ffffff")

c = canvas.Canvas(OUT, pagesize=A4)
SBW = 66*mm  # sidebar width

def T(x,y,s,size,font="Helvetica",color=INK,center=False,right=False,track=0):
    c.setFont(font,size); c.setFillColor(color)
    if track:
        c.drawString(x,y,"")  # noop
        cur=x
        for ch in s:
            c.drawString(cur,y,ch); cur+=stringWidth(ch,font,size)+track
        return
    if center: c.drawCentredString(x,y,s)
    elif right: c.drawRightString(x,y,s)
    else: c.drawString(x,y,s)

def wrap(s,font,size,maxw):
    out=[]; cur=""
    for w_ in s.split():
        while stringWidth(w_,font,size) > maxw:   # break an over-long token (e.g. a URL)
            i=1
            while i<len(w_) and stringWidth(w_[:i+1],font,size)<=maxw: i+=1
            if cur: out.append(cur); cur=""
            out.append(w_[:i]); w_=w_[i:]
        t=(cur+" "+w_).strip()
        if stringWidth(t,font,size)<=maxw: cur=t
        else:
            if cur: out.append(cur)
            cur=w_
    if cur: out.append(cur)
    return out

def para(x,y,s,size,font="Helvetica",color=SLATE,maxw=100*mm,lead=13.5):
    for ln in wrap(s,font,size,maxw):
        T(x,y,ln,size,font,color); y-=lead
    return y

# ---------------- sidebar ----------------
c.setFillColor(SIDE); c.rect(0,0,SBW,H,fill=1,stroke=0)
c.setFillColor(SAMBER); c.rect(0,H-5*mm,SBW,5*mm,fill=1,stroke=0)

# circular photo
cx, cy, r = SBW/2, H-33*mm, 22*mm
try:
    c.saveState()
    p=c.beginPath(); p.circle(cx,cy,r); c.clipPath(p,stroke=0,fill=0)
    c.drawImage(PHOTO, cx-r, cy-r, 2*r, 2*r, mask='auto', preserveAspectRatio=True)
    c.restoreState()
    c.setStrokeColor(SAMBER); c.setLineWidth(1.5); c.circle(cx,cy,r+1.5,stroke=1,fill=0)
except Exception as e:
    c.setFillColor(SIDE2); c.circle(cx,cy,r,fill=1,stroke=0)
    T(cx,cy-6,"EH",26,"Helvetica-Bold",SAMBER,center=True)

sx = 9*mm         # sidebar left pad
sw = SBW-2*9*mm   # sidebar content width

def side_head(y,label):
    T(sx,y,label.upper(),9.5,"Helvetica-Bold",SAMBER,track=1.2)
    c.setStrokeColor(SIDE2); c.setLineWidth(.8); c.line(sx,y-4,sx+sw,y-4)
    return y-14

y = H-62*mm
y = side_head(y,"Contact")
for val in ["abdilaahimohamed374@gmail.com","063-6759479 (WhatsApp)",
            "Burao, Somaliland","enghalbeeg.com","github.com/enghalbeeg"]:
    for ln in wrap(val,"Helvetica",7.9,sw):
        T(sx,y,ln,7.9,"Helvetica",SWHITE); y-=10.5
    y-=3
y-=6

y = side_head(y,"Skills")
skill_groups = [("Frontend","JavaScript · HTML5 · CSS3 · PWA · Responsive UI · i18n"),
                ("Backend & Cloud","Firebase · Firestore · Security Rules · Realtime · Offline-first"),
                ("Architecture","Multi-tenant SaaS · RBAC · System Design · Git · Python")]
for g,items in skill_groups:
    T(sx,y,g,8.6,"Helvetica-Bold",SWHITE); y-=11
    for ln in wrap(items,"Helvetica",8.2,sw): T(sx,y,ln,8.2,"Helvetica",SMUT); y-=10.5
    y-=5
y-=3

y = side_head(y,"Education")
T(sx,y,"B.Sc. Software Engineering",8.8,"Helvetica-Bold",SWHITE); y-=11
T(sx,y,"3 years' professional experience",8.2,"Helvetica",SMUT); y-=20

y = side_head(y,"Languages")
for lang,lvl in [("Somali","Native"),("English","Professional")]:
    T(sx,y,lang,8.6,"Helvetica-Bold",SWHITE); T(sx+sw,y,lvl,8.2,"Helvetica",SMUT,right=True); y-=13

# ---------------- main ----------------
mx = SBW+12*mm
mw = W-mx-14*mm
my = H-26*mm
T(mx,my,"ABDALLA MOHAMED",22,"Helvetica-Bold",INK); my-=9*mm
T(mx,my,"Eng.Halbeeg",12,"Helvetica-Bold",AMBER)
T(mx+stringWidth("Eng.Halbeeg  ","Helvetica-Bold",12)+4,my,"·  Senior Software Engineer",11,"Helvetica",SLATE)
my-=6*mm
c.setStrokeColor(LINE); c.setLineWidth(1); c.line(mx,my,mx+mw,my); my-=8*mm

def main_head(y,label):
    T(mx,y,label.upper(),10.5,"Helvetica-Bold",AMBER,track=1.4)
    y-=5; c.setStrokeColor(LINE); c.setLineWidth(.8); c.line(mx,y,mx+mw,y)
    return y-13

my = main_head(my,"Profile")
my = para(mx,my,
    "Software engineer based in Burao, Somaliland, with a B.Sc. in Software Engineering and 3 years building "
    "production software end-to-end. I design and ship reliable web apps and multi-tenant SaaS platforms — from "
    "architecture and data models to UI and deployment. Sole architect and engineer of PharmaCare, a bilingual "
    "pharmacy & laboratory platform now live for real pharmacies.",
    9.2,"Helvetica",SLATE,maxw=mw,lead=13.5)
my-=9

my = main_head(my,"Selected Projects")
def project(y,title,meta,bullets):
    T(mx,y,title,11,"Helvetica-Bold",INK)
    T(mx+mw,y,meta,8.6,"Helvetica",AMBER,right=True); y-=13
    for b in bullets:
        c.setFillColor(AMBER); c.circle(mx+2,y+2.6,1.3,fill=1,stroke=0)
        for i,ln in enumerate(wrap(b,"Helvetica",9,mw-7*mm)):
            T(mx+7*mm if i==0 else mx+7*mm,y,ln,9,"Helvetica",SLATE); y-=12
        y-=1
    return y-8

my = project(my,"PharmaCare — Pharmacy & Lab SaaS","Sole Architect & Engineer · Live",
    ["Multi-tenant SaaS on Firebase / Firestore — real-time sync and an offline-first PWA.",
     "POS with barcode, mobile money and thermal receipts; inventory with batch, expiry and reorder alerts.",
     "Laboratory module (~115 tests), credit (deyn) ledger, shift-based cash close and returns/refunds.",
     "Reports & dashboards (profit margin, printable Z-reports), role-based access, super-admin billing.",
     "Fully bilingual (Somali / English)."])
my = project(my,"School Management System","Web application",
    ["Manages students, classes, attendance and results with records and reporting in one place."])
my = project(my,"Business Websites","HTML · CSS · JavaScript",
    ["Fast, responsive, mobile-first websites for businesses — clean design and easy to update."])

# footer
c.setStrokeColor(LINE); c.line(mx,20*mm,mx+mw,20*mm)
T(mx,15*mm,"Portfolio:",8.5,"Helvetica-Bold",INK)
T(mx+stringWidth("Portfolio:  ","Helvetica-Bold",8.5),15*mm,"enghalbeeg.com",8.5,"Helvetica",AMBER)
T(mx+stringWidth("Portfolio:  enghalbeeg.com     ","Helvetica-Bold",8.5),15*mm,"·  github.com/enghalbeeg",8.5,"Helvetica",SLATE)
T(mx+mw,11*mm,"Available for freelance & senior engineering roles",7.8,"Helvetica-Oblique",FAINT,right=True)

c.save()
print("Saved", OUT)
