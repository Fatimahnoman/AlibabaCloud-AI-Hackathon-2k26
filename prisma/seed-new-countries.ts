import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const newUniversities = [
  // ===== INDIA =====
  { id: 'uni-in-001', name: 'Indian Institute of Technology Bombay (IIT Bombay)', country: 'India', city: 'Mumbai', website: 'https://www.iitb.ac.in', foundedYear: 1958, type: 'public', description: 'QS #149. Premier engineering institute. ENTRY TESTS: JEE Advanced. Admission via JEE Main + JEE Advanced. Highly competitive (~1% acceptance). Tuition: INR 2-3 lakh/year for general category.' },
  { id: 'uni-in-002', name: 'Indian Institute of Technology Delhi (IIT Delhi)', country: 'India', city: 'New Delhi', website: 'https://www.iitd.ac.in', foundedYear: 1961, type: 'public', description: 'QS #197. Top engineering institute in India. JEE Advanced required. Strong in CS, EE, ME. Research output among highest in India.' },
  { id: 'uni-in-003', name: 'Indian Institute of Science (IISc Bangalore)', country: 'India', city: 'Bangalore', website: 'https://www.iisc.ac.in', foundedYear: 1909, type: 'public', description: 'QS #155. India top research university. Specializes in science and engineering research. JEE/GATE/NET for admission. Strong PhD programs.' },
  { id: 'uni-in-004', name: 'University of Delhi', country: 'India', city: 'New Delhi', website: 'https://www.du.ac.in', foundedYear: 1922, type: 'public', description: 'One of largest universities in India. 90+ colleges. CUET for admission. Strong in Arts, Science, Commerce. Affordable tuition.' },
  { id: 'uni-in-005', name: 'IIT Madras', country: 'India', city: 'Chennai', website: 'https://www.iitm.ac.in', foundedYear: 1959, type: 'public', description: 'QS #227. Ranked #1 in India by NIRF consistently. JEE Advanced required. Strong in CS, EE, Mechanical, and research.' },
  { id: 'uni-in-006', name: 'IIT Kanpur', country: 'India', city: 'Kanpur', website: 'https://www.iitk.ac.in', foundedYear: 1959, type: 'public', description: 'JEE Advanced required. Known for strong CS and mathematics programs. Pioneered India first CS department.' },
  { id: 'uni-in-007', name: 'IIT Kharagpur', country: 'India', city: 'Kharagpur', website: 'https://www.iitkgp.ac.in', foundedYear: 1951, type: 'public', description: 'First IIT established. Largest IIT campus. JEE Advanced required. 19 departments covering engineering, science, humanities.' },
  { id: 'uni-in-008', name: 'Jawaharlal Nehru University (JNU)', country: 'India', city: 'New Delhi', website: 'https://www.jnu.ac.in', foundedYear: 1969, type: 'public', description: 'Known for social sciences, international relations, and languages. CUET/NET for admission. Strong research culture.' },
  { id: 'uni-in-009', name: 'University of Mumbai', country: 'India', city: 'Mumbai', website: 'https://mu.ac.in', foundedYear: 1857, type: 'public', description: 'One of oldest universities in India. 700+ affiliated colleges. Strong in commerce, science, and arts.' },
  { id: 'uni-in-010', name: 'BITS Pilani', country: 'India', city: 'Pilani', website: 'https://www.bits-pilani.ac.in', foundedYear: 1964, type: 'private', description: 'Premier private engineering university. BITSAT for admission. Strong industry connections. Known for CS and EE.' },
  { id: 'uni-in-011', name: 'IIM Ahmedabad', country: 'India', city: 'Ahmedabad', website: 'https://www.iima.ac.in', foundedYear: 1961, type: 'public', description: 'India top business school. CAT for admission. MBA/PGP programs. Strong alumni network in consulting and finance.' },
  { id: 'uni-in-012', name: 'IIM Bangalore', country: 'India', city: 'Bangalore', website: 'https://www.iimb.ac.in', foundedYear: 1973, type: 'public', description: 'Top MBA program in India. CAT required. Strong placements with average CTC INR 30+ LPA.' },

  // ===== CHINA =====
  { id: 'uni-cn-001', name: 'Tsinghua University', country: 'China', city: 'Beijing', website: 'https://www.tsinghua.edu.cn', foundedYear: 1911, type: 'public', description: 'QS #14. Best university in Asia. CSC scholarship available. Strong in engineering, CS, and science. Gaokao for domestic, HSK for international.' },
  { id: 'uni-cn-002', name: 'Peking University', country: 'China', city: 'Beijing', website: 'https://www.pku.edu.cn', foundedYear: 1898, type: 'public', description: 'QS #17. China oldest modern university. Strong in humanities, social sciences, and science. CSC scholarship available.' },
  { id: 'uni-cn-003', name: 'Fudan University', country: 'China', city: 'Shanghai', website: 'https://www.fudan.edu.cn', foundedYear: 1905, type: 'public', description: 'QS #34. Top university in Shanghai. Strong in humanities, social sciences, natural sciences, and medicine.' },
  { id: 'uni-cn-004', name: 'Shanghai Jiao Tong University', country: 'China', city: 'Shanghai', website: 'https://www.sjtu.edu.cn', foundedYear: 1896, type: 'public', description: 'QS #46. Strong in engineering, medicine, and business. SJTU MBA well-known internationally.' },
  { id: 'uni-cn-005', name: 'Zhejiang University', country: 'China', city: 'Hangzhou', website: 'https://www.zju.edu.cn', foundedYear: 1897, type: 'public', description: 'QS #44. One of China oldest and most prestigious. Strong in CS, engineering, and agriculture.' },
  { id: 'uni-cn-006', name: 'University of Science and Technology of China (USTC)', country: 'China', city: 'Hefei', website: 'https://www.ustc.edu.cn', foundedYear: 1958, type: 'public', description: 'QS #137. Specializes in science and technology. Affiliated with Chinese Academy of Sciences. Strong in physics and CS.' },
  { id: 'uni-cn-007', name: 'Nanjing University', country: 'China', city: 'Nanjing', website: 'https://www.nju.edu.cn', foundedYear: 1902, type: 'public', description: 'QS #124. Strong in natural sciences, humanities, and social sciences. Beautiful campus.' },
  { id: 'uni-cn-008', name: 'Wuhan University', country: 'China', city: 'Wuhan', website: 'https://www.whu.edu.cn', foundedYear: 1893, type: 'public', description: 'QS #157. Known for beautiful cherry blossom campus. Strong in law, chemistry, and remote sensing.' },

  // ===== JAPAN =====
  { id: 'uni-jp-001', name: 'University of Tokyo', country: 'Japan', city: 'Tokyo', website: 'https://www.u-tokyo.ac.jp', foundedYear: 1877, type: 'public', description: 'QS #28. Japan best university. MEXT scholarship available. Strong in virtually all fields. EJU + university exams for domestic, English programs available.' },
  { id: 'uni-jp-002', name: 'Kyoto University', country: 'Japan', city: 'Kyoto', website: 'https://www.kyoto-u.ac.jp', foundedYear: 1897, type: 'public', description: 'QS #50. Known for strong research output. Nobel laureates in physics and chemistry. MEXT scholarship available.' },
  { id: 'uni-jp-003', name: 'Osaka University', country: 'Japan', city: 'Osaka', website: 'https://www.osaka-u.ac.jp', foundedYear: 1931, type: 'public', description: 'QS #80. Strong in engineering, medicine, and science. MEXT scholarship. Active international exchange programs.' },
  { id: 'uni-jp-004', name: 'Tohoku University', country: 'Japan', city: 'Sendai', website: 'https://www.tohoku.ac.jp', foundedYear: 1907, type: 'public', description: 'QS #113. Strong in materials science and engineering. MEXT scholarship. Known for open admission policies.' },
  { id: 'uni-jp-005', name: 'Nagoya University', country: 'Japan', city: 'Nagoya', website: 'https://www.nagoya-u.ac.jp', foundedYear: 1939, type: 'public', description: 'QS #152. 6 Nobel laureates. Strong in physics, chemistry, and medicine. MEXT scholarship available.' },
  { id: 'uni-jp-006', name: 'Hokkaido University', country: 'Japan', city: 'Sapporo', website: 'https://www.hokudai.ac.jp', foundedYear: 1876, type: 'public', description: 'QS #196. Known for campus beauty and strong research. MEXT scholarship. Good for agriculture and environmental science.' },
  { id: 'uni-jp-007', name: 'Waseda University', country: 'Japan', city: 'Tokyo', website: 'https://www.waseda.jp', foundedYear: 1882, type: 'private', description: 'Top private university in Japan. Strong in political science, economics, and literature. Many English-taught programs.' },
  { id: 'uni-jp-008', name: 'Keio University', country: 'Japan', city: 'Tokyo', website: 'https://www.keio.ac.jp', foundedYear: 1858, type: 'private', description: 'Japan oldest private university. Strong in medicine, economics, and law. Good international student support.' },

  // ===== SOUTH KOREA =====
  { id: 'uni-kr-001', name: 'Seoul National University (SNU)', country: 'South Korea', city: 'Seoul', website: 'https://www.snu.ac.kr', foundedYear: 1946, type: 'public', description: 'QS #31. Korea best university. GKS/KGSP scholarship available. Strong in all fields. CSAT for domestic, TOPIK for Korean programs.' },
  { id: 'uni-kr-002', name: 'Korea Advanced Institute of Science and Technology (KAIST)', country: 'South Korea', city: 'Daejeon', website: 'https://www.kaist.ac.kr', foundedYear: 1971, type: 'public', description: 'QS #56. Korea top science and technology university. GKS scholarship. Strong in CS, EE, and engineering. English programs available.' },
  { id: 'uni-kr-003', name: 'Yonsei University', country: 'South Korea', city: 'Seoul', website: 'https://www.yonsei.ac.kr', foundedYear: 1885, type: 'private', description: 'QS #76. One of Korea top 3 private universities. Strong in business, medicine, and international studies.' },
  { id: 'uni-kr-004', name: 'Korea University', country: 'South Korea', city: 'Seoul', website: 'https://www.korea.edu', foundedYear: 1905, type: 'private', description: 'QS #79. Known for strong business school and law school. Active international exchange programs.' },
  { id: 'uni-kr-005', name: 'Sungkyunkwan University (SKKU)', country: 'South Korea', city: 'Seoul', website: 'https://www.skku.edu', foundedYear: 1398, type: 'private', description: 'QS #145. Korea oldest university (founded 1398). Strong engineering and business. Samsung-affiliated research.' },
  { id: 'uni-kr-006', name: 'Hanyang University', country: 'South Korea', city: 'Seoul', website: 'https://www.hanyang.ac.kr', foundedYear: 1939, type: 'private', description: 'QS #164. Strong in engineering (especially chemical and mechanical). Good international student programs.' },
  { id: 'uni-kr-007', name: 'POSTECH (Pohang University of Science and Technology)', country: 'South Korea', city: 'Pohang', website: 'https://www.postech.ac.kr', foundedYear: 1986, type: 'private', description: 'QS #151. Small but elite science and technology university. Strong research output per faculty.' },

  // ===== UAE =====
  { id: 'uni-ae-001', name: 'Khalifa University', country: 'United Arab Emirates', city: 'Abu Dhabi', website: 'https://www.khalifauniversity.ac.ae', foundedYear: 2007, type: 'public', description: 'QS #213. UAE top university. Strong in engineering, science, and technology. Scholarship available for international students. SAT/EmSAT required.' },
  { id: 'uni-ae-002', name: 'United Arab Emirates University (UAEU)', country: 'United Arab Emirates', city: 'Al Ain', website: 'https://www.uaeu.ac.ae', foundedYear: 1976, type: 'public', description: 'QS #288. First national university in UAE. Strong in business, education, and engineering.' },
  { id: 'uni-ae-003', name: 'American University of Sharjah (AUS)', country: 'United Arab Emirates', city: 'Sharjah', website: 'https://www.aus.edu', foundedYear: 1997, type: 'private', description: 'QS #364. Top private university in UAE. American-style curriculum. Strong in engineering and business.' },
  { id: 'uni-ae-004', name: 'University of Sharjah', country: 'United Arab Emirates', city: 'Sharjah', website: 'https://www.sharjah.ac.ae', foundedYear: 1997, type: 'public', description: 'QS #521-530. Largest university in UAE by enrollment. Wide range of programs.' },

  // ===== SAUDI ARABIA =====
  { id: 'uni-sa-001', name: 'King Abdullah University of Science and Technology (KAUST)', country: 'Saudi Arabia', city: 'Thuwal', website: 'https://www.kaust.edu.sa', foundedYear: 2009, type: 'public', description: 'QS #160. Research-only graduate university. Full funding for all admitted students. Strong in science and engineering. GRE required.' },
  { id: 'uni-sa-002', name: 'King Saud University', country: 'Saudi Arabia', city: 'Riyadh', website: 'https://www.ksu.edu.sa', foundedYear: 1957, type: 'public', description: 'QS #163. Largest university in Saudi Arabia. Strong in medicine, engineering, and computer science.' },
  { id: 'uni-sa-003', name: 'King Fahd University of Petroleum and Minerals (KFUPM)', country: 'Saudi Arabia', city: 'Dhahran', website: 'https://www.kfupm.edu.sa', foundedYear: 1963, type: 'public', description: 'QS #166. Top engineering university in Saudi Arabia. Strong in petroleum engineering and CS. Scholarship available.' },

  // ===== TURKEY =====
  { id: 'uni-tr-001', name: 'Bogazici University', country: 'Turkey', city: 'Istanbul', website: 'https://www.boun.edu.tr', foundedYear: 1971, type: 'public', description: 'QS #485. Top university in Turkey. English-medium instruction. Strong in engineering and science. Turkey Burslari scholarship available.' },
  { id: 'uni-tr-002', name: 'Middle East Technical University (METU)', country: 'Turkey', city: 'Ankara', website: 'https://www.metu.edu.tr', foundedYear: 1956, type: 'public', description: 'QS #533. Top technical university in Turkey. English-medium. Strong in engineering, architecture, and science.' },
  { id: 'uni-tr-003', name: 'Istanbul Technical University', country: 'Turkey', city: 'Istanbul', website: 'https://www.itu.edu.tr', foundedYear: 1773, type: 'public', description: 'Oldest technical university in the world. Strong in engineering and architecture. Turkey Burslari available.' },
  { id: 'uni-tr-004', name: 'Hacettepe University', country: 'Turkey', city: 'Ankara', website: 'https://www.hacettepe.edu.tr', foundedYear: 1967, type: 'public', description: 'Strong in medicine and health sciences. Turkey Burslari scholarship available.' },
  { id: 'uni-tr-005', name: 'Koc University', country: 'Turkey', city: 'Istanbul', website: 'https://www.ku.edu.tr', foundedYear: 1993, type: 'private', description: 'Top private university in Turkey. Strong in business, engineering, and social sciences. Scholarships for international students.' },

  // ===== MALAYSIA =====
  { id: 'uni-my-001', name: 'University of Malaya (UM)', country: 'Malaysia', city: 'Kuala Lumpur', website: 'https://www.um.edu.my', foundedYear: 1905, type: 'public', description: 'QS #60. Malaysia best university. MTCP scholarship available. Strong in all fields. IELTS 5.5+ required.' },
  { id: 'uni-my-002', name: 'Universiti Putra Malaysia (UPM)', country: 'Malaysia', city: 'Serdang', website: 'https://www.upm.edu.my', foundedYear: 1971, type: 'public', description: 'QS #158. Strong in agriculture, forestry, and environmental science. MTCP scholarship.' },
  { id: 'uni-my-003', name: 'Universiti Teknologi Malaysia (UTM)', country: 'Malaysia', city: 'Johor Bahru', website: 'https://www.utm.my', foundedYear: 1975, type: 'public', description: 'QS #188. Top engineering university in Malaysia. Strong in engineering, science, and technology.' },
  { id: 'uni-my-004', name: 'Universiti Sains Malaysia (USM)', country: 'Malaysia', city: 'Penang', website: 'https://www.usm.my', foundedYear: 1969, type: 'public', description: 'QS #143. Known as APEX university (accelerating excellence). Strong in science, engineering, and health.' },
  { id: 'uni-my-005', name: 'Taylor\'s University', country: 'Malaysia', city: 'Subang Jaya', website: 'https://www.taylors.edu.my', foundedYear: 1969, type: 'private', description: 'Top private university in Malaysia. Strong in hospitality, business, and engineering. QS World University Rankings.' },

  // ===== SINGAPORE =====
  { id: 'uni-sg-001', name: 'National University of Singapore (NUS)', country: 'Singapore', city: 'Singapore', website: 'https://www.nus.edu.sg', foundedYear: 1905, type: 'public', description: 'QS #8. Best university in Asia. Strong in virtually all fields. SAT/ACT for undergraduate. Full scholarships available.' },
  { id: 'uni-sg-002', name: 'Nanyang Technological University (NTU)', country: 'Singapore', city: 'Singapore', website: 'https://www.ntu.edu.sg', foundedYear: 1991, type: 'public', description: 'QS #15. Strong in engineering, science, and business. Youngest university in top 20 worldwide.' },
  { id: 'uni-sg-003', name: 'Singapore Management University (SMU)', country: 'Singapore', city: 'Singapore', website: 'https://www.smu.edu.sg', foundedYear: 2000, type: 'public', description: 'QS #545. Known for business, accounting, and social sciences. American-style curriculum.' },

  // ===== NEW ZEALAND =====
  { id: 'uni-nz-001', name: 'University of Auckland', country: 'New Zealand', city: 'Auckland', website: 'https://www.auckland.ac.nz', foundedYear: 1883, type: 'public', description: 'QS #68. Best university in New Zealand. Strong in engineering, medicine, and science. NZ scholarships available.' },
  { id: 'uni-nz-002', name: 'University of Canterbury', country: 'New Zealand', city: 'Christchurch', website: 'https://www.canterbury.ac.nz', foundedYear: 1873, type: 'public', description: 'QS #256. Strong in engineering (especially civil and mechanical). Good international student support.' },
  { id: 'uni-nz-003', name: 'Victoria University of Wellington', country: 'New Zealand', city: 'Wellington', website: 'https://www.wgtn.ac.nz', foundedYear: 1897, type: 'public', description: 'QS #241. Strong in humanities, law, and public policy. Capital city location.' },
  { id: 'uni-nz-004', name: 'University of Otago', country: 'New Zealand', city: 'Dunedin', website: 'https://www.otago.ac.nz', foundedYear: 1869, type: 'public', description: 'QS #206. Oldest university in New Zealand. Strong in health sciences, mining, and surveying.' },

  // ===== NORDIC =====
  { id: 'uni-se-001', name: 'KTH Royal Institute of Technology', country: 'Sweden', city: 'Stockholm', website: 'https://www.kth.se', foundedYear: 1827, type: 'public', description: 'QS #73. Best technical university in Scandinavia. Strong in engineering and CS. Tuition-free for EU students.' },
  { id: 'uni-se-002', name: 'Lund University', country: 'Sweden', city: 'Lund', website: 'https://www.lund.se', foundedYear: 1666, type: 'public', description: 'QS #85. One of Europe oldest universities. Strong in physics, biology, and social sciences.' },
  { id: 'uni-fi-001', name: 'Aalto University', country: 'Finland', city: 'Helsinki', website: 'https://www.aalto.fi', foundedYear: 2010, type: 'public', description: 'QS #112. Merged from 3 top Finnish universities. Strong in design, technology, and business.' },
  { id: 'uni-fi-002', name: 'University of Helsinki', country: 'Finland', city: 'Helsinki', website: 'https://www.helsinki.fi', foundedYear: 1640, type: 'public', description: 'QS #115. Largest and oldest university in Finland. Strong in research output.' },
  { id: 'uni-dk-001', name: 'University of Copenhagen', country: 'Denmark', city: 'Copenhagen', website: 'https://www.ku.dk', foundedYear: 1479, type: 'public', description: 'QS #107. Largest university in Denmark. Strong in health sciences, humanities, and law.' },
  { id: 'uni-no-001', name: 'University of Oslo', country: 'Norway', city: 'Oslo', website: 'https://www.uio.no', foundedYear: 1811, type: 'public', description: 'QS #118. Top university in Norway. Tuition-free for all international students. Strong in humanities and social sciences.' },

  // ===== PHILIPPINES =====
  { id: 'uni-ph-001', name: 'University of the Philippines (UP)', country: 'Philippines', city: 'Quezon City', website: 'https://www.up.edu.ph', foundedYear: 1908, type: 'public', description: 'QS #379. Top university in Philippines. UPCAT for admission. Strong in public administration, law, and social sciences.' },

  // ===== THAILAND =====
  { id: 'uni-th-001', name: 'Chulalongkorn University', country: 'Thailand', city: 'Bangkok', website: 'https://www.chula.ac.th', foundedYear: 1917, type: 'public', description: 'QS #211. Best university in Thailand. TIPP scholarship available. Strong in engineering, business, and medicine.' },
  { id: 'uni-th-002', name: 'Mahidol University', country: 'Thailand', city: 'Bangkok', website: 'https://www.mahidol.ac.th', foundedYear: 1888, type: 'public', description: 'QS #229. Strong in medicine and health sciences. One of Thailand most research-active universities.' },

  // ===== HUNGARY =====
  { id: 'uni-hu-001', name: 'University of Budapest (ELTE)', country: 'Hungary', city: 'Budapest', website: 'https://www.elte.hu', foundedYear: 1635, type: 'public', description: 'QS #581-590. Largest university in Hungary. Stipendium Hungaricum scholarship available. Strong in natural sciences and humanities.' },
];

