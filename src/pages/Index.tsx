import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleCheck, Info, X, TrendingUp, Users, UserCheck, UserX, BarChart3, ArrowUpRight, User, Phone, Mail, Calendar, Globe, Database, BarChart, PieChart } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import logoImg from "@/assets/Logo.webp";
import TrendChart from "@/components/dashboard/TrendChart";
import StatusChart from "@/components/dashboard/StatusChart";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import UserProfile from "@/components/dashboard/UserProfile";
import {
  fetchDashboardStats,
  fetchTrendData,
  fetchStatusData,
  fetchIndicadores,
  fetchIndicados
} from "@/services/dashboardService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import IndicadoresTable from "@/components/dashboard/IndicadoresTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Indicador, Indicado } from "@/types/supabase";
import IndicadosTable from "@/components/dashboard/IndicadosTable";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';

// Definição dos ícones para cada stat card
const statCardIcons = {
  "Total de Indicações": <TrendingUp className="text-purple-100" size={20} />,
  "Taxa de Conversão": <BarChart3 className="text-purple-100" size={20} />,
  "Indicadores": <UserCheck className="text-purple-100" size={20} />,
  "Indicações não Convertidas": <UserX className="text-purple-100" size={20} />,
  "Indicações Convertidas": <CircleCheck className="text-purple-100" size={20} />
};

// Interface para o componente ModernStatCard
interface ModernStatCardProps {
  title: string;
  value: string | number;
  percentChange?: number;
  period?: string;
}

