import { MeterRecord, DormSettings, RoomInfo } from '../types';

export const DEFAULT_SETTINGS: DormSettings = {
  defaultElecRate: 6,
  defaultWaterRate: 20,
  defaultFlatWaterRate: 100
};

const SETTINGS_KEY = 'dorm_meter_settings';
const RECORDS_KEY = 'dorm_meter_records_db';

export function loadStoredSettings(): DormSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: DormSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadAllRecords(): Record<string, Record<string, MeterRecord>> {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading records', e);
  }
  return {};
}

export function saveAllRecords(records: Record<string, Record<string, MeterRecord>>): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

// Authentic data for Chaiya directly from official university PDF
const CHAIYA_AUTHENTIC_DATA: Record<string, { wPrev: number; wCurr: number; ePrev: number; eCurr: number; remark: string }> = {
  '2101': { wPrev: 1318, wCurr: 1318, ePrev: 40, eCurr: 41, remark: 'ปรับปรุง' },
  '2102': { wPrev: 1454, wCurr: 1454, ePrev: 46, eCurr: 46, remark: 'ปรับปรุง' },
  '2103': { wPrev: 1830, wCurr: 1830, ePrev: 82, eCurr: 82, remark: 'ปรับปรุง' },
  '2104': { wPrev: 1705, wCurr: 1705, ePrev: 81, eCurr: 81, remark: 'ปรับปรุง' },
  '2105': { wPrev: 2709, wCurr: 2709, ePrev: 35, eCurr: 35, remark: 'ปรับปรุง' },
  '2106': { wPrev: 2795, wCurr: 2795, ePrev: 56, eCurr: 58, remark: 'ปรับปรุง' },
  '2107': { wPrev: 764, wCurr: 766, ePrev: 138, eCurr: 206, remark: '' },
  '2201': { wPrev: 1472, wCurr: 1475, ePrev: 1691, eCurr: 1747, remark: '' },
  '2202': { wPrev: 1186, wCurr: 1191, ePrev: 2548, eCurr: 2656, remark: '' },
  '2203': { wPrev: 1730, wCurr: 1737, ePrev: 1247, eCurr: 1303, remark: '' },
  '2204': { wPrev: 1961, wCurr: 1962, ePrev: 1952, eCurr: 2059, remark: '' },
  '2205': { wPrev: 1413, wCurr: 1413, ePrev: 2571, eCurr: 2571, remark: '' },
  '2206': { wPrev: 1945, wCurr: 1947, ePrev: 1375, eCurr: 1500, remark: '' },
  '2207/1': { wPrev: 1196, wCurr: 1196, ePrev: 1196, eCurr: 1196, remark: 'ปรับปรุง' },
  '2207/2': { wPrev: 1, wCurr: 1, ePrev: 2, eCurr: 2, remark: 'ปรับปรุง' },
  '2208': { wPrev: 311, wCurr: 313, ePrev: 1274, eCurr: 1371, remark: '' },
  '2209': { wPrev: 1713, wCurr: 1713, ePrev: 13, eCurr: 13, remark: 'ปรับปรุง' },
  '2301': { wPrev: 705, wCurr: 709, ePrev: 2196, eCurr: 2351, remark: '' },
  '2302': { wPrev: 665, wCurr: 668, ePrev: 1596, eCurr: 1704, remark: '' },
  '2303': { wPrev: 1738, wCurr: 1740, ePrev: 1972, eCurr: 2074, remark: '' },
  '2304': { wPrev: 2468, wCurr: 2472, ePrev: 2079, eCurr: 2234, remark: '' },
  '2305': { wPrev: 1452, wCurr: 1456, ePrev: 1000, eCurr: 1042, remark: '' },
  '2306': { wPrev: 1329, wCurr: 1329, ePrev: 3428, eCurr: 3428, remark: '' },
  '2307/1': { wPrev: 1912, wCurr: 1912, ePrev: 2693, eCurr: 2693, remark: 'ปรับปรุง' },
  '2307/2': { wPrev: 1, wCurr: 1, ePrev: 3, eCurr: 3, remark: 'ปรับปรุง' },
  '2308': { wPrev: 984, wCurr: 989, ePrev: 996, eCurr: 1068, remark: '' },
  '2309': { wPrev: 2002, wCurr: 2002, ePrev: 9, eCurr: 10, remark: 'ปรับปรุง' },
  '2401': { wPrev: 1147, wCurr: 1147, ePrev: 5, eCurr: 5, remark: 'ปรับปรุง' },
  '2402': { wPrev: 1375, wCurr: 1377, ePrev: 342, eCurr: 481, remark: '' }
};

// Authentic data for Wiphawadi (วิภาวดี)
const WIPHAWADI_AUTHENTIC_DATA: Record<string, { wPrev: number; wCurr: number; ePrev: number; eCurr: number; remark: string }> = {
  '1101': { wPrev: 1573, wCurr: 1574, ePrev: 3738, eCurr: 3830, remark: '' },
  '1102': { wPrev: 493, wCurr: 502, ePrev: 1555, eCurr: 1661, remark: '' },
  '1103': { wPrev: 1945, wCurr: 1947, ePrev: 1923, eCurr: 2023, remark: '' },
  '1104': { wPrev: 1433, wCurr: 1439, ePrev: 970, eCurr: 1052, remark: '' },
  '1105': { wPrev: 1204, wCurr: 1209, ePrev: 1076, eCurr: 1129, remark: '' },
  '1106': { wPrev: 1512, wCurr: 1521, ePrev: 4196, eCurr: 4487, remark: '' },
  '1107': { wPrev: 364, wCurr: 364, ePrev: 5651, eCurr: 5651, remark: '' },
  '1201': { wPrev: 1604, wCurr: 1605, ePrev: 1144, eCurr: 1282, remark: '' },
  '1202': { wPrev: 1486, wCurr: 1487, ePrev: 952, eCurr: 1055, remark: '' },
  '1203': { wPrev: 1912, wCurr: 1919, ePrev: 2079, eCurr: 2260, remark: '' },
  '1204': { wPrev: 1487, wCurr: 1488, ePrev: 5946, eCurr: 6290, remark: '' },
  '1205': { wPrev: 1321, wCurr: 1322, ePrev: 1781, eCurr: 1824, remark: '' },
  '1206': { wPrev: 1329, wCurr: 1330, ePrev: 2881, eCurr: 2998, remark: '' },
  '1207': { wPrev: 1277, wCurr: 1277, ePrev: 2210, eCurr: 2210, remark: '' },
  '1208': { wPrev: 1087, wCurr: 1087, ePrev: 15, eCurr: 15, remark: 'นักศึกษาจีน' },
  '1209': { wPrev: 2195, wCurr: 2195, ePrev: 5191, eCurr: 5191, remark: 'นักศึกษาจีน' },
  '1301': { wPrev: 15, wCurr: 15, ePrev: 1152, eCurr: 1152, remark: '' },
  '1302': { wPrev: 1206, wCurr: 1207, ePrev: 1168, eCurr: 1247, remark: '' },
  '1303': { wPrev: 1689, wCurr: 1689, ePrev: 1658, eCurr: 1658, remark: '' },
  '1304': { wPrev: 1409, wCurr: 1410, ePrev: 3190, eCurr: 3392, remark: '' },
  '1305': { wPrev: 1346, wCurr: 1350, ePrev: 2542, eCurr: 2630, remark: '' },
  '1306': { wPrev: 1488, wCurr: 1489, ePrev: 3436, eCurr: 3634, remark: '' },
  '1307': { wPrev: 1362, wCurr: 1362, ePrev: 524, eCurr: 524, remark: '' },
  '1308': { wPrev: 781, wCurr: 781, ePrev: 5449, eCurr: 5449, remark: 'นักศึกษาจีน' },
  '1309': { wPrev: 1532, wCurr: 1532, ePrev: 2117, eCurr: 2117, remark: 'นักศึกษาจีน' },
  '1401': { wPrev: 1474, wCurr: 1474, ePrev: 8820, eCurr: 8820, remark: 'นักศึกษาจีน' },
  '1402': { wPrev: 2063, wCurr: 2063, ePrev: 5800, eCurr: 5800, remark: 'นักศึกษาจีน' }
};

