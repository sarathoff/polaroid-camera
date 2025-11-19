
// --- STATE MANAGEMENT ---
let stream = null;
let capturedPhoto = null;
let currentFacingMode = 'user'; // 'user' for front camera, 'environment' for back camera

const defaultAdjustments = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    grayscale: 0,
};
let adjustments = { ...defaultAdjustments };

let selectedFont = "'Patrick Hand', cursive"; // Default to Patrick Hand for doodle style
let selectedFilterPreset = 'none';
let selectedFrame = 'default'; // Frame selection
let selectedFrameColor = '#FFFFFF'; // Frame color
let selectedTextColor = '#333333'; // Text color
let selectedLayout = 'single'; // Layout: 'single', 'grid', 'photostrip'
let activeStickers = [];
let multiPhotos = [];
let isMultiCapture = false;

// --- DOM ELEMENTS ---
const video = document.getElementById('videoElement');
const videoPlaceholder = document.getElementById('videoPlaceholder');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNumber = document.getElementById('countdownNumber');
const cameraControls = document.getElementById('cameraControls');
const photoControls = document.getElementById('photoControls');
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const captureBtn = document.getElementById('captureBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const emptyState = document.getElementById('emptyState');
const polaroidPreview = document.getElementById('polaroidPreview');
const customizationCard = document.getElementById('customizationCard');
const customTextEl = document.getElementById('customText');
const customFrameColorInput = document.getElementById('customFrameColor');
const customTextColorInput = document.getElementById('customTextColor');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const shareBtn = document.getElementById('shareBtn');
const finalDownloadBtn = document.getElementById('finalDownloadBtn');
const canvas = document.getElementById('canvas');

// --- CONFIGURATION ---
const fonts = [
    { name: 'Patrick Hand', family: "'Patrick Hand', cursive" },
    { name: 'Caveat', family: "'Caveat', cursive" },
    { name: 'Dancing Script', family: "'Dancing Script', cursive" },
    { name: 'Indie Flower', family: "'Indie Flower', cursive" },
    { name: 'Architects Daughter', family: "'Architects Daughter', cursive" },
    { name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
    { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" }
];

const adjustmentConfigs = [
    { id: 'brightness', name: 'Brightness', min: 0, max: 200, unit: '%' },
    { id: 'contrast', name: 'Contrast', min: 0, max: 200, unit: '%' },
    { id: 'saturate', name: 'Saturation', min: 0, max: 200, unit: '%' },
    { id: 'sepia', name: 'Sepia', min: 0, max: 100, unit: '%' },
    { id: 'grayscale', name: 'Grayscale', min: 0, max: 100, unit: '%' }
];

// Filter Presets
const filterPresets = [
    { id: 'none', name: 'Original', values: { brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0 } },
    { id: 'vintage', name: 'Vintage', values: { brightness: 110, contrast: 120, saturate: 130, sepia: 40, grayscale: 0 } },
    { id: 'classic', name: 'Classic', values: { brightness: 105, contrast: 110, saturate: 100, sepia: 20, grayscale: 0 } },
    { id: 'bw', name: 'B&W', values: { brightness: 100, contrast: 120, saturate: 100, sepia: 0, grayscale: 100 } },
    { id: 'warm', name: 'Warm', values: { brightness: 110, contrast: 100, saturate: 140, sepia: 30, grayscale: 0 } },
    { id: 'retro', name: 'Retro', values: { brightness: 110, contrast: 90, saturate: 100, sepia: 60, grayscale: 0 } },
    { id: 'dreamy', name: 'Dreamy', values: { brightness: 110, contrast: 90, saturate: 140, sepia: 0, grayscale: 0 } },
    { id: 'cool', name: 'Cool', values: { brightness: 105, contrast: 110, saturate: 80, sepia: 0, grayscale: 0 } },
    { id: 'faded', name: 'Faded', values: { brightness: 115, contrast: 85, saturate: 70, sepia: 0, grayscale: 0 } },
    { id: 'noir', name: 'Noir', values: { brightness: 90, contrast: 150, saturate: 100, sepia: 0, grayscale: 100 } },
    { id: 'sunset', name: 'Sunset', values: { brightness: 110, contrast: 110, saturate: 160, sepia: 50, grayscale: 0 } },
    { id: 'arctic', name: 'Arctic', values: { brightness: 120, contrast: 100, saturate: 60, sepia: 0, grayscale: 0 } }
];

// Frame Presets
const framePresets = [
    { id: 'default', name: 'Classic', className: '' },
    { id: 'black', name: 'Black', className: 'black-frame' },
    { id: 'rough', name: 'Rough Edge', className: 'rough-edge-frame' },
    { id: 'pastel-pink', name: 'Pastel Pink', className: 'pastel-frame' },
    { id: 'pastel-blue', name: 'Pastel Blue', className: 'pastel-frame blue' },
    { id: 'pastel-green', name: 'Pastel Green', className: 'pastel-frame green' },
    { id: 'film-strip', name: 'Film Strip', className: 'film-strip-frame' }
];

// Layout Presets
const layoutPresets = [
    { id: 'single', name: 'Single Photo', icon: '📷', filter: 'none' },
    { id: 'grid', name: '2x2 Grid', icon: '🔲', filter: 'none' },
    { id: 'photostrip', name: 'Photo Strip', icon: '📸', filter: 'none' },
    { id: 'vintage', name: 'Vintage Strip', icon: '📼', filter: 'vintage' },
    { id: 'retro', name: 'Retro Grid', icon: '🎞️', filter: 'retro' },
    { id: 'bw-strip', name: 'B&W Classic', icon: '🎬', filter: 'bw' }
];

// Frame Color Presets
const frameColorPresets = [
    '#FFFFFF', '#F8F5F2', '#EAE3DC', '#2C2C2C', '#E57373', '#A7D9EE', '#B4EEB4', '#FFD1DC', '#FFC0CB'
];

// Text Color Presets
const textColorPresets = [
    '#333333', '#FFFFFF', '#E57373', '#A7D9EE', '#B4EEB4', '#FFD1DC', '#4B0082', '#000000'
];

// Text Templates - Expanded
const textTemplates = [
    // Celebrations
    { text: 'Happy Birthday! 🎂', emoji: '🎂', category: 'celebration' },
    { text: 'Happy Anniversary! 💕', emoji: '💕', category: 'celebration' },
    { text: 'Congratulations! 🎉', emoji: '🎉', category: 'celebration' },
    { text: 'Happy Graduation! 🎓', emoji: '🎓', category: 'celebration' },
    { text: 'Happy New Year! 🎊', emoji: '🎊', category: 'celebration' },
    { text: 'Merry Christmas! 🎄', emoji: '🎄', category: 'celebration' },
    { text: 'Happy Halloween! 🎃', emoji: '🎃', category: 'celebration' },
    { text: 'Happy Valentine\'s! 💝', emoji: '💝', category: 'celebration' },

    // Love & Friendship
    { text: 'Love You! ❤️', emoji: '❤️', category: 'love' },
    { text: 'Best Friends Forever! 👯', emoji: '👯', category: 'love' },
    { text: 'You\'re Amazing! 💖', emoji: '💖', category: 'love' },
    { text: 'Miss You! 💕', emoji: '💕', category: 'love' },
    { text: 'Thinking of You 💭', emoji: '💭', category: 'love' },

    // Fun & Vibes
    { text: 'Happy Friday! 🎉', emoji: '🎉', category: 'fun' },
    { text: 'Weekend Vibes ✨', emoji: '✨', category: 'fun' },
    { text: 'Good Times! 😊', emoji: '😊', category: 'fun' },
    { text: 'Squad Goals 💯', emoji: '💯', category: 'fun' },
    { text: 'Living My Best Life 🌟', emoji: '🌟', category: 'fun' },
    { text: 'Party Time! 🥳', emoji: '🥳', category: 'fun' },
    { text: 'Let\'s Go! 🚀', emoji: '🚀', category: 'fun' },

    // Memories & Moments
    { text: 'Making Memories 📸', emoji: '📸', category: 'memory' },
    { text: 'Blessed 🙏', emoji: '🙏', category: 'memory' },
    { text: 'Feeling Grateful 💖', emoji: '💖', category: 'memory' },
    { text: 'Forever Moment ⏰', emoji: '⏰', category: 'memory' },
    { text: 'Unforgettable 🌈', emoji: '🌈', category: 'memory' },

    // Travel & Adventure
    { text: 'Adventure Time! 🗺️', emoji: '🗺️', category: 'travel' },
    { text: 'Vacation Mode ✈️', emoji: '✈️', category: 'travel' },
    { text: 'Beach Vibes 🏖️', emoji: '🏖️', category: 'travel' },
    { text: 'Wanderlust 🌍', emoji: '🌍', category: 'travel' }
];

// Stickers
const stickers = [
    '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜',
    '⭐', '✨', '🌟', '💫', '🌙', '☀️', '🌈', '☁️',
    '😊', '😍', '🥰', '😎', '🤩', '😘', '😂', '🤗',
    '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰',
    '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐',
    '🦋', '🐝', '🐞', '🦄', '🐱', '🐶', '🐻',
    '📷', '🎵', '🎶', '🎸', '🎨', '✏️', '📝'
];

// --- INITIALIZATION ---

function initializeUI() {
    // Filter Presets
    const filterPresetsContainer = document.getElementById('filterPresets');
    filterPresetsContainer.innerHTML = '';
    filterPresets.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'option-btn' + (preset.id === selectedFilterPreset ? ' active' : '');
        btn.innerHTML = `<div class="option-name">${preset.name}</div>`;
        btn.onclick = () => applyFilterPreset(preset.id, btn);
        filterPresetsContainer.appendChild(btn);
    });

    // Adjustments (removed - not in new UI)
    // const adjustContainer = document.getElementById('tab-adjust');
    // if (adjustContainer) {
    //     adjustContainer.innerHTML = '';
    //     adjustmentConfigs.forEach(adj => {
    //         const control = document.createElement('div');
    //         control.className = 'adjustment-control';
    //         control.innerHTML = `
    //             <label for="${adj.id}">
    //                 <span>${adj.name}</span>
    //                 <span class="value" id="${adj.id}Value">${adjustments[adj.id]}%</span>
    //             </label>
    //             <input type="range" id="${adj.id}" min="${adj.min}" max="${adj.max}" value="${adjustments[adj.id]}">
    //         `;
    //         adjustContainer.appendChild(control);

    //         document.getElementById(adj.id).addEventListener('input', (e) => {
    //             adjustments[adj.id] = e.target.value;
    //             document.getElementById(`${adj.id}Value`).textContent = `${e.target.value}%`;
    //             selectedFilterPreset = 'custom';
    //             updateFilterPresetButtons();
    //             debouncedRender();
    //         });
    //     });
    // }

    // Fonts - Compact version for customize section
    const fontContainer = document.getElementById('fontOptions');
    if (fontContainer) {
        fontContainer.innerHTML = '';
        // Show only first 4 fonts for compact display
        const compactFonts = fonts.slice(0, 4);
        compactFonts.forEach(font => {
            const btn = document.createElement('button');
            btn.className = 'font-option-btn' + (font.family === selectedFont ? ' active' : '');
            btn.textContent = 'Aa';
            btn.style.fontFamily = font.family;
            btn.title = font.name;
            btn.onclick = () => selectFont(font.family, btn);
            fontContainer.appendChild(btn);
        });
    }

    // Layouts
    const layoutContainer = document.getElementById('layoutOptions');
    if (layoutContainer) {
        layoutContainer.innerHTML = '';
        layoutPresets.forEach(layout => {
            const btn = document.createElement('button');
            btn.className = 'option-btn' + (layout.id === selectedLayout ? ' active' : '');
            btn.innerHTML = `
                        <div class="option-name">${layout.icon} ${layout.name}</div>
                    `;
            btn.onclick = () => selectLayout(layout.id, btn);
            layoutContainer.appendChild(btn);
        });
    }

    // Frames (removed - not in new simplified UI)
    // const frameContainer = document.getElementById('frameOptions');
    // if (frameContainer) {
    //     frameContainer.innerHTML = '';
    //     framePresets.forEach(frame => {
    //         const btn = document.createElement('button');
    //         btn.className = 'option-btn' + (frame.id === selectedFrame ? ' active' : '');
    //         const previewClass = `frame-preview-${frame.id}`;
    //         btn.innerHTML = `
    //             <div class="option-preview-box ${previewClass}"></div>
    //             <div class="option-name">${frame.name}</div>
    //         `;
    //         btn.onclick = () => selectFrame(frame.id, btn);
    //         frameContainer.appendChild(btn);
    //     });
    // }

    // Frame Color Presets
    const frameColorPresetsContainer = document.getElementById('frameColorPresets');
    if (frameColorPresetsContainer) {
        frameColorPresetsContainer.innerHTML = '';
        frameColorPresets.forEach(color => {
            const btn = document.createElement('div');
            btn.className = 'color-option' + (color === selectedFrameColor ? ' active' : '');
            btn.style.backgroundColor = color;
            btn.onclick = () => selectFrameColor(color, btn);
            frameColorPresetsContainer.appendChild(btn);
        });
    }
    if (customFrameColorInput) {
        customFrameColorInput.value = selectedFrameColor;
        customFrameColorInput.addEventListener('input', (e) => selectFrameColor(e.target.value));
    }

    // Text Color Presets
    const textColorPresetsContainer = document.getElementById('textColorPresets');
    if (textColorPresetsContainer) {
        textColorPresetsContainer.innerHTML = '';
        textColorPresets.forEach(color => {
            const btn = document.createElement('div');
            btn.className = 'color-option' + (color === selectedTextColor ? ' active' : '');
            btn.style.backgroundColor = color;
            btn.onclick = () => selectTextColor(color, btn);
            textColorPresetsContainer.appendChild(btn);
        });
    }
    if (customTextColorInput) {
        customTextColorInput.value = selectedTextColor;
        customTextColorInput.addEventListener('input', (e) => selectTextColor(e.target.value));
    }

    // Text Templates
    const textTemplatesContainer = document.getElementById('textTemplates');
    if (textTemplatesContainer) {
        textTemplatesContainer.innerHTML = '';
        textTemplates.forEach(template => {
            const btn = document.createElement('button');
            btn.className = 'text-template-btn';
            btn.innerHTML = `${template.emoji} ${template.text.replace(template.emoji, '').trim()}`;
            btn.onclick = () => applyTextTemplate(template.text);
            textTemplatesContainer.appendChild(btn);
        });
    }

    // Stickers
    const stickerContainer = document.getElementById('stickerOptions');
    stickerContainer.innerHTML = '';
    stickers.forEach(sticker => {
        const btn = document.createElement('div');
        btn.className = 'sticker-item';
        btn.textContent = sticker;
        btn.onclick = () => addSticker(sticker);
        stickerContainer.appendChild(btn);
    });
}

// --- TEXT TEMPLATE FUNCTION ---

function applyTextTemplate(text) {
    customTextEl.value = text;
    renderPreview();
}

// --- TAB NAVIGATION ---

function showTab(event, tabId) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- OPTION SELECTION ---

function applyFilterPreset(presetId, element) {
    selectedFilterPreset = presetId;
    const preset = filterPresets.find(p => p.id === presetId);
    if (preset) {
        adjustments = { ...preset.values };
        updateAdjustmentSliders();
        updateFilterPresetButtons();
        renderPreview();
    }
}

function updateFilterPresetButtons() {
    document.querySelectorAll('#filterPresets .option-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(document.querySelectorAll('#filterPresets .option-btn'))
        .find((btn, idx) => filterPresets[idx].id === selectedFilterPreset);
    if (activeBtn) activeBtn.classList.add('active');
}

function updateAdjustmentSliders() {
    adjustmentConfigs.forEach(adj => {
        const slider = document.getElementById(adj.id);
        const valueDisplay = document.getElementById(`${adj.id}Value`);
        if (slider && valueDisplay) {
            slider.value = adjustments[adj.id];
            valueDisplay.textContent = `${adjustments[adj.id]}%`;
        }
    });
}

function selectFont(family, element) {
    selectedFont = family;
    document.querySelectorAll('#fontOptions .font-option-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPreview();
}

function selectLayout(layoutId, element) {
    selectedLayout = layoutId;
    document.querySelectorAll('#layoutOptions .option-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPreview();
}

function selectFrame(frameId, element) {
    selectedFrame = frameId;
    document.querySelectorAll('#frameOptions .option-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPreview();
}

function selectFrameColor(color, element = null) {
    selectedFrameColor = color;
    document.querySelectorAll('#frameColorPresets .color-option').forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
    if (customFrameColorInput) {
        customFrameColorInput.value = color;
    }

    // Auto-adjust text color for better contrast
    autoAdjustTextColor(color);
    renderPreview();
}

function autoAdjustTextColor(bgColor) {
    // Calculate brightness of background color
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // If background is dark, use white text; if light, use dark text
    const newTextColor = brightness < 128 ? '#FFFFFF' : '#333333';

    // Only auto-adjust if user hasn't manually changed text color recently
    if (selectedTextColor === '#333333' || selectedTextColor === '#FFFFFF') {
        selectTextColor(newTextColor);
    }
}

function selectTextColor(color, element = null) {
    selectedTextColor = color;
    document.querySelectorAll('#textColorPresets .color-option').forEach(btn => btn.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
    if (customTextColorInput) {
        customTextColorInput.value = color;
    }
    renderPreview();
}

// --- STICKER FUNCTIONS ---

function addSticker(emoji) {
    const stickerId = Date.now() + Math.random();

    // Position stickers in corners to avoid blocking the photo
    const corners = [
        { x: 8, y: 8 },      // Top-left
        { x: 85, y: 8 },     // Top-right
        { x: 8, y: 85 },     // Bottom-left
        { x: 85, y: 85 }     // Bottom-right
    ];

    // Cycle through corners based on number of stickers
    const cornerIndex = activeStickers.length % corners.length;
    const position = corners[cornerIndex];

    activeStickers.push({
        id: stickerId,
        emoji: emoji,
        x: position.x,
        y: position.y
    });
    updateStickersList();
    renderPreview();
}

function removeSticker(stickerId) {
    activeStickers = activeStickers.filter(s => s.id !== stickerId);
    updateStickersList();
    renderPreview();
}

function updateStickersList() {
    const stickersList = document.getElementById('stickersList');
    const activeStickersList = document.getElementById('activeStickersList');

    if (activeStickers.length === 0) {
        activeStickersList.style.display = 'none';
        return;
    }

    activeStickersList.style.display = 'block';
    stickersList.innerHTML = '';

    activeStickers.forEach(sticker => {
        const badge = document.createElement('div');
        badge.className = 'active-sticker-badge';
        badge.innerHTML = `
                    <span>${sticker.emoji}</span>
                    <button class="remove-sticker-btn" onclick="removeSticker(${sticker.id})">×</button>
                `;
        stickersList.appendChild(badge);
    });
}

// --- CAMERA & UPLOAD ---

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode, width: { ideal: 1024 }, height: { ideal: 1024 } },
            audio: false
        });
        video.srcObject = stream;
        video.classList.remove('hidden');
        videoPlaceholder.classList.add('hidden');
        cameraControls.classList.add('hidden');
        photoControls.classList.remove('hidden');
    } catch (error) {
        console.error('Camera error:', error);
        alert('Unable to access camera. Please check permissions.');
    }
}

async function switchCamera() {
    if (!stream) return;

    // Toggle facing mode
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    // Stop current stream
    stream.getTracks().forEach(track => track.stop());

    // Start camera with new facing mode
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: currentFacingMode }, width: { ideal: 1024 }, height: { ideal: 1024 } },
            audio: false
        });
        video.srcObject = stream;
    } catch (error) {
        console.error('Camera switch error:', error);
        // If exact facing mode fails, try without exact
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: currentFacingMode, width: { ideal: 1024 }, height: { ideal: 1024 } },
                audio: false
            });
            video.srcObject = stream;
        } catch (fallbackError) {
            console.error('Camera switch fallback error:', fallbackError);
            alert('Unable to switch camera. Your device may not have multiple cameras.');
            // Revert to previous facing mode
            currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        }
    }
}

