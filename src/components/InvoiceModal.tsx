import React, { useRef, useState } from 'react';
import { MeterRecord, DormSettings } from '../types';
import { formatCurrency, formatThaiMonthYear } from '../utils/thaiDate';
import { downloadElementAsImage, downloadElementAsPDF } from '../services/exportMedia';
import { X, Printer, Image as ImageIcon, Download } from 'lucide-react';

interface InvoiceModalProps {
  record: MeterRecord | null;
  selectedMonth: string;
  settings: DormSettings;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  record,
  selectedMonth,
  settings,
  isOpen,
  onClose,
  onPrint,
  onShowToast
}) => {
  if (!isOpen || !record) return null;

  const invoiceContentRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingImg, setIsExportingImg] = useState(false);

  const handleDownloadInvoiceImage = async () => {
    if (!invoiceContentRef.current) return;
    setIsExportingImg(true);
    try {
      await downloadElementAsImage(
        invoiceContentRef.current,
        `ใบแจ้งหนี้_${record.buildingName}_ห้อง${record.roomNo}_${selectedMonth}`
      );
      if (onShowToast) onShowToast('ดาวน์โหลดใบแจ้งหนี้เป็นรูปภาพ (.PNG) สำเร็จแล้ว!');
    } catch (e: any) {
      if (onShowToast) onShowToast('ไม่สามารถสร้างรูปภาพได้', 'error');
    } finally {
      setIsExportingImg(false);
    }
  };

  const handleDownloadInvoicePDF = async () => {
    if (!invoiceContentRef.current) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(
        invoiceContentRef.current,
        `ใบแจ้งหนี้_${record.buildingName}_ห้อง${record.roomNo}_${selectedMonth}`
      );
      if (onShowToast) onShowToast('ดาวน์โหลดใบแจ้งหนี้เป็น PDF สำเร็จแล้ว!');
    } catch (e: any) {
      if (onShowToast) onShowToast('ไม่สามารถสร้าง PDF ได้', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-300 font-semibold uppercase">
              หอพัก{record.buildingName} • ชั้น {record.floor}
            </span>
            <h3 className="text-2xl font-black">ใบแจ้งหนี้ ห้อง {record.roomNo}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area for Viewing and Capturing */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div ref={invoiceContentRef} className="p-4 bg-white border border-slate-300 rounded-2xl space-y-4">
            <div className="text-center pb-2 border-b border-slate-300">
              <h4 className="font-black text-base text-slate-900">
                ใบแจ้งหนี้ค่าน้ำประปา - ค่าไฟฟ้า
              </h4>
              <p className="text-xs text-slate-500">
                หอพัก{record.buildingName} • ประจำเดือน {formatThaiMonthYear(selectedMonth)}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
              <span>ห้องพักเลขที่: {record.roomNo}</span>
              <span>ชั้น: {record.floor}</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2">รายการ</th>
                  <th className="p-2 text-center">หน่วย / รายละเอียด</th>
                  <th className="p-2 text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-2">
                    ค่าน้ำประปา
                    <span className="block text-[10px] text-slate-400">
                      {record.waterType === 'flat_per_person'
                        ? `อัตราเหมา ${settings.defaultFlatWaterRate} บ./คน`
                        : `${record.waterPrev} ➔ ${record.waterCurr}`}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {record.waterType === 'flat_per_person'
                      ? `${record.occupants} คน`
                      : `${record.waterUnits} หน่วย`}
                  </td>
                  <td className="p-2 text-right font-bold text-blue-600">
                    ฿{formatCurrency(record.waterCost)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">
                    ค่าไฟฟ้า
                    <span className="block text-[10px] text-slate-400">
                      {record.elecPrev} ➔ {record.elecCurr} (หน่วยละ {settings.defaultElecRate} บ.)
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {record.elecUnits} หน่วย
                  </td>
                  <td className="p-2 text-right font-bold text-amber-600">
                    ฿{formatCurrency(record.elecCost)}
                  </td>
                </tr>
              </tbody>
            </table>

            {record.remark && (
              <div className="text-xs bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-900">
                <b>หมายเหตุ:</b> {record.remark}
              </div>
            )}

            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center font-bold">
              <span className="text-xs text-slate-300">ยอดรวมทั้งสิ้น:</span>
              <span className="text-xl font-black text-amber-400">
                ฿{formatCurrency(record.totalAmount)}
              </span>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4 text-[11px] text-center text-slate-500">
              <div>
                <div className="border-b border-slate-300 h-6 mb-1"></div>
                <span>เจ้าหน้าที่จดมิเตอร์</span>
              </div>
              <div>
                <div className="border-b border-slate-300 h-6 mb-1"></div>
                <span>ผู้รับใบแจ้งหนี้</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-end gap-2">
            <button
              onClick={handleDownloadInvoiceImage}
              disabled={isExportingImg}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>บันทึกรูปภาพ</span>
            </button>

            <button
              onClick={handleDownloadInvoicePDF}
              disabled={isExportingPDF}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด PDF</span>
            </button>

            <button
              onClick={onPrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์</span>
            </button>

            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
            >
              ปิด
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
