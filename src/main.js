(function() {
   var b2Vec2         = Box2D.Common.Math.b2Vec2; // ベクトル
   var b2BodyDef      = Box2D.Dynamics.b2BodyDef;
   var b2Body         = Box2D.Dynamics.b2Body;
   var b2FixtureDef   = Box2D.Dynamics.b2FixtureDef;
   var b2Fixture      = Box2D.Dynamics.b2Fixture;
   var b2World        = Box2D.Dynamics.b2World;
   var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
   var b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape;
   var b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;


   var b2Settings         = Box2D.Common.b2Settings;
   var b2Transform        = Box2D.Common.Math.b2Transform;
   var b2Mat22            = Box2D.Common.Math.b2Mat22;
   var b2AABB             = Box2D.Collision.b2AABB;
   var b2MassData         = Box2D.Collision.Shapes.b2MassData;
   var b2FilterData       = Box2D.Dynamics.b2FilterData;
   var b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
   var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
   var b2MouseJointDef    = Box2D.Dynamics.Joints.b2MouseJointDef;


   var b2ContactListener     = Box2D.Dynamics.b2ContactListener;
   var b2DestructionListener = Box2D.Dynamics.b2DestructionListener;



      // var debugDraw = new Box2D.Dynamics.b2DebugDraw;
      // debugDraw.SetSprite(document.getElementById("debugCanvas").getContext("2d"));

      // var myListener = new Box2D.Dynamics.b2DestructionListener;
      // myListener.SayGoodbyeFixture = function(fixture) {
      //    alert("goodbye fixture ...");
      // }
      // world.SetDestructionListener(myListener);

      // worldを作成
      var world = new b2World(
         new b2Vec2(0, 10), //gravity 10=9.81
         true // enable to sleep
      );

      var physScale = 32; //表示のスケール(1メートル、何pixelか?)
      var width = 500; // 表示領域幅の定義
      var height = 500; // 表示領域高の定義

      // 存在物定義用変数の作成
      var fixDef = new b2FixtureDef;              //Box2D.Dynamics.b2FixtureDefを作成
      fixDef.density = 1.0;                       //密度 [kg/m^2]
      fixDef.friction = 0.5;                      //摩擦係数、通常は0～1
      fixDef.restitution = 0.4;                   //反発係数、通常は0～1

      //ボディ定義用変数の作成
      var bodyDef = new b2BodyDef;                //Box2D.Dynamics.b2BodyDef

      // 周囲の壁となる物体を作成
      bodyDef.type = b2Body.b2_staticBody;        //Box2D.Dynamics.b2Body.b2_staticBody(静的ボディ)を設定
      fixDef.shape = new b2PolygonShape;          //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成

      fixDef.shape.SetAsBox(width/physScale/2+2,2); //ポリゴンを箱として作成
      bodyDef.position.Set(width/physScale/2,height/physScale+1.8); //静的ボディを配置
      world.CreateBody(bodyDef).CreateFixture(fixDef); //worldに以上のポリゴンを作成

      bodyDef.position.Set(width/physScale/2,-1.8); //静的ボディを配置           
      world.CreateBody(bodyDef).CreateFixture(fixDef); //worldに以上のポリゴンを作成

      fixDef.shape.SetAsBox(2,height/physScale/2); //ポリゴンを箱として作成
      bodyDef.position.Set(-1.8,height/physScale/2); //静的ボディを配置
      world.CreateBody(bodyDef).CreateFixture(fixDef); //worldに以上のポリゴンを作成

      bodyDef.position.Set(width/physScale+1.8,height/physScale/2); //静的ボディを配置
      world.CreateBody(bodyDef).CreateFixture(fixDef); //worldに以上のポリゴンを作成

      // 物体作成
      function makeBody(x, y) {
         fixDef.filter = new b2FilterData(); // Filterは衝突するオブジェクトを分類。正数のグループは衝突あり、負数はなし。
         // fixDef.filter.groupIndex = -2;   // 
         /*if (Math.random() > 0.5) {              //50%の確率で箱か円を作るかを分岐

            fixDef.shape = new b2PolygonShape;  //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成
            fixDef.shape.SetAsBox(      //ポリゴンを箱として作成     
                Math.random() + 0.3             //0~1.0+0.1サイズ(小さすぎる箱は作らない)
                , Math.random() + 0.3           //0~1.0+0.1サイズ(小さすぎる箱は作らない)
            );

            // fixDef.shape = new b2PolygonShape;  //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成
            // fixDef.shape.SetAsOrientedBox(      //ポリゴンを箱として作成     
            //     Math.random() + 0.1             //0~1.0+0.1サイズ(小さすぎる箱は作らない)
            //     , Math.random() + 0.1           //0~1.0+0.1サイズ(小さすぎる箱は作らない)
            //     , new b2Vec2(0, 0)              //中心位置を指定
            //     , Math.random() * Math.PI       //回転角の指定
            // );

   
            // fixDef.shape = new b2PolygonShape;  //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成
            // fixDef.shape.SetAsEdge(
            //    new b2Vec2(0, 0),
            //    new b2Vec2((Math.random() -0.5)*2, (Math.random() - 0.5)*2)
            // );

         } else {
            fixDef.shape = new b2CircleShape(   //Box2D.Collision.Shapes.b2CircleShape(円)を作成
              Math.random() + 0.3                 //半径0~1.0+0.1サイズ(小さすぎる円は作らない)
            );

            // fixDef.shape = new b2PolygonShape;  //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成
            // fixDef.shape.SetAsVector([
            //    new b2Vec2(0, 0),
            //    new b2Vec2(Math.random() + 1, Math.random() + 1),
            //    new b2Vec2(Math.random(), Math.random()+2)
            // ], 3);
         }*/
         // bodyDef.type = b2Body.b2_kinematicBody;
         // bodyDef.fixedRotation = true;
         bodyDef.position.Set(x, y);
         // bodyDef.position.x = x;                 //作成x座標
         // bodyDef.position.y = y;                 //作成y座標
         // world.CreateBody(bodyDef).CreateFixture(fixDef); //worldに以上の物体を作成
         var testBody01 = world.CreateBody(bodyDef);
         // testBody01.SetAngle(10);
         // testBody01.SetAngularVelocity(10);
         // testBody01.SetLinearDamping(0.4); 
         // testBody01.SetLinearVelocity(new b2Vec2(Math.random()-0.5, -10));
         fixDef.density = 10.0; 
         fixDef.shape = new b2PolygonShape;  //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成
         fixDef.shape.SetAsArray([
             new b2Vec2(0, -1),
             new b2Vec2(0, 0),
             new b2Vec2(-1, 0.25)
         ], 3);
         testBody01.CreateFixture(fixDef);


         // bodyDef.type = b2Body.b2_staticBody;
         // bodyDef.position.Set(x+0.1, y);  
         // var testBody02 = world.CreateBody(bodyDef);
         fixDef.density = 1.0;
         fixDef.shape = new b2PolygonShape;  //Box2D.Collision.Shapes.b2PolygonShape(ポリゴン)を作成
         fixDef.shape.SetAsArray([
             new b2Vec2(0, -1),
             new b2Vec2(1, 0.25),
             new b2Vec2(0, 0)
         ], 3);
         testBody01.CreateFixture(fixDef);

         // testBody.SetTransform(
         //    new b2Transform(
         //       new b2Vec2(12, 1),
         //       new b2Mat22(
         //          new b2Vec2(0, 0),
         //          new b2Vec2(0, 0)
         //       )
         //    )
         // );

         // testBody.SetLinearVelocity(new b2Vec2( 1, 0 ))
         

         //ジョイントのテスト
         var groundBody = world.GetGroundBody();

         // console.log(testBody02.GetLocalCenter());
         // Joints のテスト
         // var dJointDef = new b2DistanceJointDef();
         // dJointDef.collideConnected = true;
         // dJointDef.dampingRatio = 1;
         // dJointDef.Initialize(
         //    groundBody,
         //    testBody01,
         //    new b2Vec2(6, 1),
         //    new b2Vec2(x, y)
         //    // testBody01.GetWorldCenter()
         // );
         // var dJoint = world.CreateJoint(dJointDef);

         // var rJointDef = new b2RevoluteJointDef();
         // rJointDef.Initialize(
         //    groundBody,
         //    testBody01,
         //    // groundBody.GetWorldCenter()
         //   new b2Vec2(x, y+Math.random()*1)
         // );
         // rJointDef.lowerAngle     = -0.5 * b2Settings.b2_pi; // -90 degrees
         // rJointDef.upperAngle     = 0.25 * b2Settings.b2_pi; // 45 degrees
         // rJointDef.enableLimit    = false;
         // rJointDef.maxMotorTorque = 120.0;
         // rJointDef.motorSpeed     = 100.0;
         // rJointDef.enableMotor    = true;

         // var rJoint = world.CreateJoint(rJointDef);
      }

      // いくつかの物体を作成
      bodyDef.type = b2Body.b2_dynamicBody;       //Box2D.Dynamics.b2Body.b2_dynamicBody(動的ボディ)を設定
      for (var i = 0; i < 10; ++i) {              //10個作るよ
         makeBody(Math.random() * 16, Math.random() * 10);
      }


      // Contactのテスト
      var myListener = new b2ContactListener();
      myListener.BeginContact = function(){
         //console.log('begin');
      };
      myListener.EndContact = function(){
         //console.log('end');
      };
      world.SetContactListener(myListener);
      // myListener.EndContact();
      // myListener.PostSolve();
      // myListener.PreSolve();


      // debug用表示の設定
      var debugDraw = new b2DebugDraw();          //Box2D.Dynamics.b2DebugDraw
      debugDraw.SetSprite(document.getElementById('debugCanvas').getContext('2d')); //canvas 2dのcontextを設定
      debugDraw.SetDrawScale(physScale);          //表示のスケール(1メートル、何pixelか?)
      debugDraw.SetFillAlpha(0.5);                //塗りつぶし透明度を0.5に
      debugDraw.SetLineThickness(1.0);            //lineの太さを1.0に
      debugDraw.SetFlags(b2DebugDraw.e_aabbBit | b2DebugDraw.e_pairBit | b2DebugDraw.e_centerOfMassBit | b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit); //シェイプとジョイントを表示、他に
      //e_aabbBit,e_pairBit,e_centerOfMassBit,e_controllerBitを設定可能
      world.SetDebugDraw(debugDraw);              //worldにdebug用表示の設定

      window.setInterval(update, 1000 / 60);      //updateコールバックとインターバル(1/60秒)を設定

      //mouseコントロール
      var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
      var pos = document.getElementById("debugCanvas").getBoundingClientRect();
      var html = document.documentElement;
      var body = document.body;
      var canvasPosition = { x: Math.round(pos.left + (body.scrollLeft || html.scrollLeft) - html.clientLeft), y: Math.round(pos.top + (body.scrollTop || html.scrollTop) - html.clientTop) };
      document.addEventListener("mousedown", function (e) {
         isMouseDown = true;
         handleMouseMove(e);
         document.addEventListener("mousemove", handleMouseMove, true);
      }, true);

      document.addEventListener("mouseup", function () {
         document.removeEventListener("mousemove", handleMouseMove, true);
         isMouseDown = false;
         mouseX = undefined;
         mouseY = undefined;
      }, true);

      function handleMouseMove(e) {
         var x = e.pageX;
         var y = e.pageY;
         mouseX = (x - canvasPosition.x) / physScale;
         mouseY = (y - canvasPosition.y) / physScale;
      };


      //mouseカーソルとボディの衝突を検知
      function getBodyAtMouse() {
         mousePVec = new b2Vec2(mouseX, mouseY); //mouseの位置をmousePVecに設定しておく
         var aabb = new b2AABB();
         aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
         aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001); //mouse位置を中心とした極小AABBを作成

         // Query the world for overlapping shapes.
         selectedBody = null;
         world.QueryAABB(getBodyCB, aabb);       //worldをmouse位置の極小AABBから検索してgetBodyCBを呼び出す
         return selectedBody;
      }

      function getBodyCB(fixture) {
        if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {//検索されたbodyはb2_staticBody(静的ボディ)では無い
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {//shapeの中にmousePVecが存在しているか?
               selectedBody = fixture.GetBody(); //selectedBodyにヒットしたボディをセット     
               return false;
            }
        }
        return true;
      }

      //update関数
      function update() {
         if (isMouseDown && (!mouseJoint)) {     //mouseボタンが押し下げられ、かつボディに拘束されていない
            var body = getBodyAtMouse();        //ボディとマウスカーソルの衝突を検出
            if (body) {                         //body発見
               //mouseとボディ間にmousejointを作成する
               var md = new b2MouseJointDef(); //Box2D.Dynamics.Joints.b2MouseJointDef
               md.bodyA = world.GetGroundBody(); //world全体のボディを設定
               md.bodyB = body;                //発見したボディ
               md.target.Set(mouseX, mouseY);  //ターゲットの位置はマウスカーソル
               md.collideConnected = true;     //衝突つきの拘束か
               md.maxForce = 300.0 * body.GetMass(); //ボディの重さ(body.GetMass())*300の力で引っ張る
               mouseJoint = world.CreateJoint(md); //worldにjointを設定
               body.SetAwake(true);            //ボディの計算を起動(sleep状態の解除)
            } else {
               if(mouseX>0 && mouseX<width/physScale && mouseY>0 && mouseY<physScale)
                  makeBody(mouseX, mouseY);       //物体か無ければ新しく作成
            }
         }


         if (mouseJoint) {                       //mouseはボディに拘束されている
            if (isMouseDown) {                  //ボタンを押し下げ中
               mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY)); //ターゲットの位置はマウスカーソル
            } else {                            //ボタンは押されてない
               world.DestroyJoint(mouseJoint); // jointを破棄
               mouseJoint = null;
            }
         }

         world.Step(1 / 60, 10, 10);             //worldの更新、経過時間1/60、速度計算の内部繰り返し回数10、位置計算の内部繰り返し回数10
         world.ClearForces();                    //全Step関数実行後に通常呼び出す関数
         world.DrawDebugData();                  //debug表示を行う
      };



      // var myListener = new Box2D.Dynamics.b2DestructionListener;
      // myListener.SayGoodbyeFixture = function(fixture) {
      //    alert("goodbye fixture ...");
      // }
      // world.SetDestructionListener(myListener);

})();