from rest_framework import serializers
from .models import SupportTickets

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTickets
        fields = '__all__'