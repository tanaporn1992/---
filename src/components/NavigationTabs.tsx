import React from 'react';
import {
  Camera,
  TableProperties,
  LayoutGrid,
  ListOrdered,
  PieChart,
  FileText,
  Cloud,
  Settings,
  Smartphone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export type TabKey =
  | 'buildingSheet'
  | 'photoReport'
  | 'grid'
  | 'walkthrough'
  | 'monthlyReport'
  | 'invoices'
  | 'workspace'
  | 'settings';

export type PortalMode = 'recorder' | 'admin';

interface NavigationTabsProps {
  portalMode: PortalMode;
  onPortalChange: (mode: PortalMode) => void;
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  portalMode,
  onPortalChange,
  currentTab,
  onTabChange
}) => {
  // Tabs for Field Recorder Mode (หน้าของผู้จดมิเตอร์ - เรียบง่าย ไม่รก ไม่สับสน)
  const recorderTabs = [
    {
      id: 'walkthrough' as TabKey,
      label: 'จดมิเตอร์ต่อเนื่อง',
      sub: 'เดินจดทีละห้อง + ถ่ายรูป',
      icon: ListOrdered,
      badge: 'แนะนำตอนเดินจด',
      accent: 'border-b-2 border-amber-400 text-white font-bold bg-amber-500/15'
    },
    {
      id: 'grid' as TabKey,
      label: 'ผังห้องพัก 382 ห้อง',
      sub: 'ค้นหาห้อง & เช็คสถานะ',
      icon: LayoutGrid,
      accent: 'border-b-2 border-emerald-400 text-white font-bold bg-emerald-500/15'
    },
    {
      id: 'buildingSheet' as TabKey,
      label: 'ตารางเลขมิเตอร์',
      sub: 'ตรวจทานเลขที่บันทึกแล้ว',
      icon: TableProperties,
      accent: 'border-b-2 border-blue-400 text-white font-bold bg-blue-500/15'
    }
  ];

  // Tabs for Admin / Reports Mode (หน้าหลังบ้าน & รายงาน - สรุปยอด รูปภาพมิเตอร์ เอกสาร การเงิน)
  const adminTabs = [
    {
      id: 'photoReport' as TabKey,
      label: 'รายงานรูปภาพมิเตอร์',
      sub: 'ตรวจรูปถ่าย & ออก PDF',
      icon: Camera,
      badge: 'PDF',
      accent: 'border-b-2 border-violet-400 text-white font-bold bg-violet-500/15'
    },
    {
      id: 'monthlyReport' as TabKey,
      label: 'รายงานสรุปภาพรวม',
      sub: 'กราฟแนวโน้มรายได้ 6 เดือน',
      icon: PieChart,
      accent: 'border-b-2 border-emerald-400 text-white font-bold bg-emerald-500/15'
    },
    {
      id: 'buildingSheet' as TabKey,
      label: 'ตารางรายอาคารทางการ',
      sub: 'พิมพ์ตารางส่งมหาวิทยาลัย',
      icon: TableProperties,
      accent: 'border-b-2 border-indigo-400 text-white font-bold bg-indigo-500/15'
    },
    {
      id: 'invoices' as TabKey,
      label: 'ใบแจ้งหนี้รายห้อง',
      sub: 'พิมพ์ใบเสร็จ & QR ชำระเงิน',
      icon: FileText,
      accent: 'border-b-2 border-sky-400 text-white font-bold bg-sky-500/15'
    },
    {
      id: 'workspace' as TabKey,
      label: 'Google Workspace',
      sub: 'Docs • Sheets • Calendar',
      icon: Cloud,
      accent: 'border-b-2 border-teal-400 text-white font-bold bg-teal-500/15'
    },
    {
      id: 'settings' as TabKey,
      label: 'ตั้งค่า & ข้อมูล',
      sub: 'อัตราค่าน้ำ-ไฟ & สำรอง JSON',
      icon: Settings,
      accent: 'border-b-2 border-slate-400 text-white font-bold bg-slate-500/15'
    }
  ];

  const activeTabs = portalMode === 'recorder' ? recorderTabs : adminTabs;

  return (
    <nav aria-label="แถบการนำทางหลัก" className="bg-slate-950 text-white no-print shadow-md">
      
      {/* Primary 2-Portal Segmented Switcher */}
      <div className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Segmented Control Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 w-full md:w-auto shadow-inner">
            
            {/* Button 1: Recorder Mode */}
            <button
              onClick={() => onPortalChange('recorder')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                portalMode === 'recorder'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${portalMode === 'recorder' ? 'text-emerald-200' : 'text-slate-400'}`} />
              <span>📱 หน้าผู้จดมิเตอร์</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                portalMode === 'recorder' ? 'bg-emerald-900/60 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                ลงพื้นที่
              </span>
            </button>

            {/* Button 2: Admin & Reports Mode */}
            <button
              onClick={() => onPortalChange('admin')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                portalMode === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-950/40 ring-1 ring-indigo-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${portalMode === 'admin' ? 'text-indigo-200' : 'text-slate-400'}`} />
              <span>📊 หน้าหลังบ้าน & รายงาน</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                portalMode === 'admin' ? 'bg-indigo-900/60 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                ผู้ดูแล/การเงิน
              </span>
            </button>

          </div>

          {/* Mode Description & Helper Text */}
          <div className="text-xs flex items-center justify-between sm:justify-start gap-2">
            {portalMode === 'recorder' ? (
              <div className="flex items-center space-x-1.5 text-emerald-400/90 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>โหมดลงพื้นที่: มีเฉพาะเมนูจดมิเตอร์ ถ่ายรูป และผังห้องพัก เรียบง่าย ไม่รกสายตา</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-indigo-300/90 bg-indigo-950/50 border border-indigo-800/40 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>โหมดจัดการ & รายงาน: ตรวจสอบรูปภาพมิเตอร์ สรุปยอดรายได้ ออกใบแจ้งหนี้ และส่งออก PDF/Sheets</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sub-Navigation Tabs filtered by Mode */}
      <div className="border-b border-slate-800/80 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 flex space-x-1 sm:space-x-2 overflow-x-auto text-xs sm:text-sm font-medium py-1 scrollbar-thin">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? tab.accent
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 opacity-90" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] bg-white/20 text-white font-bold px-1.5 py-0.2 rounded-md">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </nav>
  );
};
