import { useState, KeyboardEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.webp';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!email || !password) {
            toast({
                title: "Erro",
                description: "Email e senha são obrigatórios",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                toast({
                    title: "Erro de autenticação",
                    description: error.message || "Credenciais inválidas",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error("Login error:", err);
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao tentar fazer login",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 relative overflow-hidden flex justify-center items-center">
            {/* Círculos decorativos com blur */}
            <div className="fixed -top-20 -right-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>
            <div className="fixed -bottom-20 -left-20 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>

            <Card className="w-full max-w-md shadow-lg border border-purple-100 bg-white/80 backdrop-blur-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                {/* Efeito de blur decorativo dentro do card */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <CardHeader className="space-y-2 relative z-10">
                    <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">Dashboard de Indicações</CardTitle>
                    <CardDescription className="text-center text-gray-500">
                        Entre com suas credenciais para acessar o sistema
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-purple-600">
                                <Mail size={18} />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-10 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-purple-600">
                                <Lock size={18} />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-10 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 transition-all duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="mr-2 relative w-5 h-5">
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                                </div>
                                Entrando...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                Entrar
                                <ArrowRight className="ml-2" size={16} />
                            </div>
                        )}
                    </Button>
                </CardContent>

                <CardFooter className="relative z-10">
                    <div className="text-sm text-center text-gray-500 w-full">
                        Acesso restrito ao sistema de indicações
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;