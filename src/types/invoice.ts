// Detailed Invoice types — mirrors the 10-section invoice JSON structure

export interface InvoiceMetadata {
  invoice_id: string;
  issue_date: string;
  expiry_date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'VOIDED';
  transaction_type: 'BUY' | 'SELL' | 'RENT';
  currency: string;
}

export interface Party {
  full_name: string | null;
  national_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
}

export interface Agent {
  name: string | null;
  license_number: string | null;
  agency: string | null;
  commission_rate: number | null;
}

export interface PlatformAdmin {
  assigned_admin_id: string | null;
  review_status: string;
}

export interface Parties {
  buyer: Party;
  seller: Party;
  agent: Agent;
  platform_admin: PlatformAdmin;
}

export interface PropertyLocation {
  country: string;
  city: string | null;
  district: string | null;
  street: string | null;
  building_number: string | null;
  floor: string | null;
  unit_number: string | null;
}

export interface InvoicePropertyDetails {
  property_id: number | null;
  title: string | null;
  type: 'apartment' | 'villa' | 'land' | 'commercial' | 'townhouse' | null;
  location: PropertyLocation;
  area_sqm: number | null;
  legal_status: 'clean title' | 'mortgaged' | 'under dispute' | null;
  registration_number: string | null;
  deed_number: string | null;
  year_built: number | null;
  furnishing_status: 'furnished' | 'semi-furnished' | 'unfurnished' | null;
  condition: 'new' | 'good' | 'needs renovation' | null;
}

export interface CommissionDetail {
  percentage: number | null;
  amount: number | null;
}

export interface NegotiatedDiscount {
  amount: number;
  reason: string | null;
}

export interface DepositRequired {
  amount: number | null;
  deadline: string | null;
}

export interface OtherFee {
  label: string;
  amount: number;
}

export interface FinancialBreakdown {
  base_price: number | null;
  price_per_sqm: number | null;
  negotiated_discount: NegotiatedDiscount;
  platform_commission: CommissionDetail;
  agent_commission: CommissionDetail;
  legal_documentation_fees: number | null;
  registration_fees: number | null;
  notarization_fees: number | null;
  vat: CommissionDetail;
  other_fees: OtherFee[];
  total_amount_due: number | null;
  deposit_required: DepositRequired;
  remaining_balance: number | null;
}

export interface InstallmentItem {
  installment_number: number;
  due_date: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
}

export interface MortgageDetails {
  bank_name: string | null;
  loan_amount: number | null;
  duration_years: number | null;
  interest_rate: number | null;
}

export interface PaymentPlan {
  payment_method: 'full_payment' | 'installment' | 'mortgage' | null;
  installment_schedule: InstallmentItem[];
  mortgage_details: MortgageDetails;
}

export interface LegalComplianceFlags {
  is_title_clear: boolean | null;
  outstanding_debts: boolean;
  outstanding_debts_details: string[];
  liens_or_encumbrances: boolean;
  requires_noc: boolean;
  anti_money_laundering_check: 'passed' | 'pending' | 'flagged';
  compliance_notes: string | null;
}

export interface SellerApproval {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_at: string | null;
  signature: string | null;
}

export interface AdminApproval {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED_PENDING_REVIEW';
  approved_at: string | null;
  admin_id: string | null;
  notes: string;
}

export interface ApprovalWorkflow {
  seller_approval: SellerApproval;
  admin_approval: AdminApproval;
  final_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason: string | null;
}

export interface DocumentChecklistItem {
  document: string;
  status: 'provided' | 'missing' | 'expired';
}

export interface CancellationPolicy {
  before_admin_approval: string;
  after_admin_approval_before_signing: string;
  after_contract_signing: string;
}

export interface TermsAndConditions {
  cancellation_policy: CancellationPolicy;
  dispute_resolution: string;
  governing_law: string;
  validity_clause: string;
}

export interface AuditTrailEntry {
  action: string;
  by: string;
  timestamp: string;
  details?: string;
}

export interface AuditTrail {
  created_by: string;
  creation_timestamp: string;
  last_modified_at: string;
  modification_history: AuditTrailEntry[];
}

export interface SchemaNote {
  admin_approval_status_override: string;
  financial_consistency: string;
  legal_flag_triggered: boolean;
  legal_flag_reasons: string[];
}

export interface DetailedInvoice {
  invoice_metadata: InvoiceMetadata;
  parties: Parties;
  property_details: InvoicePropertyDetails;
  financial_breakdown: FinancialBreakdown;
  payment_plan: PaymentPlan;
  legal_compliance_flags: LegalComplianceFlags;
  approval_workflow: ApprovalWorkflow;
  attached_documents_checklist: DocumentChecklistItem[];
  terms_and_conditions: TermsAndConditions;
  audit_trail: AuditTrail;
  missing_info: string[];
  _schema_notes?: SchemaNote;
}
