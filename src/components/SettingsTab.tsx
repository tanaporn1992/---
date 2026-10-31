import React, { useState } from 'react';
import { DormSettings } from '../types';
import { Sliders, Database, Sparkles, Download, Upload, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsTabProps {
  settings: DormSettings;
  onUpdateSettings: (newSettings: DormSettings) => void;
  selectedMonth: string;
  onSeedData: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onClearMonth: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  selectedMonth,
  onSeedData,
  onExportJSON,
  onImportJSON,
  onClearMonth
}) => {
  const [elecRate, setElecRate] = useState<number>(settings.defaultElecRate);
  const [waterRate, setWaterRate] = useState<number>(settings.defaultWaterRate);
  const [flatRate, setFlatRate] = useState<number>(settings.defaultFlatWaterRate);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      defaultElecRate: elecRate,
      defaultWaterRate: waterRate,
      defaultFlatWaterRate: flatRate
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Rate Settings Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ตั้งค่าอัตราค่าน้ำ-ค่าไฟฟ้ามาตรฐาน
            </h2>
            <p className="text-xs text-slate-500">
              กำหนดราคาต่อหน่วยสำหรับการคำนวณเงินในระบบ
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveRates} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ค่าไฟฟ้า (บาท/หน่วย):
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={elecRate}
                onChange={(e) => setElecRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ค่าน้ำประปาปกติ (บาท/หน่วย):
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={waterRate}
                onChange={(e) => setWaterRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ค่าน้ำเหมาจ่าย (บาท/คน):
              </label>
              <input
                type="number"
                step="10"
                min="0"
                value={flatRate}
                onChange={(e) => setFlatRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                บันทึกการตั้งค่าแล้ว
              </span>
            ) : <span></span>}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>

      {/* Database & Backup Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              จัดการฐานข้อมูล & สำรองข้อมูล
            </h2>
            <p className="text-xs text-slate-500">
              นำเข้า ส่งออก หรือสร้างข้อมูลตัวอย่างสำหรับการทดสอบระบบ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* Seed Sample Data */}
          <button
            onClick={onSeedData}
            className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-blue-50/50 text-left transition-all cursor-pointer flex items-start space-x-3"
          >
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">
                สร้างข้อมูลจำลองครบทุกอาคาร
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                สุ่มเติมเลขมิเตอร์ทั้ง 382 ห้อง พร้อมเคสนักฟุตบอลและเหมาจ่าย
              </p>
            </div>
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportJSON}
            className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer flex items-start space-x-3"
          >
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">
                สำรองข้อมูลทั้งหมด (JSON)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                ดาวน์โหลดไฟล์สำรองข้อมูลมิเตอร์เก็บไว้ในเครื่อง
              </p>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-indigo-50/50 text-left transition-all cursor-pointer flex items-start space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">
                นำเข้าข้อมูลสำรอง (Restore JSON)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกไฟล์ JSON เพื่อกู้คืนข้อมูล
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>

          {/* Clear Month */}
          <button
            onClick={onClearMonth}
            className="p-4 border border-rose-200 rounded-xl bg-rose-50/40 hover:bg-rose-50 text-left transition-all cursor-pointer flex items-start space-x-3"
          >
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-rose-800 text-sm block">
                ล้างข้อมูลเดือน {selectedMonth}
              </span>
              <p className="text-xs text-rose-600/80 mt-0.5">
                รีเซ็ตข้อมูลการจดมิเตอร์ของเดือนนี้เป็นค่าว่าง
              </p>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