function stopCamera() {
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    video.classList.add('hidden');
    videoPlaceholder.classList.remove('hidden');
    cameraControls.classList.remove('hidden');
    photoControls.classList.add('hidden');
}

// Countdown Timer
function startCountdown() {
    return new Promise((resolve) => {
        let count = 3;
        countdownOverlay.classList.remove('hidden');
        countdownNumber.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNumber.textContent = count;
                countdownNumber.style.animation = 'none';
                setTimeout(() => {
                    countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
                }, 10);
            } else {
                clearInterval(interval);
                countdownOverlay.classList.add('hidden');
                resolve();
            }
        }, 1000);
    });
}

async function capturePhoto() {
    if (!stream) return;

    captureBtn.disabled = true;

    // Check if we need to capture multiple photos based on layout
    if (isMultiCapture && (selectedLayout === 'grid' || selectedLayout === 'photostrip')) {
        await captureMultiPhotos();
    } else {
        // Single photo capture
        await startCountdown();

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        capturedPhoto = canvas.toDataURL('image/jpeg', 0.95);
        multiPhotos = [];
        updateCapturePreview(true); // Auto-advance for single photo
    }

    captureBtn.disabled = false;
}

function updateCapturePreview(autoAdvance = false) {
    const capturePreview = document.getElementById('capturePreview');
    const continueBtn = document.getElementById('continueToCustomize');

    if (!capturedPhoto && multiPhotos.length === 0) return;

    if (isMultiCapture && multiPhotos.length > 0) {
        const photosHTML = multiPhotos.map((photo, idx) => `
                    <div class="captured-thumb">
                        <img src="${photo}" alt="Photo ${idx + 1}">
                    </div>
                `).join('');
        capturePreview.innerHTML = `<div class="captured-thumbs-grid">${photosHTML}</div>`;
    } else if (capturedPhoto) {
        capturePreview.innerHTML = `
                    <div class="captured-single">
                        <img src="${capturedPhoto}" alt="Captured Photo">
                    </div>
                `;
    }

    // Show continue button
    continueBtn.classList.remove('hidden');

    // Only auto-advance if explicitly requested (after all photos are captured)
    if (autoAdvance) {
        setTimeout(() => {
            goToStep(3);
            renderPreview();
        }, 1000);
    }
}

