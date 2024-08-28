const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { User } = require('../models')
const { client, connectRedis } = require('../helpers/redis-helper');

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

passport.deserializeUser(async (id, cb) => {
  try {
    await connectRedis(); // 确保 Redis 已连接

    const cacheKey = `user_${id}`;
    const cachedUser = await client.get(cacheKey);

    if (cachedUser) {
      console.log('User data retrieved from Redis');
      return cb(null, JSON.parse(cachedUser)); // 从缓存获取并解析 JSON 数据
    }

    const user = await User.findByPk(id);
    if (!user) return cb(null, false); // 如果用户不存在，返回 false

    const userData = user.toJSON();
    await client.set(cacheKey, JSON.stringify(userData)); // 将用户数据缓存到 Redis

    console.log('User data retrieved from MySQL and cached to Redis');
    return cb(null, userData);
  } catch (error) {
    console.error('Error in deserializeUser:', error);
    return cb(error); // 如果发生错误，传递给回调函数处理
  }
  // User.findByPk(id).then(user => {
  //   user = user.toJSON()
  //   return cb(null, user)
  // })
})

module.exports = passport