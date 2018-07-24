//Author : Siyang Chen

////Global Variable (since it has to be interacted with html5, and it will be easier)
//:basic properties of game stuffs
var background;
var submarine;
var finish_line;
var graphics;
var plan_path; // show the plan_path
var real_path; // record the walked path
var breakPoints; // Draw the breakPoints

var backgroundPic_source = backgroundPic_url;
var submarinePic_source = submarinePic_url;
var finish_linePic_source = finish_linePic_url;

var bigStepText; //visual stats - step
var riskText; //visual stats - risk
var bigStepDownCount; //Init in Game Create function, please set value there
var riskBudget; //Init in Game Create function, please set value there

var wantDataFlag = false;

//:Obstacles
//So far just manually copy data from map2 ***Remember to deal with y which should be 1 - y in this js phaser map***
//Still planning on upload the map data in frontend method or backend method, but not a problem in this development stage
var obs_105 = [[0.75, 0.25000000000000006], [0.8, 0.25000000000000006], [0.8, 0.30000000000000004], [0.75, 0.30000000000000004]];
var obs_110 = [[0.16666666666666666, 0.16666666666666669], [0.21666666666666667, 0.16666666666666669], [0.21666666666666667, 0.21666666666666667], [0.16666666666666666, 0.21666666666666667]];
var obs_126 = [[0.5, 0.08333333333333341], [0.55, 0.08333333333333341], [0.55, 0.13333333333333341], [0.5, 0.13333333333333341]];
var obs_20 = [[0.6666666666666666, 0.8333333333333333], [0.7166666666666667, 0.8333333333333333], [0.7166666666666667, 0.8833333333333333], [0.6666666666666666, 0.8833333333333333]];
var obs_26 = [[0.16666666666666666, 0.75], [0.21666666666666667, 0.75], [0.21666666666666667, 0.8], [0.16666666666666666, 0.8]];
var obs_31 = [[0.5833333333333333, 0.75], [0.6333333333333333, 0.75], [0.6333333333333333, 0.8], [0.5833333333333333, 0.8]];
var obs_36 = [[0.0, 0.6666666666666666], [0.05, 0.6666666666666666], [0.05, 0.7166666666666667], [0.0, 0.7166666666666667]];
var obs_39 = [[0.25, 0.6666666666666666], [0.3, 0.6666666666666666], [0.3, 0.7166666666666667], [0.25, 0.7166666666666667]];
var obs_42 = [[0.5, 0.6666666666666666], [0.55, 0.6666666666666666], [0.55, 0.7166666666666667], [0.5, 0.7166666666666667]];
var obs_54 = [[0.5, 0.5833333333333334], [0.55, 0.5833333333333334], [0.55, 0.6333333333333334], [0.5, 0.6333333333333334]];
var obs_57 = [[0.75, 0.5833333333333334], [0.8, 0.5833333333333334], [0.8, 0.6333333333333334], [0.75, 0.6333333333333334]];
var obs_77 = [[0.41666666666666663, 0.4166666666666667],[0.4666666666666666, 0.4166666666666667], [0.4666666666666666, 0.4666666666666667], [0.41666666666666663, 0.4666666666666667]]
var obs_78 = [[0.5, 0.4166666666666667], [0.55, 0.4166666666666667], [0.55, 0.4666666666666667], [0.5, 0.4666666666666667]];

//Map is defined as 1100 * 1100
//Then, scale would be 1000 and bias would be 100 in this case
var scale = 1000; //this variable is because of setting the inpus obstalce coordinates corresponding to how large the map you like
var bias = 100; //this is because of making the canvas larger for having better view (scale + margin not used) * (scale + margin not used), and bias is the "margin not used"
var m2pos = [obs_105, obs_110, obs_126, obs_20, obs_26, obs_31, obs_36, obs_39, obs_42, obs_54, obs_57, obs_77, obs_78];
var map2_obstacles_object = []; //store the objects that have transferred coordinates to the canvas


