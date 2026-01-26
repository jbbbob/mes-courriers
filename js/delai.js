// =====================
// MODULE DÉLAI COMPLET - INTERFACE TOUT-EN-UN
// =====================

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
    if (!toutEnUnState.type || !toutEnUnState.dca) return null;

    const nbMois = parseInt(toutEnUnState.mois) || 0;
    const moisDisplay = toutEnUnState.mois || '...';

    let texteCourrier = null;
    let commentaireTexte = null;

    // Cas > 36 mois
    if (nbMois > 36) {
        texteCourrier = `Vous sollicitez un délai de paiement sur ${moisDisplay} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

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
    // Cas DCA = Non (toujours afficher le courrier demandant les PJ, peu importe le nombre de mois)
    else if (toutEnUnState.dca === 'non' && toutEnUnState.aeti) {
        texteCourrier = `Vous sollicitez un délai de paiement sur ${moisDisplay} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

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
        commentaireTexte = `SUR PO REFUS ${codeRefus} en raison de l'absence de justificatifs. Une demande de pièces complémentaires a été transmise via SCRIBE.
+
${ligneSupp}`;
    }
    // Cas normal (DCA = Oui)
    else if (toutEnUnState.dca === 'oui' && toutEnUnState.plus50k) {
        const is50kPlus = toutEnUnState.plus50k === 'oui';
        texteCourrier = is50kPlus ? data.texteOui : data.texteNon;
        texteCourrier = texteCourrier.replace(/\{MOIS\}/g, moisDisplay);
        commentaireTexte = is50kPlus ? data.commentaires[toutEnUnState.type].plus50k : data.commentaires[toutEnUnState.type].normal;
    }

    if (!texteCourrier && !commentaireTexte) return null;

    // Objet pour les demandes d'échéancier
    const objet = `demande d'échéancier sur ${moisDisplay} mois`;

    return buildResultHTML(texteCourrier, commentaireTexte, objet);
}

// Construire le HTML du résultat
function buildResultHTML(texteCourrier, commentaireTexte, objet) {
    let html = '';

    // Section OBJET (si présent)
    if (objet) {
        html += `
            <div class="result-section">
                <div class="result-title">OBJET</div>
                <div class="result-content">${objet}</div>
                <button type="button" class="copy-btn-small" onclick="copyResultText('objet')">Copier</button>
                <span class="copy-feedback-inline" id="feedback-objet"></span>
            </div>
        `;
    }

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
        commentaire: commentaireTexte,
        objet: objet
    };

    return html;
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
// MODULE DÉLAI DCA - INTERFACE TOUT-EN-UN
// =====================

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
// MODULE DÉLAI CO EN COURS - INTERFACE TOUT-EN-UN
// =====================

function startDelaiCo(data) {
    coState = {
        totalite: null,
        actifRadie: null,
        coApresDemande: null,
        dateDemandeDelai: '',
        numerosContrainte: [''],
        datesSignification: [''],
        ribPresent: null,
        mois: '',
        echeance: '',
        telCj: '',
        mailCj: ''
    };
    coFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };
    coData = data;

    document.getElementById('copy-comment-btn').style.display = 'none';
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('template-display').classList.remove('hidden');

    renderDelaiCo();
}

