import { formatBaht } from './pricing.js';
import { getSupabase, userMessage } from './supabase-client.js';

const $ = selector => document.querySelector(selector);
const status = $('#ownerStatus');
let supabase;
let activeUser;
let shop;
let application;

function message(text, kind = '') {
  status.textContent = text;
  status.dataset.state = kind;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

async function loadApplication() {
  const { data, error } = await supabase.from('owner_applications').select('*').eq('profile_id', activeUser.id).maybeSingle();
  if (error) throw error;
  application = data;
}

function prefillShopForm(form, values = {}) {
  form.elements.shopName.value = values.shop_name || '';
  form.elements.area.value = values.area || 'เขาใหญ่';
  form.elements.contact.value = values.contact_info || '';
  form.elements.description.value = values.description || '';
}

function showApplicationPanel() {
  $('#ownerApplicationPanel').hidden = false;
  $('#shopForm').hidden = true;
  $('#resubmitApplication').hidden = true;
  if (application?.status === 'pending') {
    $('#applicationHeading').textContent = 'กำลังตรวจสอบคำขอ';
    $('#applicationDescription').textContent = `คำขอเปิดร้าน “${application.shop_name}” ส่งแล้ว ทีมงานจะตรวจสอบก่อนเปิดสิทธิ์ลงสินค้า`;
    message('บัญชีของคุณยังอยู่ในสถานะผู้เช่า ระหว่างนี้ยังไม่สามารถลงสินค้าได้', 'success');
  } else if (application?.status === 'rejected') {
    $('#applicationHeading').textContent = 'ปรับข้อมูลและส่งคำขอใหม่';
    $('#applicationDescription').textContent = 'คำขอก่อนหน้านี้ยังไม่ได้รับอนุมัติ คุณสามารถแก้ไขข้อมูลแล้วส่งให้ตรวจสอบอีกครั้ง';
    $('#resubmitApplication').hidden = false;
    prefillShopForm($('#shopForm'), application);
    message('แก้ไขข้อมูลร้านและส่งคำขอใหม่ได้', 'error');
  } else {
    $('#applicationHeading').textContent = 'สมัครเป็นผู้ให้เช่า';
    $('#applicationDescription').textContent = 'ส่งข้อมูลร้านให้ทีมงานตรวจสอบ บัญชีจะยังไม่ได้สิทธิ์เจ้าของจนกว่าจะอนุมัติ';
    prefillShopForm($('#shopForm'));
    $('#shopForm').hidden = false;
    message('เพิ่มข้อมูลร้านเพื่อส่งคำขออนุมัติ', '');
  }
}

function resetProductForm() {
  $('#productForm').reset();
  $('#productId').value = '';
  $('#productFormTitle').textContent = 'เพิ่มสินค้าใหม่';
  $('#productActive').checked = true;
  $('#productForm').hidden = true;
}

function editProduct(product) {
  $('#productId').value = product.id;
  $('#productName').value = product.name;
  $('#productCategory').value = product.category;
  $('#productArea').value = product.area;
  $('#productPrice').value = (product.daily_price / 100).toFixed(2).replace(/\.00$/, '');
  $('#productDeposit').value = (product.deposit / 100).toFixed(2).replace(/\.00$/, '');
  $('#productImage').value = product.image_url || '';
  $('#productCondition').value = product.condition || '';
  $('#productDescription').value = product.description || '';
  $('#productActive').checked = product.is_active;
  $('#productFormTitle').textContent = 'แก้ไขสินค้า';
  $('#productForm').hidden = false;
  $('#productForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function renderProducts() {
  const { data, error } = await supabase.from('products').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false });
  if (error) throw error;
  const list = $('#ownerProductList');
  if (!data.length) {
    list.innerHTML = '<div class="owner-empty"><h3>ยังไม่มีสินค้าในร้าน</h3><p>เริ่มต้นด้วยการเพิ่มอุปกรณ์หรือบริการชิ้นแรกของคุณ</p><button class="btn btn-outline" data-owner-action="new" type="button">เพิ่มสินค้า</button></div>';
    return;
  }
  list.innerHTML = data.map(product => `<article class="owner-product-row">
    ${product.image_url ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy">` : '<div class="owner-product-placeholder" aria-hidden="true">สินค้า</div>'}
    <div class="owner-product-info"><span class="status-badge ${product.is_active ? 'is-active' : 'is-inactive'}">${product.is_active ? 'กำลังแสดง' : 'ซ่อนจากแคตตาล็อก'}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.area)} · ${formatBaht(product.daily_price)} / วัน</p></div>
    <div class="owner-product-actions"><button class="btn btn-outline" type="button" data-owner-action="edit" data-id="${product.id}">แก้ไข</button><button class="btn btn-outline" type="button" data-owner-action="toggle" data-id="${product.id}" data-active="${product.is_active}">${product.is_active ? 'ซ่อน' : 'แสดง'}</button></div>
  </article>`).join('');
  list.querySelectorAll('[data-owner-action]').forEach(button => button.addEventListener('click', async () => {
    const action = button.dataset.ownerAction;
    if (action === 'new') { $('#productForm').hidden = false; $('#productForm').scrollIntoView({ behavior: 'smooth' }); return; }
    const product = data.find(item => item.id === button.dataset.id);
    if (!product) return;
    if (action === 'edit') { editProduct(product); return; }
    button.disabled = true;
    try {
      const { error: updateError } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id).eq('shop_id', shop.id);
      if (updateError) throw updateError;
      await renderProducts();
      message('ปรับสถานะสินค้าแล้ว', 'success');
    } catch (error) { message(userMessage(error), 'error'); }
  }));
}

async function enterDashboard() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) {
    location.replace('../index.html?auth=login');
    return;
  }
  activeUser = session.user;
  const [{ data: profile, error: profileError }, { data: shops, error: shopsError }] = await Promise.all([
    supabase.from('profiles').select('id,full_name,role').eq('id', activeUser.id).single(),
    supabase.from('shops').select('*').eq('owner_id', activeUser.id).limit(1),
  ]);
  if (profileError) throw profileError;
  if (shopsError) throw shopsError;
  shop = shops[0] || null;
  if (profile.role !== 'owner') {
    await loadApplication();
    showApplicationPanel();
    return;
  }
  if (!shop) {
    $('#shopSetupPanel').hidden = false;
    $('#shopSetupForm').addEventListener('submit', async event => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      try {
        const payload = { owner_id: activeUser.id, shop_name: $('#newShopName').value.trim(), area: $('#newShopArea').value, contact_info: $('#newShopContact').value.trim(), description: $('#newShopDescription').value.trim() };
        const { data, error } = await supabase.from('shops').insert(payload).select().single();
        if (error) throw error;
        shop = data;
        $('#shopSetupPanel').hidden = true;
        await showProducts();
      } catch (error) { message(userMessage(error), 'error'); }
      finally { button.disabled = false; }
    });
    message('เพิ่มข้อมูลร้านก่อนเริ่มลงสินค้า');
    return;
  }
  await showProducts();
}

async function showProducts() {
  $('#productsPanel').hidden = false;
  await renderProducts();
  message(`จัดการสินค้าในร้าน ${shop.shop_name}`, 'success');
}

async function init() {
  try {
    supabase = getSupabase();
    $('#ownerSignOut').addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) message(userMessage(error), 'error');
      else location.replace('../index.html');
    });
    $('#shopForm').addEventListener('submit', async event => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const button = event.submitter;
      button.disabled = true;
      try {
        const { error } = await supabase.rpc('request_owner_application', {
          p_shop_name: String(values.get('shopName')).trim(), p_area: String(values.get('area')),
          p_contact_info: String(values.get('contact')).trim(), p_description: String(values.get('description')).trim(),
        });
        if (error) throw error;
        await loadApplication();
        showApplicationPanel();
        message('ส่งคำขอเรียบร้อยแล้ว รอทีมงานตรวจสอบ', 'success');
      } catch (error) { message(userMessage(error), 'error'); }
      finally { button.disabled = false; }
    });
    $('#resubmitApplication').addEventListener('click', () => {
      $('#shopForm').hidden = false;
      $('#resubmitApplication').hidden = true;
      $('#shopForm').querySelector('button[type="submit"]').textContent = 'ส่งคำขอใหม่';
    });
    $('#newProductBtn').addEventListener('click', () => { resetProductForm(); $('#productForm').hidden = false; $('#productForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    $('#cancelProductEdit').addEventListener('click', resetProductForm);
    $('#productForm').addEventListener('submit', async event => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      try {
        const price = Number($('#productPrice').value);
        const deposit = Number($('#productDeposit').value);
        if (!Number.isFinite(price) || price < 0 || !Number.isFinite(deposit) || deposit < 0) throw new Error('กรุณาตรวจสอบค่าเช่าและเงินมัดจำ');
        const payload = {
          shop_id: shop.id, name: $('#productName').value.trim(), category: $('#productCategory').value,
          area: $('#productArea').value, daily_price: Math.round(price * 100), deposit: Math.round(deposit * 100),
          image_url: $('#productImage').value.trim() || null, condition: $('#productCondition').value.trim(),
          description: $('#productDescription').value.trim(), is_active: $('#productActive').checked,
        };
        const productId = $('#productId').value;
        const query = productId
          ? supabase.from('products').update(payload).eq('id', productId).eq('shop_id', shop.id)
          : supabase.from('products').insert(payload);
        const { error } = await query;
        if (error) throw error;
        resetProductForm();
        await renderProducts();
        message(productId ? 'บันทึกการแก้ไขสินค้าแล้ว' : 'เพิ่มสินค้าแล้ว', 'success');
      } catch (error) { message(userMessage(error), 'error'); }
      finally { button.disabled = false; }
    });
    await enterDashboard();
  } catch (error) {
    message(userMessage(error), 'error');
    if (/ตั้งค่า Supabase/.test(error?.message || '')) {
      status.insertAdjacentHTML('beforeend', ' <a href="../README.md">ดูวิธีตั้งค่า</a>');
    }
  }
}

void init();
