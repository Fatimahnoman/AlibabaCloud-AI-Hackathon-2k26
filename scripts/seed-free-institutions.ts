import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. JDC IT Centre (Jafaria Disaster Management Council)
  const jdc = await prisma.freeInstitution.upsert({
    where: { id: 'jdc-it-centre' },
    update: {},
    create: {
      id: 'jdc-it-centre',
      name: 'JDC IT Centre (Jafaria Disaster Management Council)',
      type: 'ngo',
      description: 'JDC IT Centre provides completely free IT and computer education to students across Pakistan, with a focus on Karachi. Founded by Zafar Abbas, JDC has trained thousands of students in web development, graphic design, video editing, and other digital skills. All courses are 100% free with no hidden charges. JDC also provides free laptops to top-performing students and offers job placement assistance after course completion.',
      website: 'https://jdcentre.org/',
      location: 'Karachi, Sindh (with centers across Pakistan)',
      province: 'all',
      contactEmail: 'info@jdcentre.org',
      contactPhone: '+92-21-34567890',
      eligibilityCriteria: '• Open to all Pakistani students aged 15-45\n• No minimum education requirement for basic courses\n• Intermediate or above preferred for advanced courses\n• Must be able to attend regular classes (morning/evening batches available)\n• Students from low-income families are given priority\n• CNIC or B-Form required for registration',
      applicationProcess: '1. Visit the JDC IT Centre website or nearest center\n2. Fill out the online registration form or register in person\n3. Select your desired course and batch timing\n4. Submit required documents (CNIC/B-Form, educational certificates)\n5. Attend orientation session\n6. Classes begin on the announced batch start date\n7. Regular attendance required (minimum 80%)\n8. Course completion certificate awarded on passing final assessment',
      verificationStatus: 'verified',
      courses: {
        create: [
          { name: 'Web Development (HTML, CSS, JavaScript)', duration: '3 months', fee: 'Free', certification: 'JDC Certificate', description: 'Complete web development course covering frontend and backend technologies', batchStart: 'Rolling admissions — new batch every month' },
          { name: 'Graphic Design (Adobe Photoshop, Illustrator)', duration: '2 months', fee: 'Free', certification: 'JDC Certificate', description: 'Professional graphic design training using industry-standard tools', batchStart: 'Rolling admissions' },
          { name: 'Video Editing (Premiere Pro, After Effects)', duration: '2 months', fee: 'Free', certification: 'JDC Certificate', description: 'Professional video editing and motion graphics training', batchStart: 'Rolling admissions' },
          { name: 'Digital Marketing', duration: '6 weeks', fee: 'Free', certification: 'JDC Certificate', description: 'SEO, social media marketing, Google Ads, and content strategy', batchStart: 'Rolling admissions' },
          { name: 'Microsoft Office & Computer Basics', duration: '1 month', fee: 'Free', certification: 'JDC Certificate', description: 'Basic computer literacy and MS Office suite training', batchStart: 'Rolling admissions' },
          { name: 'Freelancing & Earning Online', duration: '4 weeks', fee: 'Free', certification: 'JDC Certificate', description: 'How to earn through Fiverr, Upwork, and other platforms', batchStart: 'Rolling admissions' },
        ],
      },
      entryTests: {
        create: [
          {
            testName: 'JDC Entry Assessment',
            type: 'aptitude',
            totalMarks: 50,
            passingMarks: 25,
            passingPercentage: '50%',
            syllabus: 'Basic computer knowledge, general aptitude, and motivation assessment',
            preparationTips: 'Review basic computer concepts and be prepared to explain your motivation for joining',
          },
        ],
      },
      documents: {
        create: [
          { documentName: 'CNIC or B-Form', description: 'National identity card or birth certificate', isRequired: true },
          { documentName: 'Educational certificates', description: 'Last qualification certificate (if available)', isRequired: false },
          { documentName: 'Passport-size photographs', description: '2 recent photographs', isRequired: true },
          { documentName: 'Income certificate', description: 'Proof of family income (for priority admission)', isRequired: false },
        ],
      },
    },
  });
  console.log('Created/Updated:', jdc.name);

  // 2. Qabil IT Centre
  const qabil = await prisma.freeInstitution.upsert({
    where: { id: 'qabil-it-centre' },
    update: {},
    create: {
      id: 'qabil-it-centre',
      name: 'Qabil IT Centre (Qabila IT Training)',
      type: 'ngo',
      description: 'Qabil IT Centre offers free IT training programs across Pakistan, focusing on empowering youth with digital skills. The organization provides courses in web development, mobile app development, graphic design, and freelancing. Qabil partners with international organizations to provide certified training and job placement support. All courses are completely free with no hidden fees.',
      website: 'https://qabilit.com/',
      location: 'Lahore, Punjab (with branches in other cities)',
      province: 'all',
      contactEmail: 'info@qabilit.com',
      contactPhone: '+92-42-35789012',
      eligibilityCriteria: '• Open to all Pakistani students and young professionals\n• Minimum age: 16 years\n• No strict education requirement for basic courses\n• Intermediate or above for advanced courses\n• Must attend regular classes\n• CNIC or B-Form mandatory',
      applicationProcess: '1. Visit Qabil IT Centre website or nearest branch\n2. Complete online or in-person registration\n3. Choose course and batch timing\n4. Submit required documents\n5. Attend introductory session\n6. Begin classes on announced date\n7. Maintain 80% attendance\n8. Receive certificate upon successful completion',
      verificationStatus: 'verified',
      courses: {
        create: [
          { name: 'Full Stack Web Development', duration: '4 months', fee: 'Free', certification: 'Qabila IT Certificate', description: 'Complete MERN stack development with React, Node.js, MongoDB', batchStart: 'New batch every 2 months' },
          { name: 'Mobile App Development (Flutter)', duration: '3 months', fee: 'Free', certification: 'Qabila IT Certificate', description: 'Cross-platform mobile app development using Flutter and Dart', batchStart: 'New batch every 2 months' },
          { name: 'UI/UX Design', duration: '2 months', fee: 'Free', certification: 'Qabila IT Certificate', description: 'User interface and experience design with Figma and Adobe XD', batchStart: 'New batch every 2 months' },
          { name: 'Graphic Design Masterclass', duration: '6 weeks', fee: 'Free', certification: 'Qabila IT Certificate', description: 'Professional design using Photoshop, Illustrator, and InDesign', batchStart: 'New batch every 2 months' },
          { name: 'Digital Marketing & SEO', duration: '6 weeks', fee: 'Free', certification: 'Qabila IT Certificate', description: 'Complete digital marketing with SEO, SEM, and social media', batchStart: 'New batch every 2 months' },
          { name: 'Python Programming & Data Science', duration: '3 months', fee: 'Free', certification: 'Qabila IT Certificate', description: 'Python fundamentals, data analysis, and machine learning basics', batchStart: 'New batch every 2 months' },
        ],
      },
      entryTests: {
        create: [
          {
            testName: 'Qabila Aptitude Test',
            type: 'aptitude',
            totalMarks: 40,
            passingMarks: 20,
            passingPercentage: '50%',
            syllabus: 'Basic computer literacy, logical reasoning, and English comprehension',
            preparationTips: 'Practice basic computer operations and review elementary logical reasoning questions',
          },
        ],
      },
      documents: {
        create: [
          { documentName: 'CNIC or B-Form', description: 'Valid national identity document', isRequired: true },
          { documentName: 'Educational certificates', description: 'Last qualification certificate', isRequired: false },
          { documentName: 'Passport-size photographs', description: '2 recent photographs', isRequired: true },
        ],
      },
    },
  });
  console.log('Created/Updated:', qabil.name);

  // 3. GIAIC (Governor Sindh Initiative for AI & Computing)
  const giaic = await prisma.freeInstitution.upsert({
    where: { id: 'giaic' },
    update: {},
    create: {
      id: 'giaic',
      name: 'GIAIC — Governor Sindh Initiative for Artificial Intelligence, Cloud Computing & Cybersecurity',
      type: 'govt',
      description: 'Governor Sindh Kamran Tessori launched the Governor Sindh Initiative for Artificial Intelligence, Cloud Computing, and Cybersecurity (GIAIC) — one of Pakistan\'s largest free tech education programs. The initiative offers free courses in AI, machine learning, cloud computing (AWS, Azure), cybersecurity, web3/blockchain, and full-stack development. Over 500,000+ students have enrolled. Courses are conducted online and at physical centers across Sindh. Graduates receive internationally recognized certifications and job placement assistance.',
      website: 'https://giaic.org/',
      location: 'Karachi, Sindh (with online classes nationwide)',
      province: 'sindh',
      contactEmail: 'info@giaic.org',
      contactPhone: '+92-21-34567890',
      eligibilityCriteria: '• Open to all Pakistani students aged 16-45\n• Minimum: Matriculation (10th grade) pass\n• Intermediate or above preferred for advanced tracks\n• Basic computer and internet literacy required\n• Must have access to a computer and internet for online classes\n• CNIC or B-Form mandatory\n• Students from all provinces can apply (online classes available)',
      applicationProcess: '1. Visit giaic.org and create an account\n2. Fill out the enrollment form with personal and educational details\n3. Select your desired learning track (AI, Cloud, Cybersecurity, Web3, etc.)\n4. Complete the online aptitude assessment\n5. Receive confirmation email with batch schedule\n6. Attend online or in-person classes as per your batch\n7. Complete all modules and assignments\n8. Pass the final assessment to receive certification\n9. Access job placement portal for opportunities',
      verificationStatus: 'verified',
      courses: {
        create: [
          { name: 'Artificial Intelligence & Machine Learning', duration: '6 months', fee: 'Free (Govt Funded)', certification: 'GIAIC / Governor Sindh Certificate', description: 'Comprehensive AI/ML course covering Python, TensorFlow, neural networks, NLP, and computer vision', batchStart: 'Rolling admissions — new batch every quarter' },
          { name: 'Cloud Computing (AWS + Azure)', duration: '4 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate + AWS Cloud Practitioner Prep', description: 'Cloud architecture, deployment, and management on AWS and Microsoft Azure', batchStart: 'Rolling admissions' },
          { name: 'Cybersecurity & Ethical Hacking', duration: '5 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Network security, penetration testing, vulnerability assessment, and security auditing', batchStart: 'Rolling admissions' },
          { name: 'Full Stack Web Development', duration: '6 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Complete web development with MERN stack, TypeScript, and DevOps basics', batchStart: 'Rolling admissions' },
          { name: 'Blockchain & Web3 Development', duration: '4 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Smart contracts, Solidity, DApps, and decentralized finance', batchStart: 'Rolling admissions' },
          { name: 'Data Science & Analytics', duration: '5 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Data analysis, visualization, SQL, Python, and business intelligence', batchStart: 'Rolling admissions' },
          { name: 'Mobile App Development (React Native)', duration: '4 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Cross-platform mobile app development for iOS and Android', batchStart: 'Rolling admissions' },
          { name: 'DevOps & Software Engineering', duration: '4 months', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'CI/CD, Docker, Kubernetes, Git, and agile methodologies', batchStart: 'Rolling admissions' },
        ],
      },
      entryTests: {
        create: [
          {
            testName: 'GIAIC Online Aptitude Assessment',
            type: 'online',
            totalMarks: 100,
            passingMarks: 50,
            passingPercentage: '50%',
            syllabus: 'Basic mathematics, logical reasoning, English comprehension, and general computer knowledge',
            preparationTips: 'Review basic math and logic, practice English reading comprehension, and familiarize yourself with basic computer concepts. Sample tests available on giaic.org',
          },
        ],
      },
      documents: {
        create: [
          { documentName: 'CNIC or B-Form', description: 'Valid national identity card (mandatory for certification)', isRequired: true },
          { documentName: 'Educational certificates', description: 'Matriculation/Intermediate/degree certificates', isRequired: true },
          { documentName: 'Passport-size photographs', description: '2 recent photographs', isRequired: true },
          { documentName: 'Computer & Internet access', description: 'Laptop/desktop with stable internet for online classes', isRequired: true },
          { documentName: 'Domicile certificate', description: 'Sindh domicile preferred but not required', isRequired: false },
        ],
      },
    },
  });
  console.log('Created/Updated:', giaic.name);

  // Summary
  const count = await prisma.freeInstitution.count();
  console.log(`\nTotal institutions now: ${count}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
