from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Deck, Card
from .serializers import (
    DeckSerializer, CardSerializer, 
    DeckCreateSerializer, CardCreateSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

@extend_schema(
    summary="Получение списка всех колод",
    description="Возврат всех активных колод",
    responses=DeckSerializer(many=True)
)
@api_view(['GET'])
@permission_classes([AllowAny])
def deck_list(request):
    decks = Deck.objects
    serializer = DeckSerializer(decks, many=True)
    return Response({'decks': serializer.data})

@extend_schema(
    summary="Получение детальной информации о колоде",
    description="Возврат информации о конкретной колоде и её картах",
    responses=DeckSerializer
)
@api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def deck_detail(request, id):
    if (request.method == "GET"):
        decks = Deck.objects.filter(user_id=id)
        serializer = DeckSerializer(decks, many=True)
        return Response({'decks': serializer.data})
    
    if (request.method == "PUT"):
        deck = get_object_or_404(Deck, id=id)
        serializer = DeckCreateSerializer(deck, data=request.data, partial=True)
        if serializer.is_valid():
            deck = serializer.save()
            return Response({
                'message': 'Колода успешно обновлена',
                'deck': DeckSerializer(deck).data
            })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    if (request.method == "DELETE"):
        deck = get_object_or_404(Deck, id=id)
        deck.delete()
        return Response({'ok': True, 'message': 'Колода успешно удалена'})

@extend_schema(
    summary="Создание новой колоды",
    description="Создание колоды с переданными параметрами",
    request=DeckCreateSerializer,
    responses=DeckSerializer
)
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def deck_create(request):
    """
    Создание новой колоды.
    """
    serializer = DeckCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    if serializer.is_valid():
        deck = serializer.save()
        return Response({
            'message': 'Колода успешно создана',
            'deck': DeckSerializer(deck).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    summary="Получение списка карточек",
    description="Возврат карточек с возможностью фильтрации по колоде",
    parameters=[
        OpenApiParameter(
            name='deck_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description='ID колоды для фильтрации'
        )
    ],
    responses=CardSerializer(many=True)
)
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def card_list(request):
    deck_id = request.GET.get('deck_id')
    
    if deck_id:
        cards = Card.objects.filter(deck_id=deck_id)
    else:
        cards = Card.objects
    
    serializer = CardSerializer(cards, many=True)
    return Response({'cards': serializer.data})

@extend_schema(
    summary="Получение детальной информации о карточке",
    responses=CardSerializer
)
@api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def card_detail(request, card_id):
    if (request.method == "GET"):
        card = get_object_or_404(Card, id=card_id)
        serializer = CardSerializer(card)
        return Response({'card': serializer.data})
    
    if (request.method == "PUT"):
        card = get_object_or_404(Card, id=card_id)
        serializer = CardCreateSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            card = serializer.save()
            return Response({
                'message': 'Карточка успешно обновлена',
                'card': CardSerializer(card).data
            })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    if (request.method == "DELETE"):
        card = get_object_or_404(Card, id=card_id)
        card.delete()
        return Response({'message': 'Карточка успешно удалена'})

@extend_schema(
    summary="Создание новой карточки",
    description="Создание карточки в указанной колоде",
    request=CardCreateSerializer,
    responses=CardSerializer
)
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def card_create(request):
    serializer = CardCreateSerializer(data=request.data)
    if serializer.is_valid():
        card = serializer.save()
        return Response({
            'message': 'Карточка успешно создана',
            'card': CardSerializer(card).data
        }, status=status.HTTP_201_CREATED)
    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def deck_cards(request, deck_id):
    deck = get_object_or_404(Deck, id=deck_id)
    
    cards = deck.cards.all()
    
    cards_by_category = {}
    
    for card in cards:
        card_type = card.card_type
        if card_type not in cards_by_category:
            cards_by_category[card_type] = []
        
        cards_by_category[card_type].append({
            'id': card.id,
            'title': card.title,
            'description': card.description,
            'card_type': card_type,
            'card_type_display': card.get_card_type_display(),
        })
    
    response_data = {
        'deck_id': deck.id,
        'deck_name': deck.name,
        'cards_by_category': cards_by_category
    }
    
    return Response(response_data)


from .serializers import RoomSerializer, RoomCreateSerializer
from .models import RoomPlayer, Room

@api_view(['POST'])
@permission_classes([AllowAny])
def room_create(request):
    """
    Создание новой комнаты
    """
    serializer = RoomCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        deck_id = request.data.get('deck')
        if deck_id:
            try:
                deck = Deck.objects.get(id=deck_id)
            except Deck.DoesNotExist:
                return Response({'error': 'Колода не найдена'}, status=404)
        
        room = serializer.save()
        
        return Response({
            'message': 'Комната успешно создана',
            'room_id': room.id,
            'room_code': room.code,
            'room': RoomSerializer(room).data,
            'is_owner': True
        }, status=status.HTTP_201_CREATED)
    
    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

from users.models import UserProfile

@api_view(['GET'])
@permission_classes([AllowAny])
def room_detail(request, room_id):
    """
    Получение полной информации о комнате
    """
    try:
        room = Room.objects.get(code=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Комната не найдена'}, status=404)
    
    room_players = RoomPlayer.objects.filter(room=room).select_related('player')
    players_data = []
    
    for room_player in room_players:
        player = room_player.player
    
        nickname = player.username
        
        try:
            user_profile = UserProfile.objects.get(user=player)
            if user_profile.nickname: 
                nickname = user_profile.nickname
        except UserProfile.DoesNotExist:
            pass
        
        players_data.append({
            'id': room_player.player.id,
            'username': nickname,
            'is_owner': room_player.player.id == room.creator.id,
            'joined_at': room_player.joined_at,
        })
    
    return Response({
        'room_id': room.id,
        'room_code': room.code,
        'creator_id': room.creator.id,
        'creator_username': room.creator.username,
        'deck_id': room.deck.id if room.deck else None,
        'deck_name': room.deck.name if room.deck else 'Не выбрана',
        'max_players': room.max_players,
        'players_count': len(players_data),
        'players': players_data,
        'status': room.status,
        'created_at': room.created_at,
    })
    
    
from django.contrib.auth.models import User 
@api_view(['POST'])
@permission_classes([AllowAny])
def join_room(request):
    """
    Присоединение к комнате по коду 
    """
    code = request.data.get('code', '').strip().upper()
    user_id = request.data.get('user_id')
    
    if not code:
        return Response({'error': 'Введите код комнаты'}, status=400)
    
    if not user_id:
        return Response({'error': 'Ошибка аутентификации'}, status=400)
    
    try:
        room = Room.objects.get(code=code)
    except Room.DoesNotExist:
        return Response({'error': 'Комната с таким кодом не найдена'}, status=404)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=404)
    
    if room.status != 'waiting':
        return Response({'error': 'Игра уже началась'}, status=400)
    
    if room.get_players_count() >= room.max_players:
        return Response({'error': 'В комнате нет свободных мест'}, status=400)
    
    if RoomPlayer.objects.filter(room=room, player=user).exists():
        return Response({'error': 'Вы уже в этой комнате'}, status=400)
    
    RoomPlayer.objects.create(room=room, player=user)
    
    return Response({
        'message': 'Вы успешно присоединились к комнате',
        'room_id': room.id,
        'room_code': room.code,
        'is_owner': room.creator.id == user.id,
        'players_count': room.get_players_count()
    })
    
    
from django.utils import timezone
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_game(request, room_id):
    """Начало игры в комнате (для создателя)"""
    room = get_object_or_404(Room, code=room_id)
    
    if room.creator != request.user:
        return Response({'error': 'Только создатель может начать игру'}, status=403)
    
    if room.status != 'waiting':
        return Response({'error': 'Игра уже начата или завершена'}, status=400)
    
    if room.get_players_count() < 3: 
        return Response({'error': 'Недостаточно игроков для начала игры'}, status=400)
    
    room.status = 'active'
    room.started_at = timezone.now()
    room.save()
    
    
    return Response({
        'message': 'Игра начата',
        'room': RoomSerializer(room).data
    })
    
    
@api_view(['DELETE'])
@permission_classes([AllowAny])
def room_player_manage(request, room_id, player_id):
    """
    Управление игроком в комнате (выход или удаление)
    """
    try:
        room = Room.objects.get(code=room_id)
        player = User.objects.get(id=player_id)
    except (Room.DoesNotExist, User.DoesNotExist):
        return Response({'error': 'Комната или игрок не найден'}, status=404)
    
    # Удаляем игрока из комнаты
    deleted_count, _ = RoomPlayer.objects.filter(room=room, player=player).delete()
    
    if deleted_count > 0:
        return Response({
            'message': f'Игрок {player.username} удален из комнаты',
            'player_id': player_id
        })
    else:
        return Response({'error': 'Игрок не найден в комнате'}, status=404) 
    
    
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_room(request, room_id):
    """
    Удаление комнаты (только для создателя)
    """
    try:
        room = Room.objects.get(code=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Комната не найдена'}, status=404)
 
    RoomPlayer.objects.filter(room=room).delete()
    
    room.delete()
    
    return Response({
        'message': 'Комната успешно удалена',
        'room_id': room_id
    })    