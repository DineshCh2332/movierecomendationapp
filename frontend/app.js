// // ✅ KEEP THIS EXACTLY LIKE THIS
// const API_URL = "https://movierecomendationapp-2.onrender.com/api";

// // const API_URL = "http://127.0.0.1:5000/api";

// // --- 1. GLOBAL UTILS ---
// function logout() {
//     localStorage.removeItem('user_id');
//     window.location.href = 'login.html';
// }

// // --- 2. LOGIN & SIGNUP LOGIC ---
// if (window.location.pathname.includes('login.html')) {
//     const loginBtn = document.getElementById('loginBtn');
//     const signupBtn = document.getElementById('signupBtn');

// async function handleAuth(endpoint) {
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
//         const btn = document.getElementById(endpoint === 'login' ? 'loginBtn' : 'signupBtn'); // Get the button

//         if(!email || !password) return alert("Please fill in all fields");

//         // 1. SHOW LOADING STATE
//         const originalText = btn.innerText;
//         btn.innerText = "Connecting..."; 
//         btn.disabled = true; // Stop user from clicking twice
//         btn.style.opacity = "0.7";

//         try {
//             const res = await fetch(`${API_URL}/${endpoint}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password })
//             });
//             const data = await res.json();

//             if (res.ok) {
//                 localStorage.setItem('user_id', data.user_id);
//                 if (endpoint === 'signup') {
//                     window.location.href = 'onboarding.html';
//                 } else {
//                     if (data.has_genres) window.location.href = 'rate.html';
//                     else window.location.href = 'onboarding.html';
//                 }
//             } else {
//                 alert("Login Failed: " + data.error);
//                 // Reset button if failed
//                 btn.innerText = originalText;
//                 btn.disabled = false;
//                 btn.style.opacity = "1";
//             }
//         } catch (e) { 
//             console.error(e); 
//             alert("Server Error. Check Console.");
//             // Reset button if error
//             btn.innerText = originalText;
//             btn.disabled = false;
//             btn.style.opacity = "1";
//         }
//     }
//     if(loginBtn) loginBtn.addEventListener('click', () => handleAuth('login'));
//     if(signupBtn) signupBtn.addEventListener('click', () => handleAuth('signup'));
// }

// // --- 3. ONBOARDING LOGIC ---
// if (window.location.pathname.includes('onboarding.html')) {
//     if (!localStorage.getItem('user_id')) window.location.href = 'login.html';

//     const selectedGenres = new Set();

//     window.toggleGenre = function(el, genre) {
//         if (selectedGenres.has(genre)) {
//             selectedGenres.delete(genre);
//             el.classList.remove('selected');
//         } else {
//             selectedGenres.add(genre);
//             el.classList.add('selected');
//         }
//     };

//     window.submitGenres = async function() {
//         const userId = localStorage.getItem('user_id');
//         const list = Array.from(selectedGenres);
        
//         if (list.length === 0) return alert("Select at least one!");

//         await fetch(`${API_URL}/save-genres`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ user_id: userId, genres: list.join(',') })
//         });
//         window.location.href = 'rate.html';
//     };
// }

// // --- 4. RATE & RESULT LOGIC ---
// if (window.location.pathname.includes('rate.html') || window.location.pathname.includes('result.html')) {
    
//     // Security Check
//     const userId = localStorage.getItem('user_id');
//     if (!userId) {
//         window.location.href = 'login.html';
//     }

//     // --- HELPER: CREATE CARD HTML ---
//     async function createCardHtml(movie, isRatePage) {
//         // Default Placeholder
//         let poster = `https://placehold.co/300x450/24243e/FFF?text=${encodeURIComponent(movie.title)}`;

//         // ✅ PROXY LOGIC: Ask Backend for the image URL
//         if (movie.tmdb_id) {
//             try {
//                 const res = await fetch(`${API_URL}/poster/${movie.tmdb_id}`);
//                 const data = await res.json();
//                 if (data.url) poster = data.url;
//             } catch (e) {
//                 console.warn("Poster proxy failed");
//             }
//         }

//         if (isRatePage) {
//             // RATE PAGE CARD (Check DB status for active color)
//             const s = movie.user_sentiment; 
//             const disActive = s === 'dislike' ? 'active' : '';
//             const neuActive = s === 'neutral' ? 'active' : '';
//             const likeActive = s === 'like'    ? 'active' : '';

