'use client';

import { useState } from 'react';
import { TOPICS, type Topic } from '@/data';

interface TopicSelectorProps {
  onSelectTopic: (topic: Topic) => void;
  selectedTopicId?: string;
}

export function TopicSelector({ onSelectTopic, selectedTopicId }: TopicSelectorProps) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-teal-800 mb-2">
        Choose a Topic
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Pick a kaupapa (topic) to build sentences around
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            onMouseEnter={() => setHoveredTopic(topic.id)}
            onMouseLeave={() => setHoveredTopic(null)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${selectedTopicId === topic.id
                ? 'border-teal-500 bg-teal-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md'
              }
            `}
          >
            {/* Topic Icon */}
            <div className="text-4xl mb-2">{topic.icon}</div>

            {/* Topic Name */}
            <h3 className="font-bold text-gray-800">{topic.name}</h3>
            <p className="text-sm text-teal-600 font-medium">{topic.maori}</p>

            {/* Description on hover */}
            {hoveredTopic === topic.id && (
              <div className="absolute inset-x-0 -bottom-12 z-10">
                <div className="mx-2 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                  {topic.description}
                </div>
              </div>
            )}

            {/* Selected indicator */}
            {selectedTopicId === topic.id && (
              <div className="absolute top-2 right-2">
                <span className="text-teal-500 text-xl">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Random topic button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            onSelectTopic(randomTopic);
          }}
          className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold
                   hover:bg-amber-600 transition-colors shadow-md"
        >
          🎲 Random Topic
        </button>
      </div>
    </div>
  );
}

export default TopicSelector;
