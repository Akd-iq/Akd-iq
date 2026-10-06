// ==========================================
// 1. تهيئة Firebase وتوصيله بقاعدة البيانات
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDSndzHIgUUtC3FNPsVtLefdTJh5nIdXc",
  authDomain: "akkad-store-1cddb.firebaseapp.com",
  databaseURL: "https://akkad-store-1cddb-default-rtdb.firebaseio.com",
  projectId: "akkad-store-1cddb",
  storageBucket: "akkad-store-1cddb.firebasestorage.app",
  messagingSenderId: "813536865622",
  appId: "1:813536865622:web:36d4fe48208cd654eafaf7"
};

// تشغيل Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 2. المتغيرات العامة للمتجر
// ==========================================
var isAdmin = false;
var ADMIN_PASSWORD = "0";

var categories = [];
var products = [];
var services = [];
var features = [];
var contacts = [];
var reviews = [];
var bannerData = { text: "🎉 أهلاً بكم في متجر أكد!", img: "" };

var activeCatId = null;
var activeTradeFilter = 'all';

// ==========================================
// 3. الاستماع اللحظي للبيانات من Firebase
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // تطبيق الثيم المحفوظ
    applyTheme(currentTheme);

    // جلب الأقسام
    database.ref('categories').on('value', function(snapshot) {
        var data = snapshot.val();
        if (data) {
            categories = Array.isArray(data) ? data : Object.values(data);
        } else {
            // بيانات افتراضية أول مرة فقط
            categories = [
                { id: 1, name: 'الهواتف الذكية', type: 'trade' },
                { id: 2, name: 'تقديم الاستمارات أونلاين', type: 'service' }
            ];
            database.ref('categories').set(categories);
        }
        if (!activeCatId && categories.length > 0) activeCatId = categories[0].id;
        renderCategoryTabs();
        renderActiveCategoryContent();
    });

    // جلب المنتجات
    database.ref('products').on('value', function(snapshot) {
        var data = snapshot.val();
        products = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        renderActiveCategoryContent();
    });

    // جلب الخدمات
    database.ref('services').on('value', function(snapshot) {
        var data = snapshot.val();
        services = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        renderActiveCategoryContent();
    });

    // جلب المميزات
    database.ref('features').on('value', function(snapshot) {
        var data = snapshot.val();
        features = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        renderFeatures();
    });

    // جلب وسائل التواصل
    database.ref('contacts').on('value', function(snapshot) {
        var data = snapshot.val();
        contacts = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        renderContacts();
    });

    // جلب التقييمات
    database.ref('reviews').on('value', function(snapshot) {
        var data = snapshot.val();
        reviews = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        renderReviews();
    });

    // جلب الشريط الإعلاني
    database.ref('banner').on('value', function(snapshot) {
        var data = snapshot.val();
        if (data) bannerData = data;
        renderBanner();
    });

    updateCartUI();
});

// ==========================================
// 4. وضع المالك والتحكم
// ==========================================
function toggleMode() {
    if (!isAdmin) {
        var pwd = prompt("أدخل كلمة مرور المالك:");
        if (pwd === ADMIN_PASSWORD) {
            isAdmin = true;
            document.body.classList.add('admin-mode');
            var adminBanner = document.getElementById('admin-banner');
            var modeBtn = document.getElementById('mode-toggle-btn');
            if (adminBanner) adminBanner.style.display = 'flex';
            if (modeBtn) modeBtn.style.display = 'none';
        } else if (pwd !== null) {
            alert("كلمة المرور غير صحيحة!");
        }
    } else {
        isAdmin = false;
        document.body.classList.remove('admin-mode');
        var adminBanner = document.getElementById('admin-banner');
        var modeBtn = document.getElementById('mode-toggle-btn');
        if (adminBanner) adminBanner.style.display = 'none';
        if (modeBtn) modeBtn.style.display = 'inline-block';
    }
    renderAll();
}

function renderAll() {
    renderBanner();
    renderCategoryTabs();
    renderActiveCategoryContent();
    renderFeatures();
    renderContacts();
    renderReviews();
}

