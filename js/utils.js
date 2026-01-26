// =====================
// FONCTIONS UTILITAIRES
// =====================

// Échapper les caractères HTML (évite que < soit interprété comme balise)
function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Copier du texte dans le presse-papiers
function copyToClipboard(text, feedbackId) {
    navigator.clipboard.writeText(text).then(() => {
        showFeedback(feedbackId);
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showFeedback(feedbackId);
    });
}

// Afficher le feedback "Copié !"
function showFeedback(feedbackId) {
    const feedback = document.getElementById(feedbackId);
    feedback.textContent = 'Copié !';
    setTimeout(() => {
        feedback.textContent = '';
    }, 2000);
}

// Copier le texte résultat (utilisé par onclick dans le HTML)
function copyResultText(type) {
    const texte = window.resultTextes[type];
    if (!texte) return;

    navigator.clipboard.writeText(texte).then(() => {
        const feedback = document.getElementById(`feedback-${type}`);
        if (feedback) {
            feedback.textContent = 'Copié !';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        }
    });
}
