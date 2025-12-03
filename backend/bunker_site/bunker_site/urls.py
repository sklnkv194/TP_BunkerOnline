"""
URL configuration for bunker_site project.

The `urlpatterns` list routes URLs to  For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from users.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('registration/', registration_view, name='registration'),
    path('login/', login_view, name='login'),
    path('forget_password/', forget_password_view, name='forget_password'),
    path('reset-password/<str:token>/', reset_password_view, name='reset-password'),
    path('check-reset-token/<str:token>/', check_reset_token, name='check-reset-token'),
    path('user/<int:user_id>/', get_user_info, name='get_user_info'),
    path('user/<int:user_id>/update-nickname/', update_nickname, name='update-nickname'),
    path('user/<int:user_id>/change-password/', change_password, name='change_password'), 
]