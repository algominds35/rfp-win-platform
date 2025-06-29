'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Copy, Loader2, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ProposalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfpName = searchParams.get('rfp');
  
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [error, setError] = useState('');
  const [usageError, setUsageError] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [rfpAnalysis, setRfpAnalysis] = useState<any>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [customBudget, setCustomBudget] = useState('');
  const [userRfps, setUserRfps] = useState<any[]>([]);
  const [selectedRfpId, setSelectedRfpId] = useState<string>('');

  useEffect(() => {
    // Set demo user if not set
    if (!localStorage.getItem('userEmail')) {
      localStorage.setItem('userEmail', 'demo@rfpwin.com');
      localStorage.setItem('userName', 'Demo User');
      localStorage.setItem('userPlan', 'professional');
      localStorage.setItem('demoMode', 'true');
    }
    
    // Clear any cached fake data
    localStorage.removeItem('companyProfile');
    localStorage.removeItem('demoData');
    
    loadCompanyProfile();
    loadUserRfps();
  }, []);

  const loadUserRfps = async () => {
    try {
      // Get current user email
      const userEmail = localStorage.getItem('userEmail') || 'demo-user@example.com';
      const response = await fetch(`/api/rfps?userId=${userEmail}`);
      const data = await response.json();
      if (data.success) {
        setUserRfps(data.rfps);
        // Auto-select the most recent RFP if available
        if (data.rfps.length > 0) {
          const mostRecent = data.rfps[0];
          setSelectedRfpId(mostRecent.id);
          setRfpAnalysis({
            id: mostRecent.id,
            title: mostRecent.title,
            client: mostRecent.description,
            requirements: mostRecent.requirements,
            evaluationCriteria: mostRecent.evaluation_criteria,
            timeline: mostRecent.deadline,
            budgetRange: mostRecent.budget_range,
            description: mostRecent.description
          });
        }
      }
    } catch (error) {
      console.error('Failed to load RFPs:', error);
    }
  };

  const loadCompanyProfile = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail') || 'demo-user@example.com';
      const response = await fetch(`/api/company?id=company-${userEmail}`);
      const data = await response.json();
      setCompanyProfile(data.profile);
    } catch (error) {
      console.error('Failed to load company profile:', error);
    }
  };

  const selectRfp = (rfpId: string) => {
    const selectedRfp = userRfps.find(rfp => rfp.id === rfpId);
    if (selectedRfp) {
      setSelectedRfpId(rfpId);
      setRfpAnalysis({
        id: selectedRfp.id,
        title: selectedRfp.title,
        client: selectedRfp.description,
        requirements: selectedRfp.requirements,
        evaluationCriteria: selectedRfp.evaluation_criteria,
        timeline: selectedRfp.deadline,
        budgetRange: selectedRfp.budget_range,
        description: selectedRfp.description
      });
    }
  };

  const generateProposal = async () => {
    if (!companyProfile || !rfpAnalysis) {
      setError('Missing company profile or RFP analysis. Please set up your company profile first.');
      return;
    }

    setGenerating(true);
    setError('');
    setUsageError(null);

    try {
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfpAnalysis: {
            ...rfpAnalysis,
            budgetRange: customBudget || companyProfile?.budget_range || rfpAnalysis?.budgetRange // Use custom budget, then company budget, then RFP budget
          },
          companyProfile,
          userId: localStorage.getItem('userEmail') || 'demo-user@example.com'
        }),
      });

      const result = await response.json();

      if (response.status === 429) {
        // Usage limit exceeded
        setUsageError(result);
      } else if (result.success) {
        setProposal(result.proposal);
      } else {
        setError(result.error || 'Failed to generate proposal');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Proposal generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadAsPDF = async () => {
    if (!proposal) return;
    
    setDownloadingPDF(true);
    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;
      
      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RFP Proposal', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`For: ${rfpName || 'RFP Project'}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.text(`Generated: ${new Date(proposal.generated_at).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Add metrics
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Proposal Metrics', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Compliance Score: ${proposal.compliance_score}%`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Win Probability: ${proposal.win_probability}%`, margin, yPosition);
      yPosition += 15;
      
      // Add Executive Summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(proposal.executive_summary, pageWidth - 2 * margin);
      summaryLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 10;
      
      // Add Complete Proposal
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Complete Proposal', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Clean up the content and split into lines
      const cleanContent = proposal.content
        .replace(/\*\*/g, '') // Remove bold markdown
        .replace(/##\s/g, '\n\n') // Convert h3 to line breaks
        .replace(/#\s/g, '\n\n') // Convert h2 to line breaks
        .replace(/\n{3,}/g, '\n\n'); // Remove excessive line breaks
      
      const contentLines = pdf.splitTextToSize(cleanContent, pageWidth - 2 * margin);
      contentLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      // Save the PDF
      const fileName = `rfp-proposal-${rfpName || 'generated'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print dialog
      window.print();
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (proposal) {
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
                <span className="ml-2 text-xl font-bold text-gray-900">Generated Proposal</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => copyToClipboard(proposal.content)}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-300"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </button>
                <button 
                  onClick={downloadAsPDF}
                  disabled={downloadingPDF}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {downloadingPDF ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold mb-4">Proposal Metrics</h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {proposal.compliance_score}%
                    </div>
                    <div className="text-sm text-green-700">Compliance Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {proposal.win_probability}%
                    </div>
                    <div className="text-sm text-blue-700">Win Probability</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Generated</div>
                    <div className="font-medium text-gray-900">
                      {new Date(proposal.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">For RFP:</h4>
                  <p className="text-sm text-gray-600">{rfpName}</p>
                </div>
              </div>
            </div>

            {/* Proposal Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Executive Summary */}
                <div className="p-6 border-b">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-semibold">Executive Summary</h2>
                  </div>
                  <div className="prose max-w-none">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      {proposal.executive_summary}
                    </div>
                  </div>
                </div>

                {/* Full Proposal */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Complete Proposal</h2>
                  <div className="prose max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: proposal.content.replace(/\n/g, '<br/>').replace(/## /g, '<h3 class="text-lg font-semibold mt-6 mb-3">').replace(/# /g, '<h2 class="text-xl font-semibold mt-6 mb-4">')
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button 
                  onClick={() => router.push('/upload')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  🔄 Analyze Another RFP
                </button>
                <button 
                  onClick={() => router.push('/profile')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  ✏️ Edit Company Profile
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
              <span className="ml-2 text-xl font-bold text-gray-900">Generate Proposal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Generate Winning Proposal</h1>
          <p className="text-gray-600">
            {rfpName ? `Creating proposal for: ${rfpName}` : 'AI will combine your RFP analysis with company profile to create a winning proposal'}
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
                  {usageError.remaining} of {usageError.limit} proposals remaining this month
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
                  Choose an upgrade option to continue generating proposals:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usageError.planType === 'basic' && (
                    <>
                      <button 
                        onClick={() => window.open('https://buy.stripe.com/7sYbJ34vI4R10Ix1HI0Fi03', '_blank')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        🚀 Upgrade to Professional
                        <div className="text-sm opacity-90">250 proposals/month - $299</div>
                      </button>
                      <button 
                        onClick={() => window.open('https://buy.stripe.com/5kQ00lfam2IT1MBeuu0Fi01', '_blank')}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        🏢 Upgrade to Enterprise
                        <div className="text-sm opacity-90">5,000 proposals/month - $799</div>
                      </button>
                    </>
                  )}
                  
                  {usageError.planType === 'professional' && (
                    <button 
                      onClick={() => window.open('https://buy.stripe.com/5kQ00lfam2IT1MBeuu0Fi01', '_blank')}
                      className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      🏢 Upgrade to Enterprise
                      <div className="text-sm opacity-90">5,000 proposals/month - $799</div>
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

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${companyProfile?.name ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center mb-2">
              <div className={`h-3 w-3 rounded-full mr-3 ${companyProfile?.name ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <h3 className="font-semibold">Company Profile</h3>
            </div>
            {companyProfile && companyProfile.name ? (
              <div>
                <p className="text-green-700 mb-2">✅ Profile Complete</p>
                <p className="text-sm text-gray-600">
                  {companyProfile.name} • {companyProfile.capabilities?.length || 0} capabilities
                </p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-700 mb-2">⚠️ Profile Incomplete</p>
                <Link href="/profile" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Set up company profile →
                </Link>
              </div>
            )}
          </div>

          <div className={`p-6 rounded-lg border ${userRfps.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center mb-2">
              <div className={`h-3 w-3 rounded-full mr-3 ${userRfps.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h3 className="font-semibold">RFP Selection</h3>
            </div>
            {userRfps.length > 0 ? (
              <div>
                <p className="text-green-700 mb-3">✅ {userRfps.length} RFP{userRfps.length > 1 ? 's' : ''} Available</p>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Choose RFP for proposal:
                  </label>
                  <select
                    value={selectedRfpId}
                    onChange={(e) => selectRfp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select an RFP...</option>
                    {userRfps.map((rfp) => (
                      <option key={rfp.id} value={rfp.id}>
                        {rfp.title} ({new Date(rfp.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  {rfpAnalysis && (
                    <p className="text-xs text-gray-600 mt-1">
                      {rfpAnalysis.requirements?.length || 0} requirements • {rfpAnalysis.evaluationCriteria?.length || 0} criteria
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-700 mb-2">❌ No RFP Analyses Found</p>
                <p className="text-sm text-gray-600 mb-2">Upload and analyze an RFP first</p>
                <Link href="/upload" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Upload & analyze RFP →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Budget Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              💰 Set Your Budget
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Specify your budget range for this proposal (optional - will use RFP analysis if left blank)
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <input
                  id="budget"
                  type="text"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder="e.g., $50,000 - $100,000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="text-xs text-gray-500">
                <p className="mb-1"><strong>Examples:</strong></p>
                <p>• $25,000 - $50,000</p>
                <p>• $100K - $250K</p>
                <p>• Up to $500,000</p>
                <p>• $1M - $2.5M</p>
              </div>
              
              {companyProfile?.budget_range && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Company Default Budget:</strong> {companyProfile.budget_range}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    From your company profile - leave blank to use this, or enter a different budget above
                  </p>
                </div>
              )}
              
              {rfpAnalysis?.budgetRange && !companyProfile?.budget_range && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>RFP Analysis Budget:</strong> {rfpAnalysis.budgetRange}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Leave blank to use this, or enter your preferred budget above
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={generateProposal}
            disabled={generating || !companyProfile || !companyProfile.name || !rfpAnalysis || !selectedRfpId}
            className="bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                🤖 AI is crafting your winning proposal with your budget...
              </>
            ) : (
              customBudget ? '🚀 Generate Proposal with Custom Budget' : '🚀 Generate Winning Proposal'
            )}
          </button>
          
          {(!companyProfile || !companyProfile.name || !rfpAnalysis || !selectedRfpId) && (
            <p className="text-sm text-gray-500 mt-2">
              Complete your company profile and select an RFP to generate proposal
            </p>
          )}
          
          {(customBudget || companyProfile?.budget_range) && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 text-center">
                  ✅ <strong>Budget Set:</strong> {customBudget || companyProfile?.budget_range}
                </p>
                <p className="text-xs text-green-600 text-center mt-1">
                  {customBudget ? 'Custom budget for this proposal' : 'Using your company default budget'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProposalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading proposal generator...</p>
        </div>
      </div>
    }>
      <ProposalContent />
    </Suspense>
  );
} 