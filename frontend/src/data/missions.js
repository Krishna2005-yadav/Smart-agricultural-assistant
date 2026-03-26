// AgriNova — Mission Stories Data (adapted from JourneyScape stories.js)

const missions = [
    {
        id: 'bridging-the-gap',
        title: 'Bridging the Gap',
        subtitle: 'How AI is transforming smallholder farming from guesswork to precision',
        coverImage: '/images/auth/cultivating.jpg',
        author: 'AgriNova Team',
        date: 'March 2026',
        readTime: '6 min read',
        category: 'Our Vision',
        content: [
            {
                type: 'paragraph',
                dropcap: true,
                text: 'Agriculture feeds the world, yet the farmers who grow our food often lack access to the simplest diagnostic tools. A smallholder farmer in rural India cannot send a leaf sample to a laboratory and wait three weeks for results. By then, the disease has spread across the field. The harvest is lost. The family goes without income.'
            },
            {
                type: 'image',
                src: '/images/auth/precision.jpg',
                caption: 'Precision agriculture — where technology meets tradition in the fields'
            },
            {
                type: 'paragraph',
                text: 'AgriNova was born from a simple observation: the same deep learning models that power facial recognition and self-driving cars can identify crop diseases from a single photograph. A convolutional neural network trained on thousands of labeled leaf images can detect Northern Leaf Blight, Common Rust, or Early Blight in seconds — with accuracy that matches trained plant pathologists.'
            },
            {
                type: 'quote',
                text: 'The best time to detect a crop disease is before the farmer can see it with the naked eye.',
                attribution: 'Plant Pathology Research, 2024'
            },
            {
                type: 'paragraph',
                text: 'Our platform puts this power directly into the hands of farmers. No expensive equipment. No laboratory visits. Just a smartphone camera and an internet connection. Upload a photo of a suspicious leaf, and within seconds, AgriNova returns a diagnosis, a confidence score, and actionable treatment recommendations tailored to the specific disease.'
            },
            {
                type: 'paragraph',
                text: 'But diagnosis is only the beginning. AgriNova also provides intelligent crop recommendations based on soil parameters, climate data, and historical yields. By combining disease detection with crop intelligence and nutrient planning, we are building a complete decision support system for modern agriculture.'
            }
        ]
    },
    {
        id: 'the-science-behind',
        title: 'The Science Behind the Screen',
        subtitle: 'Inside the CNN architecture that powers our disease detection engine',
        coverImage: '/images/auth/sustainable.jpg',
        author: 'AgriNova Team',
        date: 'February 2026',
        readTime: '8 min read',
        category: 'Technology',
        content: [
            {
                type: 'paragraph',
                dropcap: true,
                text: 'At the heart of AgriNova lies a Convolutional Neural Network trained on over 13,000 images of healthy and diseased crop leaves. The model architecture uses multiple convolutional layers to extract increasingly abstract features from raw pixel data — from edges and textures in the early layers to complex disease patterns in the deeper layers.'
            },
            {
                type: 'image',
                src: '/images/auth/cultivating.jpg',
                caption: 'Training data spans seven classes across corn and potato diseases'
            },
            {
                type: 'paragraph',
                text: 'The dataset encompasses seven distinct classes: four for corn (Cercospora Leaf Spot, Common Rust, Northern Leaf Blight, and Healthy) and three for potato (Early Blight, Late Blight, and Healthy). Each image is resized to 128x128 pixels and processed through the network as a three-channel RGB tensor.'
            },
            {
                type: 'quote',
                text: 'A single diseased leaf, photographed at the right moment, contains more diagnostic information than any verbal description could convey.',
                attribution: 'Deep Learning in Agriculture, 2025'
            },
            {
                type: 'paragraph',
                text: 'To prevent non-plant images from producing false diagnoses, we employ a dual-layer gatekeeper system. First, a MobileNetV2 model pre-trained on ImageNet classifies the uploaded image against 1,000 known categories. If the image is clearly non-agricultural — a car, a person, a screenshot — it is rejected before reaching the disease model. Second, a confidence threshold ensures that only high-certainty predictions are returned to the user.'
            },
            {
                type: 'paragraph',
                text: 'The crop recommendation engine uses a different approach entirely. A Random Forest classifier, trained on soil and climate parameters (nitrogen, phosphorus, potassium, temperature, humidity, pH, and rainfall), predicts the optimal crop from a selection of 22 varieties. The model achieves over 97% accuracy on held-out validation data.'
            }
        ]
    },
    {
        id: 'growing-forward',
        title: 'Growing Forward',
        subtitle: 'Our roadmap for sustainable, accessible agricultural technology',
        coverImage: '/images/auth/precision.jpg',
        author: 'AgriNova Team',
        date: 'January 2026',
        readTime: '5 min read',
        category: 'Roadmap',
        content: [
            {
                type: 'paragraph',
                dropcap: true,
                text: 'AgriNova is more than a disease detection tool. It is a platform designed to grow with the needs of modern agriculture. Our roadmap extends beyond the current capabilities to encompass real-time weather integration, satellite imagery analysis, and community-driven disease reporting that creates early warning networks across regions.'
            },
            {
                type: 'image',
                src: '/images/auth/sustainable.jpg',
                caption: 'Sustainable farming practices are at the core of our mission'
            },
            {
                type: 'paragraph',
                text: 'In the near term, we are expanding our disease model to cover additional crops — tomatoes, grapes, and rice are next in the pipeline. Each new crop requires thousands of labeled images and careful validation against expert diagnoses. We are partnering with agricultural universities to ensure our training data is diverse, representative, and free from systematic bias.'
            },
            {
                type: 'quote',
                text: 'Technology in agriculture should not replace the farmer\'s intuition. It should amplify it.',
                attribution: 'AgriNova Founding Principle'
            },
            {
                type: 'paragraph',
                text: 'Looking further ahead, we envision a world where every farmer, regardless of scale or geography, has access to the same quality of diagnostic and planning tools that industrial agriculture takes for granted. The gap between a thousand-acre corporate farm and a two-acre family plot should not be a gap in knowledge. AgriNova exists to close that gap.'
            }
        ]
    }
];

export default missions;
