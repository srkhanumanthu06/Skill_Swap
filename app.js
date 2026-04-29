/* ============================================
   SKILL SWAP AI — Application Logic
   ============================================ */

// API Configuration for Backend Integration
const API_URL = '/api';
let socket = null;
if (typeof io !== 'undefined') {
  socket = io();
  
  socket.on('receive_message', (data) => {
    if (!MOCK_MESSAGES[data.from]) MOCK_MESSAGES[data.from] = [];
    MOCK_MESSAGES[data.from].push({ text: data.message, sent: false, time: data.time });
    
    // If the chat panel is open and we are talking to the sender
    if (chatOpen && currentChatPartner === data.from) {
      renderChatMessages(data.from);
    } else {
      // Otherwise, show a toast notification and add a dot
      showToast(`💬 New message from ${data.from}`);
      const bellBadge = document.querySelector('[data-lucide="bell"]').nextElementSibling;
      if (bellBadge) bellBadge.style.display = 'block';
    }
  });
}

// ==========================================
// DATA
// ==========================================

const SKILL_CATEGORIES = [
  { id: 1,  icon: 'code', name: 'Programming',      count: 1240, tags: ['JavaScript', 'Python', 'React', 'Node.js'], color: '#8b5cf6' },
  { id: 2,  icon: 'palette', name: 'Design',           count: 890,  tags: ['UI/UX', 'Figma', 'Photoshop', 'Branding'], color: '#ec4899' },
  { id: 3,  icon: 'music', name: 'Music',            count: 650,  tags: ['Guitar', 'Piano', 'Vocals', 'Production'], color: '#f59e0b' },
  { id: 4,  icon: 'database', name: 'Data Science',     count: 520,  tags: ['Machine Learning', 'SQL', 'Analytics', 'R'], color: '#06b6d4' },
  { id: 5,  icon: 'camera', name: 'Photography',      count: 410,  tags: ['Portrait', 'Landscape', 'Editing', 'Drone'], color: '#10b981' },
  { id: 6,  icon: 'languages', name: 'Languages',        count: 780,  tags: ['Spanish', 'French', 'Japanese', 'German'], color: '#a855f7' },
  { id: 7,  icon: 'dumbbell', name: 'Fitness',          count: 340,  tags: ['Yoga', 'HIIT', 'Nutrition', 'Weight Training'], color: '#ef4444' },
  { id: 8,  icon: 'pen-tool', name: 'Writing',          count: 560,  tags: ['Copywriting', 'Blog', 'Fiction', 'Technical'], color: '#f472b6' },
  { id: 9,  icon: 'trending-up', name: 'Marketing',        count: 430,  tags: ['SEO', 'Social Media', 'Content', 'Ads'], color: '#8b5cf6' },
  { id: 10, icon: 'video', name: 'Video Production', count: 290,  tags: ['Editing', 'Animation', 'YouTube', 'VFX'], color: '#ec4899' },
  { id: 11, icon: 'utensils', name: 'Cooking',          count: 380,  tags: ['Baking', 'Italian', 'Vegan', 'Asian'], color: '#f59e0b' },
  { id: 12, icon: 'smartphone', name: 'Mobile Dev',       count: 310,  tags: ['Flutter', 'React Native', 'Swift', 'Kotlin'], color: '#06b6d4' },
];

const MOCK_USERS = [
  { id: 1, name: 'Harsha',   initials: 'H', gender: 'male', teaches: 'Machine Learning', wants: 'JavaScript', rating: 4.9, reviews: 38, match: 95, location: 'SRM', verified: true },
  { id: 2, name: 'Hariharan',     initials: 'H', gender: 'male',   teaches: 'Web Development',   wants: 'React',         rating: 4.8, reviews: 24, match: 88, location: 'SRM', verified: true },
  { id: 3, name: 'Satish',     initials: 'S', gender: 'male', teaches: 'Java',    wants: 'Web Dev',       rating: 5.0, reviews: 56, match: 92, location: 'SRM', verified: true },
  { id: 4, name: 'Sri Ram',    initials: 'SR', gender: 'male',   teaches: 'Java',     wants: 'Node.js',       rating: 4.7, reviews: 19, match: 85, location: 'SRM', verified: false },
  { id: 5, name: 'Emily Rodriguez', initials: 'ER', gender: 'female', teaches: 'Spanish',         wants: 'Python',        rating: 4.9, reviews: 42, match: 90, location: 'Remote', verified: true },
  { id: 6, name: 'David Kim',       initials: 'DK', gender: 'male',   teaches: 'Video Editing',   wants: 'Machine Learning', rating: 4.6, reviews: 15, match: 78, location: 'Seoul', verified: true },
  { id: 7, name: 'Aarav Sharma',    initials: 'AS', gender: 'male',   teaches: 'Python',          wants: 'React',         rating: 4.9, reviews: 62, match: 96, location: 'Mumbai', verified: true },
  { id: 8, name: 'Ishani Gupta',    initials: 'IG', gender: 'female', teaches: 'UI/UX Design',    wants: 'Figma',         rating: 4.8, reviews: 45, match: 91, location: 'Bangalore', verified: true },
  { id: 9, name: 'Arjun Reddy',     initials: 'AR', gender: 'male',   teaches: 'SQL',             wants: 'Data Analytics', rating: 4.7, reviews: 33, match: 89, location: 'Hyderabad', verified: true },
  { id: 10, name: 'Ananya Iyer',    initials: 'AI', gender: 'female', teaches: 'French',          wants: 'Yoga',          rating: 4.9, reviews: 28, match: 94, location: 'Chennai', verified: true },
  { id: 11, name: 'Vikram Malhotra',initials: 'VM', gender: 'male',   teaches: 'SEO Marketing',   wants: 'Copywriting',   rating: 4.6, reviews: 21, match: 82, location: 'Delhi', verified: false },
  { id: 12, name: 'Diya Varma',     initials: 'DV', gender: 'female', teaches: 'Portrait Photo',  wants: 'Editing',       rating: 4.8, reviews: 37, match: 87, location: 'Pune', verified: true },
  { id: 13, name: 'Rohan Deshmukh', initials: 'RD', gender: 'male',   teaches: 'Guitar',          wants: 'Vocals',        rating: 4.7, reviews: 51, match: 85, location: 'Mumbai', verified: true },
  { id: 14, name: 'Kavya Nair',     initials: 'KN', gender: 'female', teaches: 'Technical Writing',wants: 'Blog Writing', rating: 4.5, reviews: 14, match: 80, location: 'Kochi', verified: true },
  { id: 15, name: 'Siddharth Jain', initials: 'SJ', gender: 'male',   teaches: 'Yoga',            wants: 'Nutrition',     rating: 4.9, reviews: 73, match: 98, location: 'Ahmedabad', verified: true },
  { id: 16, name: 'Meera Kapoor',   initials: 'MK', gender: 'female', teaches: 'Indian Cooking',  wants: 'Baking',        rating: 4.8, reviews: 42, match: 92, location: 'Jaipur', verified: true },
  { id: 17, name: 'Rahul Khanna',   initials: 'RK', gender: 'male',   teaches: 'JavaScript',      wants: 'TypeScript',    rating: 4.8, reviews: 29, match: 93, location: 'Pune', verified: true },
  { id: 18, name: 'Sneha Rao',      initials: 'SR', gender: 'female', teaches: 'React',           wants: 'Node.js',       rating: 4.9, reviews: 31, match: 95, location: 'Bangalore', verified: true },
  { id: 19, name: 'Amit Singh',     initials: 'AS', gender: 'male',   teaches: 'Node.js',         wants: 'Next.js',       rating: 4.7, reviews: 25, match: 88, location: 'Noida', verified: true },
  { id: 20, name: 'Zoya Khan',      initials: 'ZK', gender: 'female', teaches: 'Figma',           wants: 'Photoshop',     rating: 4.9, reviews: 34, match: 92, location: 'Lucknow', verified: true },
  { id: 21, name: 'Karan Mehra',    initials: 'KM', gender: 'male',   teaches: 'Branding',        wants: 'Illustration',  rating: 4.6, reviews: 18, match: 84, location: 'Chandigarh', verified: true },
  { id: 22, name: 'Tanvi Shah',     initials: 'TS', gender: 'female', teaches: 'Vocals',          wants: 'Piano',         rating: 4.8, reviews: 22, match: 87, location: 'Surat', verified: true },
  { id: 23, name: 'Neil D\'Souza',  initials: 'ND', gender: 'male',   teaches: 'Music Production', wants: 'Ableton',      rating: 4.7, reviews: 16, match: 81, location: 'Goa', verified: true },
  { id: 24, name: 'Prisha Joshi',   initials: 'PJ', gender: 'female', teaches: 'Machine Learning', wants: 'R',            rating: 4.9, reviews: 48, match: 96, location: 'Remote', verified: true },
  { id: 25, name: 'Aryan Goel',     initials: 'AG', gender: 'male',   teaches: 'Analytics',       wants: 'Tableau',       rating: 4.8, reviews: 39, match: 90, location: 'Kolkata', verified: true },
  { id: 26, name: 'Riya Sen',       initials: 'RS', gender: 'female', teaches: 'Landscape Photo', wants: 'Lightroom',     rating: 4.7, reviews: 27, match: 86, location: 'Shimla', verified: true },
  { id: 27, name: 'Kabir Thapar',   initials: 'KT', gender: 'male',   teaches: 'Drone Photo',     wants: 'VFX',           rating: 4.9, reviews: 54, match: 94, location: 'Dehradun', verified: true },
  { id: 28, name: 'Sana Shaikh',    initials: 'SS', gender: 'female', teaches: 'Japanese',        wants: 'Anime Art',     rating: 4.8, reviews: 19, match: 89, location: 'Remote', verified: true },
  { id: 29, name: 'Varun Dhawan',   initials: 'VD', gender: 'male',   teaches: 'German',          wants: 'Engineering',   rating: 4.6, reviews: 12, match: 80, location: 'Berlin', verified: true },
  { id: 30, name: 'Kiara Advani',   initials: 'KA', gender: 'female', teaches: 'HIIT',            wants: 'Zumba',         rating: 4.9, reviews: 65, match: 97, location: 'Mumbai', verified: true },
  { id: 31, name: 'Ranveer Singh',  initials: 'RS', gender: 'male',   teaches: 'Weight Training', wants: 'Bodybuilding',  rating: 4.8, reviews: 78, match: 92, location: 'Remote', verified: true },
  { id: 32, name: 'Alia Bhatt',     initials: 'AB', gender: 'female', teaches: 'Nutrition',       wants: 'Dietetics',     rating: 4.9, reviews: 41, match: 95, location: 'Mumbai', verified: true },
  { id: 33, name: 'Ayushmann K',    initials: 'AK', gender: 'male',   teaches: 'Copywriting',     wants: 'Ads',           rating: 4.7, reviews: 26, match: 88, location: 'Chandigarh', verified: true },
  { id: 34, name: 'Shraddha K',     initials: 'SK', gender: 'female', teaches: 'Blog Writing',    wants: 'SEO',           rating: 4.8, reviews: 33, match: 91, location: 'Delhi', verified: true },
  { id: 35, name: 'Vicky Kaushal',  initials: 'VK', gender: 'male',   teaches: 'Content Strategy', wants: 'Podcast',      rating: 4.6, reviews: 15, match: 83, location: 'Mumbai', verified: true },
  { id: 36, name: 'Taapsee Pannu',  initials: 'TP', gender: 'female', teaches: 'Social Media Ads', wants: 'Influencer',   rating: 4.7, reviews: 21, match: 86, location: 'Remote', verified: true },
  { id: 37, name: 'Rajkummar Rao',  initials: 'RR', gender: 'male',   teaches: 'Animation',       wants: 'After Effects', rating: 4.9, reviews: 52, match: 95, location: 'Delhi', verified: true },
  { id: 38, name: 'Bhumi P',        initials: 'BP', gender: 'female', teaches: 'YouTube Growth',  wants: 'Editing',       rating: 4.8, reviews: 37, match: 92, location: 'Pune', verified: true },
  { id: 39, name: 'Pankaj T',       initials: 'PT', gender: 'male',   teaches: 'VFX Production',  wants: 'Unreal Engine', rating: 5.0, reviews: 84, match: 99, location: 'Remote', verified: true },
  { id: 40, name: 'Janhvi Kapoor',  initials: 'JK', gender: 'female', teaches: 'Baking',          wants: 'Pastry',        rating: 4.8, reviews: 29, match: 89, location: 'Mumbai', verified: true },
  { id: 41, name: 'Ishaan Khatter', initials: 'IK', gender: 'male',   teaches: 'Italian Cooking',  wants: 'Pizza',         rating: 4.7, reviews: 24, match: 87, location: 'Remote', verified: true },
  { id: 42, name: 'Sara Ali Khan',  initials: 'SK', gender: 'female', teaches: 'Vegan Cooking',   wants: 'Nutrition',     rating: 4.9, reviews: 43, match: 96, location: 'Mumbai', verified: true },
  { id: 43, name: 'Kartik Aaryan',  initials: 'KA', gender: 'male',   teaches: 'Asian Cuisine',   wants: 'Wok',           rating: 4.8, reviews: 38, match: 91, location: 'Gwalior', verified: true },
  { id: 44, name: 'Ananya Panday',  initials: 'AP', gender: 'female', teaches: 'Flutter',         wants: 'Dart',          rating: 4.7, reviews: 18, match: 85, location: 'Mumbai', verified: true },
  { id: 45, name: 'Tiger Shroff',   initials: 'TS', gender: 'male',   teaches: 'React Native',    wants: 'Expo',          rating: 4.9, reviews: 59, match: 94, location: 'Mumbai', verified: true },
  { id: 46, name: 'Rashmika M',     initials: 'RM', gender: 'female', teaches: 'Swift',           wants: 'iOS',           rating: 5.0, reviews: 47, match: 97, location: 'Hyderabad', verified: true },
  { id: 47, name: 'Vijay D',        initials: 'VD', gender: 'male',   teaches: 'Kotlin',          wants: 'Android',       rating: 4.8, reviews: 35, match: 90, location: 'Hyderabad', verified: true },
];

