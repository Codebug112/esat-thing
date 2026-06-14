export type PaperType = 'NSAA' | 'ENGAA' | 'TMUA'

export interface Paper {
  id: string
  type: PaperType
  year: number
  section: string
  questionCount: number
  name: string
  description: string
  answers: Record<number, string>
  parts?: Record<number, string>
  pdfUrl?: string
}

// ─── TMUA Paper 1 ────────────────────────────────────────────────────────────
const TMUA_2017_P1: Record<number, string> = {
  1:'C',2:'C',3:'A',4:'B',5:'C',6:'B',7:'B',8:'A',9:'F',10:'E',
  11:'A',12:'B',13:'C',14:'F',15:'B',16:'E',17:'D',18:'A',19:'D',20:'E',
}
const TMUA_2018_P1: Record<number, string> = {
  1:'D',2:'C',3:'E',4:'G',5:'D',6:'E',7:'A',8:'D',9:'B',10:'E',
  11:'C',12:'F',13:'C',14:'B',15:'E',16:'F',17:'A',18:'B',19:'D',20:'E',
}
const TMUA_2019_P1: Record<number, string> = {
  1:'A',2:'A',3:'E',4:'C',5:'E',6:'C',7:'F',8:'E',9:'D',10:'F',
  11:'H',12:'C',13:'B',14:'B',15:'A',16:'C',17:'C',18:'B',19:'C',20:'E',
}
const TMUA_2020_P1: Record<number, string> = {
  1:'C',2:'C',3:'B',4:'D',5:'A',6:'C',7:'A',8:'D',9:'C',10:'A',
  11:'E',12:'D',13:'F',14:'E',15:'C',16:'C',17:'A',18:'A',19:'E',20:'C',
}
const TMUA_2021_P1: Record<number, string> = {
  1:'F',2:'F',3:'G',4:'B',5:'F',6:'D',7:'G',8:'A',9:'C',10:'B',
  11:'A',12:'E',13:'C',14:'B',15:'C',16:'B',17:'A',18:'B',19:'B',20:'D',
}
const TMUA_2022_P1: Record<number, string> = {
  1:'C',2:'D',3:'F',4:'C',5:'H',6:'F',7:'E',8:'B',9:'E',10:'C',
  11:'A',12:'D',13:'A',14:'D',15:'H',16:'B',17:'D',18:'B',19:'F',20:'B',
}

