import React, { useState } from 'react';
import { Check, Copy, MessageCircle, Send, X } from 'lucide-react';
import { generateWhatsAppMessage } from '../utils/exportUtils';
import { StudentSessionEvaluation, User } from '../types';

interface WhatsAppSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User;
  evalData: StudentSessionEvaluation;
  circleName: string;
  teacherName: string;
  sessionDate: string;
}

export const WhatsAppSummaryModal: React.FC<WhatsAppSummaryModalProps> = ({
  isOpen,
  onClose,
  student,
  evalData,
  circleName,
  teacherName,
  sessionDate
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messageText = generateWhatsAppMessage(student, evalData, circleName, teacherName, sessionDate);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppDirect = () => {
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageText);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-right">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-bold text-base">تقرير واتساب لولي أمر الطالب</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">الطالب: </span>
              {student.name}
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">رقم الهاتف: </span>
              <span dir="ltr" className="font-mono">{student.phone}</span>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              معاينة الرسالة الجاهزة للإرسال:
            </label>
            <textarea
              readOnly
              value={messageText}
              rows={9}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-700 font-sans leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ النص فقط</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppDirect}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Send className="w-4 h-4 rotate-180" />
            <span>إرسال عبر واتساب 💬</span>
          </button>
        </div>
      </div>
    </div>
  );
};
