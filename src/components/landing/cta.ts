/**
 * Canonical calls to action.
 *
 * The landing page previously used four different labels for the same
 * destination — "Simula il tuo portafoglio", "Apri il simulatore",
 * "Inizia dalla simulazione", "Prova simulazione". Repeating one label for one
 * action is what makes it recognisable by the third time a visitor scrolls
 * past it, so the labels live here and every section imports them.
 *
 * Add a new destination here rather than typing a label inline.
 */
export const CTA = {
  simulator: { href: '/simulator', label: 'Apri il simulatore' },
  catalogue: { href: '/catalogue', label: 'Esplora il catalogo' },
  profile: { href: '/questionnaire', label: 'Definisci il profilo' },
} as const;

/** Reassurance line shown under the primary action. */
export const CTA_REASSURANCE = 'Gratuito · nessuna registrazione · nessun dato raccolto';