//:Precision for detecting collision (cant be 0): 0.1 - slower but more precision, 1 - faster but less precision
var precision = 1; // it can be 0.1, but !*** precision >= 0 ***!

//:Marker Size Setting
var diameter_circle_marker = 15;

//:Risk Float Fixed to Setting
var to_val_decimal_places = 4;


////Data Structure for recording User Activity
var userLogDict;
var bigStepCount;
var real_path_total_sum;
var expected_path_total_sum;
var bigStepTotalCost;
var riskTotalCost;
var wayPointTotalCost;


///////////////////////////////////////////////////////////////////////////////////////////
//MARK: STEP1 : INITIALIZATION ---


//this game will have only 1 state
var GameState = {

  //load the game assets before the game starts
  preload: function() {
    //this.load.image('submarine', 'assets/images/submarine.png');
    //this.load.image('finish_line', 'assets/images/finish_line.png');
    this.load.image('background', backgroundPic_source);
    this.load.image('submarine', submarinePic_source);
    this.load.image('finish_line', finish_linePic_source);
  },

  //executed after everything is loaded
  create: function() {

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;


    //*Draw Background
    background = this.game.add.sprite(0, 0, 'background'); // two roles here : one is to add sprite, the other one is to assign reference
    background.scale.setTo(2, 2);

    //*Draw Submarine
    submarine = this.game.add.sprite(0 * scale + bias, 1 * scale + bias, 'submarine');
    submarine.anchor.setTo(0.5, 0.5);
    submarine.scale.setTo(-0.03, 0.03);
    this.game.physics.arcade.enable(submarine);

    //*Draw Finish Line
    finish_line = this.game.add.sprite(1 * scale + bias, 0 * scale + bias, 'finish_line');
    finish_line.anchor.setTo(0.5, 0.5);
    finish_line.scale.setTo(0.3, 0.3);
    this.game.physics.arcade.enable(finish_line);


    //*Draw Obstacle Objects
    graphics = game.add.graphics(0, 0);

    for (var i = 0; i < m2pos.length; ++i) {
        var polyObject = new Phaser.Polygon([ new Phaser.Point(bias + m2pos[i][0][0] * scale, bias + (1 - m2pos[i][0][1]) * scale), new Phaser.Point(bias + m2pos[i][1][0] * scale, bias + (1 - m2pos[i][1][1]) * scale), new Phaser.Point(bias + m2pos[i][2][0] * scale, bias + (1 - m2pos[i][2][1]) * scale), new Phaser.Point(bias + m2pos[i][3][0] * scale, bias + (1 - m2pos[i][3][1]) * scale) ]);
        map2_obstacles_object.push(polyObject)
    }

    graphics.beginFill(0xD7FF33);
    for (var i = 0; i < map2_obstacles_object.length; ++i) {
        graphics.drawPolygon(map2_obstacles_object[i].points); //it is possible that in future phaser.poly.points will be deprecated according to official documenthttps://www.w3schools.com/jsref/jsref_length_array.asp
    }
    graphics.endFill();


    //#Draw the plan path object
    plan_path = game.add.graphics(0, 0);

    //#Draw the recorded path object
    real_path = game.add.graphics(0, 0);

    //#Draw BreakPoints
    breakPoints = game.add.graphics(0, 0);
    breakPoints.beginFill(0x2b2591);

    //#Game Stat
    var style = {font: '30px Arial', fill: '#fff'};
    this.game.add.text(10, 20, 'Surfacing Budget:', style);
    this.game.add.text(400, 20, 'Risk Budget:', style);

    bigStepText = this.game.add.text(260, 20, '', style);
    RiskText = this.game.add.text(580, 20, '', style);

    //#Initialize Stat for "step" and "riskBudget"
    bigStepDownCount = 6;
    riskBudget = 0.02;
    refreshStats();

    //#Initialize userLogDict
    bigStepCount = 0;
    real_path_total_sum = 0;
    expected_path_total_sum = 0;
    bigStepTotalCost = 0;
    riskTotalCost = 0;
    wayPointTotalCost = 0;

    userLogDict = initUserLogDict();

  },

  //this is executed multiple times per second
  update: function() {
  },

};




