import { StatusData } from '@/types/supabase';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, Sector } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';

interface StatusChartProps {
  data: StatusData[];
}

export const StatusChart = ({ data }: StatusChartProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Paleta de cores com gradientes
  const COLORS = [
    ['#a54bd9', '#7928ca'], // Gradiente roxo principal
    ['#4361ee', '#3a86ff']  // Gradiente azul complementar
  ];

  // Efeito para animar o gráfico após montagem
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Processamento dos dados
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const convertidosItem = data.find(item => item.status === 'Convertido');
    const convertidosValue = convertidosItem?.value || 0;
    const naoConvertidosValue = total - convertidosValue;

    const percentageConvertidos = ((convertidosValue / total) * 100).toFixed(1);
    const percentageNaoConvertidos = ((naoConvertidosValue / total) * 100).toFixed(1);

    return [
      {
        status: 'Não Convertido',
        value: naoConvertidosValue,
        percentage: percentageNaoConvertidos
      },
      {
        status: 'Convertido',
        value: convertidosValue,
        percentage: percentageConvertidos
      }
    ];
  }, [data]);

  // Tooltip sofisticado com glassmorphism e visual aprimorado
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const isConvertido = item.name === 'Convertido';

      return (
        <div className="custom-tooltip relative p-0 overflow-hidden">
          {/* Container do tooltip com efeito glassmorphism */}
          <div className="relative bg-white/90 backdrop-blur-md p-4 border border-purple-200 shadow-xl rounded-lg overflow-hidden z-10">
            {/* Efeito de blur decorativo */}
            <div className={`absolute ${isConvertido ? '-right-4 -bottom-4' : '-left-4 -top-4'} w-16 h-16 rounded-full ${isConvertido ? 'bg-purple-400/20' : 'bg-blue-400/20'} blur-xl`}></div>

            {/* Cabeçalho com destaque */}
            <div className={`-mx-4 -mt-4 mb-3 py-2 px-4 ${isConvertido ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/5' : 'bg-gradient-to-r from-blue-500/10 to-blue-600/5'}`}>
              <p className={`font-semibold text-base ${isConvertido ? 'text-purple-800' : 'text-blue-800'}`}>
                {item.name}
              </p>
            </div>

            {/* Informações e métricas */}
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, ${isConvertido ? COLORS[1][0] : COLORS[0][0]}, ${isConvertido ? COLORS[1][1] : COLORS[0][1]})`
                }}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {item.value} indicações
                </p>
              </div>

              <div className="mt-2 bg-gray-50 rounded-lg p-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Percentual:</span>
                  <span className={`font-medium ${isConvertido ? 'text-purple-700' : 'text-blue-700'}`}>
                    {item.payload.percentage}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isConvertido ? 'bg-purple-600' : 'bg-blue-600'}`}
                    style={{ width: `${item.payload.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Rótulos no interior do gráfico com efeito brilhante
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const isConvertido = index === 1;

    // Brilho especial para destacar a porcentagem
    return (
      <g>
        {/* Sombra de texto para efeito 3D */}
        <text
          x={x}
          y={y}
          fill="rgba(0,0,0,0.15)"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="font-bold text-xl"
          dx={1}
          dy={1}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>

        {/* Texto principal */}
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="font-bold text-xl"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  // Forma ativa sofisticada com efeitos visuais aprimorados
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const isConvertido = payload.status === 'Convertido';

    // Cores de gradiente baseadas no tipo de status
    const gradientColors = isConvertido ? COLORS[1] : COLORS[0];
    const gradientId = `gradient-${payload.status.replace(/\s+/g, '-').toLowerCase()}`;
    const pulseGradientId = `pulse-${payload.status.replace(/\s+/g, '-').toLowerCase()}`;
    const shadowId = `shadow-${payload.status.replace(/\s+/g, '-').toLowerCase()}`;
    const glowId = `glow-${payload.status.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <g>
        <defs>
          {/* Gradiente para o setor principal */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>

          {/* Gradiente pulsante para o anel externo */}
          <linearGradient id={pulseGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColors[0]} stopOpacity="0.7" />
            <stop offset="100%" stopColor={gradientColors[1]} stopOpacity="0.1" />
          </linearGradient>

          {/* Filtro de sombra */}
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={gradientColors[0]} floodOpacity="0.4" />
          </filter>

          {/* Filtro de brilho */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6" intercept="0" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
          </filter>
        </defs>

        {/* Camada de brilho */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={`url(#${gradientId})`}
          opacity={0.3}
          filter={`url(#${glowId})`}
        />

        {/* Setor principal com gradiente */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={`url(#${gradientId})`}
          filter={`url(#${shadowId})`}
        />

        {/* Anel externo com efeito pulsante */}
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 20}
          fill={`url(#${pulseGradientId})`}
          className="animate-pulse"
        />

        {/* Informações textuais no centro */}
        <foreignObject x={cx - 80} y={cy - 60} width="160" height="120">
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-2">
            <div className={`text-base font-medium ${isConvertido ? 'text-purple-700' : 'text-blue-700'} mb-1`}>
              {payload.status}
            </div>
            <div className={`text-2xl font-bold ${isConvertido ? 'text-purple-800' : 'text-blue-800'}`}>
              {value}
            </div>
            <div className={`text-xs mt-1 ${isConvertido ? 'text-purple-600' : 'text-blue-600'}`}>
              {payload.percentage}% do total
            </div>

            {/* Botão sutil para mais detalhes */}
            <div className={`mt-2 text-xs px-3 py-1 rounded-full ${isConvertido
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
              Ver detalhes
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  // Funções para gerenciar interações
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="relative w-full h-[350px]">
      {/* Efeitos decorativos de blur aprimorados */}
      <div className="absolute -left-10 top-10 w-40 h-40 rounded-full bg-purple-400/15 blur-2xl pointer-events-none opacity-80"></div>
      <div className="absolute right-10 bottom-10 w-48 h-48 rounded-full bg-blue-300/10 blur-3xl pointer-events-none opacity-80"></div>

      {/* Círculos decorativos translúcidos - reduzidos para 2 */}
      <div className="absolute top-1/4 right-1/3 w-8 h-8 rounded-full bg-purple-200/20 animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 left-1/4 w-6 h-6 rounded-full bg-blue-200/20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {/* Definições dos gradientes */}
          <defs>
            {COLORS.map((colorSet, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`gradient-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={colorSet[0]} />
                <stop offset="100%" stopColor={colorSet[1]} />
              </linearGradient>
            ))}
          </defs>

          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={4}
            dataKey="value"
            labelLine={false}
            label={activeIndex === -1 ? renderCustomizedLabel : undefined}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={1200}
            animationBegin={200}
            className="drop-shadow-xl"
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${index})`}
                stroke="white"
                strokeWidth={4}
                className={animationComplete ? "transition-all duration-300" : ""}
              />
            ))}
          </Pie>

          <Tooltip content={customTooltip} />

          <Legend
            verticalAlign="bottom"
            height={45}
            iconType="circle"
            iconSize={12}
            formatter={(value, entry: any, index) => {
              // Identificar qual item está sendo renderizado
              const isConvertido = value === 'Convertido';
              const colorSet = COLORS[index % COLORS.length];

              return (
                <div className={`flex items-center group cursor-pointer ${activeIndex === index ? 'opacity-100' : 'opacity-80'
                  } hover:opacity-100 transition-opacity`}>
                  {/* Ícone com gradiente */}
                  <div
                    className="w-4 h-4 rounded-full mr-2 border-2 border-white shadow-sm relative group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${colorSet[0]}, ${colorSet[1]})`
                    }}
                  />
                  <span className={`text-base ${isConvertido ? 'text-purple-800' : 'text-blue-800'
                    } font-medium group-hover:font-semibold transition-all`}>
                    {value} ({entry.payload.percentage}%)
                  </span>
                </div>
              );
            }}
            wrapperStyle={{
              paddingTop: '15px',
              borderTop: '1px solid rgba(158, 70, 211, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem'
            }}
            onClick={(data: any) => {
              const index = data?.index ?? -1;
              setActiveIndex(index === activeIndex ? -1 : index);
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Indicador de atualização */}
      <div className="absolute bottom-0 right-0 text-xs text-gray-400 mr-1">
        Última atualização: agora
      </div>
    </div>
  );
};

export default StatusChart;