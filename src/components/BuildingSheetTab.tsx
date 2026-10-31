import React, { useRef, useState, useMemo } from 'react';
import { BUILDINGS_CONFIG } from '../data/buildings';
import { SheetRowData, SheetTotals, DormSettings } from '../types';
import { formatCurrency, formatThaiMonthYear, getShortThaiMonthYear, getPrevShortThaiMonthYear } from '../utils/thaiDate';
import { downloadElementAsImage, downloadMultiPagePDF, copyElementImageToClipboard } from '../services/exportMedia';
import { ImagePreviewModal } from './ImagePreviewModal';
import html2canvas from 'html2canvas';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Download,
  Copy,
  Eye,
  Layers,
  Sparkles,
  Camera
} from 'lucide-react';

interface BuildingSheetTabProps {
  selectedBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  selectedMonth: string;
  sheetRows: SheetRowData[];
  sheetTotals: SheetTotals;
  settings: DormSettings;
  onUpdateRemark: (roomId: string, remark: string) => void;
  onEditRoom: (roomId: string) => void;
  onOpenInvoice: (roomId: string) => void;
  onExportSheets: () => void;
  onExportDocs: () => void;
  isExportingSheets: boolean;
  isExportingDocs: boolean;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenPhotoReport?: () => void;
}

export type TableLayoutType = 'standard' | 'electricity_first' | 'prapassorn_student';

export interface FloorSection {
  id: string;
  label: string;
  headerTitle: string;
  topRightLabel: string;
  layoutType: TableLayoutType;
  rows: SheetRowData[];
  totals: SheetTotals & { totalOccupants: number };
  isLast: boolean;
  grandTotalLabel?: string;
  signatureColLabel?: string;
}