async function captureMultiPhotos() {
    if (!stream) return;

    captureBtn.disabled = true;
    multiPhotos = [];

    for (let i = 0; i < 4; i++) {
        // Show which photo we're taking
        countdownOverlay.classList.remove('hidden');
        countdownNumber.textContent = `Photo ${i + 1} of 4`;
        countdownNumber.style.fontSize = '3rem';
        countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Regular countdown (3, 2, 1)
        countdownNumber.style.fontSize = '8rem';
        await startCountdown();

        // Capture the photo
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        multiPhotos.push(canvas.toDataURL('image/jpeg', 0.95));

        // Update preview after each capture (but don't auto-advance yet)
        updateCapturePreview(false);

        // Show "Captured!" message briefly
        if (i < 3) {
            countdownOverlay.classList.remove('hidden');
            countdownNumber.textContent = '✓';
            countdownNumber.style.fontSize = '6rem';
            await new Promise(resolve => setTimeout(resolve, 500));
            countdownOverlay.classList.add('hidden');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Show completion message
    countdownOverlay.classList.remove('hidden');
    countdownNumber.textContent = 'Done! ✓';
    countdownNumber.style.fontSize = '4rem';
    await new Promise(resolve => setTimeout(resolve, 1000));
    countdownOverlay.classList.add('hidden');

    capturedPhoto = null;

    // Show layout options for multi-photo
    const layoutGroup = document.getElementById('layoutGroup');
    if (layoutGroup) {
        layoutGroup.style.display = 'block';
    }

    // Now auto-advance after all photos are captured
    updateCapturePreview(true);

    captureBtn.disabled = false;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            capturedPhoto = e.target.result;
            multiPhotos = [];
            isMultiCapture = false;
            updateCapturePreview();
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }
}

// --- UI STATE & RENDERING ---

function resetToDefaults() {
    capturedPhoto = null;
    multiPhotos = [];
    isMultiCapture = false;
    activeStickers = [];
    customTextEl.value = '';

    adjustments = { ...defaultAdjustments };
    selectedFilterPreset = 'none';
    selectedFrame = 'default';
    selectedFrameColor = '#FFFFFF';
    selectedTextColor = '#333333';
    selectedLayout = 'single';
    updateStickersList();
    initializeUI();
    goToStep(1);
}

function buildFilterString() {
    return Object.entries(adjustments)
        .map(([key, value]) => `${key}(${value}%)`)
        .join(' ');
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced render for better performance
const debouncedRender = debounce(renderPreview, 100);

function renderPreview() {
    if (!capturedPhoto && multiPhotos.length === 0) return;

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        const customText = customTextEl.value;
        const filterStyle = buildFilterString();
        const currentFrameConfig = framePresets.find(f => f.id === selectedFrame);
        const frameClass = currentFrameConfig ? currentFrameConfig.className : '';

        renderPreviewContent(customText, filterStyle, frameClass);
    });
}

