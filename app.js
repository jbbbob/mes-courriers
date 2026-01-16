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
            startCascade(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'reexecution') {
            startReexecution();
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_complet') {
            startDelaiComplet(commentaire);
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

    // Type cascade (choix imbriqués)
    if (typeof commentaire === 'object' && commentaire.type === 'cascade') {
        startCascade(commentaire);
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

// Historique pour le bouton retour
let cascadeHistory = [];

// Gérer les choix en cascade
function showCascadeChoice(data, isBack = false) {
    if (!isBack) {
        cascadeHistory.push(data);
    }

    let buttonsHTML = '';
    data.choix.forEach((c, i) => {
        buttonsHTML += `<button type="button" class="choice-btn cascade-btn" data-index="${i}">${c.label}</button>`;
    });

    const backBtn = cascadeHistory.length > 1 ? `<button type="button" class="back-btn" id="cascade-back">← Retour</button>` : '';

    const formHTML = `
        <div class="form-group">
            <label>${data.question}</label>
            <div class="button-group-wrap">
                ${buttonsHTML}
            </div>
        </div>
        ${backBtn}
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        // Bouton retour
        document.getElementById('cascade-back')?.addEventListener('click', () => {
            cascadeHistory.pop(); // Retirer l'étape actuelle
            const previous = cascadeHistory.pop(); // Récupérer l'étape précédente
            if (previous) {
                showCascadeChoice(previous, false);
            }
        });

        // Boutons de choix
        document.querySelectorAll('.cascade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const choix = data.choix[index];

                // Mettre à jour le récap avec le choix
                const questionLabel = data.question.replace(' ?', '').replace('?', '');
                updateRecap(questionLabel, choix.label);

                // Si c'est un choix final avec texte
                if (choix.texte) {
                    // Si il y a une variable à remplir
                    if (choix.variable) {
                        cascadeHistory.push({ question: choix.variable.question, choix: [], isVariable: true, parentData: data });

                        const varBackBtn = `<button type="button" class="back-btn" id="cascade-back">← Retour</button>`;
                        const varFormHTML = `
                            <div class="form-group">
                                <label>${choix.variable.question}</label>
                                <input type="text" id="cascade-var" class="modal-input">
                            </div>
                            ${varBackBtn}
                        `;
                        showModal('', varFormHTML, () => {
                            const value = document.getElementById('cascade-var').value;
                            const texte = choix.texte.replace(`{${choix.variable.id}}`, value);

                            // Si on est dans la catégorie ANV, demander ANV SUSPEN (sauf si PARTIELLE)
                            if (currentCategory === 'ANV') {
                                if (texte.includes('PARTIELLE')) {
                                    // Pas de SUSPEN pour ANV PARTIELLE, passer directement à DRETAF
                                    showDretafQuestion(texte, false);
                                } else {
                                    showAnvSuspenQuestion(texte);
                                }
                            } else {
                                copyToClipboard(texte, 'copy-comment-feedback');
                                const commentText = document.getElementById('comment-text');
                                commentText.classList.remove('hidden');
                                commentText.textContent = texte;
                                cascadeHistory = [];
                            }
                        });

                        setTimeout(() => {
                            document.getElementById('cascade-var')?.focus();
                            document.getElementById('cascade-back')?.addEventListener('click', () => {
                                cascadeHistory.pop();
                                const previous = cascadeHistory.pop();
                                if (previous) {
                                    showCascadeChoice(previous, false);
                                }
                            });
                        }, 100);
                    } else {
                        document.getElementById('modal').classList.add('hidden');
                        copyToClipboard(choix.texte, 'copy-comment-feedback');
                        const commentText = document.getElementById('comment-text');
                        commentText.classList.remove('hidden');
                        commentText.textContent = choix.texte;
                        cascadeHistory = [];
                    }
                }
                // Si il y a une variable puis un choix après (ex: ANV 12 PL)
                else if (choix.variable && choix.nextAfterVariable) {
                    cascadeHistory.push({ question: choix.variable.question, choix: [], isVariable: true, parentData: data });

                    const varBackBtn = `<button type="button" class="back-btn" id="cascade-back">← Retour</button>`;
                    const varFormHTML = `
                        <div class="form-group">
                            <label>${choix.variable.question}</label>
                            <input type="text" id="cascade-var" class="modal-input">
                        </div>
                        ${varBackBtn}
                    `;
                    showModal('', varFormHTML, () => {
                        const variableValue = document.getElementById('cascade-var').value;
                        const variableId = choix.variable.id;
                        // Afficher les choix suivants avec la variable stockée
                        showNextAfterVariable(choix.nextAfterVariable, variableId, variableValue);
                    });

                    setTimeout(() => {
                        document.getElementById('cascade-var')?.focus();
                        document.getElementById('cascade-back')?.addEventListener('click', () => {
                            cascadeHistory.pop();
                            const previous = cascadeHistory.pop();
                            if (previous) {
                                showCascadeChoice(previous, false);
                            }
                        });
                    }, 100);
                }
                // Sinon continuer la cascade
                else if (choix.next) {
                    showCascadeChoice(choix.next);
                }
            });
        });
    }, 50);
}

// Réinitialiser l'historique au début
function startCascade(data) {
    cascadeHistory = [];
    hideRecap();
    updateRecap('Catégorie', currentCategory);
    showCascadeChoice(data);
}

// Afficher les choix après une variable (ex: MD PSA / PV 659)
function showNextAfterVariable(nextData, variableId, variableValue) {
    let buttonsHTML = '';
    nextData.choix.forEach((c, i) => {
        buttonsHTML += `<button type="button" class="choice-btn cascade-btn" data-index="${i}">${c.label}</button>`;
    });

    const backBtn = `<button type="button" class="back-btn" id="cascade-back">← Retour</button>`;

    const formHTML = `
        <div class="form-group">
            <label>${nextData.question}</label>
            <div class="button-group-wrap">
                ${buttonsHTML}
            </div>
        </div>
        ${backBtn}
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        // Bouton retour
        document.getElementById('cascade-back')?.addEventListener('click', () => {
            cascadeHistory.pop();
            const previous = cascadeHistory.pop();
            if (previous) {
                showCascadeChoice(previous, false);
            }
        });

        // Boutons de choix
        document.querySelectorAll('.cascade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const choix = nextData.choix[index];

                // Remplacer la variable dans le texte
                const texte = choix.texte.replace(`{${variableId}}`, variableValue);

                // Si on est dans la catégorie ANV, demander ANV SUSPEN (sauf si PARTIELLE)
                if (currentCategory === 'ANV') {
                    if (texte.includes('PARTIELLE')) {
                        // Pas de SUSPEN pour ANV PARTIELLE, passer directement à DRETAF
                        showDretafQuestion(texte, false);
                    } else {
                        showAnvSuspenQuestion(texte);
                    }
                } else {
                    document.getElementById('modal').classList.add('hidden');
                    copyToClipboard(texte, 'copy-comment-feedback');
                    const commentText = document.getElementById('comment-text');
                    commentText.classList.remove('hidden');
                    commentText.textContent = texte;
                    cascadeHistory = [];
                }
            });
        });
    }, 50);
}

