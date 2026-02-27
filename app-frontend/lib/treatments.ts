export interface TreatmentRating {
  label: string;
  value: string;
  numericValue: number;
  maxValue: number;
}

export interface Treatment {
  id: string;
  name: string;
  emoji: string;
  color: string;
  subtitle: string;
  ratings: TreatmentRating[];
  description: string[];
  bestSuitedFor: string;
}

export const TREATMENTS: Treatment[] = [
  {
    id: 'finasteride',
    name: 'Finasteride',
    emoji: '💊',
    color: '#FFF3E0',
    subtitle: 'Oral - Direct DHT Suppression',
    ratings: [
      { label: 'Effectiveness', value: '9/10', numericValue: 9, maxValue: 10 },
      { label: 'Mechanism Strength', value: '10/10', numericValue: 10, maxValue: 10 },
      { label: 'Side Effect Risk', value: '6/10', numericValue: 6, maxValue: 10 },
      { label: 'Ease of Use', value: '9/10', numericValue: 9, maxValue: 10 },
    ],
    description: [
      'Finasteride is a 5-alpha reductase inhibitor that lowers scalp and serum DHT by ~60\u201370%. Since androgenic alopecia (male pattern baldness) is primarily driven by DHT binding to androgen receptors in genetically sensitive follicles, reducing DHT directly addresses the root cause.',
      'Clinical trials show ~85\u201390% of men stop hair loss progression, and ~60\u201365% see measurable regrowth over 1\u20132 years. It is the most effective standalone treatment for preventing further miniaturization.',
      'Potential side effects include decreased libido, erectile dysfunction, and mood changes in a small percentage of users (typically 2\u20134% in clinical trials). Most side effects resolve after discontinuation.',
    ],
    bestSuitedFor: 'Men in early to mid-stage hair loss who want long-term stabilization.',
  },
  {
    id: 'minoxidil',
    name: 'Minoxidil',
    emoji: '💧',
    color: '#E3F2FD',
    subtitle: 'Topical or Oral - Growth Stimulation',
    ratings: [
      { label: 'Effectiveness', value: '8/10', numericValue: 8, maxValue: 10 },
      { label: 'Mechanism Strength', value: '7/10', numericValue: 7, maxValue: 10 },
      { label: 'Side Effect Risk', value: '3\u20135/10', numericValue: 4, maxValue: 10 },
      { label: 'Ease of Use', value: '6\u20139/10', numericValue: 7.5, maxValue: 10 },
    ],
    description: [
      'Minoxidil is a potassium channel opener and vasodilator that prolongs the anagen (growth) phase of hair follicles. It does not reduce DHT but improves follicle size and growth duration.',
      'Topical 5% minoxidil can increase hair density by ~10\u201320% over baseline in responders. Oral low-dose minoxidil is increasingly used off-label and may produce stronger results due to better systemic absorption.',
      'Shedding during the first 6\u20138 weeks is common and temporary. Consistency is critical \u2014 stopping leads to loss of gained hair.',
    ],
    bestSuitedFor: 'Adding density, especially at the crown.',
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    emoji: '🪡',
    color: '#F3E5F5',
    subtitle: 'Wound Healing + Growth Factor Activation',
    ratings: [
      { label: 'Effectiveness', value: '7.5\u20139/10', numericValue: 8.25, maxValue: 10 },
      { label: 'Mechanism Strength', value: '8/10', numericValue: 8, maxValue: 10 },
      { label: 'Side Effect Risk', value: '2/10', numericValue: 2, maxValue: 10 },
      { label: 'Ease of Use', value: '6/10', numericValue: 6, maxValue: 10 },
    ],
    description: [
      'Microneedling uses 0.5\u20131.5mm needles to create controlled micro-injuries in the scalp. This stimulates Wnt signaling, platelet-derived growth factors, and stem cell activation.',
      'A 2013 randomized study showed microneedling + minoxidil significantly outperformed minoxidil alone in hair count increase.',
      'It does not block DHT, so it works best combined with a DHT inhibitor.',
    ],
    bestSuitedFor: 'Enhancing other treatments and improving stubborn areas.',
  },
  {
    id: 'ketoconazole',
    name: 'Ketoconazole',
    emoji: '🧴',
    color: '#E8F5E9',
    subtitle: 'Nizoral Shampoo - Anti-Androgen + Anti-Inflammatory',
    ratings: [
      { label: 'Effectiveness', value: '5.5/10', numericValue: 5.5, maxValue: 10 },
      { label: 'Mechanism Strength', value: '5/10', numericValue: 5, maxValue: 10 },
      { label: 'Side Effect Risk', value: '1/10', numericValue: 1, maxValue: 10 },
      { label: 'Ease of Use', value: '9/10', numericValue: 9, maxValue: 10 },
    ],
    description: [
      'Ketoconazole is an antifungal with mild anti-androgenic properties. It reduces scalp inflammation and may slightly inhibit local DHT activity.',
      'Studies suggest it improves hair density modestly when used 2\u20133 times weekly. It is best used as part of a broader regimen ("Big 3" or "Big 4").',
    ],
    bestSuitedFor: 'Supporting treatment and improving scalp health.',
  },
  {
    id: 'rosemary-oil',
    name: 'Rosemary Oil',
    emoji: '🌿',
    color: '#E8F5E9',
    subtitle: 'Mild Growth Stimulation + Anti-Inflammatory',
    ratings: [
      { label: 'Effectiveness', value: '4.5/10', numericValue: 4.5, maxValue: 10 },
      { label: 'Mechanism Strength', value: '4/10', numericValue: 4, maxValue: 10 },
      { label: 'Side Effect Risk', value: '2/10', numericValue: 2, maxValue: 10 },
      { label: 'Ease of Use', value: '6/10', numericValue: 6, maxValue: 10 },
    ],
    description: [
      'Rosemary oil is often marketed as a "natural minoxidil." A small 2015 study showed similar hair count improvement to 2% minoxidil over 6 months. However, the study size was small and methodology limitations prevent strong conclusions.',
      'Mechanistically, rosemary may improve scalp circulation and reduce local inflammation. There is weak evidence it may mildly influence DHT activity, but not at clinically significant levels.',
      'It does not meaningfully suppress DHT \u2014 meaning it cannot stop genetic miniaturization on its own.',
    ],
    bestSuitedFor: 'Very early thinning or as a supportive scalp health treatment.',
  },
  {
    id: 'pumpkin-seed-oil',
    name: 'Pumpkin Seed Oil',
    emoji: '🎃',
    color: '#FFF8E1',
    subtitle: 'Mild 5-Alpha Reductase Inhibition',
    ratings: [
      { label: 'Effectiveness', value: '4/10', numericValue: 4, maxValue: 10 },
      { label: 'Mechanism Strength', value: '4/10', numericValue: 4, maxValue: 10 },
      { label: 'Side Effect Risk', value: '1/10', numericValue: 1, maxValue: 10 },
      { label: 'Ease of Use', value: '8/10', numericValue: 8, maxValue: 10 },
    ],
    description: [
      'A small randomized trial showed a 40% increase in hair count over 24 weeks with oral pumpkin seed oil. However, sample size was limited and replication is lacking.',
      'It may mildly inhibit 5-alpha reductase, but suppression is significantly weaker than finasteride.',
    ],
    bestSuitedFor: 'Early-stage thinning or those unwilling to use prescription DHT blockers.',
  },
  {
    id: 'scalp-massagers',
    name: 'Scalp Massagers',
    emoji: '✋',
    color: '#FCE4EC',
    subtitle: 'Mechanical Stimulation + Increased Blood Flow',
    ratings: [
      { label: 'Effectiveness', value: '3\u20135/10', numericValue: 4, maxValue: 10 },
      { label: 'Mechanism Strength', value: '4/10', numericValue: 4, maxValue: 10 },
      { label: 'Side Effect Risk', value: '1/10', numericValue: 1, maxValue: 10 },
      { label: 'Ease of Use', value: '9/10', numericValue: 9, maxValue: 10 },
    ],
    description: [
      'Manual scalp massage has limited but interesting data. A small 2016 study showed that 4 minutes of daily scalp massage increased hair thickness after 24 weeks, potentially via mechanical stimulation altering dermal papilla gene expression.',
      'Massagers increase blood flow temporarily, but androgenic alopecia is primarily driven by DHT sensitivity \u2014 not poor circulation.',
      'They may reduce scalp tension and fibrosis, which could theoretically support follicle health.',
    ],
    bestSuitedFor: 'Adjunct therapy alongside DHT suppression.',
  },
];

export function getTreatmentById(id: string): Treatment | undefined {
  return TREATMENTS.find((t) => t.id === id);
}
