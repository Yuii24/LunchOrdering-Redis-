const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { User } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'employeeId',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, employeeId, password, cb) => {
    User.findOne({ where: { employeeId: employeeId } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼錯誤!'))

        return bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼錯誤!'))

          return cb(null, user)
        })
      })
  }
))


passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON()
    console.log(user)
    return cb(null, user)
  })
})

module.exports = passport