const navItems = ["首页", "图鉴", "物品", "行情", "资讯", "开荒", "关于作者"];
const launchAt = new Date("2026-08-03T14:00:00+08:00");
const monsterAttributeGroups = [
  { label: "种族与特殊", items: ["普通", "不死", "BOSS"] },
  { label: "属性弱点", items: ["弱火", "弱冰", "弱雷", "弱毒", "弱圣"] },
  { label: "属性抗性", items: ["抗火", "抗冰", "抗雷", "抗毒", "抗圣"] },
  { label: "属性免疫", items: ["免疫火", "免疫冰", "免疫雷", "免疫毒", "免疫圣"] },
];

const asset = (path) => `${path}?v=20260721-visual-pass`;
const api = (path) => `/api${path}`;
const goldIcon = asset("assets/items/catalog/02028001.png");

const marketItems = [
  {
    id: "glove-atk-60",
    name: "手套攻击卷轴 60%",
    short: "手套攻 60%",
    category: "卷轴",
    img: asset("assets/items/scroll-glove-att-60-orange.png"),
    tags: "手套 / 攻击 / 物理职业",
    heat: "高关注",
    risk: "中",
    reference: "暂无报价",
    reason: "物理职业都看得懂的硬通货，开服第一周最容易形成价格共识。",
    drivers: ["物理职业数量", "掉落确认", "攻手套打造需求", "金币产出速度"],
  },
  {
    id: "glove-atk-10",
    name: "手套攻击卷轴 10%",
    short: "手套攻 10%",
    category: "卷轴",
    img: asset("assets/items/scroll-glove-att-10-yellow.png"),
    tags: "手套 / 攻击 / 冲极品",
    heat: "波动大",
    risk: "高",
    reference: "暂无报价",
    reason: "不稳定，但有故事。一旦有人晒成功装备，它很容易被情绪带起来。",
    drivers: ["成功案例传播", "大户消耗", "极品装备风气", "60% 卷轴价格"],
  },
  {
    id: "steely",
    name: "金钱镖",
    short: "金钱镖",
    category: "飞镖",
    img: asset("assets/items/steely.png"),
    tags: "飞镖 / 刺客 / 热门",
    heat: "高关注",
    risk: "中",
    reference: "暂无报价",
    reason: "刺客玩家的排面飞镖之一，兼具实用和怀旧记忆。",
    drivers: ["刺客人数", "掉落稀缺度", "玩家消费力", "替代飞镖价格"],
  },
  {
    id: "ilbi",
    name: "齿轮镖",
    short: "齿轮镖",
    category: "飞镖",
    img: asset("assets/items/ilbi.png"),
    tags: "飞镖 / 刺客 / 头部",
    heat: "很热",
    risk: "中高",
    reference: "暂无报价",
    reason: "头部飞镖，价格通常由稀缺度和刺客玩家消费力一起决定。",
    drivers: ["掉落稀缺度", "刺客等级进度", "收藏情绪", "服务器金币量"],
  },
  {
    id: "tobi",
    name: "黑刺",
    short: "黑刺",
    category: "飞镖",
    img: asset("assets/items/tobi.png"),
    tags: "飞镖 / 刺客 / 中前期",
    heat: "偏热",
    risk: "中",
    reference: "暂无报价",
    reason: "中前期刺客换镖会盯的一档，适合观察飞镖价格带。",
    drivers: ["刺客升级速度", "中级飞镖供应", "替代品价格", "玩家审美偏好"],
  },
];

const monsters = [
  { id: "slime", img: asset("assets/monsters/slime.png"), name: "绿水灵", level: 7, hp: 50, species: "水灵", exp: 10, area: "金银岛", map: "射手村周边", density: "密", value: "新手材料", drops: { equipment: ["基础装备"], consumable: ["红色药水"], other: ["绿色液体"] } },
  { id: "orange-mushroom", img: asset("assets/monsters/orange-mushroom.png"), name: "花蘑菇", level: 9, hp: 80, species: "蘑菇", exp: 17, area: "金银岛", map: "射手村 / 勇士部落路段", density: "密", value: "开荒经验", drops: { equipment: ["低级装备"], consumable: ["蓝色药水"], other: ["蘑菇盖"] } },
  { id: "stump", img: asset("assets/monsters/stump.png"), name: "木妖", level: 6, hp: 45, species: "植物", exp: 8, area: "金银岛", map: "勇士部落周边", density: "中", value: "材料观察", drops: { equipment: ["基础武器"], consumable: [], other: ["木柴", "弓箭材料"] } },
  { id: "octopus", img: asset("assets/monsters/octopus.png"), name: "三眼章鱼", level: 12, hp: 120, species: "水生", exp: 24, area: "金银岛", map: "废弃都市周边", density: "中高", value: "废都路线", drops: { equipment: ["飞侠过渡装备"], consumable: ["消耗品"], other: ["章鱼脚"] } },
];

class MapleApp extends HTMLElement {
  connectedCallback() {
    const initialPage = decodeURIComponent(location.hash.replace("#", ""));
    const initialSection = initialPage.split("/")[0];
    this.active = ["资讯", "开荒"].includes(initialSection) ? initialSection : (navItems.includes(initialPage) ? initialPage : "首页");
    this.newsDetailId = ["资讯", "开荒"].includes(initialSection) ? initialPage.slice(initialSection.length + 1) : "";
    this.adminSection = "概览";
    this.adminQuery = "";
    this.adminSelectedItemId = "";
    this.adminItemDraftPreset = null;
    this.adminItemLibrary = "全部";
    this.adminItemCategory = "全部";
    this.adminItemKind = "全部";
    this.adminTaxonomyOpen = false;
    this.adminSelectedMonsterId = "";
    this.adminMonsterDraft = null;
    this.adminMonsterFieldDraft = null;
    this.adminDropPicker = { open: false, group: "equipment", query: "", type: "全部", selected: [] };
    this.adminRecommendModal = { open: false, mode: "", itemId: "", query: "", kind: "全部" };
    this.siteConfig = { marketWatchlist: [], homeRecommendations: [], homeRecommendationSortMode: "volatility", itemTaxonomy: this.defaultItemTaxonomy() };
    this.marketCategory = "卷轴";
    this.selectedId = "glove-atk-60";
    this.selectedMonster = "";
    this.monsterBand = "全部";
    this.monsterAttribute = "全部";
    this.monsterSort = "默认";
    this.monsterFiltersOpen = false;
    this.monsterFocusLevel = 25;
    this.monsterQuery = "";
    this.globalQuery = "";
    this.monsterItems = [];
    this.itemLibrary = "物品库";
    this.catalogItems = [];
    this.itemCategory = "全部";
    this.itemKind = "全部";
    this.itemQuery = "";
    this.openItemId = "";
    this.scrollRate = 60;
    this.scrollLog = "选择卷轴后试砸一次";
    this.newsItems = [];
    this.goldMarket = { items: [], summary: { count: 0 } };
    this.dartMarket = { items: [], summary: { count: 0 }, servers: [], recentHistory: [] };
    this.scrollMarket = { items: [], summary: { count: 0 }, servers: [], recentHistory: [] };
    this.dartServerFilter = "国服 / 蓝蜗牛";
    this.scrollServerFilter = "国服 / 蓝蜗牛";
    this.goldEditionFilter = "怀旧服";
    this.goldServerFilter = "全部";
    this.goldSelectedListingId = "";
    this.goldRankingSort = "recommended";
    this.goldChartRange = "分时";
    this.goldSettings = { marketStatus: "开盘中", intervalMinutes: 10, minGoldYi: 10, deviationPercent: 35, homeServerKey: "国服 / 蓝蜗牛" };
    this.goldAdminBusy = false;
    this.goldAdminError = "";
    this.isLoggedIn = false;
    this.currentUser = "";
    this.currentDisplayName = "";
    this.currentRole = "guest";
    this.currentRoles = [];
    this.avatarColor = "#0b9ed5";
    this.avatarUrl = "";
    this.profileBio = "";
    this.isAdmin = false;
    this.isModerator = false;
    this.loginOpen = false;
    this.testingNoticeOpen = false;
    this.scrollSoonOpen = false;
    this.newsSoonOpen = false;
    this.authMode = "login";
    this.accountMenuOpen = false;
    this.loginBusy = false;
    this.loginError = "";
    this.rememberLogin = localStorage.getItem("maple_remember_login") === "1";
    this.rememberedUser = localStorage.getItem("maple_remember_user") || "";
    this.authCaptcha = this.makeCaptcha();
    this.recoveryQuestions = [
      "你的第一位角色名是什么？",
      "你最喜欢的职业是什么？",
      "你第一次加入的区服是什么？",
      "你最常用的游戏昵称是什么？",
      "你最喜欢的地图是什么？",
      "你最难忘的掉落物是什么？",
    ];
    this.newsFormBusy = false;
    this.newsDraftId = "";
    this.newsCommentOpen = "";
    this.publisherOpen = false;
    this.publisherChannel = "";
    this.userNotice = "";
    this.userSection = "overview";
    this.monsterError = "";
    this.render();
    this.clock = setInterval(() => this.updateCountdown(), 1000);
    this.goldRefreshClock = setInterval(() => {
      this.loadGoldMarket();
      this.loadDartMarket();
      this.loadScrollMarket();
    }, 60000);
    this.bootstrapRemoteState();
  }

  disconnectedCallback() {
    clearInterval(this.clock);
    clearInterval(this.goldRefreshClock);
  }

  async bootstrapRemoteState() {
    await Promise.all([this.loadNews(), this.loadAdminState(), this.loadMonsters(), this.loadItems(), this.loadSiteConfig(), this.loadGoldMarket(), this.loadDartMarket(), this.loadScrollMarket()]);
  }

  async loadGoldMarket() {
    try {
      const response = await fetch(api("/gold-market"), { cache: "no-store" });
      this.goldMarket = await response.json();
      this.goldSettings = this.goldMarket.settings || this.goldSettings;
    } catch {
      this.goldMarket = { items: [], summary: { count: 0 } };
    }
    this.render();
  }

  async loadDartMarket() {
    try {
      const response = await fetch(api("/dart-market"), { cache: "no-store" });
      this.dartMarket = await response.json();
    } catch {
      this.dartMarket = { items: [], summary: { count: 0 }, servers: [], recentHistory: [] };
    }
    this.render();
  }

