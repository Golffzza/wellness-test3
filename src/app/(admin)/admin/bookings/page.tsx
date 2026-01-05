// ==========================================
// 📌 Admin Page: Bookings Management
// path: /admin/bookings
// ==========================================

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Button, LoadingSpinner, Modal } from '@/components/ui';
import type { Booking } from '@/types';
import { toISODateString } from '@/lib/date';
import {
  CalendarDays,
  RefreshCw,
  Clock3,
  User2,
  ClipboardList,
  ArrowRightLeft,
  UserCheck,
} from 'lucide-react';

// ✅ ใช้ปฏิทินเดียวกับหน้า /admin/schedule
import { ScheduleCalendar } from '@/components/admin/schedule';

interface ReschedulePayload {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface AssignPayload {
  assigneeId: string;
}

const MOCK_ASSIGNEES = [
  { id: 'counselor_1', name: 'นักจิตวิทยา ก' },
  { id: 'counselor_2', name: 'นักจิตวิทยา ข' },
  { id: 'counselor_3', name: 'นักจิตวิทยา ค' },
];

export default function AdminBookingsPage() {
  // --- state หลัก ---
  const [currentMonth, setCurrentMonth] = useState(new Date()); // เดือนที่แสดงในปฏิทิน
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [assignTarget, setAssignTarget] = useState<Booking | null>(null);

  // ✅ NEW: modal อ่านรายละเอียดปัญหา
  const [problemTarget, setProblemTarget] = useState<Booking | null>(null);

  // วันที่รูปแบบ ISO ใช้เรียก API
  const selectedDateStr = useMemo(
    () => toISODateString(selectedDate),
    [selectedDate]
  );

  // วันที่แบบไทยไว้โชว์ใน UI
  const selectedDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [selectedDate]
  );