//             return `
//                 <div class="movie-card" data-title="${movie.title.toLowerCase()}">
//                     <img src="${poster}" class="movie-poster">
//                     <div class="movie-info">
//                         <h3>${movie.title}</h3>
//                         <p style="color:#ccc; font-size:0.8rem">${movie.genres || ''}</p>
//                         <div class="action-buttons">
//                             <button class="icon-btn dislike ${disActive}" onclick="rate(${movie.id}, 1, 'dislike', this)">👎</button>
//                             <button class="icon-btn neutral ${neuActive}" onclick="rate(${movie.id}, 3, 'neutral', this)">😐</button>
//                             <button class="icon-btn like ${likeActive}" onclick="rate(${movie.id}, 5, 'like', this)">❤️</button>
//                         </div>
//                     </div>
//                 </div>`;
//         } else {
//             // RESULT PAGE CARD (Match Badge + Watch Button)
//             const matchScore = Math.floor(Math.random() * (98 - 75) + 75);
//             return `
//                 <div class="movie-card" data-title="${movie.title.toLowerCase()}">
//                      <div style="position: absolute; top: 10px; right: 10px; background: #00d2ff; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
//                         ${matchScore}% Match
//                     </div>
//                     <img src="${poster}" class="movie-poster">
//                     <div class="movie-info">
//                         <h3>${movie.title}</h3>
//                         <p style="color:#ccc; font-size:0.8rem">${movie.genres || ''}</p>
//                         <button style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; width: 100%; padding: 8px; margin-top:10px;">
//                             ▶ Watch Trailer
//                         </button>
//                     </div>
//                 </div>`;
//         }
//     }

//     // --- RENDER FUNCTIONS ---

//     // 1. Rate Page (Grouped by Genre)
//     async function renderGroupedFeed(feedData) {
//         const container = document.getElementById('movieContainer');
//         container.innerHTML = '';

//         for (const section of feedData) {
//             const header = document.createElement('h2');
//             header.className = "section-title";
//             header.innerText = section.category;
//             container.appendChild(header);

//             const grid = document.createElement('div');
//             grid.className = "content-grid"; 
            
//             const cardPromises = section.movies.map(movie => createCardHtml(movie, true));
//             const cardsHtml = await Promise.all(cardPromises);
//             grid.innerHTML = cardsHtml.join('');
//             container.appendChild(grid);
//         }
//     }

//     // 2. Results Page (Grouped by Genre - YouTube Style)
//     async function renderGroupedResults(feedData) {
//         const container = document.getElementById('resultContainer');
//         container.innerHTML = '';

//         if (!feedData || feedData.length === 0) {
//             container.innerHTML = `<div style="text-align:center; width:100%; margin-top:50px;"><h3>No recommendations yet!</h3><p>Rate more movies first.</p></div>`;
//             return;
//         }

//         for (const section of feedData) {
//             const header = document.createElement('h2');
//             header.className = "section-title";
//             header.innerText = section.category;
//             container.appendChild(header);

//             const grid = document.createElement('div');
//             grid.className = "content-grid"; 
            
//             // Pass 'false' to createCardHtml for Result Card style
//             const cardPromises = section.movies.map(movie => createCardHtml(movie, false)); 
//             const cardsHtml = await Promise.all(cardPromises);
//             grid.innerHTML = cardsHtml.join('');
//             container.appendChild(grid);
//         }
//     }

//     // --- ACTIONS ---
//     window.rate = async function(movieId, rating, sentiment, btnElement) {
//         // Visual Update
//         const parent = btnElement.parentElement;
//         parent.querySelectorAll('.icon-btn').forEach(btn => btn.classList.remove('active'));
//         btnElement.classList.add('active');

//         // Backend Update
//         try {
//             await fetch(`${API_URL}/rate`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ user_id: userId, movie_id: movieId, rating, sentiment })
//             });
//         } catch(e) { console.error(e); }
//     };

//     window.filterMovies = function() {
//         const input = document.getElementById('searchInput').value.toLowerCase();
//         document.querySelectorAll('.movie-card').forEach(card => {
//             const title = card.getAttribute('data-title');
//             card.style.display = (input === "" || title.includes(input)) ? 'flex' : 'none';
//         });
//     };

//     // --- INITIALIZATION ---
//     // Load Rate Page
//     if (document.getElementById('movieContainer')) {
//         fetch(`${API_URL}/movies/feed`, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({ user_id: userId })
//         })
//         .then(res => res.json())
//         .then(data => renderGroupedFeed(data));
//     }

