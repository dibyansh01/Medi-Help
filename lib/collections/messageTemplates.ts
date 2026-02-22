/**
 * Clinic Message Templates for WhatsApp reminders.
 * Used by the follow-ups system to generate pre-filled messages.
 */

const CLINIC_NAME = 'MediHelp Clinic'

/**
 * Generate a reminder message for an upcoming appointment.
 */
export function getAppointmentReminderMessage(params: {
    patientName: string
    date: Date
    doctorName?: string
}): string {
    const { patientName, date, doctorName } = params
    const dateStr = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    let msg = `Hello ${patientName}, this is a reminder from ${CLINIC_NAME} for your appointment scheduled on ${dateStr}.`

    if (doctorName) {
        msg += ` Your consultation is with Dr. ${doctorName}.`
    }

    msg += ` Kindly confirm your visit. Thank you. 🙏`

    return msg
}

/**
 * Generate a message for a missed appointment.
 */
export function getMissedAppointmentMessage(params: {
    patientName: string
    date: Date
}): string {
    const { patientName, date } = params
    const dateStr = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return `Hello ${patientName}, we noticed you missed your appointment on ${dateStr} at ${CLINIC_NAME}. Your health is our priority. Please reply to reschedule at your convenience. 🙏`
}

/**
 * Generate a general health check-up reminder.
 */
export function getHealthCheckupReminder(params: {
    patientName: string
    lastVisitDate?: Date
}): string {
    const { patientName, lastVisitDate } = params

    if (lastVisitDate) {
        const daysSince = Math.floor(
            (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        return `Hello ${patientName}, it's been ${daysSince} days since your last visit to ${CLINIC_NAME}. We recommend a follow-up check-up. Please contact us to schedule. 🙏`
    }

    return `Hello ${patientName}, this is ${CLINIC_NAME}. We'd like to remind you about your routine health check-up. Please contact us to schedule an appointment. 🙏`
}

/**
 * Get the appropriate message based on follow-up context.
 * Used by the follow-ups page to generate WhatsApp messages.
 */
export function getFollowUpMessage(params: {
    patientName: string
    followUpDate: Date
    isMissed: boolean
    lastVisitDate?: Date
}): string {
    const { patientName, followUpDate, isMissed } = params

    if (isMissed) {
        return getMissedAppointmentMessage({ patientName, date: followUpDate })
    }

    return getAppointmentReminderMessage({ patientName, date: followUpDate })
}