// ─── ENGAA Section 1 ─────────────────────────────────────────────────────────
const ENGAA_2016_S1: Record<number, string> = {
  1:'G',2:'D',3:'B',4:'F',5:'C',6:'C',7:'E',8:'D',9:'C',10:'D',
  11:'B',12:'E',13:'F',14:'H',15:'E',16:'F',17:'B',18:'F',19:'C',20:'D',
  21:'A',22:'A',23:'D',24:'G',25:'D',26:'D',27:'E',28:'G',29:'C',30:'C',
  31:'C',32:'C',33:'C',34:'A',35:'A',36:'H',37:'D',38:'B',39:'G',40:'B',
  41:'D',42:'A',43:'G',44:'G',45:'E',46:'E',47:'C',48:'A',49:'B',50:'C',
  51:'A',52:'E',53:'C',54:'B',
}
const ENGAA_2017_S1: Record<number, string> = {
  1:'F',2:'B',3:'E',4:'G',5:'B',6:'D',7:'G',8:'D',9:'E',10:'B',
  11:'D',12:'F',13:'D',14:'A',15:'F',16:'A',17:'C',18:'E',19:'B',20:'C',
  21:'B',22:'C',23:'C',24:'C',25:'F',26:'D',27:'G',28:'E',29:'E',30:'B',
  31:'C',32:'A',33:'B',34:'C',35:'C',36:'E',37:'F',38:'D',39:'D',40:'F',
  41:'D',42:'A',43:'E',44:'A',45:'A',46:'B',47:'C',48:'H',49:'A',50:'B',
  51:'H',52:'B',53:'B',54:'A',
}
const ENGAA_2018_S1: Record<number, string> = {
  1:'E',2:'B',3:'B',4:'B',5:'H',6:'G',7:'D',8:'E',9:'E',10:'C',
  11:'C',12:'A',13:'E',14:'A',15:'D',16:'C',17:'C',18:'E',19:'E',20:'C',
  21:'C',22:'B',23:'C',24:'H',25:'G',26:'C',27:'B',28:'A',29:'A',30:'E',
  31:'D',32:'F',33:'C',34:'D',35:'D',36:'F',37:'E',38:'B',39:'B',40:'D',
  41:'C',42:'G',43:'C',44:'F',45:'D',46:'A',47:'D',48:'A',49:'E',50:'E',
  51:'A',52:'F',53:'C',54:'B',
}
const ENGAA_2019_S1: Record<number, string> = {
  1:'F',2:'F',3:'E',4:'A',5:'C',6:'A',7:'E',8:'A',9:'D',10:'F',
  11:'B',12:'C',13:'F',14:'C',15:'D',16:'E',17:'E',18:'B',19:'E',20:'B',
  21:'C',22:'C',23:'B',24:'E',25:'B',26:'C',27:'D',28:'C',29:'E',30:'C',
  31:'B',32:'D',33:'A',34:'F',35:'E',36:'D',37:'D',38:'A',39:'F',40:'B',
}
const ENGAA_2020_S1: Record<number, string> = {
  1:'D',2:'C',3:'A',4:'A',5:'B',6:'D',7:'F',8:'F',9:'A',10:'C',
  11:'B',12:'D',13:'E',14:'C',15:'F',16:'D',17:'D',18:'G',19:'B',20:'A',
  21:'B',22:'B',23:'E',24:'G',25:'C',26:'H',27:'A',28:'D',29:'D',30:'B',
  31:'E',32:'F',33:'A',34:'C',35:'E',36:'C',37:'D',38:'B',39:'C',40:'D',
}
const ENGAA_2021_S1: Record<number, string> = {
  1:'E',2:'E',3:'D',4:'F',5:'C',6:'C',7:'A',8:'D',9:'D',10:'E',
  11:'F',12:'H',13:'F',14:'B',15:'B',16:'C',17:'A',18:'D',19:'H',20:'E',
  21:'C',22:'G',23:'G',24:'B',25:'D',26:'D',27:'H',28:'D',29:'E',30:'B',
  31:'A',32:'C',33:'B',34:'D',35:'C',36:'G',37:'H',38:'D',39:'B',40:'E',
}
const ENGAA_2022_S1: Record<number, string> = {
  1:'E',2:'A',3:'D',4:'G',5:'D',6:'A',7:'C',8:'G',9:'B',10:'D',
  11:'G',12:'C',13:'G',14:'D',15:'E',16:'D',17:'E',18:'F',19:'D',20:'E',
  21:'A',22:'E',23:'A',24:'A',25:'B',26:'E',27:'A',28:'F',29:'B',30:'B',
  31:'A',32:'C',33:'D',34:'E',35:'D',36:'F',37:'C',38:'C',39:'F',40:'G',
}
const ENGAA_2023_S1: Record<number, string> = {
  1:'A',2:'F',3:'C',4:'F',5:'F',6:'B',7:'D',8:'B',9:'D',10:'E',
  11:'B',12:'A',13:'H',14:'C',15:'B',16:'D',17:'E',18:'B',19:'C',20:'A',
  21:'H',22:'D',23:'A',24:'D',25:'G',26:'C',27:'E',28:'E',29:'F',30:'B',
  31:'E',32:'B',33:'C',34:'G',35:'A',36:'E',37:'B',38:'A',39:'G',40:'A',
}

