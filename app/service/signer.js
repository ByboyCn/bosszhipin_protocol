'use strict';

const { Service } = require('egg');
const crypto = require('crypto');
const lz4 = require('lz4');

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
    return await this.decode(buffer, decodeType, secretKey);
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
    const sign = 'V2.0' + crypto.createHash('md5').update(`${str}a308f3628b3f39f7d35cdebeb6920e21${key || ''}`).digest('hex');
    return sign;
  }
  /**
   * @param { Buffer } buffer 加密内容
   * @param { Object } decodeType encoding
   * @param { String } key 密钥
   * @param { boolean } returnType 返回类型
   * @return { String } content 内容
   */
  async decode(buffer, decodeType, key, returnType) {
    const { ctx } = this;
    let { responseType, encoding, encrypting, compressing } = decodeType;
    ctx.logger.info('decodeContent', responseType, buffer.length, key, encoding, encrypting, compressing);
    let target = buffer;
    if (responseType === 'json') {
      // 返回了json
    } else {
      if (responseType === 'base64') {
        // 返回了base64
        const fuckBase64 = buffer.toString();
        ctx.logger.info('魔改base64', fuckBase64);
        target = Buffer.from(fuckBase64, 'base64');
        encrypting = 1;
        ctx.logger.info('base64', target.toString('base64'));
      }
      // 其他情况都是返回buffer
      if (encrypting === 1) {
        target = await this.rc4(target, key);
        ctx.logger.info('encrypting', target.toString('hex'));
      }
      if (compressing === 2) target = await this.lz4DeCompressing(target);
      if (returnType === 'bufferArray') return target;
    }
    try {
      target = target.toString('utf-8');
      // 移除填充的内容
      target = JSON.parse(target);
    } catch (error) {
      ctx.logger.info('解析返回内容失败', target);
    }
    return target;
  }
  async parseResponseHeaders(headers) {
    const obj = { encoding: headers['zp-encoding'], encrypting: headers['zp-encrypting'], compressing: headers['zp-compressing'] };
    for (const key in obj) {
      obj[key] = parseInt(obj[key] || 0);
    }
    if (headers['content-encrypt'] === 'yes') {
      Object.assign(obj, { responseType: 'base64' });
    } else {
      if (!Object.values(obj).filter(o => o !== 0).length) {
        // 直接返回了json
        Object.assign(obj, { responseType: 'json' });
      }
    }
    return obj;
  }
  async rc4(buffer, key) {
    key = 'a308f3628b3f39f7d35cdebeb6920e21' + (key || '');
    const cipher = crypto.createCipheriv('rc4', key, '');
    const ciphertext = cipher.update(buffer, 'buffer', 'buffer');
    return ciphertext;
  }
  /**
   * @param { Buffer } buffer result
   * @return { Buffer } result
   */
  async lz4DeCompressing(buffer) {
    const { ctx } = this;
    const contentSize = buffer.length;
    // 移除BZPBlock头
    buffer = buffer.slice(24, buffer.length);
    // eslint-disable-next-line no-bitwise
    let decodeSize = 2 * buffer.length; // 预分配空间
    // DWORD 4字节 QWORD 8字节
    // 2021-08-26 14:26:41.607 9962-10216/com.hpbr.bosszhipin D/YZWG: lz4 compressSize = [6227], decodeSize = [10662], checksum = [12789], content size =[6251], result =[1]
    const output = Buffer.alloc(decodeSize);
    decodeSize = lz4.decodeBlock(buffer, output);
    ctx.logger.info(`compressSize = [${buffer.length}], decodeSize = [${decodeSize}], content size = [${contentSize}]`);
    return output.slice(0, decodeSize);
  }
};
