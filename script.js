'use strict';

(function initAuth() {
    const loginForm    = document.getElementById('login-form');
    if (!loginForm) return;

    const DEMO_USER = 'mariia';
    const DEMO_PASS = 'bakht2026A!';
    const STORAGE_KEY = 'mb_users';

    if (sessionStorage.getItem('mb_logged') === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const tabLogin    = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const panelLogin  = document.getElementById('panel-login');
    const panelRegister = document.getElementById('panel-register');
    const card = document.getElementById('login-card');

    function switchTab(tab) {
        const isLogin = tab === 'login';
        tabLogin.classList.toggle('active', isLogin);
        tabRegister.classList.toggle('active', !isLogin);
        tabLogin.setAttribute('aria-selected', isLogin);
        tabRegister.setAttribute('aria-selected', !isLogin);
        panelLogin.classList.toggle('active', isLogin);
        panelRegister.classList.toggle('active', !isLogin);
    }

    tabLogin.addEventListener('click',    () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    function bindTogglePass(btnId, inputId) {
        const btn   = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;
        btn.addEventListener('click', function () {
            const isPass = input.type === 'password';
            input.type   = isPass ? 'text' : 'password';
            btn.textContent = isPass ? '🙈' : '👁';
        });
    }
    bindTogglePass('toggle-login-pass',         'login-pass');
    bindTogglePass('toggle-reg-pass',           'reg-pass');
    bindTogglePass('toggle-reg-pass-confirm',   'reg-pass-confirm');

    function getUsers() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    const rules = {
        length: /^.{8,}$/,
        upper:  /[A-Z]/,
        number: /[0-9]/,
        symbol: /[^A-Za-z0-9]/,
    };

    function checkPasswordRules(pass) {
        return {
            length: rules.length.test(pass),
            upper:  rules.upper.test(pass),
            number: rules.number.test(pass),
            symbol: rules.symbol.test(pass),
        };
    }

    function isValidPassword(pass) {
        const r = checkPasswordRules(pass);
        return r.length && r.upper && r.number && r.symbol;
    }

    const regPassInput = document.getElementById('reg-pass');
    if (regPassInput) {
        regPassInput.addEventListener('input', function () {
            const pass = regPassInput.value;
            const results = checkPasswordRules(pass);
            document.getElementById('pass-requirements').style.display = pass.length ? 'flex' : 'none';
            Object.keys(results).forEach(function (key) {
                const li   = document.getElementById('req-' + key);
                const icon = li ? li.querySelector('.req-icon') : null;
                if (!li || !icon) return;
                li.classList.toggle('ok',   results[key]);
                li.classList.toggle('fail', !results[key] && pass.length > 0);
                icon.textContent = results[key] ? '✓' : '○';
            });
        });
    }

    const regPassConfirm = document.getElementById('reg-pass-confirm');
    const matchMsg       = document.getElementById('pass-match-msg');
    if (regPassConfirm && regPassInput) {
        regPassConfirm.addEventListener('input', function () {
            if (!regPassConfirm.value) { matchMsg.textContent = ''; return; }
            if (regPassConfirm.value === regPassInput.value) {
                matchMsg.textContent = '✓ Las contraseñas coinciden';
                matchMsg.className = 'pass-match-msg ok';
            } else {
                matchMsg.textContent = '✗ Las contraseñas no coinciden';
                matchMsg.className = 'pass-match-msg fail';
            }
        });
    }

    const loginError  = document.getElementById('login-error');
    const loginSubmit = document.getElementById('login-submit-btn');
    const loginUser   = document.getElementById('login-user');
    const loginPass   = document.getElementById('login-pass');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loginError.textContent = '';
        loginSubmit.textContent = 'Ingresando...';
        loginSubmit.disabled = true;

        const userVal = loginUser.value.trim().toLowerCase();
        const passVal = loginPass.value;

        setTimeout(function () {
            const isDemoUser = (userVal === DEMO_USER || userVal === DEMO_USER + '@demo.com') && passVal === DEMO_PASS;
            const users = getUsers();
            const foundUser = users.find(u =>
                (u.email.toLowerCase() === userVal || u.nombre.toLowerCase() === userVal) &&
                u.password === passVal
            );

            if (isDemoUser || foundUser) {
                const displayName = foundUser ? foundUser.nombre : 'Mariia';
                sessionStorage.setItem('mb_logged', 'true');
                sessionStorage.setItem('mb_user',   displayName);
                if (foundUser) {
                    sessionStorage.setItem('mb_email', foundUser.email);
                    sessionStorage.setItem('mb_phone', foundUser.telefono || '');
                    sessionStorage.setItem('mb_apellido', foundUser.apellido || '');
                }
                window.location.href = 'index.html';
            } else {
                loginError.textContent = 'Email/usuario o contraseña incorrectos. Intentá de nuevo.';
                loginSubmit.textContent = 'Ingresar';
                loginSubmit.disabled = false;
                loginPass.value = '';
                loginPass.focus();
                if (card) {
                    card.classList.add('shake');
                    card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
                }
            }
        }, 600);
    });

    const regForm    = document.getElementById('register-form');
    const regError   = document.getElementById('register-error');
    const regSuccess = document.getElementById('register-success');
    const regSubmit  = document.getElementById('register-submit-btn');

    if (regForm) {
        regForm.addEventListener('submit', function (e) {
            e.preventDefault();
            regError.textContent   = '';
            regSuccess.textContent = '';

            const nombre   = document.getElementById('reg-nombre').value.trim();
            const apellido = document.getElementById('reg-apellido').value.trim();
            const email    = document.getElementById('reg-email').value.trim().toLowerCase();
            const phone    = document.getElementById('reg-phone').value.trim();
            const pass     = document.getElementById('reg-pass').value;
            const passConf = document.getElementById('reg-pass-confirm').value;

            if (!nombre || !apellido) {
                regError.textContent = 'Por favor completá tu nombre y apellido.';
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                regError.textContent = 'Email inválido.';
                return;
            }
            if (!isValidPassword(pass)) {
                regError.textContent = 'La contraseña no cumple los requisitos mínimos.';
                return;
            }
            if (pass !== passConf) {
                regError.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            const users = getUsers();
            if (users.find(u => u.email === email)) {
                regError.textContent = 'Ya existe una cuenta con ese email.';
                return;
            }

            users.push({ nombre, apellido, email, telefono: phone, password: pass });
            saveUsers(users);

            regSuccess.textContent = '¡Cuenta creada! Ya podés iniciar sesión.';
            regForm.reset();
            document.getElementById('pass-requirements').style.display = 'none';
            if (matchMsg) matchMsg.textContent = '';

            setTimeout(() => switchTab('login'), 1800);
        });
    }
})();


(function checkAuth() {
    if (!document.getElementById('navbar')) return;

    
})();


(function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu    = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileClose   = document.getElementById('mobile-menu-close');
    const mobileLinks   = document.querySelectorAll('.mobile-nav-link');
    const logoutBtn = document.getElementById('logout-btn');

    if (!navbar) return;

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        mobileOverlay.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileOverlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openMobileMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            sessionStorage.removeItem('mb_logged');
            sessionStorage.removeItem('mb_user');
            window.location.href = 'index.html';
        });
    }
})();


