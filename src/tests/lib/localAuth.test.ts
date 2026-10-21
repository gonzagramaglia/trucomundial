import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalUser, updateLocalUser } from '../../lib/localAuth';

describe('localAuth utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides a default local user if localStorage is empty', () => {
    const user = getLocalUser();
    expect(user).toBeDefined();
    expect(user.id).toBe('local_player');
    expect(user.user_metadata.name).toBe('Guacho');
    expect(user.user_metadata.nationality).toBe('Argentina');
  });

  it('updates local user metadata and persists to localStorage', () => {
    updateLocalUser({ name: 'Lionel', custom_username: 'Lionel10', nationality: 'Argentina' });
    const user = getLocalUser();
    expect(user.user_metadata.name).toBe('Lionel');
    expect(user.user_metadata.custom_username).toBe('Lionel10');
  });
});
