'use strict';

const { Service } = require('egg');

module.exports = class extends Service {
  async setClientInfo(uuid, info) {
    const { app } = this;
    await app.redis.hset('CLIENTS', uuid, JSON.stringify(info));
  }
  async getClientInfo(uuid) {
    const { app } = this;
    let info;
    const infoString = await app.redis.hget('CLIENTS', uuid);
    if (infoString) {
      info = JSON.parse(infoString);
    }
    return info;
  }
  async removeClientInfo(uuid) {
    const { app } = this;
    await app.redis.hdel('CLIENTS', uuid);
  }
  async setAccountInfo(uuid, info) {
    const { app } = this;
    await app.redis.hset('UUID_ACCOUNT', uuid, info.account);
    await app.redis.hset('ACCOUNTS', info.account, JSON.stringify(info));
  }
  async getAccountInfo(uuid) {
    const { app } = this;
    let info;
    const account = await app.redis.hget('UUID_ACCOUNT', uuid);
    const infoString = await app.redis.hget('ACCOUNTS', account);
    if (infoString) {
      info = JSON.parse(infoString);
    }
    return info;
  }
};