export const BuildingSheetTab: React.FC<BuildingSheetTabProps> = ({
  selectedBuildingId,
  onSelectBuilding,
  selectedMonth,
  sheetRows,
  sheetTotals,
  settings,
  onUpdateRemark,
  onEditRoom,
  onOpenInvoice,
  onExportSheets,
  onExportDocs,
  isExportingSheets,
  isExportingDocs,
  onShowToast,
  onOpenPhotoReport
}) => {
  const currentBuilding = BUILDINGS_CONFIG.find(b => b.id === selectedBuildingId) || BUILDINGS_CONFIG[0];
  const prevMonthLabel = getPrevShortThaiMonthYear(selectedMonth);
  const currMonthLabel = getShortThaiMonthYear(selectedMonth);
  const monthThai = formatThaiMonthYear(selectedMonth);

  // Column header toggle ('signature' matching PDF, 'remarks', or 'both')
  const [columnMode, setColumnMode] = useState<'signature' | 'remarks' | 'both'>('signature');

  // Multi-floor sections view mode: 'ALL_PAGES' (renders multi-page A4 like PDF) or specific section
  const [activeSectionId, setActiveSectionId] = useState<string>('ALL_PAGES');

  // Ref container holding all printable/exportable page sheets
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [isCopyingImage, setIsCopyingImage] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Helper to calculate totals for a slice of rows
  const calcTotals = (rows: SheetRowData[]): SheetTotals & { totalOccupants: number } => ({
    waterUnits: rows.reduce((s, r) => s + (r.waterUnits || 0), 0),
    elecUnits: rows.reduce((s, r) => s + (r.elecUnits || 0), 0),
    waterCost: rows.reduce((s, r) => s + (r.waterCost || 0), 0),
    elecCost: rows.reduce((s, r) => s + (r.elecCost || 0), 0),
    totalAmount: rows.reduce((s, r) => s + (r.totalAmount || 0), 0),
    totalOccupants: rows.reduce((s, r) => s + (r.occupants || 0), 0)
  });

  // Split building rows into official floor sections matching the user's PDF attachments exactly!
  const floorSections = useMemo<FloorSection[]>(() => {
    // 1. ท่าเพชร (Thaphet) - 4 Pages: ชั้น 1-2, ชั้น 3, ชั้น 4, ชั้น 5
    if (selectedBuildingId === 'thaphet') {
      const s1 = sheetRows.filter(r => r.roomNo === '101' || (parseInt(r.roomNo, 10) >= 201 && parseInt(r.roomNo, 10) <= 224));
      const s2 = sheetRows.filter(r => parseInt(r.roomNo, 10) >= 301 && parseInt(r.roomNo, 10) <= 324);
      const s3 = sheetRows.filter(r => parseInt(r.roomNo, 10) >= 401 && parseInt(r.roomNo, 10) <= 424);
      const s4 = sheetRows.filter(r => parseInt(r.roomNo, 10) >= 501 && parseInt(r.roomNo, 10) <= 524);

      return [
        {
          id: 'sec_1_2',
          label: 'ชั้น 1-2',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำ- ค่าไฟประจำหอท่าเพชร ชั้น 1-2`,
          topRightLabel: `ท่าเพชรก.ย.69`,
          layoutType: 'standard',
          rows: s1,
          totals: calcTotals(s1),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_3',
          label: 'ชั้น 3',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำ- ค่าไฟ ของนักศึกษา ประจำหอพัก ท่าเพชร ชั้น 3`,
          topRightLabel: `ท่าเพชรก.ย.69`,
          layoutType: 'standard',
          rows: s2,
          totals: calcTotals(s2),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_4',
          label: 'ชั้น 4',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำ- ค่าไฟ ของนักศึกษา ประจำหอพัก ท่าเพชร ชั้น 4`,
          topRightLabel: `ท่าเพชรก.ย.69`,
          layoutType: 'standard',
          rows: s3,
          totals: calcTotals(s3),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_5',
          label: 'ชั้น 5',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำ- ค่าไฟ ของนักศึกษา ประจำหอพัก ท่าเพชร ชั้น 5`,
          topRightLabel: `ท่าเพชรก.ย.69`,
          layoutType: 'standard',
          rows: s4,
          totals: calcTotals(s4),
          isLast: true,
          grandTotalLabel: 'รวมเงินทั้งหมด',
          signatureColLabel: 'ลายมือชื่อ'
        }
      ];
    }

    // 2. ท่าทอง (Thathong) - 4 Pages: ชั้น 1-2, ชั้น 3, ชั้น 4, ชั้น 5
    if (selectedBuildingId === 'thathong') {
      const s1 = sheetRows.filter(r => r.roomNo === '101' || (parseInt(r.roomNo, 10) >= 201 && parseInt(r.roomNo, 10) <= 224));
      const s2 = sheetRows.filter(r => parseInt(r.roomNo, 10) >= 301 && parseInt(r.roomNo, 10) <= 324);
      const s3 = sheetRows.filter(r => parseInt(r.roomNo, 10) >= 401 && parseInt(r.roomNo, 10) <= 424);
      const s4 = sheetRows.filter(r => parseInt(r.roomNo, 10) >= 501 && parseInt(r.roomNo, 10) <= 524);

      return [
        {
          id: 'sec_1_2',
          label: 'ชั้น 1-2',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้า ของนักศึกษาหอพักหญิงท่าทอง`,
          topRightLabel: `ท่าทอง ก.ย.69`,
          layoutType: 'standard',
          rows: s1,
          totals: calcTotals(s1),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_3',
          label: 'ชั้น 3',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้า ของนักศึกษาหอพักหญิงท่าทอง ชั้น 3`,
          topRightLabel: `ท่าทอง ก.ย.69`,
          layoutType: 'standard',
          rows: s2,
          totals: calcTotals(s2),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_4',
          label: 'ชั้น 4',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้า ของนักศึกษาหอพักหญิงท่าทอง ชั้น 4`,
          topRightLabel: `ท่าทอง ก.ย.69`,
          layoutType: 'standard',
          rows: s3,
          totals: calcTotals(s3),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_5',
          label: 'ชั้น 5',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้า ของนักศึกษาหอพักหญิงท่าทอง ชั้น 5`,
          topRightLabel: `ท่าทอง ก.ย.69`,
          layoutType: 'standard',
          rows: s4,
          totals: calcTotals(s4),
          isLast: true,
          grandTotalLabel: 'รวมทั้งหมด',
          signatureColLabel: 'ลายมือชื่อ'
        }
      ];
    }

    // 3. ประภัสสร (Prapassorn) - 5 Pages: บุคลากร + นักศึกษาชั้น 2, 3, 4, 5
    if (selectedBuildingId === 'prapassorn') {
      const staffRoomIds = ['4201', '4202', '4301', '4302', '4401', '4402', '4501', '4502', '4114'];
      const sStaff = sheetRows.filter(r => staffRoomIds.includes(r.roomNo));
      const s2 = sheetRows.filter(r => !staffRoomIds.includes(r.roomNo) && r.roomNo.startsWith('42'));
      const s3 = sheetRows.filter(r => !staffRoomIds.includes(r.roomNo) && r.roomNo.startsWith('43'));
      const s4 = sheetRows.filter(r => !staffRoomIds.includes(r.roomNo) && r.roomNo.startsWith('44'));
      const s5 = sheetRows.filter(r => !staffRoomIds.includes(r.roomNo) && r.roomNo.startsWith('45'));

      return [
        {
          id: 'sec_staff',
          label: 'บุคลากร',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำ- ค่าไฟ ของบุคลากรหอพักประภัสสร`,
          topRightLabel: `ประภัสสร ก.ย.69`,
          layoutType: 'electricity_first',
          rows: sStaff,
          totals: calcTotals(sStaff),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_f2',
          label: 'นักศึกษา ชั้น 2',
          headerTitle: `ใบแจ้งหนี้ค่าไฟฟ้าและค่าน้ำประปา หอพักหญิงประภัสสร ชั้น 2`,
          topRightLabel: `ประภัสสร ก.ย.69`,
          layoutType: 'prapassorn_student',
          rows: s2,
          totals: calcTotals(s2),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_f3',
          label: 'นักศึกษา ชั้น 3',
          headerTitle: `ใบแจ้งหนี้ค่าไฟฟ้าและค่าน้ำประปา หอพักหญิงประภัสสร ชั้น 3`,
          topRightLabel: `ประภัสสร ก.ย.69`,
          layoutType: 'prapassorn_student',
          rows: s3,
          totals: calcTotals(s3),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_f4',
          label: 'นักศึกษา ชั้น 4',
          headerTitle: `ใบแจ้งหนี้ค่าไฟฟ้าและค่าน้ำประปา หอพักหญิงประภัสสร ชั้น 4`,
          topRightLabel: `ประภัสสร ก.ย.69`,
          layoutType: 'prapassorn_student',
          rows: s4,
          totals: calcTotals(s4),
          isLast: false,
          signatureColLabel: 'ลายมือชื่อ'
        },
        {
          id: 'sec_f5',
          label: 'นักศึกษา ชั้น 5',
          headerTitle: `ใบแจ้งหนี้ค่าไฟฟ้าและค่าน้ำประปา หอพักหญิงประภัสสร ชั้น 5`,
          topRightLabel: `ประภัสสร ก.ย.69`,
          layoutType: 'prapassorn_student',
          rows: s5,
          totals: calcTotals(s5),
          isLast: true,
          grandTotalLabel: 'รวมทั้งหมด',
          signatureColLabel: 'ลายมือชื่อ'
        }
      ];
    }

    // 4. รัชชประภา (Ratchaprapha) - 2 Pages: R101-R309 (29 rooms) & R310-R410 (11 rooms)
    if (selectedBuildingId === 'ratchaprapha') {
      const s1 = sheetRows.slice(0, 29);
      const s2 = sheetRows.slice(29);

      return [
        {
          id: 'sec_p1',
          label: 'หน้า 1 (R101-R309)',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้าประจำหอพักหญิงรัชชประภา`,
          topRightLabel: `รัชชประภา ก.ย.69`,
          layoutType: 'standard',
          rows: s1,
          totals: calcTotals(s1),
          isLast: false,
          signatureColLabel: 'หมายเหตุ'
        },
        {
          id: 'sec_p2',
          label: 'หน้า 2 (R310-R410)',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้าประจำหอพักหญิงรัชชประภา`,
          topRightLabel: `รัชชประภา ก.ย.69`,
          layoutType: 'standard',
          rows: s2,
          totals: calcTotals(s2),
          isLast: true,
          grandTotalLabel: 'รวมเป็นเงินทั้งสิ้น',
          signatureColLabel: 'หมายเหตุ'
        }
      ];
    }

    // 5. ท่าชนะ (Thachana) - 2 Pages: 101-404 (34 rooms) & 405-410 (6 rooms)
    if (selectedBuildingId === 'thachana') {
      const s1 = sheetRows.slice(0, 34);
      const s2 = sheetRows.slice(34);

      return [
        {
          id: 'sec_p1',
          label: 'หน้า 1 (101-404)',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้าประจำหอพักท่าชนะ`,
          topRightLabel: `หอพักท่าชนะก.ย. 69`,
          layoutType: 'standard',
          rows: s1,
          totals: calcTotals(s1),
          isLast: false,
          signatureColLabel: 'หมายเหตุ'
        },
        {
          id: 'sec_p2',
          label: 'หน้า 2 (405-410)',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้าประจำหอพักท่าชนะ`,
          topRightLabel: `หอพักท่าชนะก.ย. 69`,
          layoutType: 'standard',
          rows: s2,
          totals: calcTotals(s2),
          isLast: true,
          grandTotalLabel: 'รวมทั้งสิ้น',
          signatureColLabel: 'หมายเหตุ'
        }
      ];
    }

    // 6. วิภาวดี (Wiphawadi) - 1 Page (Electricity first layout)
    if (selectedBuildingId === 'wiphawadi') {
      return [
        {
          id: 'sec_all',
          label: 'หน้าเดียว (27 ห้อง)',
          headerTitle: `รายการแจ้งหนี้ค่าน้ำ- ค่าไฟ ของหอพักวิภาวดี`,
          topRightLabel: `วิภาวดี ก.ย.69`,
          layoutType: 'electricity_first',
          rows: sheetRows,
          totals: calcTotals(sheetRows),
          isLast: true,
          grandTotalLabel: 'รวม',
          signatureColLabel: 'ลายมือชื่อ'
        }
      ];
    }

    // 7. ไชยา (Chaiya) - 1 Page (29 rooms)
    return [
      {
        id: 'sec_all',
        label: 'หน้าเดียว (29 ห้อง)',
        headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้า ของนักศึกษาหอพักไชยา`,
        topRightLabel: `ไชยา ก.ย.69`,
        layoutType: 'standard',
        rows: sheetRows,
        totals: calcTotals(sheetRows),
        isLast: true,
        grandTotalLabel: 'รวมทั้งหมด',
        signatureColLabel: 'ลายมือชื่อ'
      }
    ];
  }, [selectedBuildingId, sheetRows]);

  // Download multi-page PDF matching exact official A4 pages
  const handleDownloadPDF = async () => {
    if (!pagesContainerRef.current) return;
    setIsExportingPDF(true);
    try {
      const pageElements = Array.from(
        pagesContainerRef.current.querySelectorAll<HTMLElement>('.pdf-report-page')
      );

      if (pageElements.length === 0) {
        onShowToast('ไม่พบหน้าเอกสารสำหรับส่งออก', 'error');
        return;
      }

      const filename = `รายการแจ้งหนี้ค่าน้ำ-ไฟ_${currentBuilding.name}_${currMonthLabel}`;
      await downloadMultiPagePDF(pageElements, filename);
      onShowToast(`ดาวน์โหลดรายงาน PDF ครบทั้ง ${pageElements.length} หน้า สำเร็จแล้ว!`);
    } catch (err: any) {
      onShowToast(err.message || 'ไม่สามารถสร้างไฟล์ PDF ได้', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Open Image Preview Modal
  const handleOpenImagePreview = async () => {
    if (!pagesContainerRef.current) return;
    setIsExportingImage(true);
    try {
      const firstPage = pagesContainerRef.current.querySelector<HTMLElement>('.pdf-report-page');
      if (!firstPage) return;

      const canvas = await html2canvas(firstPage, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImageUrl(dataUrl);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      onShowToast(err.message || 'ไม่สามารถสร้างรูปภาพตัวอย่างได้', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Direct Download single image (.PNG)
  const handleDownloadImage = async () => {
    if (!pagesContainerRef.current) return;
    setIsExportingImage(true);
    try {
      const firstPage = pagesContainerRef.current.querySelector<HTMLElement>('.pdf-report-page');
      if (!firstPage) return;

      const filename = `รายงานมิเตอร์น้ำไฟ_${currentBuilding.name}_${currMonthLabel}`;
      await downloadElementAsImage(firstPage, filename);
      onShowToast('ดาวน์โหลดรายงานเป็นรูปภาพ (.PNG) สำเร็จแล้ว!');
    } catch (err: any) {
      onShowToast(err.message || 'ไม่สามารถสร้างรูปภาพได้', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!pagesContainerRef.current) return;
    setIsCopyingImage(true);
    try {
      const firstPage = pagesContainerRef.current.querySelector<HTMLElement>('.pdf-report-page');
      if (!firstPage) return;

      await copyElementImageToClipboard(firstPage);
      onShowToast('คัดลอกรูปภาพรายงานแล้ว! สามารถกด Ctrl+V วางใน Line หรือแชทได้ทันที');
    } catch (err: any) {
      onShowToast('กรุณาใช้ปุ่มบันทึกภาพ (.PNG) แทน', 'error');
    } finally {
      setIsCopyingImage(false);
    }
  };

  const getColHeaderLabel = (sec: FloorSection) => {
    if (columnMode === 'signature') return sec.signatureColLabel || 'ลายมือชื่อ';
    if (columnMode === 'remarks') return 'หมายเหตุ';
    return `${sec.signatureColLabel || 'ลายมือชื่อ'} / หมายเหตุ`;
  };

  // Visible sections depending on tab filter
  const visibleSections = activeSectionId === 'ALL_PAGES'
    ? floorSections
    : floorSections.filter(s => s.id === activeSectionId);

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Action Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                รายงานตารางสรุปค่าน้ำประปา-ไฟฟ้า รายอาคาร
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              รูปแบบตารางมาตรฐานทางการตรงตามเอกสารประเมินค่าใช้จ่ายหอพัก (ส่งออกเป็น PDF หลายหน้า หรือรูปภาพความละเอียดสูง)
            </p>
          </div>

          {/* Action Buttons: Image, Multi-Page PDF, Print, Google Sheets & Docs */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* NEW: Jump to Meter Photo Report */}
            {onOpenPhotoReport && (
              <button
                onClick={onOpenPhotoReport}
                className="bg-violet-700 hover:bg-violet-800 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer ring-2 ring-violet-400/30"
                title="เปิดดูรายงานรูปภาพมิเตอร์น้ำ-ไฟฟ้าของอาคารนี้"
              >
                <Camera className="w-4 h-4 text-violet-200" />
                <span>รายงานรูปภาพมิเตอร์</span>
              </button>
            )}

            {/* View Report as Image Modal */}
            <button
              onClick={handleOpenImagePreview}
              disabled={isExportingImage}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/40"
              title="เปิดดูรายงานเป็นรูปภาพความละเอียดสูง พร้อมซูม คัดลอก และดาวน์โหลด"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isExportingImage ? 'กำลังโหลดภาพ...' : 'ดูรายงานเป็นรูปภาพ'}</span>
            </button>

            {/* Download Official Multi-Page PDF (.PDF) */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer ring-2 ring-rose-400/30"
              title="ดาวน์โหลดรายงานเป็นเอกสาร PDF A4 ครบทุกหน้าตามตัวอย่าง"
            >
              <FileText className="w-4 h-4" />
              <span>{isExportingPDF ? 'กำลังสร้าง PDF...' : `ดาวน์โหลด PDF (${floorSections.length} หน้า)`}</span>
            </button>

            {/* Direct Download Image (.PNG) */}
            <button
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="ดาวน์โหลดตารางรายงานเป็นรูปภาพ (.PNG)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>บันทึกภาพ (.PNG)</span>
            </button>

            {/* Copy Image to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={isCopyingImage}
              className="bg-slate-800 hover:bg-slate-900 active:scale-95 disabled:opacity-50 text-white font-medium px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="คัดลอกรูปภาพรายงานลง Clipboard ไปวางใน Line ทันที"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopyingImage ? 'กำลังคัดลอก...' : 'คัดลอกภาพ'}</span>
            </button>

            {/* Print A4 */}
            <button
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 border border-slate-300 transition-all cursor-pointer"
              title="สั่งพิมพ์ออกทางเครื่องพิมพ์"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ (A4)</span>
            </button>

            {/* Google Sheets */}
            <button
              onClick={onExportSheets}
              disabled={isExportingSheets}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExportingSheets ? 'ส่งออก...' : 'Sheets'}</span>
            </button>

            {/* Google Docs */}
            <button
              onClick={onExportDocs}
              disabled={isExportingDocs}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingDocs ? 'สร้าง Docs...' : 'Docs'}</span>
            </button>

          </div>
        </div>

        {/* Building Selector & Options */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              เลือกอาคารพักอาศัย:
            </label>
            <div className="flex flex-wrap gap-2">
              {BUILDINGS_CONFIG.map((b) => {
                const isSelected = b.id === selectedBuildingId;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBuilding(b.id);
                      setActiveSectionId('ALL_PAGES');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-indigo-950 text-white shadow-md ring-2 ring-indigo-400/40'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column Header Label Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center space-x-2 self-start md:self-auto text-xs">
            <span className="text-slate-500 font-medium">คอลัมน์ท้าย:</span>
            <div className="flex bg-slate-200 p-0.5 rounded-lg">
              <button
                onClick={() => setColumnMode('signature')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  columnMode === 'signature'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ลายมือชื่อ (ตามตัวอย่าง PDF)
              </button>
              <button
                onClick={() => setColumnMode('remarks')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  columnMode === 'remarks'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                หมายเหตุ
              </button>
            </div>
          </div>

        </div>

        {/* Multi-Floor Section Tabs */}
        {floorSections.length > 1 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 flex items-center space-x-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>แบ่งตามหน้าเอกสาร ({floorSections.length} หน้า A4):</span>
            </span>

            <button
              onClick={() => setActiveSectionId('ALL_PAGES')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSectionId === 'ALL_PAGES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              แสดงครบทุกหน้า ({floorSections.length} หน้า)
            </button>

            {floorSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSectionId === sec.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec.label} ({sec.rows.length} รายการ)
              </button>
            ))}
          </div>
        )}

      </div>

      {/* RENDERED OFFICIAL REPORT CONTAINER */}
      <div ref={pagesContainerRef} className="space-y-8 font-sans text-slate-900">
        
        {visibleSections.map((sec, secIdx) => (
          <div
            key={sec.id}
            className="pdf-report-page page-break bg-white rounded-2xl shadow-sm border border-slate-300 p-6 sm:p-8 space-y-4 max-w-4xl mx-auto"
            style={{ minHeight: '297mm' }}
          >
            
            {/* Top Right Label (ตรงตามเอกสาร PDF) */}
            <div className="flex justify-between items-start border-b pb-2 border-slate-200">
              <div className="text-[11px] text-slate-500">
                หน้า {secIdx + 1} จาก {visibleSections.length} • มหาวิทยาลัยราชภัฏสุราษฎร์ธานี
              </div>
              <div className="text-xs font-black text-slate-900 tracking-wide bg-slate-100 px-3 py-1 rounded border border-slate-300">
                {sec.topRightLabel}
              </div>
            </div>

            {/* Official Title Headers */}
            <div className="text-center py-1">
              <h1 className="text-base sm:text-lg font-bold tracking-wide text-slate-900">
                {sec.headerTitle}
              </h1>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                ประจำเดือน {monthThai}
              </h2>
            </div>

            {/* Table Rendering based on Layout Type */}
            <div className="overflow-x-auto">
              
              {/* LAYOUT 1: STANDARD (Water first, then Electricity) - Chaiya, Thaphet, Thathong, Ratchaprapha, Thachana */}
              {sec.layoutType === 'standard' && (
                <table className="w-full text-center text-xs border-collapse print-table">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th rowSpan={2} className="p-2 border border-slate-400 w-14 font-bold bg-slate-200/90">
                        ห้อง
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-blue-50/90 text-blue-950">
                        เลขมิเตอร์ค่าน้ำประปา
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-amber-50/90 text-amber-950">
                        เลขมิเตอร์ค่าไฟฟ้า
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-emerald-50/90 text-emerald-950">
                        จำนวนเงิน
                      </th>
                      <th rowSpan={2} className="p-2 border border-slate-400 min-w-[130px] font-bold bg-slate-200/90">
                        {getColHeaderLabel(sec)}
                      </th>
                    </tr>
                    <tr className="bg-slate-100 text-slate-800 font-semibold">
                      {/* Water Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-16 bg-blue-50/50">{prevMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-16 bg-blue-50/50">{currMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-14 bg-blue-100/70 text-blue-950 font-bold">จำนวนใช้</th>

                      {/* Electricity Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-16 bg-amber-50/50">{prevMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-16 bg-amber-50/50">{currMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-14 bg-amber-100/70 text-amber-950 font-bold">จำนวนใช้</th>

                      {/* Amount Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-50/50">ค่าน้ำประปา</th>
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-50/50">ค่าไฟฟ้า</th>
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-100 text-emerald-950 font-black">รวมเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {sec.rows.map((r) => (
                      <tr key={r.roomId} className="hover:bg-indigo-50/40 transition-colors">
                        <td
                          onClick={() => onEditRoom(r.roomId)}
                          className="p-1.5 font-bold text-slate-900 border border-slate-300 bg-slate-50/80 cursor-pointer hover:text-blue-600 hover:underline"
                        >
                          {r.roomNo}
                        </td>

                        {/* Water Readings */}
                        <td className="p-1.5 border border-slate-300 text-slate-700">{r.waterPrev || 0}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-900 font-medium">{r.waterCurr || 0}</td>
                        <td className="p-1.5 border border-slate-300 font-bold text-blue-900 bg-blue-50/40">{r.waterUnits || 0}</td>

                        {/* Electricity Readings */}
                        <td className="p-1.5 border border-slate-300 text-slate-700">{r.elecPrev || 0}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-900 font-medium">{r.elecCurr || 0}</td>
                        <td className="p-1.5 border border-slate-300 font-bold text-amber-900 bg-amber-50/40">{r.elecUnits || 0}</td>

                        {/* Costs */}
                        <td className="p-1.5 border border-slate-300 text-right font-medium text-slate-800">{formatCurrency(r.waterCost)}</td>
                        <td className="p-1.5 border border-slate-300 text-right font-medium text-slate-800">{formatCurrency(r.elecCost)}</td>
                        <td className="p-1.5 border border-slate-300 text-right font-black text-slate-900 bg-emerald-50/50">{formatCurrency(r.totalAmount)}</td>

                        {/* Remarks */}
                        <td className="p-1 border border-slate-300 text-center font-medium">
                          <input
                            type="text"
                            defaultValue={r.remark}
                            onBlur={(e) => onUpdateRemark(r.roomId, e.target.value)}
                            placeholder="ระบุข้อความ..."
                            className="w-full bg-transparent px-1.5 py-1 text-xs text-center focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded text-slate-800"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Subtotal Footer */}
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                    <tr>
                      <td className="p-2 border border-slate-400 font-black">รวม</td>
                      <td className="p-2 border border-slate-400 font-bold text-slate-700">หน่วยน้ำ</td>
                      <td className="p-2 border border-slate-400 text-blue-900 font-black text-sm">{formatCurrency(sec.totals.waterUnits)}</td>
                      <td className="p-2 border border-slate-400 font-bold text-slate-700">หน่วยไฟ</td>
                      <td className="p-2 border border-slate-400 text-amber-900 font-black text-sm">{formatCurrency(sec.totals.elecUnits)}</td>
                      <td className="p-2 border border-slate-400 text-slate-400"></td>
                      <td className="p-2 border border-slate-400 text-right text-blue-950 font-black">{formatCurrency(sec.totals.waterCost)}</td>
                      <td className="p-2 border border-slate-400 text-right text-amber-950 font-black">{formatCurrency(sec.totals.elecCost)}</td>
                      <td className="p-2 border border-slate-400 text-right text-emerald-950 font-black text-sm bg-emerald-100">{formatCurrency(sec.totals.totalAmount)}</td>
                      <td className="p-2 border border-slate-400"></td>
                    </tr>

                    {/* Grand Total Row */}
                    {sec.isLast && (
                      <tr className="bg-slate-200/90 border-t-2 border-slate-600">
                        <td colSpan={6} className="p-2.5 border border-slate-400 text-right font-black text-sm text-slate-900">
                          {sec.grandTotalLabel || 'รวมเงินทั้งหมด'}
                        </td>
                        <td className="p-2.5 border border-slate-400 text-right text-blue-950 font-black text-sm">{formatCurrency(sheetTotals.waterCost)}</td>
                        <td className="p-2.5 border border-slate-400 text-right text-amber-950 font-black text-sm">{formatCurrency(sheetTotals.elecCost)}</td>
                        <td className="p-2.5 border border-slate-400 text-right text-emerald-950 font-black text-base bg-emerald-200/80">{formatCurrency(sheetTotals.totalAmount)}</td>
                        <td className="p-2.5 border border-slate-400"></td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              )}

              {/* LAYOUT 2: ELECTRICITY FIRST (Elec -> Water -> Amount) - Wiphawadi & Prapassorn Staff */}
              {sec.layoutType === 'electricity_first' && (
                <table className="w-full text-center text-xs border-collapse print-table">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th rowSpan={2} className="p-2 border border-slate-400 w-14 font-bold bg-slate-200/90">
                        ห้อง
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-amber-50/90 text-amber-950">
                        เลขมิเตอร์ค่าไฟฟ้า
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-blue-50/90 text-blue-950">
                        เลขมิเตอร์ค่าน้ำประปา
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-emerald-50/90 text-emerald-950">
                        จำนวนเงิน
                      </th>
                      <th rowSpan={2} className="p-2 border border-slate-400 min-w-[130px] font-bold bg-slate-200/90">
                        {getColHeaderLabel(sec)}
                      </th>
                    </tr>
                    <tr className="bg-slate-100 text-slate-800 font-semibold">
                      {/* Electricity Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-16 bg-amber-50/50">{prevMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-16 bg-amber-50/50">{currMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-14 bg-amber-100/70 text-amber-950 font-bold">จำนวนใช้</th>

                      {/* Water Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-16 bg-blue-50/50">{prevMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-16 bg-blue-50/50">{currMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-14 bg-blue-100/70 text-blue-950 font-bold">จำนวนใช้</th>

                      {/* Amount Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-50/50">ค่าไฟฟ้า</th>
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-50/50">ค่าน้ำประปา</th>
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-100 text-emerald-950 font-black">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {sec.rows.map((r) => (
                      <tr key={r.roomId} className="hover:bg-indigo-50/40 transition-colors">
                        <td
                          onClick={() => onEditRoom(r.roomId)}
                          className="p-1.5 font-bold text-slate-900 border border-slate-300 bg-slate-50/80 cursor-pointer hover:text-blue-600 hover:underline"
                        >
                          {r.roomNo}
                        </td>

                        {/* Electricity Readings */}
                        <td className="p-1.5 border border-slate-300 text-slate-700">{r.elecPrev || 0}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-900 font-medium">{r.elecCurr || 0}</td>
                        <td className="p-1.5 border border-slate-300 font-bold text-amber-900 bg-amber-50/40">{r.elecUnits || 0}</td>

                        {/* Water Readings */}
                        <td className="p-1.5 border border-slate-300 text-slate-700">{r.waterPrev || 0}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-900 font-medium">{r.waterCurr || 0}</td>
                        <td className="p-1.5 border border-slate-300 font-bold text-blue-900 bg-blue-50/40">{r.waterUnits || 0}</td>

                        {/* Costs */}
                        <td className="p-1.5 border border-slate-300 text-right font-medium text-slate-800">{formatCurrency(r.elecCost)}</td>
                        <td className="p-1.5 border border-slate-300 text-right font-medium text-slate-800">{formatCurrency(r.waterCost)}</td>
                        <td className="p-1.5 border border-slate-300 text-right font-black text-slate-900 bg-emerald-50/50">{formatCurrency(r.totalAmount)}</td>

                        {/* Remarks */}
                        <td className="p-1 border border-slate-300 text-center font-medium">
                          <input
                            type="text"
                            defaultValue={r.remark}
                            onBlur={(e) => onUpdateRemark(r.roomId, e.target.value)}
                            placeholder="ระบุข้อความ..."
                            className="w-full bg-transparent px-1.5 py-1 text-xs text-center focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded text-slate-800"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Subtotal Footer */}
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                    <tr>
                      <td colSpan={7} className="p-2 border border-slate-400 text-right font-black">
                        รวม
                      </td>
                      <td className="p-2 border border-slate-400 text-right text-amber-950 font-black">{formatCurrency(sec.totals.elecCost)}</td>
                      <td className="p-2 border border-slate-400 text-right text-blue-950 font-black">{formatCurrency(sec.totals.waterCost)}</td>
                      <td className="p-2 border border-slate-400 text-right text-emerald-950 font-black text-sm bg-emerald-100">{formatCurrency(sec.totals.totalAmount)}</td>
                      <td className="p-2 border border-slate-400"></td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {/* LAYOUT 3: PRAPASSORN STUDENTS (Elec -> Water rate 100/occupants -> Amount) */}
              {sec.layoutType === 'prapassorn_student' && (
                <table className="w-full text-center text-xs border-collapse print-table">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900">
                      <th rowSpan={2} className="p-2 border border-slate-400 w-14 font-bold bg-slate-200/90">
                        ห้อง
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-amber-50/90 text-amber-950">
                        ค่าไฟฟ้า
                      </th>
                      <th colSpan={2} className="p-1.5 border border-slate-400 font-bold bg-blue-50/90 text-blue-950">
                        ค่าน้ำประปา
                      </th>
                      <th colSpan={3} className="p-1.5 border border-slate-400 font-bold bg-emerald-50/90 text-emerald-950">
                        จำนวนเงิน
                      </th>
                      <th rowSpan={2} className="p-2 border border-slate-400 min-w-[130px] font-bold bg-slate-200/90">
                        {getColHeaderLabel(sec)}
                      </th>
                    </tr>
                    <tr className="bg-slate-100 text-slate-800 font-semibold">
                      {/* Electricity Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-16 bg-amber-50/50">{prevMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-16 bg-amber-50/50">{currMonthLabel}</th>
                      <th className="p-1.5 border border-slate-400 w-14 bg-amber-100/70 text-amber-950 font-bold">จำนวนใช้</th>

                      {/* Water Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-16 bg-blue-50/50">อัตรา/คน</th>
                      <th className="p-1.5 border border-slate-400 w-16 bg-blue-100/70 text-blue-950 font-bold">จำนวนคน</th>

                      {/* Amount Subheaders */}
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-50/50">ค่าไฟฟ้า</th>
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-50/50">ค่าน้ำประปา</th>
                      <th className="p-1.5 border border-slate-400 w-20 bg-emerald-100 text-emerald-950 font-black">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {sec.rows.map((r) => (
                      <tr key={r.roomId} className="hover:bg-indigo-50/40 transition-colors">
                        <td
                          onClick={() => onEditRoom(r.roomId)}
                          className="p-1.5 font-bold text-slate-900 border border-slate-300 bg-slate-50/80 cursor-pointer hover:text-blue-600 hover:underline"
                        >
                          {r.roomNo}
                        </td>

                        {/* Electricity Readings */}
                        <td className="p-1.5 border border-slate-300 text-slate-700">{r.elecPrev || 0}</td>
                        <td className="p-1.5 border border-slate-300 text-slate-900 font-medium">{r.elecCurr || 0}</td>
                        <td className="p-1.5 border border-slate-300 font-bold text-amber-900 bg-amber-50/40">{r.elecUnits || 0}</td>

                        {/* Water Flat Rate */}
                        <td className="p-1.5 border border-slate-300 text-slate-700">100</td>
                        <td className="p-1.5 border border-slate-300 font-bold text-blue-900 bg-blue-50/40">{r.occupants ?? 1}</td>

                        {/* Costs */}
                        <td className="p-1.5 border border-slate-300 text-right font-medium text-slate-800">{formatCurrency(r.elecCost)}</td>
                        <td className="p-1.5 border border-slate-300 text-right font-medium text-slate-800">{formatCurrency(r.waterCost)}</td>
                        <td className="p-1.5 border border-slate-300 text-right font-black text-slate-900 bg-emerald-50/50">{formatCurrency(r.totalAmount)}</td>

                        {/* Remarks */}
                        <td className="p-1 border border-slate-300 text-center font-medium">
                          <input
                            type="text"
                            defaultValue={r.remark}
                            onBlur={(e) => onUpdateRemark(r.roomId, e.target.value)}
                            placeholder="ระบุข้อความ..."
                            className="w-full bg-transparent px-1.5 py-1 text-xs text-center focus:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded text-slate-800"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Subtotal Footer */}
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                    <tr>
                      <td colSpan={5} className="p-2 border border-slate-400 text-right font-black">
                        รวม
                      </td>
                      <td className="p-2 border border-slate-400 text-blue-900 font-black text-sm">
                        {sec.totals.totalOccupants > 0 ? sec.totals.totalOccupants : ''}
                      </td>
                      <td className="p-2 border border-slate-400 text-right text-amber-950 font-black">{formatCurrency(sec.totals.elecCost)}</td>
                      <td className="p-2 border border-slate-400 text-right text-blue-950 font-black">{formatCurrency(sec.totals.waterCost)}</td>
                      <td className="p-2 border border-slate-400 text-right text-emerald-950 font-black text-sm bg-emerald-100">{formatCurrency(sec.totals.totalAmount)}</td>
                      <td className="p-2 border border-slate-400"></td>
                    </tr>

                    {/* Grand Total Row on Page 5 */}
                    {sec.isLast && (
                      <tr className="bg-slate-200/90 border-t-2 border-slate-600">
                        <td colSpan={6} className="p-2.5 border border-slate-400 text-right font-black text-sm text-slate-900">
                          {sec.grandTotalLabel || 'รวมทั้งหมด'}
                        </td>
                        <td className="p-2.5 border border-slate-400 text-right text-amber-950 font-black text-sm">{formatCurrency(sheetTotals.elecCost)}</td>
                        <td className="p-2.5 border border-slate-400 text-right text-blue-950 font-black text-sm">{formatCurrency(sheetTotals.waterCost)}</td>
                        <td className="p-2.5 border border-slate-400 text-right text-emerald-950 font-black text-base bg-emerald-200/80">{formatCurrency(sheetTotals.totalAmount)}</td>
                        <td className="p-2.5 border border-slate-400"></td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* High-Resolution Image Preview Lightbox Modal */}
      <ImagePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        imageDataUrl={previewImageUrl}
        buildingName={currentBuilding.name}
        monthLabel={currMonthLabel}
        onDownloadPDF={handleDownloadPDF}
        onCopyClipboard={() => onShowToast('คัดลอกรูปภาพรายงานแล้ว!')}
      />

    </div>
  );
};
