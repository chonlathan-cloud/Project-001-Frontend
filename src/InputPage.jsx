import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, CheckCircle2, LoaderCircle, ReceiptText, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from './components/Loading';
import ConstructionAnimation from './components/ConstructionAnimation';
import {
  extractInputReceipt,
  getInputProjectOptions,
  submitInputRequest,
} from './api';

const ENTRY_TYPE_OPTIONS = [
  { value: 'EXPENSE', label: 'รายจ่าย' },
  { value: 'INCOME', label: 'รายรับ' },
];

const WORK_TYPE_OPTIONS = [
  { value: 'งานโครงสร้าง', label: 'งานโครงสร้าง' },
  { value: 'งานสถาปัตย์', label: 'งานสถาปัตย์' },
  { value: 'งานระบบ', label: 'งานระบบ' },
  { value: 'งานบริหารโครงการ', label: 'งานบริหารโครงการ' },
];

const REQUEST_TYPE_OPTIONS = [
  { value: 'ค่าวัสดุ', label: 'ค่าวัสดุ' },
  { value: 'ค่าแรง', label: 'ค่าแรง' },
  { value: 'ค่าเบิกล่วงหน้า', label: 'ค่าเบิกล่วงหน้า' },
  { value: 'ค่าใช้จ่ายทั่วไป', label: 'ค่าใช้จ่ายทั่วไป' },
];

const initialFormState = {
  entryType: 'EXPENSE',
  projectId: '',
  requesterName: '',
  phone: '',
  requestDate: new Date().toISOString().slice(0, 10),
  documentDate: '',
  workType: '',
  requestType: '',
  note: '',
  vendorName: '',
  receiptNo: '',
  bankName: '',
  accountNo: '',
  accountName: '',
  amount: '',
};

const fieldBaseStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: '#e6decb',
  border: '1px solid #bba684',
  fontSize: '14px',
  outline: 'none',
  color: '#333',
  transition: 'all 0.3s ease',
};

const InputField = ({
  label,
  placeholder,
  type = 'text',
  style = {},
  value,
  onChange,
  disabled = false,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {label && <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        ...fieldBaseStyle,
        textAlign: type === 'date' ? 'left' : 'center',
        opacity: disabled ? 0.65 : 1,
      }}
    />
  </div>
);