// ─── NSAA Section 1 ──────────────────────────────────────────────────────────
const NSAA_2016_S1: Record<number, string> = {
  1:'G',2:'B',3:'C',4:'E',5:'C',6:'B',7:'F',8:'E',9:'B',10:'C',
  11:'A',12:'D',13:'D',14:'E',15:'B',16:'A',17:'C',18:'F',19:'B',20:'D',
  21:'H',22:'F',23:'C',24:'D',25:'E',26:'D',27:'E',28:'H',29:'F',30:'F',
  31:'D',32:'A',33:'A',34:'G',35:'D',36:'G',37:'D',38:'D',39:'C',40:'C',
  41:'C',42:'D',43:'D',44:'E',45:'C',46:'A',47:'C',48:'F',49:'F',50:'A',
  51:'F',52:'D',53:'C',54:'C',55:'C',56:'F',57:'A',58:'C',59:'E',60:'B',
  61:'B',62:'B',63:'H',64:'E',65:'G',66:'E',67:'D',68:'B',69:'D',70:'C',
  71:'H',72:'E',73:'C',74:'C',75:'C',76:'A',77:'C',78:'H',79:'A',80:'B',
  81:'D',82:'B',83:'G',84:'G',85:'D',86:'E',87:'G',88:'A',89:'E',90:'C',
}
const NSAA_2017_S1: Record<number, string> = {
  1:'F',2:'E',3:'B',4:'G',5:'E',6:'C',7:'D',8:'B',9:'D',10:'F',
  11:'C',12:'B',13:'B',14:'D',15:'C',16:'F',17:'G',18:'E',19:'B',20:'G',
  21:'E',22:'E',23:'D',24:'D',25:'B',26:'F',27:'A',28:'A',29:'E',30:'C',
  31:'C',32:'C',33:'C',34:'D',35:'E',36:'E',37:'F',38:'B',39:'H',40:'A',
  41:'D',42:'C',43:'D',44:'D',45:'D',46:'E',47:'E',48:'D',49:'E',50:'B',
  51:'A',52:'D',53:'C',54:'D',55:'A',56:'B',57:'C',58:'E',59:'A',60:'D',
  61:'B',62:'D',63:'G',64:'B',65:'C',66:'C',67:'F',68:'H',69:'A',70:'H',
  71:'C',72:'F',73:'E',74:'B',75:'C',76:'C',77:'B',78:'D',79:'D',80:'F',
  81:'E',82:'A',83:'A',84:'A',85:'C',86:'B',87:'A',88:'H',89:'B',90:'B',
}
const NSAA_2018_S1: Record<number, string> = {
  1:'E',2:'B',3:'H',4:'D',5:'C',6:'E',7:'A',8:'C',9:'E',10:'D',
  11:'C',12:'F',13:'E',14:'A',15:'C',16:'C',17:'G',18:'B',19:'B',20:'B',
  21:'G',22:'E',23:'E',24:'C',25:'C',26:'A',27:'A',28:'C',29:'E',30:'C',
  31:'B',32:'E',33:'H',34:'C',35:'E',36:'A',37:'C',38:'C',39:'A',40:'D',
  41:'B',42:'E',43:'F',44:'A',45:'E',46:'C',47:'A',48:'D',49:'B',50:'A',
  51:'C',52:'C',53:'B',54:'E',55:'F',56:'D',57:'E',58:'E',59:'E',60:'E',
  61:'H',62:'G',63:'A',64:'B',65:'F',66:'E',67:'A',68:'C',69:'H',70:'G',
  71:'F',72:'B',73:'A',74:'E',75:'D',76:'F',77:'C',78:'D',79:'E',80:'F',
  81:'C',82:'D',83:'C',84:'F',85:'D',86:'A',87:'E',88:'A',89:'C',90:'B',
}
const NSAA_2019_S1: Record<number, string> = {
  1:'F',2:'H',3:'E',4:'C',5:'E',6:'D',7:'B',8:'F',9:'A',10:'D',
  11:'E',12:'G',13:'D',14:'G',15:'C',16:'C',17:'C',18:'E',19:'B',20:'E',
  21:'F',22:'A',23:'C',24:'D',25:'A',26:'A',27:'E',28:'F',29:'C',30:'C',
  31:'C',32:'E',33:'F',34:'D',35:'B',36:'B',37:'F',38:'C',39:'E',40:'G',
  41:'H',42:'F',43:'E',44:'B',45:'H',46:'D',47:'D',48:'A',49:'D',50:'B',
  51:'D',52:'E',53:'B',54:'E',55:'D',56:'E',57:'C',58:'C',59:'D',60:'G',
  61:'G',62:'D',63:'A',64:'C',65:'H',66:'B',67:'B',68:'E',69:'A',70:'H',
  71:'D',72:'H',73:'C',74:'C',75:'B',76:'E',77:'D',78:'C',79:'E',80:'C',
  81:'B',82:'C',83:'A',84:'D',85:'E',86:'F',87:'D',88:'D',89:'F',90:'B',
}
const NSAA_2020_S1: Record<number, string> = {
  1:'G',2:'D',3:'A',4:'A',5:'B',6:'C',7:'F',8:'B',9:'E',10:'A',
  11:'B',12:'F',13:'A',14:'E',15:'E',16:'F',17:'D',18:'B',19:'D',20:'C',
  21:'C',22:'B',23:'F',24:'A',25:'A',26:'D',27:'E',28:'D',29:'C',30:'F',
  31:'B',32:'C',33:'D',34:'E',35:'C',36:'H',37:'G',38:'D',39:'G',40:'A',
  41:'F',42:'E',43:'B',44:'F',45:'B',46:'E',47:'A',48:'F',49:'C',50:'D',
  51:'E',52:'D',53:'G',54:'D',55:'E',56:'C',57:'D',58:'G',59:'F',60:'F',
  61:'F',62:'H',63:'D',64:'G',65:'G',66:'F',67:'E',68:'F',69:'B',70:'F',
  71:'C',72:'F',73:'A',74:'H',75:'C',76:'A',77:'F',78:'C',79:'F',80:'C',
}
const NSAA_2021_S1: Record<number, string> = {
  1:'E',2:'B',3:'D',4:'A',5:'C',6:'E',7:'A',8:'F',9:'D',10:'E',
  11:'F',12:'D',13:'F',14:'E',15:'B',16:'G',17:'A',18:'F',19:'H',20:'F',
  21:'B',22:'E',23:'F',24:'A',25:'G',26:'F',27:'C',28:'D',29:'E',30:'H',
  31:'B',32:'G',33:'C',34:'E',35:'D',36:'B',37:'C',38:'D',39:'G',40:'E',
  41:'F',42:'C',43:'B',44:'E',45:'D',46:'E',47:'F',48:'D',49:'C',50:'E',
  51:'B',52:'C',53:'A',54:'E',55:'A',56:'B',57:'C',58:'F',59:'E',60:'A',
  61:'F',62:'B',63:'B',64:'D',65:'C',66:'H',67:'D',68:'G',69:'B',70:'A',
  71:'A',72:'D',73:'H',74:'C',75:'B',76:'E',77:'C',78:'A',79:'A',80:'D',
}
const NSAA_2022_S1: Record<number, string> = {
  1:'E',2:'D',3:'D',4:'E',5:'D',6:'D',7:'C',8:'B',9:'B',10:'B',
  11:'G',12:'C',13:'G',14:'C',15:'E',16:'B',17:'E',18:'A',19:'D',20:'C',
  21:'A',22:'C',23:'E',24:'G',25:'E',26:'B',27:'A',28:'G',29:'B',30:'D',
  31:'E',32:'C',33:'G',34:'C',35:'D',36:'D',37:'F',38:'E',39:'E',40:'A',
  41:'E',42:'B',43:'C',44:'G',45:'D',46:'A',47:'E',48:'F',49:'H',50:'G',
  51:'C',52:'A',53:'D',54:'E',55:'D',56:'C',57:'F',58:'A',59:'E',60:'B',
  61:'A',62:'B',63:'F',64:'B',65:'D',66:'E',67:'G',68:'G',69:'D',70:'F',
  71:'G',72:'B',73:'D',74:'F',75:'C',76:'F',77:'A',78:'G',79:'D',80:'C',
}
const NSAA_2023_S1: Record<number, string> = {
  1:'A',2:'E',3:'C',4:'A',5:'F',6:'D',7:'D',8:'E',9:'D',10:'B',
  11:'B',12:'C',13:'H',14:'D',15:'B',16:'B',17:'E',18:'C',19:'C',20:'E',
  21:'G',22:'F',23:'D',24:'F',25:'B',26:'B',27:'E',28:'B',29:'E',30:'E',
  31:'A',32:'A',33:'B',34:'C',35:'E',36:'D',37:'H',38:'B',39:'C',40:'A',
  41:'D',42:'E',43:'B',44:'A',45:'C',46:'E',47:'A',48:'B',49:'E',50:'F',
  51:'C',52:'G',53:'E',54:'D',55:'D',56:'E',57:'H',58:'C',59:'E',60:'C',
  61:'A',62:'B',63:'B',64:'F',65:'F',66:'D',67:'E',68:'F',69:'A',70:'E',
  71:'F',72:'A',73:'G',74:'D',75:'E',76:'B',77:'E',78:'G',79:'E',80:'D',
}

