'use strict';
const { v4 } = require('uuid');

module.exports = {
  async sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time));
  },
  async getHeaders(t2, encoding = 1, compressing = 3, encrypting = 1) {
    const headers = {
      Host: 'api5.zhipin.com',
      traceid: v4(),
      'zp-accept-encoding': encoding,
      'zp-accept-compressing': compressing,
      'zp-accept-encrypting': encrypting,
      'user-agent': 'NetType/wifi Screen/540X960 BossZhipin/9.090 Android 28',
    };
    if (t2) headers.t2 = t2;
    return headers;
  },
  async isBase64(text) {
    try {
      return Buffer.from(text, 'base64').toString('base64') === text;
    } catch (error) {
      return false;
    }
  },
};
