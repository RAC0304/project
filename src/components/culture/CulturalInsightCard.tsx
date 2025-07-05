import React from 'react';
import { CulturalInsight } from '../../types';

interface CulturalInsightCardProps {
  insight: CulturalInsight;
  onReadMore: (insight: CulturalInsight) => void;
}

const CulturalInsightCard: React.FC<CulturalInsightCardProps> = ({ insight, onReadMore }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group">
      <div className="h-48 overflow-hidden">
        <img 
          src={insight.imageUrl} 
          alt={insight.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full capitalize">
            {insight.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{insight.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{insight.description}</p>
        <button 
          onClick={() => onReadMore(insight)} 
          className="text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
        >
          Read more
        </button>
      </div>
    </div>
  );
};

export default CulturalInsightCard;
