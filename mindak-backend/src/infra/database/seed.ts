import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

import { userTable } from './schemas/user';
import { serviceCategoryTable } from './schemas/service-category';
import { serviceTable } from './schemas/service';
import { formQuestionTable } from './schemas/form-question';
import { formQuestionAnswerTable } from './schemas/form-question-answer';
import { podcastReservationTable } from './schemas/podcast-reservation';
import { serviceReservationTable } from './schemas/service-reservation';
import { analyticsEventTable } from './schemas/analytics-event';
import { podcastDecorTable } from './schemas/podcast-decor';
import { podcastPackOfferTable } from './schemas/podcast-pack-offer';
import { podcastSupplementServiceTable } from './schemas/podcast-supplement-service';
import { podcastReservationNewTable } from './schemas/podcast-reservation-new';

import { podcastReservationSupplementTable } from './schemas/podcast-reservation-supplement';
import { podcastReservationAnswerTable } from './schemas/podcast-reservation-answer';
import { reservationNoteTable } from './schemas/reservation-note';
import { reservationStatusHistoryTable } from './schemas/reservation-status-history';

// Load environment variables
config();

const getDbConfig = () => {
  const isTest = process.env.NODE_ENV === 'test';

  return {
    host: isTest ? process.env.TEST_DB_HOST : process.env.DB_HOST,
    port: isTest ? parseInt(process.env.TEST_DB_PORT || '5432', 10) : parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: isTest ? process.env.TEST_DB_NAME : process.env.DB_NAME,
    ssl: isTest ? false : process.env.DB_SSL === 'true',
  };
};

