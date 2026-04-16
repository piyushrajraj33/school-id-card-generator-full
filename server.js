const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const studentRoutes = require('./routes/student')

const app = express()
app.use(express.static("public"));
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use('/',studentRoutes)
app.use('/idcards', express.static('idcards'))

const adminRoutes = require('./routes/admin')

const basicAuth = (req, res, next) => {
  const user = 'admin'
  const pass = 'GenerateMyId!@#123'

  const auth = req.headers.authorization

  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"')
    return res.status(401).send('Auth required')
  }

  const b64 = auth.split(' ')[1]
  const [username, password] = Buffer.from(b64, 'base64').toString().split(':')

  if (username === user && password === pass) {
    next()
  } else {
    res.status(403).send('Forbidden')
  }
}

app.use('/admin', basicAuth, adminRoutes)

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Running on EC2 with PM2!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// app.listen(PORT,()=>{
// console.log("Server running on http://localhost:"+PORT)
// })