//////////////////////////////////////////////////////////////////////////////////////////
//MARK: STEP2 : INTERACTION ---
//Interaction with Front-End User

//Show the visual stats data
/*
 * @param : none
 * Refresh visual stats for "step" and "risk budget"
 */
function refreshStats() {
  bigStepText.text = bigStepDownCount;
  RiskText.text = riskBudget.toFixed(to_val_decimal_places);
}


//Show the Plan Path and clear Plan Path
/*
 * @ param : routes - expected coordinate received from backend : [[x0, y0], [x1, y1]...]
 * @ return : nothing
 * draw the plan_path
 */
function showPlanPath(expected_routes) {
  clearPlanPath();
  plan_path.lineStyle(3, 0x33FF00);
  plan_path.moveTo(submarine.x,submarine.y);
  for (var i = 1; i < expected_routes.length; ++i) {
    plan_path.lineTo(expected_routes[i][0] * scale + bias, (1.0 - expected_routes[i][1]) * scale + bias);
  }

}
/*
 * clear the drawed plan_path
 */
function clearPlanPath() {
  plan_path.clear();
}


//Run the Submarine from several coordinates
//(call function "submarine_move(step)" in async method)
//Different to expected_routes, here are the real_routes coorindates
//* Key : There are async here, please read program carefully *//
var acutual_routes = [];
var expected_routes = [];
var crashed_flag;
var won_flag;

/*
 * @ param : none
 * when user determined to go and this function executed
 */
function decidedToGoClicked() {
  if (acutual_routes.length != 0) {
    crashed_flag = false;
    won_flag = false;
    clearPlanPath();
    submarine_move(1);
    //update the visual stats
    bigStepTotalCost++;
    bigStepCount++;
    bigStepDownCount--;
    riskTotalCost += parseFloat($('#risk').val());
    riskBudget -= parseFloat($('#risk').val());
    refreshStats();
    //log the data to userLogDict
    userLogDict['details'][bigStepCount] = {};
    userLogDict['details'][bigStepCount]['RiskBudgetLeft'] = riskBudget
    userLogDict['details'][bigStepCount]['riskChosen'] = parseFloat($('#risk').val());
    userLogDict['details'][bigStepCount]['wayPointsChosen'] = parseFloat($('#waypoints').val());
    userLogDict['details'][bigStepCount]['real_route'] = acutual_routes;
    userLogDict['details'][bigStepCount]['expected_route'] = expected_routes;

  } else {
    alert("please do the plan first, always!");
  }
}

/*
 * @ param : on which exactly way point
 * Move the submarine and collision detection
 */
