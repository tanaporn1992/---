import React, { useState, useRef, useMemo } from 'react';
import { BUILDINGS_CONFIG, MASTER_ROOMS } from '../data/buildings';
import { RoomInfo, MeterRecord } from '../types';
import { formatCurrency, formatThaiMonthYear, getShortThaiMonthYear, generateMeterPhotoSvg, compressImageFile } from '../utils/thaiDate';
import { downloadElementAsImage, downloadElementAsPDF, downloadMultiPagePDF } from '../services/exportMedia';
import {
  Camera,
  Droplets,
  Zap,
  Printer,
  Download,
  Image as ImageIcon,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Upload,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface MeterPhotoReportTabProps {
  selectedMonth: string;
  masterRooms: RoomInfo[];
  records: Record<string, MeterRecord>;
  onSaveRecord: (record: MeterRecord) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onNavigateToSheet?: (buildingId: string) => void;
}

export const MeterPhotoReportTab: React.FC<MeterPhotoReportTabProps> = ({
  selectedMonth,
  masterRooms,
  records,
  onSaveRecord,
  onShowToast,
  onNavigateToSheet
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('chaiya');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HAS_PHOTO' | 'NO_PHOTO'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'print_sheets'>('cards');

  // Lightbox Zoom Modal
  const [activeLightbox, setActiveLightbox] = useState<{
    imageUrl: string;
    title: string;
    type: 'water' | 'elec';
    roomNo: string;
    reading: number;
    units: number;
    remark?: string;
  } | null>(null);

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const currentBuilding = BUILDINGS_CONFIG.find(b => b.id === selectedBuildingId) || BUILDINGS_CONFIG[0];
  const currMonthLabel = getShortThaiMonthYear(selectedMonth);
  const monthThai = formatThaiMonthYear(selectedMonth);

  // Filter rooms in current building
  const buildingRooms = useMemo(() => {
    return masterRooms.filter(r => r.buildingId === selectedBuildingId);
  }, [masterRooms, selectedBuildingId]);

  // Available floors for current building
  const availableFloors = useMemo(() => {
    const floors = new Set(buildingRooms.map(r => r.floor));
    return Array.from(floors).sort((a, b) => a - b);
  }, [buildingRooms]);

  // Filtered rooms with records
  const filteredRooms = useMemo(() => {
    return buildingRooms.filter(room => {
      // Floor filter
      if (selectedFloor !== 'ALL' && room.floor !== parseInt(selectedFloor, 10)) {
        return false;
      }
      // Search
      if (searchQuery.trim() && !room.roomNo.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
        return false;
      }
      // Status filter
      const rec = records[room.id];
      const hasCustomPhoto = !!(rec?.waterPhoto || rec?.elecPhoto);
      if (statusFilter === 'HAS_PHOTO' && !hasCustomPhoto) return false;
      if (statusFilter === 'NO_PHOTO' && hasCustomPhoto) return false;

      return true;
    });
  }, [buildingRooms, selectedFloor, searchQuery, statusFilter, records]);

  // Handle Photo Upload
  const handlePhotoUpload = (roomId: string, type: 'water' | 'elec', file: File) => {
    compressImageFile(file, (base64) => {
      const room = masterRooms.find(r => r.id === roomId);
      if (!room) return;
      const existing = records[roomId];
      const updated: MeterRecord = existing
        ? {
            ...existing,
            waterPhoto: type === 'water' ? base64 : existing.waterPhoto,
            elecPhoto: type === 'elec' ? base64 : existing.elecPhoto
          }
        : {
            roomId: room.id,
            buildingId: room.buildingId,
            buildingName: room.buildingName,
            roomNo: room.roomNo,
            floor: room.floor,
            waterType: room.waterType,
            waterPrev: 0,
            waterCurr: 0,
            occupants: 1,
            waterUnits: 0,
            waterCost: 0,
            waterPhoto: type === 'water' ? base64 : null,
            elecPrev: 0,
            elecCurr: 0,
            elecUnits: 0,
            elecCost: 0,
            elecPhoto: type === 'elec' ? base64 : null,
            remark: '',
            totalAmount: 0,
            recordedAt: new Date().toISOString()
          };

      onSaveRecord(updated);
      onShowToast(`อัปโหลดรูปภาพมิเตอร์${type === 'water' ? 'น้ำ' : 'ไฟ'} ห้อง ${room.roomNo} สำเร็จ!`);
    });
  };

  // Helper to get image URL (custom photo or generated authentic SVG dial badge)
  const getMeterPhotoUrl = (room: RoomInfo, type: 'water' | 'elec'): { url: string; isReal: boolean } => {
    const rec = records[room.id];
    if (type === 'water') {
      if (rec?.waterPhoto) return { url: rec.waterPhoto, isReal: true };
      const reading = rec ? rec.waterCurr : 0;
      return {
        url: generateMeterPhotoSvg('water', room.roomNo, reading, currMonthLabel, currentBuilding.name),
        isReal: false
      };
    } else {
      if (rec?.elecPhoto) return { url: rec.elecPhoto, isReal: true };
      const reading = rec ? rec.elecCurr : 0;
      return {
        url: generateMeterPhotoSvg('elec', room.roomNo, reading, currMonthLabel, currentBuilding.name),
        isReal: false
      };
    }
  };

  // Export as Image (.PNG)
  const handleDownloadImage = async () => {
    if (!reportContainerRef.current) return;
    setIsExportingImage(true);
    try {
      await downloadElementAsImage(
        reportContainerRef.current,
        `รายงานรูปภาพมิเตอร์_${currentBuilding.name}_${currMonthLabel}`
      );
      onShowToast('ดาวน์โหลดรายงานรูปภาพมิเตอร์ (.PNG) เรียบร้อยแล้ว!');
    } catch (err: any) {
      onShowToast(err.message || 'ไม่สามารถสร้างรูปภาพได้', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Export as PDF (.PDF)
  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    setIsExportingPDF(true);
    try {
      const pageElements = Array.from(
        reportContainerRef.current.querySelectorAll<HTMLElement>('.photo-report-sheet')
      );
      if (pageElements.length > 0) {
        await downloadMultiPagePDF(
          pageElements,
          `รายงานรูปภาพมิเตอร์_${currentBuilding.name}_${currMonthLabel}`
        );
      } else {
        await downloadElementAsPDF(
          reportContainerRef.current,
          `รายงานรูปภาพมิเตอร์_${currentBuilding.name}_${currMonthLabel}`
        );
      }
      onShowToast('ดาวน์โหลดรายงานรูปภาพมิเตอร์เป็น PDF สำเร็จแล้ว!');
    } catch (err: any) {
      onShowToast(err.message || 'สร้าง PDF ไม่สำเร็จ', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Pagination for A4 Print Sheets (6 rooms per sheet)
  const roomChunksForPrint = useMemo(() => {
    const chunks: RoomInfo[][] = [];
    const size = 6;
    for (let i = 0; i < filteredRooms.length; i += size) {
      chunks.push(filteredRooms.slice(i, i + size));
    }
    return chunks;
  }, [filteredRooms]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-violet-100 text-violet-700 rounded-xl">
                <Camera className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                รายงานรูปภาพมิเตอร์น้ำประปา-ไฟฟ้า (Meter Photo Inspection)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              อัลบั้มภาพถ่ายมิเตอร์สำหรับตรวจสอบความถูกต้อง ยืนยันเลขมาตร และส่งออกเอกสารรายงานเป็นรูปภาพหรือ PDF
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                การ์ดภาพถ่าย
              </button>
              <button
                onClick={() => setViewMode('print_sheets')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'print_sheets'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                แผ่นพิมพ์ A4 ({roomChunksForPrint.length} แผ่น)
              </button>
            </div>

            {/* Download Image (.PNG) */}
            <button
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isExportingImage ? 'สร้างรูป...' : 'บันทึกภาพ (.PNG)'}</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? 'สร้าง PDF...' : 'ดาวน์โหลด PDF'}</span>
            </button>

            {/* Print A4 */}
            <button
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ (A4)</span>
            </button>
          </div>
        </div>

        {/* Building Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              เลือกอาคารที่ต้องการดูรูปมิเตอร์:
            </label>
            <div className="flex flex-wrap gap-2">
              {BUILDINGS_CONFIG.map((b) => {
                const isSelected = b.id === selectedBuildingId;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBuildingId(b.id);
                      setSelectedFloor('ALL');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-violet-950 text-white shadow-md ring-2 ring-violet-400/40'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>หอพัก{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jump to Building Sheet */}
          {onNavigateToSheet && (
            <button
              onClick={() => onNavigateToSheet(selectedBuildingId)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
            >
              <span>ดูตารางสรุปตัวเลขหอพัก{currentBuilding.name} ➔</span>
            </button>
          )}
        </div>

        {/* Filters: Floor, Search, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          
          {/* Floor */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">เลือกชั้น:</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-violet-500 font-medium"
            >
              <option value="ALL">ทุกชั้น (ทั้งหมด {buildingRooms.length} ห้อง)</option>
              {availableFloors.map(f => (
                <option key={f} value={f}>
                  ชั้น {f} ({buildingRooms.filter(r => r.floor === f).length} ห้อง)
                </option>
              ))}
            </select>
          </div>

          {/* Search Room */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">ค้นหาห้อง:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ระบุเลขห้อง..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Photo Filter */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">สถานะรูปภาพ:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-violet-500 font-medium"
            >
              <option value="ALL">ห้องทั้งหมด ({filteredRooms.length})</option>
              <option value="HAS_PHOTO">เฉพาะห้องที่แนบรูปถ่ายแล้ว</option>
              <option value="NO_PHOTO">ห้องที่ยังไม่ได้แนบรูปถ่าย</option>
            </select>
          </div>

        </div>

      </div>

      {/* RENDER TARGET CONTAINER */}
      <div ref={reportContainerRef} className="space-y-6">
        
        {/* VIEW MODE 1: GRID CARDS (Interactive Inspection Cards) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => {
              const rec = records[room.id];
              const water = getMeterPhotoUrl(room, 'water');
              const elec = getMeterPhotoUrl(room, 'elec');

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-violet-300 transition-all hover:shadow-md"
                >
                  
                  {/* Card Header */}
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {currentBuilding.name} • ชั้น {room.floor}
                      </span>
                      <h4 className="text-lg font-black text-white">ห้อง {room.roomNo}</h4>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400">
                        {rec ? `฿${formatCurrency(rec.totalAmount)}` : '-'}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {rec?.remark || (room.waterType === 'flat_per_person' ? 'เหมาค่าน้ำ' : 'มิเตอร์ปกติ')}
                      </span>
                    </div>
                  </div>

                  {/* Dual Meter Photos (Water & Electricity) */}
                  <div className="p-4 grid grid-cols-2 gap-3">
                    
                    {/* WATER METER PHOTO */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-700">
                        <span className="flex items-center space-x-1">
                          <Droplets className="w-3 h-3 text-blue-500" />
                          <span>มิเตอร์น้ำ</span>
                        </span>
                        <span>{rec ? (room.waterType === 'flat_per_person' ? `${rec.occupants} คน` : `${rec.waterUnits} u`) : '-'}</span>
                      </div>

                      {/* Photo Display Frame */}
                      <div
                        onClick={() => setActiveLightbox({
                          imageUrl: water.url,
                          title: `มิเตอร์น้ำประปา ห้อง ${room.roomNo} (${currentBuilding.name})`,
                          type: 'water',
                          roomNo: room.roomNo,
                          reading: rec?.waterCurr || 0,
                          units: rec?.waterUnits || 0,
                          remark: rec?.remark
                        })}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-950 cursor-pointer shadow-inner"
                      >
                        <img
                          src={water.url}
                          alt="Water Meter"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                          <Maximize2 className="w-4 h-4" />
                          <span>ดูภาพขยาย</span>
                        </div>
                        {water.isReal && (
                          <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            ภาพถ่ายจริง
                          </span>
                        )}
                      </div>

                      {/* Reading Stats & Upload button */}
                      <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
                        <span>อ่านได้: <b>{rec ? rec.waterCurr : '-'}</b></span>
                        <label className="cursor-pointer text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-0.5">
                          <Upload className="w-2.5 h-2.5" />
                          <span>แนบรูป</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(room.id, 'water', file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* ELECTRICITY METER PHOTO */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-700">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>มิเตอร์ไฟ</span>
                        </span>
                        <span>{rec ? `${rec.elecUnits} u` : '-'}</span>
                      </div>

                      {/* Photo Display Frame */}
                      <div
                        onClick={() => setActiveLightbox({
                          imageUrl: elec.url,
                          title: `มิเตอร์ไฟฟ้า ห้อง ${room.roomNo} (${currentBuilding.name})`,
                          type: 'elec',
                          roomNo: room.roomNo,
                          reading: rec?.elecCurr || 0,
                          units: rec?.elecUnits || 0,
                          remark: rec?.remark
                        })}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-950 cursor-pointer shadow-inner"
                      >
                        <img
                          src={elec.url}
                          alt="Electricity Meter"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                          <Maximize2 className="w-4 h-4" />
                          <span>ดูภาพขยาย</span>
                        </div>
                        {elec.isReal && (
                          <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            ภาพถ่ายจริง
                          </span>
                        )}
                      </div>

                      {/* Reading Stats & Upload button */}
                      <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
                        <span>อ่านได้: <b>{rec ? rec.elecCurr : '-'}</b></span>
                        <label className="cursor-pointer text-amber-600 hover:text-amber-800 font-bold flex items-center space-x-0.5">
                          <Upload className="w-2.5 h-2.5" />
                          <span>แนบรูป</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(room.id, 'elec', file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Card Bottom Banner */}
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] flex justify-between text-slate-500">
                    <span>
                      {rec?.recordedAt ? `ตรวจเมื่อ ${new Date(rec.recordedAt).toLocaleDateString('th-TH')}` : 'รอการตรวจ'}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {water.isReal && elec.isReal ? '✓ ครบ 2 รูป' : 'มีภาพจำลอง'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE 2: FORMAL A4 PRINT SHEETS (Ready for Multi-Page PDF Download & Physical Audit Sheets) */}
        {viewMode === 'print_sheets' && (
          <div className="space-y-8">
            {roomChunksForPrint.map((chunk, pageIdx) => (
              <div
                key={pageIdx}
                className="photo-report-sheet page-break bg-white p-8 rounded-2xl shadow-sm border border-slate-300 max-w-4xl mx-auto space-y-4"
                style={{ minHeight: '297mm' }}
              >
                
                {/* Official Sheet Header */}
                <div className="flex justify-between items-start border-b pb-2 border-slate-300">
                  <div className="text-[11px] text-slate-600">
                    เอกสารรายงานรูปภาพมิเตอร์ • หน้า {pageIdx + 1} จาก {roomChunksForPrint.length}
                  </div>
                  <div className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-300">
                    หอพัก{currentBuilding.name} {currMonthLabel}
                  </div>
                </div>

                <div className="text-center py-1">
                  <h3 className="text-base font-bold text-slate-900">
                    รายงานรูปภาพหลักฐานการจดมิเตอร์น้ำประปาและไฟฟ้า หอพัก{currentBuilding.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    ประจำเดือน {monthThai} • มหาวิทยาลัยราชภัฏสุราษฎร์ธานี
                  </p>
                </div>

                {/* 6 Rooms per A4 Sheet in 2 Columns */}
                <div className="grid grid-cols-2 gap-4">
                  {chunk.map((room) => {
                    const rec = records[room.id];
                    const water = getMeterPhotoUrl(room, 'water');
                    const elec = getMeterPhotoUrl(room, 'elec');

                    return (
                      <div
                        key={room.id}
                        className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                          <span className="font-black text-sm text-slate-900">
                            ห้อง {room.roomNo} (ชั้น {room.floor})
                          </span>
                          <span className="text-[11px] font-bold text-slate-800">
                            รวม ฿{rec ? formatCurrency(rec.totalAmount) : '0'}
                          </span>
                        </div>

                        {/* Photos side by side */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-blue-800 block mb-0.5">
                              น้ำ: {rec ? (room.waterType === 'flat_per_person' ? `${rec.occupants} คน` : `${rec.waterUnits} น.`) : '-'} (อ่าน: {rec?.waterCurr || 0})
                            </span>
                            <div className="border border-slate-300 rounded-lg overflow-hidden aspect-[4/3] bg-black">
                              <img src={water.url} alt="Water" className="w-full h-full object-cover" />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-amber-800 block mb-0.5">
                              ไฟ: {rec?.elecUnits || 0} น. (อ่าน: {rec?.elecCurr || 0})
                            </span>
                            <div className="border border-slate-300 rounded-lg overflow-hidden aspect-[4/3] bg-black">
                              <img src={elec.url} alt="Elec" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>

                        {rec?.remark && (
                          <div className="text-[10px] text-slate-600 italic bg-amber-50 p-1 rounded border border-amber-200">
                            หมายเหตุ: {rec.remark}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Audit Signatures at the bottom of the last sheet */}
                {pageIdx === roomChunksForPrint.length - 1 && (
                  <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200 mt-6">
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1 w-44 mx-auto"></div>
                      <span className="font-bold">เจ้าหน้าที่ผู้ตรวจและถ่ายภาพมิเตอร์</span>
                      <p className="text-[10px] text-slate-500">งานบริหารหอพักนักศึกษา</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1 w-44 mx-auto"></div>
                      <span className="font-bold">หัวหน้างานบริหารหอพักนักศึกษา</span>
                      <p className="text-[10px] text-slate-500">กองกิจการนักศึกษา</p>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

      {/* FULLSCREEN LIGHTBOX / ZOOM MODAL */}
      {activeLightbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  ตรวจสอบรูปถ่ายมิเตอร์ • {activeLightbox.type === 'water' ? 'น้ำประปา' : 'ไฟฟ้า'}
                </span>
                <h3 className="text-lg font-bold">{activeLightbox.title}</h3>
              </div>
              <button
                onClick={() => setActiveLightbox(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Large Image Frame */}
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[340px]">
              <img
                src={activeLightbox.imageUrl}
                alt="Enlarged meter"
                className="max-h-[60vh] max-w-full rounded-xl shadow-2xl object-contain border border-slate-700"
              />
            </div>

            {/* Inspection Details Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 text-sm font-bold text-slate-900">
                  <span>เลขที่อ่านได้: <b className="text-indigo-600">{activeLightbox.reading}</b></span>
                  <span>หน่วยที่ใช้: <b className="text-emerald-600">{activeLightbox.units}</b> หน่วย</span>
                </div>
                {activeLightbox.remark && (
                  <p className="text-slate-500">หมายเหตุ: {activeLightbox.remark}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `meter_${activeLightbox.roomNo}_${activeLightbox.type}.png`;
                    link.href = activeLightbox.imageUrl;
                    link.click();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกรูปนี้</span>
                </button>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