//     // Load Result Page -> Calls the NEW Grouped Results Function
//     if (document.getElementById('resultContainer')) {
//         fetch(`${API_URL}/recommend`, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({ user_id: userId })
//         })
//         .then(res => res.json())
//         .then(data => renderGroupedResults(data));
//     }
// }

// =========================================================
// 🟢 LIVE DEPLOYMENT URL (Keep this uncommented for Cloudflare)
const API_URL = "https://movierecomendationapp-2.onrender.com/api";

// 🔴 LOCAL TESTING URL (Uncomment this ONLY when running locally)
// const API_URL = "http://127.0.0.1:5000/api";
// =========================================================

// --- 1. GLOBAL UTILS ---
function logout() {
    localStorage.removeItem('user_id');
    window.location.href = 'login.html';
}

// Helper to check current page (Works with or without .html for Cloudflare)
const path = window.location.pathname;

// --- 2. LOGIN & SIGNUP LOGIC ---
// Checks if we are on login page, root page, or index page
if (path.includes('login') || path === '/' || path.endsWith('index.html')) {
    
    console.log("Login Logic Loaded"); 

    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    async function handleAuth(endpoint) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById(endpoint === 'login' ? 'loginBtn' : 'signupBtn'); 

        if(!email || !password) return alert("Please fill in all fields");

        // 1. VISUAL FEEDBACK (LOADING STATE)
        const originalText = btn.innerText;
        btn.innerText = "Connecting..."; 
        btn.disabled = true; 
        btn.style.opacity = "0.7";

        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user_id', data.user_id);
                // Smart Redirect
                if (endpoint === 'signup') {
                    window.location.href = 'onboarding.html';
                } else {
                    if (data.has_genres) window.location.href = 'rate.html';
                    else window.location.href = 'onboarding.html';
                }
            } else {
                alert("Login Failed: " + (data.error || "Unknown Error"));
                // Reset button
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.opacity = "1";
            }
        } catch (e) { 
            console.error(e); 
            alert("Server Error. Check Console.");
            // Reset button
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    }

    if(loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAuth('login');
        });
    }
    if(signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAuth('signup');
        });
    }
}

// --- 3. ONBOARDING LOGIC ---
if (path.includes('onboarding')) {
    if (!localStorage.getItem('user_id')) window.location.href = 'login.html';

    const selectedGenres = new Set();

    window.toggleGenre = function(el, genre) {
        if (selectedGenres.has(genre)) {
            selectedGenres.delete(genre);
            el.classList.remove('selected');
        } else {
            selectedGenres.add(genre);
            el.classList.add('selected');
        }
    };

    window.submitGenres = async function() {
        const userId = localStorage.getItem('user_id');
        const list = Array.from(selectedGenres);
        
        if (list.length === 0) return alert("Select at least one!");

        const btn = document.querySelector('button');
        btn.innerText = "Saving...";
        btn.disabled = true;

        try {
            await fetch(`${API_URL}/save-genres`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, genres: list.join(',') })
            });
            window.location.href = 'rate.html';
        } catch (e) {
            console.error(e);
            alert("Error saving genres");
            btn.innerText = "Start Watching";
            btn.disabled = false;
        }
    };
}

