// RoomFlow Landing Page Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Sticky Navbar & Active Navigation Link on Scroll
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link based on scroll position
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // 3. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            if (mobileNav.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });

        // Close mobile menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                menuToggle.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // 4. Feature Tabs Switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Deactivate all buttons and hide all contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate current button and show targeted content
            button.classList.add('active');
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });

    // 5. Interactive Utility Calculator Logic
    const elecPrevInput = document.getElementById('elec-prev');
    const elecCurrInput = document.getElementById('elec-curr');
    const waterPrevInput = document.getElementById('water-prev');
    const waterCurrInput = document.getElementById('water-curr');
    const rentInput = document.getElementById('room-rent');

    // Display fields
    const elecDiffEl = document.getElementById('elec-diff');
    const elecCostEl = document.getElementById('elec-cost');
    const waterDiffEl = document.getElementById('water-diff');
    const waterCostEl = document.getElementById('water-cost');
    const rentCostEl = document.getElementById('rent-cost');
    const totalAmountEl = document.getElementById('total-amount');

    // Pricing Constants (from business rules in context.md)
    const ELECTRICITY_PRICE = 3500; // 3,500 ₫/kWh
    const WATER_PRICE = 15000;      // 15,000 ₫/m³

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    function calculateBill() {
        const elecPrev = parseFloat(elecPrevInput.value) || 0;
        const elecCurr = parseFloat(elecCurrInput.value) || 0;
        const waterPrev = parseFloat(waterPrevInput.value) || 0;
        const waterCurr = parseFloat(waterCurrInput.value) || 0;
        const rentAmount = parseFloat(rentInput.value) || 0;

        // Calculate differences with validation
        let elecDiff = elecCurr - elecPrev;
        if (elecDiff < 0) elecDiff = 0;
        
        let waterDiff = waterCurr - waterPrev;
        if (waterDiff < 0) waterDiff = 0;

        // Calculate costs
        const elecCost = elecDiff * ELECTRICITY_PRICE;
        const waterCost = waterDiff * WATER_PRICE;
        const totalAmount = rentAmount + elecCost + waterCost;

        // Update UI
        elecDiffEl.textContent = elecDiff.toLocaleString('vi-VN');
        elecCostEl.textContent = formatCurrency(elecCost);
        
        waterDiffEl.textContent = waterDiff.toLocaleString('vi-VN');
        waterCostEl.textContent = formatCurrency(waterCost);
        
        rentCostEl.textContent = formatCurrency(rentAmount);
        totalAmountEl.textContent = formatCurrency(totalAmount);

        // Return calculated values for the modal use
        return {
            elecPrev,
            elecCurr,
            elecDiff,
            elecCost,
            waterPrev,
            waterCurr,
            waterDiff,
            waterCost,
            rentAmount,
            totalAmount
        };
    }

    // Attach listeners
    const inputs = [elecPrevInput, elecCurrInput, waterPrevInput, waterCurrInput, rentInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateBill);
        }
    });

    // Run initial calculation
    calculateBill();

    // 6. Demo Invoice Modal Interactions
    const btnGenerateDemo = document.getElementById('btn-generate-demo');
    const invoiceModal = document.getElementById('invoice-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSuccessBtn = document.getElementById('modal-success-btn');
    const modalInvoiceStatus = document.getElementById('modal-invoice-status');

    // Modal data fields
    const modalRentCost = document.getElementById('modal-rent-cost');
    const modalElecDetails = document.getElementById('modal-elec-details');
    const modalElecCost = document.getElementById('modal-elec-cost');
    const modalWaterDetails = document.getElementById('modal-water-details');
    const modalWaterCost = document.getElementById('modal-water-cost');
    const modalTotalCost = document.getElementById('modal-total-cost');
    const invoiceDateVal = document.getElementById('invoice-date-val');

    if (btnGenerateDemo && invoiceModal) {
        btnGenerateDemo.addEventListener('click', () => {
            const data = calculateBill();

            // Check if current indexes are invalid
            const elecCurr = parseFloat(elecCurrInput.value) || 0;
            const elecPrev = parseFloat(elecPrevInput.value) || 0;
            const waterCurr = parseFloat(waterCurrInput.value) || 0;
            const waterPrev = parseFloat(waterPrevInput.value) || 0;

            if (elecCurr < elecPrev || waterCurr < waterPrev) {
                alert('Chỉ số mới không được nhỏ hơn chỉ số cũ! Vui lòng kiểm tra lại số liệu.');
                return;
            }

            // Set modal content
            const today = new Date();
            const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
            const currentYear = today.getFullYear();
            invoiceDateVal.textContent = `${currentMonth}/${currentYear}`;

            modalRentCost.textContent = formatCurrency(data.rentAmount);
            
            modalElecDetails.textContent = `${data.elecDiff.toLocaleString('vi-VN')} kWh (${data.elecPrev.toLocaleString('vi-VN')} → ${data.elecCurr.toLocaleString('vi-VN')}) x ${ELECTRICITY_PRICE.toLocaleString('vi-VN')}₫`;
            modalElecCost.textContent = formatCurrency(data.elecCost);
            
            modalWaterDetails.textContent = `${data.waterDiff.toLocaleString('vi-VN')} m³ (${data.waterPrev.toLocaleString('vi-VN')} → ${data.waterCurr.toLocaleString('vi-VN')}) x ${WATER_PRICE.toLocaleString('vi-VN')}₫`;
            modalWaterCost.textContent = formatCurrency(data.waterCost);
            
            modalTotalCost.textContent = formatCurrency(data.totalAmount);

            // Reset status badge inside modal
            modalInvoiceStatus.textContent = 'Chờ thanh toán';
            modalInvoiceStatus.className = 'badge bg-warning-light text-warning';
            modalSuccessBtn.style.display = 'inline-flex';
            modalSuccessBtn.innerHTML = '<i data-lucide="check"></i> Đánh dấu đã thu';
            lucide.createIcons();

            // Show modal
            invoiceModal.classList.add('open');
        });

        // Close modal handlers
        const closeModal = () => {
            invoiceModal.classList.remove('open');
        };

        modalCloseBtn.addEventListener('click', closeModal);
        modalCancelBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        invoiceModal.addEventListener('click', (e) => {
            if (e.target === invoiceModal) {
                closeModal();
            }
        });

        // Success Action inside Modal
        modalSuccessBtn.addEventListener('click', () => {
            // Simulated payment action
            modalInvoiceStatus.textContent = 'Đã thanh toán';
            modalInvoiceStatus.className = 'badge bg-success-light text-success';
            
            modalSuccessBtn.innerHTML = '<i data-lucide="check-circle"></i> Đã ghi nhận';
            lucide.createIcons();
            
            // Short delay before closing and notifying
            setTimeout(() => {
                closeModal();
                alert('Đã ghi nhận thanh toán hóa đơn thành công! Trạng thái hóa đơn đã chuyển sang ĐÃ THANH TOÁN.');
            }, 800);
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                window.scrollTo({
                    top: targetEl.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
