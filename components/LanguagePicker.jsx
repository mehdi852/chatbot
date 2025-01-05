import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const languages = [
    { code: 'us', name: 'United States', langCode: 'en-US' },
    { code: 'br', name: 'Brazil', langCode: 'pt-BR' },
    { code: 'hr', name: 'Croatia', langCode: 'hr' },
    { code: 'dk', name: 'Denmark', langCode: 'da' },
    { code: 'fi', name: 'Finland', langCode: 'fi' },
    { code: 'fr', name: 'France', langCode: 'fr' },
    { code: 'de', name: 'Germany', langCode: 'de' },
    { code: 'it', name: 'Italy', langCode: 'it' },
    { code: 'nl', name: 'Netherlands', langCode: 'nl' },
    { code: 'no', name: 'Norway', langCode: 'nb' },
    { code: 'pt', name: 'Portugal', langCode: 'pt' },
    { code: 'es', name: 'Spain', langCode: 'es' },
    { code: 'se', name: 'Sweden', langCode: 'sv' }
];

export default function LanguagePicker() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    // Get current language details
    const getCurrentLanguage = () => {
        const currentLangCode = i18n.language;
        const baseLang = currentLangCode.split('-')[0]; // Get base language code (e.g., 'en' from 'en-US')

        // First try to find exact match
        let lang = languages.find((l) => l.langCode === currentLangCode);

        // If no exact match, find by base language
        if (!lang) {
            lang = languages.find((l) => l.langCode.startsWith(baseLang));
        }

        // Fallback to English (US) if no match found
        return lang || languages.find((l) => l.langCode === 'en-US');
    };

    const currentLang = getCurrentLanguage();

    const handleLanguageChange = (langCode) => {
        const baseLang = langCode.split('-')[0];
        i18n.changeLanguage(baseLang);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 px-3">
                    <Globe className="h-4 w-4" />
                    <img src={`https://flagcdn.com/24x18/${currentLang.code}.png`} alt={currentLang.name} className="h-3 w-4" />
                    <span className="ml-2">{currentLang.name}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-medium">Select your language</h4>
                    <p className="text-sm text-muted-foreground">Choose the language you want to use</p>
                </div>
                <div className="grid grid-cols-2 gap-0.5 p-1 max-h-[400px] overflow-y-auto">
                    {languages.map((lang) => (
                        <button
                            key={lang.langCode}
                            className={`flex items-center gap-2 p-2 hover:bg-muted rounded-sm ${currentLang.langCode === lang.langCode ? 'bg-muted' : ''}`}
                            onClick={() => handleLanguageChange(lang.langCode)}>
                            <img src={`https://flagcdn.com/24x18/${lang.code}.png`} alt={lang.name} className="h-3 w-4" />
                            <span className="text-sm">{lang.name}</span>
                            {currentLang.langCode === lang.langCode && <Check className="h-4 w-4 ml-auto" />}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
