import { Calendar, CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface PeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PeriodSelector = ({ value, onChange }: PeriodSelectorProps) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleCustomDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Calculate days between now and selected date
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Use the exact number of days for a custom period
      onChange(`custom_${diffDays}`);
      setDateRangeOpen(false);
    }
  };

  // Format the custom date for display
  const getCustomDateLabel = () => {
    if (value.startsWith('custom_') && selectedDate) {
      return `De ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} até hoje`;
    }
    return "Período personalizado";
  };

  return (
    <div className="relative">
      {/* Efeito de blur atrás do seletor */}
      <div className="absolute inset-0 bg-purple-400/10 blur-lg rounded-lg"></div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[220px] bg-white/70 backdrop-blur-sm border border-purple-200 shadow-sm hover:border-purple-300 transition-colors rounded-lg relative z-10 group">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-purple-500 group-hover:text-purple-600 transition-colors" />
            <SelectValue placeholder="Selecione o período" />
          </div>
        </SelectTrigger>

        <SelectContent className="border border-purple-100 bg-white/90 backdrop-blur-sm shadow-md rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-transparent py-1 px-2 mb-1 text-xs font-medium text-purple-700">
            Selecione o período de análise
          </div>

          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 px-2 py-1">Predefinidos</SelectLabel>
            {/* Itens do menu com indicador visual de seleção */}
            <SelectItem
              value="7"
              className="focus:bg-purple-50 focus:text-purple-800 data-[state=checked]:bg-purple-50 data-[state=checked]:text-purple-800 relative group transition-colors"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 opacity-0 data-[state=checked]:opacity-100 transition-opacity"></div>
              <span className="data-[state=checked]:font-medium">Últimos 7 dias</span>
            </SelectItem>

            <SelectItem
              value="14"
              className="focus:bg-purple-50 focus:text-purple-800 data-[state=checked]:bg-purple-50 data-[state=checked]:text-purple-800 relative group transition-colors"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 opacity-0 data-[state=checked]:opacity-100 transition-opacity"></div>
              <span className="data-[state=checked]:font-medium">Últimos 14 dias</span>
            </SelectItem>

            <SelectItem
              value="30"
              className="focus:bg-purple-50 focus:text-purple-800 data-[state=checked]:bg-purple-50 data-[state=checked]:text-purple-800 relative group transition-colors"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 opacity-0 data-[state=checked]:opacity-100 transition-opacity"></div>
              <span className="data-[state=checked]:font-medium">Últimos 30 dias</span>
            </SelectItem>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 px-2 py-1">Períodos maiores</SelectLabel>
            <SelectItem
              value="90"
              className="focus:bg-purple-50 focus:text-purple-800 data-[state=checked]:bg-purple-50 data-[state=checked]:text-purple-800 relative group transition-colors"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 opacity-0 data-[state=checked]:opacity-100 transition-opacity"></div>
              <span className="data-[state=checked]:font-medium">3 meses</span>
            </SelectItem>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 px-2 py-1">Avançado</SelectLabel>

            <div className="p-2">
              <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start border-dashed border-gray-300 text-left font-normal bg-white/50 hover:bg-purple-50 focus:bg-purple-50 focus:text-purple-800",
                      value.startsWith('custom_') && "border-purple-200 text-purple-700 bg-purple-50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value.startsWith('custom_')
                      ? getCustomDateLabel()
                      : "Período personalizado"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-purple-100" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleCustomDateSelect}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </SelectGroup>

        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodSelector;