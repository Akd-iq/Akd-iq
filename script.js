var isAdmin = false;
var ADMIN_PASSWORD = "0";

var categories = JSON.parse(localStorage.getItem('akkad_categories')) || [
    { id: 1, name: 'الهواتف الذكية', type: 'trade' },
    { id: 2, name: 'تقديم الاستمارات أونلاين', type: 'service' }
];

var products = JSON.parse(localStorage.getItem('akkad_products')) || [
    { id: 101, catId: 1, status: 'new', title: 'آيفون 15 بروماكس', price: '1,450,000 د.ع', img: 'logo.jpg', desc: 'ذاكرة 256GB - جديد بالباكيت مع ضمان لمدة سنة.' },
    { id: 102, catId: 1, status: 'used', title: 'سامسونج S22 ألترا', price: '680,000 د.ع', img: 'logo.jpg', desc: 'مستخدم بحالة ممتازة جداً بدون أي خدش، ذاكرة 256GB.' }
];

var services = JSON.parse(localStorage.getItem('akkad_services')) || [
    { id: 201, catId: 2, title: 'التقديم على القبول المركزي', desc: 'ملء استمارات التقديم للجامعات والمعاهد بدقة عالية.', linkType: 'whatsapp', linkVal: '009647000000000' }
];

var features = JSON.parse(localStorage.getItem('akkad_features')) || [
    { id: 1, title: 'سرعة ودقة عالية', desc: 'ننجز معاملتك واستمارتك بأقصى سرعة ممكنة وبدقة متناهية.' },
    { id: 2, title: 'ضمان وموثوقية', desc: 'كافة منتجاتنا أصلية 100% ومعتمدة مع الضمان.' }
];

var contacts = JSON.parse(localStorage.getItem('akkad_contacts')) || [
    { id: 1, platform: 'whatsapp', label: 'واتساب المالك', url: 'https://wa.me/009647000000000' },
    { id: 2, platform: 'facebook', label: 'صفحتنا على الفيسبوك', url: 'https://facebook.com' }
];

var activeCatId = categories.length > 0 ? categories[0].id : null;
var activeTradeFilter = 'all';


var reviews = JSON.parse(localStorage.getItem('akkad_reviews')) || [];

var statsData = JSON.parse(localStorage.getItem('akkad_stats')) || {
    orders: "1200+",
    services: "850+",
    clients: "3000+"
};

document.addEventListener('DOMContentLoaded', function() {
    renderAll();
});

function toggleMode() {
    if (!isAdmin) {
        var pwd = prompt("أدخل كلمة مرور المالك:");
        if (pwd === ADMIN_PASSWORD) {
            isAdmin = true;
            document.body.classList.add('admin-mode');
            document.getElementById('admin-banner').style.display = 'flex';
            document.getElementById('mode-toggle-btn').style.display = 'none';
        } else if (pwd !== null) {
            alert("كلمة المرور غير صحيحة!");
        }
    } else {
        isAdmin = false;
        document.body.classList.remove('admin-mode');
        document.getElementById('admin-banner').style.display = 'none';
        document.getElementById('mode-toggle-btn').style.display = 'inline-block';
    }
    renderAll();
}
// بيانات الشريط الإعلاني المرجعية
var bannerData = JSON.parse(localStorage.getItem('akkad_banner')) || {
    text: "🎉 أهلاً بكم في متجر أكد! يتوفر لدينا الآن التقديم الإلكتروني والتوصيل لكافة المحافظات.",
    img: ""
};
function renderAll() {
    renderBanner();
    renderCategoryTabs();
    renderActiveCategoryContent();
    renderFeatures();
    renderContacts();
    renderReviews(); // <--- أضف هذا السطر هنا
}

