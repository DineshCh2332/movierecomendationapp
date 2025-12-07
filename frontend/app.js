// const API_URL = "http://127.0.0.1:5000/api";
// const TMDB_KEY = "01f6b48b8da9b1f9f15781cae65c4249"; 
// const TMDB_BASE = "https://image.tmdb.org/t/p/w500";

// // --- 1. GLOBAL UTILS ---
// function logout() {
//     localStorage.removeItem('user_id');
//     window.location.href = 'login.html';
// }

// // --- 2. LOGIN PAGE LOGIC ---
// if (window.location.pathname.includes('login.html')) {
//     const loginBtn = document.getElementById('loginBtn');
//     const signupBtn = document.getElementById('signupBtn');

//     async function handleAuth(endpoint) {
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;

//         try {
//             const res = await fetch(`${API_URL}/${endpoint}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password })
//             });
//             const data = await res.json();

//             if (res.ok) {
//                 localStorage.setItem('user_id', data.user_id);
//                 // Smart Redirect
//                 if (endpoint === 'signup') {
//                     window.location.href = 'onboarding.html';
//                 } else {
//                     if (data.has_genres) window.location.href = 'rate.html';
//                     else window.location.href = 'onboarding.html';
//                 }
//             } else {
//                 alert(data.error);
//             }
//         } catch (e) { console.error(e); alert("Server Error"); }
//     }

//     loginBtn.addEventListener('click', () => handleAuth('login'));
//     signupBtn.addEventListener('click', () => handleAuth('signup'));
// }

// // --- 3. ONBOARDING LOGIC ---
// if (window.location.pathname.includes('onboarding.html')) {
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
    
//     // Helper: Generate HTML for a single Card
//     async function createCardHtml(movie, showButtons) {
//         let poster = `https://placehold.co/300x450/24243e/FFF?text=${encodeURIComponent(movie.title)}`;

//         // Fetch Real Image
//         if (movie.tmdb_id) {
//             try {
//                 const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${TMDB_KEY}`);
//                 const data = await res.json();
//                 if (data.poster_path) poster = TMDB_BASE + data.poster_path;
//             } catch (e) {}
//         }

//         // UPDATED: Note the 'this' inside the onclick functions below
//         return `
//             <div class="movie-card" data-title="${movie.title.toLowerCase()}">
//                 <img src="${poster}" class="movie-poster">
//                 <div class="movie-info">
//                     <h3>${movie.title}</h3>
//                     <p style="color:#ccc; font-size:0.8rem">${movie.genres || ''}</p>
//                     ${ showButtons ? `
//                     <div class="action-buttons">
//                         <button class="icon-btn dislike" onclick="rate(${movie.id}, 1, 'dislike', this)">👎</button>
//                         <button class="icon-btn neutral" onclick="rate(${movie.id}, 3, 'neutral', this)">😐</button>
//                         <button class="icon-btn like" onclick="rate(${movie.id}, 5, 'like', this)">❤️</button>
//                     </div>` : '' }
//                 </div>
//             </div>
//         `;
//     }

//     // A. Render Grouped Feed (For Rate Page)
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

//     // B. Render Flat List (For Results Page)
// // B. Render Flat List (For Results Page) -- REPLACE THIS FUNCTION
//     async function renderFlatList(movies) {
//         const container = document.getElementById('resultContainer');
//         container.innerHTML = '';

//         // Handle empty state
//         if (movies.length === 0) {
//             container.innerHTML = `
//                 <div style="grid-column: 1/-1; text-align: center; margin-top: 50px; opacity: 0.7;">
//                     <h3>No recommendations yet!</h3>
//                     <p>Go back and rate more movies to get better picks.</p>
//                 </div>`;
//             return;
//         }

//         const cardPromises = movies.map(async (movie) => {
//             let poster = `https://placehold.co/300x450/24243e/FFF?text=${encodeURIComponent(movie.title)}`;

//             // Fetch Real Image
//             if (movie.tmdb_id) {
//                 try {
//                     const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${TMDB_KEY}`);
//                     const data = await res.json();
//                     if (data.poster_path) poster = TMDB_BASE + data.poster_path;
//                 } catch (e) {}
//             }

//             // Generate a Match Score (Visual Only for now)
//             const matchScore = Math.floor(Math.random() * (99 - 75) + 75);

//             // CUSTOM HTML FOR RESULTS (Different from Rate Page)
//             return `
//                 <div class="movie-card" data-title="${movie.title.toLowerCase()}">
//                     <div style="position: absolute; top: 10px; right: 10px; background: #00d2ff; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
//                         ${matchScore}% Match
//                     </div>
                    
//                     <img src="${poster}" class="movie-poster">
                    
//                     <div class="movie-info">
//                         <h3>${movie.title}</h3>
//                         <p style="color:#ccc; font-size:0.8rem; margin-bottom: 15px;">${movie.genres || 'General'}</p>
                        
//                         <button style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; width: 100%; padding: 8px;">
//                             ▶ Watch Trailer
//                         </button>
//                     </div>
//                 </div>
//             `;
//         }); 

//         const cardsHtml = await Promise.all(cardPromises);
//         container.innerHTML = cardsHtml.join('');
//     }

