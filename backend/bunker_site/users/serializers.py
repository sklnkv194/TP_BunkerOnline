from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_conf = serializers.CharField(write_only=True, required=True)
    nickname = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('nickname', 'email', 'password', 'password_conf')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_conf']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
            
        return attrs

    def create(self, validated_data):
        nickname = validated_data.pop('nickname')
        validated_data.pop('password_conf')
        
        user = User.objects.create(
            username=validated_data['email'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        UserProfile.objects.create(user=user, nickname=nickname)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        # Простая валидация - проверяем что поля не пустые
        if not attrs.get('email') or not attrs.get('password'):
            raise serializers.ValidationError("Email and password are required")
        return attrs

class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)  # Изменено с EmailField на CharField

class NewPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, validators=[validate_password])
    password_conf = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['password_conf']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs