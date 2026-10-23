import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-config.js';

let client;

export function getSupabase() {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('ตั้งค่า Supabase URL และ anon key ใน js/supabase-config.js ก่อน');
  }
  if (!window.supabase?.createClient) {
    throw new Error('โหลด Supabase client ไม่สำเร็จ กรุณาตรวจการเชื่อมต่ออินเทอร์เน็ต');
  }
  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export function userMessage(error) {
  const message = error?.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
  if (/invalid login credentials/i.test(message)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (/already registered|user already registered/i.test(message)) return 'อีเมลนี้สมัครสมาชิกแล้ว';
  if (/password should be at least/i.test(message)) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
  return message;
}