// ==========================================
// 5. عرض ومعالجة الأقسام والمنتجات والخدمات
// ==========================================
function renderCategoryTabs() {
    var tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    var html = '';
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var delBtn = isAdmin ? '<i class="fa-solid fa-circle-xmark admin-only" onclick="deleteCategory(' + cat.id + ')" style="color:red; cursor:pointer; position:absolute; top:-5px; left:-5px;"></i>' : '';
        var activeClass = (cat.id === activeCatId) ? 'active' : '';
        html += '<div style="display:inline-block; position:relative; margin: 3px;"><button class="tab-btn ' + activeClass + '" onclick="switchCategory(' + cat.id + ')">' + escapeHtml(cat.name) + '</button>' + delBtn + '</div>';
    }
    tabsContainer.innerHTML = html;
}

function switchCategory(catId) {
    activeCatId = catId;
    activeTradeFilter = 'all';
    renderCategoryTabs();
    renderActiveCategoryContent();
}

function renderActiveCategoryContent() {
    var contentArea = document.getElementById('category-content-area');
    if (!contentArea) return;

    var cat = null;
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].id === activeCatId) {
            cat = categories[i];
            break;
        }
    }

    if (!cat) {
        contentArea.innerHTML = "<p style='text-align:center;'>لا توجد أقسام حالياً.</p>";
        return;
    }

    var storeWhatsappNumber = "07817711454"; 

    if (cat.type === 'trade') {
        var prodsHTML = '';
        for (var j = 0; j < products.length; j++) {
            var p = products[j];
            if (p.catId === cat.id && (activeTradeFilter === 'all' || p.status === activeTradeFilter)) {
                var delBtn = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteProduct(' + p.id + ')">حذف المادة</button>' : '';
                var statusText = (p.status === 'new') ? 'جديد' : 'مستخدم';
                var imgSrc = p.img || 'logo.jpg';

                var orderMsg = encodeURIComponent("مرحباً متجر أكد، أريد شراء المنتج التالية تفاصيله:\n- المنتج: " + p.title + "\n- السعر: " + p.price);
                var whatsappOrderLink = "https://wa.me/" + storeWhatsappNumber + "?text=" + orderMsg;

                prodsHTML += '<div class="card">' +
                    '<span class="badge ' + p.status + '">' + statusText + '</span>' +
                    '<img src="' + imgSrc + '" alt="' + escapeHtml(p.title) + '">' +
                    '<div class="card-title">' + escapeHtml(p.title) + '</div>' +
                    '<div class="card-price">' + escapeHtml(p.price) + '</div>' +
                    '<div class="card-desc">' + escapeHtml(p.desc) + '</div>' +
                    '<div class="card-actions-wrapper">' +
                        '<a href="' + whatsappOrderLink + '" target="_blank" class="order-btn" style="flex: 2;"><i class="fa-brands fa-whatsapp"></i> طلب الآن</a>' +
                        '<button onclick="addToCart(\'' + escapeJsString(p.title) + '\', \'' + escapeJsString(p.price) + '\')" class="sub-action-btn" title="إضافة للسلة"><i class="fa-solid fa-cart-plus"></i> السلة</button>' +
                        '<button onclick="shareItem(\'' + escapeJsString(p.title) + '\', \'' + escapeJsString(p.price) + '\')" class="sub-action-btn" title="مشاركة"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>' +
                    '</div>' +
                    delBtn +
                '</div>';
            }
        }

        var btnAll = (activeTradeFilter === 'all') ? 'active' : '';
        var btnNew = (activeTradeFilter === 'new') ? 'active' : '';
        var btnUsed = (activeTradeFilter === 'used') ? 'active' : '';

        contentArea.innerHTML = '<div class="sub-filters"><button class="sub-btn ' + btnAll + '" onclick="setTradeFilter(\'all\')">الكل</button><button class="sub-btn ' + btnNew + '" onclick="setTradeFilter(\'new\')">جديد</button><button class="sub-btn ' + btnUsed + '" onclick="setTradeFilter(\'used\')">مستخدم</button></div><button class="admin-only add-cat-btn" style="margin: 0 auto 20px; display:block;" onclick="openAddProductModal(' + cat.id + ')"><i class="fa-solid fa-plus"></i> نشر مادة في هذا القسم</button><div class="products-grid">' + prodsHTML + '</div>';
    } else {
        var servsHTML = '';
        for (var k = 0; k < services.length; k++) {
            var s = services[k];
            if (s.catId === cat.id) {
                var link = s.linkVal;
                if (s.linkType === 'whatsapp') {
                    link = 'https://wa.me/' + s.linkVal + '?text=' + encodeURIComponent('مرحباً، أريد التقديم على ' + s.title);
                }
                
                var actionBtnText = (s.btnText && s.btnText.trim() !== "") ? s.btnText : "تقديم الآن";
                var delBtnServ = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteService(' + s.id + ')">حذف الخدمة</button>' : '';
                var editBtnText = isAdmin ? '<button class="admin-only" onclick="editServiceBtnText(' + s.id + ')" style="margin-top: 5px; background: #0284c7; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;"><i class="fa-solid fa-pen"></i> تعديل نص الزر</button>' : '';

                servsHTML += '<div class="card">' +
                    '<div class="card-title">' + escapeHtml(s.title) + '</div>' +
                    '<div class="card-desc">' + escapeHtml(s.desc) + '</div>' +
                    '<div class="card-actions-wrapper">' +
                        '<a href="' + link + '" target="_blank" class="action-btn" style="flex: 2;">' + escapeHtml(actionBtnText) + '</a>' +
                        '<button onclick="addToCart(\'' + escapeJsString(s.title) + '\', \'حسب الخدمة\')" class="sub-action-btn" title="إضافة للسلة"><i class="fa-solid fa-cart-plus"></i> السلة</button>' +
                        '<button onclick="shareItem(\'' + escapeJsString(s.title) + '\', \'خدمة إلكترونية\')" class="sub-action-btn" title="مشاركة"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>' +
                    '</div>' +
                    editBtnText +
                    delBtnServ +
                '</div>';
            }
        }

        contentArea.innerHTML = '<button class="admin-only add-cat-btn" style="margin: 0 auto 20px; display:block;" onclick="openAddServiceModal(' + cat.id + ')"><i class="fa-solid fa-plus"></i> إضافة خدمة لهذا القسم</button><div class="services-grid">' + servsHTML + '</div>';
    }
}

