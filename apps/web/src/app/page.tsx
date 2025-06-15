'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: api.getOrders,
  });

  const handleRefresh = async () => {
    try {
      await api.refreshOrders();
      setTimeout(() => refetch(), 2000); // Wait for processing
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  const stats = orders ? {
    total: orders.length,
    ready: orders.filter((o: any) => o.overall_confidence > 0.8).length,
    issues: orders.filter((o: any) => o.overall_confidence <= 0.5).length,
  } : { total: 0, ready: 0, issues: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass glass-dark border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  Zaqathon
                </h1>
                <p className="text-sm text-muted-foreground">Order Processing System</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-ingest</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="glass glass-dark">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.total} from email samples
              </p>
            </CardContent>
          </Card>

          <Card className="glass glass-dark">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready PDFs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
              <p className="text-xs text-muted-foreground">
                High confidence orders
              </p>
            </CardContent>
          </Card>

          <Card className="glass glass-dark">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.issues}</div>
              <p className="text-xs text-muted-foreground">
                Need manual review
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Recent Orders</span>
              </CardTitle>
              <CardDescription>
                Click on any order to view details and manage validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : orders?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found. Click "Re-ingest" to process sample emails.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders?.map((order: any, index: number) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/orders/${order.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="font-medium">
                                {order.customer_name || 'Unknown Customer'}
                              </div>
                              <Badge
                                variant={
                                  order.overall_confidence > 0.8 
                                    ? 'success' 
                                    : order.overall_confidence > 0.5 
                                    ? 'secondary' 
                                    : 'destructive'
                                }
                              >
                                {(order.overall_confidence * 100).toFixed(1)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              From: {order.email_file} • {new Date(order.processed_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-mono">{order.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
