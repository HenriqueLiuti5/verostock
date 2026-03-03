from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100, unique= True)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    name = models.CharField(max_length = 100)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null = True, related_name='products')
    quantity = models.IntegerField(default=0)
    observations = models.TextField(blank = True, null = True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name