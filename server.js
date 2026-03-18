const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const studentRoutes = require('./routes/student')

const app = express()
app.use(express.static("public"));
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended:true}))

app.use('/',studentRoutes)
app.use('/idcards', express.static('idcards'))

const PORT = 3000
app.listen(PORT,()=>{
console.log("Server running on http://localhost:"+PORT)
})