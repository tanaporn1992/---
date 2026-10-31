/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { BUILDINGS_CONFIG, MASTER_ROOMS } from './data/buildings';
import { MeterRecord, DormSettings, SheetRowData, SheetTotals, CalendarEventSummary } from './types';
import {
  DEFAULT_SETTINGS,
  loadStoredSettings,
  saveStoredSettings,
  loadAllRecords,
  saveAllRecords,
  generateSeedData
} from './services/storage';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from './services/firebaseAuth';
import {
  exportBuildingToGoogleSheets,
  exportSummaryToGoogleDocs,
  listDormCalendarEvents,
  createDormCalendarEvent
} from './services/googleWorkspace';
import {
  formatThaiMonthYear,
  getShortThaiMonthYear,
  getPrevShortThaiMonthYear,
  getPreviousMonthKey
} from './utils/thaiDate';

import { Header } from './components/Header';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { BuildingSheetTab } from './components/BuildingSheetTab';
import { MeterPhotoReportTab } from './components/MeterPhotoReportTab';
import { RoomGridTab } from './components/RoomGridTab';
import { WalkthroughTab } from './components/WalkthroughTab';
import { MonthlyReportTab } from './components/MonthlyReportTab';
import { InvoicesTab } from './components/InvoicesTab';
import { WorkspaceTab } from './components/WorkspaceTab';
import { SettingsTab } from './components/SettingsTab';
import { RecordModal } from './components/RecordModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PrintLayouts } from './components/PrintLayouts';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  // Current Month State (e.g. 2026-09 matching user's official PDF)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [currentTab, setCurrentTab] = useState<TabKey>('buildingSheet');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('chaiya');

  // Master records database
  const [dbRecords, setDbRecords] = useState<Record<string, Record<string, MeterRecord>>>({});
  const [settings, setSettings] = useState<DormSettings>(DEFAULT_SETTINGS);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Workspace URLs and Data
  const [lastCreatedSheetUrl, setLastCreatedSheetUrl] = useState<string | null>(null);
  const [lastCreatedDocUrl, setLastCreatedDocUrl] = useState<string | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState<boolean>(false);
  const [isExportingDocs, setIsExportingDocs] = useState<boolean>(false);

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventSummary[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState<boolean>(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  // Modals State
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [viewingInvoiceRecord, setViewingInvoiceRecord] = useState<MeterRecord | null>(null);

  // Workspace Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Print Layout State
  const [printMode, setPrintMode] = useState<'sheet' | 'summary' | 'invoices'>('sheet');
  const [invoicesToPrint, setInvoicesToPrint] = useState<MeterRecord[]>([]);

  // Toast Notification
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  }, []);

  // Initialize DB and Auth on mount
  useEffect(() => {
    const loadedSettings = loadStoredSettings();
    setSettings(loadedSettings);

    const loadedDb = loadAllRecords();
    // If empty or missing 2026-09 or missing authentic R-prefix rooms, auto-seed September 2026 data
    let newDb = { ...loadedDb };
    if (!newDb['2026-09'] || !newDb['2026-09']['ratchaprapha_R101']) {
      newDb['2026-09'] = generateSeedData(MASTER_ROOMS, '2026-09', loadedSettings);
    }
    if (!newDb['2026-11']) {
      newDb['2026-11'] = generateSeedData(MASTER_ROOMS, '2026-11', loadedSettings);
    }
    setDbRecords(newDb);
    saveAllRecords(newDb);

    // Initialize Auth Listener
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        // Automatically fetch calendar events once signed in
        if (token) {
          listDormCalendarEvents(token)
            .then(evts => setCalendarEvents(evts))
            .catch(() => {});
        }
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Records for currently selected month
  const currentMonthRecords = useMemo(() => {
    return dbRecords[selectedMonth] || {};
  }, [dbRecords, selectedMonth]);

  // Records for previous month
  const previousMonthRecords = useMemo(() => {
    const prevKey = getPreviousMonthKey(selectedMonth);
    return dbRecords[prevKey] || {};
  }, [dbRecords, selectedMonth]);

  // Save a single record into the database
  const handleSaveRecord = useCallback((record: MeterRecord) => {
    setDbRecords(prev => {
      const updatedMonth = { ...(prev[selectedMonth] || {}), [record.roomId]: record };
      const newDb = { ...prev, [selectedMonth]: updatedMonth };
      saveAllRecords(newDb);
      return newDb;
    });
    showToast(`บันทึกมิเตอร์ห้อง ${record.roomNo} สำเร็จ`);
  }, [selectedMonth, showToast]);

  // Update remark inline
  const handleUpdateRemark = useCallback((roomId: string, remark: string) => {
    setDbRecords(prev => {
      const current = prev[selectedMonth]?.[roomId];
      if (!current) return prev;
      const updatedRecord = { ...current, remark };
      const updatedMonth = { ...prev[selectedMonth], [roomId]: updatedRecord };
      const newDb = { ...prev, [selectedMonth]: updatedMonth };
      saveAllRecords(newDb);
      return newDb;
    });
  }, [selectedMonth]);

  // Rows and totals for the Building Sheet tab
  const currentBuildingRooms = useMemo(() => {
    return MASTER_ROOMS.filter(r => r.buildingId === selectedBuildingId);
  }, [selectedBuildingId]);

  const currentBuildingSheetRows = useMemo<SheetRowData[]>(() => {
    return currentBuildingRooms.map(room => {
      const rec = currentMonthRecords[room.id];
      const prevRec = previousMonthRecords[room.id];

      return {
        roomId: room.id,
        roomNo: room.roomNo,
        waterType: room.waterType,
        hasRecord: !!rec,

        waterPrev: rec ? rec.waterPrev : (prevRec ? prevRec.waterCurr : 0),
        waterCurr: rec ? rec.waterCurr : 0,
        waterUnits: rec ? rec.waterUnits : 0,
        waterCost: rec ? rec.waterCost : 0,
        occupants: rec ? rec.occupants : 1,

        elecPrev: rec ? rec.elecPrev : (prevRec ? prevRec.elecCurr : 0),
        elecCurr: rec ? rec.elecCurr : 0,
        elecUnits: rec ? rec.elecUnits : 0,
        elecCost: rec ? rec.elecCost : 0,

        totalAmount: rec ? rec.totalAmount : 0,
        remark: rec ? rec.remark || '' : ''
      };
    });
  }, [currentBuildingRooms, currentMonthRecords, previousMonthRecords]);

  const currentSheetTotals = useMemo<SheetTotals>(() => {
    return {
      waterUnits: currentBuildingSheetRows.reduce((sum, r) => sum + (r.waterUnits || 0), 0),
      elecUnits: currentBuildingSheetRows.reduce((sum, r) => sum + (r.elecUnits || 0), 0),
      waterCost: currentBuildingSheetRows.reduce((sum, r) => sum + (r.waterCost || 0), 0),
      elecCost: currentBuildingSheetRows.reduce((sum, r) => sum + (r.elecCost || 0), 0),
      totalAmount: currentBuildingSheetRows.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
    };
  }, [currentBuildingSheetRows]);

  // Overall Global Monthly Analytics
  const monthlyAnalytics = useMemo(() => {
    const list = Object.values(currentMonthRecords);
    const totalRev = list.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const waterRev = list.reduce((sum, r) => sum + (r.waterCost || 0), 0);
    const elecRev = list.reduce((sum, r) => sum + (r.elecCost || 0), 0);
    const wUnits = list.reduce((sum, r) => sum + (r.waterUnits || 0), 0);
    const eUnits = list.reduce((sum, r) => sum + (r.elecUnits || 0), 0);
    const totalRooms = MASTER_ROOMS.length;
    const recordedCount = list.length;
    const completionPercentage = totalRooms > 0 ? ((recordedCount / totalRooms) * 100).toFixed(1) : '0';

    return {
      totalRevenue: totalRev,
      waterRevenue: waterRev,
      elecRevenue: elecRev,
      waterUnits: wUnits,
      elecUnits: eUnits,
      completionPercentage
    };
  }, [currentMonthRecords]);

  // Building Stats for Monthly Summary
  const monthlyBuildingStats = useMemo(() => {
    return BUILDINGS_CONFIG.map(b => {
      const bRooms = MASTER_ROOMS.filter(r => r.buildingId === b.id);
      const bRecs = bRooms.map(r => currentMonthRecords[r.id]).filter(Boolean);

      const bWaterUnits = bRecs.reduce((sum, r) => sum + (r.waterUnits || 0), 0);
      const bWaterCost = bRecs.reduce((sum, r) => sum + (r.waterCost || 0), 0);
      const bElecUnits = bRecs.reduce((sum, r) => sum + (r.elecUnits || 0), 0);
      const bElecCost = bRecs.reduce((sum, r) => sum + (r.elecCost || 0), 0);
      const bTotal = bRecs.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

      return {
        id: b.id,
        name: b.name,
        total: bRooms.length,
        recorded: bRecs.length,
        waterUnits: bWaterUnits,
        waterCost: bWaterCost,
        elecUnits: bElecUnits,
        elecCost: bElecCost,
        totalCost: bTotal
      };
    });
  }, [currentMonthRecords]);

  // Sign-in Handlers
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        showToast(`เข้าสู่ระบบด้วย ${res.user.email} เรียบร้อยแล้ว`);
      }
    } catch (err: any) {
      showToast(err.message || 'การเข้าสู่ระบบล้มเหลว', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อย');
  };

  // Google Sheets Export with explicit User Confirmation (MANDATORY per Workspace Skill)
  const triggerExportSheets = () => {
    const building = BUILDINGS_CONFIG.find(b => b.id === selectedBuildingId) || BUILDINGS_CONFIG[0];
    const monthThai = formatThaiMonthYear(selectedMonth);

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการสร้างสเปรดชีตใน Google Sheets',
      message: `คุณต้องการสร้างสเปรดชีตใหม่ใน Google Drive สำหรับตารางมิเตอร์ "หอพัก${building.name}" ประจำเดือน ${monthThai} หรือไม่?`,
      details: `• อาคาร: หอพัก${building.name}\n• จำนวนห้อง: ${currentBuildingSheetRows.length} ห้อง\n• ยอดรวมเงิน: ฿${currentSheetTotals.totalAmount.toLocaleString('th-TH')}`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          let token = await getAccessToken();
          if (!token) {
            const loginRes = await googleSignIn();
            if (!loginRes) return;
            token = loginRes.accessToken;
            setCurrentUser(loginRes.user);
          }

          setIsExportingSheets(true);
          const { spreadsheetUrl } = await exportBuildingToGoogleSheets(
            token,
            building.name,
            monthThai,
            getPrevShortThaiMonthYear(selectedMonth),
            getShortThaiMonthYear(selectedMonth),
            currentBuildingSheetRows,
            currentSheetTotals
          );

          setLastCreatedSheetUrl(spreadsheetUrl);
          showToast('สร้างไฟล์ Google Spreadsheet เรียบร้อยแล้ว!');
        } catch (err: any) {
          showToast(err.message || 'ส่งออก Google Sheets ไม่สำเร็จ', 'error');
        } finally {
          setIsExportingSheets(false);
        }
      }
    });
  };

  // Google Docs Export with explicit User Confirmation
  const triggerExportDocs = () => {
    const building = BUILDINGS_CONFIG.find(b => b.id === selectedBuildingId) || BUILDINGS_CONFIG[0];
    const monthThai = formatThaiMonthYear(selectedMonth);

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการสร้างเอกสารใน Google Docs',
      message: `คุณต้องการสร้างเอกสารรายงานสรุปและบันทึกข้อความทางการใน Google Docs สำหรับ "หอพัก${building.name}" ประจำเดือน ${monthThai} หรือไม่?`,
      details: `• หัวข้อ: ใบแจ้งหนี้และรายงานสรุปค่าน้ำ-ไฟ_${building.name}_${monthThai}\n• รวมยอดเงินทั้งสิ้น: ฿${currentSheetTotals.totalAmount.toLocaleString('th-TH')}\n• ผู้จัดทำและผู้อนุมัติจะถูกแนบในตอนท้ายของเอกสาร`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          let token = await getAccessToken();
          if (!token) {
            const loginRes = await googleSignIn();
            if (!loginRes) return;
            token = loginRes.accessToken;
            setCurrentUser(loginRes.user);
          }

          setIsExportingDocs(true);
          const { documentUrl } = await exportSummaryToGoogleDocs(
            token,
            building.name,
            monthThai,
            currentBuildingSheetRows,
            currentSheetTotals,
            settings
          );

          setLastCreatedDocUrl(documentUrl);
          showToast('สร้างเอกสารใน Google Docs เรียบร้อยแล้ว!');
        } catch (err: any) {
          showToast(err.message || 'สร้าง Google Docs ไม่สำเร็จ', 'error');
        } finally {
          setIsExportingDocs(false);
        }
      }
    });
  };

  // Google Calendar Integration
  const handleFetchCalendarEvents = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      setIsLoadingCalendar(true);
      const evts = await listDormCalendarEvents(token);
      setCalendarEvents(evts);
      showToast('ดึงกิจกรรมจาก Google Calendar สำเร็จ');
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถดึงข้อมูลปฏิทินได้', 'error');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleCreateCalendarEvent = (eventData: {
    summary: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการเพิ่มกิจกรรมลงใน Google Calendar',
      message: `คุณต้องการบันทึกกิจกรรม "${eventData.summary}" ลงใน Google Calendar ของคุณหรือไม่?`,
      details: `• ชื่อ: ${eventData.summary}\n• วันเริ่มต้น: ${eventData.startDate}\n• วันสิ้นสุด: ${eventData.endDate}\n• รายละเอียด: ${eventData.description}`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          let token = await getAccessToken();
          if (!token) {
            const loginRes = await googleSignIn();
            if (!loginRes) return;
            token = loginRes.accessToken;
            setCurrentUser(loginRes.user);
          }

          setIsCreatingEvent(true);
          const created = await createDormCalendarEvent(token, eventData);
          setCalendarEvents(prev => [created, ...prev]);
          showToast('เพิ่มกิจกรรมลงใน Google Calendar สำเร็จ!');
        } catch (err: any) {
          showToast(err.message || 'ไม่สามารถเพิ่มกิจกรรมลง Calendar ได้', 'error');
        } finally {
          setIsCreatingEvent(false);
        }
      }
    });
  };

  // Offline CSV Export
  const handleDownloadCSV = () => {
    const list = Object.values(currentMonthRecords);
    if (list.length === 0) {
      showToast('ไม่มีข้อมูลสำหรับส่งออกในเดือนนี้', 'error');
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'เดือน,อาคาร,เลขห้อง,ชั้น,ประเภทค่าน้ำ,มิเตอร์น้ำเดิม,มิเตอร์น้ำใหม่/คน,หน่วยน้ำ,ค่าน้ำ(บาท),มิเตอร์ไฟเดิม,มิเตอร์ไฟใหม่,หน่วยไฟฟ้า,ค่าไฟฟ้า(บาท),รวมทั้งสิ้น(บาท),หมายเหตุ\n';

    list.forEach(r => {
      const wVal = r.waterType === 'flat_per_person' ? `${r.occupants} คน` : r.waterCurr;
      csv += `"${selectedMonth}","${r.buildingName}","${r.roomNo}","${r.floor}","${r.waterType}","${r.waterPrev}","${wVal}","${r.waterUnits}","${r.waterCost}","${r.elecPrev}","${r.elecCurr}","${r.elecUnits}","${r.elecCost}","${r.totalAmount}","${r.remark || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ตารางมิเตอร์หอพัก_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อย');
  };

  // Copy table to clipboard
  const handleCopyClipboard = () => {
    const list = Object.values(currentMonthRecords);
    if (list.length === 0) {
      showToast('ไม่มีข้อมูลสำหรับคัดลอกในเดือนนี้', 'error');
      return;
    }

    let tsv = 'เดือน\tอาคาร\tเลขห้อง\tชั้น\tประเภทค่าน้ำ\tมิเตอร์น้ำเดิม\tมิเตอร์น้ำใหม่/คน\tหน่วยน้ำ\tค่าน้ำ(บาท)\tมิเตอร์ไฟเดิม\tมิเตอร์ไฟใหม่\tหน่วยไฟฟ้า\tค่าไฟฟ้า(บาท)\tรวมทั้งสิ้น(บาท)\tหมายเหตุ\n';
    list.forEach(r => {
      const wVal = r.waterType === 'flat_per_person' ? `${r.occupants} คน` : r.waterCurr;
      tsv += `${selectedMonth}\t${r.buildingName}\t${r.roomNo}\t${r.floor}\t${r.waterType}\t${r.waterPrev}\t${wVal}\t${r.waterUnits}\t${r.waterCost}\t${r.elecPrev}\t${r.elecCurr}\t${r.elecUnits}\t${r.elecCost}\t${r.totalAmount}\t${r.remark || ''}\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      showToast('คัดลอกตารางแล้ว! กด Ctrl+V วางใน Google Sheets ได้ทันที');
    }).catch(() => {
      showToast('ไม่สามารถคัดลอกได้', 'error');
    });
  };

  // Seed sample data
  const handleSeedData = () => {
    const seeded = generateSeedData(MASTER_ROOMS, selectedMonth, settings);
    setDbRecords(prev => {
      const newDb = { ...prev, [selectedMonth]: seeded };
      saveAllRecords(newDb);
      return newDb;
    });
    showToast(`สุ่มสร้างข้อมูลตัวอย่างครบ 382 ห้องในเดือน ${selectedMonth} เรียบร้อยแล้ว`);
  };

  // Clear month
  const handleClearMonth = () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลมิเตอร์ทั้งหมดในเดือน ${selectedMonth}?`)) {
      setDbRecords(prev => {
        const newDb = { ...prev, [selectedMonth]: {} };
        saveAllRecords(newDb);
        return newDb;
      });
      showToast(`ล้างข้อมูลเดือน ${selectedMonth} เรียบร้อยแล้ว`);
    }
  };

  // Export JSON Database
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbRecords, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `dorm_meter_db_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อย');
  };

  // Import JSON Database
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setDbRecords(parsed);
        saveAllRecords(parsed);
        showToast('กู้คืนฐานข้อมูลจากไฟล์ JSON สำเร็จแล้ว');
      } catch (err) {
        showToast('ไฟล์ JSON ไม่ถูกต้อง', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Room selected for editing in modal
  const activeEditingRoom = useMemo(() => {
    return MASTER_ROOMS.find(r => r.id === editingRoomId) || null;
  }, [editingRoomId]);

  // Batch Print Invoices Handler
  const handleBatchPrintInvoices = (recordsToPrint: MeterRecord[]) => {
    setInvoicesToPrint(recordsToPrint);
    setPrintMode('invoices');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintSingleInvoice = () => {
    if (viewingInvoiceRecord) {
      setInvoicesToPrint([viewingInvoiceRecord]);
      setPrintMode('invoices');
      setTimeout(() => {
        window.print();
      }, 150);
    }
  };

  const currentBuilding = BUILDINGS_CONFIG.find(b => b.id === selectedBuildingId) || BUILDINGS_CONFIG[0];

  return (
    <div className="flex flex-col min-h-screen text-slate-800 antialiased">
      
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-semibold text-xs sm:text-sm">{toast.message}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenWalkthrough={() => setCurrentTab('walkthrough')}
        totalRooms={MASTER_ROOMS.length}
        recordedCount={Object.keys(currentMonthRecords).length}
        totalRevenue={monthlyAnalytics.totalRevenue}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'buildingSheet') setPrintMode('sheet');
          if (tab === 'monthlyReport') setPrintMode('summary');
        }}
      />

      {/* Main Content View Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        
        {/* 1. Official Building Meter Sheet */}
        {currentTab === 'buildingSheet' && (
          <BuildingSheetTab
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={setSelectedBuildingId}
            selectedMonth={selectedMonth}
            sheetRows={currentBuildingSheetRows}
            sheetTotals={currentSheetTotals}
            settings={settings}
            onUpdateRemark={handleUpdateRemark}
            onEditRoom={(roomId) => setEditingRoomId(roomId)}
            onOpenInvoice={(roomId) => {
              const rec = currentMonthRecords[roomId];
              if (rec) setViewingInvoiceRecord(rec);
              else showToast('ห้องนี้ยังไม่ได้จดบันทึกมิเตอร์', 'error');
            }}
            onExportSheets={triggerExportSheets}
            onExportDocs={triggerExportDocs}
            isExportingSheets={isExportingSheets}
            isExportingDocs={isExportingDocs}
            onShowToast={showToast}
            onOpenPhotoReport={() => setCurrentTab('photoReport')}
          />
        )}

        {/* 2. Meter Photo Report (รายงานรูปภาพมิเตอร์) */}
        {currentTab === 'photoReport' && (
          <MeterPhotoReportTab
            selectedMonth={selectedMonth}
            masterRooms={MASTER_ROOMS}
            records={currentMonthRecords}
            onSaveRecord={handleSaveRecord}
            onShowToast={showToast}
            onNavigateToSheet={(bId) => {
              setSelectedBuildingId(bId);
              setCurrentTab('buildingSheet');
            }}
          />
        )}

        {/* 3. Room Grid View */}
        {currentTab === 'grid' && (
          <RoomGridTab
            masterRooms={MASTER_ROOMS}
            records={currentMonthRecords}
            onSelectRoom={(room) => setEditingRoomId(room.id)}
          />
        )}

        {/* 4. Walkthrough Mode */}
        {currentTab === 'walkthrough' && (
          <WalkthroughTab
            masterRooms={MASTER_ROOMS}
            records={currentMonthRecords}
            previousMonthRecords={previousMonthRecords}
            selectedMonth={selectedMonth}
            settings={settings}
            onSaveRecord={handleSaveRecord}
          />
        )}

        {/* 5. Monthly Summary Report with Recharts 6-Month Trend */}
        {currentTab === 'monthlyReport' && (
          <MonthlyReportTab
            selectedMonth={selectedMonth}
            masterRooms={MASTER_ROOMS}
            records={currentMonthRecords}
            allDbRecords={dbRecords}
            onShowToast={showToast}
          />
        )}

        {/* 5. Invoices & Batch PDF Print */}
        {currentTab === 'invoices' && (
          <InvoicesTab
            selectedMonth={selectedMonth}
            records={currentMonthRecords}
            onOpenSingleInvoice={(rec) => setViewingInvoiceRecord(rec)}
            onBatchPrint={handleBatchPrintInvoices}
          />
        )}

        {/* 6. Google Workspace Integration Hub */}
        {currentTab === 'workspace' && (
          <WorkspaceTab
            currentUser={currentUser}
            onGoogleSignIn={handleGoogleSignIn}
            isLoggingIn={isLoggingIn}
            selectedMonth={selectedMonth}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={setSelectedBuildingId}
            sheetRows={currentBuildingSheetRows}
            sheetTotals={currentSheetTotals}
            settings={settings}
            onExportSheets={triggerExportSheets}
            onExportDocs={triggerExportDocs}
            isExportingSheets={isExportingSheets}
            isExportingDocs={isExportingDocs}
            lastCreatedSheetUrl={lastCreatedSheetUrl}
            lastCreatedDocUrl={lastCreatedDocUrl}
            calendarEvents={calendarEvents}
            isLoadingCalendar={isLoadingCalendar}
            onFetchCalendarEvents={handleFetchCalendarEvents}
            onCreateCalendarEvent={handleCreateCalendarEvent}
            isCreatingEvent={isCreatingEvent}
            onDownloadCSV={handleDownloadCSV}
            onCopyClipboard={handleCopyClipboard}
          />
        )}

        {/* 7. Settings & Database Backup */}
        {currentTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              saveStoredSettings(newSettings);
              showToast('บันทึกอัตราค่าน้ำ-ไฟเรียบร้อยแล้ว');
            }}
            selectedMonth={selectedMonth}
            onSeedData={handleSeedData}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onClearMonth={handleClearMonth}
          />
        )}

      </main>

      {/* Record Modal */}
      <RecordModal
        room={activeEditingRoom}
        existingRecord={activeEditingRoom ? currentMonthRecords[activeEditingRoom.id] || null : null}
        previousRecord={activeEditingRoom ? previousMonthRecords[activeEditingRoom.id] || null : null}
        selectedMonth={selectedMonth}
        settings={settings}
        isOpen={!!editingRoomId}
        onClose={() => setEditingRoomId(null)}
        onSave={handleSaveRecord}
      />

      {/* Single Invoice Modal */}
      <InvoiceModal
        record={viewingInvoiceRecord}
        selectedMonth={selectedMonth}
        settings={settings}
        isOpen={!!viewingInvoiceRecord}
        onClose={() => setViewingInvoiceRecord(null)}
        onPrint={handlePrintSingleInvoice}
        onShowToast={showToast}
      />

      {/* Workspace Confirmation Modal (Mandatory user confirmation before Workspace mutations) */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* High-Fidelity Print-Only Layouts */}
      <PrintLayouts
        printMode={printMode}
        selectedMonth={selectedMonth}
        buildingName={currentBuilding.name}
        sheetRows={currentBuildingSheetRows}
        sheetTotals={currentSheetTotals}
        invoicesToPrint={invoicesToPrint}
        settings={settings}
        monthlyBuildingStats={monthlyBuildingStats}
        monthlyAnalytics={monthlyAnalytics}
      />

    </div>
  );
}
