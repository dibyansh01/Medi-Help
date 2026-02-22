'use client'

import { jsPDF } from 'jspdf'

type VisitData = {
    id: string
    visitDate: string
    bp: string | null
    temperature: number | null
    pulse: number | null
    weight: number | null
    symptoms: string | null
    diagnosis: string | null
    prescription: string | null
    labTests: string | null
    nextVisitDate: string | null
    fee: number | null
    paymentMode: string | null
    notes: string | null
}

type PatientData = {
    name: string
    patientNumber: string
    phone: string
    gender: string | null
    age: number | null
    bloodGroup: string | null
    allergies: string | null
    patientType: string
}

/**
 * Client component for PDF download of visit records.
 * Uses jsPDF to generate a clean prescription-style PDF.
 */
export function VisitDownloadButton({
    visit,
    patient,
}: {
    visit: VisitData
    patient: PatientData
}) {
    const handleDownload = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20
        const contentWidth = pageWidth - margin * 2
        let y = 20

        // Helper to add text and auto-wrap
        const addWrappedText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number = 6): number => {
            const lines = doc.splitTextToSize(text, maxWidth)
            doc.text(lines, x, startY)
            return startY + lines.length * lineHeight
        }

        // Helper to check page break
        const checkPage = (needed: number) => {
            if (y + needed > 270) {
                doc.addPage()
                y = 20
            }
        }

        // === HEADER ===
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(13, 148, 136) // Teal
        doc.text('MediHelp Clinic', pageWidth / 2, y, { align: 'center' })
        y += 8

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 120, 120)
        doc.text('Doctor Practice Management System', pageWidth / 2, y, { align: 'center' })
        y += 6

        // Divider line
        doc.setDrawColor(13, 148, 136)
        doc.setLineWidth(0.8)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10

        // === PATIENT INFO ===
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('PATIENT INFORMATION', margin, y)
        y += 7

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')

        const patientInfo = [
            [`Name: ${patient.name}`, `Patient ID: ${patient.patientNumber}`],
            [`Phone: ${patient.phone}`, `Type: ${patient.patientType}`],
            [
                patient.age !== null ? `Age: ${patient.age} years` : '',
                patient.gender ? `Gender: ${patient.gender}` : '',
            ],
            [
                patient.bloodGroup ? `Blood Group: ${patient.bloodGroup}` : '',
                patient.allergies ? `Allergies: ${patient.allergies}` : '',
            ],
        ]

        for (const [left, right] of patientInfo) {
            if (left) doc.text(left, margin, y)
            if (right) doc.text(right, pageWidth / 2, y)
            if (left || right) y += 5.5
        }

        y += 3
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.3)
        doc.line(margin, y, pageWidth - margin, y)
        y += 8

        // === VISIT DATE ===
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('VISIT DETAILS', margin, y)
        const visitDateStr = new Date(visit.visitDate).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Date: ${visitDateStr}`, pageWidth - margin, y, { align: 'right' })
        y += 8

        // === VITALS ===
        const vitals = [
            visit.bp ? `BP: ${visit.bp}` : null,
            visit.temperature ? `Temp: ${visit.temperature}°F` : null,
            visit.pulse ? `Pulse: ${visit.pulse} bpm` : null,
            visit.weight ? `Weight: ${visit.weight} kg` : null,
        ].filter(Boolean)

        if (vitals.length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.text('Vitals:', margin, y)
            doc.setFont('helvetica', 'normal')
            doc.text(vitals.join('  |  '), margin + 15, y)
            y += 8
        }

        // === CLINICAL SECTIONS ===
        const sections: [string, string | null][] = [
            ['SYMPTOMS', visit.symptoms],
            ['DIAGNOSIS', visit.diagnosis],
            ['PRESCRIPTION (Rx)', visit.prescription],
            ['LAB TESTS', visit.labTests],
            ['NOTES', visit.notes],
        ]

        for (const [title, content] of sections) {
            if (!content) continue
            checkPage(20)

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(13, 148, 136)
            doc.text(title, margin, y)
            y += 5

            doc.setFont('helvetica', 'normal')
            doc.setTextColor(0, 0, 0)
            y = addWrappedText(content, margin, y, contentWidth)
            y += 6
        }

        // === BILLING ===
        if (visit.fee) {
            checkPage(20)
            doc.setDrawColor(200, 200, 200)
            doc.setLineWidth(0.3)
            doc.line(margin, y, pageWidth - margin, y)
            y += 7

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(0, 0, 0)
            doc.text('BILLING', margin, y)
            y += 6

            doc.setFont('helvetica', 'normal')
            doc.text(`Consultation Fee: ₹${visit.fee}`, margin, y)
            if (visit.paymentMode) {
                doc.text(`Payment: ${visit.paymentMode}`, pageWidth / 2, y)
            }
            y += 6
        }

        // === NEXT VISIT ===
        if (visit.nextVisitDate) {
            checkPage(12)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(13, 148, 136)
            const nextDateStr = new Date(visit.nextVisitDate).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })
            doc.text(`NEXT APPOINTMENT: ${nextDateStr}`, margin, y)
            y += 8
        }

        // === FOOTER ===
        const footerY = 280
        doc.setDrawColor(13, 148, 136)
        doc.setLineWidth(0.5)
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, footerY, { align: 'center' })
        doc.text(`Generated by MediHelp • ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 4, { align: 'center' })

        // Save
        const fileName = `${patient.patientNumber}_visit_${new Date(visit.visitDate).toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
    }

    return (
        <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
            📥 Download PDF
        </button>
    )
}
