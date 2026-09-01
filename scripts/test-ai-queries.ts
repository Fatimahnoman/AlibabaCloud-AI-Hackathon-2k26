import prisma from '@/lib/prisma';
import { retrieveEducationContext } from '@/services/ai/education-context';
import { detectIntent } from '@/services/ai/intent-detection';

const testQueries = [
  // Scholarship queries
  { query: 'Pakistan mein konsi scholarships available hain?', expected: 'scholarship data' },
  { query: 'Punjab ki scholarships batao', expected: 'Punjab scholarships' },
  { query: 'Sindh mein konsi scholarships hain?', expected: 'Sindh scholarships' },
  { query: 'GB ki scholarship ke liye kitne marks chahiye?', expected: 'GB scholarship' },
  { query: 'Bait-ul-Mal scholarship kaise apply karein?', expected: 'Bait-ul-Mal' },
  { query: 'NTHP scholarship kya hai?', expected: 'NTHP' },
  { query: 'BEEF scholarship Balochistan', expected: 'BEEF' },
  { query: 'UKAA scholarship details', expected: 'UKAA' },
  { query: 'International scholarships kon si hain Pakistanis ke liye?', expected: 'international scholarships' },
  { query: 'Fulbright ke liye kitne marks chahiye?', expected: 'Fulbright' },
  { query: 'Chevening scholarship deadline kya hai?', expected: 'Chevening' },
  { query: 'DAAD Germany scholarship apply kaise karein?', expected: 'DAAD' },
  { query: 'Erasmus Mundus scholarship eligibility', expected: 'Erasmus' },
  
  // Education/Marks queries
  { query: 'Germany mein university join karne ke liye kitne marks chahiye?', expected: 'Germany marks requirements' },
  { query: 'USA mein SAT kitna hona chahiye?', expected: 'USA SAT' },
  { query: 'UK mein A-Levels kitne chahiye Oxford ke liye?', expected: 'UK A-Levels Oxford' },
  { query: 'Canada mein university ke liye percentage kitni chahiye?', expected: 'Canada percentage' },
  { query: 'Australia mein ATAR kitna chahiye?', expected: 'Australia ATAR' },
  { query: 'IELTS kitna chahiye Germany ke liye?', expected: 'IELTS Germany' },
  
  // University queries
  { query: 'Lahore mein konsi universities hain?', expected: 'Lahore universities' },
  { query: 'Munich mein universities batao', expected: 'Munich universities' },
  { query: 'London mein konsi universities hain?', expected: 'London universities' },
  { query: 'Toronto mein universities', expected: 'Toronto universities' },
  { query: 'Sydney mein universities batao', expected: 'Sydney universities' },
  
  // Fee queries
  { query: 'Germany mein tuition fee kitni hai?', expected: 'Germany fees' },
  { query: 'USA mein cheapest university kaun si hai?', expected: 'United States' },
  { query: 'Canada mein kam fee wali university', expected: 'Canada low fee' },
  
  // Combined queries
  { query: 'Punjab se hoon, Germany jaana chahta hoon, kya karna chahiye?', expected: 'Punjab + Germany combined' },
  { query: 'Sindh se hoon, Fulbright ke liye apply karna hai, eligible hoon?', expected: 'Sindh + Fulbright' },
  { query: 'Balochistan se hoon, BE scholarships ke liye apply kaise karun?', expected: 'Balochistan + BEEF' },
];

