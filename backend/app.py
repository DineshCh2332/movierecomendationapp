from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import random
import requests

# Load .env file
load_dotenv()

app = Flask(__name__)
# Allow CORS for everyone (easiest for debugging)
CORS(app, resources={r"/*": {"origins": "*"}})

# Supabase Setup
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("WARNING: Supabase Keys missing. Backend will crash on DB calls.")

supabase: Client = create_client(url, key)

# --- 0. HEALTH CHECK (Fixes the 404 on Root) ---
@app.route('/')
def home():
    return "Movie Backend is Running!", 200

# --- 1. AUTH ROUTES ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        auth_res = supabase.auth.sign_up({"email": email, "password": password})
        if auth_res.user:
            user_id = auth_res.user.id
            supabase.table("users").insert({"id": user_id, "email": email}).execute()
            return jsonify({"message": "User created", "user_id": user_id}), 201
        else:
            return jsonify({"error": "Signup failed"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        auth_res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if auth_res.user:
            user_id = auth_res.user.id
            
            # Check genres
            user_data = supabase.table("users").select("preferred_genres").eq("id", user_id).single().execute()
            has_genres = False
            if user_data.data and user_data.data.get('preferred_genres'):
                if len(user_data.data['preferred_genres']) > 0:
                    has_genres = True

            return jsonify({
                "message": "Login successful", 
                "user_id": user_id, 
                "has_genres": has_genres 
            }), 200
            
    except Exception as e:
        return jsonify({"error": "Invalid Credentials"}), 401

# --- 2. ONBOARDING & FEED ---

@app.route('/api/save-genres', methods=['POST'])
def save_genres():
    data = request.json
    user_id = data.get('user_id')
    genres = data.get('genres') 
    try:
        supabase.table("users").update({"preferred_genres": genres}).eq("id", user_id).execute()
        return jsonify({"message": "Genres saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/feed', methods=['POST'])
def get_movie_feed():
    data = request.json
    user_id = data.get('user_id')
    
    try:
        # Fetch user ratings
        ratings_res = supabase.table("ratings").select("movie_id, sentiment").eq("user_id", user_id).execute()
        user_ratings_map = { item['movie_id']: item['sentiment'] for item in ratings_res.data }

        user_res = supabase.table("users").select("preferred_genres").eq("id", user_id).single().execute()
        feed_data = [] 

        if user_res.data and user_res.data.get('preferred_genres'):
            genres_list = user_res.data['preferred_genres'].split(',')
            
            for genre in genres_list:
                response = supabase.table('movies').select("*").ilike('genres', f"%{genre}%").limit(6).execute()
                movies = response.data
                
                for movie in movies:
                    movie['user_sentiment'] = user_ratings_map.get(movie['id'])

                if movies:
                    feed_data.append({"category": genre, "movies": movies})
        
        if not feed_data:
            response = supabase.table('movies').select("*").limit(12).execute()
            movies = response.data
            for movie in movies:
                movie['user_sentiment'] = user_ratings_map.get(movie['id'])
            feed_data.append({ "category": "Trending Now", "movies": movies })

        return jsonify(feed_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 3. PROXY (IMAGES) ---

@app.route('/api/poster/<int:tmdb_id>', methods=['GET'])
def get_poster(tmdb_id):
    # Use Environment Variable in Production, hardcode for local test if needed
    API_KEY = os.environ.get("TMDB_API_KEY", "01f6b48b8da9b1f9f15781cae65c4249")
    
    if not tmdb_id:
        return jsonify({"url": None})

    try:
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={API_KEY}"
        response = requests.get(url)
        data = response.json()
        poster_path = data.get('poster_path')
        if poster_path:
            full_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            return jsonify({"url": full_url})
        return jsonify({"url": None})
    except Exception as e:
        return jsonify({"url": None})

# --- 4. RATING ---

@app.route('/api/rate', methods=['POST'])
def rate_movie():
    data = request.json
    try:
        supabase.table("ratings").insert({
            "user_id": data.get('user_id'),
            "movie_id": data.get('movie_id'),
            "rating": data.get('rating'),
            "sentiment": data.get('sentiment')
        }).execute()
        return jsonify({"message": "Saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 5. RECOMMENDATIONS (FIXED for Grouped View) ---

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    user_id = data.get('user_id')

    try:
        # 1. Get Liked Movies
        user_likes = supabase.table('ratings').select("movie_id").eq("user_id", user_id).gt("rating", 3).execute()
        liked_ids = [item['movie_id'] for item in user_likes.data]

        final_movies = []

        # 2. If no likes, get Trending
        if not liked_ids:
            response = supabase.table('movies').select("*").limit(20).execute()
            final_movies = response.data
        else:
            # 3. Item-Based Filtering
            similar_movies = supabase.table('recommendations') \
                .select("target_id, score") \
                .in_("source_id", liked_ids) \
                .order("score", desc=True) \
                .limit(50) \
                .execute()
            
            target_ids = list({item['target_id'] for item in similar_movies.data})
            
            if not target_ids:
                final_movies = supabase.table('movies').select("*").limit(20).execute().data
            else:
                final_movies = supabase.table('movies').select("*").in_("id", target_ids).execute().data

        # 4. GROUP BY GENRE (This was missing in your code!)
        grouped_recs = {}
        
        for movie in final_movies:
            genre_str = movie.get('genres') or "Others"
            main_genre = genre_str.split(',')[0].strip()
            
            if main_genre not in grouped_recs:
                grouped_recs[main_genre] = []
            grouped_recs[main_genre].append(movie)

        # 5. Format for Frontend
        response_data = []
        for genre, movies_list in grouped_recs.items():
            response_data.append({
                "category": f"{genre} Picks",
                "movies": movies_list
            })

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Recommendation Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)