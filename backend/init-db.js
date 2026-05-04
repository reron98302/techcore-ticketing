// init-db.js - bootstrap the schema on first boot if tables are missing
// Idempotent: checks for the users table and only runs schema if absent.
const db = require('./config/db');

const SCHEMA_SQL = [
  "CREATE TABLE IF NOT EXISTS status (status_id INT AUTO_INCREMENT PRIMARY KEY, status_name VARCHAR(50) NOT NULL);",
    "INSERT INTO status (status_name) SELECT * FROM (SELECT 'Open' UNION SELECT 'In Progress' UNION SELECT 'Resolved' UNION SELECT 'Closed') AS s WHERE NOT EXISTS (SELECT 1 FROM status);",
      "CREATE TABLE IF NOT EXISTS users (user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, full_name VARCHAR(150) NOT NULL, email VARCHAR(150) NOT NULL, role ENUM('user','it_staff','admin') NOT NULL DEFAULT 'user', is_active TINYINT(1) NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        "CREATE TABLE IF NOT EXISTS tickets (ticket_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, category ENUM('Hardware','Software','Network','Account','Other') NOT NULL, priority ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium', status_id INT NOT NULL DEFAULT 1, submitted_by INT NOT NULL, assigned_to INT DEFAULT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (status_id) REFERENCES status(status_id), FOREIGN KEY (submitted_by) REFERENCES users(user_id), FOREIGN KEY (assigned_to) REFERENCES users(user_id));",
          "CREATE TABLE IF NOT EXISTS logs (log_id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT NOT NULL, user_id INT NOT NULL, action VARCHAR(255) NOT NULL, note TEXT DEFAULT NULL, logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id), FOREIGN KEY (user_id) REFERENCES users(user_id));"
          ].join('\n');

          const SEED_USERS_SQL = "INSERT INTO users (username, password_hash, full_name, email, role) VALUES " + [
            "('james.carter','$2b$10$5M5OId94DHeMTAVKy4uY/ee59UIm5QgcVzsIoW4Wjx1FNSt12J4.m','James Carter','james.carter@mga.edu','user')",
              "('sarah.wright','$2b$10$i6zt7BeO7ACdKZP933dvletsuXTiLs1KfVRe/x9pbzRHDLqi8lcX6','Sarah Wright','sarah.wright@mga.edu','user')",
                "('mike.t','$2b$10$S7lu/zsypA/N0vE/uTBraOeIeL4eCIhu7V1IJ1yRsFt39pXNLne4m','Mike Thompson','mike.t@mga.edu','it_staff')",
                  "('admin','$2b$10$CPdAC8Fv8jFhpPqqj013n.yKmZUjcrsJ91e99rUMVOT9e0KB4EcKS','Admin Account','ithelp@mga.edu','admin')",
                    "('david.chen','$2b$10$be8eKk9bllNgN8cwhSsuS.FHhapszvkk2cgtqSYVobzVGzJFBS/fi','David Chen','david.chen@mga.edu','user')",
                      "('lisa.johnson','$2b$10$Xy422d/LdDR0jyJZQT419.K/cdXDqrbhg5hfCNrYUdyEMPTXkE0Ri','Lisa Johnson','lisa.johnson@mga.edu','user')",
                        "('william.mauldin','$2b$10$0TCj8Mlm3oFS.IwsW3nZE.9zuMdcmYizbDxiPz1y1cGv9flvKj8cS','William Mauldin','william.mauldin@mga.edu','it_staff')",
                          "('macy.mayoralgo','$2b$10$KI3p1TWBWCwDd/XbHSNJXeqIGEO3wIc8K1sHsywS2uD3A2/nfpMCO','Macy Mayoralgo','macy.mayoralgo@mga.edu','it_staff')",
                            "('ronald.robertson','$2b$10$MsY7uDtHrd8S0iLOwO1mu.hnNkJzUFgDI3GjP/xl3iGxuepS3t1/e','Ronald Robertson','ronald.robertson@mga.edu','it_staff')",
                              "('timarco.ross','$2b$10$A.wpnMoT0I1OFhOLRLmzoeDY/nNe9tQcu7R83jlxyFodKVCUFkOIm','Timarco Ross','timarco.ross@mga.edu','it_staff')",
                                "('erin.smith','$2b$10$4j19arNkcI98i4WhFBqxg.vBUHafS4JcilTj8CJzMDUOJanSs7Dh.','Erin Smith','erin.smith@mga.edu','it_staff')"
                                ].join(',') + ";";

                                function initDb() {
                                  return new Promise((resolve, reject) => {
                                      db.query("SHOW TABLES LIKE 'users'", (err, rows) => {
                                            if (err) return reject(err);
                                                  if (rows && rows.length > 0) {
                                                          console.log('Schema already initialized; skipping bootstrap.');
                                                                  return resolve(false);
                                                                        }
                                                                              console.log('No users table found. Initializing schema...');
                                                                                    db.query(SCHEMA_SQL, (err2) => {
                                                                                            if (err2) return reject(err2);
                                                                                                    db.query(SEED_USERS_SQL, (err3) => {
                                                                                                              if (err3) return reject(err3);
                                                                                                                        console.log('Schema and seed users created. Default login: admin / Password1!');
                                                                                                                                  resolve(true);
                                                                                                                                          });
                                                                                                                                                });
                                                                                                                                                    });
                                                                                                                                                      });
                                                                                                                                                      }
                                                                                                                                                      
                                                                                                                                                      module.exports = initDb;
                                                                                                                                                      
