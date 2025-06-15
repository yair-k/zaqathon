'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Code,
  Package
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [activePane, setActivePane] = useState<'email' | 'validation' | 'pdf'>('validation');
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.getOrder(orderId),
    enabled: !!orderId,
  });

  const { data: emailData } = useQuery({
    queryKey: ['orderEmail', orderId],
    queryFn: () => api.getOrderEmail(orderId),
    enabled: !!orderId && activePane === 'email',
  });

  const handleDownloadPDF = async () => {
    try {
      const blob = await api.getOrderPDF(orderId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allItemsValid = order.items.every(item => item.validations.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass glass-dark border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Order Details</h1>
                <p className="text-sm text-muted-foreground font-mono">{orderId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge
                variant={allItemsValid ? 'success' : 'destructive'}
                className="px-3 py-1"
              >
                {allItemsValid ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {allItemsValid ? 'All Good' : 'Has Issues'}
              </Badge>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {[
            { id: 'email', label: 'Original Email', icon: Code },
            { id: 'validation', label: 'Validation', icon: CheckCircle },
            { id: 'pdf', label: 'PDF Preview', icon: FileText },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activePane === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePane(tab.id as any)}
              className="flex items-center space-x-2"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="glass glass-dark mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Customer Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{order.customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-sm">{order.customer.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                    <p className="text-sm">{order.delivery.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${order.overallConfidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {(order.overallConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass glass-dark">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Items:</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valid Items:</span>
                    <span className="font-medium text-green-600">
                      {order.items.filter(item => item.validations.length === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Issues:</span>
                    <span className="font-medium text-red-600">
                      {order.items.reduce((sum, item) => sum + item.validations.length, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Pane */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="glass glass-dark min-h-[600px]">
              <CardHeader>
                <CardTitle>
                  {activePane === 'email' && 'Original Email'}
                  {activePane === 'validation' && 'Order Validation'}
                  {activePane === 'pdf' && 'PDF Preview'}
                </CardTitle>
                <CardDescription>
                  {activePane === 'email' && `From: ${order.meta.emailFile}`}
                  {activePane === 'validation' && 'Review and edit extracted order items'}
                  {activePane === 'pdf' && 'Generated sales order form'}
                </CardDescription>
              </CardHeader>
              <CardContent>                {activePane === 'email' && (
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                    {emailData ? (
                      emailData.content
                    ) : (
                      <p className="text-muted-foreground">
                        Loading email content...
                      </p>
                    )}
                  </div>
                )}

                {activePane === 'validation' && (
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.sku}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.qty} • Confidence: {(item.conf * 100).toFixed(1)}%
                            </p>
                          </div>
                          <Badge
                            variant={item.validations.length === 0 ? 'success' : 'destructive'}
                          >
                            {item.validations.length === 0 ? 'Valid' : `${item.validations.length} Issue${item.validations.length > 1 ? 's' : ''}`}
                          </Badge>
                        </div>

                        {item.validations.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {item.validations.map((validation, vIndex) => (
                              <div key={vIndex} className="flex items-center space-x-2 text-sm text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{validation}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.suggestions.length > 0 && (
                          <div className="space-y-1">
                            {item.suggestions.map((suggestion, sIndex) => (
                              <div key={sIndex} className="flex items-center space-x-2 text-sm text-blue-600">
                                <Eye className="w-3 h-3" />
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {activePane === 'pdf' && (
                  <div className="text-center">
                    <div className="border-2 border-dashed border-muted rounded-lg p-8">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        PDF preview would be displayed here using react-pdf
                      </p>
                      <Button onClick={handleDownloadPDF} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF to View
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