function submarine_move(step) {
  if (step < acutual_routes.length && step >= 1) {
    var prevX = acutual_routes[step - 1][0] * scale + bias;
    var prevY =(1.0 - acutual_routes[step - 1][1]) * scale + bias;
    var nextX = acutual_routes[step][0] * scale + bias;
    var nextY = (1.0 - acutual_routes[step][1]) * scale + bias;
    //Draw the break points
    if (step == 1) {
      breakPoints.drawCircle(prevX, prevY, diameter_circle_marker);
    }
    //Draw the walked line
    real_path.lineStyle(3, 0xffcd59);
    real_path.moveTo(prevX,prevY);
    real_path.lineTo(nextX, nextY);
    //Fork a new thread to move the submarine
    var submarine_movement = game.add.tween(submarine);
    submarine_movement.to({x: nextX, y: nextY}, 300);
    //Asychronous
    submarine_movement.onComplete.add(function(){
      //**Movement Control:
      var trackPoints = sample2DCoordinate(prevX, prevY, nextX, nextY, precision);

      //Collision Detection
      for (var idx = 0; idx < trackPoints.length; ++idx) {
        //if crashed into one of the obstacles, no need to scan anymore
        if (crashed_flag) {
            break;
        }
        //scan whether it is crashed into one of the obstacles
        for (var i = 0; i < map2_obstacles_object.length; ++i) {
          if (map2_obstacles_object[i].contains(trackPoints[idx][0], trackPoints[idx][1])) {

              //calculate and log the data
              calulatePathLen(step);
              wayPointTotalCost += step;
              userLogDict['surfacingStepTotalCost'] = bigStepTotalCost;
              userLogDict['riskTotalCost'] = riskTotalCost;
              userLogDict['wayPointTotalCost'] = wayPointTotalCost;
              userLogDict['real_path_total_sum'] = real_path_total_sum;
              userLogDict['expected_path_total_sum'] = expected_path_total_sum;
              userLogDict['result'] = 'lost';
              console.log(userLogDict);

              //send post request to database
              saveLogDataToDB();

              //game failed and deal with the following procedure
              alert("Crashed and Failed!!!");
              initButtonState();
              sendEmail();
              game.state.start('GameState');
              acutual_routes = [];
              crashed_flag = true;
              break;
            }
        }
      }

      //whether it reached the finsihed line
      if (crashed_flag == false && submarine.x >= 0.95 * scale + bias && submarine.x <= 1.05 * scale + bias && submarine.y >= -0.05 * scale + bias && submarine.y <= 0.05 * scale + bias) {

        //calculate and log the data
        calulatePathLen(step);
        wayPointTotalCost += step;
        userLogDict['surfacingStepTotalCost'] = bigStepTotalCost;
        userLogDict['riskTotalCost'] = riskTotalCost;
        userLogDict['wayPointTotalCost'] = wayPointTotalCost;
        userLogDict['real_path_total_sum'] = real_path_total_sum;
        userLogDict['expected_path_total_sum'] = expected_path_total_sum;
        userLogDict['result'] = 'Success';
        console.log(userLogDict);

        //send post request to database
        saveLogDataToDB();

        //game won and deal with the following procedure
        alert("Success!!!");
        initButtonState();
        sendEmail();
        game.state.start('GameState');
        acutual_routes = [];
        won_flag = true;
      }

      //last step
      if (step == acutual_routes.length - 1) {
        calulatePathLen(step);
        wayPointTotalCost += step;
      }

      //next waypoints
      if(crashed_flag == false && won_flag == false) {
        submarine_move(step + 1);
      }

    }, this);
    submarine_movement.start();
  } else {
    acutual_routes = [];
  }
}

/*
 * @param : num - numbers of obstacles
 * restart the game and change the location of obstacles
 */
function changeMap(num) {
  m2pos = square_obstacles_generator(num);
  map2_obstacles_object = [];
  graphics.destroy();
  activatePlanInputControle();
  game.state.restart('GameState');
  userLogDict['obstacles_map_name'] = "freePlayModeMap";
}


/*
 * @param : selected_map_name
 * Apply the selected map to the canvas
 */
function applyExpMap() {
  var selected_map_name = $('#default_maps_level2 option:selected').text();
  //be careful the use of eval()
  if (selected_map_name != '') {
    m2pos = eval(selected_map_name);
  }
  map2_obstacles_object = [];
  graphics.destroy();
  activatePlanInputControle();
  game.state.restart('GameState');
}


//////////////////////////////////////////////////////////////////////////////////////////
//MARK : Helpers Function

//Helper Function for calculating the path length
/*
 * @param : idx - until which step
 * save path length for each surfacing big step
 */
function calulatePathLen(idx) {
  var real_path_route_sum = 0;
  var expected_path_route_sum = 0;
  for (var i = 1; i <= idx; ++i) {
    var r_x1 = acutual_routes[i - 1][0];
    var r_y1 = acutual_routes[i - 1][1];
    var r_x2 = acutual_routes[i][0];
    var r_y2 = acutual_routes[i][0];

    var e_x1 = expected_routes[i - 1][0];
    var e_y1 = expected_routes[i - 1][1];
    var e_x2 = expected_routes[i][0];
    var e_y2 = expected_routes[i][0];

    real_path_route_sum = real_path_route_sum + Math.sqrt((r_x1 - r_x2) * (r_x1 - r_x2) + (r_y1 - r_y2) * (r_y1 - r_y2));
    expected_path_route_sum = expected_path_route_sum + Math.sqrt((e_x1 - e_x2) * (e_x1 - e_x1) + (e_y1 - e_y2) * (e_y1 - e_y2));
  }

  userLogDict['details'][bigStepCount]['real_path_route_sum'] = real_path_route_sum;
  userLogDict['details'][bigStepCount]['expected_path_route_sum'] = expected_path_route_sum;
  real_path_total_sum += real_path_route_sum;
  expected_path_total_sum += expected_path_route_sum;
}

//Helper Function for init the userLogDict
function initUserLogDict() {
  var myDict = {};
  //Basic Info
  myDict['participantID'] = $("#startButton").html()
  myDict['time'] = Date();

  //Result
  myDict['result'] = 'unknown';

  //MapBasic
  myDict['canvas_scale'] = scale;
  myDict['canvas_bias'] = bias;
  myDict['collision_detection_precision'] = precision;
  myDict['obstacles_map_name'] = $('#default_maps_level2 option:selected').text();
  myDict['obstacles_coodinates'] = m2pos;

  //Game Settings
  myDict['RiskBudgetTotal'] = riskBudget;
  myDict['SurfacingStepBudgetTotal'] = bigStepDownCount;

  //UserStatsLog
  myDict['real_path_total_sum'] = 0;
  myDict['expected_path_total_sum'] = 0;

  myDict['surfacingStepTotalCost'] = 0;
  myDict['riskTotalCost'] = 0;
  myDict['wayPointTotalCost'] = 0;


  myDict['details'] = {};

  return myDict;
}


function saveLogDataToDB() {
  var csrftoken = getCookie('csrftoken');
  $.ajax({
    type : "POST",
    url : "/dbCommunication/",
    data : {
    participantID_sent : userLogDict['participantID'],
    date_sent : userLogDict['time'],
    result_sent : userLogDict['result'],
    realPathTotalSum_sent : userLogDict['real_path_total_sum'],
    expectedPathTotalSum_sent : userLogDict['expected_path_total_sum'],
    surFacingStepTotalCost_sent : userLogDict['surfacingStepTotalCost'],
    riskTotalCost_sent : userLogDict['riskTotalCost'],
    wayPointTotalCost_sent : userLogDict['wayPointTotalCost'],
    riskBudget_sent : userLogDict['RiskBudgetTotal'],
    surfacingStepBudget_sent : userLogDict['SurfacingStepBudgetTotal'],
    canvasScale_sent : userLogDict['canvas_scale'],
    canvasBias_sent : userLogDict['canvas_bias'],
    collisionDetectionPrecision_sent : userLogDict['collision_detection_precision'],
    chosenMapName_sent : userLogDict['obstacles_map_name'],
    chonsenMapCoordinates_sent : JSON.stringify(userLogDict['obstacles_coodinates']),
    details_sent : JSON.stringify(userLogDict['details']),
    csrfmiddlewaretoken : csrftoken,
    },
    success : function(received_json) {
      //console.log(received_json);
    }
  });
}


//Helper Function for sending the email
function sendEmail() {
  var emailAddress = prompt("If you want to have your data, please enter your emailAddress:");
  if (emailAddress == null) {
    return;
  }

  while (!validateEmail(emailAddress)) {
    alert("please enter a valid email address.");
    emailAddress = prompt("If you want to have your data, please enter your emailAddress:");
    if (emailAddress == null) {
      return;
    }
  }

  var service_id = "default_service";
  var template_id = "psulu_hal_2018_result";
  var template_params = {
    email_to: emailAddress,
    project_team_name: 'Psulu_HAL_TEAM',
    date_now: userLogDict['Time'],
    experiment_data: JSON.stringify(userLogDict),
  };

  emailjs.send(service_id,template_id,template_params).then(function(){
       alert("Sent!");
    }, function(err) {
       alert("Send email failed!\r\n Response:\n " + JSON.stringify(err));
    });


}


