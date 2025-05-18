import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Indicador } from "@/types/supabase";
import { format, parseISO } from "date-fns";
import { User, Phone, Mail, TrendingUp, CheckCircle, Calendar, Search, UserX, X } from "lucide-react";
import { useState, useEffect } from "react";

interface IndicadoresTableProps {
  data: Indicador[];
  onRowClick: (indicador: Indicador) => void;
}

const IndicadoresTable = ({ data, onRowClick }: IndicadoresTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Indicador[]>(data);

  useEffect(() => {
    // Atualiza os dados filtrados quando os dados originais mudam
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    // Filtra os dados quando o termo de busca muda
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const results = data.filter((indicador) => {
      const fullName = `${indicador.nome || ""} ${indicador.sobrenome || ""}`.toLowerCase();
      const email = (indicador.email || "").toLowerCase();
      const telefone = (indicador.telefone || "").toLowerCase();

      return fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        telefone.includes(searchLower);
    });

    setFilteredData(results);
  }, [searchTerm, data]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };

  // Função para calcular a taxa de conversão em porcentagem
  const calcularTaxaConversao = (total: number, convertidas: number) => {
    if (total === 0) return 0;
    return Math.round((convertidas / total) * 100);
  };

  // Limpar busca
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative">
      {/* Efeitos decorativos de blur no background */}
      <div className="absolute -left-10 top-20 w-32 h-32 rounded-full bg-purple-400/10 blur-xl pointer-events-none"></div>
      <div className="absolute -right-10 bottom-10 w-40 h-40 rounded-full bg-purple-500/5 blur-xl pointer-events-none"></div>

      {/* Cabeçalho da tabela com busca funcional */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h4 className="text-sm font-medium text-gray-700">
          {filteredData.length} {filteredData.length === 1 ? 'indicador encontrado' : 'indicadores encontrados'}
        </h4>
        <div className="relative w-full sm:w-64">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm text-gray-500 shadow-sm">
            <Search className="h-4 w-4 mr-2 text-purple-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="bg-transparent outline-none border-none w-full placeholder-gray-400"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-1.5 text-xs text-gray-500">
              Buscando por: nome, telefone e email
            </div>
          )}
        </div>
      </div>

      {/* Container da tabela com efeito glassmorphism */}
      <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-sm overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-purple-50 to-purple-100/60 border-b border-purple-200">
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-500" />
                    Nome
                  </div>
                </TableHead>
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-purple-500" />
                    Telefone
                  </div>
                </TableHead>
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-purple-500" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                    Total
                  </div>
                </TableHead>
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                    Convertidas
                  </div>
                </TableHead>
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    Cadastro
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="h-10 w-10 text-purple-200 mb-2" />
                      <p className="text-gray-500 font-medium">
                        {searchTerm ? "Nenhum resultado encontrado para a busca" : "Nenhum indicador encontrado"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm
                          ? "Tente buscar com outros termos ou limpe a busca."
                          : "Os indicadores cadastrados aparecerão aqui."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="mt-3 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm transition-colors"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((indicador) => (
                  <TableRow
                    key={indicador.telefone}
                    onClick={() => onRowClick(indicador)}
                    className="cursor-pointer transition-all duration-200 group border-b border-purple-50 hover:bg-purple-50/60"
                  >
                    {/* Primeira célula com o indicador de seleção à esquerda */}
                    <TableCell className="font-medium py-3 relative">
                      <div className="absolute left-0 top-0 w-1 h-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center pl-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mr-3">
                          <span className="font-semibold text-xs">
                            {indicador.nome ? indicador.nome.charAt(0).toUpperCase() : "?"}
                            {indicador.sobrenome ? indicador.sobrenome.charAt(0).toUpperCase() : ""}
                          </span>
                        </div>
                        <div>
                          <div className="text-gray-800">
                            {`${indicador.nome || ""} ${indicador.sobrenome || ""}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {`Taxa de conversão: ${calcularTaxaConversao(
                              indicador.total_indicacoes || 0,
                              indicador.indicacoes_convertidas || 0
                            )}%`}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-600">{indicador.telefone}</TableCell>

                    <TableCell>
                      {indicador.email ? (
                        <span className="text-gray-600">{indicador.email}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        {indicador.total_indicacoes || 0}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {indicador.indicacoes_convertidas || 0}
                        </div>

                        {/* Progress bar de conversão */}
                        {(indicador.total_indicacoes || 0) > 0 && (
                          <div className="ml-2 w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${calcularTaxaConversao(
                                  indicador.total_indicacoes || 0,
                                  indicador.indicacoes_convertidas || 0
                                )}%`
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-600 text-sm">
                      {formatDate(indicador.data_criacao)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Indicador de paginação (decorativo) */}
      {filteredData.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-purple-100 text-xs text-gray-600 shadow-sm">
            Página 1 de 1
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicadoresTable;