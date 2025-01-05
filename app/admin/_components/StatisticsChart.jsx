




const StatisticsChart = ({ data }) => {
    const maxHeight = 120; // Define max height of the chart
    
    return (
        <div className="h-[200px] w-full bg-muted rounded-lg flex items-end justify-between p-4">
            {data.map((item, i) => {
                const height1 = (item.value1 / Math.max(...data.map(item => item.value1), 1)) * maxHeight; // Calculate bar height
                const height2 = (item.value2 / Math.max(...data.map(item => item.value2), 1)) * maxHeight; // Calculate bar height
                
                return (
                    <div key={i} className="flex flex-col items-center" style={{ height: '100%' }}>
                        <div className="w-8 bg-green-500 rounded-t-sm" style={{ height: `${height1}px` }}></div>
                        <div className="w-8 bg-green-200 rounded-b-sm" style={{ height: `${height2}px` }}></div>
                    </div>
                );
            })}
        </div>
    );
};

export  default StatisticsChart