// Authentic data for Thachana (ท่าชนะ)
const THACHANA_AUTHENTIC_DATA: Record<string, { wPrev: number; wCurr: number; ePrev: number; eCurr: number; remark: string }> = {
  '101': { wPrev: 867, wCurr: 882, ePrev: 6829, eCurr: 6929, remark: '' },
  '102': { wPrev: 916, wCurr: 919, ePrev: 7170, eCurr: 7216, remark: '' },
  '103': { wPrev: 763, wCurr: 771, ePrev: 6616, eCurr: 6722, remark: 'นักฟุตบอล' },
  '104': { wPrev: 798, wCurr: 810, ePrev: 6667, eCurr: 6740, remark: 'นักฟุตบอล' },
  '105': { wPrev: 855, wCurr: 861, ePrev: 8567, eCurr: 8642, remark: 'นักฟุตบอล' },
  '106': { wPrev: 876, wCurr: 885, ePrev: 8236, eCurr: 8326, remark: 'นักฟุตบอล' },
  '107': { wPrev: 850, wCurr: 856, ePrev: 6322, eCurr: 6350, remark: 'นักฟุตบอล' },
  '108': { wPrev: 718, wCurr: 725, ePrev: 8309, eCurr: 8417, remark: 'นักฟุตบอล' },
  '109': { wPrev: 910, wCurr: 922, ePrev: 7888, eCurr: 7983, remark: 'นักฟุตบอล' },
  '110': { wPrev: 837, wCurr: 847, ePrev: 6846, eCurr: 6987, remark: 'นักฟุตบอล' },
  '201': { wPrev: 878, wCurr: 891, ePrev: 6767, eCurr: 6856, remark: '' },
  '202': { wPrev: 672, wCurr: 679, ePrev: 5994, eCurr: 6069, remark: '' },
  '203': { wPrev: 913, wCurr: 921, ePrev: 8103, eCurr: 8186, remark: '' },
  '204': { wPrev: 933, wCurr: 939, ePrev: 7665, eCurr: 7797, remark: '' },
  '205': { wPrev: 884, wCurr: 897, ePrev: 7795, eCurr: 7883, remark: '' },
  '206': { wPrev: 858, wCurr: 867, ePrev: 8327, eCurr: 8474, remark: '' },
  '207': { wPrev: 951, wCurr: 960, ePrev: 9153, eCurr: 9219, remark: '' },
  '208': { wPrev: 1009, wCurr: 1009, ePrev: 7530, eCurr: 7530, remark: '' },
  '209': { wPrev: 978, wCurr: 982, ePrev: 7818, eCurr: 7881, remark: '' },
  '210': { wPrev: 756, wCurr: 762, ePrev: 7757, eCurr: 7873, remark: '' },
  '301': { wPrev: 1202, wCurr: 1209, ePrev: 8380, eCurr: 8472, remark: '' },
  '302': { wPrev: 901, wCurr: 902, ePrev: 7369, eCurr: 7743, remark: '' },
  '303': { wPrev: 966, wCurr: 968, ePrev: 6150, eCurr: 6168, remark: '' },
  '304': { wPrev: 992, wCurr: 994, ePrev: 7172, eCurr: 7417, remark: '' },
  '305': { wPrev: 962, wCurr: 964, ePrev: 7361, eCurr: 7455, remark: '' },
  '306': { wPrev: 1107, wCurr: 1115, ePrev: 9150, eCurr: 9608, remark: '' },
  '307': { wPrev: 1201, wCurr: 1211, ePrev: 7304, eCurr: 7486, remark: '' },
  '308': { wPrev: 877, wCurr: 880, ePrev: 8105, eCurr: 8374, remark: '' },
  '309': { wPrev: 919, wCurr: 923, ePrev: 9220, eCurr: 9348, remark: '' },
  '310': { wPrev: 1010, wCurr: 1010, ePrev: 6541, eCurr: 6541, remark: '' },
  '401': { wPrev: 800, wCurr: 800, ePrev: 5797, eCurr: 5805, remark: '' },
  '402': { wPrev: 802, wCurr: 803, ePrev: 6637, eCurr: 6637, remark: '' },
  '403': { wPrev: 889, wCurr: 889, ePrev: 7656, eCurr: 7656, remark: '' },
  '404': { wPrev: 852, wCurr: 852, ePrev: 6306, eCurr: 6306, remark: '' },
  '405': { wPrev: 962, wCurr: 962, ePrev: 5552, eCurr: 5552, remark: '' },
  '406': { wPrev: 769, wCurr: 769, ePrev: 6205, eCurr: 6205, remark: '' },
  '407': { wPrev: 960, wCurr: 960, ePrev: 7485, eCurr: 7485, remark: '' },
  '408': { wPrev: 952, wCurr: 952, ePrev: 7153, eCurr: 7153, remark: '' },
  '409': { wPrev: 607, wCurr: 607, ePrev: 5706, eCurr: 5706, remark: '' },
  '410': { wPrev: 780, wCurr: 780, ePrev: 5962, eCurr: 5962, remark: '' }
};

