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
    
    this.trail = new Trail(model);

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
    
    this.getVelocityScalar = this.getVelocityScalar.bind(this);

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
  
    this.trail.update(game.engine.deltaTime, this.model);
  }
  
  getVelocityScalar(precision = 1000) {
    if (precision) {
      return Math.floor(Math.abs(this.velocity * 13.158) * precision) / precision;
    }
    
    return Math.abs(this.velocity * 13.158);
  }

}


class Trail extends Object3D {
  constructor(car) {
    super();
    
    this.car = car;
    
    this.maxLen = 25;
    
    this.tireFrontLeft = new Vector3(-0.075, 0, 0.1);
    this.tireFrontRight = new Vector3(0.075, 0, 0.1);
    this.tireRearLeft = new Vector3(-0.075, 0, -0.1);
    this.tireRearRight = new Vector3(0.075, 0, -0.1);
    
    this.brakeLightLeft = new Vector3(-0.05, 0.1, 0.25);
    this.brakeLightRight = new Vector3(0.05, 0.1, 0.25);
    
    this.trails = [
      { id: 'tireFrontLeftTrailCoords', name: 'tireFrontLeft' },
      { id: 'tireFrontRightTrailCoords', name: 'tireFrontRight' },
      { id: 'tireRearLeftTrailCoords', name: 'tireRearLeft' },
      { id: 'tireRearRightTrailCoords', name: 'tireRearRight' },
      { id: 'brakeLightLeftTrailCoords', name: 'brakeLightLeft' },
      { id: 'brakeLightRightTrailCoords', name: 'brakeLightRight' },
    ];
    
    this.trails.forEach(trail => {
      this[trail.id] = [];
    });
    
    this.update = this.update.bind(this);
    this.update = this.update.bind(this);
    this.addItem = this.addItem.bind(this);
    this.updateItems = this.updateItems.bind(this);
  }
  
  update(delta, target) {
    this.trails
      .forEach(trail => {
        if (this[trail.id].length <= this.maxLen) {
          const color = /brake/.test(trail.id) ? '#f00' : '#fff';
          
          this.addItem(trail.id, target, this[trail.name], color);
        }
        
        this.updateItems(trail.id, delta);
      });
  }
  
  updateItems(id, delta) {
    if (!this[id]) throw Error(`Trail has no trail named ${id}`);
    
    for (var i = this[id].length - 1; i >= 0; i--) {
      const item = this[id][i];
      
      item.update(delta);
    }
  }
  
  addItem(id, target, offset, color) {
    if (!this[id]) throw Error(`Trail has no items named ${id}`);
    
    const item = new TrailItem(target, offset, color);
    
    this.add(item.mesh);
    this[id].push(item);
  }
  
}

class TrailItem {
  constructor(target, offset, color) {
    this.ttl = 400;
    this.elapsed = 0;
    
    this.target = target;
    this.offset = offset;
    
    this.position = new Vector3();
    
    const geometry = new BoxGeometry(0.02, 0.01, 0.01);
    const material = new MeshBasicMaterial({ color });
    material.transparent = true;
    
    this.mesh = new Mesh(geometry, material);
    
    this.update = this.update.bind(this);
    this.reset = this.reset.bind(this);
    
    this.reset();
  }
  
  calcPos() {
    const target = this.target.position.clone();
    const offset = this.offset.clone();
    
    return target.add(offset.applyQuaternion(this.target.quaternion));
  }
  
  update(delta) {
    this.elapsed += delta;
    
    this.mesh.material.opacity = 1 - this.elapsed / this.ttl;
    
    if (this.elapsed >= this.ttl) {
      this.reset();
    }
  }
  
  reset() {
    this.elapsed = 0;
    this.position = this.calcPos();
    
    this.mesh.position.copy(this.position);
  }
}