async function testEducationContext() {
  console.log('=== REAL-WORLD AI QUERY TESTING ===\n');
  
  let passed = 0;
  let failed = 0;
  const results: { query: string; expected: string; found: boolean; contextLength: number }[] = [];
  
  for (const test of testQueries) {
    const intent = detectIntent(test.query);
    const context = await retrieveEducationContext(test.query, intent.intent);
    
    const contextLower = context.toLowerCase();
    const expectedLower = test.expected.toLowerCase();
    
    // Check if expected keywords appear in context
    const keywords = expectedLower.split(' ');
    const found = keywords.some(kw => contextLower.includes(kw));
    
    const status = found ? '✅' : '❌';
    console.log(`${status} Query: "${test.query}"`);
    console.log(`   Intent: ${intent.intent}`);
    console.log(`   Context length: ${context.length} chars`);
    if (!found) {
      console.log(`   Expected keywords: ${test.expected}`);
      console.log(`   First 200 chars: ${context.substring(0, 200)}...`);
    }
    console.log('');
    
    results.push({ query: test.query, expected: test.expected, found, contextLength: context.length });
    if (found) passed++;
    else failed++;
  }
  
  console.log(`\n=== RESULTS: ${passed}/${testQueries.length} passed, ${failed} failed ===\n`);
  
  // Test specific data quality
  console.log('=== DATA QUALITY CHECKS ===\n');
  
  // Check Pakistan scholarships
  const pakIntent = detectIntent('Pakistan scholarships');
  const pakContext = await retrieveEducationContext('Pakistan scholarships', pakIntent.intent);
  
  const pakScholarships = ['NTHP', 'STHP', 'BEEF', 'Ehsaas', 'Bait-ul-Mal', 'GB', 'SEEF'];
  const intlScholarships = ['Fulbright', 'Chevening', 'DAAD', 'Erasmus'];
  
  console.log('\n--- Pakistan Scholarships (should be in Pakistan query) ---');
  for (const s of pakScholarships) {
    const found = pakContext.toLowerCase().includes(s.toLowerCase());
    console.log(`${found ? '✅' : '❌'} ${s}: ${found ? 'FOUND' : 'MISSING'}`);
  }
  
  // Check international scholarships
  const intlIntent = detectIntent('International scholarships');
  const intlContext = await retrieveEducationContext('International scholarships', intlIntent.intent);
  
  console.log('\n--- International Scholarships (should be in intl query) ---');
  for (const s of intlScholarships) {
    const found = intlContext.toLowerCase().includes(s.toLowerCase());
    console.log(`${found ? '✅' : '❌'} ${s}: ${found ? 'FOUND' : 'MISSING'}`);
  }
  console.log('   Context length:', intlContext.length, 'chars');
  
  // Check marks requirements
  const marksIntent = detectIntent('marks requirements');
  const marksContext = await retrieveEducationContext('marks requirements Germany', marksIntent.intent);
  
  const requiredMarks = ['ielts', 'toefl', 'gpa', 'percentage', '6.5', '80'];
  console.log('\n--- Marks Data ---');
  for (const m of requiredMarks) {
    const found = marksContext.toLowerCase().includes(m);
    console.log(`${found ? '✅' : '❌'} ${m}: ${found ? 'FOUND' : 'MISSING'}`);
  }
  
  // Check city filtering
  const cityIntent = detectIntent('Munich universities');
  const cityContext = await retrieveEducationContext('Munich universities', cityIntent.intent);
  const munichFound = cityContext.toLowerCase().includes('munich');
  console.log(`\n--- City Filtering ---`);
  console.log(`${munichFound ? '✅' : '❌'} Munich city detection: ${munichFound ? 'WORKS' : 'FAILED'}`);
  
  // Check country detection
  const countryIntent = detectIntent('UK universities');
  const countryContext = await retrieveEducationContext('UK universities', countryIntent.intent);
  const ukFound = countryContext.toLowerCase().includes('united kingdom');
  console.log(`${ukFound ? '✅' : '❌'} UK country detection: ${ukFound ? 'WORKS' : 'FAILED'}`);
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Queries: ${passed}/${testQueries.length} passed`);
  console.log(`Pakistan Scholarships: ${pakScholarships.filter(s => pakContext.toLowerCase().includes(s.toLowerCase())).length}/${pakScholarships.length} found`);
  console.log(`International Scholarships: ${intlScholarships.filter(s => intlContext.toLowerCase().includes(s.toLowerCase())).length}/${intlScholarships.length} found`);
  console.log(`Marks data: ${requiredMarks.filter(m => marksContext.toLowerCase().includes(m)).length}/${requiredMarks.length} found`);
  console.log(`City filtering: ${munichFound ? 'WORKS' : 'FAILED'}`);
  console.log(`Country detection: ${ukFound ? 'WORKS' : 'FAILED'}`);
  
  process.exit(failed > 0 ? 1 : 0);
}

testEducationContext().catch(e => { console.error('Test failed:', e); process.exit(1); });