// Question ANV SUSPEN après la saisie de la date
function showAnvSuspenQuestion(anvTexte) {
    const formHTML = `
        <div class="form-group">
            <label>ANV SUSPEN à faire ?</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-choice="non">Non</button>
                <button type="button" class="choice-btn" data-choice="oui">Oui</button>
            </div>
        </div>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const anvSuspen = btn.dataset.choice === 'oui';
                updateRecap('ANV SUSPEN', anvSuspen ? 'Oui' : 'Non');
                // Passer à la question DRETAF
                showDretafQuestion(anvTexte, anvSuspen);
            });
        });
    }, 50);
}

// Question DRETAF après ANV SUSPEN
function showDretafQuestion(anvTexte, anvSuspen) {
    const formHTML = `
        <div class="form-group">
            <label>DRETAF ?</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-choice="non">Non</button>
                <button type="button" class="choice-btn" data-choice="oui">Oui</button>
            </div>
        </div>
        <button type="button" class="back-btn" id="dretaf-back">← Retour</button>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dretaf = btn.dataset.choice === 'oui';
                updateRecap('DRETAF', dretaf ? 'Oui' : 'Non');

                if (dretaf) {
                    // Demander le numéro de CO
                    showDretafNumeroQuestion(anvTexte, anvSuspen);
                } else if (anvSuspen) {
                    // Afficher ANV + SUSPEN sans DRETAF
                    showAnvSuspenOptions(anvTexte, true, null);
                } else {
                    // Juste copier l'ANV normal
                    document.getElementById('modal').classList.add('hidden');
                    copyToClipboard(anvTexte, 'copy-comment-feedback');
                    const commentText = document.getElementById('comment-text');
                    commentText.classList.remove('hidden');
                    commentText.innerHTML = `
                        <div class="anv-comment-block">
                            <div class="anv-comment-text">${anvTexte}</div>
                            <button type="button" class="copy-btn-small" id="copy-anv-final">Copier</button>
                            <span class="copy-feedback-inline" id="feedback-anv-final"></span>
                        </div>
                    `;
                    // Cacher le bouton "Créer le commentaire"
                    document.getElementById('copy-comment-btn').style.display = 'none';
                    // Ajouter l'événement sur le bouton Copier
                    document.getElementById('copy-anv-final').addEventListener('click', () => {
                        navigator.clipboard.writeText(anvTexte).then(() => {
                            const feedback = document.getElementById('feedback-anv-final');
                            feedback.textContent = 'Copié !';
                            setTimeout(() => { feedback.textContent = ''; }, 2000);
                        });
                    });
                    cascadeHistory = [];
                }
            });
        });

        document.getElementById('dretaf-back')?.addEventListener('click', () => {
            showAnvSuspenQuestion(anvTexte);
        });
    }, 50);
}

