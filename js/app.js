// =====================
// POINT D'ENTRÉE - INITIALISATION ET ÉVÉNEMENTS GLOBAUX
// =====================

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le thème
    initTheme();

    // Initialiser le toggle admin
    initAdminToggle();

    // Initialiser les événements admin
    initAdminEvents();

    // Initialiser les événements de copie
    initCopyEvents();

    // Initialiser les événements clavier globaux
    initKeyboardEvents();

    // Afficher les catégories
    renderCategories();
});

// Événements de copie
function initCopyEvents() {
    // Copier le texte du courrier
    document.getElementById('copy-btn').addEventListener('click', () => {
        if (!currentData) return;

        let texte = '';
        if (typeof currentData.texte === 'object') {
            texte = currentData.texte.exemple || currentData.texte.siNon || '';
        } else {
            texte = currentData.texte || '';
        }

        copyToClipboard(texte, 'copy-feedback');
    });

    // Créer le commentaire
    document.getElementById('copy-comment-btn').addEventListener('click', () => {
        if (!currentData || !currentData.commentaire) return;

        const commentaire = currentData.commentaire;

        // Cas commentaire simple
        if (typeof commentaire === 'string') {
            const commentText = document.getElementById('comment-text');
            commentText.textContent = commentaire;
            commentText.classList.remove('hidden');
            document.getElementById('comment-header').classList.remove('hidden');
            copyToClipboard(commentaire, 'copy-comment-feedback');
            return;
        }

        // Cas type = choix simple
        if (commentaire.type === 'choix') {
            // Créer des boutons pour chaque choix
            let buttonsHTML = commentaire.boutons.map((b, i) =>
                `<button type="button" class="choice-btn" data-index="${i}">${b.label}</button>`
            ).join('');

            showModal(commentaire.question, `<div class="choice-buttons">${buttonsHTML}</div>`, null, true);

            setTimeout(() => {
                document.querySelectorAll('.choice-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const index = parseInt(btn.dataset.index);
                        const choix = commentaire.boutons[index];

                        document.getElementById('modal').classList.add('hidden');

                        const commentText = document.getElementById('comment-text');
                        commentText.textContent = choix.texte;
                        commentText.classList.remove('hidden');
                        document.getElementById('comment-header').classList.remove('hidden');
                        copyToClipboard(choix.texte, 'copy-comment-feedback');
                    });
                });
            }, 10);
            return;
        }

        // Cas RÉEXÉCUTION
        if (commentaire.type === 'reexecution') {
            startReexecution();
            return;
        }

        // Cas DÉLAI COMPLET
        if (commentaire.type === 'delai_complet') {
            startDelaiComplet(commentaire);
            return;
        }

        // Cas DÉLAI DCA
        if (commentaire.type === 'delai_dca') {
            startDelaiDca(commentaire);
            return;
        }

        // Cas DÉLAI CO
        if (commentaire.type === 'delai_co') {
            startDelaiCo(commentaire);
            return;
        }

        // Cas DÉLAI SOUMISSION
        if (commentaire.type === 'delai_soumission') {
            startDelaiSoumission();
            return;
        }

        // Cas ANV (type cascade)
        if (commentaire.type === 'cascade') {
            startAnvToutEnUn(commentaire);
            return;
        }
    });
}

// Événements clavier globaux
function initKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
        // Fermer modal avec Escape
        if (e.key === 'Escape') {
            document.getElementById('modal').classList.add('hidden');
        }

        // Valider modal avec Enter
        if (e.key === 'Enter' && !document.getElementById('modal').classList.contains('hidden')) {
            const textarea = document.activeElement;
            if (textarea.tagName !== 'TEXTAREA') {
                document.getElementById('modal-confirm').click();
            }
        }
    });
}
