// ═══════════════════════════════════════════════════════════
//  ApplyStack · Internationalisation (EN / FR)
//  Usage:
//    t('key')            → translated string in current lang
//    applyLang(lang)     → apply translations to DOM + save pref
//    getLang()           → 'en' | 'fr'
// ═══════════════════════════════════════════════════════════

var I18N = {

  /* ─────────────────────────────────── ENGLISH ── */
  en: {
    /* ── Nav (shared) ── */
    'nav.logo':          'ApplyStack',
    'nav.builder':       '← Resume Builder',
    'nav.account':       'Account',
    'nav.interview':     '🎤 Interview Coach',
    'nav.back_home':     '← Back to home',
    'nav.sign_out':      'Sign out',
    'nav.tracker':       '📋 Tracker',

    /* ── Auth ── */
    'auth.title':            'Welcome to ApplyStack',
    'auth.subtitle':         'Your entire job stack, one place.',
    'auth.free_badge':       '🎁 Free: 1 tailored resume + download · no credit card needed',
    'auth.tab_signin':       'Sign in',
    'auth.tab_register':     'Create account',
    'auth.email':            'Email address',
    'auth.password':         'Password',
    'auth.password_min':     'Password (min 8 characters)',
    'auth.confirm_password': 'Confirm password',
    'auth.beta_code':        'Beta access code',
    'auth.beta_code_hint':   '(optional · unlocks full Pro access for 24h)',
    'auth.btn_signin':       'Sign in',
    'auth.btn_register':     'Create free account',
    'auth.terms':            'By signing up you agree to our Terms of Service and Privacy Policy.',
    'auth.placeholder_email':   'you@example.com',
    'auth.placeholder_pw':      'Your password',
    'auth.placeholder_new_pw':  'Create a password',
    'auth.placeholder_confirm': 'Repeat password',
    'auth.placeholder_beta':    'e.g. AB12-CD34-EF56',
    'auth.loading':             'Please wait…',
    'auth.error_network':       'Network error. Please try again.',
    'auth.error_mismatch':      'Passwords do not match.',

    /* ── Account ── */
    'acct.title':           'My Account',
    'acct.plan_card':       'Your Plan',
    'acct.stat_tailors':    'Resumes tailored',
    'acct.stat_plan':       'Current plan',
    'acct.stat_status':     'Status',
    'acct.free_used':       'Free tailoring used:',
    'acct.free_hint':       'Upgrade to Pro for unlimited tailoring and all premium features.',
    'acct.manage_billing':  'Manage billing →',
    'acct.referral_title':  '🎁 Refer a Friend · Earn Free Tailorings',
    'acct.referral_desc':   'Share your personal link. When a friend signs up and builds their first resume, you both get 1 free bonus tailoring. Works even on the free plan.',
    'acct.copy_link':       '📋 Copy Link',
    'acct.copied':          '✅ Copied!',
    'acct.ref_friends':     'Friends referred',
    'acct.ref_credits':     'Free tailorings earned',
    'acct.ref_code':        'Your referral code',
    'acct.ref_note':        'Credits are awarded automatically when your referred friend completes their first resume build.',
    'acct.upgrade_title':   'Upgrade to Pro',
    'acct.upgrade_desc':    'Get unlimited resume tailoring, ATS scoring, cover letters, skills gap analysis, interview prep, and more.',
    'acct.per_month':       'per month',
    'acct.per_year':        'per year',
    'acct.save_27':         'Save 27%',
    'acct.upgrade_btn':     'Upgrade to Pro →',
    'acct.stripe_note':     'Secure payment via Stripe · Cancel anytime',
    'acct.details_title':   'Account Details',
    'acct.email_label':     'Email',
    'acct.since_label':     'Member since',
    'acct.signout_btn':     'Sign out',
    'acct.danger_title':    'Danger Zone',
    'acct.delete_label':    'Delete my account',
    'acct.delete_desc':     'Permanently removes your account and all data. This cannot be undone.',
    'acct.delete_btn':      'Delete account',
    'acct.modal_title':     '⚠️ Delete your account?',
    'acct.modal_body':      'This will permanently delete your account, all your data, and cancel any active subscription. To confirm, type DELETE in the box below.',
    'acct.modal_placeholder': 'Type DELETE to confirm',
    'acct.modal_cancel':    'Cancel',
    'acct.modal_confirm':   'Delete forever',
    'acct.status_active':   'Active',
    'acct.status_free':     'Free',
    'acct.status_past_due': 'Past Due',

    /* ── Tracker ── */
    'trk.title':         '📋 Job Application Tracker',
    'trk.subtitle':      'Track every application, update statuses, and never lose a lead.',
    'trk.all':           'All',
    'trk.applied':       'Applied',
    'trk.phone':         'Phone Screen',
    'trk.interview':     'Interview',
    'trk.final':         'Final Round',
    'trk.offers':        'Offers 🎉',
    'trk.rejected':      'Rejected',
    'trk.withdrawn':     'Withdrawn',
    'trk.col_company':   'Company',
    'trk.col_role':      'Role',
    'trk.col_applied':   'Applied',
    'trk.col_ats':       'ATS',
    'trk.col_status':    'Status',
    'trk.col_files':     'Files',
    'trk.col_jd':        'JD',
    'trk.col_notes':     'Notes',
    'trk.add_btn':       '+ Add Application',
    'trk.export_btn':    '⬇ Export CSV',
    'trk.empty_title':   'No applications yet',
    'trk.empty_desc':    'Build a resume in the Resume Builder to auto-add it here, or click + Add Application to track manually.',
    'trk.search':        '🔍  Search by company or role…',
    'trk.no_resume':     'No resume',
    'trk.no_cover':      'No cover',
    'trk.notes_ph':      'Add notes…',
    'trk.view_jd':       '📋 View JD',
    'trk.details':       '🗂 Details',
    'trk.remove':        'Remove this application?',

    /* Add modal */
    'trk.add_title':     '➕ Add Application',
    'trk.add_subtitle':  "Fill in what you know — you can always update it later.",
    'trk.basic_info':    'Basic Info',
    'trk.company':       'Company *',
    'trk.role':          'Role *',
    'trk.company_ph':    'e.g. Google, Stripe',
    'trk.role_ph':       'e.g. Product Manager',
    'trk.date_applied':  'Date Applied',
    'trk.status_label':  'Status',
    'trk.method_label':  'Application Method',
    'trk.method_ph':     '— Select —',
    'trk.followup':      'Follow-up Date',
    'trk.salary':        'Salary / Compensation',
    'trk.salary_ph':     'e.g. $90k–$110k',
    'trk.job_url':       'Job Posting URL',
    'trk.recruiter':     'Recruiter / Contact',
    'trk.rec_name':      'Recruiter Name',
    'trk.rec_email':     'Recruiter Email',
    'trk.rec_phone':     'Recruiter Phone',
    'trk.rec_linkedin':  'Recruiter LinkedIn',
    'trk.documents':     'Documents',
    'trk.resume_used':   'Resume Used',
    'trk.cover_used':    'Cover Letter Used',
    'trk.resume_ph':     'Upload resume (PDF, DOCX, TXT)',
    'trk.cover_ph':      'Upload cover letter (PDF, DOCX, TXT)',
    'trk.notes_label':   'Notes',
    'trk.notes_full_ph': 'Recruiter name, salary range, interview tips, anything useful…',
    'trk.add_confirm':   'Add Application',
    'trk.cancel':        'Cancel',

    /* Detail modal */
    'trk.dm_appinfo':     '📋 Application Info',
    'trk.dm_date':        'Date Applied',
    'trk.dm_ats':         'ATS Score',
    'trk.dm_method':      'Application Method',
    'trk.dm_followup':    'Follow-up Date',
    'trk.dm_salary':      'Salary / Comp',
    'trk.dm_url':         'Job Posting URL',
    'trk.dm_recruiter':   '👤 Recruiter / Contact',
    'trk.dm_rec_name':    'Name',
    'trk.dm_rec_email':   'Email',
    'trk.dm_rec_phone':   'Phone',
    'trk.dm_rec_linkedin':'LinkedIn',
    'trk.dm_docs':        '📁 Documents',
    'trk.dm_notes':       '📝 Notes',
    'trk.dm_save':        'Save Notes',
    'trk.dm_saved':       '✓ Saved!',
    'trk.dm_no_docs':     'No documents attached yet.',
    'trk.dl_resume':      '📄 Download Resume',
    'trk.dl_cover':       '✉️ Download Cover Letter',
    'trk.view_resume':    '📄 View Resume',
    'trk.view_cover':     '✉️ View Cover Letter',
    'trk.view_jd_btn':    '📋 View Job Description',

    /* File viewer */
    'trk.dl_btn':         '⬇ Download',
    'trk.loading':        'Loading preview…',
    'trk.file_not_found': 'File not found. It may not have been saved.',

    /* Methods */
    'trk.m_website':     'Company Website',
    'trk.m_linkedin':    'LinkedIn',
    'trk.m_indeed':      'Indeed',
    'trk.m_glassdoor':   'Glassdoor',
    'trk.m_referral':    'Referral',
    'trk.m_email':       'Email',
    'trk.m_recruiter':   'Recruiter',
    'trk.m_jobfair':     'Job Fair',
    'trk.m_other':       'Other',

    /* ── Interview Coach ── */
    'ic.title':          'Interview Coach',
    'ic.subtitle':       'AI-powered practice for every question type',
    'ic.back':           '← Back to Builder',
    'ic.pro_badge':      '⚡ Pro',

    /* ── App builder ── */
    'app.upload_resume':     'Upload your resume',
    'app.paste_jd':          'Paste job description',
    'app.tailor_btn':        '⚡ Tailor Resume',
    'app.preview':           'Preview',
    'app.download':          'Download',
    'app.ats_score':         'ATS Score',
    'app.cover_letter':      'Cover Letter',
    'app.tracker_btn':       '📋 Tracker',

    /* ── Index landing ── */
    'idx.nav_features':   'Features',
    'idx.nav_templates':  'Templates',
    'idx.nav_pricing':    'Pricing',
    'idx.nav_login':      'Sign in',
    'idx.nav_signup':     'Get started free',
    'idx.hero_badge':     '✨ AI-Powered Job Application Suite',
    'idx.hero_h1_1':      'Land More Interviews.',
    'idx.hero_h1_2':      'Get Hired Faster.',
    'idx.hero_sub':       'ApplyStack tailors your resume to every job with AI, scores it against the ATS, writes your cover letter, and coaches you through interviews — all in one place.',
    'idx.hero_cta':       '🚀 Start for free — no card needed',
    'idx.hero_demo':      'See how it works',
    'idx.footer_copy':    '© 2025 ApplyStack. All rights reserved.',
  },

  /* ─────────────────────────────────── FRENCH ── */
  fr: {
    /* ── Nav (shared) ── */
    'nav.logo':          'ApplyStack',
    'nav.builder':       '← Créateur de CV',
    'nav.account':       'Mon compte',
    'nav.interview':     '🎤 Coach Entretien',
    'nav.back_home':     '← Retour à l\'accueil',
    'nav.sign_out':      'Se déconnecter',
    'nav.tracker':       '📋 Suivi',

    /* ── Auth ── */
    'auth.title':            'Bienvenue sur ApplyStack',
    'auth.subtitle':         'Toute votre recherche d\'emploi, en un seul endroit.',
    'auth.free_badge':       '🎁 Gratuit : 1 CV personnalisé + téléchargement · sans carte bancaire',
    'auth.tab_signin':       'Se connecter',
    'auth.tab_register':     'Créer un compte',
    'auth.email':            'Adresse e-mail',
    'auth.password':         'Mot de passe',
    'auth.password_min':     'Mot de passe (8 caractères minimum)',
    'auth.confirm_password': 'Confirmer le mot de passe',
    'auth.beta_code':        'Code d\'accès bêta',
    'auth.beta_code_hint':   '(facultatif · déverrouille l\'accès Pro complet pendant 24h)',
    'auth.btn_signin':       'Se connecter',
    'auth.btn_register':     'Créer un compte gratuit',
    'auth.terms':            'En vous inscrivant, vous acceptez nos Conditions d\'utilisation et notre Politique de confidentialité.',
    'auth.placeholder_email':   'vous@exemple.com',
    'auth.placeholder_pw':      'Votre mot de passe',
    'auth.placeholder_new_pw':  'Créer un mot de passe',
    'auth.placeholder_confirm': 'Répéter le mot de passe',
    'auth.placeholder_beta':    'ex. AB12-CD34-EF56',
    'auth.loading':             'Veuillez patienter…',
    'auth.error_network':       'Erreur réseau. Veuillez réessayer.',
    'auth.error_mismatch':      'Les mots de passe ne correspondent pas.',

    /* ── Account ── */
    'acct.title':           'Mon compte',
    'acct.plan_card':       'Votre abonnement',
    'acct.stat_tailors':    'CV personnalisés',
    'acct.stat_plan':       'Abonnement actuel',
    'acct.stat_status':     'Statut',
    'acct.free_used':       'Personnalisation gratuite utilisée :',
    'acct.free_hint':       'Passez à Pro pour une personnalisation illimitée et toutes les fonctionnalités premium.',
    'acct.manage_billing':  'Gérer la facturation →',
    'acct.referral_title':  '🎁 Parrainer un ami · Gagnez des personnalisations gratuites',
    'acct.referral_desc':   'Partagez votre lien personnel. Quand un ami s\'inscrit et crée son premier CV, vous obtenez tous les deux 1 personnalisation gratuite. Valable même avec l\'offre gratuite.',
    'acct.copy_link':       '📋 Copier le lien',
    'acct.copied':          '✅ Copié !',
    'acct.ref_friends':     'Amis parrainés',
    'acct.ref_credits':     'Personnalisations gratuites gagnées',
    'acct.ref_code':        'Votre code de parrainage',
    'acct.ref_note':        'Les crédits sont attribués automatiquement lorsque votre ami parrainé complète sa première création de CV.',
    'acct.upgrade_title':   'Passer à Pro',
    'acct.upgrade_desc':    'Obtenez une personnalisation illimitée, le scoring ATS, des lettres de motivation, l\'analyse des écarts de compétences, la préparation aux entretiens et plus encore.',
    'acct.per_month':       'par mois',
    'acct.per_year':        'par an',
    'acct.save_27':         'Économisez 27%',
    'acct.upgrade_btn':     'Passer à Pro →',
    'acct.stripe_note':     'Paiement sécurisé via Stripe · Annulez à tout moment',
    'acct.details_title':   'Informations du compte',
    'acct.email_label':     'E-mail',
    'acct.since_label':     'Membre depuis',
    'acct.signout_btn':     'Se déconnecter',
    'acct.danger_title':    'Zone de danger',
    'acct.delete_label':    'Supprimer mon compte',
    'acct.delete_desc':     'Supprime définitivement votre compte et toutes vos données. Cette action est irréversible.',
    'acct.delete_btn':      'Supprimer le compte',
    'acct.modal_title':     '⚠️ Supprimer votre compte ?',
    'acct.modal_body':      'Cela supprimera définitivement votre compte, toutes vos données et annulera tout abonnement actif. Pour confirmer, tapez SUPPRIMER dans le champ ci-dessous.',
    'acct.modal_placeholder': 'Tapez SUPPRIMER pour confirmer',
    'acct.modal_cancel':    'Annuler',
    'acct.modal_confirm':   'Supprimer définitivement',
    'acct.status_active':   'Actif',
    'acct.status_free':     'Gratuit',
    'acct.status_past_due': 'Paiement dû',

    /* ── Tracker ── */
    'trk.title':         '📋 Suivi des candidatures',
    'trk.subtitle':      'Suivez chaque candidature, mettez à jour les statuts et ne perdez aucune piste.',
    'trk.all':           'Tout',
    'trk.applied':       'Postulé',
    'trk.phone':         'Entretien tél.',
    'trk.interview':     'Entretien',
    'trk.final':         'Tour final',
    'trk.offers':        'Offres 🎉',
    'trk.rejected':      'Refusé',
    'trk.withdrawn':     'Retiré',
    'trk.col_company':   'Entreprise',
    'trk.col_role':      'Poste',
    'trk.col_applied':   'Postulé le',
    'trk.col_ats':       'ATS',
    'trk.col_status':    'Statut',
    'trk.col_files':     'Fichiers',
    'trk.col_jd':        'FP',
    'trk.col_notes':     'Notes',
    'trk.add_btn':       '+ Ajouter une candidature',
    'trk.export_btn':    '⬇ Exporter CSV',
    'trk.empty_title':   'Aucune candidature pour l\'instant',
    'trk.empty_desc':    'Créez un CV dans le Créateur de CV pour l\'ajouter automatiquement ici, ou cliquez sur + Ajouter une candidature.',
    'trk.search':        '🔍  Rechercher par entreprise ou poste…',
    'trk.no_resume':     'Pas de CV',
    'trk.no_cover':      'Pas de lettre',
    'trk.notes_ph':      'Ajouter des notes…',
    'trk.view_jd':       '📋 Voir la FP',
    'trk.details':       '🗂 Détails',
    'trk.remove':        'Supprimer cette candidature ?',

    /* Add modal */
    'trk.add_title':     '➕ Ajouter une candidature',
    'trk.add_subtitle':  'Renseignez ce que vous savez — vous pourrez compléter plus tard.',
    'trk.basic_info':    'Informations de base',
    'trk.company':       'Entreprise *',
    'trk.role':          'Poste *',
    'trk.company_ph':    'ex. Google, Stripe',
    'trk.role_ph':       'ex. Chef de projet',
    'trk.date_applied':  'Date de candidature',
    'trk.status_label':  'Statut',
    'trk.method_label':  'Méthode de candidature',
    'trk.method_ph':     '— Sélectionner —',
    'trk.followup':      'Date de relance',
    'trk.salary':        'Salaire / Rémunération',
    'trk.salary_ph':     'ex. 45 000 € – 55 000 €',
    'trk.job_url':       'URL de l\'offre d\'emploi',
    'trk.recruiter':     'Recruteur / Contact',
    'trk.rec_name':      'Nom du recruteur',
    'trk.rec_email':     'E-mail du recruteur',
    'trk.rec_phone':     'Téléphone du recruteur',
    'trk.rec_linkedin':  'LinkedIn du recruteur',
    'trk.documents':     'Documents',
    'trk.resume_used':   'CV utilisé',
    'trk.cover_used':    'Lettre de motivation utilisée',
    'trk.resume_ph':     'Téléverser le CV (PDF, DOCX, TXT)',
    'trk.cover_ph':      'Téléverser la lettre (PDF, DOCX, TXT)',
    'trk.notes_label':   'Notes',
    'trk.notes_full_ph': 'Nom du recruteur, fourchette salariale, conseils d\'entretien…',
    'trk.add_confirm':   'Ajouter la candidature',
    'trk.cancel':        'Annuler',

    /* Detail modal */
    'trk.dm_appinfo':     '📋 Informations de candidature',
    'trk.dm_date':        'Date de candidature',
    'trk.dm_ats':         'Score ATS',
    'trk.dm_method':      'Méthode de candidature',
    'trk.dm_followup':    'Date de relance',
    'trk.dm_salary':      'Salaire / Rémunération',
    'trk.dm_url':         'URL de l\'offre',
    'trk.dm_recruiter':   '👤 Recruteur / Contact',
    'trk.dm_rec_name':    'Nom',
    'trk.dm_rec_email':   'E-mail',
    'trk.dm_rec_phone':   'Téléphone',
    'trk.dm_rec_linkedin':'LinkedIn',
    'trk.dm_docs':        '📁 Documents',
    'trk.dm_notes':       '📝 Notes',
    'trk.dm_save':        'Enregistrer les notes',
    'trk.dm_saved':       '✓ Enregistré !',
    'trk.dm_no_docs':     'Aucun document joint pour l\'instant.',
    'trk.dl_resume':      '📄 Télécharger le CV',
    'trk.dl_cover':       '✉️ Télécharger la lettre',
    'trk.view_resume':    '📄 Voir le CV',
    'trk.view_cover':     '✉️ Voir la lettre de motivation',
    'trk.view_jd_btn':    '📋 Voir la fiche de poste',

    /* File viewer */
    'trk.dl_btn':         '⬇ Télécharger',
    'trk.loading':        'Chargement de l\'aperçu…',
    'trk.file_not_found': 'Fichier introuvable. Il n\'a peut-être pas été enregistré.',

    /* Methods */
    'trk.m_website':     'Site de l\'entreprise',
    'trk.m_linkedin':    'LinkedIn',
    'trk.m_indeed':      'Indeed',
    'trk.m_glassdoor':   'Glassdoor',
    'trk.m_referral':    'Recommandation',
    'trk.m_email':       'E-mail',
    'trk.m_recruiter':   'Recruteur',
    'trk.m_jobfair':     'Forum emploi',
    'trk.m_other':       'Autre',

    /* ── Interview Coach ── */
    'ic.title':      'Coach Entretien',
    'ic.subtitle':   'Entraînement IA pour chaque type de question',
    'ic.back':       '← Retour au Créateur',
    'ic.pro_badge':  '⚡ Pro',

    /* ── App builder ── */
    'app.upload_resume':  'Téléverser votre CV',
    'app.paste_jd':       'Coller la description de poste',
    'app.tailor_btn':     '⚡ Personnaliser le CV',
    'app.preview':        'Aperçu',
    'app.download':       'Télécharger',
    'app.ats_score':      'Score ATS',
    'app.cover_letter':   'Lettre de motivation',
    'app.tracker_btn':    '📋 Suivi',

    /* ── Index landing ── */
    'idx.nav_features':   'Fonctionnalités',
    'idx.nav_templates':  'Modèles',
    'idx.nav_pricing':    'Tarifs',
    'idx.nav_login':      'Se connecter',
    'idx.nav_signup':     'Commencer gratuitement',
    'idx.hero_badge':     '✨ Suite IA de recherche d\'emploi',
    'idx.hero_h1_1':      'Décrochez plus d\'entretiens.',
    'idx.hero_h1_2':      'Soyez embauché plus vite.',
    'idx.hero_sub':       'ApplyStack adapte votre CV à chaque offre avec l\'IA, le note face aux ATS, rédige votre lettre de motivation et vous prépare aux entretiens — tout en un seul endroit.',
    'idx.hero_cta':       '🚀 Commencer gratuitement — sans carte',
    'idx.hero_demo':      'Voir comment ça marche',
    'idx.footer_copy':    '© 2025 ApplyStack. Tous droits réservés.',
  }
};

