// --- Data ---
const tours = {
    horse: {
        title: 'Cavalgada ao Pôr do Sol',
        img: 'images/gpt-cavalo.png',
        priceAdult: 90,
        priceChild: 60,
        maxPax: 8,
        desc: 'Uma trilha suave pelas montanhas da propriedade, terminando com um mirante espetacular para o pôr do sol.',
        req: ['Idade mínima: 5 anos', 'Uso obrigatório de calça e sapato fechado', 'Capacete de hipismo fornecido pela pousada']
    },
    boat: {
        title: 'Passeio de Lancha VIP',
        img: 'images/gpt-lancha.png',
        priceAdult: 250,
        priceChild: 150,
        maxPax: 6,
        desc: 'Navegue pelas águas cristalinas do lago em uma lancha premium com paradas para banho e brinde especial.',
        req: ['Uso obrigatório de colete salva-vidas', 'Não é permitido vidro a bordo', 'Chegar 15 min antes na marina']
    },
    dayuse: {
        title: 'Day-Use Serra Verde',
        img: 'images/gpt-dayuse.png',
        priceAdult: 50,
        priceChild: 0,
        maxPax: 20,
        desc: 'Venha passar o dia na pousada serra verde, com acesso a 2 piscinas, restaurante no local e 7 cachoeiras.',
        req: ['R$50,00 por pessoa', 'Crianças de 7 anos ou menos não pagam', 'Proibido entrar com coolers e bebidas']
    },
    quarto: {
        title: 'Quarto Pousada',
        img: 'images/background1.jpeg',
        images: ['images/quartos/img1.jpeg', 'images/quartos/img2-1.jpeg', 'images/quartos/img3.jpeg', 'images/quartos/img4.jpeg', 'images/quartos/img5.jpeg', 'images/quartos/img6.jpeg'],
        priceAdult: 350,
        priceChild: 0,
        maxPax: 4,
        desc: 'Venha se hospedar na pousada serra verde! Nossos quartos oferecem conforto ideal para famílias.',
        req: ['Café da manhã incluso', 'Suítes', 'Frigobar e Ventilador']
    },
    chale: {
        title: 'Chalé Privativo',
        img: 'images/background1.jpeg',
        images: ['images/background1.jpeg', 'images/background1.jpeg', 'images/background1.jpeg', 'images/background1.jpeg', 'images/background1.jpeg', 'images/background1.jpeg'],
        priceAdult: 450,
        priceChild: 0,
        maxPax: 2,
        desc: 'Venha se hospedar na pousada serra verde! Nossos chalés garantem total privacidade, com uma vista deslumbrante.',
        req: ['Café da manhã incluso', 'Lareira e Redes', 'Ideal para casais']
    }
};

// --- State ---
let currentStep = 1;
const totalSteps = 7;
let currentTourId = null;
let bookingData = {
    date: null,
    time: null,
    adults: 2,
    children: 0,
    totalPrice: 0,
    tour: null
};
let timerInterval = null;
let navigationScrollFrame = null;

// --- DOM Elements ---
const modal = document.getElementById('booking-modal');
const modalPanel = document.getElementById('modal-panel');
const stepsContainer = document.getElementById('steps-container');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const modalTitle = document.getElementById('modal-title');
const mainHeader = document.getElementById('main-header');

// Summary Panel Elements
const sumImg = document.getElementById('summary-img');
const sumTitle = document.getElementById('summary-title');
const sumDate = document.getElementById('sum-date');
const sumTime = document.getElementById('sum-time');
const sumPax = document.getElementById('sum-pax');
const sumTotal = document.getElementById('sum-total');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    buildStepsHTML();
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        event.preventDefault();
        smoothScrollToSection(target);
    });
    ['wheel', 'touchstart'].forEach(type => {
        window.addEventListener(type, () => cancelAnimationFrame(navigationScrollFrame), { passive: true });
    });
    
    // Hero Carousel Logic
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('opacity-100');
            slides[currentSlide].classList.add('opacity-0');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.remove('opacity-0');
            slides[currentSlide].classList.add('opacity-100');
        }, 5000);
    }
    
    // Header scroll effect optimized
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('header-scrolled');
                    mainHeader.classList.remove('bg-white');
                } else {
                    mainHeader.classList.remove('header-scrolled');
                    mainHeader.classList.add('bg-white');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});

// Animate anchor navigation explicitly, independently of native smooth scrolling.
function smoothScrollToSection(target) {
    cancelAnimationFrame(navigationScrollFrame);
    const start = window.scrollY;
    const headerOffset = mainHeader.getBoundingClientRect().height + 16;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const destination = Math.min(maxScroll, Math.max(0, start + target.getBoundingClientRect().top - headerOffset));
    const distance = destination - start;
    const duration = Math.min(1100, Math.max(650, Math.abs(distance) * 0.6));
    const startedAt = performance.now();
    function animate(now) {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
        navigationScrollFrame = progress < 1 ? requestAnimationFrame(animate) : null;
    }
    navigationScrollFrame = requestAnimationFrame(animate);
}