function nsaaParts(year: number): Record<number, string> {
  const parts: Record<number, string> = {}
  if (year >= 2021) {
    for (let i = 1; i <= 20; i++) parts[i] = 'Mathematics'
    for (let i = 21; i <= 40; i++) parts[i] = 'Physics'
    for (let i = 41; i <= 60; i++) parts[i] = 'Chemistry'
    for (let i = 61; i <= 80; i++) parts[i] = 'Biology'
  } else {
    for (let i = 1; i <= 18; i++) parts[i] = 'Mathematics'
    for (let i = 19; i <= 36; i++) parts[i] = 'Physics'
    for (let i = 37; i <= 54; i++) parts[i] = 'Chemistry'
    for (let i = 55; i <= 72; i++) parts[i] = 'Biology'
    for (let i = 73; i <= 90; i++) parts[i] = 'Advanced'
  }
  return parts
}

function engaaParts(year: number, count: number): Record<number, string> {
  const parts: Record<number, string> = {}
  const mathBoundary = year <= 2018 ? 27 : 20
  for (let i = 1; i <= count; i++) {
    parts[i] = i <= mathBoundary ? 'Mathematics' : 'Physics'
  }
  return parts
}

// PDF URLs — fill in the correct links for each paper
// (Cambridge Assessment Admissions Testing past papers)
const NSAA_PDF_URLS: Record<number, string> = {
  // e.g. 2023: 'https://www.admissionstesting.org/Images/...',
}
const ENGAA_PDF_URLS: Record<number, string> = {}
const TMUA_PDF_URLS: Record<number, string> = {}