function renderPreviewContent(customText, filterStyle, frameClass) {

    if (isMultiCapture && multiPhotos.length > 0) {
        // Multi-photo layout based on selectedLayout
        const photosHTML = multiPhotos.map((photo, idx) => `
                        <div class="multi-photo-item">
                            <img src="${photo}" style="filter: ${filterStyle}" alt="Photo ${idx + 1}" loading="lazy">
                            ${activeStickers.map(sticker => `
                                <div class="photo-sticker" style="left: ${sticker.x}%; top: ${sticker.y}%;">${sticker.emoji}</div>
                            `).join('')}
                        </div>
                    `).join('');

        const layoutClass = selectedLayout === 'photostrip' ? 'photostrip-layout' : 'multi-photo-grid';

        polaroidPreview.innerHTML = `
                        <div class="polaroid-frame ${frameClass}" style="background: ${selectedFrameColor}">
                            <div class="${layoutClass}">
                                ${photosHTML}
                            </div>
                            <div class="polaroid-text" style="font-family: ${selectedFont}; color: ${selectedTextColor}">${customText || ''}</div>
                            <div class="polaroid-date">${new Date().toLocaleDateString()}</div>
                        </div>
                    `;
    } else if (capturedPhoto) {
        // Single photo
        polaroidPreview.innerHTML = `
                        <div class="polaroid-frame ${frameClass}" style="background: ${selectedFrameColor}">
                            <div class="polaroid-photo" style="position: relative;">
                                <img src="${capturedPhoto}" style="filter: ${filterStyle}" alt="Polaroid Preview" loading="lazy">
                                ${activeStickers.map(sticker => `
                                    <div class="photo-sticker" style="left: ${sticker.x}%; top: ${sticker.y}%;">${sticker.emoji}</div>
                                `).join('')}
                            </div>
                            <div class="polaroid-text" style="font-family: ${selectedFont}; color: ${selectedTextColor}">${customText || ''}</div>
                            <div class="polaroid-date">${new Date().toLocaleDateString()}</div>
                        </div>
                    `;
    }
}