function scrollToTours() {
    const activity = document.getElementById('quick-activity').value;
    if (activity) {
        openModal(activity);
    } else {
        smoothScrollToSection(document.getElementById('passeios'));
    }
}

// --- Modal Flow Logic ---
function openModal(tourId) {
    currentTourId = tourId;
    bookingData.tour = tours[tourId];
    bookingData.date = null;
    bookingData.time = null;
    bookingData.adults = 2;
    bookingData.children = 0;
    
    // Populate Step 1 Data
    const tour = tours[tourId];
    
    const gallery = document.getElementById('st1-gallery');
    gallery.onkeydown = null;
    gallery.removeAttribute('role');
    gallery.removeAttribute('aria-label');
    const isAccommodation = tourId === 'quarto' || tourId === 'chale';
    if (isAccommodation && tour.images) {
        buildRoomCarousel(gallery, tour.images, tour.title);
    } else if (tour.images) {
        gallery.className = 'grid grid-cols-2 md:grid-cols-3 gap-2 mb-6';
        gallery.innerHTML = tour.images.map(src => `<img src="${src}" class="w-full h-24 md:h-32 object-cover rounded-lg">`).join('');
    } else {
        gallery.className = 'rounded-xl overflow-hidden mb-6 h-64 relative';
        gallery.innerHTML = `<img src="${tour.img}" class="w-full h-full object-cover">`;
    }
    
    document.getElementById('st1-desc').textContent = tour.desc;
    document.getElementById('st1-price-adult').textContent = `R$ ${tour.priceAdult}`;
    document.getElementById('st1-price-child').textContent = `R$ ${tour.priceChild}`;
    document.getElementById('st1-standard-prices').hidden = isAccommodation;
    const accommodationPrices = document.getElementById('st1-room-prices');
    accommodationPrices.hidden = !isAccommodation;
    if (isAccommodation) {
        const label = tourId === 'quarto' ? 'Quarto' : 'Chalé';
        const prices = tourId === 'quarto' ? [350, 450, 550] : [450, 550, 650];
        accommodationPrices.querySelectorAll('[data-room-label]').forEach((el, index) => {
            el.textContent = `${label} ${['duplo', 'triplo', 'quádruplo'][index]}`;
        });
        accommodationPrices.querySelectorAll('[data-room-price]').forEach((el, index) => {
            el.textContent = `R$ ${prices[index].toFixed(2).replace('.', ',')}`;
        });
    }
    
    if (tourId === 'quarto' || tourId === 'chale') {
        document.getElementById('st1-label-adult').textContent = 'Diária (Adulto)';
        document.getElementById('st1-sub-adult').textContent = 'Valor base';
        document.getElementById('st1-label-child').textContent = 'Criança';
        document.getElementById('st1-sub-child').textContent = 'Cortesia até 7 anos';
    } else {
        document.getElementById('st1-label-adult').textContent = 'Adulto';
        document.getElementById('st1-sub-adult').textContent = 'A partir de 8 anos';
        document.getElementById('st1-label-child').textContent = 'Criança';
        document.getElementById('st1-sub-child').textContent = 'De 0 a 7 anos';
    }
    
    const reqUl = document.getElementById('st1-req');
    reqUl.innerHTML = '';
    tour.req.forEach(r => {
        reqUl.innerHTML += `<li>${r}</li>`;
    });
    
    // Populate Summary
    sumImg.src = tour.img;
    sumTitle.textContent = tour.title;
    
    // Reset Pax
    document.getElementById('pax-adults').textContent = '2';
    document.getElementById('pax-children').textContent = '0';
    document.getElementById('max-pax-display').textContent = tour.maxPax;
    document.getElementById('st4-price-adult').textContent = `R$ ${tour.priceAdult} / pessoa`;
    document.getElementById('st4-price-child').textContent = `R$ ${tour.priceChild} / pessoa`;
    
    // Update UI
    currentStep = 1;
    updateModalUI();
    generateCalendar();
    
    // Show Modal
    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        modalPanel.classList.remove('translate-y-8');
    }, 50);
}

// Room gallery: manual navigation keeps the prototype easy to present.
function buildRoomCarousel(gallery, images, title) {
    gallery.className = 'room-carousel mb-6';
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-label', `Fotos de ${title}`);
    gallery.innerHTML = `
        <div class="room-carousel-viewport">
            <img class="room-carousel-image" src="${images[0]}" alt="${title} — foto 1 de ${images.length}">
            <button type="button" class="room-carousel-arrow room-carousel-prev" aria-label="Foto anterior"><i class="ph ph-caret-left" aria-hidden="true"></i></button>
            <button type="button" class="room-carousel-arrow room-carousel-next" aria-label="Próxima foto"><i class="ph ph-caret-right" aria-hidden="true"></i></button>
            <span class="room-carousel-count" aria-live="polite">1 / ${images.length}</span>
        </div>
        <div class="room-carousel-dots" aria-label="Escolher foto">
            ${images.map((_, index) => `<button type="button" class="room-carousel-dot${index === 0 ? ' is-active' : ''}" aria-label="Ver foto ${index + 1}" aria-pressed="${index === 0}"></button>`).join('')}
        </div>
    `;
    let currentIndex = 0;
    const image = gallery.querySelector('.room-carousel-image');
    const count = gallery.querySelector('.room-carousel-count');
    const dots = gallery.querySelectorAll('.room-carousel-dot');
    function showPhoto(index) {
        currentIndex = (index + images.length) % images.length;
        image.src = images[currentIndex];
        image.alt = `${title} — foto ${currentIndex + 1} de ${images.length}`;
        count.textContent = `${currentIndex + 1} / ${images.length}`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === currentIndex);
            dot.setAttribute('aria-pressed', String(i === currentIndex));
        });
    }
    gallery.querySelector('.room-carousel-prev').addEventListener('click', () => showPhoto(currentIndex - 1));
    gallery.querySelector('.room-carousel-next').addEventListener('click', () => showPhoto(currentIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => showPhoto(index)));
    gallery.onkeydown = event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showPhoto(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
    };
}

