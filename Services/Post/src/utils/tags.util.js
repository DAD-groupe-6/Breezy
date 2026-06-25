/**
 * Extrait les hashtags d'un texte, en minuscules, sans le "#" ni doublons.
 * Entrée : content (string)
 * Sortie : tags (array de string)
 */
function extractTags(content) {
    if (!content) return [];
    const matches = content.match(/#([\p{L}\p{N}_]+)/gu) || [];
    const tags = matches.map((tag) => tag.slice(1).toLowerCase());
    return [...new Set(tags)];
}

module.exports = { extractTags };
