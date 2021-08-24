'use strict';

const { Service } = require('egg');
const axios = require('axios');

module.exports = class extends Service {
  async accountInfo(uuid) {
    const { ctx, app } = this;
    const url = app.config.baseUrl + '/api/batch/batchRunV2';
    // 生成请求参数
    const requestData = await ctx.service.signer.targetParams(uuid, url, {
      batch_method_feed: [
        'method=zpuser.user.getBottomBtns',
        'method=zpuser.dynamicBar.get',
        'method=zpgeek.app.geek.baseinfo.query&subLocation=0&userId=0',
        'method=zpitem.geek.vip.info',
        'method=zpuser.user.check',
        'method=zprelation.interview.geek.fitcount',
        'method=zpitem.geek.getItemMallF4',
        'method=zpgeek.app.panel.query',
        'method=zpchat.fastreply.get',
        'method=zpitem.resume.guideResumeRefresh',
        'method=certification.security.get',
      ],
    });
    // 发送请求
    const { data, headers } = await axios.get(url, requestData);
    const content = await ctx.service.signer.targetResponse(uuid, data, headers);
    return { success: true, data: content };
  }
};