const MOCK_SESSIONS = [
  { partner: 'Sarah Johnson', initials: 'SJ', skill: 'UX Design ↔ JavaScript', date: 'Today', time: '3:00 PM', status: 'upcoming' },
  { partner: 'Marcus Chen',   initials: 'MC', skill: 'Piano ↔ React',           date: 'Tomorrow', time: '10:00 AM', status: 'upcoming' },
  { partner: 'Priya Patel',   initials: 'PP', skill: 'Data Science ↔ Web Dev',  date: 'Apr 23', time: '5:00 PM', status: 'confirmed' },
  { partner: 'James Wilson',  initials: 'JW', skill: 'Photography ↔ Node.js',   date: 'Apr 25', time: '2:00 PM', status: 'pending' },
];

const MOCK_GROUPS = [
  { id: 'g1', name: 'React Native Builders', type: 'skill', tags: ['React', 'Mobile'], members: 124 },
  { id: 'g2', name: 'Python Data Science', type: 'skill', tags: ['Python', 'AI'], members: 89 },
  { id: 'g3', name: 'UI/UX Design Crits', type: 'skill', tags: ['Design', 'Figma'], members: 56 },
  { id: 'g4', name: 'Global AI Hackathon 2026', type: 'hackathon', tags: ['AI', 'Team Search'], members: 342 },
  { id: 'g5', name: 'Web3 & Crypto Builders', type: 'hackathon', tags: ['Blockchain', 'Solidity'], members: 210 },
  { id: 'g6', name: 'Stripe API Hackathon', type: 'hackathon', tags: ['Fintech', 'JavaScript'], members: 156 },
  { id: 'g7', name: 'GRE Math Prep Squad', type: 'exam', tags: ['GRE', 'Quant'], members: 430 },
  { id: 'g8', name: 'AWS Cloud Practitioner', type: 'exam', tags: ['AWS', 'Cloud'], members: 289 },
  { id: 'g9', name: 'GMAT 700+ Club', type: 'exam', tags: ['GMAT', 'Verbal'], members: 175 }
];

const MOCK_MESSAGES = {};

const MOCK_REVIEWS = [
  { author: 'Sarah Johnson', initials: 'SJ', rating: 5, date: '2 days ago', text: 'Amazing JavaScript teacher! Alex explains complex concepts in a way that\'s easy to understand. Highly recommend!' },
  { author: 'Marcus Chen',   initials: 'MC', rating: 5, date: '1 week ago', text: 'Great session on React. Very patient and knowledgeable. Already booked two more sessions!' },
  { author: 'Priya Patel',   initials: 'PP', rating: 5, date: '2 weeks ago', text: 'Excellent web development skills. The project-based approach made learning so much more engaging.' },
  { author: 'Emily Rodriguez', initials: 'ER', rating: 4, date: '3 weeks ago', text: 'Really good at explaining Node.js backend concepts. Would love to do more sessions!' },
];

const TEACH_SKILLS = [
  { name: 'JavaScript', level: 95, badge: 'Expert' },
  { name: 'React', level: 88, badge: 'Advanced' },
  { name: 'Node.js', level: 82, badge: 'Advanced' },
  { name: 'CSS/Tailwind', level: 78, badge: 'Advanced' },
  { name: 'TypeScript', level: 70, badge: 'Intermediate' },
];

const LEARN_SKILLS = [
  { name: 'UX Design', level: 35, badge: 'Beginner' },
  { name: 'Piano', level: 20, badge: 'Beginner' },
  { name: 'Data Science', level: 45, badge: 'Intermediate' },
  { name: 'Photography', level: 15, badge: 'Beginner' },
  { name: 'Spanish', level: 55, badge: 'Intermediate' },
];

const PROGRESS_DATA = [
  { name: 'JavaScript', percent: 95, level: 'Expert', xp: 4200 },
  { name: 'React', percent: 88, level: 'Advanced', xp: 3600 },
  { name: 'UX Design', percent: 35, level: 'Beginner', xp: 850 },
  { name: 'Piano', percent: 20, level: 'Beginner', xp: 420 },
  { name: 'Data Science', percent: 45, level: 'Intermediate', xp: 1200 },
  { name: 'Node.js', percent: 82, level: 'Advanced', xp: 3100 },
];

