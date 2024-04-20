from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    # path('add/', views.add_person),
    # path('show/', views.get_all_person),
    path('register/', views.register_user),
    path('profile/', views.user_profile),
]