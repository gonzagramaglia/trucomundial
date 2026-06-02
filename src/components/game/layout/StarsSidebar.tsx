import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
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


export const StarsSidebar = () => {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
      <div style={{ flexShrink: 0 }}>
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
      </div>

      <div className="custom-scrollbar" style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '6px',
        minHeight: 0
      }}>
        {loading ? (
          <div style={{ width: '100%' }}>
            <style>{`
              @keyframes spin-clockwise {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes spin-counter {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
              }
              @keyframes pulse-soft {
                0%, 100% { opacity: 0.45; }
                50% { opacity: 0.85; }
              }
            `}</style>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 0',
              gap: '1rem'
            }}>
              <div style={{ position: 'relative', width: '44px', height: '44px' }}>
                {/* Outer Yellow Ring */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '3px solid transparent',
                  borderTopColor: '#ffdf00',
                  borderRadius: '50%',
                  animation: 'spin-clockwise 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                  boxShadow: '0 0 10px rgba(255, 223, 0, 0.45)'
                }} />
                {/* Inner Yellow Ring */}
                <div style={{
                  position: 'absolute',
                  inset: '5px',
                  border: '3px solid transparent',
                  borderTopColor: '#ffdf00',
                  borderRadius: '50%',
                  animation: 'spin-counter 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                  boxShadow: '0 0 8px rgba(255, 223, 0, 0.35)'
                }} />
              </div>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#ffdf00',
                textShadow: '0 0 6px rgba(255, 223, 0, 0.2)',
                animation: 'pulse-soft 1.5s ease-in-out infinite',
                textAlign: 'center'
              }}>
                CARGANDO RANKING...
              </p>
            </div>
          </div>
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

      <div style={{ flexShrink: 0, marginTop: '0.75rem' }}>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: '0.5rem' }}>
          Estas posiciones se actualizan en tiempo real con los votos de la comunidad.
        </p>
        <a 
          href="/votar" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            padding: "0.75rem",
            background: "#a855f7",
            color: "#fff",
            fontWeight: 800,
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "0.85rem",
            textTransform: "uppercase"
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} />
            <span className="mobile-only">¡Votá ahora!</span>
            <span className="desktop-only">¡Votá ahora y distribuí tus estrellas!</span>
          </div>
        </a>
      </div>
    </div>
  );
};
