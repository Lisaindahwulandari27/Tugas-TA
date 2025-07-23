import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Receipt, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Transaction {
  id: string;
  transaction_date: string;
  customer_name: string | null;
  items: any; // Handle as any since it's JSONB from database
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  notes: string | null;
  served_by: string | null;
  created_at: string;
}

const TransactionManager = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([{ name: '', quantity: 1, price: 0, total: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const menuItems = [
    { name: 'Bakso Biasa', price: 15000 },
    { name: 'Bakso Spesial', price: 20000 },
    { name: 'Bakso Jumbo', price: 25000 },
    { name: 'Mie Bakso', price: 18000 },
    { name: 'Bakso Urat', price: 22000 },
    { name: 'Es Teh', price: 5000 },
    { name: 'Es Jeruk', price: 7000 },
    { name: 'Teh Hangat', price: 4000 }
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate total when quantity or price changes
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    // Auto-fill price when menu item is selected
    if (field === 'name') {
      const menuItem = menuItems.find(item => item.name === value);
      if (menuItem) {
        newItems[index].price = menuItem.price;
        newItems[index].total = newItems[index].quantity * menuItem.price;
      }
    }
    
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + tax - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const subtotal = calculateSubtotal();
      const totalAmount = calculateFinalTotal();

      const { error } = await supabase
        .from('transactions')
        .insert({
          customer_name: customerName || null,
          items: items.filter(item => item.name && item.quantity > 0) as any,
          subtotal,
          tax,
          discount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          notes: notes || null,
          served_by: user?.name || null
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil disimpan",
      });

      // Reset form
      setCustomerName('');
      setItems([{ name: '', quantity: 1, price: 0, total: 0 }]);
      setTax(0);
      setDiscount(0);
      setPaymentMethod('cash');
      setNotes('');
      setShowForm(false);
      
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">Pencatatan Transaksi</h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Tutup Form' : 'Transaksi Baru'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Form Transaksi Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Nama Pelanggan (Opsional)</Label>
                  <Input
                    id="customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama pelanggan"
                  />
                </div>
                <div>
                  <Label htmlFor="payment">Metode Pembayaran</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Items Pesanan</Label>
                <div className="space-y-3 mt-2">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                      <div>
                        <Label>Menu</Label>
                        <Select 
                          value={item.name} 
                          onValueChange={(value) => updateItem(index, 'name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih menu" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((menuItem) => (
                              <SelectItem key={menuItem.name} value={menuItem.name}>
                                {menuItem.name} - {formatCurrency(menuItem.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Harga</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <Input
                          value={formatCurrency(item.total)}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Item
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax">Pajak/PPN</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Diskon</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Total Akhir</Label>
                  <Input
                    value={formatCurrency(calculateFinalTotal())}
                    readOnly
                    className="bg-muted font-bold text-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || items.every(item => !item.name)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Kasir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{transaction.customer_name || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {transaction.items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(transaction.total_amount)}
                    </TableCell>
                    <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                    <TableCell>{transaction.served_by || '-'}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada transaksi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionManager;