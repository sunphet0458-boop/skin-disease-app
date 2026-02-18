import * as SQLite from 'expo-sqlite';

// 1. เปิดการเชื่อมต่อฐานข้อมูล
const db = SQLite.openDatabaseSync('melanoma_app.db');

// 2. ฟังก์ชันสร้างตาราง (Init) - เรียกใช้ตอนเปิดแอป
export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imageUri TEXT,
        diagnosis TEXT,
        riskLevel TEXT,
        confidence INTEGER,
        date TEXT,
        note TEXT
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.log('Error initializing database:', error);
  }
};

// 3. ฟังก์ชันเพิ่มข้อมูล (CREATE)
export const addScanRecord = (imageUri, diagnosis, riskLevel, confidence) => {
  const date = new Date().toISOString(); // เก็บวันที่ปัจจุบัน
  try {
    db.runSync(
      'INSERT INTO scans (imageUri, diagnosis, riskLevel, confidence, date, note) VALUES (?, ?, ?, ?, ?, ?)',
      [imageUri, diagnosis, riskLevel, confidence, date, '']
    );
    console.log('Record added');
    return true;
  } catch (error) {
    console.log('Error adding record:', error);
    return false;
  }
};

// 4. ฟังก์ชันดึงข้อมูลทั้งหมด (READ)
export const getAllScans = () => {
  try {
    const allRows = db.getAllSync('SELECT * FROM scans ORDER BY id DESC');
    return allRows; // ส่งคืนเป็น Array ของข้อมูล
  } catch (error) {
    console.log('Error getting records:', error);
    return [];
  }
};

// 5. ฟังก์ชันแก้ไขบันทึกช่วยจำ (UPDATE)
export const updateScanNote = (id, newNote) => {
  try {
    db.runSync('UPDATE scans SET note = ? WHERE id = ?', [newNote, id]);
    console.log('Note updated');
  } catch (error) {
    console.log('Error updating note:', error);
  }
};

// 6. ฟังก์ชันลบข้อมูล (DELETE)
export const deleteScanRecord = (id) => {
  try {
    db.runSync('DELETE FROM scans WHERE id = ?', [id]);
    console.log('Record deleted');
  } catch (error) {
    console.log('Error deleting record:', error);
  }
};