import {
  Vector3,
  Vector2,
  SpotLight,
  Object3D,
  MeshBasicMaterial
} from 'three';

export default class Player {

  constructor(model) {

    this.width = 50;
    this.height = 100;
    this.acceleration = 0.004;
    this.rotationalAcceleration = 0.04;
    this.position = new Vector2();
    this.velocity = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.angle = 0;
    this.cameraAngle = this.angle;
    this.resistance = 0.95;

    this.model = new Object3D();

    let whiteMaterial = new MeshBasicMaterial({color: 0xFFFFFF});
    let redMaterial = new MeshBasicMaterial({color: 0xFF0073});

    model.scale.set(0.001, 0.001, 0.001);

    model.children.forEach(mesh => {
      if(
        mesh.name === 'DeLorean DeLorean01' || //windows
        mesh.name === 'DeLorean DeLorean02' || //front lights
        mesh.name === 'DeLorean DeLorean11' || //front tires
        mesh.name === 'DeLorean DeLorean12' //backtires
      ){
        mesh.material = whiteMaterial;
      }

      if(mesh.name === 'DeLorean DeLorean14') {
        mesh.material = redMaterial;
      }
    });

    let lightTargetLeft = new Object3D();
    model.add(lightTargetLeft);
    lightTargetLeft.position.set(-50, 0, -400);

    let spotLightLeft = new SpotLight( 0xffffff );
    spotLightLeft.angle = 0.5;
    spotLightLeft.castShadow = true;
    model.add(spotLightLeft);
    spotLightLeft.position.set(-50, 100, -180);
    spotLightLeft.target = lightTargetLeft;

    let lightTargetRight = new Object3D();
    model.add(lightTargetRight);
    lightTargetRight.position.set(50, 0, -400);

    let spotLightRight = new SpotLight( 0xffffff );
    spotLightRight.angle = 0.5;
    model.add(spotLightRight);
    spotLightRight.position.set(50, 100, -180);
    spotLightRight.target = lightTargetRight;

    //this.spotLight.position.set(0,100,100);
    //this.spotLight.target.position.add(new Vector3(0, 100, 200));
    //spotLight.castShadow = true;
    //spotLight.shadow.mapSize.width = 1024;
    //spotLight.shadow.mapSize.height = 1024;
    //spotLight.shadow.camera.near = 500;
    //spotLight.shadow.camera.far = 4000;
    //spotLight.shadow.camera.fov = 30;

    this.model.add(model);

  }

  update(game) {

    let acc = 0;

    const { controller } = game;
    const control = controller.controllers[0];

    if(controller.type === 'keyboard' || controller.type === 'touch') {

      this.velocity += control.dir.y * this.acceleration;
      acc += control.dir.y * this.acceleration;
      this.angle += control.dir.x * this.rotationalAcceleration * this.velocity;

    }

    this.model.rotation.y += this.angle;

    this.vz += Math.cos(this.model.rotation.y) * acc;
    this.vx += Math.sin(this.model.rotation.y) * acc;

    this.model.position.add(new Vector3(this.vx, this.vy, this.vz));

    this.vx *= this.resistance;
    this.vz *= this.resistance;
    this.velocity *= this.resistance;

    this.angle *= this.resistance;

    this.cameraAngle += (this.angle - this.cameraAngle) * 0.9;

  }

}
