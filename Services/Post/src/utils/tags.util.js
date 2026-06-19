// Extrait les hashtags d'un texte pour préparer la recherche.
// Exemple : "J'adore le #JS et le #Café !" -> ["js", "café"]
// On stocke en minuscules, sans le "#" et sans doublons.
function extractTags(content) {
    if (!content) return [];
    // #suivi de lettres/chiffres/_ (unicode : \p{L} gère les accents comme "é")
    const matches = content.match(/#([\p{L}\p{N}_]+)/gu) || [];
    const tags = matches.map((tag) => tag.slice(1).toLowerCase());
    return [...new Set(tags)];
}

module.exports = { extractTags };
