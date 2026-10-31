import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { BUILDINGS_CONFIG } from '../data/buildings';
import { SheetRowData, SheetTotals, DormSettings, CalendarEventSummary } from '../types';
import { formatCurrency, formatThaiMonthYear, getShortThaiMonthYear, getPrevShortThaiMonthYear } from '../utils/thaiDate';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Cloud,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Download,
  Copy
} from 'lucide-react';

interface WorkspaceTabProps {
  currentUser: User | null;
  onGoogleSignIn: () => void;
  isLoggingIn: boolean;
  selectedMonth: string;
  selectedBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  sheetRows: SheetRowData[];
  sheetTotals: SheetTotals;
  settings: DormSettings;
  onExportSheets: () => void;
  onExportDocs: () => void;
  isExportingSheets: boolean;
  isExportingDocs: boolean;
  lastCreatedSheetUrl: string | null;
  lastCreatedDocUrl: string | null;
  calendarEvents: CalendarEventSummary[];
  isLoadingCalendar: boolean;
  onFetchCalendarEvents: () => void;
  onCreateCalendarEvent: (event: {
    summary: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  isCreatingEvent: boolean;
  onDownloadCSV: () => void;
  onCopyClipboard: () => void;
}

export const WorkspaceTab: React.FC<WorkspaceTabProps> = ({
  currentUser,
  onGoogleSignIn,
  isLoggingIn,
  selectedMonth,
  selectedBuildingId,
  onSelectBuilding,
  sheetRows,
  sheetTotals,
  settings,
  onExportSheets,
  onExportDocs,
  isExportingSheets,
  isExportingDocs,
  lastCreatedSheetUrl,
  lastCreatedDocUrl,
  calendarEvents,
  isLoadingCalendar,
  onFetchCalendarEvents,
  onCreateCalendarEvent,
  isCreatingEvent,
  onDownloadCSV,
  onCopyClipboard
}) => {
  const currentBuilding = BUILDINGS_CONFIG.find(b => b.id === selectedBuildingId) || BUILDINGS_CONFIG[0];
  const monthThai = formatThaiMonthYear(selectedMonth);

  // Calendar Event form state
  const [calPreset, setCalPreset] = useState<'reading' | 'announce' | 'due'>('reading');
  const [calSummary, setCalSummary] = useState<string>('');
  const [calDescription, setCalDescription] = useState<string>('');
  const [calStartDate, setCalStartDate] = useState<string>('');
  const [calEndDate, setCalEndDate] = useState<string>('');

  // Update preset defaults
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setCalStartDate(today);
    setCalEndDate(today);

    if (calPreset === 'reading') {
      setCalSummary(`[จดมิเตอร์หอพัก] เดินจดมิเตอร์น้ำ-ไฟ หอพัก${currentBuilding.name} (${monthThai})`);
      setCalDescription(`ช่วงเวลาเดินจดมิเตอร์น้ำประปาและไฟฟ้าประจำเดือน ${monthThai} หอพัก${currentBuilding.name} รวม ${sheetRows.length} ห้อง`);
    } else if (calPreset === 'announce') {
      setCalSummary(`[ค่าน้ำ-ไฟหอพัก] ประกาศใบแจ้งหนี้ค่าน้ำ-ไฟ (${monthThai})`);
      setCalDescription(`แจ้งยอดหนี้ค่าน้ำประปาและค่าไฟฟ้าประจำเดือน ${monthThai} แก่นักศึกษาผู้พักอาศัย`);
    } else if (calPreset === 'due') {
      setCalSummary(`[ค่าน้ำ-ไฟหอพัก] วันสุดท้ายของการชำระเงิน (${monthThai})`);
      setCalDescription(`วันครบกำหนดชำระเงินค่าน้ำประปาและค่าไฟฟ้าประจำเดือน ${monthThai}`);
    }
  }, [calPreset, currentBuilding, monthThai, sheetRows.length]);

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calSummary || !calStartDate || !calEndDate) return;
    onCreateCalendarEvent({
      summary: calSummary,
      description: calDescription,
      startDate: calStartDate,
      endDate: calEndDate
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header Status Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-emerald-300">
              <Cloud className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">
                Google Workspace ศูนย์รวมการเชื่อมต่อ
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                เชื่อมต่อระบบจดมิเตอร์เข้ากับ Google Docs, Google Sheets และ Google Calendar โดยตรง
              </p>
            </div>
          </div>

          <div>
            {currentUser ? (
              <div className="bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  เชื่อมต่อในนาม: <b>{currentUser.email}</b>
                </span>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button shadow-lg cursor-pointer"
              >
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg viewBox="0 0 48 48" className="w-5 h-5 block">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'ลงชื่อเข้าใช้ Google เพื่อเปิดฟีเจอร์'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Google Sheets & Google Docs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GOOGLE SHEETS CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Google Sheets (ตารางมิเตอร์น้ำ-ไฟฟ้า)
                </h3>
                <p className="text-xs text-slate-500">
                  ส่งออกข้อมูลตารางจดมิเตอร์ของอาคารที่เลือกไปยัง Google Spreadsheet ใหม่ในไดรฟ์ของคุณ
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกอาคารที่จะส่งออก:
              </label>
              <select
                value={selectedBuildingId}
                onChange={(e) => onSelectBuilding(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {BUILDINGS_CONFIG.map(b => (
                  <option key={b.id} value={b.id}>
                    หอพัก{b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>อาคาร:</span>
                <span className="font-bold text-slate-900">หอพัก{currentBuilding.name}</span>
              </div>
              <div className="flex justify-between">
                <span>รอบบิล:</span>
                <span className="font-bold text-slate-900">{monthThai}</span>
              </div>
              <div className="flex justify-between">
                <span>จำนวนแถวข้อมูล:</span>
                <span className="font-bold text-emerald-700">{sheetRows.length} ห้อง</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onExportSheets}
              disabled={isExportingSheets}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingSheets ? 'กำลังสร้าง Google Spreadsheet...' : 'สร้างตารางใน Google Sheets'}</span>
            </button>

            {lastCreatedSheetUrl && (
              <a
                href={lastCreatedSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>เปิดสเปรดชีตล่าสุดใน Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* GOOGLE DOCS CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Google Docs (รายงานสรุปทางการ)
                </h3>
                <p className="text-xs text-slate-500">
                  สร้างเอกสารบันทึกข้อความสรุปค่าสาธารณูปโภค พร้อมช่องลงนามเสนอหัวหน้างาน
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกอาคารที่จะทำเอกสาร:
              </label>
              <select
                value={selectedBuildingId}
                onChange={(e) => onSelectBuilding(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {BUILDINGS_CONFIG.map(b => (
                  <option key={b.id} value={b.id}>
                    หอพัก{b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>หัวข้อ:</span>
                <span className="font-bold text-slate-900">รายงานสรุปค่าน้ำ-ไฟหอพัก</span>
              </div>
              <div className="flex justify-between">
                <span>ยอดเงินรวม:</span>
                <span className="font-bold text-blue-700">฿{formatCurrency(sheetTotals.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>มีฟอร์มลงนาม:</span>
                <span className="font-bold text-slate-800">ผู้จัดทำ & ผู้อนุมัติ</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onExportDocs}
              disabled={isExportingDocs}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isExportingDocs ? 'กำลังสร้าง Google Doc...' : 'สร้างเอกสารใน Google Docs'}</span>
            </button>

            {lastCreatedDocUrl && (
              <a
                href={lastCreatedDocUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>เปิดเอกสารล่าสุดใน Google Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

      </div>

      {/* GOOGLE CALENDAR CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Calendar (กำหนดการรอบบิลหอพัก)
              </h3>
              <p className="text-xs text-slate-500">
                เพิ่มกำหนดการช่วงเวลาเดินจดมิเตอร์ วันประกาศแจ้งหนี้ หรือวันครบกำหนดชำระเงินลงใน Google Calendar
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={onFetchCalendarEvents}
              disabled={isLoadingCalendar}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-semibold border border-slate-200 px-3 py-1.5 rounded-lg self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
              <span>ซิงค์ปฏิทินล่าสุด</span>
            </button>
          )}
        </div>

        {/* Schedule Creation Form */}
        <form onSubmit={handleCreateEventSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              เลือกประเภทกิจกรรม:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCalPreset('reading')}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                  calPreset === 'reading'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                1. รอบเดินจดมิเตอร์
              </button>
              <button
                type="button"
                onClick={() => setCalPreset('announce')}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                  calPreset === 'announce'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                2. วันประกาศใบแจ้งหนี้
              </button>
              <button
                type="button"
                onClick={() => setCalPreset('due')}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                  calPreset === 'due'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                3. วันครบกำหนดชำระเงิน
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                ชื่อกิจกรรมในปฏิทิน:
              </label>
              <input
                type="text"
                value={calSummary}
                onChange={(e) => setCalSummary(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">วันเริ่มต้น:</label>
                <input
                  type="date"
                  value={calStartDate}
                  onChange={(e) => setCalStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">วันสิ้นสุด:</label>
                <input
                  type="date"
                  value={calEndDate}
                  onChange={(e) => setCalEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">คำอธิบายรายละเอียด:</label>
            <input
              type="text"
              value={calDescription}
              onChange={(e) => setCalDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingEvent}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isCreatingEvent ? 'กำลังบันทึกลง Calendar...' : 'เพิ่มลง Google Calendar'}</span>
            </button>
          </div>
        </form>

        {/* Existing Calendar Events List */}
        <div className="pt-2 space-y-2">
          <h4 className="text-xs font-bold text-slate-700">
            กิจกรรมสาธารณูปโภคใน Google Calendar ของคุณ:
          </h4>

          {calendarEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {calendarEvents.map(evt => (
                <div
                  key={evt.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-start"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{evt.summary}</span>
                    <span className="text-[11px] text-slate-500">
                      {evt.start.dateTime
                        ? new Date(evt.start.dateTime).toLocaleDateString('th-TH')
                        : evt.start.date}
                    </span>
                  </div>
                  {evt.htmlLink && (
                    <a
                      href={evt.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="ดูใน Google Calendar"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {currentUser
                ? 'ยังไม่พบกิจกรรมมิเตอร์หอพักในปฏิทิน คุณสามารถเพิ่มกิจกรรมด้านบนได้ทันที'
                : 'กรุณาเชื่อมต่อ Google ด้านบนเพื่อดึงกิจกรรมจากปฏิทิน'}
            </p>
          )}
        </div>
      </div>

      {/* Offline File Export Options */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          ทางเลือกสำรอง: ส่งออกไฟล์ออฟไลน์ (CSV / Clipboard)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onDownloadCSV}
            className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-emerald-50/50 text-left transition-all flex items-start space-x-3 cursor-pointer"
          >
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">ดาวน์โหลดไฟล์ CSV (UTF-8)</span>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับภาษาไทยสำหรับนำเข้าเปิดใน Excel หรือ Google Sheets
              </p>
            </div>
          </button>

          <button
            onClick={onCopyClipboard}
            className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-blue-50/50 text-left transition-all flex items-start space-x-3 cursor-pointer"
          >
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">คัดลอกตารางลง Clipboard</span>
              <p className="text-xs text-slate-500 mt-0.5">
                กดเพื่อคัดลอก แล้วเปิด Google Sheets กด Ctrl+V วางได้ทันที
              </p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
