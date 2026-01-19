let currentData = null;
let currentCategory = null;
let currentSubcat = null;
let adminMode = false;

// Récapitulatif des choix
let recapChoix = {};

function showRecap() {
    const panel = document.getElementById('recap-panel');
    panel.classList.remove('hidden');
}

function hideRecap() {
    const panel = document.getElementById('recap-panel');
    panel.classList.add('hidden');
    recapChoix = {};
    document.getElementById('recap-content').innerHTML = '';
}

function updateRecap(label, value) {
    recapChoix[label] = value;
    renderRecap();
}

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

// Thème sombre/clair
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

// Toggle mode admin
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

// Génération des catégories
function renderCategories() {
    const container = document.getElementById('categories');
    container.innerHTML = '';

    Object.keys(courriers).forEach(category => {
        const wrapper = document.createElement('div');
        wrapper.className = 'category-wrapper';

        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => selectCategory(category, btn);
        wrapper.appendChild(btn);

        if (adminMode) {
            const actions = document.createElement('div');
            actions.className = 'inline-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'mini-btn edit';
            editBtn.textContent = '✎';
            editBtn.onclick = (e) => { e.stopPropagation(); renameCategory(category); };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'mini-btn delete';
            deleteBtn.textContent = '✕';
            deleteBtn.onclick = (e) => { e.stopPropagation(); deleteCategory(category); };

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            wrapper.appendChild(actions);
        }

        container.appendChild(wrapper);
    });
}

// Sélection d'une catégorie
function selectCategory(category, btn) {
    currentCategory = category;
    currentSubcat = null;

    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const subContainer = document.getElementById('subcategories');
    subContainer.innerHTML = '';

    const subcats = Object.keys(courriers[category]);

    // Si une seule sous-catégorie avec le même nom que la catégorie, sélectionner directement
    if (subcats.length === 1 && subcats[0] === category) {
        subContainer.innerHTML = '';
        document.getElementById('admin-subcat-actions').classList.add('hidden');
        selectSubcategory(category, category, null);
        return;
    }

    subcats.forEach(subcat => {
        const wrapper = document.createElement('div');
        wrapper.className = 'subcat-wrapper';

        const subBtn = document.createElement('button');
        subBtn.className = 'subcategory-btn';
        subBtn.textContent = subcat;
        subBtn.onclick = () => selectSubcategory(category, subcat, subBtn);
        wrapper.appendChild(subBtn);

        if (adminMode) {
            const actions = document.createElement('div');
            actions.className = 'inline-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'mini-btn edit';
            editBtn.textContent = '✎';
            editBtn.onclick = (e) => { e.stopPropagation(); renameSubcategory(category, subcat); };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'mini-btn delete';
            deleteBtn.textContent = '✕';
            deleteBtn.onclick = (e) => { e.stopPropagation(); deleteSubcategory(category, subcat); };

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            wrapper.appendChild(actions);
        }

        subContainer.appendChild(wrapper);
    });

    // Bouton ajouter sous-catégorie
    const adminActions = document.getElementById('admin-subcat-actions');
    if (adminMode) {
        adminActions.innerHTML = `<button onclick="addSubcategory('${category}')" class="admin-btn add-btn">+ Nouvelle sous-catégorie</button>`;
        adminActions.classList.remove('hidden');
    }

    document.getElementById('template-display').classList.add('hidden');
}

// Sélection d'une sous-catégorie
function selectSubcategory(category, subcat, btn) {
    // Nettoyer les handlers RÉEXÉCUTION avant de changer de sous-catégorie
    cleanupReexecution();

    currentCategory = category;
    currentSubcat = subcat;
    hideRecap();

    document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const display = document.getElementById('template-display');
    display.classList.remove('hidden');

    currentData = courriers[category][subcat];

    // Titre : utiliser displayTitle si défini, sinon ne pas afficher si category == subcat
    if (currentData.displayTitle) {
        document.getElementById('template-title').textContent = currentData.displayTitle;
    } else if (category === subcat) {
        document.getElementById('template-title').textContent = '';
    } else {
        document.getElementById('template-title').textContent = `${category} - ${subcat}`;
    }

    // Affichage du texte
    const texteSection = document.getElementById('texte-section');
    if (!currentData.texte) {
        texteSection.classList.add('hidden');
    } else {
        texteSection.classList.remove('hidden');
        if (typeof currentData.texte === 'object') {
            document.getElementById('template-text').textContent = currentData.texte.exemple || currentData.texte.siNon || '';
        } else {
            document.getElementById('template-text').textContent = currentData.texte;
        }
    }

    // Gestion du commentaire
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');
    const commentText = document.getElementById('comment-text');

    if (currentData.commentaire) {
        commentSection.classList.remove('hidden');
        // Cacher le titre et le bloc jaune par défaut - ne montrer que le bouton
        commentHeader.classList.add('hidden');
        commentText.classList.add('hidden');
        commentText.innerHTML = '';
    } else {
        commentSection.classList.add('hidden');
    }

    // Afficher boutons edit si admin
    document.getElementById('edit-texte-btn').classList.toggle('hidden', !adminMode);
    document.getElementById('edit-comment-btn').classList.toggle('hidden', !adminMode);

    document.getElementById('copy-feedback').textContent = '';
    document.getElementById('copy-comment-feedback').textContent = '';

    // Réafficher le bouton Copier le commentaire (au cas où il était caché par ANV SUSPEN)
    document.getElementById('copy-comment-btn').style.display = '';

    // Changer le texte du bouton selon la catégorie
    const copyCommentBtn = document.getElementById('copy-comment-btn');
    if (category === 'ANV') {
        copyCommentBtn.textContent = 'CRÉER LE(S) COMMENTAIRE(S)';
    } else if (category === 'DÉLAI' || category === 'RÉEXÉCUTION') {
        copyCommentBtn.textContent = 'CRÉER LE(S) COURRIER(S) ET LE(S) COMMENTAIRE(S)';
    } else {
        copyCommentBtn.textContent = 'CRÉER LE COMMENTAIRE';
    }

    // Afficher automatiquement l'interface tout-en-un pour DÉLAI, ANV et RÉEXÉCUTION
    if (currentData && currentData.commentaire) {
        const commentaire = currentData.commentaire;
        if (typeof commentaire === 'object' && commentaire.type === 'delai_complet') {
            // Afficher directement l'interface tout-en-un pour DÉLAI
            startDelaiComplet(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_dca') {
            // Afficher directement l'interface tout-en-un pour DÉLAI DCA
            startDelaiDca(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_co') {
            // Afficher directement l'interface tout-en-un pour DÉLAI CO
            startDelaiCo(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'cascade' && category === 'ANV') {
            // Afficher directement l'interface tout-en-un pour ANV
            startAnvToutEnUn(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'reexecution') {
            // Afficher directement l'interface tout-en-un pour RÉEXÉCUTION
            startReexecution();
        }
    }
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

// Copier le texte avec variables
document.getElementById('copy-btn').addEventListener('click', () => {
    if (!currentData) return;

    const texteData = currentData.texte;

    // Texte conditionnel avec variables
    if (typeof texteData === 'object' && texteData.type === 'conditionnel') {
        // Étape 1 : demander les variables
        let formHTML = '';
        if (texteData.variables) {
            texteData.variables.forEach(v => {
                formHTML += `
                    <div class="form-group">
                        <label for="var-${v.id}">${v.question}</label>
                        <input type="text" id="var-${v.id}" class="modal-input">
                    </div>
                `;
            });
        }

        showModal('Informations requises', formHTML, () => {
            // Récupérer les valeurs des variables
            const varValues = {};
            if (texteData.variables) {
                texteData.variables.forEach(v => {
                    varValues[v.id] = document.getElementById(`var-${v.id}`).value;
                });
            }

            // Étape 2 : demander la condition
            const formHTML2 = `
                <div class="form-group">
                    <label>${texteData.question}</label>
                    <div class="button-group">
                        <button type="button" class="choice-btn" data-choice="oui">Oui</button>
                        <button type="button" class="choice-btn" data-choice="non">Non</button>
                    </div>
                </div>
            `;

            showModal('Question', formHTML2, null, true);

            setTimeout(() => {
                document.querySelectorAll('.choice-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const choice = btn.dataset.choice;
                        let texte = choice === 'oui' ? texteData.siOui : texteData.siNon;

                        // Remplacer les variables
                        for (const [id, value] of Object.entries(varValues)) {
                            texte = texte.replace(new RegExp(`\\{${id}\\}`, 'g'), value);
                        }

                        document.getElementById('modal').classList.add('hidden');
                        copyToClipboard(texte, 'copy-feedback');
                    });
                });
            }, 50);
        });

        setTimeout(() => {
            const firstInput = document.querySelector('.modal-input');
            if (firstInput) firstInput.focus();
        }, 100);

    // Texte simple avec variables
    } else if (currentData.texteVariables && currentData.texteVariables.length > 0) {
        let formHTML = '';
        currentData.texteVariables.forEach(v => {
            formHTML += `
                <div class="form-group">
                    <label for="var-${v.id}">${v.question}</label>
                    <input type="text" id="var-${v.id}" class="modal-input">
                </div>
            `;
        });

        showModal('Informations requises', formHTML, () => {
            let texte = texteData;
            currentData.texteVariables.forEach(v => {
                const value = document.getElementById(`var-${v.id}`).value;
                texte = texte.replace(`{${v.id}}`, value);
            });
            copyToClipboard(texte, 'copy-feedback');
        });

        setTimeout(() => {
            const firstInput = document.querySelector('.modal-input');
            if (firstInput) firstInput.focus();
        }, 100);

    // Texte simple
    } else {
        copyToClipboard(texteData, 'copy-feedback');
    }
});

// Copier le commentaire
document.getElementById('copy-comment-btn').addEventListener('click', () => {
    if (!currentData || !currentData.commentaire) return;

    const commentaire = currentData.commentaire;

    // Type cascade (ANV tout-en-un)
    if (typeof commentaire === 'object' && commentaire.type === 'cascade') {
        startAnvToutEnUn(commentaire);
    }
    // Type réexécution
    else if (typeof commentaire === 'object' && commentaire.type === 'reexecution') {
        startReexecution();
    }
    // Type delai_complet (A/C ou PL d'abord, puis mois, puis 50k, puis affiche tout)
    else if (typeof commentaire === 'object' && commentaire.type === 'delai_complet') {
        startDelaiComplet(commentaire);
    }
    // Type choix simple
    else if (typeof commentaire === 'object' && commentaire.type === 'choix') {
        let buttonsHTML = '';
        commentaire.boutons.forEach((b, i) => {
            buttonsHTML += `<button type="button" class="choice-btn" data-index="${i}">${b.label}</button>`;
        });

        const formHTML = `
            <div class="form-group">
                <div class="button-group">
                    ${buttonsHTML}
                </div>
            </div>
        `;

        showModal('CHOISIR LE TYPE', formHTML, null, true);

        setTimeout(() => {
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    const texte = commentaire.boutons[index].texte;

                    document.getElementById('modal').classList.add('hidden');
                    copyToClipboard(texte, 'copy-comment-feedback');
                    const commentText = document.getElementById('comment-text');
                    commentText.classList.remove('hidden');
                    commentText.textContent = texte;
                });
            });
        }, 50);
    } else {
        copyToClipboard(commentaire, 'copy-comment-feedback');
        const commentText = document.getElementById('comment-text');
        commentText.classList.remove('hidden');
        commentText.textContent = commentaire;
    }
});

// Fonction copier
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

function showFeedback(feedbackId) {
    const feedback = document.getElementById(feedbackId);
    feedback.textContent = 'Copié !';
    setTimeout(() => {
        feedback.textContent = '';
    }, 2000);
}

// =====================
// FONCTIONS RÉEXÉCUTION - INTERFACE TOUT-EN-UN
// =====================

let reexImages = [];
let reexPasteHandler = null;

// État global pour RÉEXÉCUTION
let reexState = {
    date: '',
    adresse: ''
};

// Navigation clavier RÉEXÉCUTION
let reexFocus = {
    rowIndex: 0,
    btnIndex: 0,
    inResults: false,
    resultIndex: 0
};

function startReexecution() {
    // Réinitialiser l'état
    reexImages = [];
    reexState = { date: '', adresse: '' };
    reexFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

    // Cacher le modal s'il est ouvert
    document.getElementById('modal').classList.add('hidden');

    // Afficher le template-display
    document.getElementById('template-display').classList.remove('hidden');

    // Afficher l'interface tout-en-un
    renderReexToutEnUn();
}

