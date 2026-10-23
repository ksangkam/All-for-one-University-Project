import { calculatePricing, rentalDaysBetween, formatBaht } from './pricing.js';
import { initMagneticButtons } from './magnetic-buttons.js';
import { initFaqAnimations } from './faq.js';

const products = [
  {id:'tent-2p',name:'เต็นท์แคมป์ปิ้ง 2 คน',category:'camping',area:'เขาใหญ่',dailyPrice:300,deposit:1000,shop:'บ้านป่าแคมป์',description:'เต็นท์กันฝนสำหรับ 2 คน พร้อมฟลายชีท เหมาะสำหรับทริปแคมป์ปิ้งช่วงสุดสัปดาห์',image:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=720&q=80'},
  {id:'tent-4p',name:'เต็นท์แคมป์ปิ้ง 4 คน',category:'camping',area:'เขาใหญ่',dailyPrice:450,deposit:1500,shop:'Khao Yai Outdoor',description:'พื้นที่กว้าง นอนสบายสำหรับครอบครัวหรือกลุ่มเพื่อน',image:'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=720&q=80'},
  {id:'chair',name:'เก้าอี้แคมป์ปิ้งพับได้',category:'camping',area:'เขาใหญ่',dailyPrice:80,deposit:300,shop:'บ้านป่าแคมป์',description:'เก้าอี้น้ำหนักเบา พับเก็บสะดวก รองรับน้ำหนักได้ดี',image:'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=720&q=80'},
  {id:'table',name:'โต๊ะพับแคมป์ปิ้ง',category:'camping',area:'เขาใหญ่',dailyPrice:120,deposit:500,shop:'Khao Yai Outdoor',description:'โต๊ะพับอลูมิเนียมสำหรับจัดเตรียมอาหารและนั่งพักผ่อน',image:'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=720&q=80'},
  {id:'stove',name:'เตาแก๊สพกพา',category:'camping',area:'เขาใหญ่',dailyPrice:100,deposit:500,shop:'บ้านป่าแคมป์',description:'เตาแก๊สพกพาสำหรับทำอาหารนอกสถานที่ (ไม่รวมกระป๋องแก๊ส)',image:'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=720&q=80'},
  {id:'sleeping-bag',name:'ถุงนอนกันหนาว',category:'camping',area:'เขาใหญ่',dailyPrice:100,deposit:500,shop:'Khao Yai Outdoor',description:'ถุงนอนสำหรับอากาศเย็น ทำความสะอาดก่อนให้เช่าทุกครั้ง',image:'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=720&q=80'},
  {id:'action-cam',name:'กล้อง Action Cam',category:'camera',area:'เขาใหญ่',dailyPrice:450,deposit:2000,shop:'Trip Shot Rental',description:'กล้องแอ็กชันกันน้ำพร้อมอุปกรณ์ยึดพื้นฐาน เหมาะกับกิจกรรมกลางแจ้ง',image:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=720&q=80'},
  {id:'power-bank',name:'พาวเวอร์แบงค์ 20,000 mAh',category:'camera',area:'เขาใหญ่',dailyPrice:80,deposit:500,shop:'Trip Shot Rental',description:'แบตเตอรี่สำรองความจุสูง พร้อมสายชาร์จ USB-C',image:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=720&q=80'},
  {id:'thai-classic',name:'ชุดไทยแบบดั้งเดิม',category:'thai_dress',area:'วัดอรุณ',dailyPrice:500,deposit:1000,shop:'อรุณไทยคอสตูม',description:'ชุดไทยพร้อมเครื่องประดับพื้นฐาน มีหลายขนาด กรุณาสอบถามก่อนจอง',image:'https://images.unsplash.com/photo-1610189012906-4c1f5de4d8c9?auto=format&fit=crop&w=720&q=80'},
  {id:'thai-modern',name:'ชุดไทยประยุกต์',category:'thai_dress',area:'วัดอรุณ',dailyPrice:450,deposit:1000,shop:'อรุณไทยคอสตูม',description:'ชุดไทยร่วมสมัยพร้อมเครื่องประดับ เหมาะสำหรับถ่ายภาพท่องเที่ยว',image:'https://images.unsplash.com/photo-1583391733956-6c78276477e7?auto=format&fit=crop&w=720&q=80'},
  {id:'thai-couple',name:'ชุดไทยถ่ายภาพคู่',category:'thai_dress',area:'เยาวราช',dailyPrice:900,deposit:2000,shop:'เยาวราช Heritage Wear',description:'ชุดคู่สำหรับสองท่าน สอบถามขนาดและรอบรับชุดกับร้านก่อนส่งคำขอ',image:'https://images.unsplash.com/photo-1610189022906-4c1f5de4d8c9?auto=format&fit=crop&w=720&q=80'},
  {id:'snorkel',name:'ชุดดำน้ำสน็อกเกิล',category:'diving',area:'เขาใหญ่',dailyPrice:150,deposit:500,shop:'Trip Shot Rental',description:'หน้ากากและสน็อกเกิลสำหรับกิจกรรมทางน้ำ ตรวจสภาพก่อนใช้งานทุกครั้ง',image:'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=720&q=80'},
];
const $ = (q) => document.querySelector(q);
const grid = $('#productGrid');
let selectedCategory = '';
let selectedProduct = null;
const baht = (n) => `฿${new Intl.NumberFormat('th-TH').format(n)}`;
const productNameOf = product => product.productName ?? product.name ?? '';
const priceOf = product => product.pricePerDay ?? product.dailyPrice;
const sellerOf = product => product.sellerName ?? product.shop ?? '';
const imageOf = product => product.imageUrl ?? product.image ?? '';
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
function renderProductCard(product) {
  const productName = productNameOf(product);
  const sellerName = sellerOf(product);
  const pricePerDay = priceOf(product);
  const imageUrl = imageOf(product);
  const hasRating = product.rating !== undefined && product.rating !== null && Number.isFinite(Number(product.rating));
  const hasReviewCount = product.reviewCount !== undefined && product.reviewCount !== null && Number.isFinite(Number(product.reviewCount));
  const rating = hasRating && hasReviewCount
    ? `<span>${escapeHTML(product.rating)}</span><span class="product-review-count">${escapeHTML(product.reviewCount)} reviews</span>`
    : '<span class="product-review-count">ยังไม่มีรีวิว</span>';
  const name = escapeHTML(productName);
  return `<article class="product-card">
    <div class="product-image"><img src="${escapeHTML(imageUrl)}" alt="${name}" loading="lazy">
      <button class="save-btn" type="button" data-save="${escapeHTML(product.id)}" aria-label="บันทึก ${name}" aria-pressed="false" title="บันทึกรายการนี้">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
      </button>
    </div>
    <div class="product-info">
      <h3>${name}</h3><span class="shop-name">${escapeHTML(sellerName)}</span>
      <div class="product-rating" role="img" aria-label="${hasRating && hasReviewCount ? `Rating ${escapeHTML(product.rating)} out of 5, ${escapeHTML(product.reviewCount)} reviews` : 'ยังไม่มีคะแนนรีวิว'}">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 1.8 2.5 5.1 5.7.8-4.1 4 .9 5.7-5-2.7-5 2.7.9-5.7-4.1-4 5.7-.8L10 1.8Z"/></svg>${rating}
      </div>
      <div class="product-bottom"><span class="price">${baht(pricePerDay)} <small>/ วัน</small></span>
        <button class="product-see-more" type="button" data-view="${escapeHTML(product.id)}" aria-label="See more about ${name}">See more
          <span class="product-see-more-icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 10h11m-4-4 4 4-4 4"/></svg></span>
        </button>
      </div>
    </div>
  </article>`;
}
function renderProducts() {
  let list = products.filter(p => (!selectedCategory || p.category === selectedCategory) && (!$('#areaFilter').value || p.area === $('#areaFilter').value) && productNameOf(p).toLowerCase().includes($('#searchInput').value.trim().toLowerCase()));
  if ($('#sortFilter').value === 'low') list.sort((a,b)=>priceOf(a)-priceOf(b));
  if ($('#sortFilter').value === 'high') list.sort((a,b)=>priceOf(b)-priceOf(a));
  grid.innerHTML = list.length ? list.map(renderProductCard).join('') : '<p class="empty">ไม่พบสินค้าที่ตรงกับการค้นหา ลองเปลี่ยนตัวกรองดูนะ</p>';
}
function openProduct(p) {
  p = { ...p, name: productNameOf(p), shop: sellerOf(p), dailyPrice: priceOf(p), image: imageOf(p) };
  selectedProduct = p;
  $('#productDetail').innerHTML = `<img class="detail-image" src="${p.image}" alt="${p.name}"><div class="detail-content"><span class="shop-name">${p.shop} · ${p.area}</span><h2>${p.name}</h2><div class="detail-meta"><span>${baht(p.dailyPrice)} / วัน</span><span>มัดจำ ${baht(p.deposit)}</span></div><p>${p.description}</p><p><b>เงื่อนไข:</b> ตรวจสภาพสินค้าร่วมกับร้านก่อนรับคืน เงินมัดจำเป็นจำนวนตัวอย่างและตกลงกับร้านค้า</p><button class="btn btn-dark" id="goBooking">เลือกวันและส่งคำขอ →</button></div>`;
  $('#productDialog').showModal();
  $('#goBooking').onclick = () => { $('#productDialog').close(); openBooking(p); };
}
function openBooking(p) {
  selectedProduct = p;
  const today = new Date(); const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const after = new Date(today); after.setDate(today.getDate()+4);
  $('#bookingContent').innerHTML = `<div class="eyebrow">DEMO BOOKING</div><h2 style="font-family:Georgia;font-weight:400">ส่งคำขอจอง</h2><p class="shop-name">${p.name} · ${p.shop}</p><div class="booking-form"><label>วันรับสินค้า<input id="startDate" type="date" min="${iso(today)}" value="${iso(tomorrow)}"></label><label>วันคืนสินค้า<input id="endDate" type="date" min="${iso(today)}" value="${iso(after)}"></label><label class="check wide"><input id="protection" type="checkbox"> เพิ่ม Damage Protection (5% ของค่าเช่า)</label><div class="quote wide" id="priceQuote"></div><p class="disclaimer wide">DEMO ONLY · ยังไม่มีการตรวจสอบวันว่างหรือบันทึกการจองในฐานข้อมูล การชำระเงินจำลองไม่มีการตัดเงินจริง</p><button class="btn btn-dark wide" id="submitBooking">ดูสรุป Demo Checkout →</button></div>`;
  $('#bookingDialog').showModal();
  const update = () => {
    try {
      const days = rentalDaysBetween($('#startDate').value, $('#endDate').value);
      const q = calculatePricing({dailyPrice:p.dailyPrice,rentalDays:days,deposit:p.deposit,protectionSelected:$('#protection').checked});
      $('#priceQuote').innerHTML = `ค่าเช่า ${days} วัน <b>${baht(q.rentalTotal/100)}</b><br>Damage Protection <b>${baht(q.protectionFee/100)}</b><br>เงินมัดจำ <b>${baht(q.deposit/100)}</b><br><strong>ยอดชำระจำลอง</strong> <b>${baht(q.totalDue/100)}</b>`;
      $('#submitBooking').disabled = false; $('#submitBooking').textContent = 'ดูสรุป Demo Checkout →';
    } catch { $('#priceQuote').textContent = 'กรุณาเลือกวันคืนหลังวันรับสินค้า'; $('#submitBooking').disabled = true; }
  };
  $('#startDate').onchange = update; $('#endDate').onchange = update; $('#protection').onchange = update; update();
  $('#submitBooking').onclick = () => {
    const days = rentalDaysBetween($('#startDate').value, $('#endDate').value);
    const q = calculatePricing({dailyPrice:p.dailyPrice,rentalDays:days,deposit:p.deposit,protectionSelected:$('#protection').checked});
    $('#bookingContent').innerHTML = `<div class="eyebrow">DEMO CHECKOUT</div><h2 style="font-family:Georgia;font-weight:400">สรุปยอดชำระ</h2><p>${p.name} · ${days} วัน</p><div class="quote">ค่าเช่า <b>${baht(q.rentalTotal/100)}</b><br>Protection <b>${baht(q.protectionFee/100)}</b><br>มัดจำ (คืนตามเงื่อนไขร้าน) <b>${baht(q.deposit/100)}</b><br>Commission 12% (หักจากผู้ให้เช่า) <b>${baht(q.platformFee/100)}</b><br>กองทุนชุมชน (รวมใน Commission) <b>${baht(q.communityFund/100)}</b><hr><strong>ยอดรวม (ไม่มีการตัดเงินจริง)</strong> <b>${baht(q.totalDue/100)}</b></div><p class="disclaimer">การจองยังไม่ถูกส่งหรือบันทึก ขณะนี้ Backend/Supabase ยังไม่ได้ตั้งค่า จึงไม่สามารถยืนยันวันว่างและสร้างรายการจองจริงได้</p><button class="btn btn-dark" data-close>รับทราบ</button>`;
    $('#bookingContent [data-close]').onclick = () => $('#bookingDialog').close();
  };
}
grid.addEventListener('click', e => {
  const save = e.target.closest('[data-save]');
  if (save) {
    const product = products.find(item => item.id === save.dataset.save);
    const isSaved = save.getAttribute('aria-pressed') === 'true';
    product?.onFavoriteClick?.(product, e);
    save.setAttribute('aria-pressed', String(!isSaved));
    save.title = isSaved ? 'บันทึกรายการนี้' : 'นำออกจากรายการที่บันทึก';
    return;
  }
  const b=e.target.closest('[data-view]');
  if (b) {
    const product = products.find(item => item.id === b.dataset.view);
    if (product?.onSeeMoreClick) product.onSeeMoreClick(product, e);
    else if (product) openProduct(product);
  }
});
$('#searchInput').oninput = renderProducts; $('#searchBtn').onclick = renderProducts; $('#areaFilter').onchange = renderProducts; $('#sortFilter').onchange = renderProducts;
document.querySelectorAll('[data-category]').forEach(b => b.onclick=()=>{selectedCategory=b.dataset.category;document.querySelectorAll('.filter-pill').forEach(x=>x.classList.toggle('active',x.dataset.category===selectedCategory));$('#catalog').scrollIntoView();renderProducts();});
$('#showAllBtn').onclick = () => {selectedCategory='';$('#areaFilter').value='';$('#searchInput').value='';document.querySelectorAll('.filter-pill').forEach(x=>x.classList.toggle('active',!x.dataset.category));renderProducts();};
$('#loginBtn').onclick = $('#joinBtn').onclick = () => $('#authDialog').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
const menuButton = $('.menu-btn');
menuButton.onclick = () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
  $('.topbar').classList.toggle('nav-open', open);
};
$('.topbar nav').addEventListener('click', event => {
  if (event.target.closest('a')) {
    $('.topbar').classList.remove('nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'เปิดเมนู');
  }
});
const navLinks = [...document.querySelectorAll('.topbar nav a[href^="#"]')];
const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
function markCurrentSection() {
  const marker = 112;
  const current = navSections.find(section => {
    const rect = section.getBoundingClientRect();
    return rect.top <= marker && rect.bottom > marker;
  }) || navSections.filter(section => section.getBoundingClientRect().top > marker)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  navLinks.forEach(link => {
    const active = current && link.hash === `#${current.id}`;
    link.classList.toggle('is-active', Boolean(active));
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
const sectionObserver = new IntersectionObserver(markCurrentSection, {
  rootMargin: '-80px 0px -72% 0px',
  threshold: 0,
});
navSections.forEach(section => sectionObserver.observe(section));
window.addEventListener('resize', markCurrentSection, { passive: true });
markCurrentSection();
$('#avgRent').oninput = $('#orders').oninput = () => {const avg=Number($('#avgRent').value),orders=Number($('#orders').value);$('#avgValue').textContent=baht(avg);$('#ordersValue').textContent=orders;$('#monthlyRevenue').textContent=baht(Math.round(avg*orders*.12));};
$('#matchBtn').onclick = () => {
  const query=$('#tripInput').value.trim(); const result=$('#matchResults');
  if(!query){$('#matcherStatus').textContent='กรุณาพิมพ์แผนทริปก่อน';return;}
  const cats=/ไทย|วัดอรุณ|เยาวราช/.test(query)?['thai_dress','camera']:['camping','camera'];
  const matches=products.filter(p=>cats.includes(p.category)).slice(0,3);
  result.hidden=false; result.innerHTML=matches.map(p=>`<div class="match-item"><b>${p.name}</b><p>${p.description}</p><span>${baht(p.dailyPrice)} / วัน</span><br><button data-match="${p.id}" class="text-link" style="border:0;background:none;padding:8px 0">ดูสินค้า →</button></div>`).join('');
  $('#matcherStatus').textContent='DEMO FALLBACK · แนะนำจากสินค้าที่มีอยู่จริงในตัวอย่าง';
  result.querySelectorAll('[data-match]').forEach(b=>b.onclick=()=>{document.querySelector('#catalog').scrollIntoView();openProduct(products.find(p=>p.id===b.dataset.match));});
};
$('#avgRent').dispatchEvent(new Event('input'));renderProducts();initMagneticButtons();initFaqAnimations();
