'use strict';

const { Service } = require('egg');
const axios = require('axios');

module.exports = class extends Service {
  async urlHandle(url) {
    const indexOf = url.indexOf('/api/');
    if (indexOf < 0) {
      return url;
    }
    return url.substring(indexOf, url.length);
  }
  async paramsHandle(obj) {
    const arr = [];
    for (const key of Object.keys(obj).sort()) {
      if (obj[key].toString()) {
        let target;
        if (typeof obj[key] === 'object') target = JSON.stringify(obj[key]);
        else target = obj[key];
        arr.push(key + '=' + target);
      }
    }
    return arr.join('');
  }
  /**
   * @param { Stirng } uuid url
   * @param { Stirng } url url
   * @param { Object } params 参数
   */
  async targetParams(uuid, url, params) {
    const { ctx } = this;
    const requestData = { responseType: 'arraybuffer' };
    // accountInfo
    let secretKey;
    const account = await ctx.service.client.getAccountInfo(uuid);
    if (account) {
      requestData.headers = await ctx.getHeaders(account.t2);
      secretKey = account.secretKey;
    }
    // clientInfo
    const clientInfo = await ctx.service.client.getClientInfo(uuid);
    if (clientInfo) Object.assign(params, clientInfo);
    params.sig = await ctx.service.signer.sign(url, params, secretKey || '');
    if (!params.sig) return { success: false, message: '签名失败' };
    for (const key in params) {
      const item = params[key];
      if (typeof item === 'object') params[key] = JSON.stringify(item);
    }
    requestData.params = params;
    return requestData;
  }
  /**
   * @param { Stirng } uuid url
   * @param { Buffer } buffer buffer
   * @param { Object } headers headers
   */
  async targetResponse(uuid, buffer, headers) {
    const { ctx } = this;
    // accountInfo
    let secretKey;
    const account = await ctx.service.client.getAccountInfo(uuid);
    if (account) {
      secretKey = account.secretKey;
    }
    const decodeType = await ctx.service.signer.parseResponseHeaders(headers);
    return await this.decode(buffer, secretKey || '', ...decodeType);
  }
  /**
   * @param { String } url url
   * @param { Object } params 参数
   * @param { String } key 密钥
   * @return { String } sign 签名
   */
  async sign(url, params, key) {
    const key1 = await this.urlHandle(url);
    const timestamp = Date.now();
    params.req_time = timestamp.toString();
    const key2 = await this.paramsHandle(params);
    const str = key1 + key2;
    // TODO: 算法未还原 使用http请求签名服务器进行签名
    let sign;
    const { status, data } = await axios.post('http://192.168.31.163:7001/sign', { hex: Buffer.from(str).toString('hex'), key });
    if (status === 200 && data) {
      sign = data;
    }
    return sign;
  }
  /**
   * @param { Buffer } buffer 加密内容
   * @param { String } key 密钥
   * @param { Number } encoding encoding
   * @param { Number } encrypting encrypting
   * @param { Number } compressing compressing
   * @param { boolean } responseType 返回类型
   * @return { String } content 内容
   */
  async decode(buffer, key, encoding, encrypting, compressing, responseType = '') {
    // TODO: 算法未还原 使用http请求签名服务器进行签名
    let content;
    const { status, data } = await axios.post('http://192.168.31.163:7001/decode', { hex: Buffer.from(buffer).toString('hex'), key, encoding, encrypting, compressing }, { responseType });
    if (status === 200 && data) {
      content = data;
    }
    return content;
  }
  async parseResponseHeaders(heasers) {
    return [ heasers['zp-encoding'] || 0,
      heasers['zp-encrypting'] || 0,
      heasers['zp-compressing'] || 0 ].map(o => parseInt(o));
  }
  async parseLoginResponse(response, decodeType) {
    const { ctx } = this;
    response = await ctx.service.signer.decode(response, '', ...decodeType, 'arraybuffer');
    const responseString = Buffer.from(response).toString();
    try {
      // 判断是不是json
      return JSON.parse(responseString);
    } catch (error) {
      if (responseString.includes('-') || responseString.includes('~') || responseString.includes('_')) {
        // 魔改base64
        const base64 = responseString.replace(/_/g, '/').replace(/-/g, '+').replace(/~/g, '=');
        if (await ctx.isBase64(base64)) {
          // 改之后是base64
          return await this.parseLoginResponse(Buffer.from(base64, 'base64'), [ 0, 1, 0 ]);
        }
      }
      // 改之后还不是base64 再把buffer解密一次
      return await this.parseLoginResponse(response, decodeType);
    }
  }
};