// Demander le numéro de CO pour DRETAF
function showDretafNumeroQuestion(anvTexte, anvSuspen) {
    const formHTML = `
        <div class="form-group">
            <label>Numéro de la CO ?</label>
            <input type="text" id="dretaf-numero" class="modal-input">
        </div>
        <button type="button" class="back-btn" id="dretaf-num-back">← Retour</button>
    `;

    showModal('', formHTML, () => {
        const numeroCO = document.getElementById('dretaf-numero').value.trim();
        // Afficher DRETAF même si le numéro CO est vide
        showAnvSuspenOptions(anvTexte, anvSuspen, numeroCO, true);
    });

    setTimeout(() => {
        document.getElementById('dretaf-numero')?.focus();
        document.getElementById('dretaf-num-back')?.addEventListener('click', () => {
            showDretafQuestion(anvTexte, anvSuspen);
        });
    }, 50);
}

// Afficher les commentaires ANV dans la section commentaire
function showAnvSuspenOptions(anvTexte, anvSuspen, numeroCO, hasDretaf = false) {
    const suspenTexte = "ANV SUSPEN pour exigibilité inférieure à un an";
    const dretafTexte = hasDretaf ? (numeroCO ? `DRETAF CO ${numeroCO} pour passer ANV` : `DRETAF CO pour passer ANV`) : null;

    // Fermer le modal
    document.getElementById('modal').classList.add('hidden');
    cascadeHistory = [];

    // Construire les textes selon les options
    const textes = {
        anv: anvTexte,
        suspen: suspenTexte,
        dretaf: dretafTexte
    };

    // Construire le texte combiné pour Affaire WATT
    let combinedParts = [anvTexte];
    if (anvSuspen) combinedParts.push(suspenTexte);
    if (dretafTexte) combinedParts.push(dretafTexte);
    textes.combined = combinedParts.join('\n+\n');

    // Construire le HTML
    let portailHTML = `
        <div class="anv-comment-block">
            <div class="anv-comment-text">${anvTexte}</div>
            <button type="button" class="copy-btn-small" data-texte="anv">Copier</button>
            <span class="copy-feedback-inline" id="feedback-anv"></span>
        </div>
    `;

    if (anvSuspen) {
        portailHTML += `
            <div class="anv-comment-block">
                <div class="anv-comment-text">${suspenTexte}</div>
                <button type="button" class="copy-btn-small" data-texte="suspen">Copier</button>
                <span class="copy-feedback-inline" id="feedback-suspen"></span>
            </div>
        `;
    }

    if (dretafTexte) {
        portailHTML += `
            <div class="anv-comment-block">
                <div class="anv-comment-text">${dretafTexte}</div>
                <button type="button" class="copy-btn-small" data-texte="dretaf">Copier</button>
                <span class="copy-feedback-inline" id="feedback-dretaf"></span>
            </div>
        `;
    }

    // Construire le HTML pour Affaire WATT
    let combinedDisplay = anvTexte;
    if (anvSuspen) combinedDisplay += '<br>+<br>' + suspenTexte;
    if (dretafTexte) combinedDisplay += '<br>+<br>' + dretafTexte;

    const commentText = document.getElementById('comment-text');
    commentText.classList.remove('hidden');
    commentText.innerHTML = `
        <div class="anv-final-page">
            <div class="anv-category-title">Portail TI / V2</div>
            ${portailHTML}

            <div class="anv-category-title">Affaire WATT</div>
            <div class="anv-comment-block">
                <div class="anv-comment-text">${combinedDisplay}</div>
                <button type="button" class="copy-btn-small" data-texte="combined">Copier</button>
                <span class="copy-feedback-inline" id="feedback-combined"></span>
            </div>
        </div>
    `;

    // Cacher le bouton "Copier le commentaire" car chaque bloc a son propre bouton
    document.getElementById('copy-comment-btn').style.display = 'none';

    // Ajouter les événements sur les boutons Copier
    commentText.querySelectorAll('.copy-btn-small').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.texte;
            const texteToCopy = textes[type];

            navigator.clipboard.writeText(texteToCopy).then(() => {
                const feedback = document.getElementById(`feedback-${type}`);
                feedback.textContent = 'Copié !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            });
        });
    });
}

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
// FONCTIONS RÉEXÉCUTION
// =====================

let reexImages = [];
let reexPasteHandler = null;

function startReexecution() {
    reexImages = [];
    showReexImageStep();
}

