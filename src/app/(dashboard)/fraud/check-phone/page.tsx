'use client';

import { useState, useCallback } from 'react';

interface PhoneAnalysis {
  number: string;
  normalized: string;
  isValid: boolean;
  country: string;
  countryCode: string;
  countryEmoji: string;
  network: {
    name: string;
    mcc: string;
    mnc: string;
    type: string;
  };
  region: {
    province: string;
    city: string;
    areaCode: string;
  };
  riskScore: number;
  riskLevel: string;
  indicators: Array<{
    type: string;
    label: string;
    value: string;
  }>;
  spamReports: {
    reported: boolean;
    reportCount: number;
    categories: string[];
  };
  socialPresence: {
    possible: boolean;
    platforms: string[];
  };
  recommendation: string;
  complaintPath?: {
    authority: string;
    helpline: string;
    website: string;
  };
  liveData?: {
    source: string;
    lineType: string;
    carrier: string;
    location: string;
    isWhatsApp: boolean;
    isVoIP: boolean;
    isRegistered: boolean;
    isRoaming: boolean;
  };
  analysisConfidence?: {
    level: 'high' | 'medium' | 'low';
    percentage: number;
    factors: string[];
  };
  detailedAnalysis?: {
    numberValidity: string;
    networkReliability: string;
    locationInfo: string;
    riskAssessment: string;
    recommendation: string;
  };
}

