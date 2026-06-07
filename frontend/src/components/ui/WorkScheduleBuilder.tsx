import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Check, X } from 'lucide-react';
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

export interface ScheduleDay {
  day: string;
  start: string;
  end: string;
  isCustom: boolean;
}

interface WorkScheduleBuilderProps {
  value: ScheduleDay[];
  onChange: (schedule: ScheduleDay[]) => void;
}

const DAYS_OF_WEEK = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
];

export function WorkScheduleBuilder({ value = [], onChange }: WorkScheduleBuilderProps) {
  const [globalStart, setGlobalStart] = useState('08:00');
  const [globalEnd, setGlobalEnd] = useState('17:00');

  // Ensure value is an array
  const schedule = Array.isArray(value) ? value : [];

  const handleDayToggle = (day: string) => {
    const existingIndex = schedule.findIndex(s => s.day === day);
    if (existingIndex >= 0) {
      // Remove day
      const newSchedule = [...schedule];
      newSchedule.splice(existingIndex, 1);
      onChange(newSchedule);
    } else {
      // Add day
      // Insert in order of DAYS_OF_WEEK
      const newDay: ScheduleDay = {
        day,
        start: globalStart,
        end: globalEnd,
        isCustom: false
      };
      const newSchedule = [...schedule, newDay];
      newSchedule.sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
      onChange(newSchedule);
    }
  };

  const handleGlobalTimeChange = (type: 'start' | 'end', time: string) => {
    if (type === 'start') setGlobalStart(time);
    else setGlobalEnd(time);

    // Apply to all non-custom days
    const newSchedule = schedule.map(s => {
      if (!s.isCustom) {
        return {
          ...s,
          [type]: time
        };
      }
      return s;
    });
    onChange(newSchedule);
  };

  const handleCustomTimeChange = (day: string, type: 'start' | 'end', time: string) => {
    const newSchedule = schedule.map(s => {
      if (s.day === day) {
        return {
          ...s,
          [type]: time
        };
      }
      return s;
    });
    onChange(newSchedule);
  };

  const toggleCustom = (day: string) => {
    const newSchedule = schedule.map(s => {
      if (s.day === day) {
        return {
          ...s,
          isCustom: !s.isCustom,
          // Reset to global if turning off custom
          start: !s.isCustom ? s.start : globalStart,
          end: !s.isCustom ? s.end : globalEnd,
        };
      }
      return s;
    });
    onChange(newSchedule);
  };

  return (
    <div className="space-y-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
      
      {/* 1. Global Time Settings */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex-1 space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Genel Başlangıç Saati</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="time" 
              value={globalStart}
              onChange={(e) => handleGlobalTimeChange('start', e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 font-medium"
            />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Genel Bitiş Saati</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="time" 
              value={globalEnd}
              onChange={(e) => handleGlobalTimeChange('end', e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Days Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">Çalışma Günlerini Seçin</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = schedule.some(s => s.day === day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Days Detail */}
      {schedule.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <Label className="text-sm font-bold text-slate-700">Seçili Günlerin Saat Detayları</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schedule.map(s => (
              <div key={s.day} className={`p-3 rounded-xl border flex flex-col gap-3 transition-colors ${s.isCustom ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    {s.isCustom && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    {s.day}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCustom(s.day)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                      s.isCustom 
                        ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100' 
                        : 'bg-slate-100 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {s.isCustom ? (
                      <><X className="w-3 h-3" /> İptal</>
                    ) : (
                      <><Edit2 className="w-3 h-3" /> Özel Saat</>
                    )}
                  </button>
                </div>

                {s.isCustom ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      type="time" 
                      value={s.start}
                      onChange={(e) => handleCustomTimeChange(s.day, 'start', e.target.value)}
                      className="h-8 text-sm px-2 bg-white"
                    />
                    <span className="text-slate-400">-</span>
                    <Input 
                      type="time" 
                      value={s.end}
                      onChange={(e) => handleCustomTimeChange(s.day, 'end', e.target.value)}
                      className="h-8 text-sm px-2 bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{s.start} - {s.end}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 ml-auto">Genel</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
