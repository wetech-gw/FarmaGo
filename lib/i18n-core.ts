export type Locale = "pt" | "en" | "fr";

export type LocaleMeta = {
  value: Locale;
  /** Nome da língua na própria língua (mostrado no selector). */
  label: string;
  /** Sigla curta mostrada no `<select>`. */
  short: string;
  /** Tag BCP-47 usada nos formatadores `Intl`. */
  intl: string;
};

export const LOCALES: LocaleMeta[] = [
  { value: "pt", label: "Português", short: "PT", intl: "pt-PT" },
  { value: "en", label: "English", short: "EN", intl: "en-GB" },
  { value: "fr", label: "Français", short: "FR", intl: "fr-FR" },
];

export const DEFAULT_LOCALE: Locale = "pt";

export const LOCALE_COOKIE = "farmago_locale";
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

/** Moeda usada em todo o sistema (CFA franc). */
export const CURRENCY = "XOF";

/** Prefixo das notificações cujo texto é uma chave de tradução. */
const STORED_KEY_PREFIX = "i18n:";

/** Marca o texto de uma notificação para ser traduzido no momento da leitura. */
export function storeMessage(key: string): string {
  return `${STORED_KEY_PREFIX}${key}`;
}

/** Traduz um texto guardado na BD; devolve o valor original se não for uma chave. */
export function readStoredMessage(t: Translator, stored: string): string {
  return stored.startsWith(STORED_KEY_PREFIX)
    ? t(stored.slice(STORED_KEY_PREFIX.length) as TKey)
    : stored;
}

export function isLocale(value: unknown): value is Locale {
  return value === "pt" || value === "en" || value === "fr";
}

/**
 * Uma entrada é uma frase simples ou um conjunto de formas plurais.
 * `one`/`other` chega para pt, en e fr (Intl devolve sempre uma das duas).
 */
export type Entry = string | { one: string; other: string };

export type TranslateValues = Record<string, string | number>;

type PluralEntry = Exclude<Entry, string>;

const pluralRules = new Map<Locale, Intl.PluralRules>();

function rulesFor(locale: Locale): Intl.PluralRules {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type: "cardinal" });
    pluralRules.set(locale, rules);
  }
  return rules;
}

