// Structure des courriers par défaut
const DATA_VERSION = 13;

const defaultCourriers = {
    "ANV": {
        "ANV": {
            texte: null,
            commentaire: {
                type: "cascade",
                question: "RADIÉ OU ACTIF ?",
                isPartielleQuestion: true,
                choix: [
                    {
                        label: "RADIÉ",
                        setPartielle: false,
                        next: {
                            question: "CHOISIR LE TYPE",
                            choix: [
                                {
                                    label: "A/C",
                                    next: {
                                        question: "ANV ?",
                                        choix: [
                                            {
                                                label: "11 - INSOLVABILITÉ",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "01 - PV DE CARENCE", texte: "ANV 11 SS MOTIF 01 PV DE CARENCE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "02 - S ATT NÉGATIVE", texte: "ANV 11 SS MOTIF 02 S ATT NEGATIVE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "06 - CERTIFICAT D'IRRÉCOUVRABILITÉ", texte: "ANV 11 SS MOTIF 06 COU HJ NEGATIVE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "11 - FICOBA NÉGATIF", texte: "ANV 11 SS MOTIF 11 FICOBA NEGATIF GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            },
                                            {
                                                label: "12 - DISPARITION DU DÉBITEUR",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "20 - PV 659", texte: "ANV 12 SS MOTIF 20 PV 659 CPC GED DU {DATE} ET RECH EOPPS + FICOBA RECENTE", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "25 - ENQ PSA/ETRANG", texte: "ANV 12 SS MOTIF 25 ENQ PSA/ETRANG GED DU {DATE} ET RECH EOPPS + FICOBA RECENTE", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            },
                                            { label: "13 - DÉCÉDÉ", texte: "ANV 13 SS MOTIF - DECEDE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                            { label: "14 - LIQUIDATION JUDICIAIRE (CIA)", texte: "ANV 14 SS MOTIF - LIQUIDATION JUDICIAIRE (CIA) GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                            {
                                                label: "16 - CRÉANCE < SEUIL 197€",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "32 - PAS DE PJ", texte: "ANV 16 SS MOTIF 32 - CONSTAT DU {DATE}", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    label: "PL",
                                    next: {
                                        question: "ANV ?",
                                        choix: [
                                            {
                                                label: "11 - INSOLVABILITÉ",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "PV DE CARENCE", texte: "ANV 11: CARENCE-CONSTAT DU {DATE} - PV DE CARENCE", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "S ATT NÉGATIVE", texte: "ANV 11: CARENCE-CONSTAT DU {DATE} - S ATT NEGATIVE", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "CERTIFICAT D'IRRÉCOUVRABILITÉ", texte: "ANV 11: CARENCE-CONSTAT DU {DATE} - CERTIF IRRECOUV.", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "FICOBA NÉGATIF", texte: "ANV 11: CARENCE-CONSTAT DU {DATE} - FICOBA NEGATIF", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            },
                                            {
                                                label: "12 - DISPARITION DU DÉBITEUR",
                                                variable: { id: "DATE", question: "DATE ?" },
                                                nextAfterVariable: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "PV 659", texte: "ANV12 : RECHERCHES NEGATIVES - CONSTAT DU {DATE} - ART 659 CPC" },
                                                        { label: "MD PSA", texte: "ANV12 : RECHERCHES NEGATIVES - CONSTAT DU {DATE}" }
                                                    ]
                                                }
                                            },
                                            { label: "16 - CRÉANCE < SEUIL 197€", texte: "ANV 16:CREANCE<AU SEUIL - CONSTAT DU {DATE}", variable: { id: "DATE", question: "DATE ?" } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        label: "ACTIF",
                        setPartielle: true,
                        next: {
                            question: "CHOISIR LE TYPE",
                            choix: [
                                {
                                    label: "A/C",
                                    next: {
                                        question: "ANV ?",
                                        choix: [
                                            {
                                                label: "11 - INSOLVABILITÉ",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "01 - PV DE CARENCE", texte: "ANV PARTIELLE 11 SS MOTIF 01 PV DE CARENCE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "02 - S ATT NÉGATIVE", texte: "ANV PARTIELLE 11 SS MOTIF 02 S ATT NEGATIVE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "06 - CERTIFICAT D'IRRÉCOUVRABILITÉ", texte: "ANV PARTIELLE 11 SS MOTIF 06 COU HJ NEGATIVE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "11 - FICOBA NÉGATIF", texte: "ANV PARTIELLE 11 SS MOTIF 11 FICOBA NEGATIF GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            },
                                            {
                                                label: "12 - DISPARITION DU DÉBITEUR",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "20 - PV 659", texte: "ANV PARTIELLE 12 SS MOTIF 20 PV 659 CPC GED DU {DATE} ET RECH EOPPS + FICOBA RECENTE", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "25 - ENQ PSA/ETRANG", texte: "ANV PARTIELLE 12 SS MOTIF 25 ENQ PSA/ETRANG GED DU {DATE} ET RECH EOPPS + FICOBA RECENTE", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            },
                                            { label: "13 - DÉCÉDÉ", texte: "ANV PARTIELLE 13 SS MOTIF - DECEDE GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                            { label: "14 - LIQUIDATION JUDICIAIRE (CIA)", texte: "ANV PARTIELLE 14 SS MOTIF - LIQUIDATION JUDICIAIRE (CIA) GED DU {DATE}", variable: { id: "DATE", question: "DATE ?" } },
                                            {
                                                label: "16 - CRÉANCE < SEUIL 197€",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "32 - PAS DE PJ", texte: "ANV PARTIELLE 16 SS MOTIF 32 - CONSTAT DU {DATE}", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    label: "PL",
                                    next: {
                                        question: "ANV ?",
                                        choix: [
                                            {
                                                label: "11 - INSOLVABILITÉ",
                                                next: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "PV DE CARENCE", texte: "ANV PARTIELLE 11: CARENCE-CONSTAT DU {DATE} - PV DE CARENCE", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "S ATT NÉGATIVE", texte: "ANV PARTIELLE 11: CARENCE-CONSTAT DU {DATE} - S ATT NEGATIVE", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "CERTIFICAT D'IRRÉCOUVRABILITÉ", texte: "ANV PARTIELLE 11: CARENCE-CONSTAT DU {DATE} - CERTIF IRRECOUV.", variable: { id: "DATE", question: "DATE ?" } },
                                                        { label: "FICOBA NÉGATIF", texte: "ANV PARTIELLE 11: CARENCE-CONSTAT DU {DATE} - FICOBA NEGATIF", variable: { id: "DATE", question: "DATE ?" } }
                                                    ]
                                                }
                                            },
                                            {
                                                label: "12 - DISPARITION DU DÉBITEUR",
                                                variable: { id: "DATE", question: "DATE ?" },
                                                nextAfterVariable: {
                                                    question: "SOUS-MOTIF ?",
                                                    choix: [
                                                        { label: "PV 659", texte: "ANV PARTIELLE 12: RECHERCHES NEGATIVES CONSTAT DU {DATE} ART 659 CPC" },
                                                        { label: "MD PSA", texte: "ANV PARTIELLE 12 : RECHERCHES NEGATIVES - CONSTAT DU {DATE}" }
                                                    ]
                                                }
                                            },
                                            { label: "16 - CRÉANCE < SEUIL 197€", texte: "ANV PARTIELLE 16:CREANCE<AU SEUIL - CONSTAT DU {DATE}", variable: { id: "DATE", question: "DATE ?" } }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    },
    "DÉLAI": {
        "REFUS - PAS DE PJ": {
            texte: null,
            commentaire: {
                type: "delai_complet",
                variables: [
                    { id: "MOIS", question: "NOMBRE DE MOIS SOUHAITÉ ?" }
                ],
                question50k: "+ DE 50 000€ ?",
                texteOui: `Vous sollicitez un délai de paiement sur {MOIS} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

Compte tenu du montant de votre dette, l'étude de votre dossier nécessite la transmission, sous quinze jours, de tous les éléments ou justificatifs permettant de préciser les points suivants :
- Copie de votre dernier avis d'imposition ;
- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;
- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;
- Votre demande doit être motivée et justifiée ;
- et tout autre élément que vous jugerez utile.

Dans cette attente, la procédure de recouvrement n'est pas suspendue.

Par ailleurs, en cas de recouvrement par voie de commissaire de justice, nous vous invitons à adresser directement votre proposition de règlement à l'étude en charge de votre dossier.`,
                texteNon: `Vous sollicitez un délai de paiement sur {MOIS} mois pour le règlement de vos cotisations sociales auprès de notre organisme.

Afin d'étudier votre dossier, nous vous remercions de nous transmettre, sous quinze jours, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :
- Copie de votre dernier avis d'imposition ;
- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;
- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;
- Votre demande doit être motivée et justifiée ;
- et tout autre élément que vous jugerez utile.

Dans cette attente, la procédure de recouvrement n'est pas suspendue.

Par ailleurs, en cas de recouvrement par voie de commissaire de justice, nous vous invitons à adresser directement votre proposition de règlement à l'étude en charge de votre dossier.`,
                commentaires: {
                    "A/C": {
                        normal: `SUR PO REFUS 06 en raison de l'absence de justificatifs concernant la demande de délai supérieure à 18 mois. Une demande de pièces complémentaires a été transmise via SCRIBE.`,
                        plus50k: `SUR PO REFUS 06 en raison de l'absence de justificatifs concernant la demande de délai avec une dette supérieur à 50 000€. Une demande de pièces complémentaires a été transmise via SCRIBE.`
                    },
                    "PL": {
                        normal: `SUR PO REFUS 65 en raison de l'absence de justificatifs concernant la demande de délai supérieure à 18 mois. Une demande de pièces complémentaires a été transmise via SCRIBE.`,
                        plus50k: `SUR PO REFUS 65 en raison de l'absence de justificatifs concernant la demande de délai avec une dette supérieur à 50 000€. Une demande de pièces complémentaires a été transmise via SCRIBE.`
                    }
                }
            }
        },
        "REFUS - DCA/DR MANQUANTE": {
            texte: null,
            commentaire: {
                type: "delai_dca",
                question: "TYPE ?",
                choix: [
                    {
                        label: "A/C",
                        next: {
                            question: "AE OU TI ?",
                            choix: [
                                { label: "AE", texte: "SUR PO REFUS 12 en raison de ses DCA manquantes. Une notification a été envoyée à l'usager via SCRIBE." },
                                { label: "TI", texte: "SUR PO REFUS 03 en raison de ses déclarations de revenus manquantes. Une notification a été envoyée à l'usager via SCRIBE." }
                            ]
                        }
                    },
                    {
                        label: "PL",
                        next: {
                            question: "AE OU TI ?",
                            choix: [
                                { label: "AE", texte: "SUR PO REFUS 67 en raison de ses DCA manquantes. Une notification a été envoyée à l'usager via SCRIBE." },
                                { label: "TI", texte: "SUR PO REFUS 67 en raison de ses déclarations de revenus manquantes. Une notification a été envoyée à l'usager via SCRIBE." }
                            ]
                        }
                    }
                ]
            }
        },
        "DÉLAI AVEC CO EN COURS": {
            texte: null,
            commentaire: {
                type: "delai_co",
                question: "CO EN COURS SUR LA TOTALITÉ DE LA DETTE ?",
                texteOui: `Nous vous informons que nous ne pouvons pas donner une suite favorable à votre demande de délai.

En effet, la totalité de votre dette fait actuellement l'objet d'une procédure de recouvrement forcé.

Nous vous invitons à prendre contact dans les plus brefs délais avec l'étude d'huissier en charge de votre dossier (tél : {TEL_CJ}, mail : {MAIL_CJ}), afin de convenir d'un échéancier et d'éviter l'application de frais supplémentaires.`
            }
        },
        "SOUMISSION": {
            texte: null,
            commentaire: {
                type: "delai_soumission"
            }
        }
    },
    "RÉEXÉCUTION": {
        "RÉEXÉCUTION": {
            displayTitle: "",
            texte: null,
            commentaire: {
                type: "reexecution"
            }
        }
    }
};

// Fusion profonde de deux objets
function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = JSON.parse(JSON.stringify(source[key]));
            }
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

// Charger les courriers en fusionnant défauts + modifications perso
function loadCourriers() {
    const savedVersion = localStorage.getItem('courriers_version');
    const savedCustom = localStorage.getItem('courriers_custom');

    // Partir des données par défaut
    let data = JSON.parse(JSON.stringify(defaultCourriers));

    // Fusionner avec les modifications perso si elles existent
    if (savedCustom) {
        const custom = JSON.parse(savedCustom);
        data = deepMerge(data, custom);
    }

    // Mettre à jour la version
    localStorage.setItem('courriers_version', DATA_VERSION);

    return data;
}

// Sauvegarder uniquement les modifications perso (différences avec les défauts)
function saveCourriers() {
    // Sauvegarder tout dans courriers_custom
    localStorage.setItem('courriers_custom', JSON.stringify(courriers));
}

// Réinitialiser aux valeurs par défaut
function resetCourriers() {
    localStorage.removeItem('courriers_custom');
    localStorage.setItem('courriers_version', DATA_VERSION);
    courriers = JSON.parse(JSON.stringify(defaultCourriers));
}

let courriers = loadCourriers();
