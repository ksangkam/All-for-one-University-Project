import { getSupabase, userMessage } from './supabase-client.js';

export function initAuth() {
  const dialog = document.querySelector('#authDialog');
  const form = document.querySelector('#authForm');
  if (!dialog || !form) return;

  const loginButton = document.querySelector('#loginBtn');
  const joinButton = document.querySelector('#joinBtn');
  const registerFields = document.querySelector('#registerFields');
  const ownerFields = document.querySelector('#authOwnerFields');
  const accountType = document.querySelector('#accountType');
  const email = document.querySelector('#authEmail');
  const password = document.querySelector('#authPassword');
  const status = document.querySelector('#authStatus');
  const submit = document.querySelector('#authSubmit');
  const toggle = document.querySelector('#authModeToggle');
  let mode = 'login';

  const setStatus = (message = '', kind = '') => {
    status.textContent = message;
    status.dataset.state = kind;
  };
  const setMode = next => {
    mode = next;
    const registering = mode === 'register';
    registerFields.hidden = !registering;
    document.querySelector('#authTitle').textContent = registering ? 'สร้างบัญชี ThaiGoShare' : 'เข้าสู่ระบบ';
    document.querySelector('#authDescription').textContent = registering
      ? 'สมัครเป็นผู้เช่า หรือส่งข้อมูลเพื่อขอเปิดร้านค้า' : 'เข้าสู่ระบบเพื่อจัดการบัญชีและรายการเช่า';
    submit.textContent = registering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ';
    toggle.textContent = registering ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก';
    password.autocomplete = registering ? 'new-password' : 'current-password';
    setStatus();
  };
  const show = next => {
    setMode(next);
    if (!dialog.open) dialog.showModal();
  };
  loginButton?.addEventListener('click', () => {
    if (loginButton.dataset.signedIn === 'true') {
      getSupabase().auth.signOut().then(({ error }) => error && setStatus(userMessage(error), 'error'));
      return;
    }
    show('login');
  });
  joinButton?.addEventListener('click', () => {
    if (joinButton.dataset.signedIn === 'true') {
      window.location.href = 'dashboard/owner.html';
      return;
    }
    show('register');
  });
  toggle.addEventListener('click', () => setMode(mode === 'login' ? 'register' : 'login'));
  accountType?.addEventListener('change', () => { ownerFields.hidden = accountType.value !== 'owner'; });

  const applySession = session => {
    loginButton.dataset.signedIn = String(Boolean(session));
    loginButton.textContent = session ? 'ออกจากระบบ' : 'เข้าสู่ระบบ';
    joinButton.dataset.signedIn = String(Boolean(session));
    joinButton.textContent = session ? 'จัดการร้านค้า / บัญชี' : 'ลงทะเบียนร้านค้า';
    if (session && dialog.open) dialog.close();
  };
  const syncSession = async () => {
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      applySession(session);
    } catch {
      loginButton.dataset.signedIn = 'false';
      joinButton.dataset.signedIn = 'false';
    }
  };
  try { getSupabase().auth.onAuthStateChange((_event, session) => applySession(session)); } catch { /* Config is shown when the form is submitted. */ }
  void syncSession();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus();
    submit.disabled = true;
    try {
      const supabase = getSupabase();
      const values = new FormData(form);
      const credentials = { email: String(values.get('email')).trim(), password: String(values.get('password')) };
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        setStatus('เข้าสู่ระบบสำเร็จ กำลังเปิดบัญชีของคุณ…', 'success');
        await syncSession();
      } else {
        const fullName = String(values.get('fullName')).trim();
        if (!fullName) throw new Error('กรุณากรอกชื่อที่ใช้แสดง');
        const isOwner = values.get('accountType') === 'owner';
        const ownerApplication = isOwner ? {
          shop_name: String(values.get('shopName')).trim(),
          area: String(values.get('area')),
          contact_info: String(values.get('contactInfo')).trim(),
          description: String(values.get('shopDescription')).trim(),
        } : null;
        if (isOwner && (!ownerApplication.shop_name || !ownerApplication.contact_info)) {
          throw new Error('กรุณากรอกชื่อร้านและช่องทางติดต่อ');
        }
        const { data, error } = await supabase.auth.signUp({
          ...credentials,
          options: { data: { full_name: fullName, ...(ownerApplication ? { owner_application: ownerApplication } : {}) } },
        });
        if (error) throw error;
        if (data.session) {
          setStatus(isOwner ? 'สมัครสำเร็จ ส่งคำขอเปิดร้านแล้ว รอทีมงานอนุมัติก่อนลงสินค้า' : 'สมัครสำเร็จ ยินดีต้อนรับสู่ ThaiGoShare', 'success');
          await syncSession();
        } else {
          setStatus('สมัครสำเร็จ กรุณายืนยันอีเมลจากกล่องจดหมายก่อนเข้าสู่ระบบ', 'success');
        }
      }
    } catch (error) {
      setStatus(userMessage(error), 'error');
    } finally {
      submit.disabled = false;
    }
  });

  if (new URLSearchParams(location.search).get('auth') === 'login') show('login');
}