function renderDelaiCo(focusField = null, focusIndex = null, skipFocus = false) {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');

    let html = `<div class="tout-en-un-container" id="tout-en-un-co">`;
    let rowIndex = 0;

    // Ligne 1: CO SUR TOTALITÉ ?
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

    // Si TOTALITÉ = OUI : afficher MOIS, TEL CJ et MAIL CJ
    if (coState.totalite === 'OUI') {
        // Ligne MOIS
        const moisHasValueOui = coState.mois.trim() !== '';
        html += `
            <div class="tout-en-un-row ${moisHasValueOui ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">MOIS</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-mois" value="${coState.mois}" placeholder="Ex: 12">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne TEL CJ
        const telHasValueOui = coState.telCj.trim() !== '';
        html += `
            <div class="tout-en-un-row ${telHasValueOui ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">TEL CJ</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-tel-cj" value="${coState.telCj}" placeholder="Ex: 01 23 45 67 89">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne MAIL CJ
        const mailHasValueOui = coState.mailCj.trim() !== '';
        html += `
            <div class="tout-en-un-row ${mailHasValueOui ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">MAIL CJ</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-mail-cj" value="${coState.mailCj}" placeholder="Ex: contact@huissier.fr">
                </div>
            </div>
        `;
        rowIndex++;
    }

    // Si TOTALITÉ = NON : afficher ACTIF/RADIÉ et RIB directement, puis les 4 champs
    if (coState.totalite === 'NON') {
        // Ligne ACTIF OU RADIÉ
        const actifRadieHasSelection = coState.actifRadie !== null;
        html += `
            <div class="tout-en-un-row ${actifRadieHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">ACTIF OU RADIÉ ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${coState.actifRadie === 'ACTIF' ? 'selected' : ''}" data-field="actifRadie" data-value="ACTIF">ACTIF</button>
                    <button type="button" class="tout-en-un-btn ${coState.actifRadie === 'RADIÉ' ? 'selected' : ''}" data-field="actifRadie" data-value="RADIÉ">RADIÉ</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne CO APRÈS DEMANDE DE DÉLAI ?
        const coApresDemandeHasSelection = coState.coApresDemande !== null;
        html += `
            <div class="tout-en-un-row ${coApresDemandeHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">TOUTES LES CO SONT VALABLES ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${coState.coApresDemande === 'OUI' ? 'selected' : ''}" data-field="coApresDemande" data-value="OUI">OUI</button>
                    <button type="button" class="tout-en-un-btn ${coState.coApresDemande === 'NON' ? 'selected' : ''}" data-field="coApresDemande" data-value="NON">NON</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Si TOUTES LES CO SONT VALABLES = NON, afficher date demande délai, numéros de contrainte et dates de signification
        if (coState.coApresDemande === 'NON') {
            // Ligne DATE DE DEMANDE DE DÉLAI
            const dateDemandeHasValue = coState.dateDemandeDelai.trim() !== '';
            html += `
                <div class="tout-en-un-row ${dateDemandeHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
                    <div class="tout-en-un-label">DATE DE DEMANDE DE DÉLAI</div>
                    <div class="tout-en-un-buttons">
                        <input type="text" class="tout-en-un-input" id="tout-en-un-date-demande-delai" value="${coState.dateDemandeDelai}" placeholder="Ex: 01/01/2025">
                    </div>
                </div>
            `;
            rowIndex++;

            // Ligne NUMÉRO(S) DE CONTRAINTE
            const contrainteHasValue = coState.numerosContrainte.some(val => val.trim() !== '');
            let contraintesInputs = coState.numerosContrainte.map((val, i) =>
                `<input type="text" class="tout-en-un-input multi-input" data-field="numerosContrainte" data-index="${i}" value="${val}" placeholder="Ex: 123456">`
            ).join('');
            html += `
                <div class="tout-en-un-row ${contrainteHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
                    <div class="tout-en-un-label">NUMÉRO(S) DE CONTRAINTE</div>
                    <div class="tout-en-un-buttons multi-inputs-container">
                        ${contraintesInputs}
                    </div>
                </div>
            `;
            rowIndex++;

            // Ligne DATE(S) DE SIGNIFICATION
            const datesHasValue = coState.datesSignification.some(val => val.trim() !== '');
            let datesInputs = coState.datesSignification.map((val, i) =>
                `<input type="text" class="tout-en-un-input multi-input" data-field="datesSignification" data-index="${i}" value="${val}" placeholder="Ex: 15/01/2025">`
            ).join('');
            html += `
                <div class="tout-en-un-row ${datesHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
                    <div class="tout-en-un-label">DATE(S) DE SIGNIFICATION</div>
                    <div class="tout-en-un-buttons multi-inputs-container">
                        ${datesInputs}
                    </div>
                </div>
            `;
            rowIndex++;
        }

        // RIB PRÉSENT toujours visible si TOTALITÉ = NON
        const ribHasSelection = coState.ribPresent !== null;
        html += `
            <div class="tout-en-un-row ${ribHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">RIB PRÉSENT ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${coState.ribPresent === 'OUI' ? 'selected' : ''}" data-field="ribPresent" data-value="OUI">OUI</button>
                    <button type="button" class="tout-en-un-btn ${coState.ribPresent === 'NON' ? 'selected' : ''}" data-field="ribPresent" data-value="NON">NON</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne MOIS
        const moisHasValue = coState.mois.trim() !== '';
        html += `
            <div class="tout-en-un-row ${moisHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">MOIS</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-mois" value="${coState.mois}" placeholder="Ex: 12">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne 1ÈRE ÉCHÉANCE
        const echeanceHasValue = coState.echeance.trim() !== '';
        html += `
            <div class="tout-en-un-row ${echeanceHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">1ÈRE ÉCHÉANCE</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-echeance" value="${coState.echeance}" placeholder="Ex: 15/02/2025">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne TEL CJ
        const telHasValue = coState.telCj.trim() !== '';
        html += `
            <div class="tout-en-un-row ${telHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">TEL CJ</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="tout-en-un-tel-cj" value="${coState.telCj}" placeholder="Ex: 01 23 45 67 89">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne MAIL CJ
        const mailHasValue = coState.mailCj.trim() !== '';
        html += `
            <div class="tout-en-un-row ${mailHasValue ? 'has-selection' : ''}" data-row="${rowIndex}">
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
        html += `<div class="tout-en-un-result">`;

        // Section OBJET
        const objetText = `demande d'échéancier sur ${coState.mois || '...'} mois`;
        html += `
            <div class="delai-category-title">OBJET</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${objetText}</div>
                <button type="button" class="copy-btn-small" id="copy-co-objet">Copier</button>
                <span class="copy-feedback-inline" id="feedback-co-objet"></span>
            </div>`;

        // Section TEXTE DU COURRIER
        html += `
            <div class="delai-category-title">TEXTE DU COURRIER</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${result.courrier.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" id="copy-co-courrier">Copier</button>
                <span class="copy-feedback-inline" id="feedback-co-courrier"></span>
            </div>`;

        // Section AFFAIRE WATT (si applicable)
        if (result.watt) {
            html += `
            <div class="delai-category-title">AFFAIRE WATT</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${result.watt.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" id="copy-co-watt">Copier</button>
                <span class="copy-feedback-inline" id="feedback-co-watt"></span>
            </div>`;
        }

        html += `</div>`;
    }

    commentText.innerHTML = html;
    setupDelaiCoEvents();

    // Si on skip le focus (géré manuellement ailleurs)
    if (skipFocus) {
        return;
    }

    // Si on a un champ spécifique à focus (après ajout d'un input multiple)
    if (focusField !== null && focusIndex !== null) {
        setTimeout(() => {
            const targetInput = document.querySelector(`#tout-en-un-co .multi-input[data-field="${focusField}"][data-index="${focusIndex}"]`);
            if (targetInput) {
                // Enlever le focus visuel de tous les éléments
                document.querySelectorAll('#tout-en-un-co .focused').forEach(el => el.classList.remove('focused'));
                targetInput.classList.add('focused');
                targetInput.focus();
                // Centrer la ligne au milieu de l'écran
                targetInput.closest('.tout-en-un-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 10);
    } else {
        applyDelaiCoFocus();
    }
}

function getCoResult() {
    // Cas TOTALITÉ = OUI
    if (coState.totalite === 'OUI') {
        let texte = coData.texteOui;
        texte = texte.replace('{TEL_CJ}', coState.telCj || '');
        texte = texte.replace('{MAIL_CJ}', coState.mailCj || '');

        const watt = `Courrier envoyé informant l'usager que la totalité de sa dette a été transmise à l'étude d'huissier, et qu'il doit désormais prendre contact avec celle-ci pour convenir d'un échéancier.`;

        return { courrier: texte, watt: watt };
    }

    // Cas TOTALITÉ = NON - besoin de ACTIF/RADIÉ, CO APRÈS DEMANDE et RIB PRÉSENT
    if (coState.totalite === 'NON' && coState.actifRadie !== null && coState.coApresDemande !== null && coState.ribPresent !== null) {
        let courrier;
        let watt = null;

        const mois = coState.mois || '...';
        const echeance = coState.echeance || '...';
        const telCj = coState.telCj || '...';
        const mailCj = coState.mailCj || '...';

        // ACTIF + RIB OUI
        if (coState.actifRadie === 'ACTIF' && coState.ribPresent === 'OUI') {
            courrier = `Vous avez sollicité la mise en place d'un échéancier en ${mois} mensualités pour le règlement de votre dette.

Nous vous informons que ce délai de paiement a été accordé pour la partie en recouvrement amiable, avec une première échéance prévue le ${echeance}.

Une notification distincte vous sera adressée, précisant les montants et les dates de règlement de chaque échéance.

Ce délai de paiement sera maintenu uniquement si vous respectez à la fois :
- les échéances prévues dans l'échéancier,
- le règlement de vos cotisations courantes.
Le respect de ces deux conditions est indispensable pour conserver le bénéfice du délai accordé.

En revanche, pour la partie actuellement en recouvrement forcé, nous vous invitons à contacter directement l'étude d'huissier en charge de votre dossier (tél : ${telCj}, mail : ${mailCj}) afin de convenir d'un éventuel échéancier et d'éviter l'application de frais supplémentaires.`;

            const moisNum = parseInt(coState.mois) || 0;
            const poType = moisNum > 5 ? 'PO PR' : 'PO APPROB';
            watt = `Délai fait sur la partie amiable + Courrier envoyé informant l'usager qu'une partie de sa dette a été transmise à l'étude d'huissier, et qu'il doit désormais prendre contact avec celle-ci pour convenir d'un échéancier.
SUR ${poType}
${mois}+1 échéances
à partir de ${echeance}`;
        }
        // ACTIF + RIB NON
        else if (coState.actifRadie === 'ACTIF' && coState.ribPresent === 'NON') {
            courrier = `Vous avez sollicité la mise en place d'un échéancier en ${mois} mensualités pour le règlement de votre dette.

Nous vous informons que ce délai de paiement a été accordé pour la partie en recouvrement amiable, avec une première échéance prévue le ${echeance}.

Une notification séparée vous sera adressée, précisant l'échéancier accordé ainsi que le mandat de prélèvement à nous retourner.
Nous vous rappelons que, votre demande étant supérieure à 5 mois, l'accord de l'échéancier est conditionné au retour de ce mandat. Sans ce document, l'échéancier sera annulé.

Ce délai de paiement sera maintenu uniquement si vous respectez à la fois :
- les échéances prévues dans l'échéancier,
- le règlement de vos cotisations courantes.
Le respect de ces deux conditions est indispensable pour conserver le bénéfice du délai accordé.

En revanche, pour la partie actuellement en recouvrement forcé, nous vous invitons à contacter directement l'étude d'huissier en charge de votre dossier (tél : ${telCj}, mail : ${mailCj}) afin de convenir d'un éventuel échéancier et d'éviter l'application de frais supplémentaires.`;

            watt = `EN ATTENTE MANDAT

Délai fait sur la partie amiable + Courrier envoyé informant l'usager qu'une partie de sa dette a été transmise à l'étude d'huissier, et qu'il doit désormais prendre contact avec celle-ci pour convenir d'un échéancier.
SUR PO PRO PR
${mois}+1 échéances
à partir de ${echeance}`;
        }
        // RADIÉ + RIB OUI
        else if (coState.actifRadie === 'RADIÉ' && coState.ribPresent === 'OUI') {
            courrier = `Vous avez sollicité la mise en place d'un échéancier en ${mois} mensualités pour le règlement de votre dette.

Nous vous informons que ce délai de paiement a été accordé pour la partie en recouvrement amiable, avec une première échéance prévue le ${echeance}.

Une notification distincte vous sera adressée, précisant les montants et les dates de règlement de chaque échéance.

En revanche, pour la partie actuellement en recouvrement forcé, nous vous invitons à contacter directement l'étude d'huissier en charge de votre dossier (tél : ${telCj}, mail : ${mailCj}) afin de convenir d'un éventuel échéancier et d'éviter l'application de frais supplémentaires.`;

            const moisNum = parseInt(coState.mois) || 0;
            const poType = moisNum > 5 ? 'PO PR' : 'PO APPROB';
            watt = `Délai fait sur la partie amiable + Courrier envoyé informant l'usager qu'une partie de sa dette a été transmise à l'étude d'huissier, et qu'il doit désormais prendre contact avec celle-ci pour convenir d'un échéancier.
SUR ${poType}
${mois}+1 échéances
à partir de ${echeance}`;
        }
        // RADIÉ + RIB NON
        else if (coState.actifRadie === 'RADIÉ' && coState.ribPresent === 'NON') {
            courrier = `Vous avez sollicité la mise en place d'un échéancier en ${mois} mensualités pour le règlement de votre dette.

Nous vous informons que ce délai de paiement a été accordé pour la partie en recouvrement amiable, avec une première échéance prévue le ${echeance}.

Une notification séparée vous sera adressée, précisant l'échéancier accordé ainsi que le mandat de prélèvement à nous retourner.
Nous vous rappelons que, votre demande étant supérieure à 5 mois, l'accord de l'échéancier est conditionné au retour de ce mandat. Sans ce document, l'échéancier sera annulé.

En revanche, pour la partie actuellement en recouvrement forcé, nous vous invitons à contacter directement l'étude d'huissier en charge de votre dossier (tél : ${telCj}, mail : ${mailCj}) afin de convenir d'un éventuel échéancier et d'éviter l'application de frais supplémentaires.`;

            watt = `EN ATTENTE MANDAT

Délai fait sur la partie amiable + Courrier envoyé informant l'usager qu'une partie de sa dette a été transmise à l'étude d'huissier, et qu'il doit désormais prendre contact avec celle-ci pour convenir d'un échéancier.
SUR PO PRO PR
${mois}+1 échéances
à partir de ${echeance}`;
        }

        return { courrier, watt };
    }

    return null;
}

function copyCoResult(type) {
    const result = getCoResult();
    if (!result) return;

    let textToCopy = '';
    let feedbackId = '';

    if (type === 'objet') {
        textToCopy = `demande d'échéancier sur ${coState.mois || '...'} mois`;
        feedbackId = 'feedback-co-objet';
    } else if (type === 'courrier') {
        textToCopy = result.courrier;
        feedbackId = 'feedback-co-courrier';
    } else if (type === 'watt') {
        textToCopy = result.watt;
        feedbackId = 'feedback-co-watt';
    }

    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const feedback = document.getElementById(feedbackId);
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
        // Permettre de sélectionner avec Entrée
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            if (!field) return;
            if (coState[field] === value) return;

            coState[field] = value;

            // Gestion du flux de navigation
            if (field === 'totalite') {
                // Réinitialiser les champs suivants
                coState.actifRadie = null;
                coState.coApresDemande = null;
                coState.dateDemandeDelai = '';
                coState.numerosContrainte = [''];
                coState.datesSignification = [''];
                coState.ribPresent = null;
                coState.mois = '';
                coState.echeance = '';
                coState.telCj = '';
                coState.mailCj = '';
                coFocus.rowIndex = 1; // MOIS pour OUI, ACTIF/RADIÉ pour NON
                coFocus.btnIndex = 0;
            }
            else if (field === 'actifRadie') {
                // Aller sur TOUTES LES CO SONT VALABLES
                coFocus.rowIndex = 2;
                coFocus.btnIndex = 0;
            }
            else if (field === 'coApresDemande') {
                // Réinitialiser les champs de contrainte si on change
                coState.dateDemandeDelai = '';
                coState.numerosContrainte = [''];
                coState.datesSignification = [''];
                // Si NON, aller sur date demande délai (row 3), sinon sur RIB PRÉSENT (row 3)
                coFocus.rowIndex = 3;
                coFocus.btnIndex = 0;
            }
            else if (field === 'ribPresent') {
                // Focus sur MOIS après le rendu
                renderDelaiCo(null, null, true); // skipFocus = true
                // Trouver l'index de la ligne MOIS dynamiquement
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-mois')) {
                        coFocus.rowIndex = i;
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                // Enlever le focus visuel et mettre sur MOIS
                document.querySelectorAll('#tout-en-un-co .focused').forEach(el => el.classList.remove('focused'));
                const moisInput = document.getElementById('tout-en-un-mois');
                if (moisInput) {
                    moisInput.classList.add('focused');
                    moisInput.focus();
                    // Centrer la ligne au milieu de l'écran
                    moisInput.closest('.tout-en-un-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return; // Ne pas appeler renderDelaiCo() une deuxième fois
            }

            renderDelaiCo();
        });
    });

    // Événement sur date de demande de délai
    const dateDemandeDelaiInput = document.getElementById('tout-en-un-date-demande-delai');
    if (dateDemandeDelaiInput) {
        dateDemandeDelaiInput.addEventListener('input', (e) => {
            coState.dateDemandeDelai = e.target.value;
            updateCoResult();
        });
        dateDemandeDelaiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Trouver l'index de la ligne NUMÉRO DE CONTRAINTE dynamiquement
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('.multi-input[data-field="numerosContrainte"]')) {
                        coFocus.rowIndex = i;
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                // Enlever le focus visuel de tous les éléments
                document.querySelectorAll('#tout-en-un-co .focused').forEach(el => el.classList.remove('focused'));
                // Focus sur le premier numéro de contrainte
                const firstContrainte = document.querySelector('#tout-en-un-co .multi-input[data-field="numerosContrainte"][data-index="0"]');
                if (firstContrainte) {
                    firstContrainte.classList.add('focused');
                    firstContrainte.focus();
                    // Centrer la ligne au milieu de l'écran
                    firstContrainte.closest('.tout-en-un-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    // Événements sur les inputs multiples (numéros de contrainte et dates de signification)
    document.querySelectorAll('#tout-en-un-co .multi-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target.dataset.field;
            const index = parseInt(e.target.dataset.index);
            coState[field][index] = e.target.value;
            updateCoResult();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const field = e.target.dataset.field;
                const index = parseInt(e.target.dataset.index);
                // Ajouter un nouveau champ seulement si c'est le dernier et qu'il n'est pas vide
                if (index === coState[field].length - 1 && e.target.value.trim() !== '') {
                    coState[field].push('');
                    const newIndex = coState[field].length - 1;
                    renderDelaiCo(field, newIndex);
                }
            }
            // Tab sur la dernière date de signification -> aller sur RIB PRÉSENT
            if (e.key === 'Tab' && !e.shiftKey) {
                const field = e.target.dataset.field;
                const index = parseInt(e.target.dataset.index);
                if (field === 'datesSignification' && index === coState[field].length - 1) {
                    e.preventDefault();
                    // Trouver l'index de la ligne RIB PRÉSENT dynamiquement
                    const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].querySelector('.tout-en-un-btn[data-field="ribPresent"]')) {
                            coFocus.rowIndex = i;
                            break;
                        }
                    }
                    coFocus.btnIndex = 0;
                    // Enlever le focus visuel de tous les éléments
                    document.querySelectorAll('#tout-en-un-co .focused').forEach(el => el.classList.remove('focused'));
                    // Focus sur le premier bouton RIB PRÉSENT (OUI)
                    const ribOuiBtn = document.querySelector('#tout-en-un-co .tout-en-un-btn[data-field="ribPresent"][data-value="OUI"]');
                    if (ribOuiBtn) {
                        ribOuiBtn.classList.add('focused');
                        ribOuiBtn.focus();
                        // Centrer la ligne au milieu de l'écran
                        ribOuiBtn.closest('.tout-en-un-row').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        });
    });

    const moisInput = document.getElementById('tout-en-un-mois');
    if (moisInput) {
        moisInput.addEventListener('input', (e) => {
            coState.mois = e.target.value;
            updateCoResult();
        });
        moisInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                moisInput.blur();
                // Trouver l'index de la ligne ÉCHÉANCE
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-echeance')) {
                        coFocus.rowIndex = i;
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moisInput.blur();
                // Trouver l'index de la ligne précédente (RIB PRÉSENT)
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-mois')) {
                        coFocus.rowIndex = Math.max(0, i - 1);
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            }
        });
    }

    const echeanceInput = document.getElementById('tout-en-un-echeance');
    if (echeanceInput) {
        echeanceInput.addEventListener('input', (e) => {
            coState.echeance = e.target.value;
            updateCoResult();
        });
        echeanceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                echeanceInput.blur();
                // Trouver l'index de la ligne TEL CJ
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-tel-cj')) {
                        coFocus.rowIndex = i;
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                echeanceInput.blur();
                // Trouver l'index de la ligne précédente (MOIS)
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-echeance')) {
                        coFocus.rowIndex = Math.max(0, i - 1);
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            }
        });
    }

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
                // Trouver l'index de la ligne MAIL CJ
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-mail-cj')) {
                        coFocus.rowIndex = i;
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                telInput.blur();
                // Trouver l'index de la ligne précédente
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-tel-cj')) {
                        coFocus.rowIndex = Math.max(0, i - 1);
                        break;
                    }
                }
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
                // Trouver l'index de la ligne TEL CJ
                const rows = document.querySelectorAll('#tout-en-un-co .tout-en-un-row');
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].querySelector('#tout-en-un-tel-cj')) {
                        coFocus.rowIndex = i;
                        break;
                    }
                }
                coFocus.btnIndex = 0;
                applyDelaiCoFocus();
            }
        });
    }

    // Boutons de copie
    const copyObjetBtn = document.getElementById('copy-co-objet');
    if (copyObjetBtn) {
        copyObjetBtn.addEventListener('click', () => copyCoResult('objet'));
    }

    const copyCourrierBtn = document.getElementById('copy-co-courrier');
    if (copyCourrierBtn) {
        copyCourrierBtn.addEventListener('click', () => copyCoResult('courrier'));
    }

    const copyWattBtn = document.getElementById('copy-co-watt');
    if (copyWattBtn) {
        copyWattBtn.addEventListener('click', () => copyCoResult('watt'));
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
    const result = getCoResult();

    if (result && resultContainer) {
        // Mettre à jour les contenus (OBJET, COURRIER, WATT)
        const blocks = resultContainer.querySelectorAll('.delai-comment-block');

        // Block 0 = OBJET
        if (blocks[0]) {
            const objetText = blocks[0].querySelector('.delai-comment-text');
            if (objetText) {
                objetText.innerHTML = `demande d'échéancier sur ${coState.mois || '...'} mois`;
            }
        }

        // Block 1 = COURRIER
        if (blocks[1]) {
            const courrierText = blocks[1].querySelector('.delai-comment-text');
            if (courrierText) {
                courrierText.innerHTML = result.courrier.replace(/\n/g, '<br>');
            }
        }

        // Block 2 = WATT si présent
        if (result.watt && blocks[2]) {
            const wattText = blocks[2].querySelector('.delai-comment-text');
            if (wattText) {
                wattText.innerHTML = result.watt.replace(/\n/g, '<br>');
            }
        }
    } else if (result && !resultContainer) {
        // Si le résultat n'existe pas encore, re-rendre
        renderDelaiCo();
    }
}

