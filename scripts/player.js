import {
  Vector3,
  Vector2,
  SpotLight,
  Object3D,
  MeshBasicMaterial,
  BoxGeometry,
  Mesh
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
    this.resistance = 0.95;

    this.model = new Object3D();

    let whiteMaterial = new MeshBasicMaterial({color: 0xFFFFFF});
    let redMaterial = new MeshBasicMaterial({color: 0xFF0073});
    
    const tirePositions = [];

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
    
    tirePositions.push(new Vector3(-0.075,0,0.1));
    tirePositions.push(new Vector3(0.075,0,0.1));
    tirePositions.push(new Vector3(-0.075,0,-0.1));
    tirePositions.push(new Vector3(0.075,0,-0.1));
    
    this.trail = new Trail(tirePositions);

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
    
    const trailLength = Math.floor(this.velocity * -13.157894737 * 100) / 10;
  
    this.trail.update(game.engine.deltaTime, trailLength, this.model);
  }

}


class Trail extends Object3D {
  constructor(tirePositions) {
    super();
    
    this.tirePositions = tirePositions;
    
    this.items = [];
  }
  
  update(delta, len, model) {
    let i = this.items.length;
    
    while (i--) {
      const item = this.items[i];
      
      if (item.elapsed >= item.ttl) {
        this.remove(item.mesh);
        this.items.splice(i, 1);
      } else {
        item.update(delta);
      }
    }
    
    if (!this.items.length < len * 4) {
      this.tirePositions.forEach(tirePosition => {
        const item = new TrailItem(model.position.clone().add(tirePosition.clone().applyQuaternion(model.quaternion)));
        this.add(item.mesh);
        this.items.push(item)
      });
    }
  }
}

class TrailItem {
  constructor(pos) {
    this.ttl = 400;
    this.elapsed = 0;
    
    const geometry = new BoxGeometry(0.01, 0.01, 0.01);
    const material = new MeshBasicMaterial({ color: '#fff' });
    material.transparent = true;
    
    this.mesh = new Mesh(geometry, material);
    
    this.mesh.position.copy(pos);
  }
  
  update(delta) {
    this.elapsed += delta;
    
    this.mesh.material.opacity = 1 - this.elapsed / this.ttl;
  }
}