function interpolate(template: string, values?: TranslateValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

function selectEntry(locale: Locale, entry: Entry, count: number): string {
  if (typeof entry === "string") return entry;
  const category = rulesFor(locale).select(count) as keyof PluralEntry;
  return entry[category] ?? entry.other;
}

// ---------------------------------------------------------------------------
// Dicionários
// ---------------------------------------------------------------------------

const pt = {
  // Navegação principal
  home: "Início",
  about: "Quem somos nós?",
  contact: "Contate-nos",
  login: "Entrar",
  registerPharmacy: "Registar farmácia",
  medications: "Medicamentos",
  pharmacies: "Farmácias",
  guardPharmacies: "Farmácias de Plantão",
  openNow: "abertas agora",
  pharmaciesOnMap: "farmácias no mapa",
  onGuard: "de plantão",
  heroTitle: "Farmácias Abertas Perto de Si",
  heroText:
    "Explore o mapa, veja o que está aberto neste momento e clique numa farmácia para consultar o horário, os contactos e todos os medicamentos disponíveis em stock.",
  searchPlaceholder: "Pesquisar farmácia, bairro ou medicamento...",
  searchLabel: "Pesquisar farmácia, bairro ou medicamento",
  open: "Abertas",
  all: "Todas",
  closed: "Fechadas",
  guard: "Plantão",
  useMyLocation: "Usar a minha localização",
  locationActive: "Localização ativa",
  noResults: "Nenhuma farmácia corresponde à pesquisa.",
  seeAll: "Ver todas as farmácias",
  dashboard: "Dashboard",
  validations: "Validações",
  stock: "Stock",
  users: "Utilizadores",
  myPharmacy: "A minha farmácia",
  summary: "Resumo",
  pharmacyData: "Dados da loja",
  sales: "Vendas",
  clients: "Clientes",
  notifications: "Notificações",
  viewSite: "Ver o site",
  logout: "Terminar sessão",
  account: "Conta",
  stockValidity: "Stock & Validade",
  guardsManagement: "Gestão de Plantões",
  pharmaciesManagement: "Gestão de Farmácias",
  notificationsManagement: "Gestão de Notificações",
  messages: "Mensagens",

  // Comum a todas as páginas
  "common.details": "Detalhes",
  "common.moreDetails": "Mais detalhes",
  "common.back": "Voltar",
  "common.close": "Fechar",
  "common.previous": "Anterior",
  "common.next": "Seguinte",
  "common.print": "Imprimir",
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.edit": "Editar",
  "common.remove": "Remover",
  "common.yes": "Sim",
  "common.no": "Não",
  "common.name": "Nome",
  "common.email": "Email",
  "common.phone": "Telefone",
  "common.address": "Morada",
  "common.openDays": "Dias de funcionamento",
  "common.hours": "Horário",
  "common.quantity": "Quantidade",
  "common.price": "Preço",
  "common.unitPrice": "Preço unitário",
  "common.batch": "Lote",
  "common.expiry": "Validade",
  "common.status": "Estado",
  "common.actions": "Ações",
  "common.date": "Data",
  "common.description": "Descrição",
  "common.category": "Categoria",
  "common.total": "Total",
  "common.dosage": "Dosagem",
  "common.image": "Imagem",
  "common.medication": "Medicamento",
  "common.pharmacy": "Farmácia",
  "common.owner": "Proprietário",
  "common.available": "Disponível",
  "common.unavailable": "Indisponível",
  "common.openBadge": "Aberta",
  "common.closedBadge": "Fechada",
  "common.notSet": "Por definir",
  "common.withoutPhone": "Sem telefone",
  "common.mainNavigation": "Navegação principal",
  "common.toggleNavigation": "Alternar navegação",
  "common.breadcrumb": "Caminho de navegação",
  "common.requiredField": "Campo obrigatório",
  "common.itemsCount": { one: "{count} item", other: "{count} itens" },
  "common.unitsCount": { one: "{count} unidade", other: "{count} unidades" },
  "common.daysCount": { one: "{count} dia", other: "{count} dias" },
  "common.notAvailableYet": "—",

  // Estados de validação
  "status.validated": "Validada",
  "status.pending": "Em validação",
  "status.rejected": "Rejeitada",
  "status.approved": "Aprovada",
  "status.notDefined": "Por definir",

  // Rodapé
  "footer.about": "Sobre",
  "footer.aboutText":
    "Otimize o seu acesso a medicamentos com a nossa aplicação web. Encontre e localize farmácias próximas rapidamente. Cuidados de saúde fáceis e eficientes ao seu alcance!",
  "footer.services": "Os nossos serviços",
  "footer.dutyPharmacies": "Farmácias de serviço",
  "footer.privacy": "Política de Privacidade",
  "footer.terms": "Termos e Condições",
  "footer.helpText": "Tem alguma dúvida? Ligue-nos 24/7.",
  "footer.copyright": "copyright ©FarmaGo 2026. todos os direitos reservados",

  // Página inicial / hero
  "hero.title": "Encontre o seu medicamento o mais rapidamente possível",
  "hero.searchPlaceholder": "Pesquisar medicamento...",
  "hero.validate": "Validar",

  // Explorador de farmácias
  "explorer.clearSearch": "Limpar pesquisa",
  "explorer.filterGroup": "Filtrar farmácias",
  "explorer.noCoordinates": "sem coordenadas",
  "explorer.sortByDistance": "por distância",
  "explorer.legendOpen": "Aberta",
  "explorer.legendClosed": "Fechada",
  "explorer.legendYou": "A si",
  "explorer.geoUnsupported": "O navegador não suporta geolocalização.",
  "explorer.geoDenied":
    "Não foi possível obter a sua localização. Verifique as permissões do navegador.",
  "explorer.resultsCount": { one: "{count} farmácia", other: "{count} farmácias" },
  "explorer.medicationsCount": { one: "{count} med.", other: "{count} meds." },
  "explorer.mapLabel": "Mapa de farmácias",
  "explorer.markerCount": { one: "{count} marcador", other: "{count} marcadores" },
  "explorer.mapLoadError": "Não foi possível carregar o mapa",
  "explorer.mapLoadErrorHint":
    "Confirme a ligação à internet (mosaicos de tile.openstreetmap.org) e que o Leaflet está instalado (npm i leaflet).",
  "explorer.yourLocation": "A sua localização",

  // Detalhe da farmácia
  "detail.close": "Fechar detalhes",
  "detail.openNow": "Aberta agora",
  "detail.callNow": "Ligar agora",
  "detail.directions": "Direções",
  "detail.schedule": "Horário",
  "detail.coordinates": "Coordenadas",
  "detail.availableMedications": "Medicamentos disponíveis",
  "detail.filterPlaceholder": "Filtrar medicamentos desta farmácia...",
  "detail.filterLabel": "Filtrar medicamentos desta farmácia",
  "detail.clearMedFilter": "Limpar filtro de medicamentos",
  "detail.noMedications":
    "Esta farmácia ainda não tem medicamentos registados em stock.",
  "detail.noMatch": "Nenhum medicamento corresponde a “{query}”.",
  "detail.fullPageLink": "Ver página completa da farmácia",
  "detail.distanceAway": "a {distance} de si",
  "detail.guardTag": "Farmácia de plantão",
  "detail.notFound": "Farmácia não encontrada",
  "detail.backHome": "Voltar ao início",

  // Cartões e listas de farmácias
  "pharmacy.section": "FARMÁCIAS",
  "pharmacy.sectionGuards": "FARMÁCIAS DE PLANTÃO",
  "pharmacy.guardTag": "Plantão",
  "pharmacy.noCoordinates": "Sem coordenadas no mapa",
  "pharmacy.notFound": "Farmácia não encontrada",

  // Catálogo de medicamentos
  "meds.filterAll": "Todos",
  "meds.filterAvailable": "Disponíveis",
  "meds.filterUnavailable": "Indisponíveis",
  "meds.sortNameAsc": "Nome (A–Z)",
  "meds.sortNameDesc": "Nome (Z–A)",
  "meds.sortAvailability": "Mais disponíveis",
  "meds.inCatalog": "no catálogo",
  "meds.availableCount": "disponíveis",
  "meds.searchPlaceholder": "Pesquisar medicamento ou dosagem...",
  "meds.searchLabel": "Pesquisar medicamento ou dosagem",
  "meds.clearSearch": "Limpar pesquisa",
  "meds.filterGroup": "Filtrar por disponibilidade",
  "meds.sortLabel": "Ordenar medicamentos",
  "meds.resultsCount": { one: "{count} medicamento", other: "{count} medicamentos" },
  "meds.resultsFiltered": "{count} de {total} medicamentos",
  "meds.clearFilters": "Limpar filtros",
  "meds.emptyTitle": "Nenhum medicamento encontrado",
  "meds.emptyText":
    "Tente pesquisar outro nome ou dosagem, ou volte a mostrar todos os medicamentos do catálogo.",
  "meds.seeAllCatalog": "Ver todo o catálogo",
  "meds.seeFullCatalog": "Ver catálogo completo",
  "meds.findPharmacyNear": "Encontrar farmácia perto de si",
  "meds.unitsInStock": "{count} unidades em stock",
  "meds.prescriptionRequired": "Receita obrigatória",
  "meds.seeDetails": "Ver detalhes",

  // Página de catálogo
  "medsPage.metaTitle": "Medicamentos | FarmaGo",
  "medsPage.metaDescription":
    "Catálogo completo de medicamentos disponíveis no FarmaGo, com pesquisa por nome e dosagem.",
  "medsPage.breadcrumb": "Medicamentos",
  "medsPage.title": "Catálogo de Medicamentos",
  "medsPage.description":
    "Pesquise por nome ou dosagem, filtre por disponibilidade e descubra em quantas farmácias cada medicamento pode ser encontrado.",
  "medsPage.findPharmacies": "Encontrar farmácias",
  "medsPage.eyebrow": "Farmácias parceiras",
  "medsPage.showcaseTitle": "Explore o",
  "medsPage.showcaseAccent": "catálogo completo",
  "medsPage.showcaseDescription":
    "Cada medicamento mostra o estado de stock em tempo real nas farmácias parceiras do FarmaGo.",

  // Detalhe do medicamento
  "medDetail.notFound": "Medicamento não encontrado",
  "medDetail.backToCatalog": "Voltar ao catálogo",
  "medDetail.prescriptionNotice": "Medicamento sujeito a receita médica.",
  "medDetail.priceFrom": "Preço desde",
  "medDetail.unitsInStock": "Unidades em stock",
  "medDetail.availableIn": {
    one: "Disponível em {count} farmácia",
    other: "Disponível em {count} farmácias",
  },
  "medDetail.noStock": "Sem stock nas farmácias parceiras neste momento.",

  // Página de plantões
  "guardsPage.metaTitle": "Farmácias de Plantão | FarmaGo",
  "guardsPage.metaDescription":
    "Todas as farmácias de plantão, com horário, contactos e medicamentos disponíveis.",
  "guardsPage.breadcrumb": "Farmácias de Plantão",
  "guardsPage.title": "Farmácias de Plantão",
  "guardsPage.description":
    "Veja todas as farmácias de plantão disponíveis, com horário, contactos e os medicamentos em stock.",
  "guardsPage.onDutyNow": "{count} de plantão agora",

  // Sobre nós
  "aboutSection.title": "Quem somos nós ?",
  "aboutSection.text":
    "A nossa aplicação oferece dois serviços essenciais: uma pesquisa detalhada por medicamentos, incluindo nomes genéricos e de marca, dosagens recomendadas, e a rápida localização de farmácias próximas que tenham estes medicamentos em stock, com informação completa sobre cada farmácia. Desta forma, simplifica o acesso a informações médicas fidedignas e fornecimento de medicamentos, melhorando assim a qualidade de vida dos seus utilizadores.",
  "aboutSection.imageAlt": "Interior da farmácia",
  "aboutPage.eyebrow": "Como funciona",
  "aboutPage.title": "FarmaGo na palma da mão",
  "aboutPage.subtitle":
    "Encontre a farmácia mais próxima, consulte medicamentos e detalhes em poucos toques.",
  "aboutPage.card1Title": "Farmácias perto de si",
  "aboutPage.card1Text":
    "Veja no mapa as farmácias mais próximas abertas neste momento.",
  "aboutPage.card2Title": "Detalhes do medicamento",
  "aboutPage.card2Text":
    "Consulte preço, stock e farmácias que vendem cada medicamento.",
  "aboutPage.card3Title": "Farmácias de plantão",
  "aboutPage.card3Text": "Saiba sempre que farmácia está de plantão ao seu lado.",

  // Contactos
  "contact.metaTitle": "Contate-nos | FarmaGo",
  "contact.title": "Vamos entrar em contacto.",
  "contact.intro":
    "Bem-vindo(a) à nossa aplicação web! Aguardamos o seu contacto para responder às suas questões, receber o seu feedback e discutir o seu projeto.",
  "contact.social": "As nossas redes sociais :",
  "contact.fieldName": "Nome de utilizador",
  "contact.fieldEmail": "Email",
  "contact.fieldPhone": "Número de telefone",
  "contact.fieldMessage": "Mensagem",
  "contact.send": "Enviar",
  "contact.sending": "A enviar…",
  "contact.sentTitle": "Mensagem enviada!",
  "contact.sentText": "Agradecemos o contacto. Respondemos o mais breve possível.",
  "contact.errorName": "Indique o seu nome.",
  "contact.errorMessage": "Escreva a sua mensagem.",
  "contact.errorEmail": "Email inválido.",
  "contact.errorTooLong": "A mensagem é demasiado longa.",

  // Privacidade
  "privacy.metaTitle": "Política de Privacidade | FarmaGo",
  "privacy.title": "Política de Privacidade",
  "privacy.updated": "Última atualização: outubro de 2026.",
  "privacy.h2_1": "1. Dados que recolhemos",
  "privacy.p1":
    "Recolhemos os dados necessários ao funcionamento da plataforma, como nome, email, dados de contacto e localização aproximada quando o utilizador a partilha para encontrar farmácias próximas.",
  "privacy.h2_2": "2. Como usamos os dados",
  "privacy.p2":
    "Os dados são usados para gerir contas, apresentar farmácias e medicamentos, melhorar o serviço e comunicar informação relevante sobre a conta.",
  "privacy.h2_3": "3. Partilha de dados",
  "privacy.p3":
    "Não vendemos dados pessoais. Apenas partilhamos informação com parceiros estritamente necessários à prestação do serviço.",
  "privacy.h2_4": "4. Segurança",
  "privacy.p4":
    "Aplicamos medidas técnicas e organizativas para proteger os dados contra acessos não autorizados.",
  "privacy.h2_5": "5. Os seus direitos",
  "privacy.p5":
    "Pode solicitar acesso, correção ou eliminação dos seus dados contactando-nos através da página de contactos.",

  // Termos e condições
  "terms.metaTitle": "Termos e Condições | FarmaGo",
  "terms.title": "Termos e Condições",
  "terms.updated": "Última atualização: outubro de 2026.",
  "terms.h2_1": "1. Aceitação",
  "terms.p1":
    "Ao utilizar o FarmaGo, aceita estes termos. Se não concordar, não utilize a plataforma.",
  "terms.h2_2": "2. Serviço",
  "terms.p2":
    "O FarmaGo agrega informação sobre farmácias, horários de plantão e stock de medicamentos. A disponibilidade e os preços podem variar em cada farmácia.",
  "terms.h2_3": "3. Contas",
  "terms.p3":
    "É responsável pela confidencialidade das suas credenciais e por toda a atividade na sua conta.",
  "terms.h2_4": "4. Uso proibido",
  "terms.p4":
    "Não é permitido usar a plataforma para fins ilegais, tentativas de acesso não autorizado ou publicação de informação falsa.",
  "terms.h2_5": "5. Limitação de responsabilidade",
  "terms.p5":
    "O FarmaGo não substitui o aconselhamento médico ou farmacêutico profissional.",

  // Login
  "login.metaTitle": "Entrar | FarmaGo",
  "login.metaDescription": "Aceda à sua conta de farmacêutico ou de administrador.",
  "login.title": "Entrar na conta",
  "login.subtitle":
    "Credenciais de farmacêutico (dashboard da farmácia) ou de administrador.",
  "login.password": "Palavra-passe",
  "login.forgotPassword": "Esqueceu a palavra-passe?",
  "login.signingIn": "A entrar…",
  "login.noAccount": "Ainda não tem conta?",
  "login.registerPharmacy": "Registar a minha farmácia",

  // Registo
  "register.metaTitle": "Registar Farmácia | FarmaGo",
  "register.metaDescription":
    "Crie a conta da sua farmácia no FarmaGo. A validação é feita presencialmente pela nossa equipa.",
  "register.title": "Registar a minha farmácia",
  "register.subtitle":
    "Crie a conta e registe a farmácia num só passo. Depois da nossa visita presencial, a farmácia passa a aparecer no mapa e no catálogo de medicamentos.",
  "register.hasAccount": "Já tem conta?",
  "register.stepAccount": "1. Dados da conta",
  "register.stepPharmacy": "2. Dados da farmácia",
  "register.pendingNote":
    "A farmácia fica em validação. A nossa equipa confirma os dados depois de uma visita presencial e só depois passa a aparecer no site.",
  "register.pharmacistName": "Nome do farmacêutico *",
  "register.password": "Palavra-passe *",
  "register.passwordHint": "Mínimo 6 caracteres.",
  "register.confirmPassword": "Confirmar palavra-passe *",
  "register.pharmacyName": "Nome da farmácia *",
  "register.pharmacyNamePlaceholder": "Ex: Farmácia Esperança",
  "register.phone": "Telefone *",
  "register.address": "Morada *",
  "register.addressPlaceholder": "Rua, bairro, cidade",
  "register.openDays": "Dias de funcionamento",
  "register.schedulePlaceholder": "Segunda - Sábado",
  "register.hours": "Horário",
  "register.guard": "Farmácia de plantão",
  "register.image": "Imagem da farmácia",
  "register.imageHint": "JPG, PNG, WEBP ou AVIF. Máximo 3 MB.",
  "register.mapLocation": "Localização no mapa",
  "register.creating": "A criar conta…",
  "register.submit": "Criar conta e registar farmácia",

  // Recuperar palavra-passe
  "forgot.metaTitle": "Recuperar palavra-passe | FarmaGo",
  "forgot.metaDescription": "Recupere o acesso à sua conta FarmaGo.",
  "forgot.title": "Recuperar palavra-passe",
  "forgot.subtitle":
    "Introduza o email da sua conta para validar e definir uma nova palavra-passe.",
  "forgot.accountEmail": "Email da conta",
  "forgot.checking": "A verificar...",
  "forgot.checkEmail": "Verificar email",
  "forgot.emailValid": "Email válido. Defina a nova palavra-passe.",
  "forgot.newPassword": "Nova palavra-passe",
  "forgot.confirmPassword": "Confirmar palavra-passe",
  "forgot.saving": "A guardar...",
  "forgot.submit": "Recuperar palavra-passe",
  "forgot.backToLogin": "Voltar ao login",

  // Aplicação instalável (PWA)
  "pwa.appName": "FarmaGo — Farmácias e Medicamentos",
  "pwa.appShortName": "FarmaGo",
  "pwa.appDescription":
    "Encontre farmácias abertas, de plantão e medicamentos disponíveis perto de si.",
  "pwa.installTitle": "Instalar o FarmaGo",
  "pwa.installButton": "Instalar aplicação",
  "pwa.installIosHint":
    "No iPhone ou iPad, toque no botão de partilha e escolha «Adicionar ao ecrã principal».",
  "pwa.installDesktopHint":
    "No Chrome ou Edge, clique no ícone de instalar (um monitor com uma seta) na barra de endereço, ou abra o menu e escolha «Instalar aplicação».",
  "pwa.installHttpHint":
    "A instalação com um toque exige uma ligação segura (https://). Como esta página abriu por http://, instale a partir do ícone ou do menu do navegador.",
  "pwa.installDismiss": "Dispensar",
  "whatsapp.label": "WhatsApp",
  "whatsapp.cta": "Falar no WhatsApp",
  "whatsapp.defaultMessage": "Olá! Gostaria de saber mais sobre o FarmaGo.",
  "whatsapp.openTooltip": "Abrir conversa no WhatsApp",

  // Seletor de localização (registo / edição da farmácia)
  "picker.latitude": "Latitude",
  "picker.longitude": "Longitude",
  "picker.myLocation": "A minha localização",
  "picker.clear": "Limpar",
  "picker.mapLabel": "Selecionar localização da farmácia",
  "picker.hint":
    "Clique no mapa para posicionar a farmácia, arraste o marcador para ajustar, ou escreva as coordenadas. Sem coordenadas, a farmácia aparece na lista mas não é marcada no mapa.",
  "picker.loading": "A carregar o mapa...",
  "picker.lastPosition": "Última posição: {event}",
  "picker.eventClick": "clique ({lat}, {lng})",
  "picker.eventLeafletClick": "clique leaflet ({lat}, {lng})",
  "picker.eventManual": "escrito à mão ({lat}, {lng})",
  "picker.eventGeolocation": "geolocalização ({lat}, {lng})",
  "picker.noCoordinatesWarning":
    "Sem coordenadas: a farmácia vai ser criada, mas não aparece marcada no mapa.",
  "picker.loadError": "Não foi possível carregar o mapa: {error}",
  "picker.loadErrorHint":
    "Verifica a ligação à internet (os mosaicos vêm de tile.openstreetmap.org) e confirma que o Leaflet está instalado: npm i leaflet.",

  // Mensagens de erro dos formulários
  "error.required": "Preencha todos os campos obrigatórios.",
  "error.emailRequired": "Introduza o seu email.",
  "error.invalidEmail": "Email inválido.",
  "error.invalidCredentials": "Credenciais inválidas.",
  "error.passwordTooShort": "A palavra-passe deve ter pelo menos 6 caracteres.",
  "error.passwordsMismatch": "As palavras-passe não coincidem.",
  "error.emailInUse": "Já existe uma conta com este email.",
  "error.emailNotRegistered": "Este email não está registado no sistema.",
  "error.accountNotFound": "Conta não encontrada.",
  "error.loginRequired": "Preencha o email e a palavra-passe.",
  "error.invalidPharmacy": "Farmácia inválida.",
  "error.pharmacyNotFound": "Farmácia não encontrada.",
  "error.notYourPharmacy": "Registo não pertence à sua farmácia.",
  "error.medicationNotYours": "Medicamento não pertence à sua farmácia.",
  "error.expenseNotYours": "Despesa não pertence à sua farmácia.",
  "error.saleNotYours": "Venda não pertence à sua farmácia.",
  "error.nameAddressPhoneRequired": "Nome, morada e telefone são obrigatórios.",
  "error.chooseMedicationAndExpiry": "Escolha o medicamento e a data de validade.",
  "error.fillDescriptionAmountDate": "Preencha descrição, valor e data.",
  "error.nameAndDosageRequired": "Preencha o nome e a dosagem.",
  "error.nameAndEmailRequired": "Nome e email são obrigatórios.",
  "error.nameAndDosageRequiredAdmin": "Nome e dosagem são obrigatórios.",
  "error.invalidMedication": "Medicamento inválido.",
  "error.invalidStockEntry": "Entrada de stock inválida.",
  "error.invalidQuantity": "Quantidade inválida.",
  "error.invalidExpiryDate": "Data de validade inválida.",
  "error.choosePharmacyAndMedication": "Escolha a farmácia e o medicamento.",
  "error.fillOwnerNameAddressPhone": "Preencha proprietário, nome, morada e telefone.",
  "error.ownerMustBePharmacist": "O proprietário tem de ser uma conta de farmacêutico.",
  "error.ownerAlreadyHasPharmacy":
    "Essa conta já tem uma farmácia registada (1 conta = 1 farmácia).",
  "error.rejectionReasonRequired": "Indique o motivo da rejeição.",
  "error.ownAccountOnly": "Só pode editar a sua própria conta.",
  "error.cannotDeleteOwnAccount": "Não pode eliminar a sua própria conta.",
  "error.unsupportedImageFormat":
    "Formato de imagem não suportado. Use JPG, PNG, WEBP, GIF ou AVIF.",
  "error.imageTooLarge": "A imagem não pode ter mais de 3 MB.",
  "error.addAtLeastOneMedication": "Adicione pelo menos um medicamento.",
  "error.invalidClient": "Cliente inválido.",
  "error.clientNameRequired": "Indique o nome do cliente.",
  "error.invalidStockLine": "Linha de stock inválida.",
  "error.insufficientStock": "Stock insuficiente para {name}.",
  "error.saleRegisterFailed": "Erro ao registar a venda.",

  // Dashboard do farmacêutico
  "dash.hello": "Olá, {name}",
  "dash.registeredTitle": "Conta criada com sucesso",
  "dash.registeredText":
    "A sua farmácia foi registada e está em validação. Avisamos assim que a visita for concluída.",
  "dash.summaryAfterRegister": "Comece por confirmar os dados da farmácia.",
  "dash.summaryNormal": "Aqui tem o resumo da sua farmácia.",
  "dash.pendingTitle": "Farmácia em validação",
  "dash.pendingText":
    "A nossa equipa vai visitar a farmácia para confirmar os dados. Só depois disso a farmácia aparece no site público.",
  "dash.rejectedTitle": "Farmácia rejeitada",
  "dash.rejectedFallback":
    "A equipa não conseguiu validar os dados. Contacte-nos para mais informação.",
  "dash.pharmacyState": "Estado da farmácia",
  "dash.openState": "ABERTA",
  "dash.closedState": "FECHADA",
  "dash.markClosed": "Marcar como fechada",
  "dash.markOpen": "Marcar como aberta",
  "dash.kpiMedications": "Medicamentos",
  "dash.kpiUnits": "Unidades em stock",
  "dash.kpiExpiring": "A caducar (90 dias)",
  "dash.kpiSalesTotal": "Total de vendas",
  "dash.stockAvailability": "Disponibilidade de stock",
  "dash.manageStock": "Gerir stock",
  "dash.noStockYet": "Sem stock registado.",
  "dash.addMedications": "Adicionar medicamentos",
  "dash.thQuantity": "Quantidade",
  "dash.expired": "Expirado",
  "dash.quantityOf": "Quantidade de {name}",
  "dash.zeroQuantity": {
    one: "{count} medicamento com quantidade zero — não aparece no site público.",
    other: "{count} medicamentos com quantidade zero — não aparecem no site público.",
  },
  "dash.editData": "Editar dados",
  "dash.lastSales": "Últimas vendas",
  "dash.seeAll": "Ver todas",
  "dash.noSales": "Sem vendas registadas.",
  "dash.saleNumber": "Venda #{id}",

  // Perfil da farmácia
  "dash.profileTitle": "Dados da farmácia",
  "dash.profileSubtitle":
    "Actualize o que o público vê: nome, contacto, horário e localização.",
  "dash.publicInfo": "Informação pública",
  "dash.imageKeep": "Deixa em branco para manter a actual.",
  "dash.location": "Localização",
  "dash.locationHint":
    "Clique no mapa para marcar a farmácia. É esta posição que os clientes vêem no mapa de farmácias.",
  "dash.saveChanges": "Guardar alterações",
  "dash.changedDataTitle": "Alterou os dados depois do registo?",
  "dash.changedDataText":
    "Peça uma nova validação para a equipa voltar a verificar a farmácia.",
  "dash.requestRevalidation": "Pedir nova validação",

  // Stock
  "dash.stockTitle": "Stock e disponibilidade",
  "dash.stockSubtitle":
    "O que está com quantidade maior que zero aparece no site como disponível.",
  "dash.editPrefix": "Editar — {name}",
  "dash.addToStock": "Adicionar medicamento ao stock",
  "dash.addToStockButton": "Adicionar ao stock",
  "dash.chooseMedication": "Escolher medicamento…",
  "dash.alreadyInStock": " (já em stock)",
  "dash.stockEmpty": "Ainda não registou stock. Use o formulário acima.",
  "dash.deleteStockConfirm": "Tem a certeza que deseja apagar este item de stock?",

  // Os meus medicamentos
  "dash.medsTitle": "Os meus medicamentos",
  "dash.medsSubtitle":
    "Cadastre os medicamentos da sua farmácia para os usar no stock e nas vendas.",
  "dash.medName": "Nome",
  "dash.medDosage": "Dosagem",
  "dash.medDosagePlaceholder": "ex: 500mg, frasco 120ml",
  "dash.medImage": "Imagem",
  "dash.medDescription": "Descrição",
  "dash.medPrescriptionOnly": "Vendido apenas com receita médica",
  "dash.addMedication": "Adicionar medicamento",
  "dash.medEmpty": "Ainda não registou medicamentos. Use o formulário acima.",
  "dash.createdAt": "Criado em",
  "dash.deleteMedConfirm": 'Tem a certeza que deseja apagar o medicamento "{name}"?',

  // Vendas
  "dash.salesTitle": "Vendas",
  "dash.salesSubtitle": "Todas as vendas registadas na sua farmácia.",
  "dash.newSale": "Nova venda",
  "dash.saleStockUpdated": "O stock é actualizado automaticamente.",
  "dash.noSalesRegistered": "Ainda não registou vendas.",
  "dash.thClient": "Cliente",
  "dash.thItems": "Artigos",
  "dash.viewReceipt": "Ver factura",

  // Factura
  "invoice.title": "Factura #{id}",
  "invoice.paid": "Paga",
  "invoice.pharmacy": "Farmácia",
  "invoice.client": "Cliente",
  "invoice.thQty": "Qtd",
  "invoice.thUnitPrice": "Preço un.",
  "invoice.thSubtotal": "Subtotal",
  "invoice.clientHistory": "Histórico do cliente",

  // Clientes
  "dash.clientsTitle": "Clientes",
  "dash.clientsSubtitle": "Histórico de compras e facturas por cliente.",
  "dash.noClients": "Ainda não tem clientes registados.",
  "dash.thInvoices": "Facturas",
  "dash.thTotalSpent": "Total gasto",
  "dash.history": "Histórico",
  "dash.noPurchases": "Sem compras registadas.",
  "dash.invoiceHistory": "Histórico de facturas",

  // Notificações
  "dash.notificationsSubtitle":
    "Avisos da Inspeção Farmacêutica sobre a sua farmácia.",
  "dash.noNotifications": "Sem notificações.",

  // Despesas
  "dash.expensesTitle": "Despesas",
  "dash.expensesSubtitle": "Custos da farmácia. Total registado: {total}",
  "dash.newExpense": "Nova despesa",
  "dash.noExpenses": "Sem despesas registadas.",
  "expense.categoryInfra": "Infraestrutura",
  "expense.categoryStaff": "Pessoal",
  "expense.categoryStock": "Stock",
  "expense.categoryOther": "Outros",

  // Conta sem farmácia
  "dash.noPharmacyTitle": "Ainda não tem farmácia associada",
  "dash.noPharmacyText":
    "A sua conta {email} está activa, mas ainda não existe uma farmácia registada. O nosso administrador valida cada farmácia presencialmente antes de ela aparecer no site.",
  "dash.viewPharmacies": "Ver farmácias",
  "dash.backToDashboard": "Voltar ao dashboard",

  // Formulário de venda
  "saleForm.client": "Cliente",
  "saleForm.chooseClient": "Escolher cliente…",
  "saleForm.newClient": "+ Novo cliente",
  "saleForm.clientName": "Nome *",
  "saleForm.items": "Artigos",
  "saleForm.chooseMedication": "Medicamento…",
  "saleForm.availableShort": "disp.: {count}",
  "saleForm.qty": "Qtd",
  "saleForm.removeRow": "Remover linha",
  "saleForm.addRow": "Adicionar linha",
  "saleForm.totalLabel": "Total: {total}",
  "saleForm.registering": "A registar…",
  "saleForm.register": "Registar venda",

  // Administração — páginas comuns
  "admin.validatedPharmacies": "Farmácias Validadas",
  "admin.statsLine":
    "{pharmacies} farmácias · {medications} medicamentos · {units} unidades em stock",
  "admin.mapTitle": "Mapa de Farmácias",
  "admin.pharmacyLocationTitle": "Localização das Farmácias",
  "admin.thContact": "Contacto",
  "admin.noStockShort": "Sem stock",
  "admin.unitsShort": "{count} unid.",
  "admin.deactivated": "Desactivada",
  "admin.seeAll": "Ver todas",
  "admin.seeEverything": "Ver tudo",
  "admin.itemsBadge": "{count} itens",
  "admin.daysLeft": "{count}d",

  // Administração — dashboard
  "admin.dashValidate": {
    one: "Validar {count} farmácia",
    other: "Validar {count} farmácias",
  },
  "admin.dashGuardSeeAll": "Ver plantões →",
  "admin.dashUsersSeeAll": "Ver utilizadores →",
  "admin.dashUnitsInStock": "{count} unid. em stock",
  "admin.dashRegisteredPharmacies": "Farmácias Registadas",
  "admin.dashExpiringSoon": "Stock a Caducar (90 dias)",
  "admin.dashNoExpiring": "Nenhum stock a caducar em breve.",

  // Administração — validações
  "admin.validationsTitle": "Validação de farmácias",
  "admin.validationsSubtitle":
    "Só depois de uma visita presencial e da aprovação aqui feita é que a farmácia aparece no site público.",
  "admin.tabPending": "Por validar",
  "admin.tabApproved": "Validadas",
  "admin.tabRejected": "Rejeitadas",
  "admin.nothingHere": "Nada aqui: {tab}.",
  "admin.registeredOn": "Registada em {date}",
  "admin.reason": "Motivo",
  "admin.visitLabel": "Visita",
  "admin.validatedOn": "Validada em {date}",
  "admin.validatedBy": " por {name}",
  "admin.visitChecklist":
    "confirme no local o nome, a morada, o telefone e as coordenadas. Se algo estiver errado, peça ao farmacêutico para corrigir no dashboard.",
  "admin.validatePharmacy": "Validar farmácia",
  "admin.rejectionReasonPlaceholder": "Motivo da rejeição",
  "admin.reject": "Rejeitar",
  "admin.backToPending": "Voltar a “por validar”",

  // Administração — farmácias
  "admin.pharmaciesTitle": "Farmácias",
  "admin.pharmaciesSubtitle": "{count} farmácias registadas",
  "admin.filterAll": "Todas",
  "admin.filterNormal": "Normais",
  "admin.filterGuard": "Plantão",
  "admin.noPharmaciesFound": "Nenhuma farmácia encontrada.",
  "admin.noCoordinatesBadge": "Sem coordenadas",
  "admin.viewStock": "Ver Stock",
  "admin.deactivate": "Desactivar",
  "admin.reactivate": "Reactivar",

  // Administração — utilizadores
  "admin.usersTitle": "Utilizadores",
  "admin.usersSubtitle": "{count} utilizadores registados",
  "admin.thProfile": "Perfil",
  "admin.thPharmacies": "Farmácias",
  "admin.thRegisteredAt": "Registado em",
  "admin.roleAdmin": "Admin",
  "admin.roleInspecao": "Inspeção",
  "admin.roleOwner": "Proprietário",

  // Administração — conta
  "admin.accountTitle": "Conta",
  "admin.accountSubtitle": "Gerir perfil e utilizadores",
  "admin.myProfile": "Meu Perfil",
  "admin.createUserTitle": "Criar Novo Utilizador",
  "admin.fullName": "Nome completo *",
  "admin.roleLabel": "Perfil *",
  "admin.password": "Palavra-passe *",
  "admin.passwordHint": "Mínimo 8 caracteres",
  "admin.createUser": "Criar Utilizador",
  "admin.allUsers": "Todos os Utilizadores ({count})",
  "admin.cannotDeleteOwn": "Não pode eliminar a sua conta",
  "admin.hasPharmacies": "Tem farmácias associadas",

  // Administração — stock
  "admin.stockTitle": "Inventário / pharmacy_stocks",
  "admin.stockSubtitle":
    "{entries} entradas · {units} unidades total",
  "admin.stockUrgentWarning":
    "Atenção: existem medicamentos a caducar em menos de 30 dias.",
  "admin.stockPerPharmacy": "{count} itens · {units} unidades",
  "admin.allStockEntries": "Todas as Entradas de Stock",
  "admin.stockFor": "Stock — {name}",
  "admin.noStockFound": "Nenhum stock encontrado.",
  "admin.expired": "Caducado",
  "admin.ok": "OK",

  // Administração — medicamentos
  "admin.medsTitle": "Medicamentos",
  "admin.medsSubtitle": "{count} medicamentos no catálogo",
  "admin.imageUpload": "Imagem (upload)",
  "admin.imageUrl": "URL da imagem",
  "admin.pharmaciesWithMed": {
    one: "{count} farmácia",
    other: "{count} farmácias",
  },
  "admin.noMedicationsInCatalog": "Nenhum medicamento no catálogo.",

  // Administração — análises
  "admin.analysesTitle": "Análises",
  "admin.analysesSubtitle": "Resumo financeiro e operacional",
  "admin.totalExpenses": "Total Despesas",
  "admin.unitsInStock": "Unidades em Stock",
  "admin.expiring90": "A Caducar (90d)",
  "admin.activePharmacies": "Farmácias Ativas",
  "admin.expensesByMonth": "Despesas por Mês",
  "admin.noExpiringSoon": "Nenhum stock a caducar em breve.",
  "admin.expiringSoonTitle": "Stock a Caducar (próximos 90 dias)",
  "admin.thDays": "Dias",
  "admin.pharmacyStockOwner": "Farmácias — Stock & Proprietário",
  "admin.thEmail": "Email",
  "admin.thProducts": "Produtos em Stock",

  // Administração — despesas
  "admin.expensesTitle": "Despesas",
  "admin.messages": "Mensagens",
  "admin.messagesSubtitle": "Contactos enviados pelo formulário do site.",
  "admin.messagesEmpty": "Ainda não recebeu nenhuma mensagem.",
  "admin.messagesNew": {
    one: "{count} mensagem nova por ler.",
    other: "{count} mensagens novas por ler.",
  },
  "admin.expensesSubtitle": "{count} registos",
  "admin.percentOfTotal": "{percent}% do total",
  "admin.grandTotal": "Total Geral",

  // Inspeção
  "insp.dashboardTitle": "Dashboard da Inspeção",
  "insp.dashboardSubtitle": "Estatísticas gerais das farmácias.",
  "insp.approved": "Farmácias aprovadas",
  "insp.onDuty": "Em plantão",
  "insp.pending": "Pendentes",
  "insp.pharmaciesTitle": "Gestão de Farmácias",
  "insp.pharmaciesSubtitle": "Todas as farmácias registadas no sistema.",
  "insp.thActive": "Ativa",
  "insp.approvedBadge": "Aprovada",
  "insp.pendingBadge": "Pendente",
  "insp.rejectedBadge": "Rejeitada",
  "insp.normalBadge": "Normal",
  "insp.guardsTitle": "Gestão de Plantões",
  "insp.guardsSubtitle":
    "Selecione quais farmácias ficam de plantão. A farmácia recebe uma notificação com a decisão.",
  "insp.onDutyBadge": "De plantão",
  "insp.removeFromDuty": "Retirar do plantão",
  "insp.escalateToDuty": "Escalar para plantão",
  "insp.notificationsTitle": "Gestão de Notificações",
  "insp.notificationsSubtitle": "Histórico de notificações enviadas às farmácias.",
  "insp.noNotifications": "Sem notificações ainda.",
  "insp.dutyOnMessage":
    "A Inspeção Farmacêutica escalou a sua farmácia para plantão. Verifique o seu horário de plantão no site.",
  "insp.dutyOffMessage":
    "A Inspeção Farmacêutica retirou a sua farmácia do plantão.",
} satisfies Record<string, Entry>;

export type TKey = keyof typeof pt;

const en: Record<TKey, Entry> = {
  home: "Home",
  about: "About us",
  contact: "Contact us",
  login: "Sign in",
  registerPharmacy: "Register pharmacy",
  medications: "Medications",
  pharmacies: "Pharmacies",
  guardPharmacies: "On-duty Pharmacies",
  openNow: "open now",
  pharmaciesOnMap: "pharmacies on the map",
  onGuard: "on duty",
  heroTitle: "Open Pharmacies Near You",
  heroText:
    "Explore the map, see what is open right now, and click a pharmacy to check its hours, contacts and available stock.",
  searchPlaceholder: "Search pharmacy, neighborhood or medication...",
  searchLabel: "Search pharmacy, neighborhood or medication",
  open: "Open",
  all: "All",
  closed: "Closed",
  guard: "On duty",
  useMyLocation: "Use my location",
  locationActive: "Location active",
  noResults: "No pharmacy matches your search.",
  seeAll: "See all pharmacies",
  dashboard: "Dashboard",
  validations: "Validations",
  stock: "Stock",
  users: "Users",
  myPharmacy: "My pharmacy",
  summary: "Summary",
  pharmacyData: "Store data",
  sales: "Sales",
  clients: "Clients",
  notifications: "Notifications",
  viewSite: "View site",
  logout: "Sign out",
  account: "Account",
  stockValidity: "Stock & Expiry",
  guardsManagement: "On-duty Management",
  pharmaciesManagement: "Pharmacies Management",
  notificationsManagement: "Notifications Management",
  messages: "Messages",

  "common.details": "Details",
  "common.moreDetails": "More details",
  "common.back": "Back",
  "common.close": "Close",
  "common.previous": "Previous",
  "common.next": "Next",
  "common.print": "Print",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.edit": "Edit",
  "common.remove": "Remove",
  "common.yes": "Yes",
  "common.no": "No",
  "common.name": "Name",
  "common.email": "Email",
  "common.phone": "Phone",
  "common.address": "Address",
  "common.openDays": "Opening days",
  "common.hours": "Hours",
  "common.quantity": "Quantity",
  "common.price": "Price",
  "common.unitPrice": "Unit price",
  "common.batch": "Batch",
  "common.expiry": "Expiry",
  "common.status": "Status",
  "common.actions": "Actions",
  "common.date": "Date",
  "common.description": "Description",
  "common.category": "Category",
  "common.total": "Total",
  "common.dosage": "Dosage",
  "common.image": "Image",
  "common.medication": "Medication",
  "common.pharmacy": "Pharmacy",
  "common.owner": "Owner",
  "common.available": "Available",
  "common.unavailable": "Unavailable",
  "common.openBadge": "Open",
  "common.closedBadge": "Closed",
  "common.notSet": "Not set",
  "common.withoutPhone": "No phone",
  "common.mainNavigation": "Main navigation",
  "common.toggleNavigation": "Toggle navigation",
  "common.breadcrumb": "Breadcrumb",
  "common.requiredField": "Required field",
  "common.itemsCount": { one: "{count} item", other: "{count} items" },
  "common.unitsCount": { one: "{count} unit", other: "{count} units" },
  "common.daysCount": { one: "{count} day", other: "{count} days" },
  "common.notAvailableYet": "—",

  "status.validated": "Validated",
  "status.pending": "Under review",
  "status.rejected": "Rejected",
  "status.approved": "Approved",
  "status.notDefined": "Not set",

  "footer.about": "About",
  "footer.aboutText":
    "Optimise your access to medicines with our web app. Find and locate nearby pharmacies quickly. Easy and efficient healthcare within reach!",
  "footer.services": "Our services",
  "footer.dutyPharmacies": "On-duty pharmacies",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms & Conditions",
  "footer.helpText": "Any questions? Call us 24/7.",
  "footer.copyright": "copyright ©FarmaGo 2026. all rights reserved",

  "hero.title": "Find your medicine as quickly as possible",
  "hero.searchPlaceholder": "Search medicine...",
  "hero.validate": "Check",

  "explorer.clearSearch": "Clear search",
  "explorer.filterGroup": "Filter pharmacies",
  "explorer.noCoordinates": "without coordinates",
  "explorer.sortByDistance": "by distance",
  "explorer.legendOpen": "Open",
  "explorer.legendClosed": "Closed",
  "explorer.legendYou": "You",
  "explorer.geoUnsupported": "This browser does not support geolocation.",
  "explorer.geoDenied":
    "We could not get your location. Please check your browser permissions.",
  "explorer.resultsCount": { one: "{count} pharmacy", other: "{count} pharmacies" },
  "explorer.medicationsCount": { one: "{count} med.", other: "{count} meds." },
  "explorer.mapLabel": "Pharmacy map",
  "explorer.markerCount": { one: "{count} marker", other: "{count} markers" },
  "explorer.mapLoadError": "The map could not be loaded",
  "explorer.mapLoadErrorHint":
    "Check your internet connection (tiles come from tile.openstreetmap.org) and that Leaflet is installed (npm i leaflet).",
  "explorer.yourLocation": "Your location",

  "detail.close": "Close details",
  "detail.openNow": "Open now",
  "detail.callNow": "Call now",
  "detail.directions": "Directions",
  "detail.schedule": "Hours",
  "detail.coordinates": "Coordinates",
  "detail.availableMedications": "Available medications",
  "detail.filterPlaceholder": "Filter this pharmacy's medications...",
  "detail.filterLabel": "Filter this pharmacy's medications",
  "detail.clearMedFilter": "Clear medication filter",
  "detail.noMedications":
    "This pharmacy has no medications registered in stock yet.",
  "detail.noMatch": 'No medication matches “{query}”.',
  "detail.fullPageLink": "View full pharmacy page",
  "detail.distanceAway": "{distance} away from you",
  "detail.guardTag": "On-duty pharmacy",
  "detail.notFound": "Pharmacy not found",
  "detail.backHome": "Back to home",

  "pharmacy.section": "PHARMACIES",
  "pharmacy.sectionGuards": "ON-DUTY PHARMACIES",
  "pharmacy.guardTag": "On duty",
  "pharmacy.noCoordinates": "No coordinates on the map",
  "pharmacy.notFound": "Pharmacy not found",

  "meds.filterAll": "All",
  "meds.filterAvailable": "Available",
  "meds.filterUnavailable": "Unavailable",
  "meds.sortNameAsc": "Name (A–Z)",
  "meds.sortNameDesc": "Name (Z–A)",
  "meds.sortAvailability": "Most available",
  "meds.inCatalog": "in the catalog",
  "meds.availableCount": "available",
  "meds.searchPlaceholder": "Search medication or dosage...",
  "meds.searchLabel": "Search medication or dosage",
  "meds.clearSearch": "Clear search",
  "meds.filterGroup": "Filter by availability",
  "meds.sortLabel": "Sort medications",
  "meds.resultsCount": { one: "{count} medication", other: "{count} medications" },
  "meds.resultsFiltered": "{count} of {total} medications",
  "meds.clearFilters": "Clear filters",
  "meds.emptyTitle": "No medication found",
  "meds.emptyText":
    "Try another name or dosage, or show all medications in the catalog again.",
  "meds.seeAllCatalog": "See the whole catalog",
  "meds.seeFullCatalog": "See the full catalog",
  "meds.findPharmacyNear": "Find a pharmacy near you",
  "meds.unitsInStock": "{count} units in stock",
  "meds.prescriptionRequired": "Prescription required",
  "meds.seeDetails": "See details",

  "medsPage.metaTitle": "Medications | FarmaGo",
  "medsPage.metaDescription":
    "Full catalog of medications available on FarmaGo, searchable by name and dosage.",
  "medsPage.breadcrumb": "Medications",
  "medsPage.title": "Medication Catalog",
  "medsPage.description":
    "Search by name or dosage, filter by availability and find out in how many pharmacies each medication can be found.",
  "medsPage.findPharmacies": "Find pharmacies",
  "medsPage.eyebrow": "Partner pharmacies",
  "medsPage.showcaseTitle": "Explore the",
  "medsPage.showcaseAccent": "full catalog",
  "medsPage.showcaseDescription":
    "Every medication shows live stock status across FarmaGo partner pharmacies.",

  "medDetail.notFound": "Medication not found",
  "medDetail.backToCatalog": "Back to the catalog",
  "medDetail.prescriptionNotice": "Medication subject to a doctor's prescription.",
  "medDetail.priceFrom": "Price from",
  "medDetail.unitsInStock": "Units in stock",
  "medDetail.availableIn": {
    one: "Available in {count} pharmacy",
    other: "Available in {count} pharmacies",
  },
  "medDetail.noStock": "No stock in partner pharmacies right now.",

  "guardsPage.metaTitle": "On-duty Pharmacies | FarmaGo",
  "guardsPage.metaDescription":
    "All on-duty pharmacies, with hours, contacts and available medications.",
  "guardsPage.breadcrumb": "On-duty Pharmacies",
  "guardsPage.title": "On-duty Pharmacies",
  "guardsPage.description":
    "See every on-duty pharmacy available, with hours, contacts and medications in stock.",
  "guardsPage.onDutyNow": "{count} on duty now",

  "aboutSection.title": "Who are we?",
  "aboutSection.text":
    "Our app offers two essential services: a detailed search by medication, including generic and brand names and recommended dosages, and the fast location of nearby pharmacies that have these medications in stock, with complete information about each pharmacy. This simplifies access to reliable medical information and medicine supply, improving the quality of life of our users.",
  "aboutSection.imageAlt": "Inside the pharmacy",
  "aboutPage.eyebrow": "How it works",
  "aboutPage.title": "FarmaGo in your pocket",
  "aboutPage.subtitle":
    "Find the closest pharmacy, check medications and details in a few taps.",
  "aboutPage.card1Title": "Pharmacies near you",
  "aboutPage.card1Text": "See on the map the closest pharmacies that are open right now.",
  "aboutPage.card2Title": "Medication details",
  "aboutPage.card2Text": "Check price, stock and which pharmacies sell each medication.",
  "aboutPage.card3Title": "On-duty pharmacies",
  "aboutPage.card3Text": "Always know which pharmacy is on duty near you.",

  "contact.metaTitle": "Contact us | FarmaGo",
  "contact.title": "Let's get in touch.",
  "contact.intro":
    "Welcome to our web app! We look forward to hearing from you to answer your questions, receive your feedback and discuss your project.",
  "contact.social": "Our social networks:",
  "contact.fieldName": "Full name",
  "contact.fieldEmail": "Email",
  "contact.fieldPhone": "Phone number",
  "contact.fieldMessage": "Message",
  "contact.send": "Send",
  "contact.sending": "Sending…",
  "contact.sentTitle": "Message sent!",
  "contact.sentText": "Thank you for reaching out. We will reply as soon as possible.",
  "contact.errorName": "Please enter your name.",
  "contact.errorMessage": "Please write your message.",
  "contact.errorEmail": "Invalid email.",
  "contact.errorTooLong": "The message is too long.",

  "privacy.metaTitle": "Privacy Policy | FarmaGo",
  "privacy.title": "Privacy Policy",
  "privacy.updated": "Last updated: October 2026.",
  "privacy.h2_1": "1. Data we collect",
  "privacy.p1":
    "We collect the data needed to run the platform, such as name, email, contact details and approximate location when the user shares it to find nearby pharmacies.",
  "privacy.h2_2": "2. How we use the data",
  "privacy.p2":
    "The data is used to manage accounts, show pharmacies and medications, improve the service and communicate relevant information about the account.",
  "privacy.h2_3": "3. Data sharing",
  "privacy.p3":
    "We do not sell personal data. We only share information with partners strictly required to deliver the service.",
  "privacy.h2_4": "4. Security",
  "privacy.p4":
    "We apply technical and organisational measures to protect the data against unauthorised access.",
  "privacy.h2_5": "5. Your rights",
  "privacy.p5":
    "You can request access, correction or deletion of your data by contacting us through the contact page.",

  "terms.metaTitle": "Terms & Conditions | FarmaGo",
  "terms.title": "Terms & Conditions",
  "terms.updated": "Last updated: October 2026.",
  "terms.h2_1": "1. Acceptance",
  "terms.p1":
    "By using FarmaGo you accept these terms. If you do not agree, do not use the platform.",
  "terms.h2_2": "2. Service",
  "terms.p2":
    "FarmaGo aggregates information about pharmacies, on-duty schedules and medication stock. Availability and prices may vary between pharmacies.",
  "terms.h2_3": "3. Accounts",
  "terms.p3":
    "You are responsible for keeping your credentials confidential and for all activity on your account.",
  "terms.h2_4": "4. Prohibited use",
  "terms.p4":
    "You may not use the platform for illegal purposes, unauthorised access attempts or to publish false information.",
  "terms.h2_5": "5. Limitation of liability",
  "terms.p5":
    "FarmaGo does not replace professional medical or pharmaceutical advice.",

  "login.metaTitle": "Sign in | FarmaGo",
  "login.metaDescription": "Access your pharmacist or administrator account.",
  "login.title": "Sign in",
  "login.subtitle": "Pharmacist credentials (pharmacy dashboard) or administrator.",
  "login.password": "Password",
  "login.forgotPassword": "Forgot your password?",
  "login.signingIn": "Signing in…",
  "login.noAccount": "Don't have an account yet?",
  "login.registerPharmacy": "Register my pharmacy",

  "register.metaTitle": "Register Pharmacy | FarmaGo",
  "register.metaDescription":
    "Create your pharmacy account on FarmaGo. Validation is done in person by our team.",
  "register.title": "Register my pharmacy",
  "register.subtitle":
    "Create the account and register the pharmacy in a single step. After our in-person visit, the pharmacy appears on the map and in the medication catalog.",
  "register.hasAccount": "Already have an account?",
  "register.stepAccount": "1. Account details",
  "register.stepPharmacy": "2. Pharmacy details",
  "register.pendingNote":
    "The pharmacy stays under review. Our team confirms the details after an in-person visit and only then does it appear on the site.",
  "register.pharmacistName": "Pharmacist name *",
  "register.password": "Password *",
  "register.passwordHint": "At least 6 characters.",
  "register.confirmPassword": "Confirm password *",
  "register.pharmacyName": "Pharmacy name *",
  "register.pharmacyNamePlaceholder": "E.g: Hope Pharmacy",
  "register.phone": "Phone *",
  "register.address": "Address *",
  "register.addressPlaceholder": "Street, neighbourhood, city",
  "register.openDays": "Opening days",
  "register.schedulePlaceholder": "Monday - Saturday",
  "register.hours": "Hours",
  "register.guard": "On-duty pharmacy",
  "register.image": "Pharmacy photo",
  "register.imageHint": "JPG, PNG, WEBP or AVIF. Max 3 MB.",
  "register.mapLocation": "Location on the map",
  "register.creating": "Creating account…",
  "register.submit": "Create account and register pharmacy",

  "forgot.metaTitle": "Reset password | FarmaGo",
  "forgot.metaDescription": "Recover access to your FarmaGo account.",
  "forgot.title": "Reset password",
  "forgot.subtitle":
    "Enter the email of your account to verify it and set a new password.",
  "forgot.accountEmail": "Account email",
  "forgot.checking": "Checking...",
  "forgot.checkEmail": "Check email",
  "forgot.emailValid": "Email is valid. Set the new password.",
  "forgot.newPassword": "New password",
  "forgot.confirmPassword": "Confirm password",
  "forgot.saving": "Saving...",
  "forgot.submit": "Reset password",
  "forgot.backToLogin": "Back to sign in",

  // Installable app (PWA)
  "pwa.appName": "FarmaGo — Pharmacies & Medications",
  "pwa.appShortName": "FarmaGo",
  "pwa.appDescription":
    "Find open pharmacies, on-duty pharmacies and medications available near you.",
  "pwa.installTitle": "Install FarmaGo",
  "pwa.installButton": "Install app",
  "pwa.installIosHint":
    "On iPhone or iPad, tap the share button and choose “Add to Home Screen”.",
  "pwa.installDesktopHint":
    "In Chrome or Edge, click the install icon (a screen with an arrow) in the address bar, or open the menu and choose “Install app”.",
  "pwa.installHttpHint":
    "One-tap installation requires a secure connection (https://). Since this page opened over http://, install it from the browser icon or menu.",
  "pwa.installDismiss": "Dismiss",
  "whatsapp.label": "WhatsApp",
  "whatsapp.cta": "Chat on WhatsApp",
  "whatsapp.defaultMessage": "Hello! I would like to know more about FarmaGo.",
  "whatsapp.openTooltip": "Open a chat on WhatsApp",

  "picker.latitude": "Latitude",
  "picker.longitude": "Longitude",
  "picker.myLocation": "My location",
  "picker.clear": "Clear",
  "picker.mapLabel": "Select the pharmacy location",
  "picker.hint":
    "Click on the map to place the pharmacy, drag the marker to adjust, or type the coordinates. Without coordinates the pharmacy shows in the list but is not marked on the map.",
  "picker.loading": "Loading the map...",
  "picker.lastPosition": "Last position: {event}",
  "picker.eventClick": "click ({lat}, {lng})",
  "picker.eventLeafletClick": "leaflet click ({lat}, {lng})",
  "picker.eventManual": "typed ({lat}, {lng})",
  "picker.eventGeolocation": "geolocation ({lat}, {lng})",
  "picker.noCoordinatesWarning":
    "Without coordinates: the pharmacy will be created but will not be marked on the map.",
  "picker.loadError": "The map could not be loaded: {error}",
  "picker.loadErrorHint":
    "Check your internet connection (tiles come from tile.openstreetmap.org) and confirm Leaflet is installed: npm i leaflet.",

  "error.required": "Please fill in all required fields.",
  "error.emailRequired": "Please enter your email.",
  "error.invalidEmail": "Invalid email.",
  "error.invalidCredentials": "Invalid credentials.",
  "error.passwordTooShort": "The password must have at least 6 characters.",
  "error.passwordsMismatch": "The passwords do not match.",
  "error.emailInUse": "An account with this email already exists.",
  "error.emailNotRegistered": "This email is not registered.",
  "error.accountNotFound": "Account not found.",
  "error.loginRequired": "Please enter the email and the password.",
  "error.invalidPharmacy": "Invalid pharmacy.",
  "error.pharmacyNotFound": "Pharmacy not found.",
  "error.notYourPharmacy": "This record does not belong to your pharmacy.",
  "error.medicationNotYours": "This medication does not belong to your pharmacy.",
  "error.expenseNotYours": "This expense does not belong to your pharmacy.",
  "error.saleNotYours": "This sale does not belong to your pharmacy.",
  "error.nameAddressPhoneRequired": "Name, address and phone are required.",
  "error.chooseMedicationAndExpiry": "Choose the medication and the expiry date.",
  "error.fillDescriptionAmountDate": "Please fill in description, amount and date.",
  "error.nameAndDosageRequired": "Please fill in the name and the dosage.",
  "error.nameAndEmailRequired": "Name and email are required.",
  "error.nameAndDosageRequiredAdmin": "Name and dosage are required.",
  "error.invalidMedication": "Invalid medication.",
  "error.invalidStockEntry": "Invalid stock entry.",
  "error.invalidQuantity": "Invalid quantity.",
  "error.invalidExpiryDate": "Invalid expiry date.",
  "error.choosePharmacyAndMedication": "Choose the pharmacy and the medication.",
  "error.fillOwnerNameAddressPhone": "Please fill in owner, name, address and phone.",
  "error.ownerMustBePharmacist": "The owner must be a pharmacist account.",
  "error.ownerAlreadyHasPharmacy":
    "That account already has a registered pharmacy (1 account = 1 pharmacy).",
  "error.rejectionReasonRequired": "Please give a reason for the rejection.",
  "error.ownAccountOnly": "You can only edit your own account.",
  "error.cannotDeleteOwnAccount": "You cannot delete your own account.",
  "error.unsupportedImageFormat":
    "Unsupported image format. Use JPG, PNG, WEBP, GIF or AVIF.",
  "error.imageTooLarge": "The image cannot be larger than 3 MB.",
  "error.addAtLeastOneMedication": "Add at least one medication.",
  "error.invalidClient": "Invalid client.",
  "error.clientNameRequired": "Enter the client's name.",
  "error.invalidStockLine": "Invalid stock line.",
  "error.insufficientStock": "Not enough stock for {name}.",
  "error.saleRegisterFailed": "Error while registering the sale.",

  "dash.hello": "Hello, {name}",
  "dash.registeredTitle": "Account created successfully",
  "dash.registeredText":
    "Your pharmacy was registered and is under review. We will let you know as soon as the visit is done.",
  "dash.summaryAfterRegister": "Start by confirming your pharmacy details.",
  "dash.summaryNormal": "Here is the summary of your pharmacy.",
  "dash.pendingTitle": "Pharmacy under review",
  "dash.pendingText":
    "Our team will visit the pharmacy to confirm the details. Only then does the pharmacy appear on the public site.",
  "dash.rejectedTitle": "Pharmacy rejected",
  "dash.rejectedFallback":
    "The team could not validate the details. Contact us for more information.",
  "dash.pharmacyState": "Pharmacy status",
  "dash.openState": "OPEN",
  "dash.closedState": "CLOSED",
  "dash.markClosed": "Mark as closed",
  "dash.markOpen": "Mark as open",
  "dash.kpiMedications": "Medications",
  "dash.kpiUnits": "Units in stock",
  "dash.kpiExpiring": "Expiring (90 days)",
  "dash.kpiSalesTotal": "Total sales",
  "dash.stockAvailability": "Stock availability",
  "dash.manageStock": "Manage stock",
  "dash.noStockYet": "No stock registered.",
  "dash.addMedications": "Add medications",
  "dash.thQuantity": "Quantity",
  "dash.expired": "Expired",
  "dash.quantityOf": "Quantity of {name}",
  "dash.zeroQuantity": {
    one: "{count} medication with zero quantity — it does not show on the public site.",
    other: "{count} medications with zero quantity — they do not show on the public site.",
  },
  "dash.editData": "Edit details",
  "dash.lastSales": "Latest sales",
  "dash.seeAll": "See all",
  "dash.noSales": "No sales registered.",
  "dash.saleNumber": "Sale #{id}",

  "dash.profileTitle": "Pharmacy details",
  "dash.profileSubtitle":
    "Update what the public sees: name, contact, hours and location.",
  "dash.publicInfo": "Public information",
  "dash.imageKeep": "Leave blank to keep the current one.",
  "dash.location": "Location",
  "dash.locationHint":
    "Click on the map to place the pharmacy. This is the position customers see on the pharmacy map.",
  "dash.saveChanges": "Save changes",
  "dash.changedDataTitle": "Changed your details after registering?",
  "dash.changedDataText":
    "Request a new validation so the team can check the pharmacy again.",
  "dash.requestRevalidation": "Request new validation",

  "dash.stockTitle": "Stock and availability",
  "dash.stockSubtitle":
    "Anything with a quantity above zero shows on the site as available.",
  "dash.editPrefix": "Edit — {name}",
  "dash.addToStock": "Add medication to stock",
  "dash.addToStockButton": "Add to stock",
  "dash.chooseMedication": "Choose medication…",
  "dash.alreadyInStock": " (already in stock)",
  "dash.stockEmpty": "You have not registered any stock yet. Use the form above.",
  "dash.deleteStockConfirm": "Are you sure you want to delete this stock item?",

  "dash.medsTitle": "My medications",
  "dash.medsSubtitle":
    "Register your pharmacy medications to use them in stock and sales.",
  "dash.medName": "Name",
  "dash.medDosage": "Dosage",
  "dash.medDosagePlaceholder": "e.g: 500mg, 120ml bottle",
  "dash.medImage": "Image",
  "dash.medDescription": "Description",
  "dash.medPrescriptionOnly": "Sold only with a doctor's prescription",
  "dash.addMedication": "Add medication",
  "dash.medEmpty": "You have not registered any medications yet. Use the form above.",
  "dash.createdAt": "Created on",
  "dash.deleteMedConfirm": 'Are you sure you want to delete the medication "{name}"?',

  "dash.salesTitle": "Sales",
  "dash.salesSubtitle": "All sales registered in your pharmacy.",
  "dash.newSale": "New sale",
  "dash.saleStockUpdated": "Stock is updated automatically.",
  "dash.noSalesRegistered": "You have not registered any sales yet.",
  "dash.thClient": "Client",
  "dash.thItems": "Items",
  "dash.viewReceipt": "View invoice",

  "invoice.title": "Invoice #{id}",
  "invoice.paid": "Paid",
  "invoice.pharmacy": "Pharmacy",
  "invoice.client": "Client",
  "invoice.thQty": "Qty",
  "invoice.thUnitPrice": "Unit price",
  "invoice.thSubtotal": "Subtotal",
  "invoice.clientHistory": "Client history",

  "dash.clientsTitle": "Clients",
  "dash.clientsSubtitle": "Purchase history and invoices per client.",
  "dash.noClients": "You have no registered clients yet.",
  "dash.thInvoices": "Invoices",
  "dash.thTotalSpent": "Total spent",
  "dash.history": "History",
  "dash.noPurchases": "No purchases registered.",
  "dash.invoiceHistory": "Invoice history",

  "dash.notificationsSubtitle": "Notices from the Pharmaceutical Inspection about your pharmacy.",
  "dash.noNotifications": "No notifications.",

  "dash.expensesTitle": "Expenses",
  "dash.expensesSubtitle": "Pharmacy costs. Registered total: {total}",
  "dash.newExpense": "New expense",
  "dash.noExpenses": "No expenses registered.",
  "expense.categoryInfra": "Infrastructure",
  "expense.categoryStaff": "Staff",
  "expense.categoryStock": "Stock",
  "expense.categoryOther": "Other",

  "dash.noPharmacyTitle": "No pharmacy linked yet",
  "dash.noPharmacyText":
    "Your account {email} is active, but there is no registered pharmacy yet. Our administrator validates every pharmacy in person before it appears on the site.",
  "dash.viewPharmacies": "View pharmacies",
  "dash.backToDashboard": "Back to the dashboard",

  "saleForm.client": "Client",
  "saleForm.chooseClient": "Choose client…",
  "saleForm.newClient": "+ New client",
  "saleForm.clientName": "Name *",
  "saleForm.items": "Items",
  "saleForm.chooseMedication": "Medication…",
  "saleForm.availableShort": "avail.: {count}",
  "saleForm.qty": "Qty",
  "saleForm.removeRow": "Remove row",
  "saleForm.addRow": "Add row",
  "saleForm.totalLabel": "Total: {total}",
  "saleForm.registering": "Registering…",
  "saleForm.register": "Register sale",

  "admin.validatedPharmacies": "Validated Pharmacies",
  "admin.statsLine":
    "{pharmacies} pharmacies · {medications} medications · {units} units in stock",
  "admin.mapTitle": "Pharmacy Map",
  "admin.pharmacyLocationTitle": "Pharmacy Locations",
  "admin.thContact": "Contact",
  "admin.noStockShort": "No stock",
  "admin.unitsShort": "{count} units",
  "admin.deactivated": "Deactivated",
  "admin.seeAll": "See all",
  "admin.seeEverything": "See everything",
  "admin.itemsBadge": "{count} items",
  "admin.daysLeft": "{count}d",

  "admin.dashValidate": {
    one: "Validate {count} pharmacy",
    other: "Validate {count} pharmacies",
  },
  "admin.dashGuardSeeAll": "See on-duty →",
  "admin.dashUsersSeeAll": "See users →",
  "admin.dashUnitsInStock": "{count} units in stock",
  "admin.dashRegisteredPharmacies": "Registered Pharmacies",
  "admin.dashExpiringSoon": "Stock Expiring (90 days)",
  "admin.dashNoExpiring": "No stock expiring soon.",

  "admin.validationsTitle": "Pharmacy validation",
  "admin.validationsSubtitle":
    "The pharmacy only appears on the public site after an in-person visit and the approval made here.",
  "admin.tabPending": "To validate",
  "admin.tabApproved": "Validated",
  "admin.tabRejected": "Rejected",
  "admin.nothingHere": "Nothing here: {tab}.",
  "admin.registeredOn": "Registered on {date}",
  "admin.reason": "Reason",
  "admin.visitLabel": "Visit",
  "admin.validatedOn": "Validated on {date}",
  "admin.validatedBy": " by {name}",
  "admin.visitChecklist":
    "check the name, address, phone and coordinates on site. If anything is wrong, ask the pharmacist to fix it in the dashboard.",
  "admin.validatePharmacy": "Validate pharmacy",
  "admin.rejectionReasonPlaceholder": "Reason for rejection",
  "admin.reject": "Reject",
  "admin.backToPending": "Back to “to validate”",

  "admin.pharmaciesTitle": "Pharmacies",
  "admin.pharmaciesSubtitle": "{count} registered pharmacies",
  "admin.filterAll": "All",
  "admin.filterNormal": "Normal",
  "admin.filterGuard": "On duty",
  "admin.noPharmaciesFound": "No pharmacy found.",
  "admin.noCoordinatesBadge": "No coordinates",
  "admin.viewStock": "View stock",
  "admin.deactivate": "Deactivate",
  "admin.reactivate": "Reactivate",

  "admin.usersTitle": "Users",
  "admin.usersSubtitle": "{count} registered users",
  "admin.thProfile": "Profile",
  "admin.thPharmacies": "Pharmacies",
  "admin.thRegisteredAt": "Registered on",
  "admin.roleAdmin": "Admin",
  "admin.roleInspecao": "Inspection",
  "admin.roleOwner": "Owner",

  "admin.accountTitle": "Account",
  "admin.accountSubtitle": "Manage profile and users",
  "admin.myProfile": "My Profile",
  "admin.createUserTitle": "Create New User",
  "admin.fullName": "Full name *",
  "admin.roleLabel": "Profile *",
  "admin.password": "Password *",
  "admin.passwordHint": "At least 8 characters",
  "admin.createUser": "Create User",
  "admin.allUsers": "All Users ({count})",
  "admin.cannotDeleteOwn": "You cannot delete your account",
  "admin.hasPharmacies": "Has linked pharmacies",

  "admin.stockTitle": "Inventory / pharmacy_stocks",
  "admin.stockSubtitle": "{entries} entries · {units} units in total",
  "admin.stockUrgentWarning":
    "Warning: there are medications expiring in less than 30 days.",
  "admin.stockPerPharmacy": "{count} items · {units} units",
  "admin.allStockEntries": "All Stock Entries",
  "admin.stockFor": "Stock — {name}",
  "admin.noStockFound": "No stock found.",
  "admin.expired": "Expired",
  "admin.ok": "OK",

  "admin.medsTitle": "Medications",
  "admin.medsSubtitle": "{count} medications in the catalog",
  "admin.imageUpload": "Image (upload)",
  "admin.imageUrl": "Image URL",
  "admin.pharmaciesWithMed": {
    one: "{count} pharmacy",
    other: "{count} pharmacies",
  },
  "admin.noMedicationsInCatalog": "No medications in the catalog.",

  "admin.analysesTitle": "Analytics",
  "admin.analysesSubtitle": "Financial and operational summary",
  "admin.totalExpenses": "Total Expenses",
  "admin.unitsInStock": "Units in Stock",
  "admin.expiring90": "Expiring (90d)",
  "admin.activePharmacies": "Active Pharmacies",
  "admin.expensesByMonth": "Expenses by Month",
  "admin.noExpiringSoon": "No stock expiring soon.",
  "admin.expiringSoonTitle": "Stock Expiring (next 90 days)",
  "admin.thDays": "Days",
  "admin.pharmacyStockOwner": "Pharmacies — Stock & Owner",
  "admin.thEmail": "Email",
  "admin.thProducts": "Products in Stock",

  "admin.expensesTitle": "Expenses",
  "admin.messages": "Messages",
  "admin.messagesSubtitle": "Enquiries sent through the website form.",
  "admin.messagesEmpty": "You have not received any messages yet.",
  "admin.messagesNew": {
    one: "{count} unread message.",
    other: "{count} unread messages.",
  },
  "admin.expensesSubtitle": "{count} records",
  "admin.percentOfTotal": "{percent}% of the total",
  "admin.grandTotal": "Grand Total",

  "insp.dashboardTitle": "Inspection Dashboard",
  "insp.dashboardSubtitle": "General pharmacy statistics.",
  "insp.approved": "Approved pharmacies",
  "insp.onDuty": "On duty",
  "insp.pending": "Pending",
  "insp.pharmaciesTitle": "Pharmacy Management",
  "insp.pharmaciesSubtitle": "All pharmacies registered in the system.",
  "insp.thActive": "Active",
  "insp.approvedBadge": "Approved",
  "insp.pendingBadge": "Pending",
  "insp.rejectedBadge": "Rejected",
  "insp.normalBadge": "Normal",
  "insp.guardsTitle": "On-duty Management",
  "insp.guardsSubtitle":
    "Select which pharmacies are on duty. The pharmacy receives a notification with the decision.",
  "insp.onDutyBadge": "On duty",
  "insp.removeFromDuty": "Remove from duty",
  "insp.escalateToDuty": "Assign to duty",
  "insp.notificationsTitle": "Notification Management",
  "insp.notificationsSubtitle": "History of notifications sent to pharmacies.",
  "insp.noNotifications": "No notifications yet.",
  "insp.dutyOnMessage":
    "The Pharmaceutical Inspection has assigned your pharmacy to on-duty duty. Check your on-duty schedule on the site.",
  "insp.dutyOffMessage":
    "The Pharmaceutical Inspection has removed your pharmacy from the on-duty list.",
};

const fr: Record<TKey, Entry> = {
  home: "Accueil",
  about: "À propos",
  contact: "Contactez-nous",
  login: "Connexion",
  registerPharmacy: "Inscrire une pharmacie",
  medications: "Médicaments",
  pharmacies: "Pharmacies",
  guardPharmacies: "Pharmacies de garde",
  openNow: "ouvertes maintenant",
  pharmaciesOnMap: "pharmacies sur la carte",
  onGuard: "de garde",
  heroTitle: "Pharmacies ouvertes près de vous",
  heroText:
    "Explorez la carte, voyez ce qui est ouvert pour le moment et cliquez sur une pharmacie pour consulter ses horaires, contacts et médicaments disponibles.",
  searchPlaceholder: "Rechercher une pharmacie, un quartier ou un médicament...",
  searchLabel: "Rechercher une pharmacie, un quartier ou un médicament",
  open: "Ouvertes",
  all: "Toutes",
  closed: "Fermées",
  guard: "Garde",
  useMyLocation: "Utiliser ma position",
  locationActive: "Position active",
  noResults: "Aucune pharmacie ne correspond à la recherche.",
  seeAll: "Voir toutes les pharmacies",
  dashboard: "Tableau de bord",
  validations: "Validations",
  stock: "Stock",
  users: "Utilisateurs",
  myPharmacy: "Ma pharmacie",
  summary: "Résumé",
  pharmacyData: "Données de la boutique",
  sales: "Ventes",
  clients: "Clients",
  notifications: "Notifications",
  viewSite: "Voir le site",
  logout: "Déconnexion",
  account: "Compte",
  stockValidity: "Stock & Validité",
  guardsManagement: "Gestion des gardes",
  pharmaciesManagement: "Gestion des pharmacies",
  notificationsManagement: "Gestion des notifications",
  messages: "Messages",

  "common.details": "Détails",
  "common.moreDetails": "Plus de détails",
  "common.back": "Retour",
  "common.close": "Fermer",
  "common.previous": "Précédent",
  "common.next": "Suivant",
  "common.print": "Imprimer",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.edit": "Modifier",
  "common.remove": "Supprimer",
  "common.yes": "Oui",
  "common.no": "Non",
  "common.name": "Nom",
  "common.email": "E-mail",
  "common.phone": "Téléphone",
  "common.address": "Adresse",
  "common.openDays": "Jours d'ouverture",
  "common.hours": "Horaires",
  "common.quantity": "Quantité",
  "common.price": "Prix",
  "common.unitPrice": "Prix unitaire",
  "common.batch": "Lot",
  "common.expiry": "Validité",
  "common.status": "État",
  "common.actions": "Actions",
  "common.date": "Date",
  "common.description": "Description",
  "common.category": "Catégorie",
  "common.total": "Total",
  "common.dosage": "Dosage",
  "common.image": "Image",
  "common.medication": "Médicament",
  "common.pharmacy": "Pharmacie",
  "common.owner": "Propriétaire",
  "common.available": "Disponible",
  "common.unavailable": "Indisponible",
  "common.openBadge": "Ouverte",
  "common.closedBadge": "Fermée",
  "common.notSet": "Non défini",
  "common.withoutPhone": "Sans téléphone",
  "common.mainNavigation": "Navigation principale",
  "common.toggleNavigation": "Basculer la navigation",
  "common.breadcrumb": "Fil d'Ariane",
  "common.requiredField": "Champ obligatoire",
  "common.itemsCount": { one: "{count} article", other: "{count} articles" },
  "common.unitsCount": { one: "{count} unité", other: "{count} unités" },
  "common.daysCount": { one: "{count} jour", other: "{count} jours" },
  "common.notAvailableYet": "—",

  "status.validated": "Validée",
  "status.pending": "En cours de validation",
  "status.rejected": "Rejetée",
  "status.approved": "Approuvée",
  "status.notDefined": "Non défini",

  "footer.about": "À propos",
  "footer.aboutText":
    "Optimisez votre accès aux médicaments avec notre application web. Trouvez et localisez rapidement les pharmacies proches. Des soins de santé simples et efficaces à votre portée !",
  "footer.services": "Nos services",
  "footer.dutyPharmacies": "Pharmacies de service",
  "footer.privacy": "Politique de confidentialité",
  "footer.terms": "Conditions générales",
  "footer.helpText": "Une question ? Appelez-nous 24h/24.",
  "footer.copyright": "copyright ©FarmaGo 2026. tous droits réservés",

  "hero.title": "Trouvez votre médicament le plus rapidement possible",
  "hero.searchPlaceholder": "Rechercher un médicament...",
  "hero.validate": "Vérifier",

  "explorer.clearSearch": "Effacer la recherche",
  "explorer.filterGroup": "Filtrer les pharmacies",
  "explorer.noCoordinates": "sans coordonnées",
  "explorer.sortByDistance": "par distance",
  "explorer.legendOpen": "Ouverte",
  "explorer.legendClosed": "Fermée",
  "explorer.legendYou": "Vous",
  "explorer.geoUnsupported": "Ce navigateur ne prend pas en charge la géolocalisation.",
  "explorer.geoDenied":
    "Impossible d'obtenir votre position. Vérifiez les autorisations du navigateur.",
  "explorer.resultsCount": { one: "{count} pharmacie", other: "{count} pharmacies" },
  "explorer.medicationsCount": { one: "{count} méd.", other: "{count} méd." },
  "explorer.mapLabel": "Carte des pharmacies",
  "explorer.markerCount": { one: "{count} marqueur", other: "{count} marqueurs" },
  "explorer.mapLoadError": "Impossible de charger la carte",
  "explorer.mapLoadErrorHint":
    "Vérifiez votre connexion internet (tuiles de tile.openstreetmap.org) et que Leaflet est installé (npm i leaflet).",
  "explorer.yourLocation": "Votre position",

  "detail.close": "Fermer les détails",
  "detail.openNow": "Ouverte maintenant",
  "detail.callNow": "Appeler",
  "detail.directions": "Itinéraire",
  "detail.schedule": "Horaires",
  "detail.coordinates": "Coordonnées",
  "detail.availableMedications": "Médicaments disponibles",
  "detail.filterPlaceholder": "Filtrer les médicaments de cette pharmacie...",
  "detail.filterLabel": "Filtrer les médicaments de cette pharmacie",
  "detail.clearMedFilter": "Effacer le filtre des médicaments",
  "detail.noMedications":
    "Cette pharmacie n'a pas encore de médicaments enregistrés en stock.",
  "detail.noMatch": "Aucun médicament ne correspond à « {query} ».",
  "detail.fullPageLink": "Voir la page complète de la pharmacie",
  "detail.distanceAway": "à {distance} de vous",
  "detail.guardTag": "Pharmacie de garde",
  "detail.notFound": "Pharmacie introuvable",
  "detail.backHome": "Retour à l'accueil",

  "pharmacy.section": "PHARMACIES",
  "pharmacy.sectionGuards": "PHARMACIES DE GARDE",
  "pharmacy.guardTag": "De garde",
  "pharmacy.noCoordinates": "Pas de coordonnées sur la carte",
  "pharmacy.notFound": "Pharmacie introuvable",

  "meds.filterAll": "Tous",
  "meds.filterAvailable": "Disponibles",
  "meds.filterUnavailable": "Indisponibles",
  "meds.sortNameAsc": "Nom (A–Z)",
  "meds.sortNameDesc": "Nom (Z–A)",
  "meds.sortAvailability": "Les plus disponibles",
  "meds.inCatalog": "au catalogue",
  "meds.availableCount": "disponibles",
  "meds.searchPlaceholder": "Rechercher un médicament ou un dosage...",
  "meds.searchLabel": "Rechercher un médicament ou un dosage",
  "meds.clearSearch": "Effacer la recherche",
  "meds.filterGroup": "Filtrer par disponibilité",
  "meds.sortLabel": "Trier les médicaments",
  "meds.resultsCount": { one: "{count} médicament", other: "{count} médicaments" },
  "meds.resultsFiltered": "{count} sur {total} médicaments",
  "meds.clearFilters": "Effacer les filtres",
  "meds.emptyTitle": "Aucun médicament trouvé",
  "meds.emptyText":
    "Essayez un autre nom ou dosage, ou affichez à nouveau tous les médicaments du catalogue.",
  "meds.seeAllCatalog": "Voir tout le catalogue",
  "meds.seeFullCatalog": "Voir le catalogue complet",
  "meds.findPharmacyNear": "Trouver une pharmacie près de vous",
  "meds.unitsInStock": "{count} unités en stock",
  "meds.prescriptionRequired": "Ordonnance obligatoire",
  "meds.seeDetails": "Voir les détails",

  "medsPage.metaTitle": "Médicaments | FarmaGo",
  "medsPage.metaDescription":
    "Catalogue complet des médicaments disponibles sur FarmaGo, avec recherche par nom et dosage.",
  "medsPage.breadcrumb": "Médicaments",
  "medsPage.title": "Catalogue des médicaments",
  "medsPage.description":
    "Recherchez par nom ou dosage, filtrez par disponibilité et découvrez dans combien de pharmacies chaque médicament est disponible.",
  "medsPage.findPharmacies": "Trouver des pharmacies",
  "medsPage.eyebrow": "Pharmacies partenaires",
  "medsPage.showcaseTitle": "Explorez le",
  "medsPage.showcaseAccent": "catalogue complet",
  "medsPage.showcaseDescription":
    "Chaque médicament affiche l'état du stock en temps réel dans les pharmacies partenaires de FarmaGo.",

  "medDetail.notFound": "Médicament introuvable",
  "medDetail.backToCatalog": "Retour au catalogue",
  "medDetail.prescriptionNotice": "Médicament soumis à ordonnance.",
  "medDetail.priceFrom": "Prix à partir de",
  "medDetail.unitsInStock": "Unités en stock",
  "medDetail.availableIn": {
    one: "Disponible dans {count} pharmacie",
    other: "Disponible dans {count} pharmacies",
  },
  "medDetail.noStock": "Pas de stock dans les pharmacies partenaires pour le moment.",

  "guardsPage.metaTitle": "Pharmacies de garde | FarmaGo",
  "guardsPage.metaDescription":
    "Toutes les pharmacies de garde, avec horaires, contacts et médicaments disponibles.",
  "guardsPage.breadcrumb": "Pharmacies de garde",
  "guardsPage.title": "Pharmacies de garde",
  "guardsPage.description":
    "Consultez toutes les pharmacies de garde disponibles, avec horaires, contacts et médicaments en stock.",
  "guardsPage.onDutyNow": "{count} de garde maintenant",

  "aboutSection.title": "Qui sommes-nous ?",
  "aboutSection.text":
    "Notre application propose deux services essentiels : une recherche détaillée par médicament, incluant noms génériques et de marque, dosages recommandés, et la localisation rapide des pharmacies proches disposant de ces médicaments en stock, avec informations complètes sur chaque pharmacie. Elle simplifie ainsi l'accès à des informations médicales fiables et à l'approvisionnement en médicaments, améliorant la qualité de vie de nos utilisateurs.",
  "aboutSection.imageAlt": "Intérieur de la pharmacie",
  "aboutPage.eyebrow": "Comment ça marche",
  "aboutPage.title": "FarmaGo dans votre poche",
  "aboutPage.subtitle":
    "Trouvez la pharmacie la plus proche, consultez médicaments et détails en quelques gestes.",
  "aboutPage.card1Title": "Pharmacies près de vous",
  "aboutPage.card1Text": "Voyez sur la carte les pharmacies les plus proches actuellement ouvertes.",
  "aboutPage.card2Title": "Détails du médicament",
  "aboutPage.card2Text": "Consultez le prix, le stock et les pharmacies qui vendent chaque médicament.",
  "aboutPage.card3Title": "Pharmacies de garde",
  "aboutPage.card3Text": "Sachez toujours quelle pharmacie est de garde près de vous.",

  "contact.metaTitle": "Contactez-nous | FarmaGo",
  "contact.title": "Prenons contact.",
  "contact.intro":
    "Bienvenue sur notre application web ! Nous attendons votre contact pour répondre à vos questions, recevoir vos retours et discuter de votre projet.",
  "contact.social": "Nos réseaux sociaux :",
  "contact.fieldName": "Nom d'utilisateur",
  "contact.fieldEmail": "E-mail",
  "contact.fieldPhone": "Numéro de téléphone",
  "contact.fieldMessage": "Message",
  "contact.send": "Envoyer",
  "contact.sending": "Envoi…",
  "contact.sentTitle": "Message envoyé !",
  "contact.sentText": "Merci de nous contacter. Nous répondrons dès que possible.",
  "contact.errorName": "Veuillez indiquer votre nom.",
  "contact.errorMessage": "Veuillez écrire votre message.",
  "contact.errorEmail": "E-mail invalide.",
  "contact.errorTooLong": "Le message est trop long.",

  "privacy.metaTitle": "Politique de confidentialité | FarmaGo",
  "privacy.title": "Politique de confidentialité",
  "privacy.updated": "Dernière mise à jour : octobre 2026.",
  "privacy.h2_1": "1. Données collectées",
  "privacy.p1":
    "Nous collectons les données nécessaires au fonctionnement de la plateforme, telles que le nom, l'e-mail, les coordonnées et la position approximative lorsque l'utilisateur la partage pour trouver des pharmacies proches.",
  "privacy.h2_2": "2. Utilisation des données",
  "privacy.p2":
    "Les données servent à gérer les comptes, présenter les pharmacies et médicaments, améliorer le service et communiquer des informations pertinentes sur le compte.",
  "privacy.h2_3": "3. Partage des données",
  "privacy.p3":
    "Nous ne vendons pas de données personnelles. Nous ne partageons qu'avec des partenaires strictement nécessaires à la fourniture du service.",
  "privacy.h2_4": "4. Sécurité",
  "privacy.p4":
    "Nous appliquons des mesures techniques et organisationnelles pour protéger les données contre tout accès non autorisé.",
  "privacy.h2_5": "5. Vos droits",
  "privacy.p5":
    "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en nous contactant via la page de contact.",

  "terms.metaTitle": "Conditions générales | FarmaGo",
  "terms.title": "Conditions générales",
  "terms.updated": "Dernière mise à jour : octobre 2026.",
  "terms.h2_1": "1. Acceptation",
  "terms.p1":
    "En utilisant FarmaGo, vous acceptez ces conditions. Si vous n'êtes pas d'accord, n'utilisez pas la plateforme.",
  "terms.h2_2": "2. Service",
  "terms.p2":
    "FarmaGo agrège des informations sur les pharmacies, les gardes et le stock de médicaments. La disponibilité et les prix peuvent varier d'une pharmacie à l'autre.",
  "terms.h2_3": "3. Comptes",
  "terms.p3":
    "Vous êtes responsable de la confidentialité de vos identifiants et de toute activité sur votre compte.",
  "terms.h2_4": "4. Usage interdit",
  "terms.p4":
    "Il est interdit d'utiliser la plateforme à des fins illégales, de tenter des accès non autorisés ou de publier des informations fausses.",
  "terms.h2_5": "5. Limitation de responsabilité",
  "terms.p5":
    "FarmaGo ne remplace pas un avis médical ou pharmaceutique professionnel.",

  "login.metaTitle": "Connexion | FarmaGo",
  "login.metaDescription": "Accédez à votre compte pharmacien ou administrateur.",
  "login.title": "Connexion au compte",
  "login.subtitle":
    "Identifiants pharmacien (tableau de bord de la pharmacie) ou administrateur.",
  "login.password": "Mot de passe",
  "login.forgotPassword": "Mot de passe oublié ?",
  "login.signingIn": "Connexion…",
  "login.noAccount": "Vous n'avez pas encore de compte ?",
  "login.registerPharmacy": "Inscrire ma pharmacie",

  "register.metaTitle": "Inscrire une pharmacie | FarmaGo",
  "register.metaDescription":
    "Créez le compte de votre pharmacie sur FarmaGo. La validation est faite sur place par notre équipe.",
  "register.title": "Inscrire ma pharmacie",
  "register.subtitle":
    "Créez le compte et inscrivez la pharmacie en une seule étape. Après notre visite sur place, la pharmacie apparaît sur la carte et dans le catalogue des médicaments.",
  "register.hasAccount": "Vous avez déjà un compte ?",
  "register.stepAccount": "1. Données du compte",
  "register.stepPharmacy": "2. Données de la pharmacie",
  "register.pendingNote":
    "La pharmacie reste en cours de validation. Notre équipe confirme les données après une visite sur place et ce n'est qu'ensuite qu'elle apparaît sur le site.",
  "register.pharmacistName": "Nom du pharmacien *",
  "register.password": "Mot de passe *",
  "register.passwordHint": "6 caractères minimum.",
  "register.confirmPassword": "Confirmer le mot de passe *",
  "register.pharmacyName": "Nom de la pharmacie *",
  "register.pharmacyNamePlaceholder": "Ex : Pharmacie de l'Espoir",
  "register.phone": "Téléphone *",
  "register.address": "Adresse *",
  "register.addressPlaceholder": "Rue, quartier, ville",
  "register.openDays": "Jours d'ouverture",
  "register.schedulePlaceholder": "Lundi - Samedi",
  "register.hours": "Horaires",
  "register.guard": "Pharmacie de garde",
  "register.image": "Photo de la pharmacie",
  "register.imageHint": "JPG, PNG, WEBP ou AVIF. 3 Mo maximum.",
  "register.mapLocation": "Position sur la carte",
  "register.creating": "Création du compte…",
  "register.submit": "Créer le compte et inscrire la pharmacie",

  "forgot.metaTitle": "Réinitialiser le mot de passe | FarmaGo",
  "forgot.metaDescription": "Récupérez l'accès à votre compte FarmaGo.",
  "forgot.title": "Réinitialiser le mot de passe",
  "forgot.subtitle":
    "Saisissez l'e-mail de votre compte pour le valider et définir un nouveau mot de passe.",
  "forgot.accountEmail": "E-mail du compte",
  "forgot.checking": "Vérification...",
  "forgot.checkEmail": "Vérifier l'e-mail",
  "forgot.emailValid": "E-mail valide. Définissez le nouveau mot de passe.",
  "forgot.newPassword": "Nouveau mot de passe",
  "forgot.confirmPassword": "Confirmer le mot de passe",
  "forgot.saving": "Enregistrement...",
  "forgot.submit": "Réinitialiser le mot de passe",
  "forgot.backToLogin": "Retour à la connexion",

  // Application installable (PWA)
  "pwa.appName": "FarmaGo — Pharmacies et médicaments",
  "pwa.appShortName": "FarmaGo",
  "pwa.appDescription":
    "Trouvez les pharmacies ouvertes, de garde et les médicaments disponibles près de vous.",
  "pwa.installTitle": "Installer FarmaGo",
  "pwa.installButton": "Installer l'application",
  "pwa.installIosHint":
    "Sur iPhone ou iPad, touchez le bouton de partage puis choisissez « Sur l'écran d'accueil ».",
  "pwa.installDesktopHint":
    "Dans Chrome ou Edge, cliquez sur l'icône d'installation (un écran avec une flèche) dans la barre d'adresse, ou ouvrez le menu et choisissez « Installer l'application ».",
  "pwa.installHttpHint":
    "L'installation en un clic nécessite une connexion sécurisée (https://). Cette page s'est ouverte en http:// : installez-la depuis l'icône ou le menu du navigateur.",
  "pwa.installDismiss": "Fermer",
  "whatsapp.label": "WhatsApp",
  "whatsapp.cta": "Discuter sur WhatsApp",
  "whatsapp.defaultMessage": "Bonjour ! Je souhaite en savoir plus sur FarmaGo.",
  "whatsapp.openTooltip": "Ouvrir une discussion sur WhatsApp",

  "picker.latitude": "Latitude",
  "picker.longitude": "Longitude",
  "picker.myLocation": "Ma position",
  "picker.clear": "Effacer",
  "picker.mapLabel": "Sélectionner la position de la pharmacie",
  "picker.hint":
    "Cliquez sur la carte pour placer la pharmacie, faites glisser le marqueur pour ajuster, ou saisissez les coordonnées. Sans coordonnées, la pharmacie apparaît dans la liste mais n'est pas marquée sur la carte.",
  "picker.loading": "Chargement de la carte...",
  "picker.lastPosition": "Dernière position : {event}",
  "picker.eventClick": "clic ({lat}, {lng})",
  "picker.eventLeafletClick": "clic leaflet ({lat}, {lng})",
  "picker.eventManual": "saisi ({lat}, {lng})",
  "picker.eventGeolocation": "géolocalisation ({lat}, {lng})",
  "picker.noCoordinatesWarning":
    "Sans coordonnées : la pharmacie sera créée mais n'apparaîtra pas marquée sur la carte.",
  "picker.loadError": "Impossible de charger la carte : {error}",
  "picker.loadErrorHint":
    "Vérifiez la connexion internet (les tuiles viennent de tile.openstreetmap.org) et que Leaflet est installé : npm i leaflet.",

  "error.required": "Veuillez remplir tous les champs obligatoires.",
  "error.emailRequired": "Veuillez saisir votre e-mail.",
  "error.invalidEmail": "E-mail invalide.",
  "error.invalidCredentials": "Identifiants invalides.",
  "error.passwordTooShort": "Le mot de passe doit contenir au moins 6 caractères.",
  "error.passwordsMismatch": "Les mots de passe ne correspondent pas.",
  "error.emailInUse": "Un compte existe déjà avec cet e-mail.",
  "error.emailNotRegistered": "Cet e-mail n'est pas enregistré.",
  "error.accountNotFound": "Compte introuvable.",
  "error.loginRequired": "Veuillez saisir l'e-mail et le mot de passe.",
  "error.invalidPharmacy": "Pharmacie invalide.",
  "error.pharmacyNotFound": "Pharmacie introuvable.",
  "error.notYourPharmacy": "Cet enregistrement n'appartient pas à votre pharmacie.",
  "error.medicationNotYours": "Ce médicament n'appartient pas à votre pharmacie.",
  "error.expenseNotYours": "Cette dépense n'appartient pas à votre pharmacie.",
  "error.saleNotYours": "Cette vente n'appartient pas à votre pharmacie.",
  "error.nameAddressPhoneRequired": "Le nom, l'adresse et le téléphone sont obligatoires.",
  "error.chooseMedicationAndExpiry": "Choisissez le médicament et la date de validité.",
  "error.fillDescriptionAmountDate": "Veuillez renseigner la description, le montant et la date.",
  "error.nameAndDosageRequired": "Veuillez renseigner le nom et le dosage.",
  "error.nameAndEmailRequired": "Le nom et l'e-mail sont obligatoires.",
  "error.nameAndDosageRequiredAdmin": "Le nom et le dosage sont obligatoires.",
  "error.invalidMedication": "Médicament invalide.",
  "error.invalidStockEntry": "Entrée de stock invalide.",
  "error.invalidQuantity": "Quantité invalide.",
  "error.invalidExpiryDate": "Date de validité invalide.",
  "error.choosePharmacyAndMedication": "Choisissez la pharmacie et le médicament.",
  "error.fillOwnerNameAddressPhone": "Veuillez renseigner le propriétaire, le nom, l'adresse et le téléphone.",
  "error.ownerMustBePharmacist": "Le propriétaire doit être un compte pharmacien.",
  "error.ownerAlreadyHasPharmacy":
    "Ce compte possède déjà une pharmacie enregistrée (1 compte = 1 pharmacie).",
  "error.rejectionReasonRequired": "Veuillez indiquer le motif du rejet.",
  "error.ownAccountOnly": "Vous ne pouvez modifier que votre propre compte.",
  "error.cannotDeleteOwnAccount": "Vous ne pouvez pas supprimer votre propre compte.",
  "error.unsupportedImageFormat":
    "Format d'image non pris en charge. Utilisez JPG, PNG, WEBP, GIF ou AVIF.",
  "error.imageTooLarge": "L'image ne peut pas dépasser 3 Mo.",
  "error.addAtLeastOneMedication": "Ajoutez au moins un médicament.",
  "error.invalidClient": "Client invalide.",
  "error.clientNameRequired": "Indiquez le nom du client.",
  "error.invalidStockLine": "Ligne de stock invalide.",
  "error.insufficientStock": "Stock insuffisant pour {name}.",
  "error.saleRegisterFailed": "Erreur lors de l'enregistrement de la vente.",

  "dash.hello": "Bonjour, {name}",
  "dash.registeredTitle": "Compte créé avec succès",
  "dash.registeredText":
    "Votre pharmacie a été enregistrée et est en cours de validation. Nous vous préviendrons dès que la visite sera terminée.",
  "dash.summaryAfterRegister": "Commencez par confirmer les données de votre pharmacie.",
  "dash.summaryNormal": "Voici le résumé de votre pharmacie.",
  "dash.pendingTitle": "Pharmacie en cours de validation",
  "dash.pendingText":
    "Notre équipe va visiter la pharmacie pour confirmer les données. Ce n'est qu'ensuite qu'elle apparaît sur le site public.",
  "dash.rejectedTitle": "Pharmacie rejetée",
  "dash.rejectedFallback":
    "L'équipe n'a pas pu valider les données. Contactez-nous pour plus d'informations.",
  "dash.pharmacyState": "État de la pharmacie",
  "dash.openState": "OUVERTE",
  "dash.closedState": "FERMÉE",
  "dash.markClosed": "Marquer comme fermée",
  "dash.markOpen": "Marquer comme ouverte",
  "dash.kpiMedications": "Médicaments",
  "dash.kpiUnits": "Unités en stock",
  "dash.kpiExpiring": "Expirant (90 jours)",
  "dash.kpiSalesTotal": "Total des ventes",
  "dash.stockAvailability": "Disponibilité du stock",
  "dash.manageStock": "Gérer le stock",
  "dash.noStockYet": "Aucun stock enregistré.",
  "dash.addMedications": "Ajouter des médicaments",
  "dash.thQuantity": "Quantité",
  "dash.expired": "Expiré",
  "dash.quantityOf": "Quantité de {name}",
  "dash.zeroQuantity": {
    one: "{count} médicament avec une quantité nulle — il n'apparaît pas sur le site public.",
    other: "{count} médicaments avec une quantité nulle — ils n'apparaissent pas sur le site public.",
  },
  "dash.editData": "Modifier les données",
  "dash.lastSales": "Dernières ventes",
  "dash.seeAll": "Tout voir",
  "dash.noSales": "Aucune vente enregistrée.",
  "dash.saleNumber": "Vente n° {id}",

  "dash.profileTitle": "Données de la pharmacie",
  "dash.profileSubtitle":
    "Mettez à jour ce que le public voit : nom, contact, horaires et position.",
  "dash.publicInfo": "Informations publiques",
  "dash.imageKeep": "Laissez vide pour conserver l'actuelle.",
  "dash.location": "Position",
  "dash.locationHint":
    "Cliquez sur la carte pour placer la pharmacie. C'est cette position que les clients voient sur la carte des pharmacies.",
  "dash.saveChanges": "Enregistrer les modifications",
  "dash.changedDataTitle": "Vous avez modifié vos données après l'inscription ?",
  "dash.changedDataText":
    "Demandez une nouvelle validation pour que l'équipe revérifie la pharmacie.",
  "dash.requestRevalidation": "Demander une nouvelle validation",

  "dash.stockTitle": "Stock et disponibilité",
  "dash.stockSubtitle":
    "Tout ce qui a une quantité supérieure à zéro apparaît sur le site comme disponible.",
  "dash.editPrefix": "Modifier — {name}",
  "dash.addToStock": "Ajouter un médicament au stock",
  "dash.addToStockButton": "Ajouter au stock",
  "dash.chooseMedication": "Choisir un médicament…",
  "dash.alreadyInStock": " (déjà en stock)",
  "dash.stockEmpty": "Vous n'avez pas encore enregistré de stock. Utilisez le formulaire ci-dessus.",
  "dash.deleteStockConfirm": "Voulez-vous vraiment supprimer cet article de stock ?",

  "dash.medsTitle": "Mes médicaments",
  "dash.medsSubtitle":
    "Enregistrez les médicaments de votre pharmacie pour les utiliser dans le stock et les ventes.",
  "dash.medName": "Nom",
  "dash.medDosage": "Dosage",
  "dash.medDosagePlaceholder": "ex : 500 mg, flacon 120 ml",
  "dash.medImage": "Image",
  "dash.medDescription": "Description",
  "dash.medPrescriptionOnly": "Vendu uniquement sur ordonnance",
  "dash.addMedication": "Ajouter un médicament",
  "dash.medEmpty": "Vous n'avez pas encore enregistré de médicaments. Utilisez le formulaire ci-dessus.",
  "dash.createdAt": "Créé le",
  "dash.deleteMedConfirm": 'Voulez-vous vraiment supprimer le médicament « {name} » ?',

  "dash.salesTitle": "Ventes",
  "dash.salesSubtitle": "Toutes les ventes enregistrées dans votre pharmacie.",
  "dash.newSale": "Nouvelle vente",
  "dash.saleStockUpdated": "Le stock est mis à jour automatiquement.",
  "dash.noSalesRegistered": "Vous n'avez pas encore enregistré de ventes.",
  "dash.thClient": "Client",
  "dash.thItems": "Articles",
  "dash.viewReceipt": "Voir la facture",

  "invoice.title": "Facture n° {id}",
  "invoice.paid": "Payée",
  "invoice.pharmacy": "Pharmacie",
  "invoice.client": "Client",
  "invoice.thQty": "Qté",
  "invoice.thUnitPrice": "Prix un.",
  "invoice.thSubtotal": "Sous-total",
  "invoice.clientHistory": "Historique du client",

  "dash.clientsTitle": "Clients",
  "dash.clientsSubtitle": "Historique des achats et factures par client.",
  "dash.noClients": "Vous n'avez pas encore de clients enregistrés.",
  "dash.thInvoices": "Factures",
  "dash.thTotalSpent": "Total dépensé",
  "dash.history": "Historique",
  "dash.noPurchases": "Aucun achat enregistré.",
  "dash.invoiceHistory": "Historique des factures",

  "dash.notificationsSubtitle":
    "Avis de l'Inspection pharmaceutique concernant votre pharmacie.",
  "dash.noNotifications": "Aucune notification.",

  "dash.expensesTitle": "Dépenses",
  "dash.expensesSubtitle": "Coûts de la pharmacie. Total enregistré : {total}",
  "dash.newExpense": "Nouvelle dépense",
  "dash.noExpenses": "Aucune dépense enregistrée.",
  "expense.categoryInfra": "Infrastructure",
  "expense.categoryStaff": "Personnel",
  "expense.categoryStock": "Stock",
  "expense.categoryOther": "Autres",

  "dash.noPharmacyTitle": "Aucune pharmacie associée pour l'instant",
  "dash.noPharmacyText":
    "Votre compte {email} est actif, mais aucune pharmacie n'est encore enregistrée. Notre administrateur valide chaque pharmacie sur place avant qu'elle apparaisse sur le site.",
  "dash.viewPharmacies": "Voir les pharmacies",
  "dash.backToDashboard": "Retour au tableau de bord",

  "saleForm.client": "Client",
  "saleForm.chooseClient": "Choisir un client…",
  "saleForm.newClient": "+ Nouveau client",
  "saleForm.clientName": "Nom *",
  "saleForm.items": "Articles",
  "saleForm.chooseMedication": "Médicament…",
  "saleForm.availableShort": "disp. : {count}",
  "saleForm.qty": "Qté",
  "saleForm.removeRow": "Supprimer la ligne",
  "saleForm.addRow": "Ajouter une ligne",
  "saleForm.totalLabel": "Total : {total}",
  "saleForm.registering": "Enregistrement…",
  "saleForm.register": "Enregistrer la vente",

  "admin.validatedPharmacies": "Pharmacies validées",
  "admin.statsLine":
    "{pharmacies} pharmacies · {medications} médicaments · {units} unités en stock",
  "admin.mapTitle": "Carte des pharmacies",
  "admin.pharmacyLocationTitle": "Position des pharmacies",
  "admin.thContact": "Contact",
  "admin.noStockShort": "Pas de stock",
  "admin.unitsShort": "{count} unités",
  "admin.deactivated": "Désactivée",
  "admin.seeAll": "Tout voir",
  "admin.seeEverything": "Tout voir",
  "admin.itemsBadge": "{count} articles",
  "admin.daysLeft": "{count} j",

  "admin.dashValidate": {
    one: "Valider {count} pharmacie",
    other: "Valider {count} pharmacies",
  },
  "admin.dashGuardSeeAll": "Voir les gardes →",
  "admin.dashUsersSeeAll": "Voir les utilisateurs →",
  "admin.dashUnitsInStock": "{count} unités en stock",
  "admin.dashRegisteredPharmacies": "Pharmacies enregistrées",
  "admin.dashExpiringSoon": "Stock expiring (90 jours)",
  "admin.dashNoExpiring": "Aucun stock n'expire bientôt.",

  "admin.validationsTitle": "Validation des pharmacies",
  "admin.validationsSubtitle":
    "La pharmacie n'apparaît sur le site public qu'après une visite sur place et l'approbation faite ici.",
  "admin.tabPending": "À valider",
  "admin.tabApproved": "Validées",
  "admin.tabRejected": "Rejetées",
  "admin.nothingHere": "Rien ici : {tab}.",
  "admin.registeredOn": "Enregistrée le {date}",
  "admin.reason": "Motif",
  "admin.visitLabel": "Visite",
  "admin.validatedOn": "Validée le {date}",
  "admin.validatedBy": " par {name}",
  "admin.visitChecklist":
    "vérifiez sur place le nom, l'adresse, le téléphone et les coordonnées. Si quelque chose est incorrect, demandez au pharmacien de le corriger dans le tableau de bord.",
  "admin.validatePharmacy": "Valider la pharmacie",
  "admin.rejectionReasonPlaceholder": "Motif du rejet",
  "admin.reject": "Rejeter",
  "admin.backToPending": "Revenir à « à valider »",

  "admin.pharmaciesTitle": "Pharmacies",
  "admin.pharmaciesSubtitle": "{count} pharmacies enregistrées",
  "admin.filterAll": "Toutes",
  "admin.filterNormal": "Normales",
  "admin.filterGuard": "Garde",
  "admin.noPharmaciesFound": "Aucune pharmacie trouvée.",
  "admin.noCoordinatesBadge": "Sans coordonnées",
  "admin.viewStock": "Voir le stock",
  "admin.deactivate": "Désactiver",
  "admin.reactivate": "Réactiver",

  "admin.usersTitle": "Utilisateurs",
  "admin.usersSubtitle": "{count} utilisateurs enregistrés",
  "admin.thProfile": "Profil",
  "admin.thPharmacies": "Pharmacies",
  "admin.thRegisteredAt": "Enregistré le",
  "admin.roleAdmin": "Admin",
  "admin.roleInspecao": "Inspection",
  "admin.roleOwner": "Propriétaire",

  "admin.accountTitle": "Compte",
  "admin.accountSubtitle": "Gérer le profil et les utilisateurs",
  "admin.myProfile": "Mon profil",
  "admin.createUserTitle": "Créer un utilisateur",
  "admin.fullName": "Nom complet *",
  "admin.roleLabel": "Profil *",
  "admin.password": "Mot de passe *",
  "admin.passwordHint": "8 caractères minimum",
  "admin.createUser": "Créer l'utilisateur",
  "admin.allUsers": "Tous les utilisateurs ({count})",
  "admin.cannotDeleteOwn": "Vous ne pouvez pas supprimer votre compte",
  "admin.hasPharmacies": "Possède des pharmacies associées",

  "admin.stockTitle": "Inventaire / pharmacy_stocks",
  "admin.stockSubtitle": "{entries} entrées · {units} unités au total",
  "admin.stockUrgentWarning":
    "Attention : des médicaments expirent dans moins de 30 jours.",
  "admin.stockPerPharmacy": "{count} articles · {units} unités",
  "admin.allStockEntries": "Toutes les entrées de stock",
  "admin.stockFor": "Stock — {name}",
  "admin.noStockFound": "Aucun stock trouvé.",
  "admin.expired": "Expiré",
  "admin.ok": "OK",

  "admin.medsTitle": "Médicaments",
  "admin.medsSubtitle": "{count} médicaments au catalogue",
  "admin.imageUpload": "Image (téléversement)",
  "admin.imageUrl": "URL de l'image",
  "admin.pharmaciesWithMed": {
    one: "{count} pharmacie",
    other: "{count} pharmacies",
  },
  "admin.noMedicationsInCatalog": "Aucun médicament au catalogue.",

  "admin.analysesTitle": "Analyses",
  "admin.analysesSubtitle": "Synthèse financière et opérationnelle",
  "admin.totalExpenses": "Total des dépenses",
  "admin.unitsInStock": "Unités en stock",
  "admin.expiring90": "Expirant (90 j)",
  "admin.activePharmacies": "Pharmacies actives",
  "admin.expensesByMonth": "Dépenses par mois",
  "admin.noExpiringSoon": "Aucun stock n'expire bientôt.",
  "admin.expiringSoonTitle": "Stock expiring (90 prochains jours)",
  "admin.thDays": "Jours",
  "admin.pharmacyStockOwner": "Pharmacies — Stock et propriétaire",
  "admin.thEmail": "E-mail",
  "admin.thProducts": "Produits en stock",

  "admin.expensesTitle": "Dépenses",
  "admin.messages": "Messages",
  "admin.messagesSubtitle": "Demandes envoyées via le formulaire du site.",
  "admin.messagesEmpty": "Vous n'avez encore reçu aucun message.",
  "admin.messagesNew": {
    one: "{count} message non lu.",
    other: "{count} messages non lus.",
  },
  "admin.expensesSubtitle": "{count} enregistrements",
  "admin.percentOfTotal": "{percent} % du total",
  "admin.grandTotal": "Total général",

  "insp.dashboardTitle": "Tableau de bord de l'inspection",
  "insp.dashboardSubtitle": "Statistiques générales des pharmacies.",
  "insp.approved": "Pharmacies approuvées",
  "insp.onDuty": "De garde",
  "insp.pending": "En attente",
  "insp.pharmaciesTitle": "Gestion des pharmacies",
  "insp.pharmaciesSubtitle": "Toutes les pharmacies enregistrées dans le système.",
  "insp.thActive": "Active",
  "insp.approvedBadge": "Approuvée",
  "insp.pendingBadge": "En attente",
  "insp.rejectedBadge": "Rejetée",
  "insp.normalBadge": "Normale",
  "insp.guardsTitle": "Gestion des gardes",
  "insp.guardsSubtitle":
    "Sélectionnez les pharmacies de garde. La pharmacie reçoit une notification avec la décision.",
  "insp.onDutyBadge": "De garde",
  "insp.removeFromDuty": "Retirer de la garde",
  "insp.escalateToDuty": "Mettre en garde",
  "insp.notificationsTitle": "Gestion des notifications",
  "insp.notificationsSubtitle": "Historique des notifications envoyées aux pharmacies.",
  "insp.noNotifications": "Aucune notification pour le moment.",
  "insp.dutyOnMessage":
    "L'Inspection pharmaceutique a placé votre pharmacie en garde. Consultez vos horaires de garde sur le site.",
  "insp.dutyOffMessage":
    "L'Inspection pharmaceutique a retiré votre pharmacie de la liste des gardes.",
};

export const dictionaries: Record<Locale, Record<TKey, Entry>> = { pt, en, fr };

// ---------------------------------------------------------------------------
// Tradução
// ---------------------------------------------------------------------------

export type Translator = (key: TKey, values?: TranslateValues) => string;

export function createTranslator(locale: Locale): Translator {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const fallback = dictionaries[DEFAULT_LOCALE];

  return (key, values) => {
    const entry = dict[key] ?? fallback[key];
    const count =
      typeof values?.count === "number"
        ? values.count
        : typeof values?.n === "number"
          ? values.n
          : null;

    const template = count === null ? entry : selectEntry(locale, entry, count);
    return interpolate(typeof template === "string" ? template : template.other, values);
  };
}

export function getDictionary(locale: Locale): Record<TKey, Entry> {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

// ---------------------------------------------------------------------------
// Formatação localizada
// ---------------------------------------------------------------------------

function metaFor(locale: Locale): LocaleMeta {
  return LOCALES.find((item) => item.value === locale) ?? LOCALES[0];
}

export function formatDate(
  locale: Locale,
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(metaFor(locale).intl, options).format(value);
}

export function formatDateTime(
  locale: Locale,
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(metaFor(locale).intl, options).format(value);
}

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(metaFor(locale).intl, options).format(value);
}

export function formatCurrency(locale: Locale, value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(metaFor(locale).intl, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Compara nomes de farmácias/medicamentos segundo as regras do idioma activo. */
export function compareNames(locale: Locale, a: string, b: string): number {
  return a.localeCompare(b, metaFor(locale).intl);
}

// ---------------------------------------------------------------------------
// Leitura no browser
// ---------------------------------------------------------------------------

/**
 * Grava o cookie de idioma.
 *
 * Usado pelo selector de língua. Os Client Components não lêem o cookie
 * durante o render (ver <I18nProvider>): o idioma vem sempre do servidor para
 * o HTML e a hidratação coincidirem.
 */
export function persistLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_MAX_AGE}; samesite=lax`;
}