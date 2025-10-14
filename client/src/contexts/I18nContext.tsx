import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Enhanced i18n system with comprehensive translations and easy management

type I18nContextValue = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLocales: Array<{ code: string; name: string; flag: string }>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = "i18n"; // stores { locale }

// Available locales with flags and native names
export const AVAILABLE_LOCALES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "en-gb", name: "English (UK)", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

// Comprehensive translations dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.clear": "Clear",
    "common.yes": "Yes",
    "common.no": "No",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.done": "Done",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.overview": "Overview",
    "nav.crawl": "Crawl",
    "nav.documents": "Documents",
    "nav.analytics": "Analytics",
    "nav.feedback": "Feedback",
    "nav.integrations": "Integrations",
    "nav.settings": "Settings",
    "nav.rag-tuning": "RAG Tuning",
    
    // Overview
    "overview.description": "Monitor your RAG system performance and user engagement",
    
    // RAG Tuning
    "rag-tuning.title": "RAG Tuning Playground",
    "rag-tuning.description": "Test and optimize your retrieval-augmented generation settings",
    
    // Integrations
    "integrations.description": "Manage your AI chat and search integrations across environments",
    
    // Feedback
    "feedback.title": "Feedback Moderation",
    "feedback.description": "Review and analyze user feedback on AI responses",
    
    // Settings
    "settings.title": "Settings",
    "settings.description": "Manage your organization settings and preferences",
    "settings.profile": "Profile & Branding",
    "settings.data-retention": "Data Retention",
    "settings.i18n": "Internationalization",
    "settings.citation-formatting": "Citation Formatting",
    "settings.api-keys": "API Keys",
    "settings.system-health": "System Health",
    
    // I18n Settings
    "settings.i18n.title": "Internationalization",
    "settings.i18n.defaultLanguage": "Default Language",
    "settings.i18n.save": "Save Language",
    "settings.i18n.description": "Default language for the admin interface and AI responses",
    
    // API Keys
    "api-keys.title": "API Keys",
    "api-keys.create": "Create API Key",
    "api-keys.name": "Name",
    "api-keys.key": "Key",
    "api-keys.created": "Created",
    "api-keys.lastUsed": "Last Used",
    "api-keys.requests": "Requests",
    "api-keys.rateLimit": "Rate Limit",
    "api-keys.actions": "Actions",
    "api-keys.revoke": "Revoke",
    "api-keys.copy": "Copy",
    "api-keys.show": "Show",
    "api-keys.hide": "Hide",
    
    // Documents
    "documents.title": "Documents",
    "documents.description": "Manage your indexed documents and content",
    "documents.upload": "Upload Document",
    "documents.search": "Search documents...",
    "documents.total": "Total Documents",
    "documents.newThisWeek": "New This Week",
    "documents.totalSize": "Total Size",
    "documents.avgChunks": "Avg Chunks",
    
    // Crawl
    "crawl.title": "Crawl Management",
    "crawl.description": "Configure and monitor website crawling sources",
    "crawl.addSource": "Add Source",
    "crawl.sources": "Sources",
    "crawl.jobs": "Jobs",
    "crawl.start": "Start Crawl",
    "crawl.stop": "Stop Crawl",
    
    // Analytics
    "analytics.title": "Analytics",
    "analytics.description": "Track performance metrics and user engagement",
    "analytics.queries": "Queries",
    "analytics.latency": "Latency",
    "analytics.satisfaction": "Satisfaction",
    "analytics.sources": "Sources",
    
    // Theme
    "theme.toggle": "Toggle theme",
    "theme.light": "Light mode",
    "theme.dark": "Dark mode",
  },
  
  "en-gb": {
    // British English variants
    "settings.i18n.title": "Internationalisation",
    "settings.i18n.defaultLanguage": "Default Language",
    "settings.i18n.save": "Save Language",
    "settings.i18n.description": "Default language for the admin interface and AI responses",
  },
  
  es: {
    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.create": "Crear",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.clear": "Limpiar",
    "common.yes": "Sí",
    "common.no": "No",
    "common.close": "Cerrar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.done": "Hecho",
    
    // Navigation
    "nav.dashboard": "Panel de Control",
    "nav.overview": "Resumen",
    "nav.crawl": "Rastreo",
    "nav.documents": "Documentos",
    "nav.analytics": "Analíticas",
    "nav.feedback": "Comentarios",
    "nav.integrations": "Integraciones",
    "nav.settings": "Configuración",
    "nav.rag-tuning": "Ajuste RAG",
    
    // Overview
    "overview.description": "Monitorea el rendimiento de tu sistema RAG y el compromiso del usuario",
    
    // RAG Tuning
    "rag-tuning.title": "Playground de Ajuste RAG",
    "rag-tuning.description": "Prueba y optimiza la configuración de generación aumentada por recuperación",
    
    // Integrations
    "integrations.description": "Gestiona tus integraciones de chat y búsqueda de IA en todos los entornos",
    
    // Feedback
    "feedback.title": "Moderación de Comentarios",
    "feedback.description": "Revisa y analiza los comentarios de los usuarios sobre las respuestas de IA",
    
    // Settings
    "settings.title": "Configuración",
    "settings.description": "Gestiona la configuración y preferencias de tu organización",
    "settings.profile": "Perfil y Marca",
    "settings.data-retention": "Retención de Datos",
    "settings.i18n": "Internacionalización",
    "settings.citation-formatting": "Formato de Citas",
    "settings.api-keys": "Claves API",
    "settings.system-health": "Salud del Sistema",
    
    // I18n Settings
    "settings.i18n.title": "Internacionalización",
    "settings.i18n.defaultLanguage": "Idioma predeterminado",
    "settings.i18n.save": "Guardar idioma",
    "settings.i18n.description": "Idioma predeterminado para la interfaz de administración y respuestas de IA",
    
    // API Keys
    "api-keys.title": "Claves API",
    "api-keys.create": "Crear Clave API",
    "api-keys.name": "Nombre",
    "api-keys.key": "Clave",
    "api-keys.created": "Creado",
    "api-keys.lastUsed": "Último Uso",
    "api-keys.requests": "Solicitudes",
    "api-keys.rateLimit": "Límite de Velocidad",
    "api-keys.actions": "Acciones",
    "api-keys.revoke": "Revocar",
    "api-keys.copy": "Copiar",
    "api-keys.show": "Mostrar",
    "api-keys.hide": "Ocultar",
    
    // Documents
    "documents.title": "Documentos",
    "documents.description": "Gestiona tus documentos indexados y contenido",
    "documents.upload": "Subir Documento",
    "documents.search": "Buscar documentos...",
    "documents.total": "Total de Documentos",
    "documents.newThisWeek": "Nuevos Esta Semana",
    "documents.totalSize": "Tamaño Total",
    "documents.avgChunks": "Fragmentos Promedio",
    
    // Crawl
    "crawl.title": "Gestión de Rastreo",
    "crawl.description": "Configura y monitorea fuentes de rastreo de sitios web",
    "crawl.addSource": "Agregar Fuente",
    "crawl.sources": "Fuentes",
    "crawl.jobs": "Trabajos",
    "crawl.start": "Iniciar Rastreo",
    "crawl.stop": "Detener Rastreo",
    
    // Analytics
    "analytics.title": "Analíticas",
    "analytics.description": "Rastrea métricas de rendimiento y compromiso del usuario",
    "analytics.queries": "Consultas",
    "analytics.latency": "Latencia",
    "analytics.satisfaction": "Satisfacción",
    "analytics.sources": "Fuentes",
    
    // Theme
    "theme.toggle": "Cambiar tema",
    "theme.light": "Modo claro",
    "theme.dark": "Modo oscuro",
  },
  
  fr: {
    // Common
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.create": "Créer",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.clear": "Effacer",
    "common.yes": "Oui",
    "common.no": "Non",
    "common.close": "Fermer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.done": "Terminé",
    
    // Navigation
    "nav.dashboard": "Tableau de Bord",
    "nav.overview": "Aperçu",
    "nav.crawl": "Exploration",
    "nav.documents": "Documents",
    "nav.analytics": "Analytiques",
    "nav.feedback": "Commentaires",
    "nav.integrations": "Intégrations",
    "nav.settings": "Paramètres",
    "nav.rag-tuning": "Réglage RAG",
    
    // Overview
    "overview.description": "Surveillez les performances de votre système RAG et l'engagement des utilisateurs",
    
    // RAG Tuning
    "rag-tuning.title": "Playground de Réglage RAG",
    "rag-tuning.description": "Testez et optimisez vos paramètres de génération augmentée par récupération",
    
    // Integrations
    "integrations.description": "Gérez vos intégrations de chat et de recherche IA dans tous les environnements",
    
    // Feedback
    "feedback.title": "Modération des Commentaires",
    "feedback.description": "Examinez et analysez les commentaires des utilisateurs sur les réponses IA",
    
    // Settings
    "settings.title": "Paramètres",
    "settings.profile": "Profil et Marque",
    "settings.data-retention": "Rétention des Données",
    "settings.i18n": "Internationalisation",
    "settings.citation-formatting": "Format des Citations",
    "settings.api-keys": "Clés API",
    "settings.system-health": "Santé du Système",
    
    // I18n Settings
    "settings.i18n.title": "Internationalisation",
    "settings.i18n.defaultLanguage": "Langue par défaut",
    "settings.i18n.save": "Enregistrer la langue",
    "settings.i18n.description": "Langue par défaut pour l'interface d'administration et les réponses IA",
    
    // API Keys
    "api-keys.title": "Clés API",
    "api-keys.create": "Créer une Clé API",
    "api-keys.name": "Nom",
    "api-keys.key": "Clé",
    "api-keys.created": "Créé",
    "api-keys.lastUsed": "Dernière Utilisation",
    "api-keys.requests": "Requêtes",
    "api-keys.rateLimit": "Limite de Taux",
    "api-keys.actions": "Actions",
    "api-keys.revoke": "Révoquer",
    "api-keys.copy": "Copier",
    "api-keys.show": "Afficher",
    "api-keys.hide": "Masquer",
    
    // Documents
    "documents.title": "Documents",
    "documents.description": "Gérez vos documents indexés et contenu",
    "documents.upload": "Télécharger un Document",
    "documents.search": "Rechercher des documents...",
    "documents.total": "Total des Documents",
    "documents.newThisWeek": "Nouveaux Cette Semaine",
    "documents.totalSize": "Taille Totale",
    "documents.avgChunks": "Fragments Moyens",
    
    // Crawl
    "crawl.title": "Gestion d'Exploration",
    "crawl.description": "Configurez et surveillez les sources d'exploration de sites web",
    "crawl.addSource": "Ajouter une Source",
    "crawl.sources": "Sources",
    "crawl.jobs": "Tâches",
    "crawl.start": "Démarrer l'Exploration",
    "crawl.stop": "Arrêter l'Exploration",
    
    // Analytics
    "analytics.title": "Analytiques",
    "analytics.description": "Suivez les métriques de performance et l'engagement des utilisateurs",
    "analytics.queries": "Requêtes",
    "analytics.latency": "Latence",
    "analytics.satisfaction": "Satisfaction",
    "analytics.sources": "Sources",
    
    // Theme
    "theme.toggle": "Basculer le thème",
    "theme.light": "Mode clair",
    "theme.dark": "Mode sombre",
  },
  
  de: {
    // Common
    "common.loading": "Laden...",
    "common.error": "Fehler",
    "common.success": "Erfolg",
    "common.cancel": "Abbrechen",
    "common.save": "Speichern",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.create": "Erstellen",
    "common.search": "Suchen",
    "common.filter": "Filtern",
    "common.clear": "Löschen",
    "common.yes": "Ja",
    "common.no": "Nein",
    "common.close": "Schließen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.previous": "Vorherige",
    "common.done": "Fertig",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.overview": "Übersicht",
    "nav.crawl": "Crawling",
    "nav.documents": "Dokumente",
    "nav.analytics": "Analytik",
    "nav.feedback": "Feedback",
    "nav.integrations": "Integrationen",
    "nav.settings": "Einstellungen",
    "nav.rag-tuning": "RAG-Anpassung",
    
    // Overview
    "overview.description": "Überwachen Sie die Leistung Ihres RAG-Systems und das Nutzerengagement",
    
    // RAG Tuning
    "rag-tuning.title": "RAG-Anpassung Spielplatz",
    "rag-tuning.description": "Testen und optimieren Sie Ihre Retrieval-Augmented Generation Einstellungen",
    
    // Integrations
    "integrations.description": "Verwalten Sie Ihre KI-Chat- und Suchintegrationen in allen Umgebungen",
    
    // Feedback
    "feedback.title": "Feedback-Moderation",
    "feedback.description": "Überprüfen und analysieren Sie Benutzerfeedback zu KI-Antworten",
    
    // Settings
    "settings.title": "Einstellungen",
    "settings.profile": "Profil & Marke",
    "settings.data-retention": "Datenaufbewahrung",
    "settings.i18n": "Internationalisierung",
    "settings.citation-formatting": "Zitierformat",
    "settings.api-keys": "API-Schlüssel",
    "settings.system-health": "Systemgesundheit",
    
    // I18n Settings
    "settings.i18n.title": "Internationalisierung",
    "settings.i18n.defaultLanguage": "Standardsprache",
    "settings.i18n.save": "Sprache speichern",
    "settings.i18n.description": "Standardsprache für die Admin-Oberfläche und KI-Antworten",
    
    // API Keys
    "api-keys.title": "API-Schlüssel",
    "api-keys.create": "API-Schlüssel erstellen",
    "api-keys.name": "Name",
    "api-keys.key": "Schlüssel",
    "api-keys.created": "Erstellt",
    "api-keys.lastUsed": "Zuletzt verwendet",
    "api-keys.requests": "Anfragen",
    "api-keys.rateLimit": "Ratenbegrenzung",
    "api-keys.actions": "Aktionen",
    "api-keys.revoke": "Widerrufen",
    "api-keys.copy": "Kopieren",
    "api-keys.show": "Anzeigen",
    "api-keys.hide": "Ausblenden",
    
    // Documents
    "documents.title": "Dokumente",
    "documents.description": "Verwalten Sie Ihre indizierten Dokumente und Inhalte",
    "documents.upload": "Dokument hochladen",
    "documents.search": "Dokumente suchen...",
    "documents.total": "Gesamte Dokumente",
    "documents.newThisWeek": "Neu diese Woche",
    "documents.totalSize": "Gesamtgröße",
    "documents.avgChunks": "Durchschn. Chunks",
    
    // Crawl
    "crawl.title": "Crawl-Verwaltung",
    "crawl.description": "Konfigurieren und überwachen Sie Website-Crawling-Quellen",
    "crawl.addSource": "Quelle hinzufügen",
    "crawl.sources": "Quellen",
    "crawl.jobs": "Jobs",
    "crawl.start": "Crawl starten",
    "crawl.stop": "Crawl stoppen",
    
    // Analytics
    "analytics.title": "Analytik",
    "analytics.description": "Verfolgen Sie Leistungsmetriken und Benutzerengagement",
    "analytics.queries": "Anfragen",
    "analytics.latency": "Latenz",
    "analytics.satisfaction": "Zufriedenheit",
    "analytics.sources": "Quellen",
    
    // Theme
    "theme.toggle": "Theme umschalten",
    "theme.light": "Heller Modus",
    "theme.dark": "Dunkler Modus",
  },
  
  ja: {
    // Common
    "common.loading": "読み込み中...",
    "common.error": "エラー",
    "common.success": "成功",
    "common.cancel": "キャンセル",
    "common.save": "保存",
    "common.delete": "削除",
    "common.edit": "編集",
    "common.create": "作成",
    "common.search": "検索",
    "common.filter": "フィルター",
    "common.clear": "クリア",
    "common.yes": "はい",
    "common.no": "いいえ",
    "common.close": "閉じる",
    "common.back": "戻る",
    "common.next": "次へ",
    "common.previous": "前へ",
    "common.done": "完了",
    
    // Navigation
    "nav.dashboard": "ダッシュボード",
    "nav.overview": "概要",
    "nav.crawl": "クロール",
    "nav.documents": "ドキュメント",
    "nav.analytics": "分析",
    "nav.feedback": "フィードバック",
    "nav.integrations": "統合",
    "nav.settings": "設定",
    "nav.rag-tuning": "RAG調整",
    
    // Overview
    "overview.description": "RAGシステムのパフォーマンスとユーザーエンゲージメントを監視",
    
    // RAG Tuning
    "rag-tuning.title": "RAG調整プレイグラウンド",
    "rag-tuning.description": "検索拡張生成の設定をテスト・最適化",
    
    // Integrations
    "integrations.description": "すべての環境でAIチャット・検索統合を管理",
    
    // Feedback
    "feedback.title": "フィードバック管理",
    "feedback.description": "AI回答に対するユーザーフィードバックを確認・分析",
    
    // Settings
    "settings.title": "設定",
    "settings.profile": "プロフィールとブランディング",
    "settings.data-retention": "データ保持",
    "settings.i18n": "国際化",
    "settings.citation-formatting": "引用フォーマット",
    "settings.api-keys": "APIキー",
    "settings.system-health": "システムヘルス",
    
    // I18n Settings
    "settings.i18n.title": "国際化",
    "settings.i18n.defaultLanguage": "既定の言語",
    "settings.i18n.save": "言語を保存",
    "settings.i18n.description": "管理インターフェースとAI応答の既定の言語",
    
    // API Keys
    "api-keys.title": "APIキー",
    "api-keys.create": "APIキーを作成",
    "api-keys.name": "名前",
    "api-keys.key": "キー",
    "api-keys.created": "作成日",
    "api-keys.lastUsed": "最終使用",
    "api-keys.requests": "リクエスト",
    "api-keys.rateLimit": "レート制限",
    "api-keys.actions": "アクション",
    "api-keys.revoke": "取り消し",
    "api-keys.copy": "コピー",
    "api-keys.show": "表示",
    "api-keys.hide": "非表示",
    
    // Documents
    "documents.title": "ドキュメント",
    "documents.description": "インデックス化されたドキュメントとコンテンツを管理",
    "documents.upload": "ドキュメントをアップロード",
    "documents.search": "ドキュメントを検索...",
    "documents.total": "総ドキュメント数",
    "documents.newThisWeek": "今週の新規",
    "documents.totalSize": "総サイズ",
    "documents.avgChunks": "平均チャンク",
    
    // Crawl
    "crawl.title": "クロール管理",
    "crawl.description": "ウェブサイトクローリングソースを設定・監視",
    "crawl.addSource": "ソースを追加",
    "crawl.sources": "ソース",
    "crawl.jobs": "ジョブ",
    "crawl.start": "クロール開始",
    "crawl.stop": "クロール停止",
    
    // Analytics
    "analytics.title": "分析",
    "analytics.description": "パフォーマンス指標とユーザーエンゲージメントを追跡",
    "analytics.queries": "クエリ",
    "analytics.latency": "レイテンシ",
    "analytics.satisfaction": "満足度",
    "analytics.sources": "ソース",
    
    // Theme
    "theme.toggle": "テーマ切り替え",
    "theme.light": "ライトモード",
    "theme.dark": "ダークモード",
  },
  
  zh: {
    // Common
    "common.loading": "加载中...",
    "common.error": "错误",
    "common.success": "成功",
    "common.cancel": "取消",
    "common.save": "保存",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.create": "创建",
    "common.search": "搜索",
    "common.filter": "过滤",
    "common.clear": "清除",
    "common.yes": "是",
    "common.no": "否",
    "common.close": "关闭",
    "common.back": "返回",
    "common.next": "下一步",
    "common.previous": "上一步",
    "common.done": "完成",
    
    // Navigation
    "nav.dashboard": "仪表板",
    "nav.overview": "概览",
    "nav.crawl": "爬取",
    "nav.documents": "文档",
    "nav.analytics": "分析",
    "nav.feedback": "反馈",
    "nav.integrations": "集成",
    "nav.settings": "设置",
    "nav.rag-tuning": "RAG调优",
    
    // Overview
    "overview.description": "监控RAG系统性能和用户参与度",
    
    // RAG Tuning
    "rag-tuning.title": "RAG调优游乐场",
    "rag-tuning.description": "测试和优化检索增强生成设置",
    
    // Integrations
    "integrations.description": "管理所有环境中的AI聊天和搜索集成",
    
    // Feedback
    "feedback.title": "反馈管理",
    "feedback.description": "审查和分析用户对AI回复的反馈",
    
    // Settings
    "settings.title": "设置",
    "settings.profile": "个人资料和品牌",
    "settings.data-retention": "数据保留",
    "settings.i18n": "国际化",
    "settings.citation-formatting": "引用格式",
    "settings.api-keys": "API密钥",
    "settings.system-health": "系统健康",
    
    // I18n Settings
    "settings.i18n.title": "国际化",
    "settings.i18n.defaultLanguage": "默认语言",
    "settings.i18n.save": "保存语言",
    "settings.i18n.description": "管理界面和AI响应的默认语言",
    
    // API Keys
    "api-keys.title": "API密钥",
    "api-keys.create": "创建API密钥",
    "api-keys.name": "名称",
    "api-keys.key": "密钥",
    "api-keys.created": "创建时间",
    "api-keys.lastUsed": "最后使用",
    "api-keys.requests": "请求数",
    "api-keys.rateLimit": "速率限制",
    "api-keys.actions": "操作",
    "api-keys.revoke": "撤销",
    "api-keys.copy": "复制",
    "api-keys.show": "显示",
    "api-keys.hide": "隐藏",
    
    // Documents
    "documents.title": "文档",
    "documents.description": "管理您的索引文档和内容",
    "documents.upload": "上传文档",
    "documents.search": "搜索文档...",
    "documents.total": "总文档数",
    "documents.newThisWeek": "本周新增",
    "documents.totalSize": "总大小",
    "documents.avgChunks": "平均分块",
    
    // Crawl
    "crawl.title": "爬取管理",
    "crawl.description": "配置和监控网站爬取源",
    "crawl.addSource": "添加源",
    "crawl.sources": "源",
    "crawl.jobs": "任务",
    "crawl.start": "开始爬取",
    "crawl.stop": "停止爬取",
    
    // Analytics
    "analytics.title": "分析",
    "analytics.description": "跟踪性能指标和用户参与度",
    "analytics.queries": "查询",
    "analytics.latency": "延迟",
    "analytics.satisfaction": "满意度",
    "analytics.sources": "源",
    
    // Theme
    "theme.toggle": "切换主题",
    "theme.light": "浅色模式",
    "theme.dark": "深色模式",
  },
  
  pt: {
    // Common
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "common.cancel": "Cancelar",
    "common.save": "Salvar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.create": "Criar",
    "common.search": "Pesquisar",
    "common.filter": "Filtrar",
    "common.clear": "Limpar",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.close": "Fechar",
    "common.back": "Voltar",
    "common.next": "Próximo",
    "common.previous": "Anterior",
    "common.done": "Concluído",
    
    // Navigation
    "nav.dashboard": "Painel",
    "nav.overview": "Visão Geral",
    "nav.crawl": "Rastreamento",
    "nav.documents": "Documentos",
    "nav.analytics": "Análises",
    "nav.feedback": "Comentários",
    "nav.integrations": "Integrações",
    "nav.settings": "Configurações",
    "nav.rag-tuning": "Ajuste RAG",
    
    // Overview
    "overview.description": "Monitore o desempenho do seu sistema RAG e o engajamento do usuário",
    
    // RAG Tuning
    "rag-tuning.title": "Playground de Ajuste RAG",
    "rag-tuning.description": "Teste e otimize as configurações de geração aumentada por recuperação",
    
    // Integrations
    "integrations.description": "Gerencie suas integrações de chat e pesquisa de IA em todos os ambientes",
    
    // Feedback
    "feedback.title": "Moderação de Feedback",
    "feedback.description": "Revise e analise o feedback dos usuários sobre as respostas de IA",
    
    // Settings
    "settings.title": "Configurações",
    "settings.description": "Gerencie as configurações e preferências da sua organização",
    "settings.profile": "Perfil e Marca",
    "settings.data-retention": "Retenção de Dados",
    "settings.i18n": "Internacionalização",
    "settings.citation-formatting": "Formatação de Citações",
    "settings.api-keys": "Chaves API",
    "settings.system-health": "Saúde do Sistema",
    
    // I18n Settings
    "settings.i18n.title": "Internacionalização",
    "settings.i18n.defaultLanguage": "Idioma Padrão",
    "settings.i18n.save": "Salvar Idioma",
    "settings.i18n.description": "Idioma padrão para a interface de administração e respostas de IA",
    
    // API Keys
    "api-keys.title": "Chaves API",
    "api-keys.create": "Criar Chave API",
    "api-keys.name": "Nome",
    "api-keys.key": "Chave",
    "api-keys.created": "Criado",
    "api-keys.lastUsed": "Último Uso",
    "api-keys.requests": "Solicitações",
    "api-keys.rateLimit": "Limite de Taxa",
    "api-keys.actions": "Ações",
    "api-keys.revoke": "Revogar",
    "api-keys.copy": "Copiar",
    "api-keys.show": "Mostrar",
    "api-keys.hide": "Ocultar",
    
    // Documents
    "documents.title": "Documentos",
    "documents.description": "Gerencie seus documentos indexados e conteúdo",
    "documents.upload": "Carregar Documento",
    "documents.search": "Pesquisar documentos...",
    "documents.total": "Total de Documentos",
    "documents.newThisWeek": "Novos Esta Semana",
    "documents.totalSize": "Tamanho Total",
    "documents.avgChunks": "Fragmentos Médios",
    
    // Crawl
    "crawl.title": "Gerenciamento de Rastreamento",
    "crawl.description": "Configure e monitore fontes de rastreamento de sites",
    "crawl.addSource": "Adicionar Fonte",
    "crawl.sources": "Fontes",
    "crawl.jobs": "Trabalhos",
    "crawl.start": "Iniciar Rastreamento",
    "crawl.stop": "Parar Rastreamento",
    
    // Analytics
    "analytics.title": "Análises",
    "analytics.description": "Acompanhe métricas de desempenho e engajamento do usuário",
    "analytics.queries": "Consultas",
    "analytics.latency": "Latência",
    "analytics.satisfaction": "Satisfação",
    "analytics.sources": "Fontes",
    
    // Theme
    "theme.toggle": "Alternar tema",
    "theme.light": "Modo claro",
    "theme.dark": "Modo escuro",
  },
  
  it: {
    // Common
    "common.loading": "Caricamento...",
    "common.error": "Errore",
    "common.success": "Successo",
    "common.cancel": "Annulla",
    "common.save": "Salva",
    "common.delete": "Elimina",
    "common.edit": "Modifica",
    "common.create": "Crea",
    "common.search": "Cerca",
    "common.filter": "Filtra",
    "common.clear": "Cancella",
    "common.yes": "Sì",
    "common.no": "No",
    "common.close": "Chiudi",
    "common.back": "Indietro",
    "common.next": "Avanti",
    "common.previous": "Precedente",
    "common.done": "Fatto",
    
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.overview": "Panoramica",
    "nav.crawl": "Scansione",
    "nav.documents": "Documenti",
    "nav.analytics": "Analisi",
    "nav.feedback": "Feedback",
    "nav.integrations": "Integrazioni",
    "nav.settings": "Impostazioni",
    "nav.rag-tuning": "Regolazione RAG",
    
    // Overview
    "overview.description": "Monitora le prestazioni del tuo sistema RAG e l'engagement degli utenti",
    
    // RAG Tuning
    "rag-tuning.title": "Playground di Regolazione RAG",
    "rag-tuning.description": "Testa e ottimizza le impostazioni di generazione aumentata per recupero",
    
    // Integrations
    "integrations.description": "Gestisci le tue integrazioni di chat e ricerca IA in tutti gli ambienti",
    
    // Feedback
    "feedback.title": "Moderazione Feedback",
    "feedback.description": "Rivedi e analizza il feedback degli utenti sulle risposte IA",
    
    // Settings
    "settings.title": "Impostazioni",
    "settings.description": "Gestisci le impostazioni e le preferenze della tua organizzazione",
    "settings.profile": "Profilo e Brand",
    "settings.data-retention": "Conservazione Dati",
    "settings.i18n": "Internazionalizzazione",
    "settings.citation-formatting": "Formattazione Citazioni",
    "settings.api-keys": "Chiavi API",
    "settings.system-health": "Salute del Sistema",
    
    // I18n Settings
    "settings.i18n.title": "Internazionalizzazione",
    "settings.i18n.defaultLanguage": "Lingua Predefinita",
    "settings.i18n.save": "Salva Lingua",
    "settings.i18n.description": "Lingua predefinita per l'interfaccia di amministrazione e le risposte AI",
    
    // API Keys
    "api-keys.title": "Chiavi API",
    "api-keys.create": "Crea Chiave API",
    "api-keys.name": "Nome",
    "api-keys.key": "Chiave",
    "api-keys.created": "Creato",
    "api-keys.lastUsed": "Ultimo Utilizzo",
    "api-keys.requests": "Richieste",
    "api-keys.rateLimit": "Limite di Velocità",
    "api-keys.actions": "Azioni",
    "api-keys.revoke": "Revoca",
    "api-keys.copy": "Copia",
    "api-keys.show": "Mostra",
    "api-keys.hide": "Nascondi",
    
    // Documents
    "documents.title": "Documenti",
    "documents.description": "Gestisci i tuoi documenti indicizzati e contenuti",
    "documents.upload": "Carica Documento",
    "documents.search": "Cerca documenti...",
    "documents.total": "Totale Documenti",
    "documents.newThisWeek": "Nuovi Questa Settimana",
    "documents.totalSize": "Dimensione Totale",
    "documents.avgChunks": "Frammenti Medi",
    
    // Crawl
    "crawl.title": "Gestione Scansione",
    "crawl.description": "Configura e monitora le fonti di scansione dei siti web",
    "crawl.addSource": "Aggiungi Fonte",
    "crawl.sources": "Fonti",
    "crawl.jobs": "Lavori",
    "crawl.start": "Avvia Scansione",
    "crawl.stop": "Ferma Scansione",
    
    // Analytics
    "analytics.title": "Analisi",
    "analytics.description": "Traccia le metriche di performance e l'engagement degli utenti",
    "analytics.queries": "Query",
    "analytics.latency": "Latenza",
    "analytics.satisfaction": "Soddisfazione",
    "analytics.sources": "Fonti",
    
    // Theme
    "theme.toggle": "Cambia tema",
    "theme.light": "Modalità chiara",
    "theme.dark": "Modalità scura",
  },
  
  ru: {
    // Common
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успех",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.create": "Создать",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.clear": "Очистить",
    "common.yes": "Да",
    "common.no": "Нет",
    "common.close": "Закрыть",
    "common.back": "Назад",
    "common.next": "Далее",
    "common.previous": "Предыдущий",
    "common.done": "Готово",
    
    // Navigation
    "nav.dashboard": "Панель управления",
    "nav.overview": "Обзор",
    "nav.crawl": "Сканирование",
    "nav.documents": "Документы",
    "nav.analytics": "Аналитика",
    "nav.feedback": "Отзывы",
    "nav.integrations": "Интеграции",
    "nav.settings": "Настройки",
    "nav.rag-tuning": "Настройка RAG",
    
    // Overview
    "overview.description": "Отслеживайте производительность вашей RAG-системы и вовлеченность пользователей",
    
    // RAG Tuning
    "rag-tuning.title": "Песочница настройки RAG",
    "rag-tuning.description": "Тестируйте и оптимизируйте настройки генерации с дополнением поиском",
    
    // Integrations
    "integrations.description": "Управляйте интеграциями ИИ-чата и поиска во всех средах",
    
    // Feedback
    "feedback.title": "Модерация отзывов",
    "feedback.description": "Просматривайте и анализируйте отзывы пользователей об ответах ИИ",
    
    // Settings
    "settings.title": "Настройки",
    "settings.description": "Управляйте настройками и предпочтениями вашей организации",
    "settings.profile": "Профиль и Брендинг",
    "settings.data-retention": "Хранение Данных",
    "settings.i18n": "Интернационализация",
    "settings.citation-formatting": "Форматирование Цитат",
    "settings.api-keys": "API Ключи",
    "settings.system-health": "Здоровье Системы",
    
    // I18n Settings
    "settings.i18n.title": "Интернационализация",
    "settings.i18n.defaultLanguage": "Язык по умолчанию",
    "settings.i18n.save": "Сохранить язык",
    "settings.i18n.description": "Язык по умолчанию для интерфейса администратора и ответов ИИ",
    
    // API Keys
    "api-keys.title": "API Ключи",
    "api-keys.create": "Создать API Ключ",
    "api-keys.name": "Имя",
    "api-keys.key": "Ключ",
    "api-keys.created": "Создано",
    "api-keys.lastUsed": "Последнее использование",
    "api-keys.requests": "Запросы",
    "api-keys.rateLimit": "Лимит скорости",
    "api-keys.actions": "Действия",
    "api-keys.revoke": "Отозвать",
    "api-keys.copy": "Копировать",
    "api-keys.show": "Показать",
    "api-keys.hide": "Скрыть",
    
    // Documents
    "documents.title": "Документы",
    "documents.description": "Управляйте вашими индексированными документами и контентом",
    "documents.upload": "Загрузить документ",
    "documents.search": "Поиск документов...",
    "documents.total": "Всего документов",
    "documents.newThisWeek": "Новые на этой неделе",
    "documents.totalSize": "Общий размер",
    "documents.avgChunks": "Средние фрагменты",
    
    // Crawl
    "crawl.title": "Управление сканированием",
    "crawl.description": "Настройте и отслеживайте источники сканирования веб-сайтов",
    "crawl.addSource": "Добавить источник",
    "crawl.sources": "Источники",
    "crawl.jobs": "Задачи",
    "crawl.start": "Начать сканирование",
    "crawl.stop": "Остановить сканирование",
    
    // Analytics
    "analytics.title": "Аналитика",
    "analytics.description": "Отслеживайте показатели производительности и вовлеченности пользователей",
    "analytics.queries": "Запросы",
    "analytics.latency": "Задержка",
    "analytics.satisfaction": "Удовлетворенность",
    "analytics.sources": "Источники",
    
    // Theme
    "theme.toggle": "Переключить тему",
    "theme.light": "Светлый режим",
    "theme.dark": "Темный режим",
  },
  
  ar: {
    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.create": "إنشاء",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.clear": "مسح",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.close": "إغلاق",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.done": "تم",
    
    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.overview": "نظرة عامة",
    "nav.crawl": "الزحف",
    "nav.documents": "المستندات",
    "nav.analytics": "التحليلات",
    "nav.feedback": "التعليقات",
    "nav.integrations": "التكاملات",
    "nav.settings": "الإعدادات",
    "nav.rag-tuning": "ضبط RAG",
    
    // Overview
    "overview.description": "راقب أداء نظام RAG الخاص بك ومشاركة المستخدمين",
    
    // RAG Tuning
    "rag-tuning.title": "ملعب ضبط RAG",
    "rag-tuning.description": "اختبر وحسّن إعدادات الجيل المعزز بالاسترجاع",
    
    // Integrations
    "integrations.description": "إدارة تكاملات الدردشة والبحث بالذكاء الاصطناعي في جميع البيئات",
    
    // Feedback
    "feedback.title": "إدارة التعليقات",
    "feedback.description": "راجع وحلل تعليقات المستخدمين على استجابات الذكاء الاصطناعي",
    
    // Settings
    "settings.title": "الإعدادات",
    "settings.description": "إدارة إعدادات وتفضيلات مؤسستك",
    "settings.profile": "الملف الشخصي والعلامة التجارية",
    "settings.data-retention": "الاحتفاظ بالبيانات",
    "settings.i18n": "الترجمة",
    "settings.citation-formatting": "تنسيق الاقتباسات",
    "settings.api-keys": "مفاتيح API",
    "settings.system-health": "صحة النظام",
    
    // I18n Settings
    "settings.i18n.title": "الترجمة",
    "settings.i18n.defaultLanguage": "اللغة الافتراضية",
    "settings.i18n.save": "حفظ اللغة",
    "settings.i18n.description": "اللغة الافتراضية لواجهة الإدارة واستجابات الذكاء الاصطناعي",
    
    // API Keys
    "api-keys.title": "مفاتيح API",
    "api-keys.create": "إنشاء مفتاح API",
    "api-keys.name": "الاسم",
    "api-keys.key": "المفتاح",
    "api-keys.created": "تم الإنشاء",
    "api-keys.lastUsed": "آخر استخدام",
    "api-keys.requests": "الطلبات",
    "api-keys.rateLimit": "حد المعدل",
    "api-keys.actions": "الإجراءات",
    "api-keys.revoke": "إلغاء",
    "api-keys.copy": "نسخ",
    "api-keys.show": "إظهار",
    "api-keys.hide": "إخفاء",
    
    // Documents
    "documents.title": "المستندات",
    "documents.description": "إدارة المستندات المفهرسة والمحتوى الخاص بك",
    "documents.upload": "رفع مستند",
    "documents.search": "البحث في المستندات...",
    "documents.total": "إجمالي المستندات",
    "documents.newThisWeek": "جديد هذا الأسبوع",
    "documents.totalSize": "الحجم الإجمالي",
    "documents.avgChunks": "متوسط القطع",
    
    // Crawl
    "crawl.title": "إدارة الزحف",
    "crawl.description": "تكوين ومراقبة مصادر زحف المواقع الإلكترونية",
    "crawl.addSource": "إضافة مصدر",
    "crawl.sources": "المصادر",
    "crawl.jobs": "المهام",
    "crawl.start": "بدء الزحف",
    "crawl.stop": "إيقاف الزحف",
    
    // Analytics
    "analytics.title": "التحليلات",
    "analytics.description": "تتبع مقاييس الأداء ومشاركة المستخدمين",
    "analytics.queries": "الاستعلامات",
    "analytics.latency": "الزمن",
    "analytics.satisfaction": "الرضا",
    "analytics.sources": "المصادر",
    
    // Theme
    "theme.toggle": "تبديل المظهر",
    "theme.light": "الوضع الفاتح",
    "theme.dark": "الوضع الداكن",
  },
  
  hi: {
    // Common
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.create": "बनाएं",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर करें",
    "common.clear": "साफ़ करें",
    "common.yes": "हाँ",
    "common.no": "नहीं",
    "common.close": "बंद करें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.previous": "पिछला",
    "common.done": "पूर्ण",
    
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.overview": "अवलोकन",
    "nav.crawl": "क्रॉलिंग",
    "nav.documents": "दस्तावेज़",
    "nav.analytics": "विश्लेषण",
    "nav.feedback": "फीडबैक",
    "nav.integrations": "एकीकरण",
    "nav.settings": "सेटिंग्स",
    "nav.rag-tuning": "RAG ट्यूनिंग",
    
    // Overview
    "overview.description": "अपने RAG सिस्टम के प्रदर्शन और उपयोगकर्ता जुड़ाव की निगरानी करें",
    
    // RAG Tuning
    "rag-tuning.title": "RAG ट्यूनिंग प्लेग्राउंड",
    "rag-tuning.description": "अपनी पुनर्प्राप्ति-संवर्धित पीढ़ी सेटिंग्स का परीक्षण और अनुकूलन करें",
    
    // Integrations
    "integrations.description": "सभी वातावरणों में अपने AI चैट और खोज एकीकरण का प्रबंधन करें",
    
    // Feedback
    "feedback.title": "फीडबैक मॉडरेशन",
    "feedback.description": "AI प्रतिक्रियाओं पर उपयोगकर्ता फीडबैक की समीक्षा और विश्लेषण करें",
    
    // Settings
    "settings.title": "सेटिंग्स",
    "settings.description": "अपनी संगठन की सेटिंग्स और प्राथमिकताएं प्रबंधित करें",
    "settings.profile": "प्रोफाइल और ब्रांडिंग",
    "settings.data-retention": "डेटा प्रतिधारण",
    "settings.i18n": "अंतर्राष्ट्रीयकरण",
    "settings.citation-formatting": "उद्धरण प्रारूपण",
    "settings.api-keys": "API कुंजियाँ",
    "settings.system-health": "सिस्टम स्वास्थ्य",
    
    // I18n Settings
    "settings.i18n.title": "अंतर्राष्ट्रीयकरण",
    "settings.i18n.defaultLanguage": "डिफ़ॉल्ट भाषा",
    "settings.i18n.save": "भाषा सहेजें",
    "settings.i18n.description": "प्रशासन इंटरफेस और AI प्रतिक्रियाओं के लिए डिफ़ॉल्ट भाषा",
    
    // API Keys
    "api-keys.title": "API कुंजियाँ",
    "api-keys.create": "API कुंजी बनाएं",
    "api-keys.name": "नाम",
    "api-keys.key": "कुंजी",
    "api-keys.created": "बनाया गया",
    "api-keys.lastUsed": "अंतिम उपयोग",
    "api-keys.requests": "अनुरोध",
    "api-keys.rateLimit": "दर सीमा",
    "api-keys.actions": "कार्य",
    "api-keys.revoke": "रद्द करें",
    "api-keys.copy": "कॉपी करें",
    "api-keys.show": "दिखाएं",
    "api-keys.hide": "छुपाएं",
    
    // Documents
    "documents.title": "दस्तावेज़",
    "documents.description": "अपने अनुक्रमित दस्तावेज़ और सामग्री का प्रबंधन करें",
    "documents.upload": "दस्तावेज़ अपलोड करें",
    "documents.search": "दस्तावेज़ खोजें...",
    "documents.total": "कुल दस्तावेज़",
    "documents.newThisWeek": "इस सप्ताह नए",
    "documents.totalSize": "कुल आकार",
    "documents.avgChunks": "औसत खंड",
    
    // Crawl
    "crawl.title": "क्रॉलिंग प्रबंधन",
    "crawl.description": "वेबसाइट क्रॉलिंग स्रोतों को कॉन्फ़िगर और मॉनिटर करें",
    "crawl.addSource": "स्रोत जोड़ें",
    "crawl.sources": "स्रोत",
    "crawl.jobs": "नौकरियाँ",
    "crawl.start": "क्रॉलिंग शुरू करें",
    "crawl.stop": "क्रॉलिंग रोकें",
    
    // Analytics
    "analytics.title": "विश्लेषण",
    "analytics.description": "प्रदर्शन मेट्रिक्स और उपयोगकर्ता जुड़ाव को ट्रैक करें",
    "analytics.queries": "क्वेरी",
    "analytics.latency": "विलंबता",
    "analytics.satisfaction": "संतुष्टि",
    "analytics.sources": "स्रोत",
    
    // Theme
    "theme.toggle": "थीम बदलें",
    "theme.light": "हल्का मोड",
    "theme.dark": "डार्क मोड",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>("en");

  // Load locale once
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { locale?: string };
        if (parsed.locale && AVAILABLE_LOCALES.some(l => l.code === parsed.locale)) {
          setLocale(parsed.locale);
        }
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0];
        const supportedLang = AVAILABLE_LOCALES.find(l => l.code.startsWith(browserLang));
        if (supportedLang) {
          setLocale(supportedLang.code);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [setLocale]);

  // Persist locale
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ locale }));
      // Update document language attribute
      document.documentElement.lang = locale;
    } catch (e) {
      // ignore
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const table = translations[locale] || translations.en;
      let translation = table[key] ?? key;
      
      // Replace parameters if provided
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
        });
      }
      
      return translation;
    };
  }, [locale]);

  const value: I18nContextValue = useMemo(() => ({ 
    locale, 
    setLocale, 
    t, 
    availableLocales: AVAILABLE_LOCALES 
  }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

// Helper hook for easy translation
export function useTranslation() {
  const { t, locale, setLocale, availableLocales } = useI18n();
  
  return {
    t,
    locale,
    setLocale,
    availableLocales,
    // Convenience methods
    isRTL: ['ar', 'he', 'fa', 'ur'].includes(locale.split('-')[0]),
    changeLanguage: setLocale,
  };
}
