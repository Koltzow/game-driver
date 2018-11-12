import {
  Vector3,
  Vector2,
  SpotLight,
  Object3D,
  MeshBasicMaterial,
  BoxGeometry,
  Mesh
} from 'three';

import Trails from './trails';

export default class Player {

  constructor(model) {

    this.acceleration = 0.04;
    this.rotationalAcceleration = 0.003;
    this.position = new Vector2();
    this.velocity = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.resistance = 0.95;
    this.angle = 0;
    this.cameraAngle = 0;
    this.frontTires = null;
    this.tireRotation = 0;

    this.model = new Object3D();

    let whiteMaterial = new MeshBasicMaterial({ color: 0xffffff });
    let redMaterial = new MeshBasicMaterial({ color: 0xff0073 });

    const tirePositions = [];

    model.scale.set(0.01, 0.01, 0.01);

    model.children.forEach(mesh => {
      if(
        mesh.name === 'DeLorean DeLorean01' || //windows
        mesh.name === 'DeLorean DeLorean02' || //front lights
        mesh.name === 'DeLorean DeLorean11' || //front tires
        mesh.name === 'DeLorean DeLorean12' //backtires
      ){
        mesh.material = whiteMaterial;
      }

      if(mesh.name === 'DeLorean DeLorean11') {
        this.frontTires = mesh;
      }

      if(mesh.name === 'DeLorean DeLorean14') {
        mesh.material = redMaterial;
      }
    });

    // tirePositions.push(new Vector3(-0.075,0,0.1));
    // tirePositions.push(new Vector3(0.075,0,0.1));
    // tirePositions.push(new Vector3(-0.075,0,-0.1));
    // tirePositions.push(new Vector3(0.075,0,-0.1));

    tirePositions.push(new Vector3(0.50, 0.80, 2.2));
    tirePositions.push(new Vector3(-0.50, 0.80, 2.2));

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

    this.model.add(model);

    const trailConfig = [
      {
        id: 'tireFrontLeft',
        offset: new Vector3(-0.75, 0, 1),
        color: '#fff',
        maxLen: 16,
      },
      {
        id: 'tireFrontRight',
        offset: new Vector3(0.75, 0, 1),
        color: '#fff',
        maxLen: 16,
      },
      {
        id: 'tireRearLeft',
        offset: new Vector3(-0.75, 0, -1),
        color: '#fff',
        maxLen: 16,
      },
      {
        id: 'tireRearRight',
        offset: new Vector3(0.75, 0, -1),
        color: '#fff',
        maxLen: 16,
      },
      {
        id: 'brakeLightLeft',
        offset: new Vector3(-0.5, 1, 2.5),
        color: 0xff0073,
        maxLen: 16,
      },
      {
        id: 'brakeLightRight',
        offset: new Vector3(0.5, 1, 2.5),
        color: 0xff0073,
        maxLen: 16,
      },
    ];

    this.trails = new Trails();

    for (var i = 0; i < trailConfig.length; i++) {
      const options = trailConfig[i];

      this.trails.addTrail(this.model, options);
    }

    this.getVelocityScalar = this.getVelocityScalar.bind(this);

  }

  update(game) {

    let acc = 0;

    const { controller } = game;
    const control = controller.controllers[0];

    if(controller.type === 'keyboard' || controller.type === 'touch') {

      this.velocity += control.dir.y * this.acceleration;
      this.angle += control.dir.x * this.rotationalAcceleration * this.velocity;
      this.tireRotation += (control.dir.x - this.tireRotation) * 0.1;

    }

    this.model.rotation.y += this.angle;

    this.vz = Math.cos(this.model.rotation.y) * this.velocity;
    this.vx = Math.sin(this.model.rotation.y) * this.velocity;

    this.velocity *= this.resistance;
    this.angle *= this.resistance;
    this.cameraAngle += (this.angle - this.cameraAngle) * 0.05;
    this.tireRotation *= 0.95;

    this.model.position.add(new Vector3(this.vx, this.vy, this.vz));
    this.frontTires.rotation.y = -this.tireRotation * 0.5;
    this.frontTires.position.x = -this.tireRotation * 40;

    //this.trails.update();
  }

  getVelocityScalar(precision = 1000) {
    if (precision) {
      return Math.floor(Math.abs(this.velocity * 13.158) * precision) / precision;
    }

    return Math.abs(this.velocity * 13.158);
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
        const item = new TrailItem(model.position.clone().add(tirePosition.clone().applyQuaternion(model.quaternion)), model.rotation.y);
        this.add(item.mesh);
        this.items.push(item)
      });
    }
  }
}

class TrailItem {
  constructor(pos, rot) {
    this.ttl = 400;
    this.elapsed = 0;

    const geometry = new BoxGeometry(0.3, 0.1, 0.1);
    const material = new MeshBasicMaterial({ color: 0xFF0073 });
    material.transparent = true;

    this.mesh = new Mesh(geometry, material);

    this.mesh.rotation.y = rot;
    this.mesh.position.copy(pos);
  }

  update(delta) {
    this.elapsed += delta;
    this.mesh.material.opacity = 1 - this.elapsed / this.ttl;
  }
}
