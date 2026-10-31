import React, { useMemo } from 'react';
import { SheetRowData, SheetTotals, MeterRecord, DormSettings } from '../types';
import { formatCurrency, formatThaiMonthYear, getShortThaiMonthYear, getPrevShortThaiMonthYear } from '../utils/thaiDate';
import { TableLayoutType, FloorSection } from './BuildingSheetTab';

interface PrintLayoutsProps {
  printMode: 'sheet' | 'summary' | 'invoices';
  selectedMonth: string;
  buildingName: string;
  sheetRows: SheetRowData[];
  sheetTotals: SheetTotals;
  invoicesToPrint: MeterRecord[];
  settings: DormSettings;
  monthlyBuildingStats: {
    id: string;
    name: string;
    total: number;
    recorded: number;
    waterUnits: number;
    waterCost: number;
    elecUnits: number;
    elecCost: number;
    totalCost: number;
  }[];
  monthlyAnalytics: {
    totalRevenue: number;
    waterRevenue: number;
    elecRevenue: number;
    waterUnits: number;
    elecUnits: number;
    completionPercentage: string;
  };
}

export const PrintLayouts: React.FC<PrintLayoutsProps> = ({
  printMode,
  selectedMonth,
  buildingName,
  sheetRows,
  sheetTotals,
  invoicesToPrint,
  settings,
  monthlyBuildingStats,
  monthlyAnalytics
}) => {
  const prevMonthLabel = getPrevShortThaiMonthYear(selectedMonth);
  const currMonthLabel = getShortThaiMonthYear(selectedMonth);
  const monthThai = formatThaiMonthYear(selectedMonth);

  const calcTotals = (rows: SheetRowData[]): SheetTotals & { totalOccupants: number } => ({
    waterUnits: rows.reduce((s, r) => s + (r.waterUnits || 0), 0),
    elecUnits: rows.reduce((s, r) => s + (r.elecUnits || 0), 0),
    waterCost: rows.reduce((s, r) => s + (r.waterCost || 0), 0),
    elecCost: rows.reduce((s, r) => s + (r.elecCost || 0), 0),
    totalAmount: rows.reduce((s, r) => s + (r.totalAmount || 0), 0),
    totalOccupants: rows.reduce((s, r) => s + (r.occupants || 0), 0)
  });

  // Group into floor sections matching the user's official PDF
  const floorSections = useMemo<FloorSection[]>(() => {
    // 1. ท่าเพชร
    if (buildingName.includes('ท่าเพชร')) {
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

    // 2. ท่าทอง
    if (buildingName.includes('ท่าทอง')) {
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

    // 3. ประภัสสร
    if (buildingName.includes('ประภัสสร')) {
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

    // 4. รัชชประภา
    if (buildingName.includes('รัชชประภา')) {
      const s1 = sheetRows.slice(0, 29);
      const s2 = sheetRows.slice(29);
      return [
        {
          id: 'sec_p1',
          label: 'หน้า 1',
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
          label: 'หน้า 2',
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

    // 5. ท่าชนะ
    if (buildingName.includes('ท่าชนะ')) {
      const s1 = sheetRows.slice(0, 34);
      const s2 = sheetRows.slice(34);
      return [
        {
          id: 'sec_p1',
          label: 'หน้า 1',
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
          label: 'หน้า 2',
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

    // 6. วิภาวดี
    if (buildingName.includes('วิภาวดี')) {
      return [
        {
          id: 'sec_all',
          label: 'หน้าเดียว',
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

    // 7. ไชยา
    return [
      {
        id: 'sec_all',
        label: 'หน้าเดียว',
        headerTitle: `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้า ของนักศึกษาหอพัก${buildingName}`,
        topRightLabel: `${buildingName} ก.ย.69`,
        layoutType: 'standard',
        rows: sheetRows,
        totals: calcTotals(sheetRows),
        isLast: true,
        grandTotalLabel: 'รวมทั้งหมด',
        signatureColLabel: 'ลายมือชื่อ'
      }
    ];
  }, [buildingName, sheetRows]);

  return (
    <div className="print-only">
      
      {/* 1. OFFICIAL BUILDING SHEET MULTI-PAGE PRINT LAYOUT (A4) */}
      {printMode === 'sheet' && (
        <div>
          {floorSections.map((sec, secIdx) => (
            <div key={sec.id} className="page-break max-w-4xl mx-auto font-sans p-2">
              
              {/* Top Right Label */}
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>หน้า {secIdx + 1} จาก {floorSections.length}</span>
                <span>{sec.topRightLabel}</span>
              </div>

              {/* Title Header */}
              <div className="text-center mb-4">
                <h1 className="text-base font-bold tracking-wide">
                  {sec.headerTitle}
                </h1>
                <h2 className="text-sm font-bold mt-0.5">
                  ประจำเดือน {monthThai}
                </h2>
              </div>

              {/* Standard Layout */}
              {sec.layoutType === 'standard' && (
                <table className="w-full text-center text-xs print-table">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="py-1 px-1 w-12 font-bold">ห้อง</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">เลขมิเตอร์ค่าน้ำประปา</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">เลขมิเตอร์ค่าไฟฟ้า</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">จำนวนเงิน</th>
                      <th rowSpan={2} className="py-1 px-1 w-28 font-bold">{sec.signatureColLabel || 'ลายมือชื่อ'}</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="py-0.5 px-1 w-14 font-semibold">{prevMonthLabel}</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{currMonthLabel}</th>
                      <th className="py-0.5 px-1 w-12 font-bold">จำนวนใช้</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{prevMonthLabel}</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{currMonthLabel}</th>
                      <th className="py-0.5 px-1 w-12 font-bold">จำนวนใช้</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">ค่าน้ำประปา</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">ค่าไฟฟ้า</th>
                      <th className="py-0.5 px-1 w-16 font-bold">รวมเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.rows.map((r) => (
                      <tr key={r.roomNo}>
                        <td className="py-1 px-1 font-bold">{r.roomNo}</td>
                        <td className="py-1 px-1">{r.waterPrev || 0}</td>
                        <td className="py-1 px-1 font-medium">{r.waterCurr || 0}</td>
                        <td className="py-1 px-1 font-bold">{r.waterUnits || 0}</td>
                        <td className="py-1 px-1">{r.elecPrev || 0}</td>
                        <td className="py-1 px-1 font-medium">{r.elecCurr || 0}</td>
                        <td className="py-1 px-1 font-bold">{r.elecUnits || 0}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(r.waterCost)}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(r.elecCost)}</td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(r.totalAmount)}</td>
                        <td className="py-1 px-1 text-center text-[11px]">{r.remark || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="font-bold bg-slate-50">
                    <tr>
                      <td className="py-1.5 px-1 font-black">รวม</td>
                      <td className="py-1 px-1">หน่วยน้ำ</td>
                      <td className="py-1 px-1 font-black">{formatCurrency(sec.totals.waterUnits)}</td>
                      <td className="py-1 px-1">หน่วยไฟ</td>
                      <td className="py-1 px-1 font-black">{formatCurrency(sec.totals.elecUnits)}</td>
                      <td className="py-1 px-1"></td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.waterCost)}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.elecCost)}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.totalAmount)}</td>
                      <td className="py-1 px-1"></td>
                    </tr>
                    {sec.isLast && (
                      <tr className="bg-slate-200 border-t-2 border-slate-600">
                        <td colSpan={6} className="py-1.5 px-1 text-right font-black">
                          {sec.grandTotalLabel || 'รวมเงินทั้งหมด'}
                        </td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(sheetTotals.waterCost)}</td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(sheetTotals.elecCost)}</td>
                        <td className="py-1 px-1 text-right font-black text-sm">{formatCurrency(sheetTotals.totalAmount)}</td>
                        <td className="py-1 px-1"></td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              )}

              {/* Electricity First Layout */}
              {sec.layoutType === 'electricity_first' && (
                <table className="w-full text-center text-xs print-table">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="py-1 px-1 w-12 font-bold">ห้อง</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">เลขมิเตอร์ค่าไฟฟ้า</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">เลขมิเตอร์ค่าน้ำประปา</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">จำนวนเงิน</th>
                      <th rowSpan={2} className="py-1 px-1 w-28 font-bold">{sec.signatureColLabel || 'ลายมือชื่อ'}</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="py-0.5 px-1 w-14 font-semibold">{prevMonthLabel}</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{currMonthLabel}</th>
                      <th className="py-0.5 px-1 w-12 font-bold">จำนวนใช้</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{prevMonthLabel}</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{currMonthLabel}</th>
                      <th className="py-0.5 px-1 w-12 font-bold">จำนวนใช้</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">ค่าไฟฟ้า</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">ค่าน้ำประปา</th>
                      <th className="py-0.5 px-1 w-16 font-bold">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.rows.map((r) => (
                      <tr key={r.roomNo}>
                        <td className="py-1 px-1 font-bold">{r.roomNo}</td>
                        <td className="py-1 px-1">{r.elecPrev || 0}</td>
                        <td className="py-1 px-1 font-medium">{r.elecCurr || 0}</td>
                        <td className="py-1 px-1 font-bold">{r.elecUnits || 0}</td>
                        <td className="py-1 px-1">{r.waterPrev || 0}</td>
                        <td className="py-1 px-1 font-medium">{r.waterCurr || 0}</td>
                        <td className="py-1 px-1 font-bold">{r.waterUnits || 0}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(r.elecCost)}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(r.waterCost)}</td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(r.totalAmount)}</td>
                        <td className="py-1 px-1 text-center text-[11px]">{r.remark || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="font-bold bg-slate-50">
                    <tr>
                      <td colSpan={7} className="py-1.5 px-1 text-right font-black">รวม</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.elecCost)}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.waterCost)}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.totalAmount)}</td>
                      <td className="py-1 px-1"></td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {/* Prapassorn Students Layout */}
              {sec.layoutType === 'prapassorn_student' && (
                <table className="w-full text-center text-xs print-table">
                  <thead>
                    <tr className="bg-slate-100">
                      <th rowSpan={2} className="py-1 px-1 w-12 font-bold">ห้อง</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">ค่าไฟฟ้า</th>
                      <th colSpan={2} className="py-1 px-1 font-bold">ค่าน้ำประปา</th>
                      <th colSpan={3} className="py-1 px-1 font-bold">จำนวนเงิน</th>
                      <th rowSpan={2} className="py-1 px-1 w-28 font-bold">{sec.signatureColLabel || 'ลายมือชื่อ'}</th>
                    </tr>
                    <tr className="bg-slate-100">
                      <th className="py-0.5 px-1 w-14 font-semibold">{prevMonthLabel}</th>
                      <th className="py-0.5 px-1 w-14 font-semibold">{currMonthLabel}</th>
                      <th className="py-0.5 px-1 w-12 font-bold">จำนวนใช้</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">อัตรา/คน</th>
                      <th className="py-0.5 px-1 w-16 font-bold">จำนวนคน</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">ค่าไฟฟ้า</th>
                      <th className="py-0.5 px-1 w-16 font-semibold">ค่าน้ำประปา</th>
                      <th className="py-0.5 px-1 w-16 font-bold">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.rows.map((r) => (
                      <tr key={r.roomNo}>
                        <td className="py-1 px-1 font-bold">{r.roomNo}</td>
                        <td className="py-1 px-1">{r.elecPrev || 0}</td>
                        <td className="py-1 px-1 font-medium">{r.elecCurr || 0}</td>
                        <td className="py-1 px-1 font-bold">{r.elecUnits || 0}</td>
                        <td className="py-1 px-1">100</td>
                        <td className="py-1 px-1 font-bold">{r.occupants ?? 1}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(r.elecCost)}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(r.waterCost)}</td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(r.totalAmount)}</td>
                        <td className="py-1 px-1 text-center text-[11px]">{r.remark || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="font-bold bg-slate-50">
                    <tr>
                      <td colSpan={5} className="py-1.5 px-1 text-right font-black">รวม</td>
                      <td className="py-1 px-1 text-blue-900 font-black">{sec.totals.totalOccupants > 0 ? sec.totals.totalOccupants : ''}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.elecCost)}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.waterCost)}</td>
                      <td className="py-1 px-1 text-right font-black">{formatCurrency(sec.totals.totalAmount)}</td>
                      <td className="py-1 px-1"></td>
                    </tr>
                    {sec.isLast && (
                      <tr className="bg-slate-200 border-t-2 border-slate-600">
                        <td colSpan={6} className="py-1.5 px-1 text-right font-black">
                          {sec.grandTotalLabel || 'รวมทั้งหมด'}
                        </td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(sheetTotals.elecCost)}</td>
                        <td className="py-1 px-1 text-right font-black">{formatCurrency(sheetTotals.waterCost)}</td>
                        <td className="py-1 px-1 text-right font-black text-sm">{formatCurrency(sheetTotals.totalAmount)}</td>
                        <td className="py-1 px-1"></td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              )}

            </div>
          ))}
        </div>
      )}

      {/* 2. MONTHLY SUMMARY REPORT PRINT LAYOUT */}
      {printMode === 'summary' && (
        <div className="p-8 max-w-4xl mx-auto font-sans">
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
            <h1 className="text-2xl font-black">รายงานสรุปค่าสาธารณูปโภคประจำเดือน</h1>
            <p className="text-sm text-slate-600 mt-1">ประจำเดือน {monthThai}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center my-6">
            <div className="border border-slate-400 p-3 rounded-xl bg-slate-50">
              <span className="text-xs text-slate-500 block">รายได้ค่าน้ำประปารวม</span>
              <span className="text-lg font-bold text-slate-900">
                ฿{formatCurrency(monthlyAnalytics.waterRevenue)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ({formatCurrency(monthlyAnalytics.waterUnits)} หน่วย)
              </span>
            </div>
            <div className="border border-slate-400 p-3 rounded-xl bg-slate-50">
              <span className="text-xs text-slate-500 block">รายได้ค่าไฟฟ้ารวม</span>
              <span className="text-lg font-bold text-slate-900">
                ฿{formatCurrency(monthlyAnalytics.elecRevenue)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ({formatCurrency(monthlyAnalytics.elecUnits)} หน่วย)
              </span>
            </div>
            <div className="border border-slate-800 p-3 rounded-xl bg-slate-900 text-white">
              <span className="text-xs text-slate-300 block">รายได้รวมทั้งสิ้น</span>
              <span className="text-xl font-black">
                ฿{formatCurrency(monthlyAnalytics.totalRevenue)}
              </span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse my-6 print-table">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold">
                <th className="py-2 px-2">ชื่ออาคาร</th>
                <th className="py-2 px-2 text-center">จดเสร็จ</th>
                <th className="py-2 px-2 text-right">หน่วยน้ำ</th>
                <th className="py-2 px-2 text-right">ค่าน้ำ (บาท)</th>
                <th className="py-2 px-2 text-right">หน่วยไฟ</th>
                <th className="py-2 px-2 text-right">ค่าไฟ (บาท)</th>
                <th className="py-2 px-2 text-right">ยอดรวม (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {monthlyBuildingStats.map((b) => (
                <tr key={b.id}>
                  <td className="py-2 px-2 font-bold">หอพัก{b.name}</td>
                  <td className="py-2 px-2 text-center">{b.recorded}/{b.total}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(b.waterUnits)}</td>
                  <td className="py-2 px-2 text-right">฿{formatCurrency(b.waterCost)}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(b.elecUnits)}</td>
                  <td className="py-2 px-2 text-right">฿{formatCurrency(b.elecCost)}</td>
                  <td className="py-2 px-2 text-right font-bold">฿{formatCurrency(b.totalCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-black">
              <tr>
                <td className="py-2 px-2">รวมทั้งสิ้น</td>
                <td className="py-2 px-2 text-center">ความคืบหน้า {monthlyAnalytics.completionPercentage}%</td>
                <td className="py-2 px-2 text-right">{formatCurrency(monthlyAnalytics.waterUnits)}</td>
                <td className="py-2 px-2 text-right">฿{formatCurrency(monthlyAnalytics.waterRevenue)}</td>
                <td className="py-2 px-2 text-right">{formatCurrency(monthlyAnalytics.elecUnits)}</td>
                <td className="py-2 px-2 text-right">฿{formatCurrency(monthlyAnalytics.elecRevenue)}</td>
                <td className="py-2 px-2 text-right text-sm">฿{formatCurrency(monthlyAnalytics.totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="pt-16 grid grid-cols-2 gap-12 text-xs text-center">
            <div>
              <div className="border-b border-slate-500 h-10 mb-1 w-48 mx-auto"></div>
              <span className="font-bold">เจ้าหน้าที่ผู้จัดทำรายงาน</span>
              <p className="text-[10px] text-slate-500 mt-0.5">งานบริหารหอพักนักศึกษา</p>
            </div>
            <div>
              <div className="border-b border-slate-500 h-10 mb-1 w-48 mx-auto"></div>
              <span className="font-bold">หัวหน้างานบริหารหอพัก / ผู้อนุมัติ</span>
              <p className="text-[10px] text-slate-500 mt-0.5">กองกิจการนักศึกษา</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. INVOICES BATCH / SINGLE PRINT LAYOUT */}
      {printMode === 'invoices' && (
        <div>
          {invoicesToPrint.map((rec) => (
            <div key={rec.roomId} className="page-break p-8 max-w-2xl mx-auto font-sans">
              <div className="border-2 border-slate-900 p-6 rounded-2xl space-y-4">
                
                <div className="text-center pb-3 border-b-2 border-slate-900">
                  <h2 className="text-2xl font-black">ใบแจ้งหนี้ค่าน้ำประปา - ค่าไฟฟ้า</h2>
                  <p className="text-sm text-slate-600 mt-0.5">ประจำเดือน {monthThai}</p>
                </div>

                <div className="grid grid-cols-2 text-sm font-bold py-2 border-b border-slate-300">
                  <div>อาคาร: หอพัก{rec.buildingName} (ชั้น {rec.floor})</div>
                  <div className="text-right">ห้องพักเลขที่: {rec.roomNo}</div>
                </div>

                <table className="w-full text-left text-xs border-collapse my-4 print-table">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold">
                      <th className="py-2 px-2">รายการ</th>
                      <th className="py-2 px-2 text-center">มิเตอร์เดิม</th>
                      <th className="py-2 px-2 text-center">มิเตอร์ใหม่</th>
                      <th className="py-2 px-2 text-center">หน่วยที่ใช้</th>
                      <th className="py-2 px-2 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    <tr>
                      <td className="py-2 px-2 font-medium">
                        ค่าน้ำประปา ({rec.waterType === 'flat_per_person' ? `เหมา ${rec.occupants} คน` : `หน่วยละ ${settings.defaultWaterRate} บ.`})
                      </td>
                      <td className="py-2 px-2 text-center">
                        {rec.waterType === 'flat_per_person' ? '-' : rec.waterPrev}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {rec.waterType === 'flat_per_person' ? '-' : rec.waterCurr}
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        {rec.waterType === 'flat_per_person' ? `${rec.occupants} คน` : rec.waterUnits}
                      </td>
                      <td className="py-2 px-2 text-right font-bold">
                        ฿{formatCurrency(rec.waterCost)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-medium">
                        ค่าไฟฟ้า (หน่วยละ {settings.defaultElecRate} บ.)
                      </td>
                      <td className="py-2 px-2 text-center">{rec.elecPrev}</td>
                      <td className="py-2 px-2 text-center">{rec.elecCurr}</td>
                      <td className="py-2 px-2 text-center font-bold">{rec.elecUnits}</td>
                      <td className="py-2 px-2 text-right font-bold">
                        ฿{formatCurrency(rec.elecCost)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {rec.remark && (
                  <div className="text-xs bg-slate-50 p-2 border border-slate-300 rounded font-medium">
                    หมายเหตุ: {rec.remark}
                  </div>
                )}

                <div className="bg-slate-100 p-3.5 rounded-lg flex justify-between items-center font-black text-base border border-slate-400">
                  <span>ยอดรวมทั้งสิ้นที่ต้องชำระ:</span>
                  <span className="text-xl">฿{formatCurrency(rec.totalAmount)}</span>
                </div>

                <div className="pt-10 grid grid-cols-2 gap-12 text-xs text-center">
                  <div>
                    <div className="border-b border-slate-400 h-10 mb-1 w-36 mx-auto"></div>
                    <span>เจ้าหน้าที่จดมิเตอร์</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 h-10 mb-1 w-36 mx-auto"></div>
                    <span>ผู้รับใบแจ้งหนี้</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