function closeModal() {
    modalPanel.classList.add('translate-y-8');
    setTimeout(() => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }, 300);
    clearInterval(timerInterval);
}

function nextStep() {
    if (currentTourId === 'quarto' || currentTourId === 'chale') {
        if (currentStep === 1) {
            currentStep = 2;
            updateModalUI();
        } else {
            document.getElementById('accommodation-contact-status').hidden = false;
        }
        return;
    }
    if (!validateCurrentStep()) return;
    
    if (currentStep < totalSteps) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.getElementById(`step-${currentStep}`).classList.add('exit-left');
        
        currentStep++;
        
        // Skip Step 3 if Day-Use
        if (currentStep === 3 && currentTourId === 'dayuse') {
            bookingData.time = '08:00 às 18:00';
            currentStep++; // Skip to Step 4
        }
        
        // Setup specific step before showing
        if (currentStep === 3) generateTimeSlots();
        if (currentStep === 5) generateParticipantsForm();
        if (currentStep === 7) setupPaymentStep();
        
        const nextPane = document.getElementById(`step-${currentStep}`);
        nextPane.classList.remove('exit-left');
        nextPane.classList.add('active');
        
        updateModalUI();
    } else if (currentStep === 7) {
        confirmBooking();
    }
}

function prevStep() {
    if (currentTourId === 'quarto' || currentTourId === 'chale') {
        currentStep = 1;
        updateModalUI();
        return;
    }
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        
        // Skip Step 3 backwards if Day-Use
        if (currentStep === 3 && currentTourId === 'dayuse') {
            currentStep--;
        }
        
        const prevPane = document.getElementById(`step-${currentStep}`);
        prevPane.classList.remove('exit-left');
        prevPane.classList.add('active');
        updateModalUI();
    }
}

function validateCurrentStep() {
    if (currentStep === 2 && !bookingData.date) {
        alert('Por favor, selecione uma data.');
        return false;
    }
    if (currentStep === 3 && !bookingData.time) {
        alert('Por favor, selecione um horário.');
        return false;
    }
    if (currentStep === 4) {
        if (bookingData.adults === 0) {
            alert('A reserva deve ter pelo menos um adulto.');
            return false;
        }
    }
    if (currentStep === 5) {
        const form = document.getElementById('booking-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
    }
    if (currentStep === 6) {
        const check = document.getElementById('terms-checkbox');
        if (!check.checked) {
            alert('Você precisa aceitar o termo de responsabilidade para continuar.');
            return false;
        }
    }
    return true;
}

function updateModalUI() {
    const tour = tours[currentTourId];
    const isAccommodation = currentTourId === 'quarto' || currentTourId === 'chale';
    document.getElementById('summary-panel').classList.toggle('md:flex', !isAccommodation);
    document.getElementById('summary-panel').classList.add('hidden');
    document.getElementById('accommodation-contact').classList.remove('active');
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.hidden = isAccommodation && index >= 2;
    });
    if (isAccommodation) {
        document.querySelectorAll('.step-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(currentStep === 1 ? 'step-1' : 'accommodation-contact').classList.add('active');
        modalTitle.textContent = currentStep === 1 ? 'Detalhes da Hospedagem' : 'Consultar pelo WhatsApp';
        btnBack.disabled = currentStep === 1;
        btnNext.innerHTML = currentStep === 1
            ? 'Consultar disponibilidade <i class="ph ph-arrow-right" aria-hidden="true"></i>'
            : 'Falar no WhatsApp <i class="ph ph-whatsapp-logo text-xl" aria-hidden="true"></i>';
        document.getElementById('accommodation-contact-status').hidden = true;
        const accommodation = currentTourId === 'quarto' ? 'um quarto' : 'um chalé';
        document.getElementById('accommodation-contact-message').textContent = `Olá! Vi o site e gostaria de consultar a disponibilidade de ${accommodation} na Pousada Serra Verde.`;
        for (let i = 1; i <= 2; i++) {
            document.getElementById(`prog-${i}`).style.width = i <= currentStep ? '100%' : '0%';
        }
        stepsContainer.scrollTo(0, 0);
        return;
    }
    
    document.querySelectorAll('.step-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `step-${currentStep}`);
    });
    // Titles
    const titles = {
        1: 'Detalhes da Atividade',
        2: 'Escolha a Data',
        3: 'Escolha o Horário',
        4: 'Participantes',
        5: 'Dados Pessoais',
        6: 'Termos e Condições',
        7: 'Pagamento e Confirmação'
    };
    modalTitle.textContent = titles[currentStep];
    
    // Buttons
    btnBack.disabled = currentStep === 1;
    
    if (currentStep === 7) {
        btnNext.innerHTML = 'Confirmar Reserva <i class="ph ph-check-circle"></i>';
        // Keep it green instead of yellow
    } else {
        btnNext.innerHTML = 'Continuar <i class="ph ph-arrow-right"></i>';
    }

    // Progress Bar (1 to 6, hide on 7 or fill all)
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`prog-${i}`);
        if (bar) {
            if (i < currentStep) bar.style.width = '100%';
            else if (i === currentStep) bar.style.width = '50%';
            else bar.style.width = '0%';
        }
    }

    // Calculation
    bookingData.totalPrice = (bookingData.adults * tour.priceAdult) + (bookingData.children * tour.priceChild);
    
    // Summary Updates
    const totalFormatted = `R$ ${bookingData.totalPrice.toFixed(2).replace('.', ',')}`;
    sumTotal.textContent = totalFormatted;
    
    sumDate.textContent = bookingData.date || 'Selecione uma data';
    sumTime.textContent = bookingData.time || '-';
    
    const paxTotal = bookingData.adults + bookingData.children;
    sumPax.textContent = paxTotal > 0 ? `${paxTotal} pessoa(s)` : '-';
    
    stepsContainer.scrollTo(0, 0);
}

// --- Specific Step Logic ---

// Step 2: Calendar
function generateCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    // Mock 31 days starting from a Friday
    for (let i = 0; i < 5; i++) {
        grid.innerHTML += `<div class="calendar-day bg-gray-50 border border-transparent text-gray-400 opacity-50 cursor-not-allowed"></div>`;
    }
    
    for (let i = 1; i <= 31; i++) {
        // Random status mock
        let statusClass = 'bg-brand-green-light/30 border-brand-green/20 hover:bg-brand-green-light cursor-pointer text-brand-green font-medium';
        let status = 'green';
        
        if (currentTourId !== 'dayuse') {
            if (i % 7 === 0) {
                statusClass = 'bg-brand-yellow-light/50 border-brand-yellow/20 hover:bg-brand-yellow-light cursor-pointer text-brand-yellow font-medium';
                status = 'yellow';
            }
            if (i % 11 === 0) {
                statusClass = 'bg-brand-red-light/50 border-brand-red/20 opacity-50 cursor-not-allowed text-brand-red';
                status = 'red';
            }
        }
        if (i < 15) {
            statusClass = 'bg-gray-50 border-transparent text-gray-400 opacity-50 cursor-not-allowed'; // past days
            status = 'gray';
        }
        
        const div = document.createElement('div');
        div.className = `calendar-day border rounded-lg h-10 flex items-center justify-center text-sm transition-colors ${statusClass}`;
        div.textContent = i;
        div.dataset.defaultClass = statusClass; // store default class to restore when unselected
        
        if (status !== 'red' && status !== 'gray') {
            div.onclick = () => selectDate(div, i);
        }
        
        grid.appendChild(div);
    }
}

function selectDate(el, day) {
    document.querySelectorAll('.calendar-day').forEach(d => {
        if (d.dataset.defaultClass) {
            d.className = `calendar-day border rounded-lg h-10 flex items-center justify-center text-sm transition-colors ${d.dataset.defaultClass}`;
        }
    });
    el.className = `calendar-day border rounded-lg h-10 flex items-center justify-center text-sm transition-colors bg-brand-green border-brand-green text-white shadow-md font-bold selected`;
    bookingData.date = `${day} de Outubro de 2026`;
    updateModalUI();
}