function renderCategoryTabs() {
    var tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    var html = '';
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var delBtn = isAdmin ? '<i class="fa-solid fa-circle-xmark admin-only" onclick="deleteCategory(' + cat.id + ')" style="color:red; cursor:pointer; position:absolute; top:-5px; left:-5px;"></i>' : '';
        var activeClass = (cat.id === activeCatId) ? 'active' : '';
        html += '<div style="display:inline-block; position:relative;"><button class="tab-btn ' + activeClass + '" onclick="switchCategory(' + cat.id + ')">' + cat.name + '</button>' + delBtn + '</div>';
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
                    '<img src="' + imgSrc + '" alt="' + p.title + '">' +
                    '<div class="card-title">' + p.title + '</div>' +
                    '<div class="card-price">' + p.price + '</div>' +
                    '<div class="card-desc">' + p.desc + '</div>' +
                    '<div class="card-actions-wrapper">' +
                        '<a href="' + whatsappOrderLink + '" target="_blank" class="order-btn" style="flex: 2;"><i class="fa-brands fa-whatsapp"></i> طلب الآن</a>' +
                        '<button onclick="addToCart(\'' + p.title + '\', \'' + p.price + '\')" class="sub-action-btn" title="إضافة للسلة"><i class="fa-solid fa-cart-plus"></i> السلة</button>' +
                        '<button onclick="shareItem(\'' + p.title + '\', \'' + p.price + '\')" class="sub-action-btn" title="مشاركة"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>' +
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
                var delBtnServ = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteService(' + s.id + ')">حذف الخدمة</button>' : '';
                
                servsHTML += '<div class="card">' +
 '<div class="card-title">' + s.title + '</div>' +
                    '<div class="card-desc">' + s.desc + '</div>' +
                    '<div class="card-actions-wrapper">' +
                        '<a href="' + link + '" target="_blank" class="action-btn" style="flex: 2;">تقديم الآن</a>' +
                        '<button onclick="addToCart(\'' + s.title + '\', \'حسب الخدمة\')" class="sub-action-btn" title="إضافة للسلة"><i class="fa-solid fa-cart-plus"></i> السلة</button>' +
                        '<button onclick="shareItem(\'' + s.title + '\', \'خدمة إلكترونية\')" class="sub-action-btn" title="مشاركة"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>' +
                    '</div>' +
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

function renderFeatures() {
    var grid = document.getElementById('features-grid');
    if (!grid) return;

    var html = '';
    for (var i = 0; i < features.length; i++) {
        var f = features[i];
        var delBtn = isAdmin ? '<button class="delete-btn admin-only" onclick="deleteFeature(' + f.id + ')">حذف</button>' : '';
        html += '<div class="card"><div class="card-title">' + f.title + '</div><div class="card-desc">' + f.desc + '</div>' + delBtn + '</div>';
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
        html += '<div class="card" style="text-align:center;"><div class="card-title">' + c.label + '</div><a href="' + c.url + '" target="_blank" class="action-btn" style="background:var(--dark-bg);">تواصل عبر ' + c.platform + '</a>' + delBtn + '</div>';
    }
    grid.innerHTML = html;
}
 function handleAddCategory(e) {
    e.preventDefault();
    var newCat = {
        id: Date.now(),
        name: document.getElementById('cat-name').value,
        type: document.getElementById('cat-type').value
    };
    categories.push(newCat);
    localStorage.setItem('akkad_categories', JSON.stringify(categories));
    activeCatId = newCat.id;
    closeModal('add-category-modal');
    renderAll();
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
        title: document.getElementById('prod-title').value,
        price: document.getElementById('prod-price').value,
        img: document.getElementById('prod-img').value || 'logo.jpg',
        desc: document.getElementById('prod-desc').value
    };
    products.push(newProd);
    localStorage.setItem('akkad_products', JSON.stringify(products));
    closeModal('add-product-modal');
    renderActiveCategoryContent();
}

function openAddServiceModal(catId) {
    document.getElementById('serv-cat-id').value = catId;
    openModal('add-service-modal');
}

function handleAddService(e) {
    e.preventDefault();
    var newServ = {
        id: Date.now(),
        catId: parseInt(document.getElementById('serv-cat-id').value),
        title: document.getElementById('serv-title').value,
        desc: document.getElementById('serv-desc').value,
        linkType: document.getElementById('serv-link-type').value,
        linkVal: document.getElementById('serv-link-value').value
    };
    services.push(newServ);
    localStorage.setItem('akkad_services', JSON.stringify(services));
    closeModal('add-service-modal');
    renderActiveCategoryContent();
}

function handleAddFeature(e) {
    e.preventDefault();
    features.push({
        id: Date.now(),
        title: document.getElementById('feat-title').value,
        desc: document.getElementById('feat-desc').value
    });
    localStorage.setItem('akkad_features', JSON.stringify(features));
    closeModal('add-feature-modal');
    renderFeatures();
}

function handleAddContact(e) {
    e.preventDefault();
    contacts.push({
        id: Date.now(),
        platform: document.getElementById('cont-platform').value,
        label: document.getElementById('cont-label').value,
        url: document.getElementById('cont-url').value
    });
    localStorage.setItem('akkad_contacts', JSON.stringify(contacts));
    closeModal('add-contact-modal');
    renderContacts();
}

