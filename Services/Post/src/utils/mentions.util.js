// Extrait les @mentions (pseudo_uniq) d'un texte.
// Exemple : "Salut @leo et @bob_ !" -> ["leo", "bob_"]
// On normalise en minuscules, sans le "@" et sans doublons.
function extractMentions(content) {
    if (!content) return [];
    // @ suivi de lettres/chiffres/_ (unicode : \p{L} gère les accents).
    const matches = content.match(/@([\p{L}\p{N}_]+)/gu) || [];
    return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

module.exports = { extractMentions };
