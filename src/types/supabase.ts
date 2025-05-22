export interface Indicador {
  telefone: string;
  nome: string | null;
  data_criacao: string | null;
  sobrenome: string | null;
  email: string | null;
  cpf: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  total_indicacoes?: number;
  indicacoes_convertidas?: number;
}

export interface Indicado {
  telefone: string;
  nome: string | null;
  data_criacao: string | null;
  id_indicador: string | null;
  cadastrado: boolean | null;
}

export interface DashboardStats {
  totalIndicacoes: number;
  taxaConversao: number;
  leadsNovos: number;
  indicacoesConvertidas: number;
  totalIndicadosNaoCadastrados: number;
  totalIndicadosCadastrados: number;
  percentVariacaoTotal: number;
  percentVariacaoConversao: number;
  percentVariacaoLeads: number;
  percentVariacaoConvertidas: number;
}

export interface TrendData {
  date: string;
  novas: number;
  contatadas: number;
  convertidas: number;
}

export interface StatusData {
  status: string;
  value: number;
  percentage: number;
}
