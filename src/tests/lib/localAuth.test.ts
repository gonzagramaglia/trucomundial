import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalUser, updateLocalUser, subscribeToLocalUser, type LocalUser } from '../../lib/localAuth';

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

  it('migrates legacy "Jugador 10" user to "Guacho"', () => {
    localStorage.setItem(
      'trucomundial_local_user',
      JSON.stringify({
        id: 'local_player',
        user_metadata: {
          name: 'Jugador 10',
          custom_username: 'Jugador 10',
          full_name: 'Jugador 10'
        }
      })
    );
    const user = getLocalUser();
    expect(user.user_metadata.name).toBe('Guacho');
    expect(user.user_metadata.custom_username).toBe('Guacho');
    expect(user.user_metadata.full_name).toBe('Guacho');

    const persisted = JSON.parse(localStorage.getItem('trucomundial_local_user')!);
    expect(persisted.user_metadata.name).toBe('Guacho');
  });

  it('recovers gracefully from malformed JSON in localStorage', () => {
    localStorage.setItem('trucomundial_local_user', 'invalid-json{{{');
    const user = getLocalUser();
    expect(user.id).toBe('local_player');
    expect(user.user_metadata.name).toBe('Guacho');
  });

  it('notifies subscribers via subscribeToLocalUser when user is updated', () => {
    let notifiedUser: LocalUser | undefined;
    const unsub = subscribeToLocalUser((u) => {
      notifiedUser = u;
    });

    updateLocalUser({ name: 'Dibu' });
    expect(notifiedUser).toBeDefined();
    expect(notifiedUser!.user_metadata.name).toBe('Dibu');

    unsub();
  });
});
