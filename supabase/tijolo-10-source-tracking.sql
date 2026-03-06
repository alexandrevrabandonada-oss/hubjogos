-- Migração para Tijolo 10: Atribuição de Origem
-- Adiciona campos de UTM e Referrer à tabela game_sessions

ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS utm_content text,
ADD COLUMN IF NOT EXISTS referrer text,
ADD COLUMN IF NOT EXISTS initial_path text;

COMMENT ON COLUMN game_sessions.utm_source IS 'Origem do tráfego (UTM)';
COMMENT ON COLUMN game_sessions.utm_medium IS 'Meio do tráfego (UTM)';
COMMENT ON COLUMN game_sessions.utm_campaign IS 'Campanha do tráfego (UTM)';
COMMENT ON COLUMN game_sessions.utm_content IS 'Conteúdo do tráfego (UTM)';
COMMENT ON COLUMN game_sessions.referrer IS 'Referrer externo capturado na primeira carga';
COMMENT ON COLUMN game_sessions.initial_path IS 'Pathname inicial da página de entrada';

-- Índices para análise de funil por origem
CREATE INDEX IF NOT EXISTS idx_game_sessions_utm_source ON game_sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_game_sessions_referrer ON game_sessions(referrer);
