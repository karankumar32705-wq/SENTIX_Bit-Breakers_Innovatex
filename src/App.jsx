import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { 
  Upload, Scan, BrainCircuit, Loader2, FileText, 
  CheckCircle2, AlertCircle, Tag, Calendar, Mail, 
  RotateCcw, DollarSign, BarChart3, ChevronRight, 
  Sparkles, X, ArrowRight
} from 'lucide-react';

// --- LOCAL INTELLIGENCE ENGINE (Unchanged Logic) ---
const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'success', 'approved', 'profit', 'growth', 'happy', 'love', 'best', 'confirm', 'win', 'positive', 'benefit', 'bonus', 'award', 'strong', 'upward'];
const NEGATIVE_WORDS = ['bad', 'poor', 'fail', 'error', 'denied', 'loss', 'decline', 'sad', 'hate', 'worst', 'reject', 'lose', 'negative', 'warning', 'alert', 'critical', 'danger', 'fee', 'charge', 'downward', 'risk'];

const analyzeLocal = (text) => {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let score = 0;
  let foundPositive = [];
  let foundNegative = [];

  words.forEach(word => {
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
  let color = "text-slate-600";
  let bg = "bg-slate-100";
  let border = "border-slate-200";
  
  if (score > 0) { sentiment = "Positive"; color = "text-emerald-600"; bg="bg-emerald-50"; border="border-emerald-200"; }
  if (score < 0) { sentiment = "Negative"; color = "text-rose-600"; bg="bg-rose-50"; border="border-rose-200"; }

  const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || [];
  const dates = text.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/g) || [];
  const money = text.match(/[$€£¥]\s?(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?/g) || [];

  return { sentiment, score, color, bg, border, foundPositive, foundNegative, entities: { emails, dates, money } };
};

// --- UI COMPONENTS ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ icon: Icon, label, value, colorClass = "bg-slate-100 text-slate-700" }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${colorClass}`}>
    {Icon && <Icon className="w-3 h-3" />}
    <span>{label}: {value}</span>
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, ready, processing, success, error
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setOcrText('');
      setAnalysis(null);
      setStatus('ready');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setImage(null);
    setOcrText('');
    setAnalysis(null);
    setStatus('idle');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runProcess = async () => {
    if (!image) return;
    setStatus('processing');
    setProgress(0);

    try {
      const result = await Tesseract.recognize(image, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(parseInt(m.progress * 100));
        }
      });
      
      const text = result.data.text;
      setOcrText(text);
      
      if (text.trim().length > 0) {
        const results = analyzeLocal(text);
        setAnalysis(results);
        setStatus('success');
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-violet-200">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              Sentix<span className="font-extrabold text-violet-600">.ai</span>
            </span>
          </div>
          
          {status !== 'idle' && (
            <button 
              onClick={handleReset}
              className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-full border border-slate-200 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500 text-slate-400 group-hover:text-violet-600" />
              New Scan
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* HERO SECTION / UPLOAD */}
        <div className={`transition-all duration-700 ease-in-out ${status === 'success' ? 'opacity-100' : 'min-h-[80vh] flex flex-col justify-center'}`}>
          
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input Area */}
            <div className={`lg:col-span-5 space-y-6 ${status === 'success' ? 'sticky top-28' : ''}`}>
              
              {status === 'idle' && (
                 <div className="mb-6 animate-in slide-in-from-bottom-4 duration-700">
                   <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                     Analyze documents in <span className="text-violet-600">seconds</span>
                   </h1>
                   <p className="text-lg text-slate-500 leading-relaxed">
                     Upload any image containing text. We'll extract the data, detect sentiment, and identify key entities instantly.
                   </p>
                 </div>
              )}

              <Card className="p-1">
                <div 
                  onClick={() => status !== 'processing' && fileInputRef.current.click()}
                  className={`
                    relative group cursor-pointer rounded-[20px] border-2 border-dashed transition-all duration-300 min-h-[320px] flex flex-col items-center justify-center p-8 overflow-hidden
                    ${!image 
                      ? 'border-slate-300 bg-slate-50/50 hover:bg-violet-50/50 hover:border-violet-300' 
                      : 'border-slate-200 bg-white'}
                  `}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  
                  {/* Background Decoration */}
                  {!image && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-violet-200/40 to-indigo-200/40 blur-[60px] rounded-full" />
                    </div>
                  )}

                  {image ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                       <img src={image} alt="Preview" className="max-h-[300px] object-contain rounded-lg shadow-sm z-10" />
                       <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors rounded-lg z-20 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Change Image
                          </span>
                       </div>
                    </div>
                  ) : (
                    <div className="relative z-10 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-lg shadow-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-violet-200 transition-all duration-300">
                        <Upload className="w-8 h-8 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-700">Click to upload</p>
                        <p className="text-sm text-slate-400">SVG, PNG, JPG or GIF</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Area */}
                <div className="p-4 border-t border-slate-100 bg-white/50">
                  {status === 'processing' ? (
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                          <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Processing</span>
                          <span>{progress}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                       </div>
                    </div>
                  ) : (
                    <button
                      onClick={runProcess}
                      disabled={!image}
                      className={`
                        w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                        ${!image 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0'}
                      `}
                    >
                      <Scan className="w-5 h-5" /> Analyze Document
                    </button>
                  )}
                </div>
              </Card>
            </div>

            {/* Right: Results Area */}
            <div className="lg:col-span-7" ref={resultsRef}>
              
              {analysis ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                  
                  {/* Result Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" /> Analysis Results
                    </h2>
                    <Badge icon={CheckCircle2} label="Status" value="Complete" colorClass="bg-green-100 text-green-700" />
                  </div>

                  {/* BENTO GRID LAYOUT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. Sentiment (Large Box) */}
                    <Card className={`md:col-span-2 p-6 ${analysis.bg} border ${analysis.border}`}>
                       <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-1">Detected Sentiment</p>
                            <h3 className={`text-4xl font-black ${analysis.color} tracking-tight`}>{analysis.sentiment}</h3>
                          </div>
                          <div className={`p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 ${analysis.color}`}>
                            {analysis.score > 0 ? <Sparkles className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                          </div>
                       </div>
                       
                       <div className="mt-6 flex flex-wrap gap-2">
                          {analysis.foundPositive.map((w,i) => (
                             <span key={i} className="px-2 py-1 bg-white/60 rounded-md text-xs font-medium text-emerald-700 border border-emerald-100 shadow-sm">{w}</span>
                          ))}
                          {analysis.foundNegative.map((w,i) => (
                             <span key={i} className="px-2 py-1 bg-white/60 rounded-md text-xs font-medium text-rose-700 border border-rose-100 shadow-sm">{w}</span>
                          ))}
                          {analysis.foundPositive.length === 0 && analysis.foundNegative.length === 0 && (
                            <span className="text-sm text-slate-400 italic">No strong keywords detected</span>
                          )}
                       </div>
                    </Card>

                    {/* 2. Score */}
                    <Card className="p-5 flex flex-col justify-between group">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Net Score</span>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-800">{analysis.score}</div>
                        <p className="text-xs text-slate-500">Calculated via lexical analysis</p>
                      </div>
                    </Card>

                    {/* 3. Financials */}
                    <Card className="p-5 flex flex-col justify-between group">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Money</span>
                      </div>
                      <div>
                        {analysis.entities.money.length > 0 ? (
                           <div className="font-mono text-lg font-semibold text-slate-700 truncate">
                             {analysis.entities.money[0]}
                             {analysis.entities.money.length > 1 && <span className="text-xs text-slate-400 ml-2">+{analysis.entities.money.length - 1} more</span>}
                           </div>
                        ) : (
                          <div className="text-slate-400 text-sm">No amounts found</div>
                        )}
                      </div>
                    </Card>

                    {/* 4. Emails & Dates (Full Width) */}
                    <Card className="md:col-span-2 p-0">
                      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                         {/* Emails */}
                         <div className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                               <Mail className="w-4 h-4 text-blue-500" />
                               <span className="text-sm font-bold text-slate-600">Emails Detected</span>
                            </div>
                            <div className="space-y-1">
                               {analysis.entities.emails.length > 0 ? analysis.entities.emails.map((email, idx) => (
                                 <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-100 px-2 py-1.5 rounded-md shadow-sm">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> {email}
                                 </div>
                               )) : <span className="text-sm text-slate-400 italic pl-1">None found</span>}
                            </div>
                         </div>

                         {/* Dates */}
                         <div className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                               <Calendar className="w-4 h-4 text-orange-500" />
                               <span className="text-sm font-bold text-slate-600">Dates Detected</span>
                            </div>
                             <div className="flex flex-wrap gap-2">
                               {analysis.entities.dates.length > 0 ? analysis.entities.dates.map((date, idx) => (
                                 <span key={idx} className="text-sm font-medium text-slate-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                                   {date}
                                 </span>
                               )) : <span className="text-sm text-slate-400 italic pl-1">None found</span>}
                            </div>
                         </div>
                      </div>
                    </Card>

                    {/* 5. Raw Text */}
                    <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-slate-300">
                      <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Raw Text Extraction</span>
                      </div>
                      <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed opacity-80 whitespace-pre-line selection:bg-violet-500/30">
                        {ocrText}
                      </div>
                    </Card>

                  </div>
                  
                  {/* Floating Action / Footer Action */}
                  <div className="flex justify-center pt-8 pb-12">
                    <button 
                       onClick={handleReset}
                       className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md rounded-full text-slate-600 font-medium transition-all group"
                    >
                       <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                       Start New Scan
                    </button>
                  </div>

                </div>
              ) : (
                /* Empty State Visualization */
                <div className="hidden lg:flex h-full flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl min-h-[500px] bg-slate-50/50">
                   <div className="relative mb-6">
                      <div className="absolute inset-0 bg-violet-100 rounded-full blur-xl opacity-50"></div>
                      <BrainCircuit className="w-24 h-24 relative z-10 text-slate-300/80" />
                   </div>
                   <p className="text-lg font-medium text-slate-400">Results will appear here</p>
                   <p className="text-sm text-slate-300">Awaiting document scan...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}