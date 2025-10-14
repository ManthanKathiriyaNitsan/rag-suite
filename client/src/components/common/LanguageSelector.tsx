import React, { useMemo, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useTranslation } from '@/contexts/I18nContext';
import { PointerTypes } from '@/components/ui/AnimatedPointer';

const LanguageSelector = React.memo(function LanguageSelector() {
  const { locale, setLocale, availableLocales } = useTranslation();

  // 🚀 Memoize current locale lookup
  const currentLocale = useMemo(() => 
    availableLocales.find(l => l.code === locale), 
    [availableLocales, locale]
  );

  // 🚀 Memoize locale change handler
  const handleLocaleChange = useCallback((newLocale: string) => {
    setLocale(newLocale);
  }, [setLocale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLocale?.flag} {currentLocale?.name}
          </span>
          <span className="sm:hidden">{currentLocale?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLocales.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLocaleChange(lang.code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {locale === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default LanguageSelector;