const newCourses = [
  // India
  { id: 'crs-in-001', universityId: 'uni-in-001', name: 'B.Tech Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 200000, currency: 'INR', description: 'Premier CS program. IIT Bombay is among the best for CS placements.' },
  { id: 'crs-in-002', universityId: 'uni-in-001', name: 'B.Tech Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', language: 'English', tuitionFee: 200000, currency: 'INR' },
  { id: 'crs-in-003', universityId: 'uni-in-002', name: 'B.Tech Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 200000, currency: 'INR' },
  { id: 'crs-in-004', universityId: 'uni-in-004', name: 'BA (Hons) Economics', degree: 'bachelor', department: 'Economics', duration: '3 years', language: 'English', tuitionFee: 15000, currency: 'INR' },
  { id: 'crs-in-005', universityId: 'uni-in-010', name: 'B.E. Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 1800000, currency: 'INR' },
  { id: 'crs-in-006', universityId: 'uni-in-011', name: 'MBA (PGP)', degree: 'masters', department: 'Business', duration: '2 years', language: 'English', tuitionFee: 2500000, currency: 'INR' },
  { id: 'crs-in-007', universityId: 'uni-in-012', name: 'MBA (PGP)', degree: 'masters', department: 'Business', duration: '2 years', language: 'English', tuitionFee: 2300000, currency: 'INR' },

  // China
  { id: 'crs-cn-001', universityId: 'uni-cn-001', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 26000, currency: 'CNY' },
  { id: 'crs-cn-002', universityId: 'uni-cn-001', name: 'BEng Electronic Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', language: 'English', tuitionFee: 26000, currency: 'CNY' },
  { id: 'crs-cn-003', universityId: 'uni-cn-002', name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', language: 'English', tuitionFee: 20000, currency: 'CNY' },
  { id: 'crs-cn-004', universityId: 'uni-cn-003', name: 'BSc Data Science', degree: 'bachelor', department: 'Data Science', duration: '4 years', language: 'English', tuitionFee: 22000, currency: 'CNY' },
  { id: 'crs-cn-005', universityId: 'uni-cn-005', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 20000, currency: 'CNY' },

  // Japan
  { id: 'crs-jp-001', universityId: 'uni-jp-001', name: 'BSc Computer Science', degree: 'bachelor', department: 'Information Science', duration: '4 years', language: 'English', tuitionFee: 535800, currency: 'JPY' },
  { id: 'crs-jp-002', universityId: 'uni-jp-001', name: 'BEng Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', language: 'English', tuitionFee: 535800, currency: 'JPY' },
  { id: 'crs-jp-003', universityId: 'uni-jp-002', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 535800, currency: 'JPY' },
  { id: 'crs-jp-004', universityId: 'uni-jp-007', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 1200000, currency: 'JPY' },

  // South Korea
  { id: 'crs-kr-001', universityId: 'uni-kr-001', name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 5000000, currency: 'KRW' },
  { id: 'crs-kr-002', universityId: 'uni-kr-002', name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 5500000, currency: 'KRW' },
  { id: 'crs-kr-003', universityId: 'uni-kr-003', name: 'BBA Business Administration', degree: 'bachelor', department: 'Business', duration: '4 years', language: 'English', tuitionFee: 6000000, currency: 'KRW' },

  // UAE
  { id: 'crs-ae-001', universityId: 'uni-ae-001', name: 'BSc Computer Engineering', degree: 'bachelor', department: 'Engineering', duration: '4 years', language: 'English', tuitionFee: 80000, currency: 'AED' },
  { id: 'crs-ae-002', universityId: 'uni-ae-003', name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 90000, currency: 'AED' },

  // Singapore
  { id: 'crs-sg-001', universityId: 'uni-sg-001', name: 'BComp Computer Science', degree: 'bachelor', department: 'Computing', duration: '4 years', language: 'English', tuitionFee: 38000, currency: 'SGD' },
  { id: 'crs-sg-002', universityId: 'uni-sg-002', name: 'BEng Computer Engineering', degree: 'bachelor', department: 'Engineering', duration: '4 years', language: 'English', tuitionFee: 36000, currency: 'SGD' },

  // Malaysia
  { id: 'crs-my-001', universityId: 'uni-my-001', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', language: 'English', tuitionFee: 30000, currency: 'MYR' },
  { id: 'crs-my-002', universityId: 'uni-my-003', name: 'BEng Mechanical Engineering', degree: 'bachelor', department: 'Engineering', duration: '4 years', language: 'English', tuitionFee: 25000, currency: 'MYR' },

  // New Zealand
  { id: 'crs-nz-001', universityId: 'uni-nz-001', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '3 years', language: 'English', tuitionFee: 32000, currency: 'NZD' },

  // Turkey
  { id: 'crs-tr-001', universityId: 'uni-tr-001', name: 'BSc Computer Engineering', degree: 'bachelor', department: 'Engineering', duration: '4 years', language: 'English', tuitionFee: 0, currency: 'TRY', description: 'Tuition-free for all students at public universities' },
  { id: 'crs-tr-002', universityId: 'uni-tr-002', name: 'BSc Computer Engineering', degree: 'bachelor', department: 'Engineering', duration: '4 years', language: 'English', tuitionFee: 0, currency: 'TRY', description: 'Tuition-free for all students' },

  // Nordic
  { id: 'crs-se-001', universityId: 'uni-se-001', name: 'MSc Computer Science', degree: 'masters', department: 'Computer Science', duration: '2 years', language: 'English', tuitionFee: 0, currency: 'SEK', description: 'Free for EU students, scholarships for non-EU' },
  { id: 'crs-fi-001', universityId: 'uni-fi-001', name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '3 years', language: 'English', tuitionFee: 0, currency: 'EUR', description: 'Free for EU/EEA students' },
];

(async () => {
  console.log('=== Seeding new international universities ===');
  let uniCount = 0;
  for (const u of newUniversities) {
    await prisma.university.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });
    uniCount++;
  }
  console.log(`  ${uniCount} universities upserted`);

  console.log('\n=== Seeding courses for new universities ===');
  let courseCount = 0;
  for (const c of newCourses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
    courseCount++;
  }
  console.log(`  ${courseCount} courses upserted`);

  // Summary
  const totalUnis = await prisma.university.count();
  const totalCourses = await prisma.course.count();
  const countries = await prisma.university.findMany({ select: { country: true }, distinct: ['country'] });
  console.log(`\nFinal DB: ${totalUnis} universities, ${totalCourses} courses, ${countries.length} countries`);
  console.log('Countries:', countries.map((c) => c.country).sort().join(', '));

  await prisma.$disconnect();
})();
