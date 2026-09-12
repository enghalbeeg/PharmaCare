/* ============================================================
   PharmaCare — Data Store (dual-mode: LOCAL ⇆ CLOUD)
   - Reads are synchronous from an in-memory `cache`.
   - LOCAL mode  : cache mirrors localStorage.
   - CLOUD mode  : cache mirrors Firestore via realtime snapshots.
   The public read API is identical, so views need no changes.
   ============================================================ */
const Store = (() => {
  const KEYS = {
    medicines:'pharma_medicines', sales:'pharma_sales', customers:'pharma_customers',
    suppliers:'pharma_suppliers', purchases:'pharma_purchases', settings:'pharma_settings',
    users:'pharma_users', session:'pharma_session', seeded:'pharma_seeded',
    labtests:'pharma_labtests', laborders:'pharma_laborders'
  };
  const COLLS = ['medicines','sales','customers','suppliers','purchases','payments','cashcloses','users','labtests','laborders','stockadjustments'];
  const CATEGORIES = ['Antibiotics','Analgesics','Antacids','Vitamins','Antihistamines',
    'Cardiovascular','Diabetes','Respiratory','Dermatology','Supplements','Other'];

  /* ---------- Built-in catalog of common pharmacy medicines (quick-add) ---------- */
  const CATALOG = [
    // Antibiotics
    ['Amoxicillin 500mg','Amoxicillin','Antibiotics'],['Amoxicillin 250mg','Amoxicillin','Antibiotics'],
    ['Amoxicillin + Clavulanate 625mg','Co-amoxiclav','Antibiotics'],['Azithromycin 500mg','Azithromycin','Antibiotics'],
    ['Azithromycin 250mg','Azithromycin','Antibiotics'],['Ciprofloxacin 500mg','Ciprofloxacin','Antibiotics'],
    ['Metronidazole 400mg','Metronidazole','Antibiotics'],['Doxycycline 100mg','Doxycycline','Antibiotics'],
    ['Cephalexin 500mg','Cephalexin','Antibiotics'],['Cotrimoxazole 480mg','Sulfamethoxazole/Trimethoprim','Antibiotics'],
    ['Erythromycin 500mg','Erythromycin','Antibiotics'],['Cloxacillin 500mg','Cloxacillin','Antibiotics'],
    ['Ampicillin 500mg','Ampicillin','Antibiotics'],['Ceftriaxone 1g Injection','Ceftriaxone','Antibiotics'],
    ['Cefixime 200mg','Cefixime','Antibiotics'],['Nitrofurantoin 100mg','Nitrofurantoin','Antibiotics'],
    // Analgesics / pain & fever
    ['Paracetamol 500mg','Acetaminophen','Analgesics'],['Paracetamol Syrup 120mg/5ml','Acetaminophen','Analgesics'],
    ['Ibuprofen 400mg','Ibuprofen','Analgesics'],['Ibuprofen 200mg','Ibuprofen','Analgesics'],
    ['Diclofenac 50mg','Diclofenac','Analgesics'],['Diclofenac 75mg Injection','Diclofenac','Analgesics'],
    ['Aspirin 300mg','Acetylsalicylic Acid','Analgesics'],['Naproxen 500mg','Naproxen','Analgesics'],
    ['Mefenamic Acid 500mg','Mefenamic Acid','Analgesics'],['Tramadol 50mg','Tramadol','Analgesics'],
    // Antacids / GI
    ['Omeprazole 20mg','Omeprazole','Antacids'],['Omeprazole 40mg','Omeprazole','Antacids'],
    ['Esomeprazole 40mg','Esomeprazole','Antacids'],['Pantoprazole 40mg','Pantoprazole','Antacids'],
    ['Ranitidine 150mg','Ranitidine','Antacids'],['Magnesium Trisilicate','Antacid','Antacids'],
    ['Domperidone 10mg','Domperidone','Antacids'],['Metoclopramide 10mg','Metoclopramide','Antacids'],
    ['Loperamide 2mg','Loperamide','Antacids'],['ORS Sachet','Oral Rehydration Salts','Antacids'],
    ['Hyoscine Butylbromide 10mg','Hyoscine','Antacids'],
    // Vitamins & supplements
    ['Vitamin C 1000mg','Ascorbic Acid','Vitamins'],['Vitamin C 500mg','Ascorbic Acid','Vitamins'],
    ['Vitamin B Complex','B Complex','Vitamins'],['Vitamin D3 1000IU','Cholecalciferol','Vitamins'],
    ['Multivitamin Tablets','Multivitamin','Supplements'],['Folic Acid 5mg','Folic Acid','Vitamins'],
    ['Ferrous Sulphate 200mg','Iron','Supplements'],['Calcium + Vitamin D','Calcium','Supplements'],
    ['Zinc Sulphate 20mg','Zinc','Supplements'],['Cod Liver Oil','Cod Liver Oil','Supplements'],
    // Antihistamines / allergy
    ['Cetirizine 10mg','Cetirizine','Antihistamines'],['Loratadine 10mg','Loratadine','Antihistamines'],
    ['Chlorpheniramine 4mg','Chlorpheniramine','Antihistamines'],['Promethazine 25mg','Promethazine','Antihistamines'],
    ['Fexofenadine 120mg','Fexofenadine','Antihistamines'],
    // Cardiovascular
    ['Amlodipine 5mg','Amlodipine','Cardiovascular'],['Amlodipine 10mg','Amlodipine','Cardiovascular'],
    ['Atenolol 50mg','Atenolol','Cardiovascular'],['Bisoprolol 5mg','Bisoprolol','Cardiovascular'],
    ['Lisinopril 10mg','Lisinopril','Cardiovascular'],['Losartan 50mg','Losartan','Cardiovascular'],
    ['Hydrochlorothiazide 25mg','Hydrochlorothiazide','Cardiovascular'],['Furosemide 40mg','Furosemide','Cardiovascular'],
    ['Atorvastatin 20mg','Atorvastatin','Cardiovascular'],['Simvastatin 20mg','Simvastatin','Cardiovascular'],
    ['Aspirin 75mg','Acetylsalicylic Acid','Cardiovascular'],['Methyldopa 250mg','Methyldopa','Cardiovascular'],
    ['Nifedipine 20mg','Nifedipine','Cardiovascular'],
    // Diabetes
    ['Metformin 500mg','Metformin','Diabetes'],['Metformin 850mg','Metformin','Diabetes'],
    ['Glibenclamide 5mg','Glibenclamide','Diabetes'],['Gliclazide 80mg','Gliclazide','Diabetes'],
    ['Glimepiride 2mg','Glimepiride','Diabetes'],['Insulin Mixtard','Insulin','Diabetes'],
    // Respiratory
    ['Salbutamol Inhaler','Salbutamol','Respiratory'],['Salbutamol 4mg','Salbutamol','Respiratory'],
    ['Salbutamol Syrup','Salbutamol','Respiratory'],['Cough Syrup (Bromhexine)','Bromhexine','Respiratory'],
    ['Guaifenesin Syrup','Guaifenesin','Respiratory'],['Ambroxol Syrup','Ambroxol','Respiratory'],
    ['Montelukast 10mg','Montelukast','Respiratory'],
    // Dermatology
    ['Hydrocortisone Cream 1%','Hydrocortisone','Dermatology'],['Betamethasone Cream','Betamethasone','Dermatology'],
    ['Clotrimazole Cream','Clotrimazole','Dermatology'],['Ketoconazole Cream','Ketoconazole','Dermatology'],
    ['Calamine Lotion','Calamine','Dermatology'],['Benzyl Benzoate Lotion','Benzyl Benzoate','Dermatology'],
    ['Gentian Violet','Gentian Violet','Dermatology'],['Acyclovir Cream','Aciclovir','Dermatology'],
    ['Fusidic Acid Cream','Fusidic Acid','Dermatology'],
    // Other (antimalarials, antiparasitics, misc)
    ['Artemether + Lumefantrine (Coartem)','Artemether/Lumefantrine','Other'],['Chloroquine 250mg','Chloroquine','Other'],
    ['Quinine 300mg','Quinine','Other'],['Albendazole 400mg','Albendazole','Other'],['Mebendazole 100mg','Mebendazole','Other'],
    ['Diazepam 5mg','Diazepam','Other'],['Hydrocortisone Injection','Hydrocortisone','Other'],['Dexamethasone 0.5mg','Dexamethasone','Other'],
  ].map(([name,genericName,category])=>({ name, genericName, category }));

  /* ---------- Laboratory: test categories + comprehensive built-in catalog ---------- */
  const LAB_CATEGORIES = ['Hematology','Coagulation','Biochemistry','Serology','Microbiology','Parasitology','Urinalysis','Stool','Sputum','Hormones','Pathology','Other'];
  const LAB_SAMPLES = ['Blood','Urine','Stool','Sputum','Swab','Semen','CSF','Fluid','Tissue'];
  // Single test: T(name,code,category,sample,refRange,unit).  Panel (multi-component): P(name,code,category,sample,[C(...),...]).
  const _T = (name,code,category,sampleType,refRange,unit)=>({ name, code, category, sampleType, refRange:refRange||'', unit:unit||'' });
  const _C = (name,refRange,unit)=>({ name, refRange:refRange||'', unit:unit||'' });
  const _P = (name,code,category,sampleType,components)=>({ name, code, category, sampleType, refRange:'', unit:'', components });
  const LAB_CATALOG = [
    /* ---- Hematology ---- */
    _P('Complete Blood Count (CBC)','CBC','Hematology','Blood',[
      _C('Hemoglobin (Hb)','M 13–17 / F 12–15','g/dL'), _C('Hematocrit (HCT)','M 40–50 / F 36–46','%'),
      _C('WBC Count','4.0–11.0','×10⁹/L'), _C('RBC Count','M 4.5–5.9 / F 4.1–5.1','×10¹²/L'),
      _C('Platelet Count','150–450','×10⁹/L'), _C('MCV','80–100','fL'), _C('MCH','27–33','pg'),
      _C('MCHC','32–36','g/dL'), _C('Neutrophils','40–75','%'), _C('Lymphocytes','20–45','%') ]),
    _T('Hemoglobin (Hb)','HB','Hematology','Blood','M 13–17 / F 12–15','g/dL'),
    _T('Hematocrit (HCT / PCV)','HCT','Hematology','Blood','M 40–50 / F 36–46','%'),
    _T('White Blood Cell (WBC)','WBC','Hematology','Blood','4.0–11.0','×10⁹/L'),
    _T('Platelet Count','PLT','Hematology','Blood','150–450','×10⁹/L'),
    _T('ESR','ESR','Hematology','Blood','M 0–15 / F 0–20','mm/hr'),
    _T('Blood Group & Rh','BG','Hematology','Blood','',''),
    _T('Reticulocyte Count','RETIC','Hematology','Blood','0.5–2.5','%'),
    _T('Peripheral Blood Film','PBF','Hematology','Blood','',''),
    _T('Sickling Test','SICK','Hematology','Blood','Negative',''),
    _T('G6PD Screen','G6PD','Hematology','Blood','Normal',''),
    _T('Hb Electrophoresis','HBEL','Hematology','Blood','',''),
    /* ---- Coagulation ---- */
    _T('Prothrombin Time (PT)','PT','Coagulation','Blood','11–14','sec'),
    _T('INR','INR','Coagulation','Blood','0.8–1.2',''),
    _T('APTT','APTT','Coagulation','Blood','25–35','sec'),
    _T('Bleeding Time (BT)','BT','Coagulation','Blood','2–7','min'),
    _T('Clotting Time (CT)','CT','Coagulation','Blood','5–10','min'),
    _T('D-Dimer','DDIM','Coagulation','Blood','< 0.5','µg/mL'),
    _T('Fibrinogen','FIB','Coagulation','Blood','200–400','mg/dL'),
    /* ---- Biochemistry ---- */
    _T('Fasting Blood Sugar (FBS)','FBS','Biochemistry','Blood','70–110','mg/dL'),
    _T('Random Blood Sugar (RBS)','RBS','Biochemistry','Blood','70–140','mg/dL'),
    _T('2h Post-Prandial Sugar','PPBS','Biochemistry','Blood','< 140','mg/dL'),
    _T('HbA1c','HBA1C','Biochemistry','Blood','4.0–5.6','%'),
    _T('OGTT (Glucose Tolerance)','OGTT','Biochemistry','Blood','',''),
    _P('Renal Function Test (RFT)','RFT','Biochemistry','Blood',[
      _C('Urea','15–45','mg/dL'), _C('Creatinine','0.6–1.3','mg/dL'), _C('Uric Acid','3.5–7.2','mg/dL') ]),
    _T('Urea','UREA','Biochemistry','Blood','15–45','mg/dL'),
    _T('Creatinine','CREA','Biochemistry','Blood','0.6–1.3','mg/dL'),
    _T('Uric Acid','URIC','Biochemistry','Blood','3.5–7.2','mg/dL'),
    _P('Electrolytes','LYTES','Biochemistry','Blood',[
      _C('Sodium (Na⁺)','135–145','mmol/L'), _C('Potassium (K⁺)','3.5–5.1','mmol/L'),
      _C('Chloride (Cl⁻)','98–107','mmol/L'), _C('Bicarbonate (HCO₃⁻)','22–29','mmol/L') ]),
    _P('Liver Function Test (LFT)','LFT','Biochemistry','Blood',[
      _C('SGPT (ALT)','7–56','U/L'), _C('SGOT (AST)','5–40','U/L'), _C('ALP','44–147','U/L'),
      _C('GGT','8–61','U/L'), _C('Total Bilirubin','0.1–1.2','mg/dL'), _C('Direct Bilirubin','0.0–0.3','mg/dL'),
      _C('Total Protein','6.0–8.3','g/dL'), _C('Albumin','3.5–5.2','g/dL') ]),
    _T('SGPT (ALT)','ALT','Biochemistry','Blood','7–56','U/L'),
    _T('SGOT (AST)','AST','Biochemistry','Blood','5–40','U/L'),
    _T('Total Bilirubin','TBIL','Biochemistry','Blood','0.1–1.2','mg/dL'),
    _T('Albumin','ALB','Biochemistry','Blood','3.5–5.2','g/dL'),
    _P('Lipid Profile','LIPID','Biochemistry','Blood',[
      _C('Total Cholesterol','< 200','mg/dL'), _C('HDL Cholesterol','> 40','mg/dL'),
      _C('LDL Cholesterol','< 100','mg/dL'), _C('Triglycerides','< 150','mg/dL') ]),
    _T('Total Cholesterol','CHOL','Biochemistry','Blood','< 200','mg/dL'),
    _T('Triglycerides','TG','Biochemistry','Blood','< 150','mg/dL'),
    _T('Calcium','CA','Biochemistry','Blood','8.5–10.5','mg/dL'),
    _T('Magnesium','MG','Biochemistry','Blood','1.7–2.2','mg/dL'),
    _T('Phosphate','PHOS','Biochemistry','Blood','2.5–4.5','mg/dL'),
    _T('Amylase','AMY','Biochemistry','Blood','30–110','U/L'),
    _T('Lipase','LIP','Biochemistry','Blood','10–140','U/L'),
    _T('CK (Creatine Kinase)','CK','Biochemistry','Blood','30–200','U/L'),
    _T('CK-MB','CKMB','Biochemistry','Blood','< 25','U/L'),
    _T('LDH','LDH','Biochemistry','Blood','140–280','U/L'),
    _T('Troponin I','TROP','Biochemistry','Blood','< 0.04','ng/mL'),
    _T('CRP (Quantitative)','CRPQ','Biochemistry','Blood','< 6','mg/L'),
    _P('Iron Studies','IRON','Biochemistry','Blood',[
      _C('Serum Iron','60–170','µg/dL'), _C('TIBC','240–450','µg/dL'), _C('Ferritin','M 30–400 / F 15–150','ng/mL') ]),
    _T('Ferritin','FERR','Biochemistry','Blood','M 30–400 / F 15–150','ng/mL'),
    _T('Vitamin D (25-OH)','VITD','Biochemistry','Blood','30–100','ng/mL'),
    _T('Vitamin B12','B12','Biochemistry','Blood','200–900','pg/mL'),
    _T('Folate','FOL','Biochemistry','Blood','3–17','ng/mL'),
    /* ---- Serology / Immunology ---- */
    _T('Widal Test','WIDAL','Serology','Blood','Negative',''),
    _T('Hepatitis B (HBsAg)','HBSAG','Serology','Blood','Negative',''),
    _T('Hepatitis C (Anti-HCV)','HCV','Serology','Blood','Negative',''),
    _T('HIV I & II','HIV','Serology','Blood','Negative',''),
    _T('VDRL / RPR (Syphilis)','VDRL','Serology','Blood','Non-reactive',''),
    _T('TPHA','TPHA','Serology','Blood','Negative',''),
    _T('Rheumatoid Factor (RF)','RF','Serology','Blood','Negative',''),
    _T('ASO Titre','ASO','Serology','Blood','< 200','IU/mL'),
    _T('CRP (Qualitative)','CRP','Serology','Blood','Negative',''),
    _T('H. Pylori (Antibody)','HPAB','Serology','Blood','Negative',''),
    _T('Brucella (Agglutination)','BRUC','Serology','Blood','Negative',''),
    _T('Dengue NS1 Antigen','DENAG','Serology','Blood','Negative',''),
    _T('Dengue IgG / IgM','DENAB','Serology','Blood','Negative',''),
    _T('Typhoid IgM / IgG','TYPH','Serology','Blood','Negative',''),
    _T('Toxoplasma IgG / IgM','TOXO','Serology','Blood','Negative',''),
    _T('Rubella IgG / IgM','RUB','Serology','Blood','Negative',''),
    _T('ANA (Antinuclear Ab)','ANA','Serology','Blood','Negative',''),
    _T('COVID-19 Antigen','COVAG','Serology','Swab','Negative',''),
    _T('COVID-19 Antibody','COVAB','Serology','Blood','Negative',''),
    /* ---- Microbiology (Culture & Sensitivity) ---- */
    _T('Urine Culture & Sensitivity','URC','Microbiology','Urine','No growth',''),
    _T('Stool Culture & Sensitivity','STC','Microbiology','Stool','No growth',''),
    _T('Blood Culture','BLC','Microbiology','Blood','No growth',''),
    _T('Wound Swab Culture','WSC','Microbiology','Swab','No growth',''),
    _T('Throat Swab Culture','TSC','Microbiology','Swab','No growth',''),
    _T('High Vaginal Swab (HVS)','HVS','Microbiology','Swab','No growth',''),
    _T('Gram Stain','GRAM','Microbiology','Swab','',''),
    _T('KOH Preparation','KOH','Microbiology','Swab','No fungal elements',''),
    _T('Fungal Culture','FUNG','Microbiology','Swab','No growth',''),
    /* ---- Parasitology ---- */
    _T('Malaria (BF / RDT)','MAL','Parasitology','Blood','Negative',''),
    _T('Stool Microscopy (O/P)','STOOL','Parasitology','Stool','No ova/parasites',''),
    _T('Blood Film for Microfilaria','MFIL','Parasitology','Blood','Negative',''),
    _T('Leishmania (LD Bodies)','LEISH','Parasitology','Tissue','Negative',''),
    /* ---- Urinalysis ---- */
    _P('Urine Routine & Microscopy','URIN','Urinalysis','Urine',[
      _C('Colour','Pale yellow',''), _C('Appearance','Clear',''), _C('pH','4.5–8.0',''),
      _C('Specific Gravity','1.005–1.030',''), _C('Protein','Negative',''), _C('Glucose','Negative',''),
      _C('Ketones','Negative',''), _C('Blood','Negative',''), _C('Leukocytes','Negative',''),
      _C('Nitrites','Negative',''), _C('Pus Cells','0–5','/HPF'), _C('RBCs','0–2','/HPF') ]),
    _T('Urine Pregnancy Test (hCG)','UPT','Urinalysis','Urine','Negative',''),
    _T('Urine Microalbumin','UMA','Urinalysis','Urine','< 30','mg/L'),
    _T('24h Urine Protein','U24P','Urinalysis','Urine','< 150','mg/24h'),
    _T('Urine Ketones','UKET','Urinalysis','Urine','Negative',''),
    _T('Urine Bile Salts / Pigments','UBILE','Urinalysis','Urine','Negative',''),
    /* ---- Stool ---- */
    _T('Stool Routine Examination','STRT','Stool','Stool','',''),
    _T('Stool Occult Blood','OCBL','Stool','Stool','Negative',''),
    _T('Stool H. Pylori Antigen','HPYL','Stool','Stool','Negative',''),
    _T('Reducing Substances','REDS','Stool','Stool','Negative',''),
    /* ---- Sputum ---- */
    _T('Sputum AFB / ZN Stain (TB)','AFB','Sputum','Sputum','Negative',''),
    _T('Sputum Culture','SPC','Sputum','Sputum','No growth',''),
    _T('Sputum GeneXpert (MTB/RIF)','GXP','Sputum','Sputum','MTB not detected',''),
    _T('Sputum Gram Stain','SGRAM','Sputum','Sputum','',''),
    /* ---- Hormones / Endocrine ---- */
    _P('Thyroid Profile','TFT','Hormones','Blood',[
      _C('TSH','0.4–4.0','mIU/L'), _C('Free T3 (FT3)','2.3–4.2','pg/mL'), _C('Free T4 (FT4)','0.8–1.8','ng/dL') ]),
    _T('TSH','TSH','Hormones','Blood','0.4–4.0','mIU/L'),
    _T('Prolactin','PRL','Hormones','Blood','M 4–15 / F 4–23','ng/mL'),
    _T('Testosterone (Total)','TEST','Hormones','Blood','M 280–1100 / F 15–70','ng/dL'),
    _T('Estradiol (E2)','E2','Hormones','Blood','',''),
    _T('Progesterone','PROG','Hormones','Blood','',''),
    _T('LH','LH','Hormones','Blood','',''),
    _T('FSH','FSH','Hormones','Blood','',''),
    _T('Cortisol (AM)','CORT','Hormones','Blood','6–23','µg/dL'),
    _T('Insulin (Fasting)','INS','Hormones','Blood','2–25','µIU/mL'),
    _T('PSA (Prostate)','PSA','Hormones','Blood','< 4','ng/mL'),
    _T('Beta-hCG (Blood)','BHCG','Hormones','Blood','','mIU/mL'),
    /* ---- Pathology / Special ---- */
    _P('Semen Analysis','SEMEN','Pathology','Semen',[
      _C('Volume','1.5–5','mL'), _C('Sperm Count','> 15','million/mL'),
      _C('Motility','> 40','%'), _C('Morphology (Normal)','> 4','%') ]),
    _T('Pap Smear (Cytology)','PAP','Pathology','Swab','',''),
    _T('CSF Analysis','CSF','Pathology','CSF','',''),
    _T('Body Fluid Analysis','FLUID','Pathology','Fluid','',''),
    _T('Biopsy / Histopathology','BIOP','Pathology','Tissue','',''),
  ];

  /* ---------- Runtime state ---------- */
  let mode = 'local';                 // 'local' | 'cloud'
  let current = null;                 // current session/profile
  let changeCb = () => {};
  const cache = { medicines:[], sales:[], customers:[], suppliers:[], purchases:[], payments:[], cashcloses:[], users:[], labtests:[], laborders:[], settings:{},
                  pharmacy:null, config:{}, platform:{ pharmacies:[], users:[], audit:[], errors:[] } };

  /* ---------- Platform default configuration (features, plans, announcement) ---------- */
  const DEFAULT_CONFIG = {
    platformName:'PharmaCare', supportEmail:'support@pharmacare.so',
    announcement: { message:'', type:'info', active:false },
    features: {
      pos:          { label:'Point of Sale',     minPlan:'free', enabled:true },
      inventory:    { label:'Inventory',         minPlan:'free', enabled:true },
      sales:        { label:'Sales History',     minPlan:'free', enabled:true },
      customers:    { label:'Customers',         minPlan:'free', enabled:true },
      suppliers:    { label:'Suppliers',         minPlan:'free', enabled:true },
      purchases:    { label:'Purchases / Stock-in', minPlan:'pro', enabled:true },
      deyn:         { label:'Deyn (Credit/Debt)',  minPlan:'free', enabled:true },
      cashClose:    { label:'Daily Cash Close',    minPlan:'free', enabled:true },
      lab:          { label:'Laboratory',         minPlan:'free', enabled:true },
      reports:      { label:'Reports & Analytics',   minPlan:'pro', enabled:true },
      staff:        { label:'Staff accounts',    minPlan:'pro', enabled:true },
      multiCurrency:{ label:'Multi-currency',    minPlan:'pro', enabled:false },
      barcode:      { label:'Barcode scanner',   minPlan:'pro', enabled:false },
    },
    plans: {
      free: { label:'Free', maxProducts:100,    maxStaff:2 },
      pro:  { label:'Pro',  maxProducts:100000, maxStaff:100 },
    },
    billing: { defaultMonthlyFee: 10, graceDays: 3 },
  };
  function getConfig(){
    const c = cache.config || {};
    const featKeys = Object.keys({ ...DEFAULT_CONFIG.features, ...(c.features||{}) });
    return {
      ...DEFAULT_CONFIG, ...c,
      announcement: { ...DEFAULT_CONFIG.announcement, ...(c.announcement||{}) },
      features: Object.fromEntries(featKeys.map(k => [k, { ...(DEFAULT_CONFIG.features[k]||{}), ...((c.features||{})[k]||{}) }])),
      plans: { free:{...DEFAULT_CONFIG.plans.free, ...((c.plans||{}).free||{})}, pro:{...DEFAULT_CONFIG.plans.pro, ...((c.plans||{}).pro||{})} },
      billing: { ...DEFAULT_CONFIG.billing, ...(c.billing||{}) },
    };
  }

  /* ---------- Subscription billing (platform charges the pharmacy monthly) ---------- */
  const DAY = 86400000;
  function addMonth(ts){ const d=new Date(ts); d.setMonth(d.getMonth()+1); return d.getTime(); }
  function billingState(p){
    const sub = p && p.subscription;
    if (!sub || !sub.paidUntil) return { state:'active', unset:true, paidUntil:null, daysLeft:null }; // grandfathered
    const now = Date.now();
    const grace = ((sub.graceDays != null ? sub.graceDays : (getConfig().billing.graceDays)) || 3) * DAY;
    if (now < sub.paidUntil) return { state:'active', paidUntil:sub.paidUntil, daysLeft: Math.max(0, Math.ceil((sub.paidUntil-now)/DAY)) };
    if (now < sub.paidUntil + grace) return { state:'grace', paidUntil:sub.paidUntil, daysLeft: Math.max(0, Math.ceil((sub.paidUntil+grace-now)/DAY)) };
    return { state:'locked', paidUntil:sub.paidUntil, daysLeft:0 };
  }
  const myBilling = () => billingState(cache.pharmacy);

  const read = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(e){ return def; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = (p='') => p + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  const emit = () => changeCb();
  const isCloud = () => mode === 'cloud';

  /* ---------- Settings ---------- */
  const defaultSettings = {
    pharmacyName:'PharmaCare Pharmacy', currency:'$', currencyPos:'before',
    taxRate:5, lowStockThreshold:20, expiryWarningDays:90,
    address:'Mogadishu, Somalia', phone:'+252 61 000 0000', email:'info@pharmacare.so',
    footerNote:'Thank you for your purchase! Get well soon.',
    invoicePrefix:'INV',        // sequential invoice number prefix
    receiptWidth:'80',          // '58' | '80' (thermal, mm) | 'a5' (framed card)
    logo:''                     // data-URL of the pharmacy logo shown on receipts
  };
  const getSettings = () => ({ ...defaultSettings, ...(cache.settings || {}) });
  function saveSettings(s){
    cache.settings = { ...getSettings(), ...s };
    if (isCloud()) { Cloud.setSettings(cache.settings).catch(err=>console.warn(err)); }
    else { write(KEYS.settings, cache.settings); }
    emit();
  }

  /* ---------- Collection helpers (read from cache) ---------- */
  const all = (key) => cache[key] || [];
  const find = (key, id) => (cache[key] || []).find(x => x.id === id);

  function insert(key, obj){
    obj.id = obj.id || uid(key[0]);
    obj.createdAt = obj.createdAt || Date.now();
    if (isCloud()) { Cloud.set(key, obj.id, obj).catch(err=>UI.toast(err.message,'error')); }
    else { cache[key].unshift(obj); write(KEYS[key], cache[key]); emit(); }
    return obj;
  }
  function update(key, id, patch){
    if (isCloud()) { Cloud.update(key, id, patch).catch(err=>UI.toast(err.message,'error')); const c=find(key,id); return c?{...c,...patch}:null; }
    const a = cache[key]; const i = a.findIndex(x=>x.id===id);
    if (i>-1){ a[i] = { ...a[i], ...patch }; write(KEYS[key], a); emit(); return a[i]; }
  }
  function remove(key, id){
    if (isCloud()) { Cloud.remove(key, id).catch(err=>UI.toast(err.message,'error')); }
    else { cache[key] = cache[key].filter(x=>x.id!==id); write(KEYS[key], cache[key]); emit(); }
  }

  /* ---------- Formatting ---------- */
  const money = (n) => {
    const s = getSettings(); const num = Number(n||0);
    const f = num.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    return s.currencyPos === 'after' ? `${f} ${s.currency}` : `${s.currency}${f}`;
  };
  const num = (n) => Number(n||0).toLocaleString('en-US');
  const dateFmt = (d) => { if(!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); };
  const dateTimeFmt = (d) => { if(!d) return '—'; return new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); };
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  /* ---------- Status helpers ---------- */
  const stockStatus = (m) => {
    const s = getSettings();
    if (m.quantity <= 0) return { key:'out', label:'Out of stock', color:'red' };
    if (m.quantity <= (m.reorderLevel || s.lowStockThreshold)) return { key:'low', label:'Low stock', color:'amber' };
    return { key:'ok', label:'In stock', color:'green' };
  };
  const expiryStatus = (m) => {
    const s = getSettings(); const d = daysUntil(m.expiryDate);
    if (d < 0) return { key:'expired', label:'Expired', color:'red', days:d };
    if (d <= 30) return { key:'critical', label:`${d}d left`, color:'red', days:d };
    if (d <= s.expiryWarningDays) return { key:'soon', label:`${d}d left`, color:'amber', days:d };
    return { key:'ok', label:'Valid', color:'green', days:d };
  };

  /* ---------- Derived metrics ---------- */
  const inventoryValue = () => all('medicines').reduce((s,m)=> s + (m.quantity * m.costPrice), 0);
  const retailValue = () => all('medicines').reduce((s,m)=> s + (m.quantity * m.sellPrice), 0);
  const lowStockItems = () => all('medicines').filter(m => stockStatus(m).key !== 'ok');
  const expiringItems = () => all('medicines').filter(m => ['expired','critical','soon'].includes(expiryStatus(m).key));
  const salesBetween = (from, to) => all('sales').filter(s => s.date >= from && s.date <= to);
  const todaySales = () => { const st = new Date(); st.setHours(0,0,0,0); return salesBetween(st.getTime(), Date.now()); };
  const revenue = (sales) => sales.reduce((s,x)=> s + x.total, 0);
  const profitOfSale = (sale) => sale.items.reduce((p,it)=> p + ((it.price - (it.cost||0)) * it.qty), 0) - (sale.discount||0);

  /* ---------- Deyn (credit / debt) ---------- */
  const debtOf = (cid) => {
    const owed = all('sales').filter(s=> s.customerId===cid && s.paymentMethod==='Deyn').reduce((a,s)=>a+(s.total||0),0);
    const paid = all('payments').filter(p=> p.customerId===cid).reduce((a,p)=>a+(p.amount||0),0);
    return +(owed - paid).toFixed(2);
  };
  const debtors = () => all('customers').map(c=>({ ...c, balance: debtOf(c.id) })).filter(c=> c.balance > 0.001).sort((a,b)=> b.balance - a.balance);
  const totalReceivables = () => debtors().reduce((a,c)=> a + c.balance, 0);
  const customerLedger = (cid) => {
    const items = [];
    all('sales').filter(s=> s.customerId===cid && s.paymentMethod==='Deyn').forEach(s=> items.push({ type:'debt', amount:s.total, date:s.date, ref:s.invoiceNo }));
    all('payments').filter(p=> p.customerId===cid).forEach(p=> items.push({ type:'payment', amount:p.amount, date:p.date, note:p.note }));
    return items.sort((a,b)=> b.date - a.date);
  };
  const cashSalesBetween = (from, to) => salesBetween(from, to).filter(s=> s.paymentMethod==='Cash');

  /* ---------- Laboratory helpers ---------- */
  const labOrdersBetween = (from, to) => all('laborders').filter(o => o.date>=from && o.date<=to);
  const todayLabOrders = () => { const st=new Date(); st.setHours(0,0,0,0); return labOrdersBetween(st.getTime(), Date.now()); };
  const pendingLabOrders = () => all('laborders').filter(o => o.status !== 'completed');
  const labRevenueBetween = (from, to) => labOrdersBetween(from, to).reduce((a,o)=> a + Number(o.total||0), 0);
  // Compare a numeric result against a reference range string ("70–110", "< 200", "M 13–17 / F 12–15").
  // Returns 'high' | 'low' | 'normal' | '' (unknown/non-numeric).
  function labFlag(result, refRange){
    const v = parseFloat(String(result||'').replace(/[^0-9.\-]/g,''));
    if (isNaN(v) || !refRange) return '';
    const r = String(refRange);
    // take the first numeric range we can find (ignores M/F prefixes — first applies)
    let m = r.match(/(-?\d+(?:\.\d+)?)\s*[–\-to]+\s*(-?\d+(?:\.\d+)?)/);
    if (m){ const lo=parseFloat(m[1]), hi=parseFloat(m[2]); if(v<lo) return 'low'; if(v>hi) return 'high'; return 'normal'; }
    m = r.match(/[<≤]\s*(-?\d+(?:\.\d+)?)/);
    if (m){ return v > parseFloat(m[1]) ? 'high' : 'normal'; }
    m = r.match(/[>≥]\s*(-?\d+(?:\.\d+)?)/);
    if (m){ return v < parseFloat(m[1]) ? 'low' : 'normal'; }
    return '';
  }

  /* ---------- Auth (mode-aware) ---------- */
  const getUsers = () => all('users');
  const session = () => current;
  function setSession(p){ current = p; if(!isCloud()){ if(p) write(KEYS.session, p); else localStorage.removeItem(KEYS.session); } }
  function login(username, password){ // LOCAL only
    const u = getUsers().find(x => (x.username||'').toLowerCase() === username.toLowerCase() && x.password === password);
    if (u){ setSession({ id:u.id, name:u.name, role:u.role, username:u.username, isSuperAdmin: !!u.isSuperAdmin }); return u; }
    return null;
  }
  function logout(){ current = null; if(!isCloud()) localStorage.removeItem(KEYS.session); }

  /* ---------- Pharmacy status (current tenant) ---------- */
  const getMyPharmacy = () => cache.pharmacy;
  const pharmacyStatus = () => (cache.pharmacy && cache.pharmacy.status) || 'active'; // missing → grandfathered active
  const pharmacyPlan = () => (cache.pharmacy && cache.pharmacy.plan) || 'free';

  /* ---------- Platform (super-admin), mode-aware ---------- */
  function pharmacyDerivedStats(p){
    // cloud pharmacy docs may carry a stats object; otherwise fall back to any cached counts.
    return p.stats || { products: p.products||0, sales: p.sales||0, revenue: p.revenue||0 };
  }
  function pushAudit(action, target, meta){
    const s = session()||{};
    const entry = { action, target: target||'', by: s.name||s.email||s.username||'admin', byEmail: s.email||s.username||'', meta: meta||null };
    if (isCloud()) Cloud.logAudit({ ...entry, at: Date.now() });
    else { cache.platform.audit = [{ id:uid('a'), ...entry, at:Date.now() }, ...(cache.platform.audit||[])].slice(0,100); emit(); }
  }
  const platform = {
    pharmacies: () => cache.platform.pharmacies,
    users: () => cache.platform.users,
    usersOf: (pid) => cache.platform.users.filter(u => u.pharmacyId === pid),
    audit: () => cache.platform.audit || [],
    errors: () => cache.platform.errors || [],
    config: () => getConfig(),
    stats(){
      const ph = cache.platform.pharmacies;
      return {
        total: ph.length,
        active: ph.filter(p=>(p.status||'active')==='active').length,
        pending: ph.filter(p=>p.status==='pending').length,
        suspended: ph.filter(p=>p.status==='suspended').length,
        pro: ph.filter(p=>p.plan==='pro').length,
        users: cache.platform.users.length,
        errors: (cache.platform.errors||[]).length,
        overdue: ph.filter(p=>billingState(p).state==='locked').length,
        graceCount: ph.filter(p=>billingState(p).state==='grace').length,
        mrr: ph.reduce((s,p)=> s + (p.subscription && billingState(p).state!=='locked' ? (p.subscription.amount||0) : 0), 0),
        revenue: ph.reduce((s,p)=> s + pharmacyDerivedStats(p).revenue, 0),
        products: ph.reduce((s,p)=> s + pharmacyDerivedStats(p).products, 0),
      };
    },
    billingOf: (p) => billingState(p),
    createPharmacy(data){
      const d0=new Date(); d0.setMonth(d0.getMonth()+1);
      const sub = { paidUntil:d0.getTime(), lastPaymentAt:null, amount:+(data.amount||getConfig().billing.defaultMonthlyFee)||0, graceDays:3 };
      if (isCloud()){
        return Cloud.createPharmacy(data, buildStarterSeed(data.pharmacyName))
          .then((pid)=>{ pushAudit('pharmacy.create', data.pharmacyName); return Cloud.updatePharmacy(pid, { subscription: sub }); });
      }
      const pid = uid('ph');
      cache.platform.pharmacies.unshift({ id:pid, name:data.pharmacyName, ownerName:data.ownerName, ownerEmail:data.ownerEmail,
        city:data.city||'', status:'active', plan:data.plan||'free', subscription:sub, stats:{products:0,sales:0,revenue:0}, createdAt:Date.now() });
      cache.platform.users.unshift({ id:'owner_'+pid, name:data.ownerName, email:data.ownerEmail, role:'Administrator', pharmacyId:pid });
      pushAudit('pharmacy.create', data.pharmacyName); emit();
      return Promise.resolve(pid);
    },
    recordSubscriptionPayment(pid, amount){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      const cur = (p0 && p0.subscription && p0.subscription.paidUntil) || 0;
      const sub = { paidUntil: addMonth(Math.max(Date.now(), cur)), lastPaymentAt: Date.now(),
                    amount: +amount || (p0&&p0.subscription&&p0.subscription.amount) || getConfig().billing.defaultMonthlyFee, graceDays:3 };
      pushAudit('subscription.payment', (p0&&p0.name)||pid, money(amount));
      if (isCloud()) return Cloud.updatePharmacy(pid, { subscription: sub }).catch(e=>UI.toast(e.message,'error'));
      if(p0){ p0.subscription = sub; emit(); }
    },
    setStatus(pid, status){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      // grant the first month free on first activation (so they start active)
      let grant = null;
      if (status==='active' && p0 && (!p0.subscription || !p0.subscription.paidUntil)){
        grant = { paidUntil: addMonth(Date.now()), lastPaymentAt:null, amount: getConfig().billing.defaultMonthlyFee, graceDays:3 };
      }
      pushAudit('pharmacy.'+status, (p0&&p0.name)||pid);
      if (isCloud()) return Cloud.setPharmacyStatus(pid, status).then(()=> grant ? Cloud.updatePharmacy(pid,{subscription:grant}) : null).catch(e=>UI.toast(e.message,'error'));
      if(p0){ p0.status=status; if(grant) p0.subscription=grant; emit(); }
    },
    setPlan(pid, plan){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      pushAudit('plan.'+plan, (p0&&p0.name)||pid);
      if (isCloud()) return Cloud.setPharmacyPlan(pid, plan).catch(e=>UI.toast(e.message,'error'));
      if(p0){ p0.plan=plan; emit(); }
    },
    updatePharmacy(pid, patch){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      pushAudit('pharmacy.edit', (p0&&p0.name)||pid, patch);
      if (isCloud()) return Cloud.updatePharmacy(pid, patch).catch(e=>UI.toast(e.message,'error'));
      if(p0){ Object.assign(p0, patch); emit(); }
    },
    setFeatureOverride(pid, key, val){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      if (isCloud()) return Cloud.updatePharmacy(pid, { ['featureOverrides.'+key]: val }).catch(e=>UI.toast(e.message,'error'));
      if(p0){ p0.featureOverrides = { ...(p0.featureOverrides||{}), [key]:val }; emit(); }
    },
    // Send a direct message to ONE pharmacy — stored on its doc; the tenant shows it professionally.
    sendMessage(pid, msg){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      const dm = { id: uid('msg'), title:(msg.title||'').trim(), body:(msg.body||'').trim(),
                   type: msg.type||'info', from:(msg.from||'PharmaCare Team').trim(), at: Date.now() };
      pushAudit('pharmacy.message', (p0&&p0.name)||pid, dm.from);
      if (isCloud()) return Cloud.updatePharmacy(pid, { directMessage: dm }).then(()=>dm).catch(e=>UI.toast(e.message,'error'));
      if(p0){ p0.directMessage = dm; emit(); }
      return dm;
    },
    saveConfig(patch){
      pushAudit('config.update', 'platform', Object.keys(patch).join(','));
      if (isCloud()) return Cloud.saveConfig(patch).catch(e=>UI.toast(e.message,'error'));
      cache.config = { ...cache.config, ...patch,
        announcement: patch.announcement ? { ...(cache.config.announcement||{}), ...patch.announcement } : cache.config.announcement,
        features: patch.features ? { ...(cache.config.features||{}), ...patch.features } : cache.config.features };
      emit();
    },
    resetPassword(email){ if (isCloud()) return Cloud.resetUserPassword(email); return Promise.resolve(); },
    clearError(id){
      if (isCloud()) return Cloud.clearError(id).catch(e=>UI.toast(e.message,'error'));
      cache.platform.errors = (cache.platform.errors||[]).filter(x=>x.id!==id); emit();
    },
    remove(pid){
      const p0 = cache.platform.pharmacies.find(x=>x.id===pid);
      pushAudit('pharmacy.delete', (p0&&p0.name)||pid);
      if (isCloud()) return Cloud.deletePharmacyFull(pid).catch(e=>UI.toast(e.message,'error'));
      cache.platform.pharmacies = cache.platform.pharmacies.filter(x=>x.id!==pid);
      cache.platform.users = cache.platform.users.filter(u=>u.pharmacyId!==pid); emit();
    }
  };
  function applyPlatformData(name, data){
    if (name === 'pharmacies') cache.platform.pharmacies = data || [];
    else if (name === 'allUsers') cache.platform.users = data || [];
    else if (name === 'audit') cache.platform.audit = data || [];
    else if (name === 'errors') cache.platform.errors = data || [];
    else if (name === '_config') cache.config = data || {};
    emit();
  }

  /* ---------- Feature flags & plan limits (pharmacy side) ---------- */
  const PLAN_RANK = { free:0, pro:1 };
  function featureEnabled(key){
    const cfg = getConfig(); const f = cfg.features[key];
    if (!f) return true; // unknown feature defaults on
    const ov = cache.pharmacy && cache.pharmacy.featureOverrides && cache.pharmacy.featureOverrides[key];
    if (ov === true) return true;   // super-admin granted to this pharmacy
    if (ov === false) return false; // super-admin revoked from this pharmacy
    if (f.enabled === false) return false; // globally disabled
    return (PLAN_RANK[pharmacyPlan()] || 0) >= (PLAN_RANK[f.minPlan || 'free'] || 0);
  }
  const planLimits = () => { const cfg = getConfig(); return cfg.plans[pharmacyPlan()] || cfg.plans.free; };
  const announcement = () => { const a = getConfig().announcement; return a && a.active && a.message ? a : null; };
  function reportError(message, stack){
    if (!isCloud() || !Cloud.reportError) return;
    const s = session()||{};
    Cloud.reportError({ message: String(message||'').slice(0,400), stack: String(stack||'').slice(0,1200),
      pharmacyId: s.pharmacyId||null, uid: s.uid||s.id||null, email: s.email||'', url: location.hash });
  }

  /* ---------- Support mode (super-admin "open-as" a pharmacy, read-only) ---------- */
  let support = null;
  const inSupport = () => support;
  function enterSupport(pid, name, data){
    support = { pid, name };
    COLLS.forEach(k => cache[k] = (data && data[k]) || []);
    cache.settings = (data && data.settings) || {};
    cache.pharmacy = cache.platform.pharmacies.find(p=>p.id===pid) || { id:pid, name, status:'active', plan:'pro' };
    emit();
  }
  function exitSupport(){ support = null; COLLS.forEach(k=>cache[k]=[]); cache.settings={}; cache.pharmacy=null; emit(); }
  async function fetchPharmacy(pid){ return isCloud() ? Cloud.fetchPharmacyData(pid) : null; }

  /* ---------- Data management ---------- */
  const collectAll = () => { const out={}; COLLS.forEach(k=> out[k]=all(k)); out.settings=getSettings(); return out; };
  const exportData = () => JSON.stringify({ ...collectAll(), _meta:{ app:'PharmaCare', version:2, mode, exportedAt:new Date().toISOString() } }, null, 2);
  async function importData(json){
    const data = JSON.parse(json);
    if (isCloud()) { await Cloud.bulkLoad(data); return true; }
    COLLS.forEach(k => { if(data[k]){ cache[k]=data[k]; write(KEYS[k], data[k]); } });
    if (data.settings){ cache.settings=data.settings; write(KEYS.settings, data.settings); }
    emit(); return true;
  }
  async function resetAll(){
    if (isCloud()) { await Cloud.wipePharmacy(); return; }
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    COLLS.forEach(k=> cache[k]=[]); cache.settings={};
  }
  const storageUsage = () => {
    const bytes = JSON.stringify(cache).length;
    return { bytes, kb:(bytes/1024).toFixed(1), pct: Math.min(100, (bytes/(5*1024*1024))*100), records: COLLS.reduce((s,k)=>s+all(k).length,0) };
  };

  /* ============================================================
     Demo / seed data builder (shared by local seed + cloud register)
     ============================================================ */
  function buildSeed(){
    const today = new Date();
    const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
    const addDaysTs = (n) => { const d=new Date(today); d.setDate(d.getDate()+n); return d.getTime(); };

    const users = [
      { id:'u_super', username:'superadmin', password:'super', name:'Platform Admin', role:'Super Admin', isSuperAdmin:true, createdAt:Date.now() },
      { id:'u_admin', username:'admin', password:'admin', name:'Admin User', role:'Administrator', createdAt:Date.now() },
      { id:'u_pharm', username:'pharmacist', password:'1234', name:'Amina Yusuf', role:'Pharmacist', createdAt:Date.now() },
      { id:'u_cash', username:'cashier', password:'1234', name:'Omar Hassan', role:'Cashier', createdAt:Date.now() },
    ];
    const suppliers = [
      { id:'sp1', name:'MediSupply Co.', contact:'Khalid Ahmed', phone:'+252 61 234 5678', email:'sales@medisupply.so', address:'Bakara Market, Mogadishu', createdAt:Date.now() },
      { id:'sp2', name:'PharmaWorld Distributors', contact:'Fatima Ali', phone:'+252 61 876 5432', email:'orders@pharmaworld.com', address:'Hargeisa', createdAt:Date.now() },
      { id:'sp3', name:'Global Health Imports', contact:'Yusuf Mohamed', phone:'+252 90 111 2233', email:'info@globalhealth.so', address:'Hodan District, Mogadishu', createdAt:Date.now() },
    ];
    const customers = [
      { id:'c1', name:'Hassan Abdi', phone:'+252 61 555 0101', email:'hassan@email.com', address:'Wadajir', createdAt:Date.now() },
      { id:'c2', name:'Maryan Nur', phone:'+252 61 555 0202', email:'maryan@email.com', address:'Hodan', createdAt:Date.now() },
      { id:'c3', name:'Ibrahim Sheikh', phone:'+252 61 555 0303', email:'', address:'Yaqshid', createdAt:Date.now() },
      { id:'c4', name:'Walk-in Customer', phone:'', email:'', address:'', createdAt:Date.now() },
    ];
    const M = (name, generic, cat, qty, cost, sell, expDays, supplier, reorder=20) => ({
      id: uid('m'), name, genericName:generic, category:cat, barcode: Math.floor(1e12+Math.random()*9e12).toString(),
      batchNo:'BTH-'+Math.floor(1000+Math.random()*9000), quantity:qty, unit:'pcs', costPrice:cost, sellPrice:sell,
      expiryDate:addDays(expDays), supplierId:supplier, reorderLevel:reorder, location:'Shelf '+String.fromCharCode(65+Math.floor(Math.random()*6))+'-'+Math.floor(1+Math.random()*20), createdAt:Date.now()
    });
    const medicines = [
      M('Paracetamol 500mg','Acetaminophen','Analgesics',420,0.05,0.25,540,'sp1'),
      M('Amoxicillin 500mg','Amoxicillin','Antibiotics',180,0.20,0.75,300,'sp1'),
      M('Ibuprofen 400mg','Ibuprofen','Analgesics',260,0.08,0.40,420,'sp2'),
      M('Omeprazole 20mg','Omeprazole','Antacids',140,0.15,0.60,200,'sp2'),
      M('Cetirizine 10mg','Cetirizine','Antihistamines',95,0.06,0.35,160,'sp3'),
      M('Metformin 500mg','Metformin','Diabetes',210,0.10,0.45,380,'sp1'),
      M('Amlodipine 5mg','Amlodipine','Cardiovascular',12,0.12,0.50,250,'sp2',20),
      M('Vitamin C 1000mg','Ascorbic Acid','Vitamins',330,0.07,0.30,600,'sp3'),
      M('Azithromycin 250mg','Azithromycin','Antibiotics',60,0.45,1.50,90,'sp1'),
      M('Salbutamol Inhaler','Salbutamol','Respiratory',45,2.50,6.00,140,'sp2'),
      M('Loratadine 10mg','Loratadine','Antihistamines',8,0.09,0.40,25,'sp3',15),
      M('Aspirin 75mg','Acetylsalicylic Acid','Cardiovascular',280,0.04,0.20,500,'sp1'),
      M('Ciprofloxacin 500mg','Ciprofloxacin','Antibiotics',110,0.30,1.10,210,'sp2'),
      M('Vitamin D3 1000IU','Cholecalciferol','Vitamins',150,0.10,0.50,450,'sp3'),
      M('Ranitidine 150mg','Ranitidine','Antacids',0,0.11,0.45,-10,'sp1',20),
      M('Diclofenac Gel','Diclofenac','Dermatology',70,1.20,3.50,180,'sp2'),
      M('Insulin Glargine','Insulin','Diabetes',25,8.00,18.00,75,'sp3',10),
      M('Cough Syrup 100ml','Dextromethorphan','Respiratory',88,0.90,2.75,15,'sp1'),
      M('Multivitamin Tabs','Multivitamin','Supplements',200,0.12,0.55,720,'sp3'),
      M('Hydrocortisone Cream','Hydrocortisone','Dermatology',55,0.80,2.20,300,'sp2'),
    ];
    const sales = []; const cashiers=['Admin User','Amina Yusuf','Omar Hassan']; const pays=['Cash','Card','Mobile Money']; let inv=1001;
    for (let d=29; d>=0; d--){ const count=Math.floor(Math.random()*3);
      for (let s=0;s<=count;s++){ const when=new Date(today); when.setDate(when.getDate()-d); when.setHours(9+Math.floor(Math.random()*9), Math.floor(Math.random()*60));
        const nItems=1+Math.floor(Math.random()*3); const items=[];
        for(let k=0;k<nItems;k++){ const med=medicines[Math.floor(Math.random()*medicines.length)]; const qty=1+Math.floor(Math.random()*4);
          items.push({ medicineId:med.id, name:med.name, qty, price:med.sellPrice, cost:med.costPrice, total:+(qty*med.sellPrice).toFixed(2) }); }
        const subtotal=+items.reduce((a,b)=>a+b.total,0).toFixed(2); const discount=Math.random()<0.25?+(subtotal*0.05).toFixed(2):0;
        const tax=+((subtotal-discount)*0.05).toFixed(2); const total=+(subtotal-discount+tax).toFixed(2);
        sales.push({ id:uid('s'), invoiceNo:'INV-'+(inv++), items, subtotal, discount, tax, total,
          customerId:customers[Math.floor(Math.random()*customers.length)].id, paymentMethod:pays[Math.floor(Math.random()*pays.length)],
          cashier:cashiers[Math.floor(Math.random()*cashiers.length)], date:when.getTime() }); } }
    sales.sort((a,b)=>b.date-a.date);
    const purchases = [
      { id:uid('p'), refNo:'PO-2001', supplierId:'sp1', items:[{name:'Paracetamol 500mg',qty:500,cost:0.05},{name:'Amoxicillin 500mg',qty:200,cost:0.20}], total:65, date:addDaysTs(-12), note:'Monthly restock', createdAt:Date.now() },
      { id:uid('p'), refNo:'PO-2002', supplierId:'sp2', items:[{name:'Ibuprofen 400mg',qty:300,cost:0.08}], total:24, date:addDaysTs(-6), note:'', createdAt:Date.now() },
    ];
    // Lab test catalog (subset of common tests, priced) + a few demo orders
    const LT = (name, code, cat, sample, ref, unit, price) => ({ id:uid('lt'), name, code, category:cat, sampleType:sample, refRange:ref, unit, price, createdAt:Date.now() });
    const labtests = [
      LT('Complete Blood Count (CBC)','CBC','Hematology','Blood','','',5),
      LT('Hemoglobin (Hb)','HB','Hematology','Blood','M 13–17 / F 12–15','g/dL',3),
      LT('Malaria (BF / RDT)','MAL','Parasitology','Blood','Negative','',3),
      LT('Fasting Blood Sugar (FBS)','FBS','Biochemistry','Blood','70–110','mg/dL',3),
      LT('Random Blood Sugar (RBS)','RBS','Biochemistry','Blood','70–140','mg/dL',2),
      LT('Widal Test','WIDAL','Serology','Blood','Negative','',4),
      LT('Urinalysis (Routine)','URIN','Urinalysis','Urine','','',3),
      LT('Pregnancy Test (Urine hCG)','UPT','Urinalysis','Urine','Negative','',2),
      LT('Hepatitis B (HBsAg)','HBSAG','Serology','Blood','Negative','',5),
      LT('HIV Test','HIV','Serology','Blood','Negative','',4),
      LT('Stool Microscopy (O/P)','STOOL','Parasitology','Stool','No ova/parasites','',3),
      LT('Creatinine','CREA','Biochemistry','Blood','0.6–1.3','mg/dL',4),
      LT('Liver Function Test (LFT)','LFT','Biochemistry','Blood','','',8),
      LT('Thyroid (TSH)','TSH','Hormones','Blood','0.4–4.0','mIU/L',7),
      LT('Lipid Profile','LIPID','Biochemistry','Blood','','',8),
    ];
    const bf=(n)=>labtests.find(t=>t.code===n);
    const ord=(no,cid,pname,doctor,dayAgo,status,picks)=>{
      const tests = picks.map(([code,result])=>{ const t=bf(code); return { testId:t.id, name:t.name, code:t.code, category:t.category, unit:t.unit, refRange:t.refRange, price:t.price, result: status==='completed'?result:'', flag: status==='completed'?labFlag(result,t.refRange):'' }; });
      const total=+tests.reduce((a,b)=>a+Number(b.price||0),0).toFixed(2);
      return { id:uid('lo'), orderNo:'LAB-'+no, customerId:cid, patientName:pname, doctor, date:addDaysTs(-dayAgo), status, tests, total, paymentMethod:'Cash', notes:'', completedAt: status==='completed'?addDaysTs(-dayAgo):null, createdAt:Date.now() };
    };
    const laborders = [
      ord(1001,'c1','Hassan Abdi','Dr. Warsame',2,'completed',[['MAL','Negative'],['FBS','98'],['CBC','Normal']]),
      ord(1002,'c2','Maryan Nur','Dr. Sahra',1,'completed',[['UPT','Positive'],['HB','11.2']]),
      ord(1003,'c3','Ibrahim Sheikh','Dr. Warsame',0,'pending',[['WIDAL',''],['RBS','']]),
      ord(1004,'','Aamina Cali','Dr. Cabdi',0,'pending',[['HBSAG',''],['HIV',''],['LFT','']]),
    ];
    return { users, suppliers, customers, medicines, sales, purchases, labtests, laborders, settings:{ ...defaultSettings } };
  }

  /* Subset used to seed a brand-new CLOUD pharmacy (inventory only, clean history). */
  // A brand-new pharmacy starts CLEAN — no demo inventory, suppliers, or lab tests.
  // The only seeded record is a "Walk-in Customer" so the POS works out of the box;
  // owners add their own medicines/tests (quickly, via the built-in catalogs).
  function buildStarterSeed(pharmacyName){
    return {
      customers: [{ id:'walkin', name:'Walk-in Customer', phone:'', email:'', address:'', createdAt:Date.now() }],
      settings: { ...defaultSettings, pharmacyName: pharmacyName||defaultSettings.pharmacyName }
    };
  }

  /* LOCAL seed → localStorage + cache */
  function seed(force){
    if (read(KEYS.seeded, false) && !force) { return; }
    const s = buildSeed();
    write(KEYS.users, s.users); write(KEYS.suppliers, s.suppliers); write(KEYS.customers, s.customers);
    write(KEYS.medicines, s.medicines); write(KEYS.sales, s.sales); write(KEYS.purchases, s.purchases);
    write(KEYS.labtests, s.labtests); write(KEYS.laborders, s.laborders);
    write(KEYS.settings, s.settings); write(KEYS.seeded, true);
  }

  /* ---------- Demo platform data (LOCAL super-admin console) ---------- */
  function buildPlatformDemo(){
    const day = 86400000, now = Date.now();
    const P = (id,name,owner,email,city,status,plan,products,sales,revenue,ageDays,paidInDays) => ({
      id, name, ownerEmail:email, ownerName:owner, city, status, plan,
      subscription: paidInDays==null ? null : { paidUntil: now + paidInDays*day, lastPaymentAt: now-(30-Math.max(paidInDays,0))*day, amount: plan==='pro'?20:10, graceDays:3 },
      stats:{ products, sales, revenue }, createdAt: now - ageDays*day, lastActive: now - Math.floor(Math.random()*5)*day
    });
    return [
      P('ph_1','Habeeg Pharmacy','Abdilaahi Mohamed','halbeeg@gmail.com','Mogadishu','active','pro',128,342,8420.5,120,18),   // active
      P('ph_2','Caafimaad Pharmacy','Amina Yusuf','amina@caafimaad.so','Hargeisa','active','free',76,180,3110.0,64,2),       // active (renews soon)
      P('ph_3','Shifo Drug Store','Yusuf Ali','yusuf@shifo.so','Kismayo','active','free',54,97,1540.75,38,-1),               // grace (expired 1d ago, within 3d)
      P('ph_4','NurMed Pharmacy','Maryan Nur','maryan@nurmed.so','Bosaso','pending','free',0,0,0,1,null),
      P('ph_5','Daryeel Pharmacy','Omar Hassan','omar@daryeel.so','Galkacyo','pending','free',0,0,0,0,null),
      P('ph_6','Wellcare Pharmacy','Khalid Ahmed','khalid@wellcare.so','Baidoa','active','pro',201,510,15230.0,210,-6),       // locked (expired 6d ago, past grace)
    ];
  }
  function platformDemoUsers(phs){
    const out=[]; phs.forEach(p=>{ out.push({ id:'owner_'+p.id, name:p.ownerName, email:p.ownerEmail, role:'Administrator', pharmacyId:p.id });
      if(p.status==='active'){ out.push({ id:'staff_'+p.id, name:'Staff Member', email:'staff@'+p.id+'.so', role:'Cashier', pharmacyId:p.id }); } });
    return out;
  }

  /* ---------- Mode initialisers ---------- */
  function initLocal(){
    mode='local'; seed();
    COLLS.forEach(k => cache[k] = read(KEYS[k], []));
    cache.settings = read(KEYS.settings, {});
    cache.pharmacy = { id:'local', name:(read(KEYS.settings,{}).pharmacyName)||defaultSettings.pharmacyName, status:'active', plan:'pro',
      subscription:{ paidUntil: Date.now()+18*86400000, lastPaymentAt: Date.now()-12*86400000, amount:20, graceDays:3 } };
    const demoPh = buildPlatformDemo();
    const now=Date.now();
    cache.config = {};
    cache.platform = { pharmacies: demoPh, users: platformDemoUsers(demoPh),
      audit: [
        { id:'au1', action:'pharmacy.active', target:'NurMed Pharmacy', by:'Platform Admin', at: now-3600e3 },
        { id:'au2', action:'plan.pro', target:'Habeeg Pharmacy', by:'Platform Admin', at: now-2*86400e3 },
        { id:'au3', action:'pharmacy.suspended', target:'Wellcare Pharmacy', by:'Platform Admin', at: now-5*86400e3 },
      ],
      errors: [
        { id:'er1', message:"Cannot read properties of undefined (reading 'qty')", pharmacyId:'ph_2', email:'amina@caafimaad.so', url:'#/pos', at: now-7200e3 },
        { id:'er2', message:'Network request failed (offline write retried)', pharmacyId:'ph_3', email:'yusuf@shifo.so', url:'#/inventory', at: now-86400e3 },
      ] };
    current = read(KEYS.session, null);
  }
  function reloadLocalCache(){ COLLS.forEach(k => cache[k] = read(KEYS[k], [])); cache.settings = read(KEYS.settings, {}); emit(); }
  function initCloud(){ mode='cloud'; current=null; COLLS.forEach(k=>cache[k]=[]); cache.settings={}; cache.pharmacy=null; cache.config={}; cache.platform={pharmacies:[],users:[],audit:[],errors:[]}; }
  // Firestore returns docs in document-ID order (not chronological). Keep time-based
  // collections sorted newest-first so Sales History, ledgers, etc. read in real order.
  const TIME_SORTED = { sales:'date', payments:'date', cashcloses:'date', laborders:'date', purchases:'date', stockadjustments:'date' };
  function applyCloudData(name, payload){
    if (name === 'settings') cache.settings = payload || {};
    else if (name === '_pharmacy') cache.pharmacy = payload;
    else if (name === '_config') cache.config = payload || {};
    else {
      const arr = payload || [];
      const key = TIME_SORTED[name];
      if (key) arr.sort((a,b)=> (b[key]||0) - (a[key]||0));
      cache[name] = arr;
    }
    emit();
  }
  const onChange = (cb) => { changeCb = cb; };

  return {
    KEYS, COLLS, CATEGORIES, CATALOG, LAB_CATEGORIES, LAB_SAMPLES, LAB_CATALOG, mode:()=>mode, isCloud, onChange,
    all, find, insert, update, remove, uid,
    getSettings, saveSettings, money, num, dateFmt, dateTimeFmt, daysUntil,
    stockStatus, expiryStatus, inventoryValue, retailValue, lowStockItems, expiringItems,
    salesBetween, todaySales, revenue, profitOfSale,
    debtOf, debtors, totalReceivables, customerLedger, cashSalesBetween,
    labOrdersBetween, todayLabOrders, pendingLabOrders, labRevenueBetween, labFlag,
    getUsers, login, logout, session, setSession,
    getMyPharmacy, pharmacyStatus, pharmacyPlan, platform, applyPlatformData,
    getConfig, featureEnabled, planLimits, announcement, reportError, billingState, myBilling,
    inSupport, enterSupport, exitSupport, fetchPharmacy,
    exportData, importData, resetAll, storageUsage,
    seed, buildSeed, buildStarterSeed, initLocal, initCloud, reloadLocalCache, applyCloudData
  };
})();
