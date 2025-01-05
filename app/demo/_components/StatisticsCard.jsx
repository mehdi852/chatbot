import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontalIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

const StatisticsCard = ({ icon: Icon, bg, color, value, label, change, changeType, subLabel }) => (
    <Card className="overflow-hidden">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl font-bold">{value}</h2>
                    <div className={`flex items-center ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                        {changeType === 'increase' ? (
                            <TrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                            <TrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">{change}</span>
                    </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
            </div>
            {subLabel && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-muted-foreground">{subLabel}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default StatisticsCard;