const LEARNING_HISTORY = [
  { date: 'Today',     skill: 'UX Design',     partner: 'Sarah Johnson',  duration: '45 min', xp: '+120 XP' },
  { date: 'Yesterday', skill: 'Piano',          partner: 'Marcus Chen',    duration: '30 min', xp: '+85 XP' },
  { date: 'Apr 19',    skill: 'Data Science',   partner: 'Priya Patel',    duration: '60 min', xp: '+150 XP' },
  { date: 'Apr 18',    skill: 'JavaScript',     partner: 'Emily Rodriguez', duration: '45 min', xp: '+110 XP' },
  { date: 'Apr 17',    skill: 'Photography',    partner: 'James Wilson',   duration: '40 min', xp: '+95 XP' },
];

const TESTIMONIALS = [
  { name: 'Lisa Park', initials: 'LP', role: 'UX Designer', text: '"SkillSwap transformed how I learn. I traded my design skills for coding lessons — and now I build my own prototypes!"', rating: 5 },
  { name: 'Omar Hassan', initials: 'OH', role: 'Data Analyst', text: '"Finding a study partner used to be so hard. SkillSwap matched me with the perfect Python tutor in minutes."', rating: 5 },
  { name: 'Rachel Green', initials: 'RG', role: 'Marketing Lead', text: '"I love the trust system. Knowing my partners are verified and reviewed gives me full confidence in every session."', rating: 5 },
];

// ==========================================
// PER-USER PROGRESS (localStorage)
// ==========================================

const USER_PROGRESS_STORAGE_KEY = 'skillswap.userProgress.v1';

function getUserProgressKey(user) {
  if (!user) return null;
  return String(user.id || user.email || user.name || 'anonymous').toLowerCase().trim();
}

