const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const puppeteer = require('puppeteer')


// =======================
// DATABASE
// =======================

const dbPath = path.join(__dirname,'../data/students.db')

const db = new sqlite3.Database(dbPath)

db.run(`
CREATE TABLE IF NOT EXISTS students (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
class TEXT,
section TEXT,
roll TEXT,
house TEXT,
blood TEXT,
father TEXT,
mother TEXT,
contact TEXT,
address TEXT,
photo TEXT,
pdf TEXT,
date TEXT
)
`)


// =======================
// FORM PAGE
// =======================

exports.formPage = (req,res)=>{
const data = req.body || {}
res.render('form',{data})
}

// =======================
// EDIT FORM PAGE
// =======================

exports.editForm = (req,res)=>{
const data = req.body
res.render("form",{data})
}

// =======================
// PREVIEW PAGE
// =======================

exports.previewPage = (req,res)=>{

const data = req.body

// If new photo uploaded
if(req.file){
data.photo = req.file.filename
}
else{
data.photo = req.body.photo
}

res.render('preview',{data})

}


// =======================
// GENERATE ID
// =======================

exports.generateID = async (req,res)=>{

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const data = req.body
const photo = data.photo

// =======================
// Create Folder
// =======================

const folder = `idcards/Class_${data.class}/Section_${data.section}`
fs.mkdirSync(folder,{recursive:true})

const filePath = `${folder}/${data.name.replace(/ /g,'_')}.pdf`

// =======================
// GENERATE PDF FROM HTML
// =======================

//const browser = await puppeteer.launch()

// const browser = await puppeteer.launch({
//   headless: "new",
//   args: ["--no-sandbox", "--disable-setuid-sandbox"],
// });

const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});


const page = await browser.newPage()

