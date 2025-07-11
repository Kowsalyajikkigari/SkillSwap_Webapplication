import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface WebSocketStatusProps {
  className?: string;
  showText?: boolean;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const { connectionStatus } = useWebSocket();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: 'Connected',
          variant: 'default' as const,
          className: 'bg-green-500 text-white'
        };
      case 'connecting':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-500 text-white'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Disconnected',
          variant: 'destructive' as const,
          className: 'bg-red-500 text-white'
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Unknown',
          variant: 'outline' as const,
          className: 'bg-gray-500 text-white'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1`}
    >
      {config.icon}
      {showText && <span className="text-xs">{config.text}</span>}
    </Badge>
  );
};

export default WebSocketStatus;