function loadUserProgressStore() {
  try {
    const raw = localStorage.getItem(USER_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveUserProgressStore(store) {
  try {
    localStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(store || {}));
  } catch (e) {
    // ignore storage failures (private mode / quota)
  }
}

function getUserProgress(user = currentUser) {
  const key = getUserProgressKey(user);
  if (!key) return null;
  const store = loadUserProgressStore();
  return store[key] || null;
}

function setUserProgress(progress, user = currentUser) {
  const key = getUserProgressKey(user);
  if (!key) return;
  const store = loadUserProgressStore();
  store[key] = progress;
  saveUserProgressStore(store);
}

function getTodayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getYesterdayISODate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function percentToLabel(percent) {
  if (percent >= 86) return 'Expert';
  if (percent >= 66) return 'Advanced';
  if (percent >= 36) return 'Intermediate';
  return 'Beginner';
}

function calcLevelFromXp(totalXp) {
  // Simple leveling: 500 XP per level
  const xp = Math.max(0, Number(totalXp) || 0);
  return Math.floor(xp / 500) + 1;
}

function calcNextLevelXp(level) {
  const lvl = Math.max(1, Number(level) || 1);
  return lvl * 500;
}

function buildInitialProgressFromProfile(user) {
  const teachSkills = user?.teach_skills || [];
  const learnSkills = user?.learn_skills || [];
  const allSkills = [];

  teachSkills.forEach(s => allSkills.push({ name: s, isLearning: false }));
  learnSkills.forEach(s => allSkills.push({ name: s, isLearning: true }));

  const progressBySkill = {};
  const userIdentifier = (user?.email || user?.name || 'default').toLowerCase();

  allSkills.forEach(item => {
    const skill = String(item.name || '').trim();
    if (!skill) return;

    // Deterministic seed so each account starts differently,
    // but afterwards progress is saved and evolves per account.
    const hashStr = userIdentifier + '|' + skill;
    const hash = hashStr.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);

    let percent = 0;
    if (item.isLearning) percent = 5 + (Math.abs(hash) % 25);      // 5%..29%
    else percent = 40 + (Math.abs(hash) % 45);                     // 40%..84%

    const xp = Math.floor(percent * 8.5);
    progressBySkill[skill] = { percent, xp, level: percentToLabel(percent) };
  });

  const totalXp = Object.values(progressBySkill).reduce((sum, s) => sum + (Number(s.xp) || 0), 0);
  const level = calcLevelFromXp(totalXp);
  const nextLevelXp = calcNextLevelXp(level);
  const progressToNext = nextLevelXp > 0 ? Math.min(100, Math.round((totalXp / nextLevelXp) * 100)) : 0;

  return {
    version: 1,
    updated_at: Date.now(),
    streak: 0,
    last_activity_date: null,
    total_xp: totalXp,
    level,
    next_level_xp: nextLevelXp,
    progress_to_next_percent: progressToNext,
    progress_by_skill: progressBySkill,
    history: []
  };
}

function ensureUserProgressInitialized(user = currentUser) {
  if (!user) return null;
  const existing = getUserProgress(user);
  if (existing) return existing;

  const teachSkills = user?.teach_skills || [];
  const learnSkills = user?.learn_skills || [];
  const hasSkills = teachSkills.length + learnSkills.length > 0;
  if (!hasSkills) return null;

  const created = buildInitialProgressFromProfile(user);
  setUserProgress(created, user);
  return created;
}

function updateProgressStreak(progress) {
  const today = getTodayISODate();
  const yesterday = getYesterdayISODate();
  const last = progress.last_activity_date;

  if (last === today) {
    // no change
  } else if (last === yesterday) {
    progress.streak = Math.max(0, Number(progress.streak) || 0) + 1;
    progress.last_activity_date = today;
  } else {
    progress.streak = 1;
    progress.last_activity_date = today;
  }
}

function recalcOverallProgress(progress) {
  const totalXp = Object.values(progress.progress_by_skill || {}).reduce((sum, s) => sum + (Number(s.xp) || 0), 0);
  const level = calcLevelFromXp(totalXp);
  const nextLevelXp = calcNextLevelXp(level);
  const fill = nextLevelXp > 0 ? Math.min(100, Math.round((totalXp / nextLevelXp) * 100)) : 0;

  progress.total_xp = totalXp;
  progress.level = level;
  progress.next_level_xp = nextLevelXp;
  progress.progress_to_next_percent = fill;
  progress.updated_at = Date.now();
}

function renderProgressSummary(progress) {
  const levelEl = document.getElementById('progressLevelLabel');
  const xpTotalEl = document.getElementById('progressXpTotal');
  const streakEl = document.getElementById('progressStreakLabel');
  const fillEl = document.getElementById('progressXpFill');
  const xpCurrentEl = document.getElementById('progressXpCurrent');
  const xpToNextEl = document.getElementById('progressXpToNext');
  const nextLevelEl = document.getElementById('progressNextLevelLabel');

  if (!levelEl || !xpTotalEl || !streakEl || !fillEl || !xpCurrentEl || !xpToNextEl || !nextLevelEl) return;

  const level = Number(progress?.level) || 1;
  const totalXp = Number(progress?.total_xp) || 0;
  const nextLevelXp = Number(progress?.next_level_xp) || calcNextLevelXp(level);
  const toNext = Math.max(0, nextLevelXp - totalXp);
  const fill = Number(progress?.progress_to_next_percent) || 0;
  const streak = Math.max(0, Number(progress?.streak) || 0);

  levelEl.textContent = `Level ${level}`;
  xpTotalEl.textContent = totalXp.toLocaleString();
  streakEl.textContent = `🔥 ${streak}-day streak`;
  fillEl.style.width = `${Math.max(0, Math.min(100, fill))}%`;
  xpCurrentEl.textContent = totalXp.toLocaleString();
  xpToNextEl.textContent = toNext.toLocaleString();
  nextLevelEl.textContent = `Level ${level + 1}`;
}

function addLearningHistoryEntry(progress, entry) {
  if (!progress.history) progress.history = [];
  progress.history.unshift(entry);
  progress.history = progress.history.slice(0, 30);
}

function bumpSkillProgress(progress, skillName, xpGain = 0, percentGain = 0) {
  const skill = String(skillName || '').trim();
  if (!skill) return;
  if (!progress.progress_by_skill) progress.progress_by_skill = {};

  const current = progress.progress_by_skill[skill] || { percent: 0, xp: 0, level: 'Beginner' };
  const nextPercent = Math.max(0, Math.min(100, (Number(current.percent) || 0) + (Number(percentGain) || 0)));
  const nextXp = Math.max(0, (Number(current.xp) || 0) + (Number(xpGain) || 0));

  progress.progress_by_skill[skill] = {
    percent: nextPercent,
    xp: nextXp,
    level: percentToLabel(nextPercent)
  };
}

function recordScheduledSwapProgress({ partnerName, skillExchangeLabel }) {
  if (!currentUser) return;

  const progress = ensureUserProgressInitialized(currentUser) || getUserProgress(currentUser);
  if (!progress) return;

  const parts = String(skillExchangeLabel || '').split(/↔|<->|->|→/).map(s => s.trim()).filter(Boolean);
  const skillA = parts[0];
  const skillB = parts[1] || null;

  // Treat scheduling as an activity log + small progress bump.
  const xpGain = 120;
  const percentGain = 4;

  if (skillA) bumpSkillProgress(progress, skillA, Math.floor(xpGain * 0.6), percentGain);
  if (skillB) bumpSkillProgress(progress, skillB, Math.floor(xpGain * 0.4), percentGain);

  updateProgressStreak(progress);
  recalcOverallProgress(progress);

  addLearningHistoryEntry(progress, {
    date: 'Today',
    skill: skillB || skillA || 'Skill Swap',
    partner: partnerName || 'Partner',
    duration: '—',
    xp: `+${xpGain} XP`
  });

  setUserProgress(progress, currentUser);
  renderProgressSummary(progress);
  renderProgress();
  renderLearningHistory();
}


// ==========================================
// NAVIGATION (SPA Router)
// ==========================================

let currentPage = 'landing';

function navigateTo(page) {
  // Hide all pages using direct style manipulation for reliability
  document.querySelectorAll('.page-section').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  // Show target
  const target = document.getElementById(page);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  currentPage = page;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile nav
  document.getElementById('navLinks').classList.remove('mobile-open');

  // Re-trigger scroll animations
  setTimeout(observeAnimations, 100);
  
  // Refresh icons
  if (window.lucide) lucide.createIcons();
}

// --- NEW DRILLDOWN LOGIC ---

let activeSkillName = '';

function viewCategory(categoryId) {
  const cat = SKILL_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return;

  const titleEl = document.getElementById('categorySkillsTitle');
  titleEl.innerHTML = `Skills in <span class="gradient-text">${cat.name}</span>`;
  
  const grid = document.getElementById('categorySkillsGrid');
  grid.innerHTML = cat.tags.map(skill => `
    <div class="glass-card category-card fade-in" onclick="viewSkill('${skill}')">
      <div class="category-icon"><i data-lucide="hash"></i></div>
      <div class="category-name">${skill}</div>
      <p class="category-count">Explore tutors teaching ${skill}</p>
    </div>
  `).join('');

  navigateTo('categorySkillsPage');
}

function viewSkill(skillName) {
  activeSkillName = skillName;
  const titleEl = document.getElementById('skillTutorsTitle');
  titleEl.textContent = skillName;

  filterTutors(); // Initial render
  navigateTo('skillTutorsPage');
}

function filterTutors() {
  const gender = document.getElementById('tutorGenderFilter').value;
  const minRating = parseFloat(document.getElementById('tutorRatingFilter').value);
  const sortOption = document.getElementById('tutorSortOption').value;
  const grid = document.getElementById('skillTutorsGrid');

  let tutors = MOCK_USERS.filter(u => u.teaches.toLowerCase().includes(activeSkillName.toLowerCase()));

  // Filter by Gender
  if (gender !== 'all') {
    tutors = tutors.filter(u => u.gender === gender);
  }

  // Filter by Rating
  if (minRating > 0) {
    tutors = tutors.filter(u => u.rating >= minRating);
  }

  // Sorting
  if (sortOption === 'name') {
    tutors.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'rating') {
    tutors.sort((a, b) => b.rating - a.rating);
  }

  const emptyState = document.getElementById('noTutorsEmptyState');

  if (tutors.length === 0) {
    grid.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.querySelector('h3').textContent = `No human tutors found for ${activeSkillName}`;
    } else {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No tutors found matching these criteria for ${activeSkillName}.</div>`;
      grid.style.display = 'grid';
    }
    return;
  }

  grid.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = tutors.map(user => {
    const genderColor = user.gender === 'male' ? '#3b82f6' : '#ec4899';
    const genderIcon = user.gender === 'male' ? 'user' : 'user-check';

    return `
      <div class="glass-card recommend-card fade-in">
        <div class="recommend-header">
          <div class="avatar" style="border: 2px solid ${genderColor}">${user.initials}</div>
          <div class="recommend-details">
            <h4>${user.name} ${user.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}</h4>
            <p>📍 ${user.location} · ${renderStars(user.rating)} (${user.reviews})</p>
          </div>
        </div>
        <div class="recommend-skills">
          <span class="badge">Teaches: ${user.teaches}</span>
          <span class="badge gender-badge ${user.gender}">
            <i data-lucide="${genderIcon}" style="width:12px;height:12px;margin-right:4px"></i>
            ${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
          </span>
        </div>
        <div class="recommend-footer">
          <span class="recommend-match">${user.match}% match</span>
          <div style="display:flex;gap:var(--space-sm)">
            <button class="btn btn-secondary btn-sm" onclick="openPublicProfile('${user.name}')">View Profile</button>
            <button class="btn btn-primary btn-sm" onclick="openScheduleModal()">Request Swap</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// Fallback functions
function generateAIStudyGuide() {
  showToast(`🤖 Generating AI Study Guide for ${activeSkillName}...`);
  // Open the AI chat panel and send a message
  toggleChat('Skill Swap AI', false);
  
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.value = `Can you create a structured study roadmap for ${activeSkillName}? I couldn't find a human tutor.`;
    sendMessage();
  }
}

function createPeerGroup() {
  const groupName = `${activeSkillName} Study Squad`;
  
  // Check if it already exists
  if (!MOCK_GROUPS.find(g => g.name === groupName)) {
    MOCK_GROUPS.unshift({
      id: 'g' + Date.now(),
      name: groupName,
      type: 'skill',
      tags: [activeSkillName, 'Peer Group'],
      members: 1
    });
  }
  
  joinGroup(groupName);
}


// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


// ==========================================
// MOBILE NAV
// ==========================================

function toggleUserMenu() {
  const dropdown = document.getElementById('userMenuDropdown');
  dropdown.classList.toggle('open');
  if (window.lucide) lucide.createIcons();
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
  const dropdown = document.getElementById('userMenuDropdown');
  const menuBtn = document.querySelector('.nav-menu-btn');
  if (dropdown && !dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}


// ==========================================
// SCROLL ANIMATIONS
// ==========================================

function observeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}


// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderStars(rating) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += i <= Math.round(rating) ? '★' : '<span class="empty">★</span>';
  }
  html += '</div>';
  return html;
}

function renderCategories(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const categories = limit ? SKILL_CATEGORIES.slice(0, limit) : SKILL_CATEGORIES;

  container.innerHTML = categories.map(cat => `
    <div class="glass-card category-card fade-in" data-category="${cat.name.toLowerCase()}" onclick="viewCategory(${cat.id})">
      <div class="category-icon"><i data-lucide="${cat.icon}"></i></div>
      <div class="category-name">${cat.name}</div>
      <div class="category-count">${cat.count.toLocaleString()} learners</div>
      <div class="category-tags">
        ${cat.tags.map(t => `<span class="category-tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const filters = ['All', ...SKILL_CATEGORIES.map(c => c.name)];
  container.innerHTML = filters.map(f => `
    <button class="filter-btn ${f === 'All' ? 'active' : ''}" onclick="filterByCategory('${f}')">${f}</button>
  `).join('');
}

function renderRecommendations() {
  const container = document.getElementById('recommendationsGrid');
  if (!container) return;

  container.innerHTML = MOCK_USERS.map(user => `
    <div class="glass-card recommend-card fade-in">
      <div class="recommend-header">
        <div class="avatar">${user.initials}</div>
        <div class="recommend-details">
          <h4>${user.name} ${user.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}</h4>
          <p>📍 ${user.location} · ${renderStars(user.rating)} (${user.reviews})</p>
        </div>
      </div>
      <div class="recommend-skills">
        <span class="badge">Teaches: ${user.teaches}</span>
        <span class="badge badge-pink">Wants: ${user.wants}</span>
      </div>
      <div class="recommend-footer">
        <span class="recommend-match">${user.match}% match</span>
        <div style="display:flex;gap:var(--space-sm)">
          <button class="btn btn-secondary btn-sm" onclick="openPublicProfile('${user.name}')">View Profile</button>
          <button class="btn btn-primary btn-sm" onclick="openScheduleModal()">Request Swap</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderGroups() {
  const skillContainer = document.getElementById('skillGroupsGrid');
  const hackathonContainer = document.getElementById('hackathonGroupsGrid');
  const examContainer = document.getElementById('examGroupsGrid');

  const renderGroupCard = (g) => `
    <div class="glass-card recommend-card fade-in">
      <div class="recommend-header">
        <div class="avatar" style="background:var(--pink);color:white">👥</div>
        <div class="recommend-details">
          <h4>${g.name}</h4>
          <p>🟢 ${g.members} active members</p>
        </div>
      </div>
      <div class="recommend-skills" style="margin-top:10px">
        ${g.tags.map(t => `<span class="badge">${t}</span>`).join('')}
      </div>
      <div class="recommend-footer" style="margin-top:15px">
        ${joinedGroups.includes(g.name) 
          ? `<button class="btn btn-secondary btn-sm" style="width:100%" disabled>Joined</button>`
          : `<button class="btn btn-primary btn-sm" style="width:100%" onclick="joinGroup('${g.name}')">Join Group</button>`
        }
      </div>
    </div>
  `;

  if (skillContainer) skillContainer.innerHTML = MOCK_GROUPS.filter(g => g.type === 'skill').map(renderGroupCard).join('');
  if (hackathonContainer) hackathonContainer.innerHTML = MOCK_GROUPS.filter(g => g.type === 'hackathon').map(renderGroupCard).join('');
  if (examContainer) examContainer.innerHTML = MOCK_GROUPS.filter(g => g.type === 'exam').map(renderGroupCard).join('');
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboardGrid');
  if (!container) return;

  const rankedUsers = [...MOCK_USERS].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating; // Sort by rating descending
    }
    return b.reviews - a.reviews; // Tie-breaker: reviews descending
  });

  container.innerHTML = rankedUsers.map((user, index) => {
    const rankColor = index === 0 ? 'color: gold;' : index === 1 ? 'color: silver;' : index === 2 ? 'color: #cd7f32;' : 'color: var(--text-muted);';
    return `
    <div class="glass-card recommend-card fade-in">
      <div class="recommend-header">
        <div style="font-size: 2rem; font-weight: 800; ${rankColor} margin-right: 15px;">#${index + 1}</div>
        <div class="avatar">${user.initials}</div>
        <div class="recommend-details">
          <h4>${user.name} ${user.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}</h4>
          <p>📍 ${user.location} · ${renderStars(user.rating)} (${user.reviews} reviews)</p>
        </div>
      </div>
      <div class="recommend-skills">
        <span class="badge">Teaches: ${user.teaches}</span>
        <span class="badge badge-pink">Wants: ${user.wants}</span>
      </div>
      <div class="recommend-footer">
        <span class="recommend-match">Top Contributor</span>
        <div style="display:flex;gap:var(--space-sm)">
          <button class="btn btn-secondary btn-sm" onclick="toggleChat()">Message</button>
          <button class="btn btn-primary btn-sm" onclick="openScheduleModal()">Request Swap</button>
        </div>
      </div>
    </div>
  `}).join('');
}

function renderSessions() {
  const container = document.getElementById('upcomingSessions');
  if (!container) return;

  container.innerHTML = MOCK_SESSIONS.map(s => {
    const statusBadge = s.status === 'upcoming'
      ? '<span class="badge badge-green">Upcoming</span>'
      : s.status === 'confirmed'
        ? '<span class="badge">Confirmed</span>'
        : '<span class="badge badge-amber">Pending</span>';

    return `
      <div class="session-item">
        <div class="avatar avatar-sm">${s.initials}</div>
        <div class="session-info">
          <div class="session-title">${s.skill}</div>
          <div class="session-meta">
            <span>👤 ${s.partner}</span>
            <span>📅 ${s.date}, ${s.time}</span>
          </div>
        </div>
        ${statusBadge}
      </div>
    `;
  }).join('');
}

function renderSkillMatches() {
  const container = document.getElementById('skillMatches');
  if (!container) return;

  container.innerHTML = MOCK_USERS.slice(0, 4).map(user => `
    <div class="match-card" onclick="toggleChat()">
      <div class="avatar avatar-sm">${user.initials}</div>
      <div class="match-info">
        <div class="match-name">${user.name}</div>
        <div class="match-skill">${user.teaches} ↔ ${user.wants}</div>
      </div>
      <div class="match-percent gradient-text">${user.match}%</div>
    </div>
  `).join('');
}

function renderReviews(containerId, reviews, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data = limit ? reviews.slice(0, limit) : reviews;

  container.innerHTML = data.map(r => `
    <div class="review-card glass-card">
      <div class="review-header">
        <div class="avatar avatar-sm">${r.initials}</div>
        <div>
          <div class="review-author">${r.author}</div>
          <div class="review-date">${r.date}</div>
        </div>
        <div style="margin-left:auto">${renderStars(r.rating)}</div>
      </div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join('');
}

function renderSkillList(containerId, skills) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = skills.map(s => {
    const badgeClass = s.badge === 'Expert' ? 'badge-green' : s.badge === 'Advanced' ? '' : 'badge-amber';
    return `
      <div class="skill-item">
        <div class="skill-item-left">
          <span>${s.name}</span>
          <span class="badge ${badgeClass}">${s.badge}</span>
        </div>
        <div class="skill-level-bar">
          <div class="skill-level-fill" style="width:${s.level}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderProgress() {
  const container = document.getElementById('progressGrid');
  if (!container) return;

  const circumference = 2 * Math.PI * 50; // radius 50

  let dataToRender = PROGRESS_DATA;

  if (typeof currentUser !== 'undefined' && currentUser) {
    const userProgress = ensureUserProgressInitialized(currentUser) || getUserProgress(currentUser);
    const bySkill = userProgress?.progress_by_skill || {};
    const entries = Object.entries(bySkill).map(([name, v]) => ({
      name,
      percent: Number(v.percent) || 0,
      level: v.level || percentToLabel(Number(v.percent) || 0),
      xp: Number(v.xp) || 0
    }));

    dataToRender = entries;

    if (userProgress) renderProgressSummary(userProgress);
  }

  container.innerHTML = dataToRender.map(p => {
    const offset = circumference - (p.percent / 100) * circumference;
    return `
      <div class="glass-card progress-card fade-in">
        <div class="progress-ring-wrapper">
          <svg class="progress-ring" width="120" height="120" viewBox="0 0 120 120">
            <circle class="progress-ring-bg" cx="60" cy="60" r="50"/>
            <circle class="progress-ring-fill" cx="60" cy="60" r="50"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="progress-value gradient-text">${p.percent}%</div>
        </div>
        <div class="progress-skill-name">${p.name}</div>
        <div class="progress-skill-level">${p.level} · ${p.xp.toLocaleString()} XP</div>
        <div class="progress-xp-bar">
          <div class="progress-xp-fill" style="width:${p.percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderLearningHistory() {
  const container = document.getElementById('learningHistory');
  if (!container) return;

  let historyToRender = LEARNING_HISTORY;

  if (typeof currentUser !== 'undefined' && currentUser) {
    const userProgress = ensureUserProgressInitialized(currentUser) || getUserProgress(currentUser);
    historyToRender = (userProgress && Array.isArray(userProgress.history)) ? userProgress.history : [];
  }

  if (!historyToRender || historyToRender.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:var(--space-xl); color:var(--text-muted)">
        No learning history yet. Schedule a swap to start tracking your progress.
      </div>
    `;
    return;
  }

  container.innerHTML = historyToRender.map(h => `
    <div class="session-item">
      <div style="min-width:70px;font-size:0.8rem;color:var(--text-muted)">${h.date}</div>
      <div class="session-info">
        <div class="session-title">${h.skill}</div>
        <div class="session-meta">
          <span>👤 ${h.partner}</span>
          <span>⏱ ${h.duration}</span>
        </div>
      </div>
      <span class="badge badge-green">${h.xp}</span>
    </div>
  `).join('');
}

function renderTestimonials() {
  const container = document.getElementById('testimonialsGrid');
  if (!container) return;

  container.innerHTML = TESTIMONIALS.map(t => `
    <div class="glass-card recommend-card fade-in">
      <div class="recommend-header">
        <div class="avatar">${t.initials}</div>
        <div class="recommend-details">
          <h4>${t.name}</h4>
          <p>${t.role}</p>
        </div>
        <div style="margin-left:auto">${renderStars(t.rating)}</div>
      </div>
      <p style="color:var(--text-secondary);line-height:1.6;font-size:0.95rem">${t.text}</p>
    </div>
  `).join('');
}


// ==========================================
// CALENDAR
// ==========================================

function renderCalendar(containerId, availableDayIndices = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const today = now.getDate();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const sessionDays = [today, today + 1, today + 3, today + 5, today + 8];

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  let calendarHTML = `
    <div class="calendar-header">
      <span class="calendar-month">${monthName}</span>
      <div class="calendar-nav">
        <button class="btn-icon" style="width:32px;height:32px;font-size:0.8rem">‹</button>
        <button class="btn-icon" style="width:32px;height:32px;font-size:0.8rem">›</button>
      </div>
    </div>
    <div class="calendar-grid">
  `;

  // Day headers
  days.forEach(d => {
    calendarHTML += `<div class="calendar-day-header">${d}</div>`;
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += '<div class="calendar-day disabled"></div>';
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = dateObj.getDay();
    const isToday = d === today;
    
    let hasSession = false;
    if (availableDayIndices !== null) {
       hasSession = availableDayIndices.includes(dayOfWeek);
    } else {
       hasSession = sessionDays.includes(d);
    }
    
    const isPast = d < today;
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (hasSession && !isPast) classes += ' has-session';
    if (isPast && !isToday) classes += ' disabled';
    calendarHTML += `<div class="${classes}">${d}</div>`;
  }

  calendarHTML += '</div>';

  // Keep existing title if present in profile calendar
  if (containerId === 'profileCalendar') {
    const existingTitle = container.querySelector('.dash-card-title');
    container.innerHTML = '';
    if (existingTitle) container.appendChild(existingTitle);
    container.insertAdjacentHTML('beforeend', calendarHTML);
  } else {
    container.innerHTML = `<div class="dash-card-title">📅 Calendar</div>${calendarHTML}`;
  }
}


// ==========================================
// SKILL FILTERING
// ==========================================

let activeFilter = 'All';

function filterSkills() {
  const query = document.getElementById('skillSearch').value.toLowerCase();
  const cards = document.querySelectorAll('#allCategoriesGrid .category-card');

  cards.forEach(card => {
    const name = card.dataset.category;
    const text = card.textContent.toLowerCase();
    const matchesSearch = text.includes(query);
    const matchesFilter = activeFilter === 'All' || name === activeFilter.toLowerCase();
    card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
  });
}

function filterByCategory(category) {
  activeFilter = category;

  // Update button states
  document.querySelectorAll('#categoryFilters .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === category);
  });

  filterSkills();
}

function executeGlobalSearch() {
  const query = document.getElementById('globalSkillSearchInput').value.trim();
  if (!query) return;
  viewSkill(query);
}

function showCategoryDetail(name) {
  showToast(`📂 Viewing "${name}" — ${SKILL_CATEGORIES.find(c => c.name === name)?.count.toLocaleString()} learners`);
}


// ==========================================
// CHAT
// ==========================================

let chatOpen = false;
let currentChatPartner = 'Sarah Johnson';
let isGroupChat = false;
let joinedGroups = [];

function renderProfileGroups() {
  const container = document.getElementById('profileStudyGroups');
  if (!container) return;

  if (joinedGroups.length === 0) {
    container.innerHTML = '<p class="text-muted">You haven\'t joined any groups yet.</p>';
    return;
  }

  container.innerHTML = joinedGroups.map(groupName => {
    return `
      <div class="chat-list-item" style="cursor:pointer; margin-bottom:10px; border-radius:12px; padding:10px; background:rgba(255,255,255,0.05);" onclick="toggleChat('${groupName}', true)">
        <div class="avatar avatar-sm" style="background:var(--pink);color:white">👥</div>
        <div class="chat-list-info">
          <div class="chat-list-name" style="font-size:1.1rem">${groupName}</div>
        </div>
      </div>
    `;
  }).join('');
}

function joinGroup(groupName) {
  if (joinedGroups.includes(groupName)) return;
  
  joinedGroups.push(groupName);
  showToast(`✅ You joined the ${groupName} group!`);
  
  if (!MOCK_MESSAGES[groupName]) {
    MOCK_MESSAGES[groupName] = [
      { text: 'Welcome to the group!', sent: false, time: 'Just now', senderName: 'System' },
      { text: 'Hey there! What are you working on?', sent: false, time: 'Just now', senderName: 'Alex K.' }
    ];
  }
  
  // Add group to mock users so it can be identified
  if (!MOCK_USERS.find(u => u.name === groupName)) {
    MOCK_USERS.unshift({ name: groupName, initials: '👥', status: 'Online', isGroup: true });
  }

  renderGroups(); // Update the buttons in the grids
  renderProfileGroups(); // Update the profile page
  toggleChat(groupName, true);
}

function toggleChat(partnerName = null, isGroup = false) {
  if (partnerName && typeof partnerName === 'string') {
    currentChatPartner = partnerName;
    isGroupChat = isGroup;
    chatOpen = true; // force open
  } else {
    chatOpen = !chatOpen;
  }
  
  document.getElementById('chatPanel').classList.toggle('open', chatOpen);
  document.getElementById('chatOverlay').classList.toggle('open', chatOpen);

  if (chatOpen) {
    const avatar = document.getElementById('chatAvatar');
    document.getElementById('chatPartnerName').textContent = currentChatPartner;
    
    if (isGroupChat) {
      avatar.textContent = '👥';
      avatar.style.background = 'var(--pink)';
    } else {
      const user = MOCK_USERS.find(u => u.name === currentChatPartner);
      if (user) {
        avatar.textContent = user.initials;
        avatar.style.background = 'var(--surface-hover)';
      }
    }
    
    renderChatMessages(currentChatPartner);
  }
}

function switchChat(name) {
  currentChatPartner = name;
  const user = MOCK_USERS.find(u => u.name === name);
  isGroupChat = user ? user.isGroup : false;
  
  const initials = name.split(' ').map(n => n[0]).join('');
  document.getElementById('chatPartnerName').textContent = name;
  
  const avatar = document.getElementById('chatAvatar');
  if (isGroupChat) {
    avatar.textContent = '👥';
    avatar.style.background = 'var(--pink)';
  } else {
    avatar.textContent = initials;
    avatar.style.background = 'var(--surface-hover)';
  }
  
  renderChatMessages(name);
}

function renderChatMessages(name) {
  const container = document.getElementById('chatMessages');
  const messages = MOCK_MESSAGES[name] || [];
  
  const isGroup = MOCK_USERS.find(u => u.name === name)?.isGroup || false;

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.9rem;">
        No messages yet. Start the conversation!
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(m => {
    const senderLabel = (isGroup && !m.sent && m.senderName) 
      ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:2px">${m.senderName}</div>`
      : '';
      
    return `
      <div class="chat-message ${m.sent ? 'sent' : 'received'}">
        ${senderLabel}
        ${m.text}
        <div class="chat-message-time">${m.time}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function handleChatKeypress(e) {
  if (e.key === 'Enter') sendMessage();
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (!MOCK_MESSAGES[currentChatPartner]) {
    MOCK_MESSAGES[currentChatPartner] = [];
  }

  // Add to local UI
  MOCK_MESSAGES[currentChatPartner].push({ text, sent: true, time });
  input.value = '';
  renderChatMessages(currentChatPartner);

  // Emit Real-Time Message via Socket
  if (socket && currentUser) {
    socket.emit('send_message', {
      from: currentUser.name,
      to: currentChatPartner,
      message: text
    });
  }

  // Simple "System AI" detection for abusive words in Study Groups
  const abusiveKeywords = ['idiot', 'stupid', 'dumb', 'hate', 'shut up', 'loser', 'trash'];
  const textLower = text.toLowerCase();
  const containsAbuse = abusiveKeywords.some(keyword => textLower.includes(keyword));

  if (isGroupChat && containsAbuse) {
    setTimeout(() => {
      MOCK_MESSAGES[currentChatPartner].push({ 
        text: '⚠️ <b>System AI Warning:</b> Your recent message was flagged. Please keep the conversation respectful and adhere to our community guidelines.', 
        sent: false, 
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), 
        senderName: 'System AI' 
      });
      renderChatMessages(currentChatPartner);
    }, 500); // quick response from AI
  }
}


// ==========================================
// AUTH & DASHBOARD LOGIC (Backend Integrated)
// ==========================================

// ==========================================
let currentUser = null;

function openAuthModal() {
  document.getElementById('authModal').classList.add('open');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[tab === 'login' ? 0 : 1].classList.add('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      closeAuthModal();
      showToast(`✅ Welcome back, ${data.user.name.split(' ')[0]}!`);
      updateUIWithUser(data.user);
      navigateTo('dashboard');
    } else {
      showToast(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    showToast('❌ Failed to connect to server');
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      closeAuthModal();
      showToast('🎉 Account created successfully!');
      updateUIWithUser(data.user);
      navigateTo('dashboard');
    } else {
      showToast(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    showToast('❌ Failed to connect to server');
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  currentUser = null;
  document.getElementById('authBtn').textContent = 'Get Started';
  document.getElementById('authBtn').onclick = () => openAuthModal();
  document.querySelector('.nav-signin').style.display = 'inline-block';
  navigateTo('landing');
  showToast('👋 You have been logged out.');
}

async function fetchProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      updateUIWithUser(data.user);
      // Auto redirect to dashboard if on landing page
      if (document.getElementById('landing').classList.contains('active')) {
        navigateTo('dashboard');
      }
    } else {
      localStorage.removeItem('token'); // Invalid token
    }
  } catch (err) {
    console.error('Failed to fetch profile', err);
  }
}

function updateUIWithUser(user) {
  currentUser = user;
  
  if (socket) {
    socket.emit('register', { username: user.name });
  }

  // Ensure per-user progress exists (if they have skills)
  const userProgress = ensureUserProgressInitialized(user) || getUserProgress(user);
  if (userProgress) renderProgressSummary(userProgress);
  
  // Update Navbar
  const authBtn = document.getElementById('authBtn');
  authBtn.textContent = user.name.split(' ')[0];
  authBtn.onclick = () => navigateTo('profile');
  
  const signinBtn = document.querySelector('.nav-signin');
  if (signinBtn) signinBtn.style.display = 'none';

  // Update Dashboard
  const dashName = document.getElementById('dashboardName');
  if (dashName) dashName.textContent = user.name.split(' ')[0];

  // Update Profile
  const profileName = document.getElementById('profileName');
  if (profileName) profileName.textContent = user.name;
  
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar) profileAvatar.textContent = user.avatar_initials;

  const profileEmail = document.getElementById('profileEmail');
  if (profileEmail) profileEmail.textContent = user.email;

  const profileJoined = document.getElementById('profileJoined');
  if (profileJoined && user.created_at) {
    const date = new Date(user.created_at);
    profileJoined.textContent = `📅 Joined ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
  }

  // Update dynamic skill lists if defined
  if (user.teach_skills && user.teach_skills.length) {
    const teachFormatted = user.teach_skills.map(s => ({ name: s, level: 50, badge: 'Intermediate' }));
    renderSkillList('teachSkills', teachFormatted);
  } else {
    document.getElementById('teachSkills').innerHTML = '<p class="text-muted">No teaching skills listed.</p>';
  }

  if (user.learn_skills && user.learn_skills.length) {
    const learnFormatted = user.learn_skills.map(s => ({ name: s, level: 10, badge: 'Beginner' }));
    renderSkillList('learnSkills', learnFormatted);
  } else {
    document.getElementById('learnSkills').innerHTML = '<p class="text-muted">No learning skills listed.</p>';
  }

  // Hide reviews for new users
  const profileReviewsContainer = document.getElementById('profileReviews');
  const isNewUser = !user.teach_skills.length && !user.learn_skills.length && !user.bio;
  
  if (profileReviewsContainer) {
    if (isNewUser) {
      profileReviewsContainer.parentElement.style.display = 'none';
    } else {
      profileReviewsContainer.parentElement.style.display = 'block';
    }
  }
  
  const recentReviewsContainer = document.getElementById('recentReviews');
  if (recentReviewsContainer) {
    if (isNewUser) {
      recentReviewsContainer.parentElement.style.display = 'none';
    } else {
      recentReviewsContainer.parentElement.style.display = 'block';
    }
  }

  // Handle Progress Page empty state for new users
  const progressEmptyState = document.getElementById('progressEmptyState');
  const progressDataContainer = document.getElementById('progressDataContainer');

  if (progressEmptyState && progressDataContainer) {
    if (isNewUser) {
      progressEmptyState.style.display = 'block';
      progressDataContainer.style.display = 'none';
    } else {
      progressEmptyState.style.display = 'none';
      progressDataContainer.style.display = 'block';
    }
  }

  // Handle Dashboard Stats and Sessions for new users
  if (isNewUser) {
    if (document.getElementById('dashSessionsCount')) {
      document.getElementById('dashSessionsCount').textContent = '0';
      document.getElementById('dashSessionsChange').style.display = 'none';
      document.getElementById('dashRatingValue').textContent = '0.0';
      document.getElementById('dashRatingChange').style.display = 'none';
      document.getElementById('dashStreakValue').textContent = '0';
      document.getElementById('dashStreakChange').style.display = 'none';
      document.getElementById('dashConnectionsCount').textContent = '0';
      document.getElementById('dashConnectionsChange').style.display = 'none';
    }
    
    const sessionsContainer = document.getElementById('upcomingSessions');
    if (sessionsContainer) {
      sessionsContainer.innerHTML = '<div style="text-align:center; padding:var(--space-xl); color:var(--text-muted)">No upcoming sessions. Schedule one to get started!</div>';
    }
  } else {
    if (document.getElementById('dashSessionsCount')) {
      document.getElementById('dashSessionsCount').textContent = '24';
      document.getElementById('dashSessionsChange').style.display = 'inline-flex';
      document.getElementById('dashRatingValue').textContent = '4.9';
      document.getElementById('dashRatingChange').style.display = 'inline-flex';
      document.getElementById('dashStreakValue').textContent = '7';
      document.getElementById('dashStreakChange').style.display = 'inline-flex';
      document.getElementById('dashConnectionsCount').textContent = '18';
      document.getElementById('dashConnectionsChange').style.display = 'inline-flex';
    }
    
    renderSessions();
  }

  // Render Calendars with user availability
  let availIndices = [];
  try {
    if (user.availability) availIndices = JSON.parse(user.availability);
  } catch(e) {}
  
  if (document.getElementById('profileCalendar')) {
    renderCalendar('profileCalendar', availIndices.length > 0 ? availIndices : null);
  }
  if (document.getElementById('miniCalendar')) {
    renderCalendar('miniCalendar', availIndices.length > 0 ? availIndices : null);
  }

  renderProfileGroups();
  renderProgress(); // Re-render progress with new user data
  renderLearningHistory();
  renderNotifications();
  renderNetwork();
}

// ==========================================
// PERSONALIZE PROFILE
// ==========================================

function openPersonalizeModal() {
  if (!currentUser) return;
  document.getElementById('persName').value = currentUser.name || '';
  document.getElementById('persEmail').value = currentUser.email || '';
  document.getElementById('persAge').value = currentUser.age || '';
  document.getElementById('persPhone').value = currentUser.phone || '';
  document.getElementById('persTeach').value = (currentUser.teach_skills || []).join(', ');
  document.getElementById('persLearn').value = (currentUser.learn_skills || []).join(', ');
  document.getElementById('persBio').value = currentUser.bio || '';
  
  let avail = [];
  try {
    avail = currentUser.availability ? JSON.parse(currentUser.availability) : [];
  } catch(e) {}
  
  document.querySelectorAll('#persAvailabilityDays input').forEach(cb => {
    cb.checked = avail.includes(parseInt(cb.value));
  });

  document.getElementById('personalizeModal').classList.add('open');
}

function closePersonalizeModal() {
  document.getElementById('personalizeModal').classList.remove('open');
}

async function submitPersonalizeProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const avail = Array.from(document.querySelectorAll('#persAvailabilityDays input:checked')).map(cb => parseInt(cb.value));

  const payload = {
    name: document.getElementById('persName').value,
    age: document.getElementById('persAge').value,
    phone: document.getElementById('persPhone').value,
    teachSkills: document.getElementById('persTeach').value,
    learnSkills: document.getElementById('persLearn').value,
    bio: document.getElementById('persBio').value,
    availability: JSON.stringify(avail)
  };

  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closePersonalizeModal();
      showToast('✅ Profile personalized successfully!');
      fetchProfile(); // Refresh data
    } else {
      const data = await res.json();
      showToast(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    showToast('❌ Failed to update profile');
  }
}


// ==========================================
// SCHEDULE MODAL
// ==========================================

function openScheduleModal() {
  document.getElementById('scheduleModal').classList.add('open');
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.remove('open');
}

function selectTimeSlot(el) {
  document.querySelectorAll('#scheduleTimeSlots .time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmSchedule() {
  const selectedTime = document.querySelector('#scheduleTimeSlots .time-slot.selected');
  if (!selectedTime) {
    showToast('⚠️ Please select a time slot');
    return;
  }

  closeScheduleModal();
  showToast('✅ Session scheduled successfully!');

  // Add to sessions
  const partner = document.getElementById('schedulePartner').value.split(' — ')[0];
  const initials = partner.split(' ').map(n => n[0]).join('');
  const skillExchange = document.getElementById('scheduleSkill').value;
  MOCK_SESSIONS.unshift({
    partner,
    initials,
    skill: skillExchange,
    date: 'Upcoming',
    time: selectedTime.textContent,
    status: 'confirmed'
  });

  renderSessions();

  // Track progress per account
  recordScheduledSwapProgress({
    partnerName: partner,
    skillExchangeLabel: skillExchange
  });
}


// ==========================================
// REPORT MODAL
// ==========================================

function openReportModal() {
  document.getElementById('reportModal').classList.add('open');
}

function closeReportModal() {
  document.getElementById('reportModal').classList.remove('open');
}

function submitReport() {
  closeReportModal();
  showToast('✅ Report submitted. Our safety team will review it within 24 hours.');
}


// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">💜</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}


// ==========================================
// CLOSE MODALS ON OUTSIDE CLICK
// ==========================================

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
    e.target.classList.remove('open');
  }
});

// Close modals on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    if (chatOpen) toggleChat();
  }
});