function deleteCategory(id) {
    if (confirm("هل أنت تأكد من حذف هذا القسم بكافة محتوياته؟")) {
        categories = categories.filter(function(c) { return c.id !== id; });
        localStorage.setItem('akkad_categories', JSON.stringify(categories));
        activeCatId = categories.length > 0 ? categories[0].id : null;
        renderAll();
    }
}

function deleteProduct(id) {
    products = products.filter(function(p) { return p.id !== id; });
    localStorage.setItem('akkad_products', JSON.stringify(products));
    renderActiveCategoryContent();
}

function deleteService(id) {
    services = services.filter(function(s) { return s.id !== id; });
    localStorage.setItem('akkad_services', JSON.stringify(services));
    renderActiveCategoryContent();
}

function deleteFeature(id) {
    features = features.filter(function(f) { return f.id !== id; });
    localStorage.setItem('akkad_features', JSON.stringify(features));
    renderFeatures();
}

function deleteContact(id) {
    contacts = contacts.filter(function(c) { return c.id !== id; });
    localStorage.setItem('akkad_contacts', JSON.stringify(contacts));
    renderContacts();
}

function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// --- نظام الرد الآلي لمتجر أكد ---

function toggleChatWindow() {
    var win = document.getElementById('chat-window');
    if (win) {
        win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'flex' : 'none';
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user-msg');
    input.value = '';

    setTimeout(function() {
        var reply = getAutoReply(text);
        appendMessage(reply, 'bot-msg');
    }, 500);
}

function appendMessage(text, className) {
    var messagesDiv = document.getElementById('chat-messages');
    var msgEl = document.createElement('div');
    msgEl.className = 'msg ' + className;
    msgEl.innerText = text;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// هنا يمكنك تعديل وتغيير أي رد أو إضافة شروط جديدة بسهولة
function getAutoReply(userMessage) {
    var msg = userMessage.toLowerCase();

    // 1. الاستفسار عن الأسعار
    if (msg.indexOf('سعر') !== -1 || msg.indexOf('أسعار') !== -1 || msg.indexOf('بكم') !== -1 || msg.indexOf('بيش') !== -1) {
        return "جميع أسعار المنتجات والخدمات معروضة بدقة في الأقسام أعلاه.";
    } 
    
    // 2. الاستفسار عن طرق التواصل والواتساب
    else if (msg.indexOf('تواصل') !== -1 || msg.indexOf('واتساب') !== -1 || msg.indexOf('رقم') !== -1 || msg.indexOf('هاتف') !== -1) {
        return "يمكنك مراسلتنا مباشرة عبر الواتساب أو الفيسبوك من قسم (تواصل معنا) في أسفل الصفحة.";
    } 
    
    // 3. الاستفسار عن الموقع أو الفرع
    else if (msg.indexOf('موقع') !== -1 || msg.indexOf('عنوان') !== -1 || msg.indexOf('مكان') !== -1 || msg.indexOf('وين') !== -1) {
        return "خدمات متجر أكد متاحة أونلاين بالكامل مع توفر خدمة التوصيل والتقديم لكافة المحافظات.";
    } 
    
    // 4. التحية والترحيب
    else if (msg.indexOf('سلام') !== -1 || msg.indexOf('مرحبا') !== -1 || msg.indexOf('هلا') !== -1 || msg.indexOf('هلو') !== -1) {
        return "أهلاً وسهلاً بك في متجر أكد! كيف يمكننا مساعدتك اليوم؟";
    } 
    
    // 5. التقديم والاستمارات
    else if (msg.indexOf('تقديم') !== -1 || msg.indexOf('استمارة') !== -1 || msg.indexOf('قبول') !== -1) {
        return "يمكنك التقديم عبر اختيار قسم (تقديم الاستمارات أونلاين) في الأعلى والضغط على زر (تقديم الآن).";
    } 
    
    // 6. الرد الافتراضي لغير ذلك
    else {
        return "شكراً لتواصلك مع متجر أكد! لمزيد من التفاصيل أو المساعدة المباشرة، يرجى مراسلتنا عبر الواتساب.";
    }
}


// إغلاق الشريط الإعلاني
function closeBanner() {
    var banner = document.getElementById('announcement-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}


function renderBanner() {
    var textEl = document.getElementById('banner-text');
    var imgEl = document.getElementById('banner-img');
    
    if (textEl) {
        textEl.innerText = bannerData.text;
    }
    
    if (imgEl) {
        if (bannerData.img && bannerData.img.trim() !== '') {
            imgEl.src = bannerData.img;
            imgEl.style.display = 'inline-block';
        } else {
            imgEl.style.display = 'none';
        }
    }
}

// فتح نافذة التعديل
function openBannerModal() {
    document.getElementById('input-banner-text').value = bannerData.text;
    document.getElementById('input-banner-file').value = ""; // تفريغ حقل الملف
    openModal('edit-banner-modal');
}
// إزالة الصورة إذا أراد المالك حذفها
function removeBannerImg() {
    bannerData.img = "";
    document.getElementById('input-banner-file').value = "";
    alert("تمت إزالة الصورة! اضغط على (حفظ والتحديث) لتأكيد التغيير.");
}

// حفظ الإعلان مع معالجة الصورة المرفقة
function handleSaveBanner(e) {
    e.preventDefault();
    bannerData.text = document.getElementById('input-banner-text').value;
    
    var fileInput = document.getElementById('input-banner-file');
    
    // إذا قام المالك برفع صورة جديدة من الجهاز
    if (fileInput.files && fileInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(event) {
            bannerData.img = event.target.result; // تحويل الصورة لبيانات محلية
            localStorage.setItem('akkad_banner', JSON.stringify(bannerData));
            closeModal('edit-banner-modal');
            renderBanner();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // في حال عدم تغيير الصورة
        localStorage.setItem('akkad_banner', JSON.stringify(bannerData));
        closeModal('edit-banner-modal');
        renderBanner();
    }
}

// --- نظام الوضع الليلي والنهاري ---

// استرجاع تفضيل المستخدم السابق أو البدء بالوضع النهاري
var currentTheme = localStorage.getItem('akkad_theme') || 'light';

// تطبيق الثيم فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(currentTheme);
});

function toggleTheme() {
    currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('akkad_theme', currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    var icons = [document.getElementById('theme-icon'), document.getElementById('theme-icon-main')];
    var texts = [document.getElementById('theme-text'), document.getElementById('theme-text-main')];

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        icons.forEach(function(icon) { if (icon) icon.className = 'fa-solid fa-sun'; });
        texts.forEach(function(text) { if (text) text.innerText = 'الوضع النهاري'; });
    } else {
        document.body.classList.remove('dark-theme');
        icons.forEach(function(icon) { if (icon) icon.className = 'fa-solid fa-moon'; });
        texts.forEach(function(text) { if (text) text.innerText = 'الوضع الليلي'; });
    }
}

// --- نظام الوضع الليلي والنهاري العائم ---
var currentTheme = localStorage.getItem('akkad_theme') || 'light';

document.addEventListener('DOMContentLoaded', function() {
    applyTheme(currentTheme);
});

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
// إرسال سؤال سريع عبر الأزرار الجاهزة
function sendQuickReply(text) {
    appendMessage(text, 'user-msg');
    
    setTimeout(function() {
        var reply = getAutoReply(text);
        appendMessage(reply, 'bot-msg');
    }, 400);
}

// --- إدارة قسم آراء الزبائن ---

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
                    '<span class="review-author">' + r.name + '</span>' +
                    '<span class="review-stars">' + starsHTML + '</span>' +
                '</div>' +
                '<div class="review-body">"' + r.text + '"</div>' +
            '</div>' +
            delBtn +
        '</div>';
    }

    grid.innerHTML = html;
}

function openAddReviewModal() {
    document.getElementById('review-name').value = '';
    document.getElementById('review-text').value = '';
    openModal('add-review-modal');
}

function handleSaveReview(e) {
    e.preventDefault();
    var name = document.getElementById('review-name').value;
    var rating = parseInt(document.getElementById('review-rating').value);
    var text = document.getElementById('review-text').value;

    var newReview = {
        id: Date.now(),
        name: name,
        rating: rating,
        text: text
    };

    reviews.push(newReview);
    localStorage.setItem('akkad_reviews', JSON.stringify(reviews));
    closeModal('add-review-modal');
    renderReviews();
}

function deleteReview(id) {
    if (confirm("هل أنت تأكد من حذف هذا التقييم؟")) {
        reviews = reviews.filter(function(r) { return r.id !== id; });
        localStorage.setItem('akkad_reviews', JSON.stringify(reviews));
        renderReviews();
    }
}

// --- نظام البحث المباشر والفلترة ---

function filterProductsAndServices() {
    var searchInput = document.getElementById('store-search-input');
    var clearBtn = document.getElementById('clear-search-btn');
    if (!searchInput) return;

    var query = searchInput.value.trim().toLowerCase();

    // إظهار أو إخفاء زر تفريغ البحث
    if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'inline-block' : 'none';
    }

    // البحث داخل بطاقات الكروت المعروضة حالياً
    var cards = document.querySelectorAll('.card, .product-card, .service-card');
    
    cards.forEach(function(card) {
        var cardText = card.innerText.toLowerCase();
        if (cardText.includes(query)) {
            card.style.display = ''; // إظهار الكارت
        } else {
            card.style.display = 'none'; // إخفاء الكارت
        }
    });
}

