'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, HelpCircle, Building2, Globe, CreditCard, Users, ShoppingCart, Monitor, Download, X, ExternalLink, Save, RotateCcw, Clock, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'adyen-scoping-questionnaire';

// ⚠️ REPLACE THIS with your Google Apps Script Web App URL
// Follow the instructions in SETUP.md to get this URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPM30_2YoQryrd03h3l64Fpvc-sZb4r5VdeYMy5f3oxkSFcyKeVw9Iex6dtUk53CQ/exec';

const questionnaire = {
  sections: [
    {
      id: 'general',
      title: 'General Information',
      icon: Building2,
      description: 'Basic details about your platform and business',
      docLink: 'https://docs.adyen.com/platforms',
      questions: [
        { id: 'platform_website', label: 'Platform Website', type: 'text', placeholder: 'https://yourplatform.com', help: 'Your main public-facing website' },
        { id: 'platform_name', label: 'Platform Name', type: 'text', placeholder: 'Your Platform Inc.', help: 'The name that will appear in the Adyen dashboard' },
        { id: 'company_account_name', label: 'Company Account Name', type: 'text', placeholder: 'YourPlatform_Corp', help: 'Back office identifier in Adyen' },
        { id: 'contact_name', label: 'Your Name', type: 'text', placeholder: 'John Smith', help: 'Primary contact for this questionnaire' },
        { id: 'contact_email', label: 'Your Email', type: 'text', placeholder: 'john@company.com', help: 'We\'ll use this to follow up' },
        { id: 'expected_go_live', label: 'Expected Go-Live Date', type: 'date', help: 'When do you plan to launch your pilot?' },
      ]
    },
    {
      id: 'business',
      title: 'Business Model',
      icon: Globe,
      description: 'How your platform operates',
      docLink: 'https://docs.adyen.com/platforms/account-structure-resources/platform-structure',
      questions: [
        { id: 'countries', label: 'Which countries/regions will you operate in?', type: 'multiselect', options: ['United States', 'Canada', 'United Kingdom', 'European Union', 'Australia', 'Other'], help: 'Select all regions where you need payment processing', docLink: 'https://docs.adyen.com/platforms' },
        { id: 'business_model', label: 'What is your business model?', type: 'select', options: [{ value: 'mor', label: 'Merchant of Record (MOR)', desc: 'You process payments on behalf of sellers' }, { value: 'payfac', label: 'Payment Facilitator (PayFac)', desc: 'You onboard sub-merchants under your account' }, { value: 'partner', label: 'Partner Model', desc: 'You refer merchants to Adyen' }], help: 'This determines how payments flow through your platform', docLink: 'https://docs.adyen.com/platforms/account-structure-resources/platform-structure' },
        { id: 'channels', label: 'Which payment channels will you implement?', type: 'multiselect', options: ['In-Person (IPP/POS)', 'E-commerce (Online)'], help: 'Select all that apply. The In-Person section will appear if you select IPP/POS.' },
      ]
    },
    {
      id: 'submerchants',
      title: 'Sub-Merchants',
      icon: Users,
      description: 'Information about your sellers/merchants',
      docLink: 'https://docs.adyen.com/platforms/onboard-users',
      questions: [
        { id: 'existing_submerchants', label: 'How many existing sub-merchants do you have?', type: 'number', placeholder: '0', help: 'Current merchants you would migrate' },
        { id: 'new_submerchants_monthly', label: 'How many new sub-merchants do you expect per month?', type: 'number', placeholder: '10', help: 'Projected monthly growth' },
        { id: 'pilot_submerchants', label: 'How many sub-merchants for the pilot?', type: 'number', placeholder: '5', help: 'Start small to validate the integration' },
        { id: 'mcc_codes', label: 'What industries are your sub-merchants in?', type: 'multiselect', options: ['Retail', 'Restaurants/Food Service', 'Professional Services', 'Healthcare', 'Travel/Hospitality', 'Software/SaaS', 'Other'], help: 'This determines the Merchant Category Codes (MCCs)' },
        { id: 'legal_entity_types', label: 'What types of legal entities will you onboard?', type: 'multiselect', options: ['Businesses/Corporations', 'Sole Proprietors', 'Individuals', 'Non-Profits'], help: 'Different entity types have different KYC requirements', docLink: 'https://docs.adyen.com/platforms/quickstart-guide/onboarding-and-kyc' },
      ]
    },
    {
      id: 'onboarding',
      title: 'Onboarding & KYC',
      icon: Check,
      description: 'How you will onboard merchants',
      docLink: 'https://docs.adyen.com/platforms/onboard-users',
      questions: [
        { id: 'onboarding_method', label: 'How will you onboard sub-merchants?', type: 'select', options: [{ value: 'hosted', label: 'Hosted Onboarding', desc: 'Use Adyen\'s pre-built onboarding flow — fastest to implement' }, { value: 'api', label: 'Custom API Integration', desc: 'Build your own onboarding experience — full control' }, { value: 'hybrid', label: 'Hybrid Approach', desc: 'Mix of hosted and custom for flexibility' }], help: 'Hosted is faster to implement; API gives more control', docLink: 'https://docs.adyen.com/platforms/onboard-users' },
        { id: 'kyc_collection', label: 'When will you collect KYC verification?', type: 'select', options: [{ value: 'upfront', label: 'Upfront', desc: 'Collect all verification before first transaction' }, { value: 'staggered', label: 'Staggered', desc: 'Collect gradually based on volume thresholds' }], help: 'Staggered reduces friction but requires monitoring', docLink: 'https://docs.adyen.com/platforms/quickstart-guide/onboarding-and-kyc' },
        { id: 'migrating_kyc', label: 'Do you have existing KYC data to migrate?', type: 'yesno', help: 'If switching from another processor' },
      ]
    },
    {
      id: 'payments',
      title: 'Payment Configuration',
      icon: CreditCard,
      description: 'How payments will be processed',
      docLink: 'https://docs.adyen.com/platforms/process-payments',
      questions: [
        { id: 'payment_methods', label: 'Which payment methods will you offer?', type: 'multiselect', options: ['Credit/Debit Cards', 'ACH/Bank Transfer', 'Apple Pay', 'Google Pay', 'PayPal', 'Buy Now Pay Later', 'Other'], help: 'Select all payment methods you need', docLink: 'https://docs.adyen.com/payment-methods' },
        { id: 'split_timing', label: 'When should payments be split?', type: 'select', options: [{ value: 'payment_request', label: 'In Payment Request', desc: 'Split defined at time of payment' }, { value: 'automatic', label: 'Automatically via Split Profiles', desc: 'Pre-configured split rules' }], help: 'How revenue is divided between platform and sub-merchants', docLink: 'https://docs.adyen.com/platforms/automatic-split-configuration' },
        { id: 'split_on', label: 'Split on authorization or capture?', type: 'select', options: [{ value: 'auth', label: 'Authorization', desc: 'Split when payment is authorized' }, { value: 'capture', label: 'Capture', desc: 'Split when payment is captured (recommended)' }], help: 'Most platforms split on capture', docLink: 'https://docs.adyen.com/platforms/online-payments/split-transactions/split-payments-at-capture' },
        { id: 'capture_strategy', label: 'What is your capture strategy?', type: 'select', options: [{ value: 'automatic', label: 'Automatic', desc: 'Capture immediately after authorization (default)' }, { value: 'manual', label: 'Manual', desc: 'You control when to capture' }, { value: 'delayed', label: 'Delayed', desc: 'Auto-capture after a set period' }], help: 'Automatic is the default and most common' },
        { id: 'tokenization', label: 'Will you store payment details for future use?', type: 'multiselect', options: ['No tokenization needed', 'Card on File', 'Recurring Payments', 'Subscriptions'], help: 'For repeat customers or subscription billing', docLink: 'https://docs.adyen.com/online-payments/tokenization' },
      ]
    },
    {
      id: 'integration',
      title: 'Technical Integration',
      icon: Monitor,
      description: 'How you will integrate with Adyen',
      docLink: 'https://docs.adyen.com/platforms/online-payments/checkout-components',
      questions: [
        { id: 'checkout_integration', label: 'How will you integrate checkout?', type: 'select', options: [{ value: 'dropin', label: 'Drop-in', desc: 'Pre-built UI component — fastest to implement' }, { value: 'components', label: 'Components', desc: 'Individual payment method components — more customizable' }, { value: 'api', label: 'API Only', desc: 'Full control, build your own UI' }], help: 'Drop-in is recommended for faster implementation', docLink: 'https://docs.adyen.com/online-payments/build-your-integration' },
        { id: 'platforms', label: 'Which platforms are you building for?', type: 'multiselect', options: ['Web', 'iOS', 'Android'], help: 'Select all platforms you need' },
        { id: 'server_libraries', label: 'Which server-side language are you using?', type: 'select', options: [{ value: 'node', label: 'Node.js' }, { value: 'python', label: 'Python' }, { value: 'java', label: 'Java' }, { value: 'dotnet', label: '.NET' }, { value: 'php', label: 'PHP' }, { value: 'go', label: 'Go' }, { value: 'other', label: 'Other' }], help: 'Adyen has SDKs for most languages', docLink: 'https://docs.adyen.com/development-resources/libraries' },
        { id: 'integration_type', label: 'Integration architecture?', type: 'select', options: [{ value: 'cloud', label: 'Cloud', desc: 'Webhooks sent to your cloud servers (recommended)' }, { value: 'local', label: 'Local', desc: 'On-premise integration' }], help: 'Cloud is most common for modern platforms', docLink: 'https://docs.adyen.com/development-resources/webhooks' },
      ]
    },
    {
      id: 'payouts',
      title: 'Payouts & Fees',
      icon: Building2,
      description: 'How sub-merchants get paid',
      docLink: 'https://docs.adyen.com/platforms/payout-to-users',
      questions: [
        { id: 'payout_schedule', label: 'How often should sub-merchants be paid?', type: 'select', options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Bi-weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'ondemand', label: 'On-Demand', desc: 'Sub-merchants request payouts' }], help: 'How frequently funds are transferred to sub-merchants', docLink: 'https://docs.adyen.com/platforms/payout-to-users/scheduled-payouts' },
        { id: 'settlement_delay', label: 'What is your settlement delay?', type: 'select', options: [{ value: 't1', label: 'T+1', desc: 'Next business day' }, { value: 't2', label: 'T+2', desc: 'Two business days' }, { value: 'custom', label: 'Custom', desc: 'Specific delay period' }], help: 'Time between capture and payout availability' },
        { id: 'platform_fees', label: 'Will you charge platform fees to sub-merchants?', type: 'yesno', help: 'Pass through payment processing fees or charge your own' },
        { id: 'commission_timing', label: 'When will you collect your commission?', type: 'select', options: [{ value: 'split', label: 'On Split', desc: 'Deducted from each transaction (most common)' }, { value: 'transfer', label: 'Later via Transfer', desc: 'Charged separately' }], help: 'Most platforms take commission on split', docLink: 'https://docs.adyen.com/platforms/automatic-split-configuration' },
      ]
    },
    {
      id: 'chargebacks',
      title: 'Chargebacks & Refunds',
      icon: ShoppingCart,
      description: 'Handling disputes and returns',
      docLink: 'https://docs.adyen.com/risk-management/disputes-and-chargebacks',
      questions: [
        { id: 'chargeback_handling', label: 'How should chargebacks be handled?', type: 'select', options: [{ value: 'liable', label: 'Book to Liable Account', desc: 'Platform covers chargebacks' }, { value: 'split', label: 'According to Split Ratio', desc: 'Proportional to payment split' }, { value: 'submerchant', label: 'Book to Sub-Merchant', desc: 'Sub-merchant is responsible' }], help: 'Who bears the financial responsibility for disputes' },
        { id: 'chargeback_management', label: 'Who will manage chargeback disputes?', type: 'select', options: [{ value: 'platform', label: 'Platform Team', desc: 'You handle all disputes' }, { value: 'submerchant', label: 'Sub-Merchants', desc: 'Each merchant handles their own' }, { value: 'shared', label: 'Shared', desc: 'Depends on the case' }], help: 'Who responds to and fights chargebacks' },
        { id: 'refund_flow', label: 'How should refunds be processed?', type: 'select', options: [{ value: 'original_split', label: 'Based on Original Split', desc: 'Refund follows payment split' }, { value: 'submerchant', label: 'From Sub-Merchant Balance', desc: 'Sub-merchant covers full refund' }, { value: 'liable', label: 'From Liable Account', desc: 'Platform covers refunds' }], help: 'How refund amounts are deducted', docLink: 'https://docs.adyen.com/online-payments/refund' },
        { id: 'negative_balance', label: 'Will you use a top-up balance account for negative balances?', type: 'yesno', help: 'Covers chargebacks when sub-merchant has insufficient funds' },
      ]
    },
    {
      id: 'terminals',
      title: 'In-Person Payments',
      icon: CreditCard,
      description: 'Terminal and POS configuration',
      conditional: { questionId: 'channels', includes: ['In-Person (IPP/POS)'] },
      docLink: 'https://docs.adyen.com/point-of-sale',
      questions: [
        { id: 'terminal_models', label: 'Which terminal model(s) do you need?', type: 'multiselect', options: ['S1F2 (Countertop)', 'NYC1 (Mobile/Tap to Pay)', 'AMS1 (Portable)'], help: 'Adyen offers various terminal types for different use cases', docLink: 'https://docs.adyen.com/point-of-sale/what-we-support/select-your-terminals' },
        { id: 'initial_locations', label: 'How many locations for initial rollout?', type: 'number', placeholder: '5', help: 'Starting number of physical locations' },
        { id: 'terminals_per_location', label: 'Terminals per location?', type: 'number', placeholder: '2', help: 'Average terminals needed per store' },
        { id: 'terminal_shipping', label: 'How will terminals be shipped?', type: 'select', options: [{ value: 'dropship', label: 'Drop Ship', desc: 'Direct to sub-merchants (additional cost)' }, { value: 'warehouse', label: 'To Your Warehouse', desc: 'You distribute to sub-merchants' }], help: 'Drop shipping is convenient but has additional fees' },
        { id: 'tipping', label: 'Will you enable tipping on terminals?', type: 'yesno', help: 'Customers can add tips during payment', docLink: 'https://docs.adyen.com/point-of-sale/basic-tapi-integration/tipping' },
        { id: 'receipt_printing', label: 'Where will receipts be printed?', type: 'select', options: [{ value: 'terminal', label: 'Adyen Terminal', desc: 'Built-in printer' }, { value: 'pos', label: 'Your POS System', desc: 'External printer' }, { value: 'digital', label: 'Digital Only', desc: 'Email/SMS receipts' }], help: 'Receipt printing options' },
      ]
    },
    {
      id: 'shopper_features',
      title: 'Shopper Features',
      icon: ShoppingCart,
      description: 'Additional payment features',
      docLink: 'https://docs.adyen.com/online-payments',
      questions: [
        { id: 'features', label: 'Which features do you need?', type: 'checklist', options: [{ value: 'preauth', label: 'Pre-Authorization', desc: 'Hold funds before capture' }, { value: 'auth_adjustment', label: 'Authorization Adjustment', desc: 'Modify authorized amount' }, { value: 'pay_by_link', label: 'Pay by Link', desc: 'Send payment links via email/SMS' }, { value: 'partial_refunds', label: 'Partial Refunds', desc: 'Refund part of a payment' }, { value: 'unreferenced_refunds', label: 'Unreferenced Refunds', desc: 'Refund without original transaction' }, { value: 'moto', label: 'MOTO (Phone Orders)', desc: 'Key-entered card payments' }, { value: 'card_acquisition', label: 'Card Acquisition', desc: 'Save cards without charging' }], help: 'Select all features you plan to use' },
      ]
    },
    {
      id: 'support',
      title: 'Support & Reporting',
      icon: HelpCircle,
      description: 'Operations and reporting needs',
      docLink: 'https://docs.adyen.com/platforms/reports-and-fees',
      questions: [
        { id: 'support_structure', label: 'How will you handle first-line support?', type: 'textarea', placeholder: 'Describe your support structure...', help: 'How you plan to support sub-merchants and troubleshoot issues' },
        { id: 'reporting_needs', label: 'What reporting do you need?', type: 'multiselect', options: ['Transaction Reports', 'Settlement Reports', 'Payout Reports', 'Chargeback Reports', 'Custom Reconciliation', 'Real-time Dashboards'], help: 'Understanding your reporting needs helps configure the right setup', docLink: 'https://docs.adyen.com/reporting/platform-reports' },
        { id: 'platform_components', label: 'Will you use Adyen Platform Components for UI?', type: 'yesno', help: 'Pre-built UI components for balance, transactions, payouts' },
        { id: 'additional_notes', label: 'Any additional notes or questions?', type: 'textarea', placeholder: 'Anything else you\'d like us to know...', help: 'Optional: Add any context that might help us understand your needs' },
      ]
    },
  ]
};