//     // --- UPDATED RATE FUNCTION ---
//     // Now accepts 'btnElement' to highlight the specific icon clicked
//     window.rate = async function(movieId, rating, sentiment, btnElement) {
//         const userId = localStorage.getItem('user_id');
        
//         // 1. VISUAL FEEDBACK (Immediate)
//         // Get the parent container of the clicked button
//         const parent = btnElement.parentElement;
        
//         // Remove 'active' class from all siblings (reset previous votes)
//         const siblings = parent.querySelectorAll('.icon-btn');
//         siblings.forEach(btn => btn.classList.remove('active'));

//         // Add 'active' class to the clicked button
//         btnElement.classList.add('active');

//         // 2. SEND TO BACKEND (Background)
//         // We don't wait for this to finish to update UI (makes it feel faster)
//         try {
//             await fetch(`${API_URL}/rate`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ user_id: userId, movie_id: movieId, rating, sentiment })
//             });
//             console.log("Rating saved:", sentiment);
//         } catch (error) {
//             console.error("Error saving rating:", error);
//             // Optional: Revert UI if error occurs
//         }
//     };

//     // --- INITIALIZATION ---
//     if (document.getElementById('movieContainer')) {
//         const userId = localStorage.getItem('user_id');
//         if(!userId) window.location.href = 'login.html';

//         fetch(`${API_URL}/movies/feed`, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({ user_id: userId })
//         })
//         .then(res => res.json())
//         .then(data => renderGroupedFeed(data));
//     }

//     if (document.getElementById('resultContainer')) {
//         const userId = localStorage.getItem('user_id');
//         fetch(`${API_URL}/recommend`, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({ user_id: userId })
//         })
//         .then(res => res.json())
//         .then(movies => renderFlatList(movies));
//     }
    
//     // Search
//     window.filterMovies = function() {
//         const input = document.getElementById('searchInput').value.toLowerCase();
//         document.querySelectorAll('.movie-card').forEach(card => {
//             const title = card.getAttribute('data-title');
//             // If input is empty, show everything. If not, toggle display.
//             if(input === "") {
//                 card.style.display = 'flex';
//             } else {
//                 card.style.display = title.includes(input) ? 'flex' : 'none';
//             }
//         });
//     };
// }


const API_URL = "http://127.0.0.1:5000/api";
const TMDB_KEY = "01f6b48b8da9b1f9f15781cae65c4249"; 
const TMDB_BASE = "https://image.tmdb.org/t/p/w500";

// --- 1. GLOBAL UTILS ---
function logout() {
    localStorage.removeItem('user_id');
    window.location.href = 'login.html';
}

// --- 2. LOGIN & SIGNUP LOGIC ---
if (window.location.pathname.includes('login.html')) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    async function handleAuth(endpoint) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if(!email || !password) return alert("Please fill in all fields");

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
                alert(data.error);
            }
        } catch (e) { console.error(e); alert("Server Error. Is Python running?"); }
    }

    if(loginBtn) loginBtn.addEventListener('click', () => handleAuth('login'));
    if(signupBtn) signupBtn.addEventListener('click', () => handleAuth('signup'));
}

// --- 3. ONBOARDING LOGIC ---
if (window.location.pathname.includes('onboarding.html')) {
    // Security Check: Kick out if no user_id
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

        await fetch(`${API_URL}/save-genres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, genres: list.join(',') })
        });
        window.location.href = 'rate.html';
    };
}



// --- 4. RATE & RESULT LOGIC ---
if (window.location.pathname.includes('rate.html') || window.location.pathname.includes('result.html')) {
    
    // --- SECURITY CHECK (THE FIX) ---
    // This runs immediately. If no user_id, it redirects to login.
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location.href = 'login.html';
    }

    // --- HELPER: CREATE CARD HTML ---
   // --- HELPER: CREATE CARD HTML ---
    async function createCardHtml(movie, isRatePage) {
        let poster = `https://placehold.co/300x450/24243e/FFF?text=${encodeURIComponent(movie.title)}`;

        if (movie.tmdb_id) {
            try {
                const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${TMDB_KEY}`);
                const data = await res.json();
                if (data.poster_path) poster = TMDB_BASE + data.poster_path;
            } catch (e) {}
        }

        if (isRatePage) {
            // 1. CHECK DATABASE STATUS
            // If the backend says we liked this, add 'active' class
            const s = movie.user_sentiment; // 'like', 'neutral', 'dislike', or null
            
            const disActive = s === 'dislike' ? 'active' : '';
            const neuActive = s === 'neutral' ? 'active' : '';
            const likeActive = s === 'like'    ? 'active' : '';

            // 2. RENDER WITH ACTIVE CLASSES
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
            // Result Page Logic (unchanged)
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

    async function renderFlatList(movies) {
        const container = document.getElementById('resultContainer');
        if (movies.length === 0) {
            container.innerHTML = `<div style="text-align:center; width:100%; margin-top:50px;"><h3>No picks yet!</h3><p>Rate more movies first.</p></div>`;
            return;
        }
        const cardPromises = movies.map(movie => createCardHtml(movie, false)); 
        const cardsHtml = await Promise.all(cardPromises);
        container.innerHTML = cardsHtml.join('');
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
        fetch(`${API_URL}/recommend`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId })
        })
        .then(res => res.json())
        .then(movies => renderFlatList(movies));
    }
}