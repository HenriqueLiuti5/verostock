from rest_framework import viewsets
from .models import DispatchReport
from .serializers import DispatchReportSerializer
from django.http import HttpResponse
from rest_framework.decorators import action
import csv

class DispatchReportViewSet(viewsets.ModelViewSet):
    queryset = DispatchReport.objects.all()
    serializer_class = DispatchReportSerializer

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="envios.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Produto', 'Cliente', 'Router ID', 'Serial', 'MAC', 'Data Envio'])
        
        for r in self.get_queryset():
            produto_nome = r.product.name if r.product else 'Excluído'
            writer.writerow([r.id, produto_nome, r.client_name, r.router_id, r.serial_number, r.mac_addres, r.date_sent])
            
        return response