import { BuildingConfig, RoomInfo } from '../types';

export const BUILDINGS_CONFIG: BuildingConfig[] = [
  {
    id: 'thachana',
    name: 'ท่าชนะ',
    ranges: '101-110,201-210,301-310,401-410',
    waterType: 'unit',
    waterRate: 20
  },
  {
    id: 'thaphet',
    name: 'ท่าเพชร',
    ranges: '101,201-224,301-324,401-424,501-524',
    waterType: 'unit',
    waterRate: 20
  },
  {
    id: 'thathong',
    name: 'ท่าทอง',
    ranges: '101,201-224,301-324,401-424,501-524',
    waterType: 'unit',
    waterRate: 20
  },
  {
    id: 'prapassorn',
    name: 'ประภัสสร',
    groups: [
      {
        ranges: '4201,4202,4301,4302,4401,4402,4501,4502,4114',
        waterType: 'unit',
        waterRate: 20,
        note: 'บุคลากร คิดตามหน่วย 20 บ./หน่วย'
      },
      {
        ranges: '4203-4217,4303-4317,4403-4417,4503-4517',
        waterType: 'flat_per_person',
        waterRate: 100,
        note: 'นักศึกษา เหมา 100 บ./คน'
      }
    ]
  },
  {
    id: 'ratchaprapha',
    name: 'รัชชประภา',
    ranges: 'R101-R110,R201-R210,R301-R310,R401-R410',
    waterType: 'unit',
    waterRate: 20
  },
  {
    id: 'wiphawadi',
    name: 'วิภาวดี',
    ranges: '1101-1107,1201-1209,1301-1309,1401-1402',
    waterType: 'unit',
    waterRate: 20
  },
  {
    id: 'chaiya',
    name: 'ไชยา',
    ranges: '2101-2107,2201-2206,2207/1,2207/2,2208,2209,2301-2306,2307/1,2307/2,2308,2309,2401,2402',
    waterType: 'unit',
    waterRate: 20
  }
];

// Helper to parse comma-separated and hyphenated room ranges, supporting prefixes like 'R'
export function parseRanges(rangeStr: string): string[] {
  const rooms: string[] = [];
  const parts = rangeStr.split(',').map(s => s.trim());
  parts.forEach(p => {
    if (p.includes('-')) {
      const [startStr, endStr] = p.split('-').map(s => s.trim());
      const prefixMatch = startStr.match(/^([A-Za-z]+)/);
      const prefix = prefixMatch ? prefixMatch[1] : '';
      const startNum = parseInt(startStr.replace(prefix, ''), 10);
      const endNum = parseInt(endStr.replace(prefix, ''), 10);

      for (let i = startNum; i <= endNum; i++) {
        rooms.push(`${prefix}${i}`);
      }
    } else if (p) {
      rooms.push(p);
    }
  });
  return rooms;
}

// Extract floor number from room string
export function extractFloor(roomNo: string): number {
  const cleanNo = roomNo.replace(/^[A-Za-z]+/, '');
  const num = parseInt(cleanNo, 10);
  if (num >= 4000) return Math.floor((num - 4000) / 100);
  if (num >= 2000) return Math.floor((num - 2000) / 100);
  if (num >= 1000) return Math.floor((num - 1000) / 100);
  if (num >= 100) return Math.floor(num / 100);
  return 1;
}

// Build all master rooms
export function generateMasterRooms(): RoomInfo[] {
  const allRooms: RoomInfo[] = [];

  BUILDINGS_CONFIG.forEach(b => {
    if (b.groups) {
      b.groups.forEach(g => {
        const roomNos = parseRanges(g.ranges);
        roomNos.forEach(rNo => {
          allRooms.push({
            id: `${b.id}_${rNo}`,
            buildingId: b.id,
            buildingName: b.name,
            roomNo: rNo,
            floor: extractFloor(rNo),
            waterType: g.waterType,
            waterRate: g.waterRate,
            waterNote: g.note
          });
        });
      });
    } else {
      const roomNos = parseRanges(b.ranges || '');
      roomNos.forEach(rNo => {
        allRooms.push({
          id: `${b.id}_${rNo}`,
          buildingId: b.id,
          buildingName: b.name,
          roomNo: rNo,
          floor: extractFloor(rNo),
          waterType: b.waterType || 'unit',
          waterRate: b.waterRate || 20,
          waterNote: 'คิดตามหน่วย 20 บ./หน่วย'
        });
      });
    }
  });

  return allRooms;
}

export const MASTER_ROOMS = generateMasterRooms();