// Rendu de l'interface tout-en-un RÉEXÉCUTION
function renderReexToutEnUn() {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    // Cacher les sections inutiles
    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');
    document.getElementById('copy-comment-btn').style.display = 'none';

    // Cacher le récap
    document.getElementById('recap-panel').classList.add('hidden');

    let html = `<div class="tout-en-un-container" id="tout-en-un-reex">`;
    let rowIndex = 0;

    // Ligne 1: Zone de collage d'images
    const imagesPreview = reexImages.length > 0
        ? reexImages.map((img, i) => `<span class="reex-image-tag">IMG ${i + 1} <button type="button" class="reex-remove-img" data-index="${i}">✕</button></span>`).join('')
        : '<span class="reex-no-img">AUCUNE IMAGE</span>';

    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-label">IMAGES</div>
            <div class="tout-en-un-buttons">
                <div class="reex-paste-zone-inline" id="reex-paste-zone" tabindex="0">CTRL+V POUR COLLER</div>
                <div class="reex-images-tags">${imagesPreview}</div>
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 2: DATE
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-label">DATE PRESCRIPTION</div>
            <div class="tout-en-un-buttons">
                <input type="text" class="tout-en-un-input" id="reex-date-input" value="${reexState.date}" placeholder="Ex: 15/01/2026">
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 3: ADRESSE
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-label">ADRESSE</div>
            <div class="tout-en-un-buttons">
                <textarea class="tout-en-un-textarea" id="reex-adresse-input" rows="3" placeholder="CHEZ JEAN DUPONT&#10;12 RUE DE LA PAIX&#10;75001 PARIS">${reexState.adresse}</textarea>
            </div>
        </div>
    `;
    rowIndex++;

    html += `</div>`;

    // Résultats
    html += getReexResultHTML();

    commentText.innerHTML = html;

    // Setup des événements
    setupReexEvents();
    setupReexKeyboardNav();

    // Appliquer le focus initial
    setTimeout(() => applyReexFocus(), 50);
}

// Générer le HTML des résultats
function getReexResultHTML() {
    const date = reexState.date;
    const adresse = reexState.adresse;

    // Texte HTML formaté pour l'affichage
    const texteTemplateHTML = `<span class="reex-label">Date limite avant prescription :</span> <span class="reex-date">${date || '...'}</span>

<b><u>Transmission de titres exécutoires</u></b>

Cher(s) Maître(s),

Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.

A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.

Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.

<b>Adresse :
${adresse || '...'}</b>
<b><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></b>

Nous vous adressons en pièces jointes :
<span class="reex-indent">-  La contrainte et les actes de procédure</span>
<span class="reex-indent">-  Ficoba</span>

Par ailleurs, vous recevrez <b>dans de brefs délais</b> :
<span class="reex-indent2">◾  Un flux de données comportant :</span>
<span class="reex-indent3">•  Le <b>code EDI: 01010301</b> Transfert de contrainte <i>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</i></span>
<span class="reex-indent3">•  Les données administratives et financières du débiteur</span>

Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <b>code 0102</b> <i>Accusé de réception d'un dossier transféré</i> ainsi que les références du dossier à l'étude.

Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <b>Code EDI 059001</b> <i>Orientation de procédure Demande état avancement dossier Première relance.</i>

Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.`;

    let imagesHTML = '';
    if (reexImages.length > 0) {
        imagesHTML = reexImages.map((img, i) => `
            <div class="reex-image-block" data-index="${i}">
                <img src="${img}" alt="Image ${i + 1}">
                <div class="reex-image-overlay">CLIQUER POUR COPIER</div>
                <span class="reex-image-feedback" id="feedback-img-${i}"></span>
            </div>
        `).join('');
    }

    const commentaireWatt = "Réexécution faite ce jour au CJ compétent";

    return `
        <div class="tout-en-un-result">
            <div class="delai-category-title">TEXTE DU COURRIER</div>
            <div class="delai-comment-block">
                <div class="reex-images-container">
                    ${imagesHTML}
                </div>
                <div class="delai-comment-text">${texteTemplateHTML.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" id="copy-reex-all">COPIER</button>
                <span class="copy-feedback-inline" id="feedback-reex"></span>
            </div>

            <div class="delai-category-title">AFFAIRE WATT - PORTAIL TI / V2</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${commentaireWatt}</div>
                <button type="button" class="copy-btn-small" id="copy-reex-watt">COPIER</button>
                <span class="copy-feedback-inline" id="feedback-reex-watt"></span>
            </div>
        </div>
    `;
}

// Supprimer une image
function removeReexImage(index) {
    reexImages.splice(index, 1);
    renderReexToutEnUn();
}

// Setup des événements RÉEXÉCUTION
function setupReexEvents() {
    // Supprimer l'ancien handler de collage
    if (reexPasteHandler) {
        document.removeEventListener('paste', reexPasteHandler);
    }

    // Handler de collage d'images
    reexPasteHandler = (e) => {
        const container = document.getElementById('tout-en-un-reex');
        if (!container) return;

        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    reexImages.push(event.target.result);
                    renderReexToutEnUn();
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    };
    document.addEventListener('paste', reexPasteHandler);

    // Boutons de suppression d'images
    document.querySelectorAll('.reex-remove-img').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            removeReexImage(index);
        });
    });

    // Input DATE
    const dateInput = document.getElementById('reex-date-input');
    if (dateInput) {
        dateInput.addEventListener('input', (e) => {
            reexState.date = e.target.value;
            updateReexResult();
        });
    }

    // Textarea ADRESSE
    const adresseInput = document.getElementById('reex-adresse-input');
    if (adresseInput) {
        adresseInput.addEventListener('input', (e) => {
            reexState.adresse = e.target.value;
            updateReexResult();
        });
    }

    // Copier les images individuellement au clic
    document.querySelectorAll('.reex-image-block').forEach(block => {
        block.addEventListener('click', async () => {
            const index = parseInt(block.dataset.index);
            const imgSrc = reexImages[index];

            try {
                const response = await fetch(imgSrc);
                const blob = await response.blob();

                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                ]);

                const feedback = document.getElementById(`feedback-img-${index}`);
                feedback.textContent = 'COPIÉ !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            } catch (err) {
                console.error('Erreur copie image:', err);
            }
        });
    });

    // Bouton copier tout
    const copyAllBtn = document.getElementById('copy-reex-all');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => copyReexAll());
    }

    // Bouton copier WATT
    const copyWattBtn = document.getElementById('copy-reex-watt');
    if (copyWattBtn) {
        copyWattBtn.addEventListener('click', () => {
            const commentaireWatt = "Réexécution faite ce jour au CJ compétent";
            navigator.clipboard.writeText(commentaireWatt).then(() => {
                const feedback = document.getElementById('feedback-reex-watt');
                feedback.textContent = 'COPIÉ !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            });
        });
    }
}

// Mettre à jour le résultat en temps réel
function updateReexResult() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (resultContainer) {
        resultContainer.outerHTML = getReexResultHTML();
        // Re-attacher les événements sur les résultats
        setupReexResultEvents();
    }
}

// Attacher les événements sur les résultats uniquement
function setupReexResultEvents() {
    // Copier les images individuellement au clic
    document.querySelectorAll('.reex-image-block').forEach(block => {
        block.addEventListener('click', async () => {
            const index = parseInt(block.dataset.index);
            const imgSrc = reexImages[index];

            try {
                const response = await fetch(imgSrc);
                const blob = await response.blob();

                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                ]);

                const feedback = document.getElementById(`feedback-img-${index}`);
                feedback.textContent = 'COPIÉ !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            } catch (err) {
                console.error('Erreur copie image:', err);
            }
        });
    });

    // Bouton copier tout
    const copyAllBtn = document.getElementById('copy-reex-all');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', () => copyReexAll());
    }

    // Bouton copier WATT
    const copyWattBtn = document.getElementById('copy-reex-watt');
    if (copyWattBtn) {
        copyWattBtn.addEventListener('click', () => {
            const commentaireWatt = "Réexécution faite ce jour au CJ compétent";
            navigator.clipboard.writeText(commentaireWatt).then(() => {
                const feedback = document.getElementById('feedback-reex-watt');
                feedback.textContent = 'COPIÉ !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            });
        });
    }
}

// Copier tout le contenu RÉEXÉCUTION
async function copyReexAll() {
    const date = reexState.date || '';
    const adresse = reexState.adresse || '';

    const texteTemplateBrut = `Date limite avant prescription : ${date}

Transmission de titres exécutoires

Cher(s) Maître(s),

Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.

A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.

Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.

Adresse :
${adresse}
IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE

Nous vous adressons en pièces jointes :
-  La contrainte et les actes de procédure
-  Ficoba

Par ailleurs, vous recevrez dans de brefs délais :
    ◾ Un flux de données comportant :
        • Le code EDI: 01010301 Transfert de contrainte (exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)
        • Les données administratives et financières du débiteur

Vous devrez accuser réception du dossier ainsi créé en retournant un flux EDI contenant le code 0102 Accusé de réception d'un dossier transféré ainsi que les références du dossier à l'étude.

Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : Code EDI 059001 Orientation de procédure Demande état avancement dossier Première relance.

Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.`;

    // Construire le HTML des images
    let imagesHtml = '';
    if (reexImages.length > 0) {
        imagesHtml = reexImages.map(img => `<p><img src="${img}" style="max-width:100%;"></p>`).join('');
    }

    // HTML formaté pour coller dans Word/Outlook
    const htmlFormatted = `
<div style="font-family: Calibri, sans-serif; font-size: 11.5pt;">
${imagesHtml}
<p><b>Date limite avant prescription :</b> <b style="color:#dc2626">${date}</b></p>
<p><b><u>Transmission de titres exécutoires</u></b></p>
<p>Cher(s) Maître(s),</p>
<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>
<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>
<p>Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.</p>
<p><b>Adresse :<br>${adresse.replace(/\n/g, '<br>')}</b></p>
<p><b><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></b></p>
<p>Nous vous adressons en pièces jointes :<br>
- La contrainte et les actes de procédure<br>
- Ficoba</p>
<p>Par ailleurs, vous recevrez <b>dans de brefs délais</b> :</p>
<ul style="margin-left:20px">
<li>Un flux de données comportant :
<ul>
<li>Le <b>code EDI: 01010301</b> Transfert de contrainte <i>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</i></li>
<li>Les données administratives et financières du débiteur</li>
</ul>
</li>
</ul>
<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <b>code 0102</b> <i>Accusé de réception d'un dossier transféré</i> ainsi que les références du dossier à l'étude.</p>
<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <b>Code EDI 059001</b> <i>Orientation de procédure Demande état avancement dossier Première relance.</i></p>
<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>
</div>
`;

    try {
        const blobHtml = new Blob([htmlFormatted], { type: 'text/html' });
        const blobText = new Blob([texteTemplateBrut], { type: 'text/plain' });

        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })
        ]);

        const feedback = document.getElementById('feedback-reex');
        feedback.textContent = 'COPIÉ !';
        setTimeout(() => { feedback.textContent = ''; }, 2000);
    } catch (err) {
        console.error('Erreur copie HTML:', err);
        // Fallback: essayer avec execCommand
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlFormatted;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            const range = document.createRange();
            range.selectNodeContents(tempDiv);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            document.execCommand('copy');
            selection.removeAllRanges();
            document.body.removeChild(tempDiv);

            const feedback = document.getElementById('feedback-reex');
            feedback.textContent = 'COPIÉ !';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        } catch (err2) {
            console.error('Erreur copie fallback:', err2);
            copyToClipboard(texteTemplateBrut, 'feedback-reex');
        }
    }
}

// Appliquer le focus visuel RÉEXÉCUTION
function applyReexFocus() {
    // Retirer tous les focus
    document.querySelectorAll('#tout-en-un-reex .reex-paste-zone-inline, #tout-en-un-reex .tout-en-un-input, #tout-en-un-reex .tout-en-un-textarea').forEach(el => {
        el.classList.remove('focused');
    });

    const container = document.getElementById('tout-en-un-reex');
    if (!container) return;

    const rows = container.querySelectorAll('.tout-en-un-row');
    if (rows.length === 0) return;

    if (reexFocus.rowIndex >= rows.length) {
        reexFocus.rowIndex = rows.length - 1;
    }

    const currentRow = rows[reexFocus.rowIndex];
    if (!currentRow) return;

    currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focuser l'élément interactif de la ligne
    const focusable = currentRow.querySelector('.reex-paste-zone-inline, .tout-en-un-input, .tout-en-un-textarea');
    if (focusable) {
        focusable.classList.add('focused');
        if (focusable.tagName === 'INPUT' || focusable.tagName === 'TEXTAREA') {
            focusable.focus();
        }
    }
}

// Navigation clavier RÉEXÉCUTION
function setupReexKeyboardNav() {
    if (window.reexKeyHandler) {
        document.removeEventListener('keydown', window.reexKeyHandler);
    }

    window.reexKeyHandler = (e) => {
        const container = document.getElementById('tout-en-un-reex');
        if (!container) return;

        // Vérifier si on est dans les résultats
        if (reexFocus.inResults) {
            handleReexResultsNav(e);
            return;
        }

        const rows = container.querySelectorAll('.tout-en-un-row');
        if (rows.length === 0) return;

        // Dans un textarea, permettre les flèches normales sauf pour naviguer entre lignes
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'TEXTAREA') {
            if (e.key === 'ArrowDown' && activeEl.selectionStart === activeEl.value.length) {
                // À la fin du textarea, aller aux résultats
                e.preventDefault();
                scrollToReexResults();
                return;
            }
            if (e.key === 'ArrowUp' && activeEl.selectionStart === 0) {
                // Au début du textarea, aller à la ligne précédente
                e.preventDefault();
                if (reexFocus.rowIndex > 0) {
                    reexFocus.rowIndex--;
                    applyReexFocus();
                }
                return;
            }
            // Sinon, laisser le comportement par défaut du textarea
            return;
        }

        // Dans un input, permettre les flèches gauche/droite
        if (activeEl && activeEl.tagName === 'INPUT' && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (reexFocus.rowIndex < rows.length - 1) {
                reexFocus.rowIndex++;
                applyReexFocus();
            } else {
                scrollToReexResults();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (reexFocus.rowIndex > 0) {
                reexFocus.rowIndex--;
                applyReexFocus();
            }
        }
    };

    document.addEventListener('keydown', window.reexKeyHandler);
}

// Scroll vers les résultats RÉEXÉCUTION
function scrollToReexResults() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (!resultContainer) return;

    reexFocus.inResults = true;
    reexFocus.resultIndex = 0;

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });

    setTimeout(() => applyReexResultsFocus(), 100);
}

// Appliquer le focus sur les résultats RÉEXÉCUTION
function applyReexResultsFocus() {
    // Retirer tous les focus des inputs
    document.querySelectorAll('#tout-en-un-reex .reex-paste-zone-inline, #tout-en-un-reex .tout-en-un-input, #tout-en-un-reex .tout-en-un-textarea').forEach(el => {
        el.classList.remove('focused');
    });

    // Retirer tous les focus des boutons Copier
    document.querySelectorAll('.tout-en-un-result .copy-btn-small').forEach(el => {
        el.classList.remove('focused');
    });

    // Trouver les boutons copier
    const copyButtons = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyButtons.length === 0) return;

    if (reexFocus.resultIndex >= copyButtons.length) {
        reexFocus.resultIndex = copyButtons.length - 1;
    }

    const targetBtn = copyButtons[reexFocus.resultIndex];
    if (targetBtn) {
        targetBtn.classList.add('focused');
        targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Navigation dans les résultats RÉEXÉCUTION
function handleReexResultsNav(e) {
    const copyButtons = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyButtons.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (reexFocus.resultIndex < copyButtons.length - 1) {
            reexFocus.resultIndex++;
            applyReexResultsFocus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (reexFocus.resultIndex > 0) {
            reexFocus.resultIndex--;
            applyReexResultsFocus();
        } else {
            // Revenir aux choix
            reexFocus.inResults = false;
            reexFocus.rowIndex = 2; // Dernière ligne (ADRESSE)
            applyReexFocus();
        }
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (reexFocus.resultIndex > 0) {
            reexFocus.resultIndex--;
            applyReexResultsFocus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetBtn = copyButtons[reexFocus.resultIndex];
        if (targetBtn) {
            targetBtn.click();
        }
    }
}

// Nettoyage des handlers RÉEXÉCUTION
function cleanupReexecution() {
    if (reexPasteHandler) {
        document.removeEventListener('paste', reexPasteHandler);
        reexPasteHandler = null;
    }
    if (window.reexKeyHandler) {
        document.removeEventListener('keydown', window.reexKeyHandler);
        window.reexKeyHandler = null;
    }
}

// =====================
// FONCTIONS DÉLAI COMPLET - INTERFACE TOUT-EN-UN
// =====================

// État global pour l'interface tout-en-un
let toutEnUnState = {
    type: null,      // A/C ou PL
    dca: null,       // Oui ou Non
    mois: '',        // Nombre de mois
    plus50k: null,   // Oui ou Non
    aeti: null       // AE ou TI
};

// Navigation clavier
let toutEnUnFocus = {
    rowIndex: 0,
    btnIndex: 0,
    inResults: false,
    resultIndex: 0
};

function startDelaiComplet(data) {
    // Réinitialiser l'état
    toutEnUnState = {
        type: null,
        dca: null,
        mois: '',
        plus50k: null,
        aeti: null
    };
    toutEnUnFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

    // Cacher le modal s'il est ouvert
    document.getElementById('modal').classList.add('hidden');

    // Afficher le template-display
    document.getElementById('template-display').classList.remove('hidden');

    // Afficher l'interface tout-en-un
    renderDelaiToutEnUn(data);
}

// Fonction pour rendre l'interface tout-en-un DÉLAI
function renderDelaiToutEnUn(data) {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    // Cacher les sections inutiles
    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');
    document.getElementById('copy-comment-btn').style.display = 'none';

    // Cacher le récap
    document.getElementById('recap-panel').classList.add('hidden');

    let html = `<div class="tout-en-un-container" id="tout-en-un-delai">`;
    let rowIndex = 0;

    // Ligne 1: TYPE (A/C ou PL)
    const typeHasSelection = toutEnUnState.type !== null;
    html += `
        <div class="tout-en-un-row ${typeHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">TYPE</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${toutEnUnState.type === 'A/C' ? 'selected' : ''}" data-field="type" data-value="A/C">A/C</button>
                <button type="button" class="tout-en-un-btn ${toutEnUnState.type === 'PL' ? 'selected' : ''}" data-field="type" data-value="PL">PL</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 2: DCA (Oui ou Non) - toujours visible
    const dcaHasSelection = toutEnUnState.dca !== null;
    html += `
        <div class="tout-en-un-row ${dcaHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">DCA/DR À JOUR</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${toutEnUnState.dca === 'non' ? 'selected' : ''}" data-field="dca" data-value="non">Non</button>
                <button type="button" class="tout-en-un-btn ${toutEnUnState.dca === 'oui' ? 'selected' : ''}" data-field="dca" data-value="oui">Oui</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 3: MOIS (input) - toujours visible
    const moisHasSelection = toutEnUnState.mois !== '';
    html += `
        <div class="tout-en-un-row ${moisHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">MOIS</div>
            <div class="tout-en-un-buttons">
                <input type="text" class="tout-en-un-input" id="tout-en-un-mois" value="${toutEnUnState.mois}" placeholder="Nombre de mois">
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 4: +50k OU AE/TI selon DCA
    if (toutEnUnState.dca === 'non') {
        // AE/TI si DCA = Non
        const aetiHasSelection = toutEnUnState.aeti !== null;
        html += `
            <div class="tout-en-un-row ${aetiHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">AE OU TI</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${toutEnUnState.aeti === 'AE' ? 'selected' : ''}" data-field="aeti" data-value="AE">AE</button>
                    <button type="button" class="tout-en-un-btn ${toutEnUnState.aeti === 'TI' ? 'selected' : ''}" data-field="aeti" data-value="TI">TI</button>
                </div>
            </div>
        `;
    } else {
        // +50k si DCA = Oui ou pas encore choisi
        const plus50kHasSelection = toutEnUnState.plus50k !== null;
        html += `
            <div class="tout-en-un-row ${plus50kHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">+ DE 50 000€</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${toutEnUnState.plus50k === 'non' ? 'selected' : ''}" data-field="plus50k" data-value="non">Non</button>
                    <button type="button" class="tout-en-un-btn ${toutEnUnState.plus50k === 'oui' ? 'selected' : ''}" data-field="plus50k" data-value="oui">Oui</button>
                </div>
            </div>
        `;
    }
    rowIndex++;

    html += `</div>`;

    // Résultat en temps réel
    const result = getDelaiResult(data);
    if (result) {
        html += `<div class="tout-en-un-result">${result}</div>`;
    }

    commentText.innerHTML = html;

    // Ajouter les événements
    setupDelaiToutEnUnEvents(data);

    // Appliquer le focus initial
    applyToutEnUnFocus();
}

// Calculer le résultat DÉLAI en temps réel
function getDelaiResult(data) {
    if (!toutEnUnState.type || !toutEnUnState.dca || !toutEnUnState.mois) return null;

    const nbMois = parseInt(toutEnUnState.mois);
    if (isNaN(nbMois)) return null;

    let texteCourrier = null;
    let commentaireTexte = null;

    // Cas > 36 mois
    if (nbMois > 36) {
        texteCourrier = `Vous sollicitez un délai de paiement sur ${toutEnUnState.mois} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.

Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, sous quinze jours, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :
- Copie de votre dernier avis d'imposition ;
- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;
- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;
- Votre demande doit être motivée et justifiée ;
- et tout autre élément que vous jugerez utile.

Dans cette attente, la procédure de recouvrement n'est pas suspendue.

Par ailleurs, en cas de recouvrement par voie de commissaire de justice, nous vous invitons à adresser directement votre proposition de règlement à l'étude en charge de votre dossier.`;
        commentaireTexte = data.commentaires[toutEnUnState.type].normal;
    }
    // Cas DCA = Non
    else if (toutEnUnState.dca === 'non' && toutEnUnState.aeti) {
        if (nbMois > 18) {
            texteCourrier = `Vous sollicitez un délai de paiement sur ${nbMois} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

Afin d'étudier votre dossier, nous vous remercions de nous transmettre, sous quinze jours, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :
- Copie de votre dernier avis d'imposition ;
- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;
- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;
- Votre demande doit être motivée et justifiée ;
- Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour ;
- et tout autre élément que vous jugerez utile.

Dans cette attente, la procédure de recouvrement n'est pas suspendue.

Par ailleurs, en cas de recouvrement par voie de commissaire de justice, nous vous invitons à adresser directement votre proposition de règlement à l'étude en charge de votre dossier.`;

            const codeRefus = toutEnUnState.type === 'A/C' ? '06' : '65';
            const ligneSupp = toutEnUnState.aeti === 'AE'
                ? 'Un rappel lui a été adressé dans le courrier concernant ses DCA manquantes'
                : 'Un rappel lui a été adressé dans le courrier concernant ses déclarations de revenus manquantes';
            commentaireTexte = `SUR PO REFUS ${codeRefus} en raison de l'absence de justificatifs concernant la demande de délai supérieure à 18 mois. Une demande de pièces complémentaires a été transmise via SCRIBE.
+
${ligneSupp}`;
        } else {
            // DCA non à jour et <= 18 mois
            if (toutEnUnState.aeti === 'AE' && toutEnUnState.type === 'A/C') {
                commentaireTexte = 'SUR PO REFUS 12 en raison de DCA manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
            } else if (toutEnUnState.aeti === 'AE' && toutEnUnState.type === 'PL') {
                commentaireTexte = 'SUR PO REFUS 67 en raison de DCA manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
            } else if (toutEnUnState.aeti === 'TI' && toutEnUnState.type === 'A/C') {
                commentaireTexte = 'SUR PO REFUS 03 en raison de déclaration de revenu manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
            } else if (toutEnUnState.aeti === 'TI' && toutEnUnState.type === 'PL') {
                commentaireTexte = 'SUR PO REFUS 67 en raison de déclaration de revenu manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
            }
        }
    }
    // Cas normal (DCA = Oui)
    else if (toutEnUnState.dca === 'oui' && toutEnUnState.plus50k) {
        const is50kPlus = toutEnUnState.plus50k === 'oui';
        texteCourrier = is50kPlus ? data.texteOui : data.texteNon;
        texteCourrier = texteCourrier.replace(/\{MOIS\}/g, toutEnUnState.mois);
        commentaireTexte = is50kPlus ? data.commentaires[toutEnUnState.type].plus50k : data.commentaires[toutEnUnState.type].normal;
    }

    if (!texteCourrier && !commentaireTexte) return null;

    return buildResultHTML(texteCourrier, commentaireTexte);
}

// Construire le HTML du résultat
function buildResultHTML(texteCourrier, commentaireTexte) {
    let html = '';

    if (texteCourrier) {
        const texteCourrierHTML = texteCourrier
            .replace(/\n/g, '<br>')
            .replace(/sous quinze jours/g, '<b>sous quinze jours</b>')
            .replace(/Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour/g, '<b>Vos déclarations de revenus ou de chiffre d\'affaires doivent être à jour</b>');

        html += `
            <div class="result-section">
                <div class="result-title">TEXTE DU COURRIER</div>
                <div class="result-content">${texteCourrierHTML}</div>
                <button type="button" class="copy-btn-small" onclick="copyResultText('courrier')">Copier</button>
                <span class="copy-feedback-inline" id="feedback-courrier"></span>
            </div>
        `;
    }

    if (commentaireTexte) {
        html += `
            <div class="result-section">
                <div class="result-title">AFFAIRE WATT</div>
                <div class="result-content">${commentaireTexte.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" onclick="copyResultText('commentaire')">Copier</button>
                <span class="copy-feedback-inline" id="feedback-commentaire"></span>
            </div>
        `;
    }

    // Stocker les textes pour la copie
    window.resultTextes = {
        courrier: texteCourrier,
        commentaire: commentaireTexte
    };

    return html;
}

// Fonction pour copier le texte résultat
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

// Appliquer le focus visuel
function applyToutEnUnFocus() {
    // Retirer tous les focus
    document.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate').forEach(el => {
        el.classList.remove('focused');
    });

    // Trouver l'élément à focuser
    const rows = document.querySelectorAll('.tout-en-un-row');
    if (rows.length === 0) return;

    // Limiter l'index de ligne
    if (toutEnUnFocus.rowIndex >= rows.length) {
        toutEnUnFocus.rowIndex = rows.length - 1;
    }

    const currentRow = rows[toutEnUnFocus.rowIndex];
    if (!currentRow) return;

    // Scroller la ligne au centre de l'écran
    currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate');
    if (buttons.length === 0) return;

    // Limiter l'index de bouton
    if (toutEnUnFocus.btnIndex >= buttons.length) {
        toutEnUnFocus.btnIndex = buttons.length - 1;
    }

    // Trouver le premier bouton non sélectionné
    let targetIndex = toutEnUnFocus.btnIndex;
    let targetBtn = buttons[targetIndex];

    if (targetBtn && targetBtn.classList.contains('selected')) {
        // Chercher après
        let foundAfter = -1;
        for (let i = targetIndex + 1; i < buttons.length; i++) {
            if (!buttons[i].classList.contains('selected')) {
                foundAfter = i;
                break;
            }
        }
        // Chercher avant
        let foundBefore = -1;
        for (let i = targetIndex - 1; i >= 0; i--) {
            if (!buttons[i].classList.contains('selected')) {
                foundBefore = i;
                break;
            }
        }

        if (foundAfter !== -1 && foundBefore !== -1) {
            targetIndex = (targetIndex - foundBefore <= foundAfter - targetIndex) ? foundBefore : foundAfter;
        } else if (foundAfter !== -1) {
            targetIndex = foundAfter;
        } else if (foundBefore !== -1) {
            targetIndex = foundBefore;
        }

        toutEnUnFocus.btnIndex = targetIndex;
        targetBtn = buttons[targetIndex];
    }

    if (targetBtn) {
        targetBtn.classList.add('focused');
        if (targetBtn.tagName === 'INPUT') {
            targetBtn.focus();
        }
    }
}

