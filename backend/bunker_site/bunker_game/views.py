from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Deck, Card
from .serializers import (
    DeckSerializer, CardSerializer, 
    DeckCreateSerializer, CardCreateSerializer,
    RoomSerializer, RoomCreateSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from users.models import UserProfile
from django.contrib.auth.models import User 

import random
from django.utils import timezone
from .models import GameState, PlayerCard, Room, RoomPlayer, Card, Deck, Vote
from collections import Counter

@api_view(['GET'])
@permission_classes([AllowAny])
def deck_list(request):
    decks = Deck.objects
    serializer = DeckSerializer(decks, many=True)
    return Response({'decks': serializer.data})

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def deck_detail(request, id):
    if (request.method == "GET"):
        decks = Deck.objects.filter(user_id__in=[id, 22])
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

@api_view(['POST'])
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

@api_view(['GET'])
@permission_classes([AllowAny])
def card_list(request):
    deck_id = request.GET.get('deck_id')
    
    if deck_id:
        cards = Card.objects.filter(deck_id=deck_id)
    else:
        cards = Card.objects
    
    serializer = CardSerializer(cards, many=True)
    return Response({'cards': serializer.data})

@api_view(['GET', 'PUT', 'DELETE'])
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

@api_view(['POST'])
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
@permission_classes([AllowAny])
def game_info_init(request, room_code):
    """
    Первоначальная информация об игре (катастрофа, бункер)
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        
        # Получаем user_id из query параметров
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({'error': 'Не указан user_id'}, status=400)
        
        try:
            user = User.objects.get(id=int(user_id))
        except (ValueError, User.DoesNotExist):
            return Response({'error': 'Пользователь не найден'}, status=404)
        
        # Проверяем, что пользователь в комнате
        if not room.current_players.filter(id=user.id).exists():
            return Response({'error': 'Вы не в этой комнате'}, status=403)
        
        # Получаем состояние игры
        game_state = get_object_or_404(GameState, room=room)
        
        data = {
            'catastrophe': game_state.catastrophe_card.description if game_state.catastrophe_card else '',
            'bunker': game_state.bunker_card.description if game_state.bunker_card else '',
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
        room = get_object_or_404(Room, code=room_code)
        user_id = request.GET.get('user_id')
        
        if not user_id:
            return Response({'error': 'Не указан user_id'}, status=400)
        
        try:
            current_user = User.objects.get(id=int(user_id))
        except (ValueError, User.DoesNotExist):
            return Response({'error': 'Пользователь не найден'}, status=404)
        
        # Проверяем, что пользователь в комнате
        if not room.current_players.filter(id=current_user.id).exists():
            return Response({'error': 'Вы не в этой комнате'}, status=403)
        
        # Проверяем статус комнаты
        if room.status != 'active':
            return Response({
                'success': True,
                'phase': 'waiting',
                'message': 'Ожидайте начала игры'
            })
        
        # Получаем состояние игры
        try:
            game_state = GameState.objects.get(room=room)
        except GameState.DoesNotExist:
            return Response({
                'success': True,
                'phase': 'waiting',
                'message': 'Игра инициализируется'
            })
        
        # Получаем всех игроков в комнате
        room_players = RoomPlayer.objects.filter(room=room)
        players_list = [rp.player for rp in room_players]
        
        # Определяем текущего игрока (чей ход)
        current_player_index = game_state.current_player_index
        current_player_turn = None
        if 0 <= current_player_index < len(players_list):
            current_player_turn = players_list[current_player_index]
        
        # 1. OpenCards - карточки, открытые в этом раунде
        open_cards = []
        for player in players_list:
            player_nickname = get_nickname(player)
            is_current_turn = (player == current_player_turn)
            
            # Ищем ЛЮБУЮ карту игрока (для теста)
            player_card = PlayerCard.objects.filter(player=player, room=room).first()
            
            if player_card:
                # Есть карты у игрока
                card_data = {
                    'id': player_card.id,
                    'nickname': player_nickname,
                    'category_id': get_category_id(player_card.card.card_type),
                    'name': player_card.card.title if player_card.is_visible else '',
                    'is_choose': is_current_turn and not player_card.is_visible,
                    'is_leave': False,
                    'is_wait': not is_current_turn and not player_card.is_visible
                }
            else:
                # Нет карт у игрока
                card_data = {
                    'id': player.id * 1000,
                    'nickname': player_nickname,
                    'category_id': 0,
                    'name': '',
                    'is_choose': is_current_turn,
                    'is_leave': False,
                    'is_wait': not is_current_turn
                }
            
            open_cards.append(card_data)
        
        # 2. PlayerCards - личные карты текущего пользователя
        player_cards = []
        if game_state.current_phase == 'game':
            user_cards = PlayerCard.objects.filter(player=current_user, room=room)
            player_cards = [{
                'id': pc.id,
                'nickname': get_nickname(current_user),
                'category_id': get_category_id(pc.card.card_type),
                'name': pc.card.title if pc.is_visible else '',
                'is_choose': pc.is_visible
            } for pc in user_cards]
        
        # 3. PlayersData - информация о картах всех игроков
        players_data = []
        for player in players_list:
            player_cards_objs = PlayerCard.objects.filter(player=player, room=room)
            cards = [{
                'id': pc.id,
                'category_id': get_category_id(pc.card.card_type),
                'name': pc.card.title if pc.is_visible else ''
            } for pc in player_cards_objs]
            
            player_nickname = get_nickname(player)
            can_vote = (player.id != current_user.id)
            
            players_data.append({
                'playerId': player.id,
                'nickname': player_nickname,
                'canVote': can_vote,
                'cards': cards,
                'hasUserVoted': False
            })
        
        # 4. Rounds
        rounds_data = []
        for i in range(1, 5):
            is_current = (game_state.current_round == i)
            current_phase = game_state.current_phase if is_current else ''
            
            rounds_data.append({
                'id': i,
                'number': i,
                'is_current': is_current,
                'current_phase': current_phase
            })
        
        # 5. Danger
        danger = ''
        if game_state.current_phase in ['game', 'discussion']:
            danger = get_danger_description(game_state.current_round)
        
        # 6. Ход ли текущего игрока
        is_your_turn = False
        if current_player_turn:
            is_your_turn = (current_player_turn.id == current_user.id)
        
        return Response({
            'success': True,
            'phase': game_state.current_phase,
            'danger': danger,
            'rounds': rounds_data,
            'openCards': open_cards,
            'playerCards': player_cards,
            'playersData': players_data,
            'current_player_id': current_player_turn.id if current_player_turn else None,
            'is_your_turn': is_your_turn,
            'room_status': room.status
        })
        
    except Exception as e:
        print(f"Error in game_info: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def make_move(request, room_code):
    """
    Игрок делает ход (открывает карту)
    Фаза 1 по ТЗ
    """
    try:
        print(f"\n=== MAKE_MOVE REQUEST ===")
        print(f"Room code: {room_code}")
        print(f"Request data: {request.data}")
        
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        player_id = request.data.get('player_id')
        card_id = request.data.get('card_id')
        
        print(f"Player ID from request: {player_id}")
        print(f"Card ID from request: {card_id}")
        
        if not player_id:
            print("✗ No player_id provided")
            return Response({'error': 'Не указан player_id'}, status=400)
        
        if not card_id:
            print("✗ No card_id provided")
            return Response({'error': 'Не указан card_id'}, status=400)
        
        try:
            player = User.objects.get(id=player_id)
            print(f"✓ Player found: {player.username} (ID: {player.id})")
        except User.DoesNotExist:
            print(f"✗ Player not found: {player_id}")
            return Response({'error': 'Игрок не найден'}, status=404)
        
        try:
            player_card = PlayerCard.objects.get(id=card_id, player=player, room=room)
            print(f"✓ PlayerCard found: {player_card.id}, card: {player_card.card.title}")
            print(f"  Card visible: {player_card.is_visible}, used: {player_card.is_used}")
        except PlayerCard.DoesNotExist:
            print(f"✗ PlayerCard not found: card_id={card_id}, player_id={player_id}, room={room_code}")
            # Покажем какие карты есть у этого игрока
            player_cards = PlayerCard.objects.filter(player=player, room=room)
            print(f"  Available cards for player {player.username}:")
            for pc in player_cards:
                print(f"    - ID: {pc.id}, Card: {pc.card.title}, Visible: {pc.is_visible}, Used: {pc.is_used}")
            return Response({'error': 'Карта не найдена у этого игрока'}, status=404)
        
        # Проверяем, что сейчас фаза game
        if game_state.current_phase != 'game':
            print(f"✗ Wrong phase: {game_state.current_phase}, expected 'game'")
            return Response({'error': 'Сейчас не фаза игрового стола'}, status=400)
        
        # Проверяем, что это ход текущего игрока
        players_list = list(room.current_players.all())
        print(f"Players in room: {[p.username for p in players_list]}")
        print(f"Current player index: {game_state.current_player_index}")
        
        if not (0 <= game_state.current_player_index < len(players_list)):
            print(f"✗ Invalid player index: {game_state.current_player_index}, players count: {len(players_list)}")
            return Response({'error': 'Ошибка определения текущего игрока'}, status=400)
        
        current_player = players_list[game_state.current_player_index]
        print(f"Current player should be: {current_player.username} (ID: {current_player.id})")
        
        if current_player.id != player.id:
            print(f"✗ Not player's turn: {player.username} vs current: {current_player.username}")
            return Response({'error': 'Сейчас не ваш ход'}, status=400)
        
        # Проверяем, что карта еще не открыта и не использована
        if player_card.is_visible or player_card.is_used:
            print(f"✗ Card already used: visible={player_card.is_visible}, used={player_card.is_used}")
            return Response({'error': 'Эта карта уже использована'}, status=400)
        
        # Открываем карту
        player_card.is_visible = True
        player_card.save()
        print(f"✓ Card opened: {player_card.card.title}")
        
        # Передаем ход следующему игроку
        next_index = (game_state.current_player_index + 1) % len(players_list)
        game_state.current_player_index = next_index
        game_state.save()
        
        print(f"✓ Turn passed to player index: {next_index}")
        
        # Проверяем, все ли игроки сделали ход в этом раунде
        players_moved_counts = []
        for p in players_list:
            count = PlayerCard.objects.filter(
                player=p, 
                room=room, 
                is_visible=True,
                is_used=False
            ).count()
            players_moved_counts.append(f"{p.username}: {count}")
        
        print(f"Visible cards per player: {', '.join(players_moved_counts)}")
        
        all_players_moved = all(
            PlayerCard.objects.filter(
                player=p, 
                room=room, 
                is_visible=True,
                is_used=False
            ).count() >= game_state.current_round 
            for p in players_list
        )
        
        print(f"All players moved in round {game_state.current_round}: {all_players_moved}")
        
        if all_players_moved:
            # Переходим к фазе обсуждения
            game_state.current_phase = 'discussion'
            game_state.save()
            
            # Помечаем все открытые карты как использованные в этом раунде
            updated = PlayerCard.objects.filter(
                room=room,
                is_visible=True,
                is_used=False
            ).update(is_used=True)
            
            print(f"✓ Moved to discussion phase, marked {updated} cards as used")
        
        return Response({
            'success': True,
            'message': 'Ход успешно сделан',
            'opened_card': player_card.card.title,
            'next_player_index': game_state.current_player_index,
            'phase': game_state.current_phase
        })
        
    except Exception as e:
        print(f"\n✗ ERROR in make_move: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def vote(request, room_code):
    """
    Игрок голосует за исключение другого игрока
    Фаза 3 по ТЗ
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        voter_id = request.data.get('voter_id')
        target_player_id = request.data.get('player_id')
        
        if not voter_id or not target_player_id:
            return Response({'error': 'Не указаны voter_id или player_id'}, status=400)
        
        # Проверяем, что сейчас фаза voting
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        voter = get_object_or_404(User, id=voter_id)
        target_player = get_object_or_404(User, id=target_player_id)
        
        # Проверяем, что игрок не голосует за себя
        if voter.id == target_player.id:
            return Response({'error': 'Нельзя голосовать за себя'}, status=400)
        
        # Проверяем, что оба игрока в комнате
        if not room.current_players.filter(id=voter.id).exists():
            return Response({'error': 'Вы не в этой комнате'}, status=400)
        if not room.current_players.filter(id=target_player.id).exists():
            return Response({'error': 'Игрок не найден в комнате'}, status=400)
        
        # Проверяем, не голосовал ли уже этот игрок в этом раунде
        existing_vote = Vote.objects.filter(
            room=room,
            voter=voter,
            round_number=game_state.current_round
        ).first()
        
        if existing_vote:
            # Обновляем существующий голос
            existing_vote.target_player = target_player
            existing_vote.save()
            message = 'Голос изменен'
        else:
            # Создаем новый голос
            Vote.objects.create(
                room=room,
                voter=voter,
                target_player=target_player,
                round_number=game_state.current_round
            )
            message = 'Голос принят'
        
        return Response({
            'success': True,
            'message': message,
            'voter': voter.username,
            'target': target_player.username
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def time_discussion_end(request, room_code):
    """
    Завершение времени обсуждения
    Фаза 2 по ТЗ
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        # Проверяем, что сейчас фаза discussion
        if game_state.current_phase != 'discussion':
            return Response({'error': 'Сейчас не фаза обсуждения'}, status=400)
        
        # Проверяем, в каком раунде мы находимся
        if game_state.current_round in [2, 3]:
            # Для раундов 2 и 3 переходим к голосованию
            game_state.current_phase = 'voting'
            game_state.save()
            
            # Сбрасываем голоса за этот раунд
            Vote.objects.filter(room=room, round_number=game_state.current_round).delete()
        elif game_state.current_round == 1:
            # Для раунда 1 переходим ко второму раунду
            game_state.current_round = 2
            game_state.current_phase = 'game'
            game_state.current_player_index = 0  # Сбрасываем на первого игрока
            game_state.save()
        elif game_state.current_round == 4:
            # Для раунда 4 переходим к финалу
            game_state.current_phase = 'final'
            game_state.save()
        
        return Response({
            'success': True,
            'message': 'Обсуждение завершено',
            'phase': game_state.current_phase,
            'round': game_state.current_round
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def time_voting_end(request, room_code):
    """
    Завершение времени голосования
    Фаза 4 по ТЗ
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        # Проверяем, что сейчас фаза voting
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        # Получаем все голоса за текущий раунд
        votes = Vote.objects.filter(room=room, round_number=game_state.current_round)
        
        # Подсчитываем голоса
        vote_counts = Counter(vote.target_player_id for vote in votes)
        
        if vote_counts:
            # Находим игрока с максимальным количеством голосов
            most_voted_player_id, max_votes = vote_counts.most_common(1)[0]
            
            # Исключаем игрока
            excluded_player = get_object_or_404(User, id=most_voted_player_id)
            RoomPlayer.objects.filter(room=room, player=excluded_player).delete()
            
            # Удаляем его карты
            PlayerCard.objects.filter(room=room, player=excluded_player).delete()
        
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
            game_state.current_player_index = 0  # Сбрасываем на первого игрока
        
        game_state.save()
        
        return Response({
            'success': True,
            'message': 'Голосование завершено',
            'excluded_player': excluded_player.username if 'excluded_player' in locals() else None,
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

def get_nickname(user):
    """Получение nickname пользователя"""
    try:
        profile = UserProfile.objects.get(user=user)
        return profile.nickname if profile.nickname else user.username
    except UserProfile.DoesNotExist:
        return user.username

@api_view(['GET'])
@permission_classes([AllowAny])
def get_game_results(request, room_code):
    """
    Получение результатов игры (для фазы final)
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        if game_state.current_phase != 'final':
            return Response({'error': 'Игра еще не завершена'}, status=400)
        
        # Получаем оставшихся игроков
        remaining_players = room.current_players.all()
        
        results = []
        for player in remaining_players:
            player_cards = PlayerCard.objects.filter(player=player, room=room, is_visible=True)
            cards_info = [{
                'type': pc.card.get_card_type_display(),
                'title': pc.card.title,
                'description': pc.card.description
            } for pc in player_cards]
            
            results.append({
                'player_id': player.id,
                'nickname': get_nickname(player),
                'cards': cards_info
            })
        
        return Response({
            'success': True,
            'catastrophe': game_state.catastrophe_card.description if game_state.catastrophe_card else '',
            'bunker': game_state.bunker_card.description if game_state.bunker_card else '',
            'winners': results,
            'total_players': remaining_players.count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)