(function initServiceFilters() {
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    const searchInput  = document.getElementById('service-search');
    const searchClear  = document.getElementById('service-search-clear');
    const noResults    = document.getElementById('search-no-results');

    if (!filterBtns.length) return;

    let activeFilter = 'all';

    function getCardText(card) {
        return card.innerText.toLowerCase();
    }

    function applyFilters() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleCount = 0;

        serviceCards.forEach(function (card) {
            const category  = card.getAttribute('data-category');
            const matchsCat = activeFilter === 'all' || category === activeFilter;
            const matchsQ   = !query || getCardText(card).includes(query);
            const show      = matchsCat && matchsQ;

            if (show) {
                card.style.display = '';
                card.classList.remove('card-visible');
                void card.offsetWidth;
                card.classList.add('card-visible');
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.textContent = (visibleCount === 0 && query)
                ? `No se encontraron servicios para "${query}". Probá con otra palabra.`
                : '';
        }

        if (searchClear) {
            searchClear.style.display = query ? 'flex' : 'none';
        }
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') e.preventDefault();
        });
    }

    if (searchClear) {
        searchClear.style.display = 'none';
        searchClear.addEventListener('click', function () {
            if (searchInput) { searchInput.value = ''; searchInput.focus(); }
            applyFilters();
        });
    }
})();


