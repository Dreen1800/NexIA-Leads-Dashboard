import { TrendData } from '@/types/supabase';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';
import { format, isValid, parse, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrendChartProps {
  data: TrendData[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Cores para combinar com a identidade visual
  const COLORS = {
    indicacoes: '#9e46d3', // Cor principal (roxo)
    hoverColor: '#8034b9' // Roxo mais escuro para hover
  };

  // Processar os dados com base no período selecionado
  const processedData = useMemo(() => {
    // Se tivermos mais de 30 pontos, vamos agrupar por meses para melhorar a visualização
    if (data.length > 30) {
      // Agrupar os dados por mês
      const monthlyData = [];
      const monthlyGroups = new Map();

      // Processar cada data e agrupá-la por mês
      data.forEach(item => {
        try {
          // Parsear a data no formato dd/MM
          const parsedDate = parse(item.date, 'dd/MM', new Date());
          if (!isValid(parsedDate)) {
            return;
          }

          // Criar chave para o mês (como "MM/YYYY")
          const monthKey = format(parsedDate, 'MM/yyyy');
          const monthName = format(parsedDate, 'MMMM', { locale: ptBR });

          // Adicionar ou incrementar o contador para este mês
          if (!monthlyGroups.has(monthKey)) {
            monthlyGroups.set(monthKey, {
              month: monthName,
              total: 0,
              displayOrder: (getYear(parsedDate) * 12) + getMonth(parsedDate) // Para garantir ordem correta
            });
          }

          monthlyGroups.get(monthKey).total += item.novas;
        } catch (e) {
          console.warn("Erro ao processar data:", item.date, e);
        }
      });

      // Converter o Map em array e ordenar por mês
      Array.from(monthlyGroups.entries())
        .sort((a, b) => a[1].displayOrder - b[1].displayOrder)
        .forEach(([key, data]) => {
          monthlyData.push({
            date: data.month,
            indicacoes: data.total,
            isGrouped: true,
            isMonthly: true
          });
        });

      return monthlyData;
    }

    // Para períodos menores, mantemos os dados diários
    return data.map(item => ({
      date: item.date,
      indicacoes: item.novas,
      isGrouped: false,
      isMonthly: false
    }));
  }, [data]);

  // Handler for mouse enter on bars
  const handleMouseOver = useCallback((data) => {
    if (data && data.activeLabel) {
      setHoveredDate(data.activeLabel);
    }
  }, []);

  // Handler for mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredDate(null);
  }, []);

  // Custom tooltip com efeito glassmorphism
  const customTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Formatar a data para exibição
      let displayDate = label;
      const isGroupedData = payload[0]?.payload?.isGrouped;
      const isMonthlyData = payload[0]?.payload?.isMonthly;

      if (!isGroupedData && !isMonthlyData) {
        try {
          // Tentar interpretar o formato dd/MM para data diária
          const parsedDate = parse(label, 'dd/MM', new Date());
          if (isValid(parsedDate)) {
            displayDate = format(parsedDate, 'dd MMMM', { locale: ptBR });
          }
        } catch (e) {
          // Manter o formato original se falhar
        }
      }

      return (
        <div className="bg-white/90 backdrop-blur-md p-4 border border-purple-100 shadow-lg rounded-lg">
          <p className="font-medium text-gray-800 mb-2 border-b border-purple-50 pb-1">
            {isMonthlyData
              ? `Mês: ${label}`
              : isGroupedData
                ? `Período: ${label}`
                : `Data: ${displayDate}`}
          </p>
          <div className="flex items-center py-1">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS.indicacoes }}
            ></div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Indicações: </span>
              <span>{payload[0].value}</span>
            </p>
          </div>
          <div className="mt-1 pt-1 border-t border-purple-50 text-xs text-gray-500">
            {isMonthlyData
              ? 'Total de indicações no mês'
              : isGroupedData
                ? 'Total de indicações no período'
                : 'Total de indicações neste dia'}
          </div>
        </div>
      );
    }

    return null;
  }, []);

  // Função para formatar a data no eixo X
  const formatXAxis = (dateStr: string) => {
    // Se já for um nome de mês, mantemos como está (para dados mensais)
    if (processedData[0]?.isMonthly) {
      // Capitaliza a primeira letra do mês
      return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }

    // Verificar se é um intervalo de datas agrupadas (contém '-')
    if (dateStr.includes('-')) {
      const parts = dateStr.split(' - ');
      if (parts.length === 2) {
        // Para intervalos, mostrar apenas o primeiro dia de cada intervalo
        try {
          const firstDate = parse(parts[0], 'dd/MM', new Date());
          if (isValid(firstDate)) {
            return format(firstDate, 'dd/MM');
          }
        } catch (e) {
          // Fallback se não conseguir parsear
          return parts[0];
        }
      }
      return dateStr;
    }

    // Para dias individuais
    try {
      // Tentar interpretar o formato dd/MM
      const parsedDate = parse(dateStr, 'dd/MM', new Date());
      if (isValid(parsedDate)) {
        // Formatação mais amigável - apenas dia
        return format(parsedDate, 'dd');
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Encontre o valor máximo para o eixo Y com um pequeno espaço adicional
  const maxValue = Math.max(...processedData.map(item => item.indicacoes), 1); // Mínimo de 1 para evitar gráfico vazio
  const yAxisMax = Math.ceil(maxValue * 1.2); // Adiciona 20% de espaço acima

  // Determinar o tamanho das barras com base na quantidade de dados
  const barSize = useMemo(() => {
    if (processedData.length > 30) return 8;
    if (processedData.length > 20) return 12;
    if (processedData.length > 10) return 20;
    if (processedData.length > 5) return 40;
    return 50; // Barras maiores para poucos meses
  }, [processedData.length]);

  return (
    <div className="relative h-[300px] w-full">
      {/* Efeitos decorativos de blur */}
      <div className="absolute -left-10 top-20 w-32 h-32 rounded-full bg-purple-400/10 blur-xl pointer-events-none"></div>
      <div className="absolute -right-10 bottom-10 w-40 h-40 rounded-full bg-purple-500/5 blur-xl pointer-events-none"></div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 20,
          }}
          onMouseMove={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradiente para as barras */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.indicacoes} stopOpacity={0.9} />
              <stop offset="100%" stopColor={COLORS.indicacoes} stopOpacity={0.5} />
            </linearGradient>

            {/* Filtro de sombra */}
            <filter id="barShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#9e46d3" floodOpacity="0.2" />
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
            className="opacity-50"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
            tickFormatter={formatXAxis}
            padding={{ left: 10, right: 10 }}
            // Adicionando label para o eixo X
            label={{
              value: processedData[0]?.isMonthly ? 'Mês' : processedData[0]?.isGrouped ? 'Período' : 'Dia do mês',
              position: 'insideBottom',
              offset: -5,
              style: { fill: '#666', fontSize: 12 }
            }}
            // Se tivermos muitos dados, não mostrar todos os ticks para evitar sobreposição
            interval={processedData.length > 30 ? 1 : 0}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
            allowDecimals={false}
            domain={[0, yAxisMax]}
            label={{
              value: 'Indicações',
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: { fill: '#666', fontSize: 12 }
            }}
          />

          <Tooltip
            content={customTooltip}
            cursor={{ fill: 'rgba(158, 70, 211, 0.1)' }}
          />

          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            iconSize={8}
            formatter={() => (
              <span className="text-sm text-gray-700 flex items-center">
                <span
                  className="w-2 h-2 rounded-full mr-1 inline-block"
                  style={{ backgroundColor: COLORS.indicacoes }}
                ></span>
                {processedData[0]?.isMonthly
                  ? 'Indicações por Mês'
                  : processedData[0]?.isGrouped
                    ? 'Indicações por Período'
                    : 'Indicações por Dia'}
              </span>
            )}
            wrapperStyle={{
              paddingTop: '10px',
              borderTop: '1px solid #f0f0f0'
            }}
          />

          {/* Linha de referência vertical para data em hover */}
          {hoveredDate && (
            <ReferenceLine
              x={hoveredDate}
              stroke="#9e46d3"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              opacity={0.7}
            />
          )}

          <Bar
            dataKey="indicacoes"
            name="Indicações"
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            barSize={barSize}
            filter="url(#barShadow)"
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={hoveredDate === entry.date ? COLORS.hoverColor : "url(#barGradient)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;