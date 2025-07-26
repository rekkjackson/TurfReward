import { useState, useEffect } from 'react';
import { Leaf, Sun, Cloud, CloudRain } from 'lucide-react';

interface DashboardHeaderProps {
  weatherCondition?: string;
  weatherTemperature?: number;
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
      return <Sun className="text-warning text-xl" />;
    case 'cloudy':
      return <Cloud className="text-gray-400 text-xl" />;
    case 'rainy':
      return <CloudRain className="text-blue-400 text-xl" />;
    default:
      return <Sun className="text-warning text-xl" />;
  }
};

export function DashboardHeader({ weatherCondition = "Sunny", weatherTemperature = 72 }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-medium rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Leaf className="text-success text-3xl" />
        <div>
          <h1 className="text-2xl font-bold text-white">GreenScape Pro Performance Dashboard</h1>
          <p className="text-gray-400 text-sm">Pay-for-Performance Excellence System</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Real-time Weather */}
        <div className="flex items-center space-x-2 bg-slate-light rounded-lg px-4 py-2">
          {getWeatherIcon(weatherCondition)}
          <div>
            <div className="text-lg font-semibold">{weatherTemperature}°F</div>
            <div className="text-xs text-gray-400">{weatherCondition}</div>
          </div>
        </div>
        
        {/* Current Time */}
        <div className="text-right">
          <div className="text-2xl font-bold">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: 'numeric',
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long',
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