// Étape 1: Collecter les images
function showReexImageStep() {
    // Supprimer l'ancien écouteur s'il existe
    if (reexPasteHandler) {
        document.removeEventListener('paste', reexPasteHandler);
    }

    const imagesPreview = reexImages.length > 0
        ? `<div class="reex-images-preview">${reexImages.map((img, i) => `<div class="reex-image-item">IMAGE ${i + 1} <button type="button" class="mini-btn delete" onclick="removeReexImage(${i})">✕</button></div>`).join('')}</div>`
        : '<p class="reex-no-images">AUCUNE IMAGE POUR L\'INSTANT</p>';

    const formHTML = `
        <div class="form-group">
            <label>TITRES À TRANSFÉRER ?</label>
            <p class="reex-instruction">COLLEZ VOS IMAGES AVEC CTRL+V</p>
            <div class="reex-paste-zone" id="reex-paste-zone" tabindex="0">
                COLLEZ DIRECTEMENT (CTRL+V)
            </div>
            ${imagesPreview}
        </div>
        <div class="reex-actions">
            <button type="button" class="modal-btn modal-btn-cancel" id="reex-cancel">ANNULER</button>
            <button type="button" class="modal-btn modal-btn-confirm" id="reex-next">SUIVANT</button>
        </div>
    `;

    showModal('', formHTML, null, true);

    // Fonction pour gérer le collage
    reexPasteHandler = (e) => {
        e.preventDefault();
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    reexImages.push(event.target.result);
                    showReexImageStep(); // Rafraîchir
                };
                reader.readAsDataURL(blob);
                break; // Une seule image à la fois
            }
        }
    };

    // Écouter le collage sur tout le document (pas besoin de cliquer)
    document.addEventListener('paste', reexPasteHandler);

    setTimeout(() => {
        document.getElementById('reex-cancel').addEventListener('click', () => {
            document.getElementById('modal').classList.add('hidden');
            if (reexPasteHandler) {
                document.removeEventListener('paste', reexPasteHandler);
                reexPasteHandler = null;
            }
            reexImages = [];
        });

        document.getElementById('reex-next').addEventListener('click', () => {
            if (reexPasteHandler) {
                document.removeEventListener('paste', reexPasteHandler);
                reexPasteHandler = null;
            }
            showReexDateStep();
        });
    }, 50);
}

function removeReexImage(index) {
    reexImages.splice(index, 1);
    showReexImageStep();
}

// Étape 2: Date limite prescription
function showReexDateStep() {
    const formHTML = `
        <div class="form-group">
            <label>DATE LIMITE AVANT PRESCRIPTION ?</label>
            <input type="text" id="reex-date" class="modal-input" placeholder="EX: 15/01/2026">
        </div>
        <button type="button" class="back-btn" id="reex-date-back">← RETOUR</button>
    `;

    showModal('', formHTML, () => {
        const date = document.getElementById('reex-date').value;
        showReexAdresseStep(date);
    });

    setTimeout(() => {
        document.getElementById('reex-date')?.focus();
        document.getElementById('reex-date-back')?.addEventListener('click', () => {
            showReexImageStep();
        });
    }, 50);
}

// Étape 3: Adresse
function showReexAdresseStep(date) {
    const formHTML = `
        <div class="form-group">
            <label>ADRESSE ?</label>
            <textarea id="reex-adresse" class="modal-textarea" rows="4" placeholder="CHEZ JEAN DUPONT\n12 RUE DE LA PAIX\n75001 PARIS"></textarea>
        </div>
        <button type="button" class="back-btn" id="reex-adresse-back">← RETOUR</button>
    `;

    showModal('', formHTML, () => {
        const adresse = document.getElementById('reex-adresse').value;
        generateReexResult(date, adresse);
    });

    setTimeout(() => {
        document.getElementById('reex-adresse')?.focus();
        document.getElementById('reex-adresse-back')?.addEventListener('click', () => {
            showReexDateStep();
        });
    }, 50);
}

// Générer le résultat final
function generateReexResult(date, adresse) {
    document.getElementById('modal').classList.add('hidden');

    // Texte brut pour la copie
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

    // Texte HTML formaté pour l'affichage
    const texteTemplateHTML = `<span class="reex-label">Date limite avant prescription :</span> <span class="reex-date">${date}</span>

<b><u>Transmission de titres exécutoires</u></b>

Cher(s) Maître(s),

Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.

A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.

Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.

<b>Adresse :
${adresse}</b>
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

    // Afficher dans la section commentaire
    const commentText = document.getElementById('comment-text');
    commentText.classList.remove('hidden');

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

    commentText.innerHTML = `
        <div class="delai-final-page">
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

    document.getElementById('copy-comment-btn').style.display = 'none';

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

    document.getElementById('copy-reex-all').addEventListener('click', async () => {
        try {
            // Construire le HTML des images
            let imagesHtml = '';
            if (reexImages.length > 0) {
                imagesHtml = reexImages.map(img => `<p><img src="${img}" style="max-width:100%;"></p>`).join('');
            }

            // HTML formaté pour coller dans Word/Outlook avec images + texte
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
            // Fallback si l'API ne fonctionne pas
            copyToClipboard(texteTemplateBrut, 'feedback-reex');
        }
    });

    // Copier le commentaire WATT
    document.getElementById('copy-reex-watt').addEventListener('click', () => {
        navigator.clipboard.writeText(commentaireWatt).then(() => {
            const feedback = document.getElementById('feedback-reex-watt');
            feedback.textContent = 'COPIÉ !';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        });
    });
}

