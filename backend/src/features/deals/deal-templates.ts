export const DEAL_TEMPLATES = {
  PAID_ADS: {
    name: 'Paid ads management retainer',
    items: [
      { description: 'Campaign strategy and setup', quantity: 1, unitPrice: 1200, kind: 'BASE' },
      { description: 'Paid ads management — monthly', quantity: 1, unitPrice: 1800, kind: 'PACKAGE' },
      { description: 'Creative testing — monthly', quantity: 1, unitPrice: 600, kind: 'ADD_ON' }
    ]
  },
  SEO: {
    name: 'SEO retainer',
    items: [
      { description: 'Technical SEO audit', quantity: 1, unitPrice: 1000, kind: 'BASE' },
      { description: 'SEO strategy and optimization — monthly', quantity: 1, unitPrice: 1500, kind: 'PACKAGE' },
      { description: 'Content production — monthly', quantity: 1, unitPrice: 800, kind: 'ADD_ON' }
    ]
  },
  WEBSITE: {
    name: 'Website build and maintenance',
    items: [
      { description: 'Website discovery and design', quantity: 1, unitPrice: 3500, kind: 'BASE' },
      { description: 'Website build', quantity: 1, unitPrice: 5000, kind: 'PACKAGE' },
      { description: 'Hosting and maintenance — monthly', quantity: 1, unitPrice: 300, kind: 'ADD_ON' }
    ]
  }
} as const;

export type DealTemplateId = keyof typeof DEAL_TEMPLATES;
