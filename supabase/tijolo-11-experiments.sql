-- Migração para Tijolo 11: Sistema de Experimentos
-- Adiciona suporte para rastreamento de variantes A/B

-- Adiciona coluna JSONB para armazenar experimentos resolvidos na sessão
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS experiments jsonb;

COMMENT ON COLUMN game_sessions.experiments IS 'Array de experimentos resolvidos: [{"key": "exp-key", "variant": "variant-key"}]';

-- Adiciona coluna JSONB na tabela de eventos (se existir)
-- Para rastreamento de experimentos por evento individual
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'game_events') THEN
    ALTER TABLE game_events ADD COLUMN IF NOT EXISTS experiments jsonb;
    COMMENT ON COLUMN game_events.experiments IS 'Array de experimentos ativos durante este evento';
  END IF;
END $$;

-- Índice para consultas por experimento específico
CREATE INDEX IF NOT EXISTS idx_game_sessions_experiments 
ON game_sessions USING gin(experiments);

-- View helper para análise de experimentos
CREATE OR REPLACE VIEW experiment_performance AS
SELECT 
  jsonb_array_elements(experiments)->>'key' as experiment_key,
  jsonb_array_elements(experiments)->>'variant' as variant_key,
  COUNT(*) as sessions_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 
    2
  ) as completion_rate
FROM game_sessions
WHERE experiments IS NOT NULL
GROUP BY experiment_key, variant_key
ORDER BY experiment_key, variant_key;

COMMENT ON VIEW experiment_performance IS 'Agregação de performance por experimento e variante';
