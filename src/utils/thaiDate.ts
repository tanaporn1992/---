export function formatThaiMonthYear(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [y, m] = yearMonthStr.split('-');
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const mIdx = parseInt(m, 10) - 1;
  const thaiYear = parseInt(y, 10) + 543;
  return `${thaiMonths[mIdx] || ''} ${thaiYear}`;
}

export function getShortThaiMonthYear(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [y, m] = yearMonthStr.split('-');
  const thaiShortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const mIdx = parseInt(m, 10) - 1;
  const yearShort = (parseInt(y, 10) + 543).toString().slice(-2);
  return `${thaiShortMonths[mIdx] || ''} ${yearShort}`;
}

export function getPrevShortThaiMonthYear(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [y, m] = yearMonthStr.split('-').map(Number);
  let prevY = y;
  let prevM = m - 1;
  if (prevM < 1) {
    prevM = 12;
    prevY--;
  }
  const thaiShortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const yearShort = (prevY + 543).toString().slice(-2);
  return `${thaiShortMonths[prevM - 1] || ''} ${yearShort}`;
}

export function getPreviousMonthKey(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [y, m] = yearMonthStr.split('-').map(Number);
  let prevY = y;
  let prevM = m - 1;
  if (prevM < 1) {
    prevM = 12;
    prevY--;
  }
  return `${prevY}-${String(prevM).padStart(2, '0')}`;
}

export function formatCurrency(num: number | undefined | null): string {
  return (num || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function compressImageFile(file: File, callback: (base64Img: string) => void): void {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 500;
      const scaleSize = MAX_WIDTH / img.width;
      if (scaleSize < 1) {
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.65));
      }
    };
  };
}

export function getPastSixMonths(yearMonthStr: string): { key: string; label: string; monthIndex: number; year: number }[] {
  if (!yearMonthStr) return [];
  const [y, m] = yearMonthStr.split('-').map(Number);
  const result: { key: string; label: string; monthIndex: number; year: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    let targetM = m - i;
    let targetY = y;
    while (targetM < 1) {
      targetM += 12;
      targetY -= 1;
    }
    const key = `${targetY}-${String(targetM).padStart(2, '0')}`;
    result.push({
      key,
      label: getShortThaiMonthYear(key),
      monthIndex: targetM,
      year: targetY
    });
  }
  return result;
}

export function generateMeterPhotoSvg(
  type: 'water' | 'elec',
  roomNo: string,
  reading: number,
  monthLabel: string,
  buildingName: string = ''
): string {
  const isWater = type === 'water';
  const digits = String(Math.round(reading)).padStart(5, '0').slice(-5);
  const primaryColor = isWater ? '#0284c7' : '#d97706';
  const bgColor = isWater ? '#0f172a' : '#18181b';
  const meterTitle = isWater ? 'WATER METER • มอก. 1021' : 'KILOWATT-HOUR METER 5(15)A';
  const unitLabel = isWater ? 'm³ (ลูกบาศก์เมตร)' : 'kWh (กิโลวัตต์-ชั่วโมง)';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <radialGradient id="glare-${type}" cx="35%" cy="25%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="60%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
      </radialGradient>
      <linearGradient id="bodyGrad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isWater ? '#1e293b' : '#27272a'}"/>
        <stop offset="100%" stop-color="${bgColor}"/>
      </linearGradient>
    </defs>
    <!-- Background Frame / Casing -->
    <rect width="400" height="300" rx="16" fill="url(#bodyGrad-${type})" />
    <rect x="8" y="8" width="384" height="284" rx="12" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-opacity="0.4" />
    
    <!-- Outer Dial Rim -->
    <circle cx="200" cy="140" r="105" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
    <circle cx="200" cy="140" r="99" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    
    <!-- Meter Brand & Specs Header -->
    <text x="200" y="72" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#475569" letter-spacing="1">
      ${meterTitle}
    </text>
    <text x="200" y="85" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#64748b">
      SRU UTILITIES • 220V 50Hz
    </text>

    <!-- Digital Counter Roller Box -->
    <rect x="110" y="98" width="180" height="42" rx="4" fill="#09090b" stroke="#334155" stroke-width="2" />
    
    <!-- Roller Digits -->
    ${digits.split('').map((d, i) => `
      <g transform="translate(${120 + i * 32}, 104)">
        <rect width="28" height="30" rx="2" fill="${i === 4 && isWater ? '#dc2626' : '#18181b'}" />
        <line x1="0" y1="15" x2="28" y2="15" stroke="#27272a" stroke-width="0.5"/>
        <text x="14" y="21" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900" fill="#ffffff">${d}</text>
      </g>
    `).join('')}

    <!-- Unit Label -->
    <text x="200" y="156" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="${primaryColor}">
      ${unitLabel}
    </text>

    <!-- Rotating sub-dials (analog pointers) -->
    <g transform="translate(150, 188)">
      <circle r="18" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="0" y="-8" text-anchor="middle" font-size="6" fill="#64748b">x0.1</text>
      <line x1="0" y1="0" x2="8" y2="-10" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      <circle r="2.5" fill="#dc2626"/>
    </g>
    <g transform="translate(250, 188)">
      <circle r="18" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="0" y="-8" text-anchor="middle" font-size="6" fill="#64748b">x0.01</text>
      <line x1="0" y1="0" x2="-6" y2="9" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      <circle r="2.5" fill="#dc2626"/>
    </g>

    <!-- Glass Glare Reflection Overlay -->
    <circle cx="200" cy="140" r="99" fill="url(#glare-${type})" pointer-events="none"/>

    <!-- Room & Dorm Watermark Banner -->
    <rect x="16" y="248" width="368" height="38" rx="8" fill="#000000" fill-opacity="0.85" />
    <text x="28" y="265" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">
      ห้อง ${roomNo} • ${buildingName ? 'หอพัก' + buildingName : ''} (${isWater ? 'มิเตอร์น้ำ' : 'มิเตอร์ไฟ'})
    </text>
    <text x="28" y="278" font-family="sans-serif" font-size="9" fill="#94a3b8">
      ประจำเดือน: ${monthLabel} | เลขมิเตอร์อ่านได้: ${reading}
    </text>
    
    <!-- Photo Verification Badge -->
    <rect x="300" y="254" width="76" height="24" rx="4" fill="${primaryColor}" />
    <text x="338" y="270" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ffffff">
      VERIFIED
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