// =====================
// FONCTIONS DÉLAI COMPLET
// =====================

function startDelaiComplet(data) {
    hideRecap();
    updateRecap('Catégorie', 'DÉLAI');

    // Étape 1 : Demander A/C ou PL
    const formHTML = `
        <div class="form-group">
            <label>CHOISIR LE TYPE</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-type="A/C">A/C</button>
                <button type="button" class="choice-btn" data-type="PL">PL</button>
            </div>
        </div>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedType = btn.dataset.type;
                updateRecap('Type', selectedType);
                delaiCompletEtapeDCA(data, selectedType);
            });
        });
    }, 50);
}

// Étape 1b : Demander DCA / DR TI à jour ?
function delaiCompletEtapeDCA(data, selectedType) {
    const formHTML = `
        <div class="form-group">
            <label>DCA / DR TI À JOUR ?</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-choice="oui">Oui</button>
                <button type="button" class="choice-btn" data-choice="non">Non</button>
            </div>
        </div>
        <button type="button" class="back-btn" id="dca-back">← Retour</button>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dcaAJour = btn.dataset.choice === 'oui';
                updateRecap('DCA/DR à jour', dcaAJour ? 'Oui' : 'Non');
                if (dcaAJour) {
                    // Continue normalement
                    delaiCompletEtape2(data, selectedType);
                } else {
                    // DCA pas à jour, on demande le nombre de mois
                    delaiCompletEtapeMoisDCA(data, selectedType);
                }
            });
        });

        document.getElementById('dca-back')?.addEventListener('click', () => {
            startDelaiComplet(data);
        });
    }, 50);
}

// Étape pour DCA non à jour : demander le nombre de mois
function delaiCompletEtapeMoisDCA(data, selectedType) {
    const formHTML = `
        <div class="form-group">
            <label>NOMBRE DE MOIS SOUHAITÉ ?</label>
            <input type="text" id="delai-mois-dca" class="modal-input">
        </div>
        <button type="button" class="back-btn" id="mois-dca-back">← Retour</button>
    `;

    showModal('', formHTML, () => {
        const nbMois = parseInt(document.getElementById('delai-mois-dca').value);
        updateRecap('Mois', nbMois);

        if (nbMois > 18) {
            // > 18 mois : afficher le texte spécial avec ligne en gras
            delaiCompletDCAPlus18(data, selectedType, nbMois);
        } else {
            // <= 18 mois : demander AE ou TI
            delaiCompletEtapeAETI(data, selectedType, nbMois);
        }
    });

    setTimeout(() => {
        document.getElementById('delai-mois-dca')?.focus();
        document.getElementById('mois-dca-back')?.addEventListener('click', () => {
            delaiCompletEtapeDCA(data, selectedType);
        });
    }, 50);
}

