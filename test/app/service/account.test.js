'use strict';

const { app } = require('egg-mock/bootstrap');

describe('account test', () => {
  it.only('account info', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.account.accountInfo('4b8ae4a9-9e6c-40a2-815e-373c8af670b0');
    if (!success) console.error(message);
    else console.log(data);
  });
});
