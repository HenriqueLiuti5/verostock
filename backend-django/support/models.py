from django.db import models
from inventory.models import Product

# Create your models here.

class SupportTickets(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('CORRIGIDO', 'Corrigido'),
        ('CONDENADO', 'Condenado')
    ]

    product_name = models.CharField("Produto/Modelo", max_length=255)
    serial_number = models.CharField("Serial", max_length=100)
    problem_description = models.TextField("Problema")
    fix_action = models.TextField("Correção", blank=True, null=True)
    status = models.CharField("Status", max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    support_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} - {self.status}"