// ==========================================
// INITIALIZATION
// ==========================================

function init() {
  // Try to revive session
  fetchProfile();

  // Render all sections
  renderCategories('featuredCategoriesGrid', 6);
  renderCategories('allCategoriesGrid');
  renderCategoryFilters();
  renderRecommendations();
  renderLeaderboard();
  renderGroups();
  renderSessions();
  renderSkillMatches();
  renderCalendar('miniCalendar');
  renderCalendar('profileCalendar');
  renderReviews('recentReviews', MOCK_REVIEWS, 2);
  renderReviews('profileReviews', MOCK_REVIEWS);
  renderSkillList('teachSkills', TEACH_SKILLS); // default if not logged in
  renderSkillList('learnSkills', LEARN_SKILLS); // default if not logged in
  renderProgress();
  renderLearningHistory();
  renderTestimonials();
  renderTrends();

  // Start scroll animations
  observeAnimations();

  // Set default schedule date
  const dateInput = document.getElementById('scheduleDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);

// ==========================================
// AI CHATBOT LOGIC
// ==========================================

let aiChatOpen = false;

function toggleAIChat() {
  aiChatOpen = !aiChatOpen;
  const panel = document.getElementById('aiChatPanel');
  if (aiChatOpen) {
    panel.classList.add('open');
    document.getElementById('aiChatInput').focus();
  } else {
    panel.classList.remove('open');
  }
}

function handleAIPress(e) {
  if (e.key === 'Enter') sendAIMessage();
}

async function sendAIMessage() {
  const input = document.getElementById('aiChatInput');
  const message = input.value.trim();
  if (!message) return;
  
  // Append user message
  appendAIMessage(message, 'user');
  input.value = '';
  
  // Append loading
  const loadingId = 'loading-' + Date.now();
  appendAIMessage('...', 'bot', loadingId);
  
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}/ai-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message })
    });
    
    const data = await res.json();
    
    // Remove loading message
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    
    if (res.ok) {
      appendAIMessage(data.response, 'bot');
    } else {
      appendAIMessage(`Error: ${data.error}`, 'bot');
    }
  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    appendAIMessage('Failed to connect to AI service.', 'bot');
  }
}

