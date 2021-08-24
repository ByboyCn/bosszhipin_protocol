'use strict';

const { app } = require('egg-mock/bootstrap');

describe('company test', () => {
  it.skip('search company', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { data, message } = await ctx.service.company.searchCompany('c3791456-e329-403a-813d-6d75f7203fb4');
    if (message) console.error(message);
    console.log(JSON.stringify(data));
  });
  it('company detail', async () => {
    await app.ready();
    const ctx = app.mockContext();
    const { data, message } = await ctx.service.company.companyInfo(
      'c3791456-e329-403a-813d-6d75f7203fb4',
      8677,
      'otrqzJOFavvnQ-h1q_GZcqzIqqyxxQWuGpgEc6GNo4n7aKmKO4Bey1BTTs72_eoeHOIQqTwvrk12AjxPFoaeibrHlYNV61Sp9JHMNPYeiJPDArNTxwHSbuomhgJ1ZvfrcwRbxQdy-CBLQfu7fEzaAzBzSPjYNedX3V4o0t4gzsLpJVUXMAP_pAitzEkea9oqk4he9XRajpvQRK73eHyZwquhOZ6UNtqzgNI-CVqRwISyYeBzomdlGJP8VT0HoxVDrwjSwBwP'
    );
    if (message) console.error(message);
    console.log(JSON.stringify(data));
  });
});
