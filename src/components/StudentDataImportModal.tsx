import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Clipboard,
  Download,
  Users,
  RefreshCw,
  FileText,
  Trash2,
  Info
} from 'lucide-react';
import { BulkImportStudentItem, BulkImportResponse } from '../lib/electionService';

interface StudentDataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: BulkImportResponse) => void;
  officerEmail?: string;
  officerRole?: string;
  bulkImportFn: (
    students: BulkImportStudentItem[],
    officerEmail?: string,
    officerRole?: string
  ) => Promise<BulkImportResponse>;
}

interface ParsedStudentRow {
  id: string;
  regNo: string;
  name: string;
  email: string;
  yearOfStudy: string;
  status: 'Eligible' | 'Action Required';
  isValid: boolean;
  validationIssue?: string;
}

export function StudentDataImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  officerEmail,
  officerRole,
  bulkImportFn,
}: StudentDataImportModalProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<BulkImportResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Normalizes year of study string to official KUPSA designations
  const normalizeYear = (val: any): string => {
    const s = String(val || '').trim();
    if (!s) return 'Year 1';
    if (/master/i.test(s)) return 'Masters';
    if (/^1$|^year\s*1/i.test(s)) return 'Year 1';
    if (/^2$|^year\s*2/i.test(s)) return 'Year 2';
    if (/^3$|^year\s*3/i.test(s)) return 'Year 3';
    if (/^4$|^year\s*4/i.test(s)) return 'Year 4';
    if (/^5$|^year\s*5/i.test(s)) return 'Year 5';
    return s.startsWith('Year') ? s : `Year ${s}`;
  };

  // Normalizes student email to @kabarak.ac.ke
  const normalizeEmail = (val: any, regNo?: string): string => {
    let s = String(val || '').trim().toLowerCase();
    if (!s && regNo) {
      // Auto-generate institutional email if missing
      const cleanReg = regNo.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `pharm.${cleanReg}@kabarak.ac.ke`;
    }
    if (s && !s.includes('@')) {
      return `${s}@kabarak.ac.ke`;
    }
    return s;
  };

  // Process raw object rows (from Excel or CSV parser)
  const processRawData = (rows: any[][]) => {
    if (!rows || rows.length === 0) {
      setSubmitError('The uploaded file appears to be empty.');
      return;
    }

    setSubmitError(null);
    setSuccessReport(null);

    // Identify header row or detect column indices
    let headerIdx = -1;
    let colReg = -1;
    let colName = -1;
    let colEmail = -1;
    let colYear = -1;

    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const row = rows[r].map((c) => String(c || '').toLowerCase().trim());
      const rIdx = row.findIndex((c) => c.includes('reg') || c.includes('adm') || c.includes('student id') || c.includes('number'));
      const nIdx = row.findIndex((c) => c.includes('name') || c.includes('student'));
      const eIdx = row.findIndex((c) => c.includes('email') || c.includes('mail'));
      const yIdx = row.findIndex((c) => c.includes('year') || c.includes('cohort') || c.includes('level') || c.includes('class'));

      if (rIdx !== -1 || nIdx !== -1 || eIdx !== -1) {
        headerIdx = r;
        colReg = rIdx;
        colName = nIdx;
        colEmail = eIdx;
        colYear = yIdx;
        break;
      }
    }

    // Fallbacks if no explicit headers found (assume Column 0: RegNo, 1: Name, 2: Email, 3: Year)
    if (headerIdx === -1) {
      colReg = 0;
      colName = 1;
      colEmail = 2;
      colYear = 3;
    }

    const startRow = headerIdx >= 0 ? headerIdx + 1 : 0;
    const results: ParsedStudentRow[] = [];
    const seenRegNos = new Set<string>();

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => !c || String(c).trim() === '')) continue;

      const rawReg = colReg >= 0 && row[colReg] !== undefined ? String(row[colReg]).trim().toUpperCase() : '';
      const rawName = colName >= 0 && row[colName] !== undefined ? String(row[colName]).trim() : '';
      const rawEmail = colEmail >= 0 && row[colEmail] !== undefined ? String(row[colEmail]).trim() : '';
      const rawYear = colYear >= 0 && row[colYear] !== undefined ? String(row[colYear]).trim() : 'Year 1';

      if (!rawReg && !rawName && !rawEmail) continue;

      const cleanReg = rawReg || `PHARM/2026/${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEmail = normalizeEmail(rawEmail, cleanReg);
      const cleanName = rawName || (cleanEmail ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ') : 'Student');
      const cleanYear = normalizeYear(rawYear);

      let isValid = true;
      let validationIssue: string | undefined = undefined;

      if (!cleanEmail.includes('@') || !cleanEmail.endsWith('@kabarak.ac.ke')) {
        isValid = false;
        validationIssue = 'Email must be @kabarak.ac.ke';
      } else if (seenRegNos.has(cleanReg)) {
        isValid = false;
        validationIssue = 'Duplicate registration number in spreadsheet';
      }

      if (cleanReg) seenRegNos.add(cleanReg);

      results.push({
        id: `row-${i}-${Date.now()}`,
        regNo: cleanReg,
        name: cleanName,
        email: cleanEmail,
        yearOfStudy: cleanYear,
        status: 'Eligible',
        isValid,
        validationIssue,
      });
    }

    if (results.length === 0) {
      setSubmitError('Could not find any student rows in this file. Please verify the spreadsheet contents.');
    }

    setParsedRows(results);
  };

  // Handle Binary Excel or CSV File Reading
  const handleFileUpload = (file: File) => {
    setIsProcessingFile(true);
    setFileName(file.name);
    setSubmitError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        processRawData(data);
      } catch (err: any) {
        console.error('File parsing error:', err);
        setSubmitError(`Failed to parse spreadsheet file: ${err.message || 'Unknown error'}`);
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setSubmitError('Failed to read the selected file.');
      setIsProcessingFile(false);
    };

    reader.readAsBinaryString(file);
  };

  // Handle Drag & Drop
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Parse Pasted Excel Text (Tab-separated or comma-separated)
  const handleParsePastedText = () => {
    if (!pasteContent.trim()) {
      setSubmitError('Please paste spreadsheet rows into the text box first.');
      return;
    }

    setIsProcessingFile(true);
    try {
      const lines = pasteContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const rows: string[][] = lines.map((line) => {
        if (line.includes('\t')) {
          return line.split('\t');
        } else {
          return line.split(',');
        }
      });
      setFileName('Pasted Clipboard Roster');
      processRawData(rows);
    } catch (err: any) {
      setSubmitError(`Failed to parse pasted data: ${err.message}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Download Sample Template
  const handleDownloadSample = () => {
    const sampleData = [
      ['Registration Number', 'Full Name', 'Student Email', 'Year of Study', 'Accreditation Status'],
      ['PHARM/M/1042/09/24', 'Faith Jepchumba', 'fjepchumba@kabarak.ac.ke', 'Year 3', 'Eligible'],
      ['PHARM/M/1055/09/23', 'Kelvin Kiprop', 'kkiprop@kabarak.ac.ke', 'Year 4', 'Eligible'],
      ['PHARM/M/1089/09/25', 'Sharon Cherono', 'scherono@kabarak.ac.ke', 'Year 2', 'Eligible'],
      ['PHARM/M/1102/09/26', 'Brian Omondi', 'bomondi@kabarak.ac.ke', 'Year 1', 'Eligible'],
      ['PHARM/M/1012/09/22', 'Mercy Wanjiku', 'mwanjiku@kabarak.ac.ke', 'Year 5', 'Eligible'],
      ['PHARM/MS/004/09/25', 'Dr. Emmanuel Rotich', 'erotich@kabarak.ac.ke', 'Masters', 'Eligible'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KUPSA_Voter_Roster');
    XLSX.writeFile(wb, 'kupsa_student_roster_template.xlsx');
  };

  // Remove a row from parsed state before committing
  const handleRemoveRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Submit to Database & Store
  const handleCommitImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setSubmitError('No valid rows available to import. Please check your data.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: BulkImportStudentItem[] = validRows.map((r) => ({
        regNo: r.regNo,
        name: r.name,
        email: r.email,
        yearOfStudy: r.yearOfStudy,
        status: r.status,
      }));

      const res = await bulkImportFn(payload, officerEmail, officerRole);
      setSuccessReport(res);
      onImportSuccess(res);
    } catch (err: any) {
      console.error('Import error:', err);
      setSubmitError(err.message || 'Failed to import student voter data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border-2 border-border bg-card shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                Import Student Voter Roll
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                  Excel & CSV
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Batch import verified pharmacy students directly from official faculty spreadsheets.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success Banner */}
          {successReport && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Student Roster Successfully Ingested!</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-mono">
                {successReport.message}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-ink text-ink-foreground px-4 py-2 text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
                >
                  Return to Voter Roll
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessReport(null);
                    setParsedRows([]);
                    setFileName(null);
                    setPasteContent('');
                  }}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Import Another Batch
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 text-destructive animate-fade-in">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Import Notice</p>
                <p>{submitError}</p>
              </div>
            </div>
          )}

          {/* Mode Selector & Template Download */}
          {!successReport && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="inline-flex rounded-xl bg-secondary p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setActiveMode('upload')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeMode === 'upload'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Excel / CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('paste')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeMode === 'paste'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    <span>Paste Rows from Excel</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-mono text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Sample Template (.xlsx)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              {activeMode === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[0.99]'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, .tsv, .txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary border border-border shadow-xs">
                      {isProcessingFile ? (
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {fileName ? fileName : 'Choose an Excel file or drop it here'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv, .tsv)
                      </p>
                    </div>
                    <span className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors">
                      Browse Computer
                    </span>
                  </div>
                </div>
              )}

              {/* Direct Paste Area */}
              {activeMode === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Copy cells in Excel (Ctrl+C) and paste below (Ctrl+V):</span>
                    <span className="font-mono">Columns: Reg No, Full Name, Email, Year</span>
                  </div>
                  <textarea
                    rows={6}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder={`PHARM/M/1042/09/24\tFaith Jepchumba\tfjepchumba@kabarak.ac.ke\tYear 3\nPHARM/M/1055/09/23\tKelvin Kiprop\tkkiprop@kabarak.ac.ke\tYear 4`}
                    className="w-full rounded-2xl border border-border bg-background p-4 text-xs font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    disabled={!pasteContent.trim() || isProcessingFile}
                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Parse Pasted Rows</span>
                  </button>
                </div>
              )}

              {/* Data Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold text-foreground">
                        Parsed Records Preview ({parsedRows.length} total)
                      </h3>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                        {validCount} ready
                      </span>
                      {invalidCount > 0 && (
                        <span className="rounded-full bg-amber-500/10 text-amber-700 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                          {invalidCount} warning
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setParsedRows([])}
                      className="text-xs text-muted-foreground hover:text-destructive font-mono cursor-pointer"
                    >
                      Clear Table
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto rounded-2xl border border-border bg-card shadow-inner">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/60 sticky top-0 border-b border-border text-muted-foreground font-mono">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Registration</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Cohort</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono">
                        {parsedRows.map((row, idx) => (
                          <tr
                            key={row.id}
                            className={`transition-colors ${
                              row.isValid ? 'hover:bg-secondary/30' : 'bg-destructive/5'
                            }`}
                          >
                            <td className="p-3 text-muted-foreground">{idx + 1}</td>
                            <td className="p-3 font-bold text-foreground">{row.regNo}</td>
                            <td className="p-3 font-sans text-foreground font-medium">{row.name}</td>
                            <td className="p-3 text-muted-foreground">{row.email}</td>
                            <td className="p-3">{row.yearOfStudy}</td>
                            <td className="p-3">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" /> Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-full" title={row.validationIssue}>
                                  <AlertTriangle className="h-3 w-3" /> {row.validationIssue || 'Invalid'}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                                title="Exclude row from import"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono bg-secondary/30 p-2.5 rounded-xl border border-border">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Each imported student receives an official KUPSA cryptographic 6-digit PIN and is certified as Eligible in the Accreditation Registry.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!successReport && (
            <button
              type="button"
              disabled={validCount === 0 || isSubmitting}
              onClick={handleCommitImport}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Importing {validCount} Students to Database...</span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5" />
                  <span>Commit {validCount} Students to Voter Roll</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
