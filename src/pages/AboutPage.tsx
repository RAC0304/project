import React from 'react';
import { culturalInsights } from '../data/culturalInsights';
import CulturalInsightCard from '../components/culture/CulturalInsightCard';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Indonesia</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the rich culture, history, and natural wonders of the Indonesian archipelago
          </p>
        </div>
        
        {/* Introduction */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src="https://images.pexels.com/photos/2765878/pexels-photo-2765878.jpeg" 
                  alt="Indonesia landscape" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">The Indonesian Archipelago</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Indonesia is the world's largest archipelagic state, consisting of over 17,000 islands that stretch along the equator in Southeast Asia. With a rich tapestry of cultures, landscapes, and biodiversity, Indonesia offers travelers an unparalleled diversity of experiences.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  From the lush rainforests of Sumatra and Kalimantan to the volcanic landscapes of Java and Bali, from the pristine beaches of the Gili Islands to the traditional villages of Sulawesi and Papua, Indonesia is a land of extraordinary contrasts and beauty.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cultural Insights */}
        <div className="mb-16" id="culture">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Cultural Insights</h2>
          <p className="text-gray-600 mb-8">Indonesia's rich cultural heritage spans centuries of traditions, arts, and customs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturalInsights.map((insight) => (
              <CulturalInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
        
        {/* Travel Tips */}
        <div className="mb-16" id="travel-tips">
          <div className="bg-teal-50 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Essential Travel Tips</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">When to Visit</h3>
                <p className="text-gray-700 mb-4">
                  Indonesia has a tropical climate with two seasons:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li><strong>Dry Season (April to October):</strong> Generally the best time to visit most regions.</li>
                  <li><strong>Wet Season (November to March):</strong> Expect brief, heavy downpours, typically in the afternoon.</li>
                </ul>
                <p className="text-gray-700">
                  The ideal time to visit depends on your specific destinations. Bali and Java are pleasant year-round, while Raja Ampat is best experienced from October to April.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Visa Information</h3>
                <p className="text-gray-700 mb-4">
                  Many nationalities can enter Indonesia visa-free for stays up to 30 days. For longer stays, consider these options:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Visa-Free:</strong> 30 days, non-extendable</li>
                  <li><strong>Visa on Arrival:</strong> 30 days, extendable once for another 30 days</li>
                  <li><strong>Tourist Visa:</strong> Apply at Indonesian embassies before arrival</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Transportation</h3>
                <p className="text-gray-700 mb-4">
                  Getting around Indonesia's vast archipelago:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Flights:</strong> The fastest way to travel between islands, with numerous domestic carriers</li>
                  <li><strong>Ferries and Boats:</strong> Connect many islands, from large passenger ferries to small local boats</li>
                  <li><strong>Trains:</strong> Available on Java and Sumatra, comfortable and affordable</li>
                  <li><strong>Cars and Taxis:</strong> Readily available in major cities and tourist areas</li>
                  <li><strong>Ride-sharing:</strong> Gojek and Grab operate in most urban areas</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Cultural Etiquette</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Dress modestly when visiting temples and religious sites</li>
                  <li>Remove shoes before entering homes or places of worship</li>
                  <li>Use your right hand for eating and giving/receiving objects</li>
                  <li>Ask permission before photographing people, especially in rural areas</li>
                  <li>Learn a few basic Indonesian phrases—locals appreciate the effort</li>
                  <li>Be mindful of religious customs, especially during Ramadan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div id="faq">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Is Indonesia safe for tourists?</h3>
                <p className="text-gray-700">
                  Indonesia is generally safe for tourists, particularly in popular destinations. As with any travel, exercise normal precautions, be aware of your surroundings, and respect local customs. Stay informed about specific regional conditions, especially regarding natural hazards like volcanoes or earthquakes.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What currency is used in Indonesia?</h3>
                <p className="text-gray-700">
                  The Indonesian Rupiah (IDR) is the official currency. Credit cards are widely accepted in tourist areas and major cities, but carry cash for smaller establishments and rural areas. ATMs are readily available in urban centers and tourist destinations.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Do I need any vaccinations for Indonesia?</h3>
                <p className="text-gray-700">
                  While no mandatory vaccinations are required for entry, recommended vaccinations include Hepatitis A, Typhoid, and routine vaccines. Consider Hepatitis B, Japanese Encephalitis, and Rabies for longer stays. Consult your healthcare provider for personalized advice.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How long should I plan to stay in Indonesia?</h3>
                <p className="text-gray-700">
                  Due to Indonesia's size and diversity, at least 2 weeks is recommended to experience one or two regions properly. For a comprehensive tour across multiple islands, consider 3-4 weeks. Even a single island like Bali or Java deserves at least one week to explore thoroughly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Is English widely spoken in Indonesia?</h3>
                <p className="text-gray-700">
                  English is commonly spoken in tourist areas, international hotels, and by younger Indonesians in urban centers. In rural areas, English proficiency may be limited. Learning a few basic Indonesian phrases is helpful and appreciated by locals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;