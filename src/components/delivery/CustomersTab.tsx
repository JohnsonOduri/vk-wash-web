import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAllCustomers } from '@/services/customerService';
import { getBillsByCustomerId } from '@/services/laundryItemService';
import { format } from 'date-fns';

const CustomersTab = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const all = await getAllCustomers();
      setCustomers(all || []);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const selectCustomer = async (customer: any) => {
    setSelected(customer);
    setLoading(true);
    try {
      const fetchedBills = await getBillsByCustomerId(customer.id || customer.phone || '');
      setBills(fetchedBills ? (Array.isArray(fetchedBills) ? fetchedBills : [fetchedBills]) : []);
    } catch (err) {
      console.error('Failed to load bills for customer', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => {
    const q = query.toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Search by name or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="max-h-96 overflow-y-auto mt-3">
              {filtered.map(c => (
                <div key={c.id || c.phone} className="p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => selectCustomer(c)}>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.phone}</div>
                </div>
              ))}
              {filtered.length === 0 && <div className="p-3 text-sm text-gray-500">No customers found</div>}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div>
                  <div className="mb-4">
                    <div className="text-lg font-medium">{selected.name}</div>
                    <div className="text-sm text-gray-500">{selected.phone}</div>
                    <div className="text-sm text-gray-500">{selected.email}</div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Bills</h3>
                    {loading ? (
                      <div>Loading bills...</div>
                    ) : bills && bills.length > 0 ? (
                      <div className="space-y-2">
                        {bills.map(b => (
                          <div key={b.id} className="p-3 border rounded">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">Bill #{b.id?.slice(0,8)}</div>
                                <div className="text-sm text-gray-500">{b.customerName} • {b.customerPhone}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">₹{(b.total||0).toFixed(2)}</div>
                                <div className="text-sm text-gray-500">{b.status}</div>
                                <div className="text-sm text-gray-400">{b.createdAt ? format(b.createdAt, 'dd MMM yyyy') : ''}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No bills for this customer</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Select a customer to view details and bills</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomersTab;
