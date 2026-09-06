import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  Upload, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  QrCode, 
  Smartphone, 
  X,
  FileText,
  Lock,
  PhoneCall,
  HelpCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Modern, Professional Dark-Themed UPI Checkout Modal
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Object} props.order - Dynamic customer & order information
 * @param {string} props.order.name - Customer full name
 * @param {string} props.order.email - Customer email address
 * @param {string} props.order.orderId - Application / Order reference ID (e.g. TFC-FEL-1024)
 * @param {number} props.order.amount - Exact amount in INR (default: 2000)
 * @param {string} [props.upiId] - Receiver UPI ID (default: dhruvmadan235@okhdfcbank)
 * @param {string} [props.qrImageUrl] - Path or URL to official UPI QR image (default: 'payment-qr.jpg')
 * @param {Function} [props.onSuccess] - Callback when UTR is verified
 */
export default function UpiCheckoutModal({
  isOpen,
  onClose,
  order = {
    name: 'Applicant Name',
    email: 'applicant@example.com',
    orderId: 'TFC-FEL-2026',
    amount: 2000
  },
  upiId = 'dhruvmadan235@okhdfcbank',
  payeeName = 'Dhruv Madan',
  qrImageUrl = 'payment-qr.jpg',
  onSuccess
}) {
  // Step Management: 'payment' | 'verification' | 'success'
  const [step, setStep] = useState('payment');
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'intent'
  
  // 10-Minute Countdown Timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerExpired, setTimerExpired] = useState(false);

  // UTR Form States
  const [utr, setUtr] = useState('');
  const [utrError, setUtrError] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Generate the official UPI standard payment URI
  const amountFormatted = (order.amount || 2000).toFixed(2);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountFormatted}&cu=INR&tn=${encodeURIComponent(order.orderId || 'TFC-FELLOWSHIP')}`;

  // App-specific Intent URLs
  const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountFormatted}&cu=INR&tn=${encodeURIComponent(order.orderId || 'TFC-FELLOWSHIP')}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountFormatted}&cu=INR&tn=${encodeURIComponent(order.orderId || 'TFC-FELLOWSHIP')}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountFormatted}&cu=INR&tn=${encodeURIComponent(order.orderId || 'TFC-FELLOWSHIP')}`;

  // Timer Countdown Effect
  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep('payment');
      setTimeLeft(600);
      setTimerExpired(false);
      setUtr('');
      setUtrError('');
      setScreenshot(null);
      setScreenshotPreview('');
      setIsSubmitting(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Format time MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Copy UPI ID to Clipboard
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Screenshot Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG/JPG).');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate UTR (Standard 12 digits)
  const handleUtrChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
    if (val.length <= 12) {
      setUtr(val);
      if (val.length === 12) {
        setUtrError('');
      }
    }
  };

  // Submit UTR Verification
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!utr || utr.length !== 12) {
      setUtrError('Please enter a valid 12-digit UPI Reference Number / UTR.');
      return;
    }

    setUtrError('');
    setIsSubmitting(true);

    try {
      // Simulate/Trigger callback
      if (onSuccess) {
        await onSuccess({
          orderId: order.orderId,
          utr: utr,
          screenshot: screenshotPreview,
          timestamp: new Date().toISOString()
        });
      } else {
        // Fallback simulate 1s network confirmation
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setStep('success');
    } catch (err) {
      setUtrError('Verification submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0d0d0d] border-2 border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                UPI Direct Checkout
              </h2>
              <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                <span>NPCI UPI 256-Bit Encrypted</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer Badge & Close */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
              timeLeft < 120 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                : 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Order Summary Strip */}
        <div className="px-5 py-3 bg-zinc-900/30 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <span className="text-zinc-400">Applicant: </span>
            <strong className="text-zinc-200 font-semibold">{order.name}</strong>
            <span className="text-zinc-500 mx-1.5">•</span>
            <span className="font-mono text-zinc-400">{order.orderId}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-zinc-400 text-[0.7rem] uppercase">Payable:</span>
            <span className="text-lg font-black text-emerald-400">₹{order.amount?.toLocaleString('en-IN') || '2,000'}</span>
          </div>
        </div>

        {/* STEP 1: PAYMENT (QR + UPI INTENT) */}
        {step === 'payment' && (
          <div className="p-5 space-y-5">
            {timerExpired ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-sm font-bold text-rose-300 uppercase">Session Expired</h3>
                <p className="text-xs text-zinc-400">This payment session has timed out. Please restart the checkout.</p>
                <button 
                  onClick={() => setTimeLeft(600)} 
                  className="px-4 py-1.5 bg-rose-500 text-black font-bold text-xs rounded-lg uppercase hover:bg-rose-400 transition"
                >
                  Restart Timer
                </button>
              </div>
            ) : (
              <>
                {/* Method Switcher Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition ${
                      activeTab === 'qr'
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan UPI QR</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('intent')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition ${
                      activeTab === 'intent'
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI App Intent</span>
                  </button>
                </div>

                {/* TAB: QR CODE VIEW */}
                {activeTab === 'qr' && (
                  <div className="flex flex-col items-center justify-center py-2 space-y-4">
                    {/* QR Code Card */}
                    <div className="p-3 bg-white rounded-2xl shadow-2xl border-2 border-zinc-700/60 relative group flex flex-col items-center max-w-[270px] w-full overflow-hidden">
                      {qrImageUrl ? (
                        <img 
                          src={qrImageUrl} 
                          alt={`${payeeName} UPI Payment QR`} 
                          className="w-full h-auto object-contain rounded-xl select-none"
                        />
                      ) : (
                        <>
                          <div className="text-center pb-2">
                            <span className="text-[0.72rem] font-black uppercase text-zinc-900 tracking-wider">
                              {payeeName}
                            </span>
                          </div>

                          {/* Dynamic QR SVG */}
                          <div className="bg-white p-2 rounded-xl">
                            <QRCodeSVG 
                              value={upiUri} 
                              size={190} 
                              level="H" 
                              includeMargin={false}
                            />
                          </div>

                          <div className="pt-2 text-center">
                            <span className="text-[0.65rem] font-semibold text-zinc-600 block">
                              Scan with any UPI App
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-[0.75rem] text-zinc-400 text-center font-medium">
                      Open <strong className="text-zinc-200">Google Pay, PhonePe, Paytm, CRED, or BHIM</strong> on your phone and scan the QR code above.
                    </p>
                  </div>
                )}

                {/* TAB: MOBILE APP INTENTS */}
                {activeTab === 'intent' && (
                  <div className="space-y-3 py-2">
                    <p className="text-xs text-zinc-400 text-center font-medium">
                      Tap your preferred app below to open directly with pre-filled amount (₹{order.amount}):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Google Pay */}
                      <a 
                        href={gpayUri}
                        className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-blue-500 hover:bg-zinc-800/80 transition text-xs font-bold text-white shadow-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-blue-600">G</div>
                        <span>Google Pay</span>
                      </a>

                      {/* PhonePe */}
                      <a 
                        href={phonepeUri}
                        className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-purple-500 hover:bg-zinc-800/80 transition text-xs font-bold text-white shadow-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#5f259f] flex items-center justify-center text-[10px] font-black text-white">Pe</div>
                        <span>PhonePe</span>
                      </a>

                      {/* Paytm */}
                      <a 
                        href={paytmUri}
                        className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-sky-400 hover:bg-zinc-800/80 transition text-xs font-bold text-white shadow-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#00b9f5] flex items-center justify-center text-[10px] font-black text-white">P</div>
                        <span>Paytm</span>
                      </a>
                    </div>

                    {/* Universal Fallback Button */}
                    <a 
                      href={upiUri}
                      className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider transition"
                    >
                      <span>Pay via Any UPI App (Universal Intent)</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Copy UPI ID Box */}
                <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[0.68rem] text-zinc-400 uppercase font-bold block">
                      Direct VPA / UPI ID
                    </span>
                    <span className="font-mono text-xs font-bold text-white truncate block select-all">
                      {upiId}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-bold transition shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instruction Banner */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[0.75rem] text-amber-300 leading-relaxed font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    <strong>Important:</strong> After completing the ₹{order.amount} transfer in your UPI app, click below and enter the <strong>12-digit UPI Transaction ID / UTR</strong> to activate your application.
                  </span>
                </div>

                {/* Trouble / Failed Transaction Helpline */}
                <div className="p-3 bg-zinc-900/95 border border-zinc-800 rounded-xl text-xs flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[0.72rem] text-zinc-300 font-medium block leading-snug">
                        If you face trouble or transaction is failing:
                      </span>
                      <span className="text-[0.68rem] text-zinc-500 block">Instant Payment Support Desk</span>
                    </div>
                  </div>
                  <a 
                    href="tel:9315095214" 
                    className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>9315095214</span>
                  </a>
                </div>

                {/* Primary Proceed to Step 2 Button */}
                <button
                  onClick={() => setStep('verification')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>I Have Paid ₹{order.amount} → Enter UPI Transaction ID</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 2: VERIFICATION (UTR INPUT & SCREENSHOT) */}
        {step === 'verification' && (
          <form onSubmit={handleVerifySubmit} className="p-5 space-y-4">
            <button
              type="button"
              onClick={() => setStep('payment')}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Payment QR / UPI Options</span>
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-black uppercase text-white tracking-wide">
                Confirm & Verify Transaction
              </h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Enter the 12-digit UPI Transaction ID / UTR Number from your payment receipt (Google Pay, PhonePe, Paytm, CRED, etc.) to link with application <strong>{order.orderId}</strong>.
              </p>
            </div>

            {/* 12-Digit UTR Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="utrInput" className="font-bold text-zinc-300 uppercase text-[0.72rem]">
                  12-Digit UPI Transaction ID / UTR <span className="text-rose-400">*</span>
                </label>
                <span className={`font-mono text-[0.7rem] ${utr.length === 12 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                  {utr.length}/12 digits
                </span>
              </div>

              <input
                id="utrInput"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                value={utr}
                onChange={handleUtrChange}
                placeholder="e.g. 423589104523 (UPI Transaction ID)"
                className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 rounded-xl font-mono text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition tracking-widest text-center"
                autoFocus
                required
              />

              {utrError && (
                <p className="text-rose-400 text-xs font-semibold flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{utrError}</span>
                </p>
              )}
            </div>

            {/* Optional Screenshot Upload */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-zinc-300 uppercase text-[0.72rem] block">
                Payment Screenshot <span className="text-zinc-500 text-[0.65rem] lowercase">(optional proof)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {screenshotPreview ? (
                <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={screenshotPreview} 
                      alt="Receipt preview" 
                      className="w-10 h-10 object-cover rounded-lg border border-zinc-700" 
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-200 block truncate">
                        {screenshot?.name || 'receipt_screenshot.png'}
                      </span>
                      <span className="text-[0.65rem] text-emerald-400 font-medium">Screenshot Attached ✓</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview('');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 p-1 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500 transition text-zinc-400 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Click to attach payment screenshot</span>
                </button>
              )}
            </div>

            {/* Trouble / Failed Transaction Helpline in Step 2 */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-xl text-[0.72rem] text-zinc-400 flex items-center justify-between gap-2">
              <span>Facing trouble or transaction failing?</span>
              <a href="tel:9315095214" className="text-orange-400 hover:text-orange-300 font-bold underline shrink-0 flex items-center gap-1">
                <span>Contact 9315095214</span>
              </a>
            </div>

            {/* Instructions */}
            <p className="text-[0.7rem] text-zinc-500 text-center font-medium pt-0.5">
              ⚠️ Do not close or reload this window until submission completes.
            </p>

            {/* Submit UTR Button */}
            <button
              type="submit"
              disabled={isSubmitting || utr.length !== 12}
              className={`w-full py-3.5 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                isSubmitting || utr.length !== 12
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Recording Verification...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Complete Payment ✓</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <span className="text-[0.7rem] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                Payment Complete ✓
              </span>
              <h3 className="text-2xl font-black uppercase text-white tracking-wide">
                Payment Complete
              </h3>
              
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1.5 max-w-md mx-auto">
                <p className="text-sm sm:text-base font-bold text-emerald-300 leading-snug">
                  Someone will reach you for further application within 24 hrs.
                </p>
                <p className="text-xs text-emerald-400 font-black uppercase tracking-wider">
                  Thank You!
                </p>
              </div>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left text-xs space-y-2 font-medium">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Applicant Name</span>
                <span className="font-bold text-white">{order.name}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Application ID</span>
                <span className="font-mono font-bold text-orange-400">{order.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">UPI Transaction ID / UTR</span>
                <span className="font-mono font-bold text-zinc-200">{utr}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Amount Paid</span>
                <span className="font-bold text-emerald-400">₹{order.amount?.toLocaleString('en-IN') || '2,000'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-zinc-400">Next Step</span>
                <span className="font-bold text-emerald-400 text-[0.72rem]">Team will contact within 24 hours</span>
              </div>
            </div>

            {/* Direct Helpline reminder in Success */}
            <p className="text-[0.75rem] text-zinc-500 font-medium">
              Have questions or need immediate assistance? Contact <a href="tel:9315095214" className="text-orange-400 font-bold hover:underline">9315095214</a>
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-xl border border-zinc-700 transition"
            >
              Done / Return to Fellowship Hub
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
