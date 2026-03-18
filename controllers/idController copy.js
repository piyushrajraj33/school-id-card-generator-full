
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const Excel = require('exceljs')



exports.formPage = (req,res)=>{
res.render('form')
}

exports.previewPage = (req,res)=>{
const data = req.body
data.photo = req.file.filename
res.render('preview',{data})
}

exports.generateID = async (req,res)=>{
console.log(" console print");

const data = req.body
const photo = req.body.photo

// =======================
// Create ID Card Folder
// =======================

const folder = `idcards/Class_${data.class}/Section_${data.section}`
fs.mkdirSync(folder,{recursive:true})

const filePath = `${folder}/${data.name.replace(/ /g,'_')}.pdf`

// =======================
// Generate PDF
// =======================

const doc = new PDFDocument({size:[300,450]})
const stream = fs.createWriteStream(filePath)

doc.pipe(stream)

doc.rect(0,0,300,80).fill('#0f3d75')

doc.fillColor('white').fontSize(14)
.text("ST. XAVIER'S HIGH SCHOOL",60,20)

doc.image('public/uploads/'+photo,90,100,{width:120})

doc.fillColor('black').fontSize(12)
doc.text("Name: "+data.name,30,240)
doc.text("Class: "+data.class+" - "+data.section,30,260)
doc.text("Roll: "+data.roll,30,280)
doc.text("Blood: "+data.blood,30,300)
doc.text("Father: "+data.father,30,320)
doc.text("Mother: "+data.mother,30,340)
doc.text("Contact: "+data.contact,30,360)

doc.end()

// Wait until PDF finishes writing
stream.on("finish", async ()=>{
console.log(" console print b4 try");
try{

// =======================
// Excel Database
// =======================

const excelDir = "data"
const excelPath = "data/students.xlsx"

if(!fs.existsSync(excelDir)){
fs.mkdirSync(excelDir)
}
console.log(" console print b4 try 1");
const workbook = new Excel.Workbook()

if(fs.existsSync(excelPath)){
    console.log(" console print b4 try read file");
    await workbook.xlsx.readFile(excelPath)
}

let sheet = workbook.getWorksheet("Students")

if(!sheet){
console.log("console print b4 try if new sheet");
sheet = workbook.addWorksheet("Students")

sheet.columns = [
{header:'Student Name',key:'name',width:25},
{header:'Class',key:'class',width:10},
{header:'Section',key:'section',width:10},
{header:'Roll',key:'roll',width:10},
{header:'Blood',key:'blood',width:10},
{header:'Father',key:'father',width:25},
{header:'Mother',key:'mother',width:25},
{header:'Contact',key:'contact',width:15},
{header:'Address',key:'address',width:40},
{header:'PDF Path',key:'pdf',width:40},
{header:'Date',key:'date',width:15}
]

}
console.log(" console print b4 appending");

console.log(" console print data",data);
console.log(" console print filePath",filePath);
console.log(" console print date",new Date().toLocaleDateString());

console.log("Row count before:", sheet.rowCount);

// Append row
sheet.addRow({
name:data.name,
class:data.class,
section:data.section,
roll:data.roll,
blood:data.blood,
father:data.father,
mother:data.mother,
contact:data.contact,
address:data.address,
pdf:filePath,
date:new Date().toLocaleDateString()
})

console.log("Row count after:", sheet.rowCount);
// Append row
sheet.addRow({
name:data.name,
class:data.class,
section:data.section,
roll:data.roll,
blood:data.blood,
father:data.father,
mother:data.mother,
contact:data.contact,
address:data.address,
pdf:filePath,
date:new Date().toLocaleDateString()
})

console.log("Row count after:", sheet.rowCount);
console.log(" console print b4 save");
// Save Excel
await workbook.xlsx.writeFile(excelPath)
console.log("Excel saved successfully at:",excelPath)
console.log(" console print after save");
// Show success page
res.render("success",{data:data})
console.log(" after render success page");

}catch(err){
console.log(err)
res.send("Excel write error")
}

})

}