import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRIES, CountryPhoneConfig, validatePhoneNumber } from '../data/countryPhoneData';

interface CountryPhoneInputProps {
  value: string; // The raw or formatted phone
  countryCode: string; // e.g. 'IN', 'US'
  onChange: (formatted: string, rawDigits: string, countryCode: string) => void;
  onCountryChange: (countryCode: string) => void;
  id?: string;
  hasError?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  countryCode,
  onChange,
  onCountryChange,
  id = 'phone-input',
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCountry = (country: CountryPhoneConfig) => {
    onCountryChange(country.code);
    setIsOpen(false);
    setSearchQuery('');

    // Format & validate existing number
    const validation = validatePhoneNumber(value, country.code);
    onChange(validation.formattedNumber || value, value, country.code);

    // Focus input for seamless typing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw, raw, countryCode);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Unified Input Box */}
      <div
        className={`flex items-center w-full rounded-lg bg-[#1b1c21] border transition-colors ${
          hasError
            ? 'border-red-500/70 ring-1 ring-red-500/30'
            : 'border-[#2c2f38] focus-within:border-[#c8a251] focus-within:ring-1 focus-within:ring-[#c8a251]/30'
        }`}
      >
        {/* Compact Country Code Button (takes only ~75px) */}
        <button
          type="button"
          id={`${id}-country-btn`}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-between gap-1.5 px-2.5 py-2.5 bg-[#17181e] hover:bg-[#22242c] rounded-l-lg transition-colors flex-shrink-0 cursor-pointer border-r border-[#2c2f38] min-w-[78px]"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          title={`Country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
          <span className="text-xs font-semibold text-[#f5d78e]">{selectedCountry.dialCode}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#888e9f] transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-[#c8a251]' : ''
            }`}
          />
        </button>

        {/* Spacious Remaining Area for Phone Number */}
        <input
          ref={inputRef}
          type="tel"
          id={id}
          required
          placeholder={selectedCountry.sampleNumber}
          value={value}
          onChange={handleInputChange}
          className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-sm text-white focus:outline-none placeholder:text-[#5c6170]"
        />
      </div>

      {/* Floating Country Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-64 bg-[#14151a] border border-[#2e313d] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Search */}
          <div className="p-2 border-b border-[#232630] bg-[#181a22] flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737887]" />
              <input
                type="text"
                autoFocus
                placeholder="Search country or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#101116] border border-[#282b36] rounded px-2.5 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-[#c8a251] placeholder:text-[#5c6170]"
              />
            </div>
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto divide-y divide-[#1e2029]">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#20222c] transition-colors text-xs ${
                      isSelected ? 'bg-[#c8a251]/15 text-[#f5d78e]' : 'text-[#d0d3dc]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="font-medium truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-[#c8a251]">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c8a251]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-[#737887]">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
