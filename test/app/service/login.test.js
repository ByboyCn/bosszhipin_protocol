'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('login test', () => {
  it('activate', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.activate();
    if (message) console.error(message);
    assert.ok(success);
    ctx.logger.info(data);
  });
  it.only('machine', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.machine('b60f761d-04a8-4f81-8659-d6abf2282fa7', '16620449161');
    if (message) console.error(message);
    assert.ok(success);
    ctx.logger.info(data);
  });
  it('sendSmsCode', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.sendSmsCode('84be2307-e024-49e1-a878-8227434c69ec', '13018508078');
    if (message) console.error(message);
    assert.ok(success);
    ctx.logger.info(data);
  });
  it('smsLogin', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.smsLogin('84be2307-e024-49e1-a878-8227434c69ec', '333051');
    if (message) console.error(message);
    assert.ok(success);
    ctx.logger.info(data);
  });
  it('smsLoginByWebCode', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.smsLoginByWebCode('13018508078', '292851');
    if (!success) console.error(message);
    else ctx.logger.info(data);
  });
});
