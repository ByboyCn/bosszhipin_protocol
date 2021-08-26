'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('login test', () => {
  it('activate', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.activate();
    if (message) console.error(message);
    assert.ok(success);
    console.log(data);
  });
  it('machine', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.machine('84be2307-e024-49e1-a878-8227434c69ec');
    if (message) console.error(message);
    assert.ok(success);
    console.log(data);
  });
  it('sendSmsCode', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.sendSmsCode('84be2307-e024-49e1-a878-8227434c69ec', '13018508078');
    if (message) console.error(message);
    assert.ok(success);
    console.log(data);
  });
  it('smsLogin', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.smsLogin('84be2307-e024-49e1-a878-8227434c69ec', '333051');
    if (message) console.error(message);
    assert.ok(success);
    console.log(data);
  });
  it.only('smsLoginByWebCode', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { success, data, message } = await ctx.service.login.smsLoginByWebCode('13018508078', '292851');
    if (!success) console.error(message);
    else console.log(data);
  });
});
