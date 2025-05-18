import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleCheck, Info, X, TrendingUp, Users, UserCheck, UserX, BarChart3, ArrowUpRight } from "lucide-react";
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
  { id: "indicadores", label: "Indicadores" }
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