let cart = [];

function getCartElements() {
    return {
        cartBtn:      document.getElementById('cart-btn'),
        cartCount:    document.getElementById('cart-count'),
        cartDrawer:   document.getElementById('cart-drawer'),
        cartOverlay:  document.getElementById('cart-overlay'),
        cartClose:    document.getElementById('cart-close'),
        cartItems:    document.getElementById('cart-items'),
        cartEmpty:    document.getElementById('cart-empty'),
        cartTotal:    document.getElementById('cart-total'),
        cartFooter:   document.getElementById('cart-footer'),
        cartCheckout: document.getElementById('cart-checkout'),
    };
}

function updateCartCount() {
    const { cartCount } = getCartElements();
    if (!cartCount) return;
    cartCount.textContent = cart.length;
    cartCount.classList.toggle('has-items', cart.length > 0);
}

function calcTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCartItems() {
    const { cartItems, cartEmpty, cartTotal, cartFooter } = getCartElements();
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'flex';

    cartItems.innerHTML = cart.map(function (item, idx) {
        const categoryIcon = item.category === 'foto' ? '📸' : item.category === 'video' ? '🎬' : '📦';
        const subtotal = item.price * item.qty;
        const briefHtml = item.brief
            ? `<p class="cart-item-brief"><em>"${escapeHtml(item.brief)}"</em></p>`
            : '';
        return `
            <div class="cart-item" id="cart-item-${idx}">
                <div class="cart-item-header">
                    <span class="cart-item-icon">${categoryIcon}</span>
                    <div class="cart-item-info">
                        <strong>${escapeHtml(item.name)}</strong>
                        <span class="cart-item-price">$${item.price} USD / u.</span>
                    </div>
                    <button class="cart-item-remove" data-idx="${idx}" aria-label="Quitar ${escapeHtml(item.name)}">✕</button>
                </div>
                <div class="cart-item-qty-row">
                    <div class="cart-qty-control">
                        <button class="cart-qty-btn" data-action="dec" data-idx="${idx}" aria-label="Reducir">−</button>
                        <span class="cart-qty-value">${item.qty}</span>
                        <button class="cart-qty-btn" data-action="inc" data-idx="${idx}" aria-label="Aumentar">+</button>
                    </div>
                    <span class="cart-item-subtotal">$${subtotal} USD</span>
                </div>
                ${briefHtml}
            </div>
        `;
    }).join('');

    cartItems.querySelectorAll('.cart-item-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            removeFromCart(idx);
        });
    });

    cartItems.querySelectorAll('.cart-qty-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const idx    = parseInt(btn.getAttribute('data-idx'), 10);
            const action = btn.getAttribute('data-action');
            changeCartQty(idx, action);
        });
    });

    if (cartTotal) cartTotal.textContent = `$${calcTotal()} USD`;
}

function addToCart(serviceData, brief, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    cart.push({
        id:       serviceData.id,
        name:     serviceData.name,
        price:    parseInt(serviceData.price, 10),
        category: serviceData.category,
        brief:    brief || '',
        qty:      qty,
    });
    updateCartCount();
    renderCartItems();
}

function changeCartQty(idx, action) {
    if (!cart[idx]) return;
    if (action === 'inc') {
        cart[idx].qty = Math.min(99, cart[idx].qty + 1);
    } else if (action === 'dec') {
        cart[idx].qty -= 1;
        if (cart[idx].qty < 1) {
            removeFromCart(idx);
            return;
        }
    }
    updateCartCount();
    renderCartItems();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartCount();
    renderCartItems();
}

