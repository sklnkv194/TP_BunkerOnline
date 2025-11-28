from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile

@csrf_exempt
@api_view(['POST'])
def registration_view(request):
    if request.method == 'POST':
        # Берем данные напрямую из request.data
        nickname = request.data.get('nickname')
        email = request.data.get('email')
        password = request.data.get('password')
        password_conf = request.data.get('password_conf')
        
        # Валидация
        if not all([nickname, email, password, password_conf]):
            return Response({"error": "Все поля обязательны для заполнения"}, status=400)
        
        if password != password_conf:
            return Response({"error": "Пароли не совпадают"}, status=400)
        
        if User.objects.filter(email=email).exists():
            return Response({"error": "Пользователь с таким email уже существует"}, status=400)
        
        if UserProfile.objects.filter(nickname=nickname).exists():
            return Response({"error": "Этот никнейм уже занят"}, status=400)
        
        # Создаем пользователя
        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )
            UserProfile.objects.create(user=user, nickname=nickname)
            return Response({"success": True}, status=201)
        except Exception as e:
            return Response({"error": f"Ошибка при создании пользователя: {str(e)}"}, status=400)

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    if request.method == 'POST':
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Email и пароль обязательны"}, status=400)
        
        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    "token": str(refresh.access_token),
                    "id": user.id
                }, status=200)
            else:
                return Response({"error": "Неверный email или пароль"}, status=400)
                
        except User.DoesNotExist:
            return Response({"error": "Пользователь с таким email не найден"}, status=404)

@csrf_exempt
@api_view(['POST'])
def forget_password_view(request):
    if request.method == 'POST':
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email обязателен"}, status=400)
        
        if User.objects.filter(email=email).exists():
            return Response({"success": "Проверьте вашу почту для инструкций по сбросу пароля"}, status=200)
        else:
            return Response({"error": "Пользователь с таким email не найден"}, status=404)

@csrf_exempt
@api_view(['POST'])
def new_password_view(request):
    if request.method == 'POST':
        new_password = request.data.get('new_password')
        password_conf = request.data.get('password_conf')
        
        if not new_password or not password_conf:
            return Response({"error": "Все поля обязательны"}, status=400)
        
        if new_password != password_conf:
            return Response({"error": "Пароли не совпадают"}, status=400)
        
        # В реальном приложении здесь бы искали пользователя по токену
        return Response({"success": True}, status=200)