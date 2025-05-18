import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

export default function UserProfile() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    // Pegar as iniciais do e-mail para o avatar
    const initials = user.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="flex items-center space-x-4">
            <Avatar className="h-9 w-9 border border-purple-300">
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="text-sm">
                <p className="font-medium text-gray-700">{user.email}</p>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="h-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-1"
            >
                <LogOut size={14} className="mr-1" />
                Sair
            </Button>
        </div>
    );
} 