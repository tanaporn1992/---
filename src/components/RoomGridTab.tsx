import React, { useState, useMemo } from 'react';
import { BUILDINGS_CONFIG } from '../data/buildings';
import { RoomInfo, MeterRecord } from '../types';
import { formatCurrency } from '../utils/thaiDate';
import { Search, PlusCircle, CheckCircle, Droplets, Zap, Filter, Building2 } from 'lucide-react';

interface RoomGridTabProps {
  masterRooms: RoomInfo[];
  records: Record<string, MeterRecord>;
  onSelectRoom: (room: RoomInfo) => void;
}

export const RoomGridTab: React.FC<RoomGridTabProps> = ({
  masterRooms,
  records,
  onSelectRoom
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Grouped and filtered rooms
  const filteredRooms = useMemo(() => {
    let list = [...masterRooms];

    if (selectedBuilding !== 'ALL') {
      list = list.filter(r => r.buildingId === selectedBuilding);
    }

    if (selectedFloor !== 'ALL') {
      list = list.filter(r => r.floor === Number(selectedFloor));
    }

    if (selectedStatus === 'RECORDED') {
      list = list.filter(r => !!records[r.id]);
    } else if (selectedStatus === 'PENDING') {
      list = list.filter(r => !records[r.id]);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        r => r.roomNo.toLowerCase().includes(q) || r.buildingName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [masterRooms, records, selectedBuilding, selectedFloor, selectedStatus, searchQuery]);

  const groupedBuildings = useMemo(() => {
    const groups: Record<string, { buildingId: string; buildingName: string; rooms: RoomInfo[] }> = {};
    filteredRooms.forEach(room => {
      if (!groups[room.buildingId]) {
        groups[room.buildingId] = {
          buildingId: room.buildingId,
          buildingName: room.buildingName,
          rooms: []
        };
      }
      groups[room.buildingId].rooms.push(room);
    });
    return Object.values(groups);
  }, [filteredRooms]);

  return (
    <div className="space-y-6">
      
      {/* Filters and Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        
        {/* Building Filter Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            เลือกอาคารพักอาศัย:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBuilding('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedBuilding === 'ALL'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ทุกอาคาร ({masterRooms.length})
            </button>

            {BUILDINGS_CONFIG.map(b => {
              const bRooms = masterRooms.filter(r => r.buildingId === b.id);
              const bRecorded = bRooms.filter(r => !!records[r.id]).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuilding(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedBuilding === b.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] opacity-80 px-1.5 py-0.5 rounded-full bg-black/10">
                    {bRecorded}/{bRooms.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">ชั้น:</label>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">ทุกชั้น</option>
              {[1, 2, 3, 4, 5].map(f => (
                <option key={f} value={f}>
                  ชั้น {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">สถานะการจด:</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">ห้องทั้งหมด</option>
              <option value="RECORDED">จดบันทึกแล้ว</option>
              <option value="PENDING">ยังไม่จดบันทึก</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">ค้นหาเลขห้อง:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ระบุเลขห้อง เช่น 101, 4114..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

      </div>

      {/* Buildings Matrix */}
      <div className="space-y-6">
        {groupedBuildings.map(group => (
          <div key={group.buildingId} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            
            {/* Building Group Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <h3 className="text-base font-bold text-slate-900">{group.buildingName}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                  {group.rooms.length} ห้อง
                </span>
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {group.rooms.map(room => {
                const rec = records[room.id];
                const isRecorded = !!rec;

                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    className={`border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between relative group ${
                      isRecorded
                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900 text-base">
                        {room.roomNo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isRecorded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isRecorded ? 'จดแล้ว' : 'รอจด'}
                      </span>
                    </div>

                    {isRecorded ? (
                      <div className="text-xs space-y-1 text-slate-600">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center">
                            <Droplets className="w-3 h-3 text-blue-500 mr-1" />
                            น้ำ:
                          </span>
                          <span className="font-medium text-slate-800">
                            {room.waterType === 'flat_per_person'
                              ? `${rec.occupants} คน`
                              : `${rec.waterUnits} หน่วย`}
                          </span>
                        </div>

                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center">
                            <Zap className="w-3 h-3 text-amber-500 mr-1" />
                            ไฟ:
                          </span>
                          <span className="font-medium text-slate-800">{rec.elecUnits} หน่วย</span>
                        </div>

                        {rec.remark && (
                          <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded truncate font-medium">
                            {rec.remark}
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-emerald-200/60 flex justify-between font-bold text-emerald-800 text-xs">
                          <span>รวม:</span>
                          <span>฿{formatCurrency(rec.totalAmount)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 py-2.5 text-center border-t border-dashed border-slate-200">
                        <PlusCircle className="w-5 h-5 mx-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
                        <p className="text-[10px] mt-1 text-slate-400 group-hover:text-blue-600">
                          กดเพื่อบันทึก
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {groupedBuildings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">ไม่พบข้อมูลห้องพักตามเงื่อนไขที่เลือก</p>
          </div>
        )}
      </div>

    </div>
  );
};
