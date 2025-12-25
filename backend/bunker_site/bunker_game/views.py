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
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def start_game(request, room_id):
    """Начало игры в комнате"""
    try:
        print(f"=== START GAME REQUEST ===")
        print(f"Room code: {room_id}")
        print(f"Request data: {request.data}")
        
        room = get_object_or_404(Room, code=room_id)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'Не указан user_id'}, status=400)
        
        # Проверяем, является ли пользователь создателем комнаты
        if room.creator.id != int(user_id):
            return Response({'error': 'Только создатель может начать игру'}, status=403)
        
        if room.get_players_count() < 2:  # Уменьшил для тестирования
            return Response({'error': f'Недостаточно игроков для начала игры. Нужно минимум 2, сейчас {room.get_players_count()}'}, status=400)
        
        if not room.deck:
            return Response({'error': 'Не выбрана колода'}, status=400)
        
        print(f"Room {room.code} has deck: {room.deck.name}")
        print(f"Players count: {room.get_players_count()}")
        
        # Меняем статус комнаты
        room.status = 'active'
        room.started_at = timezone.now()
        room.save()
        
        # Инициализируем игру
        success = initialize_game(room)
        
        if not success:
            return Response({'error': 'Ошибка инициализации игры'}, status=500)
        
        # Проверяем, что GameState создан
        try:
            game_state = GameState.objects.get(room=room)
            print(f"GameState verified: id={game_state.id}")
        except GameState.DoesNotExist:
            return Response({'error': 'GameState не был создан'}, status=500)
        
        return Response({
            'message': 'Игра успешно начата',
            'room_id': room.id,
            'room_code': room.code,
            'status': room.status,
            'players_count': room.get_players_count(),
            'success': True
        })
        
    except Exception as e:
        print(f"Error in start_game: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
    
    
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
    
    

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
from .models import GameState, PlayerCard, Room, RoomPlayer, Card, Deck
from django.utils import timezone


def initialize_game(room):
    """Инициализация игры: раздача карт"""
    try:
        print(f"=== INITIALIZE GAME ===")
        print(f"Room: {room.code}")
        print(f"Deck: {room.deck}")
        print(f"Players: {room.current_players.count()}")
        
        deck = room.deck
        
        if not deck:
            print("ERROR: No deck assigned to room")
            return False
        
        # 1. Создаем или обновляем GameState
        game_state, created = GameState.objects.get_or_create(
            room=room
        )
        
        print(f"GameState created: {created}, id: {game_state.id}")
        
        # 2. Выбираем катастрофу
        catastrophe_cards = deck.cards.filter(card_type='catastrophe')
        if catastrophe_cards.exists():
            catastrophe_card = random.choice(list(catastrophe_cards))
            game_state.catastrophe_card = catastrophe_card
            print(f"Selected catastrophe: {catastrophe_card.title}")
        
        # 3. Выбираем бункер
        bunker_cards = deck.cards.filter(card_type='bunker')
        if bunker_cards.exists():
            bunker_card = random.choice(list(bunker_cards))
            game_state.bunker_card = bunker_card
            print(f"Selected bunker: {bunker_card.title}")
        
        # 4. Устанавливаем начальные значения
        game_state.current_round = 1
        game_state.current_phase = 'game'
        game_state.current_player_index = 0
        game_state.save()
        print(f"GameState saved with round {game_state.current_round}, phase {game_state.current_phase}")
        
        # 5. Раздаем карты игрокам
        players = room.current_players.all()
        print(f"Players to deal cards to: {players.count()}")
        
        if players.count() == 0:
            print("ERROR: No players in room")
            return False
        
        # Типы карт для игроков (6 карт на игрока)
        player_card_types = ['profession', 'health', 'hobby', 'personality', 'luggage', 'additional']
        
        for player in players:
            print(f"  Dealing cards for player {player.username} (ID: {player.id})")
            
            # Удаляем старые карты игрока (если есть)
            deleted_count, _ = PlayerCard.objects.filter(player=player, room=room).delete()
            if deleted_count > 0:
                print(f"    Deleted {deleted_count} old cards")
            
            cards_created = 0
            # Создаем 6 карт для игрока
            for card_type in player_card_types:
                cards_of_type = deck.cards.filter(card_type=card_type)
                if cards_of_type.exists():
                    card = random.choice(list(cards_of_type))
                    PlayerCard.objects.create(
                        player=player,
                        room=room,
                        card=card,
                        is_visible=False,
                        is_used=False
                    )
                    cards_created += 1
                    print(f"    - {card_type}: {card.title}")
            
            print(f"    Total cards created: {cards_created}")
        
        # 6. Проверяем, что карты созданы
        total_cards = PlayerCard.objects.filter(room=room).count()
        expected_cards = players.count() * 6
        print(f"Total cards in room: {total_cards}, expected: {expected_cards}")
        
        if total_cards != expected_cards:
            print(f"ERROR: Card distribution mismatch!")
            return False
        
        # 7. Определяем первого игрока
        if players.exists():
            first_player = random.choice(list(players))
            game_state.current_player_index = 0  # первый игрок в списке
            # Если используете поле current_player, раскомментируйте:
            # game_state.current_player = first_player
            game_state.save()
            print(f"First player: {first_player.username}")
        
        print(f"Game initialization completed for room {room.code}")
        return True
        
    except Exception as e:
        print(f"Error in initialize_game: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
         
@api_view(['GET'])
def game_info_init(request, room_code):
    """
    Первоначальная информация об игре (катастрофа, бункер)
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        
        # Проверяем, что пользователь в комнате
        user_id = request.user.id if request.user.is_authenticated else None
        user = get_object_or_404(User, id=user_id) if user_id else None
        
        if not room.current_players.filter(id=user_id).exists():
            return Response({'error': 'Вы не в этой комнате'}, status=403)
        
        # Получаем состояние игры
        game_state = get_object_or_404(GameState, room=room)
        
        data = {
            'catastrophe': game_state.catastrophe_card.description if game_state.catastrophe_card else 'Катастрофа не выбрана',
            'bunker': game_state.bunker_card.description if game_state.bunker_card else 'Бункер не выбран',
            'room_code': room.code,
            'status': room.status
        }
        
        return Response(data)
        
    except GameState.DoesNotExist:
        return Response({'error': 'Игра еще не начата'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def game_info(request, room_code):
    """
    Текущее состояние игры (обновляется каждую секунду)
    """
    try:
        print(f"=== GAME INFO REQUEST ===")
        print(f"Room code: {room_code}")
        print(f"Query params: {dict(request.GET)}")
        
        room = get_object_or_404(Room, code=room_code)
        
        # Получаем user_id из query параметров
        user_id = request.GET.get('user_id')
        if not user_id:
            print("ERROR: user_id not provided in query params")
            return Response({'error': 'Не указан user_id'}, status=400)
        
        print(f"User ID from query: {user_id}")
        
        try:
            user_id_int = int(user_id)
            current_player = User.objects.get(id=user_id_int)
            print(f"User found: {current_player.username} (ID: {current_player.id})")
        except (ValueError, User.DoesNotExist):
            print(f"ERROR: User with ID {user_id} not found")
            return Response({'error': 'Пользователь не найден'}, status=404)
        
        # Проверяем, что пользователь в комнате
        if not room.current_players.filter(id=user_id_int).exists():
            print(f"ERROR: User {user_id_int} is not in room {room_code}")
            return Response({'error': 'Вы не в этой комнате'}, status=403)
        
        # Проверяем статус комнаты
        if room.status != 'active':
            print(f"Room status is {room.status}, not 'active'")
            return Response({'error': 'Игра еще не начата'}, status=400)
        
        # Пытаемся получить GameState
        try:
            game_state = GameState.objects.get(room=room)
            print(f"GameState found: id={game_state.id}")
        except GameState.DoesNotExist:
            print(f"ERROR: GameState not found for room {room_code}")
            return Response({
                'error': 'Игра не инициализирована',
                'room_status': room.status,
                'phase': 'waiting',
                'message': 'Ожидайте инициализации игры'
            }, status=200)
        
        # Функция для получения nickname
        def get_nickname(user):
            try:
                profile = UserProfile.objects.get(user=user)
                return profile.nickname
            except UserProfile.DoesNotExist:
                return user.username
        
        # Получаем nickname текущего игрока
        current_player_nickname = get_nickname(current_player)
        
        # Получаем карты текущего игрока
        player_cards = []
        if current_player:
            player_cards_objs = PlayerCard.objects.filter(player=current_player, room=room)
            player_cards = [{
                'id': pc.id,
                'nickname': current_player_nickname,
                'category_id': get_category_id(pc.card.card_type),
                'name': pc.card.title,
                'is_choose': pc.is_visible,
                'is_leave': False,
                'is_wait': not pc.is_visible
            } for pc in player_cards_objs]
            print(f"Player cards count: {len(player_cards)}")
        
        # ВАЖНО: Получаем открытые карты в текущем раунде для ВСЕХ игроков
        open_cards = []
        all_players = room.current_players.all()
        players_list = list(all_players)
        
        # Определяем текущего игрока (чей ход)
        current_player_index = game_state.current_player_index
        current_player_turn = None
        if 0 <= current_player_index < len(players_list):
            current_player_turn = players_list[current_player_index]
        
        print(f"Total players: {len(players_list)}")
        print(f"Current player index: {current_player_index}")
        print(f"Current player turn: {current_player_turn}")
        
        for i, player in enumerate(players_list):
            player_nickname = get_nickname(player)
            
            # Проверяем, открыл ли игрок карту в текущем раунде
            # Для этого ищем открытые карты игрока (is_visible=True)
            opened_card = PlayerCard.objects.filter(
                player=player, 
                room=room, 
                is_visible=True
            ).first()
            
            # Определяем статусы
            is_current_turn = (player == current_player_turn)
            has_opened_card = (opened_card is not None)
            
            # Создаем объект карты для каждого игрока
            if opened_card:
                # Если игрок уже открыл карту в этом раунде
                card_data = {
                    'id': opened_card.id,
                    'nickname': player_nickname,
                    'category_id': get_category_id(opened_card.card.card_type),
                    'name': opened_card.card.title,
                    'is_choose': False,  # уже выбрал
                    'is_leave': False,   # не выбыл
                    'is_wait': False     # не ждет
                }
            else:
                # Если игрок еще не открыл карту
                # Находим любую его закрытую карту для отображения
                closed_card = PlayerCard.objects.filter(
                    player=player, 
                    room=room, 
                    is_visible=False
                ).first()
                
                if closed_card and is_current_turn:
                    # Если сейчас его ход - он выбирает карту
                    card_data = {
                        'id': closed_card.id if closed_card else 0,
                        'nickname': player_nickname,
                        'category_id': get_category_id(closed_card.card.card_type) if closed_card else 0,
                        'name': "",  # пустое название, так как карта еще не открыта
                        'is_choose': True,   # выбирает карту
                        'is_leave': False,   # не выбыл
                        'is_wait': False     # не ждет (сейчас его ход)
                    }
                elif closed_card:
                    # Если не его ход - он ждет
                    card_data = {
                        'id': closed_card.id if closed_card else 0,
                        'nickname': player_nickname,
                        'category_id': get_category_id(closed_card.card.card_type) if closed_card else 0,
                        'name': "",  # пустое название
                        'is_choose': False,  # не выбирает
                        'is_leave': False,   # не выбыл
                        'is_wait': True      # ждет своего хода
                    }
                else:
                    # Если нет карт (запасной вариант)
                    card_data = {
                        'id': i + 1000,  # временный ID
                        'nickname': player_nickname,
                        'category_id': 0,
                        'name': "",
                        'is_choose': False,
                        'is_leave': False,
                        'is_wait': True
                    }
            
            open_cards.append(card_data)
        
        print(f"Open cards created: {len(open_cards)}")
        
        # Получаем всех игроков для голосования (оставляем как есть)
        players_data = []
        for player in all_players:
            player_cards_objs = PlayerCard.objects.filter(player=player, room=room)
            cards = [{
                'id': pc.id,
                'category_id': get_category_id(pc.card.card_type),
                'name': pc.card.title if pc.is_visible else ''
            } for pc in player_cards_objs]
            
            player_nickname = get_nickname(player)
            
            can_vote = True
            if player.id == user_id_int:
                can_vote = False
            
            players_data.append({
                'playerId': player.id,
                'nickname': player_nickname,
                'canVote': can_vote,
                'cards': cards,
                'hasUserVoted': False
            })
        
        # Определяем текущую фазу для каждого раунда
        rounds_data = []
        for i in range(1, 5):
            is_current = game_state.current_round == i
            current_phase = game_state.current_phase if is_current else ''
            
            if i == 1 and game_state.current_phase not in ['game', 'discussion']:
                current_phase = ''
            elif i in [2, 3] and game_state.current_phase not in ['game', 'discussion', 'voting']:
                current_phase = ''
            elif i == 4 and game_state.current_phase != 'final':
                current_phase = ''
            
            rounds_data.append({
                'id': i,
                'number': i,
                'is_current': is_current,
                'current_phase': current_phase
            })
        
        # Описание угрозы
        danger = get_danger_description(game_state.current_round)
        
        # Определяем, ход ли текущего игрока
        is_your_turn = False
        if current_player_turn:
            is_your_turn = current_player_turn.id == user_id_int
        
        print(f"Phase: {game_state.current_phase}")
        print(f"Round: {game_state.current_round}")
        print(f"Is your turn: {is_your_turn}")
        print(f"Danger: {danger}")
        
        data = {
            'success': True,
            'phase': game_state.current_phase,
            'danger': danger,
            'rounds': rounds_data,
            'openCards': open_cards,
            'playerCards': player_cards,
            'playersData': players_data,
            'current_player_id': current_player_turn.id if current_player_turn else None,
            'is_your_turn': is_your_turn
        }
        
        print(f"Returning data with keys: {list(data.keys())}")
        return Response(data)
        
    except Exception as e:
        print(f"Error in game_info: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
       
@api_view(['POST'])
def make_move(request, room_code):
    """Игрок делает ход (открывает карту)"""
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        player_id = request.data.get('player_id')
        card_id = request.data.get('card_id')
        
        player = get_object_or_404(User, id=player_id)
        player_card = get_object_or_404(PlayerCard, id=card_id, player=player, room=room)
        
        # Проверяем, что сейчас фаза game
        if game_state.current_phase != 'game':
            return Response({'error': 'Сейчас не фаза игрового стола'}, status=400)
        
        # Проверяем, что это ход текущего игрока
        if game_state.current_player.id != player_id:
            return Response({'error': 'Сейчас не ваш ход'}, status=400)
        
        # Проверяем, что карта еще не открыта
        if player_card.is_visible:
            return Response({'error': 'Эта карта уже открыта'}, status=400)
        
        # Открываем карту
        player_card.is_visible = True
        player_card.save()
        
        # Передаем ход следующему игроку
        players = list(room.current_players.all())
        current_index = list(players).index(game_state.current_player)
        next_index = (current_index + 1) % len(players)
        
        game_state.current_player = players[next_index]
        game_state.current_player_index = next_index
        
        # Проверяем, все ли игроки сделали ход в этом раунде
        all_players_moved = all(
            PlayerCard.objects.filter(
                player=p, 
                room=room, 
                is_visible=True
            ).count() >= game_state.current_round 
            for p in players
        )
        
        if all_players_moved:
            # Переходим к фазе обсуждения
            game_state.current_phase = 'discussion'
        
        game_state.save()
        
        return Response({
            'message': 'Ход успешно сделан',
            'opened_card': player_card.card.title,
            'next_player': game_state.current_player.username,
            'phase': game_state.current_phase
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def vote(request, room_code):
    """Игрок голосует за исключение другого игрока"""
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        voter_id = request.data.get('voter_id')
        target_player_id = request.data.get('player_id')
        
        voter = get_object_or_404(User, id=voter_id)
        target_player = get_object_or_404(User, id=target_player_id)
        
        # Проверяем, что сейчас фаза голосования
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        # Проверяем, что игрок не голосует за себя
        if voter_id == target_player_id:
            return Response({'error': 'Нельзя голосовать за себя'}, status=400)
        
        # Проверяем, что оба игрока в комнате
        if not room.current_players.filter(id=voter_id).exists():
            return Response({'error': 'Вы не в этой комнате'}, status=400)
        if not room.current_players.filter(id=target_player_id).exists():
            return Response({'error': 'Игрок не найден в комнате'}, status=400)
        
        # Здесь нужно добавить модель Vote для сохранения голосов
        # Пока просто возвращаем успех
        
        return Response({
            'message': 'Голос принят',
            'voter': voter.username,
            'target': target_player.username
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def time_discussion_end(request, room_code):
    """Завершение времени обсуждения"""
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        if game_state.current_phase != 'discussion':
            return Response({'error': 'Сейчас не фаза обсуждения'}, status=400)
        
        # Переходим к голосованию
        game_state.current_phase = 'voting'
        game_state.save()
        
        return Response({
            'message': 'Обсуждение завершено, начинается голосование',
            'phase': game_state.current_phase
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def time_voting_end(request, room_code):
    """Завершение времени голосования"""
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        # Здесь должна быть логика подсчета голосов и исключения игрока
        
        # Переходим к следующему раунду
        game_state.current_round += 1
        
        if game_state.current_round > 4:
            # Игра завершена
            game_state.current_phase = 'final'
            room.status = 'finished'
            room.save()
        else:
            # Начинаем следующий раунд
            game_state.current_phase = 'game'
        
        game_state.save()
        
        return Response({
            'message': 'Голосование завершено',
            'current_round': game_state.current_round,
            'phase': game_state.current_phase
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def get_category_id(card_type):
    """Конвертация типа карты в ID категории"""
    mapping = {
        'catastrophe': 1,
        'profession': 2,
        'health': 3,
        'hobby': 4,
        'personality': 5,
        'luggage': 6,
        'additional': 7,
        'bunker': 8
    }
    return mapping.get(card_type, 0)

def get_danger_description(round_number):
    """Описание угрозы в зависимости от раунда"""
    dangers = {
        1: "Радиационный фон повышается. Внешняя температура -30°C.",
        2: "Запасы кислорода сокращаются. Внешняя температура -40°C.",
        3: "Система очистки воздуха дает сбой. Внешняя температура -50°C.",
        4: "Критический уровень радиации. Внешняя температура -60°C."
    }
    return dangers.get(round_number, "")