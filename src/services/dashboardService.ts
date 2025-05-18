import { supabase } from '@/lib/supabase';
import { DashboardStats, StatusData, TrendData, Indicador, Indicado } from '@/types/supabase';
import { format, subDays, parseISO, startOfDay, formatISO, isValid } from 'date-fns';

export const fetchDashboardStats = async (days = 7): Promise<DashboardStats> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  // Fetch total referrals
  const { count: totalIndicacoes } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true });

  // Fetch converted referrals
  const { count: indicacoesConvertidas } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true })
    .eq('cadastrado', true);

  // Fetch non-converted referrals
  const { count: indicacoesNaoCadastradas } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true })
    .eq('cadastrado', false);

  // Calculate conversion rate
  const taxaConversao = totalIndicacoes > 0
    ? (indicacoesConvertidas / totalIndicacoes) * 100
    : 0;

  // Fetch new leads in the selected period
  const { count: leadsNovos } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true })
    .gte('data_criacao', startDateStr)
    .lte('data_criacao', endDateStr);

  // Fetch previous period data for percentage comparisons
  const prevStartDate = subDays(startDate, days);
  const prevStartDateStr = format(prevStartDate, 'yyyy-MM-dd');

  // Previous period total
  const { count: prevTotalIndicacoes } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true })
    .gte('data_criacao', prevStartDateStr)
    .lt('data_criacao', startDateStr);

  // Previous period converted
  const { count: prevIndicacoesConvertidas } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true })
    .eq('cadastrado', true)
    .gte('data_criacao', prevStartDateStr)
    .lt('data_criacao', startDateStr);

  // Calculate percentage variations
  const percentVariacaoTotal = prevTotalIndicacoes > 0
    ? ((totalIndicacoes - prevTotalIndicacoes) / prevTotalIndicacoes) * 100
    : 0;

  const prevTaxaConversao = prevTotalIndicacoes > 0
    ? (prevIndicacoesConvertidas / prevTotalIndicacoes) * 100
    : 0;

  const percentVariacaoConversao = prevTaxaConversao > 0
    ? ((taxaConversao - prevTaxaConversao) / prevTaxaConversao) * 100
    : 0;

  const { count: prevLeadsNovos } = await supabase
    .from('indicado')
    .select('*', { count: 'exact', head: true })
    .gte('data_criacao', prevStartDateStr)
    .lt('data_criacao', startDateStr);

  const percentVariacaoLeads = prevLeadsNovos > 0
    ? ((leadsNovos - prevLeadsNovos) / prevLeadsNovos) * 100
    : 0;

  const percentVariacaoConvertidas = prevIndicacoesConvertidas > 0
    ? ((indicacoesConvertidas - prevIndicacoesConvertidas) / prevIndicacoesConvertidas) * 100
    : 0;

  return {
    totalIndicacoes: totalIndicacoes || 0,
    taxaConversao: parseFloat(taxaConversao.toFixed(1)),
    leadsNovos: leadsNovos || 0,
    indicacoesConvertidas: indicacoesConvertidas || 0,
    totalIndicadosCadastrados: indicacoesConvertidas || 0,
    totalIndicadosNaoCadastrados: indicacoesNaoCadastradas || 0,
    percentVariacaoTotal: parseFloat(percentVariacaoTotal.toFixed(1)),
    percentVariacaoConversao: parseFloat(percentVariacaoConversao.toFixed(1)),
    percentVariacaoLeads: parseFloat(percentVariacaoLeads.toFixed(1)),
    percentVariacaoConvertidas: parseFloat(percentVariacaoConvertidas.toFixed(1))
  };
};

