/**
 * Analytics Source Tracking
 * Utilitários para captura de UTMs e Referrer
 */

export interface SourceData {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    referrer?: string | null;
    initialPath?: string | null;
}

/**
 * Captura dados de origem da URL e do document.referrer
 */
export function captureSourceData(): SourceData {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    const initialPath = window.location.pathname;

    // Só capturamos o referrer se não for do próprio domínio (ex: navegação interna)
    const isExternalReferrer = referrer && !referrer.includes(window.location.hostname);

    return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
        referrer: isExternalReferrer ? referrer : null,
        initialPath,
    };
}

/**
 * Verifica se existem dados de UTM nos parâmetros
 */
export function hasUtmParams(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return !!(
        params.get('utm_source') ||
        params.get('utm_medium') ||
        params.get('utm_campaign')
    );
}
