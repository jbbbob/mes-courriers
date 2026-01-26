// =====================
// FONCTIONS ADMIN (CRUD catégories/sous-catégories)
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

// Initialiser les événements d'édition admin
function initAdminEvents() {
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
}
