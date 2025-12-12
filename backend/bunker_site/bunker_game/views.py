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
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def deck_detail(request, user_id, deck_id):
    if (request.method == "GET"):
        decks = Deck.objects.filter(user_id=user_id)
        serializer = DeckSerializer(decks, many=True)
        return Response({'decks': serializer.data})
    
    if (request.method == "PUT"):
        deck = get_object_or_404(Deck, id=deck_id)
        serializer = DeckCreateSerializer(deck, data=request.data, partial=True)
        if serializer.is_valid():
            deck = serializer.save()
            return Response({
                'message': 'Колода успешно обновлена',
                'deck': DeckSerializer(deck).data
            })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    if (request.method == "DELETE"):
        deck = get_object_or_404(Deck, id=deck_id)
        deck.delete()
        return Response({'message': 'Колода успешно удалена'})

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
        print(DeckSerializer(deck).data)
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
@api_view(['GET'])
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

@extend_schema(
    summary="Получение всех карточек колоды",
    description="Возврат всех карточек принадлежащих указанной колоде",
    responses=DeckSerializer
)
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
@permission_classes([AllowAny])
def deck_cards(request, deck_id):
    deck = get_object_or_404(Deck, id=deck_id)
    serializer = DeckSerializer(deck)
    return Response(serializer.data)