// =====================
// VARIABLES D'ÉTAT GLOBALES
// =====================

// Navigation
let currentData = null;
let currentCategory = null;
let currentSubcat = null;
let adminMode = false;

// Récapitulatif des choix
let recapChoix = {};

// =====================
// ÉTAT RÉEXÉCUTION
// =====================
let reexImages = [];
let reexPasteHandler = null;
let reexState = {
    date: '',
    adresse: '',
    instruction: 'DEFAUT'
};
let reexFocus = {
    rowIndex: 0,
    btnIndex: 0,
    inResults: false,
    resultIndex: 0
};

// =====================
// ÉTAT DÉLAI COMPLET
// =====================
let toutEnUnState = {
    type: null,      // A/C ou PL
    dca: null,       // Oui ou Non
    mois: '',        // Nombre de mois
    plus50k: null,   // Oui ou Non
    aeti: null       // AE ou TI
};
let toutEnUnFocus = {
    rowIndex: 0,
    btnIndex: 0,
    inResults: false,
    resultIndex: 0
};

// =====================
// ÉTAT DÉLAI DCA
// =====================
let dcaState = {
    type: null,     // A/C ou PL
    aeTi: null      // AE ou TI
};
let dcaData = null;
let dcaFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

// =====================
// ÉTAT DÉLAI CO
// =====================
let coState = {
    totalite: null,  // OUI ou NON (première question)
    actifRadie: null,  // ACTIF ou RADIÉ (si totalite = NON)
    coApresDemande: null, // OUI ou NON (si totalite = NON)
    dateDemandeDelai: '', // si coApresDemande = NON
    numerosContrainte: [''], // tableau si coApresDemande = NON
    datesSignification: [''], // tableau si coApresDemande = NON
    ribPresent: null, // OUI ou NON
    mois: '',
    echeance: '',
    telCj: '',
    mailCj: ''
};
let coData = null;
let coFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

// =====================
// ÉTAT DÉLAI SOUMISSION
// =====================
let soumissionState = {
    retourSoumission: null, // OUI ou NON
    coEnCours: null,        // OUI ou NON (si retourSoumission = OUI)
    actifRadie: null,       // ACTIF ou RADIÉ
    ribPresent: null,       // OUI ou NON
    dcaDrAJour: null,       // OUI ou NON (si retourSoumission = NON)
    mois: '',
    echeance: '',
    telCj: '',
    mailCj: ''
};
let soumissionFocus = { rowIndex: 0, btnIndex: 0, inResults: false, resultIndex: 0 };

// =====================
// ÉTAT ANV
// =====================
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
let anvFocus = {
    rowIndex: 0,
    btnIndex: 0,
    inResults: false,
    resultIndex: 0
};
let anvData = null;
let anvChoixAnv = [];
let anvChoixSousMotif = [];
let anvIsPartielle = false;

// État ANV NON EXIGIBLE
let anvNonExigibleMode = false;
let anvNonExigibleState = {
    nouvelleAdresse: null,  // Oui ou Non
    sattInfructueuse: null, // Oui ou Non
    compteEnLigne: null     // Oui ou Non
};

// État ANV VERSEMENTS RÉCENT
let anvVersementsMode = false;
let anvVersementsState = {
    fraisFrustratoires: null,  // Oui ou Non
    delaiEnCours: null,        // Oui ou Non
    versements: ''             // Texte collé
};

// Stockage temporaire des textes pour la copie
window.resultTextes = {};
