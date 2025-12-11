from django.urls import path
from . import views

urlpatterns = [
    # Колоды
    path('decks/', views.deck_list, name='deck-list'),
    path('decks/create/', views.deck_create, name='deck-create'),
    path('decks/<int:user_id>/', views.deck_detail_by_user, name='deck-detail'),
    path('decks/<int:deck_id>/update/', views.deck_update, name='deck-update'),
    path('decks/<int:deck_id>/delete/', views.deck_delete, name='deck-delete'),
    path('decks/<int:deck_id>/cards/', views.deck_cards, name='deck-cards'),
    
    # Карточки
    path('cards/', views.card_list, name='card-list'),
    path('cards/create/', views.card_create, name='card-create'),
    path('cards/<int:card_id>/', views.card_detail, name='card-detail'),
    path('cards/<int:card_id>/update/', views.card_update, name='card-update'),
    path('cards/<int:card_id>/delete/', views.card_delete, name='card-delete'),
]