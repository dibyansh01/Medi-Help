import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding MediHelp database...')

    // Clean existing data
    await prisma.followUp.deleteMany()
    await prisma.visit.deleteMany()
    await prisma.patient.deleteMany()
    await prisma.patientType.deleteMany()
    await prisma.user.deleteMany()

    // --- Users ---
    const hashedPassword = await bcrypt.hash('doctor123', 10)
    const receptionistPassword = await bcrypt.hash('reception123', 10)

    const doctor = await prisma.user.create({
        data: {
            name: 'Dr. Dibyanshu',
            email: 'doctor@medihelp.com',
            password: hashedPassword,
            role: 'DOCTOR',
        },
    })

    const receptionist = await prisma.user.create({
        data: {
            name: 'Priya Sharma',
            email: 'reception@medihelp.com',
            password: receptionistPassword,
            role: 'RECEPTIONIST',
        },
    })

    console.log(`✅ Users: ${doctor.name} (DOCTOR), ${receptionist.name} (RECEPTIONIST)`)

    // --- Patient Types ---
    const types = await Promise.all([
        prisma.patientType.create({ data: { name: 'General', description: 'General check-up and routine visits' } }),
        prisma.patientType.create({ data: { name: 'Diabetic', description: 'Diabetes management and monitoring' } }),
        prisma.patientType.create({ data: { name: 'Cardiac', description: 'Heart-related conditions and monitoring' } }),
        prisma.patientType.create({ data: { name: 'Pediatric', description: 'Child healthcare (0-18 years)' } }),
        prisma.patientType.create({ data: { name: 'Orthopedic', description: 'Bone and joint conditions' } }),
    ])

    const [general, diabetic, cardiac, pediatric, orthopedic] = types
    console.log(`✅ Patient Types: ${types.map(t => t.name).join(', ')}`)

    // --- Patients ---
    const patientsData = [
        { patientNumber: 'CLINIC-00001', name: 'Rajesh Kumar', phone: '9876543210', gender: 'MALE', bloodGroup: 'B+', chronicConditions: 'Diabetes Type 2', patientTypeId: diabetic.id, dateOfBirth: new Date('1968-03-15') },
        { patientNumber: 'CLINIC-00002', name: 'Anita Verma', phone: '9876543211', gender: 'FEMALE', bloodGroup: 'A+', allergies: 'Penicillin', patientTypeId: general.id, dateOfBirth: new Date('1985-07-22') },
        { patientNumber: 'CLINIC-00003', name: 'Suresh Patel', phone: '9876543212', gender: 'MALE', bloodGroup: 'O+', chronicConditions: 'Hypertension', patientTypeId: cardiac.id, dateOfBirth: new Date('1955-11-08') },
        { patientNumber: 'CLINIC-00004', name: 'Meena Devi', phone: '9876543213', gender: 'FEMALE', bloodGroup: 'AB+', patientTypeId: general.id, dateOfBirth: new Date('1990-01-30') },
        { patientNumber: 'CLINIC-00005', name: 'Baby Arjun', phone: '9876543214', gender: 'MALE', bloodGroup: 'O-', patientTypeId: pediatric.id, dateOfBirth: new Date('2020-05-10') },
        { patientNumber: 'CLINIC-00006', name: 'Prakash Rao', phone: '9876543215', gender: 'MALE', bloodGroup: 'B-', chronicConditions: 'Arthritis', patientTypeId: orthopedic.id, dateOfBirth: new Date('1960-09-25') },
        { patientNumber: 'CLINIC-00007', name: 'Sunita Sharma', phone: '9876543216', gender: 'FEMALE', bloodGroup: 'A-', allergies: 'Aspirin, Sulfa drugs', patientTypeId: general.id, dateOfBirth: new Date('1978-12-05') },
        { patientNumber: 'CLINIC-00008', name: 'Mohammed Irfan', phone: '9876543217', gender: 'MALE', bloodGroup: 'AB-', chronicConditions: 'Diabetes Type 1, Hypertension', patientTypeId: diabetic.id, dateOfBirth: new Date('1972-04-18') },
        { patientNumber: 'CLINIC-00009', name: 'Lakshmi Nair', phone: '9876543218', gender: 'FEMALE', bloodGroup: 'O+', patientTypeId: cardiac.id, dateOfBirth: new Date('1965-08-12') },
        { patientNumber: 'CLINIC-00010', name: 'Baby Aarav', phone: '9876543219', gender: 'MALE', bloodGroup: 'A+', patientTypeId: pediatric.id, dateOfBirth: new Date('2022-02-14') },
        { patientNumber: 'CLINIC-00011', name: 'Geeta Kumari', phone: '9876543220', gender: 'FEMALE', bloodGroup: 'B+', patientTypeId: general.id, dateOfBirth: new Date('1988-06-30') },
        { patientNumber: 'CLINIC-00012', name: 'Vikram Singh', phone: '9876543221', gender: 'MALE', bloodGroup: 'O+', chronicConditions: 'Asthma', patientTypeId: general.id, dateOfBirth: new Date('1975-10-20') },
    ]

    const patients = await Promise.all(
        patientsData.map(data => prisma.patient.create({ data }))
    )
    console.log(`✅ Patients: ${patients.length} created`)

    // --- Visits (spread across last 3 months) ---
    const now = new Date()
    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

    const visitsData = [
        // Rajesh Kumar - Diabetic, multiple visits
        { patientId: patients[0].id, visitDate: daysAgo(60), bp: '140/90', temperature: 98.4, pulse: 78, weight: 82, symptoms: 'Frequent urination, increased thirst', diagnosis: 'Diabetes Type 2 - Uncontrolled', prescription: 'Metformin 500mg BD, Glimepiride 1mg OD', fee: 500, paymentMode: 'CASH' },
        { patientId: patients[0].id, visitDate: daysAgo(30), bp: '130/85', temperature: 98.6, pulse: 74, weight: 80, symptoms: 'Follow-up, slight fatigue', diagnosis: 'Diabetes Type 2 - Improving', prescription: 'Continue Metformin 500mg BD', fee: 400, paymentMode: 'UPI', nextVisitDate: daysAgo(-7) },

        // Anita Verma - General
        { patientId: patients[1].id, visitDate: daysAgo(45), bp: '120/80', temperature: 100.2, pulse: 88, weight: 65, symptoms: 'Fever, body aches, cold', diagnosis: 'Viral fever', prescription: 'Paracetamol 500mg TDS x 3 days, Cetirizine 10mg OD', fee: 300, paymentMode: 'CASH' },

        // Suresh Patel - Cardiac
        { patientId: patients[2].id, visitDate: daysAgo(20), bp: '160/100', temperature: 98.2, pulse: 92, weight: 78, symptoms: 'Chest tightness, breathlessness on exertion', diagnosis: 'Hypertension Grade 2', prescription: 'Amlodipine 5mg OD, Aspirin 75mg OD', labTests: 'ECG, Lipid Profile, Blood Sugar', fee: 800, paymentMode: 'UPI', nextVisitDate: daysAgo(-5) },
        { patientId: patients[2].id, visitDate: daysAgo(50), bp: '150/95', temperature: 98.4, pulse: 88, weight: 79, symptoms: 'Routine cardiac review', diagnosis: 'Hypertension - Managed', prescription: 'Continue Amlodipine 5mg OD', fee: 600, paymentMode: 'CASH' },

        // Baby Arjun - Pediatric
        { patientId: patients[4].id, visitDate: daysAgo(10), bp: undefined, temperature: 101.5, pulse: 110, weight: 14, symptoms: 'High fever, running nose, cough', diagnosis: 'Upper respiratory tract infection', prescription: 'Syrup Paracetamol 5ml TDS, Syrup Amoxicillin 5ml BD x 5 days', fee: 400, paymentMode: 'CASH', nextVisitDate: daysAgo(-3) },

        // Prakash Rao - Orthopedic
        { patientId: patients[5].id, visitDate: daysAgo(15), bp: '130/80', temperature: 98.6, pulse: 72, weight: 75, symptoms: 'Knee pain, difficulty walking', diagnosis: 'Osteoarthritis - Bilateral knees', prescription: 'Tab Diclofenac 50mg BD, Cap Calcium+D3 OD, Knee exercises', labTests: 'X-Ray both knees', fee: 700, paymentMode: 'CARD' },

        // Mohammed Irfan - Diabetic
        { patientId: patients[7].id, visitDate: daysAgo(5), bp: '145/92', temperature: 98.4, pulse: 80, weight: 88, symptoms: 'Blurred vision, numbness in feet', diagnosis: 'Diabetic neuropathy', prescription: 'Insulin Glargine 10U HS, Pregabalin 75mg BD', labTests: 'HbA1c, Renal Profile, Fundoscopy', fee: 1000, paymentMode: 'UPI', nextVisitDate: daysAgo(-14) },

        // Lakshmi Nair - Cardiac
        { patientId: patients[8].id, visitDate: daysAgo(25), bp: '155/98', temperature: 98.6, pulse: 85, weight: 68, symptoms: 'Palpitations, anxiety', diagnosis: 'Atrial fibrillation', prescription: 'Metoprolol 25mg BD, Warfarin 2mg OD', labTests: 'ECG, 2D Echo, PT/INR', fee: 900, paymentMode: 'CASH' },

        // Geeta Kumari - General
        { patientId: patients[10].id, visitDate: daysAgo(3), bp: '110/70', temperature: 98.6, pulse: 68, weight: 58, symptoms: 'Routine health check-up', diagnosis: 'Normal health', prescription: 'Multivitamin OD', fee: 300, paymentMode: 'UPI' },

        // Vikram Singh - General (Asthma)
        { patientId: patients[11].id, visitDate: daysAgo(8), bp: '125/78', temperature: 98.8, pulse: 90, weight: 72, symptoms: 'Wheezing, difficulty breathing at night', diagnosis: 'Bronchial Asthma - moderate', prescription: 'Inhaler Budesonide+Formoterol 200/6 BD, Montelukast 10mg HS', fee: 600, paymentMode: 'CASH', nextVisitDate: daysAgo(-10) },
    ]

    const visits = []
    for (const data of visitsData) {
        const { nextVisitDate, ...visitData } = data
        const visit = await prisma.visit.create({
            data: {
                ...visitData,
                nextVisitDate: nextVisitDate || undefined,
            },
        })
        visits.push(visit)

        // Auto-create follow-up for visits with nextVisitDate
        if (nextVisitDate) {
            await prisma.followUp.create({
                data: {
                    patientId: data.patientId,
                    visitId: visit.id,
                    followUpDate: nextVisitDate,
                    method: 'WHATSAPP',
                    status: nextVisitDate < now ? 'MISSED' : 'CONFIRMED',
                    notes: `Auto-scheduled from visit on ${new Date(data.visitDate).toLocaleDateString()}`,
                },
            })
        }
    }
    console.log(`✅ Visits: ${visits.length} created (with auto follow-ups)`)

    // --- Additional follow-ups ---
    const additionalFollowUps = [
        { patientId: patients[0].id, followUpDate: daysAgo(2), method: 'CALL', status: 'VISITED', notes: 'Patient confirmed visit' },
        { patientId: patients[3].id, followUpDate: daysAgo(-2), method: 'WHATSAPP', status: 'CONFIRMED', notes: 'Routine check-up reminder' },
        { patientId: patients[6].id, followUpDate: daysAgo(-1), method: 'SMS', status: 'CONFIRMED', notes: 'Follow-up for lab results' },
        { patientId: patients[9].id, followUpDate: daysAgo(5), method: 'CALL', status: 'NO_RESPONSE', notes: 'Called twice, no answer' },
    ]

    for (const fu of additionalFollowUps) {
        await prisma.followUp.create({ data: fu })
    }
    console.log(`✅ Additional follow-ups: ${additionalFollowUps.length} created`)

    console.log('\n🎉 Seeding complete! MediHelp is ready.')
    console.log('\n📋 Login credentials:')
    console.log('   Doctor:       doctor@medihelp.com / doctor123')
    console.log('   Receptionist: reception@medihelp.com / reception123')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
