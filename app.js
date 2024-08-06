const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const port = 3000

app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')


app.get('/', (req, res) => {
  res.render('index')
})

app.get('/ordering', (req, res) => {
  res.render('ordering')
})



app.listen(port, () => {
  console.log(`server run on http://localhost:${port}`);
})