function appendAIMessage(text, sender, id = '') {
  const container = document.getElementById('aiChatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `ai-msg ${sender}`;
  if (id) msgDiv.id = id;
  msgDiv.innerHTML = text; // allow HTML for basic formatting
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// ==========================================
// NOTIFICATIONS & PUBLIC PROFILES
// ==========================================

function clearNotifications() {
  const container = document.getElementById('notificationsList');
  if (container) {
    container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted)">You have no new notifications.</div>';
    showToast('Notifications cleared');
  }
}

function renderNotifications() {
  const container = document.getElementById('notificationsList');
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted)">Please sign in to see your smart recommendations.</div>';
    return;
  }

  const learnSkills = currentUser.learn_skills || [];
  let notificationsHtml = '';

  if (learnSkills.length === 0) {
    notificationsHtml = `
      <div class="glass-card fade-in" style="padding:var(--space-lg); display:flex; align-items:center; gap:var(--space-md)">
        <div style="font-size:2rem">👋</div>
        <div>
          <h4 style="margin-bottom:5px">Welcome to Skill Swap!</h4>
          <p style="color:var(--text-muted); font-size:0.9rem">Add skills you want to learn to your profile so our AI can recommend the perfect tutors and groups for you.</p>
        </div>
      </div>
    `;
  } else {
    // Generate tutor recommendations based on learn_skills
    const recommendedTutors = MOCK_USERS.filter(u => 
      learnSkills.some(skill => u.teaches.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 2);

    recommendedTutors.forEach(tutor => {
      notificationsHtml += `
        <div class="glass-card fade-in" style="padding:var(--space-lg); display:flex; align-items:center; gap:var(--space-md); cursor:pointer" onclick="openPublicProfile('${tutor.name}')">
          <div class="avatar" style="border:2px solid var(--pink)">${tutor.initials}</div>
          <div style="flex-grow:1">
            <h4 style="margin-bottom:5px">New matching tutor found!</h4>
            <p style="color:var(--text-muted); font-size:0.9rem"><b>${tutor.name}</b> has a ${tutor.rating}⭐ rating and can teach you something from your learning list.</p>
          </div>
          <button class="btn btn-secondary btn-sm">View Profile</button>
        </div>
      `;
    });

    // Generate group recommendations based on learn_skills
    const recommendedGroups = MOCK_GROUPS.filter(g => 
      learnSkills.some(skill => g.tags.some(tag => tag.toLowerCase().includes(skill.toLowerCase())))
    ).slice(0, 1);

    recommendedGroups.forEach(group => {
      notificationsHtml += `
        <div class="glass-card fade-in" style="padding:var(--space-lg); display:flex; align-items:center; gap:var(--space-md)">
          <div class="avatar" style="background:var(--pink); color:white">👥</div>
          <div style="flex-grow:1">
            <h4 style="margin-bottom:5px">Recommended Study Group</h4>
            <p style="color:var(--text-muted); font-size:0.9rem">Based on your interests, you might like the <b>${group.name}</b> group.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="joinGroup('${group.name}')">Join Group</button>
        </div>
      `;
    });

    if (!notificationsHtml) {
      notificationsHtml = '<div style="text-align:center; padding:2rem; color:var(--text-muted)">You\'re all caught up! Check back later for more recommendations.</div>';
    }
  }

  container.innerHTML = notificationsHtml;
}

