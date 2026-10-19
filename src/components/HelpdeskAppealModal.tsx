import React, { useState } from 'react';
import {
  FileText,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  Upload
} from 'lucide-react';
import { StudentRecord } from '../types';

interface HelpdeskAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledStudent?: StudentRecord;
}

export const HelpdeskAppealModal: React.FC<HelpdeskAppealModalProps> = ({
  isOpen,
  onClose,
  prefilledStudent
}) => {
  const [regNo, setRegNo] = useState<string>(prefilledStudent?.regNo || '');
  const [studentName, setStudentName] = useState<string>(prefilledStudent?.name || '');
  const [email, setEmail] = useState<string>(prefilledStudent?.email || '');
  const [phone, setPhone] = useState<string>('+254 7');
  const [issueType, setIssueType] = useState<string>('semester-registration');
  const [notes, setNotes] = useState<string>('');
  const [attachedProof, setAttachedProof] = useState<string>('Kabarak_Fee_Receipt_2026.pdf');
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    submittedAt: string;
    priority: string;
    status: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;

    setSubmittedTicket({
      ticketId: `KUPSA-HELP-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedAt: 'Just now (Simulated)',
      priority: 'High Priority (Electoral Window)',
      status: 'Queued for Dean Registrar Liaison Desk (Room PH-104)'
    });
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl border border-[#e1e7df] shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[#d2ded0] rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#e1e7df] p-4 sm:p-6 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#286746] font-bold block">
              Article 39(4) Dispute Remedy
            </span>
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#17271f]">
              Voter Register Appeal Ticket
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#58675e] hover:text-[#17271f] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTicket ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 text-xs">
            <div className="p-4 bg-[#eaf1e9] border border-[#cbd8cb] rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#286746] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#194a31]">
                Appeal Ticket Docketed
              </h4>
              <p className="text-[#194a31]">
                Your discrepancy petition has been logged and transmitted to the School of Pharmacy
                Registrar Desk.
              </p>
            </div>

            <div className="p-4 bg-[#fafcfa] border border-[#e1e7df] rounded-xl font-mono text-[11px] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7a867d]">Ticket Ref:</span>
                <strong className="text-[#17271f]">{submittedTicket.ticketId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a867d]">Registration No:</span>
                <span>{regNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a867d]">Queue Priority:</span>
                <span className="text-amber-700 font-bold">{submittedTicket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a867d]">Processing Route:</span>
                <span className="text-[#286746]">{submittedTicket.status}</span>
              </div>
            </div>

            <div className="p-3 bg-[#f7f9f6] rounded-xl text-[11px] text-[#58675e] space-y-1">
              <span className="font-bold text-[#17271f] block">What Happens Next?</span>
              <p>
                The Commission Registrar liaison verifies your fee payment or faculty enrollment with
                the Dean’s office. Once verified, your status switches to "Eligible" on the live portal.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-[#286746] hover:bg-[#194a31] text-white font-semibold rounded-xl cursor-pointer transition-colors min-h-[44px]"
              >
                Return to Vote
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            <p className="text-[#58675e] leading-relaxed">
              If your student status shows "Ineligible" or "Action Required", submit your official
              details below. The Commission Secretariat reviews registrar proofs before poll closure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#17271f]">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. David Kiprono"
                  className="w-full bg-[#f7f9f6] border border-[#e1e7df] rounded-lg px-3 py-2.5 text-sm sm:text-xs min-h-[42px] focus:outline-none focus:border-[#286746]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#17271f]">Registration Number</label>
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="PHARM/2024/1882"
                  className="w-full bg-[#f7f9f6] border border-[#e1e7df] rounded-lg px-3 py-2.5 text-sm sm:text-xs font-mono uppercase min-h-[42px] focus:outline-none focus:border-[#286746]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#17271f]">Kabarak Student Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@kabarak.ac.ke"
                  className="w-full bg-[#f7f9f6] border border-[#e1e7df] rounded-lg px-3 py-2.5 text-sm sm:text-xs min-h-[42px] focus:outline-none focus:border-[#286746]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#17271f]">Discrepancy Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-[#f7f9f6] border border-[#e1e7df] rounded-lg px-3 py-2.5 text-sm sm:text-xs min-h-[42px] focus:outline-none focus:border-[#286746]"
                >
                  <option value="semester-registration">
                    Paid-up but not showing on current roll
                  </option>
                  <option value="faculty-transfer">
                    Recent inter-faculty transfer to Pharmacy
                  </option>
                  <option value="attachment-leave">
                    Returning from clinical attachment / deferment
                  </option>
                  <option value="dues-clearance">KUPSA subscription payment pending receipt</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#17271f]">Discrepancy Details & Receipt Ref</label>
              <textarea
                rows={2}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="State your fee payment receipt number or Dean approval date..."
                className="w-full bg-[#f7f9f6] border border-[#e1e7df] rounded-lg p-3 text-sm sm:text-xs focus:outline-none focus:border-[#286746]"
              />
            </div>

            <div className="p-3 bg-[#fafcfa] border border-[#e1e7df] rounded-xl flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-[#58675e]">
                <FileText className="w-4 h-4 text-[#286746]" />
                <span>Simulated Proof Attached: {attachedProof}</span>
              </div>
              <span className="text-[#286746] font-bold">Attached ✓</span>
            </div>

            <div className="pt-2 border-t border-[#e1e7df] flex items-center justify-end gap-3 pb-safe">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-[#e1e7df] text-[#17271f] rounded-lg text-xs font-semibold cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#286746] hover:bg-[#194a31] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-sm min-h-[42px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>File Formal Appeal Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
