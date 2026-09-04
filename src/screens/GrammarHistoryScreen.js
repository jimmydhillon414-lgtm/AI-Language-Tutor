import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export default function GrammarHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [corrections, setCorrections] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchCorrections();
  }, []);

  async function fetchCorrections() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tutor_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'model')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedList = [];
      data.forEach((item) => {
        try {
          const parsed = JSON.parse(item.message);
          if (parsed && (parsed.hasCorrection || parsed.explanation)) {
            parsedList.push({
              id: item.id,
              originalText: parsed.originalText || '',
              correctedText: parsed.correctedText || '',
              explanation: parsed.explanation || '',
              hasCorrection: parsed.hasCorrection || false,
              createdAt: item.created_at,
            });
          }
        } catch (e) {}
      });

      setCorrections(parsedList);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    try {
      const { error } = await supabase
        .from('tutor_chat_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCorrections((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete item.');
    }
  }

  const filteredCorrections = corrections.filter(item => {
    if (filter === 'MISTAKES') return item.hasCorrection;
    if (filter === 'TIPS') return !item.hasCorrection && item.explanation;
    return true;
  });

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.backgroundImage}>
      {/* Dark Circuit Board Overlay / Vignette */}
      <div style={styles.darkOverlay} />

      <div style={styles.container}>
        <h1 style={styles.headerTitle}>Grammar & Learning History</h1>

        <div style={styles.filterRow}>
          <button 
            style={{...styles.filterChip, ...(filter === 'ALL' && styles.activeFilterChip)}} 
            onClick={() => setFilter('ALL')}
          >
            <span style={{...styles.filterText, ...(filter === 'ALL' && styles.activeFilterText)}}>All</span>
          </button>
          <button 
            style={{...styles.filterChip, ...(filter === 'MISTAKES' && styles.activeFilterChip)}} 
            onClick={() => setFilter('MISTAKES')}
          >
            <span style={{...styles.filterText, ...(filter === 'MISTAKES' && styles.activeFilterText)}}>Corrections</span>
          </button>
          <button 
            style={{...styles.filterChip, ...(filter === 'TIPS' && styles.activeFilterChip)}} 
            onClick={() => setFilter('TIPS')}
          >
            <span style={{...styles.filterText, ...(filter === 'TIPS' && styles.activeFilterText)}}>Tips</span>
          </button>
        </div>

        {filteredCorrections.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>No records found.</p>
          </div>
        ) : (
          <div style={styles.listContainer}>
            {filteredCorrections.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardBadge}>
                    {item.hasCorrection ? '⚠️ Grammar Correction' : '💡 Tutor Tip'}
                  </span>
                  <button onClick={() => deleteItem(item.id)} style={styles.deleteButton}>
                    🗑️
                  </button>
                </div>

                {item.originalText ? <p style={styles.errorText}>❌ {item.originalText}</p> : null}
                {item.correctedText ? <p style={styles.fixedText}>✅ {item.correctedText}</p> : null}
                {item.explanation ? <p style={styles.explanationText}>ℹ️ {item.explanation}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backgroundImage: {
    minHeight: '100vh',
    // Exact motherboard / circuit board hardware texture matching your image
    backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#121619',
    position: 'relative',
    overflowX: 'hidden',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 18, 22, 0.86)', // Dark professional tint to make cards readable like your screenshot
    pointerEvents: 'none',
    zIndex: 0,
  },
  loaderContainer: {
    minHeight: '100vh',
    backgroundColor: '#121619',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(224, 180, 134, 0.2)',
    borderTop: '4px solid #E0B486',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '20px',
    marginTop: '10px',
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: 'rgba(15, 23, 26, 0.9)',
    padding: '8px 18px',
    borderRadius: '12px',
    border: '1.5px solid #1a3536',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeFilterChip: {
    backgroundColor: '#163838',
    borderColor: '#225d5f',
  },
  filterText: {
    color: '#9fb4ad',
    fontSize: '14px',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  emptyContainer: {
    textAlign: 'center',
    marginTop: '60px',
  },
  emptyText: {
    color: '#9fb4ad',
    fontSize: '15px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 26, 0.92)',
    borderRadius: '16px',
    padding: '20px',
    border: '1.5px solid #1a3536',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardBadge: {
    color: '#E0B486',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  deleteButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    padding: '4px',
    borderRadius: '6px',
  },
  errorText: {
    color: '#f87171',
    fontSize: '15px',
    marginBottom: '8px',
    lineHeight: '22px',
  },
  fixedText: {
    color: '#4ade80',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '10px',
    lineHeight: '22px',
  },
  explanationText: {
    color: '#c2d4cd',
    fontSize: '14px',
    fontStyle: 'italic',
    lineHeight: '20px',
    opacity: 0.9,
  },
};