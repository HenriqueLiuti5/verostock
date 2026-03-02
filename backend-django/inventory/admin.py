from django.contrib import admin
from .models import Category, Product, AuditLog

# Register your models here.

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(AuditLog)