function openCart() {
    const { cartDrawer, cartOverlay } = getCartElements();
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    const { cartDrawer, cartOverlay } = getCartElements();
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

(function initCart() {
    const els = getCartElements();
    if (!els.cartBtn) return;

    els.cartBtn.addEventListener('click', openCart);
    if (els.cartClose) els.cartClose.addEventListener('click', closeCart);
    if (els.cartOverlay) els.cartOverlay.addEventListener('click', closeCart);

    if (els.cartCheckout) {
        els.cartCheckout.addEventListener('click', function () {
            if (cart.length === 0) return;
            closeCart();
            openContactCheckout();
        });
    }

    renderCartItems();
})();


let pendingService = null;

(function initBriefModal() {
    const addBtns   = document.querySelectorAll('.btn-add-cart');
    const overlay   = document.getElementById('modal-overlay');
    const modal     = document.getElementById('brief-modal');
    const closeBtn  = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    const briefText   = document.getElementById('brief-text');
    const qtyValue    = document.getElementById('qty-value');
    const qtyMinus    = document.getElementById('qty-minus');
    const qtyPlus     = document.getElementById('qty-plus');
    const modalSubtotal = document.getElementById('modal-subtotal');
    const serviceName = document.getElementById('modal-service-name');
    const priceLabel  = document.getElementById('modal-price');

    if (!addBtns.length) return;

    addBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            pendingService = {
                id:       btn.getAttribute('data-id'),
                name:     btn.getAttribute('data-name'),
                price:    btn.getAttribute('data-price'),
                category: btn.getAttribute('data-category'),
            };

            if (serviceName)    serviceName.textContent = pendingService.name;
            if (priceLabel)     priceLabel.textContent  = `$${pendingService.price} USD`;
            if (briefText)      briefText.value = '';
            if (qtyValue)       qtyValue.textContent = '1';
            if (modalSubtotal)  modalSubtotal.textContent = `$${pendingService.price} USD`;
            if (overlay) overlay.classList.add('active');
            setTimeout(() => { if (modal) modal.classList.add('open'); }, 10);
            if (briefText) briefText.focus();
        });
    });

    function getModalQty() {
        return Math.max(1, parseInt(qtyValue ? qtyValue.textContent : '1', 10) || 1);
    }

    function updateModalSubtotal() {
        if (!pendingService || !modalSubtotal) return;
        const total = parseInt(pendingService.price, 10) * getModalQty();
        modalSubtotal.textContent = `$${total} USD`;
    }

    if (qtyMinus) {
        qtyMinus.addEventListener('click', function () {
            const current = getModalQty();
            if (current > 1 && qtyValue) qtyValue.textContent = current - 1;
            updateModalSubtotal();
        });
    }
    if (qtyPlus) {
        qtyPlus.addEventListener('click', function () {
            const current = getModalQty();
            if (current < 99 && qtyValue) qtyValue.textContent = current + 1;
            updateModalSubtotal();
        });
    }

    function closeModal() {
        if (modal) modal.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        pendingService = null;
    }

    if (closeBtn)  closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay)   overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
            if (!pendingService) return;
            const brief = briefText ? briefText.value.trim() : '';
            const qty   = getModalQty();
            addToCart(pendingService, brief, qty);
            closeModal();

            const cartBtn = document.getElementById('cart-btn');
            if (cartBtn) {
                cartBtn.classList.add('cart-flash');
                cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('cart-flash'), { once: true });
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeContactCheckout();
            closeOrderModal();
        }
    });
})();


let checkoutContact = null;

function openContactCheckout() {
    const overlay = document.getElementById('contact-checkout-overlay');
    const modal   = document.getElementById('contact-checkout-modal');
    if (!overlay) return;

    const savedNombre   = sessionStorage.getItem('mb_user')    || '';
    const savedApellido = sessionStorage.getItem('mb_apellido') || '';
    const savedEmail    = sessionStorage.getItem('mb_email')   || '';
    const savedPhone    = sessionStorage.getItem('mb_phone')   || '';

    const coNombre   = document.getElementById('co-nombre');
    const coApellido = document.getElementById('co-apellido');
    const coEmail    = document.getElementById('co-email');
    const coPhone    = document.getElementById('co-phone');

    if (coNombre   && !coNombre.value)   coNombre.value   = savedNombre;
    if (coApellido && !coApellido.value) coApellido.value = savedApellido;
    if (coEmail    && !coEmail.value)    coEmail.value    = savedEmail;
    if (coPhone    && !coPhone.value)    coPhone.value    = savedPhone;

    const coError = document.getElementById('co-error');
    if (coError) coError.textContent = '';

    overlay.classList.add('active');
    setTimeout(() => { if (modal) modal.classList.add('open'); }, 10);
}

