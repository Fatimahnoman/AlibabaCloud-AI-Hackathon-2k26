export interface LivePhoneData {
  isValid: boolean;
  lineType: string;
  carrier: string;
  location: string;
  country: string;
  countryCode: string;
  isRegistered: boolean;
  isRoaming: boolean;
  isWhatsApp: boolean;
  isVoIP: boolean;
  source: string;
}

async function lookupAbstractAPI(phoneNumber: string): Promise<Partial<LivePhoneData> | null> {
  const apiKey = process.env.ABSTRACT_PHONE_API_KEY;
  if (!apiKey) return null;

  try {
    let phone = phoneNumber;
    if (!phone.startsWith('+')) {
      if (phone.startsWith('0')) phone = '92' + phone.slice(1);
      else phone = '+' + phone;
    } else {
      phone = phone;
    }
    const url = `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(phone)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      isValid: data.valid === true,
      lineType: data.type || 'unknown',
      carrier: data.carrier || 'Unknown',
      location: [data.location?.city, data.location?.region, data.location?.country].filter(Boolean).join(', '),
      country: data.country?.name || 'Unknown',
      countryCode: data.country?.code || '',
      isRegistered: data.valid === true,
      isRoaming: data.roaming === true,
      source: 'Abstract API',
    };
  } catch {
    return null;
  }
}

async function lookupNumverify(phoneNumber: string): Promise<Partial<LivePhoneData> | null> {
  const apiKey = process.env.NUMVERIFY_API_KEY;
  if (!apiKey) return null;

  try {
    let number = phoneNumber;
    if (!number.startsWith('+')) {
      if (number.startsWith('0')) number = '92' + number.slice(1);
      else number = '+' + number;
    }
    number = number.replace('+', '');
    const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${number}&country_code=&format=1`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.valid === undefined) return null;
    return {
      isValid: data.valid === true,
      lineType: data.line_type || 'unknown',
      carrier: data.carrier || 'Unknown',
      location: [data.location, data.country_name].filter(Boolean).join(', '),
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || '',
      isRegistered: data.valid === true,
      isRoaming: false,
      source: 'Numverify',
    };
  } catch {
    return null;
  }
}

export async function checkWhatsApp(phoneNumber: string): Promise<boolean> {
  try {
    const clean = phoneNumber.replace(/[^\d]/g, '');
    const number = clean.startsWith('+') ? clean.slice(1) : clean;
    const response = await fetch(`https://api.whatsapp.com/send?phone=${number}`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    });
    const location = response.headers.get('location') || '';
    return !location.includes('send?phone=');
  } catch {
    return false;
  }
}

export async function lookupPhoneRealtime(phoneNumber: string): Promise<LivePhoneData | null> {
  const abstractResult = await lookupAbstractAPI(phoneNumber);
  if (abstractResult && abstractResult.isValid !== undefined) {
    const whatsapp = await checkWhatsApp(phoneNumber);
    return {
      isValid: abstractResult.isValid ?? false,
      lineType: abstractResult.lineType || 'unknown',
      carrier: abstractResult.carrier || 'Unknown',
      location: abstractResult.location || 'Unknown',
      country: abstractResult.country || 'Unknown',
      countryCode: abstractResult.countryCode || '',
      isRegistered: abstractResult.isRegistered ?? false,
      isRoaming: abstractResult.isRoaming ?? false,
      isWhatsApp: whatsapp,
      isVoIP: abstractResult.lineType === 'voip' || abstractResult.lineType === 'virtual',
      source: 'Abstract API',
    };
  }

  const numverifyResult = await lookupNumverify(phoneNumber);
  if (numverifyResult && numverifyResult.isValid !== undefined) {
    const whatsapp = await checkWhatsApp(phoneNumber);
    return {
      isValid: numverifyResult.isValid ?? false,
      lineType: numverifyResult.lineType || 'unknown',
      carrier: numverifyResult.carrier || 'Unknown',
      location: numverifyResult.location || 'Unknown',
      country: numverifyResult.country || 'Unknown',
      countryCode: numverifyResult.countryCode || '',
      isRegistered: numverifyResult.isRegistered ?? false,
      isRoaming: false,
      isWhatsApp: whatsapp,
      isVoIP: numverifyResult.lineType === 'voip' || numverifyResult.lineType === 'virtual',
      source: 'Numverify',
    };
  }

  return null;
}
