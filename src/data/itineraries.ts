import { Itinerary } from '../types';

export const itineraries: Itinerary[] = [
  {
    id: 'bali-escape',
    title: 'Bali Island Escape',
    duration: '7 days',
    description: 'Experience the best of Bali from beaches to mountains, temples to rice terraces in this week-long adventure.',
    imageUrl: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg',
    destinations: ['bali'],
    difficulty: 'easy',
    bestSeason: 'April to October',
    estimatedBudget: '$800-1200',
    days: [
      {
        day: 1,
        title: 'Arrival & Seminyak',
        description: 'Arrive in Denpasar and transfer to your hotel in Seminyak. Relax on the beach and enjoy sunset drinks.',
        activities: [
          {
            time: '14:00',
            title: 'Airport Transfer',
            description: 'Arrive at Ngurah Rai International Airport and transfer to your hotel in Seminyak',
            location: 'Denpasar to Seminyak'
          },
          {
            time: '17:00',
            title: 'Seminyak Beach Sunset',
            description: 'Relax on the beach and enjoy sunset drinks at a beachfront bar',
            location: 'Seminyak Beach'
          },
          {
            time: '19:30',
            title: 'Welcome Dinner',
            description: 'Enjoy a delicious Balinese feast at a local restaurant',
            location: 'Seminyak'
          }
        ],
        accommodation: 'Boutique hotel in Seminyak',
        meals: 'Dinner',
        transportation: 'Airport transfer'
      },
      {
        day: 2,
        title: 'Temples & Uluwatu',
        description: 'Visit beautiful temples and watch the famous Kecak fire dance at Uluwatu Temple.',
        activities: [
          {
            time: '09:00',
            title: 'Tanah Lot Temple',
            description: 'Visit the iconic sea temple built on a rock formation',
            location: 'Tanah Lot'
          },
          {
            time: '14:00',
            title: 'Uluwatu Temple Tour',
            description: 'Explore the clifftop temple with stunning ocean views',
            location: 'Uluwatu'
          },
          {
            time: '18:00',
            title: 'Kecak Fire Dance',
            description: 'Watch the traditional Kecak fire dance performance at sunset',
            location: 'Uluwatu Temple'
          }
        ],
        accommodation: 'Boutique hotel in Seminyak',
        meals: 'Breakfast',
        transportation: 'Private driver'
      },
      {
        day: 3,
        title: 'Transfer to Ubud',
        description: 'Explore the Sacred Monkey Forest and move to Ubud, the cultural heart of Bali.',
        activities: [
          {
            time: '10:00',
            title: 'Ubud Monkey Forest',
            description: 'Visit the natural sanctuary home to over 700 monkeys',
            location: 'Ubud'
          },
          {
            time: '14:00',
            title: 'Ubud Palace',
            description: 'Explore the royal palace and learn about Balinese architecture',
            location: 'Ubud Center'
          },
          {
            time: '16:00',
            title: 'Ubud Market',
            description: 'Shop for handicrafts and souvenirs at the traditional market',
            location: 'Ubud Market'
          }
        ],
        accommodation: 'Eco-resort in Ubud',
        meals: 'Breakfast',
        transportation: 'Private transfer'
      },
      {
        day: 4,
        title: 'Rice Terraces & Water Temple',
        description: 'Visit the stunning Tegallalang Rice Terraces and participate in a water purification ceremony.',
        activities: [
          {
            time: '09:00',
            title: 'Tegallalang Rice Terraces',
            description: 'Marvel at the stunning green stepped rice paddies',
            location: 'Tegallalang'
          },
          {
            time: '14:00',
            title: 'Tirta Empul Temple',
            description: 'Participate in a traditional water purification ceremony',
            location: 'Tampaksiring'
          }
        ],
        accommodation: 'Eco-resort in Ubud',
        meals: 'Breakfast, Lunch',
        transportation: 'Private driver'
      },
      {
        day: 5,
        title: 'Mount Batur Sunrise Trek',
        description: 'Early morning hike to see sunrise from Mount Batur volcano.',
        activities: [
          {
            time: '02:30',
            title: 'Departure for Mount Batur',
            description: 'Early morning pickup from your hotel',
            location: 'Ubud to Kintamani'
          },
          {
            time: '04:00',
            title: 'Mount Batur Trek',
            description: 'Hike to the summit (1,717m) with a local guide',
            location: 'Mount Batur'
          },
          {
            time: '06:00',
            title: 'Sunrise Breakfast',
            description: 'Enjoy breakfast with panoramic views at the summit',
            location: 'Mount Batur Summit'
          },
          {
            time: '14:00',
            title: 'Hot Springs Visit',
            description: 'Relax in natural hot springs to soothe your muscles after the hike',
            location: 'Toya Bungkah'
          }
        ],
        accommodation: 'Eco-resort in Ubud',
        meals: 'Breakfast (on the mountain), Lunch',
        transportation: 'Private jeep and guide'
      },
      {
        day: 6,
        title: 'Transfer to Nusa Dua',
        description: 'Move to Nusa Dua beach resort area for relaxation.',
        activities: [
          {
            time: '10:00',
            title: 'Transfer to Nusa Dua',
            description: 'Scenic drive from Ubud to Nusa Dua beach resort area',
            location: 'Ubud to Nusa Dua'
          },
          {
            time: '14:00',
            title: 'Beach Time',
            description: 'Relax on the white sand beaches of Nusa Dua',
            location: 'Nusa Dua Beach'
          },
          {
            time: '16:00',
            title: 'Spa Treatment',
            description: 'Enjoy a traditional Balinese massage and spa treatment',
            location: 'Resort Spa'
          }
        ],
        accommodation: 'Beach resort in Nusa Dua',
        meals: 'Breakfast, Dinner',
        transportation: 'Private transfer'
      },
      {
        day: 7,
        title: 'Departure Day',
        description: 'Last-minute shopping and departure from Bali.',
        activities: [
          {
            time: '10:00',
            title: 'Free Morning',
            description: 'Last minute relaxation or shopping',
            location: 'Nusa Dua'
          },
          {
            time: 'Flexible',
            title: 'Airport Transfer',
            description: 'Transfer to Ngurah Rai International Airport for your departure flight',
            location: 'Nusa Dua to Denpasar Airport'
          }
        ],
        accommodation: 'N/A',
        meals: 'Breakfast',
        transportation: 'Airport transfer'
      }
    ]
  },
  {
    id: 'java-culture',
    title: 'Java Cultural Explorer',
    duration: '5 days',
    description: 'Discover the rich cultural heritage of Java, from ancient temples to royal palaces, traditional arts to volcanic landscapes.',
    imageUrl: 'https://images.pexels.com/photos/3522276/pexels-photo-3522276.jpeg',
    destinations: ['yogyakarta', 'borobudur'],
    difficulty: 'moderate',
    bestSeason: 'May to September',
    estimatedBudget: '$600-900',
    days: [
      {
        day: 1,
        title: 'Arrival in Yogyakarta',
        description: 'Arrive in Yogyakarta and explore the city center.',
        activities: [
          {
            time: '14:00',
            title: 'Airport Transfer',
            description: 'Arrive at Yogyakarta International Airport and transfer to your hotel',
            location: 'Yogyakarta'
          },
          {
            time: '16:00',
            title: 'Malioboro Street Tour',
            description: 'Explore the famous shopping street and try local street food',
            location: 'Malioboro Street'
          },
          {
            time: '19:00',
            title: 'Welcome Dinner',
            description: 'Traditional Javanese dinner with cultural performance',
            location: 'Local Restaurant'
          }
        ],
        accommodation: 'Heritage hotel in Yogyakarta',
        meals: 'Dinner',
        transportation: 'Airport transfer'
      },
      {
        day: 2,
        title: 'Borobudur Sunrise & Temples',
        description: 'Experience sunrise at Borobudur Temple and explore nearby temples.',
        activities: [
          {
            time: '04:00',
            title: 'Borobudur Sunrise Tour',
            description: 'Early morning visit to witness sunrise at the world\'s largest Buddhist temple',
            location: 'Borobudur Temple'
          },
          {
            time: '10:00',
            title: 'Pawon & Mendut Temples',
            description: 'Visit two smaller temples that form a straight line with Borobudur',
            location: 'Pawon and Mendut'
          },
          {
            time: '14:00',
            title: 'Local Village Tour',
            description: 'Visit a traditional Javanese village to learn about rural life',
            location: 'Village near Borobudur'
          }
        ],
        accommodation: 'Heritage hotel in Yogyakarta',
        meals: 'Breakfast, Lunch',
        transportation: 'Private driver'
      },
      {
        day: 3,
        title: 'Yogyakarta City Tour',
        description: 'Explore the cultural highlights of Yogyakarta city.',
        activities: [
          {
            time: '09:00',
            title: 'Kraton (Sultan\'s Palace)',
            description: 'Tour the royal palace and learn about Javanese court life',
            location: 'Kraton Yogyakarta'
          },
          {
            time: '11:00',
            title: 'Taman Sari Water Castle',
            description: 'Visit the former royal garden and bathing complex',
            location: 'Taman Sari'
          },
          {
            time: '14:00',
            title: 'Batik Workshop',
            description: 'Learn to make traditional batik with local artisans',
            location: 'Batik Village'
          }
        ],
        accommodation: 'Heritage hotel in Yogyakarta',
        meals: 'Breakfast',
        transportation: 'Private driver'
      },
      {
        day: 4,
        title: 'Prambanan & Ratu Boko',
        description: 'Visit ancient Hindu temples and watch a traditional ballet performance.',
        activities: [
          {
            time: '10:00',
            title: 'Prambanan Temple Complex',
            description: 'Explore the largest Hindu temple compound in Indonesia',
            location: 'Prambanan'
          },
          {
            time: '14:00',
            title: 'Ratu Boko Palace',
            description: 'Visit the archaeological site perched on a hill with panoramic views',
            location: 'Ratu Boko'
          },
          {
            time: '18:00',
            title: 'Ramayana Ballet',
            description: 'Watch the epic Ramayana story performed through traditional dance',
            location: 'Prambanan Open Air Theatre'
          }
        ],
        accommodation: 'Heritage hotel in Yogyakarta',
        meals: 'Breakfast, Dinner',
        transportation: 'Private driver'
      },
      {
        day: 5,
        title: 'Departure Day',
        description: 'Last-minute shopping and departure from Yogyakarta.',
        activities: [
          {
            time: '10:00',
            title: 'Souvenir Shopping',
            description: 'Visit local craft shops for last-minute souvenirs',
            location: 'Yogyakarta'
          },
          {
            time: 'Flexible',
            title: 'Airport Transfer',
            description: 'Transfer to Yogyakarta International Airport for your departure flight',
            location: 'Yogyakarta to Airport'
          }
        ],
        accommodation: 'N/A',
        meals: 'Breakfast',
        transportation: 'Airport transfer'
      }
    ]
  }
];

export const getItineraryById = (id: string): Itinerary | undefined => {
  return itineraries.find(itinerary => itinerary.id === id);
};