// Authentic data for Ratchaprapha (รัชชประภา)
const RATCHAPRAPHA_AUTHENTIC_DATA: Record<string, { wPrev: number; wCurr: number; ePrev: number; eCurr: number; remark: string }> = {
  'R101': { wPrev: 701, wCurr: 707, ePrev: 6023, eCurr: 6069, remark: '' },
  'R102': { wPrev: 715, wCurr: 727, ePrev: 5351, eCurr: 5461, remark: '' },
  'R103': { wPrev: 747, wCurr: 759, ePrev: 6148, eCurr: 6237, remark: '' },
  'R104': { wPrev: 1011, wCurr: 1025, ePrev: 6613, eCurr: 6724, remark: '' },
  'R105': { wPrev: 873, wCurr: 889, ePrev: 6520, eCurr: 6625, remark: '' },
  'R106': { wPrev: 968, wCurr: 982, ePrev: 6778, eCurr: 6859, remark: '' },
  'R107': { wPrev: 1278, wCurr: 1295, ePrev: 8170, eCurr: 8299, remark: '' },
  'R108': { wPrev: 913, wCurr: 923, ePrev: 6701, eCurr: 6747, remark: '' },
  'R109': { wPrev: 882, wCurr: 885, ePrev: 7788, eCurr: 7811, remark: '' },
  'R110': { wPrev: 769, wCurr: 776, ePrev: 6806, eCurr: 6840, remark: '' },
  'R201': { wPrev: 925, wCurr: 935, ePrev: 7115, eCurr: 7241, remark: '' },
  'R202': { wPrev: 934, wCurr: 943, ePrev: 5844, eCurr: 5915, remark: '' },
  'R203': { wPrev: 838, wCurr: 856, ePrev: 5917, eCurr: 6037, remark: '' },
  'R204': { wPrev: 875, wCurr: 890, ePrev: 6812, eCurr: 6905, remark: '' },
  'R205': { wPrev: 826, wCurr: 830, ePrev: 6981, eCurr: 7046, remark: '' },
  'R206': { wPrev: 633, wCurr: 644, ePrev: 6655, eCurr: 6754, remark: '' },
  'R207': { wPrev: 1082, wCurr: 1108, ePrev: 6783, eCurr: 6869, remark: '' },
  'R208': { wPrev: 845, wCurr: 863, ePrev: 7168, eCurr: 7307, remark: '' },
  'R209': { wPrev: 981, wCurr: 1005, ePrev: 6729, eCurr: 6857, remark: '' },
  'R210': { wPrev: 983, wCurr: 994, ePrev: 7553, eCurr: 7611, remark: '' },
  'R301': { wPrev: 1074, wCurr: 1081, ePrev: 6466, eCurr: 6537, remark: '' },
  'R302': { wPrev: 1015, wCurr: 1026, ePrev: 5648, eCurr: 5711, remark: '' },
  'R303': { wPrev: 956, wCurr: 966, ePrev: 5473, eCurr: 5528, remark: '' },
  'R304': { wPrev: 730, wCurr: 742, ePrev: 5912, eCurr: 6042, remark: '' },
  'R305': { wPrev: 1028, wCurr: 1044, ePrev: 5985, eCurr: 6108, remark: '' },
  'R306': { wPrev: 868, wCurr: 885, ePrev: 5846, eCurr: 5906, remark: '' },
  'R307': { wPrev: 1137, wCurr: 1151, ePrev: 6130, eCurr: 6203, remark: '' },
  'R308': { wPrev: 943, wCurr: 943, ePrev: 6533, eCurr: 6533, remark: '' },
  'R309': { wPrev: 1105, wCurr: 1124, ePrev: 6413, eCurr: 6513, remark: '' },
  'R310': { wPrev: 946, wCurr: 965, ePrev: 6258, eCurr: 6337, remark: '' },
  'R401': { wPrev: 807, wCurr: 809, ePrev: 5142, eCurr: 5245, remark: '' },
  'R402': { wPrev: 860, wCurr: 860, ePrev: 5320, eCurr: 5326, remark: '' },
  'R403': { wPrev: 674, wCurr: 732, ePrev: 4861, eCurr: 4862, remark: '' },
  'R404': { wPrev: 890, wCurr: 890, ePrev: 5061, eCurr: 5062, remark: '' },
  'R405': { wPrev: 867, wCurr: 868, ePrev: 5336, eCurr: 5339, remark: '' },
  'R406': { wPrev: 627, wCurr: 628, ePrev: 4630, eCurr: 4631, remark: '' },
  'R407': { wPrev: 871, wCurr: 871, ePrev: 6801, eCurr: 6801, remark: '' },
  'R408': { wPrev: 779, wCurr: 779, ePrev: 5201, eCurr: 5202, remark: '' },
  'R409': { wPrev: 673, wCurr: 673, ePrev: 5176, eCurr: 5178, remark: '' },
  'R410': { wPrev: 775, wCurr: 776, ePrev: 5405, eCurr: 5409, remark: '' }
};