function setTradeFilter(filter) {
    activeTradeFilter = filter;
    renderActiveCategoryContent();
}

function editServiceBtnText(serviceId) {
    var serviceIndex = -1;
    for (var i = 0; i < services.length; i++) {
        if (services[i].id === serviceId) {
            serviceIndex = i;
            break;
        }
    }

    if (serviceIndex !== -1) {
        var currentText = services[serviceIndex].btnText || "تقديم الآن";
        var newText = prompt("أدخل الكلمة الجديدة للزر (مثل: قدم، احصل على الخدمة، قدم الآن...):", currentText);
        if (newText !== null && newText.trim() !== "") {
            services[serviceIndex].btnText = newText.trim();
            database.ref('services').set(services);
            showToast("تم تحديث نص الزر بنجاح! ✨");
        }
    }
}

// ==========================================
// 6. الإضافة والحذف السحابي (Firebase)
// ==========================================
function handleAddCategory(e) {
    e.preventDefault();
    var nameEl = document.getElementById('cat-name');
    var typeEl = document.getElementById('cat-type');
    
    var newCat = {
        id: Date.now(),
        name: nameEl.value.trim(),
        type: typeEl.value
    };
    categories.push(newCat);
    database.ref('categories').set(categories);
    activeCatId = newCat.id;
    nameEl.value = '';
    closeModal('add-category-modal');
}

function openAddProductModal(catId) {
    document.getElementById('prod-cat-id').value = catId;
    openModal('add-product-modal');
}

function handleAddProduct(e) {
    e.preventDefault();
    var newProd = {
        id: Date.now(),
        catId: parseInt(document.getElementById('prod-cat-id').value),
        status: document.getElementById('prod-status').value,
        title: document.getElementById('prod-title').value.trim(),
        price: document.getElementById('prod-price').value.trim(),
        img: document.getElementById('prod-img').value.trim() || 'logo.jpg',
        desc: document.getElementById('prod-desc').value.trim()
    };
    products.push(newProd);
    database.ref('products').set(products);
    closeModal('add-product-modal');
}

function openAddServiceModal(catId) {
    document.getElementById('serv-cat-id').value = catId;
    openModal('add-service-modal');
}

