import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing institution data...\n');

  // Fix GIAIC
  const giaic = await prisma.freeInstitution.upsert({
    where: { id: 'giaic' },
    update: {
      name: 'GIAIC — Governor Sindh Initiative for AI & Computing',
      description: 'Governor Sindh Kamran Tessori launched GIAIC — one of Pakistan\'s largest free tech education programs. Offers free courses in AI, cloud computing, cybersecurity, web3, and full-stack development. 500,000+ students enrolled. Courses conducted online and at physical centers across Sindh. Graduates receive internationally recognized certifications and job placement assistance.',
      website: 'https://www.governorsindh.com/',
      location: 'Karachi, Sindh (with online classes nationwide)',
      contactEmail: 'info@governorsindh.com',
      contactPhone: '+92-21-35612222',
      eligibilityCriteria: 'Open to all Pakistani students aged 16-45\nMinimum: Matriculation (10th grade) pass\nIntermediate or above preferred for advanced tracks\nBasic computer and internet literacy required\nMust have access to a computer and internet\nCNIC or B-Form mandatory\nStudents from all provinces can apply (online classes available)',
      applicationProcess: '1. Visit governorsindh.com and create an account\n2. Fill out the enrollment form\n3. Select your learning track (AI, Cloud, Cybersecurity, Web3, etc.)\n4. Complete the online aptitude assessment\n5. Receive confirmation email with batch schedule\n6. Attend online or in-person classes\n7. Complete all modules and assignments\n8. Pass final assessment for certification\n9. Access job placement portal',
    },
    create: {
      id: 'giaic',
      name: 'GIAIC — Governor Sindh Initiative for AI & Computing',
      type: 'govt',
      description: 'Governor Sindh Kamran Tessori launched GIAIC — one of Pakistan\'s largest free tech education programs. Offers free courses in AI, cloud computing, cybersecurity, web3, and full-stack development. 500,000+ students enrolled.',
      website: 'https://www.governorsindh.com/',
      location: 'Karachi, Sindh (with online classes nationwide)',
      province: 'sindh',
      contactEmail: 'info@governorsindh.com',
      contactPhone: '+92-21-35612222',
      eligibilityCriteria: 'Open to all Pakistani students aged 16-45\nMinimum: Matriculation (10th grade) pass\nIntermediate or above preferred for advanced tracks\nBasic computer and internet literacy required\nCNIC or B-Form mandatory',
      applicationProcess: '1. Visit governorsindh.com\n2. Fill enrollment form\n3. Select learning track\n4. Complete aptitude assessment\n5. Attend classes\n6. Pass final assessment for certification',
      verificationStatus: 'verified',
      courses: {
        create: [
          { name: 'Certified Cloud Applied Generative AI Engineer (GenEng)', duration: '13 weeks (per course, 3 compulsory + advanced tracks)', fee: 'Free (Govt Funded)', certification: 'GIAIC / Governor Sindh Certificate', description: 'Complete AI engineering program with compulsory courses in Programming Fundamentals, Web2 using NextJS, and Earn as You Learn, plus advanced tracks in AI, Cloud, Web3, and more', batchStart: 'Rolling admissions — new batch every quarter' },
          { name: 'Artificial Intelligence & Deep Learning', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'AI-351: Developing Planet-Scale Intelligent APIs and Python Programming, deep learning, neural networks, NLP', batchStart: 'Rolling admissions' },
          { name: 'Cloud-Native Computing', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Cloud architecture, Kubernetes, microservices, and containerized applications', batchStart: 'Rolling admissions' },
          { name: 'Web 3 and Metaverse', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Web3 development, blockchain, smart contracts, and metaverse experiences', batchStart: 'Rolling admissions' },
          { name: 'Ambient Computing and IoT', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Internet of Things, embedded systems, smart devices, and ambient computing', batchStart: 'Rolling admissions' },
          { name: 'Genomics and Bioinformatics', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Computational biology, genomics data analysis, and bioinformatics tools', batchStart: 'Rolling admissions' },
          { name: 'Network Programmability and Automation', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Network automation, programmability, Python for networking, and infrastructure as code', batchStart: 'Rolling admissions' },
          { name: 'Programming Fundamentals (Compulsory)', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Core programming concepts, problem solving, and software development basics — required for all tracks', batchStart: 'Rolling admissions' },
          { name: 'Web2 Using NextJS (Compulsory)', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Modern web development with Next.js, React, TypeScript — required for all tracks', batchStart: 'Rolling admissions' },
          { name: 'Earn as You Learn (Compulsory)', duration: '13 weeks', fee: 'Free (Govt Funded)', certification: 'GIAIC Certificate', description: 'Freelancing, client management, and earning strategies — required for all tracks', batchStart: 'Rolling admissions' },
        ],
      },
    },
  });
  console.log('Fixed:', giaic.name, '|', giaic.website);

  // Fix Bano Qabil
  const banoqabil = await prisma.freeInstitution.upsert({
    where: { id: 'qabil-it-centre' },
    update: {
      name: 'Bano Qabil IT Centre (Alkhidmat Foundation)',
      description: 'Bano Qabil is Alkhidmat Foundation\'s flagship youth development program offering 100% free IT training across Pakistan. With 75,000+ students trained, 50+ facilities, and 29 high-tech courses, Bano Qabil provides industry-aligned curriculum in web development, AI, cybersecurity, digital marketing, and more. Programs include incubation centres and a dedicated job portal. Certified by LRN, SBTE, and SDC. Partners include Alibaba Cloud.',
      website: 'https://banoqabil.pk/',
      location: 'Karachi, Sindh (with 50+ centers across Pakistan)',
      province: 'all',
      contactEmail: 'banoqabil.khi@alkhidmat.com',
      contactPhone: '021-111-503-504',
      eligibilityCriteria: 'Open to all Pakistani youth (male and female)\nMinimum age: 16 years\nAptitude test required (English, logical reasoning, math)\nInterview round\nPKR 3,000 refundable security deposit\nMust attend regular classes\nCNIC or B-Form mandatory',
      applicationProcess: '1. Register online at banoqabil.pk or visit nearest center\n2. Take aptitude test (English, logical reasoning, math)\n3. Attend interview\n4. Pay PKR 3,000 refundable security deposit\n5. Select campus and time slot\n6. Attend classes\n7. Pass exams and receive certification at annual convocation',
    },
    create: {
      id: 'qabil-it-centre',
      name: 'Bano Qabil IT Centre (Alkhidmat Foundation)',
      type: 'ngo',
      description: 'Bano Qabil is Alkhidmat Foundation\'s flagship youth development program offering 100% free IT training across Pakistan. 75,000+ students trained, 50+ centers, 29 courses.',
      website: 'https://banoqabil.pk/',
      location: 'Karachi, Sindh (with 50+ centers across Pakistan)',
      province: 'all',
      contactEmail: 'banoqabil.khi@alkhidmat.com',
      contactPhone: '021-111-503-504',
      eligibilityCriteria: 'Open to all Pakistani youth\nMinimum age: 16 years\nAptitude test required\nPKR 3,000 refundable security deposit\nCNIC or B-Form mandatory',
      applicationProcess: '1. Register at banoqabil.pk\n2. Take aptitude test\n3. Attend interview\n4. Pay refundable deposit\n5. Select campus\n6. Begin classes',
      verificationStatus: 'verified',
      courses: {
        create: [
          { name: 'Web Development with AI', duration: '2 months', fee: 'Free', certification: 'Bano Qabil Certificate (LRN/SBTE/SDC)', description: 'Complete web development — HTML, CSS, JavaScript from scratch to responsive websites with AI integration', batchStart: 'New batch every quarter' },
          { name: 'UI/UX Design with Figma', duration: '5 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Wireframing, Prototyping, Design Systems & User-Centered Design — Enhanced with AI Design Tools', batchStart: 'New batch every quarter' },
          { name: 'Digital Marketing', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Social media marketing, SEO, SEM, content marketing, and analytics', batchStart: 'New batch every quarter' },
          { name: 'Graphic Designing', duration: '5 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Master Adobe Illustrator & Photoshop for Professional Branding', batchStart: 'New batch every quarter' },
          { name: 'Video Editing & Animations', duration: '5 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Master Adobe Premiere Pro & After Effects for Motion Graphics', batchStart: 'New batch every quarter' },
          { name: 'E Commerce Development', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Build professional e-commerce websites using Shopify and WooCommerce', batchStart: 'New batch every quarter' },
          { name: 'Amazon Virtual Assistant', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Product research, listing optimization, PPC, and international client management', batchStart: 'New batch every quarter' },
          { name: 'Cyber Security Fundamentals', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Protect systems from cyber threats, network security, ethical hacking basics', batchStart: 'New batch every quarter' },
          { name: 'Computer & Information Technology', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'MS Office, internet, computer basics — foundation course for beginners', batchStart: 'New batch every quarter' },
          { name: 'AI for Everyone', duration: '12 weeks', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Introduction to artificial intelligence, practical AI tools, and real-world applications', batchStart: 'New batch every quarter' },
          { name: 'Data Analytics & BI', duration: '12 weeks', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Data analysis, visualization, Excel, SQL, and business intelligence tools', batchStart: 'New batch every quarter' },
          { name: 'Digital Content Creation', duration: '5 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Automation-based content business using only a mobile phone — launch and manage monetized social media channels', batchStart: 'New batch every quarter' },
          { name: 'Digital Journalism', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Mobile Journalism & Content Creation — Video Production, Editing & Social Media Strategy', batchStart: 'New batch every quarter' },
          { name: 'Mobile App Development (Flutter)', duration: '4 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Cross-platform mobile app development using Flutter and Dart', batchStart: 'New batch every quarter' },
          { name: 'Python Programming & Data Science', duration: '3 months', fee: 'Free', certification: 'Bano Qabil Certificate', description: 'Python fundamentals, data analysis, and machine learning basics', batchStart: 'New batch every quarter' },
        ],
      },
    },
  });
  console.log('Fixed:', banoqabil.name, '|', banoqabil.website);

  console.log('\nDone! Institution data fixed.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
