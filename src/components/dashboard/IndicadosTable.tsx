import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Indicado } from "@/types/supabase";
import { format, parseISO } from "date-fns";
import { User, Phone, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Filter } from "lucide-react";
import { useState } from "react";

interface IndicadosTableProps {
  data: Indicado[];
}

type FilterStatus = "all" | "convertido" | "pendente";

const IndicadosTable = ({ data }: IndicadosTableProps) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };

  // Função para determinar ícone e cor baseado no status
  const getStatusConfig = (cadastrado: boolean) => {
    if (cadastrado) {
      return {
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-100"
      };
    } else {
      return {
        icon: <Clock className="h-3.5 w-3.5 mr-1" />,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-100"
      };
    }
  };

  // Filtrar os dados com base no status selecionado
  const filteredData = data.filter(indicado => {
    if (filterStatus === "all") return true;
    if (filterStatus === "convertido") return indicado.cadastrado === true;
    if (filterStatus === "pendente") return indicado.cadastrado === false || indicado.cadastrado === null;
    return true;
  });

  // Contadores para os status
  const convertidosCount = data.filter(i => i.cadastrado).length;
  const pendentesCount = data.filter(i => !i.cadastrado).length;

  return (
    <div className="relative">
      {/* Efeitos decorativos de blur no background */}
      <div className="absolute -left-10 top-20 w-32 h-32 rounded-full bg-purple-400/10 blur-xl pointer-events-none"></div>
      <div className="absolute -right-10 bottom-10 w-40 h-40 rounded-full bg-purple-500/5 blur-xl pointer-events-none"></div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <Filter className="h-4 w-4 text-purple-500 mr-2" />
          <span className="text-sm text-gray-700 mr-3">Filtrar:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors border ${filterStatus === "all"
                ? "bg-purple-100 text-purple-700 border-purple-200"
                : "bg-white/80 text-gray-600 border-gray-200 hover:bg-purple-50"
                }`}
            >
              Todos ({data.length})
            </button>
            <button
              onClick={() => setFilterStatus("convertido")}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors border ${filterStatus === "convertido"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-white/80 text-gray-600 border-gray-200 hover:bg-emerald-50"
                }`}
            >
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Convertidos ({convertidosCount})
            </button>
            <button
              onClick={() => setFilterStatus("pendente")}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors border ${filterStatus === "pendente"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-white/80 text-gray-600 border-gray-200 hover:bg-amber-50"
                }`}
            >
              <Clock className="h-3 w-3 inline mr-1" />
              Pendentes ({pendentesCount})
            </button>
          </div>
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
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    Data de Indicação
                  </div>
                </TableHead>
                <TableHead className="py-3 text-purple-700 font-semibold">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-purple-500" />
                    Status
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((indicado) => {
                  const statusConfig = getStatusConfig(indicado.cadastrado);

                  return (
                    <TableRow
                      key={indicado.telefone}
                      className="transition-all duration-200 group border-b border-purple-50 hover:bg-purple-50/60"
                    >
                      <TableCell className="font-medium py-3 relative">
                        {/* Efeito sutil de highlight na linha ativa */}
                        <div className="absolute left-0 top-0 w-1 h-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center pl-2">
                          <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mr-3">
                            <span className="font-semibold text-xs">
                              {indicado.nome ? indicado.nome.substring(0, 2).toUpperCase() : "?"}
                            </span>
                          </div>
                          <div>
                            <div className="text-gray-800">
                              {indicado.nome || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Indicado
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-600">
                        <div className="flex flex-col">
                          {indicado.telefone}
                          {/* Note: whatsapp property removed as it doesn't exist on Indicado type */}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-gray-700">{formatDate(indicado.data_criacao)}</span>
                          {indicado.data_criacao && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {format(parseISO(indicado.data_criacao), "HH:mm")}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                            {statusConfig.icon}
                            {indicado.cadastrado ? "Convertido" : "Pendente"}
                          </span>

                          {/* Linha de tempo visual simplificada */}
                          <div className="ml-3 h-1 w-16 bg-gray-100 rounded-full overflow-hidden flex">
                            <div className={`h-full ${indicado.cadastrado ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-400'}`}></div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <XCircle className="h-10 w-10 text-purple-200 mb-2" />
                      <p className="text-gray-500 font-medium">Nenhum indicado encontrado</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {filterStatus === "all"
                          ? "Este indicador ainda não possui indicações."
                          : filterStatus === "convertido"
                            ? "Não há indicados convertidos."
                            : "Não há indicados pendentes."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Indicador de resultados */}
      {filteredData.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
          <span>
            {filterStatus === "all"
              ? `${filteredData.length} ${filteredData.length === 1 ? 'indicado encontrado' : 'indicados encontrados'}`
              : filterStatus === "convertido"
                ? `${filteredData.length} ${filteredData.length === 1 ? 'convertido' : 'convertidos'}`
                : `${filteredData.length} ${filteredData.length === 1 ? 'pendente' : 'pendentes'}`
            }
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
              <span>{convertidosCount} convertidos</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-400 mr-1"></div>
              <span>{pendentesCount} pendentes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicadosTable;