// =====================
// MODULE ANV - INTERFACE TOUT-EN-UN
// =====================

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

    // Réinitialiser l'état NON EXIGIBLE
    anvNonExigibleMode = false;
    anvNonExigibleState = {
        nouvelleAdresse: null,
        sattInfructueuse: null,
        compteEnLigne: null
    };

    // Réinitialiser l'état VERSEMENTS RÉCENTS
    anvVersementsMode = false;
    anvVersementsState = {
        fraisFrustratoires: null,
        delaiEnCours: null,
        versements: ''
    };

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

    // Si mode NON EXIGIBLE, afficher l'interface correspondante
    if (anvNonExigibleMode) {
        renderAnvNonExigible();
        return;
    }

    // Si mode VERSEMENTS RÉCENTS, afficher l'interface correspondante
    if (anvVersementsMode) {
        renderAnvVersements();
        return;
    }

    // Calculer les choix disponibles
    anvChoixAnv = getAnvChoix();
    anvChoixSousMotif = getSousMotifChoix();
    const nextAfterVarChoix = getNextAfterVariableChoix();

    // Déterminer si c'est une ANV PARTIELLE
    anvIsPartielle = anvState.statut === 'ACTIF';

    let html = `<div class="tout-en-un-container" id="tout-en-un-anv">`;
    let rowIndex = 0;

    // Boutons NON EXIGIBLE et VERSEMENTS RÉCENTS en haut
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-buttons" style="justify-content: center; gap: 10px;">
                <button type="button" class="tout-en-un-btn non-exigible-btn" id="btn-non-exigible">NON EXIGIBLE</button>
                <button type="button" class="tout-en-un-btn versements-btn" id="btn-versements">VERSEMENTS RÉCENTS</button>
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

    // Ligne STATUT (RADIÉ ou ACTIF)
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

    // Ligne 3: TYPE (A/C ou PL)
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

            // Ligne DRETAF (avant SUSPEN)
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

            // Ligne SUSPEN (après DRETAF, sauf si PARTIELLE)
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
    // Afficher DATE si:
    // 1. Il y a des sous-motifs à afficher, OU
    // 2. L'ANV sélectionné a un texte direct avec variable (comme ANV 16)
    const hasDirectTextWithVariable = anvChoixSelected && anvChoixSelected.texte && anvChoixSelected.variable && !anvChoixSelected.next;
    const needsDateAfterSousMotif = !hasNextAfterVar && anvState.anv && (
        anvChoixSousMotif.length > 0 ||  // Afficher dès que SOUS-MOTIF apparaît
        hasDirectTextWithVariable        // OU texte direct avec variable (ANV 16)
    );

    // Afficher DRETAF, N° CO, SUSPEN dès qu'on a choisi le sous-motif (ou l'ANV direct)
    if (needsDateAfterSousMotif) {
        // Ligne DRETAF (avant SUSPEN)
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

        // Ligne SUSPEN (après DRETAF, sauf si PARTIELLE)
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

    // Stocker pour la copie (texte original sans échappement)
    window.resultTextes = {
        anv: anvTexte,
        suspen: suspenTexte,
        dretaf: dretafTexte,
        combined: combinedTexte
    };

    // Échapper les textes pour l'affichage HTML (évite que < soit interprété comme balise)
    const anvTexteDisplay = escapeHtml(anvTexte);
    const suspenTexteDisplay = escapeHtml(suspenTexte);
    const dretafTexteDisplay = escapeHtml(dretafTexte);

    let html = '';

    // Section Portail TI / V2 avec éléments séparés
    html += `<div class="result-section">
        <div class="result-title">PORTAIL TI / V2</div>

        <div class="result-item">
            <div class="result-content">${anvTexteDisplay}</div>
            <button type="button" class="copy-btn-small" onclick="copyResultText('anv')">Copier</button>
            <span class="copy-feedback-inline" id="feedback-anv"></span>
        </div>`;

    if (dretafTexte) {
        html += `
        <div class="result-item">
            <div class="result-content">${dretafTexteDisplay}</div>
            <button type="button" class="copy-btn-small" onclick="copyResultText('dretaf')">Copier</button>
            <span class="copy-feedback-inline" id="feedback-dretaf"></span>
        </div>`;
    }

    if (suspenTexte) {
        html += `
        <div class="result-item">
            <div class="result-content">${suspenTexteDisplay}</div>
            <button type="button" class="copy-btn-small" onclick="copyResultText('suspen')">Copier</button>
            <span class="copy-feedback-inline" id="feedback-suspen"></span>
        </div>`;
    }

    html += `</div>`;

    // Section Affaire WATT (combiné ANV + SUSPEN + DRETAF)
    let combinedDisplay = anvTexteDisplay;
    if (suspenTexte) combinedDisplay += '<br>+<br>' + suspenTexteDisplay;
    if (dretafTexte) combinedDisplay += '<br>+<br>' + dretafTexteDisplay;

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
    // Événement bouton NON EXIGIBLE
    const btnNonExigible = document.getElementById('btn-non-exigible');
    if (btnNonExigible) {
        btnNonExigible.addEventListener('click', () => {
            anvNonExigibleMode = true;
            anvNonExigibleState = {
                nouvelleAdresse: null,
                sattInfructueuse: null,
                compteEnLigne: null
            };
            anvFocus.rowIndex = 0;
            anvFocus.btnIndex = 0;
            renderAnvToutEnUn();
        });
    }

    // Événement bouton VERSEMENTS RÉCENTS
    const btnVersements = document.getElementById('btn-versements');
    if (btnVersements) {
        btnVersements.addEventListener('click', () => {
            anvVersementsMode = true;
            anvVersementsState = {
                fraisFrustratoires: null,
                delaiEnCours: null,
                versements: ''
            };
            anvFocus.rowIndex = 0;
            anvFocus.btnIndex = 0;
            renderAnvToutEnUn();
        });
    }

    // Événements sur les boutons
    document.querySelectorAll('#tout-en-un-anv .tout-en-un-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            // Ignorer le bouton NON EXIGIBLE (géré séparément)
            if (btn.id === 'btn-non-exigible') return;

            // Ignorer si ce choix est déjà sélectionné
            if (anvState[field] === value) return;

            // Revenir en mode choix si on était dans les résultats
            anvFocus.inResults = false;

            anvState[field] = value;

            // Réinitialiser les choix suivants si on change un choix précédent
            // Note: NON EXIGIBLE est à l'index 0, DATE à 1, donc les autres commencent à 2
            if (field === 'statut') {
                // Avancer à TYPE (index 3)
                anvFocus.rowIndex = 3;
            } else if (field === 'type') {
                anvState.anv = null;
                anvState.sousMotif = null;
                // Ne pas réinitialiser la date car elle est en premier
                anvState.suspen = null;
                anvState.dretaf = null;
                anvState.dretafNum = '';
                anvFocus.rowIndex = 4; // ANV
            } else if (field === 'anv') {
                anvState.sousMotif = null;
                // Ne pas réinitialiser la date
                anvState.suspen = null;
                anvState.dretaf = null;
                anvState.dretafNum = '';
                anvFocus.rowIndex = 5; // SOUS-MOTIF ou DRETAF
            } else if (field === 'sousMotif') {
                // Avancer à DRETAF après le render
                setTimeout(() => {
                    const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].querySelector('.tout-en-un-btn[data-field="dretaf"]')) {
                            anvFocus.rowIndex = i;
                            anvFocus.btnIndex = 0;
                            applyAnvToutEnUnFocus();
                            break;
                        }
                    }
                }, 50);
            } else if (field === 'suspen') {
                // SUSPEN sélectionné -> scroll vers résultats
                setTimeout(() => {
                    scrollToAnvResults();
                }, 150);
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
                    // DRETAF = Non
                    if (anvIsPartielle) {
                        // PARTIELLE: formulaire complet -> scroll vers résultats
                        setTimeout(() => {
                            scrollToAnvResults();
                        }, 150);
                    } else {
                        // RADIÉ: avancer à SUSPEN après le render
                        setTimeout(() => {
                            const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                            for (let i = 0; i < rows.length; i++) {
                                if (rows[i].querySelector('.tout-en-un-btn[data-field="suspen"]')) {
                                    anvFocus.rowIndex = i;
                                    anvFocus.btnIndex = 0;
                                    applyAnvToutEnUnFocus();
                                    break;
                                }
                            }
                        }, 50);
                    }
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
                // Passer à la ligne suivante (STATUT)
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

                // Pour RADIÉ (non PARTIELLE), aller à SUSPEN si pas encore sélectionné
                if (!anvIsPartielle && anvState.suspen === null) {
                    const rows = document.querySelectorAll('#tout-en-un-anv .tout-en-un-row');
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].querySelector('.tout-en-un-btn[data-field="suspen"]')) {
                            anvFocus.rowIndex = i;
                            anvFocus.btnIndex = 0;
                            applyAnvToutEnUnFocus();
                            return;
                        }
                    }
                }
                // Sinon, scroller vers les résultats
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
// MODULE ANV NON EXIGIBLE
// =====================

function renderAnvNonExigible() {
    const commentText = document.getElementById('comment-text');

    let html = `<div class="tout-en-un-container" id="tout-en-un-anv">`;
    let rowIndex = 0;

    // Bouton retour
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-buttons" style="justify-content: center;">
                <button type="button" class="tout-en-un-btn" id="btn-retour-anv">← RETOUR ANV</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Titre
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-label" style="font-weight: bold; color: var(--accent-color);">NON EXIGIBLE</div>
        </div>
    `;
    rowIndex++;

    // Question 1: Nouvelle adresse trouvée ?
    const adresseHasSelection = anvNonExigibleState.nouvelleAdresse !== null;
    html += `
        <div class="tout-en-un-row ${adresseHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">Nouvelle adresse trouvée ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvNonExigibleState.nouvelleAdresse === 'oui' ? 'selected' : ''}" data-field="nouvelleAdresse" data-value="oui">Oui</button>
                <button type="button" class="tout-en-un-btn ${anvNonExigibleState.nouvelleAdresse === 'non' ? 'selected' : ''}" data-field="nouvelleAdresse" data-value="non">Non</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Question 2: S ATT infructueuse ?
    const sattHasSelection = anvNonExigibleState.sattInfructueuse !== null;
    html += `
        <div class="tout-en-un-row ${sattHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">S ATT infructueuse ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvNonExigibleState.sattInfructueuse === 'oui' ? 'selected' : ''}" data-field="sattInfructueuse" data-value="oui">Oui</button>
                <button type="button" class="tout-en-un-btn ${anvNonExigibleState.sattInfructueuse === 'non' ? 'selected' : ''}" data-field="sattInfructueuse" data-value="non">Non</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Question 3: Compte en ligne / Mail ?
    const compteHasSelection = anvNonExigibleState.compteEnLigne !== null;
    html += `
        <div class="tout-en-un-row ${compteHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">Compte en ligne / Mail ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvNonExigibleState.compteEnLigne === 'oui' ? 'selected' : ''}" data-field="compteEnLigne" data-value="oui">Oui</button>
                <button type="button" class="tout-en-un-btn ${anvNonExigibleState.compteEnLigne === 'non' ? 'selected' : ''}" data-field="compteEnLigne" data-value="non">Non</button>
            </div>
        </div>
    `;
    rowIndex++;

    html += `</div>`;

    // Résultat
    const result = getNonExigibleResult();
    if (result) {
        html += `
            <div class="tout-en-un-result">
                <div class="tout-en-un-result-title">RÉSULTAT</div>
                <div class="result-section">
                    <div class="result-content">${escapeHtml(result)}</div>
                    <button type="button" class="copy-btn-small" onclick="copyNonExigibleResult()">Copier</button>
                    <span class="copy-feedback-inline" id="feedback-nonexigible"></span>
                </div>
            </div>`;
    }

    commentText.innerHTML = html;

    // Ajouter les événements
    setupNonExigibleEvents();

    // Appliquer le focus
    applyAnvToutEnUnFocus();
}

function getNonExigibleResult() {
    let parts = ['Compte actif'];

    // Nouvelle adresse trouvée = Non
    if (anvNonExigibleState.nouvelleAdresse === 'non') {
        parts.push('Pas de nouvelle adresse trouvée');
    }

    // S ATT infructueuse = Oui
    if (anvNonExigibleState.sattInfructueuse === 'oui') {
        parts.push('S ATT infructueuse');
    }

    // Message fixe
    parts.push('Dette non exigible pour passer ANV pour le moment');

    // Compte en ligne / Mail
    if (anvNonExigibleState.compteEnLigne === 'oui') {
        parts.push('Tentative de recouvrement à l\'amiable -> RELDET + formulaire de demande de délai envoyé par courrier');
    } else if (anvNonExigibleState.compteEnLigne === 'non') {
        parts.push('Pas de compte en ligne ni de mail -> RELDET faire sur V2');
    }

    return parts.join(' - ');
}

function copyNonExigibleResult() {
    const result = getNonExigibleResult();
    if (result) {
        copyToClipboard(result, 'feedback-nonexigible');
    }
}

function setupNonExigibleEvents() {
    // Bouton retour
    const btnRetour = document.getElementById('btn-retour-anv');
    if (btnRetour) {
        btnRetour.addEventListener('click', () => {
            anvNonExigibleMode = false;
            anvFocus.rowIndex = 0;
            anvFocus.btnIndex = 0;
            renderAnvToutEnUn();
        });
    }

    // Événements sur les boutons de choix
    document.querySelectorAll('#tout-en-un-anv .tout-en-un-btn[data-field]').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            // Ignorer si déjà sélectionné
            if (anvNonExigibleState[field] === value) return;

            anvNonExigibleState[field] = value;

            // Avancer au champ suivant
            if (field === 'nouvelleAdresse') {
                anvFocus.rowIndex = 3; // S ATT
            } else if (field === 'sattInfructueuse') {
                anvFocus.rowIndex = 4; // Compte en ligne
            } else if (field === 'compteEnLigne') {
                // Scroll vers résultats
                setTimeout(() => {
                    const resultContainer = document.querySelector('.tout-en-un-result');
                    if (resultContainer) {
                        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 150);
            }
            anvFocus.btnIndex = 0;

            renderAnvNonExigible();
        });
    });

    // Navigation clavier
    setupNonExigibleKeyboardNav();
}

function setupNonExigibleKeyboardNav() {
    // Retirer l'ancien handler s'il existe
    if (window.anvKeyHandler) {
        document.removeEventListener('keydown', window.anvKeyHandler);
    }

    window.anvKeyHandler = (e) => {
        const container = document.getElementById('tout-en-un-anv');
        if (!container) return;

        const rows = container.querySelectorAll('.tout-en-un-row');
        if (rows.length === 0) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            if (anvFocus.btnIndex < buttons.length - 1) {
                anvFocus.btnIndex++;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (anvFocus.btnIndex > 0) {
                anvFocus.btnIndex--;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (anvFocus.rowIndex < rows.length - 1) {
                anvFocus.rowIndex++;
                anvFocus.btnIndex = 0;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (anvFocus.rowIndex > 0) {
                anvFocus.rowIndex--;
                anvFocus.btnIndex = 0;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            if (buttons[anvFocus.btnIndex]) {
                buttons[anvFocus.btnIndex].click();
            }
        }
    };

    document.addEventListener('keydown', window.anvKeyHandler);
}

// =====================
// MODULE ANV VERSEMENTS RÉCENTS
// =====================

function renderAnvVersements() {
    const commentText = document.getElementById('comment-text');

    let html = `<div class="tout-en-un-container" id="tout-en-un-anv">`;
    let rowIndex = 0;

    // Bouton retour
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-buttons" style="justify-content: center;">
                <button type="button" class="tout-en-un-btn" id="btn-retour-anv">← RETOUR ANV</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Titre
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-label" style="font-weight: bold; color: var(--accent-color);">VERSEMENTS RÉCENTS</div>
        </div>
    `;
    rowIndex++;

    // Question 1: Frais frustratoires ?
    const fraisHasSelection = anvVersementsState.fraisFrustratoires !== null;
    html += `
        <div class="tout-en-un-row ${fraisHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">Frais frustratoires ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvVersementsState.fraisFrustratoires === 'oui' ? 'selected' : ''}" data-field="fraisFrustratoires" data-value="oui">Oui</button>
                <button type="button" class="tout-en-un-btn ${anvVersementsState.fraisFrustratoires === 'non' ? 'selected' : ''}" data-field="fraisFrustratoires" data-value="non">Non</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Question 2: Délai en cours ?
    const delaiHasSelection = anvVersementsState.delaiEnCours !== null;
    html += `
        <div class="tout-en-un-row ${delaiHasSelection ? 'has-selection' : ''}" data-row="${rowIndex}">
            <div class="tout-en-un-label">Délai en cours ?</div>
            <div class="tout-en-un-buttons">
                <button type="button" class="tout-en-un-btn ${anvVersementsState.delaiEnCours === 'oui' ? 'selected' : ''}" data-field="delaiEnCours" data-value="oui">Oui</button>
                <button type="button" class="tout-en-un-btn ${anvVersementsState.delaiEnCours === 'non' ? 'selected' : ''}" data-field="delaiEnCours" data-value="non">Non</button>
            </div>
        </div>
    `;
    rowIndex++;

    // Champ texte: Versements récents
    html += `
        <div class="tout-en-un-row" data-row="${rowIndex}">
            <div class="tout-en-un-label">Versements récents :</div>
            <div class="tout-en-un-buttons" style="flex: 1;">
                <textarea class="tout-en-un-input" id="tout-en-un-versements" rows="4" style="width: 100%; resize: vertical;" placeholder="Coller les versements ici...">${anvVersementsState.versements}</textarea>
            </div>
        </div>
    `;
    rowIndex++;

    html += `</div>`;

    // Résultat
    const result = getVersementsResult();
    if (result) {
        html += `
            <div class="tout-en-un-result">
                <div class="tout-en-un-result-title">RÉSULTAT</div>
                <div class="result-section">
                    <div class="result-content" style="white-space: pre-wrap;">${escapeHtml(result)}</div>
                    <button type="button" class="copy-btn-small" onclick="copyVersementsResult()">Copier</button>
                    <span class="copy-feedback-inline" id="feedback-versements"></span>
                </div>
            </div>`;
    }

    commentText.innerHTML = html;

    // Ajouter les événements
    setupVersementsEvents();

    // Appliquer le focus
    applyAnvToutEnUnFocus();
}

function getVersementsResult() {
    let parts = ['Compte actif', 'Aucun élément pour passer ANV'];

    // Frais frustratoires
    if (anvVersementsState.fraisFrustratoires === 'oui') {
        parts.push('Pas de réexécution pour le moment frais frustratoires');
    } else if (anvVersementsState.fraisFrustratoires === 'non') {
        parts.push('Pas de réexécution pour le moment');
    }

    // Délai en cours = Oui
    if (anvVersementsState.delaiEnCours === 'oui') {
        parts.push('Délai déjà en cours sans les périodes du CO RETOUR');
    }

    // Construire le résultat
    let result = parts.join(' - ');

    // Versements récents (sans tiret après)
    if (anvVersementsState.versements.trim()) {
        result += ' - Versements récents :\n' + anvVersementsState.versements.trim();
    }

    // Texte final sur une nouvelle ligne (avec ligne vide)
    if (anvVersementsState.delaiEnCours === 'oui') {
        result += '\n\nTentative de recouvrement à l\'amiable pour ajouter le reste de la dette dans le délai -> RELDET + formulaire de demande de délai envoyé';
    } else {
        result += '\n\nTentative de recouvrement à l\'amiable -> RELDET + formulaire de demande de délai envoyé';
    }

    return result;
}

function copyVersementsResult() {
    const result = getVersementsResult();
    if (result) {
        copyToClipboard(result, 'feedback-versements');
    }
}

function setupVersementsEvents() {
    // Bouton retour
    const btnRetour = document.getElementById('btn-retour-anv');
    if (btnRetour) {
        btnRetour.addEventListener('click', () => {
            anvVersementsMode = false;
            anvFocus.rowIndex = 0;
            anvFocus.btnIndex = 0;
            renderAnvToutEnUn();
        });
    }

    // Événements sur les boutons de choix
    document.querySelectorAll('#tout-en-un-anv .tout-en-un-btn[data-field]').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;

            // Ignorer si déjà sélectionné
            if (anvVersementsState[field] === value) return;

            anvVersementsState[field] = value;

            // Avancer au champ suivant
            if (field === 'fraisFrustratoires') {
                anvFocus.rowIndex = 3; // Délai en cours
            } else if (field === 'delaiEnCours') {
                anvFocus.rowIndex = 4; // Versements
                // Focus sur le textarea après render
                setTimeout(() => {
                    const textarea = document.getElementById('tout-en-un-versements');
                    if (textarea) textarea.focus();
                }, 100);
            }
            anvFocus.btnIndex = 0;

            renderAnvVersements();
        });
    });

    // Événement sur le textarea versements
    const versementsInput = document.getElementById('tout-en-un-versements');
    if (versementsInput) {
        versementsInput.addEventListener('input', (e) => {
            anvVersementsState.versements = e.target.value;
            // Mettre à jour le résultat en temps réel
            updateVersementsResult();
        });
    }

    // Navigation clavier
    setupVersementsKeyboardNav();
}

function updateVersementsResult() {
    const resultContainer = document.querySelector('.tout-en-un-result');
    const result = getVersementsResult();

    if (result) {
        if (resultContainer) {
            const resultContent = resultContainer.querySelector('.result-content');
            if (resultContent) {
                resultContent.textContent = result;
            }
        }
    }
}

function setupVersementsKeyboardNav() {
    // Retirer l'ancien handler s'il existe
    if (window.anvKeyHandler) {
        document.removeEventListener('keydown', window.anvKeyHandler);
    }

    window.anvKeyHandler = (e) => {
        const container = document.getElementById('tout-en-un-anv');
        if (!container) return;

        // Ignorer si on est dans le textarea
        if (document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        const rows = container.querySelectorAll('.tout-en-un-row');
        if (rows.length === 0) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            if (anvFocus.btnIndex < buttons.length - 1) {
                anvFocus.btnIndex++;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (anvFocus.btnIndex > 0) {
                anvFocus.btnIndex--;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (anvFocus.rowIndex < rows.length - 1) {
                anvFocus.rowIndex++;
                anvFocus.btnIndex = 0;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (anvFocus.rowIndex > 0) {
                anvFocus.rowIndex--;
                anvFocus.btnIndex = 0;
                applyAnvToutEnUnFocus();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const currentRow = rows[anvFocus.rowIndex];
            if (!currentRow) return;
            const buttons = currentRow.querySelectorAll('.tout-en-un-btn');
            if (buttons[anvFocus.btnIndex]) {
                buttons[anvFocus.btnIndex].click();
            }
        }
    };

    document.addEventListener('keydown', window.anvKeyHandler);
}
