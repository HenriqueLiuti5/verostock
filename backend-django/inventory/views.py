from rest_framework import viewsets
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from django.http import HttpResponse
from rest_framework.decorators import action
import csv

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="estoque.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nome', 'Categoria', 'Quantidade', 'Descrição', 'Observações'])
        
        for p in self.get_queryset():
            categoria_nome = p.category.name if hasattr(p, 'category') and p.category else 'N/A'
            writer.writerow([p.id, p.name, categoria_nome, p.quantity, p.description, p.observations])
            
        return response