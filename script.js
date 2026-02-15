document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrDisplayContainer = document.getElementById('qr-display-container');
    const qrCodeDiv = document.getElementById('qrcode');
    const emptyState = document.getElementById('empty-state');
    const copyImageBtn = document.getElementById('copy-image-btn');
    const copyEmbedBtn = document.getElementById('copy-embed-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');
    const toast = document.getElementById('toast');

    let qrcode = null;

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    const generateQR = () => {
        const text = qrInput.value.trim();
        if (!text) {
            showToast("Please enter some text or a URL");
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
    };

    generateBtn.addEventListener('click', generateQR);

    qrInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateQR();
    });

    copyImageBtn.addEventListener('click', async () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) return showToast("Click generate first");

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            showToast("Copied to clipboard");
        } catch (err) {
            showToast("Failed to copy image");
        }
    });

    copyEmbedBtn.addEventListener('click', async () => {
        const img = qrCodeDiv.querySelector('img');
        const canvas = qrCodeDiv.querySelector('canvas');
        const src = (img && img.src && img.src.startsWith('data:')) ? img.src : canvas.toDataURL();

        if (!src) return showToast("Click generate first");

        try {
            await navigator.clipboard.writeText(`<img src="${src}" alt="QR Code" />`);
            showToast("Embed code copied");
        } catch (err) {
            showToast("Failed to copy");
        }
    });

    downloadBtn.addEventListener('click', () => {
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) return showToast("Click generate first");

        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `qr-${Date.now()}.png`;
        link.click();
    });

    clearBtn.addEventListener('click', () => {
        qrInput.value = '';
        qrInput.focus();
        qrDisplayContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
    });
});
