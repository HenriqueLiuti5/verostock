from rest_framework import viewsets
from .models import SupportTickets
from .serializers import SupportTicketSerializer
from django.http import HttpResponse
from rest_framework.decorators import action
import csv

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTickets.objects.all()
    serializer_class = SupportTicketSerializer

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="suporte.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Produto', 'Serial', 'Problema', 'Correção', 'Status', 'Data'])
        
        for t in self.get_queryset():
            writer.writerow([t.id, t.product_name, t.serial_number, t.problem_description, t.fix_action, t.status, t.support_at.strftime("%Y-%m-%d")])
            
        return response