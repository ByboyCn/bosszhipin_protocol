'use strict';

const { Service } = require('egg');
const { v4 } = require('uuid');
const axios = require('axios');

module.exports = class extends Service {
  // 激活设备
  async activate() {
    const { ctx, app } = this;
    const url = app.config.baseUrl + '/api/zpCommon/app/activate';
    // 生成一个uuid
    const uuid = v4();
    // app打开时间
    const start_time = Date.now().toString();
    const params = {
      imei: '',
      imei_per: 0,
      curidentity: 0,
      v: '9.090',
      app_id: 1003,
      uniqid: uuid,
      client_info: { version: '9', os: 'Android', start_time, resume_time: start_time, channel: '10', model: 'Xiaomi||MI 6', dzt: 0, loc_per: 0, uniqid: uuid, network: 'wifi', operator: 'UNKNOWN' },
    };
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, params);
    // 发送请求
    const { data, headers } = await axios.post(url, null, requestData);
    const decodeType = await ctx.service.signer.parseResponseHeaders(headers);
    const content = await ctx.service.signer.decode(data, decodeType);
    // 保存到redis
    await ctx.service.client.setClientInfo(uuid, {
      curidentity: 0,
      v: '9.090',
      app_id: 1003,
      uniqid: uuid,
      client_info: params.client_info,
    });
    return { success: true, data: content, uuid };
  }
  // 验证设备
  async machine(uuid, phone) {
    const { ctx, app } = this;
    const url = app.config.baseUrl + '/api/zppassport/man/machine';
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, {
      phone,
      type: 3,
    });
    // 发送请求
    const { data, headers } = await axios.post(url, null, requestData);
    const decodeType = await ctx.service.signer.parseResponseHeaders(headers);
    const content = await ctx.service.signer.decode(data, decodeType);
    await app.redis.hset('MACHINE', uuid, content.zpData.startCaptcha);
    return { success: true, data: content };
  }
  // 发送验证码 TODO: 需要过验证码
  async sendSmsCode(uuid, phone, validate) {
    const { ctx, app } = this;
    const url = app.config.baseUrl + '/api/zppassport/phone/smsCode';
    const params = {
      phone,
      regionCode: '+86',
      type: 3,
      voice: 0,
    };
    // info
    const infoString = await app.redis.hget('MACHINE', uuid);
    if (!infoString) return { success: false, message: '找不到客户端' };
    const info = JSON.parse(infoString);
    params.challenge = info.challenge;
    params.validate = validate;
    params.seccode = `${validate}|jordan`;
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, params);
    // 发送请求
    const { data, headers } = await axios.get(url, requestData);
    const decodeType = await ctx.service.signer.parseResponseHeaders(headers);
    const content = await ctx.service.signer.decode(data, decodeType);
    return { success: true, data: content };
  }
  // 验证码登录 TODO: 需要过验证码
  async smsLogin(uuid, phoneCode) {
    const { ctx, app } = this;
    const url = app.config.baseUrl + '/api/zppassport/user/codeLogin';
    const params = {
      sWxLogin: false,
      regionCode: '+86',
      phoneCode,
    };
    // info
    const infoString = await app.redis.hget('MACHINE', uuid);
    if (!infoString) return { success: false, message: '找不到客户端' };
    const info = JSON.parse(infoString);
    params.account = info.phone;
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, params);
    // 发送请求
    const { data, headers } = await axios.get(url, requestData);
    const decodeType = await ctx.service.signer.parseResponseHeaders(headers);
    const content = await ctx.service.signer.decode(data, decodeType);
    return { success: true, data: content };
  }
  // 使用网页的验证码登录 漏洞
  async smsLoginByWebCode(phone, phoneCode) {
    const { ctx, app } = this;
    // 先激活一个设备
    const { uuid } = await this.activate();
    const url = app.config.baseUrl + '/api/zppassport/user/codeLogin';
    const params = {
      sWxLogin: false,
      regionCode: '+86',
      phoneCode,
      account: phone,
    };
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, params);
    // 发送请求
    const { data, headers } = await axios.get(url, requestData);
    const decodeType = await ctx.service.signer.parseResponseHeaders(headers);
    const content = await ctx.service.signer.decode(data, decodeType);
    // 正常的情况
    if (content.code === 0 && content.zpData) {
      content.zpData.uuid = uuid;
      await ctx.service.client.setAccountInfo(uuid, content.zpData);
      return { success: true, data: content.zpData };
    }
    // 删除客户端
    await ctx.service.client.removeClientInfo(uuid);
    return { success: false, message: content === 'object' ? `${content.message}(${content.code})` : content };
  }
};
