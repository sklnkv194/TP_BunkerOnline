from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from .models import UserProfile
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@api_view(['POST'])
def registration_view(request):
    if request.method == 'POST':
        # Для form-data нужно использовать request.data, а не request.data
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"success": True}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    if request.method == 'POST':
        print("=== LOGIN DEBUG ===")
        print("Request data:", request.data)
        print("Data type:", type(request.data))
        
        serializer = LoginSerializer(data=request.data)
        print("Serializer valid:", serializer.is_valid())
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        # Если сериализатор валиден, продолжаем
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        print(f"Attempting login for email: {email}")
        
        try:
            user = User.objects.get(email=email)
            print(f"User found: {user.username}")
            
            user = authenticate(username=user.username, password=password)
            print(f"Authentication result: {user}")
            
            if user:
                refresh = RefreshToken.for_user(user)
                user_profile = UserProfile.objects.get(user=user)
                
                print("Login successful!")
                return Response({
                    "token": str(refresh.access_token),
                    "id": user.id
                }, status=status.HTTP_200_OK)
            else:
                print("Authentication failed")
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            print("User not found")
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Unexpected error:", e)
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def forget_password_view(request):
    if request.method == 'POST':
        serializer = ForgetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                return Response({
                    "success": "Please check your email for password reset instructions"
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def new_password_view(request):
    if request.method == 'POST':
        serializer = NewPasswordSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"success": True}, status=status.HTTP_200_OK)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)