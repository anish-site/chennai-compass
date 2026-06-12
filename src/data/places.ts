export type Category =
  | 'Cafés'
  | 'Beaches'
  | 'Food'
  | 'Heritage'
  | 'Shopping'
  | 'Hangouts'
  | 'Day Trips';

export type Price = 'Free' | '₹' | '₹₹' | '₹₹₹';
export type Vibe = 'Date spot' | 'Group hangout' | 'Solo / study' | 'Family';
export type BestTime = 'Morning' | 'Evening' | 'Night';
export type Setting = 'Indoor' | 'Outdoor';

export interface Place {
  id: string;
  name: string;
  category: Category;
  area: string;
  description: string;
  price: Price;
  vibes: Vibe[];
  bestTime: BestTime[];
  setting: Setting;
  tags: string[];
  /** Nearest public transport — any subset; shown on the postcard. */
  transit?: {
    /** Chennai Metro station */
    metro?: string;
    /** Suburban / MRTS station */
    rail?: string;
    /** Bus stop */
    bus?: string;
  };
  /** Override for the Google search query when the name alone is ambiguous. */
  googleQuery?: string;
  /** True for places recommended by friends via the Google Sheet. */
  community?: boolean;
  /** Location, for "near me" distance sorting. */
  coords?: { lat: number; lng: number };
  /** Straight-line distance from the visitor, injected at runtime when location is on. */
  distanceKm?: number;
}

export const CATEGORIES: Category[] = [
  'Cafés',
  'Beaches',
  'Food',
  'Heritage',
  'Shopping',
  'Hangouts',
  'Day Trips',
];

export const VIBES: Vibe[] = ['Date spot', 'Group hangout', 'Solo / study', 'Family'];
export const BEST_TIMES: BestTime[] = ['Morning', 'Evening', 'Night'];
export const SETTINGS: Setting[] = ['Indoor', 'Outdoor'];

/** Stamp emoji + accent colour for each category — drives the postcard look. */
export const CATEGORY_META: Record<Category, { emoji: string; accent: string }> = {
  'Cafés': { emoji: '☕', accent: '#8c5a3c' },
  Beaches: { emoji: '🌊', accent: '#0e7c7b' },
  Food: { emoji: '🍛', accent: '#e4501b' },
  Heritage: { emoji: '🛕', accent: '#a4243b' },
  Shopping: { emoji: '🛍️', accent: '#c2185b' },
  Hangouts: { emoji: '🌳', accent: '#3e7c2f' },
  'Day Trips': { emoji: '🚌', accent: '#2d6cb5' },
};

