import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const COMMON_SKILLS: { name: string; category: string }[] = [
  // Mathematics
  { name: 'Algebra', category: 'Mathematics' },
  { name: 'Geometry', category: 'Mathematics' },
  { name: 'Trigonometry', category: 'Mathematics' },
  { name: 'Calculus', category: 'Mathematics' },
  { name: 'Differential Equations', category: 'Mathematics' },
  { name: 'Linear Algebra', category: 'Mathematics' },
  { name: 'Statistics', category: 'Mathematics' },
  { name: 'Probability', category: 'Mathematics' },
  { name: 'Number Theory', category: 'Mathematics' },
  { name: 'Mathematical Analysis', category: 'Mathematics' },
  { name: 'Discrete Mathematics', category: 'Mathematics' },
  { name: 'Mathematical Logic', category: 'Mathematics' },
  { name: 'Complex Analysis', category: 'Mathematics' },
  { name: 'Numerical Methods', category: 'Mathematics' },
  { name: 'Combinatorics', category: 'Mathematics' },
  { name: 'Topology', category: 'Mathematics' },
  { name: 'Set Theory', category: 'Mathematics' },
  { name: 'Graph Theory', category: 'Mathematics' },
  { name: 'Game Theory', category: 'Mathematics' },
  { name: 'Financial Mathematics', category: 'Mathematics' },
  { name: 'Elementary Mathematics', category: 'Mathematics' },
  { name: 'SAT Math', category: 'Mathematics' },
  { name: 'GRE Math', category: 'Mathematics' },
  { name: 'Olympiad Mathematics', category: 'Mathematics' },

  // Physics
  { name: 'Classical Mechanics', category: 'Physics' },
  { name: 'Electromagnetism', category: 'Physics' },
  { name: 'Thermodynamics', category: 'Physics' },
  { name: 'Quantum Mechanics', category: 'Physics' },
  { name: 'Optics', category: 'Physics' },
  { name: 'Atomic Physics', category: 'Physics' },
  { name: 'Nuclear Physics', category: 'Physics' },
  { name: 'Astrophysics', category: 'Physics' },
  { name: 'Fluid Dynamics', category: 'Physics' },
  { name: 'Statistical Mechanics', category: 'Physics' },
  { name: 'Relativity', category: 'Physics' },
  { name: 'Electrostatics', category: 'Physics' },
  { name: 'Waves and Oscillations', category: 'Physics' },
  { name: 'Acoustics', category: 'Physics' },

  // Chemistry
  { name: 'Organic Chemistry', category: 'Chemistry' },
  { name: 'Inorganic Chemistry', category: 'Chemistry' },
  { name: 'Physical Chemistry', category: 'Chemistry' },
  { name: 'Analytical Chemistry', category: 'Chemistry' },
  { name: 'Biochemistry', category: 'Chemistry' },
  { name: 'Electrochemistry', category: 'Chemistry' },
  { name: 'Chemical Thermodynamics', category: 'Chemistry' },
  { name: 'Reaction Kinetics', category: 'Chemistry' },
  { name: 'Polymer Chemistry', category: 'Chemistry' },
  { name: 'Industrial Chemistry', category: 'Chemistry' },
  { name: 'Environmental Chemistry', category: 'Chemistry' },
  { name: 'Medicinal Chemistry', category: 'Chemistry' },
  { name: 'Stereochemistry', category: 'Chemistry' },
  { name: 'Spectroscopy', category: 'Chemistry' },
  { name: 'Laboratory Techniques', category: 'Chemistry' },

  // Biology
  { name: 'Cell Biology', category: 'Biology' },
  { name: 'Genetics', category: 'Biology' },
  { name: 'Ecology', category: 'Biology' },
  { name: 'Human Anatomy', category: 'Biology' },
  { name: 'Physiology', category: 'Biology' },
  { name: 'Microbiology', category: 'Biology' },
  { name: 'Botany', category: 'Biology' },
  { name: 'Zoology', category: 'Biology' },
  { name: 'Evolutionary Biology', category: 'Biology' },
  { name: 'Molecular Biology', category: 'Biology' },
  { name: 'Immunology', category: 'Biology' },
  { name: 'Neuroscience', category: 'Biology' },
  { name: 'Marine Biology', category: 'Biology' },
  { name: 'Bioinformatics', category: 'Biology' },

  // Computer Science
  { name: 'Python', category: 'Computer Science' },
  { name: 'JavaScript', category: 'Computer Science' },
  { name: 'TypeScript', category: 'Computer Science' },
  { name: 'Java', category: 'Computer Science' },
  { name: 'C', category: 'Computer Science' },
  { name: 'C++', category: 'Computer Science' },
  { name: 'C#', category: 'Computer Science' },
  { name: 'PHP', category: 'Computer Science' },
  { name: 'Ruby', category: 'Computer Science' },
  { name: 'Go', category: 'Computer Science' },
  { name: 'Rust', category: 'Computer Science' },
  { name: 'Swift', category: 'Computer Science' },
  { name: 'Kotlin', category: 'Computer Science' },
  { name: 'HTML/CSS', category: 'Computer Science' },
  { name: 'React', category: 'Computer Science' },
  { name: 'Vue.js', category: 'Computer Science' },
  { name: 'Angular', category: 'Computer Science' },
  { name: 'Node.js', category: 'Computer Science' },
  { name: 'Django', category: 'Computer Science' },
  { name: 'SQL', category: 'Computer Science' },
  { name: 'MongoDB', category: 'Computer Science' },
  { name: 'Data Structures', category: 'Computer Science' },
  { name: 'Algorithms', category: 'Computer Science' },
  { name: 'Machine Learning', category: 'Computer Science' },
  { name: 'Artificial Intelligence', category: 'Computer Science' },
  { name: 'Web Development', category: 'Computer Science' },
  { name: 'Mobile Development', category: 'Computer Science' },
  { name: 'Database Design', category: 'Computer Science' },
  { name: 'Git', category: 'Computer Science' },
  { name: 'Linux/Unix', category: 'Computer Science' },

  // Languages
  { name: 'Georgian Language', category: 'Languages' },
  { name: 'English', category: 'Languages' },
  { name: 'Russian', category: 'Languages' },
  { name: 'French', category: 'Languages' },
  { name: 'German', category: 'Languages' },
  { name: 'Spanish', category: 'Languages' },
  { name: 'Italian', category: 'Languages' },
  { name: 'Arabic', category: 'Languages' },
  { name: 'Chinese (Mandarin)', category: 'Languages' },
  { name: 'Japanese', category: 'Languages' },
  { name: 'Korean', category: 'Languages' },
  { name: 'Turkish', category: 'Languages' },
  { name: 'Persian', category: 'Languages' },
  { name: 'Hebrew', category: 'Languages' },
  { name: 'Polish', category: 'Languages' },
  { name: 'Dutch', category: 'Languages' },
  { name: 'Swedish', category: 'Languages' },
  { name: 'Portuguese', category: 'Languages' },
  { name: 'Latin', category: 'Languages' },
  { name: 'Greek', category: 'Languages' },

  // History
  { name: 'Georgian History', category: 'History' },
  { name: 'World History', category: 'History' },
  { name: 'Ancient History', category: 'History' },
  { name: 'Medieval History', category: 'History' },
  { name: 'Modern History', category: 'History' },
  { name: 'European History', category: 'History' },
  { name: 'American History', category: 'History' },
  { name: 'History of Science', category: 'History' },
  { name: 'Art History', category: 'History' },
  { name: 'Byzantine History', category: 'History' },

  // Music
  { name: 'Piano', category: 'Music' },
  { name: 'Guitar', category: 'Music' },
  { name: 'Violin', category: 'Music' },
  { name: 'Cello', category: 'Music' },
  { name: 'Flute', category: 'Music' },
  { name: 'Clarinet', category: 'Music' },
  { name: 'Saxophone', category: 'Music' },
  { name: 'Voice/Singing', category: 'Music' },
  { name: 'Music Theory', category: 'Music' },
  { name: 'Music History', category: 'Music' },
  { name: 'Music Composition', category: 'Music' },
  { name: 'Ear Training', category: 'Music' },
  { name: 'Drums', category: 'Music' },
  { name: 'Bass Guitar', category: 'Music' },
  { name: 'Accordion', category: 'Music' },

  // Art & Design
  { name: 'Drawing', category: 'Art & Design' },
  { name: 'Painting', category: 'Art & Design' },
  { name: 'Watercolor', category: 'Art & Design' },
  { name: 'Oil Painting', category: 'Art & Design' },
  { name: 'Acrylic Painting', category: 'Art & Design' },
  { name: 'Sculpture', category: 'Art & Design' },
  { name: 'Digital Art', category: 'Art & Design' },
  { name: 'Graphic Design', category: 'Art & Design' },
  { name: 'Photography', category: 'Art & Design' },
  { name: 'Architecture Design', category: 'Art & Design' },

  // Geography
  { name: 'Physical Geography', category: 'Geography' },
  { name: 'Human Geography', category: 'Geography' },
  { name: 'Cartography', category: 'Geography' },
  { name: 'Geopolitics', category: 'Geography' },
  { name: 'Georgian Geography', category: 'Geography' },
  { name: 'Climate Science', category: 'Geography' },
  { name: 'Geology', category: 'Geography' },
  { name: 'Environmental Science', category: 'Geography' },

  // Economics & Finance
  { name: 'Microeconomics', category: 'Economics & Finance' },
  { name: 'Macroeconomics', category: 'Economics & Finance' },
  { name: 'Accounting', category: 'Economics & Finance' },
  { name: 'Financial Analysis', category: 'Economics & Finance' },
  { name: 'Business Management', category: 'Economics & Finance' },
  { name: 'Marketing', category: 'Economics & Finance' },
  { name: 'Entrepreneurship', category: 'Economics & Finance' },
  { name: 'Personal Finance', category: 'Economics & Finance' },
  { name: 'Investment', category: 'Economics & Finance' },
  { name: 'Banking', category: 'Economics & Finance' },
  { name: 'Tax Accounting', category: 'Economics & Finance' },
  { name: 'Audit', category: 'Economics & Finance' },
  { name: 'International Economics', category: 'Economics & Finance' },
  { name: 'Econometrics', category: 'Economics & Finance' },
  { name: 'Business Law', category: 'Economics & Finance' },

  // Social Sciences & Humanities
  { name: 'Psychology', category: 'Social Sciences' },
  { name: 'Sociology', category: 'Social Sciences' },
  { name: 'Political Science', category: 'Social Sciences' },
  { name: 'Philosophy', category: 'Social Sciences' },
  { name: 'Ethics', category: 'Social Sciences' },
  { name: 'Logic', category: 'Social Sciences' },
  { name: 'Anthropology', category: 'Social Sciences' },
  { name: 'Linguistics', category: 'Social Sciences' },
  { name: 'Cultural Studies', category: 'Social Sciences' },
  { name: 'Jurisprudence/Law', category: 'Social Sciences' },

  // Test Preparation
  { name: 'SAT Preparation', category: 'Test Preparation' },
  { name: 'ACT Preparation', category: 'Test Preparation' },
  { name: 'GRE Preparation', category: 'Test Preparation' },
  { name: 'GMAT Preparation', category: 'Test Preparation' },
  { name: 'IELTS Preparation', category: 'Test Preparation' },
  { name: 'TOEFL Preparation', category: 'Test Preparation' },
  { name: 'National Exam Preparation', category: 'Test Preparation' },
  { name: 'University Entrance Exam', category: 'Test Preparation' },
  { name: 'Cambridge English Exam', category: 'Test Preparation' },
  { name: 'Georgian Unified National Exams', category: 'Test Preparation' },

  // Sports & Physical Education
  { name: 'Football', category: 'Sports & Physical Education' },
  { name: 'Basketball', category: 'Sports & Physical Education' },
  { name: 'Tennis', category: 'Sports & Physical Education' },
  { name: 'Swimming', category: 'Sports & Physical Education' },
  { name: 'Yoga', category: 'Sports & Physical Education' },
  { name: 'Chess', category: 'Sports & Physical Education' },
  { name: 'Table Tennis', category: 'Sports & Physical Education' },
  { name: 'Volleyball', category: 'Sports & Physical Education' },
  { name: 'Athletic Training', category: 'Sports & Physical Education' },
  { name: 'Fitness', category: 'Sports & Physical Education' },
];