const COUNTRIES = [
  { code: 'PK', name: 'Pakistan', emoji: '🇵🇰', dial: '+92', placeholder: '03001234567' },
  { code: 'IN', name: 'India', emoji: '🇮🇳', dial: '+91', placeholder: '9876543210' },
  { code: 'US', name: 'United States', emoji: '🇺🇸', dial: '+1', placeholder: '2025551234' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧', dial: '+44', placeholder: '7911123456' },
  { code: 'AE', name: 'UAE', emoji: '🇦🇪', dial: '+971', placeholder: '501234567' },
  { code: 'SA', name: 'Saudi Arabia', emoji: '🇸🇦', dial: '+966', placeholder: '501234567' },
  { code: 'CN', name: 'China', emoji: '🇨🇳', dial: '+86', placeholder: '13812345678' },
  { code: 'TR', name: 'Turkey', emoji: '🇹🇷', dial: '+90', placeholder: '5321234567' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪', dial: '+49', placeholder: '15112345678' },
  { code: 'FR', name: 'France', emoji: '🇫🇷', dial: '+33', placeholder: '612345678' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵', dial: '+81', placeholder: '7012345678' },
];

export default function CheckPhonePage() {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'safe': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'low': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-white/5 text-gray-200 border-white/10';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score <= 25) return 'bg-green-500';
    if (score <= 50) return 'bg-yellow-500';
    if (score <= 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIndicatorColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    }
  };

  const handleScan = useCallback(async () => {
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/fraud/scan/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Scan failed');
        return;
      }

      setResult(data.data);
    } catch {
      setError('Failed to scan phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Fraud Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Phone Number Scanner</h1>
        <p className="text-gray-500 mt-1">Analyze any phone number worldwide for network, region, and fraud indicators</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl border border-white/10 hover:border-gray-400 transition-colors text-sm min-w-[120px] bg-white/[0.03]"
              >
                <span className="text-lg">{selectedCountry.emoji}</span>
                <span className="font-medium">{selectedCountry.dial}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCountryPicker && (
                <div className="absolute top-full left-0 mt-1 card border border-white/10 rounded-xl shadow-lg z-50 w-64 max-h-64 overflow-y-auto">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                        setPhone('');
                        setResult(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm"
                    >
                      <span className="text-lg">{country.emoji}</span>
                      <span className="font-medium">{country.name}</span>
                      <span className="text-gray-400 ml-auto">{country.dial}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder={selectedCountry.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <button
              onClick={handleScan}
              disabled={loading || !phone.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-400 text-white rounded-xl font-medium text-sm hover:from-emerald-700 hover:to-teal-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Scanning...
                </>
              ) : (
                '🔍 Scan'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Supports numbers from {COUNTRIES.length}+ countries — Pakistan, India, US, UK, UAE, Saudi, China, Turkey, Germany, France, Japan
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border ${getRiskColor(result.riskLevel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {result.countryEmoji}{' '}
                  {result.riskLevel === 'safe' && '✅ SAFE'}
                  {result.riskLevel === 'low' && '🟢 LOW RISK'}
                  {result.riskLevel === 'medium' && '🟡 MEDIUM RISK'}
                  {result.riskLevel === 'high' && '🔴 HIGH RISK'}
                  {result.riskLevel === 'critical' && '⛔ CRITICAL'}
                </h3>
                <p className="text-sm mt-1">{result.recommendation}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{result.riskScore}</div>
                <div className="text-xs opacity-75">/100</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-white/5 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${getScoreBarColor(result.riskScore)}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>

          {/* Analysis Confidence */}
          {result.analysisConfidence && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-100">Analysis Confidence</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  result.analysisConfidence.level === 'high' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  result.analysisConfidence.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {result.analysisConfidence.percentage}% {result.analysisConfidence.level.toUpperCase()}
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    result.analysisConfidence.percentage >= 80 ? 'bg-green-500' :
                    result.analysisConfidence.percentage >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${result.analysisConfidence.percentage}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {result.analysisConfidence.factors.map((factor, idx) => (
                  <span key={idx} className="px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded text-xs border border-emerald-500/20">
                    ✓ {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          {result.detailedAnalysis && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">🔍 Detailed Analysis</h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.numberValidity}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.networkReliability}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.locationInfo}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-sm text-gray-300">{result.detailedAnalysis.riskAssessment}</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-lg p-4 border border-emerald-500/30">
                  <p className="text-sm text-gray-200 font-medium">💡 {result.detailedAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Country</p>
              <p className="font-bold text-gray-100">{result.countryEmoji} {result.country}</p>
              <p className="text-xs text-gray-400 mt-1">{result.countryCode}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Network</p>
              <p className="font-bold text-gray-100">{result.network.name}</p>
              <p className="text-xs text-gray-400 mt-1">{result.network.type}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Region</p>
              <p className="font-bold text-gray-100">{result.region.city}</p>
              <p className="text-xs text-gray-400 mt-1">{result.region.province}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-500 mb-1">Spam Reports</p>
              <p className="font-bold text-gray-100">
                {result.spamReports.reported ? `${result.spamReports.reportCount} reports` : 'Not in database'}
              </p>
              {result.spamReports.reported ? (
                <p className="text-xs text-red-500 mt-1">{result.spamReports.categories.join(', ')}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">No known reports</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Analysis Details</h3>
            <div className="space-y-2">
              {result.indicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 border text-sm ${getIndicatorColor(indicator.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{indicator.label}</span>
                      <p className="text-xs mt-0.5 opacity-75">{indicator.value}</p>
                    </div>
                    <span className="text-xs uppercase font-bold opacity-50">
                      {indicator.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.complaintPath && (
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
              <h4 className="font-semibold text-red-300 mb-2">How to Report This Number</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Authority:</strong> {result.complaintPath.authority}</p>
                <p><strong>Helpline:</strong> {result.complaintPath.helpline}</p>
                <p><strong>Website:</strong> {result.complaintPath.website}</p>
              </div>
            </div>
          )}

          {result.socialPresence.possible && (
            <div className="card">
              <h4 className="font-semibold text-gray-100 mb-2">Verify This Number</h4>
              <p className="text-sm text-gray-400 mb-2">Use these platforms to verify the sender:</p>
              <div className="flex gap-2 flex-wrap">
                {result.socialPresence.platforms.map((platform) => (
                  <span key={platform} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/30">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.liveData ? (
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h4 className="font-semibold text-green-300">Live Data Verified</h4>
              </div>
              <p className="text-sm text-gray-300">
                Data sourced in real-time from {result.liveData.source}.
                Carrier: {result.liveData.carrier} | Type: {result.liveData.lineType}
                {result.liveData.isVoIP && ' | ⚠ VoIP number'}
                {result.liveData.isRoaming && ' | ⚠ Roaming'}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <h4 className="font-semibold text-yellow-300">Static Analysis Only</h4>
              </div>
              <p className="text-sm text-gray-300">
                Live verification unavailable. Results are based on number format and prefix analysis only.
                Network detection is prefix-based and may not reflect number portability.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