export const PAPERS: Paper[] = [
  { id: 'nsaa-2016', type: 'NSAA', year: 2016, section: 'Section 1', questionCount: 90, name: 'NSAA 2016 — Section 1', description: 'Maths · Physics · Chemistry · Biology · Advanced (90 questions)', answers: NSAA_2016_S1, parts: nsaaParts(2016), pdfUrl: NSAA_PDF_URLS[2016] },
  { id: 'nsaa-2017', type: 'NSAA', year: 2017, section: 'Section 1', questionCount: 90, name: 'NSAA 2017 — Section 1', description: 'Maths · Physics · Chemistry · Biology · Advanced (90 questions)', answers: NSAA_2017_S1, parts: nsaaParts(2017), pdfUrl: NSAA_PDF_URLS[2017] },
  { id: 'nsaa-2018', type: 'NSAA', year: 2018, section: 'Section 1', questionCount: 90, name: 'NSAA 2018 — Section 1', description: 'Maths · Physics · Chemistry · Biology · Advanced (90 questions)', answers: NSAA_2018_S1, parts: nsaaParts(2018), pdfUrl: NSAA_PDF_URLS[2018] },
  { id: 'nsaa-2019', type: 'NSAA', year: 2019, section: 'Section 1', questionCount: 90, name: 'NSAA 2019 — Section 1', description: 'Maths · Physics · Chemistry · Biology · Advanced (90 questions)', answers: NSAA_2019_S1, parts: nsaaParts(2019), pdfUrl: NSAA_PDF_URLS[2019] },
  { id: 'nsaa-2020', type: 'NSAA', year: 2020, section: 'Section 1', questionCount: 80, name: 'NSAA 2020 — Section 1', description: 'Maths · Physics · Chemistry · Biology (80 questions)', answers: NSAA_2020_S1, parts: nsaaParts(2020), pdfUrl: NSAA_PDF_URLS[2020] },
  { id: 'nsaa-2021', type: 'NSAA', year: 2021, section: 'Section 1', questionCount: 80, name: 'NSAA 2021 — Section 1', description: 'Maths · Physics · Chemistry · Biology (80 questions)', answers: NSAA_2021_S1, parts: nsaaParts(2021), pdfUrl: NSAA_PDF_URLS[2021] },
  { id: 'nsaa-2022', type: 'NSAA', year: 2022, section: 'Section 1', questionCount: 80, name: 'NSAA 2022 — Section 1', description: 'Maths · Physics · Chemistry · Biology (80 questions)', answers: NSAA_2022_S1, parts: nsaaParts(2022), pdfUrl: NSAA_PDF_URLS[2022] },
  { id: 'nsaa-2023', type: 'NSAA', year: 2023, section: 'Section 1', questionCount: 80, name: 'NSAA 2023 — Section 1', description: 'Maths · Physics · Chemistry · Biology (80 questions)', answers: NSAA_2023_S1, parts: nsaaParts(2023), pdfUrl: NSAA_PDF_URLS[2023] },

  { id: 'engaa-2016', type: 'ENGAA', year: 2016, section: 'Section 1', questionCount: 54, name: 'ENGAA 2016 — Section 1', description: 'Maths & Physics (54 questions)', answers: ENGAA_2016_S1, parts: engaaParts(2016, 54), pdfUrl: ENGAA_PDF_URLS[2016] },
  { id: 'engaa-2017', type: 'ENGAA', year: 2017, section: 'Section 1', questionCount: 54, name: 'ENGAA 2017 — Section 1', description: 'Maths & Physics (54 questions)', answers: ENGAA_2017_S1, parts: engaaParts(2017, 54), pdfUrl: ENGAA_PDF_URLS[2017] },
  { id: 'engaa-2018', type: 'ENGAA', year: 2018, section: 'Section 1', questionCount: 54, name: 'ENGAA 2018 — Section 1', description: 'Maths & Physics (54 questions)', answers: ENGAA_2018_S1, parts: engaaParts(2018, 54), pdfUrl: ENGAA_PDF_URLS[2018] },
  { id: 'engaa-2019', type: 'ENGAA', year: 2019, section: 'Section 1', questionCount: 40, name: 'ENGAA 2019 — Section 1', description: 'Maths & Physics (40 questions)', answers: ENGAA_2019_S1, parts: engaaParts(2019, 40), pdfUrl: ENGAA_PDF_URLS[2019] },
  { id: 'engaa-2020', type: 'ENGAA', year: 2020, section: 'Section 1', questionCount: 40, name: 'ENGAA 2020 — Section 1', description: 'Maths & Physics (40 questions)', answers: ENGAA_2020_S1, parts: engaaParts(2020, 40), pdfUrl: ENGAA_PDF_URLS[2020] },
  { id: 'engaa-2021', type: 'ENGAA', year: 2021, section: 'Section 1', questionCount: 40, name: 'ENGAA 2021 — Section 1', description: 'Maths & Physics (40 questions)', answers: ENGAA_2021_S1, parts: engaaParts(2021, 40), pdfUrl: ENGAA_PDF_URLS[2021] },
  { id: 'engaa-2022', type: 'ENGAA', year: 2022, section: 'Section 1', questionCount: 40, name: 'ENGAA 2022 — Section 1', description: 'Maths & Physics (40 questions)', answers: ENGAA_2022_S1, parts: engaaParts(2022, 40), pdfUrl: ENGAA_PDF_URLS[2022] },
  { id: 'engaa-2023', type: 'ENGAA', year: 2023, section: 'Section 1', questionCount: 40, name: 'ENGAA 2023 — Section 1', description: 'Maths & Physics (40 questions)', answers: ENGAA_2023_S1, parts: engaaParts(2023, 40), pdfUrl: ENGAA_PDF_URLS[2023] },

  { id: 'tmua-2017-p1', type: 'TMUA', year: 2017, section: 'Paper 1', questionCount: 20, name: 'TMUA 2017 — Paper 1', description: 'Mathematics (20 questions) — mirrors ESAT Maths 2', answers: TMUA_2017_P1, pdfUrl: TMUA_PDF_URLS[2017] },
  { id: 'tmua-2018-p1', type: 'TMUA', year: 2018, section: 'Paper 1', questionCount: 20, name: 'TMUA 2018 — Paper 1', description: 'Mathematics (20 questions) — mirrors ESAT Maths 2', answers: TMUA_2018_P1, pdfUrl: TMUA_PDF_URLS[2018] },
  { id: 'tmua-2019-p1', type: 'TMUA', year: 2019, section: 'Paper 1', questionCount: 20, name: 'TMUA 2019 — Paper 1', description: 'Mathematics (20 questions) — mirrors ESAT Maths 2', answers: TMUA_2019_P1, pdfUrl: TMUA_PDF_URLS[2019] },
  { id: 'tmua-2020-p1', type: 'TMUA', year: 2020, section: 'Paper 1', questionCount: 20, name: 'TMUA 2020 — Paper 1', description: 'Mathematics (20 questions) — mirrors ESAT Maths 2', answers: TMUA_2020_P1, pdfUrl: TMUA_PDF_URLS[2020] },
  { id: 'tmua-2021-p1', type: 'TMUA', year: 2021, section: 'Paper 1', questionCount: 20, name: 'TMUA 2021 — Paper 1', description: 'Mathematics (20 questions) — mirrors ESAT Maths 2', answers: TMUA_2021_P1, pdfUrl: TMUA_PDF_URLS[2021] },
  { id: 'tmua-2022-p1', type: 'TMUA', year: 2022, section: 'Paper 1', questionCount: 20, name: 'TMUA 2022 — Paper 1', description: 'Mathematics (20 questions) — mirrors ESAT Maths 2', answers: TMUA_2022_P1, pdfUrl: TMUA_PDF_URLS[2022] },
]

