
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { LogIn, User, UserPlus } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: users, error } = await supabase
        .from('users' as any)
        .select('*')
        .eq('email', email) as { data: UserData[] | null; error: any };

      if (error) {
        console.error('Query error:', error);
        toast({
          title: "Login Gagal",
          description: "Terjadi kesalahan saat mengakses database",
          variant: "destructive",
        });
        return;
      }

      if (!users || users.length === 0) {
        toast({
          title: "Login Gagal",
          description: "Email tidak ditemukan dalam sistem",
          variant: "destructive",
        });
        return;
      }

      onLoginSuccess(users[0]);
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${users[0].name}!`,
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users' as any)
        .select('*')
        .eq('email', email) as { data: UserData[] | null; error: any };

      if (checkError) {
        console.error('Check error:', checkError);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memeriksa email",
          variant: "destructive",
        });
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Registrasi Gagal",
          description: "Email sudah terdaftar dalam sistem",
          variant: "destructive",
        });
        return;
      }

      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users' as any)
        .insert([
          {
            name,
            email,
            phone,
            role: 'staff'
          }
        ])
        .select()
        .single() as { data: UserData | null; error: any };

      if (insertError) {
        console.error('Insert error:', insertError);
        toast({
          title: "Registrasi Gagal",
          description: "Terjadi kesalahan saat membuat akun",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registrasi Berhasil",
        description: "Akun berhasil dibuat, silakan login",
      });

      // Switch to login mode and clear form
      setIsRegisterMode(false);
      setName('');
      setPhone('');

    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat registrasi",
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
              {isRegisterMode ? (
                <UserPlus className="h-8 w-8 text-white" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {isRegisterMode ? 'Daftar' : 'Login'} Bakso Adzkia
          </CardTitle>
          <p className="text-gray-600">
            {isRegisterMode ? 'Buat akun baru' : 'Masuk ke sistem manajemen porsi'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Masukkan nomor telepon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}
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
              {isRegisterMode ? (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? 'Mendaftar...' : 'Daftar'}
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  {loading ? 'Memproses...' : 'Masuk'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setName('');
                setPhone('');
                setEmail('');
              }}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              {isRegisterMode 
                ? 'Sudah punya akun? Masuk di sini' 
                : 'Belum punya akun? Daftar di sini'}
            </button>
          </div>

          {!isRegisterMode && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">Demo Akun:</p>
              <div className="text-xs text-gray-500">
                <p>Admin: admin@baksoadzkia.com</p>
                <p>Staff: staff@baksoadzkia.com</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
