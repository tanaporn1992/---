import React, { useState, useEffect } from 'react';
import { RoomInfo, MeterRecord, DormSettings } from '../types';
import { formatCurrency, getShortThaiMonthYear, getPrevShortThaiMonthYear, compressImageFile } from '../utils/thaiDate';
import { X, Droplets, Zap, Camera, Trash2, Save } from 'lucide-react';

interface RecordModalProps {
  room: RoomInfo | null;
  existingRecord: MeterRecord | null;
  previousRecord: MeterRecord | null;
  selectedMonth: string;
  settings: DormSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MeterRecord) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  room,
  existingRecord,
  previousRecord,
  selectedMonth,
  settings,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !room) return null;

  const isFlatWater = room.waterType === 'flat_per_person';

  const [waterPrev, setWaterPrev] = useState<number>(0);
  const [waterCurr, setWaterCurr] = useState<number>(0);
  const [occupants, setOccupants] = useState<number>(1);
  const [waterPhoto, setWaterPhoto] = useState<string | null>(null);

  const [elecPrev, setElecPrev] = useState<number>(0);
  const [elecCurr, setElecCurr] = useState<number>(0);
  const [elecPhoto, setElecPhoto] = useState<string | null>(null);

  const [remark, setRemark] = useState<string>('');

  useEffect(() => {
    const defaultWPrev = existingRecord ? existingRecord.waterPrev : (previousRecord ? previousRecord.waterCurr : 0);
    const defaultWCurr = existingRecord ? existingRecord.waterCurr : defaultWPrev;
    const defaultOcc = existingRecord ? existingRecord.occupants : 1;

    const defaultEPrev = existingRecord ? existingRecord.elecPrev : (previousRecord ? previousRecord.elecCurr : 0);
    const defaultECurr = existingRecord ? existingRecord.elecCurr : defaultEPrev;

    setWaterPrev(defaultWPrev);
    setWaterCurr(defaultWCurr);
    setOccupants(defaultOcc);
    setWaterPhoto(existingRecord?.waterPhoto || null);

    setElecPrev(defaultEPrev);
    setElecCurr(defaultECurr);
    setElecPhoto(existingRecord?.elecPhoto || null);

    setRemark(existingRecord ? existingRecord.remark : (isFlatWater ? 'เหมาค่าน้ำ' : ''));
  }, [existingRecord, previousRecord, room, isFlatWater]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: MeterRecord = {
      roomId: room.id,
      buildingId: room.buildingId,
      buildingName: room.buildingName,
      roomNo: room.roomNo,
      floor: room.floor,
      waterType: room.waterType,

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
    onSave(record);
    onClose();
  };

  const prevMonthLabel = getPrevShortThaiMonthYear(selectedMonth);
  const currMonthLabel = getShortThaiMonthYear(selectedMonth);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
              {room.buildingName} • ชั้น {room.floor}
            </span>
            <h3 className="text-2xl font-black">ห้อง {room.roomNo}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between font-medium">
              <span>นโยบายค่าน้ำห้องนี้:</span>
              <span className="font-bold">
                {isFlatWater
                  ? `เหมาจ่าย ${settings.defaultFlatWaterRate} บาท/คน`
                  : `คิดตามหน่วย ${settings.defaultWaterRate} บาท/หน่วย`}
              </span>
            </div>

            {/* WATER METER */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
                <Droplets className="w-4 h-4" />
                <span>บันทึกค่าน้ำประปา</span>
              </div>

              {!isFlatWater ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        เดิม ({prevMonthLabel}):
                      </label>
                      <input
                        type="number"
                        value={waterPrev}
                        onChange={(e) => setWaterPrev(Number(e.target.value))}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        ใหม่ ({currMonthLabel}):
                      </label>
                      <input
                        type="number"
                        value={waterCurr}
                        onChange={(e) => setWaterCurr(Number(e.target.value))}
                        className="w-full bg-white border-2 border-blue-400 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-xs flex justify-between text-slate-600 pt-1 font-medium">
                    <span>ใช้น้ำ: <b>{waterUnits}</b> หน่วย</span>
                    <span>ค่าน้ำ: <b className="text-blue-600">฿{formatCurrency(waterCost)}</b></span>
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
                      className="w-full bg-white border-2 border-amber-400 rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-xs flex justify-between text-slate-600 pt-1 font-medium">
                    <span>อัตราเหมา: {settings.defaultFlatWaterRate} บาท/คน</span>
                    <span>ค่าน้ำรวม: <b className="text-amber-600">฿{formatCurrency(waterCost)}</b></span>
                  </div>
                </>
              )}

              {/* Water Photo */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{waterPhoto ? 'เปลี่ยนภาพ' : 'ถ่ายภาพ / แนบรูปมิเตอร์น้ำ'}</span>
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
                      type="button"
                      onClick={() => setWaterPhoto(null)}
                      className="text-xs text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {waterPhoto && (
                  <div className="mt-2">
                    <img
                      src={waterPhoto}
                      alt="Water preview"
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ELECTRICITY METER */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>บันทึกมิเตอร์ไฟฟ้า</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    เดิม ({prevMonthLabel}):
                  </label>
                  <input
                    type="number"
                    value={elecPrev}
                    onChange={(e) => setElecPrev(Number(e.target.value))}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    ใหม่ ({currMonthLabel}):
                  </label>
                  <input
                    type="number"
                    value={elecCurr}
                    onChange={(e) => setElecCurr(Number(e.target.value))}
                    className="w-full bg-white border-2 border-amber-400 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-xs flex justify-between text-slate-600 pt-1 font-medium">
                <span>ใช้ไฟ: <b>{elecUnits}</b> หน่วย</span>
                <span>ค่าไฟ: <b className="text-amber-600">฿{formatCurrency(elecCost)}</b></span>
              </div>

              {/* Electricity Photo */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{elecPhoto ? 'เปลี่ยนภาพ' : 'ถ่ายภาพ / แนบรูปมิเตอร์ไฟ'}</span>
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
                      type="button"
                      onClick={() => setElecPhoto(null)}
                      className="text-xs text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {elecPhoto && (
                  <div className="mt-2">
                    <img
                      src={elecPhoto}
                      alt="Elec preview"
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Remark Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">หมายเหตุ:</label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="เช่น นักฟุตบอล, Summer, ห้องว่าง, ชำรุด..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Total Row */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex justify-between items-center font-bold">
              <span className="text-xs text-slate-300">ยอดรวมทั้งสิ้นห้องนี้:</span>
              <span className="text-xl font-black text-amber-400">
                ฿{formatCurrency(totalAmount)}
              </span>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
