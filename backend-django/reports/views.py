from rest_framework import viewsets
from .models import DispatchReport
from .serializers import DispatchReportSerializer

class DispatchReportViewSet(viewsets.ModelViewSet):
    queryset = DispatchReport.objects.all()
    serializer_class = DispatchReportSerializer