from django.db import models
from django.contrib.auth import get_user_model

# Получаем модель пользователя
User = get_user_model()

class Deck(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='decks', 
        verbose_name="Пользователь",
        null=True,  # Разрешаем NULL для существующих записей
        blank=True  # Разрешаем пустое значение в формах
    )
    name = models.CharField(max_length=255, verbose_name="Название колоды")
    
    def __str__(self):
        return self.name
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
        }
    
    class Meta:
        verbose_name = "Колода"
        verbose_name_plural = "Колоды"

# Модель карточки
class Card(models.Model):
    CARD_TYPES = [
        ('catastrophe', 'Катастрофа'),
        ('profession', 'Профессия'),
        ('health', 'Здоровье'),
        ('hobby', 'Хобби'),
        ('personality', 'Характер'),
        ('luggage', 'Багаж'),
        ('additional', 'Дополнительный факт'),
    ]
    
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, 
                            related_name='cards', verbose_name="Колода")
    card_type = models.CharField(max_length=50, choices=CARD_TYPES, 
                                verbose_name="Тип карточки")
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    description = models.TextField(verbose_name="Описание")
    
    def __str__(self):
        return f"{self.get_card_type_display()}: {self.title}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'deck_id': self.deck_id,
            'card_type': self.card_type,
            'card_type_display': self.get_card_type_display(),
            'title': self.title,
            'description': self.description,
        }
    
    class Meta:
        verbose_name = "Карточка"
        verbose_name_plural = "Карточки"
        ordering = ['card_type', 'title']
        
        
        
import random
import string

def generate_code():
    """Генерация уникального 6-значного кода"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=6))
        if not Room.objects.filter(code=code).exists():
            return code

class Room(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Ожидание игроков'),
        ('active', 'Игра началась'),
        ('finished', 'Игра завершена'),
    ]
    
    id = models.AutoField(primary_key=True)
    code = models.CharField(
        max_length=6, 
        unique=True, 
        verbose_name="Код комнаты",
        default=generate_code
    )
    creator = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_rooms',
        verbose_name="Создатель"
    )
    deck = models.ForeignKey(
        Deck,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Колода"
    )
    max_players = models.PositiveIntegerField(
        default=10,
        verbose_name="Максимальное количество игроков"
    )
    current_players = models.ManyToManyField(
        User,
        related_name='joined_rooms',
        through='RoomPlayer',
        verbose_name="Текущие игроки"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='waiting',
        verbose_name="Статус комнаты"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    started_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата начала игры")
    
    def __str__(self):
        return f"Комната {self.code} ({self.get_status_display()})"
    
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        super().save(*args, **kwargs)
    
    def get_players_count(self):
        return self.current_players.count()
    
    def can_join(self):
        return (
            self.status == 'waiting' and 
            self.get_players_count() < self.max_players
        )
    
    class Meta:
        verbose_name = "Комната"
        verbose_name_plural = "Комнаты"
        ordering = ['-created_at']

class RoomPlayer(models.Model):
    """Промежуточная модель для связи комнаты и игроков"""
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_players')
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_rooms')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_ready = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['room', 'player']
        verbose_name = "Игрок в комнате"
        verbose_name_plural = "Игроки в комнатах"