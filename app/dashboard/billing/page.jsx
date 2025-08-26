'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, ChevronDown, Loader2, Check, AlertCircle } from 'lucide-react';
import { Plans } from '@/app/dashboard/_components/Plans';
import { useUserContext } from '@/app/provider';
import Link from 'next/link';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

const InvoiceDialog = ({ invoice, open, onOpenChange }) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('billingPage.invoice.title', { number: invoice.invoice_number })}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[600px]">
                    <div className="p-6 space-y-6">
                        {/* Invoice Header */}
                        <div className="flex justify-between pb-6 border-b">
                            <div>
                                <h3 className="font-semibold text-xl mb-1">INVOICE</h3>
                                <p className="text-sm text-gray-500">#{invoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">{t('billingPage.invoice.issueDate')}</p>
                                <p className="font-medium">{format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>

                        {/* Bill To Section */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('billingPage.invoice.billTo')}</h4>
                                <div className="space-y-1">
                                    <p className="font-medium">{billingInfo.name || 'Customer Name'}</p>
                                    <p className="text-sm text-gray-600">{billingInfo.email}</p>
                                    {billingInfo.address && <p className="text-sm text-gray-600 whitespace-pre-line">{billingInfo.address}</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('billingPage.invoice.paymentStatus')}</h4>
                                <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                                        invoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                    <div className={`h-2 w-2 rounded-full ${invoice.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    {t(`billingPage.billingHistory.status.${invoice.status}`)}
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="mt-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 text-sm font-medium text-gray-500">{t('billingPage.invoice.description')}</th>
                                        <th className="text-right py-3 text-sm font-medium text-gray-500">{t('billingPage.invoice.amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-4">
                                            <p className="font-medium">{invoice.description || t('billingPage.invoice.monthlySubscription')}</p>
                                            <p className="text-sm text-gray-500">
                                                {t('billingPage.invoice.billingPeriod', {
                                                    start: format(new Date(invoice.period_start), 'MMM dd'),
                                                    end: format(new Date(invoice.period_end), 'MMM dd, yyyy'),
                                                })}
                                            </p>
                                        </td>
                                        <td className="py-4 text-right">
                                            <p className="font-medium">${parseFloat(invoice.amount).toFixed(2)}</p>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="pt-6 text-right font-medium">{t('billingPage.invoice.total')}</td>
                                        <td className="pt-6 text-right font-medium text-lg">${parseFloat(invoice.amount).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer Notes */}
                        <div className="pt-6 border-t text-sm text-gray-500">
                            <p className="mb-2">{t('billingPage.invoice.footer.payment')}</p>
                            <p>{t('billingPage.invoice.footer.thanks')}</p>
                        </div>
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('billingPage.invoice.buttons.close')}
                    </Button>
                    <Button onClick={() => handleDownloadPDF(invoice)}>
                        <Download className="w-4 h-4 mr-2" />
                        {t('billingPage.invoice.buttons.download')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function BillingPage() {
    const { t } = useTranslation();
    const [billingInfo, setBillingInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [plansOpen, setPlansOpen] = useState(false);
    const { dbUser } = useUserContext();
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const fetchBillingInfo = async () => {
            if (!dbUser) return;
            try {
                const response = await fetch(`/api/billing?userId=${dbUser.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch billing info');
                }
                const data = await response.json();
                setBillingInfo(data);
            } catch (error) {
                console.error('Error fetching billing info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBillingInfo();
    }, [dbUser]);

    const handleDownloadPDF = async (invoice) => {
        console.log('Downloading invoice:', invoice);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!billingInfo) {
        return (
            <div className="container max-w-4xl mx-auto p-6">
                <Card>
                    <CardContent className="py-10">
                        <p className="text-center text-sm text-muted-foreground">Error loading billing information. Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight mb-1">{t('billingPage.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('billingPage.description')}</p>
                </header>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium">{t('billingPage.currentPlan.title')}</CardTitle>
                        <CardDescription className="text-sm">{t('billingPage.currentPlan.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <Badge variant={billingInfo.isSubscribed ? 'default' : 'secondary'} className="text-xs py-0.5 px-2">
                                    {billingInfo.isSubscribed ? `${billingInfo.subscriptionType.name} Plan` : t('billingPage.currentPlan.freePlan')}
                                </Badge>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {billingInfo.isSubscribed ? t('billingPage.currentPlan.allFeatures') : t('billingPage.currentPlan.limitedFeatures')}
                                </p>
                                {billingInfo.isSubscribed && billingInfo.subscriptionEndsAt && (
                                    <p className="mt-1 text-xs text-muted-foreground">{`Expires: ${new Date(billingInfo.subscriptionEndsAt).toLocaleDateString()}`}</p>
                                )}
                            </div>
                            {billingInfo.isSubscribed ? (
                                <Link href="https://billing.stripe.com/p/login/test_8wMg2ldLmbzk23eaEE">
                                    <Button variant="outline" size="sm">
                                        {t('billingPage.currentPlan.buttons.manage')}
                                    </Button>
                                </Link>
                            ) : (
                                <Button onClick={() => setPlansOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    {t('billingPage.currentPlan.buttons.upgrade')}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium">{t('billingPage.billingHistory.title')}</CardTitle>
                        <CardDescription className="text-sm">{t('billingPage.billingHistory.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-muted/50">
                                        <TableHead className="w-[100px] font-medium">{t('billingPage.billingHistory.table.status')}</TableHead>
                                        <TableHead className="font-medium">{t('billingPage.billingHistory.table.invoice')}</TableHead>
                                        <TableHead className="font-medium">{t('billingPage.billingHistory.table.date')}</TableHead>
                                        <TableHead className="font-medium">{t('billingPage.billingHistory.table.amount')}</TableHead>
                                        <TableHead className="text-right font-medium">{t('billingPage.billingHistory.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingInfo.invoices && billingInfo.invoices.length > 0 ? (
                                        billingInfo.invoices.map((invoice) => (
                                            <TableRow key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {invoice.status === 'paid' ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                                <span className="text-sm text-green-600 font-medium">{t('billingPage.billingHistory.status.paid')}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                                <span className="text-sm text-yellow-600 font-medium">{t('billingPage.billingHistory.status.pending')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">#{invoice.invoice_number}</span>
                                                        <span className="text-xs text-gray-500">{invoice.description || t('billingPage.invoice.monthlySubscription')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
                                                        <span className="text-xs text-gray-500">{format(new Date(invoice.date), 'hh:mm a')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">${parseFloat(invoice.amount).toFixed(2)}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8" onClick={() => handleDownloadPDF(invoice)}>
                                                            <Download className="w-4 h-4 mr-2" />
                                                            PDF
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedInvoice(invoice)}>
                                                            View
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertCircle className="w-6 h-6 mb-2" />
                                                    <p className="text-sm">{t('billingPage.billingHistory.noHistory.title')}</p>
                                                    <p className="text-xs mt-1">{t('billingPage.billingHistory.noHistory.description')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {billingInfo.invoices && billingInfo.invoices.length > 0 && (
                            <div className="mt-4 flex items-center justify-between px-1">
                                <div className="text-sm text-gray-500">{t('billingPage.billingHistory.showingTransactions', { count: billingInfo.invoices.length })}</div>
                                <Button variant="outline" size="sm" className="h-8">
                                    {t('billingPage.billingHistory.viewAll')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Plans open={plansOpen} onOpenChange={setPlansOpen} />
            {selectedInvoice && <InvoiceDialog invoice={selectedInvoice} open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)} />}
        </div>
    );
}
