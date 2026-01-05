'use client';

import { Card, Button } from '@/components/ui';
import {
  Users,
  Calendar,
  Clock,
  Activity,
  ArrowUpRight,
  MoreHorizontal,
  CalendarDays,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ========================
// 📌 Helper – Thai Date
// ========================
function formatFullThaiDate(date: Date) {
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ========================
// Mock Data
// ========================
const todayAppointments = [
  { time: '09:00', user: 'คุณสมชาย', type: 'ความเครียด', consultant: 'ดร.สมศรี', status: 'pending' },
  { time: '10:00', user: 'คุณวิภา', type: 'ซึมเศร้า', consultant: 'พญ.ใจใส', status: 'confirmed' },
  { time: '13:00', user: 'คุณนพดล', type: 'ครอบครัว', consultant: 'ดร.สมศรี', status: 'completed' },
  { time: '14:00', user: 'Guest User', type: 'การเรียน', consultant: '-', status: 'cancelled' },
];

const stats = [
  { label: 'นัดหมายวันนี้', value: '12', icon: Calendar },
  { label: 'รอดำเนินการ', value: '5', icon: Clock },
  { label: 'ผู้ใช้งานใหม่', value: '28', icon: Users },
  { label: 'ผู้ให้คำปรึกษา', value: '8', icon: Users },
];

function getStatusChip(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'completed':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    case 'cancelled':
      return 'bg-red-100 text-red-600 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// ========================
// Component
// ========================
export default function AdminDashboardPage() {
  const now = new Date();

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-100 text-gray-700 px-2 py-1 rounded-md text-sm mb-2">
            <Activity className="w-3 h-3" />
            แผงควบคุมผู้ดูแลระบบ
          </div>

          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ดภาพรวม</h1>
          <p className="text-sm text-gray-500 mt-1">
            ยินดีต้อนรับกลับ, ผู้ดูแลระบบ
          </p>
        </div>

        <div className="text-right mt-3 sm:mt-0 flex flex-col items-end gap-1">

          {/* Date */}
          <div className="flex items-center gap-2 bg-green-100 px-2 py-1 rounded-md border border-gray-100">
            <CalendarDays className="w-4 h-4 text-gray-700" />
            <p className="font-medium text-gray-800 text-sm">
              {formatFullThaiDate(now)}
            </p>
          </div>

          {/* Updated time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <p className="font-medium text-gray-800 text-sm">
              อัปเดตล่าสุด: {formatTime(now)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card
            key={i}
            className="p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-gray-100 rounded-md text-gray-700">
                <s.icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left – Schedule */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-600" />
                ตารางนัดหมายวันนี้
              </h3>

              <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:bg-gray-100">
                ดูทั้งหมด
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {todayAppointments.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center w-12">
                      <p className="text-sm font-semibold text-gray-800">{item.time}</p>
                    </div>

                    <div className="w-1 h-8 bg-gray-200 rounded-full" />

                    <div>
                      <p className="font-medium text-gray-800 text-sm">{item.user}</p>
                      <p className="text-xs text-gray-500 flex gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{item.type}</span>
                        <span>• {item.consultant}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] px-2 py-1 rounded border",
                      getStatusChip(item.status)
                    )}
                  >
                    {item.status === 'pending'
                      ? 'รอจัดสรร'
                      : item.status === 'confirmed'
                        ? 'ยืนยันแล้ว'
                        : item.status === 'completed'
                          ? 'เสร็จสิ้น'
                          : 'ยกเลิก'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right – Notifications */}
        <div>
          <Card className="p-4 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              การแจ้งเตือนล่าสุด
            </h3>

            <div className="space-y-3 text-xs">
              <Notification text="มีคำขอจองคิวใหม่ 2 รายการ" time="10 นาทีที่แล้ว" dotColor="bg-amber-500" />
              <Notification text="คุณหมอสมศรีเข้าสู่ระบบแล้ว" time="1 ชั่วโมงที่แล้ว" dotColor="bg-blue-500" />
              <Notification text="ระบบสำรองข้อมูลเสร็จสิ้น" time="2 ชั่วโมงที่แล้ว" dotColor="bg-green-500" />
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

// 🔔 Notification component
function Notification({ text, time, dotColor }: any) {
  return (
    <div className="flex gap-3">
      <div className={cn("w-2 h-2 rounded-full mt-1.5", dotColor)} />
      <div>
        <p className="text-gray-700">{text}</p>
        <p className="text-[10px] text-gray-400">{time}</p>
      </div>
    </div>
  );
}
