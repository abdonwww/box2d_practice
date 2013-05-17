jQuery.noConflict();
;(function($){

/* Import Box2d Packages */
var b2Vec2         = Box2D.Common.Math.b2Vec2;
var b2BodyDef      = Box2D.Dynamics.b2BodyDef;
var b2Body         = Box2D.Dynamics.b2Body;
var b2FixtureDef   = Box2D.Dynamics.b2FixtureDef;
var b2Fixture      = Box2D.Dynamics.b2Fixture;
var b2World        = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;

/* Global Variables For Box2d */
var drawCanvas = document.getElementById('drawCanvas');
var debugCanvas = document.getElementById('debugCanvas');
var debugFlag = false;
var SCALE = 32; // how many pixels pwe meter
var world;
var bodyDef;
var fixDef;
var displayWidth;
var displayHeight;

/* Global Variables for CreatJS */
var stage = new createjs.Stage(drawCanvas);
var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var letterObj;

var groundManager;
var actorManager;
var sceneManager;

$('canvas').on('click', function(){ groundManager.dismiss(); });
$(window).on('resize', resizeCanvas).resize();
$(document).ready(function(){
    initBox2d();
    initMain();
    // initMC();
});

function initBox2d() {
    // Create Box2d world
    world = new b2World(
        new b2Vec2(0, 10),
        true
    );

    var groundBody = world.GetGroundBody();

    bodyDef = new b2BodyDef;
    fixDef  = new b2FixtureDef;
    fixDef.density = 300.0;
    fixDef.friction = 0.3;
    fixDef.restitution = 0.5;

    if(debugFlag) {
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugCanvas.getContext('2d'));
        debugDraw.SetDrawScale(SCALE);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
    } else {
        debugCanvas.style.display = 'none';
    }
}

function initMain() {
    letterObj = createLetterObj(letters);

    groundManager = new GroundManager();
    actorManager = new ActorManager();
    sceneManager = new SceneManager();

    groundManager.init();
    groundManager.appear();
    sceneManager.play();

    // Set Tick Listener
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
}
function tick() {
    actorManager.update();
    stage.update();
    world.Step(1 / 60, 10, 10);
    world.ClearForces();
    world.DrawDebugData();
}
function createLetterObj(_list) {
    var _obj = {}, _str;
    for(var _i=0, _l=_list.length; _i<_l; _i++) {
        _str = _list[_i];
        _obj[_str] = createLetter(_str);
    }
    return _obj;
}

function createLetter(_str) {
    // var _container = new createjs.Container();
    var _text;
    _text = new createjs.Text(_str, "100px Helvetica", "#333333");
    // _text.x = 0;
    // _text.y = 0;
    // _text.shadow = new createjs.Shadow("#ff0000", 0, 0, 6);
    // _text.shadow = new createjs.Shadow("#000000", 5, 5, 10);
    // _text.outline = true;
    // _text.textAlign = "center";
    // _text.textBaseline = "middle";
    // _container.addChild(_text);
    _text.regX =_text.getMeasuredWidth()/2;
    _text.regY = _text.getMeasuredHeight()/2;
    _text.cache(0, 0, _text.getMeasuredWidth(), _text.getMeasuredHeight());
    return _text;
}
/*  */
function resizeCanvas(){
    displayWidth = window.innerWidth;
    displayHeight = window.innerHeight;
    drawCanvas.width = displayWidth;
    drawCanvas.height = displayHeight;
    debugCanvas.width = displayWidth;
    debugCanvas.height = displayHeight;
}



function GroundManager(){}
GroundManager.prototype = {
    body: null,
    skin: null,
    width: displayWidth,
    height: displayHeight/6,
    init: function(){

        /*Creat Ground Body */
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape();

        // Left Wall (static)
        fixDef.shape.SetAsBox(2/SCALE, displayHeight/SCALE/2);
        bodyDef.position.Set(1/SCALE, displayHeight/SCALE/2);
        world.CreateBody(bodyDef).CreateFixture(fixDef);

        // Right Wall (static)
        fixDef.shape.SetAsBox(2/SCALE, displayHeight/SCALE/2);
        bodyDef.position.Set((displayWidth-1)/SCALE, displayHeight/SCALE/2);
        world.CreateBody(bodyDef).CreateFixture(fixDef);

        // Ground (static but movable)
        fixDef.shape.SetAsBox(this.width/SCALE/2, this.height/SCALE/2);
        bodyDef.position.Set(displayWidth/SCALE/2, (displayHeight+this.height)/SCALE);
        this.body = world.CreateBody(bodyDef);
        this.body.CreateFixture(fixDef);

        this.skin = new createjs.Shape(new createjs.Graphics().beginFill("#BF0000").drawRect(0, 0, this.width, this.height));
        stage.addChild(this.skin);
    },
    appear: function(){
        var $this = this;

        // Transition position
        var transitionPos = {
            y: displayHeight
        };
        createjs.Tween.get(transitionPos)
            .to({ y : displayHeight - this.height }, 500, createjs.Ease.quadInOut)
            .addEventListener('change', function(event){
                $this.skin.y = transitionPos.y;
                $this.body.SetPosition(new b2Vec2(displayWidth/SCALE/2, (transitionPos.y+$this.height/2)/SCALE));
            });

    },
    dismiss: function(){
        var $this = this;

        // Transition position
        var transitionPos = {
            x: 0
        };
        createjs.Tween.get(transitionPos)
            .to({ x : displayWidth*-1 }, 1000, createjs.Ease.quadInOut)
            .addEventListener('change', function(event){
                $this.skin.x = transitionPos.x;
                $this.body.SetPosition(new b2Vec2((transitionPos.x+displayWidth/2)/SCALE, (displayHeight-$this.height/2)/SCALE));
            });
    }
};

function Actor(){}
Actor.prototype = {
    body: null,
    skin: null,
    init: function(_str){
        this.skin = letterObj[_str].clone(true);

        bodyDef.type = b2Body.b2_dynamicBody;
        fixDef.shape = new b2PolygonShape();

        bodyDef.position.Set(Math.random() * displayWidth/SCALE, -5);
        bodyDef.angle = Math.random() * Math.PI;
        fixDef.shape.SetAsBox(
            this.skin.getMeasuredWidth()/SCALE/2,
            this.skin.getMeasuredHeight()/SCALE/2
        );

        this.body = world.CreateBody(bodyDef);
        this.body.CreateFixture(fixDef);
        this.update();
        stage.addChild(this.skin);
    },
    update: function(){
        this.skin.rotation = this.body.GetAngle() * (180 / Math.PI);
        // this.skin.x = this.body.GetPosition().x * SCALE;
        // this.skin.y = this.body.GetPosition().y * SCALE;
        this.skin.x = this.body.GetWorldCenter().x * SCALE;
        this.skin.y = this.body.GetWorldCenter().y * SCALE;
    }
}

function ActorManager(){}
ActorManager.prototype = {
    list: [],
    add: function(_actor){
        this.list.push(_actor);
    },
    update: function(){
        var _list = this.list;
        for(var _i=0, _l=_list.length; _i<_l; _i++){
            _list[_i].update();
        }
    }
};


function SceneManager(){}
SceneManager.prototype = {
    pointer: 0,
    play: function(){
        this.scene[this.pointer]();
    },
    flush: function(){

    },
    scene: [

        // Scene 1
        function(){
            var setting = [
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "N", x: 100, y: 100 },
                { letter: "A", x: 200, y: 100 },
                { letter: "O", x: 300, y: 100 },
                { letter: "K", x: 400, y: 100 },
                { letter: "I", x: 500, y: 100 },
                { letter: "U", x: 700, y: 100 },
                { letter: "E", x: 800, y: 100 },
                { letter: "N", x: 900, y: 100 },
                { letter: "O", x:1000, y: 100 }
            ];

            for(var _i=0, _l=setting.length; _i<_l; _i++){
                (function(){
                    var _obj = setting[_i];
                    setTimeout(function(){
                        var _actor = new Actor();
                        _actor.init(_obj.letter);
                        actorManager.add(_actor);
                    }, _i*150);
                })();
            }
        },

        // Scene 2
        function(){}
    ]
};