// =====================
// MODULE DÉLAI SOUMISSION
// =====================

function startDelaiSoumission() {
    soumissionState = {
        retourSoumission: null,
        coEnCours: null,
        actifRadie: null,
        ribPresent: null,
        dcaDrAJour: null,
        mois: '',
        echeance: '',
        telCj: '',
        mailCj: ''
    };
    soumissionFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

    document.getElementById('copy-comment-btn').style.display = 'none';
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('template-display').classList.remove('hidden');

    renderDelaiSoumission();
}

function renderDelaiSoumission() {
    const commentText = document.getElementById('comment-text');
    const commentSection = document.getElementById('comment-section');
    const commentHeader = document.getElementById('comment-header');

    document.getElementById('texte-section').classList.add('hidden');
    commentSection.classList.remove('hidden');
    commentHeader.classList.add('hidden');
    commentText.classList.remove('hidden');

    let html = `<div class="tout-en-un-container" id="tout-en-un-soumission">`;
    let rowIndex = 0;

    // Ligne 1: RETOUR SOUMISSION ?
    const retourHasSelection = soumissionState.retourSoumission !== null;
    html += `
        <div class="tout-en-un-row ${retourHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">RETOUR SOUMISSION ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${soumissionState.retourSoumission === 'OUI' ? 'selected' : ''}" data-field="retourSoumission" data-value="OUI">OUI</button>
                <button type="button" class="tout-en-un-btn ${soumissionState.retourSoumission === 'NON' ? 'selected' : ''}" data-field="retourSoumission" data-value="NON">NON</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Si RETOUR SOUMISSION = OUI, afficher les autres choix
    if (soumissionState.retourSoumission === 'OUI') {
        // Ligne CO EN COURS ?
        const coEnCoursHasSelection = soumissionState.coEnCours !== null;
        html += `
            <div class="tout-en-un-row ${coEnCoursHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">CO EN COURS ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${soumissionState.coEnCours === 'OUI' ? 'selected' : ''}" data-field="coEnCours" data-value="OUI">OUI</button>
                    <button type="button" class="tout-en-un-btn ${soumissionState.coEnCours === 'NON' ? 'selected' : ''}" data-field="coEnCours" data-value="NON">NON</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne ACTIF OU RADIÉ
        const actifRadieHasSelection = soumissionState.actifRadie !== null;
        html += `
            <div class="tout-en-un-row ${actifRadieHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">ACTIF OU RADIÉ ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${soumissionState.actifRadie === 'ACTIF' ? 'selected' : ''}" data-field="actifRadie" data-value="ACTIF">ACTIF</button>
                    <button type="button" class="tout-en-un-btn ${soumissionState.actifRadie === 'RADIÉ' ? 'selected' : ''}" data-field="actifRadie" data-value="RADIÉ">RADIÉ</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne RIB PRÉSENT
        const ribHasSelection = soumissionState.ribPresent !== null;
        html += `
            <div class="tout-en-un-row ${ribHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">RIB PRÉSENT ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${soumissionState.ribPresent === 'OUI' ? 'selected' : ''}" data-field="ribPresent" data-value="OUI">OUI</button>
                    <button type="button" class="tout-en-un-btn ${soumissionState.ribPresent === 'NON' ? 'selected' : ''}" data-field="ribPresent" data-value="NON">NON</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne MOIS
        html += `
            <div class="tout-en-un-row" data-row="${rowIndex}">
                <div class="tout-en-un-label">MOIS</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="soumission-mois" value="${soumissionState.mois}" placeholder="Ex: 36">
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne 1ÈRE ÉCHÉANCE
        html += `
            <div class="tout-en-un-row" data-row="${rowIndex}">
                <div class="tout-en-un-label">1ÈRE ÉCHÉANCE</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="soumission-echeance" value="${soumissionState.echeance}" placeholder="Ex: 15/02/2025">
                </div>
            </div>
        `;
        rowIndex++;

        // Si CO EN COURS = OUI, afficher TEL CJ et MAIL CJ
        if (soumissionState.coEnCours === 'OUI') {
            // Ligne TEL CJ
            html += `
                <div class="tout-en-un-row" data-row="${rowIndex}">
                    <div class="tout-en-un-label">TEL CJ</div>
                    <div class="tout-en-un-buttons">
                        <input type="text" class="tout-en-un-input" id="soumission-tel-cj" value="${soumissionState.telCj}" placeholder="Ex: 01 23 45 67 89">
                    </div>
                </div>
            `;
            rowIndex++;

            // Ligne MAIL CJ
            html += `
                <div class="tout-en-un-row" data-row="${rowIndex}">
                    <div class="tout-en-un-label">MAIL CJ</div>
                    <div class="tout-en-un-buttons">
                        <input type="text" class="tout-en-un-input" id="soumission-mail-cj" value="${soumissionState.mailCj}" placeholder="Ex: contact@huissier.fr">
                    </div>
                </div>
            `;
            rowIndex++;
        }
    }
    // Si RETOUR SOUMISSION = NON
    else if (soumissionState.retourSoumission === 'NON') {
        // Ligne DCA / DR À JOUR ?
        const dcaDrHasSelection = soumissionState.dcaDrAJour !== null;
        html += `
            <div class="tout-en-un-row ${dcaDrHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
                <div class="tout-en-un-label">DCA / DR À JOUR ?</div>
                <div class="tout-en-un-buttons">
                    <button type="button" class="tout-en-un-btn ${soumissionState.dcaDrAJour === 'OUI' ? 'selected' : ''}" data-field="dcaDrAJour" data-value="OUI">OUI</button>
                    <button type="button" class="tout-en-un-btn ${soumissionState.dcaDrAJour === 'NON' ? 'selected' : ''}" data-field="dcaDrAJour" data-value="NON">NON</button>
                </div>
            </div>
        `;
        rowIndex++;

        // Ligne MOIS
        html += `
            <div class="tout-en-un-row" data-row="${rowIndex}">
                <div class="tout-en-un-label">MOIS</div>
                <div class="tout-en-un-buttons">
                    <input type="text" class="tout-en-un-input" id="soumission-mois" value="${soumissionState.mois}" placeholder="Ex: 36">
                </div>
            </div>
        `;
        rowIndex++;
    }

    html += `</div>`;

    // Résultat
    const result = getSoumissionResult();
    if (result) {
        html += `<div class="tout-en-un-result">`;

        // Section OBJET
        const objetText = `demande d'échéancier sur ${soumissionState.mois || '...'} mois`;
        html += `
            <div class="delai-category-title">OBJET</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${objetText}</div>
                <button type="button" class="copy-btn-small" id="copy-soumission-objet">Copier</button>
                <span class="copy-feedback-inline" id="feedback-soumission-objet"></span>
            </div>`;

        // Section TEXTE DU COURRIER
        html += `
            <div class="delai-category-title">TEXTE DU COURRIER</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${result.courrier.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" id="copy-soumission-courrier">Copier</button>
                <span class="copy-feedback-inline" id="feedback-soumission-courrier"></span>
            </div>`;

        // Section COURRIER CJ (si CO EN COURS = OUI)
        if (result.courrierCJ) {
            html += `
            <div class="delai-category-title">COURRIER CJ</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${result.courrierCJ.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" id="copy-soumission-cj">Copier</button>
                <span class="copy-feedback-inline" id="feedback-soumission-cj"></span>
            </div>`;
        }

        // Section COMMENTAIRE AFFAIRE WATT
        if (result.commentaireWatt) {
            html += `
            <div class="delai-category-title">COMMENTAIRE AFFAIRE WATT</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${result.commentaireWatt.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" id="copy-soumission-watt">Copier</button>
                <span class="copy-feedback-inline" id="feedback-soumission-watt"></span>
            </div>`;
        }

        html += `</div>`;
    }

    commentText.innerHTML = html;
    setupDelaiSoumissionEvents();
    applySoumissionFocus();
}