function clearSearchInput() {
    var searchInput = document.getElementById('store-search-input');
    if (searchInput) {
        searchInput.value = '';
        filterProductsAndServices();
    }
}// --- نظام سلة المشتريات ---
var cart = JSON.parse(localStorage.getItem('akkad_cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
});

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
            '<span>' + cart[i].title + '</span>' +
            '<div>' +
                '<strong style="margin-left: 10px;">' + cart[i].price + '</strong>' +
                '<button onclick="removeFromCart(' + i + ')" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>' +
            '</div>' +
        '</div>';
        
        // استخراج الرقم من السعر إذا كان يحتوي على أرقام
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

    var phone = "9647700000000"; // ضَع رقم واتساب متجر أكد هنا
    var message = "السلام عليكم متجر أكد، أرغب بطلب الخدمات/المنتجات التالية:\n\n";

    for (var i = 0; i < cart.length; i++) {
        message += (i + 1) + ". " + cart[i].title + " - " + cart[i].price + "\n";
    }

    message += "\nيرجى تأكيد الطلب وتزويدي بالتفاصيل.";

    var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
    window.open(url, '_blank');
}
// --- نظام الأسئلة الشائعة (FAQ Accordion) ---

function toggleFAQ(buttonElement) {
    var item = buttonElement.parentElement;
    var isActive = item.classList.contains('active');

    // إغلاق باقي الأسئلة للحفاظ على التنسيق
    var allItems = document.querySelectorAll('.faq-item');
    allItems.forEach(function(el) {
        el.classList.remove('active');
    });

    // فتح السؤال المقتطع أو إغلاقه إذا كان مفتوحاً
    if (!isActive) {
        item.classList.add('active');
    }
}



