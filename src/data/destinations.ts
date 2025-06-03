import { Destination, DestinationCategory } from "../types";

export const destinations: Destination[] = [
  {
    id: "bali",
    name: "Bali",
    location: "Bali, Indonesia",
    description:
      "Bali is a Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple. To the south, the beachside city of Kuta has lively bars, while Seminyak, Sanur and Nusa Dua are popular resort towns. The island is also known for its yoga and meditation retreats.",
    shortDescription:
      "Island of the Gods with pristine beaches, ancient temples, and lush rice terraces",
    imageUrl:
      "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
    images: [
      "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
      "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg",
      "https://images.pexels.com/photos/5766288/pexels-photo-5766288.jpeg",
      "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg",
    ],
    attractions: [
      {
        id: "bali-1",
        name: "Tanah Lot Temple",
        description: "Iconic sea temple perched on a rock formation",
        imageUrl:
          "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
      },
      {
        id: "bali-2",
        name: "Ubud Monkey Forest",
        description: "Natural sanctuary with over 700 monkeys",
        imageUrl:
          "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg",
      },
      {
        id: "bali-3",
        name: "Tegallalang Rice Terraces",
        description: "Stunning green stepped rice paddies in central Bali",
        imageUrl:
          "https://images.pexels.com/photos/5766288/pexels-photo-5766288.jpeg",
      },
      {
        id: "new-attraction-1",
        name: "Gunung Sibayak",
        description:
          "A majestic volcano in North Sumatra, perfect for sunrise hikes.",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/3/3e/Gunung_Sibayak.jpg",
      },
      {
        id: "new-attraction-2",
        name: "Kelimutu National Park",
        description:
          "Famous for its three color-changing crater lakes in Flores.",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/5/5e/Kelimutu.jpg",
      },
    ],
    activities: [
      {
        id: "bali-act-1",
        name: "Sunrise Mount Batur Hike",
        description:
          "Hike to the summit of Mount Batur to witness a breathtaking sunrise",
        duration: "6 hours",
        price: "$45",
        imageUrl:
          "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg",
      },
      {
        id: "bali-act-2",
        name: "Balinese Cooking Class",
        description:
          "Learn to cook traditional Balinese dishes with local ingredients",
        duration: "4 hours",
        price: "$35",
        imageUrl:
          "https://images.pexels.com/photos/5490956/pexels-photo-5490956.jpeg",
      },
      {
        id: "new-activity-1",
        name: "Surfing in Bali",
        description: "Catch the waves at Bali's world-famous beaches.",
        duration: "3 hours",
        price: "$50",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/6e/Surfing_in_Bali.jpg",
      },
      {
        id: "new-activity-2",
        name: "Cultural Tour in Toraja",
        description:
          "Explore the unique culture and traditional houses of Toraja in Sulawesi.",
        duration: "4 hours",
        price: "$40",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/8/8e/Toraja_House.jpg",
      },
    ],
    bestTimeToVisit: "April to October (dry season)",
    travelTips: [
      "Rent a scooter to explore the island at your own pace",
      "Always wear a sarong when visiting temples",
      "Bargain at local markets, but do so respectfully",
      "Try the local coffee, particularly the famous Luwak coffee",
    ],
    category: ["beach", "cultural", "nature"],
    googleMapsUrl: "https://www.google.com/maps?q=Bali,+Indonesia",
  },
  {
    id: "raja-ampat",
    name: "Raja Ampat",
    location: "West Papua, Indonesia",
    description:
      "Raja Ampat, or the Four Kings, is an archipelago comprising over 1,500 small islands, cays, and shoals. The archipelago is located off the northwest tip of Bird's Head Peninsula on the island of New Guinea, in Indonesia's West Papua province. Raja Ampat is known for its rich marine biodiversity and is a paradise for divers and snorkelers.",
    shortDescription:
      "Pristine archipelago with unparalleled marine biodiversity and stunning island landscapes",
    imageUrl:
      "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
    images: [
      "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
      "https://images.pexels.com/photos/3293148/pexels-photo-3293148.jpeg",
      "https://images.pexels.com/photos/4428629/pexels-photo-4428629.jpeg",
      "https://images.pexels.com/photos/4428599/pexels-photo-4428599.jpeg",
    ],
    attractions: [
      {
        id: "raja-1",
        name: "Wayag Island",
        description: "Iconic karst islands with panoramic viewpoints",
        imageUrl:
          "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
      },
      {
        id: "raja-2",
        name: "Kabui Bay",
        description: "Stunning bay with clear waters and limestone formations",
        imageUrl:
          "https://images.pexels.com/photos/3293148/pexels-photo-3293148.jpeg",
      },
    ],
    activities: [
      {
        id: "raja-act-1",
        name: "Scuba Diving",
        description:
          "Explore some of the most biodiverse coral reefs in the world",
        duration: "3-4 hours",
        price: "$70-100",
        imageUrl:
          "https://images.pexels.com/photos/4428629/pexels-photo-4428629.jpeg",
      },
      {
        id: "raja-act-2",
        name: "Island Hopping Tour",
        description: "Visit multiple islands and hidden beaches",
        duration: "Full day",
        price: "$60",
        imageUrl:
          "https://images.pexels.com/photos/4428599/pexels-photo-4428599.jpeg",
      },
    ],
    bestTimeToVisit: "October to April",
    travelTips: [
      "Book accommodations well in advance as options are limited",
      "Bring cash as ATMs are scarce",
      "Pack reef-safe sunscreen to protect the coral",
      "Prepare for limited internet connectivity",
    ],
    category: ["beach", "nature", "adventure"],
    googleMapsUrl: "https://www.google.com/maps?q=Raja+Ampat,+Indonesia",
  },
  {
    id: "borobudur",
    name: "Borobudur Temple",
    location: "Central Java, Indonesia",
    description:
      "Borobudur is a 9th-century Mahayana Buddhist temple in Central Java, Indonesia. It is the world's largest Buddhist temple. The temple consists of nine stacked platforms, six square and three circular, topped by a central dome. It is decorated with 2,672 relief panels and 504 Buddha statues.",
    shortDescription:
      "The world's largest Buddhist temple with intricate stone carvings and stunning views",
    imageUrl:
      "https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg",
    images: [
      "https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg",
      "https://images.pexels.com/photos/2765878/pexels-photo-2765878.jpeg",
      "https://images.pexels.com/photos/4611670/pexels-photo-4611670.jpeg",
    ],
    attractions: [
      {
        id: "borobudur-1",
        name: "Main Temple Structure",
        description:
          "Magnificent multi-tiered temple with intricate stone carvings",
        imageUrl:
          "https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg",
      },
      {
        id: "borobudur-2",
        name: "Stupas with Buddha Statues",
        description: "Iconic bell-shaped structures containing Buddha statues",
        imageUrl:
          "https://images.pexels.com/photos/2765878/pexels-photo-2765878.jpeg",
      },
      {
        id: "new-attraction-1",
        name: "New Attraction 1",
        description: "Description for new attraction 1.",
        imageUrl: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg", // Using existing image
      },
      {
        id: "new-attraction-2",
        name: "New Attraction 2",
        description: "Description for new attraction 2.",
        imageUrl: "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg", // Using existing image
      },
    ],
    activities: [
      {
        id: "borobudur-act-1",
        name: "Sunrise Tour",
        description: "Experience the temple at dawn with magical lighting",
        duration: "3 hours",
        price: "$40",
        imageUrl:
          "https://images.pexels.com/photos/4611670/pexels-photo-4611670.jpeg",
      },
      {
        id: "borobudur-act-2",
        name: "Cultural Tour with Local Guide",
        description: "Learn about the history and symbolism of the temple",
        duration: "2 hours",
        price: "$25",
        imageUrl:
          "https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg",
      },
      {
        id: "new-activity-1",
        name: "New Activity 1",
        description: "Description for new activity 1.",
        duration: "2 hours",
        price: "$20",
        imageUrl: "https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg", // Using existing image
        style: { width: "100%", height: "200px", objectFit: "cover" },
      },
      {
        id: "new-activity-2",
        name: "New Activity 2",
        description: "Description for new activity 2.",
        duration: "3 hours",
        price: "$30",
        imageUrl: "https://images.pexels.com/photos/5490956/pexels-photo-5490956.jpeg", // Using existing image
        style: { width: "100%", height: "200px", objectFit: "cover" },
      },
    ],
    bestTimeToVisit: "May to September",
    travelTips: [
      "Visit early morning to avoid crowds and heat",
      "Wear comfortable shoes as there is a lot of walking and climbing",
      "Dress modestly as it is a religious site",
      "Consider hiring a guide to understand the symbolism and history",
    ],
    category: ["cultural", "historical"],
    googleMapsUrl:
      "https://www.google.com/maps?q=Borobudur+Temple,+Central+Java,+Indonesia",
  },
  {
    id: "komodo",
    name: "Komodo National Park",
    location: "East Nusa Tenggara, Indonesia",
    description:
      "Komodo National Park is a UNESCO World Heritage site comprising three larger islands (Komodo, Rinca and Padar) and numerous smaller ones. The park was founded to protect the Komodo dragon, the world's largest lizard. The national park encompasses a marine area with pristine coral reefs, making it a popular destination for diving and snorkeling.",
    shortDescription:
      "Home to the legendary Komodo dragons, pristine beaches, and world-class diving spots",
    imageUrl:
      "https://images.pexels.com/photos/7715004/pexels-photo-7715004.jpeg",
    images: [
      "https://images.pexels.com/photos/7715004/pexels-photo-7715004.jpeg",
      "https://images.pexels.com/photos/7715003/pexels-photo-7715003.jpeg",
      "https://images.pexels.com/photos/3119775/pexels-photo-3119775.jpeg",
    ],
    attractions: [
      {
        id: "komodo-1",
        name: "Komodo Dragons",
        description: "The world's largest lizards in their natural habitat",
        imageUrl:
          "https://images.pexels.com/photos/7715004/pexels-photo-7715004.jpeg",
      },
      {
        id: "komodo-2",
        name: "Pink Beach",
        description: "Rare pink-hued beach created by red coral fragments",
        imageUrl:
          "https://images.pexels.com/photos/7715003/pexels-photo-7715003.jpeg",
      },
      {
        id: "komodo-3",
        name: "Padar Island Viewpoint",
        description:
          "Iconic viewpoint overlooking three differently colored beaches",
        imageUrl:
          "https://images.pexels.com/photos/3119775/pexels-photo-3119775.jpeg",
      },
    ],
    activities: [
      {
        id: "komodo-act-1",
        name: "Komodo Dragon Trek",
        description: "Guided trek to see Komodo dragons with a ranger",
        duration: "2-3 hours",
        price: "$30",
        imageUrl:
          "https://images.pexels.com/photos/7715004/pexels-photo-7715004.jpeg",
      },
      {
        id: "komodo-act-2",
        name: "Diving Trip",
        description: "Explore vibrant coral reefs and rich marine life",
        duration: "Half day",
        price: "$80",
        imageUrl:
          "https://images.pexels.com/photos/7715003/pexels-photo-7715003.jpeg",
      },
    ],
    bestTimeToVisit: "April to December",
    travelTips: [
      "Always stay with your guide when trekking to see Komodo dragons",
      "Bring enough water as the climate is hot and dry",
      "Book accommodations on Labuan Bajo (gateway to the park)",
      "Consider multi-day boat tours to fully experience the area",
    ],
    category: ["nature", "adventure", "beach"],
    googleMapsUrl:
      "https://www.google.com/maps?q=Komodo+National+Park,+East+Nusa+Tenggara,+Indonesia",
  },
  {
    id: "yogyakarta",
    name: "Yogyakarta",
    location: "Central Java, Indonesia",
    description:
      "Yogyakarta (often called \"Jogja\") is a city on the Indonesian island of Java known for its traditional arts and cultural heritage. It's also a popular base to visit nearby ancient temples, including Borobudur and Prambanan. The city is the seat of the still-functioning Yogyakarta Sultanate, and the sultan's palace (known as the Kraton) is a living museum of Javanese culture.",
    shortDescription:
      "Cultural heart of Java with royal heritage, traditional arts, and ancient temples",
    imageUrl:
      "https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg",
    images: [
      "https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg",
      "https://images.pexels.com/photos/2873277/pexels-photo-2873277.jpeg",
      "https://images.pexels.com/photos/7968249/pexels-photo-7968249.jpeg",
    ],
    attractions: [
      {
        id: "yogya-1",
        name: "Kraton (Sultan's Palace)",
        description:
          "The royal residence of the Sultan with traditional architecture",
        imageUrl:
          "https://images.pexels.com/photos/2873277/pexels-photo-2873277.jpeg",
      },
      {
        id: "yogya-2",
        name: "Prambanan Temple",
        description: "9th-century Hindu temple compound with towering spires",
        imageUrl:
          "https://images.pexels.com/photos/7968249/pexels-photo-7968249.jpeg",
      },
    ],
    activities: [
      {
        id: "yogya-act-1",
        name: "Batik Workshop",
        description: "Learn the traditional Javanese art of batik making",
        duration: "3 hours",
        price: "$20",
        imageUrl:
          "https://images.pexels.com/photos/2873277/pexels-photo-2873277.jpeg",
      },
      {
        id: "yogya-act-2",
        name: "Ramayana Ballet Performance",
        description:
          "Traditional dance performance with Prambanan temple as backdrop",
        duration: "2 hours",
        price: "$30",
        imageUrl:
          "https://images.pexels.com/photos/7968249/pexels-photo-7968249.jpeg",
      },
    ],
    bestTimeToVisit: "June to September",
    travelTips: [
      "Explore the city by foot or rent a bicycle",
      "Try the local specialty Gudeg (young jackfruit stew)",
      "Visit Malioboro Street for shopping and street food",
      "Consider hiring a local guide for temple visits",
    ],
    category: ["cultural", "historical", "city"],
    googleMapsUrl:
      "https://www.google.com/maps?q=Yogyakarta,+Central+Java,+Indonesia",
  },
];

export const getDestinationById = (id: string): Destination | undefined => {
  return destinations.find((destination) => destination.id === id);
};

export const getDestinationsByCategory = (
  category: DestinationCategory
): Destination[] => {
  return destinations.filter((destination) =>
    destination.category.includes(category)
  );
};
