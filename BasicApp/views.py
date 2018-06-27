# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse
from . import forms
import json

from PuLPpSulu import Siyang_Entry, buildNewMapYamlFile
import yaml as Y

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
        #Recive the variables from front-end
        received_risk = float(request.POST.get('risk'))
        received_waypoints = float(request.POST.get('waypoints'))
        received_x = float(request.POST.get('curr_x'))
        received_y = float(request.POST.get('curr_y'))

        obs_coordinates = request.POST.get('obstacle_coordinates')
        obs_coordinates = json.loads(obs_coordinates)


        #Psulu Algorithm responsible for doing calculation is here
        buildNewMapYamlFile(obs_coordinates)
        result_pSulu = Siyang_Entry(received_x, received_y, received_risk, received_waypoints)
        #Siyang_Entry(curr_x, curr_y, risk_val, waypoints_val, map_local_path):
        #e.g. Siyang_Entry(0.6, 0.7, 0.2, 12, "./config/map.yaml")


        #Response the result to front-end
        response_data = {}
        response_data['message'] = 'Hello from backend : This is my response: )'
        response_data['risk'] = received_risk
        response_data['waypoints'] = received_waypoints
        response_data['expected_route'] = result_pSulu[0]
        response_data['real_route'] = result_pSulu[1]


        return HttpResponse(json.dumps(response_data), content_type = "application/json")

    return render(request, 'BasicApp/game.html')