const SelectField = ({
  label,
  placeholder,
  options = [],
  style = {},
  value,
  onChange,
  disabled = false,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {label && <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          ...fieldBaseStyle,
          textAlign: 'center',
          appearance: 'none',
          color: value ? '#333' : '#666',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const TextAreaField = ({ label, placeholder, style = {}, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
    {label && <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      style={{
        ...fieldBaseStyle,
        resize: 'vertical',
        textAlign: 'left',
        minHeight: '104px',
      }}
    />
  </div>
);

const StatusBanner = ({ tone, text }) => {
  const palette =
    tone === 'error'
      ? { bg: '#fde8e8', border: '#de5b52', color: '#912018', Icon: TriangleAlert }
      : tone === 'warning'
        ? { bg: '#fff4de', border: '#c98c1c', color: '#8b5a00', Icon: TriangleAlert }
      : { bg: '#e6f5ec', border: '#27a57a', color: '#13654b', Icon: CheckCircle2 };
  const Icon = palette.Icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '14px',
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        fontSize: '14px',
        fontWeight: '600',
      }}
    >
      <Icon size={18} />
      <span>{text}</span>
    </div>
  );
};

const formatEntryTypeLabel = (entryType) =>
  ENTRY_TYPE_OPTIONS.find((option) => option.value === entryType)?.label || '-';

const InputPage = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractData, setExtractData] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [pageError, setPageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setPageError('');
        const items = await getInputProjectOptions();
        setProjects(items);
      } catch (error) {
        setPageError(error.message || 'Failed to load projects for the input form.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleFieldChange = (field) => (event) => {
    const nextValue = event.target.value;
    setForm((current) => ({ ...current, [field]: nextValue }));
  };

  const handleEntryTypeChange = (event) => {
    const nextType = event.target.value;
    setForm((current) => ({
      ...current,
      entryType: nextType,
      requestType:
        nextType === 'INCOME' && current.requestType === 'ค่าเบิกล่วงหน้า'
          ? ''
          : current.requestType,
    }));
    setSubmitError('');
    setSubmitResult(null);
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setExtractData(null);
    setSubmitError('');
    setFlashMessage('');

    try {
      setIsExtracting(true);
      const extracted = await extractInputReceipt(file);
      setExtractData(extracted);
      setForm((current) => ({
        ...current,
        amount: current.amount
          ? current.amount
          : extracted.total_amount == null
            ? ''
            : String(extracted.total_amount),
        documentDate: current.documentDate || extracted.document_date || '',
        requestType: current.requestType || extracted.suggested_request_type || '',
        vendorName: current.vendorName || extracted.vendor_name || '',
        receiptNo: current.receiptNo || extracted.receipt_no || '',
        note:
          current.note ||
          [extracted.vendor_name, extracted.receipt_no, extracted.document_date]
            .filter(Boolean)
            .join(' | '),
      }));
      setFlashMessage(`อ่านข้อมูลจาก ${file.name} สำเร็จแล้ว`);
    } catch (error) {
      setSubmitError(error.message || 'Failed to extract receipt data.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitResult(null);
    setFlashMessage('');

    if (!form.projectId) {
      setSubmitError('กรุณาเลือกโครงการก่อนส่งคำขอ');
      return;
    }
    if (!form.requesterName.trim()) {
      setSubmitError('กรุณากรอกชื่อ - นามสกุล');
      return;
    }
    if (!form.requestDate) {
      setSubmitError('กรุณาระบุวันที่');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setSubmitError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitInputRequest({
        project_id: form.projectId,
        entry_type: form.entryType,
        requester_name: form.requesterName.trim(),
        phone: form.phone.trim() || null,
        request_date: form.requestDate,
        document_date: form.documentDate || form.requestDate,
        work_type: form.workType || null,
        request_type: form.requestType || null,
        note: form.note.trim() || null,
        vendor_name: form.vendorName.trim() || null,
        receipt_no: form.receiptNo.trim() || null,
        bank_account: {
          bank_name: form.bankName.trim() || null,
          account_no: form.accountNo.trim() || null,
          account_name: form.accountName.trim() || form.requesterName.trim(),
        },
        amount: Number(form.amount),
        receipt_file_name: selectedFile?.name || extractData?.file_name || null,
        receipt_content_type: selectedFile?.type || extractData?.content_type || null,
        receipt_storage_key: null,
      });

      setSubmitResult(response);
      setFlashMessage('ส่งคำขอเรียบร้อยแล้ว');
      setForm({
        ...initialFormState,
        entryType: form.entryType,
      });
      setSelectedFile(null);
      setExtractData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit input request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (pageError) {
    return (
      <div className="card" style={{ backgroundColor: 'white', color: '#de5b52' }}>
        {pageError}
      </div>
    );
  }

  const isIncome = form.entryType === 'INCOME';
  const projectOptions = projects.map((project) => ({
    value: project.project_id,
    label: project.name,
  }));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: '700', color: '#1a1a1a' }}>
        Input
      </h1>

      <motion.div
        layout
        style={{
          display: 'flex',
          flexDirection: isIncome ? 'row-reverse' : 'row',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        <motion.div layout style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div
              className="card"
              style={{
                backgroundColor: 'white',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              }}
            >
              <AnimatePresence mode="popLayout">
                {flashMessage ? (
                  <motion.div
                    key="flash-message"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <StatusBanner tone="success" text={flashMessage} />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {submitError ? <StatusBanner tone="error" text={submitError} /> : null}

              <SelectField
                label="รายจ่าย / รายรับ"
                placeholder="เลือกรายการที่ทำ"
                options={ENTRY_TYPE_OPTIONS}
                value={form.entryType}
                onChange={handleEntryTypeChange}
                style={{ width: '60%' }}
              />

              <SelectField
                label="โครงการ"
                placeholder="กรุณาเลือกโครงการ"
                options={projectOptions}
                value={form.projectId}
                onChange={handleFieldChange('projectId')}
                style={{ width: '60%' }}
              />

              <InputField
                label="ชื่อ - นามสกุล"
                placeholder="กรุณากรอกชื่อ-นามสกุล"
                value={form.requesterName}
                onChange={handleFieldChange('requesterName')}
                style={{ width: '60%' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField
                  label="เบอร์ติดต่อ"
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                  value={form.phone}
                  onChange={handleFieldChange('phone')}
                />
                <InputField
                  label="วัน/เดือน/ปี"
                  type="date"
                  value={form.requestDate}
                  onChange={handleFieldChange('requestDate')}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField
                  label="เลขที่ใบเสร็จ"
                  placeholder="กรุณากรอกเลขที่ใบเสร็จ"
                  value={form.receiptNo}
                  onChange={handleFieldChange('receiptNo')}
                />
                <InputField
                  label="วันที่เอกสาร"
                  type="date"
                  value={form.documentDate}
                  onChange={handleFieldChange('documentDate')}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <SelectField
                  label="ประเภทงาน"
                  placeholder="กรุณาเลือก"
                  options={WORK_TYPE_OPTIONS}
                  value={form.workType}
                  onChange={handleFieldChange('workType')}
                />
                <SelectField
                  label="ประเภทการเบิก"
                  placeholder="กรุณาเลือก"
                  options={REQUEST_TYPE_OPTIONS}
                  value={form.requestType}
                  onChange={handleFieldChange('requestType')}
                />
              </div>

              <InputField
                label="ผู้ขาย / ร้านค้า"
                placeholder="กรุณากรอกชื่อร้านหรือผู้ขาย"
                value={form.vendorName}
                onChange={handleFieldChange('vendorName')}
                style={{ width: '60%' }}
              />

              <TextAreaField
                label="อื่น ๆ"
                placeholder="ถ้ามี กรุณากรอกรายละเอียด"
                value={form.note}
                onChange={handleFieldChange('note')}
                style={{ width: '100%' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField
                  label="ธนาคาร"
                  placeholder="กรุณากรอก"
                  value={form.bankName}
                  onChange={handleFieldChange('bankName')}
                />
                <InputField
                  label="จำนวนเงินที่ขอเบิก"
                  placeholder="กรุณากรอก"
                  type="number"
                  value={form.amount}
                  onChange={handleFieldChange('amount')}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InputField
                  label="เลขที่บัญชี"
                  placeholder="กรุณากรอก"
                  value={form.accountNo}
                  onChange={handleFieldChange('accountNo')}
                />
                <InputField
                  label="ชื่อบัญชี"
                  placeholder="กรุณากรอก"
                  value={form.accountName}
                  onChange={handleFieldChange('accountName')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handlePickFile}
                  style={{
                    width: '100%',
                    height: '140px',
                    backgroundColor: '#e6decb',
                    border: '1px solid #bba684',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: '#1a1a1a',
                  }}
                >
                  {isExtracting ? (
                    <>
                      <LoaderCircle size={18} className="spin" />
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>กำลังอ่านข้อมูลจากบิล...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {selectedFile ? selectedFile.name : 'Upload Image bank bill'}
                      </span>
                      <ArrowUp size={16} />
                    </>
                  )}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#c9a15c',
                    color: 'black',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 48px',
                    fontSize: '20px',
                    fontWeight: '700',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    width: '160px',
                    boxShadow: '0 4px 15px rgba(201, 161, 92, 0.3)',
                    opacity: isSubmitting ? 0.75 : 1,
                  }}
                >
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่ง'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        <motion.div
          layout
          style={{
            flex: 1,
            backgroundColor: '#f9f6f0',
            minHeight: '800px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #ede4d3',
          }}
        >
          <div style={{ width: '100%', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence mode="wait">
              {submitResult ? (
                <motion.div
                  key="submit-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                >
                  <StatusBanner
                    tone="success"
                    text={`สร้างคำขอสำเร็จ สถานะ ${submitResult.status || 'PENDING_ADMIN'}`}
                  />
                  {submitResult.is_duplicate_flag ? (
                    <StatusBanner
                      tone="warning"
                      text={submitResult.duplicate_reason || 'พบรายการซ้ำตามกฎ Receipt No. + Date + Amount'}
                    />
                  ) : null}
                  <div className="card" style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px' }}>
                    <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Submission Summary</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div><strong>Request ID:</strong> {submitResult.request_id}</div>
                      <div><strong>Project:</strong> {submitResult.project_name}</div>
                      <div><strong>Type:</strong> {formatEntryTypeLabel(submitResult.entry_type)}</div>
                      <div><strong>Requester:</strong> {submitResult.requester_name}</div>
                      <div><strong>Vendor:</strong> {submitResult.vendor_name || '-'}</div>
                      <div><strong>Receipt No:</strong> {submitResult.receipt_no || '-'}</div>
                      <div><strong>Document Date:</strong> {submitResult.document_date || '-'}</div>
                      <div><strong>Amount:</strong> {Number(submitResult.amount || 0).toLocaleString()} THB</div>
                      <div><strong>Status:</strong> {submitResult.status}</div>
                    </div>
                  </div>
                </motion.div>
              ) : extractData ? (
                <motion.div
                  key="extract-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                >
                  <div className="card" style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <ReceiptText size={20} />
                      <h2 style={{ fontSize: '22px', margin: 0 }}>OCR Preview</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                      <div><strong>File:</strong> {extractData.file_name}</div>
                      <div><strong>Vendor:</strong> {extractData.vendor_name || '-'}</div>
                      <div><strong>Receipt No:</strong> {extractData.receipt_no || '-'}</div>
                      <div><strong>Date:</strong> {extractData.document_date || '-'}</div>
                      <div><strong>Suggested:</strong> {extractData.suggested_request_type || '-'}</div>
                      <div><strong>Total:</strong> {Number(extractData.total_amount || 0).toLocaleString()} THB</div>
                      <div><strong>Entry Type:</strong> {formatEntryTypeLabel(extractData.suggested_entry_type)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {extractData.items?.map((item, index) => (
                        <div
                          key={`${item.description}-${index}`}
                          style={{
                            backgroundColor: '#f9f6f0',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <span>{item.description}</span>
                          <span>{item.qty} x {item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#1a1a1a' }}>
                      Input Workflow Preview
                    </h2>
                    <p style={{ color: '#6b6256', lineHeight: 1.6 }}>
                      เลือกโครงการ อัปโหลดใบเสร็จเพื่อลอง OCR mock และส่งคำขอเข้า backend ใหม่ที่ออกแบบตาม flow
                      ของ subcontractor input และ admin review
                    </p>
                  </div>
                  <ConstructionAnimation />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InputPage;
