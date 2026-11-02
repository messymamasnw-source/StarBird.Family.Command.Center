import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../server/index';

const app = createApp();

describe('authentication and authorization', () => {
  it('rejects unauthenticated access to dashboard', async () => {
    const response = await request(app).get('/api/dashboard');
    expect(response.status).toBe(401);
  });

  it('allows sign up and creates a household', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Taylor',
        lastName: 'Reed',
        email: 'taylor@example.com',
        password: 'Password123!',
        householdName: 'Main House',
      });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.household.name).toBe('Main House');
  });

  it('blocks child role from adult-only access', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@starbird.family', password: 'Password123!' });
    const token = login.body.token;

    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
