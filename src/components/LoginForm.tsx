
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { LogIn, User } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Query user from our custom users table using rpc or direct query
      const { data: users, error } = await supabase
        .rpc('get_user_by_email', { user_email: email });

      if (error) {
        // Fallback: try direct query if RPC doesn't exist
        const { data: fallbackUsers, error: fallbackError } = await supabase
          .from('users' as any)
          .select('*')
          .eq('email', email)
          .single();

        if (fallbackError || !fallbackUsers) {
          toast({
            title: "Login Gagal",
            description: "Email tidak ditemukan dalam sistem",
            variant: "destructive",
          });
          return;
        }

        onLoginSuccess(fallbackUsers);
      } else {
        if (!users || users.length === 0) {
          toast({
            title: "Login Gagal",
            description: "Email tidak ditemukan dalam sistem",
            variant: "destructive",
          });
          return;
        }

        onLoginSuccess(users[0]);
      }
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang!`,
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Login Bakso Adzkia
          </CardTitle>
          <p className="text-gray-600">Masuk ke sistem manajemen porsi</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Akun:</p>
            <div className="text-xs text-gray-500">
              <p>Admin: admin@baksoadzkia.com</p>
              <p>Staff: staff@baksoadzkia.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
