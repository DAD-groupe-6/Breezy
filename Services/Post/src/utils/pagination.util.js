/**
 * Calcule les paramètres de pagination à partir de la requête entrante.
 * @returns {{ safeLimit: number, skip: number }}
 */
function parsePage({ page, limit } = {}, defaultLimit, maxLimit) {
    const safeLimit = Math.min(Number(limit) || defaultLimit, maxLimit);
    const safePage = Math.max(Number(page) || 1, 1);
    return { safeLimit, skip: (safePage - 1) * safeLimit };
}

/**
 * Tranche un tableau récupéré avec `limit + 1` pour détecter s'il y a une page suivante.
 * @returns {{ items: T[], hasMore: boolean }}
 */
function slicePage(rows, safeLimit) {
    const hasMore = rows.length > safeLimit;
    return { items: hasMore ? rows.slice(0, safeLimit) : rows, hasMore };
}

module.exports = { parsePage, slicePage };
