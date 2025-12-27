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

RANDOM_NAMES = [
    "Анонимный_выживальщик", "Тайный_гость", "Загадочный_странник", 
    "Неизвестный_игрок", "Случайный_свидетель", "Тень_в_бункере",
    "Безымянный_герой", "Гость_из_вне", "Номер_шесть", "Посетитель_X",
    "Игрок_Икс", "Турист", "Новичок", "Прохожий", "Скиталец",
    "Путник", "Странник", "Гость", "Посетитель", "Аноним",
    "Незнакомец", "Секретный_агент", "Тайный_игрок", "Инкогнито"
]

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
    Присоединение к комнате по коду (для авторизованных и неавторизованных)
    """
    code = request.data.get('code', '').strip().upper()
    
    if not code:
        return Response({'error': 'Введите код комнаты'}, status=400)
    
    try:
        room = Room.objects.get(code=code)
    except Room.DoesNotExist:
        return Response({'error': 'Комната с таким кодом не найдена'}, status=404)
    
    # Получаем или создаем пользователя
    user = get_or_create_guest_user(request)
    
    if room.status != 'waiting':
        return Response({'error': 'Игра уже началась'}, status=400)
    
    if room.get_players_count() >= room.max_players:
        return Response({'error': 'В комнате нет свободных мест'}, status=400)
    
    # Проверяем, не присоединился ли уже этот пользователь
    if RoomPlayer.objects.filter(room=room, player=user).exists():
        return Response({'error': 'Вы уже в этой комнате'}, status=400)
    
    # Добавляем игрока в комнату
    RoomPlayer.objects.create(room=room, player=user)
    
    # Если пользователь временный, получаем его имя
    if hasattr(user, 'profile_temp'):
        # Извлекаем случайное имя из username
        username_parts = user.username.split('_')
        if len(username_parts) >= 2 and username_parts[1] in RANDOM_NAMES:
            display_name = username_parts[1]
        else:
            display_name = user.username
    else:
        # Для авторизованных пользователей используем nickname из профиля
        try:
            user_profile = UserProfile.objects.get(user=user)
            display_name = user_profile.nickname if user_profile.nickname else user.username
        except UserProfile.DoesNotExist:
            display_name = user.username
    
    return Response({
        'message': 'Вы успешно присоединились к комнате',
        'room_id': room.id,
        'room_code': room.code,
        'is_owner': room.creator.id == user.id,
        'is_guest': hasattr(user, 'profile_temp'),
        'user_id': user.id,
        'display_name': display_name,
        'players_count': room.get_players_count()
    })
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def start_game(request, room_id):
    """Начало игры в комнате"""
    try:
        room = get_object_or_404(Room, code=room_id)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'Не указан user_id'}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Пользователь не найден'}, status=404)
        
        # Проверяем, является ли пользователь создателем комнаты
        if room.creator.id != user.id:
            return Response({'error': 'Только создатель может начать игру'}, status=403)
        
        if room.get_players_count() < 2:  
            return Response({'error': f'Недостаточно игроков для начала игры. Нужно минимум 2, сейчас {room.get_players_count()}'}, status=400)
        
        if not room.deck:
            return Response({'error': 'Не выбрана колода'}, status=400)
    
        
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
        
        deck = room.deck
        
        if not deck:
            return False
        
        # Создаем или обновляем GameState
        game_state, created = GameState.objects.get_or_create(
            room=room
        )
                
        # Выбираем катастрофу
        catastrophe_cards = deck.cards.filter(card_type='catastrophe')
        if catastrophe_cards.exists():
            catastrophe_card = random.choice(list(catastrophe_cards))
            game_state.catastrophe_card = catastrophe_card
        
        # Выбираем бункер
        bunker_cards = deck.cards.filter(card_type='bunker')
        if bunker_cards.exists():
            bunker_card = random.choice(list(bunker_cards))
            game_state.bunker_card = bunker_card
        
        # Устанавливаем начальные значения
        game_state.current_round = 1
        game_state.current_phase = 'game'
        game_state.current_player_index = 0
        game_state.save()
        
        # Раздаем карты игрокам
        players = room.current_players.all()
        
        if players.count() == 0:
            return False
        
        # Типы карт для игроков 
        player_card_types = ['profession', 'health', 'hobby', 'personality', 'luggage', 'additional']
        
        for player in players:
            
            # Удаляем старые карты игрока 
            deleted_count, _ = PlayerCard.objects.filter(player=player, room=room).delete()
            
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
                
        
        # Проверяем, что карты созданы
        total_cards = PlayerCard.objects.filter(room=room).count()
        expected_cards = players.count() * 6

        
        # Определяем первого игрока
        if players.exists():
            first_player = random.choice(list(players))
            game_state.current_player_index = 0 
            game_state.save()
        
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
        
        # Проверяем статус комнаты
        if room.status == 'finished':
            # Игра завершена - возвращаем результаты
       
            try:
                game_state = GameState.objects.get(room=room)
                
                # Получаем оставшихся игроков через RoomPlayer
                room_players = RoomPlayer.objects.filter(room=room)
                current_players_list = [rp.player for rp in room_players]
                
                
                # Собираем информацию о победителях
                winners = []
                for player in current_players_list:
                    # Получаем все карты игрока (и открытые, и закрытые)
                    player_cards_objs = PlayerCard.objects.filter(player=player, room=room)
                    
                    # Отфильтровываем только открытые карты для отображения
                    visible_cards = [pc for pc in player_cards_objs if pc.is_visible]
                    
                    cards_info = []
                    for pc in visible_cards:
                        cards_info.append({
                            'id': pc.id,
                            'category_id': get_category_id(pc.card.card_type),
                            'name': pc.card.title,
                            'description': pc.card.description,
                            'type': pc.card.get_card_type_display()
                        })
                    
                    winners.append({
                        'player_id': player.id,
                        'nickname': get_nickname(player),
                        'cards': cards_info
                    })
                
                
                return Response({
                    'success': True,
                    'phase': 'final',
                    'room_status': 'finished',
                    'catastrophe': game_state.catastrophe_card.description if game_state.catastrophe_card else '',
                    'bunker': game_state.bunker_card.description if game_state.bunker_card else '',
                    'winners': winners,
                    'total_players': len(winners),
                    'current_round': game_state.current_round,
                    'message': 'Игра завершена!'
                })
                
            except GameState.DoesNotExist:
                return Response({
                    'success': True,
                    'phase': 'final',
                    'room_status': 'finished',
                    'message': 'Игра завершена'
                })
        
        # Проверяем, активна ли игра
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
        
        # Получаем всех игроков
        all_players_ever = User.objects.filter(
            player_rooms__room=room
        ).distinct()
        
        # Получаем текущих игроков
        room_players = RoomPlayer.objects.filter(room=room)
        current_players_list = [rp.player for rp in room_players]
        current_player_ids = [p.id for p in current_players_list]
        
        # Определяем, выбыл ли текущий пользователь
        current_user_is_excluded = current_user.id not in current_player_ids
        
        # Если пользователь выбыл, но комната активна - разрешаем просмотр
        if current_user_is_excluded and room.status == 'active':
            print(f"User {current_user.username} is excluded but can view the game")
        elif not current_user_is_excluded and room.status == 'active':
            # Проверяем, что пользователь в комнате
            if current_user.id not in current_player_ids:
                return Response({'error': 'Вы не в этой комнате'}, status=403)
        
        # Определяем выбывших игроков
        excluded_players = []
        for player in all_players_ever:
            if player.id not in current_player_ids:
                excluded_players.append({
                    'id': player.id,
                    'nickname': get_nickname(player),
                    'username': player.username
                })
        
        
        # Определяем чей ход
        current_player_index = game_state.current_player_index
        current_player_turn = None
        if 0 <= current_player_index < len(current_players_list):
            current_player_turn = current_players_list[current_player_index]
        
        open_cards = []
        
        # Для выбывших игроков показываем специальную карту
        for player in all_players_ever:
            player_nickname = get_nickname(player)
            is_excluded = player.id not in current_player_ids
            
            if is_excluded:
                # Игрок выбыл - показываем специальную карту
                card_data = {
                    'id': player.id * 1000,
                    'nickname': player_nickname,
                    'category_id': 0,
                    'name': 'Выбыл из бункера',
                    'is_choose': False,
                    'is_leave': True,  
                    'is_wait': False
                }
                print(f"Player {player.username} is excluded - showing leave card")
                open_cards.append(card_data)
                continue  # Переходим к следующему игроку
            
            # Если игрок активен, обрабатываем как обычно
            is_current_turn = (player == current_player_turn)
            
            # Находим карту, открытую в текущем раунде
            open_card_in_current_round = PlayerCard.objects.filter(
                player=player,
                room=room,
                is_visible=True,
                is_used=False  # Карта открыта в текущем раунде
            ).first()
            
            if open_card_in_current_round:
                # Игрок уже открыл карту в этом раунде
                card_data = {
                    'id': open_card_in_current_round.id,
                    'nickname': player_nickname,
                    'category_id': get_category_id(open_card_in_current_round.card.card_type),
                    'name': open_card_in_current_round.card.title,
                    'is_choose': False,  # уже не выбирает, карта открыта
                    'is_leave': False,
                    'is_wait': False
                }
            else:
                # Игрок еще не открыл карту в этом раунде
                closed_card = PlayerCard.objects.filter(
                    player=player,
                    room=room,
                    is_visible=False,
                    is_used=False
                ).first()
                
                if closed_card:
                    category_id = get_category_id(closed_card.card.card_type)
                else:
                    category_id = 0
                
                card_data = {
                    'id': closed_card.id if closed_card else player.id * 1000,
                    'nickname': player_nickname,
                    'category_id': category_id,
                    'name': '',  # Пустое название, так как карта еще не открыта
                    'is_choose': is_current_turn and game_state.current_phase == 'game',
                    'is_leave': False,
                    'is_wait': not is_current_turn and game_state.current_phase == 'game'
                }
            
            open_cards.append(card_data)
        
        
        # PlayerCards - личные карты текущего пользователя
        player_cards = []
        if game_state.current_phase == 'game' and not current_user_is_excluded:
            # Только неоткрытые карты текущего пользователя
            user_cards = PlayerCard.objects.filter(
                player=current_user, 
                room=room,
                is_visible=False,
                is_used=False
            )
         
            player_cards = [{
                'id': pc.id,
                'nickname': get_nickname(current_user),
                'category_id': get_category_id(pc.card.card_type),
                'name': pc.card.title,
                'is_choose': False,
                'is_leave': current_user_is_excluded,  # True, если пользователь выбыл
                'is_wait': True  
            } for pc in user_cards]
        elif current_user_is_excluded:
            print(f"User {current_user.username} is excluded - no player cards shown")
        
        # PlayersData - информация о картах всех игроков (для голосования)
        players_data = []
        for player in current_players_list:
            # Все карты игрока
            player_cards_objs = PlayerCard.objects.filter(player=player, room=room)
            cards = []
            
            for pc in player_cards_objs:
                # Для открытых карт показываем название, для закрытых - пустую строку
                card_name = pc.card.title if pc.is_visible else ''
                cards.append({
                    'id': pc.id,
                    'category_id': get_category_id(pc.card.card_type),
                    'name': card_name
                })
            
            player_nickname = get_nickname(player)
            
            # Проверяем, может ли текущий пользователь голосовать за этого игрока
            can_vote = (player.id != current_user.id) and \
                      (game_state.current_phase == 'voting') and \
                      (not current_user_is_excluded)
            
            # Проверяем, голосовал ли уже текущий пользователь в этом раунде
            has_user_voted = False
            user_vote = None
            if not current_user_is_excluded:
                has_user_voted = Vote.objects.filter(
                    room=room,
                    voter=current_user,
                    round_number=game_state.current_round
                ).exists()
                
                if has_user_voted:
                    vote_obj = Vote.objects.filter(
                        room=room,
                        voter=current_user,
                        round_number=game_state.current_round
                    ).first()
                    if vote_obj:
                        user_vote = vote_obj.target_player.id
            
            players_data.append({
                'playerId': player.id,
                'nickname': player_nickname,
                'canVote': can_vote,
                'cards': cards,
                'hasUserVoted': has_user_voted,
                'userVotedFor': user_vote == player.id if user_vote else False,
                'is_excluded': False  # Текущие игроки не выбыли
            })
        
        # Добавляем информацию о голосах в текущем раунде
        current_votes = []
        vote_counts = {}
        if game_state.current_phase == 'voting':
            votes = Vote.objects.filter(room=room, round_number=game_state.current_round)
            for vote in votes:
                current_votes.append({
                    'voter_id': vote.voter.id,
                    'voter_name': get_nickname(vote.voter),
                    'target_id': vote.target_player.id,
                    'target_name': get_nickname(vote.target_player)
                })
            
            # Подсчитываем голоса
            from collections import Counter
            vote_counts_dict = Counter(vote.target_player.id for vote in votes)
            vote_counts = {str(k): v for k, v in vote_counts_dict.items()}
        
        # Rounds
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
        
        # Danger
        danger = ''
        if game_state.current_phase in ['game', 'discussion']:
            danger = get_danger_description(game_state.current_round)
        
        # Ход ли текущего игрока (только если не выбыл)
        is_your_turn = False
        if not current_user_is_excluded and current_player_turn and game_state.current_phase == 'game':
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
            'room_status': room.status,
            'current_round': game_state.current_round,
            'excluded_players': excluded_players,
            'current_votes': current_votes,
            'vote_counts': vote_counts,
            'total_players': len(current_players_list),
            'total_votes': len(current_votes),
            'current_user_is_excluded': current_user_is_excluded
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
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        player_id = request.data.get('player_id')
        card_id = request.data.get('card_id')
        
        if not player_id or not card_id:
            return Response({'error': 'Не указан player_id или card_id'}, status=400)
        
        # Получаем игрока и карту
        player = get_object_or_404(User, id=player_id)
        player_card = get_object_or_404(PlayerCard, id=card_id, player=player, room=room)
        
        # Проверяем фазу
        if game_state.current_phase != 'game':
            return Response({'error': 'Сейчас не фаза игрового стола'}, status=400)
        
        # Проверяем, что это ход текущего игрока
        players_list = list(room.current_players.all())
        if not (0 <= game_state.current_player_index < len(players_list)):
            return Response({'error': 'Ошибка определения текущего игрока'}, status=400)
        
        current_player = players_list[game_state.current_player_index]
        if current_player.id != player.id:
            return Response({'error': 'Сейчас не ваш ход'}, status=400)
        
        # Проверяем карту
        if player_card.is_visible or player_card.is_used:
            return Response({'error': 'Эта карта уже использована'}, status=400)
        
        # Открываем карту
        player_card.is_visible = True
        player_card.save()
        
        # Передаем ход следующему игроку
        next_index = (game_state.current_player_index + 1) % len(players_list)
        game_state.current_player_index = next_index
        
        # Проверяем, все ли игроки сделали ход в этом раунде
        all_players_moved = all(
            PlayerCard.objects.filter(
                player=p, 
                room=room, 
                is_visible=True,
                is_used=False
            ).exists()  # у каждого игрока есть хотя бы одна открытая неиспользованная карта
            for p in players_list
        )
        
        
        if all_players_moved:
            # Переходим к фазе обсуждения
            game_state.current_phase = 'discussion'
            
            # Помечаем все открытые карты как использованные в этом раунде
            updated = PlayerCard.objects.filter(
                room=room,
                is_visible=True,
                is_used=False
            ).update(is_used=True)
            
        
        game_state.save()
        
        return Response({
            'success': True,
            'message': 'Ход успешно сделан',
            'opened_card': player_card.card.title,
            'phase': game_state.current_phase
        })
        
    except Exception as e:
        print(f"Error in make_move: {str(e)}")
        return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def vote(request, room_code):
    """
    Игрок голосует за исключение другого игрока
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        voter_id = request.data.get('voter_id')
        target_player_id = request.data.get('player_id')
        
       
        if not voter_id or not target_player_id:
            return Response({'error': 'Не указаны voter_id или player_id'}, status=400)
        
        # Проверяем, что сейчас фаза голосования
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        voter = get_object_or_404(User, id=voter_id)
        target_player = get_object_or_404(User, id=target_player_id)
                
        # Проверяем, что игрок не голосует за себя
        if voter.id == target_player.id:
            return Response({'error': 'Нельзя голосовать за себя'}, status=400)
        
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
        
        # Подсчитываем текущие голоса для информации
        votes = Vote.objects.filter(room=room, round_number=game_state.current_round)
        vote_counts = {}
        for vote_obj in votes:
            vote_counts[vote_obj.target_player.username] = vote_counts.get(vote_obj.target_player.username, 0) + 1
        
        
        return Response({
            'success': True,
            'message': message,
            'voter': voter.username,
            'target': target_player.username,
            'vote_counts': vote_counts,
            'total_votes': len(votes)
        })
        
    except Exception as e:
        print(f"Error in vote: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def time_discussion_end(request, room_code):
    """
    Завершение времени обсуждения
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        # Проверяем, что сейчас фаза discussion
        if game_state.current_phase != 'discussion':
            return Response({'error': 'Сейчас не фаза обсуждения'}, status=400)
        
        # Получаем текущих игроков
        current_players = room.current_players.all()
        
        # Проверяем, не остался ли только 1 игрок
        if len(current_players) <= 1:
            # Игра завершена - остался 1 или меньше игроков
            game_state.current_phase = 'final'
            room.status = 'finished'
            room.finished_at = timezone.now()
            room.save()
            
            return Response({
                'success': True,
                'message': 'Игра завершена - осталось недостаточно игроков',
                'phase': game_state.current_phase,
                'round': game_state.current_round
            })
        
        if game_state.current_round == 1:
            game_state.current_round = 2
            game_state.current_phase = 'game'
            game_state.current_player_index = 0 
            game_state.save()
            
        elif game_state.current_round == 2 or game_state.current_round == 3:
            game_state.current_phase = 'voting'
            game_state.save()
            
            Vote.objects.filter(room=room, round_number=game_state.current_round).delete()
        
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
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)

        
        # Проверяем, что сейчас фаза голосвания
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        # Получаем всех текущих игроков
        current_players = room.current_players.all()
       
        # Получаем все голоса за текущий раунд
        votes = Vote.objects.filter(room=room, round_number=game_state.current_round)
        
       
        excluded_player = None
        vote_results = {}
        winners = []
        
        if game_state.current_round == 2 and votes.exists() and len(current_players) > 1:
            
            # Подсчитываем голоса
            from collections import Counter
            vote_counts = Counter(vote.target_player_id for vote in votes)
            
            if vote_counts:
                # Находим максимальное количество голосов
                max_votes = max(vote_counts.values())
                
                # Находим всех игроков с максимальным количеством голосов
                players_with_max_votes = [
                    player_id for player_id, count in vote_counts.items() 
                    if count == max_votes
                ]
                
                # Если несколько игроков имеют одинаковое максимальное количество голосов - ничья
                if len(players_with_max_votes) > 1:
                    excluded_player = None
                    vote_results = {
                        'tie': True,
                        'max_votes': max_votes,
                        'tied_players': players_with_max_votes,
                        'tied_player_names': [
                            get_nickname(User.objects.get(id=player_id)) 
                            for player_id in players_with_max_votes
                        ]
                    }
                else:
                    # Исключаем игрока с наибольшим количеством голосов
                    most_voted_player_id = players_with_max_votes[0]
                    excluded_player = get_object_or_404(User, id=most_voted_player_id)
                    
                    
                    # Удаляем игрока из комнаты
                    deleted_count, _ = RoomPlayer.objects.filter(
                        room=room, 
                        player=excluded_player
                    ).delete()
                    
                    # Помечаем его карты как used, чтобы они не отображались
                    updated = PlayerCard.objects.filter(
                        room=room, 
                        player=excluded_player
                    ).update(is_used=True)
                    
                    vote_results = {
                        'tie': False,
                        'excluded_player_id': excluded_player.id,
                        'excluded_player_name': excluded_player.username,
                        'excluded_player_nickname': get_nickname(excluded_player),
                        'votes_received': max_votes,
                        'total_voters': len(current_players)
                    }
        
        # Определяем победителей
        elif game_state.current_round == 3:
            
            if votes.exists():
                from collections import Counter
                vote_counts = Counter(vote.target_player_id for vote in votes)
                
                if vote_counts:
                    # Находим максимальное количество голосов
                    max_votes = max(vote_counts.values())
                    
                    # Находим всех победителей 
                    winners_ids = [
                        player_id for player_id, count in vote_counts.items() 
                        if count == max_votes
                    ]
                    
                    # Собираем информацию о победителях
                    winners = []
                    for player_id in winners_ids:
                        player = User.objects.get(id=player_id)
                        # Получаем открытые карты победителя
                        player_cards = PlayerCard.objects.filter(
                            player=player, 
                            room=room, 
                            is_visible=True
                        )
                        
                        cards_info = []
                        for pc in player_cards:
                            cards_info.append({
                                'type': pc.card.get_card_type_display(),
                                'title': pc.card.title,
                                'description': pc.card.description
                            })
                        
                        winners.append({
                            'player_id': player.id,
                            'nickname': get_nickname(player),
                            'votes_received': max_votes,
                            'cards': cards_info
                        })
                    
                    vote_results = {
                        'final': True,
                        'winners': winners,
                        'vote_counts': dict(vote_counts)
                    }
        
        # Обновляем список игроков после возможного исключения
        current_players = room.current_players.all()  
        
        if game_state.current_round == 2:
            # После раунда 2 переходим к раунду 3 (игра)
            game_state.current_round = 3
            game_state.current_phase = 'game'
            game_state.current_player_index = 0
            
            updated_cards = PlayerCard.objects.filter(
                room=room,
                is_visible=True,
                is_used=False
            ).update(is_used=True)
            
            
        elif game_state.current_round == 3:
            # После раунда 3 завершаем игру
            game_state.current_phase = 'final'
            room.status = 'finished'
            room.finished_at = timezone.now()
            room.save()
        
        game_state.save()
        
        deleted_votes, _ = votes.delete()
        
        response_data = {
            'success': True,
            'message': 'Голосование завершено',
            'current_round': game_state.current_round,
            'phase': game_state.current_phase,
            'room_status': room.status,
            'vote_results': vote_results
        }
        
        if excluded_player:
            response_data['excluded_player'] = {
                'id': excluded_player.id,
                'username': excluded_player.username,
                'nickname': get_nickname(excluded_player),
                'votes_received': vote_results.get('votes_received', 0),
                'message': f'Игрок {get_nickname(excluded_player)} выбыл по результатам голосования'
            }
        elif vote_results.get('tie'):
            response_data['tie_message'] = 'Ничья! Никто не выбывает в этом раунде'
            response_data['tied_players'] = vote_results.get('tied_player_names', [])
        elif vote_results.get('final') and winners:
            response_data['winners'] = winners
            response_data['message'] = f'Игра завершена! Победители: {", ".join([w["nickname"] for w in winners])}'
        
        return Response(response_data)
        
    except Exception as e:
        print(f"Error in time_voting_end: {str(e)}")
        import traceback
        traceback.print_exc()
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
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_voting_info(request, room_code):
    """
    Получение информации о текущем голосовании
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        if game_state.current_phase != 'voting':
            return Response({'error': 'Сейчас не фаза голосования'}, status=400)
        
        # Получаем все голоса за текущий раунд
        votes = Vote.objects.filter(room=room, round_number=game_state.current_round)
        
        # Подсчитываем голоса
        vote_results = []
        from collections import Counter
        vote_counts = Counter(vote.target_player.id for vote in votes)
        
        for player_id, count in vote_counts.items():
            player = User.objects.get(id=player_id)
            vote_results.append({
                'player_id': player.id,
                'player_name': get_nickname(player),
                'votes': count
            })
        
        # Сортируем по количеству голосов
        vote_results.sort(key=lambda x: x['votes'], reverse=True)
        
        return Response({
            'success': True,
            'vote_results': vote_results,
            'total_votes': len(votes),
            'round': game_state.current_round
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_game_results(request, room_code):
    """
    Получение результатов игры (для фазы final)
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        # Получаем оставшихся игроков
        remaining_players = room.current_players.all()
        
        winners = []
        for player in remaining_players:
            # Получаем все открытые карты игрока
            player_cards = PlayerCard.objects.filter(
                player=player, 
                room=room, 
                is_visible=True
            )
            
            cards_info = []
            for pc in player_cards:
                cards_info.append({
                    'type': pc.card.get_card_type_display(),
                    'title': pc.card.title,
                    'description': pc.card.description
                })
            
            winners.append({
                'player_id': player.id,
                'nickname': get_nickname(player),
                'cards': cards_info,
                'cards_count': len(cards_info)
            })
        
        return Response({
            'success': True,
            'catastrophe': game_state.catastrophe_card.description if game_state.catastrophe_card else '',
            'bunker': game_state.bunker_card.description if game_state.bunker_card else '',
            'winners': winners,
            'total_players': remaining_players.count(),
            'final_round': game_state.current_round,
            'game_completed': True
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def finish_game(request, room_code):
    """
    Окончательное завершение игры
    """
    try:
        room = get_object_or_404(Room, code=room_code)
        game_state = get_object_or_404(GameState, room=room)
        
        # Помечаем игру как завершенную
        room.status = 'finished'
        room.finished_at = timezone.now()
        room.save()
        
        # Также обновляем GameState
        game_state.current_phase = 'final'
        game_state.save()
        
        return Response({
            'success': True,
            'message': 'Игра завершена',
            'room_status': room.status,
            'finished_at': room.finished_at
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

from django.db import transaction
from django.contrib.auth.models import User
import uuid

def get_or_create_guest_user(request):
    """
    Создает или получает временного пользователя для неавторизованных
    """
    # Проверяем, авторизован ли пользователь
    if request.user.is_authenticated:
        return request.user
    
    # Для неавторизованных - создаем временного пользователя
    guest_id = request.session.get('guest_user_id')
    
    if guest_id:
        try:
            user = User.objects.get(id=guest_id)
            # Проверяем, что это временный пользователь
            if not user.username.startswith('guest_'):
                # Это обычный пользователь, создаем нового временного
                user = None
        except User.DoesNotExist:
            user = None
    else:
        user = None
    
    if not user:
        # Генерируем уникальное имя для гостя
        random_name = random.choice(RANDOM_NAMES)
        guest_username = f"guest_{random_name}"
        
        with transaction.atomic():
            # Создаем нового временного пользователя
            user = User.objects.create_user(
                username=guest_username,
                password=None,  # Без пароля
                is_active=True
            )
            
            # Помечаем как временного пользователя
            user.profile_temp = True  # Используем custom attribute
            user.save()
        
        # Сохраняем ID в сессии
        request.session['guest_user_id'] = user.id
        request.session.set_expiry(60 * 60 * 24)  # Сессия на 24 часа
    
    return user