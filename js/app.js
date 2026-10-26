/**
 * Midlaj Palanagad - Digital Contact Card & Portfolio
 * Core Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupVCardDownload();
  setupCopyTriggers();
  setupShareModal();
  setupQrCode();
}

/**
 * 1. vCard (.vcf) Generator and Downloader
 */
function setupVCardDownload() {
  const saveBtn = document.getElementById('saveContactBtn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    // Standard vCard 3.0 format for iPhone & Android Contacts
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Palanagad;Midlaj;;;',
      'FN:Midlaj Palanagad',
      'ORG:Event Planning & Production',
      'TITLE:Event Planner & Technician',
      'TEL;TYPE=CELL,VOICE,PREF:+916235805552',
      'EMAIL;TYPE=INTERNET,PREF:midlajryl@gmail.com',
      'ADR;TYPE=WORK:;;Thamarassery;Kerala;;;India',
      'NOTE:Event Planner & Technician based in Thamarassery, Kerala. Specialist in Stage Lighting, Live Sound, AV Systems & Event Management.',
      'URL:https://maps.google.com/?q=Thamarassery,+Kerala,+India',
      'END:VCARD'
    ].join('\r\n');

    try {
      const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
      const downloadLink = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      downloadLink.href = url;
      downloadLink.setAttribute('download', 'Midlaj_Palanagad.vcf');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }, 150);

      showToast('Contact card downloaded successfully!');
    } catch (err) {
      console.error('Failed to create vCard download:', err);
      showToast('Could not auto-download. Please call or WhatsApp!');
    }
  });
}

/**
 * 2. Copy Triggers for Phone and Email
 */
function setupCopyTriggers() {
  const copyPhone = document.getElementById('copyPhoneTrigger');
  const copyEmail = document.getElementById('copyEmailTrigger');

  if (copyPhone) {
    copyPhone.addEventListener('click', () => {
      const phone = copyPhone.getAttribute('data-copy') || '+916235805552';
      copyToClipboard(phone, 'Phone number copied to clipboard!');
    });
  }

  if (copyEmail) {
    copyEmail.addEventListener('click', () => {
      const email = copyEmail.getAttribute('data-copy') || 'midlajryl@gmail.com';
      copyToClipboard(email, 'Email copied to clipboard!');
    });
  }
}

/**
 * Helper to copy text with modern API + fallback
 */
function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage))
      .catch(() => fallbackCopy(text, successMessage));
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    console.error('Fallback copy failed', err);
    showToast('Failed to copy. Please copy manually.');
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * 3. Share Modal & Dynamic QR Code
 */
let qrCodeInstance = null;

function setupQrCode() {
  const qrcodeBox = document.getElementById('qrcodeBox');
  if (!qrcodeBox) return;

  const currentUrl = window.location.href || 'https://midlajpalanagad.com';

  if (typeof QRCode !== 'undefined') {
    qrcodeBox.innerHTML = '';
    qrCodeInstance = new QRCode(qrcodeBox, {
      text: currentUrl,
      width: 170,
      height: 170,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    // Fallback if QRCode lib fails
    qrcodeBox.innerHTML = `
      <div style="width:170px;height:170px;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border-radius:12px;font-size:12px;color:#64748b;text-align:center;padding:10px;">
        Scan profile link directly
      </div>
    `;
  }
}

function setupShareModal() {
  const modal = document.getElementById('shareModal');
  const openBtnHeader = document.getElementById('headerShareBtn');
  const openBtnCard = document.getElementById('btnShareModalTrigger');
  const closeBtn = document.getElementById('modalCloseBtn');
  const copyLinkBtn = document.getElementById('modalCopyLinkBtn');
  const copyLinkText = document.getElementById('copyLinkText');
  const nativeShareBtn = document.getElementById('modalNativeShareBtn');

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (openBtnHeader) openBtnHeader.addEventListener('click', openModal);
  if (openBtnCard) openBtnCard.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close when clicking on backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Native Web Share API
  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'Midlaj Palanagad - Event Planner & Technician',
        text: 'Contact Card of Midlaj Palanagad - Event Planner & Technician in Thamarassery, Kerala.',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          showToast('Shared successfully!');
          closeModal();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Share error:', err);
          }
        }
      } else {
        // Fallback: copy link
        copyToClipboard(window.location.href, 'Link copied to clipboard!');
        closeModal();
      }
    });
  }

  // Copy Profile Link
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      copyToClipboard(window.location.href, 'Profile link copied to clipboard!');
      if (copyLinkText) {
        const originalText = copyLinkText.textContent;
        copyLinkText.textContent = 'Copied!';
        setTimeout(() => {
          copyLinkText.textContent = originalText;
        }, 2000);
      }
    });
  }
}

/**
 * 4. Animated Toast System
 */
let toastTimeout = null;

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // Clear existing
  container.innerHTML = '';
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
