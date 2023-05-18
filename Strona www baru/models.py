from django.db import models
from django.utils import timezone


class Zamówienie(models.Model):
    STATUS_CHOICES = (
        ('1', 'Stworzone'),
        ('2', 'Oczekujące'),
        ('3', 'Anulowane'),
        ('4', 'Opłacone'),
    )
    id = models.CharField(max_length=255, primary_key=True)
    id_płatności = models.CharField(max_length=255, default='', blank=True, null=True)
    opis = models.CharField(max_length=512)
    pos_id = models.CharField(max_length=16)
    waluta = models.CharField(max_length=3)
    łączna_wartość = models.CharField(max_length=255)

    kupujący_ip = models.CharField(max_length=255, default='')
    kupujący_email = models.EmailField()
    kupujący_telefon = models.CharField(max_length=255, default='')
    kupujący_imię = models.CharField(max_length=255, default='')
    kupujący_nazwisko = models.CharField(max_length=255, default='')

    dostawa = models.BooleanField(default=False)
    dostawa_ulica = models.CharField(max_length=255, default='', null=True, blank=True)
    dostawa_kod_pocztowy = models.CharField(max_length=255, default='', null=True, blank=True)
    dostawa_miejscowość = models.CharField(max_length=255, default='', null=True, blank=True)

    wiadomość = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255, default='1', choices=STATUS_CHOICES, blank=True, null=True)
    data_zamówienia = models.DateTimeField(default=timezone.now)
    data_zapłaty = models.DateTimeField(null=True, auto_now=True)

    reklamówka = models.BooleanField(default=False)
    sztućce = models.BooleanField(default=False)
    pałeczki = models.BooleanField(default=False)

    panel_odebrane = models.BooleanField(default=False)
    panel_data_odebrania = models.DateTimeField(null=True, auto_now=True)

    def __str__(self):
        return '%s %s, %szł' %(self.kupujący_imię, self.kupujący_nazwisko, self.łączna_wartość)

    class Meta:
        ordering = ('-data_zamówienia',)
        verbose_name = "Zamówienie"
        verbose_name_plural = "Zamówienia"


class ZamówieniePrzedmiot(models.Model):
    nazwa = models.CharField(max_length=512, default='')
    ilość = models.CharField(max_length=255, default='')
    cena_jednostkowa = models.CharField(max_length=255, default='')
    zamówienie = models.ForeignKey(Zamówienie, on_delete=models.CASCADE, related_name='przedmioty')

    def __str__(self):
        return '%s, %s (%s)' %(self.zamówienie, self.nazwa, self.ilość)

    class Meta:
        verbose_name = "Przedmiot Zamówienia"
        verbose_name_plural = "Przedmioty Zamówienia"
        