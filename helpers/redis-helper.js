// redis-helper.js

// 引入 redis 模块
const redis = require('redis');

// 创建 Redis 客户端
const client = redis.createClient();

// 处理连接错误
client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

// 连接 Redis
async function connectRedis() {
  try {
    if (!client.isOpen) { // 检查客户端是否已经连接
      await client.connect();
      console.log('Connected to Redis');
    } else {
      console.log('Redis client is already connected');
    }
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
}

// 导出客户端和连接函数
module.exports = {
  client,
  connectRedis
};
