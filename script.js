document.addEventListener('DOMContentLoaded', () => {
    const typeNav = document.getElementById('type-nav');
    const typeForms = document.querySelectorAll('.type-form');
    const navItems = document.querySelectorAll('.nav-item');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const qrDisplayContainer = document.getElementById('qr-display-container');
    const qrCodeDiv = document.getElementById('qrcode');
    const emptyState = document.getElementById('empty-state');
    const toast = document.getElementById('toast');

    let currentType = 'url';
    let qrcode = null;

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // Tab Switching Logic
    typeNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-item');
        if (!btn) return;

        currentType = btn.dataset.type;

        // Update UI
        navItems.forEach(item => item.classList.remove('active'));
        btn.classList.add('active');

        typeForms.forEach(form => form.classList.add('hidden'));
        document.getElementById(`${currentType}-form`).classList.remove('hidden');
    });

    const getFormattedText = () => {
        switch (currentType) {
            case 'url':
                return document.getElementById('input-url').value.trim();

            case 'vcard':
                const name = document.getElementById('vcard-name').value.trim();
                const phone = document.getElementById('vcard-phone').value.trim();
                const email = document.getElementById('vcard-email').value.trim();
                if (!name) return "";
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;

            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const pass = document.getElementById('wifi-pass').value.trim();
                const security = document.getElementById('wifi-type').value;
                if (!ssid) return "";
                return `WIFI:S:${ssid};T:${security};P:${pass};;`;

            case 'crypto':
                const cryptoType = document.getElementById('crypto-type').value;
                const address = document.getElementById('crypto-address').value.trim();
                const amount = document.getElementById('crypto-amount').value;
                if (!address) return "";
                return `${cryptoType}:${address}${amount ? `?amount=${amount}` : ""}`;

            case 'email':
                const emailTo = document.getElementById('email-to').value.trim();
                const emailSub = document.getElementById('email-subject').value.trim();
                const emailBody = document.getElementById('email-body').value.trim();
                if (!emailTo) return "";
                return `MATMSG:TO:${emailTo};SUB:${emailSub};BODY:${emailBody};;`;

            default:
                return "";
        }
    };

    const generateQR = () => {
        const text = getFormattedText();

        if (!text) {
            showToast("Please fill in the required fields");
            return;
        }

        qrCodeDiv.innerHTML = '';
        qrDisplayContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');

        qrcode = new QRCode(qrCodeDiv, {
            text: text,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        showToast("QR Code Generated");
    };

    generateBtn.addEventListener('click', generateQR);

    clearBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        qrDisplayContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        qrCodeDiv.innerHTML = '';
    });

    // Handle existing keyword logic from earlier
    const keywordCloud = document.getElementById('keyword-cloud');
    if (keywordCloud) {
        keywordCloud.addEventListener('click', (e) => {
            if (e.target.classList.contains('keyword-tag')) {
                // Force to URL type for search queries
                document.querySelector('[data-type="url"]').click();
                document.getElementById('input-url').value = e.target.textContent;
                generateQR();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Action buttons (Copy, Download, etc.)
    document.getElementById('download-btn').addEventListener('click', () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `qr-${currentType}-${Date.now()}.png`;
        link.click();
    });

    document.getElementById('copy-image-btn').addEventListener('click', async () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) return;
        try {
            const blob = await new Promise(r => canvas.toBlob(r));
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast("Image copied!");
        } catch (e) { showToast("Copy failed"); }
    });

    document.getElementById('copy-embed-btn').addEventListener('click', () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const embedCode = `<img src="${url}" alt="QR Code" width="256" height="256">`;
        navigator.clipboard.writeText(embedCode).then(() => {
            showToast("Embed code copied!");
        });
    });
});