const CATEGORIES: { slug: string; name: string; sortOrder: number }[] = [
  { slug: 'it', name: 'IT', sortOrder: 0 },
  { slug: 'mathematics', name: 'მათემატიკა', sortOrder: 1 },
  { slug: 'languages', name: 'ენები', sortOrder: 2 },
  { slug: 'education', name: 'განათლება', sortOrder: 3 },
  { slug: 'business', name: 'ბიზნეს კონსულტაცია', sortOrder: 4 },
  { slug: 'finance', name: 'ფინანსები', sortOrder: 5 },
  { slug: 'psychology', name: 'ფსიქოლოგია', sortOrder: 6 },
  { slug: 'career', name: 'კარიერა', sortOrder: 7 },
  { slug: 'law', name: 'იურიდიული', sortOrder: 8 },
  { slug: 'music', name: 'მუსიკა', sortOrder: 9 },
  { slug: 'art', name: 'ხელოვნება', sortOrder: 10 },
  { slug: 'science', name: 'საბუნებისმეტყველო მეცნიერებები', sortOrder: 11 },
  { slug: 'sport', name: 'სპორტი', sortOrder: 12 },
  { slug: 'test-prep', name: 'გამოცდებისთვის მომზადება', sortOrder: 13 },
];

async function main(): Promise<void> {
  console.log(`Seeding ${CATEGORIES.length} categories...`);
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log('Categories seeded.');

  console.log(`Seeding ${COMMON_SKILLS.length} common skills...`);
  for (const skill of COMMON_SKILLS) {
    await prisma.commonSkill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    });
  }
  console.log('Common skills seeded.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
