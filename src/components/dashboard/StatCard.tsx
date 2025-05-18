import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Info, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatCardProps {
  title: string;
  value: string | number;
  percentChange?: number;
  period?: string;
  icon?: React.ReactNode;
}

export const StatCard = ({ 
  title, 
  value, 
  percentChange, 
  period = "Últimos 7 dias",
  icon
}: StatCardProps) => {
  const isPositive = percentChange && percentChange > 0;
  const isNegative = percentChange && percentChange < 0;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-purple-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute left-12 -top-6 w-16 h-16 rounded-full bg-purple-500/5 blur-lg"></div>
      
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start">
            {/* Colored icon background */}
            <div className="p-2 bg-purple-600 rounded-lg mr-3 shadow-sm">
              {icon || <TrendingUp className="h-5 w-5 text-purple-100" />}
            </div>
            
            <h3 className="text-gray-600 text-sm font-medium mt-1">{title}</h3>
          </div>
          
          {/* Percent change indicator */}
          {percentChange !== undefined && (
            <div 
              className={cn(
                "flex items-center text-sm font-medium rounded-full px-2 py-0.5",
                isPositive && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                isNegative && "bg-rose-50 text-rose-600 border border-rose-100",
                !isPositive && !isNegative && "bg-gray-50 text-gray-600 border border-gray-100"
              )}
            >
              {isPositive && <ArrowUp className="h-3 w-3 mr-1" />}
              {isNegative && <ArrowDown className="h-3 w-3 mr-1" />}
              {percentChange ? `${isPositive ? '+' : ''}${percentChange}%` : '0%'}
            </div>
          )}
        </div>
        
        {/* Value section */}
        <div className="mt-2">
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            {/* Tooltip for more info */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-2 text-purple-400 hover:text-purple-600 transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-white/90 backdrop-blur-sm border border-purple-100 shadow-md">
                  <p className="text-sm">Estatística baseada em dados do período selecionado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Period indicator */}
          <div className="flex items-center mt-1">
            <span className="text-gray-500 text-xs flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-purple-400" />
              {period}
            </span>
          </div>
        </div>
        
        {/* Progress indicator at bottom */}
        <div className="mt-4 pt-2 border-t border-purple-50">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                isPositive && "bg-emerald-500",
                isNegative && "bg-rose-500",
                !isPositive && !isNegative && "bg-purple-500"
              )}
              style={{ 
                width: percentChange ? `${Math.min(Math.abs(percentChange) * 2, 100)}%` : '50%'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Adicione o componente Calendar
import { Calendar } from 'lucide-react';

export default StatCard;