/**
 * Calcule les paramètres de pagination (limite bornée et offset) à partir de la requête.
 * Entrée : query (object) { page, limit }, defaultLimit (number), maxLimit (number)
 * Sortie : result (object) { safeLimit (number), skip (number) }
 */
function parsePage({ page, limit } = {}, defaultLimit, maxLimit) {
    const safeLimit = Math.min(Number(limit) || defaultLimit, maxLimit);
    const safePage = Math.max(Number(page) || 1, 1);
    return { safeLimit, skip: (safePage - 1) * safeLimit };
}

/**
 * Tranche un tableau récupéré avec `limit + 1` pour détecter s'il y a une page suivante.
 * Entrée : rows (array), safeLimit (number)
 * Sortie : result (object) { items (array), hasMore (boolean) }
 */
function slicePage(rows, safeLimit) {
    const hasMore = rows.length > safeLimit;
    return { items: hasMore ? rows.slice(0, safeLimit) : rows, hasMore };
}

module.exports = { parsePage, slicePage };