let pendingConnections = [];

function openPublicProfile(username) {
  const user = MOCK_USERS.find(u => u.name === username);
  if (!user) return;

  document.getElementById('pubName').textContent = user.name + (user.verified ? ' ✓' : '');
  document.getElementById('pubAvatar').textContent = user.initials;
  document.getElementById('pubRating').textContent = `📍 ${user.location} · ${renderStars(user.rating)} (${user.reviews})`;
  
  document.getElementById('pubBio').textContent = `Hi, I'm ${user.name.split(' ')[0]}! I'm passionate about sharing my knowledge in ${user.teaches} and I'm actively looking to improve my skills in ${user.wants}. Let's swap skills!`;

  document.getElementById('pubTeaches').innerHTML = user.teaches.split(',').map(s => `<span class="badge">${s.trim()}</span>`).join('');
  document.getElementById('pubWants').innerHTML = user.wants.split(',').map(s => `<span class="badge badge-pink">${s.trim()}</span>`).join('');

  const connectBtn = document.getElementById('pubConnectBtn');
  if (pendingConnections.includes(user.name)) {
    connectBtn.textContent = 'Pending';
    connectBtn.className = 'btn btn-secondary';
    connectBtn.disabled = true;
  } else {
    connectBtn.textContent = 'Connect';
    connectBtn.className = 'btn btn-primary';
    connectBtn.disabled = false;
  }

  const messageBtn = document.getElementById('pubMessageBtn');
  messageBtn.onclick = () => {
    closePublicProfile();
    toggleChat(user.name, false);
  };

  document.getElementById('publicProfileModal').classList.add('open');
}

