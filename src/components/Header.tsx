import React from 'react';
import { User } from 'firebase/auth';
import { formatCurrency, formatThaiMonthYear } from '../utils/thaiDate';
import { Zap, Droplets, Calendar, PenSquare, LogOut, CheckCircle2, TableProperties } from 'lucide-react';

interface HeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenWalkthrough: () => void;
  onOpenBuildingSheet?: () => void;
  totalRooms: number;
  recordedCount: number;
  totalRevenue: number;
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onMonthChange,
  onOpenWalkthrough,
  onOpenBuildingSheet,
  totalRooms,
  recordedCount,
  totalRevenue,
  currentUser,
  onGoogleSignIn,
  onLogout,
  isLoggingIn
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white shadow-xl sticky top-0 z-30 no-print border-b border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Dorm Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/30 rounded-2xl backdrop-blur-md shadow-inner flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-xl font-bold tracking-wide">
                  ระบบจดมิเตอร์น้ำ-ไฟฟ้าและออกใบแจ้งหนี้
                </h1>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                  หอพักนักศึกษา
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                จัดการอาคารพักอาศัย 8 อาคาร (รวม 382 ห้อง) • ประจำเดือน {formatThaiMonthYear(selectedMonth)}
              </p>
            </div>
          </div>

          {/* Month Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Month Picker */}
            <div className="bg-white/10 border border-white/10 rounded-xl px-2 py-1.5 flex items-center space-x-2 backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-blue-300" />
              <label htmlFor="dorm-month-input" className="text-xs text-blue-200 hidden sm:inline">เดือน:</label>
              <input
                id="dorm-month-input"
                aria-label="เลือกเดือนประจำรอบบิล"
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-slate-900 text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Quick Button to Image/PDF Meter Report */}
            <button
              onClick={() => onOpenBuildingSheet ? onOpenBuildingSheet() : onOpenWalkthrough()}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-md transition-all cursor-pointer ring-1 ring-indigo-300/40"
            >
              <TableProperties className="w-4 h-4 text-indigo-200" />
              <span>รายงานรูปภาพมิเตอร์</span>
            </button>

            {/* Quick Walkthrough Button */}
            <button
              onClick={onOpenWalkthrough}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>จดมิเตอร์ด่วน</span>
            </button>

            {/* Google Workspace Auth Button / Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs backdrop-blur-sm">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full border border-blue-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="font-semibold text-white truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="text-[10px] text-emerald-300 flex items-center">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" /> Workspace พร้อมใช้
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ Google"
                  className="p-1 hover:bg-white/20 rounded-lg text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button text-xs flex items-center py-1 px-3 shadow-md active:scale-95 transition-all cursor-pointer"
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
                    {isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google'}
                  </span>
                </div>
              </button>
            )}

          </div>

        </div>

        {/* Global Summary Chips Bar */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white/5 px-3 py-1.5 rounded-xl flex items-center justify-between border border-white/10">
            <span className="text-blue-200">ห้องทั้งหมด</span>
            <span className="font-bold text-sm text-white">{totalRooms}</span>
          </div>
          <div className="bg-emerald-500/15 px-3 py-1.5 rounded-xl flex items-center justify-between border border-emerald-500/30">
            <span className="text-emerald-300">บันทึกแล้ว</span>
            <span className="font-bold text-sm text-emerald-400">
              {recordedCount} / {totalRooms}
            </span>
          </div>
          <div className="bg-amber-500/15 px-3 py-1.5 rounded-xl flex items-center justify-between border border-amber-500/30">
            <span className="text-amber-300">รอดำเนินการ</span>
            <span className="font-bold text-sm text-amber-400">
              {Math.max(0, totalRooms - recordedCount)}
            </span>
          </div>
          <div className="bg-blue-500/15 px-3 py-1.5 rounded-xl flex items-center justify-between border border-blue-500/30">
            <span className="text-blue-200">ประเมินยอดรวม</span>
            <span className="font-black text-sm text-blue-300">
              ฿{formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