// --- نظام مشاركة المنتجات والخدمات ---

// --- نظام المشاركة الشامل لجميع البرامج ---

function shareItem(title, price) {
    var shareText = "شاهد هذا المنتج/الخدمة من متجر أكد:\n📌 " + title + "\n💰 السعر: " + price;
    var currentUrl = window.location.href;

    // إذا كان الزبون يتصفح من الموبايل ومتصفحه يدعم المشاركة العامة
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: currentUrl
        }).catch(function(err) {
            console.log("تم إلغاء المشاركة");
        });
    } else {
        // إذا كان على الكمبيوتر، نفتح له قائمة مشاركة تشمل جميع البرامج + نسخ الرابط
        var fullMessage = shareText + "\n🔗 " + currentUrl;
        
        var optionsText = "اختر تطبيقاً للمشاركة عبره:\n\n" +
            "1️⃣ واتساب (WhatsApp)\n" +
            "2️⃣ تليجرام (Telegram)\n" +
            "3️⃣ نسخ النص والرابط\n";

        var choice = prompt(optionsText + "\nاكتب رقم الخيار (1 أو 2 أو 3):", "1");

        if (choice === "1") {
            window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(fullMessage), '_blank');
        } else if (choice === "2") {
            window.open("https://t.me/share/url?url=" + encodeURIComponent(currentUrl) + "&text=" + encodeURIComponent(shareText), '_blank');
        } else if (choice === "3") {
            navigator.clipboard.writeText(fullMessage).then(function() {
                showToast("📋 تم نسخ النص والرابط بنجاح!");
            });
        }
    }
}
// --- دالة إشعارات التنبيه الأنيقة (Toast Notification) ---
function showToast(message) {
    var toast = document.getElementById("toast-notification");
    if (!toast) return;

    toast.innerText = message;
    toast.className = "toast show";

    setTimeout(function() {
        toast.className = toast.className.replace("toast show", "toast");
    }, 3000);
}
// --- دالة زر الصعود للأعلى ---

window.addEventListener('scroll', function() {
    var scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (!scrollTopBtn) return;

    // إظهار الزر بعد النزول 300 بكسل في الصفحة
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // حركة صعود سلسة
    });
}