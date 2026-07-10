import { describe, it, expect, vi } from 'vitest';

// Mock i18n
vi.mock('../../lib/i18n', () => ({
  default: { language: 'es' },
}));

import { normalizeTournamentPrizes, formatTournamentPrizes, formatTournamentDate } from '../../lib/formatters';

describe('normalizeTournamentPrizes', () => {
  it('returns [""] for null/undefined', () => {
    expect(normalizeTournamentPrizes(null)).toEqual(['']);
    expect(normalizeTournamentPrizes(undefined)).toEqual(['']);
  });

  it('returns [""] for empty string', () => {
    expect(normalizeTournamentPrizes('')).toEqual(['']);
  });

  it('wraps a simple string in array', () => {
    expect(normalizeTournamentPrizes('Gold Medal')).toEqual(['Gold Medal']);
  });

  it('parses JSON string array', () => {
    expect(normalizeTournamentPrizes('["Gold", "Silver", "Bronze"]')).toEqual(['Gold', 'Silver', 'Bronze']);
  });

  it('handles double-encoded JSON', () => {
    // The inner string is a JSON array that gets parsed recursively
    const input = ['["Gold", "Silver"]'];
    expect(normalizeTournamentPrizes(input)).toEqual(['Gold', 'Silver']);
  });

  it('handles normal array', () => {
    expect(normalizeTournamentPrizes(['Gold', 'Silver'])).toEqual(['Gold', 'Silver']);
  });

  it('filters empty strings from arrays', () => {
    expect(normalizeTournamentPrizes(['Gold', '', 'Bronze'])).toEqual(['Gold', 'Bronze']);
  });

  it('trims whitespace', () => {
    expect(normalizeTournamentPrizes(['  Gold  ', ' Silver '])).toEqual(['Gold', 'Silver']);
  });
});

describe('formatTournamentPrizes', () => {
  it('returns empty string for empty array', () => {
    expect(formatTournamentPrizes([])).toBe('');
  });

  it('formats single prize', () => {
    expect(formatTournamentPrizes(['Gold'])).toBe('1º Gold');
  });

  it('formats multiple prizes with separator', () => {
    expect(formatTournamentPrizes(['Gold', 'Silver', 'Bronze'])).toBe('1º Gold · 2º Silver · 3º Bronze');
  });
});

describe('formatTournamentDate', () => {
  it('returns empty string for empty input', () => {
    expect(formatTournamentDate('')).toBe('');
  });

  it('returns original string if not ISO format', () => {
    expect(formatTournamentDate('not a date')).toBe('not a date');
  });

  it('formats date in Spanish by default', () => {
    const result = formatTournamentDate('2026-07-09T17:00');
    expect(result).toBe('9 de Julio de 2026 a las 17:00hs (GMT-3)');
  });
});
