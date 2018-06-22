//Author : Siyang Chen

//Global Variable (since it has to be interacted with html5, and it will be easier)
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
    for (var i = 0; i < m2pos.length; ++i) {
        var polyObject = new Phaser.Polygon([ new Phaser.Point(bias + m2pos[i][0][0] * scale, bias + (1 - m2pos[i][0][1]) * scale), new Phaser.Point(bias + m2pos[i][1][0] * scale, bias + (1 - m2pos[i][1][1]) * scale), new Phaser.Point(bias + m2pos[i][2][0] * scale, bias + (1 - m2pos[i][2][1]) * scale), new Phaser.Point(bias + m2pos[i][3][0] * scale, bias + (1 - m2pos[i][3][1]) * scale) ]);
        map2_obstacles_object.push(polyObject)
    }

    graphics = game.add.graphics(0, 0);
    graphics.beginFill(0xD7FF33);
    for (var i = 0; i < map2_obstacles_object.length; ++i) {
        graphics.drawPolygon(map2_obstacles_object[i].points); //it is possible that in future phaser.poly.points will be deprecated according to official documenthttps://www.w3schools.com/jsref/jsref_length_array.asp
    }
    graphics.endFill();


    // //#Draw the plan path object
    plan_path = game.add.graphics(0, 0);

    //#Draw the recorded path object
    real_path = game.add.graphics(0, 0);

  },

  //this is executed multiple times per second
  update: function() {
  },

};





//////////////////////////////////////////////////////////////////////////////////////////
//MARK: STEP2 : INTERACTION ---
//Interaction with Front-End User

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
var crashed_flag;
var won_flag;

/*
 * @ param : none
 * when user determined to go and this function executed
 */
function decidedToGo() {
  if (acutual_routes.length != 0) {
    crashed_flag = false;
    won_flag = false;
    clearPlanPath();
    submarine_move(1);
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
              alert("Crashed and Failed!!!");
              game.state.start('GameState');
              acutual_routes = [];
              crashed_flag = true;
              break;
            }
        }
      }

      //whether it reached the finsihed line
      if (crashed_flag == false && submarine.x >= 0.95 * scale + bias && submarine.x <= 1.05 * scale + bias && submarine.y >= -0.05 * scale + bias && submarine.y <= 0.05 * scale + bias) {
        alert("Won!!!");
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


//////////////////////////////////////////////////////////////////////////////////////////
//MARK : Helpers Function

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
