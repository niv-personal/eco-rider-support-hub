import { useState, useEffect } from "react";
import { ArrowLeft, Package, Calendar, DollarSign, Truck, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrdersComponentProps {
  user: any;
  onBack: () => void;
}

interface Order {
  id: string;
  order_number: string;
  product_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: string;
  order_date: string;
  delivery_date: string | null;
  tracking_number: string | null;
  created_at: string;
}

export function OrdersComponent({ user, onBack }: OrdersComponentProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Scooter Orders</h1>
            <p className="text-muted-foreground">Track your electric scooter orders and delivery status</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scooter orders yet</h3>
            <p className="text-muted-foreground">
              Your electric scooter order history will appear here once you make your first purchase
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {order.order_number}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{order.product_name}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <p className="font-medium">${order.price}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium">${order.total_amount}</p>
                      </div>
                      {order.tracking_number && (
                        <div>
                          <span className="text-muted-foreground">Tracking:</span>
                          <p className="font-medium">{order.tracking_number}</p>
                        </div>
                      )}
                    </div>
                    
                    {order.delivery_date && (
                      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {order.status === 'delivered' ? 'Delivered on:' : 'Expected delivery:'}
                          </span>
                          <span className="text-sm">
                            {new Date(order.delivery_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}