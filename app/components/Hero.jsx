'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
    const { t } = useTranslation();
    const [mainImageLoading, setMainImageLoading] = useState(true);
    const [mobileImageLoading, setMobileImageLoading] = useState(true);

    return (
        <section className="bg-muted py-12 md:py-48 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Floating Popup Previews */}
                <div className="relative">
                    <div className="hidden md:block absolute -left-[190px] -top-10 w-80 md:w-96 animate-float-1 transform hover:scale-110 transition-transform z-10">
                        <img src="/images/Group 45.png" alt="Popup Preview 1" className="w-full h-auto rounded-lg shadow-lg" />
                    </div>
                    <div className="hidden md:block absolute -right-32 -top-10 w-80 md:w-96 animate-float-2 transform hover:scale-110 transition-transform z-10">
                        <img src="/images/Group 51.png" alt="Popup Preview 2" className="w-full h-auto rounded-lg shadow-lg" />
                    </div>
                    <div className="hidden md:block absolute -left-32 top-[600px] w-80 md:w-96 animate-float-3 transform hover:scale-110 transition-transform z-10">
                        <img src="/images/popup1.png" alt="Popup Preview 3" className="w-full h-auto rounded-lg shadow-lg" />
                    </div>
                    <div className="hidden md:block absolute -right-32 top-[400px] w-80 md:w-96 animate-float-4 transform hover:scale-110 transition-transform z-10">
                        <img src="/images/popup2.png" alt="Popup Preview 4" className="w-full h-auto rounded-lg shadow-lg" />
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-4">
                        {t('hero.title.main')}
                        <br />
                        Made <span className="text-primary">{t('hero.title.highlight')}</span>
                    </h1>
                    <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto px-4">{t('hero.description')}</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md transition-colors">{t('hero.buttons.trial')}</button>
                        <button className="border border-border text-foreground hover:bg-accent px-6 py-3 rounded-md transition-colors">{t('hero.buttons.demo')}</button>
                    </div>
                    <div className="relative max-w-5xl mx-auto">
                        {/* Main Dashboard Image */}
                        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
                            {mainImageLoading && <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />}
                            <Image
                                src="/images/heroImage.png"
                                alt="Popup Manager Dashboard"
                                fill
                                className={`object-cover transition-opacity duration-300 ${mainImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                sizes="(max-width: 1280px) 100vw, 1280px"
                                priority
                                quality={100}
                                onLoadingComplete={() => setMainImageLoading(false)}
                            />
                        </div>

                        {/* Mobile Image Overlay */}
                        <div className="hidden md:block absolute -bottom-6 -right-4 w-[320px] h-[640px] transform rotate-[-5deg] transition-transform hover:rotate-0 duration-300">
                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                                {mobileImageLoading && <div className="absolute inset-0 bg-muted animate-pulse rounded-[2.5rem]" />}
                                <Image
                                    src="/images/iphone2.png"
                                    alt="Mobile Experience"
                                    fill
                                    className={`object-cover transition-opacity duration-300 ${mobileImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    sizes="(max-width: 768px) 0vw, 320px"
                                    priority
                                    quality={100}
                                    onLoadingComplete={() => setMobileImageLoading(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