// DCA non à jour et > 18 mois : demander AE ou TI d'abord
function delaiCompletDCAPlus18(data, selectedType, nbMois) {
    const formHTML = `
        <div class="form-group">
            <label>AE OU TI ?</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-choice="AE">AE</button>
                <button type="button" class="choice-btn" data-choice="TI">TI</button>
            </div>
        </div>
        <button type="button" class="back-btn" id="aeti-plus18-back">← Retour</button>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const aetiType = btn.dataset.choice;
                updateRecap('AE/TI', aetiType);
                delaiCompletDCAPlus18Final(data, selectedType, nbMois, aetiType);
            });
        });

        document.getElementById('aeti-plus18-back')?.addEventListener('click', () => {
            delaiCompletEtapeMoisDCA(data, selectedType);
        });
    }, 50);
}

// DCA non à jour et > 18 mois : afficher résultat final
function delaiCompletDCAPlus18Final(data, selectedType, nbMois, aetiType) {
    document.getElementById('modal').classList.add('hidden');

    const texteCourrier = `Vous sollicitez un délai de paiement sur ${nbMois} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

Afin d'étudier votre dossier, nous vous remercions de nous transmettre, sous quinze jours, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :
- Copie de votre dernier avis d'imposition ;
- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;
- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;
- Votre demande doit être motivée et justifiée ;
- Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour ;
- et tout autre élément que vous jugerez utile.

Dans cette attente, la procédure de recouvrement n'est pas suspendue.

Par ailleurs, en cas de recouvrement par voie de commissaire de justice, nous vous invitons à adresser directement votre proposition de règlement à l'étude en charge de votre dossier.`;

    // Code REFUS selon A/C ou PL
    const codeRefus = selectedType === 'A/C' ? '06' : '65';

    // Ligne supplémentaire selon AE ou TI
    const ligneSupp = aetiType === 'AE'
        ? 'Un rappel lui a été adressé dans le courrier concernant ses DCA manquantes'
        : 'Un rappel lui a été adressé dans le courrier concernant ses déclarations de revenus manquantes';

    const commentaireTexte = `SUR PO REFUS ${codeRefus} en raison de l'absence de justificatifs concernant la demande de délai supérieure à 18 mois. Une demande de pièces complémentaires a été transmise via SCRIBE.
+
${ligneSupp}`;

    const commentText = document.getElementById('comment-text');
    commentText.classList.remove('hidden');

    const texteCourrierHTML = texteCourrier
        .replace(/\n/g, '<br>')
        .replace(/sous quinze jours/g, '<b>sous quinze jours</b>')
        .replace(/Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour/g, '<b>Vos déclarations de revenus ou de chiffre d\'affaires doivent être à jour</b>');

    commentText.innerHTML = `
        <div class="delai-final-page">
            <div class="delai-category-title">Texte du courrier</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${texteCourrierHTML}</div>
                <button type="button" class="copy-btn-small" data-texte="courrier">Copier</button>
                <span class="copy-feedback-inline" id="feedback-courrier"></span>
            </div>

            <div class="delai-category-title">AFFAIRE WATT</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${commentaireTexte.replace(/\n/g, '<br>')}</div>
                <button type="button" class="copy-btn-small" data-texte="commentaire">Copier</button>
                <span class="copy-feedback-inline" id="feedback-commentaire"></span>
            </div>
        </div>
    `;

    document.getElementById('copy-comment-btn').style.display = 'none';

    const courrierHTMLFormate = `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${texteCourrier
        .replace(/\n/g, '</p><p>')
        .replace(/sous quinze jours/g, '<b>sous quinze jours</b>')
        .replace(/Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour/g, '<b>Vos déclarations de revenus ou de chiffre d\'affaires doivent être à jour</b>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
    }</div>`;

    const textes = {
        courrier: { plain: texteCourrier, html: courrierHTMLFormate },
        commentaire: { plain: commentaireTexte, html: `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${commentaireTexte.replace(/\n/g, '<br>')}</div>` }
    };

    commentText.querySelectorAll('.copy-btn-small').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.texte;
            const txtData = textes[type];

            try {
                const blobHtml = new Blob([txtData.html], { type: 'text/html' });
                const blobText = new Blob([txtData.plain], { type: 'text/plain' });

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': blobHtml,
                        'text/plain': blobText
                    })
                ]);

                const feedback = document.getElementById(`feedback-${type}`);
                feedback.textContent = 'Copié !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            } catch (err) {
                navigator.clipboard.writeText(txtData.plain).then(() => {
                    const feedback = document.getElementById(`feedback-${type}`);
                    feedback.textContent = 'Copié !';
                    setTimeout(() => { feedback.textContent = ''; }, 2000);
                });
            }
        });
    });
}

