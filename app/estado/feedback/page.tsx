'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { games } from '@/lib/games/catalog';
import { collectFeedback, markFeedbackTriage } from '@/lib/analytics/feedback';
import type { FeedbackSummary } from '@/lib/analytics/feedback';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from '../metrics.module.css';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterEngine, setFilterEngine] = useState<string>('all');
  const [filterTriage, setFilterTriage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [opsToken, setOpsToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const data = await collectFeedback();
      if (mounted) {
        setFeedback(data);
        setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Section>
          <p>Carregando feedback...</p>
        </Section>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className={styles.container}>
        <Section>
          <p>Erro ao carregar feedback.</p>
        </Section>
      </div>
    );
  }

  const sourceLabel =
    feedback.source === 'supabase'
      ? '🟡 remoto (Supabase)'
      : feedback.source === 'hybrid'
        ? '🔵 híbrido (local + remoto)'
        : '🟢 local (localStorage)';

  // Filtrar comentários
  const filteredComments = feedback.recentComments.filter((comment) => {
    if (filterGame !== 'all' && comment.gameSlug !== filterGame) return false;
    if (filterRating !== 'all' && comment.rating !== filterRating) return false;
    if (filterEngine !== 'all' && comment.engineKind !== filterEngine) return false;
    if (filterTriage !== 'all' && comment.triageStatus !== filterTriage) return false;
    return true;
  });

  // Ordenar comentários
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'prioritario-first') {
      // Prioritário > Pendente > Reviewed
      const priority = { prioritario: 0, pending: 1, reviewed: 2 };
      return priority[a.triageStatus] - priority[b.triageStatus];
    } else if (sortBy === 'pending-first') {
      // Pendente/Prioritário > Reviewed
      const priority = { pending: 0, prioritario: 0, reviewed: 1 };
      return priority[a.triageStatus] - priority[b.triageStatus];
    } else if (sortBy === 'negative-first') {
      const ratingOrder = { negative: 0, neutral: 1, positive: 2 };
      return ratingOrder[a.rating] - ratingOrder[b.rating];
    }
    return 0;
  });

  const positiveRate = feedback.total > 0 
    ? Math.round((feedback.positive / feedback.total) * 100) 
    : 0;

  const pendingCount = feedback.recentComments.filter((item) => item.triageStatus === 'pending').length;
  const prioritarioCount = feedback.recentComments.filter((item) => item.triageStatus === 'prioritario').length;
  const actionNeededCount = pendingCount + prioritarioCount;

  const engineOptions = Array.from(new Set(feedback.recentComments.map((item) => item.engineKind))).sort();

  async function handleTriageChange(id: string, newStatus: 'pending' | 'reviewed' | 'prioritario') {
    setBusyId(id);
    
    // Tentar rota protegida se token fornecido
    if (opsToken) {
      try {
        const response = await fetch('/api/ops/feedback/triage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-ops-token': opsToken,
          },
          body: JSON.stringify({
            feedbackId: id,
            status: newStatus,
          }),
        });

        if (response.ok) {
          // Sucesso via rota protegida
          const reloaded = await collectFeedback();
          setFeedback(reloaded);
          setBusyId(null);
          return;
        } else if (response.status === 401) {
          alert('❌ Token de operação inválido');
          setBusyId(null);
          return;
        }
        // Falhar graciosamente para fallback
      } catch (err) {
        console.error('Ops API falhou, usando fallback:', err);
      }
    }

    // Fallback: mutação client-side direto (Tijolo 13 compatível)
    await markFeedbackTriage(id, newStatus);
    const reloaded = await collectFeedback();
    setFeedback(reloaded);
    setBusyId(null);
  }

  return (
    <div className={styles.container}>
      <Section>
        <div className={styles.header}>
          <h1>Feedback Qualitativo</h1>
          <p className={styles.subtitle}>
            Leitura organizada das reações e comentários dos usuários.
          </p>
          <div className={styles.sourceBadge}>{sourceLabel}</div>
        </div>

        {/* Overview */}
        <div className={styles.grid}>
          <Card className={styles.card}>
            <h3>Total de Feedbacks</h3>
            <p className={styles.largeNumber}>{feedback.total}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Positivos</h3>
            <p className={styles.largeNumber}>
              {feedback.positive} <span style={{ fontSize: '1rem' }}>😊</span>
            </p>
          </Card>

          <Card className={styles.card}>
            <h3>Neutros</h3>
            <p className={styles.largeNumber}>
              {feedback.neutral} <span style={{ fontSize: '1rem' }}>😐</span>
            </p>
          </Card>

          <Card className={styles.card}>
            <h3>Negativos</h3>
            <p className={styles.largeNumber}>
              {feedback.negative} <span style={{ fontSize: '1rem' }}>🙁</span>
            {/* Ops Token Optional Input */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                style={{
                  fontSize: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showTokenInput ? '❌ Cancelar operação protegida' : '🔐 Usar operação protegida (com auditoria)'}
              </button>
              {showTokenInput && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="password"
                    placeholder="Cole token OPS_ADMIN_TOKEN aqui"
                    value={opsToken}
                    onChange={(e) => setOpsToken(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                    }}
                  />
                  <button
                    onClick={() => setOpsToken('')}
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    ✨ Limpar
                  </button>
                </div>
              )}
              {opsToken && (
                <p style={{ fontSize: '0.7rem', color: 'var(--color-success, #2c9643)', margin: '0.3rem 0 0 0' }}>
                  ✅ Token detectado - triagem usa auditoria operacional
                </p>
              )}
            </div>
            </p>
          </Card>

          <Card className={styles.card}>
            <h3>Com Comentários</h3>
            <p className={styles.largeNumber}>{feedback.withComments}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Taxa Positiva</h3>
            <p className={styles.largeNumber}>{positiveRate}%</p>
          </Card>
        </div>

        {/* Resumo de Ação Necessária */}
        {actionNeededCount > 0 && (
          <Card className={styles.fullCard}>
            <h3>🚨 Ação Necessária</h3>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{prioritarioCount}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Prioritários</p>
              </div>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{pendingCount}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Pendentes</p>
              </div>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-warning, #d97b22)' }}>
                  {actionNeededCount}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Total para Triagem</p>
              </div>
            </div>
          </Card>
        )}

        {/* Por Jogo */}
        <Card className={styles.fullCard}>
          <h3>Feedback por Jogo</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>😊</th>
                  <th>😐</th>
                  <th>🙁</th>
                  <th>Com Comentário</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(feedback.byGame)
                  .sort(([, a], [, b]) => (b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative))
                  .map(([slug, data]) => {
                    const game = games.find((g) => g.slug === slug);
                    const total = data.positive + data.neutral + data.negative;
                    return (
                      <tr key={slug}>
                        <td className={styles.gameTitle}>{game?.title || slug}</td>
                        <td className={styles.numeric}>{data.positive}</td>
                        <td className={styles.numeric}>{data.neutral}</td>
                        <td className={styles.numeric}>{data.negative}</td>
                        <td className={styles.numeric}>{data.withComments}</td>
                        <td className={styles.numeric}><strong>{total}</strong></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Comentários Recentes */}
        <Card className={styles.fullCard}>
          <h3>Comentários Recentes</h3>
          
          {/* Filtros */}
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: 'var(--text-secondary)' }}>
                Jogo:
              </label>
              <select
                value={filterGame}
                onChange={(e) => setFilterGame(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">Todos</option>
                {games.map((game) => (
                  <option key={game.slug} value={game.slug}>
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: 'var(--text-secondary)' }}>
                Avaliação:
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">Todas</option>
                <option value="positive">😊 Positivo</option>
                <option value="neutral">😐 Neutro</option>
                <option value="negative">🙁 Negativo</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: 'var(--text-secondary)' }}>
                Engine:
              </label>
              <select
                value={filterEngine}
                onChange={(e) => setFilterEngine(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">Todas</option>
                {engineOptions.map((engine) => (
                  <option key={engine} value={engine}>
                    {engine}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: 'var(--text-secondary)' }}>
                Triagem:
              </label>
              <select
                value={filterTriage}
                onChange={(e) => setFilterTriage(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">Todos</option>
                <option value="prioritario">🔴 Prioritário</option>
                <option value="pending">⚠️ Pendente</option>
                <option value="reviewed">✅ Lido</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: 'var(--text-secondary)' }}>
                Ordenar:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="recent">Mais Recentes</option>
                <option value="prioritario-first">Prioritários Primeiro</option>
                <option value="pending-first">Pendentes Primeiro</option>
                <option value="negative-first">Negativos Primeiro</option>
              </select>
            </div>
          </div>

          {filteredComments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              Nenhum comentário encontrado com os filtros aplicados.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedComments.map((comment) => {
                const game = games.find((g) => g.slug === comment.gameSlug);
                const ratingEmoji = 
                  comment.rating === 'positive' ? '😊' :
                  comment.rating === 'neutral' ? '😐' : '🙁';

                const statusConfig = {
                  prioritario: { emoji: '🔴', label: 'Prioritário', bg: 'var(--color-alert-soft, #fde8e9)', border: 'var(--color-alert, #c1272d)' },
                  pending: { emoji: '⚠️', label: 'Pendente', bg: 'var(--bg-tertiary, #efefef)', border: 'var(--color-warning, #d97b22)' },
                  reviewed: { emoji: '✅', label: 'Lido', bg: 'var(--color-success-soft, #e8f4ec)', border: 'var(--color-success, #2c9643)' },
                };

                const status = statusConfig[comment.triageStatus];

                return (
                  <div
                    key={comment.id}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-secondary, #f9f9f9)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${status.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {ratingEmoji} {game?.title || comment.gameSlug}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(comment.createdAt).toLocaleString('pt-BR')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: status.bg,
                            color: 'var(--text-secondary)',
                            borderRadius: '999px',
                            padding: '0.15rem 0.5rem',
                          }}
                        >
                          {status.emoji} {status.label}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Engine: {comment.engineKind} • Fonte: {comment.source}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {comment.comment}
                    </p>
                    <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <select
                        onChange={(e) => handleTriageChange(comment.id, e.target.value as any)}
                        disabled={busyId === comment.id}
                        value={comment.triageStatus}
                        style={{
                          border: '1px solid var(--border-color)',
                          background: 'white',
                          color: 'var(--text-primary)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.75rem',
                          cursor: busyId === comment.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="prioritario">🔴 Prioritário</option>
                        <option value="pending">⚠️ Pendente</option>
                        <option value="reviewed">✅ Lido</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className={styles.actions}>
          <Link href="/estado">
            <Button variant="secondary">← Voltar para Métricas</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Ir ao Hub</Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
