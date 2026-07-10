import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CARDS } from '../data/cards';
import { useBaseStars } from './useBaseStars';

/**
 * Hook that finds the top-voted card for a given nationality by aggregating
 * user votes, fixture-based base stars, and hardcoded World Cup bonus stars.
 * @param nationality - The country/nationality to find the top card for
 * @returns The highest-voted card for the nationality, or null
 */
export const useTopCard = (nationality: string | undefined): any | null => {
  const [topCard, setTopCard] = useState<any | null>(null);
  const baseStarsByCountry = useBaseStars();

  useEffect(() => {
    if (!nationality) {
      setTopCard(null);
      return;
    }

    const fetchTopCard = async () => {
      try {
        const { data, error } = await supabase
          .from('game_sync')
          .select('last_move')
          .like('match_id', 'user_votes_%');

        let aggregateVotes: Record<string, number> = {};
        
        if (!error && data) {
          data.forEach(row => {
            const votes = row.last_move?.votes;
            if (votes) {
              Object.entries(votes).forEach(([cardId, val]) => {
                const count = Number(val) || 0;
                aggregateVotes[cardId] = (aggregateVotes[cardId] || 0) + count;
              });
            }
          });
        }

        const natCards = CARDS.filter(c => c.country === nationality);
        if (natCards.length === 0) {
          setTopCard(null);
          return;
        }

        let maxVotes = -1;
        let bestCard: any = null;

        natCards.forEach(card => {
          const fixtureStars = baseStarsByCountry[card.country] || 0;
          const hardcodedBaseStars = card.country === 'Argentina' ? 3 : card.country === 'Francia' ? 2 : card.country === 'Croacia' ? 1 : 0;
          const userVotes = aggregateVotes[card.id] || 0;
          const totalVotes = hardcodedBaseStars + fixtureStars + userVotes;

          if (totalVotes > maxVotes) {
            maxVotes = totalVotes;
            bestCard = card;
          }
        });

        setTopCard(bestCard);

      } catch (err) {
        console.error('Error fetching top card data', err);
        setTopCard(null);
      }
    };

    fetchTopCard();
  }, [nationality, baseStarsByCountry]);

  return topCard;
};
