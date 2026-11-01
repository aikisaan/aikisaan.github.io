// Site routes, shared by the browser (nav, titles) and the server (which paths
// serve index.html). Keep this the single list of pages.
(function (root) {
  var ROUTES = {
    '/': { id: 'page-home', title: 'aiKisaan — Digital Community for Farmers', description: 'aiKisaan connects farmers, FPOs, experts and markets through AI-powered advice, a peer community and trusted market access.' },
    '/about': { id: 'page-about', title: 'About aiKisaan', description: 'Our mission, values and the team building a digital community for every Indian farmer.' },
    '/farmers': { id: 'page-farmers', title: 'For Farmers — aiKisaan', description: 'Verified farmer profiles, crop planning, accounting reports and market access for individual farmers.' },
    '/ai-advisor': { id: 'page-ai-advisor', title: 'Saathi AI Advisor — aiKisaan', description: 'Photo-based disease diagnosis, crop advice and voice support in 12 Indian languages.' },
    '/solutions': { id: 'page-solutions', title: 'Solutions — aiKisaan', description: '26 measurable levers to reduce cost and increase revenue for farmers and FPOs.' },
    '/network': { id: 'page-network', title: 'Network — aiKisaan', description: 'The aiKisaan network of farmers, FPOs, experts, suppliers and buyers.' },
    '/marketplace': { id: 'page-marketplace', title: 'Marketplace — aiKisaan', description: 'Group procurement and direct market linkage for farmers and FPOs.' },
    '/fpos': { id: 'page-fpos', title: 'For FPOs — aiKisaan FPO Digital Cockpit', description: 'The FPO Digital Cockpit: plan, buy, grow, aggregate, sell, finance and learn in one platform.' },
    '/partners': { id: 'page-partners', title: 'Partners — aiKisaan', description: 'Partner with aiKisaan as an input supplier, buyer, processor, financial institution or technology provider.' },
    '/knowledge': { id: 'page-knowledge', title: 'Knowledge Hub — aiKisaan', description: 'Guides, best practices and learning resources for farmers and FPOs.' },
    '/impact': { id: 'page-impact', title: 'Impact — aiKisaan', description: 'How aiKisaan measures lower input costs, better prices and higher farmer income.' },
    '/contact': { id: 'page-contact', title: 'Contact & Support — aiKisaan', description: 'Contact aiKisaan for help, onboarding, partnerships or to raise a complaint.' },
    '/register': { id: 'page-register', title: 'Join aiKisaan', description: 'Apply to join aiKisaan as a farmer, FPO or partner. Every application is reviewed by our team.' }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = ROUTES;
  else root.SITE_ROUTES = ROUTES;
})(this);