function getSoumissionResult() {
    const mois = soumissionState.mois || '...';
    const echeance = soumissionState.echeance || '...';
    const telCj = soumissionState.telCj || '...';
    const mailCj = soumissionState.mailCj || '...';

    let courrier = '';
    let courrierCJ = null;
    let commentaireWatt = '';

    // Calcul du nombre d'échéances pour le commentaire Watt
    const nbEcheances = mois === '...' ? '...' : (parseInt(mois) + 1);

    // RETOUR SOUMISSION = NON
    if (soumissionState.retourSoumission === 'NON') {
        if (soumissionState.dcaDrAJour === null) {
            return null;
        }

        if (soumissionState.dcaDrAJour === 'NON') {
            courrier = `Nous vous informons que votre demande de délai, portant sur une durée exceptionnelle de ${mois} mois, nécessite l'accord de la direction.

À ce jour, nous avons bien réceptionné vos pièces justificatives et leur examen est en cours.

Nous vous rappelons également que vos déclarations de revenus ou de chiffre d'affaires doivent être à jour. À défaut, aucun accord de délai ne pourra être validé.

Bien qu'un accord formel sur l'échéancier n'ait pas encore été notifié, vous pouvez dès à présent commencer à régulariser votre situation en effectuant les versements correspondant aux mensualités proposées, afin de démontrer votre bonne foi.`;

            commentaireWatt = `Un courrier a été envoyé à l'usager afin de l'inviter à débuter les versements et à faire ses déclarations manquantes.
+
SUR PO RECEV mis en place`;
        }
        else if (soumissionState.dcaDrAJour === 'OUI') {
            courrier = `Nous vous informons que votre demande de délai, portant sur une durée exceptionnelle de ${mois} mois, nécessite l'accord de la direction.

À ce jour, nous avons bien réceptionné vos pièces justificatives et leur examen est en cours.

Bien qu'un accord formel sur l'échéancier n'ait pas encore été notifié, vous pouvez dès à présent commencer à régulariser votre situation en effectuant les versements correspondant aux mensualités proposées, afin de démontrer votre bonne foi.`;

            commentaireWatt = `Un courrier a été envoyé à l'usager afin de l'inviter à débuter les versements.
+
SUR PO RECEV mis en place`;
        }

        return { courrier, courrierCJ, commentaireWatt };
    }

    // RETOUR SOUMISSION = OUI
    if (soumissionState.retourSoumission !== 'OUI' || soumissionState.actifRadie === null || soumissionState.ribPresent === null || soumissionState.coEnCours === null) {
        return null;
    }

    // CO EN COURS = NON
    if (soumissionState.coEnCours === 'NON') {
        if (soumissionState.ribPresent === 'OUI') {
            // CO NON + RIB OUI
            courrier = `Après examen de vos pièces justificatives, nous vous informons qu'un délai exceptionnel de ${mois} mois vous est accordé à compter du ${echeance}.

Une notification distincte vous sera adressée, précisant les montants et les dates de règlement de chaque échéance.`;
            if (soumissionState.actifRadie === 'ACTIF') {
                courrier += `

Ce délai de paiement sera maintenu uniquement si vous respectez à la fois :
- les échéances prévues dans l'échéancier,
- le règlement de vos cotisations courantes.
Le respect de ces deux conditions est indispensable pour conserver le bénéfice du délai accordé.`;
            }
            commentaireWatt = `L'usager a été informé par courrier de notre décision.

SUR PO PRO PR
${nbEcheances} échéances
à partir de ${echeance}`;
        }
        else if (soumissionState.ribPresent === 'NON') {
            // CO NON + RIB NON
            courrier = `Après examen de vos pièces justificatives, nous vous informons qu'un délai exceptionnel de ${mois} mois vous est accordé à compter du ${echeance}.

Une notification séparée vous sera adressée, précisant l'échéancier accordé ainsi que le mandat de prélèvement à nous retourner.
Nous vous rappelons que, votre demande étant supérieure à 5 mois, l'accord de l'échéancier est conditionné au retour de ce mandat. Sans ce document, l'échéancier sera annulé.`;
            if (soumissionState.actifRadie === 'ACTIF') {
                courrier += `

Ce délai de paiement sera maintenu uniquement si vous respectez à la fois :
- les échéances prévues dans l'échéancier,
- le règlement de vos cotisations courantes.
Le respect de ces deux conditions est indispensable pour conserver le bénéfice du délai accordé.`;
            }
            commentaireWatt = `EN ATTENTE MANDAT

L'usager a été informé par courrier de notre décision.

SUR PO PRO PR
${nbEcheances} échéances
à partir de ${echeance}`;
        }
    }
    // CO EN COURS = OUI
    else if (soumissionState.coEnCours === 'OUI') {
        // Courrier CJ commun pour tous les cas CO EN COURS = OUI
        courrierCJ = `Nous vous informons qu'après examen de la demande de l'usager, nous donnons notre accord pour un étalement sur ${mois} mois. Merci de bien vouloir vous rapprocher de ce dernier afin de mettre en place l'échéancier correspondant.`;

        if (soumissionState.ribPresent === 'OUI') {
            // CO OUI + RIB OUI
            courrier = `Après examen de vos pièces justificatives, nous vous informons qu'un délai exceptionnel de ${mois} mois vous est accordé à compter du ${echeance} pour la partie en recouvrement amiable.

Une notification distincte vous sera adressée, précisant les montants et les dates de règlement de chaque échéance.`;
            if (soumissionState.actifRadie === 'ACTIF') {
                courrier += `

Ce délai de paiement sera maintenu uniquement si vous respectez à la fois :
- les échéances prévues dans l'échéancier,
- le règlement de vos cotisations courantes.
Le respect de ces deux conditions est indispensable pour conserver le bénéfice du délai accordé.`;
            }
            courrier += `

En revanche, pour la partie actuellement en recouvrement forcé, nous vous invitons à contacter directement l'étude d'huissier en charge de votre dossier (tél : ${telCj}, mail : ${mailCj}) afin de convenir des modalités de l'échéancier. Nous les avons informés de notre décision.`;

            commentaireWatt = `Délai accordé sur la partie amiable. L'usager a été informé par courrier de notre décision. Une partie de la dette étant chez le CJ, il a été invité à contacter ce dernier pour convenir d'un échéancier identique. Le CJ a également été informé par courrier.

SUR PO PR
${nbEcheances} échéances
à partir de ${echeance}`;
        }
        else if (soumissionState.ribPresent === 'NON') {
            // CO OUI + RIB NON
            courrier = `Après examen de vos pièces justificatives, nous vous informons qu'un délai exceptionnel de ${mois} mois vous est accordé à compter du ${echeance} pour la partie en recouvrement amiable.

Une notification séparée vous sera adressée, précisant l'échéancier accordé ainsi que le mandat de prélèvement à nous retourner.
Nous vous rappelons que, votre demande étant supérieure à 5 mois, l'accord de l'échéancier est conditionné au retour de ce mandat. Sans ce document, l'échéancier sera annulé.`;
            if (soumissionState.actifRadie === 'ACTIF') {
                courrier += `

Ce délai de paiement sera maintenu uniquement si vous respectez à la fois :
- les échéances prévues dans l'échéancier,
- le règlement de vos cotisations courantes.
Le respect de ces deux conditions est indispensable pour conserver le bénéfice du délai accordé.`;
            }
            courrier += `

En revanche, pour la partie actuellement en recouvrement forcé, nous vous invitons à contacter directement l'étude d'huissier en charge de votre dossier (tél : ${telCj}, mail : ${mailCj}) afin de convenir des modalités de l'échéancier. Nous les avons informés de notre décision.`;

            commentaireWatt = `EN ATTENTE MANDAT

Délai accordé sur la partie amiable. L'usager a été informé par courrier de notre décision. Une partie de la dette étant chez le CJ, il a été invité à contacter ce dernier pour convenir d'un échéancier identique. Le CJ a également été informé par courrier.

SUR PO PRO PR
${nbEcheances} échéances
à partir de ${echeance}`;
        }
    }

    return { courrier, courrierCJ, commentaireWatt };
}