function closeContactCheckout() {
    const overlay = document.getElementById('contact-checkout-overlay');
    const modal   = document.getElementById('contact-checkout-modal');
    if (modal)   modal.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

(function initContactCheckout() {
    const form       = document.getElementById('contact-checkout-form');
    const closeBtn   = document.getElementById('contact-checkout-close');
    const backBtn    = document.getElementById('co-back');
    const msgrBtns   = document.querySelectorAll('.messenger-btn');
    const coError    = document.getElementById('co-error');

    if (!form) return;

    let selectedMessenger = null;
    msgrBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            msgrBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMessenger = btn.getAttribute('data-messenger');
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeContactCheckout);
    if (backBtn)  backBtn.addEventListener('click', function () {
        closeContactCheckout();
        openCart();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (coError) coError.textContent = '';

        const nombre   = document.getElementById('co-nombre').value.trim();
        const apellido = document.getElementById('co-apellido').value.trim();
        const email    = document.getElementById('co-email').value.trim();
        const phone    = document.getElementById('co-phone').value.trim();

        if (!nombre || !apellido) {
            coError.textContent = 'Por favor completá tu nombre y apellido.';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            coError.textContent = 'Email inválido.';
            return;
        }

        checkoutContact = { nombre, apellido, email, phone, messenger: selectedMessenger || 'No especificado' };
        closeContactCheckout();
        showOrderConfirmation();
    });
})();


function showOrderConfirmation() {
    const overlay  = document.getElementById('order-overlay');
    const modal    = document.getElementById('order-modal');
    const summary  = document.getElementById('order-summary');
    const closeBtn = document.getElementById('order-close');

    if (!overlay) return;

    const contact = checkoutContact || {};
    const messengerIcon = {
        WhatsApp: '💬', Facebook: '📘', Instagram: '📸', Telegram: '✈️', Email: '📧'
    };
    const msgIcon = messengerIcon[contact.messenger] || '💬';

    if (summary) {
        const items = cart.map(function (item) {
            const categoryIcon = item.category === 'foto' ? '📸' : item.category === 'video' ? '🎬' : '📦';
            const subtotal  = item.price * item.qty;
            const qtyLabel  = item.qty > 1 ? ` × ${item.qty}` : '';
            const briefLine = item.brief
                ? `<p class="order-brief"><em>Brief: "${escapeHtml(item.brief)}"</em></p>`
                : '';
            return `
                <div class="order-item">
                    <span>${categoryIcon} ${escapeHtml(item.name)}${qtyLabel}</span>
                    <strong>$${subtotal} USD</strong>
                    ${briefLine}
                </div>
            `;
        }).join('');

        const contactSection = contact.nombre ? `
            <div class="order-contact-info">
                <p class="order-contact-title">📎 Datos de contacto</p>
                <p>👤 ${escapeHtml(contact.nombre)} ${escapeHtml(contact.apellido)}</p>
                <p>📧 ${escapeHtml(contact.email)}</p>
                ${contact.phone ? `<p>📱 ${escapeHtml(contact.phone)}</p>` : ''}
                <p>${msgIcon} Prefiere: ${escapeHtml(contact.messenger)}</p>
            </div>
        ` : '';

        summary.innerHTML = `
            ${items}
            <div class="order-total-row">
                <span>Total</span>
                <strong>$${calcTotal()} USD</strong>
            </div>
            ${contactSection}
        `;
    }

    overlay.classList.add('active');
    setTimeout(() => { if (modal) modal.classList.add('open'); }, 10);

    cart = [];
    checkoutContact = null;
    updateCartCount();
    renderCartItems();

    if (closeBtn) {
        closeBtn.addEventListener('click', closeOrderModal, { once: true });
    }
}

function closeOrderModal() {
    const overlay = document.getElementById('order-overlay');
    const modal   = document.getElementById('order-modal');
    if (modal)   modal.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}


(function initContactForm() {
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (submitBtn) {
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
        }
        setTimeout(function () {
            if (success) {
                success.textContent = '¡Mensaje enviado! Me comunicaré contigo pronto. 🚀';
                success.classList.add('visible');
            }
            form.reset();
            if (submitBtn) {
                submitBtn.textContent = 'Enviar Mensaje';
                submitBtn.disabled = false;
            }
            setTimeout(function () {
                if (success) success.classList.remove('visible');
            }, 5000);
        }, 800);
    });
})();


(function initScrollReveal() {
    const targets = document.querySelectorAll('.service-card, .gallery-item, .about-grid, .contact-box');
    if (!targets.length) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
})();


function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}
