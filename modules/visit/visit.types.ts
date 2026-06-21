/**
 * Visit Module — Type Definitions
 */

export interface VitalsData {
  bp?: string
  temperature?: number
  pulse?: number
  weight?: number
  height?: number
  bmi?: number
}

export interface RiskFactors {
  isNonVeg?: boolean
  alcohol?: boolean
  smoking?: boolean
  drugAllergy?: string
  surgeryHistory?: string
}

export interface ClinicalNotes {
  chiefComplaint?: string
  historyOfPresentIllness?: string
  examination?: string
  provisionalDiagnosis?: string
  investigations?: string
  finalDiagnosis?: string
  symptoms?: string    // legacy
  diagnosis?: string   // legacy
  prescription?: string
  labTests?: string    // legacy
}

export interface VisitBilling {
  fee?: number
  paymentMode?: string
}

export interface VisitWithPatient {
  id: string
  patientId: string
  visitDate: Date
  vitals: VitalsData
  clinicalNotes: ClinicalNotes
  billing: VisitBilling
  notes?: string
  nextVisitDate?: Date
}