function handleAddService(e) {
    e.preventDefault();
    var btnTextEl = document.getElementById('serv-btn-text');
    var customBtnText = (btnTextEl && btnTextEl.value.trim() !== "") ? btnTextEl.value.trim() : "تقديم الآن";

    var newServ = {
        id: Date.now(),
        catId: parseInt(document.getElementById('serv-cat-id').value),
        title: document.getElementById('serv-title').value.trim(),
        desc: document.getElementById('serv-desc').value.trim(),
        linkType: document.getElementById('serv-link-type').value,
        linkVal: document.getElementById('serv-link-value').value.trim(),
        btnText: customBtnText
    };
    services.push(newServ);
    database.ref('services').set(services);
    closeModal('add-service-modal');
}

function handleAddFeature(e) {
    e.preventDefault();
    features.push({
        id: Date.now(),
        title: document.getElementById('feat-title').value.trim(),
        desc: document.getElementById('feat-desc').value.trim()
    });
    database.ref('features').set(features);
    closeModal('add-feature-modal');
}

function handleAddContact(e) {
    e.preventDefault();
    contacts.push({
        id: Date.now(),
        platform: document.getElementById('cont-platform').value,
        label: document.getElementById('cont-label').value.trim(),
        url: document.getElementById('cont-url').value.trim()
    });
    database.ref('contacts').set(contacts);
    closeModal('add-contact-modal');
}

function deleteCategory(id) {
    if (confirm("هل أنت تأكد من حذف هذا القسم بكافة محتوياته؟")) {
        categories = categories.filter(function(c) { return String(c.id) !== String(id); });
        database.ref('categories').set(categories);
        activeCatId = categories.length > 0 ? categories[0].id : null;
    }
}

function deleteProduct(id) {
    products = products.filter(function(p) { return String(p.id) !== String(id); });
    database.ref('products').set(products);
}

function deleteService(id) {
    services = services.filter(function(s) { return String(s.id) !== String(id); });
    database.ref('services').set(services);
}

function deleteFeature(id) {
    features = features.filter(function(f) { return String(f.id) !== String(id); });
    database.ref('features').set(features);
}

function deleteContact(id) {
    contacts = contacts.filter(function(c) { return String(c.id) !== String(id); });
    database.ref('contacts').set(contacts);
}

// ==========================================
// 7. باقي أقسام الصفحة (مميزات، تواصل، تقييمات، إعلان)
// ==========================================
function renderFeatures() {
    var grid = document.getElementById('features-grid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < features.length; i++) {
        var f = features[i];
        var delBtn = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteFeature(' + f.id + ')">حذف</button>' : '';
        html += '<div class="card"><div class="card-title">' + escapeHtml(f.title) + '</div><div class="card-desc">' + escapeHtml(f.desc) + '</div>' + delBtn + '</div>';
    }
    grid.innerHTML = html;
}

function renderContacts() {
    var grid = document.getElementById('contact-grid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < contacts.length; i++) {
        var c = contacts[i];
        var delBtn = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteContact(' + c.id + ')">حذف</button>' : '';
        html += '<div class="card" style="text-align:center;"><div class="card-title">' + escapeHtml(c.label) + '</div><a href="' + c.url + '" target="_blank" class="action-btn" style="background:var(--dark-bg);">تواصل عبر ' + escapeHtml(c.platform) + '</a>' + delBtn + '</div>';
    }
    grid.innerHTML = html;
}

function renderReviews() {
    var grid = document.getElementById('reviews-grid');
    if (!grid) return;
    var html = '';
    for (var i = 0; i < reviews.length; i++) {
        var r = reviews[i];
        var starsHTML = '⭐'.repeat(r.rating);
        var delBtn = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteReview(' + r.id + ')" style="margin-top:10px;">حذف التقييم</button>' : '';

        html += '<div class="review-card">' +
            '<div>' +
                '<div class="review-header">' +
                    '<span class="review-author">' + escapeHtml(r.name) + '</span>' +
                    '<span class="review-stars">' + starsHTML + '</span>' +
                '</div>' +
                '<div class="review-body">"' + escapeHtml(r.text) + '"</div>' +
            '</div>' +
            delBtn +
        '</div>';
    }
    grid.innerHTML = html;
}

function handleSaveReview(e) {
    e.preventDefault();
    var newReview = {
        id: Date.now(),
        name: document.getElementById('review-name').value.trim(),
        rating: parseInt(document.getElementById('review-rating').value),
        text: document.getElementById('review-text').value.trim()
    };
    reviews.push(newReview);
    database.ref('reviews').set(reviews);
    closeModal('add-review-modal');
}