const formatDateTime = (ts) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
const calculateProgress = (answers) => { const all = questionnaire.sections.flatMap(s => s.questions); return Math.round((all.filter(q => { const a = answers[q.id]; return a && (Array.isArray(a) ? a.length > 0 : true); }).length / all.length) * 100); };

export default function AdyenQuestionnaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showHelp, setShowHelp] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [saveNotification, setSaveNotification] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const p = JSON.parse(s); setSavedData(p); setShowResumeModal(true); } } catch (e) {} }, []);
  useEffect(() => { if (Object.keys(answers).length > 0 && !isComplete) { const d = { answers, currentSection, lastSaved: Date.now(), progress: calculateProgress(answers) }; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); setLastSaved(Date.now()); } catch (e) {} } }, [answers, currentSection, isComplete]);

  const resumeProgress = () => { if (savedData) { setAnswers(savedData.answers || {}); setCurrentSection(savedData.currentSection || 0); setLastSaved(savedData.lastSaved); } setShowResumeModal(false); };
  const startFresh = () => { localStorage.removeItem(STORAGE_KEY); setAnswers({}); setCurrentSection(0); setLastSaved(null); setSavedData(null); setShowResumeModal(false); };
  const manualSave = () => { const d = { answers, currentSection, lastSaved: Date.now(), progress: calculateProgress(answers) }; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); setLastSaved(Date.now()); setSaveNotification(true); setTimeout(() => setSaveNotification(false), 2000); } catch (e) {} };

  const submitToGoogleSheets = async () => {
    setSubmitStatus('submitting');
    const flatData = { timestamp: new Date().toISOString(), ...answers };
    Object.keys(flatData).forEach(k => { if (Array.isArray(flatData[k])) flatData[k] = flatData[k].join(', '); });
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(flatData) });
      setSubmitStatus('success');
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { setSubmitStatus('error'); }
  };

  const visibleSections = questionnaire.sections.filter(s => { if (!s.conditional) return true; const { questionId, includes } = s.conditional; const a = answers[questionId]; if (!a) return false; return includes.some(v => a.includes?.(v) || a === v); });
  const section = visibleSections[currentSection];
  const progress = ((currentSection + 1) / visibleSections.length) * 100;
  const updateAnswer = (id, v) => setAnswers(p => ({ ...p, [id]: v }));
  const toggleMultiSelect = (id, v) => setAnswers(p => { const c = p[id] || []; return { ...p, [id]: c.includes(v) ? c.filter(x => x !== v) : [...c, v] }; });
  const nextSection = () => { if (currentSection < visibleSections.length - 1) setCurrentSection(currentSection + 1); else setIsComplete(true); };
  const prevSection = () => { if (currentSection > 0) setCurrentSection(currentSection - 1); };
  const exportToJSON = () => { const b = new Blob([JSON.stringify(answers, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'adyen-scoping-responses.json'; a.click(); };
  const exportToCSV = () => { const rows = [['Section', 'Question', 'Answer']]; questionnaire.sections.forEach(s => s.questions.forEach(q => { const a = answers[q.id]; if (a) rows.push([s.title, q.label, Array.isArray(a) ? a.join('; ') : a]); })); const b = new Blob([rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'adyen-scoping-responses.csv'; a.click(); };
  const DocLink = ({ url, children }) => <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">{children}<ExternalLink size={12} /></a>;

  const renderQuestion = (q) => {
    const v = answers[q.id];
    switch (q.type) {
      case 'text': return <input type="text" value={v || ''} onChange={e => updateAnswer(q.id, e.target.value)} placeholder={q.placeholder} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all" />;
      case 'number': return <input type="number" min="0" value={v || ''} onChange={e => updateAnswer(q.id, e.target.value)} placeholder={q.placeholder} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all" />;
      case 'date': return <input type="date" value={v || ''} onChange={e => updateAnswer(q.id, e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all" />;
      case 'textarea': return <textarea value={v || ''} onChange={e => updateAnswer(q.id, e.target.value)} placeholder={q.placeholder} rows={4} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none" />;
      case 'select': return <div className="space-y-2">{q.options.map(o => { const ov = typeof o === 'string' ? o : o.value, ol = typeof o === 'string' ? o : o.label, od = typeof o === 'string' ? null : o.desc, sel = v === ov; return <button key={ov} onClick={() => updateAnswer(q.id, ov)} className={`w-full p-4 rounded-xl text-left transition-all border ${sel ? 'bg-emerald-500/20 border-emerald-500/50 text-white' : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'}`}><div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sel ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'}`}>{sel && <Check size={12} className="text-white" />}</div><div><div className="font-medium">{ol}</div>{od && <div className="text-sm text-slate-400 mt-0.5">{od}</div>}</div></div></button>; })}</div>;
      case 'multiselect': case 'checklist': return <div className="space-y-2">{q.options.map(o => { const ov = typeof o === 'string' ? o : o.value, ol = typeof o === 'string' ? o : o.label, od = typeof o === 'string' ? null : o.desc, sel = (v || []).includes(ov); return <button key={ov} onClick={() => toggleMultiSelect(q.id, ov)} className={`w-full p-4 rounded-xl text-left transition-all border ${sel ? 'bg-emerald-500/20 border-emerald-500/50 text-white' : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'}`}><div className="flex items-center gap-3"><div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${sel ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'}`}>{sel && <Check size={12} className="text-white" />}</div><div><div className="font-medium">{ol}</div>{od && <div className="text-sm text-slate-400 mt-0.5">{od}</div>}</div></div></button>; })}</div>;
      case 'yesno': return <div className="flex gap-3">{['Yes', 'No'].map(o => <button key={o} onClick={() => updateAnswer(q.id, o)} className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all border ${v === o ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-600'}`}>{o}</button>)}</div>;
      default: return null;
    }
  };

  if (showResumeModal && savedData) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={32} className="text-emerald-400" /></div>
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back!</h2>
        <p className="text-slate-400 text-center mb-6">You have a saved questionnaire in progress.</p>
        <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-400">Progress</span><span className="text-sm font-medium text-emerald-400">{savedData.progress || 0}%</span></div>
          <div className="h-2 bg-slate-600 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${savedData.progress || 0}%` }} /></div>
          <p className="text-xs text-slate-500 mt-2">Last saved: {formatDateTime(savedData.lastSaved)}</p>
        </div>
        <div className="space-y-3">
          <button onClick={resumeProgress} className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"><RotateCcw size={18} />Resume Where I Left Off</button>
          <button onClick={startFresh} className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors">Start Fresh</button>
        </div>
      </div>
    </div>
  );

  if (isComplete) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto text-center py-16">
        {submitStatus === 'success' ? (<><div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} className="text-emerald-400" /></div><h1 className="text-3xl font-bold mb-4">Submitted Successfully!</h1><p className="text-slate-400 mb-8">Thank you! We&apos;ve received your responses and will be in touch soon.</p></>) : submitStatus === 'error' ? (<><div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} className="text-red-400" /></div><h1 className="text-3xl font-bold mb-4">Submission Error</h1><p className="text-slate-400 mb-8">There was an issue. Please try again or download your responses.</p><button onClick={submitToGoogleSheets} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium mb-4">Try Again</button></>) : (<><div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-emerald-400" /></div><h1 className="text-3xl font-bold mb-4">Questionnaire Complete!</h1><p className="text-slate-400 mb-8">Review your responses and submit when ready.</p><button onClick={submitToGoogleSheets} disabled={submitStatus === 'submitting'} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-xl font-medium flex items-center justify-center gap-2 mx-auto mb-6">{submitStatus === 'submitting' ? <><Loader2 size={20} className="animate-spin" />Submitting...</> : <><Send size={20} />Submit Responses</>}</button></>)}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button onClick={() => setShowSummary(true)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium">View Summary</button>
          <button onClick={exportToJSON} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium flex items-center justify-center gap-2"><Download size={18} />Export JSON</button>
          <button onClick={exportToCSV} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium flex items-center justify-center gap-2"><Download size={18} />Export CSV</button>
        </div>
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl"><p className="text-sm text-slate-400">📚 <a href="https://docs.adyen.com/platforms" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Adyen Platforms Documentation</a></p></div>
        {showSummary && <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"><div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"><div className="p-6 border-b border-slate-700 flex items-center justify-between"><h2 className="text-xl font-bold">Response Summary</h2><button onClick={() => setShowSummary(false)} className="text-slate-400 hover:text-white"><X size={24} /></button></div><div className="p-6 overflow-y-auto max-h-[60vh] text-left">{questionnaire.sections.map(s => <div key={s.id} className="mb-6"><div className="flex items-center justify-between mb-3"><h3 className="text-emerald-400 font-semibold">{s.title}</h3>{s.docLink && <DocLink url={s.docLink}>Docs</DocLink>}</div><div className="space-y-2">{s.questions.map(q => { const a = answers[q.id]; if (!a || (Array.isArray(a) && !a.length)) return null; return <div key={q.id} className="text-sm"><span className="text-slate-400">{q.label}: </span><span className="text-white">{Array.isArray(a) ? a.join(', ') : a}</span></div>; })}</div></div>)}</div></div></div>}
      </div>
    </div>
  );

  const Icon = section.icon;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {saveNotification && <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"><Check size={16} />Progress saved!</div>}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-700 z-50"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40"><div className="max-w-2xl mx-auto px-6 py-4">{currentSection === 0 && <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">💡 All fields are optional. Answer what you know and skip the rest.</div>}<div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><Icon size={20} className="text-emerald-400" /></div><div><h1 className="font-bold text-lg">{section.title}</h1><p className="text-sm text-slate-400">{section.description}</p></div></div><div className="flex items-center gap-4">{section.docLink && <DocLink url={section.docLink}>View Docs</DocLink>}<div className="text-sm text-slate-400">{currentSection + 1} / {visibleSections.length}</div></div></div></div></div>
      <div className="max-w-2xl mx-auto px-6 py-4"><div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>{visibleSections.map((s, i) => { const SI = s.icon; return <button key={s.id} onClick={() => setCurrentSection(i)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${i === currentSection ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : i < currentSection ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-800/30 text-slate-500'}`}><SI size={14} />{s.title}</button>; })}</div></div>
      <div className="max-w-2xl mx-auto px-6 pb-32"><div className="space-y-8 mt-4">{section.questions.map((q, i) => <div key={q.id} style={{ animation: `fadeIn 0.4s ease-out ${i * 0.1}s forwards`, opacity: 0 }}><div className="flex items-start justify-between mb-3"><label className="text-lg font-medium text-white">{q.label}</label><div className="flex items-center gap-2">{q.docLink && <DocLink url={q.docLink}>Docs</DocLink>}{q.help && <button onClick={() => setShowHelp(showHelp === q.id ? null : q.id)} className="text-slate-400 hover:text-emerald-400"><HelpCircle size={18} /></button>}</div></div>{showHelp === q.id && <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">{q.help}</div>}{renderQuestion(q)}</div>)}</div></div>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50"><div className="max-w-2xl mx-auto px-6 py-4">{lastSaved && <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-3"><Clock size={12} />Auto-saved {formatDateTime(lastSaved)}</div>}<div className="flex items-center justify-between"><button onClick={prevSection} disabled={currentSection === 0} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium ${currentSection === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-700/50'}`}><ChevronLeft size={18} />Previous</button><button onClick={manualSave} className="flex items-center gap-2 px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl font-medium"><Save size={18} />Save & Exit</button><button onClick={nextSection} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium">{currentSection === visibleSections.length - 1 ? 'Review & Submit' : 'Next'}<ChevronRight size={18} /></button></div></div></div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}