// --- FINAL DOWNLOAD ---

function downloadPolaroid() {
    console.log('Download button clicked!');
    if (!capturedPhoto && multiPhotos.length === 0) {
        console.error('No photo to download');
        alert('Please capture or upload a photo first!');
        return;
    }

    console.log('Starting download...', {
        capturedPhoto: !!capturedPhoto,
        multiPhotos: multiPhotos.length,
        selectedLayout,
        selectedFrameColor,
        selectedTextColor,
        customText: customTextEl.value
    });

    const dlCanvas = document.createElement('canvas');
    const ctx = dlCanvas.getContext('2d');

    const scale = 2;
    let baseWidth = 800;
    let baseHeight = 960;

    // Adjust dimensions for photostrip layout
    if (isMultiCapture && multiPhotos.length > 0 && selectedLayout === 'photostrip') {
        baseWidth = 600;
        baseHeight = 1400;
    }

    dlCanvas.width = baseWidth * scale;
    dlCanvas.height = baseHeight * scale;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Frame background - Use selected frame color
    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    const photoPadding = 40;
    const photoSize = baseWidth - (photoPadding * 2);

    if (isMultiCapture && multiPhotos.length > 0) {
        // Multi-photo download
        let loadedCount = 0;
        const images = [];

        multiPhotos.forEach((photoSrc, idx) => {
            const img = new Image();
            img.onload = () => {
                images[idx] = img;
                loadedCount++;

                if (loadedCount === multiPhotos.length) {
                    if (selectedLayout === 'photostrip') {
                        // Photostrip layout - vertical strip
                        const stripPhotoHeight = (baseHeight - 200 - (photoPadding * 2) - (12 * 3)) / 4;
                        const stripPhotoWidth = photoSize;

                        images.forEach((img, i) => {
                            const x = photoPadding;
                            const y = photoPadding + i * (stripPhotoHeight + 12);

                            // Aspect ratio correction
                            const sAspect = img.width / img.height;
                            const dAspect = stripPhotoWidth / stripPhotoHeight;
                            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

                            if (sAspect > dAspect) {
                                sHeight = img.height;
                                sWidth = img.height * dAspect;
                                sx = (img.width - sWidth) / 2;
                            } else {
                                sWidth = img.width;
                                sHeight = img.width / dAspect;
                                sy = (img.height - sHeight) / 2;
                            }

                            ctx.filter = buildFilterString();
                            ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, stripPhotoWidth, stripPhotoHeight);
                            ctx.filter = 'none';

                            // Draw stickers
                            activeStickers.forEach(sticker => {
                                ctx.font = `40px Arial, sans-serif`;
                                ctx.fillStyle = '#000000';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(sticker.emoji, x + (stripPhotoWidth * sticker.x / 100), y + (stripPhotoHeight * sticker.y / 100));
                            });
                        });
                    } else {
                        // Grid layout - 2x2
                        const gridSize = photoSize / 2 - 4;
                        images.forEach((img, i) => {
                            const row = Math.floor(i / 2);
                            const col = i % 2;
                            const x = photoPadding + col * (gridSize + 8);
                            const y = photoPadding + row * (gridSize + 8);

                            // Aspect ratio correction
                            const sAspect = img.width / img.height;
                            const dAspect = 1.0;
                            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

                            if (sAspect > dAspect) {
                                sHeight = img.height;
                                sWidth = img.height * dAspect;
                                sx = (img.width - sWidth) / 2;
                            } else {
                                sWidth = img.width;
                                sHeight = img.width / dAspect;
                                sy = (img.height - sHeight) / 2;
                            }

                            ctx.filter = buildFilterString();
                            ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, gridSize, gridSize);
                            ctx.filter = 'none';

                            // Draw stickers
                            activeStickers.forEach(sticker => {
                                ctx.font = `40px Arial, sans-serif`;
                                ctx.fillStyle = '#000000';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(sticker.emoji, x + (gridSize * sticker.x / 100), y + (gridSize * sticker.y / 100));
                            });
                        });
                    }

                    finishDownload(ctx, baseWidth, baseHeight, photoPadding);
                }
            };
            img.crossOrigin = "anonymous";
            img.src = photoSrc;
        });
    } else if (capturedPhoto) {
        // Single photo download
        const img = new Image();
        img.onload = () => {
            ctx.filter = buildFilterString();

            const sAspect = img.width / img.height;
            const dAspect = 1.0;
            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

            if (sAspect > dAspect) {
                sHeight = img.height;
                sWidth = img.height * dAspect;
                sx = (img.width - sWidth) / 2;
            } else {
                sWidth = img.width;
                sHeight = img.width / dAspect;
                sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, photoPadding, photoPadding, photoSize, photoSize);
            ctx.filter = 'none';

            // Draw stickers
            activeStickers.forEach(sticker => {
                ctx.font = `50px Arial, sans-serif`;
                ctx.fillStyle = '#000000';
                ctx.textBaseline = 'middle';
                ctx.fillText(sticker.emoji, photoPadding + (photoSize * sticker.x / 100), photoPadding + (photoSize * sticker.y / 100));
            });

            finishDownload(ctx, baseWidth, baseHeight, photoPadding);
        };
        img.crossOrigin = "anonymous";
        img.src = capturedPhoto;
    }
}

