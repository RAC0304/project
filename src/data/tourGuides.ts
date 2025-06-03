import { TourGuide } from "../types";

export const tourGuides: TourGuide[] = [
  {
    id: "guide-001",
    name: "Adi Putra",
    specialties: ["cultural", "historical"],
    location: "Bali",
    description:
      "Adi is a knowledgeable guide with deep understanding of Balinese culture and traditions. With over 10 years of experience, he provides insightful tours of temples, ceremonies, and cultural sites throughout Bali.",
    shortBio:
      "Cultural expert specializing in Balinese traditions, rituals and historical sites",
    imageUrl:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian", "Balinese"],
    experience: 10,
    rating: 4.9,
    reviewCount: 127,
    contactInfo: {
      email: "adi.putra@wanderwise.example",
      phone: "+62812345678",
    },
    isVerified: true,
    availability: "Available year-round",
    tours: [
      {
        id: "tour-001",
        title: "Sacred Temples of Bali",
        description:
          "Visit the most sacred and beautiful temples in Bali, learning about their history and cultural significance.",
        duration: "8 hours",
        price: "IDR 750,000",
        maxGroupSize: 8,
      },
      {
        id: "tour-002",
        title: "Ubud Arts and Crafts",
        description:
          "Explore the artistic heart of Bali, meeting local artisans and visiting workshops.",
        duration: "6 hours",
        price: "IDR 600,000",
        maxGroupSize: 6,
      },
    ],
  },
  {
    id: "guide-002",
    name: "Maya Dewi",
    specialties: ["culinary", "cultural"],
    location: "Jakarta",
    description:
      "Maya specializes in culinary tours that introduce visitors to the rich and diverse food scene of Indonesia. Her tours blend food tasting with cultural insights, offering a delicious way to understand Indonesian heritage.",
    shortBio:
      "Culinary expert leading food adventures through Jakarta is vibrant street food scene.",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian", "Mandarin"],
    experience: 6,
    rating: 4.8,
    reviewCount: 98,
    contactInfo: {
      email: "maya.dewi@wanderwise.example",
    },
    isVerified: true,
    availability: "Available Monday-Saturday",
    tours: [
      {
        id: "tour-003",
        title: "Jakarta Street Food Safari",
        description:
          "Sample the best street food Jakarta has to offer, from savory to sweet.",
        duration: "4 hours",
        price: "IDR 500,000",
        maxGroupSize: 8,
      },
    ],
  },
  {
    id: "guide-003",
    name: "Rizal Hakim",
    specialties: ["adventure", "nature"],
    location: "Lombok",
    description:
      "An experienced trekking and outdoor adventure guide, Rizal leads expeditions to Mount Rinjani and other natural wonders of Lombok. His deep knowledge of local ecology and commitment to sustainable tourism make his tours both educational and responsible.",
    shortBio:
      "Adventure guide specializing in Mount Rinjani treks and Lombok is hidden waterfalls",
    imageUrl:
      "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian"],
    experience: 8,
    rating: 4.9,
    reviewCount: 156,
    contactInfo: {
      email: "rizal.hakim@wanderwise.example",
      phone: "+62823456789",
    },
    isVerified: true,
    availability: "Seasonal (April-October)",
    tours: [
      {
        id: "tour-004",
        title: "Mount Rinjani 3-Day Summit Trek",
        description:
          "Challenge yourself with this epic trek to the summit of Mount Rinjani, camping under the stars.",
        duration: "3 days",
        price: "IDR 3,500,000",
        maxGroupSize: 10,
      },
      {
        id: "tour-005",
        title: "Lombok Waterfall Circuit",
        description:
          "Visit the most beautiful waterfalls on Lombok, swimming in crystal clear pools along the way.",
        duration: "1 day",
        price: "IDR 800,000",
        maxGroupSize: 8,
      },
    ],
  },
  {
    id: "guide-004",
    name: "Siti Nuraini",
    specialties: ["historical", "cultural"],
    location: "Yogyakarta",
    description:
      "Siti is an expert on the rich history of Yogyakarta and its surroundings. Her tours of Borobudur, Prambanan, and the Sultan's Palace are filled with fascinating stories and little-known facts that bring these historical sites to life.",
    shortBio:
      "History expert focusing on Yogyakarta is UNESCO World Heritage sites",
    imageUrl:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian", "Japanese"],
    experience: 12,
    rating: 5.0,
    reviewCount: 203,
    contactInfo: {
      email: "siti.nuraini@wanderwise.example",
      phone: "+62834567890",
    },
    isVerified: true,
    availability: "Available year-round",
    tours: [
      {
        id: "tour-006",
        title: "Borobudur Sunrise & Prambanan Sunset",
        description:
          "Experience these magnificent temples at the most magical times of day.",
        duration: "12 hours",
        price: "IDR 900,000",
        maxGroupSize: 6,
      },
    ],
  },
  {
    id: "guide-005",
    name: "Wayan Dharma",
    specialties: ["diving", "nature"],
    location: "Raja Ampat",
    description:
      "A certified diving instructor with intimate knowledge of Raja Ampat's underwater treasures, Wayan leads diving expeditions to some of the most biodiverse marine environments on Earth. His passion for ocean conservation infuses all his tours.",
    shortBio:
      "PADI dive instructor showcasing Raja Ampat is world-class underwater ecosystems",
    imageUrl:
      "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian", "German"],
    experience: 9,
    rating: 4.8,
    reviewCount: 87,
    contactInfo: {
      email: "wayan.dharma@wanderwise.example",
    },
    isVerified: true,
    availability: "Available March-September",
    tours: [
      {
        id: "tour-007",
        title: "Raja Ampat Diving Safari",
        description:
          "A 5-day diving adventure to the best sites in Raja Ampat, suitable for advanced divers.",
        duration: "5 days",
        price: "IDR 12,000,000",
        maxGroupSize: 6,
      },
      {
        id: "tour-008",
        title: "Beginner's Dive Experience",
        description:
          "Introduction to diving in the calm, shallow reefs perfect for first-timers.",
        duration: "3 days",
        price: "IDR 8,000,000",
        maxGroupSize: 4,
      },
    ],
  },
  {
    id: "guide-006",
    name: "Eka Saputra",
    specialties: ["photography", "nature"],
    location: "Komodo National Park",
    description:
      "Combining his skills as a wildlife photographer and naturalist, Eka leads photo safaris through Komodo National Park. His tours are designed to help visitors capture amazing images of Komodo dragons and other wildlife while learning about conservation.",
    shortBio:
      "Wildlife photographer guiding photo tours of Komodo dragons and island landscapes",
    imageUrl:
      "https://images.unsplash.com/photo-1542513217-0b0eedf7005d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian"],
    experience: 7,
    rating: 4.7,
    reviewCount: 64,
    contactInfo: {
      email: "eka.saputra@wanderwise.example",
      phone: "+62845678901",
    },
    availability: "Available year-round",
    tours: [
      {
        id: "tour-009",
        title: "Komodo Photography Expedition",
        description:
          "A comprehensive tour for photographers wanting to capture Komodo dragons and the stunning landscapes.",
        duration: "4 days",
        price: "IDR 9,500,000",
        maxGroupSize: 6,
      },
    ],
    isVerified: true,
  },
  // Unverified Tour Guides
  {
    id: "guide-111",
    name: "Dewi Saraswati",
    specialties: ["cultural", "culinary"],
    location: "Yogyakarta",
    description:
      "Dewi offers immersive cultural tours focusing on Javanese traditions, art, and local cuisine. She specializes in connecting travelers with local families for authentic experiences.",
    shortBio:
      "Cultural and culinary expert with passion for authentic local experiences",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian", "Javanese"],
    experience: 3,
    rating: 4.7,
    reviewCount: 28,
    contactInfo: {
      email: "dewi.saraswati@wanderwise.example",
      phone: "+62876543210",
    },
    isVerified: false,
    availability: "Available weekdays",
    tours: [
      {
        id: "tour-501",
        title: "Javanese Cuisine Discovery",
        description:
          "Experience authentic Javanese cooking with local families and learn traditional recipes passed down through generations.",
        duration: "6 hours",
        price: "IDR 550,000",
        maxGroupSize: 6,
      },
      {
        id: "tour-502",
        title: "Borobudur Sunrise Tour",
        description:
          "Witness the magical sunrise at the UNESCO world heritage site Borobudur Temple followed by a local breakfast.",
        duration: "8 hours",
        price: "IDR 800,000",
        maxGroupSize: 8,
      },
    ],
  },
  {
    id: "guide-222",
    name: "Rama Wijaya",
    specialties: ["adventure", "nature"],
    location: "Lombok",
    description:
      "Passionate about showcasing the natural wonders of Lombok, Rama leads hiking, waterfall, and beach exploration tours with an emphasis on sustainability.",
    shortBio:
      "Adventure enthusiast focusing on sustainable nature exploration in Lombok",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian"],
    experience: 4,
    rating: 4.5,
    reviewCount: 32,
    contactInfo: {
      email: "rama.wijaya@wanderwise.example",
      phone: "+6287777123456",
    },
    isVerified: false,
    availability: "Available year-round",
    tours: [
      {
        id: "tour-601",
        title: "Rinjani Volcano Trekking",
        description:
          "Challenge yourself with a guided 3-day trek up Mount Rinjani, experiencing breathtaking views and camping under the stars.",
        duration: "3 days",
        price: "IDR 3,500,000",
        maxGroupSize: 10,
      },
    ],
  },
  {
    id: "guide-333",
    name: "Nina Hartono",
    specialties: ["photography", "cultural"],
    location: "Jakarta",
    description:
      "Nina combines her passion for photography with deep knowledge of Jakarta's hidden gems. Her tours focus on capturing the contrast between old and new Jakarta.",
    shortBio: "Photography expert showcasing Jakarta's diverse urban landscape",
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    languages: ["English", "Indonesian", "Mandarin"],
    experience: 2,
    rating: 4.3,
    reviewCount: 17,
    contactInfo: {
      email: "nina.hartono@wanderwise.example",
      phone: "+62812987654",
    },
    isVerified: false,
    availability: "Weekends only",
    tours: [
      {
        id: "tour-701",
        title: "Jakarta Photo Walk",
        description:
          "Explore Jakarta's most photogenic spots from Kota Tua to modern skyscrapers while improving your photography skills.",
        duration: "5 hours",
        price: "IDR 450,000",
        maxGroupSize: 8,
      },
    ],
  },
];
