//Author : Siyang Chen

////Global Variable (since it has to be interacted with html5, and it will be easier)
//:basic properties of game stuffs
var background;
var submarine;
var finish_line;
var graphics;
var plan_path; // show the plan_path
var real_path; // record the walked path

var backgroundPic_source = backgroundPic_url;
var submarinePic_source = submarinePic_url;
var finish_linePic_source = finish_linePic_url;

var bigStepText; //visual stats - step
var riskText; //visual stats - risk
var bigStepCount; //Init in Game Create function, please set value there
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


////Data Structure for recording User Activity
var userLogDict;



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

    //#Game Stat
    var style = {font: '30px Arial', fill: '#fff'};
    this.game.add.text(10, 20, 'Surfacing Budget:', style);
    this.game.add.text(400, 20, 'Risk Budget:', style);

    bigStepText = this.game.add.text(260, 20, '', style);
    RiskText = this.game.add.text(580, 20, '', style);

    //#Initialize Stat for "step" and "riskBudget"
    bigStepCount = 6;
    riskBudget = 0.02;
    refreshStats();

    //#Initialize userLogDict
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
  bigStepText.text = bigStepCount;
  RiskText.text = riskBudget;
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
    bigStepCount--;
    riskBudget -= $('#risk').val();
    refreshStats();
    //log the data to userLogDict
    userLogDict['details'][bigStepCount] = {};
    userLogDict['details'][bigStepCount]['RiskBudgetLeft'] = riskBudget
    userLogDict['details'][bigStepCount]['riskChosen'] = $('#risk').val();
    userLogDict['details'][bigStepCount]['wayPointsChosen'] = $('#waypoints').val();
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
              userLogDict['result'] = 'lost';
              console.log(userLogDict);
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
        userLogDict['result'] = 'won';
        console.log(userLogDict);
        alert("Won!!!");
        initButtonState();
        sendEmail();
        game.state.start('GameState');
        acutual_routes = [];
        won_flag = true;
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
}


/*
 * @param : selected_map_name
 * Apply the selected map to the canvas
 */
function applyExpMap(selected_map_name) {
  switch (selected_map_name) {
    case 'Easy_Exp_Map00':
      m2pos = Easy_Exp_Map00;
      break;
    case 'Easy_Test_Map00':
      m2pos = Easy_Test_Map00;
      break;
    case 'Mid_Exp_Map00':
      m2pos = Mid_Exp_Map00;
      break;
    case 'Mid_Exp_Map01':
      m2pos = Mid_Exp_Map01;
      break;
    case 'Hard_Test_Map00':
      m2pos = Hard_Test_Map00;
      break;
    case 'Hard_Test_Map01':
      m2pos = Hard_Test_Map01;
      break;
  }
  map2_obstacles_object = [];
  graphics.destroy();
  activatePlanInputControle();
  game.state.restart('GameState');
}


//////////////////////////////////////////////////////////////////////////////////////////
//MARK : Helpers Function