function deleteReview(id) {
    if (confirm("هل أنت تأكد من حذف هذا التقييم؟")) {
        reviews = reviews.filter(function(r) { return String(r.id) !== String(id); });
        database.ref('reviews').set(reviews);
    }
}

function renderBanner() {
    var textEl = document.getElementById('banner-text');
    var imgEl = document.getElementById('banner-img');
    if (textEl) textEl.innerText = bannerData.text;
    if (imgEl) {
        if (bannerData.img && bannerData.img.trim() !== '') {
            imgEl.src = bannerData.img;
            imgEl.style.display = 'inline-block';
        } else {
            imgEl.style.display = 'none';
        }
    }
}

function handleSaveBanner(e) {
    e.preventDefault();
    bannerData.text = document.getElementById('input-banner-text').value.trim();
    var fileInput = document.getElementById('input-banner-file');
    
    if (fileInput.files && fileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(event) {
            bannerData.img = event.target.result;
            database.ref('banner').set(bannerData);
            closeModal('edit-banner-modal');
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        database.ref('banner').set(bannerData);
        closeModal('edit-banner-modal');
    }
}

function removeBannerImg() {
    bannerData.img = "";
    var bannerFile = document.getElementById('input-banner-file');
    if (bannerFile) bannerFile.value = "";
    alert("تمت إزالة الصورة! اضغط على (حفظ والتحديث) لتأكيد التغيير.");
}

function openBannerModal() {
    document.getElementById('input-banner-text').value = bannerData.text;
    document.getElementById('input-banner-file').value = "";
    openModal('edit-banner-modal');
}

function closeBanner() {
    var banner = document.getElementById('announcement-banner');
    if (banner) banner.style.display = 'none';
}

// ==========================================
// 8. النوافذ، السلة، البحث، والخدمات الإضافية
// ==========================================
function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function openAddReviewModal() {
    document.getElementById('review-name').value = '';
    document.getElementById('review-text').value = '';
    openModal('add-review-modal');
}

var cart = JSON.parse(localStorage.getItem('akkad_cart')) || [];

function addToCart(title, price) {
    cart.push({ title: title, price: price });
    localStorage.setItem('akkad_cart', JSON.stringify(cart));
    updateCartUI();
    showToast("🛒 تمت إضافة (" + title + ") إلى السلة بنجاح!");
}

function updateCartUI() {
    var countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cart.length;

    var listEl = document.getElementById('cart-items-list');
    var totalEl = document.getElementById('cart-total-price');

    if (!listEl) return;

    if (cart.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; color:#888;">السلة فارغة حالياً</p>';
        if (totalEl) totalEl.innerText = '0 د.ع';
        return;
    }

    var html = '';
    var total = 0;

    for (var i = 0; i < cart.length; i++) {
        html += '<div class="cart-item">' +
            '<span>' + escapeHtml(cart[i].title) + '</span>' +
            '<div>' +
                '<strong style="margin-left: 10px;">' + escapeHtml(cart[i].price) + '</strong>' +
                '<button onclick="removeFromCart(' + i + ')" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>' +
            '</div>' +
        '</div>';
        var numericPrice = parseInt(cart[i].price.replace(/[^0-9]/g, '')) || 0;
        total += numericPrice;
    }

    listEl.innerHTML = html;
    if (totalEl) totalEl.innerText = total > 0 ? total.toLocaleString() + ' د.ع' : 'حسب الاتفاق';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('akkad_cart', JSON.stringify(cart));
    updateCartUI();
}

function clearCart() {
    if (confirm("هل تريد تفريغ السلة؟")) {
        cart = [];
        localStorage.setItem('akkad_cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function openCartModal() {
    updateCartUI();
    openModal('cart-modal');
}

function sendCartToWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }

    var phone = "9647817711454";
    var message = "السلام عليكم متجر أكد، أرغب بطلب الخدمات/المنتجات التالية:\n\n";

    for (var i = 0; i < cart.length; i++) {
        message += (i + 1) + ". " + cart[i].title + " - " + cart[i].price + "\n";
    }

    message += "\nيرجى تأكيد الطلب وتزويدي بالتفاصيل.";
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(message), '_blank');
}

