from django.urls import path
from .views import *

urlpatterns = [
    path('admin/signup', SignUp.as_view()),
    path('admin/login', LogIn.as_view()),
    path('matches', CreateMatch.as_view()),
    # path('redirect', spotify_callback),
    # path('is-authenticated', IsAuthenticated.as_view()),
    # path('current-song', CurrentSong.as_view())
]