function finishDownload(ctx, baseWidth, baseHeight, photoPadding) {
    const customText = customTextEl.value;
    if (customText.trim()) {
        // Extract font family name from the full font string
        const fontFamily = selectedFont.replace(/['"]/g, '').split(',')[0].trim();
        ctx.font = `700 40px ${fontFamily}, cursive`;
        ctx.fillStyle = selectedTextColor;
        ctx.textAlign = 'center';
        ctx.fillText(customText, baseWidth / 2, baseHeight - 90, baseWidth - 80);
    }

    ctx.font = `500 18px monospace`;
    ctx.fillStyle = '#666666';
    ctx.globalAlpha = 0.8;

    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleDateString(), baseWidth - photoPadding, baseHeight - 30);

    ctx.textAlign = 'left';
    ctx.fillText('Polaroid Booth', photoPadding, baseHeight - 30);

    ctx.globalAlpha = 1.0;

    try {
        const link = document.createElement('a');
        link.download = `polaroid-booth-${Date.now()}.png`;
        link.href = ctx.canvas.toDataURL('image/png');
        link.click();
        console.log('Download initiated successfully');
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed. Please try again.');
    }
}

function printPolaroid() {
    console.log('Print button clicked!');
    if (!capturedPhoto && multiPhotos.length === 0) {
        console.error('No photo to print');
        alert('Please capture or upload a photo first!');
        return;
    }

    console.log('Starting print...');

    const printCanvas = document.createElement('canvas');
    const ctx = printCanvas.getContext('2d');

    const scale = 2;
    let baseWidth = 800;
    let baseHeight = 960;

    // Adjust dimensions for photostrip layout
    if (isMultiCapture && multiPhotos.length > 0 && selectedLayout === 'photostrip') {
        baseWidth = 600;
        baseHeight = 1400;
    }

    printCanvas.width = baseWidth * scale;
    printCanvas.height = baseHeight * scale;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Frame background
    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    const photoPadding = 40;
    const photoSize = baseWidth - (photoPadding * 2);

    // Generate the same image as download
    generatePrintImage(ctx, baseWidth, baseHeight, photoPadding, () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        const imageData = printCanvas.toDataURL('image/png');

        printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Print Polaroid</title>
                        <style>
                            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                            img { max-width: 100%; max-height: 90vh; }
                            @media print {
                                body { padding: 0; }
                                img { max-width: 100%; max-height: 100vh; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imageData}" onload="window.print(); window.close();" />
                    </body>
                    </html>
                `);
        printWindow.document.close();
    });
}

function sharePolaroid() {
    console.log('Share button clicked!');
    if (!capturedPhoto && multiPhotos.length === 0) {
        console.error('No photo to share');
        alert('Please capture or upload a photo first!');
        return;
    }

    console.log('Starting share...');

    const shareCanvas = document.createElement('canvas');
    const ctx = shareCanvas.getContext('2d');

    const scale = 2;
    let baseWidth = 800;
    let baseHeight = 960;

    // Adjust dimensions for photostrip layout
    if (isMultiCapture && multiPhotos.length > 0 && selectedLayout === 'photostrip') {
        baseWidth = 600;
        baseHeight = 1400;
    }

    shareCanvas.width = baseWidth * scale;
    shareCanvas.height = baseHeight * scale;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Frame background
    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    const photoPadding = 40;
    const photoSize = baseWidth - (photoPadding * 2);

    // Generate the same image as download
    generatePrintImage(ctx, baseWidth, baseHeight, photoPadding, () => {
        // Convert canvas to blob and share
        shareCanvas.toBlob((blob) => {
            const file = new File([blob], `polaroid-booth-${Date.now()}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: 'My Polaroid Photo',
                    text: 'Check out my polaroid photo!',
                    files: [file]
                }).then(() => {
                    console.log('Share successful');
                }).catch((error) => {
                    console.log('Share cancelled or failed:', error);
                    // Fallback: copy to clipboard
                    copyImageToClipboard(shareCanvas);
                });
            } else {
                // Fallback: copy to clipboard or download
                copyImageToClipboard(shareCanvas);
            }
        }, 'image/png');
    });
}

