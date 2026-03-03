from django.db import models
from inventory.models import Product

class DispatchReport(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='dispatches')
    router_id = models.CharField("ID", max_length=50, blank=True, null=True)
    serial_number = models.CharField("Serial", max_length=100)
    mac_addres = models.CharField("MAC", max_length=50, blank=True, null=True)
    client_name = models.CharField("Cliente", max_length=255)
    date_sent = models.DateField("Data de envio")
    invoice_pdf = models.FileField("Nota Ficasl (PDF)", upload_to = 'invoices/', blank = True, null = True)

    def save(self, *args, **kwargs):
        if not self.pk:
            if self.product.quantity > 0:
                self.product.quantity -= 1
                self.product.save()
            else:
                raise ValueError("Estoque insuficiente para este produto.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.product:
            self.product.quantity += 1
            self.product.save()
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.client_name}"