// Configurer les événements pour DÉLAI tout-en-un
function setupDelaiToutEnUnEvents(data) {
    // Événements sur les boutons
    document.querySelectorAll('#tout-en-un-delai .tout-en-un-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            // Ignorer si ce choix est déjà sélectionné
            if (toutEnUnState[field] === value) return;

            // Revenir en mode choix si on était dans les résultats
            toutEnUnFocus.inResults = false;

            toutEnUnState[field] = value;

            // Si on change DCA, réinitialiser le choix +50k/AETI
            if (field === 'dca') {
                toutEnUnState.plus50k = null;
                toutEnUnState.aeti = null;
            }

            // Avancer au choix suivant
            if (field === 'type') {
                toutEnUnFocus.rowIndex = 1;
                toutEnUnFocus.btnIndex = 0;
            } else if (field === 'dca') {
                toutEnUnFocus.rowIndex = 2;
                toutEnUnFocus.btnIndex = 0;
            } else if (field === 'plus50k' || field === 'aeti') {
                // Dernier choix - scroll vers résultats si tout est rempli
                setTimeout(() => {
                    if (toutEnUnState.mois !== '') {
                        scrollToDelaiResults();
                    }
                }, 150);
            }

            renderDelaiToutEnUn(data);
        });
    });

    // Événement sur l'input MOIS - mise à jour en temps réel
    const moisInput = document.getElementById('tout-en-un-mois');
    if (moisInput) {
        moisInput.addEventListener('input', (e) => {
            toutEnUnState.mois = e.target.value;
            // Mettre à jour le résultat en temps réel
            updateDelaiResult(data);
        });

        moisInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                // Retirer le focus de l'input
                moisInput.blur();
                // Avancer à la ligne suivante
                toutEnUnFocus.rowIndex = 3;
                toutEnUnFocus.btnIndex = 0;
                applyToutEnUnFocus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                // Retirer le focus de l'input
                moisInput.blur();
                toutEnUnFocus.rowIndex = 1;
                toutEnUnFocus.btnIndex = 0;
                applyToutEnUnFocus();
            }
        });
    }

    // Navigation clavier globale
    setupToutEnUnKeyboardNav(data);
}

