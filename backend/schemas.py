from pydantic import BaseModel
from typing import List, Optional

class Movie(BaseModel):
    id: str
    title: str
    overview: str
    genres: List[str]
    language: str
    releaseYear: int
    score: float

class RecommendationMovie(Movie):
    confidence: float

class RecommendationResponse(BaseModel):
    query: str
    selectedMovie: Movie
    recommendations: List[RecommendationMovie]
    graphData: dict
