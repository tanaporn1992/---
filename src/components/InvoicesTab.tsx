import React, { useState } from 'react';
import { BUILDINGS_CONFIG } from '../data/buildings';
import { MeterRecord } from '../types';
import { formatCurrency, formatThaiMonthYear } from '../utils/thaiDate';
import { FileText, Printer, CheckSquare, Square, Eye, Droplets, Zap } from 'lucide-react';

interface InvoicesTabProps {
  selectedMonth: string;
  records: Record<string, MeterRecord>;
  onOpenSingleInvoice: (record: MeterRecord) => void;
  onBatchPrint: (records: MeterRecord[]) => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  selectedMonth,
  records,
  onOpenSingleInvoice,
  onBatchPrint
}) => {
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allRecords = Object.values(records);
  const filteredRecords = allRecords.filter(r =>
    buildingFilter === 'ALL' ? true : r.buildingId === buildingFilter
  );

  const isAllSelected =
    filteredRecords.length > 0 && selectedIds.length === filteredRecords.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.roomId));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrintSelected = () => {
    const toPrint = filteredRecords.filter(r => selectedIds.includes(r.roomId));
    if (toPrint.length > 0) {
      onBatchPrint(toPrint);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Batch Action */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>รายการใบแจ้งหนี้ประจำเดือน {formatThaiMonthYear(selectedMonth)}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบความถูกต้อง พิมพ์ใบแจ้งหนี้รายห้อง หรือเลือกพิมพ์เป็นชุด
          </p>
        </div>

        <button
          onClick={handlePrintSelected}
          disabled={selectedIds.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm flex items-center space-x-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์ใบแจ้งหนี้ PDF ({selectedIds.length} ห้อง)</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-1.5 font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>เลือกทั้งหมดในหน้านี้</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-slate-600 font-medium">กรองอาคาร:</label>
            <select
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                setSelectedIds([]);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">ทุกอาคาร</option>
              {BUILDINGS_CONFIG.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <span className="text-slate-500">
              พบ {filteredRecords.length} รายการ
            </span>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">เลือก</th>
                <th className="p-3">อาคาร / ห้อง</th>
                <th className="p-3">ค่าน้ำประปา (หน่วย/คน)</th>
                <th className="p-3">ค่าไฟฟ้า (หน่วย)</th>
                <th className="p-3 text-right">รวมเป็นเงิน</th>
                <th className="p-3">หมายเหตุ</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map(rec => {
                const isChecked = selectedIds.includes(rec.roomId);
                return (
                  <tr
                    key={rec.roomId}
                    className={`hover:bg-slate-50 transition-colors ${
                      isChecked ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(rec.roomId)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block text-base">
                        ห้อง {rec.roomNo}
                      </span>
                      <span className="text-xs text-slate-500">
                        หอพัก{rec.buildingName} • ชั้น {rec.floor}
                      </span>
                    </td>
                    <td className="p-3">
                      {rec.waterType === 'flat_per_person' ? (
                        <div>
                          <span className="font-semibold text-amber-800">
                            เหมา {rec.occupants} คน
                          </span>
                          <span className="text-xs text-slate-400 block">
                            ฿{formatCurrency(rec.waterCost)}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span>
                            {rec.waterPrev} ➔ {rec.waterCurr} (<b>{rec.waterUnits}</b> หน่วย)
                          </span>
                          <span className="text-xs text-slate-400 block">
                            ฿{formatCurrency(rec.waterCost)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div>
                        <span>
                          {rec.elecPrev} ➔ {rec.elecCurr} (<b>{rec.elecUnits}</b> หน่วย)
                        </span>
                        <span className="text-xs text-slate-400 block">
                          ฿{formatCurrency(rec.elecCost)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900 text-base">
                      ฿{formatCurrency(rec.totalAmount)}
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {rec.remark || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenSingleInvoice(rec)}
                        className="bg-slate-100 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium text-xs border border-slate-200 transition-colors flex items-center space-x-1 mx-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูใบแจ้งหนี้</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    ยังไม่มีข้อมูลบันทึกมิเตอร์ในเดือนนี้ หรือไม่มีข้อมูลสำหรับอาคารที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
