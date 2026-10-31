import React from 'react';
import {
  Camera,
  TableProperties,
  LayoutGrid,
  ListOrdered,
  PieChart,
  FileText,
  Cloud,
  Settings
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

interface NavigationTabsProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    {
      id: 'buildingSheet' as TabKey,
      label: 'ตารางจดมิเตอร์รายอาคาร',
      sub: 'รูปแบบทางการ',
      icon: TableProperties,
      accent: 'border-b-2 border-indigo-400 text-white font-bold bg-white/10'
    },
    {
      id: 'photoReport' as TabKey,
      label: 'รายงานรูปภาพมิเตอร์',
      sub: 'ตรวจรูปถ่ายน้ำ-ไฟ',
      icon: Camera,
      accent: 'border-b-2 border-violet-400 text-white font-bold bg-white/10'
    },
    {
      id: 'grid' as TabKey,
      label: 'ผังห้องพัก',
      sub: '382 ห้อง',
      icon: LayoutGrid,
      accent: 'border-b-2 border-blue-400 text-white font-bold bg-white/10'
    },
    {
      id: 'walkthrough' as TabKey,
      label: 'จดมิเตอร์ต่อเนื่อง',
      sub: 'เดินจดทีละห้อง',
      icon: ListOrdered,
      accent: 'border-b-2 border-amber-400 text-white font-bold bg-white/10'
    },
    {
      id: 'monthlyReport' as TabKey,
      label: 'รายงานสรุปภาพรวม',
      sub: 'สรุปรายได้',
      icon: PieChart,
      accent: 'border-b-2 border-emerald-400 text-white font-bold bg-white/10'
    },
    {
      id: 'invoices' as TabKey,
      label: 'ใบแจ้งหนี้รายห้อง',
      sub: 'พิมพ์ PDF',
      icon: FileText,
      accent: 'border-b-2 border-sky-400 text-white font-bold bg-white/10'
    },
    {
      id: 'workspace' as TabKey,
      label: 'Google Workspace',
      sub: 'Docs • Sheets • Cal',
      icon: Cloud,
      accent: 'border-b-2 border-teal-400 text-white font-bold bg-white/10'
    },
    {
      id: 'settings' as TabKey,
      label: 'ตั้งค่า & ข้อมูล',
      sub: 'อัตราและสำรอง',
      icon: Settings,
      accent: 'border-b-2 border-slate-400 text-white font-bold bg-white/10'
    }
  ];

  return (
    <nav aria-label="แถบการนำทางหลัก" className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 flex space-x-1 sm:space-x-2 overflow-x-auto text-xs sm:text-sm font-medium py-1">
        {tabs.map((tab) => {
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
            </button>
          );
        })}
      </div>
    </nav>
  );
};