function generatePrintImage(ctx, baseWidth, baseHeight, photoPadding, callback) {
    // This function generates the same image as download but calls callback when done
    const customText = customTextEl.value;
    const photoSize = baseWidth - (photoPadding * 2); // Define photoSize here

    if (isMultiCapture && multiPhotos.length > 0) {
        let loadedCount = 0;
        const images = [];

        multiPhotos.forEach((photoSrc, idx) => {
            const img = new Image();
            img.onload = () => {
                images[idx] = img;
                loadedCount++;

                if (loadedCount === multiPhotos.length) {
                    // Draw images based on layout
                    if (selectedLayout === 'photostrip') {
                        const stripPhotoHeight = (baseHeight - 200 - (photoPadding * 2) - (12 * 3)) / 4;
                        const stripPhotoWidth = photoSize;

                        images.forEach((img, i) => {
                            const x = photoPadding;
                            const y = photoPadding + i * (stripPhotoHeight + 12);

                            // Aspect ratio correction
                            const sAspect = img.width / img.height;
                            const dAspect = stripPhotoWidth / stripPhotoHeight;
                            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

                            if (sAspect > dAspect) {
                                sHeight = img.height;
                                sWidth = img.height * dAspect;
                                sx = (img.width - sWidth) / 2;
                            } else {
                                sWidth = img.width;
                                sHeight = img.width / dAspect;
                                sy = (img.height - sHeight) / 2;
                            }

                            ctx.filter = buildFilterString();
                            ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, stripPhotoWidth, stripPhotoHeight);
                            ctx.filter = 'none';
                        });
                    } else {
                        // Grid layout
                        const gridSize = photoSize / 2 - 4;
                        images.forEach((img, i) => {
                            const row = Math.floor(i / 2);
                            const col = i % 2;
                            const x = photoPadding + col * (gridSize + 8);
                            const y = photoPadding + row * (gridSize + 8);

                            const sAspect = img.width / img.height;
                            const dAspect = 1.0;
                            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

                            if (sAspect > dAspect) {
                                sHeight = img.height;
                                sWidth = img.height * dAspect;
                                sx = (img.width - sWidth) / 2;
                            } else {
                                sWidth = img.width;
                                sHeight = img.width / dAspect;
                                sy = (img.height - sHeight) / 2;
                            }

                            ctx.filter = buildFilterString();
                            ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, gridSize, gridSize);
                            ctx.filter = 'none';
                        });
                    }

                    finishPrintImage(ctx, baseWidth, baseHeight, photoPadding, callback);
                }
            };
            img.crossOrigin = "anonymous";
            img.src = photoSrc;
        });
    } else if (capturedPhoto) {
        const img = new Image();
        img.onload = () => {
            ctx.filter = buildFilterString();

            const sAspect = img.width / img.height;
            const dAspect = 1.0;
            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

            if (sAspect > dAspect) {
                sHeight = img.height;
                sWidth = img.height * dAspect;
                sx = (img.width - sWidth) / 2;
            } else {
                sWidth = img.width;
                sHeight = img.width / dAspect;
                sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, photoPadding, photoPadding, photoSize, photoSize);
            ctx.filter = 'none';

            finishPrintImage(ctx, baseWidth, baseHeight, photoPadding, callback);
        };
        img.crossOrigin = "anonymous";
        img.src = capturedPhoto;
    }
}