function applySoumissionFocus() {
    document.querySelectorAll('#tout-en-un-soumission .tout-en-un-btn, #tout-en-un-soumission .tout-en-un-input').forEach(el => {
        el.classList.remove('focused');
    });

    const rows = document.querySelectorAll('#tout-en-un-soumission .tout-en-un-row');
    if (rows.length === 0) return;

    if (soumissionFocus.rowIndex >= rows.length) {
        soumissionFocus.rowIndex = rows.length - 1;
    }

    const currentRow = rows[soumissionFocus.rowIndex];
    if (!currentRow) return;

    currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const buttons = currentRow.querySelectorAll('.tout-en-un-btn, .tout-en-un-input');
    if (buttons.length === 0) return;

    if (soumissionFocus.btnIndex >= buttons.length) {
        soumissionFocus.btnIndex = buttons.length - 1;
    }

    let targetIndex = soumissionFocus.btnIndex;
    if (buttons[targetIndex] && buttons[targetIndex].classList.contains('selected')) {
        for (let i = 0; i < buttons.length; i++) {
            if (!buttons[i].classList.contains('selected')) {
                targetIndex = i;
                break;
            }
        }
        soumissionFocus.btnIndex = targetIndex;
    }

    const targetBtn = buttons[targetIndex];
    if (targetBtn) {
        targetBtn.classList.add('focused');
        if (targetBtn.tagName === 'INPUT') {
            targetBtn.focus();
        }
    }
}

