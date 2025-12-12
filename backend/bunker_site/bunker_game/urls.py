from django.urls import path
from . import views

urlpatterns = [
    # Колоды
    path('decks/', views.deck_list, name='deck-list'),
    path('decks/create/', views.deck_create, name='deck-create'),
    path('decks/<int:user_id>/', views.deck_detail, name='deck-detail'),
    path('decks/<int:deck_id>/cards/', views.deck_cards, name='deck-cards'),
    
    # Карточки
    path('cards/', views.card_list, name='card-list'),
    path('cards/create/', views.card_create, name='card-create'),
    path('cards/<int:card_id>/', views.card_detail, name='card-detail'),
]