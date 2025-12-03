from django.urls import path
from . import views

urlpatterns = [
    path('registration/', views.registration_view, name='registration'),
    path('login/', views.login_view, name='login'),
    path('forget_password/', views.forget_password_view, name='forget_password'),
    path('reset-password/<str:token>/', views.reset_password_view, name='reset-password'),
    path('check-reset-token/<str:token>/', views.check_reset_token, name='check-reset-token'),
    path('user/<int:user_id>/', views.get_user_info, name='get_user_info'),
    path('user/<int:user_id>/update-nickname/', views.update_nickname, name='update-nickname'),
    path('user/<int:user_id>/change-password/', views.change_password, name='change_password'), 
]