// Mettre à jour uniquement le résultat (pas les boutons)
function updateDelaiResult(data) {
    const resultContainer = document.querySelector('.tout-en-un-result');
    const result = getDelaiResult(data);

    if (result) {
        if (resultContainer) {
            resultContainer.innerHTML = result;
        } else {
            const container = document.getElementById('tout-en-un-delai');
            if (container) {
                const newResult = document.createElement('div');
                newResult.className = 'tout-en-un-result';
                newResult.innerHTML = result;
                container.parentNode.appendChild(newResult);
            }
        }
    } else if (resultContainer) {
        resultContainer.remove();
    }
}

// Navigation clavier pour tout-en-un
function setupToutEnUnKeyboardNav(data) {
    // Retirer l'ancien handler s'il existe
    if (window.toutEnUnKeyHandler) {
        document.removeEventListener('keydown', window.toutEnUnKeyHandler);
    }

    window.toutEnUnKeyHandler = (e) => {
        const container = document.getElementById('tout-en-un-delai');
        if (!container) return;

        // Vérifier si on est dans les résultats
        if (toutEnUnFocus.inResults) {
            handleDelaiResultsNav(e);
            return;
        }

        const rows = container.querySelectorAll('.tout-en-un-row');
        if (rows.length === 0) return;

        // Ignorer si on est dans un input et ce n'est pas une touche de navigation
        if (document.activeElement.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentRow = rows[toutEnUnFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate');
            // Trouver le prochain bouton non sélectionné
            let nextIndex = toutEnUnFocus.btnIndex + 1;
            while (nextIndex < buttons.length && buttons[nextIndex].classList.contains('selected')) {
                nextIndex++;
            }
            if (nextIndex < buttons.length) {
                toutEnUnFocus.btnIndex = nextIndex;
                applyToutEnUnFocus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentRow = rows[toutEnUnFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate');
            // Trouver le bouton précédent non sélectionné
            let prevIndex = toutEnUnFocus.btnIndex - 1;
            while (prevIndex >= 0 && buttons[prevIndex].classList.contains('selected')) {
                prevIndex--;
            }
            if (prevIndex >= 0) {
                toutEnUnFocus.btnIndex = prevIndex;
                applyToutEnUnFocus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Permettre navigation vers TOUTES les lignes
            if (toutEnUnFocus.rowIndex < rows.length - 1) {
                toutEnUnFocus.rowIndex++;
                toutEnUnFocus.btnIndex = 0;
                applyToutEnUnFocus();
            } else {
                // Si on est à la dernière ligne, aller aux résultats
                scrollToDelaiResults();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Permettre navigation vers TOUTES les lignes
            if (toutEnUnFocus.rowIndex > 0) {
                toutEnUnFocus.rowIndex--;
                toutEnUnFocus.btnIndex = 0;
                applyToutEnUnFocus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const currentRow = rows[toutEnUnFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-validate');
            const focusedBtn = buttons[toutEnUnFocus.btnIndex];
            if (focusedBtn && focusedBtn.tagName !== 'INPUT') {
                focusedBtn.click();
            }
        }
    };

    document.addEventListener('keydown', window.toutEnUnKeyHandler);
}

// Scroll vers les résultats DÉLAI et activer la navigation
function scrollToDelaiResults() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (!resultContainer) return;

    // Activer le mode résultats
    toutEnUnFocus.inResults = true;
    toutEnUnFocus.resultIndex = 0;

    // Scroller pour voir tous les résultats (vers le bas)
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Appliquer le focus sur le premier bouton Copier
    setTimeout(() => applyDelaiResultsFocus(), 100);
}

// Appliquer le focus visuel sur les résultats DÉLAI
function applyDelaiResultsFocus() {
    // Retirer tous les focus des boutons de choix
    document.querySelectorAll('#tout-en-un-delai .tout-en-un-btn, #tout-en-un-delai .tout-en-un-input').forEach(el => {
        el.classList.remove('focused');
    });

    // Retirer tous les focus des boutons Copier
    document.querySelectorAll('.tout-en-un-result .copy-btn-small').forEach(el => {
        el.classList.remove('focused');
    });

    // Appliquer le focus au bouton actuel
    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length > 0 && toutEnUnFocus.resultIndex < copyBtns.length) {
        copyBtns[toutEnUnFocus.resultIndex].classList.add('focused');
        copyBtns[toutEnUnFocus.resultIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Navigation clavier dans les résultats DÉLAI
function handleDelaiResultsNav(e) {
    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (toutEnUnFocus.resultIndex < copyBtns.length - 1) {
            toutEnUnFocus.resultIndex++;
            applyDelaiResultsFocus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (toutEnUnFocus.resultIndex > 0) {
            toutEnUnFocus.resultIndex--;
            applyDelaiResultsFocus();
        } else {
            // Revenir aux choix - applyToutEnUnFocus s'occupe du scroll centré
            toutEnUnFocus.inResults = false;
            const rows = document.querySelectorAll('#tout-en-un-delai .tout-en-un-row');
            toutEnUnFocus.rowIndex = rows.length - 1;
            toutEnUnFocus.btnIndex = 0;
            applyToutEnUnFocus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        // Cliquer sur le bouton Copier focalisé
        if (copyBtns[toutEnUnFocus.resultIndex]) {
            copyBtns[toutEnUnFocus.resultIndex].click();
        }
    }
}

// =====================
// FONCTIONS DÉLAI DCA - INTERFACE TOUT-EN-UN
// =====================

let dcaState = {
    type: null,     // A/C ou PL
    aeTi: null      // AE ou TI
};
let dcaData = null;
let dcaFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

function startDelaiDca(data) {
    dcaState = { type: null, aeTi: null };
    dcaFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };
    dcaData = data;

    // Cacher le bouton "Créer le courrier"
    document.getElementById('copy-comment-btn').style.display = 'none';
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('template-display').classList.remove('hidden');

    renderDelaiDca();
}

function renderDelaiDca() {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    // Afficher les sections nécessaires
    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');

    let html = `<div class="tout-en-un-container" id="tout-en-un-dca">`;
    let rowIndex = 0;

    // Ligne TYPE (A/C ou PL)
    const typeHasSelection = dcaState.type !== null;
    html += `
        <div class="tout-en-un-row ${typeHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">TYPE</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${dcaState.type === 'A/C' ? 'selected' : ''}" data-field="type" data-value="A/C">A/C</button>
                <button type="button" class="tout-en-un-btn ${dcaState.type === 'PL' ? 'selected' : ''}" data-field="type" data-value="PL">PL</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne AE/TI (toujours affichée)
    const aeTiHasSelection = dcaState.aeTi !== null;
    html += `
        <div class="tout-en-un-row ${aeTiHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">AE / TI</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${dcaState.aeTi === 'AE' ? 'selected' : ''}" data-field="aeTi" data-value="AE">AE</button>
                <button type="button" class="tout-en-un-btn ${dcaState.aeTi === 'TI' ? 'selected' : ''}" data-field="aeTi" data-value="TI">TI</button>
            </div>
        </div>
    `;
    rowIndex++;

    html += `</div>`;

    // Résultat
    const result = getDcaResult();
    if (result) {
        html += `
            <div class="tout-en-un-result">
                <div class="tout-en-un-result-title">RÉSULTAT</div>
                <div class="result-section">
                    <div class="result-item">
                        <div class="result-content">${result}</div>
                        <button type="button" class="copy-btn-small" onclick="copyDcaResult()">Copier</button>
                        <span class="copy-feedback-inline" id="feedback-dca"></span>
                    </div>
                </div>
            </div>`;
    }

    commentText.innerHTML = html;
    setupDelaiDcaEvents();
    applyDelaiDcaFocus();
}

function getDcaResult() {
    if (!dcaState.type || !dcaState.aeTi) return null;

    const typeChoice = dcaData.choix.find(c => c.label === dcaState.type);
    if (!typeChoice || !typeChoice.next) return null;

    const aeTiChoice = typeChoice.next.choix.find(c => c.label === dcaState.aeTi);
    if (!aeTiChoice) return null;

    return aeTiChoice.texte;
}

function copyDcaResult() {
    const result = getDcaResult();
    if (result) {
        navigator.clipboard.writeText(result).then(() => {
            const feedback = document.getElementById('feedback-dca');
            if (feedback) {
                feedback.textContent = 'Copié !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            }
        });
    }
}

function applyDelaiDcaFocus() {
    document.querySelectorAll('#tout-en-un-dca .tout-en-un-btn').forEach(el => {
        el.classList.remove('focused');
    });

    const rows = document.querySelectorAll('#tout-en-un-dca .tout-en-un-row');
    if (rows.length === 0) return;

    if (dcaFocus.rowIndex >= rows.length) {
        dcaFocus.rowIndex = rows.length - 1;
    }

    const currentRow = rows[dcaFocus.rowIndex];
    if (!currentRow) return;

    currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
    if (buttons.length === 0) return;

    if (dcaFocus.btnIndex >= buttons.length) {
        dcaFocus.btnIndex = buttons.length - 1;
    }

    // Trouver bouton non sélectionné
    let targetIndex = dcaFocus.btnIndex;
    if (buttons[targetIndex] && buttons[targetIndex].classList.contains('selected')) {
        for (let i = 0; i < buttons.length; i++) {
            if (!buttons[i].classList.contains('selected')) {
                targetIndex = i;
                break;
            }
        }
        dcaFocus.btnIndex = targetIndex;
    }

    if (buttons[targetIndex]) {
        buttons[targetIndex].classList.add('focused');
    }
}

function setupDelaiDcaEvents() {
    document.querySelectorAll('#tout-en-un-dca .tout-en-un-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            if (dcaState[field] === value) return;

            dcaState[field] = value;

            // Avancer au choix suivant seulement si c'était le premier choix
            if (field === 'type' && dcaState.aeTi === null) {
                dcaFocus.rowIndex = 1;
                dcaFocus.btnIndex = 0;
            }

            renderDelaiDca();
        });
    });

    // Retirer ancien handler
    if (window.dcaKeyHandler) {
        document.removeEventListener('keydown', window.dcaKeyHandler);
    }

    window.dcaKeyHandler = (e) => {
        if (!document.querySelector('#tout-en-un-dca')) {
            document.removeEventListener('keydown', window.dcaKeyHandler);
            return;
        }

        const rows = document.querySelectorAll('#tout-en-un-dca .tout-en-un-row');

        // Si on est dans les résultats, navigation spéciale
        if (dcaFocus.inResults) {
            handleDcaResultsNav(e);
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentRow = rows[dcaFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            let nextIndex = dcaFocus.btnIndex + 1;
            while (nextIndex < buttons.length && buttons[nextIndex].classList.contains('selected')) {
                nextIndex++;
            }
            if (nextIndex < buttons.length) {
                dcaFocus.btnIndex = nextIndex;
                applyDelaiDcaFocus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentRow = rows[dcaFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            let prevIndex = dcaFocus.btnIndex - 1;
            while (prevIndex >= 0 && buttons[prevIndex].classList.contains('selected')) {
                prevIndex--;
            }
            if (prevIndex >= 0) {
                dcaFocus.btnIndex = prevIndex;
                applyDelaiDcaFocus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (dcaFocus.rowIndex < rows.length - 1) {
                dcaFocus.rowIndex++;
                dcaFocus.btnIndex = 0;
                applyDelaiDcaFocus();
            } else if (getDcaResult()) {
                scrollToDcaResults();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (dcaFocus.rowIndex > 0) {
                dcaFocus.rowIndex--;
                dcaFocus.btnIndex = 0;
                applyDelaiDcaFocus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const currentRow = rows[dcaFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            if (buttons[dcaFocus.btnIndex]) {
                buttons[dcaFocus.btnIndex].click();
            }
        }
    };

    document.addEventListener('keydown', window.dcaKeyHandler);
}

// Scroll vers les résultats DCA
function scrollToDcaResults() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (!resultContainer) return;

    dcaFocus.inResults = true;
    dcaFocus.resultIndex = 0;

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    applyDcaResultsFocus();
}

// Appliquer le focus sur les résultats DCA
function applyDcaResultsFocus() {
    document.querySelectorAll('#tout-en-un-dca .tout-en-un-btn').forEach(el => {
        el.classList.remove('focused');
    });
    document.querySelectorAll('.tout-en-un-result .copy-btn-small').forEach(el => {
        el.classList.remove('focused');
    });

    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length > 0 && dcaFocus.resultIndex < copyBtns.length) {
        copyBtns[dcaFocus.resultIndex].classList.add('focused');
    }
}

// Navigation dans les résultats DCA
function handleDcaResultsNav(e) {
    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (dcaFocus.resultIndex < copyBtns.length - 1) {
            dcaFocus.resultIndex++;
            applyDcaResultsFocus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (dcaFocus.resultIndex > 0) {
            dcaFocus.resultIndex--;
            applyDcaResultsFocus();
        } else {
            // Revenir aux choix
            dcaFocus.inResults = false;
            const rows = document.querySelectorAll('#tout-en-un-dca .tout-en-un-row');
            dcaFocus.rowIndex = rows.length - 1;
            dcaFocus.btnIndex = 0;
            applyDelaiDcaFocus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (copyBtns[dcaFocus.resultIndex]) {
            copyBtns[dcaFocus.resultIndex].click();
        }
    }
}

// =====================
// FONCTIONS DÉLAI CO EN COURS - INTERFACE TOUT-EN-UN
// =====================

let coState = {
    totalite: null,  // OUI ou NON
    telCj: '',
    mailCj: ''
};
let coData = null;
let coFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

function startDelaiCo(data) {
    coState = { totalite: null, telCj: '', mailCj: '' };
    coFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };
    coData = data;

    document.getElementById('copy-comment-btn').style.display = 'none';
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('template-display').classList.remove('hidden');

    renderDelaiCo();
}

function renderDelaiCo() {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');

    let html = `<div class="tout-en-un-container" id="tout-en-un-co">`;
    let rowIndex = 0;

    // Ligne TOTALITÉ (OUI ou NON)
    const totaliteHasSelection = coState.totalite !== null;
    html += `
        <div class="tout-en-un-row ${totaliteHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">CO SUR TOTALITÉ ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${coState.totalite === 'OUI' ? 'selected' : ''}" data-field="totalite" data-value="OUI">OUI</button>
                <button type="button" class="tout-en-un-btn ${coState.totalite === 'NON' ? 'selected' : ''}" data-field="totalite" data-value="NON">NON</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Si OUI : afficher TEL CJ et MAIL CJ
    if (coState.totalite === 'OUI') {
        // Ligne TEL CJ
        html += `
            <div class="tout-en-un-row" data-row="${rowIndex}">
                <div class="tout-en-un-label">TEL CJ</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-tel-cj" value="${coState.telCj}" placeholder="Ex: 01 23 45 67 89">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne MAIL CJ
        html += `
            <div class="tout-en-un-row" data-row="${rowIndex}">
                <div class="tout-en-un-label">MAIL CJ</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-mail-cj" value="${coState.mailCj}" placeholder="Ex: contact@huissier.fr">
                </div>
            </div>
        `;
        rowIndex++;
    }

    html += `</div>`;

    // Résultat
    const result = getCoResult();
    if (result) {
        html += `
            <div class="tout-en-un-result">
                <div class="tout-en-un-result-title">RÉSULTAT</div>
                <div class="result-section">
                    <div class="result-item">
                        <div class="result-content">${result.replace(/\n/g, '<br>')}</div>
                        <button type="button" class="copy-btn-small" onclick="copyCoResult()">Copier</button>
                        <span class="copy-feedback-inline" id="feedback-co"></span>
                    </div>
                </div>
            </div>`;
    }

    commentText.innerHTML = html;
    setupDelaiCoEvents();
    applyDelaiCoFocus();
}

function getCoResult() {
    if (coState.totalite !== 'OUI') return null;

    let texte = coData.texteOui;
    texte = texte.replace('{TEL_CJ}', coState.telCj || '');
    texte = texte.replace('{MAIL_CJ}', coState.mailCj || '');

    return texte;
}

function copyCoResult() {
    const result = getCoResult();
    if (result) {
        navigator.clipboard.writeText(result).then(() => {
            const feedback = document.getElementById('feedback-co');
            if (feedback) {
                feedback.textContent = 'Copié !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            }
        });
    }
}

function applyDelaiCoFocus() {
    document.querySelectorAll('#tout-en-un-co .tout-en-un-btn, #tout-en-un-co .tout-en-un-input').forEach(el => {
        el.classList.remove('focused');
    });

    const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
    if (rows.length === 0) return;

    if (coFocus.rowIndex >= rows.length) {
        coFocus.rowIndex = rows.length - 1;
    }

    const currentRow = rows[coFocus.rowIndex];
    if (!currentRow) return;

    currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input');
    if (buttons.length === 0) return;

    if (coFocus.btnIndex >= buttons.length) {
        coFocus.btnIndex = buttons.length - 1;
    }

    let targetIndex = coFocus.btnIndex;
    if (buttons[targetIndex] && buttons[targetIndex].classList.contains('selected')) {
        for (let i = 0; i < buttons.length; i++) {
            if (!buttons[i].classList.contains('selected')) {
                targetIndex = i;
                break;
            }
        }
        coFocus.btnIndex = targetIndex;
    }

    const targetBtn = buttons[targetIndex];
    if (targetBtn) {
        targetBtn.classList.add('focused');
        if (targetBtn.tagName === 'INPUT') {
            targetBtn.focus();
        }
    }
}

function setupDelaiCoEvents() {
    document.querySelectorAll('#tout-en-un-co .tout-en-un-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            if (coState[field] === value) return;

            coState[field] = value;

            if (field === 'totalite' && value === 'OUI') {
                coFocus.rowIndex = 1;
                coFocus.btnIndex = 0;
            }

            renderDelaiCo();
        });
    });

    // Événements sur les inputs
    const telInput = document.getElementById('tout-en-un-tel-cj');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            coState.telCj = e.target.value;
            updateCoResult();
        });
        telInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                telInput.blur();
                coFocus.rowIndex = 2;
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                telInput.blur();
                coFocus.rowIndex = 0;
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            }
        });
    }

    const mailInput = document.getElementById('tout-en-un-mail-cj');
    if (mailInput) {
        mailInput.addEventListener('input', (e) => {
            coState.mailCj = e.target.value;
            updateCoResult();
        });
        mailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                mailInput.blur();
                const resultContainer = document.querySelector('.tout-en-un-result');
                if (resultContainer) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                mailInput.blur();
                coFocus.rowIndex = 1;
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            }
        });
    }

    // Retirer ancien handler
    if (window.coKeyHandler) {
        document.removeEventListener('keydown', window.coKeyHandler);
    }

    window.coKeyHandler = (e) => {
        if (!document.querySelector('#tout-en-un-co')) {
            document.removeEventListener('keydown', window.coKeyHandler);
            return;
        }

        const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');

        // Si on est dans les résultats, navigation spéciale
        if (coFocus.inResults) {
            handleCoResultsNav(e);
            return;
        }

        if (document.activeElement.tagName === 'INPUT') {
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentRow = rows[coFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input');
            let nextIndex = coFocus.btnIndex + 1;
            while (nextIndex < buttons.length && buttons[nextIndex].classList.contains('selected')) {
                nextIndex++;
            }
            if (nextIndex < buttons.length) {
                coFocus.btnIndex = nextIndex;
                applyDelaiCoFocus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentRow = rows[coFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input');
            let prevIndex = coFocus.btnIndex - 1;
            while (prevIndex >= 0 && buttons[prevIndex].classList.contains('selected')) {
                prevIndex--;
            }
            if (prevIndex >= 0) {
                coFocus.btnIndex = prevIndex;
                applyDelaiCoFocus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const allRows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
            if (coFocus.rowIndex < allRows.length - 1) {
                coFocus.rowIndex++;
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            } else if (getCoResult()) {
                scrollToCoResults();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (coFocus.rowIndex > 0) {
                coFocus.rowIndex--;
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const allRows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
            const currentRow = allRows[coFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            if (buttons[coFocus.btnIndex]) {
                buttons[coFocus.btnIndex].click();
            }
        }
    };

    document.addEventListener('keydown', window.coKeyHandler);
}

// Scroll vers les résultats CO
function scrollToCoResults() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (!resultContainer) return;

    coFocus.inResults = true;
    coFocus.resultIndex = 0;

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    applyCoResultsFocus();
}

// Appliquer le focus sur les résultats CO
function applyCoResultsFocus() {
    document.querySelectorAll('#tout-en-un-co .tout-en-un-btn, #tout-en-un-co .tout-en-un-input').forEach(el => {
        el.classList.remove('focused');
    });
    document.querySelectorAll('.tout-en-un-result .copy-btn-small').forEach(el => {
        el.classList.remove('focused');
    });

    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length > 0 && coFocus.resultIndex < copyBtns.length) {
        copyBtns[coFocus.resultIndex].classList.add('focused');
    }
}

// Navigation dans les résultats CO
function handleCoResultsNav(e) {
    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (coFocus.resultIndex < copyBtns.length - 1) {
            coFocus.resultIndex++;
            applyCoResultsFocus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (coFocus.resultIndex > 0) {
            coFocus.resultIndex--;
            applyCoResultsFocus();
        } else {
            // Revenir aux choix
            coFocus.inResults = false;
            const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
            coFocus.rowIndex = rows.length - 1;
            coFocus.btnIndex = 0;
            applyDelaiCoFocus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (copyBtns[coFocus.resultIndex]) {
            copyBtns[coFocus.resultIndex].click();
        }
    }
}

function updateCoResult() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (!resultContainer) return;

    const result = getCoResult();
    if (result) {
        const resultContent = resultContainer.querySelector('.result-content');
        if (resultContent) {
            resultContent.innerHTML = result.replace(/\n/g, '<br>');
        }
    }
}

// =====================
// FONCTIONS ANV - INTERFACE TOUT-EN-UN
// =====================

// État global pour l'interface tout-en-un ANV
let anvState = {
    statut: null,      // RADIÉ ou ACTIF
    type: null,        // A/C ou PL
    anv: null,         // Code ANV
    sousMotif: null,   // Sous-motif
    date: '',          // Date
    suspen: null,      // Oui ou Non
    dretaf: null,      // Oui ou Non
    dretafNum: ''      // Numéro CO
};

// Navigation clavier ANV
let anvFocus = {
    rowIndex: 0,
    btnIndex: 0,
    inResults: false,
    resultIndex: 0
};

// Données ANV pour l'interface
let anvData = null;
let anvChoixAnv = [];
let anvChoixSousMotif = [];
let anvIsPartielle = false;

function startAnvToutEnUn(data) {
    // Réinitialiser l'état
    anvState = {
        statut: null,
        type: null,
        anv: null,
        sousMotif: null,
        date: '',
        suspen: null,
        dretaf: null,
        dretafNum: ''
    };
    anvFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };
    anvData = data;
    anvChoixAnv = [];
    anvChoixSousMotif = [];
    anvIsPartielle = false;

    // Cacher le modal s'il est ouvert
    document.getElementById('modal').classList.add('hidden');

    // Afficher le template-display
    document.getElementById('template-display').classList.remove('hidden');

    // Afficher l'interface tout-en-un
    renderAnvToutEnUn();
}

// Calculer les choix ANV disponibles selon le statut et le type
function getAnvChoix() {
    if (!anvState.statut || !anvState.type) return [];

    const statutIndex = anvState.statut === 'RADIÉ' ? 0 : 1;
    const statutChoix = anvData.choix[statutIndex];

    if (!statutChoix || !statutChoix.next) return [];

    const typeChoix = statutChoix.next.choix.find(c => c.label === anvState.type);
    if (!typeChoix || !typeChoix.next) return [];

    return typeChoix.next.choix;
}

// Calculer les sous-motifs disponibles selon l'ANV choisi
function getSousMotifChoix() {
    if (!anvState.anv) return [];

    const anvChoix = getAnvChoix();
    const selectedAnv = anvChoix.find(c => c.label === anvState.anv);

    if (!selectedAnv) return [];

    // Si l'ANV a un next avec des sous-motifs
    if (selectedAnv.next && selectedAnv.next.choix) {
        return selectedAnv.next.choix;
    }

    // Si l'ANV a directement un texte (pas de sous-motif)
    return [];
}

// Obtenir le texte ANV final
function getAnvTexte() {
    const anvChoix = getAnvChoix();
    const selectedAnv = anvChoix.find(c => c.label === anvState.anv);

    if (!selectedAnv) return null;

    // Cas avec sous-motif
    if (selectedAnv.next && selectedAnv.next.choix && anvState.sousMotif) {
        const sousMotif = selectedAnv.next.choix.find(c => c.label === anvState.sousMotif);
        if (sousMotif) {
            let texte = sousMotif.texte;
            if (sousMotif.variable) {
                // Remplacer par la date ou par rien si vide
                texte = texte.replace(`{${sousMotif.variable.id}}`, anvState.date || '');
            }
            return texte;
        }
    }

    // Cas avec variable puis nextAfterVariable (ex: ANV 12 PL)
    if (selectedAnv.variable && selectedAnv.nextAfterVariable && anvState.sousMotif) {
        const nextChoice = selectedAnv.nextAfterVariable.choix.find(c => c.label === anvState.sousMotif);
        if (nextChoice) {
            let texte = nextChoice.texte;
            // Remplacer par la date ou par rien si vide
            texte = texte.replace(`{${selectedAnv.variable.id}}`, anvState.date || '');
            return texte;
        }
    }

    // Cas sans sous-motif mais avec texte direct
    if (selectedAnv.texte) {
        let texte = selectedAnv.texte;
        if (selectedAnv.variable) {
            // Remplacer par la date ou par rien si vide
            texte = texte.replace(`{${selectedAnv.variable.id}}`, anvState.date || '');
        }
        return texte;
    }

    return null;
}

// Vérifier si l'ANV nécessite une date
function anvNeedsDate() {
    if (!anvState.anv) return false;

    const anvChoix = getAnvChoix();
    const selectedAnv = anvChoix.find(c => c.label === anvState.anv);

    if (!selectedAnv) return false;

    // ANV avec variable directe
    if (selectedAnv.variable) return true;

    // ANV avec sous-motif qui a une variable
    if (selectedAnv.next && selectedAnv.next.choix && anvState.sousMotif) {
        const sousMotif = selectedAnv.next.choix.find(c => c.label === anvState.sousMotif);
        if (sousMotif && sousMotif.variable) return true;
    }

    return false;
}

// Vérifier si l'ANV a un nextAfterVariable
function anvHasNextAfterVariable() {
    if (!anvState.anv) return false;

    const anvChoix = getAnvChoix();
    const selectedAnv = anvChoix.find(c => c.label === anvState.anv);

    return selectedAnv && selectedAnv.nextAfterVariable;
}

// Obtenir les choix nextAfterVariable
function getNextAfterVariableChoix() {
    if (!anvState.anv) return [];

    const anvChoix = getAnvChoix();
    const selectedAnv = anvChoix.find(c => c.label === anvState.anv);

    if (selectedAnv && selectedAnv.nextAfterVariable) {
        return selectedAnv.nextAfterVariable.choix;
    }

    return [];
}

// Obtenir la question/label du nextAfterVariable
function getNextAfterVariableLabel() {
    if (!anvState.anv) return 'SOUS-MOTIF';

    const anvChoix = getAnvChoix();
    const selectedAnv = anvChoix.find(c => c.label === anvState.anv);

    if (selectedAnv && selectedAnv.nextAfterVariable && selectedAnv.nextAfterVariable.question) {
        // Enlever le "?" à la fin si présent
        return selectedAnv.nextAfterVariable.question.replace(' ?', '').replace('?', '');
    }

    return 'SOUS-MOTIF';
}

// Rendre l'interface tout-en-un ANV
function renderAnvToutEnUn() {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    // Cacher les sections inutiles
    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');
    document.getElementById('copy-comment-btn').style.display = 'none';

    // Cacher le récap
    document.getElementById('recap-panel').classList.add('hidden');

    // Calculer les choix disponibles
    anvChoixAnv = getAnvChoix();
    anvChoixSousMotif = getSousMotifChoix();
    const nextAfterVarChoix = getNextAfterVariableChoix();

    // Déterminer si c'est une ANV PARTIELLE
    anvIsPartielle = anvState.statut === 'ACTIF';

    let html = `<div class="tout-en-un-container" id="tout-en-un-anv">`;
    let rowIndex = 0;

    // Ligne 1: STATUT (RADIÉ ou ACTIF) - toujours visible
    const statutHasSelection = anvState.statut !== null;
    html += `
        <div class="tout-en-un-row ${statutHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">STATUT</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvState.statut === 'RADIÉ' ? 'selected' : ''}" data-field="statut" data-value="RADIÉ">RADIÉ</button>
                <button type="button" class="tout-en-un-btn ${anvState.statut === 'ACTIF' ? 'selected' : ''}" data-field="statut" data-value="ACTIF">ACTIF</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 2: TYPE (A/C ou PL) - toujours visible
    const typeHasSelection = anvState.type !== null;
    html += `
        <div class="tout-en-un-row ${typeHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">TYPE</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvState.type === 'A/C' ? 'selected' : ''}" data-field="type" data-value="A/C">A/C</button>
                <button type="button" class="tout-en-un-btn ${anvState.type === 'PL' ? 'selected' : ''}" data-field="type" data-value="PL">PL</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Ligne 3: ANV - visible si statut et type choisis
    if (anvChoixAnv.length > 0) {
        const anvHasSelection = anvState.anv !== null;
        html += `
            <div class="tout-en-un-row ${anvHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">ANV</div>
                <div class="tout-en-un-buttons tout-en-un-buttons-wrap">
        `;
        anvChoixAnv.forEach(c => {
            html += `<button type="button" class="tout-en-un-btn ${anvState.anv === c.label ? 'selected' : ''}" data-field="anv" data-value="${c.label}">${c.label}</button>`;
        });
        html += `
                </div>
            </div>
        `;
        rowIndex++;
    }

    // Déterminer si c'est un cas nextAfterVariable (ex: PL > 12)
    const hasNextAfterVar = anvHasNextAfterVariable();

    // Cas nextAfterVariable : SOUS-MOTIF d'abord, puis DATE
    if (hasNextAfterVar && anvState.anv) {
        // Ligne SOUS-MOTIF (PV 659 / MD PSA)
        if (nextAfterVarChoix.length > 0) {
            const sousMotifHasSelection = anvState.sousMotif !== null;
            const nextAfterVarLabel = getNextAfterVariableLabel();
            html += `
                <div class="tout-en-un-row ${sousMotifHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                    <div class="tout-en-un-label">${nextAfterVarLabel}</div>
                    <div class="tout-en-un-buttons tout-en-un-buttons-wrap">
            `;
            nextAfterVarChoix.forEach(c => {
                html += `<button type="button" class="tout-en-un-btn ${anvState.sousMotif === c.label ? 'selected' : ''}" data-field="sousMotif" data-value="${c.label}">${c.label}</button>`;
            });
            html += `
                    </div>
                </div>
            `;
            rowIndex++;

            // Ligne DATE
            html += `
                <div class="tout-en-un-row" data-row="${rowIndex}">
                    <div class="tout-en-un-label">DATE</div>
                    <div class="tout-en-un-buttons">
                        <input type="text" class="tout-en-un-input" id="tout-en-un-date" value="${anvState.date}" placeholder="Ex: 15/01/2025">
                    </div>
                </div>
            `;
            rowIndex++;

            // Ligne SUSPEN (sauf si PARTIELLE)
            if (!anvIsPartielle) {
                const suspenHasSelection = anvState.suspen !== null;
                html += `
                    <div class="tout-en-un-row ${suspenHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                        <div class="tout-en-un-label">ANV SUSPEN</div>
                        <div class="tout-en-un-buttons">
                            <button type="button" class="tout-en-un-btn ${anvState.suspen === 'oui' ? 'selected' : ''}" data-field="suspen" data-value="oui">Oui</button>
                            <button type="button" class="tout-en-un-btn ${anvState.suspen === 'non' ? 'selected' : ''}" data-field="suspen" data-value="non">Non</button>
                        </div>
                    </div>
                `;
                rowIndex++;
            }

            // Ligne DRETAF
            const dretafHasSelection = anvState.dretaf !== null;
            html += `
                <div class="tout-en-un-row ${dretafHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                    <div class="tout-en-un-label">DRETAF</div>
                    <div class="tout-en-un-buttons">
                        <button type="button" class="tout-en-un-btn ${anvState.dretaf === 'oui' ? 'selected' : ''}" data-field="dretaf" data-value="oui">Oui</button>
                        <button type="button" class="tout-en-un-btn ${anvState.dretaf === 'non' ? 'selected' : ''}" data-field="dretaf" data-value="non">Non</button>
                    </div>
                </div>
            `;
            rowIndex++;

            // Ligne N° CO (si DRETAF = Oui)
            if (anvState.dretaf === 'oui') {
                html += `
                    <div class="tout-en-un-row" data-row="${rowIndex}">
                        <div class="tout-en-un-label">N° CO</div>
                        <div class="tout-en-un-buttons">
                            <input type="text" class="tout-en-un-input" id="tout-en-un-dretaf-num" value="${anvState.dretafNum}" placeholder="Numéro CO">
                        </div>
                    </div>
                `;
                rowIndex++;
            }
        }
    }

    // Ligne SOUS-MOTIF (si pas nextAfterVariable)
    if (!hasNextAfterVar && anvChoixSousMotif.length > 0) {
        const sousMotifHasSelection = anvState.sousMotif !== null;
        html += `
            <div class="tout-en-un-row ${sousMotifHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">SOUS-MOTIF</div>
                <div class="tout-en-un-buttons tout-en-un-buttons-wrap">
        `;
        anvChoixSousMotif.forEach(c => {
            html += `<button type="button" class="tout-en-un-btn ${anvState.sousMotif === c.label ? 'selected' : ''}" data-field="sousMotif" data-value="${c.label}">${c.label}</button>`;
        });
        html += `
                </div>
            </div>
        `;
        rowIndex++;
    }

    // Ligne DATE (après sous-motif si pas nextAfterVariable)
    const anvChoixSelected = anvChoixAnv.find(c => c.label === anvState.anv);
    const needsDateAfterSousMotif = !hasNextAfterVar && anvState.anv && (
        anvChoixSousMotif.length > 0 ||  // Afficher dès que SOUS-MOTIF apparaît
        (anvChoixSelected && anvChoixSelected.texte && anvChoixSelected.variable)
    );

    // Afficher DATE, SUSPEN, DRETAF dès qu'on a choisi le sous-motif (ou l'ANV direct)
    if (needsDateAfterSousMotif) {
        // Ligne DATE
        html += `
            <div class="tout-en-un-row" data-row="${rowIndex}">
                <div class="tout-en-un-label">DATE</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-date" value="${anvState.date}" placeholder="Ex: 15/01/2025">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne SUSPEN (sauf si PARTIELLE)
        if (!anvIsPartielle) {
            const suspenHasSelection = anvState.suspen !== null;
            html += `
                <div class="tout-en-un-row ${suspenHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                    <div class="tout-en-un-label">ANV SUSPEN</div>
                    <div class="tout-en-un-buttons">
                        <button type="button" class="tout-en-un-btn ${anvState.suspen === 'oui' ? 'selected' : ''}" data-field="suspen" data-value="oui">Oui</button>
                        <button type="button" class="tout-en-un-btn ${anvState.suspen === 'non' ? 'selected' : ''}" data-field="suspen" data-value="non">Non</button>
                    </div>
                </div>
            `;
            rowIndex++;
        }

        // Ligne DRETAF
        const dretafHasSelection = anvState.dretaf !== null;
        html += `
            <div class="tout-en-un-row ${dretafHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">DRETAF</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${anvState.dretaf === 'oui' ? 'selected' : ''}" data-field="dretaf" data-value="oui">Oui</button>
                    <button type="button" class="tout-en-un-btn ${anvState.dretaf === 'non' ? 'selected' : ''}" data-field="dretaf" data-value="non">Non</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne N° CO (si DRETAF = Oui)
        if (anvState.dretaf === 'oui') {
            html += `
                <div class="tout-en-un-row" data-row="${rowIndex}">
                    <div class="tout-en-un-label">N° CO</div>
                    <div class="tout-en-un-buttons">
                        <input type="text" class="tout-en-un-input" id="tout-en-un-dretaf-num" value="${anvState.dretafNum}" placeholder="Numéro CO">
                    </div>
                </div>
            `;
            rowIndex++;
        }
    }

    html += `</div>`;

    // Résultat en temps réel
    const result = getAnvResult();
    if (result) {
        html += `
            <div class="tout-en-un-result">
                <div class="tout-en-un-result-title">RÉSULTAT</div>
                ${result}
            </div>`;
    }

    commentText.innerHTML = html;

    // Ajouter les événements
    setupAnvToutEnUnEvents();

    // Appliquer le focus initial
    applyAnvToutEnUnFocus();
}

// Calculer le résultat ANV en temps réel
function getAnvResult() {
    const anvTexte = getAnvTexte();
    if (!anvTexte) return null;

    // Pour RADIÉ (non PARTIELLE), il faut SUSPEN et DRETAF
    if (!anvIsPartielle && anvState.suspen === null) return null;
    if (anvState.dretaf === null) return null;

    // SUSPEN uniquement pour RADIÉ (non PARTIELLE)
    const suspenTexte = (!anvIsPartielle && anvState.suspen === 'oui') ? "ANV SUSPEN pour exigibilité inférieure à un an" : null;
    const dretafTexte = anvState.dretaf === 'oui'
        ? (anvState.dretafNum ? `DRETAF CO ${anvState.dretafNum} pour passer ANV` : `DRETAF CO pour passer ANV`)
        : null;

    return buildAnvResultHTML(anvTexte, suspenTexte, dretafTexte);
}

// Construire le HTML du résultat ANV
function buildAnvResultHTML(anvTexte, suspenTexte, dretafTexte) {
    // Texte combiné pour Affaire WATT = ANV + SUSPEN + DRETAF
    let combinedParts = [anvTexte];
    if (suspenTexte) combinedParts.push(suspenTexte);
    if (dretafTexte) combinedParts.push(dretafTexte);
    const combinedTexte = combinedParts.join('\n+\n');

    // Stocker pour la copie
    window.resultTextes = {
        anv: anvTexte,
        suspen: suspenTexte,
        dretaf: dretafTexte,
        combined: combinedTexte
    };

    let html = '';

    // Section Portail TI / V2 avec éléments séparés
    html += `<div class="result-section">
        <div class="result-title">PORTAIL TI / V2</div>

        <div class="result-item">
            <div class="result-content">${anvTexte}</div>
            <button type="button" class="copy-btn-small" onclick="copyResultText('anv')">Copier</button>
            <span class="copy-feedback-inline" id="feedback-anv"></span>
        </div>`;

    if (dretafTexte) {
        html += `
        <div class="result-item">
            <div class="result-content">${dretafTexte}</div>
            <button type="button" class="copy-btn-small" onclick="copyResultText('dretaf')">Copier</button>
            <span class="copy-feedback-inline" id="feedback-dretaf"></span>
        </div>`;
    }

    if (suspenTexte) {
        html += `
        <div class="result-item">
            <div class="result-content">${suspenTexte}</div>
            <button type="button" class="copy-btn-small" onclick="copyResultText('suspen')">Copier</button>
            <span class="copy-feedback-inline" id="feedback-suspen"></span>
        </div>`;
    }

    html += `</div>`;

    // Section Affaire WATT (combiné ANV + SUSPEN + DRETAF)
    let combinedDisplay = anvTexte;
    if (suspenTexte) combinedDisplay += '<br>+<br>' + suspenTexte;
    if (dretafTexte) combinedDisplay += '<br>+<br>' + dretafTexte;

    html += `<div class="result-section">
        <div class="result-title">AFFAIRE WATT</div>
        <div class="result-content">${combinedDisplay}</div>
        <button type="button" class="copy-btn-small" onclick="copyResultText('combined')">Copier</button>
        <span class="copy-feedback-inline" id="feedback-combined"></span>
    </div>`;

    return html;
}

// Appliquer le focus visuel ANV
function applyAnvToutEnUnFocus() {
    // Retirer tous les focus
    document.querySelectorAll('#tout-en-un-anv .tout-en-un-btn, #tout-en-un-anv .tout-en-un-input, #tout-en-un-anv .tout-en-un-validate').forEach(el => {
        el.classList.remove('focused');
    });

    // Trouver l'élément à focuser
    const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
    if (rows.length === 0) return;

    // Limiter l'index de ligne
    if (anvFocus.rowIndex >= rows.length) {
        anvFocus.rowIndex = rows.length - 1;
    }

    const currentRow = rows[anvFocus.rowIndex];
    if (!currentRow) return;

    // Scroller la ligne au centre de l'écran
    currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate');
    if (buttons.length === 0) return;

    // Limiter l'index de bouton
    if (anvFocus.btnIndex >= buttons.length) {
        anvFocus.btnIndex = buttons.length - 1;
    }

    // Trouver le premier bouton non sélectionné à partir de l'index actuel
    let targetIndex = anvFocus.btnIndex;
    let targetBtn = buttons[targetIndex];

    // Si le bouton actuel est sélectionné, chercher le prochain non sélectionné
    if (targetBtn && targetBtn.classList.contains('selected')) {
        // D'abord chercher après
        let foundAfter = -1;
        for (let i = targetIndex + 1; i < buttons.length; i++) {
            if (!buttons[i].classList.contains('selected')) {
                foundAfter = i;
                break;
            }
        }
        // Puis chercher avant
        let foundBefore = -1;
        for (let i = targetIndex - 1; i >= 0; i--) {
            if (!buttons[i].classList.contains('selected')) {
                foundBefore = i;
                break;
            }
        }

        // Prendre le plus proche
        if (foundAfter !== -1 && foundBefore !== -1) {
            // Prendre le plus proche
            if (targetIndex - foundBefore <= foundAfter - targetIndex) {
                targetIndex = foundBefore;
            } else {
                targetIndex = foundAfter;
            }
        } else if (foundAfter !== -1) {
            targetIndex = foundAfter;
        } else if (foundBefore !== -1) {
            targetIndex = foundBefore;
        }
        // Si aucun trouvé, on reste sur le bouton sélectionné (cas rare)

        anvFocus.btnIndex = targetIndex;
        targetBtn = buttons[targetIndex];
    }

    if (targetBtn) {
        targetBtn.classList.add('focused');
        if (targetBtn.tagName === 'INPUT') {
            targetBtn.focus();
        }
    }
}

// Configurer les événements pour ANV tout-en-un
function setupAnvToutEnUnEvents() {
    // Événements sur les boutons
    document.querySelectorAll('#tout-en-un-anv .tout-en-un-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            // Ignorer si ce choix est déjà sélectionné
            if (anvState[field] === value) return;

            // Revenir en mode choix si on était dans les résultats
            anvFocus.inResults = false;

            anvState[field] = value;

            // Réinitialiser les choix suivants si on change un choix précédent
            if (field === 'statut') {
                // Ne pas réinitialiser les autres choix, juste mettre à jour le résultat
                // car RADIÉ et ACTIF ont la même structure
                // Avancer à TYPE
                anvFocus.rowIndex = 1;
            } else if (field === 'type') {
                anvState.anv = null;
                anvState.sousMotif = null;
                anvState.date = '';
                anvState.suspen = null;
                anvState.dretaf = null;
                anvState.dretafNum = '';
                anvFocus.rowIndex = 2;
            } else if (field === 'anv') {
                anvState.sousMotif = null;
                anvState.date = '';
                anvState.suspen = null;
                anvState.dretaf = null;
                anvState.dretafNum = '';
                anvFocus.rowIndex = 3;
            } else if (field === 'sousMotif') {
                // Garder les sélections SUSPEN et DRETAF quand on change le sous-motif
                // Avancer à DATE après le render
                setTimeout(() => {
                    const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].querySelector('#tout-en-un-date')) {
                            anvFocus.rowIndex = i;
                            anvFocus.btnIndex = 0;
                            applyAnvToutEnUnFocus();
                            break;
                        }
                    }
                }, 50);
            } else if (field === 'suspen') {
                // Garder la sélection DRETAF, mais avancer à DRETAF si pas encore sélectionné
                if (anvState.dretaf === null) {
                    const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                    // Trouver la ligne DRETAF
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].querySelector('.tout-en-un-btn[data-field="dretaf"]')) {
                            anvFocus.rowIndex = i;
                            anvFocus.btnIndex = 0;
                            break;
                        }
                    }
                }
            } else if (field === 'dretaf') {
                anvState.dretafNum = '';
                if (value === 'oui') {
                    // Avancer à N° CO après le render
                    setTimeout(() => {
                        const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                        for (let i = 0; i < rows.length; i++) {
                            if (rows[i].querySelector('#tout-en-un-dretaf-num')) {
                                anvFocus.rowIndex = i;
                                anvFocus.btnIndex = 0;
                                applyAnvToutEnUnFocus();
                                break;
                            }
                        }
                    }, 50);
                } else {
                    // DRETAF = Non, formulaire complet -> scroll vers résultats
                    setTimeout(() => {
                        scrollToAnvResults();
                    }, 150);
                }
            }
            anvFocus.btnIndex = 0;

            renderAnvToutEnUn();
        });
    });

    // Événement sur l'input DATE - mise à jour en temps réel
    const dateInput = document.getElementById('tout-en-un-date');
    if (dateInput) {
        dateInput.addEventListener('input', (e) => {
            anvState.date = e.target.value;
            // Mettre à jour le résultat en temps réel
            updateAnvResult();
        });

        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                // Retirer le focus de l'input
                dateInput.blur();
                // Passer à la ligne suivante (SUSPEN ou DRETAF)
                const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                let currentRowIdx = -1;
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-date')) {
                        currentRowIdx = i;
                        break;
                    }
                }
                if (currentRowIdx >= 0 && currentRowIdx < rows.length - 1) {
                    anvFocus.rowIndex = currentRowIdx + 1;
                    anvFocus.btnIndex = 0;
                    applyAnvToutEnUnFocus();
                }
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                // Retirer le focus de l'input
                dateInput.blur();
                // Trouver la ligne DATE et remonter à la précédente
                const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                let currentRowIdx = -1;
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-date')) {
                        currentRowIdx = i;
                        break;
                    }
                }
                if (currentRowIdx > 0) {
                    anvFocus.rowIndex = currentRowIdx - 1;
                    anvFocus.btnIndex = 0;
                    applyAnvToutEnUnFocus();
                }
            }
        });
    }

    // Événement sur l'input DRETAF NUM - mise à jour en temps réel
    const dretafNumInput = document.getElementById('tout-en-un-dretaf-num');
    if (dretafNumInput) {
        dretafNumInput.addEventListener('input', (e) => {
            anvState.dretafNum = e.target.value;
            // Mettre à jour le résultat en temps réel
            updateAnvResult();
        });

        dretafNumInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                // Retirer le focus de l'input
                dretafNumInput.blur();
                // Scroller vers les résultats et focus sur premier bouton Copier
                scrollToAnvResults();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                // Retirer le focus de l'input
                dretafNumInput.blur();
                // Trouver la ligne N° CO et remonter à la précédente (DRETAF)
                const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                let currentRowIdx = -1;
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-dretaf-num')) {
                        currentRowIdx = i;
                        break;
                    }
                }
                if (currentRowIdx > 0) {
                    anvFocus.rowIndex = currentRowIdx - 1;
                    anvFocus.btnIndex = 0;
                    applyAnvToutEnUnFocus();
                }
            }
        });
    }

    // Navigation clavier globale ANV
    setupAnvToutEnUnKeyboardNav();
}

// Mettre à jour uniquement le résultat ANV
function updateAnvResult() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    const result = getAnvResult();

    if (result) {
        if (resultContainer) {
            resultContainer.innerHTML = result;
        } else {
            const container = document.getElementById('tout-en-un-anv');
            if (container) {
                const newResult = document.createElement('div');
                newResult.className = 'tout-en-un-result';
                newResult.innerHTML = result;
                container.parentNode.appendChild(newResult);
            }
        }
    } else if (resultContainer) {
        resultContainer.remove();
    }
}

// Navigation clavier pour ANV tout-en-un
function setupAnvToutEnUnKeyboardNav() {
    // Retirer l'ancien handler s'il existe
    if (window.anvKeyHandler) {
        document.removeEventListener('keydown', window.anvKeyHandler);
    }

    window.anvKeyHandler = (e) => {
        const container = document.getElementById('tout-en-un-anv');
        if (!container) return;

        // Vérifier si on est dans les résultats
        if (anvFocus.inResults) {
            handleAnvResultsNav(e);
            return;
        }

        const rows = container.querySelectorAll('.tout-en-un-row');
        if (rows.length === 0) return;

        // Ignorer si on est dans un input et ce n'est pas une touche de navigation
        if (document.activeElement.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate');
            // Trouver le prochain bouton non sélectionné vers la droite
            let nextIndex = anvFocus.btnIndex + 1;
            while (nextIndex < buttons.length && buttons[nextIndex].classList.contains('selected')) {
                nextIndex++;
            }
            if (nextIndex < buttons.length) {
                anvFocus.btnIndex = nextIndex;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input, .tout-en-un-validate');
            // Trouver le prochain bouton non sélectionné vers la gauche
            let prevIndex = anvFocus.btnIndex - 1;
            while (prevIndex >= 0 && buttons[prevIndex].classList.contains('selected')) {
                prevIndex--;
            }
            if (prevIndex >= 0) {
                anvFocus.btnIndex = prevIndex;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Permettre navigation vers TOUTES les lignes
            if (anvFocus.rowIndex < rows.length - 1) {
                anvFocus.rowIndex++;
                anvFocus.btnIndex = 0;
                applyAnvToutEnUnFocus();
            } else {
                // Si on est à la dernière ligne, aller aux résultats
                scrollToAnvResults();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Permettre navigation vers TOUTES les lignes
            if (anvFocus.rowIndex > 0) {
                anvFocus.rowIndex--;
                anvFocus.btnIndex = 0;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-validate');
            const focusedBtn = buttons[anvFocus.btnIndex];
            if (focusedBtn && focusedBtn.tagName !== 'INPUT') {
                focusedBtn.click();
            }
        }
    };

    document.addEventListener('keydown', window.anvKeyHandler);
}

// Scroll vers les résultats ANV et activer la navigation
function scrollToAnvResults() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    if (!resultContainer) return;

    // Activer le mode résultats
    anvFocus.inResults = true;
    anvFocus.resultIndex = 0;

    // Scroller pour que le titre RÉSULTAT soit en haut de l'écran
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Appliquer le focus sur le premier bouton Copier
    setTimeout(() => applyAnvResultsFocus(), 100);
}

// Appliquer le focus visuel sur les résultats ANV
function applyAnvResultsFocus() {
    // Retirer tous les focus des boutons de choix
    document.querySelectorAll('#tout-en-un-anv .tout-en-un-btn, #tout-en-un-anv .tout-en-un-input').forEach(el => {
        el.classList.remove('focused');
    });

    // Retirer tous les focus des boutons Copier
    document.querySelectorAll('.tout-en-un-result .copy-btn-small').forEach(el => {
        el.classList.remove('focused');
    });

    // Appliquer le focus au bouton actuel (sans scroll pour garder RÉSULTAT en haut)
    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length > 0 && anvFocus.resultIndex < copyBtns.length) {
        copyBtns[anvFocus.resultIndex].classList.add('focused');
    }
}

// Navigation clavier dans les résultats ANV
function handleAnvResultsNav(e) {
    const copyBtns = document.querySelectorAll('.tout-en-un-result .copy-btn-small');
    if (copyBtns.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (anvFocus.resultIndex < copyBtns.length - 1) {
            anvFocus.resultIndex++;
            applyAnvResultsFocus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (anvFocus.resultIndex > 0) {
            anvFocus.resultIndex--;
            applyAnvResultsFocus();
        } else {
            // Revenir aux choix - applyAnvToutEnUnFocus s'occupe du scroll centré
            anvFocus.inResults = false;
            const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
            anvFocus.rowIndex = rows.length - 1;
            anvFocus.btnIndex = 0;
            applyAnvToutEnUnFocus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        // Cliquer sur le bouton Copier focalisé
        if (copyBtns[anvFocus.resultIndex]) {
            copyBtns[anvFocus.resultIndex].click();
        }
    }
}

// =====================
// FONCTIONS ADMIN
// =====================

function addCategory() {
    showModal('Nouvelle catégorie', `
        <div class="form-group">
            <label>Nom de la catégorie :</label>
            <input type="text" id="new-cat-name" class="modal-input">
        </div>
    `, () => {
        const name = document.getElementById('new-cat-name').value.trim();
        if (name && !courriers[name]) {
            courriers[name] = {};
            saveCourriers();
            renderCategories();
        }
    });
    setTimeout(() => document.getElementById('new-cat-name')?.focus(), 100);
}

function renameCategory(oldName) {
    showModal('Renommer la catégorie', `
        <div class="form-group">
            <label>Nouveau nom :</label>
            <input type="text" id="rename-cat" class="modal-input" value="${oldName}">
        </div>
    `, () => {
        const newName = document.getElementById('rename-cat').value.trim();
        if (newName && newName !== oldName && !courriers[newName]) {
            courriers[newName] = courriers[oldName];
            delete courriers[oldName];
            saveCourriers();
            renderCategories();
        }
    });
    setTimeout(() => document.getElementById('rename-cat')?.focus(), 100);
}

function deleteCategory(name) {
    showModal('Supprimer la catégorie', `
        <p>Êtes-vous sûr de vouloir supprimer "<b>${name}</b>" et toutes ses sous-catégories ?</p>
    `, () => {
        delete courriers[name];
        saveCourriers();
        renderCategories();
        document.getElementById('subcategories').innerHTML = '<p class="placeholder">Sélectionnez une catégorie</p>';
        document.getElementById('template-display').classList.add('hidden');
    });
}

function addSubcategory(category) {
    showModal('Nouvelle sous-catégorie', `
        <div class="form-group">
            <label>Nom :</label>
            <input type="text" id="new-subcat-name" class="modal-input">
        </div>
        <div class="form-group">
            <label>Texte du courrier :</label>
            <textarea id="new-subcat-texte" class="modal-textarea" rows="6"></textarea>
        </div>
        <div class="form-group">
            <label>Commentaire (optionnel) :</label>
            <textarea id="new-subcat-comment" class="modal-textarea" rows="2"></textarea>
        </div>
    `, () => {
        const name = document.getElementById('new-subcat-name').value.trim();
        const texte = document.getElementById('new-subcat-texte').value;
        const comment = document.getElementById('new-subcat-comment').value;

        if (name && !courriers[category][name]) {
            courriers[category][name] = {
                texte: texte,
                commentaire: comment || null
            };
            saveCourriers();
            // Refresh
            document.querySelector('.category-btn.active')?.click();
        }
    });
    setTimeout(() => document.getElementById('new-subcat-name')?.focus(), 100);
}

function renameSubcategory(category, oldName) {
    showModal('Renommer', `
        <div class="form-group">
            <label>Nouveau nom :</label>
            <input type="text" id="rename-subcat" class="modal-input" value="${oldName}">
        </div>
    `, () => {
        const newName = document.getElementById('rename-subcat').value.trim();
        if (newName && newName !== oldName && !courriers[category][newName]) {
            courriers[category][newName] = courriers[category][oldName];
            delete courriers[category][oldName];
            saveCourriers();
            document.querySelector('.category-btn.active')?.click();
        }
    });
    setTimeout(() => document.getElementById('rename-subcat')?.focus(), 100);
}

function deleteSubcategory(category, name) {
    showModal('Supprimer', `
        <p>Êtes-vous sûr de vouloir supprimer "<b>${name}</b>" ?</p>
    `, () => {
        delete courriers[category][name];
        saveCourriers();
        document.querySelector('.category-btn.active')?.click();
    });
}

// Modifier le texte
document.getElementById('edit-texte-btn').addEventListener('click', () => {
    if (!currentData) return;

    const currentTexte = currentData.texte;
    showModal('Modifier le texte', `
        <div class="form-group">
            <label>Texte du courrier :</label>
            <textarea id="edit-texte" class="modal-textarea" rows="10">${currentTexte}</textarea>
            <small>Utilisez {VARIABLE} pour les champs dynamiques (ex: {MOIS}).</small>
        </div>
    `, () => {
        currentData.texte = document.getElementById('edit-texte').value;
        courriers[currentCategory][currentSubcat] = currentData;
        saveCourriers();
        document.getElementById('template-text').textContent = currentData.texte;
    });
});

// Modifier le commentaire
document.getElementById('edit-comment-btn').addEventListener('click', () => {
    if (!currentData) return;

    let content = '';
    if (typeof currentData.commentaire === 'object' && currentData.commentaire.type === 'choix') {
        // Commentaire avec choix
        content = `
            <p><b>Type : Choix multiples</b></p>
            ${currentData.commentaire.boutons.map((b, i) => `
                <div class="form-group">
                    <label>Bouton "${b.label}" :</label>
                    <textarea id="edit-choice-${i}" class="modal-textarea" rows="3">${b.texte}</textarea>
                </div>
            `).join('')}
        `;
        showModal('Modifier les commentaires', content, () => {
            currentData.commentaire.boutons.forEach((b, i) => {
                b.texte = document.getElementById(`edit-choice-${i}`).value;
            });
            courriers[currentCategory][currentSubcat] = currentData;
            saveCourriers();
        });
    } else {
        // Commentaire simple
        content = `
            <div class="form-group">
                <label>Commentaire :</label>
                <textarea id="edit-comment" class="modal-textarea" rows="4">${currentData.commentaire || ''}</textarea>
            </div>
        `;
        showModal('Modifier le commentaire', content, () => {
            currentData.commentaire = document.getElementById('edit-comment').value || null;
            courriers[currentCategory][currentSubcat] = currentData;
            saveCourriers();
            if (currentData.commentaire) {
                document.getElementById('comment-text').textContent = currentData.commentaire;
            }
        });
    }
});

// Fermer modal avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('modal').classList.add('hidden');
    }
    if (e.key === 'Enter' && !document.getElementById('modal').classList.contains('hidden')) {
        const textarea = document.activeElement;
        if (textarea.tagName !== 'TEXTAREA') {
            document.getElementById('modal-confirm').click();
        }
    }
});

// Initialisation
renderCategories();