function setupDelaiSoumissionEvents() {
    document.querySelectorAll('#tout-en-un-soumission .tout-en-un-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            if (!field) return;
            if (soumissionState[field] === value) return;

            soumissionState[field] = value;

            // Gestion du flux de navigation
            if (field === 'retourSoumission') {
                soumissionState.coEnCours = null;
                soumissionState.actifRadie = null;
                soumissionState.ribPresent = null;
                soumissionState.dcaDrAJour = null;
                soumissionState.mois = '';
                soumissionState.echeance = '';
                soumissionState.telCj = '';
                soumissionState.mailCj = '';
                soumissionFocus.rowIndex = 1;
                soumissionFocus.btnIndex = 0;
            }
            else if (field === 'coEnCours') {
                // Ne pas réinitialiser les autres champs
            }
            else if (field === 'actifRadie') {
                // Ne pas réinitialiser
            }
            else if (field === 'ribPresent') {
                // Ne pas réinitialiser
            }
            else if (field === 'dcaDrAJour') {
                // Ne pas réinitialiser
            }

            renderDelaiSoumission();
        });
    });

    // Événements sur les inputs
    const moisInput = document.getElementById('soumission-mois');
    if (moisInput) {
        moisInput.addEventListener('input', (e) => {
            soumissionState.mois = e.target.value;
            updateSoumissionResult();
        });
    }

    const echeanceInput = document.getElementById('soumission-echeance');
    if (echeanceInput) {
        echeanceInput.addEventListener('input', (e) => {
            soumissionState.echeance = e.target.value;
            updateSoumissionResult();
        });
    }

    const telInput = document.getElementById('soumission-tel-cj');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            soumissionState.telCj = e.target.value;
            updateSoumissionResult();
        });
    }

    const mailInput = document.getElementById('soumission-mail-cj');
    if (mailInput) {
        mailInput.addEventListener('input', (e) => {
            soumissionState.mailCj = e.target.value;
            updateSoumissionResult();
        });
    }

    // Boutons de copie
    const copyObjetBtn = document.getElementById('copy-soumission-objet');
    if (copyObjetBtn) {
        copyObjetBtn.addEventListener('click', () => {
            const objetText = `demande d'échéancier sur ${soumissionState.mois || '...'} mois`;
            navigator.clipboard.writeText(objetText).then(() => {
                const feedback = document.getElementById('feedback-soumission-objet');
                if (feedback) {
                    feedback.textContent = 'Copié !';
                    setTimeout(() => { feedback.textContent = ''; }, 2000);
                }
            });
        });
    }

    const copyCourrierBtn = document.getElementById('copy-soumission-courrier');
    if (copyCourrierBtn) {
        copyCourrierBtn.addEventListener('click', () => {
            const result = getSoumissionResult();
            if (result && result.courrier) {
                navigator.clipboard.writeText(result.courrier).then(() => {
                    const feedback = document.getElementById('feedback-soumission-courrier');
                    if (feedback) {
                        feedback.textContent = 'Copié !';
                        setTimeout(() => { feedback.textContent = ''; }, 2000);
                    }
                });
            }
        });
    }

    const copyCjBtn = document.getElementById('copy-soumission-cj');
    if (copyCjBtn) {
        copyCjBtn.addEventListener('click', () => {
            const result = getSoumissionResult();
            if (result && result.courrierCJ) {
                navigator.clipboard.writeText(result.courrierCJ).then(() => {
                    const feedback = document.getElementById('feedback-soumission-cj');
                    if (feedback) {
                        feedback.textContent = 'Copié !';
                        setTimeout(() => { feedback.textContent = ''; }, 2000);
                    }
                });
            }
        });
    }

    const copyWattBtn = document.getElementById('copy-soumission-watt');
    if (copyWattBtn) {
        copyWattBtn.addEventListener('click', () => {
            const result = getSoumissionResult();
            if (result && result.commentaireWatt) {
                navigator.clipboard.writeText(result.commentaireWatt).then(() => {
                    const feedback = document.getElementById('feedback-soumission-watt');
                    if (feedback) {
                        feedback.textContent = 'Copié !';
                        setTimeout(() => { feedback.textContent = ''; }, 2000);
                    }
                });
            }
        });
    }
}