// ── Core functions ──────────────────────────────────────────
function getLang() {
  return localStorage.getItem('tc_lang') || 'en';
}

function t(key) {
  var lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
}

function applyLang(lang) {
  if (lang !== 'en' && lang !== 'fr') lang = 'en';
  localStorage.setItem('tc_lang', lang);

  // textContent translations
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    el.textContent = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  });

  // innerHTML translations (for strings with HTML tags)
  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-html');
    el.innerHTML = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  });

  // placeholder translations
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-ph');
    el.placeholder = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  });

  // title attribute translations
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-title');
    el.title = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  });

  // Update <html lang="">
  document.documentElement.lang = lang;

  // Update switcher button states
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    var active = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

// ── Switcher injection ──────────────────────────────────────
// Call this after the DOM loads on pages that don't have the
// switcher hardcoded in their nav.
function injectLangSwitcher(targetEl) {
  var sw = document.createElement('div');
  sw.className = 'lang-switch';
  sw.innerHTML =
    '<button class="lang-btn" data-lang="en" onclick="applyLang(\'en\')" aria-label="English">EN</button>' +
    '<button class="lang-btn" data-lang="fr" onclick="applyLang(\'fr\')" aria-label="Français">FR</button>';
  if (targetEl) targetEl.appendChild(sw);
}

