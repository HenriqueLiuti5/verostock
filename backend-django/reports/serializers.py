from rest_framework import serializers
from .models import DispatchReport

class DispatchReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DispatchReport
        fields = '__all__'