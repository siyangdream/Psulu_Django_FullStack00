# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse
import json
import datetime

from PuLPpSulu import Siyang_Entry, buildNewMapYamlFile
from BasicApp.models import GameLog
import yaml as Y

# Create your views here.
def index(request):
    return render(request, 'BasicApp/index.html')

def contact_view(request):
    return render(request, 'BasicApp/contact.html')

def about_view(request):
    return render(request, 'BasicApp/about.html')

def mapLibrary_view(request):
    return render(request, 'BasicApp/mapLibrary.html')

def db_communicate(request):

    if request.method == 'POST':
        #receive the data
        participantID_received = request.POST.get('participantID_sent')
        date_received = request.POST.get('date_sent')
        result_received = request.POST.get('result_sent')
        realPathTotalSum_received = float(request.POST.get('realPathTotalSum_sent'))
        expectedPathTotalSum_received = float(request.POST.get('expectedPathTotalSum_sent'))
        surFacingStepTotalCost_received = float(request.POST.get('surFacingStepTotalCost_sent'))
        riskTotalCost_received = float(request.POST.get('riskTotalCost_sent'))
        wayPointTotalCost_received = float(request.POST.get('wayPointTotalCost_sent'))
        riskBudget_received = float(request.POST.get('riskBudget_sent'))
        surfacingStepBudget_received = float(request.POST.get('surfacingStepBudget_sent'))
        canvasScale_received = float(request.POST.get('canvasScale_sent'))
        canvasBias_received = float(request.POST.get('canvasBias_sent'))
        collisionDetectionPrecision_received = float(request.POST.get('collisionDetectionPrecision_sent'))
        chosenMapName_received = request.POST.get('chosenMapName_sent')
        chonsenMapCoordinates_received = request.POST.get('chonsenMapCoordinates_sent')
        details_received = request.POST.get('details_sent')

        #save to database
        newLogRecord = GameLog.objects.create(participantID=participantID_received,
                                                     date_show=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                                     result=result_received,
                                                     realPathTotalSum=realPathTotalSum_received,
                                                     expectedPathTotalSum=expectedPathTotalSum_received,
                                                     surFacingStepTotalCost=surFacingStepTotalCost_received,
                                                     riskTotalCost=riskTotalCost_received,
                                                     wayPointTotalCost=wayPointTotalCost_received,
                                                     riskBudget=riskBudget_received,
                                                     surfacingStepBudget=surfacingStepBudget_received,
                                                     canvasScale=canvasScale_received,
                                                     canvasBias=canvasBias_received,
                                                     collisionDetectionPrecision=collisionDetectionPrecision_received,
                                                     chosenMapName=chosenMapName_received,
                                                     chonsenMapCoordinates=chonsenMapCoordinates_received,
                                                     details=details_received)

        #response to server
        response_data = {}
        response_data['message'] = 'Save to db finsihed!: )'
        return HttpResponse(json.dumps(response_data), content_type = "application/json")

    return render(request, 'BasicApp/index.html')



def game_view(request):

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
