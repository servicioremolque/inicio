/*
  CONFIGURACIÓN RÁPIDA — edita estos valores antes de publicar la página.
  WhatsApp debe escribirse con código de país y solo dígitos, sin +, espacios ni guiones.
  Ejemplo de formato para Chile: 56912345678
*/
const SITE_CONFIG = {
  businessName: 'Grúa Asistencia',
  whatsappNumber: '569XXXXXXXX', // REEMPLAZAR por el número real antes de publicar
  coverage: 'Tu ciudad y alrededores'
};

let userGpsUrl = '';

const whatsappNumberIsConfigured = () =>
  /^\d{10,15}$/.test(SITE_CONFIG.whatsappNumber) && !SITE_CONFIG.whatsappNumber.includes('X');

function showConfigNotice() {
  const feedback = document.querySelector('#form-feedback');
  const notice = 'Configura el número real de teléfono/WhatsApp en el archivo script.js (SITE_CONFIG.whatsappNumber) antes de publicar.';
  if (feedback) {
    feedback.textContent = notice;
    feedback.style.background = '#FEF2F2';
    feedback.style.color = '#B91C1C';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    window.alert(notice);
  }
}

function makeWhatsAppUrl(message = 'Hola, necesito consultar por un servicio de grúa. ¿Me pueden ayudar?') {
  if (!whatsappNumberIsConfigured()) return null;
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  const url = makeWhatsAppUrl(message);
  if (!url) {
    showConfigNotice();
    return false;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

// 1. Reemplazar datos del negocio automáticamente
document.querySelectorAll('[data-business-name]').forEach((el) => {
  el.textContent = SITE_CONFIG.businessName;
});
document.querySelectorAll('[data-coverage]').forEach((el) => {
  el.textContent = SITE_CONFIG.coverage;
});
document.querySelector('#current-year').textContent = new Date().getFullYear();
document.title = `${SITE_CONFIG.businessName} | Remolque y traslado de vehículos`;

// 2. Botones de WhatsApp directo y Llamada telefónica
document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    openWhatsApp();
  });
});

document.querySelectorAll('[data-phone]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (!whatsappNumberIsConfigured()) {
      showConfigNotice();
      return;
    }
    window.location.href = `tel:+${SITE_CONFIG.whatsappNumber}`;
  });
});

// 3. Selección automática de servicio al hacer clic en las tarjetas
document.querySelectorAll('[data-service-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const reasonSelect = document.querySelector('#reason');
    const service = link.getAttribute('data-service-link');
    const option = Array.from(reasonSelect.options).find(
      (item) => item.textContent.trim() === service
    );
    if (option) {
      reasonSelect.value = option.value;
      reasonSelect.focus();
    }
  });
});

// 4. Botón para obtener ubicación GPS fácilmente (pensado para emergencias en ruta)
const locateBtn = document.querySelector('#locate-btn');
const pickupInput = document.querySelector('#pickup');
const gpsStatus = document.querySelector('#gps-status');

if (locateBtn && 'geolocation' in navigator) {
  locateBtn.addEventListener('click', () => {
    gpsStatus.textContent = 'Buscando tu ubicación por GPS...';
    gpsStatus.style.color = '#2563EB';
    locateBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        userGpsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        
        if (!pickupInput.value.trim()) {
          pickupInput.value = `Ubicación GPS detectada (${lat}, ${lng})`;
        }
        gpsStatus.textContent = '✓ Ubicación GPS adjuntada correctamente al mensaje.';
        gpsStatus.style.color = '#15803D';
        locateBtn.disabled = false;
      },
      () => {
        gpsStatus.textContent = 'No pudimos obtener el GPS. Por favor escribe la calle o punto de referencia.';
        gpsStatus.style.color = '#B91C1C';
        locateBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
} else if (locateBtn) {
  locateBtn.style.display = 'none';
}

// 5. Envío del formulario hacia WhatsApp
const requestForm = document.querySelector('#request-form');
requestForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const feedback = document.querySelector('#form-feedback');
  feedback.textContent = '';

  if (!requestForm.reportValidity()) return;

  const formData = new FormData(requestForm);
  const name = String(formData.get('name') || '').trim();
  const vehicle = String(formData.get('vehicle') || '').trim();
  const reason = String(formData.get('reason') || '').trim();
  const pickup = String(formData.get('pickup') || '').trim();
  const destination = String(formData.get('destination') || '').trim();
  const details = String(formData.get('details') || '').trim();

  const lines = [
    'Hola, necesito solicitar un servicio de grúa.',
    '',
    ...(name ? [`*Nombre:* ${name}`] : []),
    `*Tipo de vehículo:* ${vehicle}`,
    `*Motivo:* ${reason}`,
    `*Ubicación actual:* ${pickup}`,
    ...(userGpsUrl ? [`*Mapa GPS:* ${userGpsUrl}`] : []),
    ...(destination ? [`*Destino:* ${destination}`] : []),
    ...(details ? [`*Detalles:* ${details}`] : []),
    '',
    '¿Me pueden confirmar disponibilidad y valor estimado?'
  ];

  const opened = openWhatsApp(lines.join('\n'));
  if (opened) {
    feedback.textContent = '✓ Se abrió WhatsApp con tu solicitud lista. Solo presiona Enviar en tu teléfono.';
    feedback.style.background = '#DCFCE7';
    feedback.style.color = '#15803D';
  }
});

// 6. Menú móvil accesible y sombra en header al hacer scroll
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  mainNav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación');
  mainNav.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
});

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 16);
}, { passive: true });

// 7. Animaciones suaves al hacer Scroll (IntersectionObserver)
const animatedElements = document.querySelectorAll('.reveal-up, .reveal-scale');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, Number(delay));
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
  );

  animatedElements.forEach((el) => observer.observe(el));
} else {
  animatedElements.forEach((el) => el.classList.add('is-visible'));
}