const tabs = [
  { id: "visao-geral", label: "Visão Geral" },
  { id: "indicadores", label: "Indicadores" },
  { id: "utms", label: "UTMs" }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [periodDays, setPeriodDays] = useState("7");
  const [selectedIndicador, setSelectedIndicador] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to get the actual number of days from the period value
  const getActualDays = (periodValue: string) => {
    if (periodValue.startsWith('custom_')) {
      return parseInt(periodValue.split('_')[1]);
    }
    return parseInt(periodValue);
  };

  // Get period label for display
  const getPeriodLabel = (periodValue: string) => {
    if (periodValue.startsWith('custom_')) {
      return "período personalizado";
    } else if (periodValue === "90") {
      return "3 meses";
    } else {
      return `${periodValue} dias`;
    }
  };

  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ["dashboardStats", periodDays],
    queryFn: () => fetchDashboardStats(getActualDays(periodDays)),
  });

  const {
    data: trendData,
    isLoading: isLoadingTrend
  } = useQuery({
    queryKey: ["trendData", periodDays],
    queryFn: () => fetchTrendData(getActualDays(periodDays)),
  });

  const {
    data: statusData,
    isLoading: isLoadingStatus
  } = useQuery({
    queryKey: ["statusData"],
    queryFn: fetchStatusData,
  });

  const {
    data: indicadores,
    isLoading: isLoadingIndicadores
  } = useQuery({
    queryKey: ["indicadores"],
    queryFn: fetchIndicadores,
  });

  const {
    data: indicados,
    isLoading: isLoadingIndicados
  } = useQuery({
    queryKey: ["indicados", selectedIndicador?.telefone],
    queryFn: () => selectedIndicador ? fetchIndicados(selectedIndicador.telefone) : Promise.resolve([]),
    enabled: !!selectedIndicador
  });

  // Fetch raw indicador data
  const {
    data: rawIndicadores,
    isLoading: isLoadingRawIndicadores
  } = useQuery({
    queryKey: ["rawIndicadores"],
    queryFn: () => fetchIndicadores(),
  });

  // Process UTM data for charts
  const utmSourceData = useMemo(() => {
    if (!rawIndicadores) return [];

    const sourceMap = new Map();

    rawIndicadores.forEach(indicador => {
      if (indicador.utm_source) {
        const source = indicador.utm_source;
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      }
    });

    return Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value,
      percent: value / rawIndicadores.length
    }));
  }, [rawIndicadores]);

  const utmMediumData = useMemo(() => {
    if (!rawIndicadores) return [];

    const mediumMap = new Map();

    rawIndicadores.forEach(indicador => {
      if (indicador.utm_medium) {
        const medium = indicador.utm_medium;
        mediumMap.set(medium, (mediumMap.get(medium) || 0) + 1);
      }
    });

    return Array.from(mediumMap.entries()).map(([name, value]) => ({
      name,
      value,
      percent: value / rawIndicadores.length
    }));
  }, [rawIndicadores]);

  const utmCampaignData = useMemo(() => {
    if (!rawIndicadores) return [];

    const campaignMap = new Map();

    rawIndicadores.forEach(indicador => {
      if (indicador.utm_campaign) {
        const campaign = indicador.utm_campaign;
        campaignMap.set(campaign, (campaignMap.get(campaign) || 0) + 1);
      }
    });

    return Array.from(campaignMap.entries())
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Get top 8 campaigns
  }, [rawIndicadores]);

  const utmContentData = useMemo(() => {
    if (!rawIndicadores) return [];

    const contentMap = new Map();

    rawIndicadores.forEach(indicador => {
      if (indicador.utm_content) {
        const content = indicador.utm_content;
        contentMap.set(content, (contentMap.get(content) || 0) + 1);
      }
    });

    return Array.from(contentMap.entries())
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Get top 8 contents
  }, [rawIndicadores]);

  const handleIndicadorClick = (indicador) => {
    setSelectedIndicador(indicador);
    setIsModalOpen(true);
  };

  // Componente de cartão de estatística modificado para incluir ícone e efeito de blur
  const ModernStatCard = ({ title, value, percentChange, period }: ModernStatCardProps) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden relative group hover:shadow-md transition-all duration-300">
        {/* Background blur effect - visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Purple accent circle with blur */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-purple-500/20 blur-xl"></div>

        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              {statCardIcons[title]}
            </div>
            {percentChange !== undefined && (
              <div className={`flex items-center text-sm font-medium ${percentChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {percentChange >= 0 ? '+' : ''}{percentChange}%
                <ArrowUpRight className={`ml-1 h-3 w-3 ${percentChange >= 0 ? '' : 'transform rotate-180'}`} />
              </div>
            )}
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {period && <p className="text-xs text-gray-500 mt-1">{period}</p>}
        </div>
      </div>
    );
  };

  // Custom tooltip component for pie charts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg p-4 border border-purple-200 shadow-xl rounded-xl">
          <p className="font-semibold text-gray-800 mb-2">
            {payload[0].name}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Quantidade: </span>
              <span className="text-purple-600 font-semibold">{payload[0].value}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Percentual: </span>
              <span className="text-purple-600 font-semibold">{(payload[0].payload.percent * 100).toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar charts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg p-4 border border-purple-200 shadow-xl rounded-xl">
          <p className="font-semibold text-gray-800 mb-2">
            {label}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Indicações: </span>
            <span className="text-purple-600 font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Enhanced colors for charts
  const COLORS = [
    '#8B5CF6', // Purple primary
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5A2B', // Brown
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
  ];

  // Custom label renderer for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <TooltipProvider>
        {/* Círculo de blur decorativo */}
        <div className="fixed -top-20 -right-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>
        <div className="fixed -bottom-20 -left-20 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex justify-between items-center mb-4">
            <img
              src={logoImg}
              alt="Logo"
              className="h-16"
            />
            <UserProfile />
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
            {/* Efeito de blur no background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-700/30 backdrop-blur-sm"></div>
            <div className="absolute -right-10 top-10 w-40 h-40 rounded-full bg-purple-400/30 blur-xl"></div>
            <div className="absolute left-40 bottom-0 w-20 h-20 rounded-full bg-white/20 blur-lg"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard de Indicações</h1>
                <p className="text-purple-100 mt-1">
                  Acompanhe e analise o desempenho do programa de indicações
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="mt-2 md:mt-0 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                  <PeriodSelector
                    value={periodDays}
                    onChange={setPeriodDays}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-white/70 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-purple-100">
            <DashboardTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Enhanced UTMs Tab */}
          {activeTab === "utms" && (
            <div className="space-y-8">
              {/* UTM Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="text-purple-100" size={24} />
                    <span className="text-purple-100 text-sm font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-bold">{utmSourceData.reduce((acc, item) => acc + item.value, 0)}</div>
                  <div className="text-purple-100 text-sm">Indicações com UTM</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="text-cyan-100" size={24} />
                    <span className="text-cyan-100 text-sm font-medium">Fontes</span>
                  </div>
                  <div className="text-2xl font-bold">{utmSourceData.length}</div>
                  <div className="text-cyan-100 text-sm">Diferentes origens</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart className="text-emerald-100" size={24} />
                    <span className="text-emerald-100 text-sm font-medium">Campanhas</span>
                  </div>
                  <div className="text-2xl font-bold">{utmCampaignData.length}</div>
                  <div className="text-emerald-100 text-sm">Campanhas ativas</div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <PieChart className="text-amber-100" size={24} />
                    <span className="text-amber-100 text-sm font-medium">Conteúdos</span>
                  </div>
                  <div className="text-2xl font-bold">{utmContentData.length}</div>
                  <div className="text-amber-100 text-sm">Tipos de conteúdo</div>
                </div>
              </div>

              {/* Source and Medium Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"></div>
                  
                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
                      <div className="p-2 bg-purple-600 rounded-lg mr-3">
                        <Globe className="text-white" size={20} />
                      </div>
                      Distribuição por Origem
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Canais de aquisição de leads (UTM Source)
                    </p>
                  </div>

                  {isLoadingRawIndicadores ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={utmSourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={140}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={2}
                          >
                            {utmSourceData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomPieTooltip />} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={60}
                            formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                  <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"></div>

                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
                      <div className="p-2 bg-cyan-600 rounded-lg mr-3">
                        <BarChart3 className="text-white" size={20} />
                      </div>
                      Distribuição por Meio
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Métodos de marketing utilizados (UTM Medium)
                    </p>
                  </div>

                  {isLoadingRawIndicadores ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-600 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={utmMediumData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={140}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={2}
                          >
                            {utmMediumData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[(index + 3) % COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomPieTooltip />} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={60}
                            formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign and Content Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 blur-2xl"></div>

                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
                      <div className="p-2 bg-emerald-600 rounded-lg mr-3">
                        <TrendingUp className="text-white" size={20} />
                      </div>
                      Top Campanhas
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Campanhas com melhor performance (UTM Campaign)
                    </p>
                  </div>

                  {isLoadingRawIndicadores ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={utmCampaignData}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 100,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            type="number" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={90}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                          />
                          <RechartsTooltip content={<CustomBarTooltip />} />
                          <Bar
                            dataKey="value"
                            fill="url(#emeraldGradient)"
                            radius={[0, 8, 8, 0]}
                          />
                          <defs>
                            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                          </defs>
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                  <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-2xl"></div>

                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
                      <div className="p-2 bg-amber-600 rounded-lg mr-3">
                        <BarChart className="text-white" size={20} />
                      </div>
                      Top Conteúdos
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Conteúdos mais eficazes (UTM Content)
                    </p>
                  </div>

                  {isLoadingRawIndicadores ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={utmContentData}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 100,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            type="number" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={90}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                          />
                          <RechartsTooltip content={<CustomBarTooltip />} />
                          <Bar
                            dataKey="value"
                            fill="url(#amberGradient)"
                            radius={[0, 8, 8, 0]}
                          />
                          <defs>
                            <linearGradient id="amberGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                          </defs>
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* UTM Performance Summary */}
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl"></div>
                
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mr-4">
                      <BarChart3 className="text-white" size={24} />
                    </div>
                    Resumo de Performance UTM
                  </h3>
                  <p className="text-gray-600">
                    Análise detalhada dos parâmetros de rastreamento mais eficazes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  {/* Best performing source */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <Globe className="text-purple-600" size={20} />
                      <span className="text-xs font-semibold text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
                        TOP SOURCE
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-800 mb-1">
                      {utmSourceData.length > 0 ? utmSourceData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
                    </div>
                    <div className="text-sm text-purple-600">
                      {utmSourceData.length > 0 ? `${utmSourceData.sort((a, b) => b.value - a.value)[0].value} indicações` : '0 indicações'}
                    </div>
                  </div>

                  {/* Best performing medium */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200">
                    <div className="flex items-center justify-between mb-3">
                      <BarChart3 className="text-cyan-600" size={20} />
                      <span className="text-xs font-semibold text-cyan-600 bg-cyan-200 px-2 py-1 rounded-full">
                        TOP MEDIUM
                      </span>
                    </div>
                    <div className="text-lg font-bold text-cyan-800 mb-1">
                      {utmMediumData.length > 0 ? utmMediumData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
                    </div>
                    <div className="text-sm text-cyan-600">
                      {utmMediumData.length > 0 ? `${utmMediumData.sort((a, b) => b.value - a.value)[0].value} indicações` : '0 indicações'}
                    </div>
                  </div>

                  {/* Best performing campaign */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="text-emerald-600" size={20} />
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">
                        TOP CAMPAIGN
                      </span>
                    </div>
                    <div className="text-lg font-bold text-emerald-800 mb-1">
                      {utmCampaignData.length > 0 ? utmCampaignData[0].name : 'N/A'}
                    </div>
                    <div className="text-sm text-emerald-600">
                      {utmCampaignData.length > 0 ? `${utmCampaignData[0].value} indicações` : '0 indicações'}
                    </div>
                  </div>

                  {/* Best performing content */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <BarChart className="text-amber-600" size={20} />
                      <span className="text-xs font-semibold text-amber-600 bg-amber-200 px-2 py-1 rounded-full">
                        TOP CONTENT
                      </span>
                    </div>
                    <div className="text-lg font-bold text-amber-800 mb-1">
                      {utmContentData.length > 0 ? utmContentData[0].name : 'N/A'}
                    </div>
                    <div className="text-sm text-amber-600">
                      {utmContentData.length > 0 ? `${utmContentData[0].value} indicações` : '0 indicações'}
                    </div>
                  </div>
                </div>

                {/* Performance insights */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 relative z-10">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <Info className="mr-2 text-blue-600" size={18} />
                    Insights de Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-blue-700">
                      <span className="font-medium">Diversificação:</span> {utmSourceData.length} fontes diferentes gerando tráfego
                    </div>
                    <div className="text-blue-700">
                      <span className="font-medium">Concentração:</span> Top 3 campanhas respondem por {utmCampaignData.slice(0, 3).reduce((acc, item) => acc + item.value, 0)} indicações
                    </div>
                    <div className="text-blue-700">
                      <span className="font-medium">Eficiência:</span> {utmMediumData.length} métodos de marketing ativos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "visao-geral" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <ModernStatCard
                  title="Total de Indicações"
                  value={isLoadingStats ? "..." : stats?.totalIndicacoes || 0}
                  percentChange={stats?.percentVariacaoTotal}
                  period={`Últimos ${getPeriodLabel(periodDays)}`}
                />
                <ModernStatCard
                  title="Taxa de Conversão"
                  value={`${isLoadingStats ? "..." : stats?.taxaConversao || 0}%`}
                  percentChange={stats?.percentVariacaoConversao}
                  period={`Últimos ${getPeriodLabel(periodDays)}`}
                />
                <ModernStatCard
                  title="Indicadores"
                  value={isLoadingStats ? "..." : stats?.totalIndicadosCadastrados || 0}
                  period={`Últimos ${getPeriodLabel(periodDays)}`}
                />
                <ModernStatCard
                  title="Indicações não Convertidas"
                  value={isLoadingStats ? "..." : stats?.totalIndicadosNaoCadastrados || 0}
                  period={`Últimos ${getPeriodLabel(periodDays)}`}
                />
                <ModernStatCard
                  title="Indicações Convertidas"
                  value={isLoadingStats ? "..." : stats?.indicacoesConvertidas || 0}
                  percentChange={stats?.percentVariacaoConvertidas}
                  period={`Últimos ${getPeriodLabel(periodDays)}`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-purple-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  {/* Efeito de blur decorativo */}
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="mb-4 relative z-10">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <TrendingUp className="mr-2 text-purple-600" size={18} />
                      Indicações por Dia
                    </h3>
                    <p className="text-sm text-gray-500">
                      {periodDays === "90"
                        ? "Distribuição mensal dos últimos 3 meses"
                        : periodDays.startsWith('custom_')
                          ? `Distribuição nos últimos ${getActualDays(periodDays)} dias`
                          : `Distribuição diária dos últimos ${periodDays} dias`
                      }
                    </p>
                  </div>
                  {isLoadingTrend ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <TrendChart data={trendData || []} />
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-purple-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  {/* Efeito de blur decorativo */}
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="mb-4 relative z-10">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BarChart3 className="mr-2 text-purple-600" size={18} />
                      Taxa de Conversão
                    </h3>
                    <p className="text-sm text-gray-500">
                      Proporção de leads convertidos vs não convertidos
                    </p>
                  </div>
                  {isLoadingStatus ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin"></div>
                      </div>
                    </div>
                  ) : (
                    <StatusChart data={statusData || []} />
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "indicadores" && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-purple-100 relative overflow-hidden">
              {/* Efeito de blur decorativo */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center relative z-10">
                <Users className="mr-2 text-purple-600" size={20} />
                Lista de Indicadores
              </h3>
              {isLoadingIndicadores ? (
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10">
                  <IndicadoresTable
                    data={indicadores || []}
                    onRowClick={handleIndicadorClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl bg-white/90 backdrop-blur-md border border-purple-200 rounded-xl shadow-lg" aria-describedby="dialog-description">
            <DialogHeader className="pb-2 border-b border-purple-100">
              <DialogTitle className="flex items-center">
                <span className="text-purple-800 flex items-center">
                  <Users className="mr-2 text-purple-600" size={18} />
                  Indicados por: {selectedIndicador?.nome} {selectedIndicador?.sobrenome}
                </span>
              </DialogTitle>
            </DialogHeader>

            {/* Detalhes do indicador incluindo todos os campos UTM */}
            <div className="py-3 border-b border-purple-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Informações do Indicador</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm text-gray-700">{selectedIndicador?.nome} {selectedIndicador?.sobrenome}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm text-gray-700">{selectedIndicador?.telefone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm text-gray-700">{selectedIndicador?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm text-gray-700">
                        {selectedIndicador?.data_criacao ? format(parseISO(selectedIndicador.data_criacao), "dd/MM/yyyy") : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Origem do Lead</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedIndicador?.utm_source ? (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          Fonte: {selectedIndicador.utm_source}
                        </span>
                      </div>
                    ) : null}

                    {selectedIndicador?.utm_campaign ? (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          Campanha: {selectedIndicador.utm_campaign}
                        </span>
                      </div>
                    ) : null}

                    {selectedIndicador?.utm_content ? (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-emerald-500" />
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Conteúdo: {selectedIndicador.utm_content}
                        </span>
                      </div>
                    ) : null}

                    {!selectedIndicador?.utm_source && !selectedIndicador?.utm_campaign && !selectedIndicador?.utm_content && (
                      <span className="text-sm text-gray-500">Sem informações de origem disponíveis</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 relative">
              {/* Hidden description for accessibility */}
              <span id="dialog-description" className="sr-only">Lista de pessoas indicadas pelo indicador selecionado</span>
              {/* Efeito de blur decorativo */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-purple-500/10 blur-xl"></div>

              {isLoadingIndicados ? (
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin"></div>
                  </div>
                </div>
              ) : indicados && indicados.length > 0 ? (
                <div className="relative z-10">
                  <IndicadosTable data={indicados} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 relative z-10">
                  <UserX className="mx-auto mb-2 text-purple-300" size={32} />
                  Este indicador ainda não possui indicações.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
};

export default Index;