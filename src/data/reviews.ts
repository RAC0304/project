import { Review } from "../types";

export const reviews: Review[] = [
  {
    id: "1",
    destinationId: "bali",
    userId: "user1",
    userName: "Sarah Johnson",
    userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    title: "Magical Experience in Bali",
    content:
      "Our trip to Bali was absolutely incredible. The beaches were pristine, the locals were friendly, and our guide showed us hidden gems we would never have found on our own. The temples were breathtaking, especially at sunset!",
    date: "2025-04-15",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
      "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
    ],
    helpfulCount: 42,
    tags: ["beach", "cultural", "temple"],
  },
  {
    id: "2",
    destinationId: "jakarta",
    userId: "user2",
    userName: "Michael Chen",
    userAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 4,
    title: "Jakarta: A City of Contrasts",
    content:
      "Jakarta offers an interesting blend of modern skyscrapers and historical sites. The traffic is challenging but the food scene is exceptional. Make sure to visit the National Monument and old Batavia area. Our guide was very knowledgeable about the city's history.",
    date: "2025-03-22",
    images: ["https://images.unsplash.com/photo-1555899434-94d1368aa7af"],
    helpfulCount: 18,
    tags: ["city", "food", "history"],
  },
  {
    id: "3",
    destinationId: "yogyakarta",
    userId: "user3",
    userName: "Emma Wilson",
    userAvatar: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 5,
    title: "Yogyakarta is Rich Cultural Heritage",
    content:
      "Borobudur at sunrise was a life-changing experience. The city is artistic soul is evident everywhere you go. We loved the batik workshops and traditional dance performances. Our accommodations were comfortable and the local cuisine was delicious.",
    date: "2025-04-02",
    images: [
      "https://images.unsplash.com/photo-1584810359583-96fc3448beaa",
      "https://images.unsplash.com/photo-1551018612-9715965c6742",
      "https://images.unsplash.com/photo-1583417319225-97dbbc5ee875",
    ],
    helpfulCount: 31,
    tags: ["cultural", "temple", "art"],
  },
  {
    id: "4",
    destinationId: "lombok",
    userId: "user4",
    userName: "David Rodriguez",
    userAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 4,
    title: "Lombok: Bali is Beautiful Neighbor",
    content:
      "Lombok offers stunning beaches without the crowds of Bali. We trekked Mount Rinjani which was challenging but totally worth it for the views. The Gili Islands were perfect for snorkeling and relaxation. Highly recommend the seafood barbecues on the beach!",
    date: "2025-02-18",
    images: [
      "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea",
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f",
    ],
    helpfulCount: 27,
    tags: ["beach", "mountain", "adventure"],
  },
  {
    id: "5",
    destinationId: "raja-ampat",
    userId: "user5",
    userName: "Olivia Taylor",
    userAvatar: "https://randomuser.me/api/portraits/women/29.jpg",
    rating: 5,
    title: "Raja Ampat: Underwater Paradise",
    content:
      "The diving in Raja Ampat exceeded all expectations. The marine biodiversity is unmatched anywhere in the world. Yes, it is remote and takes effort to reach, but that is part of what keeps it so pristine. Our liveaboard experience was comfortable and the crew was amazing.",
    date: "2025-03-05",
    images: [
      "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf",
      "https://images.unsplash.com/photo-1586500038052-b3d4b339b9c6",
    ],
    helpfulCount: 39,
    tags: ["beach", "diving", "nature"],
  },
  {
    id: "6",
    destinationId: "komodo",
    userId: "user6",
    userName: "James Peterson",
    userAvatar: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 5,
    title: "Face to Face with Dragons in Komodo",
    content:
      "Seeing Komodo dragons in their natural habitat was an incredible experience. The pink beach was also stunning. The boat tour around the islands offered amazing snorkeling opportunities. Our guide was extremely knowledgeable about the wildlife and ecosystem.",
    date: "2025-01-20",
    images: ["https://images.unsplash.com/photo-1592364395653-83e648b20cc2"],
    helpfulCount: 35,
    tags: ["adventure", "wildlife", "island"],
  },
  {
    id: "7",
    destinationId: "bromo",
    userId: "user7",
    userName: "Sophia Lee",
    userAvatar: "https://randomuser.me/api/portraits/women/76.jpg",
    rating: 4,
    title: "Otherworldly Landscapes at Mount Bromo",
    content:
      "The sunrise viewpoint over Mount Bromo felt like being on another planet. The early wake-up call was tough but absolutely worth it. The horseback ride through the sea of sand was fun, but be prepared for dust. Bring warm clothes as it gets very cold in the early morning!",
    date: "2025-02-27",
    images: [
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272",
      "https://images.unsplash.com/photo-1580181465362-432ce01bef40",
    ],
    helpfulCount: 24,
    tags: ["mountain", "adventure", "nature"],
  },
  {
    id: "8",
    destinationId: "toba",
    userId: "user8",
    userName: "Daniel Kim",
    userAvatar: "https://randomuser.me/api/portraits/men/33.jpg",
    rating: 4,
    title: "Peaceful Retreat at Lake Toba",
    content:
      "Lake Toba is tranquil and beautiful. Samosir Island offers fascinating insight into Batak culture. We enjoyed the hot springs and traditional dance performances. The accommodations were simple but comfortable, and the locals were very welcoming.",
    date: "2025-01-15",
    images: ["https://images.unsplash.com/photo-1605546652627-318564e75653"],
    helpfulCount: 15,
    tags: ["lake", "cultural", "relaxation"],
  },
];

// Function to get reviews by destination ID
export const getReviewsByDestination = (destinationId: string): Review[] => {
  return reviews.filter((review) => review.destinationId === destinationId);
};

// Function to get review by ID
export const getReviewById = (id: string): Review | undefined => {
  return reviews.find((review) => review.id === id);
};
