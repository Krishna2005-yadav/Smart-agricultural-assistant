// AgriNova — Capabilities Data (adapted from JourneyScape continents.js)

const capabilities = [
    {
        name: 'Leaf Blight Detection',
        category: 'disease',
        location: 'Disease Detection',
        continent: 'Disease Detection',
        image: '/images/auth/precision.jpg', // landscape
        description: 'AI-powered identification of Northern Leaf Blight in corn. Our CNN model analyzes leaf patterns to detect cigar-shaped lesions with over 95% accuracy.',
        facts: ['CNN Model', '95%+ Accuracy', 'Real-time Analysis']
    },
    {
        name: 'Precision Irrigation',
        category: 'intelligence',
        location: 'Crop Intelligence',
        continent: 'Crop Intelligence',
        image: '/images/hero-bg.jpg', // horizontal
        description: 'Automated water management systems that factor in local weather patterns and soil moisture levels.',
        facts: ['IoT Enabled', 'Water Saving', 'Automation']
    },
    {
        name: 'Potato Late Blight Scanner',
        category: 'disease',
        location: 'Disease Detection',
        continent: 'Disease Detection',
        image: '/images/auth/sustainable.jpg', // landscape
        description: 'Identify water-soaked lesions and white fungal growth indicative of Late Blight. Critical for preventing rapid crop loss in potato fields.',
        facts: ['Rapid Detection', 'Fungal Analysis', 'Emergency Alerts']
    },
    {
        name: 'Arable Field Mapping',
        category: 'intelligence',
        location: 'Crop Intelligence',
        continent: 'Crop Intelligence',
        image: '/images/arable-farmlands.jpg', // horizontal
        description: 'High-resolution topographical field mapping for precise planting and variable rate application.',
        facts: ['Topography', 'Field Mapping', 'VRA Ready']
    },
    {
        name: 'Smart Crop Recommendation',
        category: 'intelligence',
        location: 'Crop Intelligence',
        continent: 'Crop Intelligence',
        image: '/images/intro-img.jpg', // very tall image
        description: 'Machine learning model that analyzes soil NPK levels, temperature, humidity, pH, and rainfall to recommend the optimal crop for your land.',
        facts: ['7 Parameters', '22 Crops', 'ML Powered']
    },
    {
        name: 'Soil Health Analysis',
        category: 'intelligence',
        location: 'Crop Intelligence',
        continent: 'Crop Intelligence',
        image: '/images/soil-restoration.jpg', // landscape
        description: 'Comprehensive soil nutrient profiling using nitrogen, phosphorus, and potassium readings to determine soil fertility and crop suitability.',
        facts: ['NPK Analysis', 'pH Mapping', 'Fertility Score']
    },
    {
        name: 'Common Rust Identification',
        category: 'disease',
        location: 'Disease Detection',
        continent: 'Disease Detection',
        image: '/images/auth/cultivating.jpg', // landscape
        description: 'Detect reddish-brown pustules characteristic of Common Rust in maize. Early detection enables targeted fungicide application.',
        facts: ['Early Warning', 'Pustule Detection', 'Treatment Plans']
    },
    {
        name: 'Controlled Greenhouse Tech',
        category: 'intelligence',
        location: 'Crop Intelligence',
        continent: 'Crop Intelligence',
        image: '/images/controlled-greenhouses.jpg', // landscape
        description: 'AI-driven climate control systems for high-density indoor greenhouse farming.',
        facts: ['Hydroponics', 'Climate Control', 'Indoor Sensing']
    },
    {
        name: 'Nutrient Deficiency Calculator',
        category: 'nutrients',
        location: 'Nutrient Plans',
        continent: 'Nutrient Plans',
        image: '/images/pastures.jpg', // landscape
        description: 'Calculate exact fertilizer requirements based on current soil nutrients vs. optimal levels for your chosen crop.',
        facts: ['Precise Dosing', 'Cost Effective', 'Eco-Friendly']
    },
];

const categories = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'disease', label: 'Disease Detection' },
    { id: 'intelligence', label: 'Crop Intelligence' },
    { id: 'nutrients', label: 'Nutrient Plans' },
];

export function getAllCapabilities() {
    return capabilities;
}

export function getCategories() {
    return categories;
}