// Authentic data for Thathong (ท่าทอง)
const THATHONG_AUTHENTIC_DATA: Record<string, { wPrev: number; wCurr: number; ePrev: number; eCurr: number; remark: string }> = {
  // Page 1: 101, 201-224
  '101': { wPrev: 6555, wCurr: 6557, ePrev: 5671, eCurr: 5710, remark: 'ห้องนักวิชาการ' },
  '201': { wPrev: 2639, wCurr: 2644, ePrev: 3275, eCurr: 3325, remark: '' },
  '202': { wPrev: 2705, wCurr: 2720, ePrev: 2750, eCurr: 2804, remark: '' },
  '203': { wPrev: 2631, wCurr: 2633, ePrev: 5529, eCurr: 5558, remark: '' },
  '204': { wPrev: 2660, wCurr: 2668, ePrev: 3755, eCurr: 3781, remark: '' },
  '205': { wPrev: 2373, wCurr: 2377, ePrev: 3898, eCurr: 3957, remark: '' },
  '206': { wPrev: 2568, wCurr: 2582, ePrev: 5111, eCurr: 5207, remark: '' },
  '207': { wPrev: 3061, wCurr: 3067, ePrev: 3562, eCurr: 3607, remark: '' },
  '208': { wPrev: 2331, wCurr: 2337, ePrev: 2668, eCurr: 2694, remark: '' },
  '209': { wPrev: 2437, wCurr: 2445, ePrev: 447, eCurr: 466, remark: '' },
  '210': { wPrev: 2541, wCurr: 2551, ePrev: 3827, eCurr: 3870, remark: '' },
  '211': { wPrev: 3009, wCurr: 3019, ePrev: 2926, eCurr: 2981, remark: '' },
  '212': { wPrev: 2407, wCurr: 2411, ePrev: 3106, eCurr: 3140, remark: '' },
  '213': { wPrev: 1087, wCurr: 1093, ePrev: 305, eCurr: 357, remark: '' },
  '214': { wPrev: 2386, wCurr: 2391, ePrev: 3756, eCurr: 3810, remark: '' },
  '215': { wPrev: 2066, wCurr: 2069, ePrev: 4175, eCurr: 4175, remark: '' },
  '216': { wPrev: 2468, wCurr: 2475, ePrev: 2825, eCurr: 2878, remark: '' },
  '217': { wPrev: 2515, wCurr: 2523, ePrev: 3682, eCurr: 3748, remark: '' },
  '218': { wPrev: 2457, wCurr: 2461, ePrev: 4350, eCurr: 4405, remark: '' },
  '219': { wPrev: 2469, wCurr: 2479, ePrev: 3610, eCurr: 3920, remark: '' },
  '220': { wPrev: 2415, wCurr: 2417, ePrev: 3751, eCurr: 3759, remark: '' },
  '221': { wPrev: 2556, wCurr: 2566, ePrev: 3827, eCurr: 3946, remark: '' },
  '222': { wPrev: 2276, wCurr: 2283, ePrev: 4316, eCurr: 4483, remark: '' },
  '223': { wPrev: 2814, wCurr: 2832, ePrev: 4938, eCurr: 5141, remark: '' },
  '224': { wPrev: 2761, wCurr: 2768, ePrev: 4176, eCurr: 4324, remark: '' },

  // Page 2: 301-324
  '301': { wPrev: 2262, wCurr: 2269, ePrev: 4727, eCurr: 4891, remark: '' },
  '302': { wPrev: 2328, wCurr: 2333, ePrev: 1543, eCurr: 1581, remark: '' },
  '303': { wPrev: 2095, wCurr: 2101, ePrev: 4371, eCurr: 4526, remark: '' },
  '304': { wPrev: 2291, wCurr: 2293, ePrev: 3973, eCurr: 4022, remark: '' },
  '305': { wPrev: 2244, wCurr: 2250, ePrev: 4626, eCurr: 4722, remark: '' },
  '306': { wPrev: 2154, wCurr: 2156, ePrev: 4235, eCurr: 4286, remark: '' },
  '307': { wPrev: 2464, wCurr: 2464, ePrev: 7498, eCurr: 7734, remark: '' },
  '308': { wPrev: 1993, wCurr: 2000, ePrev: 4416, eCurr: 4860, remark: '' },
  '309': { wPrev: 2887, wCurr: 2893, ePrev: 6404, eCurr: 6570, remark: '' },
  '310': { wPrev: 2069, wCurr: 2072, ePrev: 5273, eCurr: 5307, remark: '' },
  '311': { wPrev: 2698, wCurr: 2703, ePrev: 8163, eCurr: 8232, remark: '' },
  '312': { wPrev: 2076, wCurr: 2080, ePrev: 5733, eCurr: 5808, remark: '' },
  '313': { wPrev: 2423, wCurr: 2432, ePrev: 5025, eCurr: 5282, remark: '' },
  '314': { wPrev: 2138, wCurr: 2142, ePrev: 3342, eCurr: 3390, remark: '' },
  '315': { wPrev: 2379, wCurr: 2385, ePrev: 5175, eCurr: 5213, remark: '' },
  '316': { wPrev: 2306, wCurr: 2310, ePrev: 6835, eCurr: 7351, remark: '' },
  '317': { wPrev: 2434, wCurr: 2438, ePrev: 5824, eCurr: 5900, remark: '' },
  '318': { wPrev: 2453, wCurr: 2455, ePrev: 6678, eCurr: 6751, remark: '' },
  '319': { wPrev: 2195, wCurr: 2200, ePrev: 4786, eCurr: 4920, remark: '' },
  '320': { wPrev: 2064, wCurr: 2071, ePrev: 4234, eCurr: 4325, remark: '' },
  '321': { wPrev: 2175, wCurr: 2179, ePrev: 6798, eCurr: 6901, remark: '' },
  '322': { wPrev: 2292, wCurr: 2293, ePrev: 5088, eCurr: 5236, remark: '' },
  '323': { wPrev: 2465, wCurr: 2470, ePrev: 4050, eCurr: 4129, remark: '' },
  '324': { wPrev: 2378, wCurr: 2383, ePrev: 6286, eCurr: 6472, remark: '' },

  // Page 3: 401-424
  '401': { wPrev: 2341, wCurr: 2369, ePrev: 4704, eCurr: 4853, remark: '' },
  '402': { wPrev: 2228, wCurr: 2236, ePrev: 2394, eCurr: 2452, remark: '' },
  '403': { wPrev: 2368, wCurr: 2381, ePrev: 3283, eCurr: 3364, remark: '' },
  '404': { wPrev: 2516, wCurr: 2522, ePrev: 3054, eCurr: 3134, remark: '' },
  '405': { wPrev: 2354, wCurr: 2364, ePrev: 2638, eCurr: 2723, remark: '' },
  '406': { wPrev: 2169, wCurr: 2183, ePrev: 3059, eCurr: 3121, remark: '' },
  '407': { wPrev: 1958, wCurr: 1969, ePrev: 3375, eCurr: 3432, remark: '' },
  '408': { wPrev: 2178, wCurr: 2181, ePrev: 3528, eCurr: 3560, remark: '' },
  '409': { wPrev: 2159, wCurr: 2162, ePrev: 2861, eCurr: 2884, remark: '' },
  '410': { wPrev: 2205, wCurr: 2215, ePrev: 2754, eCurr: 2820, remark: '' },
  '411': { wPrev: 2164, wCurr: 2178, ePrev: 4007, eCurr: 4099, remark: '' },
  '412': { wPrev: 2458, wCurr: 2470, ePrev: 4198, eCurr: 4279, remark: '' },
  '413': { wPrev: 2074, wCurr: 2074, ePrev: 2745, eCurr: 2746, remark: '' },
  '414': { wPrev: 2321, wCurr: 2322, ePrev: 2668, eCurr: 2669, remark: '' },
  '415': { wPrev: 2126, wCurr: 2132, ePrev: 4717, eCurr: 4770, remark: '' },
  '416': { wPrev: 2675, wCurr: 2713, ePrev: 2067, eCurr: 2128, remark: '' },
  '417': { wPrev: 2366, wCurr: 2374, ePrev: 4036, eCurr: 4115, remark: '' },
  '418': { wPrev: 2975, wCurr: 2980, ePrev: 3077, eCurr: 3111, remark: '' },
  '419': { wPrev: 2124, wCurr: 2129, ePrev: 2723, eCurr: 2810, remark: '' },
  '420': { wPrev: 2348, wCurr: 2357, ePrev: 3814, eCurr: 3871, remark: '' },
  '421': { wPrev: 2037, wCurr: 2043, ePrev: 1199, eCurr: 1289, remark: '' },
  '422': { wPrev: 2044, wCurr: 2046, ePrev: 743, eCurr: 747, remark: '' },
  '423': { wPrev: 2179, wCurr: 2228, ePrev: 2566, eCurr: 2625, remark: '' },
  '424': { wPrev: 2050, wCurr: 2066, ePrev: 1581, eCurr: 1671, remark: '' },

  // Page 4: 501-524
  '501': { wPrev: 1769, wCurr: 1769, ePrev: 628, eCurr: 628, remark: '' },
  '502': { wPrev: 1769, wCurr: 1769, ePrev: 7544, eCurr: 7544, remark: '' },
  '503': { wPrev: 2088, wCurr: 2088, ePrev: 6309, eCurr: 6309, remark: '' },
  '504': { wPrev: 2096, wCurr: 2096, ePrev: 1368, eCurr: 1368, remark: '' },
  '505': { wPrev: 1747, wCurr: 1747, ePrev: 1373, eCurr: 1373, remark: '' },
  '506': { wPrev: 1826, wCurr: 1826, ePrev: 1225, eCurr: 1225, remark: '' },
  '507': { wPrev: 1656, wCurr: 1656, ePrev: 9641, eCurr: 9641, remark: '' },
  '508': { wPrev: 1633, wCurr: 1633, ePrev: 201, eCurr: 201, remark: '' },
  '509': { wPrev: 1912, wCurr: 1912, ePrev: 1067, eCurr: 1067, remark: '' },
  '510': { wPrev: 1673, wCurr: 1673, ePrev: 1094, eCurr: 1094, remark: '' },
  '511': { wPrev: 1818, wCurr: 1820, ePrev: 3091, eCurr: 3121, remark: '' },
  '512': { wPrev: 2405, wCurr: 2405, ePrev: 2086, eCurr: 2086, remark: '' },
  '513': { wPrev: 2375, wCurr: 2375, ePrev: 1023, eCurr: 1023, remark: '' },
  '514': { wPrev: 2015, wCurr: 2015, ePrev: 2407, eCurr: 2407, remark: '' },
  '515': { wPrev: 1814, wCurr: 1814, ePrev: 465, eCurr: 465, remark: '' },
  '516': { wPrev: 2446, wCurr: 2446, ePrev: 156, eCurr: 156, remark: '' },
  '517': { wPrev: 1847, wCurr: 1847, ePrev: 2815, eCurr: 2815, remark: '' },
  '518': { wPrev: 1931, wCurr: 1931, ePrev: 1746, eCurr: 1746, remark: '' },
  '519': { wPrev: 1473, wCurr: 1473, ePrev: 47, eCurr: 47, remark: '' },
  '520': { wPrev: 2036, wCurr: 2036, ePrev: 954, eCurr: 954, remark: '' },
  '521': { wPrev: 1866, wCurr: 1866, ePrev: 630, eCurr: 630, remark: '' },
  '522': { wPrev: 1564, wCurr: 1564, ePrev: 9022, eCurr: 9022, remark: '' },
  '523': { wPrev: 1746, wCurr: 1746, ePrev: 1351, eCurr: 1351, remark: '' },
  '524': { wPrev: 1766, wCurr: 1766, ePrev: 882, eCurr: 882, remark: '' }
};