function updateSoumissionResult() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    const result = getSoumissionResult();

    if (result && resultContainer) {
        const blocks = resultContainer.querySelectorAll('.delai-comment-block');
        let blockIndex = 0;

        // OBJET
        if (blocks[blockIndex]) {
            const objetText = blocks[blockIndex].querySelector('.delai-comment-text');
            if (objetText) {
                objetText.innerHTML = `demande d'échéancier sur ${soumissionState.mois || '...'} mois`;
            }
        }
        blockIndex++;

        // TEXTE DU COURRIER
        if (blocks[blockIndex]) {
            const courrierText = blocks[blockIndex].querySelector('.delai-comment-text');
            if (courrierText) {
                courrierText.innerHTML = result.courrier.replace(/\n/g, '<br>');
            }
        }
        blockIndex++;

        // COURRIER CJ (si présent)
        if (result.courrierCJ && blocks[blockIndex]) {
            const cjText = blocks[blockIndex].querySelector('.delai-comment-text');
            if (cjText) {
                cjText.innerHTML = result.courrierCJ.replace(/\n/g, '<br>');
            }
            blockIndex++;
        }

        // COMMENTAIRE AFFAIRE WATT
        if (result.commentaireWatt && blocks[blockIndex]) {
            const wattText = blocks[blockIndex].querySelector('.delai-comment-text');
            if (wattText) {
                wattText.innerHTML = result.commentaireWatt.replace(/\n/g, '<br>');
            }
        }
    } else if (result && !resultContainer) {
        renderDelaiSoumission();
    }
}