// DCA non à jour et <= 18 mois : demander AE ou TI
function delaiCompletEtapeAETI(data, selectedType, nbMois) {
    const formHTML = `
        <div class="form-group">
            <label>AE OU TI ?</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-choice="AE">AE</button>
                <button type="button" class="choice-btn" data-choice="TI">TI</button>
            </div>
        </div>
        <button type="button" class="back-btn" id="aeti-back">← Retour</button>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const aetiType = btn.dataset.choice;
                updateRecap('AE/TI', aetiType);
                delaiCompletDCAMoins18Final(selectedType, aetiType);
            });
        });

        document.getElementById('aeti-back')?.addEventListener('click', () => {
            delaiCompletEtapeMoisDCA(data, selectedType);
        });
    }, 50);
}

// DCA non à jour et <= 18 mois : afficher juste le commentaire AFFAIRE WATT
function delaiCompletDCAMoins18Final(selectedType, aetiType) {
    document.getElementById('modal').classList.add('hidden');

    let commentaireTexte = '';

    if (aetiType === 'AE' && selectedType === 'A/C') {
        commentaireTexte = 'SUR PO REFUS 12 en raison de DCA manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
    } else if (aetiType === 'AE' && selectedType === 'PL') {
        commentaireTexte = 'SUR PO REFUS 67 en raison de DCA manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
    } else if (aetiType === 'TI' && selectedType === 'A/C') {
        commentaireTexte = 'SUR PO REFUS 03 en raison de déclaration de revenu manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
    } else if (aetiType === 'TI' && selectedType === 'PL') {
        commentaireTexte = 'SUR PO REFUS 67 en raison de déclaration de revenu manquante. Une notification a été envoyée à l\'usager via SCRIBE.';
    }

    const commentText = document.getElementById('comment-text');
    commentText.classList.remove('hidden');

    commentText.innerHTML = `
        <div class="delai-final-page">
            <div class="delai-category-title">AFFAIRE WATT</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${commentaireTexte}</div>
                <button type="button" class="copy-btn-small" id="copy-dca-watt">Copier</button>
                <span class="copy-feedback-inline" id="feedback-dca-watt"></span>
            </div>
        </div>
    `;

    document.getElementById('copy-comment-btn').style.display = 'none';

    document.getElementById('copy-dca-watt').addEventListener('click', () => {
        navigator.clipboard.writeText(commentaireTexte).then(() => {
            const feedback = document.getElementById('feedback-dca-watt');
            feedback.textContent = 'Copié !';
            setTimeout(() => { feedback.textContent = ''; }, 2000);
        });
    });
}

// Étape 2 : Demander le nombre de mois
function delaiCompletEtape2(data, selectedType) {
    let formHTML = '';
    data.variables.forEach(v => {
        formHTML += `
            <div class="form-group">
                <label>${v.question}</label>
                <input type="text" id="delai-var-${v.id}" class="modal-input">
            </div>
        `;
    });
    formHTML += `<button type="button" class="back-btn" id="delai-back-1">← Retour</button>`;

    showModal('', formHTML, () => {
        const varValues = {};
        data.variables.forEach(v => {
            varValues[v.id] = document.getElementById(`delai-var-${v.id}`).value;
        });

        updateRecap('Mois', varValues.MOIS);

        // Vérifier si le nombre de mois est > 36
        const nbMois = parseInt(varValues.MOIS);
        if (nbMois > 36) {
            delaiCompletRefus36(data, selectedType, varValues);
        } else {
            delaiCompletEtape3(data, selectedType, varValues);
        }
    });

    setTimeout(() => {
        const firstInput = document.querySelector('.modal-input');
        if (firstInput) firstInput.focus();

        document.getElementById('delai-back-1')?.addEventListener('click', () => {
            startDelaiComplet(data);
        });
    }, 100);
}

// Refus si > 36 mois
function delaiCompletRefus36(data, selectedType, varValues) {
    document.getElementById('modal').classList.add('hidden');

    const nbMois = varValues.MOIS;

    const texteRefus = `Vous sollicitez un délai de paiement sur ${nbMois} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.

Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, sous quinze jours, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :
- Copie de votre dernier avis d'imposition ;
- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;
- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;
- Votre demande doit être motivée et justifiée ;
- et tout autre élément que vous jugerez utile.

Dans cette attente, la procédure de recouvrement n'est pas suspendue.

Par ailleurs, en cas de recouvrement par voie de commissaire de justice, nous vous invitons à adresser directement votre proposition de règlement à l'étude en charge de votre dossier.`;

    // Récupérer le commentaire selon le type (on garde 18 mois dans le commentaire)
    const commentaireTexte = data.commentaires[selectedType].normal;

    // Afficher dans la section commentaire
    const commentText = document.getElementById('comment-text');
    commentText.classList.remove('hidden');

    // Mettre "sous quinze jours" en gras pour l'affichage
    const texteRefusHTML = texteRefus
        .replace(/\n/g, '<br>')
        .replace(/sous quinze jours/g, '<b>sous quinze jours</b>');

    commentText.innerHTML = `
        <div class="delai-final-page">
            <div class="delai-category-title">Texte du courrier</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${texteRefusHTML}</div>
                <button type="button" class="copy-btn-small" data-texte="courrier">Copier</button>
                <span class="copy-feedback-inline" id="feedback-courrier"></span>
            </div>

            <div class="delai-category-title">AFFAIRE WATT</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${commentaireTexte}</div>
                <button type="button" class="copy-btn-small" data-texte="commentaire">Copier</button>
                <span class="copy-feedback-inline" id="feedback-commentaire"></span>
            </div>
        </div>
    `;

    // Cacher le bouton "Créer le commentaire"
    document.getElementById('copy-comment-btn').style.display = 'none';

    // Créer le HTML formaté pour le courrier (pour coller dans Word/Outlook)
    const courrierHTMLFormate = `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${texteRefus
        .replace(/\n/g, '</p><p>')
        .replace(/sous quinze jours/g, '<b>sous quinze jours</b>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
    }</div>`;

    // Stocker les textes pour la copie
    const textes = {
        courrier: { plain: texteRefus, html: courrierHTMLFormate },
        commentaire: { plain: commentaireTexte, html: `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${commentaireTexte}</div>` }
    };

    // Ajouter les événements sur les boutons Copier
    commentText.querySelectorAll('.copy-btn-small').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.texte;
            const data = textes[type];

            try {
                const blobHtml = new Blob([data.html], { type: 'text/html' });
                const blobText = new Blob([data.plain], { type: 'text/plain' });

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': blobHtml,
                        'text/plain': blobText
                    })
                ]);

                const feedback = document.getElementById(`feedback-${type}`);
                feedback.textContent = 'Copié !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            } catch (err) {
                // Fallback si l'API ne fonctionne pas
                navigator.clipboard.writeText(data.plain).then(() => {
                    const feedback = document.getElementById(`feedback-${type}`);
                    feedback.textContent = 'Copié !';
                    setTimeout(() => { feedback.textContent = ''; }, 2000);
                });
            }
        });
    });
}