// Authentic data for Prapassorn (ประภัสสร - 5 pages: 1 staff page + 4 student floors)
const PRAPASSORN_AUTHENTIC_DATA: Record<string, { wPrev?: number; wCurr?: number; occupants?: number; ePrev: number; eCurr: number; remark: string }> = {
  // Page 1: บุคลากร
  '4201': { wPrev: 152, wCurr: 155, ePrev: 246, eCurr: 268, remark: '' },
  '4202': { wPrev: 172, wCurr: 176, ePrev: 5997, eCurr: 6019, remark: '' },
  '4301': { wPrev: 253, wCurr: 253, ePrev: 7652, eCurr: 7652, remark: '' },
  '4302': { wPrev: 505, wCurr: 505, ePrev: 3580, eCurr: 3580, remark: '' },
  '4401': { wPrev: 251, wCurr: 251, ePrev: 1198, eCurr: 1198, remark: '' },
  '4402': { wPrev: 323, wCurr: 325, ePrev: 1481, eCurr: 1518, remark: '' },
  '4501': { wPrev: 245, wCurr: 250, ePrev: 1530, eCurr: 1555, remark: '' },
  '4502': { wPrev: 154, wCurr: 154, ePrev: 8735, eCurr: 8735, remark: '' },
  '4114': { wPrev: 705, wCurr: 713, ePrev: 4507, eCurr: 4613, remark: '' },

  // Page 2: นักศึกษา ชั้น 2 (flat water 100 บ./คน)
  '4203': { occupants: 1, ePrev: 3150, eCurr: 3177, remark: '' },
  '4204': { occupants: 2, ePrev: 2824, eCurr: 2831, remark: '' },
  '4205': { occupants: 2, ePrev: 3273, eCurr: 3302, remark: '' },
  '4206': { occupants: 2, ePrev: 1570, eCurr: 1603, remark: '' },
  '4207': { occupants: 1, ePrev: 2038, eCurr: 2056, remark: '' },
  '4208': { occupants: 1, ePrev: 3554, eCurr: 3578, remark: '' },
  '4209': { occupants: 1, ePrev: 13, eCurr: 13, remark: '' },
  '4210': { occupants: 1, ePrev: 271, eCurr: 275, remark: '' },
  '4211': { occupants: 0, ePrev: 2612, eCurr: 2628, remark: '2 เดือน' },
  '4212': { occupants: 1, ePrev: 6684, eCurr: 6693, remark: '' },
  '4213': { occupants: 2, ePrev: 2110, eCurr: 2133, remark: '' },
  '4214': { occupants: 2, ePrev: 2413, eCurr: 2455, remark: '' },
  '4215': { occupants: 2, ePrev: 7014, eCurr: 7019, remark: '' },
  '4216': { occupants: 1, ePrev: 1550, eCurr: 1561, remark: '' },
  '4217': { occupants: 2, ePrev: 2061, eCurr: 2092, remark: '' },

  // Page 3: นักศึกษา ชั้น 3
  '4303': { occupants: 1, ePrev: 3983, eCurr: 4010, remark: '' },
  '4304': { occupants: 2, ePrev: 7932, eCurr: 7985, remark: '' },
  '4305': { occupants: 2, ePrev: 7630, eCurr: 7648, remark: '' },
  '4306': { occupants: 2, ePrev: 1319, eCurr: 1350, remark: '' },
  '4307': { occupants: 1, ePrev: 7821, eCurr: 7857, remark: '' },
  '4308': { occupants: 2, ePrev: 6976, eCurr: 7016, remark: '' },
  '4309': { occupants: 1, ePrev: 2939, eCurr: 2939, remark: '' },
  '4310': { occupants: 1, ePrev: 4411, eCurr: 4420, remark: '' },
  '4311': { occupants: 2, ePrev: 7764, eCurr: 7775, remark: '' },
  '4312': { occupants: 2, ePrev: 3817, eCurr: 3855, remark: '' },
  '4313': { occupants: 2, ePrev: 4306, eCurr: 4341, remark: '' },
  '4314': { occupants: 1, ePrev: 9657, eCurr: 9677, remark: '' },
  '4315': { occupants: 1, ePrev: 6918, eCurr: 6918, remark: '' },
  '4316': { occupants: 1, ePrev: 8247, eCurr: 8280, remark: 'ฝึกงาน - ก.ย.' },
  '4317': { occupants: 1, ePrev: 9862, eCurr: 9873, remark: '' },

  // Page 4: นักศึกษา ชั้น 4
  '4403': { occupants: 1, ePrev: 4348, eCurr: 4365, remark: '' },
  '4404': { occupants: 1, ePrev: 8458, eCurr: 8503, remark: '' },
  '4405': { occupants: 1, ePrev: 6447, eCurr: 6448, remark: '' },
  '4406': { occupants: 2, ePrev: 5359, eCurr: 5366, remark: '' },
  '4407': { occupants: 2, ePrev: 7403, eCurr: 7447, remark: '' },
  '4408': { occupants: 2, ePrev: 1204, eCurr: 1219, remark: '' },
  '4409': { occupants: 1, ePrev: 626, eCurr: 630, remark: '' },
  '4410': { occupants: 1, ePrev: 2625, eCurr: 2658, remark: '' },
  '4411': { occupants: 2, ePrev: 8381, eCurr: 8444, remark: '' },
  '4412': { occupants: 2, ePrev: 8087, eCurr: 8141, remark: '' },
  '4413': { occupants: 1, ePrev: 5161, eCurr: 5177, remark: '' },
  '4414': { occupants: 0, ePrev: 7883, eCurr: 7883, remark: '' },
  '4415': { occupants: 1, ePrev: 7586, eCurr: 7586, remark: '' },
  '4416': { occupants: 0, ePrev: 5035, eCurr: 5035, remark: '' },
  '4417': { occupants: 1, ePrev: 8040, eCurr: 8046, remark: '' },

  // Page 5: นักศึกษา ชั้น 5
  '4503': { occupants: 1, ePrev: 2088, eCurr: 2091, remark: '' },
  '4504': { occupants: 1, ePrev: 5025, eCurr: 5034, remark: '' },
  '4505': { occupants: 0, ePrev: 7575, eCurr: 7575, remark: '' },
  '4506': { occupants: 2, ePrev: 8889, eCurr: 8922, remark: '' },
  '4507': { occupants: 1, ePrev: 5489, eCurr: 5492, remark: '' },
  '4508': { occupants: 1, ePrev: 6125, eCurr: 6132, remark: '' },
  '4509': { occupants: 0, ePrev: 3453, eCurr: 3453, remark: 'ฝึกงาน' },
  '4510': { occupants: 1, ePrev: 4131, eCurr: 4134, remark: '' },
  '4511': { occupants: 2, ePrev: 6763, eCurr: 6763, remark: '' },
  '4512': { occupants: 1, ePrev: 5616, eCurr: 5642, remark: '' },
  '4513': { occupants: 2, ePrev: 1280, eCurr: 1280, remark: '' },
  '4514': { occupants: 2, ePrev: 784, eCurr: 785, remark: '' },
  '4515': { occupants: 0, ePrev: 1455, eCurr: 1455, remark: '' },
  '4516': { occupants: 0, ePrev: 5807, eCurr: 5807, remark: '' },
  '4517': { occupants: 2, ePrev: 6641, eCurr: 6665, remark: '' }
};