  const fetchBookings = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/bookings?date=${selectedDateStr}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch (err) {
      console.error(err);
      // TODO: ใส่ toast แจ้ง error ถ้ามี
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // โหลดข้อมูลเมื่อเปลี่ยนวัน
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr]);

  const handleOpenReschedule = (booking: Booking) => {
    setRescheduleTarget(booking);
  };

  const handleOpenAssign = (booking: Booking) => {
    setAssignTarget(booking);
  };

  const handleReschedule = async (payload: ReschedulePayload) => {
    if (!rescheduleTarget) return;
    try {
      setIsRefreshing(true);
      await fetch(`/api/admin/bookings/${rescheduleTarget.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setRescheduleTarget(null);
      await fetchBookings({ silent: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAssign = async (payload: AssignPayload) => {
    if (!assignTarget) return;
    try {
      setIsRefreshing(true);
      await fetch(`/api/admin/bookings/${assignTarget.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setAssignTarget(null);
      await fetchBookings({ silent: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-sm">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h5 className="text-2xl font-bold text-gray-900 leading-tight">
            จัดการคิวการให้คำปรึกษา
          </h5>
          <p className="text-sm text-gray-500 mt-1">
            เลือกวันที่จากปฏิทินเพื่อดูคิวทั้งหมดในวันนั้น และทำการเลื่อนนัด / แจกงาน
          </p>
        </div>
      </div>

      {/* Layout: ซ้ายปฏิทิน / ขวารายการจอง */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ซ้าย: ปฏิทิน 3 คอลัมน์ */}
        <div className="lg:col-span-3 space-y-4">
          <ScheduleCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onMonthChange={setCurrentMonth}
          />
        </div>

        {/* ขวา: รายการจอง 9 คอลัมน์ */}
        <div className="lg:col-span-9 space-y-3">
          {/* แถวเล็กด้านบน: วันที่ที่เลือก + ปุ่มรีเฟรช */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-primary-500" />
              <span>
                วันที่เลือก: <span className="font-semibold">{selectedDateLabel}</span>
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRefreshing(true);
                fetchBookings({ silent: true });
              }}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>
          </div>

          {/* Card แสดงรายการจอง */}
          <Card className="rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 bg-white">
            {isLoading ? (
              <div className="py-12 flex items-center justify-center">
                <LoadingSpinner size="lg" label="กำลังโหลดข้อมูลคิว..." />
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                ยังไม่มีคิวในวันที่เลือก
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[1.2fr,1fr,1fr,0.9fr,1fr] text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mb-2 shadow-sm">
                  <span className="pl-1">ผู้จอง / ช่องทาง</span>
                  <span>เวลา</span>
                  <span>ประเภทปัญหา</span>
                  <span>สถานะ</span>
                  <span className="text-right pr-1">การจัดการ</span>
                </div>

                {/* Rows */}
                <div className="space-y-2">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="grid gap-2 md:grid-cols-[1.2fr,1fr,1fr,1.1fr,1fr] items-center rounded-xl border border-gray-100 px-3 py-3 md:px-4 md:py-3 text-xs md:text-sm bg-slate-50/70 md:bg-white"
                    >
                      {/* User */}
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50">
                          <User2 className="w-5 h-5 text-primary-600" />
                        </div>

                        {/* Text */}
                        <div className="leading-tight min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {booking.userName ?? 'ไม่ทราบชื่อ'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            LINE ID: {booking.lineUserId ?? '-'}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1.5 text-gray-800 whitespace-nowrap">
                        <Clock3 className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium">
                          {booking.startTime}–{booking.endTime} น.
                        </span>
                      </div>

                      {/* Problem type (CLICKABLE -> MODAL) */}
                      <button
                        type="button"
                        onClick={() => setProblemTarget(booking)}
                        className="text-left group min-w-0"
                        title="กดเพื่อดูรายละเอียด"
                      >
                        <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {booking.problemType ?? '-'}
                        </p>

                        {booking.problemDescription ? (
                          <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-600">
                            {booking.problemDescription}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">ไม่มีรายละเอียดเพิ่มเติม</p>
                        )}

                        <span className="mt-1 inline-flex items-center text-[11px] text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          กดเพื่อดูรายละเอียด
                        </span>
                      </button>

                      {/* Status */}
                      <div className="text-[11px] md:text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          รอการยืนยัน
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col md:items-end items-start gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 whitespace-nowrap min-w-[110px]"
                          onClick={() => handleOpenReschedule(booking)}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>เลื่อนเวลา</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap min-w-[140px]"
                          onClick={() => handleOpenAssign(booking)}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>แจกงาน</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <RescheduleBookingModal
        booking={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={handleReschedule}
      />

      <AssignBookingModal
        booking={assignTarget}
        onClose={() => setAssignTarget(null)}
        onConfirm={handleAssign}
      />

      {/* ✅ NEW: Modal อ่านประเภท/รายละเอียดปัญหา */}
      <ProblemDetailsModal
        booking={problemTarget}
        onClose={() => setProblemTarget(null)}
      />
    </div>
  );
}

// ==========================================
// ✅ Modal: อ่านรายละเอียดปัญหา (Problem Details)
// ==========================================

interface ProblemDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
}

function ProblemDetailsModal({ booking, onClose }: ProblemDetailsModalProps) {
  if (!booking) return null;

  return (
    <Modal isOpen={!!booking} onClose={onClose} title="รายละเอียดปัญหา" size="md">
      <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4">
        {/* Header info */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-1">ผู้จอง</p>
          <p className="text-sm font-semibold text-gray-900">
            {booking.userName ?? 'ไม่ทราบชื่อ'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            LINE ID: {booking.lineUserId ?? '-'} • เวลา {booking.startTime}–{booking.endTime} น.
          </p>
        </div>

        {/* Problem type */}
        <div>
          <p className="text-xs text-gray-500 mb-1">ประเภทปัญหา</p>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-base font-semibold text-gray-900">
              {booking.problemType ?? '-'}
            </p>
          </div>
        </div>

        {/* Problem description */}
        <div>
          <p className="text-xs text-gray-500 mb-1">รายละเอียด</p>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {booking.problemDescription ?? 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิด
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ==========================================
// 🔁 Modal: เลื่อนเวลานัด
// ==========================================

interface RescheduleBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (payload: ReschedulePayload) => void;
}

function RescheduleBookingModal({
  booking,
  onClose,
  onConfirm,
}: RescheduleBookingModalProps) {
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (booking) {
      setDate(booking.date ?? '');
      setStartTime(booking.startTime ?? '');
      setEndTime(booking.endTime ?? '');
      setReason('');
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      date,
      startTime,
      endTime,
      reason,
    });
  };

  return (
    <Modal isOpen={!!booking} onClose={onClose} title="เลื่อนเวลานัด" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          กำลังเลื่อนคิวของ{' '}
          <span className="font-semibold text-gray-800">
            {booking.userName ?? 'ไม่ทราบชื่อ'}
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">วันที่ใหม่</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">เวลาเริ่มต้น</label>
            <input
              type="time"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">เวลาสิ้นสุด</label>
            <input
              type="time"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">เหตุผลในการเลื่อนนัด</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            placeholder="ระบุสาเหตุ เช่น ผู้ให้คำปรึกษาติดภารกิจ / ปรับเวลาให้เหมาะกับนิสิต ฯลฯ"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600">
            ยืนยันการเลื่อนนัด
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 👥 Modal: แจกงานให้ผู้ให้คำปรึกษา
// ==========================================

interface AssignBookingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (payload: AssignPayload) => void;
}

function AssignBookingModal({
  booking,
  onClose,
  onConfirm,
}: AssignBookingModalProps) {
  const [assigneeId, setAssigneeId] = useState<string>('');

  useEffect(() => {
    if (booking) setAssigneeId('');
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId) return;
    onConfirm({ assigneeId });
  };

  return (
    <Modal isOpen={!!booking} onClose={onClose} title="แจกงานให้ผู้ให้คำปรึกษา" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          คิวของ{' '}
          <span className="font-semibold text-gray-800">
            {booking.userName ?? 'ไม่ทราบชื่อ'}
          </span>
        </p>

        <div>
          <label className="block text-xs text-gray-600 mb-1">เลือกผู้ให้คำปรึกษา</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            required
          >
            <option value="">— เลือกคนที่รับเคสนี้ —</option>
            {MOCK_ASSIGNEES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600"
            disabled={!assigneeId}
          >
            ยืนยันการแจกงาน
          </Button>
        </div>
      </form>
    </Modal>
  );
}
