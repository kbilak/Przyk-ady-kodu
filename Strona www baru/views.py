from django.utils import timezone
from rest_framework import generics
from .models import *
from .serializers import *
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404


@csrf_exempt
def payment_token(request):
    if request.method == 'GET':
        url = '/pl/standard/user/oauth/authorize'

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*',
        }

        body = {
            'grant_type': 'client_credentials',
            'client_id': '461165',
            'client_secret': ''
        }

        response = requests.post(url, data=body, headers=headers, allow_redirects=True)
        return HttpResponse(response)

@csrf_exempt
def payment_form(request):
    if request.method == 'POST':
        url = '/api/v2_1/orders/'

        form_data = json.loads(request.body.decode('utf-8'))
        token = form_data.get('token')
        data = form_data.get('data')
        dostawa = form_data.get('choice')

        id = data.get('extOrderId')
        buyer = data.get('buyer')
        pos_id = data.get('merchantPosId')
        opis = data.get('description')
        waluta = data.get('currencyCode')

        total_amount = data.get('totalAmount')
        total_amount_str = str(total_amount)
        last_two_digits = total_amount_str[-2:]
        wartość = total_amount_str[:-2] + ',' + last_two_digits

        kupujący_ip = data.get('customerIp')
        kupujący_email = buyer.get('email')
        kupujący_telefon = buyer.get('phone')
        kupujący_imię = buyer.get('firstName')
        kupujący_nazwisko = buyer.get('lastName')

        delivery = buyer.get('delivery')
        dostawa_ulica = delivery.get('street')
        dostawa_kod_pocztowy = delivery.get('postalCode')
        dostawa_miejscowość = delivery.get('city')

        wiadomość = form_data.get('message')

        zamówienie = Zamówienie(
            id=id,
            opis=opis,
            pos_id=pos_id,
            waluta=waluta,
            łączna_wartość=wartość,
            kupujący_ip=kupujący_ip,
            kupujący_email=kupujący_email,
            kupujący_telefon=kupujący_telefon,
            kupujący_imię=kupujący_imię,
            kupujący_nazwisko=kupujący_nazwisko,
            dostawa=dostawa,
            dostawa_ulica=dostawa_ulica,
            dostawa_kod_pocztowy=dostawa_kod_pocztowy,
            dostawa_miejscowość=dostawa_miejscowość,
            wiadomość=wiadomość,
            status=1,
        )
        zamówienie.save()

        produkty = data.get('products')

        if dostawa == True:
            send_mail(
                subject='Otrzymaliśmy Twoje zamówienie!',
                message='Witaj, ' + str(kupujący_imię) + '!\n\n\nOtrzymaliśmy Twoje zamówienie. Oczekujemy teraz na wiadomość zwrotną od operatora płatności. Za chwilę otrzymasz wiadomość ze statusem Twojej płatności za zamówienie.\n\n\nTwoje zamówienie:\n\nIdentyfikator: ' + str(id) + '\nŁączna wartość zamówienia: ' + str(wartość) + '\nDostawa pod adres: ' + str(dostawa_ulica) + ' ' + str(dostawa_kod_pocztowy) + ' ' + str(dostawa_miejscowość) + '\n\n\nPozdrawiamy,\n\na.',
                from_email=(' <kontakt@.pl>'),
                recipient_list=[kupujący_email,],
                fail_silently=False,
            )
        else:
            send_mail(
                subject='Otrzymaliśmy Twoje zamówienie! |',
                message='Witaj, ' + str(kupujący_imię) + '!\n\n\nOtrzymaliśmy Twoje zamówienie. Oczekujemy teraz na wiadomość zwrotną od operatora płatności. Za chwilę otrzymasz wiadomość ze statusem Twojej płatności za zamówienie.\n\n\nTwoje zamówienie:\n\nIdentyfikator: ' + str(id) + '\nŁączna wartość zamówienia: ' + str(wartość) + '\n\n\nPozdrawiamy,\n\n.',
                from_email=(' <kontakt@.pl>'),
                recipient_list=[kupujący_email,],
                fail_silently=False,
            )


        for p in produkty:
            nazwa = p.get('name')
            ilość = p.get('quantity')
            unit_price = p.get('unitPrice')
            unit_price_str = str(unit_price)
            unit_price_last_two_digits = unit_price_str[-2:]
            cena_jednostkowa = unit_price_str[:-2] + ',' + unit_price_last_two_digits

            przedmiot = ZamówieniePrzedmiot(
                nazwa=nazwa,
                ilość=ilość,
                cena_jednostkowa=cena_jednostkowa,
                zamówienie=zamówienie
            )
            przedmiot.save()

        h = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}',
        }
        r = requests.post(url, data=json.dumps(data), headers=h, allow_redirects=False)
        if r.status_code == 302:
            return HttpResponse(r.headers['location'])
        else:
            return HttpResponse(r, status=r.status_code)


@csrf_exempt
def payment_status(request):
    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))
        order = body.get('order')
        orderId = order.get('orderId')
        id = order.get('extOrderId')
        status = order.get('status')

        zamówienie = get_object_or_404(Zamówienie, id=id)
        email = zamówienie.kupujący_email

        if status == 'PENDING':
            new_status = '2'
            status_email = 'Oczekujące'
        elif status == 'COMPLETED':
            new_status = '4'
            status_email = 'Opłacone'
        else:
            new_status = '3'
            status_email = 'Anulowane'

        send_mail(
            subject='Zmiana statusu Twojego zamówienia',
            message='Witaj,\n\n\nNastąpiła zmiana statusu Twojego zamówienia nr ' + id + '\n\n' + 'Aktualny status: ' + status_email + '\n\n\nPozdrawiamy,\n\n.',
            from_email=(' <kontakt@.pl>'),
            recipient_list=[email,],
            fail_silently=False,
        )

        zamówienie.status = new_status
        zamówienie.id_płatności = orderId
        zamówienie.save()

        return HttpResponse("Data received successfully!")
    return HttpResponse("This is a GET request.")


class ZamówienieList(generics.ListAPIView):
    serializer_class = ZamówienieSerializer

    def get_queryset(self):

        queryset = Zamówienie.objects.filter(status=4)
        queryset = queryset.order_by('panel_odebrane', '-data_zamówienia')

        return queryset
    

@csrf_exempt
def order_panel_odbior(request):
    if request.method == 'POST':
        form_data = json.loads(request.body.decode('utf-8'))
        id = form_data.get('id')
        zamówienie = get_object_or_404(Zamówienie, id=id)
        zamówienie.panel_odebrane = True
        zamówienie.panel_data_odebrania = timezone.now()
        zamówienie.save()

        return HttpResponse("Data received successfully!")
    return HttpResponse("This is a GET request.")