// الثيم والوضع الليلي
var currentTheme = localStorage.getItem('akkad_theme') || 'light';

function toggleTheme() {
    currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('akkad_theme', currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    var icon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (icon) icon.className = 'fa-solid fa-sun';
    } else {
        document.body.classList.remove('dark-theme');
        if (icon) icon.className = 'fa-solid fa-moon';
    }
}

function filterProductsAndServices() {
    var searchInput = document.getElementById('store-search-input');
    var clearBtn = document.getElementById('clear-search-btn');
    if (!searchInput) return;

    var query = searchInput.value.trim().toLowerCase();

    if (clearBtn) clearBtn.style.display = query.length > 0 ? 'inline-block' : 'none';

    var cards = document.querySelectorAll('.card, .product-card, .service-card');
    cards.forEach(function(card) {
        var cardText = card.innerText.toLowerCase();
        card.style.display = cardText.includes(query) ? '' : 'none';
    });
}

function clearSearchInput() {
    var searchInput = document.getElementById('store-search-input');
    if (searchInput) {
        searchInput.value = '';
        filterProductsAndServices();
    }
}

function shareItem(title, price) {
    var shareText = "شاهد هذا المنتج/الخدمة من متجر أكد:\n📌 " + title + "\n💰 السعر: " + price;
    var currentUrl = window.location.href;

    if (navigator.share) {
        navigator.share({ title: title, text: shareText, url: currentUrl }).catch(function() {});
    } else {
        var fullMessage = shareText + "\n🔗 " + currentUrl;
        var choice = prompt("1️⃣ واتساب\n2️⃣ تليجرام\n3️⃣ نسخ النص\nاكتب رقم الخيار:", "1");
        if (choice === "1") window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(fullMessage), '_blank');
        else if (choice === "2") window.open("https://t.me/share/url?url=" + encodeURIComponent(currentUrl) + "&text=" + encodeURIComponent(shareText), '_blank');
        else if (choice === "3") {
            navigator.clipboard.writeText(fullMessage).then(function() { showToast("📋 تم نسخ النص والرابط بنجاح!"); });
        }
    }
}

function showToast(message) {
    var toast = document.getElementById("toast-notification");
    if (!toast) return;
    toast.innerText = message;
    toast.className = "toast show";
    setTimeout(function() { toast.className = toast.className.replace("toast show", "toast"); }, 3000);
}

window.addEventListener('scroll', function() {
    var scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollTopBtn) {
        if (window.scrollY > 300) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// البوت والرد الآلي
function toggleChatWindow() {
    var win = document.getElementById('chat-window');
    if (win) win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'flex' : 'none';
}

function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

function sendMessage() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user-msg');
    input.value = '';
    setTimeout(function() {
        appendMessage(getAutoReply(text), 'bot-msg');
    }, 500);
}

function appendMessage(text, className) {
    var messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;
    var msgEl = document.createElement('div');
    msgEl.className = 'msg ' + className;
    msgEl.innerText = text;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getAutoReply(userMessage) {
    var msg = userMessage.toLowerCase();
    if (msg.indexOf('سعر') !== -1 || msg.indexOf('أسعار') !== -1 || msg.indexOf('بكم') !== -1) return "جميع أسعار المنتجات والخدمات معروضة بدقة في الأقسام أعلاه.";
    if (msg.indexOf('تواصل') !== -1 || msg.indexOf('واتساب') !== -1 || msg.indexOf('رقم') !== -1) return "يمكنك مراسلتنا مباشرة عبر الواتساب من قسم التواصل.";
    if (msg.indexOf('سلام') !== -1 || msg.indexOf('مرحبا') !== -1 || msg.indexOf('هلا') !== -1) return "أهلاً وسهلاً بك في متجر أكد! كيف يمكننا مساعدتك اليوم؟";
    return "شكراً لتواصلك مع متجر أكد! لمزيد من التفاصيل يرجى مراسلتنا عبر الواتساب.";
}

function sendQuickReply(text) {
    appendMessage(text, 'user-msg');
    setTimeout(function() { appendMessage(getAutoReply(text), 'bot-msg'); }, 400);
}

// ==========================================
// 9. دواء الحماية والتعقيم للرموز والحروف
// ==========================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJsString(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
