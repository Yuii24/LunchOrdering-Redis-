require('dotenv').config()
const express = require('express')
const routes = require('./routes')
const session = require('express-session')
const passport = require('./config/passport')
const { getUser } = require('./helpers/auth-helpers')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const { engine } = require('express-handlebars')
const app = express()
const port = process.env.PORT || 3000

const SESSION_SECRET = process.env.SESSION_SECRET

app.engine('hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))

// app.engine('hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))


app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = getUser(req)
  next()
})

app.use(routes)

app.listen(port, () => {
  console.log(`server run on http://localhost:${port}`);
})

module.exports = app