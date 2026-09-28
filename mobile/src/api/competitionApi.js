import { API_BASE_URL } from './config';

class CompetitionApi {
  async getCompetitions() {
    const res = await fetch(`${API_BASE_URL}/competitions`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to fetch competitions');
    }
    return data.data;
  }

  async getCompetitionById(id, userId = null) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const res = await fetch(`${API_BASE_URL}/competitions/${id}`, {
      method: 'GET',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to fetch competition details');
    }
    return data.data;
  }

  async register(id, userId, idempotencyKey = null) {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    };
    if (idempotencyKey) {
      headers['idempotency-key'] = idempotencyKey;
    }

    const res = await fetch(`${API_BASE_URL}/competitions/${id}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        paymentMethod: 'razorpay_demo',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || 'Registration failed');
      err.code = data.error?.code || 'REGISTRATION_ERROR';
      throw err;
    }
    return data;
  }

  async submitEntry(id, userId, { title, videoUrl, description }) {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    };

    const res = await fetch(`${API_BASE_URL}/competitions/${id}/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        videoUrl,
        description,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || 'Submission failed');
      err.code = data.error?.code || 'SUBMISSION_ERROR';
      throw err;
    }
    return data;
  }

  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to fetch demo users');
    }
    return data.data;
  }
}

export default new CompetitionApi();
