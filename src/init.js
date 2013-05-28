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
var b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
var b2MouseJointDef    = Box2D.Dynamics.Joints.b2MouseJointDef;
var b2ContactListener  = Box2D.Dynamics.b2ContactListener;


/* Global Variables For Box2d */
var drawCanvas = document.getElementById('drawCanvas');
var debugCanvas = document.getElementById('debugCanvas');
var debugFlag = false;
var SCALE = 32; // how many pixels pwe meter
var PRESEN_WIDTH = 1100;
var PRESEN_HEIGHT = 500;
var DIFF_LEFT;
var DIFF_TOP;
var world;
var groundBody;
var bodyDef;
var fixDef;
var displayWidth;
var displayHeight;

/* Global Variables for CreatJS */
var stage = new createjs.Stage(drawCanvas);
var svgLogo = $('#logo');

/* Managers */
var groundManager;
var actorManager;
var sceneManager;

/* Assets */
var assets = new createjs.LoadQueue();
assets.useXHR = false;
assets.loadManifest([
     { id: 'myPortrait', src: './src/img/myself.png'},
     { id: 'logoHTML5', src: './src/img/HTML5.png'},
     { id: 'logoCSS3', src: './src/img/CSS3.png'},
     { id: 'logoJS', src: './src/img/JS.png'},
     { id: 'music', src: './src/img/music.jpg'},
     { id: 'seattle', src: './src/img/seattle.jpg'}
 ]);

/* Events */
$(window).on('resize', resizeCanvas).resize();
$(document).ready(function(){ // $(window).on('load', function(){
    init();
});
$(document).on('keydown', function(e){
    if (e.which == 13) {
        sceneManager.pointer++;
        sceneManager.play();
    }
}).on('click', function(){
    sceneManager.pointer++;
    sceneManager.play();
});


/* Initilization */
function init() {

    // Create Box2d world
    world = new b2World(
        new b2Vec2(0, 10),
        true
    );

    groundBody = world.GetGroundBody();

    // Set Basic Body & Fixture Definition
    bodyDef = new b2BodyDef;
    fixDef  = new b2FixtureDef;
    fixDef.density = 300.0;
    fixDef.friction = 0.3;
    fixDef.restitution = 0.5;

    // Set Debug Canvas
    if(debugFlag) {
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugCanvas.getContext('2d'));
        debugDraw.SetDrawScale(SCALE);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_aabbBit | b2DebugDraw.e_pairBit | b2DebugDraw.e_centerOfMassBit | b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
    } else {
        debugCanvas.style.display = 'none';
    }

    // Instantiate Conrtol Managers
    groundManager = new GroundManager();
    actorManager = new ActorManager();
    sceneManager = new SceneManager();

    // Set Motion Guide
    createjs.MotionGuidePlugin.install();

    // Set Tick Listener
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
}

/* Loops for CreateJS & Box2d */
function tick() {
    actorManager.update();
    stage.update();
    world.Step(1 / 60, 10, 10);
    world.ClearForces();
    world.DrawDebugData();
}


function createLetter(_str) {
    // var _container = new createjs.Container();
    var _text;
    _text = new createjs.Text(_str, "80px Merriweather Sans", "#333333");
    // _text.outline = true;
    // _text.textAlign = "center";
    // _text.textBaseline = "middle";
    // _container.addChild(_text);
    _text.regX =_text.getMeasuredWidth()/2;
    _text.regY = _text.getMeasuredHeight()/2;
    _text.cache(0, 0, _text.getMeasuredWidth(), _text.getMeasuredHeight());
    return _text;
}
/* Resize Canvas Sizes (not adjusted. Please refresh the page after you resize.) */
function resizeCanvas(){
    displayWidth = window.innerWidth;
    displayHeight = window.innerHeight;
    drawCanvas.width = displayWidth;
    drawCanvas.height = displayHeight;
    debugCanvas.width = displayWidth;
    debugCanvas.height = displayHeight;

    DIFF_LEFT = (displayWidth - PRESEN_WIDTH)/2;
    DIFF_TOP = (displayHeight - PRESEN_HEIGHT)/2;
}
function posX(_num){
    return _num + DIFF_LEFT;
}
function posY(_num){
    return _num + DIFF_TOP;
}


