// =====================
// MODULE RÉEXÉCUTION - INTERFACE TOUT-EN-UN
// =====================

function startReexecution() {
    // Réinitialiser l'état
    reexImages = [];
    reexState = { date: '', adresse: '', instruction: 'DEFAUT' };
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

    // Ligne 4: INSTRUCTION CJ
    html += `
        <div class="tout-en-un-row has-selection" data-row="${rowIndex}">
            <div class="tout-en-un-label">INSTRUCTION CJ</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${reexState.instruction === 'DEFAUT' ? 'selected' : ''}" data-field="instruction" data-value="DEFAUT">DEFAUT</button>
                <button type="button" class="tout-en-un-btn ${reexState.instruction === 'S ATT' ? 'selected' : ''}" data-field="instruction" data-value="S ATT">S ATT</button>
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

    // Phrase d'instruction selon le choix
    const phraseInstruction = reexState.instruction === 'S ATT'
        ? "Sans réaction de sa part, nous vous invitons à procéder à une saisie-attribution."
        : "Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.";

    // Texte HTML formaté pour l'affichage
    const texteTemplateHTML = `<span class="reex-label">Date limite avant prescription :</span> <span class="reex-date">${date || '...'}</span>

<b><u>Transmission de titres exécutoires</u></b>

Cher(s) Maître(s),

Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.

A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.

${phraseInstruction}

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

    // Boutons INSTRUCTION CJ
    document.querySelectorAll('#tout-en-un-reex .tout-en-un-btn[data-field="instruction"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            if (reexState.instruction !== value) {
                reexState.instruction = value;
                renderReexToutEnUn();
            }
        });
    });

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

    // Phrase d'instruction selon le choix
    const phraseInstruction = reexState.instruction === 'S ATT'
        ? "Sans réaction de sa part, nous vous invitons à procéder à une saisie-attribution."
        : "Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.";

    const texteTemplateBrut = `Date limite avant prescription : ${date}

Transmission de titres exécutoires

Cher(s) Maître(s),

Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.

A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.

${phraseInstruction}

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
<p><b>Date limite avant prescription :</b> <font color="red"><b>${date}</b></font></p>
<p><b><u>Transmission de titres exécutoires</u></b></p>
<p>Cher(s) Maître(s),</p>
<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>
<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>
<p>${phraseInstruction}</p>
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

    // Méthode execCommand - plus fiable pour le formatage HTML
    try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlFormatted;
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.opacity = '0';
        document.body.appendChild(tempDiv);

        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const success = document.execCommand('copy');
        selection.removeAllRanges();
        document.body.removeChild(tempDiv);

        if (success) {
            const feedback = document.getElementById('feedback-reex');
            feedback.textContent = 'COPIÉ !';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        } else {
            throw new Error('execCommand failed');
        }
    } catch (err) {
        console.error('Erreur copie execCommand:', err);
        // Fallback: ClipboardItem API
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
        } catch (err2) {
            console.error('Erreur copie ClipboardItem:', err2);
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
