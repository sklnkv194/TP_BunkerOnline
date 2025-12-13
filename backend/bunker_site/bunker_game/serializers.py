from rest_framework import serializers
from .models import Deck, Card, User
from django.contrib.auth import get_user_model

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__'

class DeckSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=User.objects.all()
    )
    
    class Meta:
        model = Deck
        fields = '__all__'

class DeckCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Deck
        fields = ('name', 'user_id')
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        
        if user_id:
            # Если передали user_id, используем его
            user = User.objects.get(id=user_id)
            validated_data['user'] = user
        else:
            # Иначе берем из request
            user = self.context['request'].user
            if user.is_authenticated:
                validated_data['user'] = user
        
        return super().create(validated_data)

class CardCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ('deck', 'card_type', 'title', 'description')