/* Manager for Physics Ground */
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
        this.skin.x = 0;
        this.skin.y = displayHeight;
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


/* Class for Physics Actors */
function Actor(){}
Actor.prototype = {
    body: null,
    skin: null,
    init: function(_obj){
        $.extend(this, _obj);
        this.skin = createLetter(this.letter);

        bodyDef.type = b2Body.b2_dynamicBody;
        fixDef.shape = new b2PolygonShape();

        bodyDef.position.Set(Math.random() * (displayWidth-50)/SCALE+50/SCALE, -5);
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

        if(displayHeight+100 < this.skin.y) {
            actorManager.destroyList.push(this);
        }
    }
};

/* Class for Physics Actors */
function Actor2(){}
Actor2.prototype = {
    body: null,
    skin: null,
    init: function(_obj){
        $.extend(this, _obj);
        this.skin = createLetter(this.letter);
        this.skin.alpha = 0;

        bodyDef.type = b2Body.b2_dynamicBody;
        fixDef.shape = new b2PolygonShape();

        bodyDef.position.Set(this.x/SCALE, this.y/SCALE);
        bodyDef.awake = false;
        bodyDef.angle = 0;
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
        this.skin.x = this.body.GetWorldCenter().x * SCALE;
        this.skin.y = this.body.GetWorldCenter().y * SCALE;

        if(displayHeight+100 < this.skin.y) {
            actorManager.destroyList.push(this);
        }
    }
};

/* Manager for Actors */
function ActorManager(){}
ActorManager.prototype = {
    list: [],
    destroyList: [],
    add: function(_actor){
        this.list.push(_actor);
    },
    leash: function(_optionObj){
        var _list = this.list;


        // Overwrite the setting
        if(_optionObj) {
            var _modifiedList = [];
            $.each(_optionObj, function(index, item){
                var _temp = _list[item.index];
                _temp.x = item.x;
                _temp.y = item.y;
                _modifiedList.push(_temp);
            });
            _list = _modifiedList;

        }

        $.each(_list, function(index, _actor){
        
            _actor.jointDef = new b2DistanceJointDef();
            _actor.jointDef.collideConnected = true;

            var worldpoint = this.body.GetWorldPoint(new b2Vec2(this.body.GetLocalCenter().x, this.body.GetLocalCenter().y-20/SCALE))
            _actor.jointDef.Initialize(
                groundBody,
                _actor.body,
                new b2Vec2(_actor.x/SCALE, _actor.y/SCALE),
                new b2Vec2(worldpoint.x, worldpoint.y)
            );
            _actor.joint = world.CreateJoint(_actor.jointDef);
            
            setTimeout(function(){
                var _jointObj = { length : _actor.joint.GetLength() };
                createjs.Tween.get(_jointObj)
                    .to({ length : 0 }, 1000, createjs.Ease.quadInOut)
                    .addEventListener('change', function(event){
                        _actor.joint.SetLength(_jointObj.length);
                    });
                _actor.body.SetAwake(true);
            }, index*150);

        });
    },
    unleash: function(){
        $.each(this.list, function(index, _actor){
            _actor.body.SetAwake(false);
            _actor.body.SetAwake(true);
            if(_actor.joint){
                world.DestroyJoint(_actor.joint);
                _actor.joint = null;
            }
        });
    },
    update: function(){
        var _list = this.list;
        for(var _i=0, _l=_list.length; _i<_l; _i++){
            _list[_i].update();
        }
        var _destroyList = this.destroyList;
        for(var _i=0, _l=_destroyList.length; _i<_l; _i++){
            var _destroyBody = this.destroyList.shift();
            stage.removeChild(_destroyBody.skin);
            world.DestroyBody(_destroyBody.body);
            _list.splice(_list.indexOf(_destroyBody), 1);
            _destroyBody = null;
        }
    }
};


