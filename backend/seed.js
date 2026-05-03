// seed.js - run this AFTER schema.sql to insert properly hashed passwords
// Usage: node seed.js
// Run from the backend folder

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

const users = [
  { username: 'james.carter',     password: 'Password1!', full_name: 'James Carter',     email: 'james.carter@mga.edu',     role: 'user' },
  { username: 'sarah.wright',     password: 'Password1!', full_name: 'Sarah Wright',     email: 'sarah.wright@mga.edu',     role: 'user' },
  { username: 'mike.t',           password: 'Password1!', full_name: 'Mike Thompson',    email: 'mike.t@mga.edu',           role: 'it_staff' },
  { username: 'admin',            password: 'Password1!', full_name: 'Admin Account',    email: 'ithelp@mga.edu',           role: 'admin' },
  { username: 'david.chen',       password: 'Password1!', full_name: 'David Chen',       email: 'david.chen@mga.edu',       role: 'user' },
  { username: 'lisa.johnson',     password: 'Password1!', full_name: 'Lisa Johnson',     email: 'lisa.johnson@mga.edu',     role: 'user' },
  { username: 'william.mauldin',  password: 'Password1!', full_name: 'William Mauldin',  email: 'william.mauldin@mga.edu',  role: 'it_staff' },
  { username: 'macy.mayoralgo',   password: 'Password1!', full_name: 'Macy Mayoralgo',   email: 'macy.mayoralgo@mga.edu',   role: 'it_staff' },
  { username: 'ronald.robertson', password: 'Password1!', full_name: 'Ronald Robertson', email: 'ronald.robertson@mga.edu', role: 'it_staff' },
  { username: 'timarco.ross',     password: 'Password1!', full_name: 'Timarco Ross',     email: 'timarco.ross@mga.edu',     role: 'it_staff' },
  { username: 'erin.smith',       password: 'Password1!', full_name: 'Erin Smith',       email: 'erin.smith@mga.edu',       role: 'it_staff' }
];

async function seed() {
  try {
    // Clear existing users first
    await db.promise().query('DELETE FROM logs');
    await db.promise().query('DELETE FROM tickets');
    await db.promise().query('DELETE FROM users');

    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      await db.promise().query(
        'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        [user.username, hash, user.full_name, user.email, user.role]
      );
      console.log(`Created user: ${user.username} (${user.role})`);
    }

    // Re-insert test tickets
    const [users_result] = await db.promise().query('SELECT user_id, username FROM users');
    const userMap = {};
    users_result.forEach(u => userMap[u.username] = u.user_id);

    const tickets = [
      { title: 'eduroam WiFi not connecting on Macon campus', description: 'My laptop will not connect to eduroam since this morning. It keeps asking for credentials and then fails. Tried forgetting the network and reconnecting but same issue. Need this fixed before my online exam tomorrow.', category: 'Network', priority: 'High', status_id: 1, submitted_by: userMap['james.carter'], assigned_to: null },
      { title: 'BannerWeb login error after password reset', description: 'After resetting my MGA password through the portal I am now getting an error when trying to log into BannerWeb. The page just says invalid credentials even though I can log into email fine with the new password.', category: 'Account', priority: 'Critical', status_id: 2, submitted_by: userMap['sarah.wright'], assigned_to: userMap['mike.t'] },
      { title: "Projector in CBT 120 won't display HDMI input", description: 'The ceiling projector in CBT 120 is not picking up the HDMI signal from the instructor podium. Tried two different laptops. The display just says no signal. Class is at 2pm so please prioritize.', category: 'Hardware', priority: 'Medium', status_id: 3, submitted_by: userMap['sarah.wright'], assigned_to: userMap['mike.t'] },
      { title: 'D2L Brightspace quiz not submitting', description: 'I completed my quiz in D2L but when I hit submit it just spins and never confirms. Tried Chrome and Edge both. Not sure if my answers were saved. This is for ITEC 3270 due tonight.', category: 'Software', priority: 'High', status_id: 1, submitted_by: userMap['james.carter'], assigned_to: null },
      { title: 'Microsoft Office expired on library computer A112', description: 'The computer labeled A112 in the Macon library is showing that Office 365 license has expired. Students are using this for printing assignments and it stopped working around 10am.', category: 'Software', priority: 'Low', status_id: 4, submitted_by: userMap['james.carter'], assigned_to: userMap['mike.t'] }
    ];

    for (const ticket of tickets) {
      const [result] = await db.promise().query(
        'INSERT INTO tickets (title, description, category, priority, status_id, submitted_by, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ticket.title, ticket.description, ticket.category, ticket.priority, ticket.status_id, ticket.submitted_by, ticket.assigned_to]
      );
      await db.promise().query(
        'INSERT INTO logs (ticket_id, user_id, action) VALUES (?, ?, ?)',
        [result.insertId, ticket.submitted_by, 'Ticket submitted']
      );
      console.log(`Created ticket: ${ticket.title}`);
    }

    console.log('\nSeed complete. Test credentials:');
    console.log('  Regular user : james.carter / Password1!');
    console.log('  Regular user : sarah.wright / Password1!');
    console.log('  IT Staff     : william.mauldin / Password1!');
    console.log('  IT Staff     : macy.mayoralgo / Password1!');
    console.log('  IT Staff     : ronald.robertson / Password1!');
    console.log('  IT Staff     : timarco.ross / Password1!');
    console.log('  IT Staff     : erin.smith / Password1!');
    console.log('  Admin        : admin / Password1!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
