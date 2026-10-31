import React, { useRef, useState } from 'react';
import { BUILDINGS_CONFIG } from '../data/buildings';
import { RoomInfo, MeterRecord } from '../types';
import { formatCurrency, formatThaiMonthYear } from '../utils/thaiDate';
import { downloadElementAsImage, downloadElementAsPDF, copyElementImageToClipboard } from '../services/exportMedia';
import { Coins, Droplets, Zap, CheckCircle2, Printer, Building2, Image as ImageIcon, Download, Copy, TrendingUp } from 'lucide-react';
import { RevenueTrendChart } from './RevenueTrendChart';

interface MonthlyReportTabProps {
  selectedMonth: string;
  masterRooms: RoomInfo[];
  records: Record<string, MeterRecord>;
  allDbRecords?: Record<string, Record<string, MeterRecord>>;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const MonthlyReportTab: React.FC<MonthlyReportTabProps> = ({
  selectedMonth,
  masterRooms,
  records,
  allDbRecords = {},
  onShowToast
}) => {
  const monthRecs = Object.values(records);
  const totalRevenue = monthRecs.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const waterRevenue = monthRecs.reduce((sum, r) => sum + (r.waterCost || 0), 0);
  const elecRevenue = monthRecs.reduce((sum, r) => sum + (r.elecCost || 0), 0);
  const waterUnits = monthRecs.reduce((sum, r) => sum + (r.waterUnits || 0), 0);
  const elecUnits = monthRecs.reduce((sum, r) => sum + (r.elecUnits || 0), 0);

  const totalRooms = masterRooms.length;
  const recordedCount = monthRecs.length;
  const completionPercentage = totalRooms > 0 ? ((recordedCount / totalRooms) * 100).toFixed(1) : '0';
  const avgPerRoom = recordedCount > 0 ? totalRevenue / recordedCount : 0;

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  // Breakdown by building
  const buildingStats = BUILDINGS_CONFIG.map(b => {
    const bRooms = masterRooms.filter(r => r.buildingId === b.id);
    const bRecorded = bRooms.filter(r => !!records[r.id]);

    const bWaterUnits = bRecorded.reduce((sum, r) => sum + (records[r.id].waterUnits || 0), 0);
    const bWaterCost = bRecorded.reduce((sum, r) => sum + (records[r.id].waterCost || 0), 0);
    const bElecUnits = bRecorded.reduce((sum, r) => sum + (records[r.id].elecUnits || 0), 0);
    const bElecCost = bRecorded.reduce((sum, r) => sum + (records[r.id].elecCost || 0), 0);
    const bTotal = bRecorded.reduce((sum, r) => sum + (records[r.id].totalAmount || 0), 0);

    return {
      id: b.id,
      name: b.name,
      total: bRooms.length,
      recorded: bRecorded.length,
      waterUnits: bWaterUnits,
      waterCost: bWaterCost,
      elecUnits: bElecUnits,
      elecCost: bElecCost,
      totalCost: bTotal
    };
  });

  const handleDownloadImage = async () => {
    if (!reportContainerRef.current) return;
    setIsExportingImage(true);
    try {
      await downloadElementAsImage(reportContainerRef.current, `รายงานสรุปสาธารณูปโภค_${selectedMonth}`);
      if (onShowToast) onShowToast('ดาวน์โหลดรายงานสรุปเป็นรูปภาพ (.PNG) สำเร็จแล้ว!');
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'สร้างรูปภาพไม่สำเร็จ', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(reportContainerRef.current, `รายงานสรุปสาธารณูปโภค_${selectedMonth}`);
      if (onShowToast) onShowToast('ดาวน์โหลดรายงานสรุปในรูปแบบ PDF สำเร็จแล้ว!');
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'สร้าง PDF ไม่สำเร็จ', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Print/Export Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>รายงานสรุปสาธารณูปโภคประจำเดือน {formatThaiMonthYear(selectedMonth)}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สรุปปริมาณการใช้ไฟฟ้าและน้ำประปา พร้อมแจกแจงรายได้รวมแยกตามอาคาร
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Image (.PNG) */}
          <button
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isExportingImage ? 'สร้างรูป...' : 'บันทึกเป็นรูปภาพ (.PNG)'}</span>
          </button>

          {/* Download PDF (.PDF) */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'สร้าง PDF...' : 'ดาวน์โหลด PDF (.PDF)'}</span>
          </button>

          {/* Browser Print */}
          <button
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน (A4)</span>
          </button>
        </div>
      </div>

      {/* Target Render Area for Capturing */}
      <div ref={reportContainerRef} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Revenue */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-medium">รายได้รวมค่าน้ำ-ไฟ</span>
              <div className="p-2 bg-white/10 rounded-xl text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">฿{formatCurrency(totalRevenue)}</p>
            <div className="mt-2 text-[11px] text-slate-400">
              เฉลี่ย ฿{formatCurrency(avgPerRoom)} / ห้องที่บันทึก
            </div>
          </div>

          {/* Water Revenue */}
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-700 font-bold">ค่าน้ำประปารวม</span>
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                <Droplets className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-900">฿{formatCurrency(waterRevenue)}</p>
            <div className="mt-2 text-[11px] text-blue-700 font-medium flex justify-between">
              <span>ปริมาณการใช้:</span>
              <b>{formatCurrency(waterUnits)} หน่วย</b>
            </div>
          </div>

          {/* Electricity Revenue */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-700 font-bold">ค่าไฟฟ้ารวม</span>
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-900">฿{formatCurrency(elecRevenue)}</p>
            <div className="mt-2 text-[11px] text-amber-700 font-medium flex justify-between">
              <span>ปริมาณการใช้:</span>
              <b>{formatCurrency(elecUnits)} หน่วย</b>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-700 font-bold">ความคืบหน้าการจด</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-900">{completionPercentage}%</p>
            <div className="mt-2 text-[11px] text-emerald-700 font-medium">
              จดแล้ว {recordedCount} จาก {totalRooms} ห้อง
            </div>
          </div>

        </div>

        {/* 6-MONTH REVENUE TREND LINE CHART (RECHARTS) */}
        <RevenueTrendChart
          selectedMonth={selectedMonth}
          allDbRecords={allDbRecords}
          currentMonthRecords={records}
        />

        {/* Building Performance Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>รายละเอียดรายอาคารประจำเดือน {formatThaiMonthYear(selectedMonth)}</span>
          </h3>

          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">ชื่ออาคาร</th>
                  <th className="p-3 text-center">จดบันทึก/ทั้งหมด</th>
                  <th className="p-3 text-right">หน่วยน้ำรวม</th>
                  <th className="p-3 text-right">ค่าน้ำรวม (บาท)</th>
                  <th className="p-3 text-right">หน่วยไฟรวม</th>
                  <th className="p-3 text-right">ค่าไฟรวม (บาท)</th>
                  <th className="p-3 text-right">ยอดเงินรวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {buildingStats.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      หอพัก{b.name}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          b.recorded === b.total
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.recorded} / {b.total} ห้อง
                      </span>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(b.waterUnits)}</td>
                    <td className="p-3 text-right font-semibold text-blue-700">
                      ฿{formatCurrency(b.waterCost)}
                    </td>
                    <td className="p-3 text-right">{formatCurrency(b.elecUnits)}</td>
                    <td className="p-3 text-right font-semibold text-amber-700">
                      ฿{formatCurrency(b.elecCost)}
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                      ฿{formatCurrency(b.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Grand Totals */}
              <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="p-3">รวมทั้งสิ้น</td>
                  <td className="p-3 text-center text-xs text-slate-600">
                    {recordedCount} / {totalRooms} ห้อง
                  </td>
                  <td className="p-3 text-right text-blue-900">{formatCurrency(waterUnits)}</td>
                  <td className="p-3 text-right text-blue-900">฿{formatCurrency(waterRevenue)}</td>
                  <td className="p-3 text-right text-amber-900">{formatCurrency(elecUnits)}</td>
                  <td className="p-3 text-right text-amber-900">฿{formatCurrency(elecRevenue)}</td>
                  <td className="p-3 text-right text-emerald-950 font-black text-base">
                    ฿{formatCurrency(totalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