function finishPrintImage(ctx, baseWidth, baseHeight, photoPadding, callback) {
    const customText = customTextEl.value;
    if (customText.trim()) {
        const fontFamily = selectedFont.replace(/['"]/g, '').split(',')[0].trim();
        ctx.font = `700 40px ${fontFamily}, cursive`;
        ctx.fillStyle = selectedTextColor;
        ctx.textAlign = 'center';
        ctx.fillText(customText, baseWidth / 2, baseHeight - 90, baseWidth - 80);
    }

    ctx.font = `500 18px monospace`;
    ctx.fillStyle = '#666666';
    ctx.globalAlpha = 0.8;

    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleDateString(), baseWidth - photoPadding, baseHeight - 30);

    ctx.textAlign = 'left';
    ctx.fillText('Polaroid Booth', photoPadding, baseHeight - 30);

    ctx.globalAlpha = 1.0;

    callback();
}

function copyImageToClipboard(canvas) {
    canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
            alert('Image copied to clipboard! You can paste it anywhere.');
        }).catch((error) => {
            console.error('Failed to copy image:', error);
            alert('Share not supported on this device. You can download the image instead.');
        });
    }, 'image/png');
}

// --- SLIDER NAVIGATION ---
let currentStep = 1;

function goToStep(step) {
    currentStep = step;
    const sliderWrapper = document.getElementById('sliderWrapper');
    const offset = -(step - 1) * (100 / 3);
    sliderWrapper.style.transform = `translateX(${offset}%)`;

    // Update step progress
    document.querySelectorAll('.step-item').forEach((item, index) => {
        if (index + 1 <= step) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update slide active states for animations
    const slides = document.querySelectorAll('.slide:not(.hidden-slide)');
    slides.forEach((slide, index) => {
        if (index + 1 === step) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showOutputUI() {
    goToStep(2);
    renderPreview();
}

// --- EVENT LISTENERS ---
startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);
switchCameraBtn.addEventListener('click', switchCamera);
captureBtn.addEventListener('click', capturePhoto);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
clearBtn.addEventListener('click', resetToDefaults);
downloadBtn.addEventListener('click', downloadPolaroid);
printBtn.addEventListener('click', printPolaroid);
shareBtn.addEventListener('click', sharePolaroid);
if (finalDownloadBtn) {
    finalDownloadBtn.addEventListener('click', downloadPolaroid);
}
customTextEl.addEventListener('input', renderPreview);

// Layout selection function
window.selectLayoutAndContinue = function (layout) {
    selectedLayout = layout;
    console.log('Layout selected:', layout);

    // Update visual selection
    document.querySelectorAll('.layout-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-layout="${layout}"]`).classList.add('selected');

    // Set capture mode and filter based on layout
    if (layout === 'single') {
        isMultiCapture = false;
    } else {
        isMultiCapture = true;
    }

    // Apply automatic filters for nostalgic layouts
    if (layout === 'vintage') {
        applyFilterPreset('vintage');
        selectedFrameColor = '#F5E6D3'; // Cream color
    } else if (layout === 'retro') {
        applyFilterPreset('retro');
        selectedFrameColor = '#FFB6C1'; // Light pink
    } else if (layout === 'bw-strip') {
        applyFilterPreset('bw');
        selectedFrameColor = '#2C2C2C'; // Dark gray
        selectedTextColor = '#FFFFFF'; // White text for dark frame
    }

    // Move to capture step after a short delay
    setTimeout(() => {
        goToStep(2);
    }, 300);
};

// Slider navigation
document.getElementById('continueToCustomize').addEventListener('click', () => {
    goToStep(3);
    renderPreview();
});
document.getElementById('backToCapture').addEventListener('click', () => goToStep(2));

async function startProcessing() {
    const processingOverlay = document.getElementById('processingOverlay');
    const downloadContent = document.getElementById('downloadContent');
    const countdownEl = document.getElementById('processingCountdown');

    processingOverlay.classList.remove('hidden');
    downloadContent.classList.add('hidden');

    // Countdown from 3 to 1
    for (let i = 3; i > 0; i--) {
        countdownEl.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Copy preview to final preview
    const preview = document.getElementById('polaroidPreview').innerHTML;
    document.getElementById('finalPreview').innerHTML = preview;

    // Hide processing, show download
    processingOverlay.classList.add('hidden');
    downloadContent.classList.remove('hidden');
}

// --- LANDING PAGE NAVIGATION ---
window.enterStudio = function () {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('sliderContainer').classList.remove('hidden');
    document.getElementById('stepProgress').classList.remove('hidden');
    goToStep(1);
};

window.backToLanding = function () {
    document.getElementById('landingPage').classList.remove('hidden');
    document.getElementById('sliderContainer').classList.add('hidden');
    document.getElementById('stepProgress').classList.add('hidden');
    document.getElementById('mainNav').classList.add('hidden');
    resetToDefaults();
};

window.backToLayout = function () {
    goToStep(1);
};

// --- INITIAL STATE: Show landing page on load ---
window.addEventListener('DOMContentLoaded', function () {
    // Ensure landing page is visible and studio is hidden on initial load
    document.getElementById('landingPage').classList.remove('hidden');
    document.getElementById('sliderContainer').classList.add('hidden');
    document.getElementById('stepProgress').classList.add('hidden');
    document.getElementById('mainNav').classList.add('hidden');
});

// Function to enter the Studio (Start Creating)
function enterStudio() {
    // 1. Hide the Landing Page
    document.getElementById('landingPage').classList.add('hidden');

    // 2. Show the App Elements
    document.getElementById('stepProgress').classList.remove('hidden');
    document.getElementById('sliderContainer').classList.remove('hidden');

    // 3. Ensure the camera permissions/setup starts if needed (optional)
    // startCamera(); 

    // 4. Scroll to top to ensure the view is correct
    window.scrollTo(0, 0);
}

// Function to go back to Landing Page (triggered by the Back button in Step 1)
function backToLanding() {
    // 1. Hide the App Elements
    document.getElementById('stepProgress').classList.add('hidden');
    document.getElementById('sliderContainer').classList.add('hidden');

    // 2. Show the Landing Page
    document.getElementById('landingPage').classList.remove('hidden');

    // 3. Scroll to top
    window.scrollTo(0, 0);
}
// --- INITIALIZE ON LOAD ---
initializeUI();
