import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export default function GrammarHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [corrections, setCorrections] = useState([]);
  const [filter, setFilter] = useState('ALL');

  // Har baar jab yeh screen focus ya mount ho, data refresh ho
  useEffect(() => {
    fetchCorrections();
  }, []);

  async function fetchCorrections() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetching from tutor_chat_history ordered by newest first
      const { data, error } = await supabase
        .from('tutor_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'model')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedList = [];
      if (data) {
        data.forEach((item) => {
          try {
            const parsed = JSON.parse(item.message);
            // Check if it's a correction or contains explanation/tips
            if (parsed && (parsed.hasCorrection || parsed.explanation || parsed.correctedText)) {
              parsedList.push({
                id: item.id,
                originalText: parsed.originalText || parsed.original || '',
                correctedText: parsed.correctedText || parsed.corrected || '',
                explanation: parsed.explanation || '',
                hasCorrection: Boolean(parsed.hasCorrection || parsed.correctedText),
                createdAt: item.created_at,
              });
            }
          } catch (e) {
            // Fallback if message is plain text
          }
        });
      }

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
      <div style={styles.bgImageWrapper}>
        <img src={require('../../assets/tutor_girl.png.png')} style={styles.bgImageStyle} alt="Background" />
        <div style={styles.bgOverlay} />
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h1 style={styles.headerTitle}>Grammar & Learning History</h1>
          <button style={styles.refreshButton} onClick={fetchCorrections}>🔄 Refresh</button>
        </div>

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
            <p style={styles.emptyText}>No records found. Complete a chat session with corrections to see them here!</p>
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
    backgroundColor: '#0F1715',
    position: 'relative',
    overflowX: 'hidden',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  bgImageWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  bgImageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'none',
    transform: 'scale(1)',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 21, 0.45)',
  },
  loaderContainer: {
    minHeight: '100vh',
    backgroundColor: '#0F1715',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 203, 154, 0.2)',
    borderTop: '4px solid #FFCB9A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop: '10px',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '800',
  },
  refreshButton: {
    backgroundColor: '#116466',
    color: '#FFCB9A',
    border: '1px solid #FFCB9A',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: 'rgba(11, 29, 27, 0.9)',
    padding: '8px 18px',
    borderRadius: '12px',
    border: '1.5px solid #116466',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeFilterChip: {
    backgroundColor: '#116466',
    borderColor: '#FFCB9A',
  },
  filterText: {
    color: '#D1E8E2',
    fontSize: '14px',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFCB9A',
  },
  emptyContainer: {
    textAlign: 'center',
    marginTop: '60px',
  },
  emptyText: {
    color: '#D1E8E2',
    fontSize: '15px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'rgba(24, 44, 37, 0.95)',
    borderRadius: '16px',
    padding: '20px',
    border: '1.5px solid #116466',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardBadge: {
    color: '#FFCB9A',
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
    fontWeight: '600',
  },
  fixedText: {
    color: '#4ade80',
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '10px',
    lineHeight: '22px',
  },
  explanationText: {
    color: '#FFFFFF',
    fontSize: '14px',
    lineHeight: '20px',
  },
};
