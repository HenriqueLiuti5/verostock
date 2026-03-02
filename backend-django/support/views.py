from rest_framework import viewsets
from .models import SupportTickets
from .serializers import SupportTicketSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTickets.objects.all()
    serializer_class = SupportTicketSerializer