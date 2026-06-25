/**
 * Extrait les @mentions (pseudo_uniq) d'un texte, en minuscules, sans le "@" ni doublons.
 * Entrée : content (string)
 * Sortie : handles (array de string)
 */
function extractMentions(content) {
    if (!content) return [];
    const matches = content.match(/@([\p{L}\p{N}_]+)/gu) || [];
    return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

module.exports = { extractMentions };
