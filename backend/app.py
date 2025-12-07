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
CORS(app) # Enable CORS for frontend communication

# Supabase Setup
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

supabase: Client = create_client(url, key)

# --- 1. AUTH ROUTES ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        # 1. Create Auth User
        auth_res = supabase.auth.sign_up({"email": email, "password": password})
        
        if auth_res.user:
            user_id = auth_res.user.id
            # 2. Add to public users table
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
            
            # 3. Check if user has Genres selected
            user_data = supabase.table("users").select("preferred_genres").eq("id", user_id).single().execute()
            
            has_genres = False
            if user_data.data and user_data.data.get('preferred_genres'):
                # Check if it's not an empty string
                if len(user_data.data['preferred_genres']) > 0:
                    has_genres = True

            return jsonify({
                "message": "Login successful", 
                "user_id": user_id, 
                "has_genres": has_genres 
            }), 200
            
    except Exception as e:
        return jsonify({"error": "Invalid Credentials"}), 401

# --- 2. ONBOARDING ROUTE ---

@app.route('/api/save-genres', methods=['POST'])
def save_genres():
    data = request.json
    user_id = data.get('user_id')
    genres = data.get('genres') # String: "Action,Comedy"

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
        # 1. Fetch ALL ratings by this user first (for efficiency)
        # We create a dictionary like: { 101: 'like', 204: 'dislike' }
        ratings_res = supabase.table("ratings").select("movie_id, sentiment").eq("user_id", user_id).execute()
        user_ratings_map = { item['movie_id']: item['sentiment'] for item in ratings_res.data }

        # 2. Get User Genres
        user_res = supabase.table("users").select("preferred_genres").eq("id", user_id).single().execute()
        
        feed_data = [] 

        if user_res.data and user_res.data.get('preferred_genres'):
            genres_list = user_res.data['preferred_genres'].split(',')
            
            for genre in genres_list:
                # Fetch movies for this genre
                response = supabase.table('movies').select("*").ilike('genres', f"%{genre}%").limit(6).execute()
                movies = response.data
                
                # 3. ATTACH SENTIMENT TO MOVIES
                for movie in movies:
                    # If movie ID exists in our ratings map, add the sentiment (e.g., 'like')
                    # If not, it defaults to None
                    movie['user_sentiment'] = user_ratings_map.get(movie['id'])

                if movies:
                    feed_data.append({
                        "category": genre,
                        "movies": movies
                    })
        
        # Fallback if empty
        if not feed_data:
            response = supabase.table('movies').select("*").limit(12).execute()
            movies = response.data
            for movie in movies:
                movie['user_sentiment'] = user_ratings_map.get(movie['id'])
                
            feed_data.append({ "category": "Trending Now", "movies": movies })

        return jsonify(feed_data), 200
        
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


# 2. ADD THIS ROUTE AT THE BOTTOM
@app.route('/api/poster/<int:tmdb_id>', methods=['GET'])
def get_poster(tmdb_id):
    # Your Secret Key lives here (Server-side), so users can't see it
    # You can hardcode it here, or use os.environ.get("TMDB_KEY") for extra security
    API_KEY = "01f6b48b8da9b1f9f15781cae65c4249" 
    
    if not tmdb_id:
        return jsonify({"url": None})

    try:
        # The Backend calls TMDB
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={API_KEY}"
        response = requests.get(url)
        data = response.json()

        # Check if poster exists
        poster_path = data.get('poster_path')
        if poster_path:
            full_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            return jsonify({"url": full_url})
        
        return jsonify({"url": None})

    except Exception as e:
        print(f"Proxy Error: {e}")
        return jsonify({"url": None})

@app.route('/api/rate', methods=['POST'])
def rate_movie():
    data = request.json
    try:
        supabase.table("ratings").insert({
            "user_id": data.get('user_id'),
            "movie_id": data.get('movie_id'),
            "rating": data.get('rating'),       # 1, 3, or 5
            "sentiment": data.get('sentiment')  # 'like', 'neutral', 'dislike'
        }).execute()
        return jsonify({"message": "Saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 5. RECOMMENDATION ROUTE (Simple Version) ---

# --- REPLACE THE RECOMMEND ROUTE IN app.py ---

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    user_id = data.get('user_id')

    try:
        # 1. Get User's Liked Movies (Rating > 3 or sentiment 'like')
        user_likes = supabase.table('ratings')\
            .select("movie_id")\
            .eq("user_id", user_id)\
            .gt("rating", 3)\
            .execute()
        
        liked_ids = [item['movie_id'] for item in user_likes.data]

        # 2. If user hasn't liked anything yet, return Trending/Random
        if not liked_ids:
            response = supabase.table('movies').select("*").limit(20).execute()
            # Shuffle to make it look dynamic
            random.shuffle(response.data)
            return jsonify(response.data), 200

        # 3. Find Similar Movies (Item-Based Filtering)
        # We look in the 'recommendations' table for movies similar to what the user liked
        similar_movies = supabase.table('recommendations') \
            .select("target_id, score") \
            .in_("source_id", liked_ids) \
            .order("score", desc=True) \
            .limit(50) \
            .execute()
            
        # 4. Extract unique Movie IDs to fetch details
        # We use a set to avoid duplicates if multiple liked movies recommend the same target
        target_ids = list({item['target_id'] for item in similar_movies.data})
        
        # 5. Fetch Movie Details
        if not target_ids:
            # Fallback if no connections found
            final_movies = supabase.table('movies').select("*").limit(20).execute()
        else:
            final_movies = supabase.table('movies').select("*").in_("id", target_ids).execute()

        return jsonify(final_movies.data), 200

    except Exception as e:
        print(f"Recommendation Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)