import os
import math
import re
from collections import Counter
from flask import Flask, request
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
import json
from flask_cors import CORS

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
CORS(app)

# Load environment variables from docker secret
load_dotenv('/run/secrets/recommendator_service_env')

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.get_database()
movies_collection = db.movies
aggregates_collection = db.movieaggregates

# --- Lightweight TF-IDF Implementation ---

def tokenize(text):
    if not text:
        return []
    # Simple tokenization: lowercase and keep only alphanumeric
    return re.findall(r'\b\w\w+\b', text.lower())

class SimpleTfidf:
    def __init__(self):
        self.idf = {}
        self.vocab = {}
        
    def fit_transform(self, documents):
        # 1. Calculate Term Frequency (TF) for each doc
        # and Document Frequency (DF) for each term
        doc_counts = []
        df = Counter()
        total_docs = len(documents)
        
        for doc in documents:
            tokens = tokenize(doc)
            counts = Counter(tokens)
            doc_counts.append(counts)
            for term in counts:
                df[term] += 1
                
        # 2. Calculate IDF
        self.idf = {}
        self.vocab = {term: i for i, term in enumerate(df.keys())}
        
        for term, count in df.items():
            # Standard IDF formula: log(N / (1 + df)) + 1
            self.idf[term] = math.log(total_docs / (1 + count)) + 1
            
        # 3. Calculate TF-IDF vectors
        vectors = []
        for counts in doc_counts:
            vector = {}
            norm = 0
            for term, count in counts.items():
                if term in self.idf:
                    # TF-IDF = count * idf
                    val = count * self.idf[term]
                    vector[term] = val
                    norm += val * val
            
            # Normalize vector (Euclidean norm)
            norm = math.sqrt(norm)
            if norm > 0:
                for term in vector:
                    vector[term] /= norm
            vectors.append(vector)
            
        return vectors

def cosine_similarity_sparse(vec1, vec2):
    # Compute dot product of two sparse vectors (dicts)
    # Assumes vectors are already L2 normalized
    score = 0
    # Iterate over the smaller vector for efficiency
    if len(vec1) > len(vec2):
        vec1, vec2 = vec2, vec1
        
    for term, val1 in vec1.items():
        if term in vec2:
            score += val1 * vec2[term]
            
    return score

# --- Similarity Functions ---

def jaccard_similarity(list1, list2):
    s1 = set(list1)
    s2 = set(list2)
    if not s1 and not s2:
        return 0
    return len(s1.intersection(s2)) / len(s1.union(s2))

def get_year_score(year1, year2):
    try:
        y1 = int(year1)
        y2 = int(year2)
        return max(0, 1 - abs(y1 - y2) / 30)
    except:
        return 0

def calculate_similarity(target_movie, candidate_movie, tfidf_vec_target, tfidf_vec_candidate):
    # A. Genres Similarity (40%)
    genres_score = jaccard_similarity(target_movie.get('genres', []), candidate_movie.get('genres', []))
    
    # B. Cast Similarity (30%)
    cast_score = jaccard_similarity(target_movie.get('cast', []), candidate_movie.get('cast', []))
    
    # C. Directors Similarity (10%)
    directors1 = set(target_movie.get('directors', []))
    directors2 = set(candidate_movie.get('directors', []))
    directors_score = 1 if directors1.intersection(directors2) else 0
    
    # D. Year Proximity (10%)
    year_score = get_year_score(target_movie.get('year', 0), candidate_movie.get('year', 0))
    
    # E. Keyword Similarity (10%)
    keyword_score = cosine_similarity_sparse(tfidf_vec_target, tfidf_vec_candidate)
    
    total_score = (
        0.4 * genres_score +
        0.3 * cast_score +
        0.1 * directors_score +
        0.1 * year_score +
        0.1 * keyword_score
    )
    
    return total_score

@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    try:
        limit = int(request.args.get('limit', 20))
        
        # 1. Get top rated movies
        top_rated_cursor = aggregates_collection.find().sort('avg_rating', -1).limit(50)
        top_rated_ids = [doc['movie_id'] for doc in top_rated_cursor]
        
        if not top_rated_ids:
            return app.response_class(
                response=json.dumps([], cls=CustomJSONEncoder),
                status=200,
                mimetype='application/json'
            )

        # 2. Fetch movies
        target_movies = list(movies_collection.find({'_id': {'$in': top_rated_ids}}))
        candidate_movies = list(movies_collection.aggregate([{'$sample': {'size': 200}}]))
        
        # 3. Prepare TF-IDF
        all_movies = target_movies + candidate_movies
        plots = [m.get('fullplot', '') or '' for m in all_movies]
        
        tfidf = SimpleTfidf()
        tfidf_vectors = tfidf.fit_transform(plots)
        
        # Split vectors back
        target_vectors = tfidf_vectors[:len(target_movies)]
        candidate_vectors = tfidf_vectors[len(target_movies):]

        recommendations = []
        seen_ids = set()
        
        # 4. Calculate scores
        for i, candidate in enumerate(candidate_movies):
            cand_id = str(candidate['_id'])
            if cand_id in seen_ids:
                continue
            
            max_score = 0
            cand_vec = candidate_vectors[i]
            
            for j, target in enumerate(target_movies):
                target_id = str(target['_id'])
                if cand_id == target_id:
                    continue
                    
                score = calculate_similarity(target, candidate, target_vectors[j], cand_vec)
                if score > max_score:
                    max_score = score
            
            recommendations.append({
                **candidate,
                'score': max_score
            })
            seen_ids.add(cand_id)
            
        # Sort and return
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return app.response_class(
            response=json.dumps(recommendations[:limit], cls=CustomJSONEncoder),
            status=200,
            mimetype='application/json'
        )

    except Exception as e:
        print(f"Error: {e}")
        return app.response_class(
            response=json.dumps({'error': str(e)}),
            status=500,
            mimetype='application/json'
        )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
