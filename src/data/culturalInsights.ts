import { CulturalInsight } from '../types';

export const culturalInsights: CulturalInsight[] = [
  {
    id: 'batik',
    title: 'Batik: Indonesia\'s Artistic Heritage',
    category: 'art',
    description: 'Explore the ancient art of batik, Indonesia\'s traditional fabric dyeing technique recognized by UNESCO as a Masterpiece of Intangible Heritage.',
    imageUrl: 'https://images.pexels.com/photos/31737402/pexels-photo-31737402.jpeg', // URL baru untuk gambar batik
    content: `Batik is a traditional Indonesian textile art form that uses a wax-resist dyeing technique to create intricate patterns on cloth. The word "batik" is believed to be derived from the Javanese words "amba" (to write) and "titik" (dot).

The process involves applying molten wax to fabric, which acts as a dye-resist. When the fabric is dipped in dye, the waxed areas remain the original color. This process can be repeated with different colors to create complex designs.

Traditional batik patterns often have deep symbolic meanings related to Indonesian culture, social status, local traditions, and nature. Each region in Indonesia has its own distinct batik styles and patterns, with the most renowned coming from Java.

In 2009, UNESCO recognized Indonesian batik as a Masterpiece of Oral and Intangible Heritage of Humanity, acknowledging its cultural significance.

Today, batik is not only worn for special occasions and ceremonies but has been integrated into modern fashion, home decor, and art, keeping this ancient tradition alive while allowing it to evolve with contemporary aesthetics.`
  },
  {
    id: 'gamelan',
    title: 'Gamelan: The Soul of Indonesian Music',
    category: 'art',
    description: 'Discover the enchanting sounds of gamelan, Indonesia\'s traditional ensemble music that has influenced composers worldwide.',
    imageUrl: 'https://images.pexels.com/photos/32311688/pexels-photo-32311688.jpeg', // URL baru untuk gambar gamelan
    content: `Gamelan is a traditional ensemble music of Indonesia, predominantly from the islands of Java and Bali. The term refers to both the musical ensemble and the distinctive instruments used, primarily metallophones, xylophones, drums, and gongs.

A full gamelan ensemble can include dozens of musicians playing together in intricate, interlocking patterns. Unlike Western music, which often focuses on harmony and melody, gamelan music emphasizes rhythm and texture, creating a shimmering, meditative sound.

Each gamelan set is considered a single entity, with instruments built and tuned to work together. The instruments are often elaborately carved and decorated, reflecting their cultural importance.

Gamelan music is integral to various cultural events in Indonesia, including shadow puppet performances (wayang kulit), dance performances, ceremonies, and rituals. Each region has developed its own style and variations.

The unique sound of gamelan has influenced many Western composers, including Claude Debussy, who was captivated by a Javanese gamelan performance at the 1889 Paris Exposition.

Today, gamelan ensembles can be found worldwide in universities, community groups, and cultural centers, making it one of Indonesia's most recognized musical exports.`
  },
  {
    id: 'wayang-kulit',
    title: 'Wayang Kulit: Shadow Puppet Theater',
    category: 'tradition',
    description: 'Learn about the ancient storytelling tradition of wayang kulit, where intricate shadow puppets tell epic tales of heroes and gods.',
    imageUrl: 'https://images.pexels.com/photos/30774484/pexels-photo-30774484.jpeg', // URL baru untuk gambar wayang
    content: `Wayang kulit is a traditional form of puppet-shadow play originally found in the cultures of Indonesia, particularly in Java and Bali. In a typical performance, the puppets are crafted from buffalo hide and mounted on bamboo sticks.

A single puppeteer, known as the dalang, manipulates all the puppets while simultaneously narrating the story, providing different voices for each character, and directing the gamelan orchestra. The puppets are held between a light source and a white screen, creating dramatic shadows for the audience sitting on the other side.

The stories performed in wayang kulit typically come from the Hindu epics Ramayana and Mahabharata, though they have been adapted to include local characters and situations. These performances often contain moral and philosophical messages, as well as political commentary.

A traditional wayang kulit performance can last all night, starting around 9 PM and ending at dawn. The performance is divided into three parts, representing the three stages of life: birth, life, and death.

In 2003, UNESCO designated wayang kulit as a Masterpiece of Oral and Intangible Heritage of Humanity, recognizing its cultural significance and the importance of preserving this ancient art form.

Today, wayang kulit continues to be performed for both ceremonial occasions and entertainment, adapting to modern times while maintaining its deep cultural roots.`
  },
  {
    id: 'indonesian-cuisine',
    title: 'The Rich Tapestry of Indonesian Cuisine',
    category: 'food',
    description: 'Savor the diverse flavors of Indonesia\'s culinary traditions, from savory rendang to aromatic nasi goreng.',
    imageUrl: 'https://images.pexels.com/photos/11912788/pexels-photo-11912788.jpeg',
    content: `Indonesian cuisine is as diverse as the archipelago itself, with over 17,000 islands contributing to a rich tapestry of flavors, cooking techniques, and ingredients. The country's strategic location and history as part of ancient trade routes have influenced its culinary traditions, incorporating elements from Chinese, Indian, Middle Eastern, and European cuisines.

Rice is the staple food across most of Indonesia, served as a base for most meals. Regional variations in cooking styles and ingredients create distinct culinary identities throughout the archipelago.

Key ingredients in Indonesian cooking include aromatic spices like lemongrass, galangal, turmeric, and kaffir lime leaves, creating the complex flavors the cuisine is known for. Coconut milk is another essential ingredient, used in many dishes to add richness and creaminess.

Some iconic Indonesian dishes include:

- Rendang: A rich and tender beef stew from West Sumatra, slow-cooked in coconut milk and spices
- Nasi Goreng: Indonesia's take on fried rice, often served with a fried egg, prawn crackers, and pickles
- Satay: Skewered and grilled meat served with peanut sauce
- Gado-gado: A vegetable salad with peanut sauce dressing
- Soto: A traditional soup made with broth, meat, and vegetables

Indonesian cuisine also features a variety of sambals (chili-based condiments) that add heat and complexity to dishes. Each region has its own sambal recipes, using local ingredients and preparation methods.

Street food is an integral part of Indonesian food culture, with vendors selling everything from snacks to full meals from carts and small stalls throughout the country.

In recent years, Indonesian cuisine has gained international recognition, with dishes like rendang being named among the world's most delicious foods in global surveys.`
  }
];

export const getCulturalInsightById = (id: string): CulturalInsight | undefined => {
  return culturalInsights.find(insight => insight.id === id);
};

export const getCulturalInsightsByCategory = (category: string): CulturalInsight[] => {
  return culturalInsights.filter(insight => insight.category === category);
};