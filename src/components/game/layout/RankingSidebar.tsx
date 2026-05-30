import { useState, useEffect } from 'react';
import { CARDS } from '../../../data/cards';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';

const BASE_PLAYERS = CARDS.map(card => ({
  id: card.id,
  name: card.name,
  country: card.country,
  club: card.club,
  power: card.power,
  env: card.env,
  image: card.image,
  stickerNumber: card.stickerNumber
}));

const getTraditionalEquivalent = (power: number): string => {
  switch (power) {
    case 1: return "1 de Espadas";
    case 2: return "1 de Bastos";
    case 3: return "7 de Espadas";
    case 4: return "7 de Oro";
    case 5: return "3 de Espadas";
    case 6: return "3 de Bastos";
    case 7: return "2 de Espadas";
    case 8: return "2 de Bastos";
    case 9: return "1 de Copas";
    case 10: return "1 de Oro";
    case 11: return "12 de Espadas";
    case 12: return "12 de Bastos";
    case 13: return "11 de Espadas";
    case 14: return "11 de Bastos";
    case 15: return "10 de Espadas";
    case 16: return "10 de Bastos";
    case 17: return "7 de Copas";
    case 18: return "7 de Bastos";
    case 19: return "6 de Espadas";
    case 20: return "6 de Bastos";
    case 21: return "5 de Espadas";
    case 22: return "5 de Bastos";
    default: return "";
  }
};

export const RankingSidebar = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbVotesData, setDbVotesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchGlobalVotes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('game_sync')
          .select('match_id, last_move')
          .like('match_id', 'user_votes_%');

        if (error) {
          console.error('Error fetching votes in sidebar:', error);
        } else if (data) {
          setDbVotesData(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching votes in sidebar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalVotes();
  }, []);

  // Compile aggregate votes
  const aggregateVotes: Record<string, number> = {};
  dbVotesData.forEach(item => {
    const recordVotes = item.last_move?.votes;
    if (recordVotes && typeof recordVotes === 'object') {
      Object.entries(recordVotes).forEach(([cardId, count]) => {
        if (typeof count === 'number') {
          aggregateVotes[cardId] = (aggregateVotes[cardId] ?? 0) + count;
        }
      });
    }
  });

  const sorted = [...BASE_PLAYERS]
    .map(p => ({
      ...p,
      totalVotes: aggregateVotes[p.id] ?? 0
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const filtered = sorted.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <h3 className="text-display" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
        {t("card_ranking")}
      </h3>

      {/* Search */}
      <input
        type="text"
        placeholder={t("search_player")}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.4rem 0.6rem',
          marginBottom: '0.75rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.75rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxHeight: '420px',
        overflowY: 'auto',
        paddingRight: '6px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) transparent'
      }}>
        {loading ? (
          <p style={{ color: 'var(--color-accent)', fontSize: '0.75rem', textAlign: 'center', margin: '1rem 0' }}>
            CARGANDO RANKING...
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center' }}>{t("no_results")}</p>
        ) : (
          filtered.map((p, i) => {
            return (
              <div key={p.id} style={{
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center',
                padding: '0.4rem 0.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '8px'
              }}>
                {/* Rank number in yellow */}
                <span className="text-display" style={{
                  color: '#ffdf00',
                  minWidth: '24px',
                  fontSize: '1rem',
                  textAlign: 'right',
                  fontStyle: 'italic',
                  fontWeight: 900
                }}>
                  {i + 1}.
                </span>

                {/* Player info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  {/* Line 2: Country · Club */}
                  <div style={{ opacity: 0.5, fontSize: '0.65rem', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t(`country_${p.country}`)} · {p.club}
                  </div>
                  {/* Line 3: Traditional equivalent in yellow */}
                  <div style={{ color: '#ffdf00', fontSize: '0.65rem', fontWeight: 'bold', opacity: 0.85 }}>
                    {getTraditionalEquivalent(p.power)}
                  </div>
                </div>

                {/* Global total votes in violet */}
                <div style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#a855f7',
                  borderRadius: '0.6rem',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: '0 0 6px rgba(168, 85, 247, 0.1)'
                }}>
                  ★ {p.totalVotes}
                </div>
              </div>
            );
          })
        )}
      </div>

      <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '0.75rem' }}>
        Este ranking se actualiza en tiempo real con los votos de la comunidad mundialista.
      </p>
    </>
  );
};
