document.addEventListener('DOMContentLoaded', function() {
    // Page loader
    setTimeout(() => {
        document.getElementById('pageLoader').classList.add('hidden');
    }, 1500);

    // Current year for footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    const themeButtons = document.querySelectorAll('.theme-button');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    function setTheme(theme) {
        if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
            document.body.classList.add('dark');
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            document.body.classList.remove('dark');
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
        
        // Update theme buttons
        themeButtons.forEach(button => {
            if (button.dataset.theme === theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        localStorage.setItem('theme', theme);
    }
    
    // Initialize theme
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('system');
    }
    
    // Theme toggle button
    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });
    
    // Theme preference buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            setTheme(theme);
        });
    });

    // Animated background
    const animatedBg = document.getElementById('animatedBg');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        animatedBg.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

    // Tab switching
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tab = trigger.dataset.tab;
            
            // Update triggers
            tabTriggers.forEach(t => {
                t.setAttribute('aria-selected', t === trigger);
            });
            
            // Update content
            tabContents.forEach(content => {
                content.dataset.active = content.dataset.tab === tab;
            });
        });
    });

    // File upload functionality
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const uploadButton = document.getElementById('uploadButton');
    const progressContainer = document.getElementById('progressContainer');
    const progressValue = document.getElementById('progressValue');
    const progressPercent = document.getElementById('progressPercent');
    const uploadStatus = document.getElementById('uploadStatus');
    const shareableLinkCard = document.getElementById('shareableLinkCard');
    const linkText = document.getElementById('linkText');
    const downloadButton = document.getElementById('downloadButton');
    const copyLinkButton = document.getElementById('copyLinkButton');
    const qrCodeButton = document.getElementById('qrCodeButton');
    const qrModal = document.getElementById('qrModal');
    const qrClose = document.getElementById('qrClose');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const previewModal = document.getElementById('previewModal');
    const previewClose = document.getElementById('previewClose');
    const previewContent = document.getElementById('previewContent');
    
    let selectedFiles = [];
    let shareableLink = '';
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            selectedFiles = Array.from(fileInput.files);
            updateFileInfo();
            uploadButton.disabled = false;
        }
    });
    
    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.backgroundColor = 'hsl(var(--muted))';
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.backgroundColor = 'hsla(var(--muted), 0.5)';
        });
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files.length > 0) {
            fileInput.files = dt.files;
            selectedFiles = Array.from(fileInput.files);
            updateFileInfo();
            uploadButton.disabled = false;
        }
    });
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    function updateFileInfo() {
        if (selectedFiles.length === 0) {
            fileInfo.innerHTML = `
                <p class="file-name">Click to select files</p>
                <p class="file-size">or drag and drop them here</p>
            `;
            return;
        }
        
        if (selectedFiles.length === 1) {
            const file = selectedFiles[0];
            const fileSize = formatFileSize(file.size);
            fileInfo.innerHTML = `
                <p class="file-name">${file.name}</p>
                <p class="file-size">${fileSize}</p>
                <button class="preview-button" id="previewButton">Preview File</button>
            `;
            
            // Add preview functionality
            const previewButton = document.getElementById('previewButton');
            if (previewButton) {
                previewButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    previewFile(file);
                });
            }
        } else {
            const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
            fileInfo.innerHTML = `
                <p class="file-name">${selectedFiles.length} files selected</p>
                <p class="file-size">Total: ${formatFileSize(totalSize)}</p>
            `;
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function previewFile(file) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        
        if (isImage || isPdf || isVideo || isAudio) {
            const fileUrl = URL.createObjectURL(file);
            
            // Clear previous content
            previewContent.innerHTML = '';
            
            if (isImage) {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.alt = 'Preview';
                img.className = 'preview-image';
                previewContent.appendChild(img);
            } else if (isPdf) {
                const iframe = document.createElement('iframe');
                iframe.src = fileUrl;
                iframe.className = 'preview-pdf';
                previewContent.appendChild(iframe);
            } else if (isVideo) {
                const video = document.createElement('video');
                video.src = fileUrl;
                video.controls = true;
                video.className = 'preview-video';
                previewContent.appendChild(video);
            } else if (isAudio) {
                const audio = document.createElement('audio');
                audio.src = fileUrl;
                audio.controls = true;
                audio.className = 'preview-audio';
                previewContent.appendChild(audio);
            }
            
            previewModal.classList.add('active');
        } else {
            showToast('Preview not available', 'This file type doesn\'t support preview', 'error');
        }
    }
    
    previewClose.addEventListener('click', () => {
        previewModal.classList.remove('active');
    });
    
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.classList.remove('active');
        }
    });
    
    // Upload functionality
    uploadButton.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            showToast('No files selected', 'Please select at least one file to share', 'error');
            return;
        }
        
        // Show progress
        progressContainer.style.display = 'block';
        uploadButton.disabled = true;
        uploadButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            Uploading...
        `;
        
        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress >= 95) {
                    clearInterval(progressInterval);
                    return;
                }
                progress += 5;
                progressValue.style.width = `${progress}%`;
                progressPercent.textContent = `${progress}%`;
            }, 300);
            
            // Create form data
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('file', file);
            });
            
            // Simulate a delay for the upload process
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Using tmpfiles.org API for actual upload
            const response = await fetch('https://tmpfiles.org/api/v1/upload', {
                method: 'POST',
                body: formData
            });
            
            // Complete progress
            clearInterval(progressInterval);
            progressValue.style.width = '100%';
            progressPercent.textContent = '100%';
            
            if (response.ok) {
                const data = await response.json();
                uploadStatus.textContent = 'Upload complete!';
                
                if (data && data.data && data.data.url) {
                    const fileUrl = data.data.url;
                    shareableLink = fileUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                    
                    // Update UI with link
                    linkText.textContent = shareableLink;
                    downloadButton.href = shareableLink;
                    shareableLinkCard.style.display = 'block';
                    
                    // Add to recent uploads
                    addToRecentUploads();
                    
                    showToast('Upload successful!', 'Your file is now available to share', 'success');
                } else {
                    showToast('Upload issue', 'Upload succeeded but couldn\'t get file link', 'error');
                }
            } else {
                uploadStatus.textContent = `Upload failed: ${response.status} ${response.statusText}`;
                showToast('Upload failed', `Server returned an error: ${response.status}`, 'error');
            }
        } catch (error) {
            progressValue.style.width = '0%';
            uploadStatus.textContent = 'An error occurred during upload.';
            showToast('Upload error', error.message || 'Unknown error occurred', 'error');
        } finally {
            uploadButton.disabled = false;
            uploadButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"></path>
                </svg>
                Share Files
            `;
        }
    });
    
    // Copy link functionality
    copyLinkButton.addEventListener('click', () => {
        if (shareableLink) {
            navigator.clipboard.writeText(shareableLink);
            showToast('Link copied!', 'The download link has been copied to your clipboard', 'success');
        }
    });
    
    // QR code functionality
    qrCodeButton.addEventListener('click', () => {
        if (shareableLink) {
            qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableLink)}`;
            qrModal.classList.add('active');
        } else {
            showToast('No link to share', 'Upload a file first to generate a QR code', 'error');
        }
    });
    
    qrClose.addEventListener('click', () => {
        qrModal.classList.remove('active');
    });
    
    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
        }
    });
    
    // Social sharing functionality
    const socialButtons = document.querySelectorAll('.social-button');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!shareableLink) {
                showToast('No link to share', 'Upload a file first to share', 'error');
                return;
            }
            
            const platform = button.dataset.platform;
            let shareUrl = '';
            
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent('Check out this file I shared via FileShare!')}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${encodeURIComponent('Check out this file I shared via FileShare: ' + shareableLink)}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${encodeURIComponent('File shared via FileShare')}&body=${encodeURIComponent('Check out this file I shared via FileShare: ' + shareableLink)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank');
            }
        });
    });
    
    // Recent uploads functionality
    const recentUploadsList = document.getElementById('recentUploadsList');
    const emptyUploads = document.getElementById('emptyUploads');
    
    function addToRecentUploads() {
        // Get existing uploads from localStorage
        let recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
        
        // Add new upload
        const newUpload = {
            name: selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files`,
            url: shareableLink,
            date: new Date().toLocaleString()
        };
        
        // Add to beginning of array and limit to 5 items
        recentUploads = [newUpload, ...recentUploads].slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('recentUploads', JSON.stringify(recentUploads));
        
        // Update UI
        updateRecentUploadsList();
    }
    
    function updateRecentUploadsList() {
        const recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
        
        if (recentUploads.length === 0) {
            emptyUploads.style.display = 'block';
            recentUploadsList.style.display = 'none';
            return;
        }
        
        emptyUploads.style.display = 'none';
        recentUploadsList.style.display = 'block';
        recentUploadsList.innerHTML = '';
        
        recentUploads.forEach((upload, index) => {
            const li = document.createElement('li');
            li.className = 'recent-upload-item';
            li.innerHTML = `
                <div class="recent-upload-info">
                    <div>
                        <p class="recent-upload-name">${upload.name}</p>
                        <p class="recent-upload-date">${upload.date}</p>
                    </div>
                    <div class="recent-upload-actions">
                        <a href="${upload.url}" target="_blank" class="recent-upload-button" title="Download">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </a>
                        <button class="recent-upload-button copy-recent-link" data-url="${upload.url}" title="Copy link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            recentUploadsList.appendChild(li);
        });
        
        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-recent-link').forEach(button => {
            button.addEventListener('click', () => {
                const url = button.dataset.url;
                navigator.clipboard.writeText(url);
                showToast('Link copied!', 'The download link has been copied to your clipboard', 'success');
            });
        });
    }
    
    // Initialize recent uploads list
    updateRecentUploadsList();
    
    // Toast notifications
    function showToast(title, message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconSvg = type === 'success' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        
        toast.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 5000);
    }
});