  async loadScrollMarket() {
    try {
      const response = await fetch(api("/scroll-market"), { cache: "no-store" });
      if (!response.ok) throw new Error(`scroll market request failed: ${response.status}`);
      this.scrollMarket = await response.json();
    } catch {
      try {
        const response = await fetch("data/scroll_market.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`scroll market snapshot failed: ${response.status}`);
        this.scrollMarket = await response.json();
      } catch {
        this.scrollMarket = { items: [], summary: { count: 0 }, servers: [], recentHistory: [] };
      }
    }
    this.render();
  }

  async loadItems() {
    try {
      const response = await fetch(api("/items"), { cache: "no-store" });
      const payload = await response.json();
      this.catalogItems = Array.isArray(payload.items) ? payload.items : [];
    } catch {
      this.catalogItems = [];
    }
    if (!this.catalogItems.some((item) => item.library === this.itemLibrary)) {
      this.itemLibrary = this.catalogItems.find((item) => item.library === "物品库")?.library ?? this.catalogItems[0]?.library ?? "物品库";
    }
    this.render();
  }

  async loadSiteConfig() {
    try {
      const response = await fetch(api("/site-config"), { cache: "no-store" });
      this.siteConfig = this.normalizeSiteConfig(await response.json());
    } catch {
      this.siteConfig = { marketWatchlist: [], homeRecommendations: [], homeRecommendationSortMode: "volatility", itemTaxonomy: this.defaultItemTaxonomy() };
    }
    this.render();
  }

  async loadMonsters() {
    try {
      const response = await fetch(api("/monsters"), { cache: "no-store" });
      const payload = await response.json();
      const nextItems = Array.isArray(payload.items) ? payload.items : [];
      this.monsterItems = nextItems.filter((monster) => monster?.img);
    } catch {
      this.monsterItems = [];
    }
    if (!this.monsterItems.some((monster) => monster.id === this.selectedMonster)) {
      this.selectedMonster = this.monsterItems.find((monster) => Object.values(this.normalizeDrops(monster.drops)).some((items) => items.length))?.id ?? this.monsterItems[0]?.id ?? "";
    }
    this.render();
  }

  async loadNews() {
    try {
      const response = await fetch(api("/news"), { cache: "no-store" });
      const payload = await response.json();
      this.newsItems = Array.isArray(payload.items) ? payload.items : [];
      if (this.newsDetailId) {
        const detail = this.newsItems.map((item) => this.normalizeNewsItem(item)).find((item) => item.id === this.newsDetailId);
        const targetSection = detail?.channel === "guide" ? "开荒" : "资讯";
        if (detail && this.active !== targetSection) {
          this.active = targetSection;
          history.replaceState(null, "", `#${encodeURIComponent(`${targetSection}/${detail.id}`)}`);
        }
      }
    } catch {
      this.newsItems = [];
    }
    this.render();
  }

  async loadAdminState() {
    try {
      const response = await fetch(api("/me"), { cache: "no-store" });
      const payload = await response.json();
      this.isLoggedIn = !!payload.authenticated;
      this.currentUser = payload.username || "";
      this.currentDisplayName = payload.displayName || payload.username || "";
      this.currentRole = payload.role || "guest";
      this.currentRoles = Array.isArray(payload.roles) ? payload.roles : [];
      this.avatarColor = payload.avatarColor || "#0b9ed5";
      this.avatarUrl = payload.avatarUrl || "";
      this.profileBio = payload.bio || "";
      this.isAdmin = !!payload.admin;
      this.isModerator = !!payload.moderator || !!payload.admin;
    } catch {
      this.isLoggedIn = false;
      this.currentUser = "";
      this.currentDisplayName = "";
      this.currentRole = "guest";
      this.currentRoles = [];
      this.avatarColor = "#0b9ed5";
      this.avatarUrl = "";
      this.profileBio = "";
      this.isAdmin = false;
      this.isModerator = false;
    }
    this.render();
  }

  defaultNewsItems() {
    return [];
  }

  defaultItemTaxonomy() {
    return {
      libraries: ["物品库", "装备库"],
      itemCategories: ["消耗品", "设置", "其他", "特殊"],
      equipmentCategories: ["装备", "特殊"],
      kinds: ["行情观察", "开荒常用", "热门", "高等级", "任务", "其他"],
    };
  }

  normalizeSiteConfig(config = {}) {
    const defaults = this.defaultItemTaxonomy();
    const taxonomy = config.itemTaxonomy || {};
    const cleanList = (values, fallback) => {
      const source = Array.isArray(values) ? values : fallback;
      return [...new Set(source.map((value) => String(value || "").trim()).filter(Boolean))];
    };
    return {
      ...config,
      marketWatchlist: Array.isArray(config.marketWatchlist) ? config.marketWatchlist : [],
      homeRecommendations: Array.isArray(config.homeRecommendations) ? config.homeRecommendations : [],
      homeRecommendationSortMode: config.homeRecommendationSortMode === "manual" ? "manual" : "volatility",
      itemTaxonomy: {
        libraries: cleanList(taxonomy.libraries, defaults.libraries),
        itemCategories: cleanList(taxonomy.itemCategories, defaults.itemCategories),
        equipmentCategories: cleanList(taxonomy.equipmentCategories, defaults.equipmentCategories),
        kinds: cleanList(taxonomy.kinds, defaults.kinds),
      },
    };
  }

  getItemTaxonomy() {
    return this.normalizeSiteConfig(this.siteConfig).itemTaxonomy;
  }

  setActive(name) {
    if (name === "资讯" && !this.isLoggedIn) {
      this.newsSoonOpen = true;
      this.render();
      return;
    }
    if (name === "管理" && !this.isAdmin) return;
    this.active = name;
    this.newsDetailId = "";
    history.replaceState(null, "", `#${encodeURIComponent(name)}`);
    this.render();
  }

  openUserCenter(section = "overview") {
    if (!this.isLoggedIn) {
      this.openLogin();
      return;
    }
    this.accountMenuOpen = false;
    this.userSection = section;
    this.active = "我的主页";
    this.newsDetailId = "";
    history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
    this.render();
  }

  openNewsDetail(id) {
    if (!id) return;
    const item = (this.newsItems || []).map((entry) => this.normalizeNewsItem(entry)).find((entry) => entry.id === id);
    this.active = item?.channel === "guide" ? "开荒" : "资讯";
    this.newsDetailId = id;
    history.replaceState(null, "", `#${encodeURIComponent(`${this.active}/${id}`)}`);
    this.render();
  }

  closeNewsDetail() {
    this.newsDetailId = "";
    history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
    this.render();
  }

  setMarketCategory(category) {
    this.marketCategory = category;
    this.selectedId = this.getMarketInstruments().find((item) => item.category === category)?.id ?? this.selectedId;
    this.render();
  }

  openGoldMarket() {
    const listings = this.goldMarket?.items || [];
    const homeServerKey = this.getHomeGoldServerKey(listings);
    const homeListing = listings.find((item) => this.goldServerKey(item) === homeServerKey);
    this.marketCategory = "金币汇率";
    this.goldServerFilter = homeServerKey || "全部";
    this.goldEditionFilter = homeListing ? this.goldEdition(homeListing) : "怀旧服";
    this.goldSelectedListingId = "";
    this.active = "行情";
    history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
    this.render();
    requestAnimationFrame(() => this.querySelector(".gold-console")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  openHomeMarketItem(itemId) {
    const id = String(itemId || "");
    const item = this.getHomeMarketInstruments().find((entry) => String(entry.id) === id);
    if (!item) return;
    if (this.isGoldRecommendationId(id)) {
      this.marketCategory = "金币汇率";
      this.goldServerFilter = item.goldServerKey || id.slice(5);
      this.goldEditionFilter = item.goldEdition || "怀旧服";
      this.goldSelectedListingId = "";
    } else {
      this.marketCategory = item.category;
      this.selectedId = id;
      if (item.category === "飞镖" && item.marketServerKey) this.dartServerFilter = item.marketServerKey;
    }
    this.active = "行情";
    history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
    this.render();
    requestAnimationFrame(() => this.querySelector(".market-console, .gold-console")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  runGlobalSearch(value) {
    const query = String(value || "").trim();
    this.globalQuery = query;
    if (!query) {
      this.render();
      return;
    }
    const lower = query.toLowerCase();
    if (/(金币|汇率|金价|比例|g买卖|gmmsj)/i.test(query)) {
      this.marketCategory = "金币汇率";
      this.active = "行情";
      history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
      this.render();
      return;
    }
    const monsterMatch = this.findMonsterBySearch(lower);
    const itemMatch = this.findItemBySearch(lower);
    if (monsterMatch && (!itemMatch || this.monsterSearchScore(monsterMatch, lower) >= this.itemSearchScore(itemMatch, lower))) {
      this.selectedMonster = monsterMatch.id;
      this.monsterQuery = query;
      this.active = "图鉴";
      history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
      this.render();
      return;
    }
    if (itemMatch) {
      this.itemLibrary = itemMatch.library || this.itemLibrary;
      this.itemCategory = "全部";
      this.itemKind = this.inferItemKind(itemMatch);
      this.itemQuery = query;
      this.openItemId = itemMatch.id || itemMatch.code || "";
      this.active = "物品";
      history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
      this.render();
      return;
    }
    this.monsterQuery = query;
    this.itemQuery = query;
    this.active = "图鉴";
    history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
    this.render();
  }

  findMonsterBySearch(query) {
    return (this.monsterItems || [])
      .map((monster) => ({ monster, score: this.monsterSearchScore(monster, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (Number(a.monster.level) || 0) - (Number(b.monster.level) || 0))[0]?.monster || null;
  }

  monsterSearchScore(monster, query) {
    const fields = [
      [monster.name, 100],
      [monster.nameEn, 70],
      [monster.map, 55],
      [(monster.maps || []).map((map) => `${map.name} ${map.nameEn}`).join(" "), 40],
      [(monster.attributes || []).join(" "), 35],
      [Object.values(this.normalizeDrops(monster.drops)).flat().map((item) => typeof item === "string" ? item : `${item.name} ${item.nameEn} ${item.id}`).join(" "), 25],
    ];
    return fields.reduce((best, [text, score]) => String(text || "").toLowerCase().includes(query) ? Math.max(best, score) : best, 0);
  }

  findItemBySearch(query) {
    return (this.catalogItems || [])
      .map((item) => ({ item, score: this.itemSearchScore(item, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.item || null;
  }

  itemSearchScore(item, query) {
    const fields = [
      [item.name, 100],
      [item.nameEn, 70],
      [item.id, 65],
      [item.code, 65],
      [item.subCategory, 45],
      [item.kind, 35],
      [item.description, 30],
    ];
    return fields.reduce((best, [text, score]) => String(text || "").toLowerCase().includes(query) ? Math.max(best, score) : best, 0);
  }

  inferItemKind(item) {
    const text = `${item.name || ""} ${item.nameEn || ""} ${item.kind || ""} ${item.subCategory || ""}`.toLowerCase();
    if (item.scroll || item.name?.includes("卷轴") || text.includes("scroll")) return "卷轴";
    if (item.name?.includes("镖") || text.includes("throwing")) return "飞镖";
    if (item.name?.includes("药水") || text.includes("potion")) return "药水";
    if (item.library === "装备库" && item.subCategory === "武器") return "武器";
    if (item.library === "装备库" && ["帽子", "上衣", "裤裙", "套服", "鞋子", "手套", "盾牌", "披风", "耳环"].includes(item.subCategory)) return "防具";
    return "全部";
  }

  getHomeRecommendations() {
    const watchlist = (this.siteConfig.marketWatchlist || []).map(String);
    const configured = Array.isArray(this.siteConfig.homeRecommendations)
      ? this.siteConfig.homeRecommendations
        .map((entry, index) => ({
          itemId: String(entry.itemId || entry.id || ""),
          subtitle: String(entry.subtitle || ""),
          badge: String(entry.badge || "观察中"),
          position: Number(entry.position) || index + 1,
          showChange: entry.showChange !== false,
        }))
        .filter((entry) => entry.itemId)
        .sort((a, b) => a.position - b.position)
      : [];
    if (configured.length) return configured;
    return watchlist.map((itemId, index) => ({
      itemId,
      subtitle: "",
      badge: "观察中",
      position: index + 1,
      showChange: true,
    }));
  }

  isGoldRecommendationId(itemId) {
    return String(itemId || "").startsWith("gold:");
  }

  getGoldRecommendationCandidates() {
    const recommendationMap = new Map(this.getHomeRecommendations().map((entry) => [entry.itemId, entry]));
    const allListings = this.goldMarket?.items || [];
    return this.getGoldServerOptions(allListings).map((option) => {
      const listings = allListings.filter((item) => this.goldServerKey(item) === option.key);
      const effectiveListings = this.getEffectiveGoldListings(listings);
      const best = effectiveListings[0] || listings[0] || null;
      if (!best) return null;
      const recommendation = recommendationMap.get(`gold:${option.key}`) || {};
      const changePercent = this.getGoldDailyChange(best);
      return {
        id: `gold:${option.key}`,
        name: `${best.server || option.label}金币汇率`,
        short: best.server || option.label,
        category: "金币汇率",
        img: goldIcon,
        tags: `${this.goldEdition(best)} / ${best.area || "国服"}`,
        heat: best ? "实时汇率" : "暂无报价",
        reference: Number(best.pricePerYi) > 0 ? `¥${Number(best.pricePerYi).toFixed(3)} / ${best.unit || "万金"}` : "暂无报价",
        homeReference: Number(best.pricePerYi) > 0 ? `¥${Number(best.pricePerYi).toFixed(3)} / ${best.unit || "万金"}` : "暂无报价",
        homeListingCount: effectiveListings.length || listings.length,
        reason: recommendation.subtitle || `${best.server || option.label}金币汇率`,
        recommendationSubtitle: recommendation.subtitle || "实时汇率",
        showChange: recommendation.showChange !== false,
        changePercent,
        goldServerKey: option.key,
        goldEdition: this.goldEdition(best),
      };
    }).filter(Boolean);
  }

  getDartRecommendationStats(dartId) {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const listings = (this.dartMarket?.items || []).filter((item) => String(item.dartId) === String(dartId));
    const serverKeys = new Set([
      ...listings.map((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}`),
      ...(this.dartMarket?.recentHistory || []).filter((row) => String(row.dartId) === String(dartId)).map((row) => row.serverKey),
    ]);
    const stats = [...serverKeys].map((serverKey) => {
      const history = (this.dartMarket?.recentHistory || [])
        .filter((row) => String(row.dartId) === String(dartId) && row.serverKey === serverKey)
        .map((row) => ({ time: new Date(row.sampledAt).getTime(), price: Number(row.minPrice || 0) }))
        .filter((row) => Number.isFinite(row.time) && row.time >= cutoff && row.price > 0)
        .sort((a, b) => a.time - b.time);
      const currentListings = listings
        .filter((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}` === serverKey)
        .sort((a, b) => Number(a.priceCny) - Number(b.priceCny));
      const latest = Number(currentListings[0]?.priceCny || history[history.length - 1]?.price || 0);
      const open = Number(history[0]?.price || 0);
      const changePercent = history.length > 1 && open > 0 ? ((latest - open) / open) * 100 : null;
      return { serverKey, changePercent, listingCount: currentListings.length, latest };
    });
    return stats.sort((a, b) => {
      const aHasChange = Number.isFinite(a.changePercent);
      const bHasChange = Number.isFinite(b.changePercent);
      if (aHasChange !== bHasChange) return aHasChange ? -1 : 1;
      if (aHasChange) return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      return b.listingCount - a.listingCount || a.latest - b.latest;
    })[0] || { serverKey: this.dartServerFilter, changePercent: null, listingCount: 0, latest: 0 };
  }

  getScrollRecommendationStats(scrollId) {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const listings = (this.scrollMarket?.items || []).filter((item) => String(item.scrollId) === String(scrollId));
    const serverKeys = new Set([
      ...listings.map((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}`),
      ...(this.scrollMarket?.recentHistory || []).filter((row) => String(row.scrollId) === String(scrollId)).map((row) => row.serverKey),
    ]);
    const stats = [...serverKeys].map((serverKey) => {
      const history = (this.scrollMarket?.recentHistory || [])
        .filter((row) => String(row.scrollId) === String(scrollId) && row.serverKey === serverKey)
        .map((row) => ({ time: new Date(row.sampledAt).getTime(), price: Number(row.minPrice || 0) }))
        .filter((row) => Number.isFinite(row.time) && row.time >= cutoff && row.price > 0)
        .sort((a, b) => a.time - b.time);
      const currentListings = listings
        .filter((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}` === serverKey)
        .sort((a, b) => Number(a.priceCny) - Number(b.priceCny));
      const latest = Number(currentListings[0]?.priceCny || history[history.length - 1]?.price || 0);
      const open = Number(history[0]?.price || 0);
      const changePercent = history.length > 1 && open > 0 ? ((latest - open) / open) * 100 : null;
      return { serverKey, changePercent, listingCount: currentListings.length, latest };
    });
    return stats.sort((a, b) => {
      const aHasChange = Number.isFinite(a.changePercent);
      const bHasChange = Number.isFinite(b.changePercent);
      if (aHasChange !== bHasChange) return aHasChange ? -1 : 1;
      if (aHasChange) return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      return b.listingCount - a.listingCount || a.latest - b.latest;
    })[0] || { serverKey: this.scrollServerFilter, changePercent: null, listingCount: 0, latest: 0 };
  }

  get selectedItem() {
    const items = this.getMarketInstruments();
    return items.find((item) => item.id === this.selectedId) ?? items[0] ?? marketItems[0];
  }

  getMarketInstruments() {
    const recommendationMap = new Map(this.getHomeRecommendations().map((entry) => [entry.itemId, entry]));
    const configured = (this.siteConfig.marketWatchlist || [])
      .map((id) => this.findItem(id))
      .filter(Boolean)
      .map((item) => {
        const recommendation = recommendationMap.get(String(item.id)) || {
          subtitle: "",
          badge: "观察中",
          showChange: false,
        };
        return {
        id: String(item.id),
        name: item.name,
        short: item.name.replace(/卷轴[:：]?/g, "").slice(0, 12),
        category: item.kind === "飞镖" ? "飞镖" : "卷轴",
        img: item.img,
        tags: [item.kind, item.subCategory, item.category].filter(Boolean).join(" / "),
        heat: recommendation.badge || "观察中",
        risk: "待定",
        reference: "暂无报价",
        reason: recommendation.subtitle || item.description || "已从行情宝库加入热门观察。",
        drivers: ["供给数量", "玩家需求", "掉落来源", "金币汇率"],
        recommendationSubtitle: recommendation.subtitle,
        showChange: recommendation.showChange,
        changePercent: item.changePercent ?? item.market?.changePercent ?? null,
        };
    });
    const instruments = configured.length ? configured : marketItems;
    const dartListings = this.dartMarket?.items || [];
    const scrollListings = this.scrollMarket?.items || [];
    return instruments.map((instrument) => {
      if (instrument.category === "卷轴") {
        const listings = scrollListings.filter((listing) => String(listing.scrollId) === String(instrument.id));
        const prices = listings.map((listing) => Number(listing.priceCny)).filter((price) => price > 0);
        const lowest = prices.length ? Math.min(...prices) : 0;
        const stats = this.getScrollRecommendationStats(instrument.id);
        return {
          ...instrument,
          reference: lowest ? `¥${lowest.toFixed(0)} 起` : "暂无报价",
          sampleCount: listings.length,
          heat: listings.length ? "已有报价" : "暂无报价",
          changePercent: stats.changePercent,
          marketServerKey: stats.serverKey,
          homeReference: stats.latest ? `¥${Number(stats.latest).toFixed(2)}` : "暂无报价",
          homeListingCount: stats.listingCount,
        };
      }
      if (instrument.category !== "飞镖") return instrument;
      const listings = dartListings.filter((listing) => String(listing.dartId) === String(instrument.id));
      const prices = listings.map((listing) => Number(listing.priceCny)).filter((price) => price > 0);
      const lowest = prices.length ? Math.min(...prices) : 0;
      const stats = this.getDartRecommendationStats(instrument.id);
      return {
        ...instrument,
        reference: lowest ? `¥${lowest.toFixed(0)} 起` : "暂无报价",
        sampleCount: listings.length,
        heat: listings.length >= 15 ? "交易活跃" : listings.length ? "已有报价" : "暂无报价",
        changePercent: stats.changePercent,
        marketServerKey: stats.serverKey,
        homeReference: stats.latest ? `¥${Number(stats.latest).toFixed(2)}` : "暂无报价",
        homeListingCount: stats.listingCount,
      };
    });
  }

  getHomeMarketInstruments() {
    const marketById = new Map(this.getMarketInstruments().map((item) => [String(item.id), item]));
    const goldById = new Map(this.getGoldRecommendationCandidates().map((item) => [String(item.id), item]));
    const rows = this.getHomeRecommendations()
      .map((entry) => {
        const instrument = marketById.get(String(entry.itemId)) || goldById.get(String(entry.itemId));
        return instrument ? { ...instrument, recommendation: entry, recommendationSubtitle: entry.subtitle || instrument.recommendationSubtitle, showChange: entry.showChange !== false } : null;
      })
      .filter(Boolean)
      .filter((item, index, list) => !this.isGoldRecommendationId(item.id) || list.slice(0, index).filter((entry) => this.isGoldRecommendationId(entry.id)).length < 2);
    if (this.siteConfig.homeRecommendationSortMode !== "volatility") return rows;
    return rows.sort((a, b) => {
      const aChange = Number(a.changePercent);
      const bChange = Number(b.changePercent);
      const aHasChange = a.changePercent !== null && a.changePercent !== undefined && a.changePercent !== "" && Number.isFinite(aChange);
      const bHasChange = b.changePercent !== null && b.changePercent !== undefined && b.changePercent !== "" && Number.isFinite(bChange);
      if (aHasChange !== bHasChange) return aHasChange ? -1 : 1;
      if (aHasChange && Math.abs(aChange) !== Math.abs(bChange)) return Math.abs(bChange) - Math.abs(aChange);
      return Number(a.recommendation?.position || 0) - Number(b.recommendation?.position || 0);
    });
  }

  getRecommendationInstrument(itemId) {
    const id = String(itemId || "");
    return this.getMarketInstruments().find((item) => String(item.id) === id)
      || this.getGoldRecommendationCandidates().find((item) => String(item.id) === id)
      || null;
  }

  getCountdown() {
    if (!launchAt) return null;
    const diff = Math.max(0, Date.now() - launchAt.getTime());
    return {
      day: Math.floor(diff / 86400000),
      hour: Math.floor((diff % 86400000) / 3600000),
      minute: Math.floor((diff % 3600000) / 60000),
      second: Math.floor((diff % 60000) / 1000),
    };
  }

  updateCountdown() {
    const node = this.querySelector("[data-countdown]");
    if (node) node.innerHTML = this.renderCountdown(this.getCountdown());
  }

  captureRenderState() {
    const active = document.activeElement;
    const state = {
      windowX: window.scrollX,
      windowY: window.scrollY,
      focusKey: active?.dataset?.focusKey || "",
      selectionStart: typeof active?.selectionStart === "number" ? active.selectionStart : null,
      selectionEnd: typeof active?.selectionEnd === "number" ? active.selectionEnd : null,
      scroll: {},
      forms: {},
    };
    this.querySelectorAll("[data-preserve-form]").forEach((form) => {
      const key = form.dataset.preserveForm;
      const values = {};
      form.querySelectorAll("input[name], textarea[name], select[name]").forEach((field) => {
        if (field.type === "file") return;
        if (field.type === "checkbox") {
          if (!values[field.name]) values[field.name] = [];
          if (field.checked) values[field.name].push(field.value);
          return;
        }
        values[field.name] = field.value;
      });
      state.forms[key] = values;
    });
    this.querySelectorAll("[data-scroll-key]").forEach((node) => {
      state.scroll[node.dataset.scrollKey] = {
        top: node.scrollTop,
        left: node.scrollLeft,
      };
    });
    return state;
  }

  restoreRenderState(state) {
    if (!state) return;
    Object.entries(state.scroll || {}).forEach(([key, position]) => {
      const node = this.querySelector(`[data-scroll-key="${CSS.escape(key)}"]`);
      if (node) {
        node.scrollTop = position.top;
        node.scrollLeft = position.left;
      }
    });
    Object.entries(state.forms || {}).forEach(([key, values]) => {
      const form = this.querySelector(`[data-preserve-form="${CSS.escape(key)}"]`);
      if (!form) return;
      Object.entries(values).forEach(([name, value]) => {
        form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach((field) => {
          if (field.type === "file") return;
          if (field.type === "checkbox") {
            field.checked = Array.isArray(value) && value.includes(field.value);
          } else {
            field.value = value;
          }
        });
      });
    });
    if (state.focusKey) {
      const input = this.querySelector(`[data-focus-key="${CSS.escape(state.focusKey)}"]`);
      if (input) {
        input.focus({ preventScroll: true });
        if (state.selectionStart !== null && typeof input.setSelectionRange === "function") {
          input.setSelectionRange(state.selectionStart, state.selectionEnd ?? state.selectionStart);
        }
      }
    }
    window.scrollTo({ left: state.windowX, top: state.windowY, behavior: "auto" });
    requestAnimationFrame(() => {
      Object.entries(state.scroll || {}).forEach(([key, position]) => {
        const node = this.querySelector(`[data-scroll-key="${CSS.escape(key)}"]`);
        if (node) {
          node.scrollTop = position.top;
          node.scrollLeft = position.left;
        }
      });
      window.scrollTo({ left: state.windowX, top: state.windowY, behavior: "auto" });
    });
  }

  bindComposedInput(selector, onValue) {
    this.querySelectorAll(selector).forEach((input) => {
      input.addEventListener("compositionstart", () => {
        input.dataset.composing = "true";
      });
      input.addEventListener("compositionend", () => {
        input.dataset.composing = "";
        onValue(input.value);
        this.render();
      });
      input.addEventListener("input", (event) => {
        if (event.isComposing || input.dataset.composing === "true") return;
        onValue(input.value);
        this.render();
      });
    });
  }

  render() {
    const renderState = this.captureRenderState();
    const visibleNavItems = this.isAdmin ? [...navItems, "管理"] : navItems;
    const publishLabel = this.active === "开荒" ? "发布攻略" : this.active === "资讯" ? "发布帖子" : "发布内容";
    this.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <div class="topbar-inner">
            <button class="brand" data-nav="首页" aria-label="回到首页">
              <img class="brand-mark" src="assets/monsters/mscw/0700000.png" alt="蘑菇王" />
              <span><span class="brand-name">冒险岛怀旧服行情站</span><span class="brand-sub">维多利亚实验室</span></span>
            </button>
            <nav class="nav">
              ${visibleNavItems.map((item) => `<button class="${this.active === item ? "active" : ""}" data-nav="${item}">${item}</button>`).join("")}
            </nav>
            <label class="top-search"><span>⌕</span><input data-global-search data-focus-key="global-search" value="${this.escapeHtml(this.globalQuery)}" placeholder="搜怪物、卷轴、飞镖、地图" /></label>
            <div class="top-actions">
              ${this.isLoggedIn ? `
                <button class="top-icon-btn" type="button" aria-label="搜索"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="M16 16l4 4"></path></svg></button>
                <button class="top-icon-btn" type="button" aria-label="通知"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg></button>
                <span class="top-action-divider"></span>
                <div class="account-entry" data-account-hover>
                  <button class="account-trigger" data-account-menu-toggle aria-expanded="${this.accountMenuOpen}">
                    ${this.renderAvatar("account-avatar")}
                  </button>
                  <div class="account-popover" role="menu">
                      <div class="account-profile">
                        ${this.renderAvatar("account-avatar large")}
                        <span>
                          <strong>${this.escapeHtml(this.currentDisplayName || this.currentUser)}</strong>
                          <small>${this.escapeHtml(this.getRoleLabel(this.currentRole))}</small>
                        </span>
                      </div>
                      <div class="account-menu">
                        <div class="account-section-link"><span>内容管理</span><button data-user-drafts>›</button></div>
                        <div class="account-balance-card"><span>已发布内容</span><strong>${this.getMyNewsItems().length}</strong><small>攻略 / 帖子</small></div>
                        <button data-user-home><i>▦</i><span>我的主页</span></button>
                        <button data-user-drafts><i>□</i><span>我的内容</span></button>
                        <button data-user-profile><i>⚙</i><span>账号设置</span></button>
                        ${this.isAdmin ? `<button data-account-go-admin><i>◇</i><span>进入管理</span></button>` : ""}
                        <button class="danger" data-account-logout><i>↪</i><span>退出登录</span></button>
                      </div>
                    </div>
                </div>
                <button class="top-publish-btn" data-user-publish-center>发布攻略</button>
              ` : `<div class="guest-actions"><button class="login-link-btn" data-open-login>登录</button><button class="register-btn" type="button" data-open-register>注册</button></div>`}
            </div>
          </div>
        </header>
        <main class="shell">${this.renderPage()}</main>
        ${this.renderTestingNotice()}
        ${this.renderScrollSoonModal()}
        ${this.renderNewsSoonModal()}
        ${this.renderLoginModal()}
        ${this.renderPublisherModal()}
        ${this.renderItemModal()}
        ${this.renderAdminDropPicker()}
      </div>
    `;

    this.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => this.setActive(button.dataset.nav)));
    this.querySelectorAll("[data-open-gold-market]").forEach((button) => button.addEventListener("click", () => this.openGoldMarket()));
    this.querySelectorAll("[data-home-market-item]").forEach((button) => button.addEventListener("click", () => this.openHomeMarketItem(button.dataset.homeMarketItem)));
    this.querySelectorAll("[data-market-category]").forEach((button) => button.addEventListener("click", () => this.setMarketCategory(button.dataset.marketCategory)));
    this.querySelectorAll("[data-market-id]").forEach((button) => button.addEventListener("click", () => { this.selectedId = button.dataset.marketId; this.render(); }));
    this.querySelectorAll("[data-gold-server]").forEach((button) => button.addEventListener("click", () => {
      this.goldServerFilter = button.dataset.goldServer;
      this.goldSelectedListingId = button.dataset.goldListingId || "";
      this.render();
    }));
    this.querySelectorAll("[data-gold-edition]").forEach((button) => button.addEventListener("click", () => {
      this.goldEditionFilter = button.dataset.goldEdition;
      this.goldServerFilter = "全部";
      this.goldSelectedListingId = "";
      this.render();
    }));
    this.querySelectorAll("[data-dart-server-select]").forEach((select) => select.addEventListener("change", () => {
      this.dartServerFilter = select.value;
      this.render();
    }));
    this.querySelectorAll("[data-dart-server]").forEach((button) => button.addEventListener("click", () => {
      this.dartServerFilter = button.dataset.dartServer;
      this.render();
    }));
    this.querySelectorAll("[data-scroll-server]").forEach((button) => button.addEventListener("click", () => {
      this.scrollServerFilter = button.dataset.scrollServer;
      this.render();
    }));
    this.querySelectorAll("[data-gold-range]").forEach((button) => button.addEventListener("click", () => {
      this.goldChartRange = button.dataset.goldRange;
      this.render();
    }));
    this.querySelectorAll("[data-gold-ranking-sort]").forEach((button) => button.addEventListener("click", () => {
      this.goldRankingSort = button.dataset.goldRankingSort;
      this.render();
    }));
    this.querySelectorAll(".gold-row-source").forEach((link) => link.addEventListener("click", (event) => event.stopPropagation()));
    this.querySelectorAll("[data-monster-id]").forEach((button) => button.addEventListener("click", () => {
      this.selectedMonster = button.dataset.monsterId;
      if (button.dataset.nav) {
        this.setActive(button.dataset.nav);
        return;
      }
      this.render();
    }));
    this.querySelectorAll("[data-monster-attr]").forEach((button) => button.addEventListener("click", () => { this.monsterAttribute = button.dataset.monsterAttr; this.render(); }));
    this.querySelectorAll("[data-monster-sort]").forEach((button) => button.addEventListener("click", () => { this.monsterSort = button.dataset.monsterSort; this.render(); }));
    this.querySelectorAll("[data-monster-filter-toggle]").forEach((button) => button.addEventListener("click", () => {
      this.monsterFiltersOpen = !this.monsterFiltersOpen;
      this.render();
    }));
    this.querySelectorAll("[data-monster-reset]").forEach((button) => button.addEventListener("click", () => {
      this.monsterBand = "全部";
      this.monsterAttribute = "全部";
      this.monsterSort = "默认";
      this.monsterQuery = "";
      this.monsterFiltersOpen = false;
      this.render();
    }));
    this.querySelectorAll("[data-monster-jump-level]").forEach((button) => button.addEventListener("click", () => {
      const level = Number(button.dataset.monsterJumpLevel || 25) || 25;
      this.monsterBand = this.getMonsterBandByLevel(level);
      this.monsterFocusLevel = level;
      this.render();
    }));
    this.querySelectorAll("[data-monster-band]").forEach((button) => button.addEventListener("click", () => { this.monsterBand = button.dataset.monsterBand; this.render(); }));
    this.querySelectorAll("[data-global-search]").forEach((input) => input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      this.runGlobalSearch(input.value);
    }));
    this.bindComposedInput("[data-monster-search]", (value) => { this.monsterQuery = value; });
    this.querySelectorAll("[data-item-library]").forEach((button) => button.addEventListener("click", () => { this.itemLibrary = button.dataset.itemLibrary; this.itemCategory = "全部"; this.itemKind = "全部"; this.render(); }));
    this.querySelectorAll("[data-item-category]").forEach((button) => button.addEventListener("click", () => { this.itemCategory = button.dataset.itemCategory; this.itemKind = "全部"; this.render(); }));
    this.querySelectorAll("[data-item-kind]").forEach((button) => button.addEventListener("click", () => { this.itemKind = button.dataset.itemKind; this.render(); }));
    this.bindComposedInput("[data-item-search]", (value) => { this.itemQuery = value; });
    this.querySelectorAll("[data-open-item]").forEach((button) => button.addEventListener("click", () => { this.openItemId = button.dataset.openItem; this.render(); }));
    this.querySelectorAll("[data-close-item]").forEach((button) => button.addEventListener("click", () => { this.openItemId = ""; this.render(); }));
    this.querySelectorAll("[data-delete-monster]").forEach((button) => button.addEventListener("click", () => this.deleteMonster(button.dataset.deleteMonster)));
    this.querySelectorAll("[data-scroll-rate]").forEach((button) => button.addEventListener("click", () => { this.scrollRate = Number(button.dataset.scrollRate); this.scrollLog = `${this.scrollRate}% 卷轴已放上去`; this.render(); }));
    this.querySelectorAll("[data-roll-scroll]").forEach((button) => button.addEventListener("click", () => this.rollScroll()));
    this.querySelectorAll("[data-open-login]").forEach((button) => button.addEventListener("click", () => this.openLogin()));
    this.querySelectorAll("[data-open-register]").forEach((button) => button.addEventListener("click", () => this.openRegister()));
    this.querySelectorAll("[data-close-login]").forEach((button) => button.addEventListener("click", () => this.closeLogin()));
    this.querySelectorAll("[data-close-testing-notice]").forEach((button) => button.addEventListener("click", () => {
      this.testingNoticeOpen = false;
      this.render();
    }));
    this.querySelectorAll("[data-testing-notice-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.testingNoticeOpen = false;
        this.render();
      }
    }));
    this.querySelectorAll("[data-scroll-soon]").forEach((button) => button.addEventListener("click", () => { this.scrollSoonOpen = true; this.render(); }));
    this.querySelectorAll("[data-close-scroll-soon]").forEach((button) => button.addEventListener("click", () => { this.scrollSoonOpen = false; this.render(); }));
    this.querySelectorAll("[data-scroll-soon-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.scrollSoonOpen = false;
        this.render();
      }
    }));
    this.querySelectorAll("[data-close-news-soon]").forEach((button) => button.addEventListener("click", () => { this.newsSoonOpen = false; this.render(); }));
    this.querySelectorAll("[data-news-soon-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.newsSoonOpen = false;
        this.render();
      }
    }));
    this.querySelectorAll("[data-auth-mode]").forEach((button) => button.addEventListener("click", () => {
      const mode = button.dataset.authMode;
      if (this.loginOpen && this.authMode !== "forgot" && (mode === "login" || mode === "register")) {
        this.switchAuthTab(mode);
      } else {
        this.authMode = mode;
        this.loginError = "";
        this.authCaptcha = this.makeCaptcha();
        this.render();
      }
    }));
    this.querySelectorAll("[data-refresh-captcha]").forEach((button) => button.addEventListener("click", () => {
      this.authCaptcha = this.makeCaptcha();
      this.loginError = "";
      if (this.loginOpen) {
        const captchaBtn = this.querySelector(".captcha-card");
        if (captchaBtn) captchaBtn.textContent = this.authCaptcha.text + " = ?";
        const errorEl = this.querySelector(".form-error");
        if (errorEl) errorEl.remove();
      } else {
        this.render();
      }
    }));
    this.querySelectorAll("[data-forgot-password]").forEach((button) => button.addEventListener("click", () => {
      this.authMode = "forgot";
      this.loginError = "";
      this.authCaptcha = this.makeCaptcha();
      this.render();
    }));
    this.querySelectorAll("[data-login-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitLogin(event)));
    this.querySelectorAll("[data-recovery-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitRecovery(event)));
    this.querySelectorAll("[data-account-menu-toggle]").forEach((button) => button.addEventListener("click", () => this.openUserCenter("overview")));
    this.querySelectorAll("[data-account-go-admin]").forEach((button) => button.addEventListener("click", () => {
      this.accountMenuOpen = false;
      this.setActive("管理");
    }));
    this.querySelectorAll("[data-account-logout]").forEach((button) => button.addEventListener("click", () => this.logout()));
    this.querySelectorAll("[data-user-home]").forEach((button) => button.addEventListener("click", () => this.openUserCenter("overview")));
    this.querySelectorAll("[data-user-drafts]").forEach((button) => button.addEventListener("click", () => this.openUserCenter("contents")));
    this.querySelectorAll("[data-user-profile]").forEach((button) => button.addEventListener("click", () => this.openUserCenter("profile")));
    this.querySelectorAll("[data-user-publish-center]").forEach((button) => button.addEventListener("click", () => this.openUserCenter("contents")));
    this.querySelectorAll("[data-user-section]").forEach((button) => button.addEventListener("click", () => { this.userSection = button.dataset.userSection; this.render(); }));
    this.querySelectorAll("[data-open-publisher]").forEach((button) => button.addEventListener("click", () => this.openPublisher(button.dataset.openPublisher)));
    this.querySelectorAll("[data-close-publisher]").forEach((button) => button.addEventListener("click", () => this.closePublisher()));
    this.querySelectorAll("[data-publisher-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitUserContent(event)));
    this.querySelectorAll("[data-profile-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitProfile(event)));
    this.querySelectorAll("[data-profile-avatar-file]").forEach((input) => input.addEventListener("change", (event) => this.pickProfileAvatar(event)));
    this.querySelectorAll("[data-news-status]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.updateNewsStatus(button.dataset.newsStatus, button.dataset.status);
    }));
    this.querySelectorAll("[data-news-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitNews(event)));
    this.querySelectorAll("[data-gold-admin-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitGoldSettings(event)));
    this.querySelectorAll("[data-admin-section]").forEach((button) => button.addEventListener("click", () => {
      this.adminSection = button.dataset.adminSection;
      this.render();
    }));
    this.bindComposedInput("[data-admin-query]", (value) => { this.adminQuery = value; });
    this.querySelectorAll("[data-admin-item-id]").forEach((button) => button.addEventListener("click", () => {
      this.adminSelectedItemId = button.dataset.adminItemId;
      this.adminItemDraftPreset = null;
      this.render();
    }));
    this.querySelectorAll("[data-admin-close-item-editor]").forEach((button) => button.addEventListener("click", () => {
      this.adminSelectedItemId = "";
      this.adminItemDraftPreset = null;
      this.render();
    }));
    this.querySelectorAll("[data-admin-item-editor-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.adminSelectedItemId = "";
        this.adminItemDraftPreset = null;
        this.render();
      }
    }));
    this.querySelectorAll("[data-admin-item-library]").forEach((button) => button.addEventListener("click", () => {
      this.adminItemLibrary = button.dataset.adminItemLibrary;
      this.adminItemCategory = "全部";
      this.adminItemKind = "全部";
      this.render();
    }));
    this.querySelectorAll("[data-admin-item-category]").forEach((button) => button.addEventListener("click", () => {
      this.adminItemCategory = button.dataset.adminItemCategory;
      this.adminItemKind = "全部";
      this.render();
    }));
    this.querySelectorAll("[data-admin-item-kind]").forEach((button) => button.addEventListener("click", () => {
      this.adminItemKind = button.dataset.adminItemKind;
      this.render();
    }));
    this.querySelectorAll("[data-admin-monster-id]").forEach((button) => button.addEventListener("click", () => {
      this.adminSelectedMonsterId = button.dataset.adminMonsterId;
      this.adminMonsterDraft = null;
      this.adminMonsterFieldDraft = null;
      this.render();
    }));
    this.querySelectorAll("[data-admin-new-item]").forEach((button) => button.addEventListener("click", () => {
      this.openAdminNewItem(button.dataset.adminNewItem === "slot");
    }));
    this.querySelectorAll("[data-admin-new-item-slot]").forEach((button) => button.addEventListener("click", () => this.openAdminNewItem(true)));
    this.querySelectorAll("[data-admin-new-monster]").forEach((button) => button.addEventListener("click", () => {
      this.adminSelectedMonsterId = "__new__";
      this.adminMonsterDraft = null;
      this.adminMonsterFieldDraft = null;
      this.render();
    }));
    this.querySelectorAll("[data-admin-close-monster-editor]").forEach((button) => button.addEventListener("click", () => {
      this.adminSelectedMonsterId = "";
      this.adminMonsterDraft = null;
      this.adminMonsterFieldDraft = null;
      this.render();
    }));
    this.querySelectorAll("[data-admin-monster-editor-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.adminSelectedMonsterId = "";
        this.adminMonsterDraft = null;
        this.adminMonsterFieldDraft = null;
        this.render();
      }
    }));
    this.querySelectorAll("[data-admin-item-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitAdminItem(event)));
    this.querySelectorAll("[data-admin-monster-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitAdminMonster(event)));
    this.querySelectorAll("[data-admin-config-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitAdminConfig(event)));
    this.querySelectorAll("[data-admin-taxonomy-add]").forEach((button) => button.addEventListener("click", () => this.addAdminTaxonomyValue(button.dataset.adminTaxonomyAdd)));
    this.querySelectorAll("[data-admin-taxonomy-remove]").forEach((button) => button.addEventListener("click", () => this.removeAdminTaxonomyValue(button.dataset.group, button.dataset.adminTaxonomyRemove)));
    this.querySelectorAll("[data-admin-taxonomy-rename]").forEach((button) => button.addEventListener("click", () => this.renameAdminTaxonomyValue(button.dataset.group, button.dataset.adminTaxonomyRename)));
    this.querySelectorAll("[data-admin-open-taxonomy]").forEach((button) => button.addEventListener("click", () => {
      this.adminTaxonomyOpen = true;
      this.render();
    }));
    this.querySelectorAll("[data-admin-close-taxonomy]").forEach((button) => button.addEventListener("click", () => {
      this.adminTaxonomyOpen = false;
      this.render();
    }));
    this.querySelectorAll("[data-admin-taxonomy-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        this.adminTaxonomyOpen = false;
        this.render();
      }
    }));
    this.querySelectorAll("[data-admin-recommendation-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitAdminRecommendation(event)));
    this.querySelectorAll("[data-admin-home-rate-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitHomeRateDisplay(event)));
    this.querySelectorAll("[data-admin-recommend-edit]").forEach((button) => button.addEventListener("click", () => this.openAdminRecommendEditor(button.dataset.adminRecommendEdit)));
    this.querySelectorAll("[data-admin-recommend-add-slot]").forEach((button) => button.addEventListener("click", () => this.openAdminRecommendAdder()));
    this.querySelectorAll("[data-admin-recommend-add-gold]").forEach((button) => button.addEventListener("click", () => this.openAdminRecommendAdder("金币")));
    this.querySelectorAll("[data-admin-recommend-close]").forEach((button) => button.addEventListener("click", () => this.closeAdminRecommendModal()));
    this.querySelectorAll("[data-admin-recommend-overlay]").forEach((overlay) => overlay.addEventListener("click", (event) => {
      if (event.target === overlay) this.closeAdminRecommendModal();
    }));
    this.bindComposedInput("[data-admin-recommend-add-query]", (value) => { this.adminRecommendModal.query = value; });
    this.querySelectorAll("[data-admin-recommend-kind]").forEach((button) => button.addEventListener("click", () => {
      this.adminRecommendModal.kind = button.dataset.adminRecommendKind;
      this.render();
    }));
    this.querySelectorAll("[data-admin-recommend-add]").forEach((button) => button.addEventListener("click", () => this.addHomeRecommendation(button.dataset.adminRecommendAdd)));
    this.querySelectorAll("[data-admin-recommend-remove]").forEach((button) => button.addEventListener("click", () => this.removeHomeRecommendation(button.dataset.adminRecommendRemove)));
    this.querySelectorAll("[data-admin-recommend-sort-mode]").forEach((button) => button.addEventListener("click", () => this.setHomeRecommendationSortMode(button.dataset.adminRecommendSortMode)));
    this.querySelectorAll("[data-admin-recommend-move]").forEach((button) => button.addEventListener("click", () => this.moveHomeRecommendation(button.dataset.adminRecommendMove, Number(button.dataset.direction || 0))));
    this.querySelectorAll("[data-admin-delete-item]").forEach((button) => button.addEventListener("click", () => this.deleteAdminItem(button.dataset.adminDeleteItem)));
    this.querySelectorAll("[data-admin-watch-toggle]").forEach((button) => button.addEventListener("click", () => this.toggleMarketWatchItem(button.dataset.adminWatchToggle)));
    this.querySelectorAll("[data-admin-kind-set]").forEach((button) => button.addEventListener("click", () => this.setAdminItemKind(button.dataset.adminKindSet, button.dataset.kind)));
    this.querySelectorAll("[data-admin-open-picker]").forEach((button) => button.addEventListener("click", () => this.openAdminDropPicker(button.dataset.adminOpenPicker)));
    this.querySelectorAll("[data-admin-close-picker]").forEach((button) => button.addEventListener("click", () => this.closeAdminDropPicker()));
    this.bindComposedInput("[data-admin-picker-query]", (value) => { this.adminDropPicker.query = value; });
    this.querySelectorAll("[data-admin-picker-type]").forEach((button) => button.addEventListener("click", () => {
      this.adminDropPicker.type = button.dataset.adminPickerType;
      this.render();
    }));
    this.querySelectorAll("[data-admin-picker-item]").forEach((button) => button.addEventListener("click", () => this.toggleAdminPickerItem(button.dataset.adminPickerItem)));
    this.querySelectorAll("[data-admin-confirm-picker]").forEach((button) => button.addEventListener("click", () => this.confirmAdminDropPicker()));
    this.querySelectorAll("[data-admin-remove-drop]").forEach((button) => button.addEventListener("click", () => this.removeAdminDrop(button.dataset.group, button.dataset.adminRemoveDrop)));
    this.querySelectorAll("[data-admin-attribute]").forEach((button) => button.addEventListener("click", () => this.toggleAdminAttribute(button.dataset.adminAttribute)));
    this.querySelectorAll("[data-open-news]").forEach((node) => node.addEventListener("click", () => this.openNewsDetail(node.dataset.openNews)));
    this.querySelectorAll("[data-close-news-detail]").forEach((button) => button.addEventListener("click", () => this.closeNewsDetail()));
    this.querySelectorAll("[data-news-link]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      window.open(button.dataset.newsLink, "_blank", "noopener");
    }));
    this.querySelectorAll("[data-news-like]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.likeNews(button.dataset.newsLike);
    }));
    this.querySelectorAll("[data-news-comment-toggle]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.newsCommentOpen = this.newsCommentOpen === button.dataset.newsCommentToggle ? "" : button.dataset.newsCommentToggle;
      this.render();
    }));
    this.querySelectorAll("[data-news-comment-form]").forEach((form) => form.addEventListener("submit", (event) => this.submitNewsComment(event)));
    this.querySelectorAll("[data-news-edit]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.newsDraftId = button.dataset.newsEdit;
      this.render();
    }));
    this.querySelectorAll("[data-news-cancel-edit]").forEach((button) => button.addEventListener("click", () => {
      this.newsDraftId = "";
      this.render();
    }));
    this.querySelectorAll("[data-news-delete]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.deleteNews(button.dataset.newsDelete);
    }));
    this.querySelectorAll("[data-news-cover-file]").forEach((input) => input.addEventListener("change", (event) => this.uploadNewsCover(event)));
    this.querySelectorAll("[data-news-auto-cover]").forEach((button) => button.addEventListener("click", () => this.autoFillNewsCover()));
    this.restoreRenderState(renderState);
    requestAnimationFrame(() => this.mountGoldLightweightChart());
  }

  openLogin() {
    this.loginOpen = true;
    this.authMode = "login";
    this.loginError = "";
    this.authCaptcha = this.makeCaptcha();
    this.render();
  }

  openRegister() {
    this.loginOpen = true;
    this.authMode = "register";
    this.loginError = "";
    this.authCaptcha = this.makeCaptcha();
    this.render();
  }

  closeLogin() {
    this.loginOpen = false;
    this.loginError = "";
    this.render();
  }

  getRoleLabel(role) {
    return ({ admin: "管理员", moderator: "版主", author: "攻略作者", player: "枫岛玩家", guest: "游客" })[role] || "枫岛玩家";
  }

  makeCaptcha() {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 7) + 3;
    return { text: `${a} + ${b}`, answer: String(a + b) };
  }

  validateCaptcha(value) {
    return String(value || "").trim() === String(this.authCaptcha?.answer || "");
  }

  renderAvatar(className = "account-avatar") {
    const name = this.currentDisplayName || this.currentUser || "U";
    const img = this.avatarUrl ? `<img src="${this.escapeHtml(this.avatarUrl)}" alt="" />` : this.escapeHtml(name.slice(0, 1));
    return `<span class="${className}" style="background:${this.escapeHtml(this.avatarColor)}">${img}</span>`;
  }

  openPublisher(channel = "") {
    if (!this.isLoggedIn) {
      this.openLogin();
      return;
    }
    this.publisherOpen = true;
    this.publisherChannel = channel || (this.active === "开荒" ? "guide" : "community");
    this.loginError = "";
    this.render();
  }

  closePublisher() {
    this.publisherOpen = false;
    this.loginError = "";
    this.render();
  }

  async submitLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const username = String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const displayName = String(fd.get("displayName") || username).trim();
    const confirmPassword = String(fd.get("confirmPassword") || "").trim();
    const captcha = String(fd.get("captcha") || "").trim();
    const recoveryQuestion = String(fd.get("recoveryQuestion") || "").trim();
    const recoveryAnswer = String(fd.get("recoveryAnswer") || "").trim();
    const remember = fd.get("remember") === "on";
    const role = "player";
    const inviteCode = String(fd.get("inviteCode") || "").trim();
    if (!username || !password) {
      this.loginError = "请输入账号和密码。";
      this.render();
      return;
    }
    if (!this.validateCaptcha(captcha)) {
      this.loginError = "验证码不正确，请重新输入。";
      this.authCaptcha = this.makeCaptcha();
      this.render();
      return;
    }
    if (this.authMode === "register") {
      if (password !== confirmPassword) {
        this.loginError = "两次输入的密码不一致。";
        this.render();
        return;
      }
      if (!recoveryQuestion || !recoveryAnswer) {
        this.loginError = "请选择找回密码问题，并填写答案。";
        this.render();
        return;
      }
      if (!inviteCode) {
        this.loginError = "测试阶段注册需要填写邀请码。";
        this.render();
        return;
      }
    }
    this.loginBusy = true;
    this.render();
    try {
      const response = await fetch(api(this.authMode === "register" ? "/register" : "/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, displayName, role, recoveryQuestion, recoveryAnswer, inviteCode }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "登录失败");
      this.isLoggedIn = true;
      this.currentUser = payload.username || username;
      this.currentDisplayName = payload.displayName || payload.username || username;
      this.currentRole = payload.role || role || "player";
      this.currentRoles = Array.isArray(payload.roles) ? payload.roles : [];
      this.avatarColor = payload.avatarColor || "#0b9ed5";
      this.avatarUrl = payload.avatarUrl || "";
      this.profileBio = payload.bio || "";
      this.isAdmin = !!payload.admin;
      this.isModerator = !!payload.moderator || !!payload.admin;
      this.loginOpen = false;
      this.loginError = "";
      this.rememberLogin = remember;
      if (remember) {
        localStorage.setItem("maple_remember_login", "1");
        localStorage.setItem("maple_remember_user", username);
      } else {
        localStorage.removeItem("maple_remember_login");
        localStorage.removeItem("maple_remember_user");
      }
    } catch (error) {
      this.loginError = error.message || "登录失败";
      this.authCaptcha = this.makeCaptcha();
    } finally {
      this.loginBusy = false;
      this.render();
    }
  }

  async submitRecovery(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const username = String(fd.get("username") || "").trim();
    const recoveryQuestion = String(fd.get("recoveryQuestion") || "").trim();
    const recoveryAnswer = String(fd.get("recoveryAnswer") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const confirmPassword = String(fd.get("confirmPassword") || "").trim();
    const captcha = String(fd.get("captcha") || "").trim();
    if (!username || !recoveryQuestion || !recoveryAnswer || !password) {
      this.loginError = "请把找回信息填写完整。";
      this.render();
      return;
    }
    if (password !== confirmPassword) {
      this.loginError = "两次输入的密码不一致。";
      this.render();
      return;
    }
    if (!this.validateCaptcha(captcha)) {
      this.loginError = "验证码不正确，请重新输入。";
      this.authCaptcha = this.makeCaptcha();
      this.render();
      return;
    }
    this.loginBusy = true;
    this.render();
    try {
      const response = await fetch(api("/recover-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, recoveryQuestion, recoveryAnswer, password }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "密码重置失败");
      this.authMode = "login";
      this.loginError = "密码已重置，可以用新密码登录。";
      this.authCaptcha = this.makeCaptcha();
    } catch (error) {
      this.loginError = error.message || "密码重置失败";
      this.authCaptcha = this.makeCaptcha();
    } finally {
      this.loginBusy = false;
      this.render();
    }
  }

  async submitUserContent(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const channel = String(fd.get("channel") || this.publisherChannel || "community");
    const title = String(fd.get("title") || "").trim();
    const summary = String(fd.get("summary") || "").trim();
    const content = String(fd.get("content") || "").trim();
    const link = String(fd.get("link") || "").trim();
    const kind = String(fd.get("kind") || (channel === "guide" ? "任务攻略" : "玩家交流")).trim();
    if (!title || !summary) {
      this.loginError = "标题和摘要不能为空。";
      this.render();
      return;
    }
    this.newsFormBusy = true;
    this.render();
    try {
      const response = await fetch(api("/news/publish"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, content, link, kind, channel, mediaType: link ? "外链视频" : "图文内容" }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "发布失败");
      this.publisherOpen = false;
      this.userNotice = "发布成功，已展示在页面中。";
      await this.loadNews();
    } catch (error) {
      this.loginError = error.message || "发布失败";
    } finally {
      this.newsFormBusy = false;
      this.render();
    }
  }

  pickProfileAvatar(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.loginError = "请选择图片文件。";
      this.render();
      return;
    }
    if (file.size > 260 * 1024) {
      this.loginError = "头像图片请控制在 260KB 以内。";
      this.render();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = String(reader.result || "");
      this.render();
    };
    reader.readAsDataURL(file);
  }

  async submitProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const displayName = String(fd.get("displayName") || "").trim();
    const bio = String(fd.get("bio") || "").trim();
    const avatarColor = String(fd.get("avatarColor") || this.avatarColor || "#0b9ed5").trim();
    const avatarUrl = String(fd.get("avatarUrl") || this.avatarUrl || "").trim();
    if (!displayName) {
      this.loginError = "昵称不能为空。";
      this.render();
      return;
    }
    this.loginBusy = true;
    this.loginError = "";
    this.render();
    try {
      const response = await fetch(api("/profile"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatarColor, avatarUrl }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "保存失败");
      this.currentDisplayName = payload.displayName || displayName;
      this.avatarColor = payload.avatarColor || avatarColor;
      this.avatarUrl = payload.avatarUrl || "";
      this.profileBio = payload.bio || "";
      this.currentRole = payload.role || this.currentRole;
      this.currentRoles = Array.isArray(payload.roles) ? payload.roles : this.currentRoles;
      this.isAdmin = !!payload.admin;
      this.isModerator = !!payload.moderator || !!payload.admin;
      this.userNotice = "账号资料已保存。";
    } catch (error) {
      this.loginError = error.message || "保存失败";
    } finally {
      this.loginBusy = false;
      this.render();
    }
  }

  async updateNewsStatus(id, status) {
    if (!id || !this.isModerator) return;
    try {
      const response = await fetch(api("/admin/news/status"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "审核失败");
      await this.loadNews();
    } catch (error) {
      this.loginError = error.message || "审核失败";
      this.render();
    }
  }

  async logout() {
    try {
      const response = await fetch(api("/logout"), { method: "POST" });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "退出失败");
    } catch (error) {
      this.loginError = error.message || "退出失败";
      return;
    }

    this.isLoggedIn = false;
    this.currentUser = "";
    this.currentDisplayName = "";
    this.currentRole = "guest";
    this.currentRoles = [];
    this.avatarColor = "#0b9ed5";
    this.avatarUrl = "";
    this.profileBio = "";
    this.isAdmin = false;
    this.accountMenuOpen = false;
    if (this.active === "管理") {
      this.active = "首页";
      history.replaceState(null, "", `#${encodeURIComponent(this.active)}`);
    }
    this.render();
  }

  async submitNews(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") || "").trim();
    const summary = String(fd.get("summary") || "").trim();
    const link = String(fd.get("link") || "").trim();
    const kind = String(fd.get("kind") || "资讯").trim();
    const channel = String(fd.get("channel") || "community").trim();
    if (!title || !summary) return;
    this.newsFormBusy = true;
    this.render();
    try {
      const response = await fetch(api("/admin/news-v2"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, link, kind }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "提交失败");
      await this.loadNews();
    } catch (error) {
      this.loginError = error.message || "提交失败";
    } finally {
      this.newsFormBusy = false;
      this.render();
    }
  }

  async submitNews(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const id = String(fd.get("id") || "").trim();
    const title = String(fd.get("title") || "").trim();
    const summary = String(fd.get("summary") || "").trim();
    const link = String(fd.get("link") || "").trim();
    const kind = String(fd.get("kind") || "资讯").trim();
    const source = String(fd.get("source") || "").trim();
    const cover = String(fd.get("cover") || "").trim();
    const customTags = String(fd.get("customTags") || "").split(/[，,\s]+/).map((tag) => tag.trim()).filter(Boolean);
    const tags = [...new Set([...fd.getAll("tags").map((tag) => String(tag).trim()).filter(Boolean), ...customTags])].slice(0, 8);
    const slots = [...form.querySelectorAll("input[name='slots']:checked")].map((input) => input.value);
    const targets = [...form.querySelectorAll("input[name='targets']:checked")].map((input) => input.value);
    const status = String(fd.get("status") || "已发布").trim();
    const content = String(fd.get("content") || "").trim();
    const mediaType = String(fd.get("mediaType") || "外链视频").trim();
    if (!title || !summary) return;
    this.newsFormBusy = true;
    this.render();
    try {
      const response = await fetch(api("/admin/news"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, summary, link, kind, channel, source, cover, tags, slots, targets, status, content, mediaType }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "提交失败");
      this.newsDraftId = "";
      await this.loadNews();
    } catch (error) {
      this.loginError = error.message || "提交失败";
    } finally {
      this.newsFormBusy = false;
      this.render();
    }
  }

  async likeNews(id) {
    try {
      const response = await fetch(api("/news/like"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "点赞失败");
      await this.loadNews();
    } catch (error) {
      this.loginError = error.message || "点赞失败";
      this.render();
    }
  }

  async submitNewsComment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const id = String(fd.get("id") || "").trim();
    const author = String(fd.get("author") || this.currentUser || "游客").trim();
    const content = String(fd.get("content") || "").trim();
    if (!id || !content) return;
    try {
      const response = await fetch(api("/news/comment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, author, content }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "评论失败");
      await this.loadNews();
      this.newsCommentOpen = id;
      this.render();
    } catch (error) {
      this.loginError = error.message || "评论失败";
      this.render();
    }
  }

  async deleteNews(id) {
    if (!id) return;
    try {
      const response = await fetch(api("/admin/news/delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "删除失败");
      if (this.newsDraftId === id) this.newsDraftId = "";
      await this.loadNews();
    } catch (error) {
      this.loginError = error.message || "删除失败";
      this.render();
    }
  }

  async uploadNewsCover(event) {
    const file = event.currentTarget.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const form = event.currentTarget.closest("form");
    const coverInput = form?.querySelector('input[name="cover"]');
    if (coverInput) coverInput.value = dataUrl;
  }

  autoFillNewsCover() {
    const form = this.querySelector("[data-news-form]");
    if (!form) return;
    const link = String(form.querySelector('input[name="link"]')?.value || "").trim();
    const coverInput = form.querySelector('input[name="cover"]');
    if (!coverInput) return;
    if (/\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(link)) {
      coverInput.value = link;
      return;
    }
    const bilibiliBv = link.match(/BV[0-9A-Za-z]+/)?.[0];
    if (bilibiliBv) {
      coverInput.placeholder = `已识别 ${bilibiliBv}，如未自动显示请手动上传封面`;
    } else {
      coverInput.placeholder = "暂未识别到可自动截取的平台，请手动上传封面";
    }
  }

  async submitGoldSettings(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      marketStatus: String(fd.get("marketStatus") || "开盘中"),
      intervalMinutes: Number(fd.get("intervalMinutes") || 10),
      minGoldYi: Number(fd.get("minGoldYi") || 10),
      deviationPercent: Number(fd.get("deviationPercent") || 35),
      homeServerKey: String(fd.get("homeServerKey") || ""),
    };
    this.goldAdminBusy = true;
    this.goldAdminError = "";
    this.render();
    try {
      const response = await fetch(api("/admin/gold-settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "保存失败");
      this.goldSettings = result.settings || payload;
      await this.loadGoldMarket();
    } catch (error) {
      this.goldAdminError = error.message || "保存失败";
    } finally {
      this.goldAdminBusy = false;
      this.render();
    }
  }

  async submitHomeRateDisplay(event) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      ...this.goldSettings,
      homeServerKey: String(fd.get("homeServerKey") || ""),
    };
    try {
      const response = await fetch(api("/admin/gold-settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "首页汇率展示保存失败");
      this.goldSettings = result.settings || payload;
      await this.loadGoldMarket();
    } catch (error) {
      this.goldAdminError = error.message || "首页汇率展示保存失败";
    }
    this.render();
  }

  async deleteMonster(id) {
    if (!id) return;
    try {
      const response = await fetch(api(`/admin/monsters/${encodeURIComponent(id)}`), { method: "DELETE" });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "删除失败");
      await this.loadMonsters();
    } catch (error) {
      this.monsterError = error.message || "删除失败";
      this.render();
    }
  }

  normalizeAdminDrop(item) {
    if (typeof item === "string") {
      const detail = this.catalogItems.find((entry) => entry.name === item) || this.findItem(item);
      return detail ? this.normalizeAdminDrop(detail) : { id: `legacy:${item}`, name: item, img: "", legacy: true };
    }
    const detail = this.findItem(item?.id) || this.findItem(item?.code) || item || {};
    return {
      id: String(detail.id || detail.code || item?.name || ""),
      name: detail.name || item?.name || "未知物品",
      nameEn: detail.nameEn || item?.nameEn || "",
      img: detail.img || item?.img || "",
      library: detail.library || "",
      category: detail.category || "",
      subCategory: detail.subCategory || "",
      kind: detail.kind || "",
      source: "管理员维护",
      legacy: !detail.id,
    };
  }

  ensureAdminMonsterDraft(monster) {
    const draftId = String(monster?.id || "__new__");
    if (!this.adminMonsterDraft || this.adminMonsterDraft.id !== draftId) {
      this.adminMonsterDraft = {
        id: draftId,
        attributes: [...(monster?.attributes || ["普通"])],
        drops: {
          equipment: (monster?.drops?.equipment || []).map((item) => this.normalizeAdminDrop(item)),
          consumable: (monster?.drops?.consumable || []).map((item) => this.normalizeAdminDrop(item)),
          other: (monster?.drops?.other || []).map((item) => this.normalizeAdminDrop(item)),
        },
      };
    }
    return this.adminMonsterDraft;
  }

  captureAdminMonsterFields() {
    const form = this.querySelector(".admin-monster-editor-overlay [data-admin-monster-form]") || this.querySelector("[data-admin-monster-form]");
    if (!form) return;
    const fields = {};
    new FormData(form).forEach((value, key) => { fields[key] = String(value); });
    this.adminMonsterFieldDraft = { id: String(fields.id || "__new__"), fields };
  }

  openAdminDropPicker(group) {
    this.captureAdminMonsterFields();
    this.adminDropPicker = { open: true, group, query: "", type: "全部", selected: [] };
    this.render();
  }

  closeAdminDropPicker() {
    this.adminDropPicker.open = false;
    this.render();
  }

  getAdminPickerType(item) {
    if (item.category === "设置" || item.subCategory === "设置" || item.section === "设置") return "设置";
    return item.kind || item.subCategory || item.category || "其他";
  }

  getAdminPickerLevel(item) {
    const value = this.getItemStat(item, ["reqLevel", "requiredLevel", "level"], ["需要等级", "REQ LEV", "等级"]);
    const level = Number(value);
    return Number.isFinite(level) && level > 0 ? level : null;
  }

  getAdminPickerLevelBand(item) {
    const level = this.getAdminPickerLevel(item);
    if (level === null) return "等级未收录";
    if (level <= 40) return "0～40级";
    if (level <= 80) return "41～80级";
    if (level <= 120) return "81～120级";
    return "121级以上";
  }

  getAdminPickerCandidates() {
    const { group, query, type } = this.adminDropPicker;
    const lower = String(query || "").trim().toLowerCase();
    const candidates = (this.catalogItems || []).filter((item) => {
      const inGroup = group === "equipment"
        ? item.library === "装备库" || item.category === "装备"
        : group === "consumable"
          ? item.library === "物品库" && item.category === "消耗品"
          : item.library === "物品库" && item.category !== "消耗品";
      const itemType = this.getAdminPickerType(item);
      const inType = type === "全部" || itemType === type || item.subCategory === type || item.category === type;
      const inQuery = !lower || `${item.name} ${item.nameEn} ${item.id} ${item.code}`.toLowerCase().includes(lower);
      return inGroup && inType && inQuery;
    });
    return candidates
      .sort((a, b) => {
        if (group === "equipment") {
          const levelA = this.getAdminPickerLevel(a);
          const levelB = this.getAdminPickerLevel(b);
          return (levelA === null ? 9999 : levelA) - (levelB === null ? 9999 : levelB)
            || this.getAdminPickerType(a).localeCompare(this.getAdminPickerType(b), "zh-CN")
            || String(a.name || "").localeCompare(String(b.name || ""), "zh-CN");
        }
        return this.getAdminPickerType(a).localeCompare(this.getAdminPickerType(b), "zh-CN")
          || String(a.name || "").localeCompare(String(b.name || ""), "zh-CN");
      })
      .slice(0, 160);
  }

  getAdminPickerTypes() {
    const { group } = this.adminDropPicker;
    const source = (this.catalogItems || []).filter((item) => group === "equipment"
      ? item.library === "装备库" || item.category === "装备"
      : group === "consumable"
      ? item.library === "物品库" && item.category === "消耗品"
        : item.library === "物品库" && item.category !== "消耗品");
    return ["全部", ...new Set(source.map((item) => this.getAdminPickerType(item)))].slice(0, 18);
  }

  toggleAdminPickerItem(id) {
    const selected = new Set(this.adminDropPicker.selected.map(String));
    if (selected.has(String(id))) selected.delete(String(id));
    else selected.add(String(id));
    this.adminDropPicker.selected = [...selected];
    this.render();
  }

  confirmAdminDropPicker() {
    const group = this.adminDropPicker.group;
    const existing = new Map((this.adminMonsterDraft?.drops?.[group] || []).map((item) => [String(item.id), item]));
    this.adminDropPicker.selected.forEach((id) => {
      const item = this.findItem(id);
      if (item) existing.set(String(item.id), this.normalizeAdminDrop(item));
    });
    this.adminMonsterDraft.drops[group] = [...existing.values()];
    this.adminDropPicker.open = false;
    this.render();
  }

  removeAdminDrop(group, id) {
    this.captureAdminMonsterFields();
    if (!this.adminMonsterDraft?.drops?.[group]) return;
    this.adminMonsterDraft.drops[group] = this.adminMonsterDraft.drops[group].filter((item) => String(item.id) !== String(id));
    this.render();
  }

  toggleAdminAttribute(attribute) {
    this.captureAdminMonsterFields();
    const selected = new Set(this.adminMonsterDraft?.attributes || ["普通"]);
    if (selected.has(attribute)) {
      selected.delete(attribute);
    } else {
      if (attribute === "普通") selected.clear();
      else selected.delete("普通");
      const element = attribute.replace(/^(弱|抗|免疫)/, "");
      if (element !== attribute) {
        [`弱${element}`, `抗${element}`, `免疫${element}`].forEach((value) => selected.delete(value));
      }
      selected.add(attribute);
    }
    if (!selected.size) selected.add("普通");
    this.adminMonsterDraft.attributes = [...selected];
    this.render();
  }

  async submitAdminItem(event) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const current = this.findItem(fd.get("id")) || {};
    const payload = {
      ...current,
      id: String(fd.get("id") || "").trim() || `admin-${Date.now()}`,
      code: String(fd.get("code") || "").trim(),
      name: String(fd.get("name") || "").trim(),
      nameEn: String(fd.get("nameEn") || "").trim(),
      library: String(fd.get("library") || "物品库"),
      category: String(fd.get("category") || "其他"),
      subCategory: String(fd.get("subCategory") || "其他"),
      kind: String(fd.get("kind") || "其他"),
      img: String(fd.get("img") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      reqLevel: Number(fd.get("reqLevel") || 0) || "",
      tuc: Number(fd.get("tuc") || 0) || "",
      req_job_label: String(fd.get("req_job_label") || "").trim(),
    };
    const response = await fetch(api("/admin/items/save"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.ok) {
      this.monsterError = result.error || "物品保存失败";
      this.render();
      return;
    }
    this.adminSelectedItemId = "";
    this.adminItemDraftPreset = null;
    await this.loadItems();
  }

  async submitAdminMonster(event) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const id = String(fd.get("id") || "").trim() || `admin-${Date.now()}`;
    const current = this.monsterItems.find((item) => String(item.id) === id) || {};
    const payload = {
      ...current,
      id,
      name: String(fd.get("name") || "").trim(),
      nameEn: String(fd.get("nameEn") || "").trim(),
      level: Number(fd.get("level") || 1),
      hp: Number(fd.get("hp") || 0),
      mp: Number(fd.get("mp") || 0),
      exp: Number(fd.get("exp") || 0),
      hitRequirement: Number(fd.get("hitRequirement") || 0),
      acc: Number(fd.get("acc") || 0),
      eva: Number(fd.get("eva") || 0),
      speed: Number(fd.get("speed") || 0),
      map: String(fd.get("map") || "").trim(),
      img: String(fd.get("img") || "").trim(),
      density: String(fd.get("density") || "常见"),
      attributes: [...(this.adminMonsterDraft?.attributes || ["普通"])],
      drops: {
        equipment: (this.adminMonsterDraft?.drops?.equipment || []).filter((item) => !item.legacy),
        consumable: (this.adminMonsterDraft?.drops?.consumable || []).filter((item) => !item.legacy),
        other: (this.adminMonsterDraft?.drops?.other || []).filter((item) => !item.legacy),
      },
    };
    const response = await fetch(api("/admin/monsters/save"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.ok) {
      this.monsterError = result.error || "怪物保存失败";
      this.render();
      return;
    }
    this.adminSelectedMonsterId = result.item.id;
    this.adminMonsterDraft = null;
    this.adminMonsterFieldDraft = null;
    await this.loadMonsters();
  }

  async submitAdminConfig(event) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const marketWatchlist = String(fd.get("marketWatchlist") || "").split(/[\n，,]/).map((value) => value.trim()).filter(Boolean);
    const response = await fetch(api("/admin/site-config"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketWatchlist, homeRecommendations: this.siteConfig.homeRecommendations || [], homeRecommendationSortMode: this.siteConfig.homeRecommendationSortMode || "volatility", itemTaxonomy: this.getItemTaxonomy() }),
    });
    const result = await response.json();
    if (result.ok) this.siteConfig = this.normalizeSiteConfig(result.config);
    this.render();
  }

  async saveHomeRecommendations(homeRecommendations) {
    const response = await fetch(api("/admin/site-config"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketWatchlist: this.siteConfig.marketWatchlist || [],
        homeRecommendations,
        homeRecommendationSortMode: this.siteConfig.homeRecommendationSortMode || "volatility",
        itemTaxonomy: this.getItemTaxonomy(),
      }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "热门观察保存失败");
    this.siteConfig = this.normalizeSiteConfig(result.config);
  }

  openAdminRecommendEditor(itemId) {
    this.adminRecommendModal = { open: true, mode: "edit", itemId: String(itemId || ""), query: "", kind: "全部" };
    this.render();
  }

  openAdminRecommendAdder(kind = "全部") {
    this.adminRecommendModal = { open: true, mode: "add", itemId: "", query: "", kind };
    this.render();
  }

  closeAdminRecommendModal() {
    this.adminRecommendModal = { open: false, mode: "", itemId: "", query: "", kind: "全部" };
    this.render();
  }

  async addHomeRecommendation(itemId) {
    const id = String(itemId || "");
    if (!id) return;
    const current = this.getHomeRecommendations();
    if (current.some((entry) => entry.itemId === id)) {
      this.openAdminRecommendEditor(id);
      return;
    }
    if (this.isGoldRecommendationId(id) && current.filter((entry) => this.isGoldRecommendationId(entry.itemId)).length >= 2) {
      window.alert("金币汇率最多占用两个热门观察推荐位。");
      return;
    }
    const next = [...current, {
      itemId: id,
      subtitle: "",
      badge: "观察中",
      position: current.length + 1,
      showChange: true,
    }];
    try {
      if (!this.isGoldRecommendationId(id)) {
        const watchlist = new Set((this.siteConfig.marketWatchlist || []).map(String));
        watchlist.add(id);
        this.siteConfig.marketWatchlist = [...watchlist];
      }
      await this.saveHomeRecommendations(next);
      this.adminRecommendModal = { open: true, mode: "edit", itemId: id, query: "", kind: "全部" };
    } catch (error) {
      this.monsterError = error.message || "热门观察保存失败";
    }
    this.render();
  }

  async removeHomeRecommendation(itemId) {
    const id = String(itemId || "");
    const next = this.getHomeRecommendations()
      .filter((entry) => entry.itemId !== id)
      .map((entry, index) => ({ ...entry, position: index + 1 }));
    try {
      await this.saveHomeRecommendations(next);
      if (this.adminRecommendModal?.itemId === id) {
        this.adminRecommendModal = { open: false, mode: "", itemId: "", query: "", kind: "全部" };
      }
    } catch (error) {
      this.monsterError = error.message || "热门观察保存失败";
    }
    this.render();
  }

  async submitAdminRecommendation(event) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const itemId = String(fd.get("itemId") || "").trim();
    const current = this.getHomeRecommendations();
    const next = current.map((entry) => entry.itemId === itemId
      ? {
          ...entry,
          subtitle: String(fd.get("subtitle") || "").trim(),
          badge: String(fd.get("badge") || "观察中").trim() || "观察中",
          position: Math.max(1, Number(fd.get("position") || entry.position) || entry.position),
          showChange: fd.get("showChange") === "on",
        }
      : entry);
    try {
      await this.saveHomeRecommendations(next);
      this.adminRecommendModal = { open: false, mode: "", itemId: "", query: "", kind: "全部" };
    } catch (error) {
      this.monsterError = error.message || "热门观察保存失败";
    }
    this.render();
  }

  async setHomeRecommendationSortMode(mode) {
    const nextMode = mode === "manual" ? "manual" : "volatility";
    if (this.siteConfig.homeRecommendationSortMode === nextMode) return;
    this.siteConfig.homeRecommendationSortMode = nextMode;
    try {
      await this.saveHomeRecommendations(this.getHomeRecommendations());
    } catch (error) {
      this.monsterError = error.message || "排序方式保存失败";
    }
    this.render();
  }

  async moveHomeRecommendation(itemId, direction) {
    if (!direction || this.siteConfig.homeRecommendationSortMode !== "manual") return;
    const rows = this.getHomeRecommendations();
    const from = rows.findIndex((entry) => entry.itemId === String(itemId || ""));
    const to = from + Math.sign(direction);
    if (from < 0 || to < 0 || to >= rows.length) return;
    [rows[from], rows[to]] = [rows[to], rows[from]];
    const next = rows.map((entry, index) => ({ ...entry, position: index + 1 }));
    try {
      await this.saveHomeRecommendations(next);
    } catch (error) {
      this.monsterError = error.message || "推荐位排序失败";
    }
    this.render();
  }

  async deleteAdminItem(id) {
    if (!id || id === "__new__" || !window.confirm("确定删除这件物品吗？相关怪物中的掉落记录不会自动删除。")) return;
    const response = await fetch(api(`/admin/items/${encodeURIComponent(id)}`), { method: "DELETE" });
    const result = await response.json();
    if (result.ok) {
      this.adminSelectedItemId = "";
      await this.loadItems();
    }
  }

  async toggleMarketWatchItem(id) {
    const current = new Set((this.siteConfig.marketWatchlist || []).map(String));
    if (current.has(String(id))) current.delete(String(id));
    else current.add(String(id));
    const response = await fetch(api("/admin/site-config"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketWatchlist: [...current], homeRecommendations: this.siteConfig.homeRecommendations || [], homeRecommendationSortMode: this.siteConfig.homeRecommendationSortMode || "volatility", itemTaxonomy: this.getItemTaxonomy() }),
    });
    const result = await response.json();
    if (result.ok) {
      this.siteConfig = this.normalizeSiteConfig(result.config);
      this.render();
    }
  }

  async setAdminItemKind(id, kind) {
    const item = this.findItem(id);
    if (!item) return;
    const response = await fetch(api("/admin/items/save"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, kind }),
    });
    const result = await response.json();
    if (result.ok) await this.loadItems();
  }

  async saveItemTaxonomy(taxonomy) {
    const response = await fetch(api("/admin/site-config"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketWatchlist: this.siteConfig.marketWatchlist || [],
        homeRecommendations: this.siteConfig.homeRecommendations || [],
        homeRecommendationSortMode: this.siteConfig.homeRecommendationSortMode || "volatility",
        itemTaxonomy: taxonomy,
      }),
    });
    const result = await response.json();
    if (result.ok) this.siteConfig = this.normalizeSiteConfig(result.config);
    this.render();
  }

  async addAdminTaxonomyValue(group) {
    const input = this.querySelector(`[data-admin-taxonomy-input="${group}"]`);
    const value = String(input?.value || "").trim();
    if (!value) return;
    const taxonomy = this.getItemTaxonomy();
    const current = new Set(taxonomy[group] || []);
    current.add(value);
    taxonomy[group] = [...current];
    await this.saveItemTaxonomy(taxonomy);
  }

  async removeAdminTaxonomyValue(group, value) {
    const taxonomy = this.getItemTaxonomy();
    const protectedValues = new Set(group === "libraries" ? ["物品库", "装备库"] : []);
    if (protectedValues.has(value)) return;
    taxonomy[group] = (taxonomy[group] || []).filter((item) => item !== value);
    await this.saveItemTaxonomy(taxonomy);
  }

  async renameAdminTaxonomyValue(group, oldValue) {
    const taxonomy = this.getItemTaxonomy();
    const protectedValues = new Set(group === "libraries" ? ["物品库", "装备库"] : []);
    if (protectedValues.has(oldValue)) return;
    const nextValue = String(window.prompt("输入新的分类名称", oldValue) || "").trim();
    if (!nextValue || nextValue === oldValue) return;
    const values = taxonomy[group] || [];
    if (values.includes(nextValue)) {
      window.alert("这个名称已经存在，不能重复。");
      return;
    }
    taxonomy[group] = values.map((value) => value === oldValue ? nextValue : value);
    const fieldByGroup = { itemCategories: "category", equipmentCategories: "category", kinds: "kind" };
    const field = fieldByGroup[group];
    const changedItems = field
      ? (this.catalogItems || []).filter((item) => {
        if (group === "itemCategories" && item.library !== "物品库") return false;
        if (group === "equipmentCategories" && item.library !== "装备库") return false;
        return item[field] === oldValue;
      }).map((item) => ({ ...item, [field]: nextValue }))
      : [];
    await this.saveItemTaxonomy(taxonomy);
    if (changedItems.length) {
      await Promise.all(changedItems.map((item) => fetch(api("/admin/items/save"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })));
      await this.loadItems();
    }
  }

  openAdminNewItem(useCurrentSlot = false) {
    this.adminItemDraftPreset = useCurrentSlot ? this.getAdminNewItemPreset() : null;
    this.adminSelectedItemId = "__new__";
    this.render();
  }

  getAdminNewItemPreset() {
    const taxonomy = this.getItemTaxonomy();
    const visibleSubCategory = this.adminItemKind !== "全部" ? this.adminItemKind : "";
    let library = this.adminItemLibrary !== "全部" ? this.adminItemLibrary : "物品库";
    let category = this.adminItemCategory !== "全部"
      ? this.adminItemCategory
      : library === "装备库" ? "装备" : "消耗品";
    if (this.adminItemLibrary === "全部" && taxonomy.equipmentCategories.includes(category) && !taxonomy.itemCategories.includes(category)) {
      library = "装备库";
    }
    const draft = {
      library,
      category,
      kind: "其他",
      subCategory: library === "装备库" ? "武器" : "特殊",
      img: "",
    };
    if (library === "物品库") {
      if (["药水", "卷轴", "飞镖"].includes(visibleSubCategory)) {
        draft.category = "消耗品";
        draft.kind = visibleSubCategory;
        draft.subCategory = visibleSubCategory;
      } else if (["椅子", "活动"].includes(visibleSubCategory)) {
        draft.category = "设置";
        draft.kind = "其他";
        draft.subCategory = visibleSubCategory;
      } else if (category === "设置") {
        draft.subCategory = "椅子";
      } else if (visibleSubCategory) {
        draft.subCategory = visibleSubCategory;
      }
    } else {
      draft.subCategory = visibleSubCategory || draft.subCategory;
    }
    return draft;
  }

  getAdminNewItemSlotLabel() {
    const preset = this.getAdminNewItemPreset();
    return `${preset.library} / ${preset.category} / ${preset.subCategory}`;
  }

  getAdminItemList() {
    const query = String(this.adminQuery || "").trim().toLowerCase();
    return (this.catalogItems || []).filter((item) => {
      if (this.adminItemLibrary !== "全部" && item.library !== this.adminItemLibrary) return false;
      if (this.adminItemCategory !== "全部" && item.category !== this.adminItemCategory) return false;
      if (this.adminItemKind !== "全部" && this.getItemDisplaySubCategory(item) !== this.adminItemKind) return false;
      if (!query) return true;
      return `${item.name} ${item.nameEn} ${item.id} ${item.category} ${item.kind}`.toLowerCase().includes(query);
    });
  }

  countAdminItems(filter = {}) {
    return (this.catalogItems || []).filter((item) => {
      if (filter.library && filter.library !== "全部" && item.library !== filter.library) return false;
      if (filter.category && filter.category !== "全部" && item.category !== filter.category) return false;
      if (filter.kind && filter.kind !== "全部" && item.kind !== filter.kind) return false;
      if (filter.subCategory && filter.subCategory !== "全部" && this.getItemDisplaySubCategory(item) !== filter.subCategory) return false;
      return true;
    }).length;
  }

  getAdminItemCategories() {
    return ["全部", ...new Set((this.catalogItems || [])
      .filter((item) => this.adminItemLibrary === "全部" || item.library === this.adminItemLibrary)
      .map((item) => item.category || "其他"))];
  }

  getAdminItemKinds() {
    return ["全部", ...new Set((this.catalogItems || [])
      .filter((item) => this.adminItemLibrary === "全部" || item.library === this.adminItemLibrary)
      .filter((item) => this.adminItemCategory === "全部" || item.category === this.adminItemCategory)
      .map((item) => item.kind || "其他"))];
  }

  getAdminItemSubCategories() {
    const scoped = (this.catalogItems || [])
      .filter((item) => this.adminItemLibrary === "全部" || item.library === this.adminItemLibrary)
      .filter((item) => this.adminItemCategory === "全部" || item.category === this.adminItemCategory);
    return this.getItemDisplaySubCategoryOptions(this.adminItemLibrary, this.adminItemCategory, scoped);
  }

  getItemDisplaySubCategory(item) {
    if (item.library === "装备库") return item.subCategory || "其他";
    if (item.category === "设置") {
      const text = `${item.name || ""} ${item.nameEn || ""} ${item.subCategory || ""} ${item.kind || ""}`.toLowerCase();
      return text.includes("活动") || text.includes("event") ? "活动" : "椅子";
    }
    const text = `${item.name || ""} ${item.nameEn || ""} ${item.subCategory || ""} ${item.kind || ""} ${item.description || ""}`.toLowerCase();
    if (item.kind === "卷轴" || item.scroll || text.includes("scroll") || String(item.name || "").includes("卷轴")) return "卷轴";
    if (item.kind === "飞镖" || text.includes("throwing") || String(item.name || "").includes("镖")) return "飞镖";
    if (item.kind === "药水" || text.includes("potion") || String(item.name || "").includes("药水")) return "药水";
    return "特殊";
  }

  getItemDisplaySubCategoryOptions(library, category, items) {
    const preferred = ["武器", "帽子", "披风", "上衣", "手套", "套服", "裤裙", "盾牌", "鞋子", "耳环"];
    if (library === "全部") {
      const values = new Set((items || []).map((item) => this.getItemDisplaySubCategory(item)));
      const itemGroups = ["药水", "卷轴", "飞镖", "特殊", "椅子", "活动"].filter((value) => values.has(value));
      const equipmentGroups = preferred.filter((value) => values.has(value));
      return ["全部", ...itemGroups, ...equipmentGroups];
    }
    if (library === "物品库") {
      if (category === "设置") return ["全部", "椅子", "活动"];
      return ["全部", "药水", "卷轴", "飞镖", "特殊"];
    }
    const values = [...new Set((items || []).map((item) => item.subCategory || "其他"))];
    const ordered = preferred.filter((value) => values.includes(value));
    const rest = values.filter((value) => !preferred.includes(value)).sort((a, b) => a.localeCompare(b, "zh-CN"));
    return ["全部", ...ordered, ...rest];
  }

  getAdminMonsterList() {
    const query = String(this.adminQuery || "").trim().toLowerCase();
    return (this.monsterItems || []).filter((item) => !query || `${item.name} ${item.nameEn} ${item.map} ${item.level}`.toLowerCase().includes(query)).slice(0, 120);
  }

  renderAdmin() {
    const sections = ["概览", "怪物图鉴", "物品库", "行情品种", "热门观察", "资讯与设置"];
    return `
      <section class="admin-workbench">
        <header class="admin-head">
          <div><span class="eyebrow">管理员工作台 · ${this.currentUser || "admin"}</span><h1>资料库维护中心</h1><p>所有用户端资料都从这里维护。保存后，图鉴、物品、掉落关联和行情观察池会共用同一份数据。</p></div>
          <div class="admin-head-stats"><strong>${this.catalogItems.length + this.monsterItems.length}</strong><span>可维护资料</span></div>
        </header>
        <div class="admin-layout">
          <aside class="admin-nav-panel">
            <strong>工作区</strong>
            ${sections.map((section) => `<button class="${this.adminSection === section ? "active" : ""}" data-admin-section="${section}">${section}<span>${section === "怪物图鉴" ? this.monsterItems.length : section === "物品库" ? this.catalogItems.length : ""}</span></button>`).join("")}
            <div class="admin-rule"></div>
            <small>管理员权限已启用</small>
            <small>访客和普通账号不会看到此入口。</small>
          </aside>
          <main class="admin-main">
            ${this.adminSection === "概览" ? this.renderAdminOverview() : ""}
            ${this.adminSection === "怪物图鉴" ? this.renderAdminMonsters() : ""}
            ${this.adminSection === "物品库" ? this.renderAdminItems() : ""}
            ${this.adminSection === "行情品种" ? this.renderAdminMarket() : ""}
            ${this.adminSection === "热门观察" ? this.renderAdminRecommendations() : ""}
            ${this.adminSection === "资讯与设置" ? `${this.renderNewsBoard()}${this.renderGoldAdminPanel(this.goldSettings)}` : ""}
          </main>
        </div>
      </section>`;
  }

  renderAdminOverview() {
    const recentMonsters = this.monsterItems.slice(0, 5);
    const recentItems = this.catalogItems.slice(0, 5);
    return `
      <section class="admin-section">
        <div class="admin-section-head"><div><span class="eyebrow">维护总览</span><h2>今天从哪里开始</h2></div><span class="admin-live-dot">数据已接通</span></div>
        <div class="admin-stat-grid">
          <article><span>怪物图鉴</span><strong>${this.monsterItems.length}</strong><small>可编辑等级、属性、地图和掉落</small></article>
          <article><span>物品库</span><strong>${this.catalogItems.length}</strong><small>可编辑类型、说明和展示信息</small></article>
          <article><span>行情观察池</span><strong>${(this.siteConfig.marketWatchlist || []).length}</strong><small>从物品库挑选可观察品种</small></article>
          <article><span>金币采集</span><strong>${this.goldSettings.intervalMinutes || 10} 分钟</strong><small>后台自动抓取公开报价</small></article>
        </div>
        <div class="admin-overview-grid">
          <section class="admin-card"><div class="admin-card-head"><h3>维护原则</h3><span>一处修改，多处同步</span></div><p>掉落关系只维护在怪物资料里，物品详情会自动反查掉落怪物。重点类型直接写入物品的类型字段，物品库、图鉴掉落和行情品种不会各自复制一套数据。</p><div class="admin-flow"><b>怪物</b><i>掉落关联</i><b>物品</b><i>重点类型</i><b>行情</b></div></section>
          <section class="admin-card"><div class="admin-card-head"><h3>快速入口</h3><span>常用操作</span></div><div class="admin-shortcuts"><button data-admin-section="怪物图鉴">编辑怪物资料</button><button data-admin-section="物品库">导入或编辑物品</button><button data-admin-section="行情品种">维护行情宝库</button></div></section>
        </div>
        <div class="admin-overview-grid">
          <section class="admin-card"><div class="admin-card-head"><h3>资料库最近条目</h3><span>按当前数据顺序</span></div>${recentMonsters.map((item) => `<div class="admin-mini-row"><img src="${item.img}" alt="" /><span><strong>${item.name}</strong><small>Lv.${item.level} · ${item.map}</small></span><button data-admin-section="怪物图鉴">编辑</button></div>`).join("")}</section>
          <section class="admin-card"><div class="admin-card-head"><h3>物品库最近条目</h3><span>可直接进入编辑</span></div>${recentItems.map((item) => `<div class="admin-mini-row"><img src="${item.img}" alt="" /><span><strong>${item.name}</strong><small>${item.category} · ${item.kind}</small></span><button data-admin-section="物品库" data-admin-item-id="${item.id}">编辑</button></div>`).join("")}</section>
        </div>
      </section>`;
  }

  renderAdminItems() {
    const list = this.getAdminItemList();
    const visible = list.slice(0, 240);
    const libraries = ["全部", "物品库", "装备库"];
    const categories = this.getAdminItemCategories();
    const subCategories = this.getAdminItemSubCategories();
    const renderFilterButton = (label, active, attr, value, count) => `<button type="button" class="${active ? "active" : ""}" ${attr}="${this.escapeHtml(value)}"><span>${this.escapeHtml(label)}</span><em>${count}</em></button>`;
    return `
      <section class="admin-section">
        <div class="admin-section-head"><div><span class="eyebrow">物品库管理</span><h2>物品资料库</h2><p>先按库、系统分类、子分类定位，再点卡片编辑。物品、装备、掉落和行情共用同一份资料。</p></div><button class="admin-primary" data-admin-new-item>＋ 导入一件物品</button></div>
        <div class="admin-item-workbench">
          <aside class="admin-item-filter">
            <section><h3>库</h3><div class="admin-filter-stack">${libraries.map((library) => renderFilterButton(library, this.adminItemLibrary === library, "data-admin-item-library", library, this.countAdminItems({ library }))).join("")}</div></section>
            <section><h3>分类</h3><div class="admin-filter-stack">${categories.map((category) => renderFilterButton(category, this.adminItemCategory === category, "data-admin-item-category", category, this.countAdminItems({ library: this.adminItemLibrary, category }))).join("")}</div></section>
            <section><h3>子分类</h3><div class="admin-filter-grid">${subCategories.map((kind) => renderFilterButton(kind, this.adminItemKind === kind, "data-admin-item-kind", kind, this.countAdminItems({ library: this.adminItemLibrary, category: this.adminItemCategory, subCategory: kind }))).join("")}</div></section>
          </aside>
          <section class="admin-item-library-panel">
            <div class="admin-item-library-head">
              <div><h3>物品列表</h3><span>显示 ${visible.length} / ${list.length}，总计 ${this.catalogItems.length}</span></div>
              <div class="admin-item-tools"><button type="button" data-admin-open-taxonomy>分类维护</button><label class="admin-search wide"><span>⌕</span><input data-admin-query data-focus-key="admin-query" value="${this.escapeHtml(this.adminQuery)}" placeholder="搜索物品名、英文名、ID" /></label></div>
            </div>
            <div class="admin-item-card-grid" data-scroll-key="admin-item-grid">
              ${visible.map((entry) => `
                <button type="button" class="admin-item-card" data-admin-item-id="${this.escapeHtml(entry.id)}">
                  <span class="admin-item-card-icon"><img src="${this.escapeHtml(entry.img || "")}" alt="" /></span>
                  <span class="admin-item-card-copy"><strong>${this.escapeHtml(entry.name || "未命名物品")}</strong><small>${this.escapeHtml(entry.category || "其他")} · ${this.escapeHtml(this.getItemDisplaySubCategory(entry))}</small><em>#${this.escapeHtml(entry.code || entry.id || "")}</em></span>
                  <b>${this.escapeHtml(entry.library || "物品库")}</b>
                </button>`).join("") || `<div class="admin-recommend-empty">没有匹配的物品，换个分类或搜索词。</div>`}
              <button type="button" class="admin-item-card admin-item-card-add" data-admin-new-item-slot>
                <span class="admin-item-card-icon">＋</span>
                <span class="admin-item-card-copy"><strong>在当前分类导入</strong><small>${this.escapeHtml(this.getAdminNewItemSlotLabel())}</small><em>保存后自动进入全部物品资料库</em></span>
                <b>新增</b>
              </button>
            </div>
          </section>
        </div>
        ${this.renderAdminTaxonomyModal()}
        ${this.renderAdminItemEditorModal()}
      </section>`;
  }

  renderAdminTaxonomyModal() {
    if (!this.adminTaxonomyOpen) return "";
    return `<div class="admin-taxonomy-overlay" data-admin-taxonomy-overlay>
      <section class="admin-taxonomy-modal" role="dialog" aria-modal="true" aria-label="分类维护">
        <header><div><span>物品资料库</span><h3>分类维护</h3><p>系统分类和子分类用于展示检索，重点类型只做运营标签。</p></div><button type="button" data-admin-close-taxonomy aria-label="关闭">×</button></header>
        ${this.renderAdminTaxonomyManager()}
      </section>
    </div>`;
  }

  renderAdminTaxonomyManager() {
    const taxonomy = this.getItemTaxonomy();
    const groups = [
      { key: "itemCategories", title: "物品系统分类", note: "物品库下的稳定分类", values: taxonomy.itemCategories },
      { key: "equipmentCategories", title: "装备系统分类", note: "装备库下的稳定分类", values: taxonomy.equipmentCategories },
      { key: "kinds", title: "重点类型", note: "运营筛选标签，不放装备结构分类", values: taxonomy.kinds },
    ];
    return `<div class="admin-taxonomy-grid">
      ${groups.map((group) => `
        <section class="admin-taxonomy-card">
          <header><div><h3>${group.title}</h3><span>${group.note}</span></div><b>${group.values.length}</b></header>
          <div class="admin-taxonomy-chip-list">
            ${group.values.map((value) => `<span class="admin-taxonomy-chip"><strong>${this.escapeHtml(value)}</strong><button type="button" title="重命名${this.escapeHtml(value)}" data-group="${group.key}" data-admin-taxonomy-rename="${this.escapeHtml(value)}">改</button><button type="button" title="删除${this.escapeHtml(value)}" data-group="${group.key}" data-admin-taxonomy-remove="${this.escapeHtml(value)}">×</button></span>`).join("")}
          </div>
          <div class="admin-taxonomy-add"><input data-admin-taxonomy-input="${group.key}" placeholder="新增名称" /><button type="button" data-admin-taxonomy-add="${group.key}">添加</button></div>
        </section>`).join("")}
    </div>`;
  }

  renderAdminItemEditorModal() {
    if (!this.adminSelectedItemId) return "";
    const item = this.adminSelectedItemId === "__new__" ? (this.adminItemDraftPreset || {}) : (this.findItem(this.adminSelectedItemId) || {});
    const selectedId = item.id || "";
    const taxonomy = this.getItemTaxonomy();
    const selectedLibrary = item.library || "物品库";
    const libraryOptions = taxonomy.libraries.includes(selectedLibrary) ? taxonomy.libraries : [...taxonomy.libraries, selectedLibrary];
    const baseCategoryOptions = selectedLibrary === "装备库" ? taxonomy.equipmentCategories : taxonomy.itemCategories;
    const currentCategory = item.category || "其他";
    const categoryOptions = baseCategoryOptions.includes(currentCategory) ? baseCategoryOptions : [...baseCategoryOptions, currentCategory];
    const kindOptions = taxonomy.kinds.includes(item.kind || "") ? taxonomy.kinds : [...taxonomy.kinds, item.kind || "其他"];
    return `
      <div class="admin-item-editor-overlay" data-admin-item-editor-overlay>
        <section class="admin-item-editor-modal" role="dialog" aria-modal="true" aria-label="物品资料编辑">
          <header>
            <div><span>${selectedId ? "编辑资料" : "导入物品"}</span><h3>${selectedId ? this.escapeHtml(item.name) : "导入一件物品"}</h3></div>
            <button type="button" data-admin-close-item-editor aria-label="关闭">×</button>
          </header>
          <form class="admin-editor-card compact" data-admin-item-form>
            <div class="admin-item-edit-preview">
              <span class="admin-item-card-icon large">${item.img ? `<img src="${this.escapeHtml(item.img)}" alt="" />` : "+"}</span>
              <div><strong>${this.escapeHtml(item.name || "新物品")}</strong><small>${this.escapeHtml(item.library || "物品库")} · ${this.escapeHtml(item.category || "其他")} · ${this.escapeHtml(item.kind || "其他")}</small></div>
              ${selectedId ? `<button type="button" class="admin-danger" data-admin-delete-item="${this.escapeHtml(selectedId)}">删除物品</button>` : ""}
            </div>
            <input type="hidden" name="id" value="${this.escapeHtml(item.id || "")}" />
            <div class="admin-form-grid"><label><span>物品名称</span><input name="name" value="${this.escapeHtml(item.name || "")}" placeholder="例如：手套攻击卷轴 60%" required /></label><label><span>英文名（用于搜索）</span><input name="nameEn" value="${this.escapeHtml(item.nameEn || "")}" /></label><label><span>物品编码</span><input name="code" value="${this.escapeHtml(item.code || item.id || "")}" /></label><label><span>资料库</span><select name="library">${libraryOptions.map((library) => `<option ${selectedLibrary === library ? "selected" : ""}>${this.escapeHtml(library)}</option>`).join("")}</select></label><label><span>系统分类</span><select name="category">${categoryOptions.map((category) => `<option ${currentCategory === category ? "selected" : ""}>${this.escapeHtml(category)}</option>`).join("")}</select></label><label><span>子分类</span><input name="subCategory" value="${this.escapeHtml(item.subCategory || "其他")}" placeholder="例如：短刀 / 手套 / 卷轴类型" /></label><label><span>重点类型</span><select name="kind">${kindOptions.map((kind) => `<option ${item.kind === kind ? "selected" : ""}>${this.escapeHtml(kind)}</option>`).join("")}</select></label><label><span>图片地址</span><input name="img" value="${this.escapeHtml(item.img || "")}" placeholder="assets/items/..." /></label><label><span>需要等级</span><input name="reqLevel" type="number" min="0" value="${item.reqLevel || ""}" /></label><label><span>可升级次数</span><input name="tuc" type="number" min="0" value="${item.tuc || ""}" /></label><label><span>职业限制</span><input name="req_job_label" value="${this.escapeHtml(item.req_job_label || "")}" placeholder="例如：战士 / 全职业" /></label></div>
            <label class="admin-field-wide"><span>给玩家看的说明</span><textarea name="description" rows="5" placeholder="用简体中文写清楚用途、限制和属性。">${this.escapeHtml(item.description || "")}</textarea></label>
            <div class="admin-form-footer"><span>保存后会同步到物品库、怪物掉落和反查关系。</span><div><button type="button" data-admin-close-item-editor>取消</button><button type="submit" class="admin-primary">保存物品资料</button></div></div>
          </form>
        </section>
      </div>`;
  }

  renderAdminMonsterEditorCard(monster = {}, options = {}) {
    const selectedId = monster.id || "";
    const draft = this.ensureAdminMonsterDraft(monster);
    const fieldDraft = this.adminMonsterFieldDraft?.id === String(selectedId || "__new__")
      ? this.adminMonsterFieldDraft.fields
      : {};
    const field = (name, fallback = "") => Object.prototype.hasOwnProperty.call(fieldDraft, name) ? fieldDraft[name] : fallback;
    const dropGroups = [
      { key: "equipment", title: "装备掉落", note: "仅可选择装备库中的武器、防具和饰品" },
      { key: "consumable", title: "消耗品 / 卷轴 / 飞镖", note: "仅可选择物品库中的消耗品" },
      { key: "other", title: "其他掉落", note: "材料、任务道具与其他物品" },
    ];
    const renderDrop = (group) => {
      const entries = draft.drops[group.key] || [];
      return `
        <section class="admin-drop-zone">
          <header>
            <div><h4>${group.title}</h4><span>${group.note}</span></div>
            <button type="button" data-admin-open-picker="${group.key}">＋ 添加掉落</button>
          </header>
          <div class="admin-drop-chip-grid">
            ${entries.length ? entries.map((item) => `
              <article class="admin-drop-chip ${item.legacy ? "legacy" : ""}">
                <span class="admin-drop-thumb">${item.img ? `<img src="${this.escapeHtml(item.img)}" alt="" />` : "?"}</span>
                <span class="admin-drop-copy">
                  <strong>${this.escapeHtml(item.name)}</strong>
                  <small>${item.legacy ? "未匹配到物品库" : this.escapeHtml(item.kind || item.subCategory || item.category || "其他")}</small>
                </span>
                <button type="button" aria-label="移除${this.escapeHtml(item.name)}" title="移除" data-admin-remove-drop="${this.escapeHtml(item.id)}" data-group="${group.key}">×</button>
              </article>`).join("") : `<div class="admin-drop-empty">暂未添加</div>`}
          </div>
        </section>`;
    };
    return `
      <form class="admin-editor-card ${options.modal ? "modal-monster-card" : ""}" data-admin-monster-form>
        <div class="admin-form-title"><div><span>${selectedId ? "编辑资料" : "新建资料"}</span><h3>${selectedId ? this.escapeHtml(monster.name) : "新增怪物"}</h3></div>${selectedId ? `<button type="button" class="admin-danger" data-delete-monster="${selectedId}">删除怪物</button>` : ""}</div>
        <input type="hidden" name="id" value="${this.escapeHtml(selectedId)}" />
        <div class="admin-form-grid"><label><span>怪物名称</span><input name="name" value="${this.escapeHtml(field("name", monster.name || ""))}" required /></label><label><span>英文名</span><input name="nameEn" value="${this.escapeHtml(field("nameEn", monster.nameEn || ""))}" /></label><label><span>等级</span><input name="level" type="number" min="1" value="${this.escapeHtml(field("level", monster.level || 1))}" /></label><label><span>HP</span><input name="hp" type="number" min="0" value="${this.escapeHtml(field("hp", monster.hp || 0))}" /></label><label><span>MP</span><input name="mp" type="number" min="0" value="${this.escapeHtml(field("mp", monster.mp || 0))}" /></label><label><span>经验值</span><input name="exp" type="number" min="0" value="${this.escapeHtml(field("exp", monster.exp || 0))}" /></label><label><span>命中需求</span><input name="hitRequirement" type="number" min="0" value="${this.escapeHtml(field("hitRequirement", monster.hitRequirement || 0))}" /></label><label><span>命中</span><input name="acc" type="number" min="0" value="${this.escapeHtml(field("acc", monster.acc || 0))}" /></label><label><span>回避</span><input name="eva" type="number" min="0" value="${this.escapeHtml(field("eva", monster.eva || 0))}" /></label><label><span>速度</span><input name="speed" type="number" value="${this.escapeHtml(field("speed", monster.speed || 0))}" /></label><label><span>主要地图</span><input name="map" value="${this.escapeHtml(field("map", monster.map || ""))}" required /></label><label><span>密度</span><input name="density" value="${this.escapeHtml(field("density", monster.density || "常见"))}" /></label><label class="admin-field-wide"><span>怪物图片</span><input name="img" value="${this.escapeHtml(field("img", monster.img || ""))}" /></label></div>
        <section class="admin-attribute-editor">
          <div class="admin-subsection-title"><div><h4>属性标签</h4><span>点击选择；同一元素的弱点、抗性与免疫互斥</span></div><b>${draft.attributes.length} 项</b></div>
          <div class="admin-attribute-groups">
            ${monsterAttributeGroups.map((group) => `
              <div class="admin-attribute-group">
                <strong>${group.label}</strong>
                <div>${group.items.map((attribute) => `<button type="button" class="admin-attribute-chip ${draft.attributes.includes(attribute) ? "active" : ""}" data-admin-attribute="${attribute}">${attribute}</button>`).join("")}</div>
              </div>`).join("")}
          </div>
        </section>
        <section class="admin-drop-editor">
          <div class="admin-subsection-title"><div><h4>掉落物品</h4><span>从物品库与装备库中选择，避免名称不一致或无效关联</span></div><b>${Object.values(draft.drops).reduce((total, items) => total + items.length, 0)} 件</b></div>
          <div class="admin-drop-zone-grid">${dropGroups.map(renderDrop).join("")}</div>
        </section>
        ${this.monsterError ? `<p class="admin-form-error">${this.escapeHtml(this.monsterError)}</p>` : ""}
        <div class="admin-form-footer"><span>保存时会再次校验物品分类和属性冲突，用户端只会读取有效关联。</span><button type="submit" class="admin-primary">保存怪物资料</button></div>
      </form>`;
  }

  renderAdminMonsterCreateModal() {
    if (this.adminSelectedMonsterId !== "__new__") return "";
    return `
      <div class="admin-monster-editor-overlay" data-admin-monster-editor-overlay>
        <section class="admin-monster-editor-modal" role="dialog" aria-modal="true" aria-label="新增怪物">
          <header>
            <div><span>怪物图鉴管理</span><h3>新增怪物</h3><p>先录入基础资料，保存后会进入编辑状态，可继续维护掉落和属性。</p></div>
            <button type="button" data-admin-close-monster-editor aria-label="关闭">×</button>
          </header>
          ${this.renderAdminMonsterEditorCard({}, { modal: true })}
        </section>
      </div>`;
  }

  renderAdminMonsters() {
    const list = this.getAdminMonsterList();
    const monster = this.monsterItems.find((item) => String(item.id) === String(this.adminSelectedMonsterId)) || list[0] || {};
    const selectedId = monster.id || "";
    const draft = this.ensureAdminMonsterDraft(monster);
    const fieldDraft = this.adminMonsterFieldDraft?.id === String(selectedId || "__new__")
      ? this.adminMonsterFieldDraft.fields
      : {};
    const field = (name, fallback = "") => Object.prototype.hasOwnProperty.call(fieldDraft, name) ? fieldDraft[name] : fallback;
    const dropGroups = [
      { key: "equipment", title: "装备掉落", note: "仅可选择装备库中的武器、防具和饰品" },
      { key: "consumable", title: "消耗品 / 卷轴 / 飞镖", note: "仅可选择物品库中的消耗品" },
      { key: "other", title: "其他掉落", note: "材料、任务道具与其他物品" },
    ];
    const renderDrop = (group) => {
      const entries = draft.drops[group.key] || [];
      return `
        <section class="admin-drop-zone">
          <header>
            <div><h4>${group.title}</h4><span>${group.note}</span></div>
            <button type="button" data-admin-open-picker="${group.key}">＋ 添加掉落</button>
          </header>
          <div class="admin-drop-chip-grid">
            ${entries.length ? entries.map((item) => `
              <article class="admin-drop-chip ${item.legacy ? "legacy" : ""}">
                <span class="admin-drop-thumb">${item.img ? `<img src="${this.escapeHtml(item.img)}" alt="" />` : "?"}</span>
                <span class="admin-drop-copy">
                  <strong>${this.escapeHtml(item.name)}</strong>
                  <small>${item.legacy ? "未匹配到物品库" : this.escapeHtml(item.kind || item.subCategory || item.category || "其他")}</small>
                </span>
                <button type="button" aria-label="移除${this.escapeHtml(item.name)}" title="移除" data-admin-remove-drop="${this.escapeHtml(item.id)}" data-group="${group.key}">×</button>
              </article>`).join("") : `<div class="admin-drop-empty">暂未添加</div>`}
          </div>
        </section>`;
    };
    return `
      <section class="admin-section">
        <div class="admin-section-head"><div><span class="eyebrow">怪物图鉴管理</span><h2>怪物与掉落编辑器</h2><p>基础参数、属性和掉落关系统一维护。掉落只能从现有资料库选择，保存后会自动建立怪物与物品的双向关联。</p></div><button class="admin-primary" data-admin-new-monster>＋ 新增怪物</button></div>
        <div class="admin-editor-layout">
          <aside class="admin-record-list"><label class="admin-search"><span>⌕</span><input data-admin-query data-focus-key="admin-query" value="${this.escapeHtml(this.adminQuery)}" placeholder="搜索怪物、地图、等级" /></label><div class="admin-list-count">显示 ${list.length} 条匹配资料</div><div class="admin-record-scroll" data-scroll-key="admin-monster-list">${list.map((entry) => `<button class="${String(entry.id) === String(selectedId) ? "active" : ""}" data-admin-monster-id="${entry.id}"><img src="${entry.img}" alt="" /><span><strong>${entry.name}</strong><small>Lv.${entry.level} · ${entry.map}</small></span></button>`).join("")}</div></aside>
          ${this.renderAdminMonsterEditorCard(monster)}
        </div>
        ${this.renderAdminMonsterCreateModal()}
      </section>`;
  }

  renderAdminDropPicker() {
    if (!this.isAdmin || !this.adminDropPicker.open) return "";
    const titles = {
      equipment: ["选择装备掉落", "武器、防具、饰品等装备库资料"],
      consumable: ["选择消耗品", "药水、卷轴、飞镖与其他消耗品"],
      other: ["选择其他掉落", "材料、任务道具与其他非消耗物品"],
    };
    const [title, subtitle] = titles[this.adminDropPicker.group] || titles.other;
    const candidates = this.getAdminPickerCandidates();
    const types = this.getAdminPickerTypes();
    const selected = new Set(this.adminDropPicker.selected.map(String));
    const existing = new Set((this.adminMonsterDraft?.drops?.[this.adminDropPicker.group] || []).map((item) => String(item.id)));
    const bandCounts = candidates.reduce((counts, item) => {
      if (this.adminDropPicker.group === "equipment") {
        const band = this.getAdminPickerLevelBand(item);
        counts[band] = (counts[band] || 0) + 1;
      }
      return counts;
    }, {});
    let previousBand = "";
    return `
      <div class="admin-picker-overlay" role="presentation">
        <section class="admin-picker-modal" role="dialog" aria-modal="true" aria-label="${title}">
          <header class="admin-picker-head">
            <div><span>掉落资料库</span><h3>${title}</h3><p>${subtitle}</p></div>
            <button type="button" data-admin-close-picker aria-label="关闭">×</button>
          </header>
          <div class="admin-picker-toolbar">
            <label class="admin-picker-search"><span>⌕</span><input data-admin-picker-query data-focus-key="admin-picker-query" value="${this.escapeHtml(this.adminDropPicker.query)}" placeholder="搜索物品名称、英文名或编码" /></label>
            <div class="admin-picker-types" data-scroll-key="admin-picker-types">
              ${types.map((type) => `<button type="button" class="${this.adminDropPicker.type === type ? "active" : ""}" data-admin-picker-type="${this.escapeHtml(type)}">${this.escapeHtml(type)}</button>`).join("")}
            </div>
          </div>
          <div class="admin-picker-summary"><span>找到 ${candidates.length} 件</span><span>${selected.size ? `本次已选 ${selected.size} 件` : "可多选后一次加入"}</span></div>
          ${this.adminDropPicker.group === "equipment" ? `<div class="admin-picker-level-legend"><span>装备等级分段</span><b>0～40级</b><b>41～80级</b><b>81～120级</b><b>121级以上</b><em>等级未收录</em></div>` : ""}
          <div class="admin-picker-grid" data-scroll-key="admin-picker-results">
            ${candidates.length ? candidates.map((item) => {
              const level = this.getAdminPickerLevel(item);
              const band = this.adminDropPicker.group === "equipment" ? this.getAdminPickerLevelBand(item) : "";
              const bandHeader = band && band !== previousBand
                ? `<div class="admin-picker-level-band"><strong>${band}</strong><span>${bandCounts[band]} 件装备</span></div>`
                : "";
              previousBand = band;
              const isSelected = selected.has(String(item.id));
              const isExisting = existing.has(String(item.id));
              return `
                ${bandHeader}
                <button type="button" class="admin-picker-item ${isSelected ? "active" : ""} ${isExisting ? "existing" : ""}" data-admin-picker-item="${this.escapeHtml(item.id)}" ${isExisting ? "disabled" : ""}>
                  <span class="admin-picker-thumb"><img src="${this.escapeHtml(item.img || "")}" alt="" /></span>
                  <span><strong>${this.escapeHtml(item.name)}</strong><small>${this.escapeHtml(this.getAdminPickerType(item))}${this.adminDropPicker.group === "equipment" ? ` · ${level === null ? "等级未收录" : `需要等级 ${level}`}` : ""}</small></span>
                  <b>${isExisting ? "已添加" : isSelected ? "✓" : "+"}</b>
                </button>`;
            }).join("") : `<div class="admin-picker-empty"><strong>没有匹配的物品</strong><span>试试更换分类或搜索词。</span></div>`}
          </div>
          <footer class="admin-picker-footer">
            <span>只显示符合当前掉落分组的资料</span>
            <div><button type="button" data-admin-close-picker>取消</button><button type="button" class="admin-primary" data-admin-confirm-picker ${selected.size ? "" : "disabled"}>加入 ${selected.size} 件物品</button></div>
          </footer>
        </section>
      </div>`;
  }

  renderAdminFeatured() {
    const list = this.getAdminItemList().slice(0, 60);
    const taxonomy = this.getItemTaxonomy();
    const groups = [
      { key: "itemCategories", title: "物品系统分类", note: "物品库下的稳定分类", values: taxonomy.itemCategories },
      { key: "equipmentCategories", title: "装备系统分类", note: "装备库下的稳定分类", values: taxonomy.equipmentCategories },
      { key: "kinds", title: "重点类型", note: "运营筛选标签，可自由新增删除", values: taxonomy.kinds },
    ];
    return `<section class="admin-section">
      <div class="admin-section-head"><div><span class="eyebrow">分类设置</span><h2>物品分类与重点类型</h2><p>系统分类负责资料归属，重点类型负责运营筛选。装备的“武器 / 防具 / 饰品”属于系统分类，不建议当重点类型乱用。</p></div></div>
      <div class="admin-taxonomy-grid">
        ${groups.map((group) => `
          <section class="admin-taxonomy-card">
            <header><div><h3>${group.title}</h3><span>${group.note}</span></div><b>${group.values.length}</b></header>
            <div class="admin-taxonomy-chip-list">
              ${group.values.map((value) => `<span class="admin-taxonomy-chip">${this.escapeHtml(value)}<button type="button" title="删除${this.escapeHtml(value)}" data-group="${group.key}" data-admin-taxonomy-remove="${this.escapeHtml(value)}">×</button></span>`).join("")}
            </div>
            <div class="admin-taxonomy-add"><input data-admin-taxonomy-input="${group.key}" placeholder="新增名称" /><button type="button" data-admin-taxonomy-add="${group.key}">添加</button></div>
          </section>`).join("")}
      </div>
      <section class="admin-recommend-panel">
        <div class="admin-card-head"><div><h3>批量设置重点类型</h3><span>搜索物品后直接点选类型</span></div><b>物品打标</b></div>
        <label class="admin-search wide"><span>⌕</span><input data-admin-query data-focus-key="admin-query" value="${this.escapeHtml(this.adminQuery)}" placeholder="搜索物品后设置类型" /></label>
        <div class="admin-feature-grid">${list.map((item) => `<article class="admin-feature-card"><img src="${this.escapeHtml(item.img || "")}" alt="" /><div><strong>${this.escapeHtml(item.name)}</strong><small>${this.escapeHtml(item.category || "其他")} · 当前：${this.escapeHtml(item.kind || "其他")}</small><div>${taxonomy.kinds.map((kind) => `<button class="${item.kind === kind ? "active" : ""}" data-admin-kind-set="${this.escapeHtml(item.id)}" data-kind="${this.escapeHtml(kind)}">${this.escapeHtml(kind)}</button>`).join("")}</div></div></article>`).join("")}</div>
      </section>
    </section>`;
  }

  renderAdminMarket() {
    const watchlist = new Set((this.siteConfig.marketWatchlist || []).map(String));
    const query = String(this.adminQuery || "").trim().toLowerCase();
    const list = (this.catalogItems || []).filter((item) => {
      const matchesType = ["卷轴", "飞镖"].includes(item.kind);
      const matchesQuery = !query || `${item.name} ${item.nameEn} ${item.id} ${item.category} ${item.kind}`.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    }).slice(0, 120);
    return `<section class="admin-section"><div class="admin-section-head"><div><span class="eyebrow">行情宝库</span><h2>选择要观察的卷轴与飞镖</h2><p>行情品种直接从物品库选择，勾选后会显示在用户端行情观察池。</p></div></div><label class="admin-search wide"><span>⌕</span><input data-admin-query data-focus-key="admin-query" value="${this.escapeHtml(this.adminQuery)}" placeholder="搜索卷轴、飞镖或物品" /></label><div class="admin-watch-grid">${list.map((item) => `<button class="admin-watch-card ${watchlist.has(String(item.id)) ? "active" : ""}" data-admin-watch-toggle="${item.id}"><img src="${item.img}" alt="" /><span><strong>${item.name}</strong><small>${item.kind} · ${watchlist.has(String(item.id)) ? "已加入行情宝库" : "点击加入"}</small></span><b>${watchlist.has(String(item.id)) ? "✓" : "+"}</b></button>`).join("")}</div></section>`;
  }

  renderAdminRecommendations() {
    const recommendations = this.getHomeRecommendations();
    const goldRecommendationCount = recommendations.filter((entry) => this.isGoldRecommendationId(entry.itemId)).length;
    const sortMode = this.siteConfig.homeRecommendationSortMode === "manual" ? "manual" : "volatility";
    const liveOrder = this.getHomeMarketInstruments().map((item) => item.id);
    const byId = new Map(recommendations.map((entry) => [entry.itemId, entry]));
    const orderedRecommendations = sortMode === "volatility"
      ? [...liveOrder.map((id) => byId.get(id)).filter(Boolean), ...recommendations.filter((entry) => !liveOrder.includes(entry.itemId))]
      : recommendations;
    const slotCount = Math.max(9, Math.ceil((orderedRecommendations.length + 1) / 3) * 3);
    const slots = Array.from({ length: slotCount }, (_, index) => orderedRecommendations[index] || null);
    return `
      <section class="admin-section">
        <div class="admin-section-head">
          <div><span class="eyebrow">首页内容编排</span><h2>首页推荐</h2><p>管理首页推荐物品和金币汇率展示。</p></div>
          <span class="admin-live-dot">${recommendations.length} 个推荐位</span>
        </div>
        <section class="admin-recommend-panel home-rate-display-panel">
          <div class="admin-card-head"><div><h3>首页金币汇率</h3><span>选择首页卡片展示的区服</span></div><b>首页</b></div>
          <form class="home-rate-display-form" data-admin-home-rate-form>
            <div><strong>展示区服</strong><small>只影响首页卡片</small></div>
            <select name="homeServerKey">
              ${this.getGoldServerOptions(this.goldMarket?.items || []).map((option) => `<option value="${this.escapeHtml(option.key)}" ${this.getHomeGoldServerKey() === option.key ? "selected" : ""}>${this.escapeHtml(option.label)}</option>`).join("")}
            </select>
            <button type="submit" class="admin-primary">保存</button>
          </form>
        </section>
        <section class="admin-recommend-panel">
          <div class="admin-card-head admin-recommend-head">
            <div><h3>热门观察</h3><span>${sortMode === "volatility" ? "实时读取行情，按 24H 绝对涨跌自动排列" : "首页严格采用下方手动顺序"}</span></div>
            <div class="admin-recommend-sort-mode" role="group" aria-label="热门观察排序方式">
              <button type="button" class="${sortMode === "volatility" ? "active" : ""}" data-admin-recommend-sort-mode="volatility">波动率排序</button>
              <button type="button" class="${sortMode === "manual" ? "active" : ""}" data-admin-recommend-sort-mode="manual">手动排序</button>
            </div>
          </div>
          <div class="admin-recommend-rule"><span>行情联动</span><strong>${sortMode === "volatility" ? "有涨跌数据的品种优先，按波动率从高到低" : "使用上下按钮调整首页位置"}</strong><small>金币汇率最多占用 2 个推荐位</small><button type="button" data-admin-recommend-add-gold>添加金币区服</button></div>
          <div class="admin-recommend-board">
            ${slots.map((entry, index) => {
              if (!entry) {
                if (goldRecommendationCount < 2 && !slots.slice(0, index).some((slot) => !slot)) {
                  return `<button type="button" class="admin-recommend-slot empty gold-empty" data-admin-recommend-add-gold><span>¥</span><strong>添加金币汇率</strong><small>独立区服推荐位 · 还可添加 ${2 - goldRecommendationCount} 个</small></button>`;
                }
                return `<button type="button" class="admin-recommend-slot empty" data-admin-recommend-add-slot><span>＋</span><strong>添加推荐观察</strong><small>从行情品种选择</small></button>`;
              }
              const item = this.getRecommendationInstrument(entry.itemId);
              if (!item) return `<button type="button" class="admin-recommend-slot missing" data-admin-recommend-add-slot><span>?</span><strong>推荐物品缺失</strong><small>点击重新选择</small></button>`;
              const marketItem = item;
              const changeAvailable = marketItem?.changePercent !== null && marketItem?.changePercent !== undefined && Number.isFinite(Number(marketItem.changePercent));
              return `
                <article class="admin-recommend-slot ${sortMode === "manual" ? "manual" : ""}">
                  <button type="button" class="admin-recommend-slot-main" data-admin-recommend-edit="${this.escapeHtml(item.id)}">
                    <span class="admin-recommend-thumb"><img src="${this.escapeHtml(item.img || "")}" alt="" /></span>
                    <span class="admin-recommend-card-copy"><strong>${this.escapeHtml(item.name)}</strong><small>${this.escapeHtml(entry.badge || marketItem.heat || "观察中")}</small></span>
                    <span class="admin-recommend-card-meta"><em>${this.escapeHtml(item.kind || item.category || "行情品种")}</em><b>${!changeAvailable || entry.showChange === false ? "—" : `${Number(marketItem.changePercent) > 0 ? "+" : ""}${Number(marketItem.changePercent).toFixed(2)}%`}</b><small>位置 ${index + 1}</small></span>
                  </button>
                  ${sortMode === "manual" ? `<span class="admin-recommend-order-actions"><button type="button" data-admin-recommend-move="${this.escapeHtml(item.id)}" data-direction="-1" aria-label="上移" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-admin-recommend-move="${this.escapeHtml(item.id)}" data-direction="1" aria-label="下移" ${index >= orderedRecommendations.length - 1 ? "disabled" : ""}>↓</button></span>` : ""}
                </article>`;
            }).join("")}
          </div>
        </section>
        ${this.renderAdminRecommendationModal()}
      </section>`;
  }

  renderAdminRecommendationModal() {
    if (!this.adminRecommendModal?.open) return "";
    if (this.adminRecommendModal.mode === "add") return this.renderAdminRecommendationAddModal();
    const entry = this.getHomeRecommendations().find((item) => item.itemId === this.adminRecommendModal.itemId);
    const item = this.getRecommendationInstrument(this.adminRecommendModal.itemId);
    if (!entry || !item) return "";
    const marketItem = item;
    const changeText = marketItem?.changePercent == null ? "暂无涨跌数据" : `${Number(marketItem.changePercent) > 0 ? "+" : ""}${Number(marketItem.changePercent).toFixed(2)}%`;
    return `
      <div class="admin-recommend-modal-overlay" data-admin-recommend-overlay>
        <section class="admin-recommend-modal" role="dialog" aria-modal="true" aria-label="编辑推荐位">
          <header>
            <div><span>热门观察</span><h3>编辑推荐位</h3></div>
            <button type="button" data-admin-recommend-close aria-label="关闭">×</button>
          </header>
          <form class="admin-recommend-edit-form" data-admin-recommendation-form>
            <input type="hidden" name="itemId" value="${this.escapeHtml(item.id)}" />
            <div class="admin-recommend-edit-preview">
              <span class="admin-recommend-thumb large"><img src="${this.escapeHtml(item.img || "")}" alt="" /></span>
              <div><strong>${this.escapeHtml(item.name)}</strong><small>${this.escapeHtml(item.kind || item.category || "行情品种")} · ${changeText}</small></div>
            </div>
            <div class="admin-recommend-edit-grid">
              <label><span>副文案</span><input name="subtitle" value="${this.escapeHtml(entry.subtitle)}" placeholder="例如：开服首周重点观察" /></label>
              <label><span>角标</span><input name="badge" value="${this.escapeHtml(entry.badge)}" maxlength="12" placeholder="观察中" /></label>
              ${this.siteConfig.homeRecommendationSortMode === "manual" ? `<label><span>排序</span><input name="position" type="number" min="1" value="${entry.position}" /></label>` : `<label><span>排序</span><input value="按波动率自动排列" disabled /></label>`}
              <label class="admin-recommend-switch"><input name="showChange" type="checkbox" ${entry.showChange !== false ? "checked" : ""} />显示涨跌幅</label>
            </div>
            <footer>
              <button type="button" class="admin-danger" data-admin-recommend-remove="${this.escapeHtml(item.id)}">移除推荐</button>
              <div><button type="button" data-admin-recommend-close>取消</button><button type="submit" class="admin-primary">保存</button></div>
            </footer>
          </form>
        </section>
      </div>`;
  }

  renderAdminRecommendationAddModal() {
    const selected = new Set(this.getHomeRecommendations().map((entry) => entry.itemId));
    const selectedGoldCount = [...selected].filter((id) => this.isGoldRecommendationId(id)).length;
    const query = String(this.adminRecommendModal.query || "").trim().toLowerCase();
    const kind = this.adminRecommendModal.kind || "全部";
    const itemCandidates = (this.catalogItems || [])
      .filter((item) => ["卷轴", "飞镖"].includes(item.kind))
      .map((item) => ({ ...item, recommendationKind: item.kind }));
    const goldCandidates = this.getGoldRecommendationCandidates().map((item) => ({ ...item, recommendationKind: "金币" }));
    const candidates = [...itemCandidates, ...goldCandidates]
      .filter((item) => kind === "全部" || item.recommendationKind === kind)
      .filter((item) => !query || `${item.name} ${item.nameEn || ""} ${item.id} ${item.recommendationKind}`.toLowerCase().includes(query))
      .slice(0, 100);
    return `
      <div class="admin-recommend-modal-overlay" data-admin-recommend-overlay>
        <section class="admin-recommend-modal add" role="dialog" aria-modal="true" aria-label="添加推荐观察">
          <header>
            <div><span>推荐位</span><h3>添加推荐观察</h3></div>
            <button type="button" data-admin-recommend-close aria-label="关闭">×</button>
          </header>
          <div class="admin-recommend-add-tools">
            <label><span>⌕</span><input data-admin-recommend-add-query data-focus-key="admin-recommend-add-query" value="${this.escapeHtml(this.adminRecommendModal.query)}" placeholder="搜索金币区服、卷轴或飞镖" /></label>
            <div>${["全部", "金币", "卷轴", "飞镖"].map((type) => `<button type="button" class="${kind === type ? "active" : ""}" data-admin-recommend-kind="${type}">${type === "金币" ? "金币汇率" : type}</button>`).join("")}</div>
          </div>
          <div class="admin-recommend-add-grid">
            ${candidates.map((item) => {
              const isSelected = selected.has(String(item.id));
              const goldLimitReached = item.recommendationKind === "金币" && selectedGoldCount >= 2;
              const disabled = isSelected || goldLimitReached;
              const candidateMeta = item.recommendationKind === "金币" ? `${item.goldEdition || "金币汇率"} · ${item.reference || "暂无报价"}` : `${item.recommendationKind || "行情品种"}${item.reference ? ` · ${item.reference}` : ""}`;
              return `<button type="button" class="admin-recommend-candidate ${disabled ? "active" : ""}" ${disabled ? "disabled" : ""} data-admin-recommend-add="${this.escapeHtml(item.id)}"><img src="${this.escapeHtml(item.img || "")}" alt="" /><span><strong>${this.escapeHtml(item.name)}</strong><small>${this.escapeHtml(candidateMeta)}</small></span><b>${isSelected ? "已推荐" : goldLimitReached ? "最多2个" : "添加"}</b></button>`;
            }).join("") || `<div class="admin-recommend-empty">没有找到匹配的行情品种。</div>`}
          </div>
        </section>
      </div>`;
  }

  renderPage() {
    if (this.active === "管理" && this.isAdmin) return this.renderAdmin();
    if (this.active === "我的主页") return this.renderUserCenter();
    if (this.active === "行情") return this.renderMarket();
    if (this.active === "图鉴") return this.renderCodex();
    if (this.active === "物品") return this.renderItems();
    if (this.active === "资讯") return this.newsDetailId ? this.renderNewsDetail(this.newsDetailId) : this.renderNewsCenter();
    if (this.active === "开荒") return this.newsDetailId ? this.renderNewsDetail(this.newsDetailId) : this.renderGuideCenter();
    if (this.active === "关于作者") return this.renderAbout();
    return this.renderHome();
  }

  renderHome() {
    const t = this.getCountdown();
    return `
      <section class="channel-strip">
        ${this.renderChannel("图鉴", "怪物掉落", asset("assets/monsters/slime.png"), "图鉴")}
        ${this.renderChannel("物品", "装备消耗", asset("assets/items/catalog/02070005.png"), "物品")}
        ${this.renderChannel("行情", "卷轴飞镖", asset("assets/items/scroll-glove-att-60-orange.png"), "行情")}
        ${this.renderChannel("砸卷", "试试手气", asset("assets/items/scroll-glove-att-10-yellow.png"), "首页", { scrollSoon: true })}
        ${this.renderChannel("汇率", "金币比例", goldIcon, "行情", { goldMarket: true })}
        ${this.renderChannel("开荒", "路线清单", asset("assets/monsters/octopus.png"), "开荒")}
      </section>
      <section class="home-layout">
        <div class="left-stack">
          <article class="open-card">
            <div>
              <span class="eyebrow">全网怀旧服行情聚合，最低物价实时更新</span>
              <h1>先看行情，再查掉落。</h1>
              <p>专注冒险岛怀旧服的实时行情数据站｜实时聚合全网行情，交易开荒、成交比价、打宝掉落，有据可依。</p>
            </div>
            <div class="countdown-card launch-timeline"><span>已开服</span><small>自 2026.08.03 14:00 起</small><div class="countdown" data-countdown>${this.renderCountdown(t)}</div></div>
          </article>
          ${this.renderMarketFeed()}
        </div>
        <aside class="side-stack">
          ${this.renderRateCard()}
          ${this.renderScrollSimulator()}
          ${this.renderMonsterFeed()}
        </aside>
      </section>
    `;
  }

  getMyNewsItems() {
    const name = this.currentDisplayName || this.currentUser;
    return (this.newsItems || [])
      .map((item) => this.normalizeNewsItem(item))
      .filter((item) => item.author === name || item.source === name)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  renderUserCenter() {
    if (!this.isLoggedIn) return this.renderHome();
    const mine = this.getMyNewsItems();
    const guideCount = mine.filter((item) => item.channel === "guide").length;
    const postCount = mine.filter((item) => item.channel === "community").length;
    const commentCount = mine.reduce((total, item) => total + (Array.isArray(item.comments) ? item.comments.length : 0), 0);
    const publishedCount = mine.filter((item) => item.status === "已发布").length;
    const hour = new Date().getHours();
    const greeting = hour < 6 ? "夜深了" : hour < 12 ? "上午好" : hour < 18 ? "下午好" : "晚上好";
    const contents = mine.length ? mine.map((item) => `
      <article class="user-content-row" data-open-news="${this.escapeHtml(item.id)}">
        ${item.cover ? `<img src="${this.escapeHtml(item.cover)}" alt="" />` : `<span>${item.channel === "guide" ? "攻" : "帖"}</span>`}
        <div>
          <strong>${this.escapeHtml(item.title)}</strong>
          <small>${this.escapeHtml(item.kind)} · ${item.channel === "guide" ? "开荒攻略" : "资讯社区"} · ${this.escapeHtml(item.date || "今日")}</small>
        </div>
        <b class="${item.status === "待审核" ? "pending" : ""}">${this.escapeHtml(item.status)}</b>
      </article>`).join("") : `<div class="user-empty"><strong>还没有发布内容</strong><span>可以先发布一篇开荒攻略，或者在资讯里发一个讨论帖。</span></div>`;
    const recentContents = mine.slice(0, 4);
    const quickActions = `
      <div class="user-quick-actions">
        <button data-open-publisher="guide"><strong>发布攻略</strong><span>适合视频、图文、开荒路线</span></button>
        <button data-open-publisher="community"><strong>发布帖子</strong><span>适合讨论、行情观点、问答</span></button>
        ${this.isModerator ? `<button data-account-go-admin><strong>内容管理</strong><span>编辑、删除帖子和攻略</span></button>` : ""}
      </div>`;
    return `
      <section class="user-center-page">
        <aside class="user-sidebar">
          <div class="user-profile-card">
            ${this.renderAvatar("account-avatar hero")}
            <strong>${this.escapeHtml(this.currentDisplayName || this.currentUser)}</strong>
            <small>${this.escapeHtml(this.getRoleLabel(this.currentRole))}</small>
          </div>
          <div class="user-role-switch">
            <span>当前身份</span>
            <div><b class="active">${this.escapeHtml(this.getRoleLabel(this.currentRole))}</b>${this.isModerator ? `<b>版主权限</b>` : ""}</div>
          </div>
          <nav class="user-nav-card">
            <button class="${this.userSection === "overview" ? "active" : ""}" data-user-section="overview"><i>▦</i><span>工作台</span></button>
            <button class="${this.userSection === "contents" ? "active" : ""}" data-user-section="contents"><i>□</i><span>我的攻略 / 帖子</span></button>
            <button class="${this.userSection === "profile" ? "active" : ""}" data-user-section="profile"><i>人</i><span>账号资料</span></button>
            <button class="danger" data-account-logout><i>↪</i><span>退出登录</span></button>
          </nav>
        </aside>
        <div class="user-main">
          <section class="user-hero-panel">
            <div>
              <span class="eyebrow">${this.escapeHtml(this.getRoleLabel(this.currentRole))}工作台</span>
              <h1>${greeting}，${this.escapeHtml(this.currentDisplayName || this.currentUser)}</h1>
              <p>在这里管理你的攻略和帖子。内容发布后直接展示，管理员负责维护秩序。</p>
            </div>
            <div class="user-credit"><span>信用分</span><strong>100</strong></div>
          </section>
          ${this.userSection === "profile" ? "" : `<section class="user-stat-grid">
            <article><span>已发布</span><strong>${publishedCount}</strong><small>公开展示内容</small></article>
            <article><span>收到评论</span><strong>${commentCount}</strong><small>玩家互动记录</small></article>
            <article><span>攻略</span><strong>${guideCount}</strong><small>开荒频道内容</small></article>
            <article><span>帖子</span><strong>${postCount}</strong><small>资讯社区内容</small></article>
          </section>`}
          ${this.userSection === "profile" ? `
            <section class="user-panel profile-panel">
              <div class="profile-panel-head"><span>账号</span><h2>账号资料</h2><p>编辑你的头像、昵称和个人简介。</p></div>
              <form class="profile-edit-form" data-profile-form>
                <div class="profile-avatar-editor">
                  ${this.renderAvatar("account-avatar profile-edit-avatar")}
                  <div>
                    <strong>头像设置</strong>
                    <span>上传图片或选择一个头像底色。</span>
                    <label class="profile-upload-btn">上传头像<input type="file" accept="image/*" data-profile-avatar-file /></label>
                  </div>
                </div>
                <input type="hidden" name="avatarUrl" value="${this.escapeHtml(this.avatarUrl)}" />
                <div class="profile-color-row">
                  ${["#0b9ed5", "#5b6df6", "#fb7299", "#22b67a", "#f2a93b"].map((color) => `<label style="--swatch:${color}"><input type="radio" name="avatarColor" value="${color}" ${this.avatarColor === color ? "checked" : ""} /><span></span></label>`).join("")}
                </div>
                <div class="profile-form-grid">
                  <label><span>昵称</span><input name="displayName" value="${this.escapeHtml(this.currentDisplayName || this.currentUser)}" maxlength="18" /></label>
                  <label><span>账号</span><input value="${this.escapeHtml(this.currentUser)}" disabled /></label>
                  <label><span>当前身份</span><input value="${this.escapeHtml(this.getRoleLabel(this.currentRole))}" disabled /></label>
                  <label><span>已开通权限</span><input value="${this.escapeHtml((this.currentRoles || []).map((role) => this.getRoleLabel(role)).join("、") || "玩家")}" disabled /></label>
                </div>
                <label class="profile-bio-editor"><span>简介</span><textarea name="bio" rows="4" maxlength="160" placeholder="写一句让其他玩家认识你的简介。">${this.escapeHtml(this.profileBio || "")}</textarea></label>
                ${this.loginError ? `<p class="form-error">${this.escapeHtml(this.loginError)}</p>` : ""}
                ${this.userNotice ? `<p class="user-notice compact">${this.escapeHtml(this.userNotice)}</p>` : ""}
                <footer><span>头像图片会保存在本地资料文件里。</span><button type="submit" class="top-publish-btn" ${this.loginBusy ? "disabled" : ""}>${this.loginBusy ? "保存中..." : "保存资料"}</button></footer>
              </form>
            </section>` : `
            ${this.userSection === "overview" ? quickActions : ""}
            <section class="user-panel">
              <div class="user-panel-head"><div><h2>${this.userSection === "contents" ? "我的攻略 / 帖子" : "最近内容"}</h2><span>${mine.length ? "点击条目可进入详情页" : "还没有内容时，先从上方入口发布"}</span></div><div><button data-open-publisher="guide">发布攻略</button><button data-open-publisher="community">发布帖子</button></div></div>
              <div class="user-content-list">${this.userSection === "overview" && recentContents.length ? recentContents.map((item) => `
                <article class="user-content-row" data-open-news="${this.escapeHtml(item.id)}">
                  ${item.cover ? `<img src="${this.escapeHtml(item.cover)}" alt="" />` : `<span>${item.channel === "guide" ? "攻" : "帖"}</span>`}
                  <div>
                    <strong>${this.escapeHtml(item.title)}</strong>
                    <small>${this.escapeHtml(item.kind)} · ${item.channel === "guide" ? "开荒攻略" : "资讯社区"} · ${this.escapeHtml(item.date || "今日")}</small>
                  </div>
                  <b class="${item.status === "待审核" ? "pending" : ""}">${this.escapeHtml(item.status)}</b>
                </article>`).join("") : contents}</div>
            </section>`}
        </div>
      </section>`;
  }

  renderChannel(label, sub, img, nav, options = {}) {
    if (options.goldMarket) {
      return `<button class="channel" data-open-gold-market><span class="thumb small"><img src="${img}" alt="" /></span><strong>${label}</strong><small>${sub}</small></button>`;
    }
    if (options.scrollSoon) {
      return `<button class="channel" data-scroll-soon><span class="thumb small"><img src="${img}" alt="" /></span><strong>${label}</strong><small>${sub}</small></button>`;
    }
    return `<button class="channel" data-nav="${nav}"><span class="thumb small"><img src="${img}" alt="" /></span><strong>${label}</strong><small>${sub}</small></button>`;
  }

  renderCountdown(t) {
    if (!t) return `<div><strong>待定</strong><span>时间未公布</span></div>`;
    return `<div><strong>${t.day}</strong><span>天</span></div><div><strong>${String(t.hour).padStart(2, "0")}</strong><span>时</span></div><div><strong>${String(t.minute).padStart(2, "0")}</strong><span>分</span></div><div><strong>${String(t.second).padStart(2, "0")}</strong><span>秒</span></div>`;
  }

  renderRateCard() {
    const allListings = this.goldMarket?.items || [];
    const configuredServer = this.getHomeGoldServerKey(allListings);
    const scopedListings = configuredServer === "全部"
      ? allListings
      : allListings.filter((item) => this.goldServerKey(item) === configuredServer);
    const best = this.getBestGoldListingAcrossServers(scopedListings.length ? scopedListings : allListings);
    const price = best ? Number(best.pricePerYi || 0) : 0;
    const unit = best?.unit || (this.goldEdition(best) === "怀旧服" ? "万金" : "亿金");
    const daily = best ? this.getGoldDailyChange(best) : null;
    const sampledAt = this.goldMarket?.sampledAt ? this.formatSampleTime(this.goldMarket.sampledAt) : "";
    const updated = sampledAt ? sampledAt.split(" ").slice(1).join(" ") || sampledAt : "暂无更新";
    const changeClass = daily == null ? "pending" : daily > 0 ? "up" : daily < 0 ? "down" : "flat";
    const changeText = daily == null ? "—" : `${daily > 0 ? "+" : ""}${daily.toFixed(2)}%`;
    return `<article class="mini-panel rate-card">
      <div class="panel-title-line rate-title"><h2>金币汇率</h2><span class="rate-live-state">${price ? "10分钟更新" : "暂无报价"}</span></div>
      ${best ? `<div class="rate-server"><span></span><strong>${this.escapeHtml(best.server || "未知服务器")}</strong><small>${this.escapeHtml(this.goldEdition(best) === "怀旧服" ? `${best.area || "国服"}怀旧服` : best.area || "未知区服")}</small></div>` : ""}
      <div class="rate-main rate-quote-grid">
        <div class="rate-quote">
          <small>当前最低价</small>
          <strong>${price ? `¥${price.toFixed(3)}<em>/ ${unit}</em>` : "暂无报价"}</strong>
          <span>${price ? `约 1 元 = ${this.formatGoldPerCny(price)} ${unit}` : "当前区服暂未发现有效报价。"}</span>
        </div>
        <div class="rate-daily ${changeClass}">
          <small>今日涨跌</small>
          <strong>${changeText}</strong>
          <span>${daily == null ? "今日暂无变化" : "较今日首笔"}</span>
        </div>
      </div>
      <p class="rate-footer">${price ? `<span>${this.escapeHtml(best.source || "行情来源")} · ${updated}</span><button class="rate-footer-link" type="button" data-open-gold-market>查看行情 ›</button>` : "公开报价更新后会显示在这里。"}</p>
    </article>`;
  }

  renderScrollSimulator() {
    const img = this.scrollRate === 60 ? asset("assets/items/scroll-glove-att-60-orange.png") : asset("assets/items/scroll-glove-att-10-yellow.png");
    return `<article class="mini-panel simulator"><div class="panel-title-line"><h2>砸卷模拟器</h2><span>${this.scrollRate}%</span></div><div class="sim-body"><span class="thumb big"><img src="${img}" alt="" /></span><div><div class="seg-mini"><button class="${this.scrollRate === 60 ? "active" : ""}" data-scroll-rate="60">60%</button><button class="${this.scrollRate === 10 ? "active" : ""}" data-scroll-rate="10">10%</button></div><button class="roll-btn" data-roll-scroll>试砸一次</button></div></div><p>${this.scrollLog}</p></article>`;
  }

  rollScroll() {
    this.scrollLog = Math.random() * 100 < this.scrollRate ? "成功！装备闪了一下，围观群众开始报价。" : "失败，卷轴化成灰。老板说下张一定行。";
    this.render();
  }

  renderMarketFeed() {
    const items = this.getHomeMarketInstruments();
    const sortLabel = this.siteConfig.homeRecommendationSortMode === "manual" ? "管理员排序" : "按 24H 波动率排序";
    return `<article class="panel span-7"><div class="panel-head"><h2>热门观察</h2><span>行情联动 · ${sortLabel}</span></div><div class="item-grid market-observe-grid">${items.map((item) => {
      const change = item.changePercent;
      const hasChange = item.showChange !== false && change !== null && change !== undefined && change !== "" && Number.isFinite(Number(change));
      const changeText = hasChange ? `${Number(change) > 0 ? "+" : ""}${Number(change).toFixed(2)}%` : "—";
      const changeClass = !hasChange ? "pending" : Number(change) > 0 ? "up" : Number(change) < 0 ? "down" : "flat";
      const listingCount = Number(item.homeListingCount || 0);
      const quoteText = item.homeReference || item.reference || "暂无报价";
      return `<button class="item-card market-observe-card" data-home-market-item="${this.escapeHtml(item.id)}"><span class="thumb"><img src="${this.escapeHtml(item.img)}" alt="${this.escapeHtml(item.name)}" /></span><span class="observe-copy"><strong>${this.escapeHtml(item.short)}</strong><small>${this.escapeHtml(item.recommendationSubtitle || item.marketServerKey?.split(" / ").pop() || item.heat)}</small><span class="observe-live-quote"><b>${this.escapeHtml(quoteText)}</b><i>${listingCount ? `${listingCount} 条在售` : "暂无在售"}</i></span></span><span class="observe-market-meta"><em>${this.escapeHtml(item.category)}</em><span class="observe-change ${changeClass}"><strong>${changeText}</strong><small>24H 涨跌</small></span></span></button>`;
    }).join("")}</div></article>`;
  }

  renderMonsterFeed() {
    const list = (this.monsterItems || []).slice(0, 5);
    return `<article class="panel span-5"><div class="panel-head"><h2>金银岛怪物</h2><span>${list.length ? "来自资料库" : "暂无怪物资料"}</span></div><div class="monster-feed">${list.length ? list.map((monster) => `<button class="monster-chip" data-nav="图鉴"><img src="${monster.img}" alt="${monster.name}" /><span><strong>${monster.name}</strong><small>Lv.${monster.level} · ${monster.map}</small></span></button>`).join("") : `<div class="codex-empty">暂无可展示怪物，先去图鉴看看。</div>`}</div></article>`;
  }

  getDartServerOptions() {
    const configured = Array.isArray(this.dartMarket?.servers) ? this.dartMarket.servers : [];
    if (configured.length) return configured;
    return ["蓝蜗牛", "蘑菇仔", "绿水灵", "漂漂猪", "小白兔"].map((name) => ({ key: `国服 / ${name}`, name }));
  }

  getScrollServerOptions() {
    const configured = Array.isArray(this.scrollMarket?.servers) ? this.scrollMarket.servers : [];
    if (configured.length) return configured;
    return ["蓝蜗牛", "蘑菇仔", "绿水灵", "漂漂猪", "小白兔"].map((name) => ({ key: `国服 / ${name}`, name }));
  }

  getScrollMarketView(scrollId) {
    const serverOptions = this.getScrollServerOptions();
    if (!serverOptions.some((option) => option.key === this.scrollServerFilter)) {
      this.scrollServerFilter = serverOptions[0]?.key || "国服 / 蓝蜗牛";
    }
    const allListings = (this.scrollMarket?.items || []).filter((item) => String(item.scrollId) === String(scrollId));
    const listings = allListings
      .filter((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}` === this.scrollServerFilter)
      .sort((a, b) => Number(a.priceCny) - Number(b.priceCny));
    const best = listings[0] || null;
    const history = (this.scrollMarket?.recentHistory || [])
      .filter((row) => String(row.scrollId) === String(scrollId) && row.serverKey === this.scrollServerFilter)
      .sort((a, b) => new Date(a.sampledAt).getTime() - new Date(b.sampledAt).getTime());
    const firstPrice = Number(history[0]?.minPrice || 0);
    const latestPrice = Number(best?.priceCny || history[history.length - 1]?.minPrice || 0);
    const changePercent = history.length > 1 && firstPrice ? ((latestPrice - firstPrice) / firstPrice) * 100 : null;
    const serverQuotes = serverOptions.map((option) => {
      const rows = allListings
        .filter((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}` === option.key)
        .sort((a, b) => Number(a.priceCny) - Number(b.priceCny));
      return { ...option, count: rows.length, price: Number(rows[0]?.priceCny || 0) };
    });
    return {
      allListings,
      listings,
      best,
      history,
      changePercent,
      serverOptions,
      serverQuotes,
      serverName: serverOptions.find((option) => option.key === this.scrollServerFilter)?.name || this.scrollServerFilter,
      sourceName: this.scrollMarket?.sourceName || "DD373",
      sampledAt: this.scrollMarket?.sampledAt || "",
    };
  }

  getDartMarketView(dartId) {
    const serverOptions = this.getDartServerOptions();
    if (!serverOptions.some((option) => option.key === this.dartServerFilter)) {
      this.dartServerFilter = serverOptions[0]?.key || "国服 / 蓝蜗牛";
    }
    const allListings = (this.dartMarket?.items || []).filter((item) => String(item.dartId) === String(dartId));
    const listings = allListings
      .filter((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}` === this.dartServerFilter)
      .sort((a, b) => Number(a.priceCny) - Number(b.priceCny));
    const best = listings[0] || null;
    const history = (this.dartMarket?.recentHistory || [])
      .filter((row) => String(row.dartId) === String(dartId) && row.serverKey === this.dartServerFilter)
      .sort((a, b) => new Date(a.sampledAt).getTime() - new Date(b.sampledAt).getTime());
    const firstPrice = Number(history[0]?.minPrice || 0);
    const latestPrice = Number(best?.priceCny || history[history.length - 1]?.minPrice || 0);
    const changePercent = history.length > 1 && firstPrice ? ((latestPrice - firstPrice) / firstPrice) * 100 : null;
    const serverQuotes = serverOptions.map((option) => {
      const rows = allListings
        .filter((item) => `${item.area || "国服"} / ${item.server || "未知服务器"}` === option.key)
        .sort((a, b) => Number(a.priceCny) - Number(b.priceCny));
      return { ...option, count: rows.length, price: Number(rows[0]?.priceCny || 0) };
    });
    return {
      allListings,
      listings,
      best,
      history,
      changePercent,
      serverOptions,
      serverQuotes,
      serverName: serverOptions.find((option) => option.key === this.dartServerFilter)?.name || this.dartServerFilter,
      sourceName: this.dartMarket?.sourceName || "DD373",
      sampledAt: this.dartMarket?.sampledAt || "",
    };
  }

  renderDartMarketPanel(selected, view, marketKind = "dart") {
    const isScroll = marketKind === "scroll";
    const sampledAt = view?.sampledAt ? this.formatSampleTime(view.sampledAt) : "";
    const bestPrice = Number(view.best?.priceCny || 0);
    const chartRows = view.history.map((row) => ({
      ...row,
      bestPricePerYi: Number(row.minPrice || 0),
      bestSource: "DD373",
    }));
    return `
      <section class="radar-chart-card data-shell dart-market-panel">
        <div class="dart-console-toolbar">
          <div class="dart-console-title"><strong>${this.escapeHtml(selected.name)}行情</strong><span>${this.escapeHtml(view.sourceName || "DD373")} · ${sampledAt ? `更新于 ${sampledAt}` : "公开在售报价"}</span></div>
          <span class="dart-console-source">国服 · 公开在售报价</span>
        </div>
        <div class="dart-console-body">
          <aside class="dart-quote-rail">
            ${view.listings.length ? `
              <div class="dart-price-primary">
                <span>当前全网最低售价</span>
                <strong>¥${bestPrice.toFixed(2)}</strong>
                <small>${this.escapeHtml(view.serverName)} · ${view.listings.length} 条在售报价</small>
                <a href="${this.escapeHtml(view.best.url)}" target="_blank" rel="noreferrer">查看全网最低价</a>
              </div>
              <div class="dart-best-listing">
                <span>最低价商品</span>
                <strong>${this.escapeHtml(view.best.title)}</strong>
                <small>DD373 · 库存 ${this.escapeHtml(view.best.inventory || 1)}</small>
              </div>
            ` : `<div class="dart-quote-empty"><strong>暂无报价</strong><span>${this.escapeHtml(view.serverName)}当前无在售商品</span></div>`}
          </aside>
          <div class="dart-chart-column">
            <div class="dart-chart-caption">
              <div><strong>全网最低售价走势</strong><span>${this.escapeHtml(view.serverName)} · 每 10 分钟更新</span></div>
              ${view.listings.length ? `<div class="chart-switch">${["分时", "日线", "7日", "30日"].map((range) => `<button class="${this.goldChartRange === range ? "active" : ""}" data-gold-range="${range}">${range}</button>`).join("")}</div>` : ""}
            </div>
            ${view.listings.length ? this.renderGoldTrend(chartRows, `${view.serverName} · ${selected.name}`, isScroll ? "张" : "件") : `<div class="radar-chart-stage empty">${this.renderChartPlaceholder("暂无相关交易信息", `${view.serverName}当前没有找到${selected.name}的有效在售报价。`)}</div>`}
          </div>
          <aside class="dart-server-rail">
            <div class="dart-server-rail-head"><strong>选择区服</strong><span>国服</span></div>
            <div class="dart-server-quotes">
              ${view.serverQuotes.map((quote) => `<button type="button" class="${quote.key === (isScroll ? this.scrollServerFilter : this.dartServerFilter) ? "active" : ""}" data-${isScroll ? "scroll" : "dart"}-server="${this.escapeHtml(quote.key)}"><span>${this.escapeHtml(quote.name)}</span><small>${quote.count ? `${quote.count} 条在售` : "暂无在售"}</small></button>`).join("")}
            </div>
          </aside>
        </div>
        ${view.listings.length ? `<details class="dart-listing-details" open>
            <summary><span><strong>区服在售报价明细</strong><small>${this.escapeHtml(view.serverName)} · ${view.listings.length} 条公开报价</small></span><b class="dart-details-toggle" aria-hidden="true"></b></summary>
            <div class="dart-listing-table"><table><thead><tr><th>商品标题</th><th>区服</th><th>价格</th><th>库存</th><th>来源</th></tr></thead><tbody>
              ${view.listings.slice(0, 12).map((item, index) => `<tr class="${index === 0 ? "best" : ""}"><td><strong>${this.escapeHtml(item.title)}</strong>${index === 0 ? "<em>当前最低价</em>" : ""}</td><td>${this.escapeHtml(item.server)}</td><td><b>¥${Number(item.priceCny).toFixed(2)}</b></td><td>${this.escapeHtml(item.inventory || 1)}</td><td><a href="${this.escapeHtml(item.url)}" target="_blank" rel="noreferrer">查看商品</a></td></tr>`).join("")}
            </tbody></table></div>
          </details>` : ""}
      </section>`;
  }

  renderMarket() {
    const instruments = this.getMarketInstruments();
    const filtered = instruments.filter((item) => item.category === this.marketCategory);
    const selected = this.selectedItem;
    const isGold = this.marketCategory === "金币汇率";
    const isDart = !isGold && selected.category === "飞镖";
    const isScroll = !isGold && selected.category === "卷轴";
    const dartView = isDart ? this.getDartMarketView(selected.id) : null;
    const scrollView = isScroll ? this.getScrollMarketView(selected.id) : null;
    const liveView = dartView || scrollView;
    const dartChange = liveView?.changePercent;
    const dartChangeText = dartChange == null ? "—" : `${dartChange > 0 ? "+" : ""}${dartChange.toFixed(2)}%`;
    return `
      <section class="market-radar market-workbench">
        <header class="radar-head compact">
          <div>
            <span class="eyebrow">行情雷达</span>
            <h1>行情观察</h1>
            <p>持续采集公开交易信息，按区服追踪全网最低售价与价格变化。</p>
          </div>
          <div class="radar-status slim"><strong>持续更新</strong><span>公开报价与最低价追踪</span></div>
        </header>

        <div class="market-tabs">
          ${["卷轴", "飞镖"].map((category) => `<button class="${this.marketCategory === category ? "active" : ""}" data-market-category="${category}">${category}<span>${instruments.filter((item) => item.category === category).length}</span></button>`).join("")}
          <button class="${isGold ? "active" : ""}" data-market-category="金币汇率">金币汇率<span>采样中</span></button>
        </div>

        ${isGold ? this.renderGoldMarket() : `<div class="market-console">
          <aside class="instrument-panel">
            <div class="instrument-head">
              <div><strong>${this.marketCategory}品种</strong><span>${this.marketCategory === "卷轴" ? "按部位、成功率、用途筛选" : "按阶段和稀有度筛选"}</span></div>
              <button>筛选</button>
            </div>
            <label class="instrument-search"><span>⌕</span><input placeholder="搜索品种名称" /></label>
            <div class="instrument-list">
              ${filtered.map((item) => `<button class="instrument-row ${selected.id === item.id ? "active" : ""}" data-market-id="${item.id}"><span class="icon-plate"><img src="${item.img}" alt="${item.name}" /></span><span><strong>${item.name}</strong><small>${item.tags}</small></span><em>${item.reference}</em></button>`).join("")}
            </div>
            <div class="instrument-more">
              <strong>品类说明</strong>
              <span>${this.marketCategory === "卷轴" ? "按用途、部位和成功率整理常用卷轴。" : "收录常用飞镖，报价按区服独立统计。"}</span>
            </div>
          </aside>

          <main class="market-main">
            <section class="asset-summary refined">
              <div class="asset-title">
                <span class="thumb huge"><img src="${selected.img}" alt="${selected.name}" /></span>
                <div><h2>${selected.name}</h2><p>${selected.tags}</p></div>
              </div>
              <div class="asset-metrics">
                ${this.renderQuoteStat("参考价", liveView?.best ? `¥${Number(liveView.best.priceCny).toFixed(2)}` : selected.reference, "flat")}
                ${this.renderQuoteStat("24H", liveView ? dartChangeText : "—", dartChange > 0 ? "up" : dartChange < 0 ? "down" : "flat")}
                ${this.renderQuoteStat("样本", liveView ? String(liveView.listings.length || 0) : "0", "flat")}
                ${this.renderQuoteStat("热度", liveView ? (liveView.listings.length ? "已有报价" : "暂无报价") : selected.heat, liveView && !liveView.listings.length ? "flat" : "up")}
              </div>
            </section>

            ${liveView ? this.renderDartMarketPanel(selected, liveView, isScroll ? "scroll" : "dart") : `<section class="radar-chart-card data-shell">
              <div class="radar-chart-head">
                <div><strong>价格记录</strong><span>按公开报价整理价格变化</span></div>
                <div class="chart-switch"><button class="active">分时</button><button>日线</button><button>7日</button><button>30日</button></div>
              </div>
              <div class="radar-chart-stage empty">${this.renderChartPlaceholder()}</div>
            </section>
            ${this.renderSampleTable()}`}
          </main>

          <aside class="radar-aside">
            <section class="decision-card"><span>${liveView ? "市场状态" : "当前观察"}</span><strong>${liveView ? (liveView.listings.length ? "发现公开报价" : "暂无相关交易信息") : "关注价格变化"}</strong><p>${liveView ? (liveView.listings.length ? `${liveView.serverName}当前有 ${liveView.listings.length} 条${selected.name}在售报价。` : `${liveView?.serverName || "当前区服"}暂未发现${selected.name}在售信息。`) : selected.reason}</p></section>
            <section class="aside-block"><h2>价格驱动</h2><div class="side-tags">${selected.drivers.map((x) => `<span>${x}</span>`).join("")}</div></section>
            <section class="aside-block"><h2>关联资料</h2><div class="link-list"><button>掉落来源</button><button>物品资料</button><button>开荒攻略</button></div></section>
          </aside>
        </div>`}
        ${this.renderRelatedNewsPanel(isGold ? { id: "gold-rate", name: "金币汇率", category: "金币汇率" } : selected)}
      </section>`;
  }

  getGoldRankingRows(edition = this.goldEditionFilter) {
    const allListings = this.goldMarket?.items || [];
    const editionListings = allListings.filter((item) => this.goldEdition(item) === edition);
    const recommendedClassicOrder = ["蓝蜗牛", "蘑菇仔", "绿水灵", "漂漂猪", "小白兔"];
    const rows = this.getGoldServerOptions(editionListings, edition)
      .map((option) => {
        const serverListings = editionListings.filter((item) => this.goldServerKey(item) === option.key);
        const effectiveListings = this.getEffectiveGoldListings(serverListings);
        const best = effectiveListings[0] || null;
        return {
          key: option.key,
          label: option.label,
          best,
          price: Number(best?.pricePerYi || 0),
          unit: best?.unit || (edition === "怀旧服" ? "万金" : "亿金"),
          change: best ? this.getGoldDailyChange(best) : null,
          listingCount: effectiveListings.length,
        };
      });
    return rows.sort((a, b) => {
      if (this.goldRankingSort === "price-asc" || this.goldRankingSort === "price-desc") {
        const priceA = a.price > 0 ? a.price : Number.POSITIVE_INFINITY;
        const priceB = b.price > 0 ? b.price : Number.POSITIVE_INFINITY;
        const result = priceA - priceB || b.listingCount - a.listingCount;
        return this.goldRankingSort === "price-desc" ? -result : result;
      }
      if (edition === "怀旧服") {
        const indexA = recommendedClassicOrder.indexOf(a.label);
        const indexB = recommendedClassicOrder.indexOf(b.label);
        return (indexA < 0 ? Number.MAX_SAFE_INTEGER : indexA) - (indexB < 0 ? Number.MAX_SAFE_INTEGER : indexB);
      }
      return a.label.localeCompare(b.label, "zh-CN");
    });
  }

  renderGoldRankingPanel() {
    const rows = this.getGoldRankingRows(this.goldEditionFilter);
    const sampledAt = this.goldMarket?.sampledAt ? this.formatSampleTime(this.goldMarket.sampledAt) : "--";
    return `
      <aside class="gold-ranking-panel" aria-label="区服金价排行">
        <header>
          <div><span>${this.escapeHtml(this.goldEditionFilter)}</span><strong>区服金价</strong></div>
          <div class="gold-ranking-controls" role="group" aria-label="区服金价排序方式">
            ${[["recommended", "默认"], ["price-asc", "低价"], ["price-desc", "高价"]].map(([key, label]) => `<button type="button" class="${this.goldRankingSort === key ? "active" : ""}" data-gold-ranking-sort="${key}">${label}</button>`).join("")}
          </div>
        </header>
        <div class="gold-ranking-panel-list">
          ${rows.map((row, index) => {
            const changeText = Number.isFinite(row.change) ? `${row.change > 0 ? "+" : ""}${row.change.toFixed(2)}%` : "--";
            const changeClass = row.change > 0 ? "up" : row.change < 0 ? "down" : "flat";
            return `<button type="button" class="gold-ranking-panel-item ${row.key === this.goldServerFilter ? "active" : ""}" data-gold-server="${this.escapeHtml(row.key)}" ${row.best ? "" : "disabled"}>
              <b>${String(index + 1).padStart(2, "0")}</b>
              <span><strong>${this.escapeHtml(row.label)}</strong><small>${row.listingCount ? `${row.listingCount} 条有效报价` : "暂无有效报价"}</small></span>
              <span class="gold-ranking-panel-price"><strong>${row.price ? `¥${row.price.toFixed(3)}` : "--"}</strong><small>${row.price ? `/ ${this.escapeHtml(row.unit)}` : "等待报价"}</small></span>
              <em class="${changeClass}">${changeText}</em>
            </button>`;
          }).join("") || `<div class="gold-ranking-panel-empty">暂无有效区服报价</div>`}
        </div>
        <footer>${this.goldRankingSort === "recommended" ? "默认顺序 · 点击可切换区服" : `按有效最低价${this.goldRankingSort === "price-asc" ? "从低到高" : "从高到低"}排列 · 更新于 ${this.escapeHtml(sampledAt.split(" ").slice(1).join(" ") || sampledAt)}`}</footer>
      </aside>`;
  }

  renderGoldMarket() {
    const market = this.goldMarket || { items: [], summary: { count: 0 } };
    const allListings = market.items || [];
    const editions = ["怀旧服", "正式服"].filter((edition) => allListings.some((item) => this.goldEdition(item) === edition));
    if (!editions.includes(this.goldEditionFilter)) this.goldEditionFilter = editions[0] || "怀旧服";
    const editionListings = allListings.filter((item) => this.goldEdition(item) === this.goldEditionFilter);
    const serverOptions = this.getGoldServerOptions(allListings, this.goldEditionFilter);
    const rankingRows = this.getGoldRankingRows(this.goldEditionFilter);
    const defaultServerKey = rankingRows.find((row) => row.best)?.key || serverOptions[0]?.key || "全部";
    if (this.goldServerFilter === "全部" && serverOptions.length) {
      this.goldServerFilter = defaultServerKey;
    }
    if (this.goldServerFilter !== "全部" && !serverOptions.some((option) => option.key === this.goldServerFilter)) {
      this.goldServerFilter = defaultServerKey;
    }
    const scopedListings = this.goldServerFilter === "全部"
      ? editionListings
      : editionListings.filter((item) => this.goldServerKey(item) === this.goldServerFilter);
    const validListings = this.getEffectiveGoldListings(scopedListings);
    const summary = this.summarizeGoldListings(validListings.length ? validListings : scopedListings);
    const bestListing = validListings[0] || scopedListings[0] || null;
    const tableListings = [...scopedListings]
      .sort((a, b) => {
        const priceA = Number(a.pricePerYi || 0);
        const priceB = Number(b.pricePerYi || 0);
        const normalizedA = priceA > 0 ? priceA : Number.POSITIVE_INFINITY;
        const normalizedB = priceB > 0 ? priceB : Number.POSITIVE_INFINITY;
        return normalizedA - normalizedB
          || Number(a.priceCny || 0) - Number(b.priceCny || 0)
          || Number(b.inventory || 0) - Number(a.inventory || 0);
      })
      .slice(0, 10);
    const scopeName = this.goldServerFilter === "全部" ? "全部区服" : this.goldServerFilter;
    const goldUnit = bestListing?.unit || (this.goldEditionFilter === "怀旧服" ? "万金" : "亿金");
    const ref = bestListing ? Number(bestListing.pricePerYi || 0) : 0;
    const settings = this.goldSettings || market.settings || { marketStatus: "开盘中", intervalMinutes: 10 };
    const intervalMinutes = Number(settings.intervalMinutes || 10);
    const collector = market.collector || {};
    const sampledTime = market.sampledAt ? new Date(market.sampledAt).getTime() : 0;
    const sampleAgeMinutes = sampledTime ? (Date.now() - sampledTime) / 60000 : Infinity;
    const isStale = sampleAgeMinutes > intervalMinutes * 2.5;
    const collectorLabel = collector.lastError ? "采集异常" : collector.running ? "正在采集" : isStale ? "等待新快照" : "自动采集中";
    const historyRows = (market.recentHistory || []).filter((row) => this.goldEdition(row) === this.goldEditionFilter && (this.goldServerFilter === "全部" || row.serverKey === this.goldServerFilter));
    const historyCount = historyRows.length;
    const selectedListingId = this.goldSelectedListingId || (bestListing && bestListing.id) || "";
    const sourceHref = bestListing && bestListing.url ? bestListing.url : market.sourceUrl;
    return `
      <div class="gold-console">
        <section class="gold-terminal-head edition-only">
          <div>
            <span class="eyebrow">金币行情</span>
            <h2>金币汇率</h2>
            <p>每 ${intervalMinutes} 分钟更新公开报价，并过滤明显异常低价；页面信息仅供市场观察参考。</p>
          </div>
          <div class="gold-edition-control">
            <span>游戏版本</span>
            <div class="gold-edition-switch" role="group" aria-label="选择游戏版本">
              ${["怀旧服", "正式服"].map((edition) => {
                const count = this.getGoldServerOptions(allListings, edition).length;
                return `<button class="${this.goldEditionFilter === edition ? "active" : ""}" type="button" data-gold-edition="${edition}" ${count ? "" : "disabled"}><span>${edition}</span><em>${count}</em></button>`;
              }).join("")}
            </div>
          </div>
        </section>

        <section class="gold-terminal-grid">
          <div class="gold-trend-panel">
            <div class="radar-chart-head">
              <div><strong>${scopeName} · 有效最低价走势</strong><span>${collectorLabel} · ${historyCount ? `已有 ${historyCount} 次真实快照` : "等待定时快照沉淀走势"} · 每 ${intervalMinutes} 分钟采集一次</span></div>
              <div class="gold-chart-toolbar">
                <div class="gold-chart-current"><span>当前有效低价</span><strong>${ref ? `¥${ref.toFixed(3)} / ${goldUnit}` : "暂无报价"}</strong>${sourceHref ? `<a class="gold-best-price-action" href="${this.escapeHtml(sourceHref)}" target="_blank" rel="noreferrer">查看最低价</a>` : ""}</div>
                <div class="chart-switch">${["分时", "日线", "7日", "30日"].map((range) => `<button class="${this.goldChartRange === range ? "active" : ""}" data-gold-range="${range}">${range}</button>`).join("")}</div>
              </div>
            </div>
            <div class="gold-chart-meta">
              <span>来源 <strong>${bestListing ? bestListing.source || market.sourceName || "G买卖" : "--"}</strong></span>
              <span>数量 <strong>${bestListing ? `${bestListing.goldYi} 亿金` : "--"}</strong></span>
              <span>样本 <strong>${summary.count || 0} 条有效报价</strong></span>
              <span>更新 <strong>${market.sampledAt ? this.formatSampleTime(market.sampledAt).split(" ").slice(1).join(" ") || this.formatSampleTime(market.sampledAt) : "--"}</strong></span>
            </div>
            ${this.renderGoldTrend(historyRows, scopeName, goldUnit)}
          </div>
          ${this.renderGoldRankingPanel()}
        </section>

        <details class="gold-detail-panel" open>
          <summary>报价明细 <span>${scopeName} · 最新 ${Math.min(tableListings.length, 4)} 条可见，内部滚动</span></summary>
          <section class="sample-table radar-table gold-listings">
          <table><thead><tr><th>区服</th><th>服务器</th><th>数量</th><th>总价</th><th>每亿</th><th>库存</th></tr></thead><tbody>
            ${tableListings.map((item) => {
              const key = this.goldServerKey(item);
              const active = selectedListingId && selectedListingId === item.id;
              const price = Number(item.pricePerYi || 0);
              const itemUnit = item.unit || goldUnit;
              const tip = price ? `约 1元 = ${this.formatGoldPerCny(price)} ${itemUnit}` : "暂无报价";
              const source = item.url ? `<a class="gold-row-source" href="${this.escapeHtml(item.url)}" target="_blank" rel="noreferrer">${item.source || "来源"}</a>` : `<span class="gold-row-source muted">${item.source || "--"}</span>`;
              return `<tr class="${active ? "active" : ""}" data-gold-server="${this.escapeHtml(key)}" data-gold-listing-id="${this.escapeHtml(item.id || "")}" title="${this.escapeHtml(tip)}"><td><strong>${item.area || "-"}</strong>${source}</td><td>${item.server || "-"}</td><td>${item.goldYi} ${itemUnit}</td><td>¥${Number(item.priceCny).toFixed(2)}</td><td><span class="gold-rate-cell" data-rate-tip="${this.escapeHtml(tip)}">¥${price.toFixed(3)}</span></td><td>${item.inventory || "-"}</td></tr>`;
            }).join("") || `<tr><td colspan="6">当前区服暂无有效游戏币报价。</td></tr>`}
          </tbody></table>
          </section>
        </details>
        ${this.isAdmin ? this.renderGoldAdminPanel(settings) : ""}
      </div>`;
  }

  getEffectiveGoldListings(items) {
    const withPrice = items.filter((item) => Number(item.pricePerYi) > 0 && Number(item.goldYi) >= 10 && item.url);
    const summary = this.summarizeGoldListings(withPrice);
    const median = Number(summary.medianPricePerYi || 0);
    return withPrice
      .filter((item) => !median || Number(item.pricePerYi) >= median * 0.65)
      .sort((a, b) => Number(a.pricePerYi) - Number(b.pricePerYi));
  }

  getBestGoldListingAcrossServers(items) {
    const groups = new Map();
    (items || []).forEach((item) => {
      const key = this.goldServerKey(item);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.values()]
      .map((group) => this.getEffectiveGoldListings(group)[0] || null)
      .filter(Boolean)
      .sort((a, b) => Number(a.pricePerYi) - Number(b.pricePerYi))[0] || null;
  }

  getGoldDailyChange(listing) {
    const current = Number(listing?.pricePerYi || 0);
    if (!current) return null;
    const sampledAt = this.goldMarket?.sampledAt || new Date().toISOString();
    const dateKey = (value) => {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return "";
      return new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    };
    const today = dateKey(sampledAt);
    const serverKey = this.goldServerKey(listing);
    const rows = (this.goldMarket?.recentHistory || [])
      .filter((row) => row.serverKey === serverKey && dateKey(row.sampledAt) === today)
      .map((row) => ({
        time: new Date(row.sampledAt).getTime(),
        price: Number(row.bestPricePerYi || row.minPricePerYi || 0),
      }))
      .filter((row) => Number.isFinite(row.time) && row.price > 0)
      .sort((a, b) => a.time - b.time);
    if (!rows.length) return null;
    const open = rows[0].price;
    return open > 0 ? ((current - open) / open) * 100 : null;
  }

  renderGoldTrendLegacy(rows, scopeName) {
    const rawPoints = rows
      .map((row) => ({ ...row, price: Number(row.bestPricePerYi || row.minPricePerYi || 0), time: new Date(row.sampledAt).getTime() }))
      .filter((row) => row.price > 0 && Number.isFinite(row.time))
      .sort((a, b) => a.time - b.time);
    const chart = this.goldChartRange === "分时" ? this.buildGoldIntradayTrend(rawPoints) : this.buildGoldDailyTrend(rawPoints);
    const window = chart.window;
    const points = chart.points;
    if (!points.length) {
      return `<div class="gold-trend-empty">${this.renderChartPlaceholder("暂无价格走势", `${scopeName}当前样本不足，报价将按每 ${this.goldSettings?.intervalMinutes || 10} 分钟更新。`)}</div>`;
    }
    const priceValues = points.flatMap((p) => [p.low ?? p.price, p.high ?? p.price, p.price]);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const flat = max === min;
    const spread = flat ? Math.max(min * 0.02, 0.01) : max - min;
    const lowBound = Math.max(0, flat ? min - spread : min - spread * 0.12);
    const highBound = flat ? max + spread : max + spread * 0.12;
    const chartBox = { left: 78, right: 820, top: 54, bottom: 252 };
    const yFor = (price) => chartBox.bottom - ((price - lowBound) / (highBound - lowBound || 1)) * (chartBox.bottom - chartBox.top);
    const coords = points.map((point) => {
      const x = chartBox.left + ((point.time - window.start) / (window.end - window.start || 1)) * (chartBox.right - chartBox.left);
      const y = yFor(point.price);
      return { ...point, x, y };
    });
    const buildLinePath = (items) => items.length > 1
      ? items.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")
      : "";
    const path = chart.mode === "daily" ? "" : buildLinePath(coords);
    const latest = coords[coords.length - 1];
    const ticks = this.getGoldChartTicks(window, chart.mode);
    const basePrice = chart.basePrice || points[0]?.open || points[0]?.price || latest.price;
    const priceTicks = Array.from({ length: 5 }, (_, index) => {
      const price = highBound - (index / 4) * (highBound - lowBound || 1);
      const percent = basePrice ? ((price - basePrice) / basePrice) * 100 : 0;
      return { price, percent, y: yFor(price) };
    });
    const insufficient = chart.sampleCount < 12 || flat;
    const jumpMarkers = coords.slice(1).map((point, index) => {
      const prev = coords[index];
      const change = Math.abs(point.price - prev.price);
      const threshold = Math.max(prev.price * 0.08, 0.05);
      return change >= threshold ? { ...point, change } : null;
    }).filter(Boolean);
    const dailyRanges = chart.mode === "daily" ? coords.map((point) => {
      const highY = yFor(point.high ?? point.price);
      const lowY = yFor(point.low ?? point.price);
      const openY = yFor(point.open ?? point.price);
      const closeY = yFor(point.close ?? point.price);
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(4, Math.abs(openY - closeY));
      const candleClass = (point.close ?? point.price) >= (point.open ?? point.price) ? "up" : "down";
      const bodyW = chart.bucketCount <= 1 ? 26 : Math.max(8, Math.min(24, 620 / chart.bucketCount));
      return `<g class="gold-day-candle ${candleClass}">
        <line x1="${point.x.toFixed(1)}" x2="${point.x.toFixed(1)}" y1="${highY.toFixed(1)}" y2="${lowY.toFixed(1)}" />
        <rect x="${(point.x - bodyW / 2).toFixed(1)}" y="${bodyY.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${bodyH.toFixed(1)}" rx="3" />
      </g>`;
    }).join("") : "";
    const latestOhlc = chart.mode === "daily"
      ? `开 ¥${(latest.open ?? latest.price).toFixed(3)}　高 ¥${(latest.high ?? latest.price).toFixed(3)}　低 ¥${(latest.low ?? latest.price).toFixed(3)}　收 ¥${(latest.close ?? latest.price).toFixed(3)}`
      : `最新 ¥${latest.price.toFixed(3)} / 亿金　约 1元 = ${this.formatGoldPerCny(latest.price)} 亿金`;
    return `
      <div class="gold-trend-stage">
        <div class="gold-chart-legend">${latestOhlc}</div>
        ${insufficient ? `<div class="gold-chart-note">当前采样数据较少，暂无价格波动，持续采集后将展示完整行情。</div>` : ""}
        <svg viewBox="0 0 920 300" role="img" aria-label="${scopeName} 金币汇率走势">
          <g class="gold-grid">
            ${priceTicks.map((tick) => `<line x1="${chartBox.left}" x2="${chartBox.right}" y1="${tick.y.toFixed(1)}" y2="${tick.y.toFixed(1)}" />`).join("")}
            ${ticks.map((tick) => `<line x1="${tick.x}" x2="${tick.x}" y1="${chartBox.top}" y2="${chartBox.bottom}" />`).join("")}
          </g>
          <g class="gold-y-axis">
            ${priceTicks.map((tick) => `<text class="price-left ${tick.percent >= 0 ? "up" : "down"}" x="12" y="${(tick.y + 4).toFixed(1)}">¥${tick.price.toFixed(3)}</text>`).join("")}
            ${priceTicks.map((tick) => `<text class="percent-right ${tick.percent >= 0 ? "up" : "down"}" x="842" y="${(tick.y + 4).toFixed(1)}">${tick.percent >= 0 ? "+" : ""}${tick.percent.toFixed(2)}%</text>`).join("")}
          </g>
          <line class="gold-current-price-line" x1="${chartBox.left}" x2="${chartBox.right}" y1="${latest.y.toFixed(1)}" y2="${latest.y.toFixed(1)}" />
          <text class="gold-current-price-label" x="842" y="${(latest.y - 7).toFixed(1)}">${chart.mode === "daily" ? "收盘" : "现价"} ¥${latest.price.toFixed(3)}</text>
          ${dailyRanges}
          ${path ? `<path class="gold-trend-line" d="${path}" />` : ""}
          ${jumpMarkers.map((point) => `<g class="gold-jump-marker" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})"><circle r="4" /></g>`).join("")}
        </svg>
        <div class="gold-trend-nodes">
          ${coords.map((point, index) => {
            const left = `${((point.x / 920) * 100).toFixed(2)}%`;
            const top = `${((point.y / 300) * 100).toFixed(2)}%`;
            const isLatest = index === coords.length - 1;
            const tooltip = `
              <span>${this.formatSampleTime(point.sampledAt)}</span>
              <strong>¥${point.price.toFixed(3)} / 亿金</strong>
              ${chart.mode === "daily" ? `<em>开 ${Number(point.open ?? point.price).toFixed(3)} / 高 ${Number(point.high ?? point.price).toFixed(3)} / 低 ${Number(point.low ?? point.price).toFixed(3)} / 收 ${Number(point.close ?? point.price).toFixed(3)}</em>` : ""}
              <em>约 1元 = ${this.formatGoldPerCny(point.price)} 亿金</em>
              <b>${point.bestSource || point.source || "采样来源"} · ${point.bestGoldYi || point.snapshots || "-"} ${point.snapshots ? "次快照" : "亿金"}</b>
              <i>${point.bestUrl ? "点击查看来源" : "等待来源链接"}</i>
            `;
            const content = `<span class="gold-node-dot"></span><span class="gold-node-tip">${tooltip}</span>`;
            return `<span class="gold-trend-node ${chart.mode} ${isLatest ? "latest" : ""}" style="left:${left};top:${top}">${content}</span>`;
          }).join("")}
        </div>
        <div class="gold-axis-labels">${ticks.map((tick) => `<span style="left:${tick.left}%">${tick.label}</span>`).join("")}</div>
        <div class="gold-trend-footer">
          <span>${window.label}</span>
          <strong>${this.goldChartRange} · ${chart.sampleLabel} · 最新 ¥${latest.price.toFixed(3)} / 亿金</strong>
          <span>${this.formatSampleTime(latest.sampledAt).split(" ").slice(1).join(" ")}</span>
        </div>
      </div>`;
  }

  renderGoldTrend(rows, scopeName, unit = "亿金") {
    const rawPoints = rows
      .map((row) => ({ ...row, price: Number(row.bestPricePerYi || row.minPricePerYi || 0), time: new Date(row.sampledAt).getTime() }))
      .filter((row) => row.price > 0 && Number.isFinite(row.time))
      .sort((a, b) => a.time - b.time);
    const dataset = this.buildGoldLightweightDataset(rawPoints);
    this.pendingGoldChart = { dataset, scopeName, unit };
    if (!dataset.series.length) {
      return `<div class="gold-trend-empty">${this.renderChartPlaceholder("暂无价格走势", `${scopeName}当前样本不足，报价将按每 ${this.goldSettings?.intervalMinutes || 10} 分钟更新。`)}</div>`;
    }
    const latest = dataset.series[dataset.series.length - 1];
    const note = dataset.sampleCount < 12
      ? `<div class="gold-chart-note">当前采样数据较少，暂无明显价格波动；持续采集后会形成完整走势。</div>`
      : "";
    const isGoldUnit = ["亿金", "万金"].includes(unit);
    const priceDecimals = isGoldUnit ? 3 : 2;
    const legend = dataset.mode === "intraday"
      ? isGoldUnit
        ? `最新 ¥${latest.value.toFixed(3)} / ${unit} · 约 1元 = ${this.formatGoldPerCny(latest.value)} ${unit}`
        : `最新最低在售价 ¥${latest.value.toFixed(2)} / ${unit}`
      : `开 ${latest.open.toFixed(priceDecimals)} · 高 ${latest.high.toFixed(priceDecimals)} · 低 ${latest.low.toFixed(priceDecimals)} · 收 ${latest.close.toFixed(priceDecimals)}`;
    return `
      <div class="gold-trend-stage">
        <div class="gold-chart-legend">${legend}</div>
        ${note}
        <div class="gold-lightweight-chart" data-gold-chart></div>
        <div class="gold-lwc-tooltip" data-gold-tooltip></div>
        <div class="gold-trend-footer">
          <span>${dataset.windowLabel}</span>
          <strong>${this.goldChartRange} · ${dataset.sampleLabel} · 最新 ¥${dataset.latestPrice.toFixed(priceDecimals)} / ${unit}</strong>
          <span>${this.formatSampleTime(latest.sampledAt).split(" ").slice(1).join(" ")}</span>
        </div>
      </div>`;
  }

  buildGoldLightweightDataset(rawPoints) {
    const range = this.goldChartRange;
    if (range === "分时") {
      const anchor = rawPoints[rawPoints.length - 1]?.time ?? Date.now();
      const start = this.startOfDay(anchor).getTime();
      const end = this.endOfDay(anchor).getTime();
      const points = rawPoints.filter((point) => point.time >= start && point.time <= end);
      const startSec = Math.floor(start / 1000);
      const endSec = Math.floor(end / 1000);
      const series = points.map((point) => ({
        time: Math.floor(point.time / 1000),
        value: point.price,
        sampledAt: point.sampledAt,
        source: point.bestSource || point.source || "采样来源",
        snapshots: point.snapshots || "",
      }));
      const prices = series.map((point) => point.value);
      const latestValue = series[series.length - 1]?.value || series[0]?.value || 0;
      const axisStep = 10 * 60;
      const timeAxisSeries = latestValue
        ? Array.from({ length: Math.floor((endSec - startSec) / axisStep) + 1 }, (_, index) => ({
          time: startSec + index * axisStep,
          value: latestValue,
        }))
        : [];
      return {
        mode: "intraday",
        series,
        chartSeries: series,
        timeAxisSeries,
        percentSeries: this.buildGoldPercentSeries(series, "value"),
        percentChartSeries: series,
        sampleCount: series.length,
        flat: prices.length > 1 && Math.max(...prices) === Math.min(...prices),
        latestPrice: latestValue,
        basePrice: series[0]?.value || 0,
        start: startSec,
        end: endSec,
        windowLabel: "今日 00:00-24:00",
        sampleLabel: `${series.length} 次快照`,
      };
    }

    const anchor = rawPoints[rawPoints.length - 1]?.time ?? Date.now();
    const end = this.endOfDay(anchor);
    const start = this.startOfDay(anchor);
    const rangeDays = range === "30日" ? 30 : 7;
    start.setDate(start.getDate() - (rangeDays - 1));
    const daily = new Map();
    rawPoints
      .filter((point) => point.time >= start.getTime() && point.time <= end.getTime())
      .forEach((point) => {
        const key = this.dayKey(point.time);
        const list = daily.get(key) || [];
        list.push(point);
        daily.set(key, list);
      });
    const series = [];
    for (let i = 0; i < rangeDays; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = this.dayKey(day.getTime());
      const time = this.goldBusinessDay(day);
      const list = (daily.get(key) || []).slice().sort((a, b) => a.time - b.time);
      if (!list.length) {
        series.push({ time });
        continue;
      }
      const prices = list.map((point) => point.price);
      const closePoint = list[list.length - 1];
      series.push({
        time,
        open: list[0].price,
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: closePoint.price,
        value: closePoint.price,
        sampledAt: closePoint.sampledAt,
        source: closePoint.bestSource || closePoint.source || "采样来源",
        snapshots: list.length,
      });
    }
    const priced = series.filter((point) => Number(point.close) > 0);
    const closes = priced.map((point) => point.close);
    return {
      mode: "daily",
      series,
      percentSeries: this.buildGoldPercentSeries(priced, "close"),
      sampleCount: rawPoints.filter((point) => point.time >= start.getTime() && point.time <= end.getTime()).length,
      flat: closes.length > 1 && Math.max(...closes) === Math.min(...closes),
      latestPrice: priced[priced.length - 1]?.close || 0,
      basePrice: priced[0]?.open || priced[0]?.close || 0,
      start: this.goldBusinessDay(start),
      end: this.goldBusinessDay(end),
      windowLabel: `${range === "日线" ? "日K" : range} · 最近 ${rangeDays} 个自然日`,
      sampleLabel: `${priced.length} 根日K / ${rawPoints.filter((point) => point.time >= start.getTime() && point.time <= end.getTime()).length} 次快照`,
    };
  }

  buildGoldPercentSeries(points, key) {
    const priced = points.filter((point) => Number(point[key]) > 0);
    const base = Number(priced[0]?.[key] || 0);
    if (!base) return [];
    return priced.map((point) => ({
      time: point.time,
      value: Number(point[key]),
    }));
  }

  goldBusinessDay(date) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  formatGoldBusinessDay(time) {
    if (typeof time === "object") return `${time.month}/${time.day}`;
    const date = new Date(Number(time) * 1000);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  mountGoldLightweightChart() {
    const el = this.querySelector("[data-gold-chart]");
    if (!el || !this.pendingGoldChart?.dataset) {
      if (this.goldChartInstance) {
        this.goldChartInstance.remove();
        this.goldChartInstance = null;
      }
      return;
    }
    const core = window.LightweightCharts;
    if (!core?.createChart) {
      el.innerHTML = `<div class="gold-chart-loading">图表内核加载中，请稍后刷新。</div>`;
      return;
    }
    if (this.goldChartInstance) {
      this.goldChartInstance.remove();
      this.goldChartInstance = null;
    }
    const dataset = this.pendingGoldChart.dataset;
    const unit = this.pendingGoldChart.unit || "亿金";
    const priceDecimals = ["亿金", "万金"].includes(unit) ? 3 : 2;
    const chartHeight = el.closest(".dart-market-panel") ? 320 : 360;
    const chart = core.createChart(el, {
      width: el.clientWidth || 760,
      height: chartHeight,
      layout: {
        background: { type: "solid", color: "#ffffff" },
        textColor: "#657083",
        fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(23, 29, 43, .07)" },
        horzLines: { color: "rgba(23, 29, 43, .07)" },
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        textColor: "#657083",
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        textColor: "#8a96a8",
      },
      timeScale: {
        borderVisible: false,
        rightOffset: dataset.mode === "intraday" ? 0 : 2,
        barSpacing: dataset.mode === "daily" ? 26 : 8,
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: dataset.mode === "intraday",
        secondsVisible: false,
        tickMarkFormatter: (time) => dataset.mode === "daily" ? this.formatGoldBusinessDay(time) : this.formatGoldChartTime(time, dataset),
      },
      crosshair: {
        mode: core.CrosshairMode.Normal,
        vertLine: { color: "rgba(0, 174, 236, .32)", width: 1, style: 3, labelBackgroundColor: "#00aeec" },
        horzLine: { color: "rgba(0, 174, 236, .26)", width: 1, style: 3, labelBackgroundColor: "#00aeec" },
      },
      handleScale: true,
      handleScroll: true,
    });
    const priceFormat = { type: "custom", formatter: (price) => `¥${Number(price).toFixed(priceDecimals)}` };
    const percentFormat = {
      type: "custom",
      formatter: (value) => {
        const base = Number(dataset.basePrice || 0);
        const percent = base ? ((Number(value) - base) / base) * 100 : 0;
        return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
      },
    };
    let mainSeries;
    if (dataset.mode === "daily") {
      mainSeries = chart.addCandlestickSeries({
        priceScaleId: "left",
        priceFormat,
        upColor: "#f04444",
        downColor: "#13b66b",
        borderUpColor: "#f04444",
        borderDownColor: "#13b66b",
        wickUpColor: "#f04444",
        wickDownColor: "#13b66b",
      });
    } else {
      mainSeries = chart.addAreaSeries({
        priceScaleId: "left",
        priceFormat,
        lineColor: "#00aeec",
        topColor: "rgba(0, 174, 236, .18)",
        bottomColor: "rgba(0, 174, 236, .015)",
        lineWidth: 2,
        lastValueVisible: true,
        priceLineVisible: true,
        priceLineColor: "rgba(0, 174, 236, .5)",
      });
    }
    mainSeries.setData(dataset.chartSeries || dataset.series);
    if (dataset.mode === "intraday" && dataset.timeAxisSeries?.length) {
      const timeAxisSeries = chart.addLineSeries({
        priceScaleId: "left",
        color: "rgba(0, 0, 0, 0)",
        lineWidth: 1,
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      timeAxisSeries.setData(dataset.timeAxisSeries);
    }
    const percentSeries = chart.addLineSeries({
      priceScaleId: "right",
      priceFormat: percentFormat,
      color: "rgba(255, 255, 255, 0)",
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    percentSeries.setData(dataset.percentChartSeries || dataset.percentSeries);
    if (dataset.mode === "intraday") {
      chart.timeScale().setVisibleRange({ from: dataset.start, to: dataset.end });
      setTimeout(() => chart.timeScale().setVisibleRange({ from: dataset.start, to: dataset.end }), 0);
    } else {
      chart.timeScale().fitContent();
    }
    const tooltip = this.querySelector("[data-gold-tooltip]");
    chart.subscribeCrosshairMove((param) => {
      if (!tooltip || !param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        if (tooltip) tooltip.classList.remove("show");
        return;
      }
      const data = param.seriesData.get(mainSeries);
      if (!data || (!data.value && !data.close)) {
        tooltip.classList.remove("show");
        return;
      }
      const price = Number(data.value ?? data.close);
      const dateText = dataset.mode === "daily" ? this.formatGoldBusinessDay(data.time) : this.formatGoldChartTime(data.time);
      const isGoldUnit = ["亿金", "万金"].includes(unit);
      tooltip.innerHTML = dataset.mode === "daily"
        ? `<span>${dateText}</span><strong>收 ¥${price.toFixed(priceDecimals)} / ${unit}</strong><em>开 ${Number(data.open).toFixed(priceDecimals)} · 高 ${Number(data.high).toFixed(priceDecimals)} · 低 ${Number(data.low).toFixed(priceDecimals)}</em><b>${data.snapshots || 0} 次快照</b>`
        : `<span>${dateText}</span><strong>¥${price.toFixed(isGoldUnit ? 3 : 2)} / ${unit}</strong>${isGoldUnit ? `<em>约 1元 = ${this.formatGoldPerCny(price)} ${unit}</em>` : `<em>当前全网最低售价</em>`}<b>${data.source || "采样来源"}</b>`;
      tooltip.style.left = `${Math.min(Math.max(param.point.x + 16, 12), el.clientWidth - 210)}px`;
      tooltip.style.top = `${Math.min(Math.max(param.point.y + 12, 12), 280)}px`;
      tooltip.classList.add("show");
    });
    const resize = () => chart.applyOptions({ width: el.clientWidth || 760 });
    window.addEventListener("resize", resize, { once: true });
    this.goldChartInstance = chart;
  }

  formatGoldChartTime(time, dataset = null) {
    if (dataset?.mode === "intraday" && Number(time) >= Number(dataset.end || 0) - 60) return "24:00";
    const date = new Date(Number(time) * 1000);
    if (dataset?.mode === "intraday") {
      return new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    }
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  buildGoldIntradayTrend(rawPoints) {
    const anchor = rawPoints[rawPoints.length - 1]?.time ?? Date.now();
    const anchorStart = this.startOfDay(anchor).getTime();
    const anchorEnd = this.endOfDay(anchor).getTime();
    const sameDayPoints = rawPoints.filter((point) => point.time >= anchorStart && point.time <= anchorEnd);
    const points = sameDayPoints.length ? sameDayPoints : rawPoints.slice(-24);
    const last = points[points.length - 1];
    const liveToday = last && this.dayKey(last.time) === this.dayKey(Date.now());
    return {
      mode: "intraday",
      points,
      sampleCount: points.length,
      bucketCount: Math.max(1, points.length),
      sampleLabel: `${points.length} 次快照`,
      basePrice: points[0]?.price || 0,
      window: { start: anchorStart, end: anchorEnd, label: liveToday ? "今日 00:00-24:00" : "采样日 00:00-24:00" },
    };
  }

  buildGoldDailyTrend(rawPoints) {
    const anchor = rawPoints[rawPoints.length - 1]?.time ?? Date.now();
    const endOfToday = this.endOfDay(anchor);
    const startOfToday = this.startOfDay(anchor);
    const rangeDays = this.goldChartRange === "30日" ? 30 : 7;
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - (rangeDays - 1));
    const window = { start: start.getTime(), end: endOfToday.getTime(), label: `${this.goldChartRange === "日线" ? "日K" : this.goldChartRange} · 最近 ${rangeDays} 个自然日` };
    const daily = new Map();
    rawPoints
      .filter((point) => point.time >= window.start && point.time <= window.end)
      .forEach((point) => {
        const day = this.dayKey(point.time);
        const list = daily.get(day) || [];
        list.push(point);
        daily.set(day, list);
      });
    const points = [...daily.entries()]
      .map(([day, list]) => {
        const sorted = list.slice().sort((a, b) => a.time - b.time);
        const open = sorted[0].price;
        const closePoint = sorted[sorted.length - 1];
        const prices = sorted.map((point) => point.price);
        const center = this.startOfDay(sorted[0].time).getTime() + 12 * 60 * 60 * 1000;
        return {
          ...closePoint,
          time: center,
          price: closePoint.price,
          open,
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: closePoint.price,
          snapshots: sorted.length,
          label: `${new Date(sorted[0].time).getMonth() + 1}/${new Date(sorted[0].time).getDate()}`,
          day,
        };
      })
      .sort((a, b) => a.time - b.time);
    return {
      mode: "daily",
      points,
      sampleCount: rawPoints.filter((point) => point.time >= window.start && point.time <= window.end).length,
      bucketCount: rangeDays,
      sampleLabel: `${points.length} 个交易日 / ${rawPoints.filter((point) => point.time >= window.start && point.time <= window.end).length} 次快照`,
      basePrice: points[0]?.open || points[0]?.price || 0,
      window,
    };
  }

  startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  endOfDay(value) {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  dayKey(value) {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  getGoldChartWindow() {
    const now = Date.now();
    const endOfToday = this.endOfDay(now);
    const startOfToday = this.startOfDay(now);
    if (this.goldChartRange === "7日") {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
      return { start: start.getTime(), end: endOfToday.getTime(), label: "最近 7 日" };
    }
    if (this.goldChartRange === "30日") {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return { start: start.getTime(), end: endOfToday.getTime(), label: "最近 30 日" };
    }
    return { start: startOfToday.getTime(), end: endOfToday.getTime(), label: "今日 00:00-24:00" };
  }

  getGoldChartTicks(window, mode = "intraday") {
    const ticks = [];
    const pushTick = (time, label) => {
      const left = ((time - window.start) / (window.end - window.start || 1)) * 100;
      const x = 78 + (left / 100) * 742;
      ticks.push({ time, label, left: left.toFixed(2), x: x.toFixed(1) });
    };
    if (mode === "intraday") {
      const count = 5;
      for (let i = 0; i < count; i += 1) {
        const time = window.start + (i / (count - 1)) * (window.end - window.start || 1);
        const date = new Date(time);
        pushTick(time, `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`);
      }
      return ticks;
    }
    if (this.goldChartRange === "日线") {
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(window.start);
        d.setDate(d.getDate() + i);
        pushTick(d.getTime(), `${d.getMonth() + 1}/${d.getDate()}`);
      }
      return ticks;
    }
    if (this.goldChartRange === "7日") {
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(window.start);
        d.setDate(d.getDate() + i);
        pushTick(d.getTime(), `${d.getMonth() + 1}/${d.getDate()}`);
      }
      return ticks;
    }
    if (this.goldChartRange === "30日") {
      [0, 6, 12, 18, 24, 29].forEach((i) => {
        const d = new Date(window.start);
        d.setDate(d.getDate() + i);
        pushTick(d.getTime(), `${d.getMonth() + 1}/${d.getDate()}`);
      });
      return ticks;
    }
    [0, 6, 12, 18, 24].forEach((hour) => {
      const d = new Date(window.start);
      d.setHours(hour, hour === 24 ? 0 : 0, 0, hour === 24 ? 0 : 0);
      const time = hour === 24 ? window.end : d.getTime();
      pushTick(time, hour === 24 ? "24:00" : `${String(hour).padStart(2, "0")}:00`);
    });
    return ticks;
  }

  renderGoldAdminPanel(settings) {
    return `
      <form class="gold-admin-panel" data-gold-admin-form>
        <div class="admin-form-head"><strong>行情后台</strong><span>控制开盘状态、采集频率和异常过滤阈值</span></div>
        <div class="form-grid-2">
          <label><span>行情状态</span><select name="marketStatus">
            ${["开盘中", "闭盘", "维护"].map((status) => `<option value="${status}" ${settings.marketStatus === status ? "selected" : ""}>${status}</option>`).join("")}
          </select></label>
          <label><span>采集频率（分钟）</span><input name="intervalMinutes" type="number" min="1" value="${Number(settings.intervalMinutes || 10)}" /></label>
        </div>
        <div class="form-grid-2">
          <label><span>最低数量（亿金）</span><input name="minGoldYi" type="number" min="1" value="${Number(settings.minGoldYi || 10)}" /></label>
          <label><span>异常偏离阈值（%）</span><input name="deviationPercent" type="number" min="1" max="90" value="${Number(settings.deviationPercent || 35)}" /></label>
        </div>
        <button type="submit" ${this.goldAdminBusy ? "disabled" : ""}>${this.goldAdminBusy ? "保存中..." : "保存行情设置"}</button>
        ${this.goldAdminError ? `<p class="form-error">${this.goldAdminError}</p>` : ""}
      </form>`;
  }

  formatGoldPerCny(pricePerYi) {
    const value = 1 / Number(pricePerYi || 0);
    return Number.isFinite(value) ? value.toFixed(3) : "--";
  }

  goldServerKey(item) {
    return `${item.area || "未知区服"} / ${item.server || "未知服务器"}`;
  }

  goldEdition(item) {
    const explicit = String(item?.edition || item?.version || "").trim();
    if (["正式服", "怀旧服"].includes(explicit)) return explicit;
    return `${item?.area || ""} ${item?.server || ""} ${item?.title || ""}`.includes("怀旧") ? "怀旧服" : "正式服";
  }

  getGoldServerOptions(items, edition = "") {
    const map = new Map();
    items.filter((item) => !edition || this.goldEdition(item) === edition).forEach((item) => {
      const key = this.goldServerKey(item);
      const shortLabel = this.goldEdition(item) === "怀旧服" && item.area === "国服" ? item.server : key;
      const label = edition ? shortLabel : `${this.goldEdition(item)} · ${shortLabel}`;
      const current = map.get(key) || { key, label, count: 0 };
      current.count += 1;
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-CN"));
  }

  getHomeGoldServerKey(items = this.goldMarket?.items || []) {
    const options = this.getGoldServerOptions(items);
    const configured = this.goldSettings?.homeServerKey || "";
    if (configured && configured !== "全部" && options.some((option) => option.key === configured)) return configured;
    const best = this.getBestGoldListingAcrossServers(items);
    return best ? this.goldServerKey(best) : options[0]?.key || "";
  }

  summarizeGoldListings(items) {
    const prices = items.map((item) => Number(item.pricePerYi)).filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    if (!prices.length) return { count: 0 };
    const total = prices.reduce((sum, value) => sum + value, 0);
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
    return {
      count: items.length,
      minPricePerYi: prices[0],
      maxPricePerYi: prices[prices.length - 1],
      avgPricePerYi: total / prices.length,
      medianPricePerYi: median,
      totalInventory: items.reduce((sum, item) => sum + (Number(item.inventory) || 0), 0),
    };
  }

  formatSampleTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("zh-CN", { hour12: false });
  }

  renderChartPlaceholder(title = "暂无相关交易信息", summary = "当前没有可用报价，发现新的交易信息后会自动更新。") {
    return `<div class="empty-chart"><div class="empty-grid"></div><div class="empty-state"><strong>${title}</strong><span>${summary}</span></div></div>`;
  }

  renderCodex() {
    const bands = [
      { key: "全部", label: "全部" },
      { key: "1-10", label: "Lv.1-10" },
      { key: "11-20", label: "Lv.11-20" },
      { key: "21-30", label: "Lv.21-30" },
      { key: "31-50", label: "Lv.31-50" },
      { key: "51+", label: "Lv.51+" },
    ];
    const attrFilters = ["全部", "弱火", "弱冰", "弱雷", "弱毒", "弱圣", "BOSS", "不死"];
    const sortFilters = [
      { key: "默认", label: "默认" },
      { key: "exp", label: "经验最高" },
    ];
    const source = (this.monsterItems || []).filter((monster) => monster?.img);
    const query = String(this.monsterQuery || "").trim().toLowerCase();
    const matchesQuery = (monster) => {
      if (!query) return true;
      const haystack = [
        monster.name,
        monster.nameEn,
        monster.map,
        ...(monster.maps || []).map((map) => `${map.name} ${map.nameEn}`),
        ...(monster.attributes || []),
        ...Object.values(this.normalizeDrops(monster.drops)).flat().map((item) => typeof item === "string" ? item : `${item.name} ${item.nameEn} ${item.id}`),
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    };
    const matchesAttr = (monster) => {
      if (this.monsterAttribute === "全部") return true;
      const attrs = (monster.attributes || []).map((tag) => String(tag));
      if (this.monsterAttribute === "BOSS") return attrs.includes("BOSS");
      if (this.monsterAttribute === "不死") return attrs.includes("不死");
      return attrs.some((tag) => tag.includes(this.monsterAttribute));
    };
    const visible = source
      .filter((monster) => (this.monsterBand === "全部" || this.inMonsterBand(monster.level, this.monsterBand)) && matchesAttr(monster) && matchesQuery(monster))
      .sort((a, b) => this.compareMonsterSort(a, b));
    const selected = source.find((monster) => monster.id === this.selectedMonster) ?? visible[0] ?? source[0] ?? {
      id: "",
      sourceId: "",
      img: "",
      name: "暂无怪物",
      nameEn: "",
      level: 0,
      hp: 0,
      mp: 0,
      exp: 0,
      map: "",
      maps: [],
      attributes: ["普通"],
      hitRequirement: 0,
      acc: 0,
      eva: 0,
      speed: 0,
      combat: {},
      drops: { equipment: [], consumable: [], other: [] },
      dropSource: "",
      categoryLabel: "",
      relatedItems: [],
    };
    const drops = this.normalizeDrops(selected?.drops);
    const maps = (selected?.maps || []).slice(0, 10);
    const totalDrops = drops.equipment.length + drops.consumable.length + drops.other.length;
    const relatedItems = this.getMonsterRelatedItems(selected).slice(0, 18);
    const queryDropMatches = query ? visible.filter((monster) => Object.values(this.normalizeDrops(monster.drops)).flat().some((item) => this.itemMatchesQuery(item, query))) : [];
    const bandLabel = bands.find((band) => band.key === this.monsterBand)?.label || "全部";
    const attrLabel = this.monsterAttribute || "全部";
    const sortLabel = sortFilters.find((sort) => sort.key === this.monsterSort)?.label || "默认";
    const activeFilters = [
      this.monsterBand !== "全部" ? bandLabel : "",
      this.monsterAttribute !== "全部" ? attrLabel : "",
      this.monsterSort !== "默认" ? sortLabel : "",
    ].filter(Boolean);
    const filterSummary = activeFilters.length ? activeFilters.join(" · ") : "全部怪物";
    return `
      <section class="page-head codex-head">
        <div>
          <span class="eyebrow">CMS079 怪物资料 · ${source.length} 只怪物</span>
          <h1>怪物图鉴</h1>
          <p>按等级、属性和收益排序找怪，掉落能直接反查到物品，物品也能反向跳回来。</p>
        </div>
        <label class="top-search large"><span>⌕</span><input data-monster-search data-focus-key="monster-search" value="${this.escapeHtml(this.monsterQuery)}" placeholder="搜怪物、地图、掉落物或属性" /></label>
      </section>

      <section class="codex-layout">
        <aside class="codex-sidebar monster-filter-panel">
          <div class="codex-sidebar-head">
            <strong>怪物列表</strong>
            <span>显示 ${visible.length} / ${source.length}</span>
          </div>
          ${query ? `<div class="drop-search-card"><strong>掉落反查</strong><span>${queryDropMatches.length ? `${queryDropMatches.length} 只怪物可能掉落「${this.escapeHtml(this.monsterQuery)}」` : `正在按「${this.escapeHtml(this.monsterQuery)}」筛选资料`}</span></div>` : ""}
          <div class="monster-filter-summary">
            <div><span>当前筛选</span><strong>${this.escapeHtml(filterSummary)}</strong></div>
            <button type="button" class="${this.monsterFiltersOpen ? "active" : ""}" data-monster-filter-toggle>${this.monsterFiltersOpen ? "收起" : "筛选"}</button>
          </div>
          ${this.monsterFiltersOpen ? `
            <div class="monster-filter-sheet">
              <section>
                <div class="monster-sheet-title"><strong>等级</strong><em>${bandLabel}</em></div>
                <div class="monster-pill-grid">
                  ${bands.map((band) => `<button class="${this.monsterBand === band.key ? "active" : ""}" data-monster-band="${band.key}">${band.label}</button>`).join("")}
                </div>
                <button class="monster-jump" data-monster-jump-level="${this.monsterFocusLevel}">跳到我的等级段（Lv.${this.monsterFocusLevel}）</button>
              </section>
              <section>
                <div class="monster-sheet-title"><strong>属性</strong><em>${attrLabel}</em></div>
                <div class="monster-pill-grid compact">
                  ${attrFilters.map((attr) => `<button class="${this.monsterAttribute === attr ? "active" : ""}" data-monster-attr="${attr}">${attr}</button>`).join("")}
                </div>
              </section>
              <section>
                <div class="monster-sheet-title"><strong>排序</strong><em>${sortLabel}</em></div>
                <div class="monster-pill-grid sort-grid">
                  ${sortFilters.map((sort) => `<button class="${this.monsterSort === sort.key ? "active" : ""}" data-monster-sort="${sort.key}">${sort.label}</button>`).join("")}
                </div>
              </section>
            </div>` : ""}
          <button class="monster-reset compact" data-monster-reset>清除筛选</button>
          <div class="codex-list" data-scroll-key="codex-list">
            ${visible.map((monster) => `<button class="codex-row ${selected.id === monster.id ? "active" : ""}" data-monster-id="${monster.id}"><img src="${monster.img}" alt="${monster.name}" /><span><strong>${monster.name}</strong><small>Lv.${monster.level} · ${monster.map}</small></span><em>${monster.categoryLabel || monster.density || "怪物"}</em></button>`).join("") || `<div class="codex-empty">没有匹配的怪物，换个关键词试试。</div>`}
          </div>
        </aside>

        <article class="codex-detail">
          <div class="monster-hero">
            <span class="thumb huge"><img src="${selected.img}" alt="${selected.name}" /></span>
            <div>
              <span class="monster-id">资料编号 · ${selected.sourceId ?? selected.id}</span>
              <h2>${selected.name}</h2>
              <p>${selected.categoryLabel || "普通怪物"} · ${selected.map || "暂无地图资料"}</p>
              <div class="monster-tags">${(selected.attributes || ["普通"]).map((tag) => `<span>${tag}</span>`).join("")}</div>
            </div>
            ${this.isAdmin ? `<button class="delete-monster" data-delete-monster="${selected.id}">删除怪物</button>` : ""}
          </div>

          <div class="monster-stats">
            ${this.renderTicker("等级", `Lv.${selected.level}`)}
            ${this.renderTicker("HP", this.formatNumber(selected.hp))}
            ${this.renderTicker("属性", (selected.attributes || ["普通"]).join(" / "))}
            ${this.renderTicker("经验值", this.formatNumber(selected.exp))}
          </div>

          <section class="codex-info-grid">
            <div class="codex-info-card">
              <h3>战斗参数</h3>
              <div class="info-pairs">
                ${this.renderInfoPair("MP", selected.mp)}
                ${this.renderInfoPair("命中需求", selected.hitRequirement)}
                ${this.renderInfoPair("命中", selected.acc)}
                ${this.renderInfoPair("回避", selected.eva)}
                ${this.renderInfoPair("速度", selected.speed)}
                ${this.renderInfoPair("物攻", selected.combat?.physicalAttack)}
                ${this.renderInfoPair("魔攻", selected.combat?.magicAttack)}
                ${this.renderInfoPair("物防", selected.combat?.physicalDefense)}
                ${this.renderInfoPair("魔防", selected.combat?.magicDefense)}
              </div>
            </div>
            <div class="codex-info-card">
              <h3>出没地图</h3>
              <div class="map-list">
                ${maps.map((map) => `<span><b>${map.name}</b><em>${map.source || "资料源"}</em></span>`).join("") || `<span><b>暂无地图资料</b><em>尚未收录刷新地点</em></span>`}
              </div>
            </div>
          </section>

          <section class="drop-board">
            <div class="panel-head"><h2>掉落物品</h2><span>${totalDrops ? `${totalDrops} 件参考掉落 · ${selected.dropSource || "资料源"}` : "当前资料源暂无掉落"}</span></div>
            <div class="drop-columns">
              ${this.renderDropGroup("装备", drops.equipment)}
              ${this.renderDropGroup("消耗品", drops.consumable)}
              ${this.renderDropGroup("其他", drops.other)}
            </div>
          </section>

          <section class="drop-board">
            <div class="panel-head"><h2>关联物品</h2><span>${relatedItems.length ? `${relatedItems.length} 件可点击掉落` : "当前暂无可反查物品"}</span></div>
            <div class="monster-feed">
              ${relatedItems.map((item) => `<button class="monster-chip" data-open-item="${item.id}"><img src="${item.img}" alt="${item.name}" /><span><strong>${item.name}</strong><small>${item.category || "物品"}</small></span></button>`).join("") || `<div class="codex-empty">暂无反查物品。</div>`}
            </div>
          </section>
        </article>
      </section>`;
  }

  inMonsterBand(level, band) {
    const n = Number(level) || 0;
    if (band === "1-10") return n >= 1 && n <= 10;
    if (band === "11-20") return n >= 11 && n <= 20;
    if (band === "21-30") return n >= 21 && n <= 30;
    if (band === "31-50") return n >= 31 && n <= 50;
    if (band === "51+") return n >= 51;
    return true;
  }

  getMonsterBandByLevel(level) {
    const n = Number(level) || 1;
    if (n <= 10) return "1-10";
    if (n <= 20) return "11-20";
    if (n <= 30) return "21-30";
    if (n <= 50) return "31-50";
    return "51+";
  }

  compareMonsterSort(a, b) {
    if (this.monsterSort === "exp") {
      return (Number(b.exp) || 0) - (Number(a.exp) || 0) || (Number(a.level) || 0) - (Number(b.level) || 0);
    }
    return (Number(a.level) || 0) - (Number(b.level) || 0) || (Number(a.sourceId) || 0) - (Number(b.sourceId) || 0);
  }

  normalizeDrops(drops) {
    if (Array.isArray(drops)) return { equipment: drops.filter((_, i) => i === 2), consumable: drops.filter((_, i) => i === 1), other: drops.filter((_, i) => i < 1) };
    return {
      equipment: drops?.equipment ?? [],
      consumable: drops?.consumable ?? [],
      other: drops?.other ?? [],
    };
  }

  getMonsterRelatedItems(monster) {
    const explicit = Array.isArray(monster?.relatedItems) ? monster.relatedItems : [];
    const drops = Object.values(this.normalizeDrops(monster?.drops)).flat();
    const pool = explicit.length ? explicit : drops;
    const seen = new Set();
    return pool
      .map((item) => {
        if (typeof item === "string") return { id: "", name: item, category: "资料", img: "" };
        const detail = this.findItem(item.id) || this.findItem(item.code) || item;
        return {
          ...item,
          ...detail,
          id: detail.id || item.id || item.code || item.name,
          name: detail.name || item.name,
          img: detail.img || item.img,
          category: detail.category || item.category || item.source || "物品",
        };
      })
      .filter((item) => {
        const key = String(item.id || item.name || "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  renderDropGroup(title, items) {
    const list = items?.length ? items : [];
    return `<section class="drop-group"><h3>${title}<small>${list.length}</small></h3><div>${list.length ? list.map((item) => this.renderDropItem(item)).join("") : `<span class="drop-empty">暂无记录</span>`}</div></section>`;
  }

  renderDropItem(item) {
    if (typeof item === "string") return `<span class="drop-token">${item}</span>`;
    const detail = this.findItem(item.id) || item;
    return `<button class="drop-token rich" data-open-item="${detail.id || item.id}"><img src="${detail.img || item.img}" alt="${detail.name || item.name}" /><b>${detail.name || item.name}</b>${this.isAdmin ? `<em>#${detail.id || item.id}</em>` : ""}</button>`;
  }

  itemMatchesQuery(item, query) {
    const text = typeof item === "string" ? item : `${item.name || ""} ${item.nameEn || ""} ${item.id || ""}`;
    return text.toLowerCase().includes(query);
  }

  findItem(id) {
    const key = String(id ?? "").replace(/^0+/, "");
    return this.catalogItems.find((item) => String(item.id) === String(id) || String(item.code) === String(id) || String(item.id).replace(/^0+/, "") === key || String(item.code).replace(/^0+/, "") === key);
  }

  renderInfoPair(label, value) {
    return `<span><em>${label}</em><strong>${value ?? "—"}</strong></span>`;
  }

  renderItems() {
    const query = String(this.itemQuery || "").trim().toLowerCase();
    const source = (this.catalogItems || []).filter((item) => item.library === this.itemLibrary);
    const categories = ["全部", ...new Set(source.map((item) => item.category || "其他"))];
    const scopedForSubCategory = source.filter((item) => this.itemCategory === "全部" || item.category === this.itemCategory);
    const kinds = this.getItemDisplaySubCategoryOptions(this.itemLibrary, this.itemCategory, scopedForSubCategory);
    const visible = source.filter((item) => {
      const inCategory = this.itemCategory === "全部" || item.category === this.itemCategory;
      const kindText = `${item.name} ${item.nameEn} ${item.subCategory} ${item.rawCategory} ${item.description} ${item.kind}`.toLowerCase();
      const inKind = this.itemKind === "全部" || this.getItemDisplaySubCategory(item) === this.itemKind;
      const inQuery = !query || kindText.includes(query) || String(item.id).includes(query) || String(item.code).includes(query);
      return inCategory && inKind && inQuery;
    }).slice(0, 240);
    return `
      <section class="page-head items-head">
        <div>
          <span class="eyebrow">CMS079 物品资料 · ${source.length} 件物品</span>
          <h1>${this.itemLibrary}</h1>
          <p>按用途与类型整理物品资料，可查看属性、来源和关联怪物。</p>
        </div>
        <label class="top-search large"><span>⌕</span><input data-item-search data-focus-key="item-search" value="${this.escapeHtml(this.itemQuery)}" placeholder="搜物品名、英文名、ID、卷轴、飞镖" /></label>
      </section>
      <section class="item-workbench">
        <aside class="item-filter-panel">
          <h2>库</h2>
          <div class="item-kind-list">
            ${["物品库", "装备库"].map((library) => `<button class="${this.itemLibrary === library ? "active" : ""}" data-item-library="${library}">${library}<em>${this.countItemsByLibrary(library)}</em></button>`).join("")}
          </div>
          <h2>分类</h2>
          <div class="item-filter-list">${categories.map((cat) => `<button class="${this.itemCategory === cat ? "active" : ""}" data-item-category="${cat}"><span>${cat}</span><em>${this.countItemsByCategory(cat)}</em></button>`).join("")}</div>
          <h2>子分类</h2>
          <div class="item-kind-list">${kinds.map((kind) => `<button class="${this.itemKind === kind ? "active" : ""}" data-item-kind="${kind}"><span>${kind}</span><em>${this.countItemsByDisplaySubCategory(kind)}</em></button>`).join("")}</div>
        </aside>
        <section class="item-result-panel">
          <div class="panel-head"><h2>物品列表</h2><span>显示 ${visible.length} / ${source.length}</span></div>
          <div class="item-grid" data-scroll-key="item-grid">
            ${visible.map((item) => this.renderItemCard(item)).join("") || `<div class="codex-empty">没有匹配的物品，换个关键词试试。</div>`}
          </div>
        </section>
      </section>`;
  }

  renderItemCard(item) {
    const displaySubCategory = this.getItemDisplaySubCategory(item);
    const tags = [item.library, item.category, displaySubCategory].filter(Boolean);
    return `<button class="item-card" data-open-item="${item.id}">
      <span class="item-icon"><img src="${item.img}" alt="${item.name}" /></span>
      <span><strong>${item.name}</strong><small>${displaySubCategory || item.category || item.library || "资料"}</small>${this.isAdmin ? `<em>#${item.code || item.id}</em>` : ""}</span>
      <i>${tags.slice(0, 2).join(" / ")}</i>
    </button>`;
  }

  renderItemModal() {
    if (!this.openItemId) return "";
    const item = this.findItem(this.openItemId);
    if (!item) return "";
    return `<div class="item-modal-overlay" data-close-item>
      <article class="maple-item-window" onclick="event.stopPropagation()">
        <button class="item-window-close" data-close-item>×</button>
        ${this.renderMapleItemWindow(item)}
      </article>
    </div>`;
  }

  renderMapleItemWindow(item) {
    const statRows = (item.stats || []).slice(0, 14);
    const isThrowing = this.isThrowingItem(item);
    const relatedMonsters = this.findMonstersForItem(item).slice(0, 10);
    const isEquipment = item.library === "装备库" || item.category === "装备";
    const level = this.getItemStat(item, ["reqLevel", "requiredLevel", "level"], ["需要等级", "REQ LEV", "等级"]);
    const equipJobs = this.getEquipJobState(item);
    return `
      <div class="maple-tooltip ${isEquipment ? "equipment" : "item"}">
        <header><h2>${item.name}</h2><span>${this.isAdmin ? `#${item.code || item.id}` : `${item.library || "CMS079"}`}</span></header>
        ${isEquipment ? `<div class="equip-level-ribbon"><span>需要等级</span><strong>${level ?? "—"}</strong></div>` : ""}
        <div class="maple-tooltip-main">
          <div class="maple-icon-frame"><img src="${item.img}" alt="${item.name}" /></div>
          <div class="maple-tooltip-copy">
            ${isEquipment ? this.renderEquipJobPanel(item, equipJobs) : `<div class="equip-job-alert no">不可装备</div>`}
            <h3>${item.subCategory || item.category || item.library || "资料"}</h3>
            <p>${item.description || "暂无说明。"}</p>
            <div class="maple-tags">
              <span>${item.library}</span><span>${item.category}</span><span>${item.subCategory || "道具"}</span>${item.scroll ? "<span>卷轴</span>" : ""}${isThrowing ? "<span>飞镖</span>" : ""}
            </div>
          </div>
        </div>
        <div class="maple-stat-line"></div>
        ${isEquipment ? this.renderEquipStatTable(item, statRows) : `<div class="maple-stat-table">${statRows.map((row) => `<span><em>${row.label}</em><strong>${this.formatItemValue(row.value, row.key)}</strong></span>`).join("") || `<span><em>资料</em><strong>未收录</strong></span>`}</div>`}
        <div class="item-related">
          <div class="panel-head"><h3>掉落关联</h3><span>${relatedMonsters.length ? `${relatedMonsters.length} 只怪物` : "暂无掉落来源"}</span></div>
          <div class="related-monster-grid">${relatedMonsters.map((monster) => `<button class="related-monster-chip" data-close-item data-nav="图鉴" data-monster-id="${monster.id}"><img src="${monster.img}" alt="${monster.name}" /><span><strong>${monster.name}</strong><small>Lv.${monster.level || "-"} · ${monster.map || "暂无地图资料"}</small></span></button>`).join("") || `<div class="codex-empty compact">当前资料库还没有关联到掉落怪物。</div>`}</div>
        </div>
        <footer>${item.sourceVersion || "CMS079"} · ${item.category || item.library || "资料"}</footer>
      </div>`;
  }

  getItemStat(item, directKeys = [], labels = []) {
    for (const key of directKeys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
    }
    const row = (item.stats || []).find((stat) => directKeys.includes(stat.key) || labels.includes(stat.label));
    return row ? row.value : null;
  }

  getEquipJobState(item) {
    const jobs = ["新手", "战士", "魔法师", "弓箭手", "飞侠", "海盗"];
    const rawLabel = this.getItemStat(item, ["req_job_label"], ["职业"]);
    const rawValue = this.getItemStat(item, ["reqJob", "requiredJob", "job"], ["需要职业"]);
    return this.decodeJobRequirement(rawLabel ?? rawValue, jobs);
  }

  decodeJobRequirement(value, jobs = ["新手", "战士", "魔法师", "弓箭手", "飞侠", "海盗"]) {
    const normalized = String(value ?? "").trim();
    if (!normalized) {
      return { jobText: "全职业", jobs, activeJobs: jobs.slice(), all: true };
    }
    if (/^全职业$|^all$|^any$|^common$|^beginner$|^starter$/i.test(normalized)) {
      return { jobText: "全职业", jobs, activeJobs: jobs.slice(), all: true };
    }
    const numeric = Number(normalized);
    if (Number.isFinite(numeric) && String(numeric) === normalized.replace(/^0+/, "") && numeric > 0) {
      const maskMap = [
        [1, "战士"],
        [2, "魔法师"],
        [4, "弓箭手"],
        [8, "飞侠"],
        [16, "海盗"],
      ];
      const activeJobs = maskMap.filter(([mask]) => (numeric & mask) === mask).map(([, job]) => job);
      if (activeJobs.length) {
        return {
          jobText: activeJobs.length === jobs.length - 1 ? "全职业" : activeJobs.join(" / "),
          jobs,
          activeJobs: numeric === 31 ? jobs.slice() : activeJobs,
          all: numeric === 31,
        };
      }
    }
    const rules = [
      ["新手", /beginner|common|starter|novice|新手/i],
      ["战士", /warrior|战士/i],
      ["魔法师", /mage|魔法师/i],
      ["弓箭手", /bowman|archer|弓箭手/i],
      ["飞侠", /thief|rogue|飞侠/i],
      ["海盗", /pirate|海盗/i],
    ];
    const activeJobs = rules.filter(([, pattern]) => pattern.test(normalized)).map(([job]) => job);
    if (activeJobs.length) {
      return {
        jobText: activeJobs.length === jobs.length ? "全职业" : activeJobs.join(" / "),
        jobs,
        activeJobs,
        all: activeJobs.length === jobs.length,
      };
    }
    return { jobText: normalized, jobs, activeJobs: [], all: false };
  }

  renderEquipJobPanel(item, equipJobs = null) {
    const state = equipJobs || this.getEquipJobState(item);
    return `<div class="equip-job-panel ${state.all ? "all" : "restricted"}">
      <span>职业</span>
      <div>${state.jobs.map((job) => `<b class="${state.activeJobs.includes(job) ? "ok" : "no"}">${job}</b>`).join("")}</div>
      ${state.all ? `<em>全职业</em>` : `<em>${this.escapeHtml(state.jobText)}</em>`}
    </div>`;
  }

  renderEquipStatTable(item, statRows) {
    const wanted = [
      ["需要力量", ["reqSTR"], ["需要力量"]],
      ["需要敏捷", ["reqDEX"], ["需要敏捷"]],
      ["需要智力", ["reqINT"], ["需要智力"]],
      ["需要运气", ["reqLUK"], ["需要运气"]],
      ["武器分类", ["weapon_type"], ["武器分类"]],
      ["攻击速度", ["attack_speed_label"], ["攻击速度"]],
      ["攻击力", ["incPAD", "attack", "weaponAttack"], ["攻击力"]],
      ["魔法力", ["incMAD", "magicAttack"], ["魔法力"]],
      ["可升级次数", ["tuc", "slots"], ["可升级次数", "升级槽"]],
    ];
    const rows = wanted
      .map(([label, keys, labels]) => ({ label, value: this.getItemStat(item, keys, labels), key: keys[0] }))
      .filter((row) => row.value !== null && row.value !== undefined && row.value !== "");
    const fallback = statRows.filter((row) => !["req_job_label"].includes(row.key)).slice(0, 10);
    const finalRows = rows.length ? rows : fallback;
    return `<div class="equip-stat-grid">${finalRows.map((row) => `<span><em>${row.label}</em><strong>${this.formatItemValue(row.value, row.key)}</strong></span>`).join("") || `<span><em>装备资料</em><strong>未收录</strong></span>`}</div>`;
  }

  findMonstersForItem(item) {
    const itemIds = [item.id, item.code].filter(Boolean).map((value) => String(value).replace(/^0+/, ""));
    const names = [item.name, item.nameEn].filter(Boolean).map((value) => String(value).toLowerCase());
    return (this.monsterItems || []).filter((monster) => {
      const drops = Object.values(this.normalizeDrops(monster.drops)).flat();
      const related = monster.relatedItems || [];
      const candidates = [...drops, ...related];
      return candidates.some((drop) => {
        if (typeof drop === "string") return names.some((name) => drop.toLowerCase().includes(name));
        const dropIds = [drop.id, drop.code].filter(Boolean).map((value) => String(value).replace(/^0+/, ""));
        const dropNames = [drop.name, drop.nameEn].filter(Boolean).map((value) => String(value).toLowerCase());
        return dropIds.some((id) => itemIds.includes(id)) || dropNames.some((name) => names.includes(name));
      });
    });
  }

  isThrowingItem(item) {
    const text = `${item.name || ""} ${item.nameEn || ""} ${item.description || ""}`.toLowerCase();
    return text.includes("throwing") || text.includes("镖");
  }

  countItemsByCategory(category) {
    const items = (this.catalogItems || []).filter((item) => item.library === this.itemLibrary);
    if (category === "全部") return items.length;
    return items.filter((item) => item.category === category).length;
  }

  countItemsByLibrary(library) {
    return (this.catalogItems || []).filter((item) => item.library === library).length;
  }

  countItemsByDisplaySubCategory(subCategory) {
    const items = (this.catalogItems || []).filter((item) => item.library === this.itemLibrary && (this.itemCategory === "全部" || item.category === this.itemCategory));
    if (subCategory === "全部") return items.length;
    return items.filter((item) => this.getItemDisplaySubCategory(item) === subCategory).length;
  }

  formatItemValue(value, key = "") {
    const number = Number(value);
    if (Number.isFinite(number) && String(value).trim() !== "") return number > 0 && !String(key).startsWith("req") && !["tuc", "price", "attackSpeed", "unitPrice", "slotMax"].includes(key) ? `+${number}` : String(number);
    return value ?? "—";
  }

  formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("zh-CN") : (value ?? "—");
  }

  escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  renderStarter() {
    return `<section class="open-card solo"><span class="eyebrow">开荒路线</span><h1>把第一天拆成三件事。</h1><p>先升等级，再收硬通货，最后记录第一批市场价格。</p><div class="starter-steps"><div><b>01</b><strong>10级前</strong><span>熟悉路线，别恋战。</span></div><div><b>02</b><strong>10-30级</strong><span>刷怪、任务、材料一起看。</span></div><div><b>03</b><strong>首周</strong><span>盯卷轴和飞镖价格。</span></div></div></section>`;
  }

  renderSampleTable(title = "价格记录", subtitle = "按公开报价整理") {
    return `<section class="sample-table radar-table"><div class="table-head"><h2>${title}</h2><span>${subtitle}</span></div><table><thead><tr><th>时间</th><th>服务器</th><th>参考价</th><th>来源</th><th>备注</th></tr></thead><tbody><tr><td colspan="5">暂无相关交易信息</td></tr></tbody></table></section>`;
  }

  renderNewsBoard() {
    const items = (this.newsItems || []).slice(0, 6);
    return `
      <section class="news-board">
        <div class="table-head">
          <h2>资讯</h2>
          <span>公告和攻略链接</span>
        </div>
        <div class="news-layout ${this.isAdmin ? "" : "visitor"}">
          <div class="news-list">
            ${items.length ? items.map((item) => `
              <article class="news-item">
                <div class="news-meta"><strong>${item.kind || "资讯"}</strong><span>${item.date || ""}</span></div>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
                <div class="news-actions">
                  ${item.link ? `<button data-news-link="${item.link}">打开链接</button>` : ""}
                </div>
              </article>
            `).join("") : `<div class="codex-empty">当前暂无资讯。</div>`}
          </div>
          ${this.isAdmin ? `<aside class="news-admin">
            <h3>管理员发布</h3>
            <p>可在这里快速录入一条资讯或外部链接。</p>
              <form data-news-form>
                <input name="kind" placeholder="类型，例如 公告 / 攻略" value="公告" />
                <input name="title" placeholder="标题" />
                <textarea name="summary" placeholder="简介" rows="4"></textarea>
                <input name="link" placeholder="链接（可选）" />
                <button type="submit" ${this.newsFormBusy ? "disabled" : ""}>${this.newsFormBusy ? "发布中..." : "发布资讯"}</button>
              </form>
            ${this.loginError ? `<p class="form-error">${this.loginError}</p>` : ""}
          </aside>` : ""}
        </div>
      </section>`;
  }

  renderNewsCenter() {
    return `
      <section class="news-center-hero">
        <div>
          <span class="eyebrow">资讯社区</span>
          <h1>版本消息、行情讨论和玩家交流</h1>
          <p>这里是站内的话题社区：讨论版本变化、物价、掉落与玩法。攻略内容统一收进开荒频道。</p>
        </div>
        <div class="news-center-tags">
          <span>官方动态</span><span>行情讨论</span><span>玩家交流</span><span>问题求助</span>
        </div>
      </section>
      ${this.renderNewsBoard("community")}`;
  }

  renderGuideCenter() {
    return `
      <section class="news-center-hero guide-center-hero">
        <div>
          <span class="eyebrow">开荒攻略</span>
          <h1>路线、任务、职业与视频攻略</h1>
          <p>从第一天练级路线到组队任务、职业养成，都在这里按攻略方式沉淀。视频攻略会自动带入视频封面。</p>
        </div>
        <div class="news-center-tags">
          <span>升级路线</span><span>任务攻略</span><span>职业养成</span><span>视频攻略</span>
        </div>
      </section>
      ${this.renderNewsBoard("guide")}`;
  }

  getNewsVideoEmbed(link) {
    const raw = String(link || "").trim();
    const bvid = raw.match(/\bBV[0-9A-Za-z]+\b/i)?.[0];
    if (!bvid || !/(bilibili\.com|b23\.tv)/i.test(raw)) return "";
    let startAt = "";
    try {
      const time = new URL(raw).searchParams.get("t");
      if (time && Number(time) >= 0) startAt = `&t=${encodeURIComponent(time)}`;
    } catch {
      // Keep the player usable even when the pasted source link is incomplete.
    }
    return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=1&high_quality=1&danmaku=0${startAt}`;
  }

  renderNewsDetail(id) {
    const item = (this.newsItems || [])
      .map((entry) => this.normalizeNewsItem(entry))
      .find((entry) => entry.id === id && this.canViewNewsItem(entry));
    if (!item) {
      return `
        <section class="news-detail-empty">
          <strong>这篇资讯暂时不可查看</strong>
          <button type="button" data-close-news-detail>返回资讯</button>
        </section>`;
    }
    const videoEmbed = this.getNewsVideoEmbed(item.link);
    const coverStyle = item.cover ? `background-image:url('${this.escapeHtml(item.cover)}')` : "";
    const topMedia = videoEmbed
      ? `<div class="news-detail-video"><iframe src="${this.escapeHtml(videoEmbed)}" title="${this.escapeHtml(item.title)}" loading="lazy" allowfullscreen></iframe></div>`
      : item.cover
        ? `<div class="news-detail-cover" style="${coverStyle}"><span>${this.escapeHtml(item.kind)}</span></div>`
        : "";
    const content = this.escapeHtml(item.content || item.summary || "管理员暂未补充正文内容。").replace(/\n/g, "<br />");
    const comments = item.comments.slice(-30).reverse();
    const commentList = comments.length ? comments.map((comment) => `
      <article class="comment-item">
        <span class="comment-avatar">${this.escapeHtml(String(comment.author || "游").slice(0, 1))}</span>
        <div>
          <header><strong>${this.escapeHtml(comment.author || "游客")}</strong><span>${this.escapeHtml(comment.date || "刚刚")}</span></header>
          <p>${this.escapeHtml(comment.content || "")}</p>
        </div>
      </article>`).join("") : `<div class="comment-empty"><strong>还没有评论</strong><span>来写第一条回复，给这个话题开个头。</span></div>`;
    return `
      <section class="news-detail-page">
        <button type="button" class="news-back-btn" data-close-news-detail>返回资讯</button>
        <article class="news-detail-card">
          <div class="news-detail-main">
            <div class="news-detail-meta"><strong>${this.escapeHtml(item.source)}</strong><span>${this.escapeHtml(item.date || "今日")}</span></div>
            <h1>${this.escapeHtml(item.title)}</h1>
            <p class="news-detail-summary">${this.escapeHtml(item.summary)}</p>
            <div class="news-tags">${(item.tags.length ? item.tags : [item.kind]).slice(0, 5).map((tag) => `<span>${this.escapeHtml(tag)}</span>`).join("")}</div>
            <div class="news-detail-actions">
              <button type="button" data-news-like="${this.escapeHtml(item.id)}">点赞 ${item.likes}</button>
              <button type="button">评论 ${item.comments.length}</button>
              ${item.link ? `<button type="button" class="news-origin-link" data-news-link="${this.escapeHtml(item.link)}">查看原文</button>` : ""}
            </div>
          </div>
          ${topMedia ? `<div class="news-detail-media">${topMedia}</div>` : ""}
          <div class="news-detail-content">${content}</div>
          <section class="news-detail-comments">
            <div class="comment-head">
              <div><h2>全部评论</h2><span>${item.comments.length} 条回复</span></div>
            </div>
            ${this.isLoggedIn ? `
              <form class="comment-compose" data-news-comment-form>
                <input type="hidden" name="id" value="${this.escapeHtml(item.id)}" />
                <input type="hidden" name="author" value="${this.escapeHtml(this.currentDisplayName || this.currentUser || "游客")}" />
                ${this.renderAvatar("account-avatar comment-compose-avatar")}
                <textarea name="content" rows="3" maxlength="240" placeholder="友善交流，写下你的看法..."></textarea>
                <footer><span>${this.escapeHtml(this.currentDisplayName || this.currentUser)} · ${this.escapeHtml(this.getRoleLabel(this.currentRole))}</span><button type="submit">发表评论</button></footer>
              </form>` : `
              <div class="comment-login-card">
                <strong>登录后参与讨论</strong>
                <span>评论会显示你的昵称，方便玩家继续交流。</span>
                <button type="button" data-open-login>登录评论</button>
              </div>`}
            <div class="comment-list">${commentList}</div>
          </section>
        </article>
      </section>`;
  }

  newsTargetKey(target) {
    return `market:${String(target?.id || "").trim()}`;
  }

  getNewsTargetOptions() {
    const map = new Map();
    map.set("market:gold-rate", { key: "market:gold-rate", label: "金币汇率", group: "汇率" });
    this.getMarketInstruments().forEach((item) => {
      const key = this.newsTargetKey(item);
      if (!map.has(key)) map.set(key, { key, label: item.name || item.short || key, group: item.category || "行情" });
    });
    return [...map.values()];
  }

  getRelatedNewsItems(target) {
    const key = this.newsTargetKey(target);
    return (this.newsItems || [])
      .map((item) => this.normalizeNewsItem(item))
      .filter((item) => item.status !== "草稿" && item.targets.includes(key))
      .slice(0, 4);
  }

  renderRelatedNewsPanel(target) {
    const items = this.getRelatedNewsItems(target);
    return `
      <section class="related-news-panel">
        <div class="table-head">
          <h2>相关资讯</h2>
          <span>${this.escapeHtml(target?.name || "当前品种")} · 独立关联窗口</span>
        </div>
        ${items.length ? `<div class="related-news-list">
          ${items.map((item) => `
            <article class="related-news-card" data-open-news="${this.escapeHtml(item.id)}">
              <span>${this.escapeHtml(item.kind)}</span>
              <h3>${this.escapeHtml(item.title)}</h3>
              <p>${this.escapeHtml(item.summary)}</p>
              <div><button type="button" data-news-like="${this.escapeHtml(item.id)}">点赞 ${item.likes}</button><button type="button" data-news-comment-toggle="${this.escapeHtml(item.id)}">评论 ${item.comments.length}</button>${item.link ? `<button type="button" data-news-link="${this.escapeHtml(item.link)}">查看原文</button>` : ""}</div>
            </article>`).join("")}
        </div>` : `<div class="related-news-empty">
          <strong>暂无相关资讯</strong>
          <span>管理员在内容池发布文章后，可以把它关联到这个品种。这里不会自动生成内容。</span>
        </div>`}
      </section>`;
  }

  normalizeNewsItem(item = {}) {
    const comments = Array.isArray(item.comments) ? item.comments : [];
    const tags = Array.isArray(item.tags)
      ? item.tags
      : String(item.tags || "").split(/[，,\s]+/).map((tag) => tag.trim()).filter(Boolean);
    const slots = Array.isArray(item.slots) ? item.slots : [];
    const targets = Array.isArray(item.targets) ? item.targets : [];
    const title = String(item.title || "未命名资讯");
    const summary = String(item.summary || "");
    const link = String(item.link || item.url || "");
    const kind = String(item.kind || item.category || "资讯");
    const requestedChannel = String(item.channel || "");
    const channel = ["guide", "community"].includes(requestedChannel)
      ? requestedChannel
      : (/攻略|开荒|路线|职业|任务|视频/.test(`${title} ${summary} ${kind}`) || /bilibili\.com/i.test(link) ? "guide" : "community");
    const displayKind = channel === "guide" && ["公告", "资讯", "新闻", ""].includes(kind)
      ? (/bilibili\.com/i.test(link) ? "视频攻略" : (/任务/.test(`${title} ${summary}`) ? "任务攻略" : "开荒攻略"))
      : kind;
    return {
      id: String(item.id || ""),
      title,
      summary,
      link,
      source: String(item.source || item.sourceName || (item.link ? "外部网站" : "管理员")),
      kind: displayKind,
      channel,
      date: String(item.date || ""),
      cover: String(item.cover || ""),
      status: String(item.status || "已发布"),
      content: String(item.content || ""),
      mediaType: String(item.mediaType || "外链视频"),
      author: String(item.author || item.source || "管理员"),
      authorRole: String(item.authorRole || ""),
      likes: Number(item.likes || 0),
      views: Number(item.views || 0),
      tags,
      slots,
      targets,
      comments,
    };
  }

  newsFallbackCover(item) {
    const key = `${item.kind} ${item.title}`;
    if (/视频|B站|bilibili/i.test(key)) return "linear-gradient(135deg, #e6f7ff, #ffd7e8)";
    if (/行情|金币|汇率/i.test(key)) return "linear-gradient(135deg, #fff5d8, #dff8ef)";
    if (/攻略|开荒|路线/i.test(key)) return "linear-gradient(135deg, #e9f6ff, #eaf7dc)";
    return "linear-gradient(135deg, #eef7ff, #fff3f8)";
  }

  canViewNewsItem(item) {
    if (item.status !== "待审核" && item.status !== "草稿") return true;
    if (this.isModerator) return true;
    return this.isLoggedIn && item.author && item.author === (this.currentDisplayName || this.currentUser);
  }

  renderNewsBoard(channel = "") {
    const isAdminView = this.isAdmin && (this.adminSection === "资讯与设置" || this.active === "资讯" || this.active === "开荒");
    const allItems = (this.newsItems || []).map((item) => this.normalizeNewsItem(item));
    const items = allItems
      .filter((item) => this.canViewNewsItem(item) && (!channel || item.channel === channel))
      .slice(0, isAdminView ? 18 : 6);
    const draft = isAdminView && this.newsDraftId ? allItems.find((item) => item.id === this.newsDraftId) : null;
    const defaultChannel = draft?.channel || channel || "community";
    const kinds = ["升级路线", "任务攻略", "职业养成", "视频攻略", "版本攻略", "官方动态", "行情讨论", "玩家交流", "问题求助"];
    const targetOptions = this.getNewsTargetOptions();
    const renderGuideCard = (item, index) => {
      const hasCover = !!item.cover;
      const coverStyle = hasCover ? `background-image:url('${this.escapeHtml(item.cover)}')` : "";
      const stats = `${this.formatNumber(item.likes || 0)} 点赞 · ${this.formatNumber(item.comments?.length || 0)} 评论`;
      return `
        <article class="guide-card ${index === 0 ? "featured" : ""} ${hasCover ? "has-cover" : "no-cover"}" data-open-news="${this.escapeHtml(item.id)}">
          <div class="guide-card-cover" ${hasCover ? `style="${coverStyle}"` : ""}>
            <span class="guide-cover-fallback">${this.escapeHtml((item.kind || "攻").slice(0, 2))}</span>
            <b>${this.escapeHtml(item.kind)}</b>
            ${/视频/.test(`${item.kind} ${item.mediaType}`) || item.link ? `<em>视频 / 外链</em>` : ""}
          </div>
          <div class="guide-card-body">
            <h3>${this.escapeHtml(item.title)}</h3>
            <p>${this.escapeHtml(item.summary)}</p>
            <footer>
              <span>${this.escapeHtml(item.source)} · ${this.escapeHtml(item.date || "今日")}</span>
              <strong>${stats}</strong>
            </footer>
          </div>
        </article>`;
    };
    const renderCard = (item) => {
      const hasCover = item.channel === "guide" && !!item.cover;
      const coverStyle = hasCover ? `background-image:url('${this.escapeHtml(item.cover)}')` : "";
      const commentOpen = this.newsCommentOpen === item.id;
      return `
        <article class="news-item ${hasCover ? "has-cover" : "no-cover"} ${item.status === "草稿" ? "draft" : ""}" data-open-news="${this.escapeHtml(item.id)}">
          ${hasCover ? `<button class="news-cover" type="button" style="${coverStyle}"><span>${this.escapeHtml(item.kind)}</span></button>` : ""}
          <div class="news-body">
            <div class="news-meta"><strong>${this.escapeHtml(item.kind)}</strong><span>${this.escapeHtml(item.source)} · ${this.escapeHtml(item.date || "今日")}</span></div>
            <h3>${this.escapeHtml(item.title)}</h3>
            <p>${this.escapeHtml(item.summary)}</p>
            ${item.status === "待审核" ? `<div class="pending-badge">待审核</div>` : ""}
            <div class="news-tags">${(item.tags.length ? item.tags : [item.kind]).slice(0, 4).map((tag) => `<span>${this.escapeHtml(tag)}</span>`).join("")}</div>
            <div class="news-actions">
              <button type="button" data-news-like="${this.escapeHtml(item.id)}">点赞 ${item.likes}</button>
              <button type="button" data-news-comment-toggle="${this.escapeHtml(item.id)}">评论 ${item.comments.length}</button>
              ${item.link ? `<button type="button" data-news-link="${this.escapeHtml(item.link)}">查看原文</button>` : ""}
              ${this.isModerator && item.status === "待审核" ? `<button type="button" class="approve" data-news-status="${this.escapeHtml(item.id)}" data-status="已发布">通过</button>` : ""}
              ${this.isModerator && item.status !== "待审核" ? `<button type="button" data-news-status="${this.escapeHtml(item.id)}" data-status="待审核">退回</button>` : ""}
              ${isAdminView ? `<button type="button" data-news-edit="${this.escapeHtml(item.id)}">编辑</button><button type="button" data-news-delete="${this.escapeHtml(item.id)}">删除</button>` : ""}
            </div>
            ${commentOpen ? `
              <div class="news-comments">
                ${item.comments.slice(-3).map((comment) => `<p><strong>${this.escapeHtml(comment.author || "游客")}</strong><span>${this.escapeHtml(comment.content || "")}</span></p>`).join("") || `<em>还没有评论，来写第一条。</em>`}
                <form data-news-comment-form>
                  <input type="hidden" name="id" value="${this.escapeHtml(item.id)}" />
                  <input name="author" value="${this.escapeHtml(this.currentUser || "游客")}" placeholder="昵称" />
                  <input name="content" placeholder="写一句评论" />
                  <button type="submit">发送</button>
                </form>
              </div>` : ""}
          </div>
        </article>`;
    };
    return `
      <section class="news-board ${isAdminView ? "news-studio-board" : ""} ${!isAdminView && channel === "guide" ? "guide-board" : ""}">
        ${this.userNotice ? `<div class="user-notice">${this.escapeHtml(this.userNotice)}</div>` : ""}
        <div class="table-head">
          <div>
            <h2>${channel === "guide" ? "攻略库" : channel === "community" ? "社区话题" : "内容管理"}</h2>
            <span>${isAdminView ? "发布、编辑与分区管理" : channel === "guide" ? "视频与图文攻略" : "玩家交流与官方动态"}</span>
          </div>
          ${!isAdminView && channel === "community" ? `<button class="board-publish-btn" type="button" data-open-publisher="community">发布帖子</button>` : ""}
          ${!isAdminView && channel === "guide" ? `<button class="board-publish-btn" type="button" data-open-publisher="guide">发布攻略</button>` : ""}
        </div>
        <div class="news-layout ${isAdminView ? "" : "visitor"}">
          <div class="${!isAdminView && channel === "guide" ? `guide-card-grid ${items.length === 1 ? "is-single" : ""}` : "news-list"}">
            ${items.length ? items.map((item, index) => (!isAdminView && channel === "guide" ? renderGuideCard(item, index) : renderCard(item))).join("") : `<div class="codex-empty news-empty-state"><strong>${channel === "guide" ? "还没有攻略内容" : "还没有社区话题"}</strong><span>${channel === "guide" ? "可以先发布一篇路线、任务或视频攻略。" : "可以在这里发起第一个讨论，发布后会直接展示。"}</span>${!isAdminView ? `<button type="button" data-open-publisher="${channel === "guide" ? "guide" : "community"}">${channel === "guide" ? "发布攻略" : "发布帖子"}</button>` : ""}</div>`}
          </div>
          ${isAdminView ? `<aside class="news-admin">
            <h3>${draft ? "编辑内容" : "发布内容"}</h3>
            <p>先确定内容分区：攻略进入开荒，讨论与动态进入资讯社区；前台会按分区自动展示。</p>
            <form data-news-form data-preserve-form="news-editor">
              <input type="hidden" name="id" value="${this.escapeHtml(draft?.id || "")}" />
              <div class="news-admin-row">
                <select name="channel">
                  <option value="guide" ${defaultChannel === "guide" ? "selected" : ""}>发布到：开荒攻略</option>
                  <option value="community" ${defaultChannel === "community" ? "selected" : ""}>发布到：资讯社区</option>
                </select>
                <select name="status">${["已发布", "草稿"].map((status) => `<option value="${status}" ${(draft?.status || "已发布") === status ? "selected" : ""}>${status}</option>`).join("")}</select>
              </div>
              <select name="kind">${kinds.map((kind) => `<option value="${kind}" ${(draft?.kind || (defaultChannel === "guide" ? "任务攻略" : "玩家交流")) === kind ? "selected" : ""}>${kind}</option>`).join("")}</select>
              <input name="title" data-focus-key="news-title" placeholder="标题，例如 金钱镖供应增加，价格快速回落" value="${this.escapeHtml(draft?.title || "")}" />
              <textarea name="summary" data-focus-key="news-summary" placeholder="摘要：一句话说明这条内容为什么值得看" rows="3">${this.escapeHtml(draft?.summary || "")}</textarea>
              <div class="news-editor-block">
                <strong>视频 / 外链</strong>
                <select name="mediaType">
                  ${["外链视频", "图文内容", "外部文章"].map((type) => `<option value="${type}" ${(draft?.mediaType || "外链视频") === type ? "selected" : ""}>${type}</option>`).join("")}
                </select>
                <input name="link" data-focus-key="news-link" placeholder="B站视频、攻略原文或其他外链" value="${this.escapeHtml(draft?.link || "")}" />
              </div>
              <input name="source" placeholder="来源，例如 B站 / 贴吧 / 官网" value="${this.escapeHtml(draft?.source || "")}" />
              <div class="news-editor-block">
                <strong>顶部封面 / 运营横幅（可选）</strong>
                <input name="cover" data-focus-key="news-cover" placeholder="没有图片可留空；需要展示时可粘贴图片链接或上传" value="${this.escapeHtml(draft?.cover || "")}" />
                <label class="news-upload-btn">上传图片<input type="file" accept="image/*" data-news-cover-file /></label>
              </div>
              <div class="news-editor-block">
                <strong>正文图文</strong>
                <textarea name="content" data-focus-key="news-content" placeholder="填写站内正文，可同时添加图片或视频链接。" rows="5">${this.escapeHtml(draft?.content || "")}</textarea>
              </div>
              <div class="news-editor-block">
                <strong>标签</strong>
                <div class="news-tag-picker">
                  ${["开荒", "行情", "飞镖", "卷轴", "金币", "版本更新", "掉落改动", "攻略", "公告"].map((tag) => `<label><input type="checkbox" name="tags" value="${tag}" ${(draft?.tags || []).includes(tag) ? "checked" : ""} /><span>${tag}</span></label>`).join("")}
                </div>
                <input name="customTags" placeholder="自定义标签，可用逗号分隔" value="${this.escapeHtml((draft?.tags || []).filter((tag) => !["开荒", "行情", "飞镖", "卷轴", "金币", "版本更新", "掉落改动", "攻略", "公告"].includes(tag)).join(","))}" />
              </div>
              <div class="news-relation-box">
                <strong>关联行情品种</strong>
                <div class="news-target-picker">
                  ${targetOptions.map((option) => `<label><input type="checkbox" name="targets" value="${this.escapeHtml(option.key)}" ${(draft?.targets || []).includes(option.key) ? "checked" : ""} /><span><em>${this.escapeHtml(option.group)}</em>${this.escapeHtml(option.label)}</span></label>`).join("")}
                </div>
              </div>
              ${(draft?.slots || []).map((slot) => `<input type="hidden" name="slots" value="${this.escapeHtml(slot)}" />`).join("")}
              <button type="submit" ${this.newsFormBusy ? "disabled" : ""}>${this.newsFormBusy ? "保存中..." : draft ? "保存修改" : "发布内容"}</button>
              ${draft ? `<button type="button" class="news-cancel" data-news-cancel-edit>取消编辑</button>` : ""}
            </form>
            ${this.loginError ? `<p class="form-error">${this.loginError}</p>` : ""}
          </aside>` : ""}
        </div>
      </section>`;
  }

  renderPublisherModal() {
    if (!this.publisherOpen) return "";
    const channel = this.publisherChannel || "community";
    const isGuide = channel === "guide";
    const kinds = isGuide ? ["任务攻略", "升级路线", "职业养成", "视频攻略", "版本攻略"] : ["玩家交流", "行情讨论", "官方动态", "问题求助"];
    return `
      <div class="publisher-overlay" data-close-publisher>
        <section class="publisher-modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
          <header>
            <div>
              <span>${isGuide ? "开荒攻略" : "资讯社区"}</span>
              <h2>${isGuide ? "发布个人攻略" : "发表社区帖子"}</h2>
              <p>发布后会直接展示给玩家，管理员可在后台编辑或删除违规内容。</p>
            </div>
            <button type="button" data-close-publisher>×</button>
          </header>
          <form data-publisher-form data-preserve-form="publisher">
            <input type="hidden" name="channel" value="${channel}" />
            <div class="publisher-grid">
              <label><span>分类</span><select name="kind">${kinds.map((kind) => `<option value="${kind}">${kind}</option>`).join("")}</select></label>
              <label><span>外链 / 视频</span><input name="link" placeholder="B站视频或攻略原文，可留空" /></label>
            </div>
            <label><span>标题</span><input name="title" data-focus-key="publisher-title" placeholder="${isGuide ? "例如：月妙组队任务路线与注意事项" : "例如：今天金钱镖价格是不是跌得太快了？"}" required /></label>
            <label><span>摘要</span><textarea name="summary" rows="3" placeholder="一句话说明这条内容为什么值得看" required></textarea></label>
            <label><span>正文</span><textarea name="content" rows="9" placeholder="${isGuide ? "写路线、步骤、注意事项；有视频也建议补几句文字摘要。" : "像贴吧发帖一样写观点、问题或补充信息。"}"></textarea></label>
            ${this.loginError ? `<div class="form-error">${this.escapeHtml(this.loginError)}</div>` : ""}
            <footer>
              <span>${this.escapeHtml(this.currentDisplayName || this.currentUser)} · ${this.escapeHtml(this.getRoleLabel(this.currentRole))}</span>
              <div><button type="button" data-close-publisher>取消</button><button type="submit" class="primary-btn" ${this.newsFormBusy ? "disabled" : ""}>${this.newsFormBusy ? "提交中..." : "提交发布"}</button></div>
            </footer>
          </form>
        </section>
      </div>`;
  }

  renderLoginModal() {
    if (!this.loginOpen) return "";
    const isRegister = this.authMode === "register";
    const isForgot = this.authMode === "forgot";
    const questions = this.recoveryQuestions || [];
    const questionOptions = questions.map((question) => `<option value="${this.escapeHtml(question)}">${this.escapeHtml(question)}</option>`).join("");
    const captcha = this.authCaptcha || this.makeCaptcha();
    const busyLabel = isForgot ? "重置中..." : isRegister ? "注册中..." : "登录中...";
    return `
      <div class="login-overlay" data-close-login>
        <div class="login-modal auth-modal-wide" role="dialog" aria-modal="true" aria-label="账号登录" onclick="event.stopPropagation()">
          <div class="login-brand-panel">
            <span class="eyebrow">Maple Terminal</span>
            <h2>${isForgot ? "找回你的枫岛账号" : "进入玩家社区"}</h2>
            <p>${isForgot ? "通过注册时设置的问题验证身份，完成后即可使用新密码登录。" : "登录后可以发布攻略、参与讨论、评论互动，并在个人主页管理自己的内容。"}</p>
            <div class="auth-illustration"><b>MS</b><span>玩家资料 / 攻略 / 讨论</span></div>
          </div>
          <form class="login-form" ${isForgot ? "data-recovery-form" : "data-login-form"}>
            <div class="auth-tabs ${isRegister ? "is-register" : ""}">
              <span class="auth-tabs-pill" aria-hidden="true"></span>
              <button type="button" class="${!isRegister ? "active" : ""}" data-auth-mode="login">登录</button>
              <button type="button" class="${isRegister ? "active" : ""}" data-auth-mode="register">注册</button>
            </div>
            ${!isForgot ? `<div class="auth-registration-notice" role="status"><strong>测试版本</strong><span>因个人技术原因，测试阶段暂不开放自由账号注册，已有账号可直接登录，或通过邀请码注册。</span></div>` : ""}
            ${isForgot ? `<h3 class="auth-form-title">重置密码</h3>` : ""}
            <label><span>账号</span><input name="username" autocomplete="username" value="${!isRegister ? this.escapeHtml(this.rememberedUser || "") : ""}" placeholder="请输入账号" /></label>
            <div class="register-extra${isRegister || isForgot ? " active" : ""}" data-register-extra>
              <label><span>昵称</span><input name="displayName" placeholder="玩家昵称" /></label>
              <label><span>确认密码</span><input name="confirmPassword" type="password" autocomplete="new-password" placeholder="再次输入密码" /></label>
              <label><span>找回问题</span><select name="recoveryQuestion">${questionOptions}</select></label>
              <label><span>问题答案</span><input name="recoveryAnswer" placeholder="用于以后找回密码" /></label>
              <label><span>邀请码</span><input name="inviteCode" placeholder="测试阶段注册需要邀请码" /></label>
            </div>
            <label><span>${isForgot ? "新密码" : "密码"}</span><input name="password" type="password" autocomplete="${isRegister || isForgot ? "new-password" : "current-password"}" placeholder="至少 6 位" /></label>
            <div class="captcha-row">
              <label><span>验证码</span><input name="captcha" inputmode="numeric" placeholder="请输入结果" /></label>
              <button type="button" class="captcha-card" data-refresh-captcha title="换一个验证码">${this.escapeHtml(captcha.text)} = ?</button>
            </div>
            <div class="login-only${!isRegister && !isForgot ? " active" : ""}" data-login-only>
              <div class="auth-meta-row">
                <label class="remember-check"><input type="checkbox" name="remember" ${this.rememberLogin ? "checked" : ""} /><span>记住账号</span></label>
                <button type="button" data-forgot-password>忘记密码？</button>
              </div>
            </div>
            ${this.loginError ? `<div class="form-error">${this.escapeHtml(this.loginError)}</div>` : ""}
            <div class="login-actions">
              <button type="button" class="ghost-btn" data-close-login>取消</button>
              <button type="submit" class="primary-btn ${this.loginBusy ? "is-loading" : ""}" ${this.loginBusy ? "disabled" : ""}>${this.loginBusy ? `<i></i>${busyLabel}` : isForgot ? "重置密码" : isRegister ? "注册并登录" : "登录"}</button>
            </div>
            ${isForgot ? `<button type="button" class="auth-back-link" data-auth-mode="login">返回登录</button>` : ""}
          </form>
        </div>
      </div>`;
  }

  switchAuthTab(mode) {
    const modal = this.querySelector(".login-modal");
    if (!modal) return;
    this.authMode = mode;
    this.loginError = "";
    this.authCaptcha = this.makeCaptcha();

    // Update tab indicator pill
    const tabs = modal.querySelector(".auth-tabs");
    if (tabs) tabs.classList.toggle("is-register", mode === "register");

    // Update tab button active states
    const loginBtn = modal.querySelector("[data-auth-mode=\"login\"]");
    const registerBtn = modal.querySelector("[data-auth-mode=\"register\"]");
    if (loginBtn) loginBtn.classList.toggle("active", mode === "login");
    if (registerBtn) registerBtn.classList.toggle("active", mode === "register");

    // Toggle register extra fields
    const registerExtra = modal.querySelector("[data-register-extra]");
    if (registerExtra) registerExtra.classList.toggle("active", mode === "register");

    // Toggle login-only section
    const loginOnly = modal.querySelector("[data-login-only]");
    if (loginOnly) loginOnly.classList.toggle("active", mode === "login");

    // Update submit button text
    const submitBtn = modal.querySelector(".login-actions .primary-btn");
    if (submitBtn) submitBtn.textContent = mode === "register" ? "注册并登录" : "登录";

    // Clear error message
    const errorEl = modal.querySelector(".form-error");
    if (errorEl) errorEl.remove();

    // Update captcha display
    const captchaBtn = modal.querySelector(".captcha-card");
    if (captchaBtn) captchaBtn.textContent = this.authCaptcha.text + " = ?";

    // Rebind form submit handler (needed since we bypassed render)
    const form = modal.querySelector(".login-form");
    if (form) form.onsubmit = (event) => this.submitLogin(event);
  }

  renderTestingNotice() {
    if (!this.testingNoticeOpen) return "";
    return `
      <div class="testing-notice-overlay" data-testing-notice-overlay>
        <section class="testing-notice-modal" role="dialog" aria-modal="true" aria-labelledby="testing-notice-title">
          <button class="testing-notice-close" type="button" data-close-testing-notice aria-label="关闭">×</button>
          <div class="testing-notice-mark" aria-hidden="true"><span></span></div>
          <small>访问提示</small>
          <h2 id="testing-notice-title">网站测试中</h2>
          <p>完整功能即将上线</p>
          <button class="testing-notice-confirm" type="button" data-close-testing-notice>我知道了</button>
        </section>
      </div>`;
  }

  renderScrollSoonModal() {
    if (!this.scrollSoonOpen) return "";
    return `
      <div class="scroll-soon-overlay" data-scroll-soon-overlay>
        <section class="scroll-soon-modal" role="dialog" aria-modal="true" aria-labelledby="scroll-soon-title" onclick="event.stopPropagation()">
          <button class="scroll-soon-close" type="button" data-close-scroll-soon aria-label="关闭">×</button>
          <div class="scroll-soon-mark" aria-hidden="true">🔮</div>
          <small>开发中</small>
          <h2 id="scroll-soon-title">砸卷工具</h2>
          <p>砸卷工具正在紧锣密鼓开发中，敬请期待！</p>
          <button class="scroll-soon-confirm" type="button" data-close-scroll-soon>我知道了</button>
        </section>
      </div>`;
  }

  renderNewsSoonModal() {
    if (!this.newsSoonOpen) return "";
    return `
      <div class="scroll-soon-overlay news-soon-overlay" data-news-soon-overlay>
        <section class="scroll-soon-modal" role="dialog" aria-modal="true" aria-labelledby="news-soon-title" onclick="event.stopPropagation()">
          <button class="scroll-soon-close" type="button" data-close-news-soon aria-label="关闭">×</button>
          <div class="scroll-soon-mark" aria-hidden="true">📰</div>
          <small>开发中</small>
          <h2 id="news-soon-title">资讯社区</h2>
          <p>资讯社区功能正在紧锣密鼓开发中，敬请期待！</p>
          <button class="scroll-soon-confirm" type="button" data-close-news-soon>我知道了</button>
        </section>
      </div>`;
  }

  renderTicker(label, value) {
    return `<div class="ticker"><span>${label}</span><strong>${value}</strong></div>`;
  }

  renderQuoteStat(label, value, type) {
    return `<div class="quote-stat ${type}"><span>${label}</span><strong>${value}</strong></div>`;
  }

  renderKlineChart() {
    const candles = this.buildDemoCandles();
    const width = 1200;
    const height = 430;
    const pad = { left: 48, right: 58, top: 34, bottom: 82 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;
    const prices = candles.flatMap((c) => [c.high, c.low]);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const pricePad = (max - min) * 0.12;
    const topPrice = max + pricePad;
    const bottomPrice = min - pricePad;
    const y = (price) => pad.top + ((topPrice - price) / (topPrice - bottomPrice)) * (chartH - 78);
    const xStep = chartW / candles.length;
    const candleW = Math.max(7, xStep * 0.52);
    const volMax = Math.max(...candles.map((c) => c.volume));
    const volTop = height - pad.bottom + 16;
    const volH = 48;
    const ma = candles.map((_, i) => {
      const part = candles.slice(Math.max(0, i - 4), i + 1);
      return part.reduce((sum, c) => sum + c.close, 0) / part.length;
    });
    const maPath = ma.map((v, i) => `${i === 0 ? "M" : "L"} ${pad.left + i * xStep + xStep / 2} ${y(v)}`).join(" ");
    const gridLines = Array.from({ length: 6 }, (_, i) => {
      const gy = pad.top + i * ((chartH - 78) / 5);
      const price = topPrice - i * ((topPrice - bottomPrice) / 5);
      return `<path d="M${pad.left} ${gy}H${width - pad.right}"/><text class="axis price-axis" x="${width - pad.right + 10}" y="${gy + 4}">${Math.round(price)}</text>`;
    }).join("");
    const dateTicks = [0, 7, 14, 21, 28, 35].map((i) => `<text class="axis" x="${pad.left + i * xStep + xStep / 2}" y="${height - 18}">D${String(i + 1).padStart(2, "0")}</text>`).join("");
    const candleNodes = candles.map((c, i) => {
      const cx = pad.left + i * xStep + xStep / 2;
      const openY = y(c.open);
      const closeY = y(c.close);
      const highY = y(c.high);
      const lowY = y(c.low);
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(3, Math.abs(openY - closeY));
      const cls = c.close >= c.open ? "up" : "down";
      const volHeight = (c.volume / volMax) * volH;
      return `<g class="candle ${cls}"><path class="wick" d="M${cx} ${highY}V${lowY}"/><rect class="body" x="${cx - candleW / 2}" y="${bodyY}" width="${candleW}" height="${bodyH}" rx="2"/><rect class="volume" x="${cx - candleW / 2}" y="${volTop + volH - volHeight}" width="${candleW}" height="${volHeight}" rx="2"/></g>`;
    }).join("");
    return `<svg class="trading-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><g class="grid">${gridLines}${Array.from({ length: 11 }, (_, i) => `<path d="M${pad.left + i * (chartW / 10)} ${pad.top}V${height - 40}"/>`).join("")}</g><g class="candles">${candleNodes}</g><path class="ma-line" d="${maPath}"/><text class="legend" x="${pad.left}" y="22">K线演示</text><text class="legend blue" x="${pad.left + 86}" y="22">MA5</text>${dateTicks}</svg>`;
  }

  renderAbout() {
    return `
      <section class="about-page">
        <div class="about-card">
          <img class="about-icon" src="assets/monsters/mscw/0700000.png" alt="蘑菇王" />
          <h1>关于作者</h1>
          <div class="about-body">
            <p>本冒险岛怀旧服数据站由我单人独立开发，现阶段为测试版本，数据报错、功能缺失等不足之处还请各位多多谅解。</p>
            <p>发现解析 / 查询故障、有优化建议，可邮件 <a href="mailto:189783956@qq.com">189783956@qq.com</a>，或 B 站私信我：<strong>呼啦啦龙虾</strong></p>
            <p>一人兼顾全站开发与行情整理，更新节奏较慢。如果工具对你有用，可通过 B 站充电或二维码投喂支持；你的赞助能让我邀请帮手协作，提速更新迭代。</p>
            <p class="about-thanks">万分感谢每一位玩家的理解与陪伴。</p>
          </div>
          <div class="about-footer">
            <span>冒险岛怀旧服行情站 · 维多利亚实验室</span>
          </div>
        </div>
      </section>
    `;
  }

  buildDemoCandles() {
    const seed = [320, 328, 336, 331, 348, 372, 365, 358, 381, 390, 375, 368, 354, 349, 361, 374, 386, 382, 397, 415, 407, 394, 402, 418, 433, 429, 421, 438, 446, 452, 441, 435, 428, 419, 431, 444];
    return seed.map((close, i) => {
      const prev = i === 0 ? close - 8 : seed[i - 1];
      const open = prev + ((i * 7) % 13) - 6;
      const high = Math.max(open, close) + 8 + ((i * 5) % 17);
      const low = Math.min(open, close) - 7 - ((i * 3) % 14);
      const volume = 40 + ((i * 19) % 90) + (i > 18 && i < 28 ? 55 : 0);
      return { open, high, low, close, volume };
    });
  }
}

customElements.define("maple-app", MapleApp);