// --- 4. RATE & RESULT LOGIC ---
if (path.includes('rate') || path.includes('result')) {
    
    // Security Check
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location.href = 'login.html';
    }

    // --- HELPER: CREATE CARD HTML ---
    async function createCardHtml(movie, isRatePage) {
        // Default Placeholder
        let poster = `https://placehold.co/300x450/24243e/FFF?text=${encodeURIComponent(movie.title)}`;

        // ✅ PROXY LOGIC: Ask Backend for the image URL (Secure)
        if (movie.tmdb_id) {
            try {
                const res = await fetch(`${API_URL}/poster/${movie.tmdb_id}`);
                const data = await res.json();
                if (data.url) poster = data.url;
            } catch (e) {
                console.warn("Poster proxy failed");
            }
        }

        if (isRatePage) {
            // RATE PAGE CARD
            const s = movie.user_sentiment; 
            const disActive = s === 'dislike' ? 'active' : '';
            const neuActive = s === 'neutral' ? 'active' : '';
            const likeActive = s === 'like'    ? 'active' : '';

            return `
                <div class="movie-card" data-title="${movie.title.toLowerCase()}">
                    <img src="${poster}" class="movie-poster">
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <p style="color:#ccc; font-size:0.8rem">${movie.genres || ''}</p>
                        <div class="action-buttons">
                            <button class="icon-btn dislike ${disActive}" onclick="rate(${movie.id}, 1, 'dislike', this)">👎</button>
                            <button class="icon-btn neutral ${neuActive}" onclick="rate(${movie.id}, 3, 'neutral', this)">😐</button>
                            <button class="icon-btn like ${likeActive}" onclick="rate(${movie.id}, 5, 'like', this)">❤️</button>
                        </div>
                    </div>
                </div>`;
        } else {
            // RESULT PAGE CARD
            const matchScore = Math.floor(Math.random() * (98 - 75) + 75);
            return `
                <div class="movie-card" data-title="${movie.title.toLowerCase()}">
                     <div style="position: absolute; top: 10px; right: 10px; background: #00d2ff; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        ${matchScore}% Match
                    </div>
                    <img src="${poster}" class="movie-poster">
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <p style="color:#ccc; font-size:0.8rem">${movie.genres || ''}</p>
                        <button style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; width: 100%; padding: 8px; margin-top:10px;">
                            ▶ Watch Trailer
                        </button>
                    </div>
                </div>`;
        }
    }

    // --- RENDER FUNCTIONS ---

    // 1. Rate Page (Grouped by Genre)
    async function renderGroupedFeed(feedData) {
        const container = document.getElementById('movieContainer');
        container.innerHTML = '';

        for (const section of feedData) {
            const header = document.createElement('h2');
            header.className = "section-title";
            header.innerText = section.category;
            container.appendChild(header);

            const grid = document.createElement('div');
            grid.className = "content-grid"; 
            
            const cardPromises = section.movies.map(movie => createCardHtml(movie, true));
            const cardsHtml = await Promise.all(cardPromises);
            grid.innerHTML = cardsHtml.join('');
            container.appendChild(grid);
        }
    }

    // 2. Results Page (Grouped by Genre - YouTube Style)
    async function renderGroupedResults(feedData) {
        const container = document.getElementById('resultContainer');
        container.innerHTML = '';

        if (!feedData || feedData.length === 0) {
            container.innerHTML = `<div style="text-align:center; width:100%; margin-top:50px;"><h3>No recommendations yet!</h3><p>Rate more movies first.</p></div>`;
            return;
        }

        for (const section of feedData) {
            const header = document.createElement('h2');
            header.className = "section-title";
            header.innerText = section.category;
            container.appendChild(header);

            const grid = document.createElement('div');
            grid.className = "content-grid"; 
            
            const cardPromises = section.movies.map(movie => createCardHtml(movie, false)); 
            const cardsHtml = await Promise.all(cardPromises);
            grid.innerHTML = cardsHtml.join('');
            container.appendChild(grid);
        }
    }

    // --- ACTIONS ---
    window.rate = async function(movieId, rating, sentiment, btnElement) {
        // Visual Update
        const parent = btnElement.parentElement;
        parent.querySelectorAll('.icon-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');

        // Backend Update
        try {
            await fetch(`${API_URL}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, movie_id: movieId, rating, sentiment })
            });
        } catch(e) { console.error(e); }
    };

    window.filterMovies = function() {
        const input = document.getElementById('searchInput').value.toLowerCase();
        document.querySelectorAll('.movie-card').forEach(card => {
            const title = card.getAttribute('data-title');
            card.style.display = (input === "" || title.includes(input)) ? 'flex' : 'none';
        });
    };

    // --- INITIALIZATION ---
    // Load Rate Page
    if (document.getElementById('movieContainer')) {
        const movieContainer = document.getElementById('movieContainer');
        movieContainer.innerHTML = '<p style="text-align:center; width:100%; margin-top:50px;">Loading your feed...</p>';
        
        fetch(`${API_URL}/movies/feed`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId })
        })
        .then(res => res.json())
        .then(data => renderGroupedFeed(data));
    }

    // Load Result Page
    if (document.getElementById('resultContainer')) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = '<p style="text-align:center; width:100%; margin-top:50px;">Calculating matches...</p>';

        fetch(`${API_URL}/recommend`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId })
        })
        .then(res => res.json())
        .then(data => renderGroupedResults(data));
    }
}
