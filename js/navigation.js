// =====================
// NAVIGATION (Catégories et sous-catégories)
// =====================

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
            startDelaiComplet(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_dca') {
            startDelaiDca(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_co') {
            startDelaiCo(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'delai_soumission') {
            startDelaiSoumission();
        } else if (typeof commentaire === 'object' && commentaire.type === 'cascade' && category === 'ANV') {
            startAnvToutEnUn(commentaire);
        } else if (typeof commentaire === 'object' && commentaire.type === 'reexecution') {
            startReexecution();
        }
    }
}