export function getPaperById(id: string): Paper | undefined {
  return PAPERS.find(p => p.id === id)
}

export function getPaperAnswerOptions(paper: Paper): string[] {
  const used = new Set(Object.values(paper.answers))
  return ['A','B','C','D','E','F','G','H'].filter(o => used.has(o))
}

export function predictESATScore(sessions: { percentCorrect: number }[]): number | null {
  if (sessions.length === 0) return null
  const n = sessions.length
  let weightedSum = 0
  let totalWeight = 0
  sessions.forEach((s, i) => {
    const weight = i + 1
    weightedSum += s.percentCorrect * weight
    totalWeight += weight
  })
  const pct = weightedSum / totalWeight
  if (pct >= 95) return 9.0
  if (pct >= 90) return 8.5
  if (pct >= 85) return 8.0
  if (pct >= 80) return 7.5
  if (pct >= 75) return 7.0
  if (pct >= 70) return 6.5
  if (pct >= 65) return 6.0
  if (pct >= 60) return 5.5
  if (pct >= 55) return 5.0
  if (pct >= 50) return 4.5
  if (pct >= 45) return 4.0
  if (pct >= 40) return 3.5
  if (pct >= 35) return 3.0
  if (pct >= 25) return 2.0
  return 1.0
}

export const WRONG_REASONS = [
  { id: 'silly', label: 'Silly / careless mistake' },
  { id: 'time', label: 'Ran out of time' },
  { id: 'concept', label: "Didn't know the concept" },
  { id: 'misread', label: 'Misread the question' },
  { id: 'arithmetic', label: 'Arithmetic error' },
  { id: 'guess', label: 'Guessed' },
]
