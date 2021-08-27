'use strict';

const { app } = require('egg-mock/bootstrap');

describe('company test', () => {
  const uuid = '8770ceb6-f3dd-4554-89e5-cbe7b206bab0';
  it.only('search company', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { data, message } = await ctx.service.company.searchCompany(uuid);
    if (message) console.error(message);
    ctx.logger.info(JSON.stringify(data));
  });
  it('company detail', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { data, message } = await ctx.service.company.companyInfo(
      uuid,
      8677,
      'otrqzJOFavvnQ-h1q_GZcqzIqqyxxQWuGpgEc6GNo4n7aKmKO4Bey1BTTs72_eoeHOIQqTwvrk12AjxPFoaeibrHlYNV61Sp9JHMNPYeiJPDArNTxwHSbuomhgJ1ZvfrcwRbxQdy-CBLQfu7fEzaAzBzSPjYNedX3V4o0t4gzsLpJVUXMAP_pAitzEkea9oqk4he9XRajpvQRK73eHyZwquhOZ6UNtqzgNI-CVqRwISyYeBzomdlGJP8VT0HoxVDrwjSwBwP'
    );
    if (message) console.error(message);
    ctx.logger.info(JSON.stringify(data));
  });
});