// Step 3: Time
function generateTimeSlots() {
    const container = document.getElementById('time-slots-container');
    container.innerHTML = '';
    
    const slots = [
        { time: '08:00', status: 'esgotado' },
        { time: '09:30', status: 'restam' },
        { time: '11:00', status: 'disponivel' },
        { time: '14:00', status: 'disponivel' },
        { time: '15:30', status: 'encerrado' }
    ];
    
    slots.forEach(slot => {
        let badge = '';
        let disabled = '';
        let defaultClass = 'cursor-pointer border-brand-border bg-white hover:border-brand-green/30';
        let onClick = `onclick="selectTime(this, '${slot.time}')"`;
        
        if (slot.status === 'esgotado') {
            badge = `<span class="badge bg-brand-red-light text-brand-red text-xs px-2 py-1 rounded-md font-medium">Esgotado</span>`;
            disabled = 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200';
            defaultClass = disabled;
            onClick = '';
        } else if (slot.status === 'encerrado') {
            badge = `<span class="badge bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">Encerrado</span>`;
            disabled = 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200';
            defaultClass = disabled;
            onClick = '';
        } else if (slot.status === 'restam') {
            badge = `<span class="badge bg-brand-yellow-light text-brand-yellow text-xs px-2 py-1 rounded-md font-medium">Últimas 2 vagas</span>`;
        } else {
            badge = `<span class="badge bg-brand-green-light text-brand-green text-xs px-2 py-1 rounded-md font-medium">Disponível</span>`;
        }
        
        const html = `
        <div class="time-slot border transition-colors ${defaultClass} p-4 rounded-xl flex justify-between items-center" data-default="${defaultClass}" ${onClick}>
            <div class="flex items-center gap-3">
                <i class="ph ph-clock text-xl text-brand-text/60"></i>
                <span class="text-lg font-medium text-brand-text">${slot.time}</span>
            </div>
            ${badge}
        </div>
        `;
        container.innerHTML += html;
    });
    
    if (bookingData.time) {
        document.querySelectorAll('.time-slot').forEach(el => {
            if (el.querySelector('span.text-lg').textContent === bookingData.time) {
                el.className = `time-slot border transition-colors border-brand-green bg-brand-green-light/30 p-4 rounded-xl flex justify-between items-center selected`;
            }
        });
    }
}

function selectTime(el, time) {
    document.querySelectorAll('.time-slot').forEach(d => {
        if (d.dataset.default) d.className = `time-slot border transition-colors ${d.dataset.default} p-4 rounded-xl flex justify-between items-center`;
    });
    el.className = `time-slot border transition-colors border-brand-green bg-brand-green-light/30 p-4 rounded-xl flex justify-between items-center selected`;
    bookingData.time = time;
    updateModalUI();
}

// Step 4: Participants
function updatePax(type, change) {
    const max = tours[currentTourId].maxPax;
    let newAdults = bookingData.adults;
    let newChildren = bookingData.children;
    
    if (type === 'adults') newAdults += change;
    if (type === 'children') newChildren += change;
    
    if (newAdults < 0) newAdults = 0;
    if (newChildren < 0) newChildren = 0;
    
    const total = newAdults + newChildren;
    
    if (total <= max) {
        bookingData.adults = newAdults;
        bookingData.children = newChildren;
        document.getElementById('pax-adults').textContent = bookingData.adults;
        document.getElementById('pax-children').textContent = bookingData.children;
        document.getElementById('pax-warning').classList.add('hidden');
        updateModalUI();
    } else {
        document.getElementById('pax-warning').classList.remove('hidden');
    }
}

// Step 5: Form
function generateParticipantsForm() {
    const container = document.getElementById('participants-container');
    container.innerHTML = '';
    
    const totalPax = bookingData.adults + bookingData.children;
    // -1 because Responsible is already filling the top form
    for (let i = 1; i < totalPax; i++) {
        container.innerHTML += `
        <div class="flex gap-4 p-3 bg-brand-bg/50 rounded-lg border border-brand-border items-center">
            <div class="flex-1">
                <input type="text" class="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-brand-text/40" placeholder="Nome do participante ${i+1}" required>
            </div>
            <div class="w-20 border-l border-brand-border pl-4">
                <input type="number" class="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-brand-text/40" placeholder="Idade" required>
            </div>
        </div>
        `;
    }
    
    if (totalPax <= 1) {
        container.innerHTML = '<p class="text-sm text-brand-text/60 italic">Reserva apenas para o responsável.</p>';
    }
}

// Step 7: Payment
function setupPaymentStep() {
    document.getElementById('final-tour').textContent = tours[currentTourId].title;
    document.getElementById('final-datetime').textContent = `${bookingData.date} às ${bookingData.time}`;
    document.getElementById('final-pax').textContent = `${bookingData.adults} Adultos, ${bookingData.children} Crianças`;
    document.getElementById('final-total').textContent = `R$ ${bookingData.totalPrice.toFixed(2).replace('.', ',')}`;
}

function copyPix(btn) {
    btn.innerHTML = '<i class="ph ph-check-circle text-brand-green"></i><span class="text-brand-green">Copiado!</span>';
    setTimeout(() => {
        btn.innerHTML = '<i class="ph ph-copy"></i><span>Copiar Código Pix</span>';
    }, 2000);
}

function confirmBooking() {
    // Save to local storage
    const participants = Array.from(document.querySelectorAll('#participants-container > div')).map(row => ({
        name: row.querySelector('input[type="text"]').value.trim(),
        age: Number(row.querySelector('input[type="number"]').value)
    }));
    try {
    window.PrototypeReservations.save({
        id: Math.random().toString(36).substr(2, 9),
        tourId: currentTourId,
        tour: tours[currentTourId].title,
        name: document.getElementById('form-name').value.trim(),
        phone: document.getElementById('form-phone').value.trim(),
        adults: bookingData.adults,
        children: bookingData.children,
        participants,
        date: bookingData.date,
        dateISO: window.PrototypeReservations.toISODate(bookingData.date),
        time: bookingData.time,
        total: bookingData.totalPrice,
        status: 'Confirmada',
        payment: 'Pendente',
        createdAt: new Date().toISOString()
    });
    } catch {
        alert('Não foi possível salvar a reserva neste navegador. Verifique se o armazenamento local está permitido e tente novamente.');
        return;
    }
    
    closeModal();
    
    // Quick success animation/alert
    setTimeout(() => {
        alert('Reserva confirmada com sucesso! Te esperamos na Pousada Serra Verde.');
    }, 400);
}

