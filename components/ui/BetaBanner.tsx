/**
 * BetaBanner - Comunicado de fase de construção pública
 */

import { ShellContainer } from './ShellContainer';
import styles from './BetaBanner.module.css';

export function BetaBanner() {
    return (
        <div className={styles.banner}>
            <ShellContainer className={styles.container}>
                <div className={styles.content}>
                    <span className={styles.eyebrow}>CONSTRUÇÃO PÚBLICA</span>
                    <h2>O Hub está em fase Beta</h2>
                    <p>
                        Este é um experimento vivo. Estamos transformando pautas reais da cidade
                        em mecânicas jogáveis para imaginar saídas coletivas. Sua participação
                        ajuda a refinar estas lentes políticas.
                    </p>
                    <div className={styles.actions}>
                        <a href="mailto:contato@hubjogos.org" className={styles.cta}>
                            Enviar feedback →
                        </a>
                    </div>
                </div>
            </ShellContainer>
        </div>
    );
}
