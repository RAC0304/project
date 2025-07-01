import React, { useState } from "react";
import { culturalInsights } from "../data/culturalInsights";
import CulturalInsightCard from "../components/culture/CulturalInsightCard";

const AboutPage: React.FC = () => {
  const [selectedInsight, setSelectedInsight] = useState<
    | null
    | {
        id: number;
        title: string;
        content: string;
        imageUrl: string;
        category: string;
      }
  >(null);

  return (
    <div className="pt-14 pb-16 bg-gradient-to-br from-teal-50 via-white to-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-teal-300/10 rounded-3xl transform -rotate-1"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>{" "}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mb-6">
              About Indonesia
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the rich culture, history, and natural wonders of the
              Indonesian archipelago - a land of 17,000 islands and endless
              adventures
            </p>
            <div className="flex justify-center mt-8 space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                17,000+ Islands
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
                700+ Languages
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                Biodiversity Hotspot
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Introduction */}
        <div className="mb-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500 group">
            <div className="md:flex">
              <div className="md:w-1/2 relative overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2765878/pexels-photo-2765878.jpeg"
                  alt="Indonesia landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                  🏝️ Archipelago Nation
                </div>
              </div>
              <div className="p-10 md:w-1/2 flex flex-col justify-center">
                {" "}
                <div className="flex items-center mb-4">
                  <div className="w-1 h-12 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full mr-4"></div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    The Indonesian Archipelago
                  </h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  Indonesia is the world's largest archipelagic state,
                  consisting of over 17,000 islands that stretch along the
                  equator in Southeast Asia. With a rich tapestry of cultures,
                  landscapes, and biodiversity, Indonesia offers travelers an
                  unparalleled diversity of experiences.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  From the lush rainforests of Sumatra and Kalimantan to the
                  volcanic landscapes of Java and Bali, from the pristine
                  beaches of the Gili Islands to the traditional villages of
                  Sulawesi and Papua, Indonesia is a land of extraordinary
                  contrasts and beauty.
                </p>
                <div className="flex space-x-4">
                  <div className="bg-teal-50 rounded-lg px-4 py-2 flex-1">
                    <div className="text-2xl font-bold text-teal-600">
                      270M+
                    </div>
                    <div className="text-sm text-gray-600">Population</div>
                  </div>{" "}
                  <div className="bg-gray-50 rounded-lg px-4 py-2 flex-1">
                    <div className="text-2xl font-bold text-gray-600">1.9M</div>
                    <div className="text-sm text-gray-600">km² Area</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Cultural Insights */}
        <div className="mb-20" id="culture">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mb-4">
              Cultural Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Indonesia's rich cultural heritage spans centuries of traditions,
              arts, and customs that continue to thrive today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {culturalInsights.map((insight, index) => (
              <div
                key={insight.id}
                className="transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CulturalInsightCard
                  insight={insight}
                  onReadMore={(insight) => setSelectedInsight(insight)}
                />
              </div>
            ))}
          </div>
        </div>{" "}
        {/* Travel Tips */}
        <div className="mb-20" id="travel-tips">
          <div className="bg-gradient-to-br from-teal-50 via-gray-50 to-teal-50 rounded-3xl p-10 shadow-2xl border border-white/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/10 to-teal-300/10 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gray-400/10 to-teal-400/10 rounded-full transform -translate-x-24 translate-y-24"></div>

            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>{" "}
                <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mb-4">
                  Essential Travel Tips
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to know for your Indonesian adventure
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {" "}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      When to Visit
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Indonesia has a tropical climate with two distinct seasons:
                  </p>{" "}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Dry Season (April to October)
                        </div>
                        <div className="text-gray-600">
                          Generally the best time to visit most regions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Wet Season (November to March)
                        </div>
                        <div className="text-gray-600">
                          Brief, heavy downpours, typically in the afternoon
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-50 to-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      💡 <strong>Pro tip:</strong> Bali and Java are pleasant
                      year-round, while Raja Ampat is best experienced from
                      October to April.
                    </p>
                  </div>
                </div>{" "}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Visa Information
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Many nationalities can enter Indonesia visa-free for stays
                    up to 30 days. For longer stays, consider these options:
                  </p>{" "}
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-teal-50 rounded-lg">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                      <div>
                        <span className="font-semibold text-teal-800">
                          Visa-Free:
                        </span>
                        <span className="text-gray-700 ml-2">
                          30 days, non-extendable
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          Visa on Arrival:
                        </span>
                        <span className="text-gray-700 ml-2">
                          30 days, extendable once
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-teal-50 rounded-lg">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mr-3"></div>
                      <div>
                        <span className="font-semibold text-teal-800">
                          Tourist Visa:
                        </span>
                        <span className="text-gray-700 ml-2">
                          Apply at embassies before arrival
                        </span>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Transportation
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Getting around Indonesia's vast archipelago:
                  </p>{" "}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <span className="text-teal-600 text-lg">✈️</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Flights
                        </div>
                        <div className="text-gray-600 text-sm">
                          Fastest way between islands
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <span className="text-gray-600 text-lg">⛴️</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Ferries & Boats
                        </div>
                        <div className="text-gray-600 text-sm">
                          Connect many islands
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <span className="text-teal-600 text-lg">🚂</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Trains
                        </div>
                        <div className="text-gray-600 text-sm">
                          Available on Java and Sumatra
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <span className="text-gray-600 text-lg">🚗</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Cars & Ride-sharing
                        </div>
                        <div className="text-gray-600 text-sm">
                          Gojek and Grab in urban areas
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Cultural Etiquette
                    </h3>
                  </div>{" "}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        Dress modestly when visiting temples and religious sites
                      </span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        Remove shoes before entering homes or places of worship
                      </span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        Use your right hand for eating and giving/receiving
                        objects
                      </span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        Ask permission before photographing people, especially
                        in rural areas
                      </span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        Learn a few basic Indonesian phrases—locals appreciate
                        the effort
                      </span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        Be mindful of religious customs, especially during
                        Ramadan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Fun Facts Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mb-4">
              Amazing Facts About Indonesia
            </h2>
            <p className="text-xl text-gray-600">
              Discover the incredible statistics and unique features of this
              remarkable archipelago
            </p>
          </div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold mb-2">17,508</div>
              <div className="text-teal-100 font-medium">Total Islands</div>
              <div className="text-sm text-teal-100 mt-2">
                Only 6,000 are inhabited
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold mb-2">700+</div>
              <div className="text-gray-100 font-medium">Languages Spoken</div>
              <div className="text-sm text-gray-100 mt-2">
                Most linguistically diverse
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold mb-2">130</div>
              <div className="text-teal-100 font-medium">Active Volcanoes</div>
              <div className="text-sm text-teal-100 mt-2">
                Part of Ring of Fire
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl font-bold mb-2">12%</div>
              <div className="text-gray-100 font-medium">
                World's Biodiversity
              </div>
              <div className="text-sm text-gray-100 mt-2">
                Mega-diverse country
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
              <div className="text-6xl mb-4">🦎</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Komodo Dragons
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Indonesia is the only place on Earth where you can see Komodo
                dragons in the wild. These ancient reptiles live on Komodo
                Island and nearby islands in East Nusa Tenggara.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
              <div className="text-6xl mb-4">🌺</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Rafflesia Flower
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Home to the world's largest flower, the Rafflesia Arnoldii,
                which can grow up to 3 feet in diameter and weigh up to 15
                pounds. It's found in the rainforests of Sumatra.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
              <div className="text-6xl mb-4">🐒</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Orangutans
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Borneo and Sumatra are the only places where orangutans live in
                the wild. These intelligent primates are found nowhere else on
                Earth and are critically endangered.
              </p>
            </div>
          </div>
        </div>{" "}
        {/* FAQ Section */}
        <div id="faq">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Common questions from travelers planning their Indonesian journey
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    ?
                  </span>
                  Is Indonesia safe for tourists?
                </h3>
                <p className="text-gray-700 leading-relaxed pl-11">
                  Indonesia is generally safe for tourists, particularly in
                  popular destinations. As with any travel, exercise normal
                  precautions, be aware of your surroundings, and respect local
                  customs. Stay informed about specific regional conditions,
                  especially regarding natural hazards like volcanoes or
                  earthquakes.
                </p>
              </div>{" "}
              <div className="bg-gradient-to-r from-gray-50 to-teal-50 rounded-2xl p-6 border-l-4 border-teal-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    ₹
                  </span>
                  What currency is used in Indonesia?
                </h3>
                <p className="text-gray-700 leading-relaxed pl-11">
                  The Indonesian Rupiah (IDR) is the official currency. Credit
                  cards are widely accepted in tourist areas and major cities,
                  but carry cash for smaller establishments and rural area
                  s.
                  ATMs are readily available in urban centers and tourist
                  destinations.
                </p>
              </div>{" "}
              <div className="bg-gradient-to-r from-teal-50 to-gray-50 rounded-2xl p-6 border-l-4 border-gray-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    💉
                  </span>
                  Do I need any vaccinations for Indonesia?
                </h3>
                <p className="text-gray-700 leading-relaxed pl-11">
                  While no mandatory vaccinations are required for entry,
                  recommended vaccinations include Hepatitis A, Typhoid, and
                  routine vaccines. Consider Hepatitis B, Japanese Encephalitis,
                  and Rabies for longer stays. Consult your healthcare provider
                  for personalized advice.
                </p>
              </div>{" "}
              <div className="bg-gradient-to-r from-gray-50 to-teal-50 rounded-2xl p-6 border-l-4 border-teal-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    📅
                  </span>
                  How long should I plan to stay in Indonesia?
                </h3>
                <p className="text-gray-700 leading-relaxed pl-11">
                  Due to Indonesia's size and diversity, at least 2 weeks is
                  recommended to experience one or two regions properly. For a
                  comprehensive tour across multiple islands, consider 3-4
                  weeks. Even a single island like Bali or Java deserves at
                  least one week to explore thoroughly.
                </p>
              </div>{" "}
              <div className="bg-gradient-to-r from-teal-50 to-gray-50 rounded-2xl p-6 border-l-4 border-gray-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    🗣️
                  </span>
                  Is English widely spoken in Indonesia?
                </h3>
                <p className="text-gray-700 leading-relaxed pl-11">
                  English is commonly spoken in tourist areas, international
                  hotels, and by younger Indonesians in urban centers. In rural
                  areas, English proficiency may be limited. Learning a few
                  basic Indonesian phrases is helpful and appreciated by locals.
                </p>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Call to Action Section */}
        <div className="mt-20 mb-16"> </div>
      </div>

      {/* Fullscreen Popup for Cultural Insight */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-lg relative">
              <div className="h-80 sm:h-96 overflow-hidden relative">
                <img
                  src={selectedInsight.imageUrl}
                  alt={selectedInsight.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedInsight.title}
                  </h2>
                  <span className="inline-block px-3 py-1 bg-teal-500 bg-opacity-70 text-white text-sm rounded-full capitalize">
                    {selectedInsight.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedInsight.content}
                  </p>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-6 flex justify-center">
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Back to Cultural Insights
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