async function seed() {
  const dbConfig = getDbConfig();
  const pool = new Pool(dbConfig);

  const db = drizzle({
    schema: {
      userTable,
      serviceCategoryTable,
      serviceTable,
      formQuestionTable,
      formQuestionAnswerTable,
      podcastReservationTable,
      serviceReservationTable,
      analyticsEventTable,
      podcastDecorTable,
      podcastPackOfferTable,
      podcastSupplementServiceTable,
      podcastReservationNewTable,
      podcastReservationSupplementTable,
      podcastReservationAnswerTable,
      reservationNoteTable,
      reservationStatusHistoryTable,
    },
    client: pool,
  });

  console.log('🌱 Starting database seeding...');

  try {
    // 0. Clean up existing data
    console.log('🧹 Cleaning up existing data...');
    await db.delete(analyticsEventTable);
    await db.delete(reservationNoteTable);
    await db.delete(reservationStatusHistoryTable);
    await db.delete(podcastReservationSupplementTable);
    await db.delete(podcastReservationAnswerTable);
    await db.delete(podcastReservationNewTable);
    await db.delete(podcastReservationTable);
    await db.delete(serviceReservationTable);
    await db.delete(formQuestionAnswerTable);
    await db.delete(formQuestionTable);
    await db.delete(serviceTable);
    await db.delete(serviceCategoryTable);
    await db.delete(podcastDecorTable);
    await db.delete(podcastPackOfferTable);
    await db.delete(podcastSupplementServiceTable);
    await db.delete(userTable);
    console.log('✅ Database cleaned');

    // 1. Seed Users
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await db.insert(userTable).values([
      {
        email: 'admin@mindak.com',
        username: 'admin',
        hashPassword: hashedPassword,
        role: 'admin',
      },
      {
        email: 'user@mindak.com',
        username: 'testuser',
        hashPassword: hashedPassword,
        role: 'user',
      },
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        hashPassword: hashedPassword,
        role: 'user',
      },
    ]).returning();
    console.log(`✅ Created ${users.length} users`);

    // 2. Seed Service Categories
    console.log('📁 Seeding service categories...');
    const categories = await db.insert(serviceCategoryTable).values([
      {
        name: 'Digital Marketing',
        description: 'Comprehensive digital marketing services to grow your online presence',
        isActive: true,
      },
      {
        name: 'Web Development',
        description: 'Custom web development solutions for your business',
        isActive: true,
      },
      {
        name: 'Branding & Design',
        description: 'Creative branding and design services',
        isActive: true,
      },
      {
        name: 'Content Creation',
        description: 'Professional content creation for all platforms',
        isActive: true,
      },
      {
        name: 'Consulting',
        description: 'Expert consulting services',
        isActive: false, // Inactive category for testing
      },
    ]).returning();
    console.log(`✅ Created ${categories.length} service categories`);

    // 3. Seed Services
    console.log('🛠️  Seeding services...');
    const services = await db.insert(serviceTable).values([
      // Digital Marketing Services
      {
        name: 'Social Media Management',
        description: 'Complete social media management across all major platforms',
        price: '999.99',
        categoryId: categories[0].id,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'SEO Optimization',
        description: 'Search engine optimization to improve your rankings',
        price: '1499.99',
        categoryId: categories[0].id,
        isActive: true,
        displayOrder: 2,
      },
      {
        name: 'PPC Advertising',
        description: 'Pay-per-click advertising campaigns',
        price: '1999.99',
        categoryId: categories[0].id,
        isActive: true,
        displayOrder: 3,
      },
      // Web Development Services
      {
        name: 'Custom Website Development',
        description: 'Fully custom website built to your specifications',
        price: '4999.99',
        categoryId: categories[1].id,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'E-commerce Solutions',
        description: 'Complete e-commerce platform setup and customization',
        price: '6999.99',
        categoryId: categories[1].id,
        isActive: true,
        displayOrder: 2,
      },
      {
        name: 'Website Maintenance',
        description: 'Ongoing website maintenance and support',
        price: '299.99',
        categoryId: categories[1].id,
        isActive: true,
        displayOrder: 3,
      },
      // Branding & Design Services
      {
        name: 'Logo Design',
        description: 'Professional logo design with multiple concepts',
        price: '799.99',
        categoryId: categories[2].id,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'Brand Identity Package',
        description: 'Complete brand identity including logo, colors, and guidelines',
        price: '2499.99',
        categoryId: categories[2].id,
        isActive: true,
        displayOrder: 2,
      },
      // Content Creation Services
      {
        name: 'Video Production',
        description: 'Professional video production services',
        price: '1999.99',
        categoryId: categories[3].id,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'Blog Writing',
        description: 'Professional blog post writing service',
        price: '199.99',
        categoryId: categories[3].id,
        isActive: true,
        displayOrder: 2,
      },
    ]).returning();
    console.log(`✅ Created ${services.length} services`);

    // 4. Seed Form Questions - Podcast Form (General)
    console.log('❓ Seeding form questions...');
    const podcastQuestions = await db.insert(formQuestionTable).values([
      {
        formType: 'podcast',
        sectionType: 'general',
        questionText: 'What is your podcast name?',
        questionType: 'text',
        required: true,
        order: 1,
        helpText: 'The name of your podcast show',
        isActive: true,
      },
      {
        formType: 'podcast',
        sectionType: 'general',
        questionText: 'Episode type',
        questionType: 'checkbox',
        required: true,
        order: 2,
        helpText: 'Select all that apply',
        isActive: true,
      },
      {
        formType: 'podcast',
        sectionType: 'general',
        questionText: 'Number of guests',
        questionType: 'number',
        required: false,
        order: 3,
        helpText: 'How many guests will be joining?',
        isActive: true,
      },
    ]).returning();

    // 5. Seed Form Question Options for Podcast "Episode type"
    console.log('💬 Seeding form question options...');
    await db.insert(formQuestionAnswerTable).values([
      {
        questionId: podcastQuestions[1].id, // Episode type
        answerText: 'Interview',
        answerValue: 'interview',
        order: 1,
        isActive: true,
      },
      {
        questionId: podcastQuestions[1].id, // Episode type
        answerText: 'Solo Episode',
        answerValue: 'solo',
        order: 2,
        isActive: true,
      },
      {
        questionId: podcastQuestions[1].id, // Episode type
        answerText: 'Panel Discussion',
        answerValue: 'panel',
        order: 3,
        isActive: true,
      },
    ]);

    // 6. Seed Form Questions - Services Form (General)
    const servicesGeneralQuestions = await db.insert(formQuestionTable).values([
      {
        formType: 'services',
        sectionType: 'general',
        questionText: 'What is your company name?',
        questionType: 'text',
        required: true,
        order: 1,
        placeholder: 'Acme Inc.',
        isActive: true,
      },
      {
        formType: 'services',
        sectionType: 'general',
        questionText: 'Contact email',
        questionType: 'email',
        required: true,
        order: 2,
        placeholder: 'contact@company.com',
        isActive: true,
      },
      {
        formType: 'services',
        sectionType: 'general',
        questionText: 'Contact phone',
        questionType: 'phone',
        required: false,
        order: 3,
        placeholder: '+1 (555) 123-4567',
        isActive: true,
      },
      {
        formType: 'services',
        sectionType: 'general',
        questionText: 'Project budget range',
        questionType: 'select',
        required: true,
        order: 4,
        isActive: true,
      },
      {
        formType: 'services',
        sectionType: 'general',
        questionText: 'Project timeline',
        questionType: 'select',
        required: false,
        order: 5,
        isActive: true,
      },
    ]).returning();

    // 7. Seed answers for budget range
    await db.insert(formQuestionAnswerTable).values([
      {
        questionId: servicesGeneralQuestions[3].id,
        answerText: 'Under $5,000',
        answerValue: 'under_5k',
        order: 1,
        isActive: true,
      },
      {
        questionId: servicesGeneralQuestions[3].id,
        answerText: '$5,000 - $10,000',
        answerValue: '5k_10k',
        order: 2,
        isActive: true,
      },
      {
        questionId: servicesGeneralQuestions[3].id,
        answerText: '$10,000 - $25,000',
        answerValue: '10k_25k',
        order: 3,
        isActive: true,
      },
      {
        questionId: servicesGeneralQuestions[3].id,
        answerText: 'Over $25,000',
        answerValue: 'over_25k',
        order: 4,
        isActive: true,
      },
    ]);

    // 8. Seed answers for timeline
    await db.insert(formQuestionAnswerTable).values([
      {
        questionId: servicesGeneralQuestions[4].id,
        answerText: 'ASAP (within 1 month)',
        answerValue: 'asap',
        order: 1,
        isActive: true,
      },
      {
        questionId: servicesGeneralQuestions[4].id,
        answerText: '1-3 months',
        answerValue: '1_3_months',
        order: 2,
        isActive: true,
      },
      {
        questionId: servicesGeneralQuestions[4].id,
        answerText: '3-6 months',
        answerValue: '3_6_months',
        order: 3,
        isActive: true,
      },
      {
        questionId: servicesGeneralQuestions[4].id,
        answerText: 'Flexible',
        answerValue: 'flexible',
        order: 4,
        isActive: true,
      },
    ]);

    // 9. Seed Service-Specific Questions
    const serviceSpecificQuestions = await db.insert(formQuestionTable).values([
      {
        formType: 'services',
        sectionType: 'service_specific',
        serviceId: services[0].id, // Social Media Management
        questionText: 'Which platforms do you want us to manage?',
        questionType: 'checkbox',
        required: true,
        order: 1,
        isActive: true,
      },
      {
        formType: 'services',
        sectionType: 'service_specific',
        serviceId: services[3].id, // Custom Website Development
        questionText: 'Do you have an existing website?',
        questionType: 'radio',
        required: true,
        order: 1,
        isActive: true,
      },
      {
        formType: 'services',
        sectionType: 'service_specific',
        serviceId: services[3].id, // Custom Website Development
        questionText: 'What features do you need?',
        questionType: 'textarea',
        required: true,
        order: 2,
        placeholder: 'Describe the features you need...',
        isActive: true,
      },
    ]).returning();

    // 10. Seed answers for social media platforms
    await db.insert(formQuestionAnswerTable).values([
      {
        questionId: serviceSpecificQuestions[0].id,
        answerText: 'Facebook',
        answerValue: 'facebook',
        order: 1,
        isActive: true,
      },
      {
        questionId: serviceSpecificQuestions[0].id,
        answerText: 'Instagram',
        answerValue: 'instagram',
        order: 2,
        isActive: true,
      },
      {
        questionId: serviceSpecificQuestions[0].id,
        answerText: 'Twitter/X',
        answerValue: 'twitter',
        order: 3,
        isActive: true,
      },
      {
        questionId: serviceSpecificQuestions[0].id,
        answerText: 'LinkedIn',
        answerValue: 'linkedin',
        order: 4,
        isActive: true,
      },
      {
        questionId: serviceSpecificQuestions[0].id,
        answerText: 'TikTok',
        answerValue: 'tiktok',
        order: 5,
        isActive: true,
      },
    ]);

    // 11. Seed answers for existing website question
    await db.insert(formQuestionAnswerTable).values([
      {
        questionId: serviceSpecificQuestions[1].id,
        answerText: 'Yes, I have a website',
        answerValue: 'yes',
        order: 1,
        isActive: true,
      },
      {
        questionId: serviceSpecificQuestions[1].id,
        answerText: 'No, starting from scratch',
        answerValue: 'no',
        order: 2,
        isActive: true,
      },
    ]);

    console.log('✅ Created form questions and answers');

    // 12. Seed Sample Podcast Reservations
    console.log('🎙️  Seeding podcast reservations...');
    const podcastReservations = await db.insert(podcastReservationTable).values([
      {
        clientId: users[2].id, // John Doe
        confirmationId: 'POD-2024-001234',
        status: 'pending',
        clientAnswers: [
          {
            questionId: podcastQuestions[0].id,
            questionText: 'What is your podcast name?',
            questionType: 'text',
            value: 'The Growth Lab Podcast',
            answerId: null,
            answerText: 'The Growth Lab Podcast',
            answerMetadata: {},
          },
          {
            questionId: podcastQuestions[1].id,
            questionText: 'Episode type',
            questionType: 'checkbox',
            value: 'Interview',
            answerId: null,
            answerText: null,
            answerMetadata: {},
          },
          {
            questionId: podcastQuestions[2].id,
            questionText: 'Number of guests',
            questionType: 'number',
            value: '2',
            answerId: null,
            answerText: '2',
            answerMetadata: {},
          },
        ],
        clientIp: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        clientId: users[1].id, // Test user
        confirmationId: 'POD-2024-001235',
        status: 'confirmed',
        clientAnswers: [
          {
            questionId: podcastQuestions[0].id,
            questionText: 'What is your podcast name?',
            questionType: 'text',
            value: 'Tech Talk Daily',
            answerId: null,
            answerText: 'Tech Talk Daily',
            answerMetadata: {},
          },
          {
            questionId: podcastQuestions[1].id,
            questionText: 'Episode type',
            questionType: 'checkbox',
            value: 'Solo Episode',
            answerId: null,
            answerText: null,
            answerMetadata: {},
          },
          {
            questionId: podcastQuestions[2].id,
            questionText: 'Number of guests',
            questionType: 'number',
            value: '0',
            answerId: null,
            answerText: '0',
            answerMetadata: {},
          },
        ],
        clientIp: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    ]).returning();
    console.log(`✅ Created ${podcastReservations.length} podcast reservations`);

    // 13. Seed Sample Service Reservations
    console.log('🛎️  Seeding service reservations...');
    const serviceReservations = await db.insert(serviceReservationTable).values([
      {
        clientId: users[2].id, // John Doe
        confirmationId: 'SRV-2024-001234',
        serviceIds: [services[0].id, services[1].id], // Social Media + SEO
        status: 'pending',
        clientAnswers: [
          {
            questionId: servicesGeneralQuestions[0].id,
            questionText: 'What is your company name?',
            questionType: 'text',
            sectionType: 'general',
            serviceId: null,
            serviceName: null,
            value: 'TechStart Inc.',
            answerId: null,
            answerText: null,
            answerMetadata: {},
          },
          {
            questionId: servicesGeneralQuestions[1].id,
            questionText: 'Contact email',
            questionType: 'email',
            sectionType: 'general',
            serviceId: null,
            serviceName: null,
            value: 'contact@techstart.com',
            answerId: null,
            answerText: null,
            answerMetadata: {},
          },
        ],
        clientIp: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        clientId: users[1].id, // Test user
        confirmationId: 'SRV-2024-001235',
        serviceIds: [services[3].id], // Custom Website Development
        status: 'confirmed',
        clientAnswers: [
          {
            questionId: servicesGeneralQuestions[0].id,
            questionText: 'What is your company name?',
            questionType: 'text',
            sectionType: 'general',
            serviceId: null,
            serviceName: null,
            value: 'Creative Studios LLC',
            answerId: null,
            answerText: null,
            answerMetadata: {},
          },
          {
            questionId: servicesGeneralQuestions[1].id,
            questionText: 'Contact email',
            questionType: 'email',
            sectionType: 'general',
            serviceId: null,
            serviceName: null,
            value: 'hello@creativestudios.com',
            answerId: null,
            answerText: null,
            answerMetadata: {},
          },
        ],
        clientIp: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    ]).returning();
    console.log(`✅ Created ${serviceReservations.length} service reservations`);

    // 14. Seed Analytics Events
    console.log('📊 Seeding analytics events...');
    await db.insert(analyticsEventTable).values([
      {
        eventType: 'reservation_submitted',
        eventData: {
          reservationType: 'podcast',
          reservationId: podcastReservations[0].id,
          confirmationId: podcastReservations[0].confirmationId,
        },
      },
      {
        eventType: 'reservation_confirmed',
        eventData: {
          reservationType: 'podcast',
          reservationId: podcastReservations[1].id,
          confirmationId: podcastReservations[1].confirmationId,
        },
      },
      {
        eventType: 'reservation_submitted',
        eventData: {
          reservationType: 'service',
          reservationId: serviceReservations[0].id,
          confirmationId: serviceReservations[0].confirmationId,
        },
      },
      {
        eventType: 'form_viewed',
        eventData: {
          formType: 'podcast',
          timestamp: new Date().toISOString(),
        },
      },
      {
        eventType: 'form_viewed',
        eventData: {
          formType: 'services',
          timestamp: new Date().toISOString(),
        },
      },
      {
        eventType: 'service_viewed',
        eventData: {
          serviceId: services[0].id,
          serviceName: services[0].name,
        },
      },
    ]);
    console.log('✅ Created analytics events');

    // 15. Seed Podcast Decors
    console.log('🎨 Seeding podcast decors...');
    const decors = await db.insert(podcastDecorTable).values([
      {
        name: 'Urban Loft',
        description: 'Modern industrial setting with exposed brick and natural lighting',
        imageUrl: 'https://cdn.example.com/decor/urban-loft.jpg',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Minimalist Studio',
        description: 'Clean, professional white backdrop with acoustic treatment',
        imageUrl: 'https://cdn.example.com/decor/minimalist-studio.jpg',
        sortOrder: 2,
        isActive: true,
      },
    ]).returning();
    console.log(`✅ Created ${decors.length} podcast decors`);

    // 16. Seed Podcast Pack Offers
    console.log('📦 Seeding podcast pack offers...');
    const packs = await db.insert(podcastPackOfferTable).values([
      {
        name: 'Basic Recording',
        description: '1-hour recording session with basic equipment',
        basePrice: '100.00',
        durationMin: 60,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Premium Recording',
        description: '2-hour recording session with professional equipment',
        basePrice: '200.00',
        durationMin: 120,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Extended Session',
        description: '3-hour recording session with full production support',
        basePrice: '280.00',
        durationMin: 180,
        sortOrder: 3,
        isActive: true,
      },
    ]).returning();
    console.log(`✅ Created ${packs.length} podcast pack offers`);

    // 17. Seed Podcast Supplement Services
    console.log('➕ Seeding podcast supplement services...');
    const supplements = await db.insert(podcastSupplementServiceTable).values([
      {
        name: 'Professional Editing',
        description: 'Full audio editing and mastering service',
        price: '80.00',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Video Recording',
        description: 'Multi-camera video recording of your session',
        price: '150.00',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Transcription Service',
        description: 'Professional transcription of your episode',
        price: '50.00',
        sortOrder: 3,
        isActive: true,
      },
    ]).returning();
    console.log(`✅ Created ${supplements.length} podcast supplement services`);

    // 18. Seed New Podcast Reservations (for Calendar)
    console.log('📅 Seeding new podcast reservations for calendar...');

    // Create dates for next week
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(10, 0, 0, 0); // 10:00 AM

    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setHours(12, 0, 0, 0); // 12:00 PM (2 hours)

    const dayAfterNext = new Date(nextWeek);
    dayAfterNext.setDate(nextWeek.getDate() + 1);
    dayAfterNext.setHours(14, 0, 0, 0); // 2:00 PM

    const dayAfterNextEnd = new Date(dayAfterNext);
    dayAfterNextEnd.setHours(15, 0, 0, 0); // 3:00 PM (1 hour)

    const newReservations = await db.insert(podcastReservationNewTable).values([
      {
        confirmationId: 'RES-2025-001',
        status: 'confirmed',
        startAt: nextWeek,
        endAt: nextWeekEnd,
        durationHours: 2,
        timezone: 'Europe/Paris',
        decorId: decors[0].id,
        packOfferId: packs[1].id, // Premium (2 hours)
        customerName: 'Alice Wonderland',
        customerEmail: 'alice@example.com',
        customerPhone: '+1234567890',
        notes: 'First time recording',
        totalPrice: '200.00',
        assignedAdminId: users[0].id,
        confirmedByAdminId: users[0].id,
        confirmedAt: new Date(),
      },
      {
        confirmationId: 'RES-2025-002',
        status: 'confirmed',
        startAt: dayAfterNext,
        endAt: dayAfterNextEnd,
        durationHours: 1,
        timezone: 'Europe/Paris',
        decorId: decors[1].id,
        packOfferId: packs[0].id, // Basic (1 hour)
        customerName: 'Bob Builder',
        customerEmail: 'bob@example.com',
        customerPhone: '+0987654321',
        notes: 'Needs video recording',
        totalPrice: '100.00',
        assignedAdminId: users[0].id,
        confirmedByAdminId: users[0].id,
        confirmedAt: new Date(),
      },
    ]).returning();
    console.log(`✅ Created ${newReservations.length} new podcast reservations`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${categories.length} service categories created`);
    console.log(`   - ${services.length} services created`);
    console.log('   - Multiple form questions and answers created');
    console.log(`   - ${podcastReservations.length} podcast reservations created`);
    console.log(`   - ${serviceReservations.length} service reservations created`);
    console.log('   - 6 analytics events created');
    console.log('\n🔑 Test credentials:');
    console.log('   Admin: admin@mindak.com / password123');
    console.log('   User: user@mindak.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seeder
seed()
  .then(() => {
    console.log('\n👋 Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
