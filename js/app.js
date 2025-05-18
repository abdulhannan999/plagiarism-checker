// Authentication Logic
        let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let history = JSON.parse(localStorage.getItem('history')) || [];

        // DSA Algorithms
        const dsa = {
            // 1. Rabin-Karp Algorithm for pattern matching
            rabinKarpSearch: function(text, pattern) {
                const prime = 101;
                const textLength = text.length;
                const patternLength = pattern.length;
                const positions = [];
                
                let patternHash = 0;
                let textHash = 0;
                let h = 1;
                
                for (let i = 0; i < patternLength - 1; i++) {
                    h = (h * 256) % prime;
                }
                
                for (let i = 0; i < patternLength; i++) {
                    patternHash = (256 * patternHash + pattern.charCodeAt(i)) % prime;
                    textHash = (256 * textHash + text.charCodeAt(i)) % prime;
                }
                
                for (let i = 0; i <= textLength - patternLength; i++) {
                    if (patternHash === textHash) {
                        let j;
                        for (j = 0; j < patternLength; j++) {
                            if (text.charAt(i + j) !== pattern.charAt(j)) {
                                break;
                            }
                        }
                        
                        if (j === patternLength) {
                            positions.push(i);
                        }
                    }
                    
                    if (i < textLength - patternLength) {
                        textHash = (256 * (textHash - text.charCodeAt(i) * h) + text.charCodeAt(i + patternLength)) % prime;
                        if (textHash < 0) {
                            textHash += prime;
                        }
                    }
                }
                
                return positions;
            },

            // 2. Cosine Similarity
            calculateSimilarity: function(text1, text2) {
                const words1 = text1.toLowerCase().match(/\b\w+\b/g) || [];
                const words2 = text2.toLowerCase().match(/\b\w+\b/g) || [];
                
                if (words1.length === 0 || words2.length === 0) return 0;
                
                const freq1 = this.createFrequencyMap(words1);
                const freq2 = this.createFrequencyMap(words2);
                
                const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
                
                let dotProduct = 0;
                for (const word of allWords) {
                    dotProduct += (freq1[word] || 0) * (freq2[word] || 0);
                }
                
                const mag1 = Math.sqrt(Object.values(freq1).reduce((sum, val) => sum + val * val, 0));
                const mag2 = Math.sqrt(Object.values(freq2).reduce((sum, val) => sum + val * val, 0));
                
                const similarity = (dotProduct / (mag1 * mag2)) * 100;
                
                return Math.min(Math.round(similarity * 10) / 10, 100);
            },

            createFrequencyMap: function(words) {
                const freq = {};
                words.forEach(word => {
                    freq[word] = (freq[word] || 0) + 1;
                });
                return freq;
            },

            // 3. Jaccard Similarity
            jaccardSimilarity: function(text1, text2) {
                const set1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
                const set2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
                
                if (set1.size === 0 || set2.size === 0) return 0;
                
                const intersection = new Set([...set1].filter(word => set2.has(word)));
                const union = new Set([...set1, ...set2]);
                
                return (intersection.size / union.size) * 100;
            },

            // 4. Longest Common Subsequence (LCS)
            longestCommonSubsequence: function(text1, text2) {
                const m = text1.length;
                const n = text2.length;
                const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
                
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        if (text1[i - 1] === text2[j - 1]) {
                            dp[i][j] = dp[i - 1][j - 1] + 1;
                        } else {
                            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                        }
                    }
                }
                
                return dp[m][n];
            },

            // 5. Levenshtein Distance (Edit Distance)
            levenshteinDistance: function(text1, text2) {
                const m = text1.length;
                const n = text2.length;
                const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
                
                for (let i = 0; i <= m; i++) dp[i][0] = i;
                for (let j = 0; j <= n; j++) dp[0][j] = j;
                
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        const cost = text1[i - 1] === text2[j - 1] ? 0 : 1;
                        dp[i][j] = Math.min(
                            dp[i - 1][j] + 1,
                            dp[i][j - 1] + 1,
                            dp[i - 1][j - 1] + cost
                        );
                    }
                }
                
                return dp[m][n];
            }
        };

        // Main Application Logic
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const authScreen = document.getElementById('authScreen');
            const appContainer = document.getElementById('appContainer');
            const homePage = document.getElementById('homePage');
            const aboutPage = document.getElementById('aboutPage');
            const contactPage = document.getElementById('contactPage');
            const homeLink = document.getElementById('homeLink');
            const aboutLink = document.getElementById('aboutLink');
            const contactLink = document.getElementById('contactLink');
            const historyLink = document.getElementById('historyLink');
            const originalTextArea = document.getElementById('originalText');
            const compareTextArea = document.getElementById('compareText');
            const checkBtn = document.getElementById('checkBtn');
            const clearTextBtn = document.getElementById('clearTextBtn');
            const checkFilesBtn = document.getElementById('checkFilesBtn');
            const clearFilesBtn = document.getElementById('clearFilesBtn');
            const saveResultBtn = document.getElementById('saveResultBtn');
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');
            const resultDiv = document.getElementById('result');
            const similarityScore = document.getElementById('similarityScore');
            const similarityMessage = document.getElementById('similarityMessage');
            const comparisonDiv = document.getElementById('comparison');
            const comparisonText = document.getElementById('comparisonText');
            const loadingDiv = document.getElementById('loading');
            const originalFileContainer = document.getElementById('originalFileContainer');
            const compareFileContainer = document.getElementById('compareFileContainer');
            const originalFileInput = document.getElementById('originalFile');
            const compareFileInput = document.getElementById('compareFile');
            const originalFileInfo = document.getElementById('originalFileInfo');
            const compareFileInfo = document.getElementById('compareFileInfo');
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const historySection = document.getElementById('historySection');
            const historyList = document.getElementById('historyList');
            const usernameDisplay = document.getElementById('usernameDisplay');
            const dashboard = document.getElementById('dashboard');
            const showLoginBtn = document.getElementById('showLoginBtn');
            const showSignupBtn = document.getElementById('showSignupBtn');
            const loginModal = document.getElementById('loginModal');
            const signupModal = document.getElementById('signupModal');
            const closeLoginModal = document.getElementById('closeLoginModal');
            const closeSignupModal = document.getElementById('closeSignupModal');
            const showSignupFromLogin = document.getElementById('showSignupFromLogin');
            const showLoginFromSignup = document.getElementById('showLoginFromSignup');
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            const logoutBtn = document.getElementById('logoutBtn');
            const contactForm = document.getElementById('contactForm');

            // State
            let currentResult = null;

            // Initialize
            checkAuthState();

            // Event Listeners
            checkBtn.addEventListener('click', checkPlagiarism);
            clearTextBtn.addEventListener('click', clearText);
            checkFilesBtn.addEventListener('click', checkFilesPlagiarism);
            clearFilesBtn.addEventListener('click', clearFiles);
            saveResultBtn.addEventListener('click', saveToHistory);
            clearHistoryBtn.addEventListener('click', clearHistory);
            
            originalFileContainer.addEventListener('click', () => originalFileInput.click());
            compareFileContainer.addEventListener('click', () => compareFileInput.click());
            originalFileInput.addEventListener('change', () => handleFileUpload(originalFileInput, originalFileInfo));
            compareFileInput.addEventListener('change', () => handleFileUpload(compareFileInput, compareFileInfo));
            
            tabs.forEach(tab => tab.addEventListener('click', switchTab));
            homeLink.addEventListener('click', () => showPage('home'));
            aboutLink.addEventListener('click', () => showPage('about'));
            contactLink.addEventListener('click', () => showPage('contact'));
            historyLink.addEventListener('click', showHistory);

            // Auth Event Listeners
            showLoginBtn?.addEventListener('click', () => loginModal.style.display = 'flex');
            showSignupBtn?.addEventListener('click', () => signupModal.style.display = 'flex');
            closeLoginModal?.addEventListener('click', () => loginModal.style.display = 'none');
            closeSignupModal?.addEventListener('click', () => signupModal.style.display = 'none');
            showSignupFromLogin?.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.style.display = 'none';
                signupModal.style.display = 'flex';
            });
            showLoginFromSignup?.addEventListener('click', (e) => {
                e.preventDefault();
                signupModal.style.display = 'none';
                loginModal.style.display = 'flex';
            });
            logoutBtn?.addEventListener('click', logout);
            
            window.addEventListener('click', (e) => {
                if (e.target === loginModal) loginModal.style.display = 'none';
                if (e.target === signupModal) signupModal.style.display = 'none';
            });

            // Forms
            loginForm?.addEventListener('submit', handleLogin);
            signupForm?.addEventListener('submit', handleSignup);
            contactForm?.addEventListener('submit', handleContact);

            // Functions
            function switchTab(e) {
                const tabId = e.target.getAttribute('data-tab');
                
                tabs.forEach(tab => tab.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            }
            
            function checkPlagiarism() {
                const originalText = originalTextArea.value.trim();
                const compareText = compareTextArea.value.trim();
                
                if (!originalText || !compareText) {
                    alert('Please enter both texts to compare.');
                    return;
                }
                
                showLoading();
                
                setTimeout(() => {
                    const similarity = dsa.calculateSimilarity(originalText, compareText);
                    currentResult = {
                        type: 'text',
                        original: originalText,
                        compare: compareText,
                        similarity,
                        date: new Date().toLocaleString()
                    };
                    displayResults(similarity, originalText, compareText);
                    hideLoading();
                }, 1500);
            }
            async function extractTextFromFile(file) {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'txt') {
        return await file.text();
    }

    if (fileType === 'docx') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                mammoth.extractRawText({ arrayBuffer: event.target.result })
                    .then(result => resolve(result.value))
                    .catch(err => reject(err));
            };
            reader.onerror = () => reject("Failed to read .docx file.");
            reader.readAsArrayBuffer(file);
        });
    }

    if (fileType === 'pdf') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function() {
                const typedarray = new Uint8Array(reader.result);
                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    const maxPages = pdf.numPages;
                    const textPromises = [];

                    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                        textPromises.push(
                            pdf.getPage(pageNum).then(page =>
                                page.getTextContent().then(content =>
                                    content.items.map(item => item.str).join(' ')
                                )
                            )
                        );
                    }

                    Promise.all(textPromises).then(pagesText =>
                        resolve(pagesText.join(' '))
                    ).catch(err => reject(err));
                }).catch(err => reject(err));
            };
            reader.onerror = () => reject("Failed to read .pdf file.");
            reader.readAsArrayBuffer(file);
        });
    }

    return Promise.reject("Unsupported file format.");
}

            // function checkFilesPlagiarism() {
            //     if (!originalFileInput.files[0] || !compareFileInput.files[0]) {
            //         alert('Please upload both files to compare.');
            //         return;
            //     }
                
            //     showLoading();
                
            //     // In a real app, extract text from files here
            //     setTimeout(() => {
            //         const originalText = "This is a sample text from the original document. It contains some content that might be copied or paraphrased in other documents. Plagiarism detection helps identify such cases.";
            //         const compareText = "This is sample text from the compared document. It has some content that was copied or reworded from the original. Detecting plagiarism helps find these instances.";
                    
            //         const similarity = dsa.calculateSimilarity(originalText, compareText);
            //         currentResult = {
            //             type: 'file',
            //             originalFile: originalFileInput.files[0].name,
            //             compareFile: compareFileInput.files[0].name,
            //             similarity,
            //             date: new Date().toLocaleString()
            //         };
            //         displayResults(similarity, originalText, compareText);
            //         hideLoading();
            //     }, 2000);
            // }
            async function checkFilesPlagiarism() {
    const originalFile = originalFileInput.files[0];
    const compareFile = compareFileInput.files[0];

    if (!originalFile || !compareFile) {
        alert('Please upload both files to compare.');
        return;
    }

    showLoading();

    try {
        const [originalText, compareText] = await Promise.all([
            extractTextFromFile(originalFile),
            extractTextFromFile(compareFile)
        ]);

        const similarity = dsa.calculateSimilarity(originalText, compareText);
        currentResult = {
            type: 'file',
            originalFile: originalFile.name,
            compareFile: compareFile.name,
            similarity,
            date: new Date().toLocaleString()
        };

        displayResults(similarity, originalText, compareText);
    } catch (error) {
        alert("Error processing files: " + error);
    } finally {
        hideLoading();
    }
}

            
            function displayResults(similarity, originalText, compareText) {
                resultDiv.style.display = 'block';
                comparisonDiv.style.display = 'block';
                
                similarityScore.textContent = `${similarity}%`;
                
                if (similarity < 30) {
                    similarityScore.className = 'similarity-score similarity-low';
                    similarityMessage.textContent = 'Low similarity - texts appear to be original.';
                } else if (similarity < 70) {
                    similarityScore.className = 'similarity-score similarity-medium';
                    similarityMessage.textContent = 'Moderate similarity - some content may be shared.';
                } else {
                    similarityScore.className = 'similarity-score similarity-high';
                    similarityMessage.textContent = 'High similarity - potential plagiarism detected.';
                }
                
                const highlightedText = highlightSimilarText(originalText, compareText);
                comparisonText.innerHTML = highlightedText;
            }
            
            function highlightSimilarText(text1, text2) {
                const words1 = text1.split(/\s+/);
                const words2 = text2.toLowerCase().split(/\s+/);
                
                let result = '';
                
                for (const word of words1) {
                    if (words2.includes(word.toLowerCase())) {
                        result += `<span class="highlight">${word}</span> `;
                    } else {
                        result += `${word} `;
                    }
                }
                
                return result;
            }
            
            function clearText() {
                originalTextArea.value = '';
                compareTextArea.value = '';
                resultDiv.style.display = 'none';
                comparisonDiv.style.display = 'none';
            }
            
            function clearFiles() {
                originalFileInput.value = '';
                compareFileInput.value = '';
                originalFileInfo.style.display = 'none';
                compareFileInfo.style.display = 'none';
                resultDiv.style.display = 'none';
                comparisonDiv.style.display = 'none';
            }
            
            function handleFileUpload(input, infoDiv) {
                const file = input.files[0];
                if (!file) return;
                
                infoDiv.style.display = 'block';
                infoDiv.innerHTML = `
                    <p><strong>${file.name}</strong></p>
                    <p>${(file.size / 1024).toFixed(2)} KB</p>
                    <p>${file.type}</p>
                `;
            }
            
            function showLoading() {
                loadingDiv.style.display = 'block';
                resultDiv.style.display = 'none';
                comparisonDiv.style.display = 'none';
            }
            
            function hideLoading() {
                loadingDiv.style.display = 'none';
            }
            
            function saveToHistory() {
                if (!currentUser || !currentResult) return;
                
                currentResult.userId = currentUser.id;
                history.push(currentResult);
                localStorage.setItem('history', JSON.stringify(history));
                
                renderHistory();
                alert('Result saved to history!');
            }
            
            function clearHistory() {
                if (!currentUser) return;
                
                history = history.filter(item => item.userId !== currentUser.id);
                localStorage.setItem('history', JSON.stringify(history));
                renderHistory();
                alert('History cleared!');
            }
            
            function renderHistory() {
                if (!currentUser) {
                    historyList.innerHTML = '<p>Please login to view your history</p>';
                    return;
                }
                
                const userHistory = history.filter(item => item.userId === currentUser.id);
                
                if (userHistory.length === 0) {
                    historyList.innerHTML = '<p>No previous checks found</p>';
                    return;
                }
                
                historyList.innerHTML = userHistory.map(item => `
                    <div class="history-item">
                        <div class="history-info">
                            <h3>${item.type === 'text' ? 'Text Comparison' : 'File Comparison: ' + item.originalFile}</h3>
                            <p>Checked on ${item.date}</p>
                        </div>
                        <div class="history-score ${getSimilarityClass(item.similarity)}">
                            ${item.similarity}%
                        </div>
                    </div>
                `).join('');
            }
            
            function getSimilarityClass(similarity) {
                if (similarity < 30) return 'similarity-low';
                if (similarity < 70) return 'similarity-medium';
                return 'similarity-high';
            }
            
            function showPage(page) {
                homePage.style.display = 'none';
                aboutPage.style.display = 'none';
                contactPage.style.display = 'none';
                historySection.style.display = 'none';
                
                if (page === 'home') {
                    homePage.style.display = 'block';
                } else if (page === 'about') {
                    aboutPage.style.display = 'block';
                } else if (page === 'contact') {
                    contactPage.style.display = 'block';
                }
            }
            
            function showHistory() {
                if (!currentUser) return;
                
                showPage('home');
                historySection.style.display = 'block';
                renderHistory();
            }
            
            function checkAuthState() {
                if (currentUser) {
                    authScreen.style.display = 'none';
                    appContainer.style.display = 'block';
                    usernameDisplay.textContent = currentUser.name;
                    showPage('home');
                    renderHistory();
                } else {
                    authScreen.style.display = 'flex';
                    appContainer.style.display = 'none';
                }
            }
            
            function handleLogin(e) {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    loginModal.style.display = 'none';
                    checkAuthState();
                    alert('Login successful!');
                } else {
                    alert('Invalid email or password');
                }
            }
            
            function handleSignup(e) {
                e.preventDefault();
                
                const name = document.getElementById('signupName').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                
                if (users.some(u => u.email === email)) {
                    alert('Email already registered');
                    return;
                }
                
                const newUser = {
                    id: Date.now(),
                    name,
                    email,
                    password
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                signupModal.style.display = 'none';
                alert('Registration successful! Please login.');
            }
            
            function handleContact(e) {
                e.preventDefault();
                
                const name = document.getElementById('contactName').value;
                const email = document.getElementById('contactEmail').value;
                const message = document.getElementById('contactMessage').value;
                
                // In a real app, you would send this data to a server
                alert(`Thank you for your message, ${name}! We'll get back to you soon.`);
                document.getElementById('contactForm').reset();
            }
            
            function logout() {
                currentUser = null;
                localStorage.removeItem('currentUser');
                checkAuthState();
            }
        });