//Helper Function for init the userLogDict
function initUserLogDict() {
  var myDict = {};
  myDict['result'] = 'unknown';
  myDict['Time'] = Date();
  myDict['obstacles'] = m2pos;
  myDict['RiskBudgetTotal'] = riskBudget;
  myDict['details'] = {};

  return myDict;
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


//////////////////////////////////////////////////////////////////////////////////////////
//MARK: Entry Point of the Program

//initiate the Phaser framework
var game = new Phaser.Game(scale + 2 * bias, scale + 2 * bias, Phaser.AUTO);

game.state.add('GameState', GameState);
game.state.start('GameState');

//////////////////////////////////////////////////////////////////////////////////////////

//Some Testing Map Variables
var Easy_Exp_Map00 = [[[0.7030590859012671, 0.4832996808082836], [0.7831982187646238, 0.4832996808082836], [0.7831982187646238, 0.5634388136716404], [0.7030590859012671, 0.5634388136716404]], [[0.1451505664726124, 0.13309210465510382], [0.20369756712936846, 0.13309210465510382], [0.20369756712936846, 0.19163910531185988], [0.1451505664726124, 0.19163910531185988]], [[0.12436283439230063, 0.2266917130030774], [0.20197528693569483, 0.2266917130030774], [0.20197528693569483, 0.3043041655464716], [0.12436283439230063, 0.3043041655464716]], [[0.7358830030999504, 0.7043964372678893], [0.7727017910340708, 0.7043964372678893], [0.7727017910340708, 0.7412152252020097], [0.7358830030999504, 0.7412152252020097]], [[0.668442689787518, 0.158016216967995], [0.741257730651403, 0.158016216967995], [0.741257730651403, 0.23083125783188013], [0.668442689787518, 0.23083125783188013]]];
var Easy_Test_Map00 = [[[0.31268010621141407, 0.3399133910332658], [0.36384281539865315, 0.3399133910332658], [0.36384281539865315, 0.3910761002205049], [0.31268010621141407, 0.3910761002205049]], [[0.4478064049587525, 0.23018675678514883], [0.5143378876358102, 0.23018675678514883], [0.5143378876358102, 0.2967182394622065], [0.4478064049587525, 0.2967182394622065]], [[0.07698321816901216, 0.8796261357450926], [0.11163729444938869, 0.8796261357450926], [0.11163729444938869, 0.9142802120254693], [0.07698321816901216, 0.9142802120254693]], [[0.9432306082707477, 0.42394540275366077], [0.9975345326350565, 0.42394540275366077], [0.9975345326350565, 0.47824932711796964], [0.9432306082707477, 0.47824932711796964]], [[0.33913904067727113, 0.6366678618966558], [0.4034093473369876, 0.6366678618966558], [0.4034093473369876, 0.7009381685563724], [0.33913904067727113, 0.7009381685563724]], [[0.269672822127833, 0.6461949446596649], [0.3170055885324879, 0.6461949446596649], [0.3170055885324879, 0.6935277110643197], [0.269672822127833, 0.6935277110643197]], [[0.9326292746786716, 0.7487122596596311], [1.0146156019583816, 0.7487122596596311], [1.0146156019583816, 0.830698586939341], [0.9326292746786716, 0.830698586939341]]];
var Mid_Exp_Map00 = [[[0.4499458854077121, 0.5386921793629844], [0.5008924814556814, 0.5386921793629844], [0.5008924814556814, 0.5896387754109538], [0.4499458854077121, 0.5896387754109538]], [[0.43281654939751063, 0.35910292379195446], [0.5130107787873021, 0.35910292379195446], [0.5130107787873021, 0.43929715318174584], [0.43281654939751063, 0.43929715318174584]], [[0.8683561862330653, 0.5435169312243469], [0.8827432784928413, 0.5435169312243469], [0.8827432784928413, 0.5579040234841228], [0.8683561862330653, 0.5579040234841228]], [[0.5488614741470671, 0.8443645972029664], [0.6167993714598173, 0.8443645972029664], [0.6167993714598173, 0.9123024945157167], [0.5488614741470671, 0.9123024945157167]], [[0.34234543953642704, 0.24868184601817425], [0.38739437417702727, 0.24868184601817425], [0.38739437417702727, 0.29373078065877445], [0.34234543953642704, 0.29373078065877445]], [[0.10058307036498489, 0.6939989211038396], [0.18256879920789387, 0.6939989211038396], [0.18256879920789387, 0.7759846499467485], [0.10058307036498489, 0.7759846499467485]], [[0.38414307199165987, 0.9057137791801648], [0.4173320594883838, 0.9057137791801648], [0.4173320594883838, 0.9389027666768888], [0.38414307199165987, 0.9389027666768888]], [[0.3854943066941562, 0.06431736410307044], [0.4391384357809144, 0.06431736410307044], [0.4391384357809144, 0.11796149318982861], [0.3854943066941562, 0.11796149318982861]], [[0.8326514582675933, 0.6969749023257817], [0.8753943263105782, 0.6969749023257817], [0.8753943263105782, 0.7397177703687666], [0.8326514582675933, 0.7397177703687666]], [[0.07644548080057616, 0.23523162491150812], [0.16916523845447723, 0.23523162491150812], [0.16916523845447723, 0.3279513825654092], [0.07644548080057616, 0.3279513825654092]], [[0.2692751705423384, 0.3807998582731984], [0.310868317720439, 0.3807998582731984], [0.310868317720439, 0.422393005451299], [0.2692751705423384, 0.422393005451299]], [[0.9329659200178771, 0.5673388761497008], [0.9619384025402781, 0.5673388761497008], [0.9619384025402781, 0.5963113586721017], [0.9329659200178771, 0.5963113586721017]]];
var Mid_Exp_Map01 = [[[0.7879797864668001, 0.3730302539481747], [0.8115507602885867, 0.3730302539481747], [0.8115507602885867, 0.3966012277699613], [0.7879797864668001, 0.3966012277699613]], [[0.09418464415464237, 0.26173573447922194], [0.13184511131544505, 0.26173573447922194], [0.13184511131544505, 0.2993962016400247], [0.09418464415464237, 0.2993962016400247]], [[0.8657534342115908, 0.1580280862077154], [0.949553497716921, 0.1580280862077154], [0.949553497716921, 0.2418281497130455], [0.8657534342115908, 0.2418281497130455]], [[0.1149092723897488, 0.8330388151119125], [0.14469410991984877, 0.8330388151119125], [0.14469410991984877, 0.8628236526420124], [0.1149092723897488, 0.8628236526420124]], [[0.4712934160720078, 0.13232686202318242], [0.49987276113551615, 0.13232686202318242], [0.49987276113551615, 0.16090620708669082], [0.4712934160720078, 0.16090620708669082]], [[0.5145171426964746, 0.2832161370988305], [0.6043007798568897, 0.2832161370988305], [0.6043007798568897, 0.37299977425924563], [0.5145171426964746, 0.37299977425924563]], [[0.7646878201436147, 0.4578922350129586], [0.841530935991651, 0.4578922350129586], [0.841530935991651, 0.5347353508609949], [0.7646878201436147, 0.5347353508609949]], [[0.917146451439853, 0.6551533494529097], [0.9864385828379566, 0.6551533494529097], [0.9864385828379566, 0.7244454808510133], [0.917146451439853, 0.7244454808510133]], [[0.24676796101878326, 0.2663570853349529], [0.2733248651583497, 0.2663570853349529], [0.2733248651583497, 0.29291398947451935], [0.24676796101878326, 0.29291398947451935]], [[0.14303160921916044, 0.38933304982466216], [0.20580319621151025, 0.38933304982466216], [0.20580319621151025, 0.452104636817012], [0.14303160921916044, 0.452104636817012]], [[0.36580658155104473, 0.06806941415377743], [0.38053252228587064, 0.06806941415377743], [0.38053252228587064, 0.08279535488860335], [0.36580658155104473, 0.08279535488860335]], [[0.5629461742427851, 0.12344630124557804], [0.5740468835247682, 0.12344630124557804], [0.5740468835247682, 0.13454701052756118], [0.5629461742427851, 0.13454701052756118]], [[0.5697202616661226, 0.17211868725715318], [0.6402491139279534, 0.17211868725715318], [0.6402491139279534, 0.242647539518984], [0.5697202616661226, 0.242647539518984]], [[0.07631078041723977, 0.3203409151231042], [0.13417471633641959, 0.3203409151231042], [0.13417471633641959, 0.378204851042284], [0.07631078041723977, 0.378204851042284]]];
var Hard_Test_Map00 = [[[0.4308977887127608, 0.4466772283762864], [0.4450152699923415, 0.4466772283762864], [0.4450152699923415, 0.46079470965586705], [0.4308977887127608, 0.46079470965586705]], [[0.5807661990211372, 0.7609288116348856], [0.6505829211513767, 0.7609288116348856], [0.6505829211513767, 0.830745533765125], [0.5807661990211372, 0.830745533765125]], [[0.142968450791409, 0.5469086049546018], [0.2176581118655195, 0.5469086049546018], [0.2176581118655195, 0.6215982660287124], [0.142968450791409, 0.6215982660287124]], [[0.6920656557497032, 0.19873913673990679], [0.751730081724079, 0.19873913673990679], [0.751730081724079, 0.2584035627142826], [0.6920656557497032, 0.2584035627142826]], [[0.29192719322012184, 0.31328726946161833], [0.38941126854633235, 0.31328726946161833], [0.38941126854633235, 0.41077134478782884], [0.29192719322012184, 0.41077134478782884]], [[0.6352826565169832, 0.5098499133699507], [0.6751929184918554, 0.5098499133699507], [0.6751929184918554, 0.5497601753448228], [0.6352826565169832, 0.5497601753448228]], [[0.46335925111661586, 0.1899030733147125], [0.5567250675105873, 0.1899030733147125], [0.5567250675105873, 0.28326888970868386], [0.46335925111661586, 0.28326888970868386]], [[0.6707337928664968, 0.8198583631013131], [0.729551600047765, 0.8198583631013131], [0.729551600047765, 0.8786761702825813], [0.6707337928664968, 0.8786761702825813]], [[0.9612304947264384, 0.7219192810958596], [1.0318986843524631, 0.7219192810958596], [1.0318986843524631, 0.7925874707218844], [0.9612304947264384, 0.7925874707218844]], [[0.40891253125595106, 0.3519735001763754], [0.45635939346327004, 0.3519735001763754], [0.45635939346327004, 0.3994203623836944], [0.40891253125595106, 0.3994203623836944]], [[0.6990479838525613, 0.10980749080201244], [0.7534823504115177, 0.10980749080201244], [0.7534823504115177, 0.16424185736096888], [0.6990479838525613, 0.16424185736096888]], [[0.9054765942161116, 0.42951229067814434], [0.9740594066391401, 0.42951229067814434], [0.9740594066391401, 0.4980951031011729], [0.9054765942161116, 0.4980951031011729]], [[0.669014867375333, 0.25269749890799803], [0.6917786035514145, 0.25269749890799803], [0.6917786035514145, 0.27546123508407966], [0.669014867375333, 0.27546123508407966]], [[0.10575414787157358, 0.30022123946471035], [0.1759714399363885, 0.30022123946471035], [0.1759714399363885, 0.37043853152952533], [0.10575414787157358, 0.37043853152952533]], [[0.17825258270296124, 0.10184982077718889], [0.22606797730921163, 0.10184982077718889], [0.22606797730921163, 0.1496652153834393], [0.17825258270296124, 0.1496652153834393]], [[0.2799653351733737, 0.200971517969269], [0.32233933725294334, 0.200971517969269], [0.32233933725294334, 0.24334552004883864], [0.2799653351733737, 0.24334552004883864]], [[0.38824053262898045, 0.16496070892979536], [0.46072480871657423, 0.16496070892979536], [0.46072480871657423, 0.23744498501738914], [0.38824053262898045, 0.23744498501738914]], [[0.26119639600308764, 0.25013657185603955], [0.2854930724416591, 0.25013657185603955], [0.2854930724416591, 0.274433248294611], [0.26119639600308764, 0.274433248294611]]];
var Hard_Test_Map01 = [[[0.6963072059879301, 0.08170326979967338], [0.7509150520735959, 0.08170326979967338], [0.7509150520735959, 0.13631111588533915], [0.6963072059879301, 0.13631111588533915]], [[0.4964165744745691, 0.3670874558980429], [0.552065331894355, 0.3670874558980429], [0.552065331894355, 0.42273621331782885], [0.4964165744745691, 0.42273621331782885]], [[0.7194474321725551, 0.6809160290545845], [0.7508061228436437, 0.6809160290545845], [0.7508061228436437, 0.712274719725673], [0.7194474321725551, 0.712274719725673]], [[0.5438054709627427, 0.8467752370683801], [0.5546666401450364, 0.8467752370683801], [0.5546666401450364, 0.8576364062506738], [0.5438054709627427, 0.8576364062506738]], [[0.47402419130210316, 0.7383950048479876], [0.5214309792662902, 0.7383950048479876], [0.5214309792662902, 0.7858017928121747], [0.47402419130210316, 0.7858017928121747]], [[0.14091971624472155, 0.7339470109838289], [0.19626196705448606, 0.7339470109838289], [0.19626196705448606, 0.7892892617935934], [0.14091971624472155, 0.7892892617935934]], [[0.6485857317881186, 0.6847959491887222], [0.6754384917934219, 0.6847959491887222], [0.6754384917934219, 0.7116487091940255], [0.6485857317881186, 0.7116487091940255]], [[0.6533495899524447, 0.5362454025556075], [0.7050960975220487, 0.5362454025556075], [0.7050960975220487, 0.5879919101252115], [0.6533495899524447, 0.5879919101252115]], [[0.9315829534959789, 0.12169962920936847], [0.9980836817535196, 0.12169962920936847], [0.9980836817535196, 0.18820035746690925], [0.9315829534959789, 0.18820035746690925]], [[0.8738475206815445, 0.7903798717744376], [0.9162322704214977, 0.7903798717744376], [0.9162322704214977, 0.8327646215143908], [0.8738475206815445, 0.8327646215143908]], [[0.26624644143822235, 0.47330266371481716], [0.3154472564699316, 0.47330266371481716], [0.3154472564699316, 0.5225034787465265], [0.26624644143822235, 0.5225034787465265]], [[0.7836087743307366, 0.16114147256250969], [0.869908431830002, 0.16114147256250969], [0.869908431830002, 0.247441130061775], [0.7836087743307366, 0.247441130061775]], [[0.7359042768371054, 0.5120367013073293], [0.7790675098714912, 0.5120367013073293], [0.7790675098714912, 0.5551999343417151], [0.7359042768371054, 0.5551999343417151]], [[0.3374147030425138, 0.12536475393457056], [0.39900413836427, 0.12536475393457056], [0.39900413836427, 0.1869541892563267], [0.3374147030425138, 0.1869541892563267]], [[0.6776206589207247, 0.8085917943279782], [0.7338834470160484, 0.8085917943279782], [0.7338834470160484, 0.8648545824233019], [0.6776206589207247, 0.8648545824233019]], [[0.4243998242306239, 0.6435410928223105], [0.470675480269144, 0.6435410928223105], [0.470675480269144, 0.6898167488608308], [0.4243998242306239, 0.6898167488608308]], [[0.4114207999172957, 0.25929563425776575], [0.4452888516563784, 0.25929563425776575], [0.4452888516563784, 0.29316368599684844], [0.4114207999172957, 0.29316368599684844]], [[0.7758277932354145, 0.4148217569452572], [0.8086648356458348, 0.4148217569452572], [0.8086648356458348, 0.4476587993556776], [0.7758277932354145, 0.4476587993556776]], [[0.11971022407858281, 0.10166101358074767], [0.1599165687700803, 0.10166101358074767], [0.1599165687700803, 0.14186735827224514], [0.11971022407858281, 0.14186735827224514]], [[0.844103075554524, 0.24979221283375352], [0.9313615054692677, 0.24979221283375352], [0.9313615054692677, 0.33705064274849716], [0.844103075554524, 0.33705064274849716]]];