// Authentic data for Thaphet (ท่าเพชร)
const THAPHET_AUTHENTIC_DATA: Record<string, { wPrev: number; wCurr: number; ePrev: number; eCurr: number; remark: string }> = {
  // Page 1: Floor 1-2 (101, 201-224)
  '101': { wPrev: 7998, wCurr: 8001, ePrev: 9285, eCurr: 9385, remark: 'TP 101' },
  '201': { wPrev: 2435, wCurr: 2445, ePrev: 6972, eCurr: 7137, remark: '' },
  '202': { wPrev: 2306, wCurr: 2308, ePrev: 8096, eCurr: 8296, remark: '' },
  '203': { wPrev: 2039, wCurr: 2043, ePrev: 4969, eCurr: 5154, remark: 'ครูสาธิต' },
  '204': { wPrev: 2381, wCurr: 2383, ePrev: 4906, eCurr: 4952, remark: '' },
  '205': { wPrev: 2405, wCurr: 2407, ePrev: 4585, eCurr: 4700, remark: '' },
  '206': { wPrev: 2347, wCurr: 2348, ePrev: 6152, eCurr: 6196, remark: '' },
  '207': { wPrev: 2281, wCurr: 2287, ePrev: 3371, eCurr: 3453, remark: '' },
  '208': { wPrev: 2404, wCurr: 2411, ePrev: 3706, eCurr: 3769, remark: '' },
  '209': { wPrev: 2373, wCurr: 2378, ePrev: 809, eCurr: 938, remark: '' },
  '210': { wPrev: 2277, wCurr: 2278, ePrev: 1770, eCurr: 1817, remark: '' },
  '211': { wPrev: 2218, wCurr: 2225, ePrev: 5731, eCurr: 5789, remark: '' },
  '212': { wPrev: 2197, wCurr: 2199, ePrev: 4885, eCurr: 5007, remark: '' },
  '213': { wPrev: 686, wCurr: 688, ePrev: 2681, eCurr: 2686, remark: 'summer' },
  '214': { wPrev: 2303, wCurr: 2305, ePrev: 3443, eCurr: 3500, remark: '' },
  '215': { wPrev: 2406, wCurr: 2414, ePrev: 4426, eCurr: 4574, remark: '' },
  '216': { wPrev: 2106, wCurr: 2107, ePrev: 5608, eCurr: 5851, remark: '' },
  '217': { wPrev: 2423, wCurr: 2424, ePrev: 5102, eCurr: 5136, remark: 'summer' },
  '218': { wPrev: 2226, wCurr: 2227, ePrev: 5764, eCurr: 5848, remark: '' },
  '219': { wPrev: 2109, wCurr: 2114, ePrev: 5843, eCurr: 5970, remark: '' },
  '220': { wPrev: 559, wCurr: 564, ePrev: 5732, eCurr: 5883, remark: '' },
  '221': { wPrev: 2577, wCurr: 2585, ePrev: 5408, eCurr: 5554, remark: '' },
  '222': { wPrev: 2219, wCurr: 2224, ePrev: 6091, eCurr: 6161, remark: 'summer' },
  '223': { wPrev: 2363, wCurr: 2364, ePrev: 6008, eCurr: 6263, remark: '' },
  '224': { wPrev: 2384, wCurr: 2388, ePrev: 3662, eCurr: 3721, remark: '' },

  // Page 2: Floor 3 (301-324)
  '301': { wPrev: 2208, wCurr: 2210, ePrev: 4519, eCurr: 4614, remark: '' },
  '302': { wPrev: 2494, wCurr: 2497, ePrev: 7585, eCurr: 7832, remark: '' },
  '303': { wPrev: 2435, wCurr: 2437, ePrev: 6604, eCurr: 6830, remark: '' },
  '304': { wPrev: 2537, wCurr: 2539, ePrev: 5717, eCurr: 5774, remark: '' },
  '305': { wPrev: 2283, wCurr: 2285, ePrev: 5731, eCurr: 5849, remark: '' },
  '306': { wPrev: 2410, wCurr: 2413, ePrev: 5376, eCurr: 5426, remark: 'summer' },
  '307': { wPrev: 2100, wCurr: 2101, ePrev: 4277, eCurr: 4278, remark: 'summer' },
  '308': { wPrev: 2535, wCurr: 2537, ePrev: 6382, eCurr: 6579, remark: '' },
  '309': { wPrev: 2390, wCurr: 2392, ePrev: 6535, eCurr: 6578, remark: '' },
  '310': { wPrev: 2376, wCurr: 2382, ePrev: 6315, eCurr: 6398, remark: '' },
  '311': { wPrev: 2349, wCurr: 2353, ePrev: 2880, eCurr: 2956, remark: 'summer' },
  '312': { wPrev: 2327, wCurr: 2330, ePrev: 6232, eCurr: 6325, remark: '' },
  '313': { wPrev: 2282, wCurr: 2283, ePrev: 7498, eCurr: 7709, remark: 'นักเรียนสาธิต' },
  '314': { wPrev: 2188, wCurr: 2193, ePrev: 3215, eCurr: 3317, remark: 'summer' },
  '315': { wPrev: 2165, wCurr: 2167, ePrev: 6810, eCurr: 7161, remark: 'นักเรียนสาธิต' },
  '316': { wPrev: 2404, wCurr: 2410, ePrev: 4299, eCurr: 4334, remark: '' },
  '317': { wPrev: 2462, wCurr: 2468, ePrev: 5209, eCurr: 5326, remark: 'summer' },
  '318': { wPrev: 2323, wCurr: 2324, ePrev: 5571, eCurr: 5572, remark: 'summer' },
  '319': { wPrev: 2366, wCurr: 2370, ePrev: 5394, eCurr: 5780, remark: 'นักเรียนสาธิต' },
  '320': { wPrev: 2692, wCurr: 2693, ePrev: 6981, eCurr: 7159, remark: 'นักเรียนสาธิต' },
  '321': { wPrev: 2208, wCurr: 2215, ePrev: 4043, eCurr: 4309, remark: 'นักเรียนสาธิต' },
  '322': { wPrev: 2517, wCurr: 2520, ePrev: 1480, eCurr: 1600, remark: 'ครูจีนสาธิต' },
  '323': { wPrev: 2017, wCurr: 2020, ePrev: 4736, eCurr: 4825, remark: '' },
  '324': { wPrev: 2541, wCurr: 2541, ePrev: 6108, eCurr: 6133, remark: 'นักเรียนสาธิต' },

  // Page 3: Floor 4 (401-424)
  '401': { wPrev: 2084, wCurr: 2088, ePrev: 526, eCurr: 593, remark: '' },
  '402': { wPrev: 2472, wCurr: 2474, ePrev: 2338, eCurr: 2559, remark: '' },
  '403': { wPrev: 1974, wCurr: 1977, ePrev: 3740, eCurr: 3808, remark: '' },
  '404': { wPrev: 1967, wCurr: 1978, ePrev: 4352, eCurr: 4654, remark: '' },
  '405': { wPrev: 2649, wCurr: 2653, ePrev: 4330, eCurr: 4700, remark: '' },
  '406': { wPrev: 2233, wCurr: 2247, ePrev: 3751, eCurr: 3905, remark: '' },
  '407': { wPrev: 2193, wCurr: 2195, ePrev: 3373, eCurr: 3401, remark: '' },
  '408': { wPrev: 2103, wCurr: 2112, ePrev: 3622, eCurr: 3698, remark: '' },
  '409': { wPrev: 2150, wCurr: 2155, ePrev: 3667, eCurr: 3859, remark: '' },
  '410': { wPrev: 2379, wCurr: 2383, ePrev: 2853, eCurr: 2951, remark: '' },
  '411': { wPrev: 2185, wCurr: 2191, ePrev: 3551, eCurr: 3641, remark: '' },
  '412': { wPrev: 2179, wCurr: 2182, ePrev: 3756, eCurr: 3808, remark: '' },
  '413': { wPrev: 2278, wCurr: 2282, ePrev: 5415, eCurr: 5775, remark: '' },
  '414': { wPrev: 2241, wCurr: 2245, ePrev: 3470, eCurr: 3650, remark: '' },
  '415': { wPrev: 1714, wCurr: 1718, ePrev: 2606, eCurr: 2728, remark: '' },
  '416': { wPrev: 2034, wCurr: 2037, ePrev: 2986, eCurr: 3043, remark: '' },
  '417': { wPrev: 2227, wCurr: 2234, ePrev: 9797, eCurr: 9835, remark: '' },
  '418': { wPrev: 2139, wCurr: 2144, ePrev: 3423, eCurr: 3515, remark: '' },
  '419': { wPrev: 1796, wCurr: 1802, ePrev: 4599, eCurr: 4675, remark: '' },
  '420': { wPrev: 2260, wCurr: 2266, ePrev: 3253, eCurr: 3307, remark: '' },
  '421': { wPrev: 2472, wCurr: 2476, ePrev: 4512, eCurr: 4679, remark: '' },
  '422': { wPrev: 1868, wCurr: 1873, ePrev: 3969, eCurr: 4083, remark: '' },
  '423': { wPrev: 2255, wCurr: 2259, ePrev: 3022, eCurr: 3174, remark: '' },
  '424': { wPrev: 2480, wCurr: 2485, ePrev: 3559, eCurr: 3631, remark: '' },

  // Page 4: Floor 5 (501-524)
  '501': { wPrev: 492, wCurr: 495, ePrev: 2569, eCurr: 2625, remark: '' },
  '502': { wPrev: 2007, wCurr: 2010, ePrev: 3035, eCurr: 3119, remark: 'ครูจีนวนช' },
  '503': { wPrev: 2019, wCurr: 2019, ePrev: 700, eCurr: 708, remark: '' },
  '504': { wPrev: 1891, wCurr: 1897, ePrev: 3409, eCurr: 3459, remark: '' },
  '505': { wPrev: 2289, wCurr: 2291, ePrev: 5531, eCurr: 5593, remark: '' },
  '506': { wPrev: 1812, wCurr: 1814, ePrev: 3833, eCurr: 3918, remark: '' },
  '507': { wPrev: 2044, wCurr: 2045, ePrev: 4757, eCurr: 4808, remark: '' },
  '508': { wPrev: 2076, wCurr: 2077, ePrev: 4090, eCurr: 4142, remark: '' },
  '509': { wPrev: 1827, wCurr: 1827, ePrev: 4430, eCurr: 4534, remark: '' },
  '510': { wPrev: 1744, wCurr: 1745, ePrev: 5165, eCurr: 5213, remark: '' },
  '511': { wPrev: 1788, wCurr: 1790, ePrev: 2547, eCurr: 2633, remark: '' },
  '512': { wPrev: 1791, wCurr: 1795, ePrev: 3736, eCurr: 3838, remark: 'ครูจีนวนช' },
  '513': { wPrev: 2088, wCurr: 2090, ePrev: 2445, eCurr: 2519, remark: '' },
  '514': { wPrev: 1800, wCurr: 1804, ePrev: 3551, eCurr: 4059, remark: '' },
  '515': { wPrev: 2225, wCurr: 2230, ePrev: 3295, eCurr: 3431, remark: '' },
  '516': { wPrev: 1925, wCurr: 1926, ePrev: 2889, eCurr: 3190, remark: '' },
  '517': { wPrev: 2163, wCurr: 2168, ePrev: 4703, eCurr: 4825, remark: '' },
  '518': { wPrev: 1761, wCurr: 1762, ePrev: 2442, eCurr: 2442, remark: '' },
  '519': { wPrev: 2192, wCurr: 2198, ePrev: 3958, eCurr: 4077, remark: '' },
  '520': { wPrev: 1578, wCurr: 1579, ePrev: 1791, eCurr: 2093, remark: '' },
  '521': { wPrev: 1783, wCurr: 1783, ePrev: 1138, eCurr: 1138, remark: '' },
  '522': { wPrev: 2025, wCurr: 2025, ePrev: 2056, eCurr: 2056, remark: '' },
  '523': { wPrev: 2110, wCurr: 2110, ePrev: 2279, eCurr: 2279, remark: '' },
  '524': { wPrev: 1863, wCurr: 1865, ePrev: 1909, eCurr: 2193, remark: 'MISS SHEN LUNING' }
};

