import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Indicador } from "@/types/supabase";
import { format, parseISO } from "date-fns";
import { 
  User, 
  Phone, 
  Mail, 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Search, 
  UserX, 
  X, 
  Globe, 
  Target,
  ExternalLink,
  Award,
  Activity,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";

interface IndicadoresTableProps {
  data: Indicador[];
  onRowClick: (indicador: Indicador) => void;
}

const IndicadoresTable = ({ data, onRowClick }: IndicadoresTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Indicador[]>(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const results = data.filter((indicador) => {
      const fullName = `${indicador.nome || ""} ${indicador.sobrenome || ""}`.toLowerCase();
      const email = (indicador.email || "").toLowerCase();
      const telefone = (indicador.telefone || "").toLowerCase();
      const origem = `${indicador.utm_source || ""} ${indicador.utm_campaign || ""} ${indicador.utm_content || ""}`.toLowerCase();

      return fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        telefone.includes(searchLower) ||
        origem.includes(searchLower);
    });

    setFilteredData(results);
  }, [searchTerm, data]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Data inválida";
    }
  };

  const calcularTaxaConversao = (total: number, convertidas: number) => {
    if (total === 0) return 0;
    return Math.round((convertidas / total) * 100);
  };

  const getOrigemInfo = (indicador: Indicador) => {
    const source = indicador.utm_source;

    return {
      source,
      hasOrigin: !!source
    };
  };

  const getOrigemColor = (source: string | null) => {
    if (!source) return "bg-gray-50 text-gray-600 border-gray-200";
    
    const colors: { [key: string]: string } = {
      'google': 'bg-blue-50 text-blue-700 border-blue-200',
      'facebook': 'bg-blue-50 text-blue-700 border-blue-200',
      'instagram': 'bg-pink-50 text-pink-700 border-pink-200',
      'whatsapp': 'bg-green-50 text-green-700 border-green-200',
      'email': 'bg-purple-50 text-purple-700 border-purple-200',
      'organic': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'direct': 'bg-gray-50 text-gray-700 border-gray-200',
      'referral': 'bg-orange-50 text-orange-700 border-orange-200'
    };

    const sourceKey = source.toLowerCase();
    return colors[sourceKey] || 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  const getPerformanceStatus = (taxaConversao: number) => {
    if (taxaConversao >= 80) return { color: 'text-emerald-600', icon: '🚀', label: 'Excelente' };
    if (taxaConversao >= 60) return { color: 'text-green-600', icon: '⭐', label: 'Muito Bom' };
    if (taxaConversao >= 40) return { color: 'text-yellow-600', icon: '👍', label: 'Bom' };
    if (taxaConversao >= 20) return { color: 'text-orange-600', icon: '📈', label: 'Regular' };
    return { color: 'text-red-600', icon: '📉', label: 'Baixo' };
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative">
      {/* Efeitos decorativos de blur no background */}
      <div className="absolute -left-10 top-20 w-32 h-32 rounded-full bg-purple-400/10 blur-xl pointer-events-none"></div>
      <div className="absolute -right-10 bottom-10 w-40 h-40 rounded-full bg-purple-500/5 blur-xl pointer-events-none"></div>

      {/* Cabeçalho da tabela com busca funcional e estatísticas */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-gray-800 mb-1">
              Indicadores Cadastrados
            </h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4 text-purple-500" />
                {filteredData.length} {filteredData.length === 1 ? 'indicador' : 'indicadores'}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-emerald-500" />
                {filteredData.reduce((acc, ind) => acc + (ind.total_indicacoes || 0), 0)} indicações totais
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {filteredData.reduce((acc, ind) => acc + (ind.indicacoes_convertidas || 0), 0)} convertidas
              </span>
            </div>
          </div>
          
          <div className="relative w-full sm:w-80">
            <div className="flex items-center rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2.5 text-sm text-gray-500 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300">
              <Search className="h-4 w-4 mr-2 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, telefone, email ou origem..."
                className="bg-transparent outline-none border-none w-full placeholder-gray-400"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600 ml-2">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Container da tabela com efeito glassmorphism */}
      <div className="rounded-xl bg-white/95 backdrop-blur-sm border border-purple-100 shadow-lg overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-purple-50 via-purple-100/60 to-purple-50 border-b border-purple-200">
                <TableHead className="py-4 text-purple-800 font-semibold">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-600" />
                    Indicador
                  </div>
                </TableHead>
                <TableHead className="py-4 text-purple-800 font-semibold">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-purple-600" />
                    Contato
                  </div>
                </TableHead>
                <TableHead className="py-4 text-purple-800 font-semibold">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-purple-600" />
                    Origem
                  </div>
                </TableHead>
                <TableHead className="py-4 text-purple-800 font-semibold">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-purple-600" />
                    Performance
                  </div>
                </TableHead>
                <TableHead className="py-4 text-purple-800 font-semibold">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                    Cadastro
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="h-12 w-12 text-purple-200 mb-3" />
                      <p className="text-gray-600 font-medium text-lg mb-1">
                        {searchTerm ? "Nenhum resultado encontrado" : "Nenhum indicador cadastrado"}
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        {searchTerm
                          ? "Tente buscar com outros termos ou limpe a busca."
                          : "Os indicadores cadastrados aparecerão aqui."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors font-medium"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((indicador) => {
                  const origemInfo = getOrigemInfo(indicador);
                  const taxaConversao = calcularTaxaConversao(
                    indicador.total_indicacoes || 0,
                    indicador.indicacoes_convertidas || 0
                  );
                  const performanceStatus = getPerformanceStatus(taxaConversao);

                  return (
                    <TableRow
                      key={indicador.telefone}
                      onClick={() => onRowClick(indicador)}
                      className="cursor-pointer transition-all duration-200 group border-b border-purple-50/50 hover:bg-purple-50/40 hover:shadow-sm"
                    >
                      {/* Coluna do Indicador */}
                      <TableCell className="font-medium py-4 relative">
                        <div className="absolute left-0 top-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center pl-2">
                          <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 rounded-full mr-3 shadow-sm">
                            <span className="font-bold text-sm">
                              {indicador.nome ? indicador.nome.charAt(0).toUpperCase() : "?"}
                              {indicador.sobrenome ? indicador.sobrenome.charAt(0).toUpperCase() : ""}
                            </span>
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium text-base">
                              {`${indicador.nome || ""} ${indicador.sobrenome || ""}`.trim() || "Nome não informado"}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-medium ${performanceStatus.color}`}>
                                {performanceStatus.icon} {performanceStatus.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                • {taxaConversao}% conversão
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Coluna de Contato */}
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <Phone className="h-3 w-3 mr-2 text-purple-500" />
                            <span className="font-medium">{indicador.telefone}</span>
                          </div>
                          {indicador.email && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-3 w-3 mr-2 text-purple-400" />
                              <span className="text-sm truncate max-w-[200px]">{indicador.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Coluna de Origem */}
                      <TableCell className="py-4">
                        {origemInfo.hasOrigin ? (
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getOrigemColor(origemInfo.source)}`}>
                              <Globe className="h-3 w-3 mr-1.5" />
                              {origemInfo.source}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Globe className="h-4 w-4 mr-2" />
                            <span className="text-sm">Origem não informada</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Coluna de Performance */}
                      <TableCell className="py-4">
                        <div className="space-y-3">
                          {/* Estatísticas principais */}
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {indicador.total_indicacoes || 0}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Total</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {indicador.indicacoes_convertidas || 0}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Convertidas</div>
                            </div>
                          </div>

                          {/* Barra de progresso melhorada */}
                          {(indicador.total_indicacoes || 0) > 0 && (
                            <div className="w-full">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">Taxa de Conversão</span>
                                <span className={`text-xs font-bold ${performanceStatus.color}`}>
                                  {taxaConversao}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(taxaConversao, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Coluna de Cadastro */}
                      <TableCell className="py-4 text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2 text-purple-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {formatDate(indicador.data_criacao)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {indicador.data_criacao && new Date(indicador.data_criacao).toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer com informações estatísticas */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-purple-100 text-sm text-gray-600 shadow-sm">
            Página 1 de 1 • {filteredData.length} {filteredData.length === 1 ? 'registro' : 'registros'}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-yellow-500" />
              <span>
                Melhor taxa: {Math.max(...filteredData.map(ind => calcularTaxaConversao(ind.total_indicacoes || 0, ind.indicacoes_convertidas || 0)))}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-purple-500" />
              <span>
                Média: {Math.round(filteredData.reduce((acc, ind) => acc + calcularTaxaConversao(ind.total_indicacoes || 0, ind.indicacoes_convertidas || 0), 0) / filteredData.length) || 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicadoresTable;