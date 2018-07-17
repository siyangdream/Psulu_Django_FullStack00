# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
class GameLog(models.Model):
    #Basic user info
    participantID = models.CharField(max_length=256)
    date = models.DateTimeField(auto_now_add=True, blank=True)

    #Game result and stat user data
    result = models.CharField(max_length=256)
    realPathTotalSum = models.FloatField()
    expectedPathTotalSum = models.FloatField()
    surFacingStepTotalCost = models.FloatField()
    riskTotalCost = models.FloatField()
    wayPointTotalCost = models.FloatField()

    #Game settings
    riskBudget = models.FloatField()
    surfacingStepBudget = models.FloatField()

    #Map Basic
    canvasScale = models.FloatField()
    canvasBias = models.FloatField()
    collisionDetectionPrecision = models.FloatField()
    chosenMapName = models.CharField(max_length=256)
    chonsenMapCoordinates = models.TextField()

    #Details
    details = models.TextField()
