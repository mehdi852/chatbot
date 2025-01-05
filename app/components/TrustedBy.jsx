import Image from 'next/image';

export default function TrustedBy() {
    return (
        <section className="bg-background py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8">Trusted by innovative teams worldwide</p>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                    <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                        <Image className="h-8 dark:brightness-200 dark:contrast-200 dark:invert" src="/uploads/logo1.svg" alt="Company 1" width={158} height={48} />
                    </div>
                    <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                        <Image className="h-8 dark:brightness-200 dark:contrast-200 dark:invert" src="/uploads/logo2.svg" alt="Company 2" width={158} height={48} />
                    </div>
                    <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                        <Image className="h-8 dark:brightness-200 dark:contrast-200 dark:invert" src="/uploads/logo3.svg" alt="Company 3" width={158} height={48} />
                    </div>
                    <div className="col-span-1 flex justify-center md:col-span-3 lg:col-span-1">
                        <Image className="h-8 dark:brightness-200 dark:contrast-200 dark:invert" src="/uploads/logo4.svg" alt="Company 4" width={158} height={48} />
                    </div>
                    <div className="col-span-2 flex justify-center md:col-span-3 lg:col-span-1">
                        <Image className="h-8 dark:brightness-200 dark:contrast-200 dark:invert" src="/uploads/logo5.svg" alt="Company 5" width={158} height={48} />
                    </div>
                </div>
            </div>
        </section>
    );
}