export const fetchTrendData = async (days = 7): Promise<TrendData[]> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  // Fetch all data within date range - using full day range with time
  const { data: indicadosData, error } = await supabase
    .from('indicado')
    .select('*')
    .gte('data_criacao', format(startDate, 'yyyy-MM-dd\'T\'00:00:00'))
    .lte('data_criacao', format(endDate, 'yyyy-MM-dd\'T\'23:59:59'));

  if (error) {
    console.error('Error fetching indicados for trend:', error);
    return [];
  }

  // Create a map for each day in the range
  const trendData: TrendData[] = [];

  // Generate dates for the period
  for (let i = 0; i < days; i++) {
    const currentDate = subDays(endDate, days - 1 - i);
    const formattedDate = format(currentDate, 'dd/MM');
    const dayStart = startOfDay(currentDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Filter data for this specific day with better timestamp handling
    const dayData = indicadosData?.filter(indicado => {
      if (!indicado.data_criacao) return false;

      try {
        // Parse PostgreSQL timestamp format
        const indicadoDate = parseISO(indicado.data_criacao);

        // Check if it's a valid date before comparing
        if (!isValid(indicadoDate)) return false;

        return indicadoDate >= dayStart && indicadoDate <= dayEnd;
      } catch (e) {
        console.warn("Error parsing date:", indicado.data_criacao);
        return false;
      }
    }) || [];

    const novas = dayData.length;

    // For demo purposes, let's say contatadas is 60-90% of novas
    // In a real app, you'd have a field tracking if the lead was contacted
    const contatadas = Math.floor(novas * (0.6 + Math.random() * 0.3));

    // Get actual convertidas from data
    const convertidas = dayData.filter(indicado => indicado.cadastrado === true).length;

    trendData.push({
      date: formattedDate,
      novas,
      contatadas,
      convertidas
    });
  }

  return trendData;
};

export const fetchStatusData = async (): Promise<StatusData[]> => {
  try {
    // Fetch all indicados
    const { data, error } = await supabase
      .from('indicado')
      .select('*');

    if (error) {
      console.error('Error fetching status data:', error);
      return [];
    }

    // Count by status
    const total = data?.length || 0;
    const convertidos = data?.filter(indicado => indicado.cadastrado === true).length || 0;
    const naoConvertidos = total - convertidos;

    // Calculate percentages (com uma casa decimal para melhor precisão)
    const percentageConvertidos = total > 0 ? parseFloat(((convertidos / total) * 100).toFixed(1)) : 0;
    const percentageNaoConvertidos = total > 0 ? parseFloat(((naoConvertidos / total) * 100).toFixed(1)) : 0;

    // Ordered with 'Convertido' last for better visualization
    return [
      {
        status: 'Não Convertido',
        value: naoConvertidos,
        percentage: percentageNaoConvertidos
      },
      {
        status: 'Convertido',
        value: convertidos,
        percentage: percentageConvertidos
      }
    ];
  } catch (e) {
    console.error('Unexpected error in fetchStatusData:', e);
    return [];
  }
};

// New function to fetch indicadores with totals
export const fetchIndicadores = async (): Promise<Indicador[]> => {
  // First, get all indicadores
  const { data: indicadoresData, error: indicadoresError } = await supabase
    .from('indicador')
    .select('*')
    .order('data_criacao', { ascending: false });

  if (indicadoresError) {
    console.error('Error fetching indicadores:', indicadoresError);
    return [];
  }

  // If no indicadores, return empty array
  if (!indicadoresData || indicadoresData.length === 0) {
    return [];
  }

  // Get all indicados data to calculate totals
  const { data: indicadosData, error: indicadosError } = await supabase
    .from('indicado')
    .select('*');

  if (indicadosError) {
    console.error('Error fetching indicados:', indicadosError);
    return indicadoresData; // Return indicadores without totals
  }

  // Calculate totals for each indicador
  const indicadoresWithTotals = indicadoresData.map(indicador => {
    const indicadosByThisIndicador = indicadosData?.filter(
      indicado => indicado.id_indicador === indicador.telefone
    ) || [];

    const totalIndicacoes = indicadosByThisIndicador.length;
    const indicacoesConvertidas = indicadosByThisIndicador.filter(
      indicado => indicado.cadastrado === true
    ).length;

    return {
      ...indicador,
      total_indicacoes: totalIndicacoes,
      indicacoes_convertidas: indicacoesConvertidas
    };
  });

  return indicadoresWithTotals;
};

// New function to fetch indicados by indicador id
export const fetchIndicados = async (indicadorId: string): Promise<Indicado[]> => {
  const { data, error } = await supabase
    .from('indicado')
    .select('*')
    .eq('id_indicador', indicadorId)
    .order('data_criacao', { ascending: false });

  if (error) {
    console.error('Error fetching indicados:', error);
    return [];
  }

  return data || [];
};
