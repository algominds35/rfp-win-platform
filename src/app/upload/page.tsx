'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please upload a PDF file only');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [usageError, setUsageError] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setUsageError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'demo-user'); // In production, get from auth
      
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.status === 429) {
        // Usage limit exceeded
        setUsageError(result);
      } else if (result.success) {
        setAnalysisResults(result.analysis);
        setShowResults(true);
      } else {
        setError(result.error || 'Failed to analyze RFP');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setShowResults(false);
  };

  // THIS IS THE AI RESULTS PAGE!
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="mr-4">
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div className="h-8 w-8 bg-blue-600 rounded"></div>
                <span className="ml-2 text-xl font-bold text-gray-900">🤖 AI Analysis Complete</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold">🎯 AI Analysis Complete!</h2>
            </div>
            
            <div className="space-y-8">
              {/* File Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📄 Analyzed Document</h3>
                <p className="text-blue-800">{file?.name}</p>
              </div>

              {/* Key Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">🎯 Key Requirements Identified</h3>
                <div className="grid gap-3">
                  {(analysisResults?.requirements || []).map((req: string, index: number) => (
                    <div key={index} className="flex items-start bg-gray-50 p-3 rounded">
                      <span className="text-blue-600 mr-3 font-bold">•</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div>
                <h3 className="text-lg font-semibold mb-4">⚖️ Evaluation Criteria & Weights</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(analysisResults?.evaluation_criteria || []).map((criteria: any, index: number) => {
                    const colors = [
                      'from-blue-100 to-blue-50 text-blue-900',
                      'from-green-100 to-green-50 text-green-900', 
                      'from-orange-100 to-orange-50 text-orange-900',
                      'from-purple-100 to-purple-50 text-purple-900'
                    ];
                    return (
                      <div key={index} className={`bg-gradient-to-r ${colors[index % colors.length]} p-4 rounded-lg`}>
                        <div className="font-bold">{criteria.criterion}</div>
                        <div className="text-2xl font-bold">{criteria.weight}%</div>
                        <div className="text-sm opacity-80">
                          {criteria.weight >= 30 ? 'High priority - focus here!' : 
                           criteria.weight >= 20 ? 'Important factor' : 
                           'Consider in proposal'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">🤖 AI Strategy Recommendations</h3>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-l-4 border-green-500">
                  <div className="space-y-3">
                    <p className="font-semibold text-green-800">🏆 WINNING STRATEGY:</p>
                    <ul className="space-y-2 text-green-700">
                      {(analysisResults?.strategy_recommendations || []).map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                    {analysisResults?.timeline && (
                      <p className="text-sm text-green-600 mt-3">
                        📅 Timeline: {analysisResults.timeline} | 💰 Budget: {analysisResults.budget_range}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div>
                <h3 className="text-lg font-semibold mb-4">⚠️ Risk Factors</h3>
                <div className="grid gap-3">
                  {(analysisResults?.risk_factors || []).map((risk: string, index: number) => (
                    <div key={index} className={`p-3 rounded border-l-4 ${
                      index % 2 === 0 ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
                    }`}>
                      <span className={`font-semibold ${
                        index % 2 === 0 ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {index % 2 === 0 ? 'HIGH RISK: ' : 'MEDIUM RISK: '}
                      </span>
                      <span className={index % 2 === 0 ? 'text-red-700' : 'text-yellow-700'}>
                        {risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t">
                <button 
                  onClick={() => router.push(`/proposal?rfp=${encodeURIComponent(file?.name || '')}`)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                >
                  <span>🚀 Generate Winning Proposal</span>
                </button>
                <button 
                  onClick={() => router.push('/profile')}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  👤 Setup Company Profile
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  📊 Export Analysis
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="h-8 w-8 bg-blue-600 rounded"></div>
              <span className="ml-2 text-xl font-bold text-gray-900">Upload RFP</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your RFP</h1>
          <p className="text-gray-600">
            Upload your RFP document and get instant AI-powered analysis
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Usage Limit Exceeded */}
        {usageError && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                Monthly Usage Limit Reached
              </h3>
              <p className="text-orange-800 mb-4">
                {usageError.message}
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Your Current Plan:</div>
                <div className="text-lg font-semibold text-gray-900 capitalize mb-1">
                  {usageError.planType} Plan
                </div>
                <div className="text-sm text-gray-600">
                  {usageError.remaining} of {usageError.limit} analyses remaining this month
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${((usageError.limit - usageError.remaining) / usageError.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-orange-700 mb-4">
                  Choose an upgrade option to continue analyzing RFPs:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usageError.planType === 'basic' && (
                    <>
                      <button 
                        onClick={() => window.open('https://buy.stripe.com/test_5kQ00lfam2IT1MBeuu0Fi01', '_blank')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        🚀 Upgrade to Professional
                        <div className="text-sm opacity-90">250 analyses/month - $299</div>
                      </button>
                      <button 
                        onClick={() => window.open('https://buy.stripe.com/test_dRm9AVfam1EP1MBbii0Fi00', '_blank')}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        🏢 Upgrade to Enterprise
                        <div className="text-sm opacity-90">5,000 analyses/month - $799</div>
                      </button>
                    </>
                  )}
                  
                  {usageError.planType === 'professional' && (
                    <button 
                      onClick={() => window.open('https://buy.stripe.com/test_dRm9AVfam1EP1MBbii0Fi00', '_blank')}
                      className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      🏢 Upgrade to Enterprise
                      <div className="text-sm opacity-90">5,000 analyses/month - $799</div>
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  Your usage limit will reset on the 1st of next month
                </div>
              </div>
            </div>
          </div>
        )}

        {!file ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop your RFP PDF here
            </h3>
            <p className="text-gray-600 mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-gray-500">
              PDF files only, up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  🤖 AI is analyzing your RFP...
                </>
              ) : (
                '🚀 Analyze RFP with AI'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}