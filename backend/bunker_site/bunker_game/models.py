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