/**
 * Generates seed data across all 8 buildings (382 rooms)
 * with authentic characteristics matching the dorm prompt and uploaded PDF attachments
 */
export function generateSeedData(
  masterRooms: RoomInfo[],
  monthKey: string,
  settings: DormSettings
): Record<string, MeterRecord> {
  const seededMonth: Record<string, MeterRecord> = {};

  masterRooms.forEach(room => {
    let baseWater = Math.floor(Math.random() * 200) + 1200;
    let waterUsed = Math.floor(Math.random() * 12) + 2;
    let occupants = Math.floor(Math.random() * 2) + 1;

    let baseElec = Math.floor(Math.random() * 1000) + 4000;
    let elecUsed = Math.floor(Math.random() * 150) + 45;
    let remark = '';

    // Exact matches from uploaded PDF files
    if (room.buildingId === 'thaphet' && THAPHET_AUTHENTIC_DATA[room.roomNo]) {
      const data = THAPHET_AUTHENTIC_DATA[room.roomNo];
      baseWater = data.wPrev;
      waterUsed = data.wCurr - data.wPrev;
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
    } else if (room.buildingId === 'chaiya' && CHAIYA_AUTHENTIC_DATA[room.roomNo]) {
      const data = CHAIYA_AUTHENTIC_DATA[room.roomNo];
      baseWater = data.wPrev;
      waterUsed = data.wCurr - data.wPrev;
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
    } else if (room.buildingId === 'wiphawadi' && WIPHAWADI_AUTHENTIC_DATA[room.roomNo]) {
      const data = WIPHAWADI_AUTHENTIC_DATA[room.roomNo];
      baseWater = data.wPrev;
      waterUsed = data.wCurr - data.wPrev;
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
    } else if (room.buildingId === 'thachana' && THACHANA_AUTHENTIC_DATA[room.roomNo]) {
      const data = THACHANA_AUTHENTIC_DATA[room.roomNo];
      baseWater = data.wPrev;
      waterUsed = data.wCurr - data.wPrev;
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
    } else if (room.buildingId === 'ratchaprapha' && RATCHAPRAPHA_AUTHENTIC_DATA[room.roomNo]) {
      const data = RATCHAPRAPHA_AUTHENTIC_DATA[room.roomNo];
      baseWater = data.wPrev;
      waterUsed = data.wCurr - data.wPrev;
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
    } else if (room.buildingId === 'thathong' && THATHONG_AUTHENTIC_DATA[room.roomNo]) {
      const data = THATHONG_AUTHENTIC_DATA[room.roomNo];
      baseWater = data.wPrev;
      waterUsed = data.wCurr - data.wPrev;
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
    } else if (room.buildingId === 'prapassorn' && PRAPASSORN_AUTHENTIC_DATA[room.roomNo]) {
      const data = PRAPASSORN_AUTHENTIC_DATA[room.roomNo];
      baseElec = data.ePrev;
      elecUsed = data.eCurr - data.ePrev;
      remark = data.remark;
      if (data.wPrev !== undefined && data.wCurr !== undefined) {
        baseWater = data.wPrev;
        waterUsed = data.wCurr - data.wPrev;
      }
      if (data.occupants !== undefined) {
        occupants = data.occupants;
      }
    } else if (room.waterType === 'flat_per_person') {
      remark = 'เหมาค่าน้ำ';
    }

    const isFlat = room.waterType === 'flat_per_person';
    const wCost = isFlat ? occupants * settings.defaultFlatWaterRate : waterUsed * settings.defaultWaterRate;
    const eCost = elecUsed * settings.defaultElecRate;

    seededMonth[room.id] = {
      roomId: room.id,
      buildingId: room.buildingId,
      buildingName: room.buildingName,
      roomNo: room.roomNo,
      floor: room.floor,
      waterType: room.waterType,

      waterPrev: baseWater,
      waterCurr: isFlat ? baseWater : baseWater + waterUsed,
      occupants,
      waterUnits: isFlat ? 0 : waterUsed,
      waterCost: wCost,

      elecPrev: baseElec,
      elecCurr: baseElec + elecUsed,
      elecUnits: elecUsed,
      elecCost: eCost,

      remark,
      totalAmount: wCost + eCost,
      recordedAt: new Date().toISOString()
    };
  });

  return seededMonth;
}