// Étape 3 : Demander + de 50 000€
function delaiCompletEtape3(data, selectedType, varValues) {
    const formHTML = `
        <div class="form-group">
            <label>${data.question50k}</label>
            <div class="button-group">
                <button type="button" class="choice-btn" data-choice="oui">Oui</button>
                <button type="button" class="choice-btn" data-choice="non">Non</button>
            </div>
        </div>
        <button type="button" class="back-btn" id="delai-back-2">← Retour</button>
    `;

    showModal('', formHTML, null, true);

    setTimeout(() => {
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const is50kPlus = btn.dataset.choice === 'oui';
                updateRecap('+50 000€', is50kPlus ? 'Oui' : 'Non');
                delaiCompletFinal(data, selectedType, varValues, is50kPlus);
            });
        });

        document.getElementById('delai-back-2')?.addEventListener('click', () => {
            delaiCompletEtape2(data, selectedType);
        });
    }, 50);
}

// Étape finale : Afficher le texte + commentaire
function delaiCompletFinal(data, selectedType, varValues, is50kPlus) {
    document.getElementById('modal').classList.add('hidden');

    // Choisir le bon texte selon 50k+
    let texteCourrier = is50kPlus ? data.texteOui : data.texteNon;

    // Remplacer les variables
    for (const [id, value] of Object.entries(varValues)) {
        texteCourrier = texteCourrier.replace(new RegExp(`\\{${id}\\}`, 'g'), value);
    }

    // Récupérer le commentaire selon le type et si + de 50k
    const commentaireTexte = is50kPlus ? data.commentaires[selectedType].plus50k : data.commentaires[selectedType].normal;

    // Afficher dans la section commentaire
    const commentText = document.getElementById('comment-text');
    commentText.classList.remove('hidden');

    // Mettre "sous quinze jours" en gras pour l'affichage
    const texteCourrierHTML = texteCourrier
        .replace(/\n/g, '<br>')
        .replace(/sous quinze jours/g, '<b>sous quinze jours</b>');

    commentText.innerHTML = `
        <div class="delai-final-page">
            <div class="delai-category-title">Texte du courrier</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${texteCourrierHTML}</div>
                <button type="button" class="copy-btn-small" data-texte="courrier">Copier</button>
                <span class="copy-feedback-inline" id="feedback-courrier"></span>
            </div>

            <div class="delai-category-title">AFFAIRE WATT</div>
            <div class="delai-comment-block">
                <div class="delai-comment-text">${commentaireTexte}</div>
                <button type="button" class="copy-btn-small" data-texte="commentaire">Copier</button>
                <span class="copy-feedback-inline" id="feedback-commentaire"></span>
            </div>
        </div>
    `;

    // Cacher le bouton "Créer le commentaire"
    document.getElementById('copy-comment-btn').style.display = 'none';

    // Créer le HTML formaté pour le courrier (pour coller dans Word/Outlook)
    const courrierHTMLFormate = `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${texteCourrier
        .replace(/\n/g, '</p><p>')
        .replace(/sous quinze jours/g, '<b>sous quinze jours</b>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
    }</div>`;

    // Stocker les textes pour la copie
    const textes = {
        courrier: { plain: texteCourrier, html: courrierHTMLFormate },
        commentaire: { plain: commentaireTexte, html: `<div style="font-family: Arial, sans-serif; font-size: 11pt;">${commentaireTexte}</div>` }
    };

    // Ajouter les événements sur les boutons Copier
    commentText.querySelectorAll('.copy-btn-small').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.texte;
            const data = textes[type];

            try {
                const blobHtml = new Blob([data.html], { type: 'text/html' });
                const blobText = new Blob([data.plain], { type: 'text/plain' });

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': blobHtml,
                        'text/plain': blobText
                    })
                ]);

                const feedback = document.getElementById(`feedback-${type}`);
                feedback.textContent = 'Copié !';
                setTimeout(() => { feedback.textContent = ''; }, 2000);
            } catch (err) {
                // Fallback si l'API ne fonctionne pas
                navigator.clipboard.writeText(data.plain).then(() => {
                    const feedback = document.getElementById(`feedback-${type}`);
                    feedback.textContent = 'Copié !';
                    setTimeout(() => { feedback.textContent = ''; }, 2000);
                });
            }
        });
    });
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
        document.getElementById('template-display').classList.add('hidden');
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
