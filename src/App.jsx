import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import ReactMarkdown from 'react-markdown';
import { Upload, Scan, BrainCircuit, Loader2, FileText, CheckCircle2, AlertCircle, Sparkles, Tag, Calendar, Mail } from 'lucide-react';

// --- LOCAL INTELLIGENCE ENGINE ---

// 1. Sentiment Dictionaries
const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'success', 'approved', 'profit', 'growth', 'happy', 'love', 'best', 'confirm', 'win', 'positive', 'benefit', 'bonus', 'award'];
const NEGATIVE_WORDS = ['bad', 'poor', 'fail', 'error', 'denied', 'loss', 'decline', 'sad', 'hate', 'worst', 'reject', 'lose', 'negative', 'warning', 'alert', 'critical', 'danger', 'fee', 'charge'];

// 2. Local Analysis Logic
const analyzeLocal = (text) => {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // A. Sentiment Analysis
  let score = 0;
  let foundPositive = [];
  let foundNegative = [];

  words.forEach(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    
    if (POSITIVE_WORDS.includes(cleanWord)) {
      score++;
      if(!foundPositive.includes(cleanWord)) foundPositive.push(cleanWord);
    }
    if (NEGATIVE_WORDS.includes(cleanWord)) {
      score--;
      if(!foundNegative.includes(cleanWord)) foundNegative.push(cleanWord);
    }
  });

  let sentiment = "Neutral";
  let color = "text-gray-600";
  if (score > 0) { sentiment = "Positive"; color = "text-green-600"; }
  if (score < 0) { sentiment = "Negative"; color = "text-red-600"; }

  // B. Regex Extraction (Dates, Emails, Money)
  const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || [];
  const dates = text.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/g) || [];
  const money = text.match(/[$€£¥]\s?(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?/g) || [];

  // C. Summary Generation (First non-empty sentence)
  const sentences = text.split(/[.!?]/);
  const summary = sentences.find(s => s.trim().length > 10) || "No clear summary available.";

  return {
    sentiment,
    score,
    color,
    foundPositive,
    foundNegative,
    summary: summary.trim(),
    entities: { emails, dates, money }
  };
};

// --- COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    idle: "bg-gray-100 text-gray-500",
    processing: "bg-blue-100 text-blue-600 animate-pulse",
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${styles[status]}`}>
      {status === 'processing' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      {status === 'processing' ? "Scanning..." : status === 'idle' ? "Ready" : status}
    </span>
  );
};

// --- MAIN APP ---

export default function App() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setOcrText('');
      setAnalysis(null);
      setStatus('idle');
    }
  };

  const runProcess = async () => {
    if (!image) return;
    setStatus('processing');
    setProgress(0);

    try {
      // 1. Run OCR
      const result = await Tesseract.recognize(image, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(parseInt(m.progress * 100));
        }
      });
      
      const text = result.data.text;
      setOcrText(text);
      
      // 2. Run Local Analysis (Instant)
      if (text.trim().length > 0) {
        const results = analyzeLocal(text);
        setAnalysis(results);
        setStatus('success');
      } else {
        setStatus('error');
      }
      
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-800 max-w-6xl mx-auto">
      
      {/* Header */}
      <header className="mb-10 text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-2 border border-blue-100">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">Google Gemini powered</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Sentix
        </h1>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left: Input */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Image
            </h2>
            
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${image ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
            >
              {image ? (
                <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md object-contain" />
              ) : (
                <div className="space-y-3 py-8">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 font-medium">Click to upload image</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <button
              onClick={runProcess}
              disabled={!image || status === 'processing'}
              className={`w-full mt-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${!image ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl'}`}
            >
              {status === 'processing' ? `Scanning (${progress}%)...` : <><Scan className="w-5 h-5" /> Analyze Image</>}
            </button>
          </Card>
        </div>

        {/* Right: Output */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Results
              </h2>
              <StatusBadge status={status} />
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[600px] space-y-6">
              {/* RAW TEXT */}
              {ocrText && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Extracted Text</h3>
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono border border-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {ocrText}
                  </div>
                </div>
              )}

              {/* LOCAL ANALYSIS RESULTS */}
              {analysis && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 space-y-4">
                  
                  {/* Sentiment Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Sentiment Analysis</h3>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`text-2xl font-black ${analysis.color}`}>{analysis.sentiment}</span>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border">Score: {analysis.score}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      {analysis.foundPositive.map(w => (
                        <span key={w} className="px-2 py-1 bg-green-100 text-green-700 rounded-md border border-green-200 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {w}
                        </span>
                      ))}
                      {analysis.foundNegative.map(w => (
                        <span key={w} className="px-2 py-1 bg-red-100 text-red-700 rounded-md border border-red-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Smart Extraction */}
                  <div className="space-y-2">
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Key Details</h3>
                     
                     {/* Dates */}
                     {analysis.entities.dates.length > 0 && (
                       <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                         <Calendar className="w-5 h-5 text-indigo-500 mt-0.5" />
                         <div>
                           <p className="font-semibold text-sm">Dates Found</p>
                           <p className="text-sm text-gray-600">{analysis.entities.dates.join(", ")}</p>
                         </div>
                       </div>
                     )}

                     {/* Emails */}
                     {analysis.entities.emails.length > 0 && (
                       <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                         <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                         <div>
                           <p className="font-semibold text-sm">Emails Found</p>
                           <p className="text-sm text-gray-600">{analysis.entities.emails.join(", ")}</p>
                         </div>
                       </div>
                     )}

                     {/* Money */}
                     {analysis.entities.money.length > 0 && (
                       <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                         <div className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">$</div>
                         <div>
                           <p className="font-semibold text-sm">Financials</p>
                           <p className="text-sm text-gray-600">{analysis.entities.money.join(", ")}</p>
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              )}

              {!ocrText && (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 py-12">
                  <CheckCircle2 className="w-16 h-16 opacity-20" />
                  <p>Ready to analyze</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}