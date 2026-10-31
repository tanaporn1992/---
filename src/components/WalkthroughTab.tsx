import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BUILDINGS_CONFIG } from '../data/buildings';
import { RoomInfo, MeterRecord, DormSettings } from '../types';
import { formatCurrency, formatThaiMonthYear, getShortThaiMonthYear, getPrevShortThaiMonthYear, compressImageFile } from '../utils/thaiDate';
import { Droplets, Zap, Camera, Trash2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface WalkthroughTabProps {
  masterRooms: RoomInfo[];
  records: Record<string, MeterRecord>;
  previousMonthRecords: Record<string, MeterRecord>;
  selectedMonth: string;
  settings: DormSettings;
  onSaveRecord: (record: MeterRecord) => void;
}

export const WalkthroughTab: React.FC<WalkthroughTabProps> = ({
  masterRooms,
  records,
  previousMonthRecords,
  selectedMonth,
  settings,
  onSaveRecord
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<'PENDING' | 'ALL'>('PENDING');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Active form state
  const [waterPrev, setWaterPrev] = useState<number>(0);
  const [waterCurr, setWaterCurr] = useState<number>(0);
  const [occupants, setOccupants] = useState<number>(1);
  const [waterPhoto, setWaterPhoto] = useState<string | null>(null);

  const [elecPrev, setElecPrev] = useState<number>(0);
  const [elecCurr, setElecCurr] = useState<number>(0);
  const [elecPhoto, setElecPhoto] = useState<string | null>(null);

  const [remark, setRemark] = useState<string>('');

  const waterInputRef = useRef<HTMLInputElement>(null);

  // List of rooms based on filters
  const targetRooms = useMemo(() => {
    let list = [...masterRooms];
    if (selectedBuilding !== 'ALL') {
      list = list.filter(r => r.buildingId === selectedBuilding);
    }
    if (filterMode === 'PENDING') {
      list = list.filter(r => !records[r.id]);
    }
    return list;
  }, [masterRooms, selectedBuilding, filterMode, records]);

  const currentRoom: RoomInfo | null = targetRooms[currentIndex] || null;

  // Whenever the active room changes, load existing or previous data
  useEffect(() => {
    if (currentRoom) {
      const existing = records[currentRoom.id];
      const prevRec = previousMonthRecords[currentRoom.id];

      const defaultWPrev = existing ? existing.waterPrev : (prevRec ? prevRec.waterCurr : 0);
      const defaultWCurr = existing ? existing.waterCurr : defaultWPrev;
      const defaultOcc = existing ? existing.occupants : 1;
      const defaultWPhoto = existing ? existing.waterPhoto || null : null;

      const defaultEPrev = existing ? existing.elecPrev : (prevRec ? prevRec.elecCurr : 0);
      const defaultECurr = existing ? existing.elecCurr : defaultEPrev;
      const defaultEPhoto = existing ? existing.elecPhoto || null : null;

      const defaultRemark = existing ? existing.remark : (currentRoom.waterType === 'flat_per_person' ? 'เหมาค่าน้ำ' : '');

      setWaterPrev(defaultWPrev);
      setWaterCurr(defaultWCurr);
      setOccupants(defaultOcc);
      setWaterPhoto(defaultWPhoto);

      setElecPrev(defaultEPrev);
      setElecCurr(defaultECurr);
      setElecPhoto(defaultEPhoto);

      setRemark(defaultRemark);

      // Auto-focus current reading input for speed
      setTimeout(() => {
        if (waterInputRef.current) {
          waterInputRef.current.focus();
        }
      }, 100);
    }
  }, [currentRoom, records, previousMonthRecords]);

  // Calculations
  const isFlatWater = currentRoom?.waterType === 'flat_per_person';
  const waterUnits = isFlatWater ? 0 : Math.max(0, waterCurr - waterPrev);
  const waterCost = isFlatWater
    ? occupants * settings.defaultFlatWaterRate
    : waterUnits * settings.defaultWaterRate;

  const elecUnits = Math.max(0, elecCurr - elecPrev);
  const elecCost = elecUnits * settings.defaultElecRate;
  const totalAmount = waterCost + elecCost;

  const handleWaterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, (base64) => setWaterPhoto(base64));
    }
  };

  const handleElecPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImageFile(file, (base64) => setElecPhoto(base64));
    }
  };

  const handleSaveAndNext = () => {
    if (!currentRoom) return;

    const record: MeterRecord = {
      roomId: currentRoom.id,
      buildingId: currentRoom.buildingId,
      buildingName: currentRoom.buildingName,
      roomNo: currentRoom.roomNo,
      floor: currentRoom.floor,
      waterType: currentRoom.waterType,

      waterPrev,
      waterCurr: isFlatWater ? waterPrev : waterCurr,
      occupants,
      waterUnits,
      waterCost,
      waterPhoto,

      elecPrev,
      elecCurr,
      elecUnits,
      elecCost,
      elecPhoto,

      remark,
      totalAmount,
      recordedAt: new Date().toISOString()
    };

    onSaveRecord(record);

    // If in pending mode, the room will be removed from targetRooms, keeping index 0
    if (filterMode === 'PENDING') {
      setCurrentIndex(0);
    } else {
      if (currentIndex < targetRooms.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleSkip = () => {
    if (currentIndex < targetRooms.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevMonthLabel = getPrevShortThaiMonthYear(selectedMonth);
  const currMonthLabel = getShortThaiMonthYear(selectedMonth);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>โหมดจดมิเตอร์ต่อเนื่อง (Walkthrough Mode)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ออกแบบมาสำหรับการเดินจดตามชั้น บันทึกรวดเร็วและเลื่อนไปห้องถัดไปอัตโนมัติ
            </p>
          </div>
          {currentRoom && (
            <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full border border-blue-200 self-start sm:self-auto">
              ห้องที่ {currentIndex + 1} จาก {targetRooms.length} ห้อง
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              อาคารที่กำลังเดินจด:
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">ทุกอาคาร</option>
              {BUILDINGS_CONFIG.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              กรองสถานะ:
            </label>
            <select
              value={filterMode}
              onChange={(e) => {
                setFilterMode(e.target.value as 'PENDING' | 'ALL');
                setCurrentIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="PENDING">เฉพาะห้องที่ยังไม่ได้จด</option>
              <option value="ALL">ห้องทั้งหมดในอาคาร</option>
            </select>
          </div>
        </div>

        {/* Active Walkthrough Room Card */}
        {currentRoom ? (
          <div className="bg-slate-50 border-2 border-blue-500/80 rounded-2xl p-5 space-y-5 shadow-sm">
            
            {/* Room Title Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  {currentRoom.buildingName} • ชั้น {currentRoom.floor}
                </span>
                <h3 className="text-3xl font-black text-slate-900">
                  ห้อง {currentRoom.roomNo}
                </h3>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-xl ${
                    isFlatWater
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}
                >
                  {isFlatWater
                    ? `เหมาค่าน้ำ ${settings.defaultFlatWaterRate} บ./คน`
                    : `ค่าน้ำตามหน่วย (${settings.defaultWaterRate} บ./หน่วย)`}
                </span>
              </div>
            </div>

            {/* Meter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-200">
              
              {/* WATER METER SECTION */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
                  <Droplets className="w-4 h-4" />
                  <span>มิเตอร์น้ำประปา</span>
                </div>

                {!isFlatWater ? (
                  <>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        เลขมิเตอร์เดิม ({prevMonthLabel}):
                      </label>
                      <input
                        type="number"
                        value={waterPrev}
                        onChange={(e) => setWaterPrev(Number(e.target.value))}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        เลขมิเตอร์ปัจจุบัน ({currMonthLabel}):
                      </label>
                      <input
                        type="number"
                        ref={waterInputRef}
                        value={waterCurr}
                        onChange={(e) => setWaterCurr(Number(e.target.value))}
                        className="w-full bg-white border-2 border-blue-400 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="text-xs flex justify-between pt-1 border-t border-slate-100 text-slate-600 font-medium">
                      <span>ใช้น้ำ: <b className="text-blue-600">{waterUnits}</b> หน่วย</span>
                      <span>เป็นเงิน: <b className="text-blue-600">฿{formatCurrency(waterCost)}</b></span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        จำนวนผู้พักอาศัย (คน):
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={occupants}
                        onChange={(e) => setOccupants(Number(e.target.value))}
                        className="w-full bg-white border-2 border-amber-400 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="text-xs flex justify-between pt-1 border-t border-slate-100 text-slate-600 font-medium">
                      <span>อัตรา: {settings.defaultFlatWaterRate} บาท/คน</span>
                      <span>เป็นเงิน: <b className="text-amber-600">฿{formatCurrency(waterCost)}</b></span>
                    </div>
                  </>
                )}

                {/* Photo Water */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 flex items-center space-x-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{waterPhoto ? 'เปลี่ยนภาพ' : 'ถ่ายภาพมิเตอร์น้ำ'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleWaterPhotoChange}
                      />
                    </label>
                    {waterPhoto && (
                      <button
                        onClick={() => setWaterPhoto(null)}
                        className="text-xs text-rose-500 hover:text-rose-700 p-1"
                        title="ลบภาพ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {waterPhoto && (
                    <div className="mt-2">
                      <img
                        src={waterPhoto}
                        alt="Water meter preview"
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* ELECTRICITY METER SECTION */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>มิเตอร์ไฟฟ้า</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    เลขมิเตอร์เดิม ({prevMonthLabel}):
                  </label>
                  <input
                    type="number"
                    value={elecPrev}
                    onChange={(e) => setElecPrev(Number(e.target.value))}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    เลขมิเตอร์ปัจจุบัน ({currMonthLabel}):
                  </label>
                  <input
                    type="number"
                    value={elecCurr}
                    onChange={(e) => setElecCurr(Number(e.target.value))}
                    className="w-full bg-white border-2 border-amber-400 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs flex justify-between pt-1 border-t border-slate-100 text-slate-600 font-medium">
                  <span>ใช้ไฟ: <b className="text-amber-600">{elecUnits}</b> หน่วย</span>
                  <span>เป็นเงิน: <b className="text-amber-600">฿{formatCurrency(elecCost)}</b></span>
                </div>

                {/* Photo Elec */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 flex items-center space-x-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{elecPhoto ? 'เปลี่ยนภาพ' : 'ถ่ายภาพมิเตอร์ไฟ'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleElecPhotoChange}
                      />
                    </label>
                    {elecPhoto && (
                      <button
                        onClick={() => setElecPhoto(null)}
                        className="text-xs text-rose-500 hover:text-rose-700 p-1"
                        title="ลบภาพ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {elecPhoto && (
                    <div className="mt-2">
                      <img
                        src={elecPhoto}
                        alt="Electric meter preview"
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Remark Field */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                หมายเหตุ (เช่น นักฟุตบอล, Summer, ห้องว่าง, ชำรุด):
              </label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="ระบุหมายเหตุถ้ามี..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Total Row Summary */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center text-sm font-bold">
              <span className="text-slate-300 text-xs">รวมค่าน้ำ + ค่าไฟฟ้าห้องนี้:</span>
              <span className="text-xl font-black text-amber-400">
                ฿{formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ห้องก่อนหน้า</span>
              </button>

              <button
                onClick={handleSkip}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ข้ามห้องนี้
              </button>

              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <span>บันทึก & ถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">บันทึกมิเตอร์ครบเรียบร้อยแล้ว!</h3>
            <p className="text-xs text-slate-500 mt-1">
              ไม่มีห้องคงค้างในอาคารหรือเงื่อนไขที่เลือก ท่านสามารถตรวจเช็คได้ในเมนู "ตารางจดมิเตอร์รายอาคาร"
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
