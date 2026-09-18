export interface CountryPhoneConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  sampleNumber: string;
  lengths: number[];
  formatHint: string;
  validate?: (rawDigits: string) => { isValid: boolean; message?: string };
}

export const COUNTRIES: CountryPhoneConfig[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    sampleNumber: '98765 43210',
    lengths: [10],
    formatHint: '10 digits (e.g. 98765 43210)',
    validate: (digits) => {
      if (digits.length !== 10) {
        return { isValid: false, message: 'Indian mobile numbers must be exactly 10 digits.' };
      }
      if (!/^[6-9]/.test(digits)) {
        return { isValid: false, message: 'Indian mobile numbers usually start with 6, 7, 8, or 9.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    sampleNumber: '(555) 234-5678',
    lengths: [10],
    formatHint: '10 digits (e.g. 555 234 5678)',
    validate: (digits) => {
      if (digits.length !== 10) {
        return { isValid: false, message: 'US phone numbers must be exactly 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    sampleNumber: '7911 123456',
    lengths: [10, 11],
    formatHint: '10-11 digits (e.g. 7911 123456)',
    validate: (digits) => {
      if (digits.length < 10 || digits.length > 11) {
        return { isValid: false, message: 'UK phone numbers must be 10 or 11 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    sampleNumber: '50 123 4567',
    lengths: [9],
    formatHint: '9 digits (e.g. 50 123 4567)',
    validate: (digits) => {
      if (digits.length !== 9) {
        return { isValid: false, message: 'UAE phone numbers must be 9 digits (e.g. 50 123 4567).' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    sampleNumber: '8123 4567',
    lengths: [8],
    formatHint: '8 digits (e.g. 8123 4567)',
    validate: (digits) => {
      if (digits.length !== 8) {
        return { isValid: false, message: 'Singapore phone numbers must be 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    sampleNumber: '412 345 678',
    lengths: [9, 10],
    formatHint: '9 digits without 0 (e.g. 412 345 678)',
    validate: (digits) => {
      if (digits.length < 9 || digits.length > 10) {
        return { isValid: false, message: 'Australian phone numbers must be 9 or 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    sampleNumber: '(416) 555-0199',
    lengths: [10],
    formatHint: '10 digits (e.g. 416 555 0199)',
    validate: (digits) => {
      if (digits.length !== 10) {
        return { isValid: false, message: 'Canadian phone numbers must be 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    sampleNumber: '151 23456789',
    lengths: [10, 11],
    formatHint: '10-11 digits (e.g. 151 23456789)',
    validate: (digits) => {
      if (digits.length < 10 || digits.length > 12) {
        return { isValid: false, message: 'German phone numbers must be 10 to 12 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    sampleNumber: '6 12 34 56 78',
    lengths: [9],
    formatHint: '9 digits without leading 0 (e.g. 6 12 34 56 78)',
    validate: (digits) => {
      if (digits.length !== 9 && digits.length !== 10) {
        return { isValid: false, message: 'French phone numbers must be 9 or 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    sampleNumber: '90 1234 5678',
    lengths: [10],
    formatHint: '10 digits without leading 0 (e.g. 90 1234 5678)',
    validate: (digits) => {
      if (digits.length !== 10 && digits.length !== 11) {
        return { isValid: false, message: 'Japanese phone numbers must be 10 or 11 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
    flag: '🇲🇾',
    sampleNumber: '12 345 6789',
    lengths: [9, 10],
    formatHint: '9-10 digits (e.g. 12 345 6789)',
    validate: (digits) => {
      if (digits.length < 9 || digits.length > 10) {
        return { isValid: false, message: 'Malaysian phone numbers must be 9 or 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'QA',
    name: 'Qatar',
    dialCode: '+974',
    flag: '🇶🇦',
    sampleNumber: '5512 3456',
    lengths: [8],
    formatHint: '8 digits (e.g. 5512 3456)',
    validate: (digits) => {
      if (digits.length !== 8) {
        return { isValid: false, message: 'Qatar phone numbers must be 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    sampleNumber: '51 234 5678',
    lengths: [9],
    formatHint: '9 digits (e.g. 51 234 5678)',
    validate: (digits) => {
      if (digits.length !== 9) {
        return { isValid: false, message: 'Saudi phone numbers must be 9 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'OM',
    name: 'Oman',
    dialCode: '+968',
    flag: '🇴🇲',
    sampleNumber: '9123 4567',
    lengths: [8],
    formatHint: '8 digits (e.g. 9123 4567)',
    validate: (digits) => {
      if (digits.length !== 8) {
        return { isValid: false, message: 'Oman phone numbers must be 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'KW',
    name: 'Kuwait',
    dialCode: '+965',
    flag: '🇰🇼',
    sampleNumber: '9123 4567',
    lengths: [8],
    formatHint: '8 digits (e.g. 9123 4567)',
    validate: (digits) => {
      if (digits.length !== 8) {
        return { isValid: false, message: 'Kuwait phone numbers must be 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    dialCode: '+94',
    flag: '🇱🇰',
    sampleNumber: '71 234 5678',
    lengths: [9],
    formatHint: '9 digits (e.g. 71 234 5678)',
    validate: (digits) => {
      if (digits.length !== 9) {
        return { isValid: false, message: 'Sri Lankan phone numbers must be 9 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    flag: '🇧🇩',
    sampleNumber: '1712 345678',
    lengths: [10],
    formatHint: '10 digits (e.g. 1712 345678)',
    validate: (digits) => {
      if (digits.length !== 10) {
        return { isValid: false, message: 'Bangladesh phone numbers must be 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'NP',
    name: 'Nepal',
    dialCode: '+977',
    flag: '🇳🇵',
    sampleNumber: '9841 234567',
    lengths: [10],
    formatHint: '10 digits (e.g. 9841 234567)',
    validate: (digits) => {
      if (digits.length !== 10) {
        return { isValid: false, message: 'Nepal phone numbers must be 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    dialCode: '+64',
    flag: '🇳🇿',
    sampleNumber: '21 123 4567',
    lengths: [8, 9, 10],
    formatHint: '8-10 digits (e.g. 21 123 4567)',
    validate: (digits) => {
      if (digits.length < 8 || digits.length > 10) {
        return { isValid: false, message: 'New Zealand phone numbers must be 8-10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'CH',
    name: 'Switzerland',
    dialCode: '+41',
    flag: '🇨🇭',
    sampleNumber: '78 123 45 67',
    lengths: [9],
    formatHint: '9 digits (e.g. 78 123 45 67)',
    validate: (digits) => {
      if (digits.length !== 9) {
        return { isValid: false, message: 'Swiss phone numbers must be 9 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    code: 'OTHER',
    name: 'Other International',
    dialCode: '+',
    flag: '🌍',
    sampleNumber: '1234567890',
    lengths: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    formatHint: '7-15 digits',
    validate: (digits) => {
      if (digits.length < 7 || digits.length > 15) {
        return { isValid: false, message: 'International phone numbers must contain 7 to 15 digits.' };
      }
      return { isValid: true };
    },
  },
];

/**
 * Validates a phone number based on selected country
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string = 'IN'
): { isValid: boolean; formattedNumber: string; error?: string } {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const trimmed = phoneNumber.trim();

  if (!trimmed) {
    return { isValid: false, formattedNumber: '', error: 'Phone number is required.' };
  }

  // Remove common symbols: spaces, dashes, parenthesis, dots
  let cleaned = trimmed.replace(/[\s\-().]/g, '');

  // If user entered a dial code (like +91 or 0091 or +1), strip it for validation
  if (cleaned.startsWith('+')) {
    const matchingCountry = COUNTRIES.find((c) => c.dialCode !== '+' && cleaned.startsWith(c.dialCode));
    if (matchingCountry) {
      cleaned = cleaned.substring(matchingCountry.dialCode.length);
    } else {
      cleaned = cleaned.replace(/^\+/, '');
    }
  } else if (country.dialCode !== '+' && cleaned.startsWith(country.dialCode.replace('+', ''))) {
    cleaned = cleaned.substring(country.dialCode.length - 1);
  }

  // If starts with leading 0 (common local format in UK, France, Australia), strip it
  if (cleaned.length > 9 && cleaned.startsWith('0') && country.code !== 'OTHER') {
    cleaned = cleaned.substring(1);
  }

  // Extract only digits
  const rawDigits = cleaned.replace(/\D/g, '');

  if (!rawDigits) {
    return { isValid: false, formattedNumber: '', error: 'Please enter numbers only.' };
  }

  if (country.validate) {
    const res = country.validate(rawDigits);
    if (!res.isValid) {
      return { isValid: false, formattedNumber: `${country.dialCode} ${rawDigits}`, error: res.message };
    }
  } else if (!country.lengths.includes(rawDigits.length)) {
    return {
      isValid: false,
      formattedNumber: `${country.dialCode} ${rawDigits}`,
      error: `Phone number for ${country.name} must be ${country.lengths.join(' or ')} digits.`,
    };
  }

  const finalFormatted = country.dialCode === '+' ? `+${rawDigits}` : `${country.dialCode} ${rawDigits}`;

  return {
    isValid: true,
    formattedNumber: finalFormatted,
  };
}
