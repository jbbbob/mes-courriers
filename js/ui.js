// =====================
// FONCTIONS UI (Modal, Recap, Theme)
// =====================

// Afficher le récapitulatif
function showRecap() {
    const panel = document.getElementById('recap-panel');
    panel.classList.remove('hidden');
}

// Cacher le récapitulatif
function hideRecap() {
    const panel = document.getElementById('recap-panel');
    panel.classList.add('hidden');
    recapChoix = {};
    document.getElementById('recap-content').innerHTML = '';
}

// Mettre à jour le récap
function updateRecap(label, value) {
    recapChoix[label] = value;
    renderRecap();
}

// Afficher le récap
function renderRecap() {
    const content = document.getElementById('recap-content');
    let html = '';
    for (const [label, value] of Object.entries(recapChoix)) {
        html += `
            <div class="recap-item" data-step="${label}" title="Cliquer pour recommencer">
                <span class="recap-label">${label}</span>
                <span class="recap-value">${value}</span>
            </div>
        `;
    }
    content.innerHTML = html;
    showRecap();

    // Ajouter les événements clic sur les items du récap pour recommencer
    content.querySelectorAll('.recap-item').forEach(item => {
        item.addEventListener('click', () => {
            restartWorkflow();
        });
    });
}

// Recommencer le workflow actuel depuis le début
function restartWorkflow() {
    // Nettoyer les handlers RÉEXÉCUTION
    cleanupReexecution();

    // Fermer le modal s'il est ouvert
    document.getElementById('modal').classList.add('hidden');

    // Réinitialiser le récap
    recapChoix = {};
    document.getElementById('recap-content').innerHTML = '';

    // Réafficher le bouton créer commentaire
    document.getElementById('copy-comment-btn').style.display = '';

    // Cacher le texte du commentaire
    const commentText = document.getElementById('comment-text');
    commentText.classList.add('hidden');
    commentText.innerHTML = '';

    // Relancer le workflow selon la catégorie
    if (currentData && currentData.commentaire) {
        const commentaire = currentData.commentaire;

        if (typeof commentaire === 'object' && commentaire.type === 'cascade') {
            startAnvToutEnUn(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'reexecution') {
            startReexecution();
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_complet') {
            startDelaiComplet(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_dca') {
            startDelaiDca(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_co') {
            startDelaiCo(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_soumission') {
            startDelaiSoumission();
        }
    }
}

// Annuler et fermer tout
function cancelAll() {
    document.getElementById('modal').classList.add('hidden');
    hideRecap();
    // Réafficher le bouton créer commentaire
    document.getElementById('copy-comment-btn').style.display = '';
}

// Modal pour les questions
function showModal(title, content, onConfirm, hideActions = false) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;

    // Ajouter le bouton Annuler en bas du contenu si hideActions
    let finalContent = content;
    if (hideActions) {
        finalContent += `<button type="button" class="cancel-all-btn" id="cancel-all-btn">✕ Annuler</button>`;
    }
    document.getElementById('modal-body').innerHTML = finalContent;
    modal.classList.remove('hidden');

    const actions = document.querySelector('.modal-actions');
    if (hideActions) {
        actions.classList.add('hidden');
        // Ajouter l'événement sur le bouton Annuler
        setTimeout(() => {
            document.getElementById('cancel-all-btn')?.addEventListener('click', cancelAll);
        }, 10);
    } else {
        actions.classList.remove('hidden');
        document.getElementById('modal-confirm').onclick = () => {
            modal.classList.add('hidden');
            if (onConfirm) onConfirm();
        };
    }

    document.getElementById('modal-cancel').onclick = () => {
        cancelAll();
    };
}

// Initialiser le thème
function initTheme() {
    const themeToggle = document.getElementById('toggle-theme');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Initialiser le mode admin
function initAdminToggle() {
    document.getElementById('toggle-admin').addEventListener('click', () => {
        adminMode = !adminMode;
        document.body.classList.toggle('admin-mode', adminMode);
        document.getElementById('toggle-admin').textContent = adminMode ? 'MODE NORMAL' : 'MODE ADMIN';

        // Afficher/cacher les éléments admin
        document.querySelectorAll('.admin-actions, .edit-btn, .delete-btn').forEach(el => {
            el.classList.toggle('hidden', !adminMode);
        });

        renderCategories();
    });
}
