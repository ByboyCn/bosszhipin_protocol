'use strict';

const { Service } = require('egg');
const axios = require('axios');

module.exports = class extends Service {
  async searchCompany(uuid) {
    const { ctx, app } = this;
    const url = app.config.baseUrl + '/api/zpgeek/app/geek/search/cardlist';
    // 接口请求参数
    const params = {
      searchType: 2, // 3职位 2公司
      prefix: 'x',
      query: '游戏公司',
      sugSessionId: 'S5Abz1uiBI',
      noCorrect: '0',
      page: 1, // 分页
      source: '1',
      expectId: '232510441',
      sort: '0',
      sugAbKey: '30000001-GroupA',
    };
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, params);
    // 发送请求
    const { data, headers } = await axios.get(url, requestData);
    const content = await ctx.service.signer.targetResponse(uuid, data, headers);
    return { success: true, data: content };
  }
  /**
   * 获取公司信息
   * @param { String } uuid uuid
   * @param { Number } brandId 公司id
   * @param { String } securityId 加密后的公司id
   */
  async companyInfo(uuid, brandId, securityId) {
    const { ctx, app } = this;
    // 接口请求参数
    const params = {
      brandId,
      hasNewJob: false,
      securityId,
      sf: 1,
      sourceType: 0,
      topicId: '',
      curidentity: 0,
    };
    // 生成签名
    const url = app.config.baseUrl + '/api/zpgeek/app/brandInfo/getBrandInfo';
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, params);
    // 发送请求
    const { data, headers } = await axios.get(url, requestData);
    const content = await ctx.service.signer.targetResponse(uuid, data, headers);
    return { success: true, data: content };
  }
};
