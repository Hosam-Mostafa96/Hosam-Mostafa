import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Info, ArrowLeftRight, Compass, Settings, HelpCircle, ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { getPrayerTimesForDate, CITIES_DATABASE, PrayerTimes } from '../utils/prayerTimes';

export const NextPrayerWidget: React.FC = () => {
  const [currentCityName, setCurrentCityName] = useState<string>('الشيخ زايد');
  const [isEgyptianMethod, setIsEgyptianMethod] = useState<boolean>(true);
  const [showAllPrayers, setShowAllPrayers] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Custom manual coordinates state (used if GPS geolocation is active instead of preset)
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  
  // Sound alerts (optional client side toggle)
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);

  // Time ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Retrieve saved custom location from localStorage on mount, or request GPS automatically
  useEffect(() => {
    const savedMethod = localStorage.getItem('local_prayer_method');
    if (savedMethod) {
      setIsEgyptianMethod(savedMethod === 'egypt');
    }
    const savedCoords = localStorage.getItem('local_prayer_gps');
    if (savedCoords) {
      try {
        setCustomCoords(JSON.parse(savedCoords));
      } catch (e) {
        console.error('Error parsing saved GPS', e);
      }
    } else {
      // Auto request GPS location on first mount
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoords = {
            lat: latitude,
            lng: longitude,
            name: 'الموقع الجغرافي الفعلي'
          };
          setCustomCoords(newCoords);
          localStorage.setItem('local_prayer_gps', JSON.stringify(newCoords));
        },
        (err) => {
          console.log('Fallback to default location coordinates since GPS was denied/unavailable');
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  // Get current active coordinates and offset
  const activeCity = CITIES_DATABASE[currentCityName] || CITIES_DATABASE['الشيخ زايد'];
  const lat = customCoords ? customCoords.lat : activeCity.lat;
  const lng = customCoords ? customCoords.lng : activeCity.lng;
  // Browser timezone offset in hours
  const tzOffset = -new Date().getTimezoneOffset() / 60;

  // Calculate times
  const { times, rawTimes } = getPrayerTimesForDate(currentTime, lat, lng, tzOffset, isEgyptianMethod);

  // Determine Next Prayer and remaining seconds
  const currentHourDecimal = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;
  
  const prayerSeq = [
    { id: 'fajr', label: 'الفجر', hour: rawTimes.fajr, timeStr: times.fajr, icon: '🌅' },
    { id: 'sunrise', label: 'الشروق', hour: rawTimes.sunrise, timeStr: times.sunrise, icon: '☀️' },
    { id: 'dhuhr', label: 'الظهر', hour: rawTimes.dhuhr, timeStr: times.dhuhr, icon: '☀️' },
    { id: 'asr', label: 'العصر', hour: rawTimes.asr, timeStr: times.asr, icon: '⛅' },
    { id: 'maghrib', label: 'المغرب', hour: rawTimes.maghrib, timeStr: times.maghrib, icon: '🌤️' },
    { id: 'isha', label: 'العشاء', hour: rawTimes.isha, timeStr: times.isha, icon: '🌙' }
  ];

  // Excluding sunrise for next prayer countdown, but keeping it in times list
  const corePrayers = prayerSeq.filter(p => p.id !== 'sunrise');
  
  // Find first prayer that is ahead
  let nextPrayerInfo = corePrayers.find(p => p.hour > currentHourDecimal);
  let isNextDay = false;
  let remainingHours = 0;

  if (!nextPrayerInfo) {
    // If past Isha, next prayer is Fajr tomorrow
    nextPrayerInfo = corePrayers[0]; // Fajr
    isNextDay = true;
    remainingHours = (24 - currentHourDecimal) + nextPrayerInfo.hour;
  } else {
    remainingHours = nextPrayerInfo.hour - currentHourDecimal;
  }

  const remainingSecondsTotal = Math.max(0, Math.floor(remainingHours * 3600));
  
  // Format Countdown hh:mm:ss
  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    
    return `${hStr} : ${mStr} : ${sStr}`;
  };

  // Progress percentage (approx 4 hours max between prayers for a generic radial ring)
  const maxPeriodSeconds = 4 * 3600; // 4 hours standard scale
  const progressPercent = Math.max(0, Math.min(100, (1 - remainingSecondsTotal / maxPeriodSeconds) * 100));

  // Determine location label
  const locationLabel = customCoords ? customCoords.name : `${activeCity.nameAr}، ${activeCity.countryAr}`;

  // Gregorian & Hijri Dates
  const formattedGregorianStr = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);

  let formattedHijriStr = '';
  try {
    formattedHijriStr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(currentTime);
  } catch (e) {
    // fallback if not supported
    formattedHijriStr = '١٤٤٨ هـ';
  }

  // Handle GPS location lookup
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('نظام تحديد المواقع غير مدعوم في متصفحك.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = {
          lat: latitude,
          lng: longitude,
          name: 'الموقع الجغرافي الفعلي'
        };
        setCustomCoords(newCoords);
        localStorage.setItem('local_prayer_gps', JSON.stringify(newCoords));
        setGpsLoading(false);
      },
      (error) => {
        console.error('Error fetching GPS', error);
        setGpsError('تعذر تحديد موقعك بدقة. يرجى تفعيل إذن تحديد الموقع الجغرافي في جهازك.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Change Method
  const toggleMethod = () => {
    const nextMethod = !isEgyptianMethod;
    setIsEgyptianMethod(nextMethod);
    localStorage.setItem('local_prayer_method', nextMethod ? 'egypt' : 'umm_alqura');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Main Prayer Card */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 text-white rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden border border-white/5" dir="rtl">
        {/* Modern decorative mosques watermark graphic */}
        <div className="absolute right-0 bottom-4 opacity-10 pointer-events-none text-[8rem]">🕌</div>
        
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-400/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left section: Next prayer details */}
          <div className="flex-1 w-full text-right space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-emerald-300/80 uppercase">الصلاة القادمة • Next Prayer</span>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black header-font tracking-tight text-white flex items-center gap-2">
                  {nextPrayerInfo.label}
                  <span className="text-2xl">{nextPrayerInfo.icon}</span>
                </h2>
              </div>
              <p className="text-sm font-light text-emerald-100 flex items-center gap-1.5 mt-1">
                <span className="bg-white/10 px-2.5 py-0.5 rounded-lg text-xs font-bold">{nextPrayerInfo.timeStr}</span>
              </p>
            </div>

             {/* Geographical Location */}
             <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200/90">
               <MapPin className="w-3.5 h-3.5 text-emerald-400" />
               <span>{locationLabel}</span>
             </div>
          </div>

          {/* Right section: SVG Radial Countdown Wheel with Segmented Badge Display */}
          <div className="relative flex flex-col items-center justify-center shrink-0 w-48 h-48">
            {/* Soft background ambient glow */}
            <div className="absolute inset-2 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_12px_rgba(52,211,153,0.35)] pointer-events-none" viewBox="0 0 192 192">
              {/* Thin alignment reference ring */}
              <circle
                cx="96"
                cy="96"
                r="86"
                className="stroke-emerald-900/15 fill-none"
                strokeWidth="1.5"
              />
              {/* Back track ring */}
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-emerald-950/50 fill-none"
                strokeWidth="6"
              />
              {/* Active countdown progress ring */}
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-emerald-400 fill-none transition-all duration-1000"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center segmented timing detailed blocks */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 select-none" dir="ltr">
                {/* Hours Segment Card */}
                <div className="flex flex-col items-center">
                  <span className="bg-black/45 text-emerald-50 rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black border border-white/10 shadow-lg tracking-tight backdrop-blur-md">
                    {Math.floor(remainingSecondsTotal / 3600).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[7.5px] font-bold text-emerald-300/80 mt-1 uppercase scale-95">ساعة</span>
                </div>
                
                <span className="text-emerald-400 text-xs font-black pb-4 animate-pulse select-none">:</span>
                
                {/* Minutes Segment Card */}
                <div className="flex flex-col items-center">
                  <span className="bg-black/45 text-emerald-50 rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black border border-white/10 shadow-lg tracking-tight backdrop-blur-md">
                    {Math.floor((remainingSecondsTotal % 3600) / 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[7.5px] font-bold text-emerald-300/80 mt-1 uppercase scale-95">دقيقة</span>
                </div>
                
                <span className="text-emerald-400 text-xs font-black pb-4 animate-pulse select-none">:</span>
                
                {/* Seconds Segment Card */}
                <div className="flex flex-col items-center">
                  <span className="bg-black/45 text-emerald-50 rounded-lg w-8 h-8 flex items-center justify-center text-xs font-black border border-emerald-400/25 shadow-lg tracking-tight backdrop-blur-md">
                    {(remainingSecondsTotal % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[7.5px] font-bold text-emerald-450 mt-1 uppercase scale-95">ثانية</span>
                </div>
              </div>
              
              <span className="text-[8px] font-black text-emerald-300/90 tracking-widest uppercase mt-2.5">
                متبقي على الصلاة
              </span>
            </div>
          </div>
        </div>

        {/* Footer controls inside the card */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/10 text-center text-[10px] font-bold text-emerald-100/80">
          <button 
            onClick={() => setShowAllPrayers(!showAllPrayers)}
            className="flex items-center justify-center gap-1 py-1 px-2.5 rounded-xl hover:bg-white/5 transition-all text-emerald-200"
          >
            {showAllPrayers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>كل الصلوات</span>
          </button>

          <button 
            onClick={toggleMethod}
            className="py-1 px-2.5 rounded-xl hover:bg-white/5 transition-all text-emerald-200"
            title="تغيير منهجية وطريقة حساب الأوقات"
          >
            {isEgyptianMethod ? 'المساحة المصرية 🇪🇬' : 'أم القرى 🕋'}
          </button>

          <button 
            onClick={handleGPSLocation}
            disabled={gpsLoading}
            className="flex items-center justify-center gap-1 py-1 px-2.5 rounded-xl hover:bg-white/5 transition-all text-emerald-200 disabled:opacity-40"
          >
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>{gpsLoading ? 'جاري التحديد...' : 'تحديد بموقعي'}</span>
          </button>
        </div>

        {/* Expandable all prayers board */}
        {showAllPrayers && (
          <div className="relative z-10 mt-4 pt-4 border-t border-white/5 text-xs text-white divide-y divide-white/5 space-y-2 animate-in slide-in-from-top-3 duration-200">
            {prayerSeq.map((prayer) => {
              const isNext = prayer.id === nextPrayerInfo.id;
              return (
                <div key={prayer.id} className={`flex items-center justify-between py-2 transition-all ${isNext ? 'bg-white/5 px-2.5 rounded-xl border border-white/10 shadow-inner' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{prayer.icon}</span>
                    <span className={`font-black header-font ${isNext ? 'text-emerald-300' : 'text-emerald-100'}`}>
                      {prayer.label}
                      {isNext && <span className="text-[9px] bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-full mr-1.5">التالية</span>}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm">{prayer.timeStr}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {gpsError && (
        <div className="text-[10px] bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-100 font-bold">
          {gpsError}
        </div>
      )}

      {/* Removed manual city selection buttons, relying completely on precise GPS location */}
    </div>
  );
};