//Validate whether the string is an valid email address
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


//Below Functions are for randomly creating the map
/*
 * @param : numbers of obstacle wanted to be created
 * @return : list of square obstacles
 */
function square_obstacles_generator(num) {

  var squares_list = [];
  var count = 0;

  while (count < num) {
    var newSquare = random_create_square();
    var left_x = newSquare[3][0];
    var top_y = newSquare[3][1];
    var right_x = newSquare[1][0];
    var bottom_y = newSquare[1][1];

    if (left_x >= 0.05 && bottom_y >= 0.05 && top_y <= 0.95 && bottom_y <= 0.95 && !checkOverLap(squares_list, newSquare)) {
      count++;
      squares_list.push(newSquare);
    }
  }
  return squares_list;
}

/*
 * @ param : squares_list, newSquare
 * @ return : true - if the new created square is overlap with one of the square in squares_list
 *            false - no overlap
 */
function checkOverLap(squares_list, newSquare) {
  if (squares_list.length == 0) {
    return false;
  }
  for (var i = 0; i < squares_list.length; ++i) {
      if (isOverlap(squares_list[i][3], squares_list[i][1], newSquare[3], newSquare[1])) {
        return true;
      }
  }
  return false;
}

/*
 * @param : top left coordinate of square1 l1, to right coordinate of square1 r1
 * @return : false - no overlap with these two square
 *           true - these two squares are overlaped
 */
function isOverlap(l1, r1, l2, r2) {
  if (l1[0] > r2[0] || l2[0] > r1[0]) {
    return false;
  }

  if (l1[1] < r2[1] || l2[1] < r1[1]) {
    return false;
  }
  return true;
}

/*
 * @ param : none
 * @ return : randomly create a square in coordinate map (0, 0) ~ (1,1)
 * the length of the square could be a value from 0.1 ~ 0.01
 */
function random_create_square() {
  var centerX = Math.random();
  var centerY = Math.random();
  var len = Math.random() * (0.1 - 0.01) + 0.01;
  len /= 2;
  var left_x = centerX - len;
  var right_x = centerX + len;
  var top_y = centerY + len;
  var bottom_y = centerY - len;
  return [[left_x, bottom_y], [right_x, bottom_y], [right_x, top_y], [left_x, top_y]];
}

//sample2DCoordinate created by Siyang Chen
/*
 * @parameter: source_x - source X coordinate
 *             source_y - source Y coordinate
 *             target_x - target X coordinate
 *             target_y - target Y coordinate
 *             precision - larger than 0, and it can be float
 * @return: true - sample coordinates like [[x1, y1], [x2, y2], [x3, y3], ...], including the target coordinate
 */
function sample2DCoordinate(source_x, source_y, target_x, target_y, precision) {
  var res = []
  var dist = Math.sqrt( Math.pow((target_y - source_y), 2) + Math.pow((target_x-source_x), 2) );

  var sin =  (target_y - source_y) / dist;
  var cos = (target_x - source_x) / dist;

  for (var val = precision; val <= dist; val += precision) {
    var delta_x = val * cos;
    var delta_y = val * sin;
    res.push([source_x + delta_x, source_y + delta_y]);
  }

  return res;
}

/*
 *@param: get cookie name
 *this function is for getting the rsftoken
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

//////////////////////////////////////////////////////////////////////////////////////////
//MARK: Entry Point of the Program

//initiate the Phaser framework
var game = new Phaser.Game(scale + 2 * bias, scale + 2 * bias, Phaser.AUTO, 'gamePlace');

game.state.add('GameState', GameState);
game.state.start('GameState');

//////////////////////////////////////////////////////////////////////////////////////////