/* Movie Clip Test */
var mc;
function initMC() {
    createjs.Ticker.addEventListener("tick", stage);

    var mc = new createjs.MovieClip(null, 0, true, {start:20});
    stage.addChild(mc);

    var child1 = new createjs.Shape(
        new createjs.Graphics().beginFill("#999999").drawCircle(30,30,30)
    );
    child1.shadow = new createjs.Shadow("#000000", 5, 5, 10);

    var child2 = new createjs.Shape(
        new createjs.Graphics().beginFill("#5a9cfb").drawCircle(30,30,30)
    );
    child2.shadow = new createjs.Shadow("#000000", 5, 5, 10);

    mc.timeline.addTween(
        createjs.Tween.get(child1)
            .to({x:0, alpha:1})
            .to({x:60,alpha:0}, 50)
            .to({x:0, alpha:1}, 50)
        );
    mc.timeline.addTween(
        createjs.Tween.get(child1)
            .to({y:0})
            .to({y:60}, 50, createjs.Ease.bounceIn)
            .to({y:0}, 50, createjs.Ease.circOut)
        );
    mc.timeline.addTween(
        createjs.Tween.get(child2)
            .to({x:60, alpha:0})
            .to({x:0,  alpha:1}, 50)
            .to({x:60, alpha:0}, 50)
        );

    mc.gotoAndPlay("start");
}

})(jQuery);