await page.setContent(`
<!DOCTYPE html>
<html>
<head>

<style>
@media print {
  body{
     overflow:hidden;
  }
}

@page {
  size: 54mm 85mm;
  margin: 0;
}

html, body{
  margin:0;
  padding:0;
  width:54mm;
  height:85mm;
  overflow:hidden;
  display:flex;
  justify-content:center;
  align-items:center;
}

/* CENTER CONTAINER */
.wrapper, .page-wrapper{
  width:54mm;
  height:85mm;
  display:flex;
  justify-content:center;
  align-items:center;
  margin:0;
  padding:0;
  overflow:hidden;
}

/* FIXED CARD SIZE */
.id-card{
  width:100%;
  height:100%;
  box-sizing:border-box;
  margin:0;
  padding:1mm 0.8mm 1mm;
  background:white;
  border:1px solid #d1d5db;
  border-radius:8px;
  box-shadow:0 6px 10px rgba(0,0,0,0.12);
  overflow:hidden;
  display:flex;
  flex-direction:column;
  page-break-inside:avoid;
  break-inside:avoid;
}

.header{
padding:5px 6px;
border-bottom:1px solid #e5e7eb;
background:white;
}

.header-left{
display:flex;
align-items:center;
gap:14px;
}

.logo-icon{
width:36px;
height:36px;
background:#2563eb;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
color:white;
font-size:18px;
}

.header h1{
font-size:18px;
margin:0;
font-weight:600;
}

.header p{
font-size:13px;
margin:0;
color:#6b7280;
}

.page{
display:flex;
justify-content:center;
padding:0;
}

.form-card{
width:520px;
background:white;
padding:32px;
border-radius:14px;
box-shadow:0 10px 30px rgba(0,0,0,0.08);
}

.form-card h2{
font-size:18px;
margin-bottom:20px;
}

label{
display:block;
font-size:13px;
font-weight:500;
margin-top:16px;
margin-bottom:6px;
}

input,select,textarea{
width:100%;
padding:11px 12px;
border:1px solid #e5e7eb;
border-radius:8px;
font-size:14px;
}

textarea{
height:70px;
resize:none;
}

.grid3{
display:grid;
grid-template-columns:1fr 1fr 1fr;
gap:12px;
}

.photo-row{
display:flex;
align-items:center;
gap:16px;
margin-bottom:10px;
}

.photo-box{
width:110px;
height:130px;
border:2px dashed #d1d5db;
border-radius:12px;
display:flex;
align-items:center;
justify-content:center;
position:relative;
background:#f9fafb;
overflow:hidden;
}
.photo-placeholder{
display:flex;
align-items:center;
justify-content:center;
}
.photo-box img{
width:100%;
height:100%;
object-fit:cover;
}


.upload-btn{
display:flex;
align-items:center;
gap:8px;
background:linear-gradient(90deg,#0f172a,#111827);
color:white;
padding:10px 18px;
border-radius:10px;
font-size:14px;
cursor:pointer;
}

.submit-btn{
margin-top:20px;
width:100%;
padding:13px;
border:none;
border-radius:10px;
background:linear-gradient(90deg,#2563eb,#3b82f6);
color:white;
font-size:14px;
font-weight:500;
cursor:pointer;
}

footer{
text-align:center;
font-size:12px;
color:#6b7280;
margin-top:30px;
margin-bottom:20px;
}


.success-card{
max-width:420px;
margin:auto;
background:white;
padding:35px;
border-radius:14px;
box-shadow:0 8px 25px rgba(0,0,0,0.08);
text-align:center;
}

.success-title{
color:#16a34a;
margin-bottom:10px;
}

.success-message{
font-size:14px;
color:#555;
margin-bottom:25px;
}

.student-summary{
text-align:left;
margin-bottom:25px;
}

.summary-row{
display:flex;
justify-content:space-between;
margin-bottom:8px;
font-size:14px;
}

.page{
display:flex;
justify-content:center;
padding:50px;
}

.preview-container{
background:white;
padding:30px;
border-radius:12px;
width:100%;
box-shadow:0 8px 30px rgba(0,0,0,0.08);
}

.preview-container h2{
margin-bottom:20px;
font-size:18px;
}



.card-header{
background:#0c3b6d;
color:white;
padding:10px;
display:flex;
align-items:center;
gap:10px;
border-bottom:4px solid #4a90e2;
}

.school-logo{
width:30px;
}

.school-text h3{
margin:0;
font-size:11px;
}

.school-text p{
margin:0;
font-size:7px;
opacity:0.8;
}

.photo-area{
text-align:center;
padding:6px 4px 2px;
flex-shrink:0;
}

.student-photo{
width:54px;
height:62px;
object-fit:cover;
border:2px solid #ddd;
}

.student-name{
color:#c60000;
margin:4px 0 1px;
font-size:10px;
}

.student-role{
font-size:7px;
color:#777;
}

.details{
font-size:8px;
padding:0 5px 2px;
margin-bottom:4px;
line-height:1.1;
flex:1 1 0;
min-height:0;
overflow:hidden;
}

.details .row{
display:flex;
flex-wrap:wrap;
gap:3px;
margin-top:1px;
color:#555;
align-items:flex-start;
}
.details .row span:first-child{
min-width:55px;
font-size:8px;
}
.details .row span:last-child{
min-width:0;
max-width: calc(54mm - 22mm);
word-break:break-word;
}
.value{
margin-bottom:5px;

/* 🔥 LIMIT ADDRESS HEIGHT */
display:-webkit-box;
-webkit-line-clamp:2;
-webkit-box-orient:vertical;
overflow:hidden;
word-break:break-word;
}

.card-footer{
display:flex;
justify-content:space-between;
align-items:flex-end;
flex-wrap:nowrap;
padding:4px 6px 5px;
font-size:7px;
color:#777;
margin-top:auto;
gap:4px;
min-height:18px;
flex-shrink:0;
}

.academicyear{
display:flex;
flex-direction:column;   /* 🔥 THIS IS KEY */
align-items:flex-start;
}

.academicyear p{
margin:0;
line-height:1.1;
white-space:normal;      /* 🔥 allow line break */
}

.principal{
display:flex;
flex-direction:column;
align-items:flex-end;
width:auto;
min-width:0;
gap:0;
}

.signature-img{
width:56px;
height:16px;
object-fit:contain;
margin-bottom:0;
}

/* LINE */
.principal .line{
width:100%;
border-bottom:1px solid #4a90e2;
margin-bottom:2px;
}

/* TEXT */
.principal span{
white-space:normal;
font-size:7px;
text-align:right;
width:100%;
}
</style>

</head>

<body>
<div class="wrapper">
<div class="id-card">

<div class="card-header">

<img src="${BASE_URL}/images/logo.jpeg" class="school-logo">

<div class="school-text">
<h3>ST. XAVIER'S HIGH SCHOOL</h3>
<p>195, Khandagiri, Bhubaneswar</p>
</div>

</div>

<div class="photo-area">
<img src="${BASE_URL}/uploads/${photo}" class="student-photo">

<h4 class="student-name">${data.name}</h4>
<p class="student-role">STUDENT</p>

</div>

<div class="details">

<div class="row"><span>House Colour:</span> <span>${data.house}</span></div>

<div class="row"><span>Blood Group :</span> <span>${data.blood}</span></div>

<div class="row"><span>Class :</span> <span>${data.class} - ${data.section}</span></div>

<div class="row"><span>Roll No. :</span> <span>${data.roll}</span></div>

<div class="row"><span>Father's Name :</span> <span>${data.father}</span></div>

<div class="row"><span>Mother's Name :</span> <span>${data.mother}</span></div>

<div class="row"><span>Contact No. :</span>  <span>${data.contact}</span> </div>

<div class="row"><span>Address</span></div>
<div class="value">${data.address}</div>

</div>

<div class="card-footer">

<div class="academicyear">
  <p>Valid for Academic</p>
  <p>Year 2026-2027</p>
</div>

<div class="principal">
  <img src="http://localhost:3000/images/principal_signature.png" class="signature-img">
  <div class="line"></div>
  <span>Principal's Signature</span>
</div>

</div>

</div>
</div>
</body>
</html>
`)

await page.emulateMediaType('print')

await page.pdf({
  path: filePath,
  width: '54mm',
  height: '85mm',
  landscape: false,
  margin: 0,
  printBackground: true,
  preferCSSPageSize: true
})


await browser.close()


// =======================
// SAVE IN DATABASE
// =======================

const sql = `
INSERT INTO students
(name,class,section,roll,house,blood,father,mother,contact,address,photo,pdf,date)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
`

db.run(sql,[
data.name,
data.class,
data.section,
data.roll,
data.house,
data.blood,
data.father,
data.mother,
data.contact,
data.address,
photo,
filePath,
new Date().toLocaleDateString()
],function(err){

if(err){
console.log(err)
return res.send("Database Error")
}

console.log("Student saved with ID:",this.lastID)

res.render("success",{data:data,pdf:filePath})

})

}