function closePublicProfile() {
  document.getElementById('publicProfileModal').classList.remove('open');
}

function sendConnectionRequest() {
  const username = document.getElementById('pubName').textContent.replace(' ✓', '');
  if (pendingConnections.includes(username)) return;

  pendingConnections.push(username);
  
  const connectBtn = document.getElementById('pubConnectBtn');
  connectBtn.textContent = 'Pending';
  connectBtn.className = 'btn btn-secondary';
  connectBtn.disabled = true;

  showToast(`✅ Connection request sent to ${username}!`);

  setTimeout(() => {
    showToast(`🎉 ${username} accepted your connection request!`);
    if (!activeConnections.includes(username)) {
      activeConnections.push(username);
      renderActiveConnections();
    }
  }, 5000);
}

let activeConnections = ['Harsha', 'Hariharan', 'Satish']; // Mock active connections

function renderNetwork() {
  const pendingContainer = document.getElementById('pendingConnectionsList');
  const activeContainer = document.getElementById('activeConnectionsGrid');
  if (!pendingContainer || !activeContainer) return;

  // Render pending connections (mock incoming requests)
  const incomingRequests = [MOCK_USERS[3]]; // Emma Wilson
  
  if (incomingRequests.length === 0) {
    pendingContainer.innerHTML = '<p class="text-muted">No pending requests.</p>';
  } else {
    pendingContainer.innerHTML = incomingRequests.map(u => `
      <div class="glass-card fade-in" style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-md)">
        <div style="display:flex; align-items:center; gap:var(--space-md); cursor:pointer" onclick="openPublicProfile('${u.name}')">
          <div class="avatar">${u.initials}</div>
          <div>
            <h4 style="margin-bottom:0">${u.name}</h4>
            <p class="text-muted" style="margin-bottom:0; font-size:0.85rem">${u.teaches}</p>
          </div>
        </div>
        <div style="display:flex; gap:10px">
          <button class="btn btn-secondary btn-sm" onclick="this.parentElement.parentElement.remove(); showToast('Request declined')">Decline</button>
          <button class="btn btn-primary btn-sm" onclick="acceptConnection(this, '${u.name}')">Accept</button>
        </div>
      </div>
    `).join('');
  }

  // Render active connections
  renderActiveConnections();
}

function renderActiveConnections() {
  const activeContainer = document.getElementById('activeConnectionsGrid');
  if (!activeContainer) return;

  const connectedUsers = MOCK_USERS.filter(u => activeConnections.includes(u.name));

  if (connectedUsers.length === 0) {
    activeContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:var(--space-2xl)"><p class="text-muted">You have no connections yet. Go explore skills to find partners!</p></div>';
  } else {
    activeContainer.innerHTML = connectedUsers.map(user => `
      <div class="glass-card recommend-card fade-in">
        <div class="recommend-header">
          <div class="avatar">${user.initials}</div>
          <div class="recommend-details">
            <h4>${user.name} ${user.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}</h4>
            <p>📍 ${user.location}</p>
          </div>
        </div>
        <div class="recommend-skills">
          <span class="badge">Teaches: ${user.teaches}</span>
        </div>
        <div class="recommend-footer" style="margin-top:15px">
          <button class="btn btn-secondary btn-sm" style="width:100%" onclick="toggleChat('${user.name}', false)">Message</button>
        </div>
      </div>
    `).join('');
  }
}

function acceptConnection(btn, username) {
  btn.parentElement.parentElement.remove();
  if (!activeConnections.includes(username)) {
    activeConnections.push(username);
  }
  renderActiveConnections();
  showToast(`🎉 You are now connected with ${username}!`);
}

// ==========================================
// REAL-TIME TRENDS
// ==========================================

function renderTrends() {
  const container = document.getElementById('trendsContainer');
  if (!container) return;

  const trends = [
    { skill: 'React', demand: 98, supply: 45 },
    { skill: 'Python', demand: 92, supply: 60 },
    { skill: 'UX Design', demand: 85, supply: 30 },
    { skill: 'Machine Learning', demand: 80, supply: 15 },
    { skill: 'Spanish', demand: 75, supply: 80 }
  ];

  container.innerHTML = trends.map(t => {
    const gap = t.demand - t.supply;
    const isHighDemand = gap > 30;
    
    return `
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px">
          <span style="font-weight:bold">${t.skill}</span>
          <span style="font-size:0.85rem; color:${isHighDemand ? 'var(--pink)' : 'var(--text-muted)'}">
            ${isHighDemand ? '🔥 High Demand' : 'Stable'}
          </span>
        </div>
        <div class="progress-xp-bar" style="height:12px; background:rgba(255,255,255,0.05); position:relative">
          <!-- Demand (Learners looking) -->
          <div class="progress-xp-fill" style="width:${t.demand}%; opacity:0.5; position:absolute; left:0; top:0; bottom:0"></div>
          <!-- Supply (Tutors available) -->
          <div class="progress-xp-fill" style="width:${t.supply}%; background:rgba(255,255,255,0.8); position:absolute; left:0; top:0; bottom:0"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-top:4px">
          <span>Supply: ${t.supply}%</span>
          <span>Demand: ${t.demand}%</span>
        </div>
      </div>
    `;
  }).join('');
}