var myPortrait, imgMusic, imgSeattle;
var text01, text02;
var logoHTML5, logoCSS3, logoJS;
var mc, heart, heartTween;

/* Manager for Scene Transitions */
function SceneManager(){}
SceneManager.prototype = {
    pointer: -1,
    play: function(){
        this.scene[this.pointer]();
    },
    flush: function(){

    },
    scene: [
        // Scene 0
        function(){
            alert('ready');
        },

        // Scene 1
        function(){
            svgLogo.addClass('zoomup');
            setTimeout(function(){
                svgLogo.hide();
                sceneManager.pointer++;
                sceneManager.play();
            }, 2500);
        },

        // Scene 2
        function(){
            groundManager.init();
            groundManager.appear();

            var setting = [
                { letter: "N", x: posX(400), y: posY(0) },
                { letter: "A", x: posX(530), y: posY(0) },
                { letter: "O", x: posX(660), y: posY(0) },
                { letter: "K", x: posX(790), y: posY(0) },
                { letter: "I", x: posX(920), y: posY(0) },
                { letter: "U", x: posX(580), y: posY(120) },
                { letter: "E", x: posX(710), y: posY(120) },
                { letter: "N", x: posX(840), y: posY(120) },
                { letter: "O", x: posX(970), y: posY(120) },
            ];

            for(var _i=0, _l=setting.length; _i<_l; _i++){
                (function(){
                    var _obj = setting[_i];
                    setTimeout(function(){
                        var _actor = new Actor();
                        _actor.init(_obj);
                        actorManager.add(_actor);
                    }, _i*250);
                })();
            }
        },

        // Scene 3
        function(){
            myPortrait = new createjs.Bitmap(
                assets.getResult('myPortrait')
            ).set({ x:posX(-60), y:posY(-40), alpha:0 });

            stage.addChildAt(myPortrait, 0);
            createjs.Tween.get(myPortrait)
                .to({ alpha : 1 }, 1000, createjs.Ease.quadOut);

            actorManager.leash();
        },

        // Scene 4
        function(){
            text01 = new createjs.Text('from Tokyo',  "60px Merriweather Sans", "#333333")
                .set({ x : posX(540), y : posY(260), alpha : 0 });
            
            text02 = new createjs.Text('April 7th, 1983',  "60px Merriweather Sans", "#333333")
                .set({ x : posX(540), y : posY(340), alpha : 0 });

            stage.addChildAt(text01);
            stage.addChildAt(text02);

            createjs.Tween.get(text01)
                .to({ alpha : 1 }, 1000, createjs.Ease.quadOut);

            createjs.Tween.get(text02)
                .to({ alpha : 1 }, 1000, createjs.Ease.quadOut);
        },

        // Scene 5
        function(){
            createjs.Tween.get(myPortrait)
                .to({ alpha : 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(myPortrait);
                });
            createjs.Tween.get(text01)
                .to({ alpha : 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(text01);
                });
            createjs.Tween.get(text02)
                .to({ alpha : 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(text02);
                });
            actorManager.unleash();
        },

        // Scene 6
        function(){
            var setting = [
                { letter: 'H', x: posX(60), y: posY(30) },
                { letter: 'T', x: posX(150), y: posY(30) },
                { letter: 'M', x: posX(250), y: posY(30) },
                { letter: 'L', x: posX(350), y: posY(30) },
                { letter: 'C', x: posX(750), y: posY(30) },
                { letter: 'S', x: posX(830), y: posY(30) },
                { letter: 'S', x: posX(910), y: posY(30) },
                { letter: 'J', x: posX(380), y: posY(180) },
                { letter: 'S', x: posX(450), y: posY(180) },
            ];

            logoHTML5 = new createjs.Bitmap(
                assets.getResult('logoHTML5')
            ).set({ x:posX(PRESEN_WIDTH/2), y:posY(PRESEN_HEIGHT/2), regX: 138, regY: 138, scaleX : 0, scaleY : 0 });
            
            logoCSS3 = new createjs.Bitmap(
                assets.getResult('logoCSS3')
            ).set({ x:posX(PRESEN_WIDTH/2), y:posY(PRESEN_HEIGHT/2), regX: 138, regY: 138, scaleX : 0, scaleY : 0 });

            logoJS = new createjs.Bitmap(
                assets.getResult('logoJS')
            ).set({ x:posX(PRESEN_WIDTH/2), y:posY(PRESEN_HEIGHT/2), regX: 138, regY: 138, scaleX : 0, scaleY : 0 });

            stage.addChildAt(logoHTML5);
            stage.addChildAt(logoCSS3);
            stage.addChildAt(logoJS);

            createjs.Tween.get(logoHTML5)
                .to({ x:posX(450), y:posY(20), scaleX : 0.5, scaleY : 0.5 }, 1000, createjs.Ease.quadOut);

            createjs.Tween.get(logoCSS3)
                .to({ x:posX(650), y:posY(20), scaleX : 0.5, scaleY : 0.5 }, 1000, createjs.Ease.quadOut);

            createjs.Tween.get(logoJS)
                .to({ x:posX(550), y:posY(200), scaleX : 0.5, scaleY : 0.5 }, 1000, createjs.Ease.quadOut)
                .call(function(){

                    for(var _i=0, _l=setting.length; _i<_l; _i++){
                        (function(){
                            var _obj = setting[_i];
                            var _actor = new Actor2();
                            _actor.init(_obj);
                            actorManager.add(_actor);
                            createjs.Tween.get(_actor.skin)
                                .to({ alpha:1 }, 1000, createjs.Ease.quadOut);
                        })();
                    }

                });
        },

        // Scene 7
        function(){
            var setting = [
                { letter: 'I', x: posX(300), y: posY(75) },
                { letter: 'G', x: posX(740), y: posY(75) }
            ];

            createjs.Tween.get(logoHTML5)
                .to({ alpha : 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(logoHTML5);
                });
            createjs.Tween.get(logoCSS3)
                .to({ alpha : 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(logoCSS3);
                });
            createjs.Tween.get(logoJS)
                .to({ alpha : 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(logoJS);
                });
            
            for(var _i=0, _l=setting.length; _i<_l; _i++){
                (function(){
                    var _obj = setting[_i];
                    var _actor = new Actor();
                    _actor.init(_obj);
                    actorManager.add(_actor);
                })();
            }

            actorManager.unleash();
        },

        // Scene 8
        function(){

            mc = new createjs.MovieClip(null, 0, true, { start: 0 }); // Label(start)
            stage.addChild(mc);
            var _g = new createjs.Graphics();
            _g.beginFill("#f7bdfc");
            _g.moveTo(75, 40);
            _g.bezierCurveTo(75,37,70,25,50,25);
            _g.bezierCurveTo(20,25,20,62.5,20,62.5);
            _g.bezierCurveTo(20,80,40,102,75,120);
            _g.bezierCurveTo(110,102,130,80,130,62.5);
            _g.bezierCurveTo(130,62.5,130,25,100,25);
            _g.bezierCurveTo(85,25,75,37,75,40);
            _g.endFill();

            heart = new createjs.Shape(_g).set({ x:posX(1000), y:-200, regX: 75, regY: 75 });
            heartTween = createjs.Tween.get(heart)
                .to({ scaleX: 0.7, scaleY: 0.7 })
                .to({ scaleX: 1, scaleY: 1 }, 40)
            
            mc.timeline.addTween(heartTween);
                
            createjs.Tween.get(heart)
                .to({ guide:{ path: [posX(1000), -200, posX(750), posY(50), posX(300), posY(100)] }},
                1000,  createjs.Ease.backOut).call(function(){
                    sceneManager.pointer++;
                    sceneManager.play();
                });

            mc.gotoAndPlay("start");
        },

        // Scene 9
        function(){
            var setting = [
                { index: 4, x: posX(200), y: posY(75) },
                { index: 11, x: posX(420), y: posY(75) },
                { index: 5, x: posX(530), y: posY(75) },
                { index: 14, x: posX(640), y: posY(75) },
                { index: 18, x: posX(750), y: posY(75) },
                { index: 13, x: posX(860), y: posY(75) }
            ];
            actorManager.leash(setting);
        },

        // Scene 10
        function(){
            imgMusic = new createjs.Bitmap(
                assets.getResult('music')
            ).set({ x:posX(PRESEN_WIDTH/2+100), y: -200, regX: posX(800), regY: 0, alpha:0 });
            stage.addChildAt(imgMusic, 0);

            createjs.Tween.get(imgMusic)
                .to({ alpha: 1 }, 1000, createjs.Ease.quadOut);
        },

        // Scene 11
        function(){
            createjs.Tween.get(imgMusic)
                .to({ alpha: 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(imgMusic);
                    imgMusic = null;
                });

            var setting = [
                { index: 4, x: posX(200), y: posY(75) },
                { index: 6, x: posX(420), y: posY(75) },
                { index: 0, x: posX(530), y: posY(75) },
                { index: 19, x: posX(640), y: posY(75) },
                { index: 12, x: posX(750), y: posY(75) },
                { index: 18, x: posX(860), y: posY(75) },
                { index: 15, x: posX(970), y: posY(75) },
                { index: 9, x: posX(1080), y: posY(75) }
            ];

            actorManager.unleash();
            setTimeout(function(){
                actorManager.leash(setting);
            }, 2000);
        },

        // Scene 12
        function(){
            imgSeattle = new createjs.Bitmap(
                assets.getResult('seattle')
            ).set({ x:posX(PRESEN_WIDTH/2+200), y: 0, regX: posX(840), regY: 0, alpha:0 });
            stage.addChildAt(imgSeattle, 0);

            createjs.Tween.get(imgSeattle)
                .to({ alpha: 1 }, 1000, createjs.Ease.quadOut);
        },

        // Scene 13
        function(){
            createjs.Tween.get(imgSeattle)
                .to({ alpha: 0 }, 1000, createjs.Ease.quadOut).call(function(){
                    stage.removeChild(imgSeattle);
                    imgSeattle = null;
                });

            actorManager.unleash();
            groundManager.dismiss();
            setTimeout(function(){
                createjs.Tween.get(heart)
                    .to({ x: -200, y: posX(200) }, 1000, createjs.Ease.backIn).call(function(){
                        stage.removeChild(heart);
                    });
            }, 1000);
        },

        // Scene 14
        function(){
            var _actor = new Actor2();
            _actor.init({ letter: 'Thank you for your attention!', x: posX(550), y: posY(250) });
            actorManager.add(_actor);
            createjs.Tween.get(_actor.skin)
                .to({ alpha:1 }, 1000, createjs.Ease.quadOut);
        },

        // Scene 15
        function(){
            var _actor = new Actor2();
            _actor.init({ letter: 'Nice to meet you!', x: posX(550), y: -100 });
            actorManager.add(_actor);
            _actor.skin.alpha = 1;
            // this.body.SetAngle();
            // this.skin.rotation = this.body.GetAngle() * (180 / Math.PI);
            _actor.body.SetAwake(true);

            var myListener = new b2ContactListener();
            myListener.EndContact = function(_contact){

                var _body = _contact.GetFixtureA().GetBody();
                setTimeout(function(){
                    _body.SetAwake(false);
                }, 500);
            };
            world.SetContactListener(myListener);
        },

        // Scene Last
        function(){
            actorManager.unleash();

            setTimeout(function(){
                svgLogo.show();
                svgLogo.removeClass('zoomup');
            }, 2500);            
            
            setTimeout(function(){
                var softwareText = new createjs.Text('Powered by CreateJS & box2dweb',  "40px Merriweather Sans", "#333333")
                    .set({ x : posX(PRESEN_WIDTH/2-50), y : posY(PRESEN_HEIGHT), alpha : 0 });
                
                stage.addChildAt(softwareText);

                createjs.Tween.get(softwareText)
                    .to({ alpha : 1 }, 1000, createjs.Ease.quadOut);
            }, 5000);
        }
    ]
};

})(jQuery);

