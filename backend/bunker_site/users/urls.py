from django.urls import path
from . import views

urlpatterns = [
    path('registration/', views.registration_view, name='registration'),
    path('login/', views.login_view, name='login'),
    path('forget_password/', views.forget_password_view, name='forget_password'),
    path('new_password/', views.new_password_view, name='new_password'),
]