// ── Shared switcher styles (injected once) ──────────────────
(function injectStyles() {
  if (document.getElementById('i18n-styles')) return;
  var s = document.createElement('style');
  s.id = 'i18n-styles';
  s.textContent = [
    '.lang-switch{display:flex;align-items:center;gap:2px;background:rgba(0,0,0,.06);border-radius:8px;padding:3px;}',
    '.lang-btn{background:none;border:none;padding:4px 9px;border-radius:6px;font-size:.78rem;font-weight:700;',
    '  cursor:pointer;color:var(--gray600,#475569);font-family:inherit;transition:all .15s;letter-spacing:.04em;}',
    '.lang-btn.active{background:#fff;color:var(--indigo,#4f6ef7);box-shadow:0 1px 4px rgba(0,0,0,.12);}',
    '.lang-btn:hover:not(.active){background:rgba(255,255,255,.6);color:var(--navy,#1a2744);}',
    /* Dark nav variant */
    '.lang-switch.dark{background:rgba(255,255,255,.12);}',
    '.lang-switch.dark .lang-btn{color:rgba(255,255,255,.65);}',
    '.lang-switch.dark .lang-btn.active{background:rgba(255,255,255,.22);color:#fff;box-shadow:none;}',
    '.lang-switch.dark .lang-btn:hover:not(.active){background:rgba(255,255,255,.18);color:#fff;}',
  ].join('');
  document.head.appendChild(s);
})();
