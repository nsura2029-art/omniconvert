import { useState, useEffect } from 'react';
import { Sparkles, Library, Search, Sliders, Play, CheckCircle2, AlertTriangle, ShieldCheck, Mail, ArrowRight, UserPlus, Heart, FileCode2, HelpCircle, ShieldAlert } from 'lucide-react';
import { User, FileConversion, CloudIntegration, PlanType } from './types';
import { Tool, TOOLS, CATEGORIES } from './data/tools';
import { CAD_SEO_CANONICAL_BASE_URL, CAD_SEO_PAGES, getCadSeoPageBySlug, getCadSeoPageByToolId } from './data/cadSeoPages';
import Navbar from './components/Navbar';
import CategoryPage from './components/CategoryPage';
import CadSeoPage from './components/CadSeoPage';
import AuthModal from './components/AuthModal';
import ConversionPanel from './components/ConversionPanel';
import Dashboard from './components/Dashboard';
import NewLanding from './components/NewLanding';
import WorkflowBuilder from './components/WorkflowBuilder';
import Billing from './components/Billing';
import Pricing from './pages/Pricing';
import AdminPanel, { AdminSection } from './pages/admin/AdminPanel';
import { getOrCreateUser, captureReferralFromUrl } from './data/gamification';
import { getTopToolForCategory } from './data/popular-conversions';
import FloatingCreditPill from './components/gamification/FloatingCreditPill';
import { resolveSlug, toolSlug } from './lib/tool-slug';
import OnboardingTour from './components/OnboardingTour';
import InteractiveHeroSelector from './components/InteractiveHeroSelector';
import SecurityPage from './components/SecurityPage';
import SecurityTrustBand from './components/SecurityTrustBand';

const categoryPath = (categoryId: string) => `/${categoryId.toLowerCase()}-converter/`;
const cadSeoPath = (slug: string) => `/cad/${slug}`;

const upsertMeta = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const removeMeta = (name: string) => {
  document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.remove();
};

const upsertCanonical = (href: string) => {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  tag.href = href;
};

