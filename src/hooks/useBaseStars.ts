import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fixtureMatches } from '../lib/fixtureData';

const normalizeCountry = (teamName: string) => {
  if (teamName === 'Estados Unidos') return 'USA';
  return teamName;
};

export const useBaseStars = () => {
  const [baseStarsByCountry, setBaseStarsByCountry] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchFixtureResults = async () => {
      try {
        const { data, error } = await supabase.from('fixture_results').select('match_id, score_a, score_b, status');
        if (!error && data) {
          const starsMap: Record<string, number> = {};
          data.forEach(r => {
            const match = fixtureMatches.find(m => m.id === r.match_id);
            if (match && r.status === 'finished') {
              const teamA = normalizeCountry(match.teamA);
              const teamB = normalizeCountry(match.teamB);
              if (r.score_a > r.score_b) {
                starsMap[teamA] = (starsMap[teamA] || 0) + 2;
              } else if (r.score_b > r.score_a) {
                starsMap[teamB] = (starsMap[teamB] || 0) + 2;
              } else {
                starsMap[teamA] = (starsMap[teamA] || 0) + 1;
                starsMap[teamB] = (starsMap[teamB] || 0) + 1;
              }
            }
          });
          setBaseStarsByCountry(starsMap);
        }
      } catch (err) {
        console.error("Error fetching fixture results for stars:", err);
      }
    };

    fetchFixtureResults();
  }, []);

  return baseStarsByCountry;
};
