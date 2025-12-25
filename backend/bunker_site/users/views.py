from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .models import UserProfile

@csrf_exempt
@api_view(['POST'])
def registration_view(request):
    
    if request.method == 'POST':
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
            
            return Response({
                "success": "Аккаунт успешно создан", 
                "ok": True
            }, status=201)
            
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
                    "id": user.id,
                    "ok": True
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
        
        try:
            user = User.objects.get(email=email)
            user_profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Генерируем токен
            reset_token = get_random_string(50)
            reset_token_expiry = timezone.now() + timedelta(hours=24)
            
            # Сохраняем токен
            user_profile.reset_token = reset_token
            user_profile.reset_token_expiry = reset_token_expiry
            user_profile.save()
            
            # Ссылка для сброса
            reset_link = f"http://localhost:3000/reset-password/{reset_token}"
            
            # Текст письма
            subject = "Восстановление пароля"
            message = f"""
            Здравствуйте!
            
            Вы запросили восстановление пароля для вашего аккаунта.
            
            Для установки нового пароля перейдите по ссылке:
            {reset_link}
            
            Ссылка действительна 24 часа.
            
            Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.
            
            С уважением,
            Команда Bunker
            """
            
            # Отправляем email
            try:
                send_mail(
                    subject,
                    message.strip(),
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                print(f"📧 Email отправлен: {email}")
            except Exception as e:
                print(f"⚠️ Ошибка отправки email: {e}")
            
            return Response({
                "success": "Инструкции по сбросу пароля отправлены на вашу почту",
                "ok": True
            }, status=200)
            
        except User.DoesNotExist:
            # Для безопасности не говорим, что пользователя нет
            return Response({
                "success": "Если пользователь существует, инструкции отправлены на почту",
                "ok": True
            }, status=200)

@csrf_exempt
@api_view(['POST'])
def reset_password_view(request, token):
    print(f"📨 Получен запрос на сброс пароля, token: {token}")
    
    if request.method == 'POST':
        new_password = request.data.get('new_password')
        password_conf = request.data.get('password_conf')
        
        if not new_password or not password_conf:
            return Response({"error": "Все поля обязательны"}, status=400)
        
        if new_password != password_conf:
            return Response({"error": "Пароли не совпадают"}, status=400)
        
        if len(new_password) < 8:
            return Response({"error": "Пароль должен быть не менее 8 символов"}, status=400)
        
        try:
            # Ищем пользователя по токену
            user_profile = UserProfile.objects.get(
                reset_token=token,
                reset_token_expiry__gt=timezone.now()
            )
            
            # Меняем пароль
            user = user_profile.user
            user.set_password(new_password)
            user.save()
            
            # Чистим токен
            user_profile.reset_token = None
            user_profile.reset_token_expiry = None
            user_profile.save()
            
            print(f"✅ Пароль изменен для пользователя: {user.email}")
            
            return Response({
                "success": "Пароль успешно изменен",
                "ok": True
            }, status=200)
            
        except UserProfile.DoesNotExist:
            print("❌ Неверный или устаревший токен")
            return Response({
                "error": "Ссылка недействительна или устарела"
            }, status=400)

@api_view(['GET'])
def get_user_info(request, user_id):
    if request.method == 'GET':
        try:
            user = User.objects.get(id=user_id)
            user_profile = UserProfile.objects.get(user=user)
            return Response({
                "id": user.id,
                "email": user.email,
                "nickname": user_profile.nickname,
                "date_joined": user.date_joined
            }, status=200)
            
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
        except UserProfile.DoesNotExist:
            return Response({"error": "Профиль пользователя не найден"}, status=404)

@csrf_exempt
@api_view(['PUT'])
def update_nickname(request, user_id):
    
    if request.method == 'PUT':
        try:
            user = User.objects.get(id=user_id)
            user_profile = UserProfile.objects.get(user=user)
            
            new_nickname = request.data.get('nickname')
            
            if not new_nickname:
                return Response({"error": "Никнейм не может быть пустым"}, status=400)
            
            existing_nickname = UserProfile.objects.filter(nickname=new_nickname).exclude(user=user).exists()
            
            if existing_nickname:
                return Response({"error": "Этот никнейм уже занят"}, status=400)
            
            old_nickname = user_profile.nickname
            user_profile.nickname = new_nickname
            user_profile.save()
            
            return Response({
                "success": "Никнейм успешно изменен",
                "ok": True,
                "old_nickname": old_nickname,
                "new_nickname": new_nickname
            }, status=200)
            
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
        except UserProfile.DoesNotExist:
            return Response({"error": "Профиль пользователя не найден"}, status=404)
        except Exception as e:
            return Response({"error": f"Ошибка при смене никнейма: {str(e)}"}, status=400)

@api_view(['GET'])
def check_reset_token(request, token):
    print(f"📨 Проверка токена: {token}")
    
    try:
        user_profile = UserProfile.objects.get(
            reset_token=token,
            reset_token_expiry__gt=timezone.now()
        )
        return Response({
            "valid": True,
            "email": user_profile.user.email
        }, status=200)
    except UserProfile.DoesNotExist:
        return Response({
            "valid": False,
            "error": "Неверная или устаревшая ссылка"
        }, status=400)
    
@csrf_exempt
@api_view(['PUT'])
def change_password(request, user_id):
    if request.method == 'PUT':
        try:
            user = User.objects.get(id=user_id)
            
            # ИСПОЛЬЗУЕМ ИМЕНА ПОЛЕЙ КАК ВО ФРОНТЕНДЕ
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password') 
            new_password_conf = request.data.get('new_password_conf')
            
            # Валидация
            if not all([current_password, new_password, new_password_conf]):
                return Response({"error": "Все поля обязательны"}, status=400)
            
            if new_password != new_password_conf:
                return Response({"error": "Новые пароли не совпадают"}, status=400)
            
            if len(new_password) < 8:
                return Response({"error": "Пароль должен быть не менее 6 символов"}, status=400)
            
            # Проверяем текущий пароль
            password_correct = user.check_password(current_password)
            
            if not password_correct:
                return Response({"error": "Неверный текущий пароль"}, status=400)
            
            # Меняем пароль
            user.set_password(new_password)
            user.save()
            
            return Response({
                "success": "Пароль успешно изменен",
                "ok": True
            }, status=200)
            
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
        except Exception as e:
            return Response({"error": f"Ошибка при смене пароля: {str(e)}"}, status=400)