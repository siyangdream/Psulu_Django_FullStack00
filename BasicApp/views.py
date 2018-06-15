# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse
from . import forms
import json

# Create your views here.
def index(request):
    return render(request, 'BasicApp/index.html')

def game_view(request):

    """
    form = forms.FormName()
    if request.method == 'POST':
        print(form)
        form = forms.FormName(request.POST)
        if form.is_valid():
            print("VALIDATION SUCCESS!")
            #If coordinateX is a float, then form.cleaned_data['coordinateX'] will be a float either
            print("X Coordinate: %s" %form.cleaned_data['coordinate_X'])
            print("Y Coordinate: %s" %form.cleaned_data['coordinate_Y'])
    return render(request, 'BasicApp/game.html', {'form':form})
    """

    if request.method == 'POST':
        received_x = request.POST.get('coordinate_x')
        received_y = request.POST.get('coordinate_y')

        response_data = {}

        response_data['message'] = 'Hello from backend : This is my response: )'
        response_data['dx'] = received_x
        response_data['dy'] = received_y

        return HttpResponse(json.dumps(response_data), content_type = "application/json")

    return render(request, 'BasicApp/game.html')