const upsertJsonLd = (id: string, payload: unknown) => {
  let tag = document.querySelector<HTMLScriptElement>(`#${id}`);
  if (!tag) {
    tag = document.createElement('script');
    tag.id = id;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(payload);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCadSlug, setSelectedCadSlug] = useState<string | null>(null);
  // True when the URL is exactly /<category>/ (no slug) — the picker
  // collapses to a 2-column from/to matrix and the category chip is fixed.
  const [categoryLocked, setCategoryLocked] = useState(false);
  // True when the ToolPicker should be visible. Shown on the home page
  // before the user makes a selection. Hidden as soon as the user picks
  // a tool, drops a file, or clicks a category — the page collapses to
  // just the ChooseFile section. A "Change tool" button re-opens it.
  const [pickerVisible, setPickerVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool>(TOOLS[0]); // Default: PDF to Word
  
  // Light/Dark Theme: default is light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('omni_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Recently used tools for users
  const [recentTools, setRecentTools] = useState<Tool[]>([]);

  // App-wide data persistence
  const [conversions, setConversions] = useState<FileConversion[]>([]);
  const [guestConversionsCount, setGuestConversionsCount] = useState(0);
  
  // Storage integrations
  const [integrations, setIntegrations] = useState<CloudIntegration[]>([
    { provider: 's3', enabled: false, bucketOrFolder: 'omni-aws-bucket', apiKey: '' },
    { provider: 'azure', enabled: false, bucketOrFolder: 'omni-blob-storage', apiKey: '' },
    { provider: 'gcs', enabled: false, bucketOrFolder: 'omni-gcp-bucket', apiKey: '' },
    { provider: 'dropbox', enabled: false, bucketOrFolder: '/omni-conversions', apiKey: '' },
  ]);

  // Overall statistics for admin dashboard
  const [systemStats, setSystemStats] = useState({
    totalRevenue: 30,
    conversionsCount: 0
  });

  // State for active Hero Section layout ('cyber' or 'bento'). Default is 'bento'
  const [activeHeroPreset, setActiveHeroPreset] = useState<'cyber' | 'bento'>(() => {
    const saved = localStorage.getItem('omni_active_hero_preset');
    return (saved === 'cyber' || saved === 'bento') ? saved : 'bento';
  });

  const handleUpdateHeroPreset = (preset: 'cyber' | 'bento') => {
    setActiveHeroPreset(preset);
    localStorage.setItem('omni_active_hero_preset', preset);
  };

  // Sync theme to root element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('omni_theme', theme);
  }, [theme]);

  // Handle tool selection & update recents
  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    setRecentTools(prev => {
      const filtered = prev.filter(t => t.id !== tool.id);
      const updated = [tool, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem('omni_recent_tools', JSON.stringify(updated.map(t => t.id)));
      return updated;
    });
  };

  // Tool picker uses this — same as handleSelectTool but also updates the
  // URL via pushState so the address bar reflects the current tool. The
  // page does NOT re-render or scroll; only the URL changes.
  const handleSelectToolSyncUrl = (tool: Tool) => {
    handleSelectTool(tool);
    const slug = toolSlug(tool.input, tool.output);
    const url = tool.category === 'CAD'
      ? `/cad/${slug}`
      : `/${tool.category.toLowerCase()}/${slug}`;
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
    // The URL now has a slug, so the category is no longer "locked".
    setCategoryLocked(false);
  };

  // Load conversions & limits from localStorage on boot
  useEffect(() => {
    // Bootstrap gamification: capture ?ref= and create session/user.
    captureReferralFromUrl();
    getOrCreateUser(currentUser);
    const savedConvs = localStorage.getItem('omni_conversions') || '[]';
    setConversions(JSON.parse(savedConvs));

    const savedGuestCount = localStorage.getItem('omni_guest_count') || '0';
    setGuestConversionsCount(parseInt(savedGuestCount));

    const savedIntegrations = localStorage.getItem('omni_integrations');
    if (savedIntegrations) {
      setIntegrations(JSON.parse(savedIntegrations));
    }

    const savedStats = localStorage.getItem('omni_system_stats');
    if (savedStats) {
      setSystemStats(JSON.parse(savedStats));
    }

    // Check if there is an active session
    const activeSession = localStorage.getItem('omni_active_user');
    if (activeSession) {
      setCurrentUser(JSON.parse(activeSession));
    }

    // Load recently used tools from local cache
    const savedRecents = localStorage.getItem('omni_recent_tools');
    if (savedRecents) {
      try {
        const ids = JSON.parse(savedRecents) as number[];
        const tools = ids.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];
        setRecentTools(tools);
      } catch (e) {
        console.error('Error loading recent tools', e);
      }
    }

    // Parse referral code in URL e.g. ?ref=user_123
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('omni_pending_referrer', refCode);
      // Clean up URL parameters from browser bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Launch onboarding for first-time visitors
    const onboarded = localStorage.getItem('omni_onboarded');
    if (onboarded !== 'true') {
      setOnboardingOpen(true);
    }

    if (window.location.pathname.toLowerCase() === '/security/') {
      setCurrentPage('security');
      return;
    }

    const cadSlug = window.location.pathname.toLowerCase().match(/^\/cad\/([^/]+)\/?$/)?.[1];
    if (cadSlug) {
      const cadPage = getCadSeoPageBySlug(cadSlug);
      setSelectedCategory('CAD');
      setSelectedCadSlug(cadSlug);
      if (cadPage) {
        setSelectedTool(cadPage.tool);
        // Single landing page handles every tool URL. The SaaS hero +
        // file rows + ToolPicker all live in NewLanding.
        setCurrentPage('home');
        setCategoryLocked(false);
      } else {
        setCurrentPage('cad-not-found');
      }
      return;
    }

    // /<category>/  (no slug) — locks the category picker. User sees
    // only the from/to matrix for that category.
    const catOnlyMatch = window.location.pathname.toLowerCase().match(/^\/([a-z0-9-]+)\/?$/);
    if (catOnlyMatch) {
      const catSlug = catOnlyMatch[1];
      const cat = CATEGORIES.find(c => c.id.toLowerCase() === catSlug);
      if (cat) {
        const top = getTopToolForCategory(cat.id);
        setSelectedCategory(cat.id);
        if (top) setSelectedTool(top);
        setCurrentPage('home');
        setCategoryLocked(true);
        return;
      }
    }

    // Per-category tool URLs e.g. /documents/pdf-to-docx,
    // /images/jpg-to-png, /video/mp4-to-gif.
    // All route to the single landing page.
    const toolUrlMatch = window.location.pathname.toLowerCase().match(/^\/([a-z0-9-]+)\/([^/]+)\/?$/);
    if (toolUrlMatch) {
      const [, catSlug, toolSlugPart] = toolUrlMatch;
      const cat = CATEGORIES.find(c => c.id.toLowerCase() === catSlug);
      if (cat && toolSlugPart) {
        const entry = resolveSlug(toolSlugPart);
        if (entry && entry.tool.category.toLowerCase() === catSlug) {
          setSelectedCategory(cat.id);
          setSelectedTool(entry.tool);
          setCurrentPage('home');
          setCategoryLocked(false);
          return;
        }
      }
    }

    // ?tool=<slug> query param (fallback for any category).
    const toolParam = urlParams.get('tool');
    if (toolParam) {
      const entry = resolveSlug(toolParam);
      if (entry) {
        setSelectedCategory(entry.category);
        setSelectedTool(entry.tool);
        setCurrentPage('home');
        setCategoryLocked(false);
        return;
      }
    }

    const matchedCategory = CATEGORIES.find(cat => window.location.pathname.toLowerCase() === categoryPath(cat.id));
    if (matchedCategory) {
      const firstCategoryTool = TOOLS.find(tool => tool.category === matchedCategory.id);
      setSelectedCategory(matchedCategory.id);
      setCurrentPage('category');
      if (firstCategoryTool) {
        setSelectedTool(firstCategoryTool);
      }
    }
  }, []);

  // Sync state helpers
  const saveConversions = (updatedConvs: FileConversion[]) => {
    setConversions(updatedConvs);
    localStorage.setItem('omni_conversions', JSON.stringify(updatedConvs));
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('omni_active_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('omni_active_user');
    setCurrentPage('tools');
  };

  const handleToggleIntegration = (provider: CloudIntegration['provider']) => {
    const updated = integrations.map(i => {
      if (i.provider === provider) {
        return { ...i, enabled: !i.enabled };
      }
      return i;
    });
    setIntegrations(updated);
    localStorage.setItem('omni_integrations', JSON.stringify(updated));
  };

  const handleUpdateIntegration = (provider: CloudIntegration['provider'], updates: Partial<CloudIntegration>) => {
    const updated = integrations.map(i => {
      if (i.provider === provider) {
        return { ...i, ...updates };
      }
      return i;
    });
    setIntegrations(updated);
    localStorage.setItem('omni_integrations', JSON.stringify(updated));
  };

  const handleUpgradePlan = (plan: PlanType, credits: number) => {
    if (!currentUser) return;
    
    // Add purchased credits to existing balance for pro bundle, or assign for others
    let baseCredits = plan === 'pro' ? (currentUser.credits + credits) : credits;
    let referredRewarded = currentUser.referredRewarded;
    
    // Also update this user in the admin users registry
    const registeredUsersStr = localStorage.getItem('omni_users') || '[]';
    const list: User[] = JSON.parse(registeredUsersStr);
    
    // Check for referral reward
    if (currentUser.referredBy && !currentUser.referredRewarded) {
      const refId = currentUser.referredBy;
      const referrerIndex = list.findIndex(u => u.id === refId);
      if (referrerIndex !== -1) {
        // Add +100 credits to referrer
        list[referrerIndex].credits += 100;
        // Add +100 bonus credits to current user as a subscription bonus
        baseCredits += 100;
        referredRewarded = true;
        
        // Add log entry
        const refLogs = JSON.parse(localStorage.getItem('omni_referral_logs') || '[]');
        refLogs.unshift({
          id: 'reflog_' + Math.random().toString(36).substr(2, 9),
          referrerName: list[referrerIndex].name,
          referrerEmail: list[referrerIndex].email,
          referredName: currentUser.name,
          referredEmail: currentUser.email,
          timestamp: new Date().toISOString(),
          rewardCredits: 100
        });
        localStorage.setItem('omni_referral_logs', JSON.stringify(refLogs));
      }
    }

    const updatedUser: User = {
      ...currentUser,
      plan,
      credits: baseCredits,
      maxDailyConversions: plan === 'enterprise' ? 99999 : 100,
      referredRewarded
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('omni_active_user', JSON.stringify(updatedUser));

    // Update system revenue stats
    const updatedStats = {
      ...systemStats,
      totalRevenue: systemStats.totalRevenue + (plan === 'pro' ? 15 : 49)
    };
    setSystemStats(updatedStats);
    localStorage.setItem('omni_system_stats', JSON.stringify(updatedStats));

    const updatedList = list.map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem('omni_users', JSON.stringify(updatedList));
  };

  // Limit check & usage subtraction
  const handleConversionCompleted = (conv: FileConversion) => {
    // 1. Subtract limits/credits
    if (currentUser) {
      if (currentUser.plan === 'pro') {
        const nextCredits = Math.max(0, currentUser.credits - conv.creditCost);
        const updatedUser: User = {
          ...currentUser,
          credits: nextCredits,
          dailyConversionsCount: currentUser.dailyConversionsCount + 1
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('omni_active_user', JSON.stringify(updatedUser));
      } else if (currentUser.plan === 'free') {
        const updatedUser: User = {
          ...currentUser,
          dailyConversionsCount: currentUser.dailyConversionsCount + 1
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('omni_active_user', JSON.stringify(updatedUser));
      }
    } else {
      const nextGuestCount = guestConversionsCount + 1;
      setGuestConversionsCount(nextGuestCount);
      localStorage.setItem('omni_guest_count', nextGuestCount.toString());
    }

    // 2. Save Conversion Log
    const updatedConvs = [conv, ...conversions];
    saveConversions(updatedConvs);

    // 3. Increment system stats
    const updatedStats = {
      ...systemStats,
      conversionsCount: systemStats.conversionsCount + 1
    };
    setSystemStats(updatedStats);
    localStorage.setItem('omni_system_stats', JSON.stringify(updatedStats));
  };

  // Dynamic remaining conversions calculation
  const getRemainingDailyLimit = () => {
    if (currentUser) {
      if (currentUser.plan === 'pro') {
        return currentUser.credits;
      } else if (currentUser.plan === 'enterprise') {
        return 99999;
      } else {
        // Free registered signup user: 15/day
        return Math.max(0, 15 - currentUser.dailyConversionsCount);
      }
    } else {
      // Anonymous Guest: 5/day
      return Math.max(0, 5 - guestConversionsCount);
    }
  };

  const remainingDailyLimit = getRemainingDailyLimit();
  const limitExceeded = remainingDailyLimit <= 0 && currentUser?.plan !== 'enterprise';

  const handleChangePage = (page: string) => {
    setCurrentPage(page);
    setSelectedCadSlug(null);
    if (page === 'tools') {
      setSelectedCategory('All');
      window.history.pushState({}, '', '/');
    } else if (page === 'security') {
      window.history.pushState({}, '', '/security/');
    } else if (page === 'analytics') {
      window.history.pushState({}, '', '/dashboard');
    } else if (page.startsWith('analytics:')) {
      const cat = page.split(':')[1];
      window.history.pushState({}, '', `/dashboard/${cat}`);
    }
  };

  const handleSelectToolCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedCadSlug(null);
    setSearchQuery('');

    if (category === 'All') {
      setCurrentPage('home');
      window.history.pushState({}, '', '/');
      setCategoryLocked(false);
      setPickerVisible(true);
      return;
    }

    // Use the top popular tool (or first available) as the default.
    // The user can change it via the picker or by dropping a file.
    const top = getTopToolForCategory(category);
    if (top) setSelectedTool(top);
    setCurrentPage('home');
    setCategoryLocked(true);
    setPickerVisible(false);
    window.history.pushState({}, '', `/${category.toLowerCase()}/`);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  // Route to a per-category tool URL: /<category>/<slug>
  // (e.g. /documents/pdf-to-docx, /images/jpg-to-png).
  // Falls back to /<category>-converter/ if the slug is unknown.
  const handleSelectCategoryTool = (category: string, slug: string) => {
    const entry = resolveSlug(slug);
    const cat = CATEGORIES.find(c => c.id.toLowerCase() === category.toLowerCase());
    if (!cat) {
      handleSelectToolCategory(category);
      return;
    }
    if (!entry || entry.tool.category.toLowerCase() !== category.toLowerCase()) {
      // unknown slug for this category -> fall back to category landing
      handleSelectToolCategory(category);
      return;
    }
    setSelectedCategory(cat.id);
    setSelectedCadSlug(null);
    setSearchQuery('');
    setSelectedTool(entry.tool);
    setCurrentPage('tools');
    window.history.pushState({}, '', `/${cat.id.toLowerCase()}/${slug}`);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const handleOpenCadSeoPage = (slug: string) => {
    const cadPage = getCadSeoPageBySlug(slug);
    setSelectedCategory('CAD');
    setSelectedCadSlug(slug);

    if (cadPage) {
      setSelectedTool(cadPage.tool);
      setCurrentPage('cad-detail');
      window.history.pushState({}, '', cadSeoPath(slug));
    } else {
      setCurrentPage('cad-not-found');
      window.history.pushState({}, '', cadSeoPath(slug));
    }

    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const handleOpenPopularTool = (tool: Tool) => {
    setSelectedCategory(tool.category);
    setSelectedCadSlug(null);
    setSearchQuery('');
    setSelectedTool(tool);
    setCurrentPage('category');
    window.history.pushState({}, '', categoryPath(tool.category));
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const activeCategory = CATEGORIES.find(cat => cat.id === selectedCategory);
  const categoryTools = activeCategory ? TOOLS.filter(tool => tool.category === activeCategory.id) : [];
  const activeCadSeoPage = selectedCadSlug ? getCadSeoPageBySlug(selectedCadSlug) : undefined;
  const relatedCadSeoPages = activeCadSeoPage
    ? Array.from(
        new Map(
          [
            ...activeCadSeoPage.relatedSlugs.map(slug => getCadSeoPageBySlug(slug)).filter(Boolean),
            ...CAD_SEO_PAGES.filter(page => page.slug !== activeCadSeoPage.slug)
          ].map(page => [page.slug, page])
        ).values()
      ).slice(0, 6)
    : [];
  const popularCategorySections = CATEGORIES.filter(category => category.id !== 'CAD')
    .map(category => {
      const popularTools = TOOLS.filter(tool => tool.category === category.id && tool.popular).slice(0, 3);
      const fallbackTools = TOOLS.filter(tool => tool.category === category.id).slice(0, 3);

      return {
        category,
        tools: popularTools.length >= 3 ? popularTools : fallbackTools
      };
    })
    .filter(section => section.tools.length > 0)
    .slice(0, 3);

  // Filter tools based on query and selected category
  const filteredTools = TOOLS.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.output.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    document.querySelector<HTMLScriptElement>('#cad-seo-jsonld')?.remove();
    removeMeta('robots');

    if (currentPage === 'cad-detail' && activeCadSeoPage) {
      const canonical = `${CAD_SEO_CANONICAL_BASE_URL}${cadSeoPath(activeCadSeoPage.slug)}`;
      document.title = activeCadSeoPage.title;
      upsertMeta('description', activeCadSeoPage.metaDescription);
      upsertCanonical(canonical);
      upsertJsonLd('cad-seo-jsonld', {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': activeCadSeoPage.schemaType,
            name: activeCadSeoPage.tool.name,
            applicationCategory: 'FileConverter',
            operatingSystem: 'Web',
            url: canonical,
            description: activeCadSeoPage.metaDescription,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            }
          },
          {
            '@type': 'FAQPage',
            mainEntity: activeCadSeoPage.faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: CAD_SEO_CANONICAL_BASE_URL
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'CAD Converter',
                item: `${CAD_SEO_CANONICAL_BASE_URL}/cad-converter/`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: activeCadSeoPage.tool.name,
                item: canonical
              }
            ]
          }
        ]
      });
      return;
    }

    if (currentPage === 'cad-not-found') {
      document.title = 'CAD converter page not found | OmniConvert';
      upsertMeta('description', 'The requested OmniConvert CAD converter page was not found.');
      upsertMeta('robots', 'noindex,nofollow');
      upsertCanonical(`${CAD_SEO_CANONICAL_BASE_URL}/cad-converter/`);
      return;
    }

    if (currentPage === 'category' && activeCategory) {
      const categoryUrl = `${CAD_SEO_CANONICAL_BASE_URL}${categoryPath(activeCategory.id)}`;
      document.title = `Online ${activeCategory.name} Converter | OmniConvert`;
      upsertMeta('description', `Use OmniConvert's online ${activeCategory.name.toLowerCase()} converter hub to choose source and target formats, upload files, and test category-specific conversion routes.`);
      upsertCanonical(categoryUrl);
      return;
    }

    if (currentPage === 'security') {
      document.title = 'Security & Compliance | OmniConvert';
      upsertMeta('description', 'Learn how OmniConvert is designed for private file conversion, temporary processing, retention policy, Privacy and GDPR readiness, and business security review.');
      upsertCanonical(`${CAD_SEO_CANONICAL_BASE_URL}/security/`);
      return;
    }

    document.title = 'OmniConvert | File Conversion Sandbox';
    upsertMeta('description', 'OmniConvert is a multi-format file conversion sandbox for documents, images, media, CAD, archives, ebooks, and data files.');
    upsertCanonical(`${CAD_SEO_CANONICAL_BASE_URL}/`);
  }, [activeCadSeoPage, activeCategory, currentPage]);

  return (
    <div className="min-h-screen bg-transparent text-zinc-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white antialiased transition-colors duration-300" id="omnicovert-saas-root">
      <div className="mesh-bg"></div>
      
      {/* CLERK STYLE HEADER */}
      <Navbar 
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        currentPage={currentPage}
        onChangePage={handleChangePage}
        remainingDailyLimit={remainingDailyLimit}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectToolCategory={handleSelectToolCategory}
      />

      {/* MAIN APP SECTION */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" id="main-content-area">

        {/* VIEW 0: NEW LANDING PAGE (zero-friction drop-zone hero) */}
        {currentPage === 'home' && (
          <div className="animate-fade-in" id="home-page">
            <NewLanding
              currentUser={currentUser}
              selectedTool={selectedTool}
              onSelectTool={handleSelectToolSyncUrl}
              onConversionCompleted={handleConversionCompleted}
              onOpenAuth={() => setAuthModalOpen(true)}
              integrations={integrations}
              categoryLocked={categoryLocked}
              pickerVisible={pickerVisible}
              onShowPicker={() => setPickerVisible(true)}
            />
          </div>
        )}

        {/* VIEW 1: TOOLS DIRECTORY & LANDING PAGE */}
        {currentPage === 'tools' && (
          <div className="space-y-12 animate-fade-in" id="tools-page">
            
            {/* HERO HEROICS inspired by family.co */}
            <div className="text-center max-w-4xl mx-auto space-y-4 pt-4 pb-8">
              <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                🚀 Multi-Format Cloud Transcoder
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Any Format. <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Zero Friction.</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                A highly aesthetic, professional sandbox file conversion platform. 
                Experience edge-optimized compiling powered by serverless parallel architectures.
              </p>
            </div>

            <InteractiveHeroSelector 
              selectedTool={selectedTool}
              onSelectTool={handleSelectTool}
              activePreset={activeHeroPreset}
              onPresetChange={handleUpdateHeroPreset}
            />

            {/* IF LIMIT EXCEEDED WARNING */}
            {limitExceeded && (
              <div className="p-6 rounded-2xl bg-indigo-950/20 border-2 border-indigo-500/30 max-w-2xl mx-auto space-y-4 animate-shake text-center" id="quota-warning-banner">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <div>
                  <h3 className="text-base font-bold text-white">Daily Sandbox Quota Exceeded</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentUser 
                      ? 'You have used your 15 free daily conversions as a registered free member.' 
                      : 'You have used your 5 free anonymous trial conversions for today.'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {!currentUser && (
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Sign Up Free (Get 15/day)
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentPage('billing')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    View Pricing Plans
                  </button>
                </div>
              </div>
            )}

            {/* CHOSEN WORKSPACE STAGE */}
            {!limitExceeded && (
              <div className="pt-4 scroll-mt-20" id="tool-active-stage">
                <ConversionPanel 
                  currentUser={currentUser}
                  selectedTool={selectedTool}
                  onConversionCompleted={handleConversionCompleted}
                  onOpenAuth={() => setAuthModalOpen(true)}
                  integrations={integrations}
                />
              </div>
            )}

            <SecurityTrustBand onOpenSecurity={() => handleChangePage('security')} />

            {/* SEPARATOR DIVIDER */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-white/5"></div>
              </div>
              <span className="relative px-4 bg-slate-50 dark:bg-slate-900 border border-zinc-200 dark:border-white/10 py-1 rounded-full text-xs text-zinc-600 dark:text-zinc-300 font-mono">{TOOLS.length} Conversion Tools Available</span>
            </div>

            {/* RECENTLY USED TOOLS QUICK ACCESS */}
            {recentTools.length > 0 && (
              <div className="space-y-3 animate-fade-in" id="recently-used-tools-panel">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                    Recently Used Tools
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {recentTools.map((tool) => {
                    const isSelected = selectedTool.id === tool.id;
                    return (
                      <button
                        key={`recent-${tool.id}`}
                        onClick={() => {
                          handleSelectTool(tool);
                          document.getElementById('tool-active-stage')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`p-3 rounded-xl text-left transition-all border group glass-card hover:bg-zinc-200/50 dark:hover:bg-white/5 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-500/50 ring-1 ring-indigo-500/30'
                            : 'border-zinc-200/50 dark:border-white/5'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wider font-mono">
                            {tool.category}
                          </div>
                          <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5 line-clamp-1">
                            {tool.name}
                          </h4>
                        </div>
                        <div className="text-[9px] font-mono text-zinc-400 mt-2 flex items-center justify-between">
                          <span>{tool.input} ➔ {tool.output}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ADVANCED FUZZY DIRECTORY SEARCH & CATEGORY SELECTOR */}
            <div className="space-y-6" id="tools-directory">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Explore Tools Directory</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-mono">Fuzzy search filter through document, image, vector & CAD parsers</p>
                </div>
                
                {/* Search input */}
                <div className="relative w-full md:max-w-xs shrink-0">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search e.g. PDF to Word..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs placeholder-zinc-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category Pills Slider */}
              {selectedCategory !== 'CAD' && (
                <button
                  type="button"
                  onClick={() => handleSelectToolCategory('CAD')}
                  className="w-full glass-card glass-card-hover border border-sky-200/70 dark:border-sky-500/15 rounded-2xl p-4 text-left flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  id="cad-tools-directory-shortcut"
                >
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300 font-mono">
                      CAD tools
                    </div>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                      DWG, DXF, STEP, STL and engineering file converters
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Jump straight to {CATEGORIES.find(cat => cat.id === 'CAD')?.count ?? 9} CAD utilities for drawings, 3D models, printing, and sharing.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300">
                    View CAD tools
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              )}

              <div className="flex gap-2 overflow-x-auto pb-2 pr-4 scrollbar-thin scrollbar-thumb-zinc-800" id="category-pills">
                <button
                  onClick={() => handleSelectToolCategory('All')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'btn-primary text-white font-bold'
                      : 'glass text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  All Categories ({TOOLS.length})
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectToolCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'btn-primary text-white font-bold'
                        : 'glass text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>

              {/* Grid of Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="tools-grid-layout">
                {filteredTools.slice(0, 30).map((tool) => {
                  const isSelected = selectedTool.id === tool.id;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => {
                        handleSelectTool(tool);
                        document.getElementById('tool-active-stage')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between group glass-card glass-card-hover ${
                        isSelected 
                          ? 'ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                          : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.name}</h4>
                          {tool.popular && (
                            <span className="text-[8px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Popular</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1.5 line-clamp-2">{tool.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/5 pt-3 mt-4 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                        <span>Formats: {tool.input} ➔ {tool.output}</span>
                        <span className="text-indigo-600 dark:text-indigo-300 font-bold">{tool.creditCost} Credits</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTools.length > 30 && (
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-600 pt-2 font-mono">Showing top 30 filtered results out of {filteredTools.length} total matched tools.</p>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: DEDICATED CATEGORY CONVERTER PAGE */}
        {currentPage === 'category' && activeCategory && (
          <CategoryPage
            category={activeCategory}
            tools={categoryTools}
            selectedTool={selectedTool}
            onSelectTool={handleSelectTool}
            onBackToAllTools={() => handleSelectToolCategory('All')}
            seoPages={activeCategory.id === 'CAD' ? CAD_SEO_PAGES : undefined}
            onOpenSeoPage={activeCategory.id === 'CAD' ? handleOpenCadSeoPage : undefined}
            converterSlot={
              limitExceeded ? (
                <div className="p-6 rounded-2xl bg-indigo-950/20 border-2 border-indigo-500/30 space-y-4 text-center" id="category-quota-warning-banner">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Sandbox Quota Exceeded</h3>
                    <p className="text-xs text-zinc-400 mt-1">Upgrade or sign in to continue testing category conversions.</p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('billing')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    View Pricing Plans
                  </button>
                </div>
              ) : (
                <ConversionPanel
                  currentUser={currentUser}
                  selectedTool={selectedTool}
                  onConversionCompleted={handleConversionCompleted}
                  onOpenAuth={() => setAuthModalOpen(true)}
                  integrations={integrations}
                />
              )
            }
          />
        )}

        {/* VIEW 2B: PROGRAMMATIC CAD SEO DETAIL PAGE */}
        {currentPage === 'cad-detail' && activeCadSeoPage && (
          <CadSeoPage
            page={activeCadSeoPage}
            relatedPages={relatedCadSeoPages}
            popularCategorySections={popularCategorySections}
            currentUser={currentUser}
            onBackToHub={() => handleSelectToolCategory('CAD')}
            onOpenCadSeoPage={handleOpenCadSeoPage}
            onOpenPopularTool={handleOpenPopularTool}
            converterSlot={
              limitExceeded ? (
                <div className="p-6 rounded-2xl bg-indigo-950/20 border-2 border-indigo-500/30 space-y-4 text-center" id="cad-seo-quota-warning-banner">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Sandbox Quota Exceeded</h3>
                    <p className="text-xs text-zinc-400 mt-1">Upgrade or sign in to continue testing CAD conversions.</p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('billing')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    View Pricing Plans
                  </button>
                </div>
              ) : (
                <ConversionPanel
                  currentUser={currentUser}
                  selectedTool={selectedTool}
                  onConversionCompleted={handleConversionCompleted}
                  onOpenAuth={() => setAuthModalOpen(true)}
                  integrations={integrations}
                />
              )
            }
          />
        )}

        {/* VIEW 2C: UNKNOWN CAD SEO SLUG */}
        {currentPage === 'cad-not-found' && (
          <section className="max-w-2xl mx-auto glass-card rounded-2xl p-8 text-center space-y-4 animate-fade-in" id="cad-seo-not-found-page">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">CAD converter page not found</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                This CAD route is not part of the current indexable OmniConvert catalog.
              </p>
            </div>
            <button type="button" onClick={() => handleSelectToolCategory('CAD')} className="inline-flex items-center justify-center gap-2 rounded-xl btn-primary px-4 py-2 text-xs font-bold text-white">
              View CAD converter hub
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* VIEW 2D: SECURITY & COMPLIANCE */}
        {currentPage === 'security' && (
          <SecurityPage onBackToTools={() => handleChangePage('tools')} />
        )}

        {/* VIEW 3: CUSTOM AUTOMATION WORKFLOW BUILDER */}
        {currentPage === 'workflows' && (
          <div className="animate-fade-in">
            <WorkflowBuilder 
              onAddConversionFromWorkflow={(fileName, toolName, category, cost) => {
                const manualConv: FileConversion = {
                  id: 'wf_' + Math.random().toString(36).substr(2, 9),
                  fileName,
                  fileSize: 14000,
                  toolId: 100,
                  toolName,
                  category,
                  status: 'completed',
                  progress: 100,
                  creditCost: cost,
                  timestamp: new Date().toISOString(),
                  logs: ['Workflow scheduled', 'Completed headless']
                };
                setConversions(prev => [manualConv, ...prev]);
              }}
            />
          </div>
        )}

        {/* VIEW 3: COMPREHENSIVE DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div className="animate-fade-in">
            <Dashboard
              currentUser={currentUser}
              conversions={conversions}
              integrations={integrations}
              onToggleIntegration={handleToggleIntegration}
              onUpdateIntegration={handleUpdateIntegration}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3b: PER-CATEGORY ANALYTICS DASHBOARD */}
        {(currentPage === 'analytics' || currentPage.startsWith('analytics:')) && (
          <div className="animate-fade-in -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
            {currentUser?.email === 'admin@omniconvert.com' ? (
              <AdminPanel
                embedded
                initialSection="analytics"
              />
            ) : (
              <div className="mx-auto max-w-xl py-20 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50">
                  <ShieldAlert className="h-7 w-7 text-rose-600" />
                </div>
                <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900">Admin only</h2>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Analytics are restricted to the admin account. Sign in as <span className="font-black text-slate-900">admin@omniconvert.com</span> to view this dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: BILLING / subscription manager */}
        {currentPage === 'billing' && (
          <div className="animate-fade-in">
            <Billing
              currentUser={currentUser}
              onUpgradePlan={handleUpgradePlan}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 4b: PRICING + credit tiers */}
        {currentPage === 'pricing' && (
          <div className="animate-fade-in">
            <Pricing
              currentUser={currentUser}
              onOpenAuth={() => setAuthModalOpen(true)}
              onUpgradePlan={handleUpgradePlan}
            />
          </div>
        )}

        {/* VIEW 5: ADMIN PANEL (Dashboard + Analytics + Users + Conversions + Settings) */}
        {currentPage === 'admin' && (
          currentUser?.email === 'admin@omniconvert.com' ? (
            <div className="animate-fade-in -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
              <AdminPanel />
            </div>
          ) : (
            <div className="mx-auto max-w-xl py-20 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50">
                <ShieldAlert className="h-7 w-7 text-rose-600" />
              </div>
              <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900">Admin only</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                The admin panel is restricted to the admin account. Sign in as <span className="font-black text-slate-900">admin@omniconvert.com</span> to view it.
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"
              >
                Sign in
              </button>
            </div>
          )
        )}

      </main>

      {/* Floating gamification pill — visible to every user, admin or not.
          Opens the gamification modal with credits / upvote / refer / share /
          activity tabs. */}
      <FloatingCreditPill currentUser={currentUser} />

      {/* CLERK LOGIN / REGISTRATION POPUP MODAL */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-white/5 bg-zinc-100/40 dark:bg-slate-950/40 backdrop-blur-md py-8 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-xs text-zinc-600 space-y-3 font-mono">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="font-bold text-zinc-500 dark:text-zinc-400">OmniConvert SaaS Sandbox Platform</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">edge dispatcher SLA: 99.9% uptime guaranteed • Proudly hosted via Cloudflare Workers</p>
          <div className="flex justify-center gap-4 text-[11px] text-zinc-500">
            <span>Built by Google AI Studio</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleChangePage('security')}
              className="font-bold text-sky-700 transition-colors hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
            >
              Security
            </button>
            <span>â€¢</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Inspired by family.co</span>
          </div>
        </div>
      </footer>

      <OnboardingTour 
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onOpenAuth={() => {
          setOnboardingOpen(false);
          setAuthModalOpen(true);
        }}
        onNavigatePage={(page) => {
          setOnboardingOpen(false);
          setCurrentPage(page);
        }}
      />

    </div>
  );
}