// ✏️ This is YOUR guide — edit freely. Add a place, change a description.
// Every field here drives the app automatically.
export const places: Place[] = [
  {
    id: 'marina-beach',
    name: 'Marina Beach',
    category: 'Beaches',
    area: 'Marina',
    description:
      "The second-longest urban beach in the world, but for us it's sundal, bajji and a sea breeze that fixes any bad day. Come for the 6am sunrise once — you'll thank me.",
    price: 'Free',
    vibes: ['Group hangout', 'Family'],
    bestTime: ['Morning', 'Evening', 'Night'],
    setting: 'Outdoor',
    tags: ['sunrise', 'sundal', 'walks'],
    transit: { rail: 'Light House MRTS', bus: 'Kannagi Statue / Marina' },
    coords: { lat: 13.05, lng: 80.2824 },
  },
  {
    id: 'bessie-beach',
    name: "Besant Nagar Beach (Bessie)",
    category: 'Beaches',
    area: 'Besant Nagar',
    description:
      'The cooler, younger sibling of Marina. Murugan idli on one end, cute cafés on the other, and the best people-watching in the city in between.',
    price: 'Free',
    vibes: ['Date spot', 'Group hangout'],
    bestTime: ['Evening', 'Night'],
    setting: 'Outdoor',
    tags: ['sunset', 'street food', 'chill'],
    googleQuery: 'Elliots Beach Besant Nagar Chennai',
    transit: { rail: 'Thiruvanmiyur MRTS', bus: 'Besant Nagar Terminus' },
    coords: { lat: 13.0003, lng: 80.2718 },
  },
  {
    id: 'kasimedu',
    name: 'Kasimedu Fishing Harbour',
    category: 'Hangouts',
    area: 'Royapuram',
    description:
      'Wake up stupidly early once and watch hundreds of boats come in with the catch. The sunrise here is unreal, and the fish auction is pure chaos in the best way.',
    price: 'Free',
    vibes: ['Solo / study', 'Group hangout'],
    bestTime: ['Morning'],
    setting: 'Outdoor',
    tags: ['sunrise', 'boats', 'photography'],
    transit: { metro: 'Sir Theagaraya College', rail: 'Royapuram', bus: 'Kasimedu' },
    coords: { lat: 13.1262, lng: 80.2931 },
  },
  {
    id: 'broken-bridge',
    name: 'Broken Bridge',
    category: 'Hangouts',
    area: 'Adyar',
    description:
      'An abandoned bridge over the Adyar estuary that just… stops midway. Weirdly cinematic at golden hour — half of Tamil cinema has shot here. Go before sunset.',
    price: 'Free',
    vibes: ['Date spot', 'Solo / study'],
    bestTime: ['Evening'],
    setting: 'Outdoor',
    tags: ['golden hour', 'photography', 'offbeat'],
    transit: { rail: 'Indira Nagar MRTS', bus: 'Urur Kuppam' },
    coords: { lat: 13.0095, lng: 80.2745 },
  },
  {
    id: 'kapaleeshwarar',
    name: 'Kapaleeshwarar Temple',
    category: 'Heritage',
    area: 'Mylapore',
    description:
      "A 7th-century Dravidian gopuram in full technicolor. Even if you're not religious, the energy around the temple tank during Mylapore evenings is something else.",
    price: 'Free',
    vibes: ['Family', 'Solo / study'],
    bestTime: ['Morning', 'Evening'],
    setting: 'Outdoor',
    tags: ['gopuram', 'architecture', 'mylapore'],
    transit: { rail: 'Thirumayilai MRTS', bus: 'Mylapore Tank' },
    coords: { lat: 13.0337, lng: 80.2698 },
  },
  {
    id: 'santhome',
    name: 'San Thome Basilica',
    category: 'Heritage',
    area: 'Santhome',
    description:
      'A gleaming white neo-Gothic basilica built over the tomb of St. Thomas the Apostle — one of only three such churches in the world. Quiet, cool and stunning inside.',
    price: 'Free',
    vibes: ['Family', 'Solo / study'],
    bestTime: ['Morning'],
    setting: 'Indoor',
    tags: ['gothic', 'history', 'architecture'],
    transit: { rail: 'Thirumayilai MRTS', bus: 'Santhome Church' },
    coords: { lat: 13.0336, lng: 80.2787 },
  },
  {
    id: 'fort-st-george',
    name: 'Fort St. George',
    category: 'Heritage',
    area: 'George Town',
    description:
      "Where the city began in 1644 — the first British fort in India. The museum inside has cannons, coins and creaky colonial portraits. Peak 'history class but make it fun'.",
    price: '₹',
    vibes: ['Family', 'Solo / study'],
    bestTime: ['Morning'],
    setting: 'Indoor',
    tags: ['history', 'museum', 'colonial'],
    transit: { metro: 'High Court', rail: 'Chennai Fort', bus: 'Secretariat' },
    coords: { lat: 13.0796, lng: 80.2875 },
  },
  {
    id: 'egmore-museum',
    name: 'Government Museum Egmore',
    category: 'Heritage',
    area: 'Egmore',
    description:
      'The second-oldest museum in India, with a bronze gallery that will make you stare at Chola Natarajas for an hour. The red Indo-Saracenic buildings are a vibe by themselves.',
    price: '₹',
    vibes: ['Solo / study', 'Family'],
    bestTime: ['Morning'],
    setting: 'Indoor',
    tags: ['bronzes', 'museum', 'architecture'],
    transit: { metro: 'Egmore', rail: 'Chennai Egmore', bus: 'Egmore Museum' },
    coords: { lat: 13.071, lng: 80.2572 },
  },
  {
    id: 'dakshinachitra',
    name: 'DakshinaChitra',
    category: 'Heritage',
    area: 'ECR · Muttukadu',
    description:
      'A living museum of real, transplanted homes from across South India. Pottery wheels, weaving demos, art workshops — easily the best ₹-for-culture deal on ECR.',
    price: '₹₹',
    vibes: ['Family', 'Date spot'],
    bestTime: ['Morning'],
    setting: 'Outdoor',
    tags: ['culture', 'crafts', 'ecr'],
    transit: { bus: 'DakshinaChitra (ECR buses)' },
    coords: { lat: 12.8704, lng: 80.2421 },
  },
  {
    id: 'cholamandal',
    name: "Cholamandal Artists' Village",
    category: 'Heritage',
    area: 'Injambakkam',
    description:
      "India's largest self-supporting artists' commune, founded in 1966. Sculpture gardens, galleries and total silence — my go-to when the city gets too loud.",
    price: '₹',
    vibes: ['Solo / study', 'Date spot'],
    bestTime: ['Morning', 'Evening'],
    setting: 'Outdoor',
    tags: ['art', 'quiet', 'galleries'],
    transit: { bus: 'Injambakkam (ECR buses)' },
    coords: { lat: 12.9446, lng: 80.2563 },
  },
  {
    id: 'amethyst',
    name: 'Amethyst Café',
    category: 'Cafés',
    area: 'Royapettah',
    description:
      'A colonial bungalow wrapped in a tropical garden. Pricey, yes — but sitting on that verandah with an iced tea feels like a mini vacation from college life.',
    price: '₹₹₹',
    vibes: ['Date spot', 'Family'],
    bestTime: ['Evening'],
    setting: 'Outdoor',
    tags: ['garden', 'aesthetic', 'iced tea'],
    transit: { metro: 'Thousand Lights', bus: 'Royapettah Hospital' },
    coords: { lat: 13.056, lng: 80.265 },
  },
  {
    id: 'writers-cafe',
    name: "Writer's Café",
    category: 'Cafés',
    area: 'Royapettah',
    description:
      'A café + bookstore where the kitchen is run by survivors rebuilding their lives. Great pasta, better cause, and the quietest corner in town to finish an assignment.',
    price: '₹₹',
    vibes: ['Solo / study', 'Date spot'],
    bestTime: ['Evening'],
    setting: 'Indoor',
    tags: ['books', 'study spot', 'wifi'],
    transit: { metro: 'Thousand Lights', bus: 'Royapettah' },
    coords: { lat: 13.0525, lng: 80.259 },
  },
  {
    id: 'ciclo',
    name: 'Ciclo Café',
    category: 'Cafés',
    area: 'Kotturpuram',
    description:
      'Bicycles hanging from the ceiling, big tables, and waffles that justify the trip. Perfect for group project meetings that turn into three-hour hangouts.',
    price: '₹₹',
    vibes: ['Group hangout', 'Solo / study'],
    bestTime: ['Evening'],
    setting: 'Indoor',
    tags: ['waffles', 'group tables', 'quirky'],
    transit: { rail: 'Kotturpuram MRTS', bus: 'Kotturpuram' },
    coords: { lat: 13.0163, lng: 80.2425 },
  },
  {
    id: 'chamiers',
    name: 'Chamiers Café',
    category: 'Cafés',
    area: 'R.A. Puram',
    description:
      'Old-school Chennai charm above a boutique store. Their breakfast and cheesecake are legendary among people who pretend they discovered it first.',
    price: '₹₹₹',
    vibes: ['Date spot', 'Family'],
    bestTime: ['Morning'],
    setting: 'Indoor',
    tags: ['breakfast', 'cheesecake', 'classic'],
    transit: { rail: 'Greenways Road MRTS', bus: 'Chamiers Road' },
    coords: { lat: 13.0277, lng: 80.2546 },
  },
  {
    id: 'murugan-idli',
    name: 'Murugan Idli Shop',
    category: 'Food',
    area: 'T. Nagar',
    description:
      'Idlis so soft they should be illegal, podi that goes on everything, and jigarthanda to finish. The default answer to "semma pasikudhu, enga poalam?"',
    price: '₹',
    vibes: ['Family', 'Group hangout'],
    bestTime: ['Morning', 'Night'],
    setting: 'Indoor',
    tags: ['idli', 'jigarthanda', 'budget'],
    transit: { rail: 'Mambalam', bus: 'Panagal Park' },
    coords: { lat: 13.0424, lng: 80.2336 },
  },
  {
    id: 'ratna-cafe',
    name: 'Ratna Café',
    category: 'Food',
    area: 'Triplicane',
    description:
      'Since 1948, they have been drowning idlis in a tumbler of sambar — and that is exactly how it should be. Loud, fast, unbeatable.',
    price: '₹',
    vibes: ['Solo / study', 'Family'],
    bestTime: ['Morning'],
    setting: 'Indoor',
    tags: ['sambar idli', 'legacy', 'budget'],
    transit: { rail: 'Chepauk MRTS', bus: 'Ice House' },
    coords: { lat: 13.0565, lng: 80.2762 },
  },
  {
    id: 'buhari',
    name: 'Buhari Hotel',
    category: 'Food',
    area: 'Anna Salai',
    description:
      'The restaurant that invented Chicken 65 in 1965. Come for the history, stay for the biryani. A late-night Chennai institution.',
    price: '₹₹',
    vibes: ['Group hangout', 'Family'],
    bestTime: ['Night'],
    setting: 'Indoor',
    tags: ['chicken 65', 'biryani', 'late night'],
    transit: { metro: 'LIC', bus: 'Anna Salai (LIC)' },
    coords: { lat: 13.0608, lng: 80.2647 },
  },
  {
    id: 'sowcarpet',
    name: 'Sowcarpet Street Food Crawl',
    category: 'Food',
    area: 'George Town',
    description:
      "Chennai's mini North India — kachoris, chaats, badam milk and kulfi in lanes barely two people wide. Go hungry, go with friends, go before you graduate.",
    price: '₹',
    vibes: ['Group hangout'],
    bestTime: ['Evening', 'Night'],
    setting: 'Outdoor',
    tags: ['chaat', 'kulfi', 'street food'],
    googleQuery: 'Sowcarpet street food Chennai',
    transit: { metro: 'High Court', rail: 'Chennai Park', bus: 'Mint' },
    coords: { lat: 13.09, lng: 80.278 },
  },
  {
    id: 'jannal-kadai',
    name: 'Jannal Kadai',
    category: 'Food',
    area: 'Mylapore',
    description:
      'A literal window in a wall near Kapaleeshwarar temple serving bajjis and bondas since forever. Blink and you will miss it; smell and you will not.',
    price: '₹',
    vibes: ['Solo / study', 'Group hangout'],
    bestTime: ['Morning', 'Evening'],
    setting: 'Outdoor',
    tags: ['bajji', 'hidden gem', 'mylapore'],
    googleQuery: 'Jannal Kadai Mylapore Chennai',
    transit: { rail: 'Thirumayilai MRTS', bus: 'Mylapore Tank' },
    coords: { lat: 13.034, lng: 80.269 },
  },
  {
    id: 'pondy-bazaar',
    name: 'Pondy Bazaar',
    category: 'Shopping',
    area: 'T. Nagar',
    description:
      'The pedestrian plaza is great, but the real sport is bargaining for shoes, earrings and tees at one-tenth of mall prices. Cardio included.',
    price: '₹',
    vibes: ['Group hangout', 'Family'],
    bestTime: ['Evening'],
    setting: 'Outdoor',
    tags: ['bargains', 'street shopping', 'snacks'],
    transit: { rail: 'Mambalam', bus: 'Panagal Park' },
    coords: { lat: 13.0399, lng: 80.2349 },
  },
  {
    id: 'phoenix',
    name: 'Phoenix MarketCity',
    category: 'Shopping',
    area: 'Velachery',
    description:
      'The default "it is too hot, let us go somewhere with AC" plan. Movies, food court, arcade — a whole day disappears here without you noticing.',
    price: '₹₹₹',
    vibes: ['Group hangout', 'Date spot'],
    bestTime: ['Evening', 'Night'],
    setting: 'Indoor',
    tags: ['mall', 'movies', 'arcade'],
    transit: { rail: 'Velachery MRTS', bus: 'Phoenix Mall' },
    coords: { lat: 12.9941, lng: 80.2181 },
  },
  {
    id: 'semmozhi',
    name: 'Semmozhi Poonga',
    category: 'Hangouts',
    area: 'Teynampet',
    description:
      'A 20-acre botanical garden hiding in the middle of the city. Twenty rupees buys you bonsai gardens, a canopy walk and the cheapest peace of mind in Chennai.',
    price: '₹',
    vibes: ['Date spot', 'Family'],
    bestTime: ['Morning', 'Evening'],
    setting: 'Outdoor',
    tags: ['garden', 'walks', 'budget'],
    transit: { metro: 'Teynampet', bus: 'Semmozhi Poonga' },
    coords: { lat: 13.0531, lng: 80.2503 },
  },
  {
    id: 'theosophical',
    name: 'Theosophical Society',
    category: 'Hangouts',
    area: 'Adyar',
    description:
      'Home to a 450-year-old banyan tree and absolute silence on 260 acres by the river. Entry is restricted to certain hours — check before you go. Worth it.',
    price: 'Free',
    vibes: ['Solo / study'],
    bestTime: ['Morning'],
    setting: 'Outdoor',
    tags: ['banyan tree', 'quiet', 'nature'],
    transit: { rail: 'Greenways Road MRTS', bus: 'Adyar Depot' },
    coords: { lat: 13.011, lng: 80.259 },
  },
  {
    id: 'mahabalipuram',
    name: 'Mahabalipuram',
    category: 'Day Trips',
    area: 'ECR · 55 km',
    description:
      "A UNESCO site an hour down ECR: the Shore Temple, Krishna's Butter Ball, and cliffs carved 1300 years ago. The classic Chennai day trip for a reason.",
    price: '₹',
    vibes: ['Group hangout', 'Date spot', 'Family'],
    bestTime: ['Morning'],
    setting: 'Outdoor',
    tags: ['unesco', 'shore temple', 'road trip'],
    transit: { bus: 'Mamallapuram Bus Stand (588)' },
    coords: { lat: 12.6208, lng: 80.1945 },
  },
  {
    id: 'muttukadu',
    name: 'Muttukadu Boat House',
    category: 'Day Trips',
    area: 'ECR · Muttukadu',
    description:
      'Backwater boating 30 minutes from the city — rowboats, speedboats and that one friend who will definitely rock the boat. Combine with DakshinaChitra for a full ECR day.',
    price: '₹₹',
    vibes: ['Group hangout', 'Date spot'],
    bestTime: ['Morning', 'Evening'],
    setting: 'Outdoor',
    tags: ['boating', 'backwaters', 'ecr'],
    transit: { bus: 'Muttukadu Boat House (ECR buses)' },
    coords: { lat: 12.8124, lng: 80.2418 },
  },
  {
    id: 'pulicat',
    name: 'Pulicat Lake',
    category: 'Day Trips',
    area: 'North · 60 km',
    description:
      "India's second-largest brackish lagoon. Between October and March, thousands of flamingos turn the horizon pink. Carry sunscreen and a good playlist for the drive.",
    price: '₹₹',
    vibes: ['Group hangout', 'Solo / study'],
    bestTime: ['Morning'],
    setting: 'Outdoor',
    tags: ['flamingos', 'birding', 'road trip'],
    transit: { rail: 'Ponneri (then share-auto)', bus: 'Pulicat (from Ponneri)' },
    coords: { lat: 13.416, lng: 80.316 },
  },
];
