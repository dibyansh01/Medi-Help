import { BaseRepository } from './base.repository'

/**
 * PatientType Repository — encapsulates all PatientType-related database operations.
 * Used for patient categorization (Diabetic, Cardiac, General, etc.).
 */
export class PatientTypeRepository extends BaseRepository {
  /**
   * Find all patient types ordered by name.
   */
  async findAll() {
    return this.db.patientType.findMany({
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Find a patient type by ID.
   */
  async findById(id: string) {
    return this.db.patientType.findUnique({
      where: { id },
    })
  }

  /**
   * Find all types with patient count.
   */
  async findWithPatientCounts() {
    return this.db.patientType.findMany({
      select: {
        name: true,
        _count: { select: { patients: true } },
      },
      orderBy: { patients: { _count: 'desc' } },
    })
  }

  /**
   * Count uncategorized patients (no patient type assigned).
   */
  async countUncategorizedPatients() {
    return this.db.patient.count({
      where: { patientTypeId: null },
    })
  }

  /**
   * Get disease distribution including uncategorized.
   */
  async getDiseaseDistribution() {
    const types = await this.findWithPatientCounts()
    const uncategorized = await this.countUncategorizedPatients()

    const result = types.map((t) => ({
      name: t.name,
      value: t._count.patients,
    }))

    if (uncategorized > 0) {
      result.push({ name: 'Uncategorized', value: uncategorized })
    }

    return result
  }
}

export const patientTypeRepository = new PatientTypeRepository()
