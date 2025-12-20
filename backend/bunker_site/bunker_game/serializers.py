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
        
        

from .models import Room, RoomPlayer

class RoomPlayerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='player.username', read_only=True)
    
    class Meta:
        model = RoomPlayer
        fields = ['id', 'player', 'username', 'joined_at', 'is_ready']
        read_only_fields = ['id', 'joined_at']

class RoomSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    players = RoomPlayerSerializer(source='room_players', many=True, read_only=True)
    players_count = serializers.IntegerField(source='get_players_count', read_only=True)
    deck_name = serializers.CharField(source='deck.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Room
        fields = [
            'id', 'code', 'creator', 'creator_username', 'deck', 'deck_name',
            'max_players', 'status', 'created_at', 'started_at',
            'players', 'players_count'
        ]
        read_only_fields = ['id', 'code', 'creator', 'created_at', 'started_at', 'status']

class RoomCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = Room
        fields = ['deck', 'max_players', 'user_id']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({'user_id': 'Пользователь не найден'})
        
        validated_data['creator'] = user
        room = Room.objects.create(**validated_data)
        
        RoomPlayer.objects.create(room=room, player=user)
        
        return room