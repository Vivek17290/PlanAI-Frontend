import React from 'react';
import { Clock, CheckCircle, Loader } from 'lucide-react';

interface Activity {
  id: string;
  type: 'text-to-2d' | '2d-to-3d';
  name: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'pending';
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'text-to-2d',
    name: 'Company Logo Concept',
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: '2',
    type: '2d-to-3d',
    name: 'Logo 3D Model',
    timestamp: '1 hour ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'text-to-2d',
    name: 'Product Design Sketch',
    timestamp: '30 minutes ago',
    status: 'completed',
  },
  {
    id: '4',
    type: '2d-to-3d',
    name: 'Product 3D Visualization',
    timestamp: '15 minutes ago',
    status: 'processing',
  },
  {
    id: '5',
    type: 'text-to-2d',
    name: 'UI Icon Set',
    timestamp: 'Just now',
    status: 'pending',
  },
];

export default function RecentActivity() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <a href="#" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
          View All →
        </a>
      </div>

      <div className="space-y-3">
        {MOCK_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 border border-white/5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="flex-1">
                <p className="text-white font-medium">{activity.name}</p>
                <p className="text-sm text-gray-500">
                  {activity.type === 'text-to-2d' ? 'Text to 2D' : '2D to 3D'} • {activity.timestamp}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}>
              {getStatusIcon(activity.status)}
              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}