function openMyReservations() {
    const reserves = window.PrototypeReservations.read();
    if (reserves.length === 0) {
        alert('Você ainda não possui reservas.');
        return;
    }
    
    let msg = 'SUAS RESERVAS:\n\n';
    reserves.forEach(r => {
        msg += `- ${r.tour}\n  Data: ${r.date} às ${r.time}\n  Total: R$ ${r.total.toFixed(2)}\n\n`;
    });
    alert(msg);
}

// --- HTML Builder ---
function buildStepsHTML() {
    stepsContainer.innerHTML = `
        <div class="step-pane p-4 md:p-8" id="accommodation-contact">
            <div class="max-w-xl mx-auto py-6 md:py-10 text-center">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center">
                    <i class="ph ph-whatsapp-logo text-4xl" aria-hidden="true"></i>
                </div>
                <h3 class="text-2xl md:text-3xl font-serif font-medium mb-4">Vamos combinar sua estadia?</h3>
                <p class="text-brand-text/70 leading-relaxed mb-6">Sua hospedagem será combinada diretamente com nossa equipe pelo WhatsApp. Vamos ajudar você a escolher a acomodação ideal e confirmar a disponibilidade para as datas desejadas.</p>
                <div class="bg-brand-bg border border-brand-border rounded-xl p-5 text-left mb-6">
                    <h4 class="font-medium mb-3">No atendimento, nossa equipe confirma:</h4>
                    <ul class="text-sm text-brand-text/70 space-y-2">
                        <li class="flex items-center gap-2"><i class="ph ph-calendar-check text-brand-green" aria-hidden="true"></i> Datas e disponibilidade</li>
                        <li class="flex items-center gap-2"><i class="ph ph-users text-brand-green" aria-hidden="true"></i> Quantidade de hóspedes e acomodação</li>
                        <li class="flex items-center gap-2"><i class="ph ph-currency-circle-dollar text-brand-green" aria-hidden="true"></i> Valores e condições da estadia</li>
                    </ul>
                </div>
                <div class="text-left border border-brand-green/20 bg-brand-green-light/30 rounded-xl p-5">
                    <p class="text-xs font-semibold uppercase tracking-wider text-brand-green mb-2">Sua mensagem</p>
                    <p id="accommodation-contact-message" class="text-sm text-brand-text/80 leading-relaxed"></p>
                </div>
                <p class="text-xs text-brand-text/60 mt-5">A reserva será confirmada pela nossa equipe durante o atendimento.</p>
                <p id="accommodation-contact-status" class="mt-5 p-4 rounded-xl bg-brand-green-light text-brand-green text-sm" role="status" hidden>Esta é uma demonstração do contato pelo WhatsApp. O link de atendimento será disponibilizado em breve.</p>
            </div>
        </div>
        <!-- Step 1 -->
        <div class="step-pane p-4 md:p-8 active" id="step-1">
            <div id="st1-gallery" class="mb-6">
                <!-- Javascript will inject the activity gallery here -->
            </div>
            <p id="st1-desc" class="text-brand-text/80 mb-6 leading-relaxed"></p>
            <div class="bg-[#FBF9F4] p-5 rounded-xl border border-brand-border mb-6">
                <h4 class="font-medium mb-3 flex items-center gap-2"><i class="ph ph-warning-circle text-brand-yellow"></i> Requisitos e Observações</h4>
                <ul id="st1-req" class="text-sm text-brand-text/70 space-y-2 list-disc pl-5"></ul>
            </div>
            <div id="st1-standard-prices">
            <div class="flex justify-between items-center p-4 border border-brand-border rounded-xl">
                <div><p class="font-medium" id="st1-label-adult">Adulto</p><p class="text-sm text-brand-text/60" id="st1-sub-adult">A partir de 8 anos</p></div>
                <div class="font-bold text-lg" id="st1-price-adult"></div>
            </div>
            <div class="flex justify-between items-center p-4 border border-brand-border rounded-xl mt-3">
                <div><p class="font-medium" id="st1-label-child">Criança</p><p class="text-sm text-brand-text/60" id="st1-sub-child">De 0 a 7 anos</p></div>
                <div class="font-bold text-lg" id="st1-price-child"></div>
            </div>
            </div>
            <div id="st1-room-prices" hidden>
                <div class="flex justify-between items-center gap-4 p-4 border border-brand-border rounded-xl">
                    <p class="font-medium" data-room-label>Quarto duplo</p><p class="font-bold text-lg whitespace-nowrap" data-room-price>R$ 350,00</p>
                </div>
                <div class="flex justify-between items-center gap-4 p-4 border border-brand-border rounded-xl mt-3">
                    <p class="font-medium" data-room-label>Quarto triplo</p><p class="font-bold text-lg whitespace-nowrap" data-room-price>R$ 450,00</p>
                </div>
                <div class="flex justify-between items-center gap-4 p-4 border border-brand-border rounded-xl mt-3">
                    <p class="font-medium" data-room-label>Quarto quádruplo</p><p class="font-bold text-lg whitespace-nowrap" data-room-price>R$ 550,00</p>
                </div>
                <p class="text-sm text-brand-text/60 mt-4 flex items-start gap-2"><i class="ph ph-info mt-0.5" aria-hidden="true"></i><span>Valores sujeitos a alterações em feriados.</span></p>
            </div>
        </div>
        
        <!-- Step 2 -->
        <div class="step-pane p-4 md:p-8" id="step-2">
            <div class="mb-6">
                <h3 class="text-xl font-serif font-medium tracking-tight mb-2">Escolha a Data</h3>
                <p class="text-brand-text/60 text-sm">Selecione o dia desejado para a sua experiência.</p>
            </div>
            <div class="border border-brand-border rounded-2xl p-4 md:p-6 mb-6 shadow-sm bg-white">
                <div class="flex justify-between items-center mb-6">
                    <button class="w-8 h-8 rounded-full hover:bg-brand-bg flex items-center justify-center"><i class="ph ph-caret-left"></i></button>
                    <h4 class="font-medium text-lg">Outubro 2026</h4>
                    <button class="w-8 h-8 rounded-full hover:bg-brand-bg flex items-center justify-center"><i class="ph ph-caret-right"></i></button>
                </div>
                <div class="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-brand-text/50">
                    <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SAB</div>
                </div>
                <div class="grid grid-cols-7 gap-1 md:gap-2" id="calendar-grid"></div>
            </div>
            <div class="flex flex-wrap gap-4 text-xs font-medium text-brand-text/60 justify-center">
                <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-brand-green-light border border-brand-green/20"></div> Disponível</div>
                <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-brand-yellow-light border border-brand-yellow/20"></div> Últimas vagas</div>
                <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-gray-200"></div> Esgotado / Sem saída</div>
            </div>
        </div>

        <!-- Step 3 -->
        <div class="step-pane p-4 md:p-8" id="step-3">
            <div class="mb-6">
                <h3 class="text-xl font-serif font-medium tracking-tight mb-2">Horário de Saída</h3>
                <p class="text-brand-text/60 text-sm">Os horários podem variar conforme as condições climáticas.</p>
            </div>
            <div class="space-y-3" id="time-slots-container"></div>
        </div>

        <!-- Step 4 -->
        <div class="step-pane p-4 md:p-8" id="step-4">
            <div class="mb-6">
                <h3 class="text-xl font-serif font-medium tracking-tight mb-2">Quem vai participar?</h3>
                <p class="text-brand-text/60 text-sm">Capacidade máxima: <span id="max-pax-display"></span> pessoas.</p>
            </div>
            <div class="space-y-4 mb-6">
                <div class="flex items-center justify-between p-4 border border-brand-border rounded-xl">
                    <div>
                        <p class="font-medium text-lg">Adultos</p>
                        <p class="text-sm text-brand-text/60" id="st4-price-adult"></p>
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="w-10 h-10 rounded-full bg-brand-bg text-brand-text flex items-center justify-center hover:bg-gray-200 transition-colors" onclick="updatePax('adults', -1)"><i class="ph ph-minus"></i></button>
                        <span class="font-bold text-xl w-6 text-center" id="pax-adults">2</span>
                        <button class="w-10 h-10 rounded-full bg-brand-bg text-brand-text flex items-center justify-center hover:bg-gray-200 transition-colors" onclick="updatePax('adults', 1)"><i class="ph ph-plus"></i></button>
                    </div>
                </div>
                <div class="flex items-center justify-between p-4 border border-brand-border rounded-xl">
                    <div>
                        <p class="font-medium text-lg">Crianças</p>
                        <p class="text-sm text-brand-text/60" id="st4-price-child"></p>
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="w-10 h-10 rounded-full bg-brand-bg text-brand-text flex items-center justify-center hover:bg-gray-200 transition-colors" onclick="updatePax('children', -1)"><i class="ph ph-minus"></i></button>
                        <span class="font-bold text-xl w-6 text-center" id="pax-children">0</span>
                        <button class="w-10 h-10 rounded-full bg-brand-bg text-brand-text flex items-center justify-center hover:bg-gray-200 transition-colors" onclick="updatePax('children', 1)"><i class="ph ph-plus"></i></button>
                    </div>
                </div>
            </div>
            <div id="pax-warning" class="hidden bg-brand-red-light text-brand-red p-3 rounded-lg text-sm font-medium text-center">
                <i class="ph ph-warning"></i> Capacidade máxima atingida para este horário.
            </div>
        </div>

        <!-- Step 5 -->
        <div class="step-pane p-4 md:p-8" id="step-5">
            <div class="mb-6">
                <h3 class="text-xl font-serif font-medium tracking-tight mb-2">Dados da Reserva</h3>
                <p class="text-brand-text/60 text-sm">Preencha os dados do responsável pela reserva.</p>
            </div>
            <form class="space-y-4" id="booking-form" onsubmit="event.preventDefault()">
                <div>
                    <label class="block text-sm font-medium mb-1 ml-1">Nome Completo do Responsável *</label>
                    <input type="text" id="form-name" class="input-field" placeholder="Ex: João da Silva" required>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 ml-1">WhatsApp *</label>
                        <input type="tel" id="form-phone" class="input-field" placeholder="(00) 00000-0000" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 ml-1">CPF *</label>
                        <input type="text" id="form-cpf" class="input-field" placeholder="000.000.000-00" required>
                    </div>
                </div>
                <div class="pt-6 mt-6 border-t border-brand-border">
                    <h4 class="font-medium mb-4">Dados dos Participantes</h4>
                    <div id="participants-container" class="space-y-3"></div>
                </div>
            </form>
        </div>

        <!-- Step 6 -->
        <div class="step-pane p-4 md:p-8" id="step-6">
            <div class="mb-6">
                <h3 class="text-xl font-serif font-medium tracking-tight mb-2">Termo de Responsabilidade</h3>
                <p class="text-brand-text/60 text-sm">Por favor, leia atentamente as regras e condições.</p>
            </div>
            <div class="bg-gray-50 border border-brand-border rounded-xl p-4 md:p-6 h-64 overflow-y-auto mb-6 terms-box text-sm text-brand-text/80 space-y-4">
                <p><strong>1. DA ATIVIDADE</strong><br>O participante declara ter ciência de que a atividade envolve riscos inerentes ao contato com a natureza e animais.</p>
                <p><strong>2. DA SAÚDE</strong><br>Declaro estar em perfeitas condições de saúde física e mental para a prática da atividade, não possuindo restrições médicas.</p>
                <p><strong>3. DA SEGURANÇA</strong><br>Comprometo-me a seguir rigorosamente todas as instruções dos guias e instrutores, bem como utilizar adequadamente os equipamentos de segurança fornecidos durante todo o trajeto.</p>
                <p><strong>4. DO CANCELAMENTO</strong><br>Em caso de condições climáticas adversas, a Pousada Serra Verde reserva-se o direito de cancelar ou reagendar a atividade para garantir a segurança de todos os envolvidos.</p>
            </div>
            <label class="flex items-start gap-3 cursor-pointer group">
                <div class="mt-0.5">
                    <input type="checkbox" id="terms-checkbox" class="w-5 h-5 rounded border-brand-border text-brand-green focus:ring-brand-green accent-brand-green">
                </div>
                <span class="text-sm font-medium group-hover:text-brand-green transition-colors">Li e aceito o termo de responsabilidade em nome de todos os participantes.</span>
            </label>
        </div>

        <!-- Step 7 -->
        <div class="step-pane p-4 md:p-8" id="step-7">
            <div class="bg-white border border-brand-border rounded-xl p-5 mb-6 shadow-sm">
                <h4 class="font-serif font-medium tracking-tight mb-4 pb-3 border-b border-brand-border">Resumo Final</h4>
                <div class="flex justify-between text-sm mb-2"><span class="text-brand-text/60">Atividade</span><strong id="final-tour" class="text-right"></strong></div>
                <div class="flex justify-between text-sm mb-2"><span class="text-brand-text/60">Data e Hora</span><strong id="final-datetime" class="text-right"></strong></div>
                <div class="flex justify-between text-sm mb-4"><span class="text-brand-text/60">Participantes</span><strong id="final-pax" class="text-right"></strong></div>
                <div class="flex justify-between items-center pt-3 border-t border-brand-border">
                    <span class="font-medium">Total a pagar</span>
                    <strong class="text-2xl text-brand-green" id="final-total"></strong>
                </div>
            </div>
            <div class="flex gap-2 mb-4 p-1 bg-brand-bg rounded-xl">
                <button class="flex-1 py-2 text-sm font-medium rounded-lg bg-white shadow-sm text-brand-green border border-brand-green/20" id="tab-pix">Pix</button>
                <button class="flex-1 py-2 text-sm font-medium rounded-lg text-brand-text/60 hover:text-brand-text" id="tab-card">Cartão de Crédito</button>
            </div>
            <div class="text-center p-6 border border-brand-border rounded-xl bg-gray-50 flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" class="w-32 h-32 mb-4 mix-blend-multiply opacity-80">
                <p class="text-sm text-brand-text/70 mb-4">Escaneie o QR Code ou copie o código abaixo para pagar.</p>
                <div class="w-full max-w-sm bg-white border border-brand-border rounded-lg p-3 mb-4 flex items-center justify-center shadow-inner">
                    <span class="text-xs text-brand-text/50 truncate font-mono tracking-widest text-center">00020126360014BR.GOV.BCB.PIX...</span>
                </div>
                <button class="flex items-center gap-2 bg-white border border-brand-green/30 text-brand-green px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-green-light/20 transition-colors w-full max-w-sm justify-center shadow-sm" onclick="copyPix(this)">
                    <i class="ph ph-copy text-lg"></i>
                    <span>Copiar Código Pix</span>
                </button>
            </div>
        </div>
    `;
}
