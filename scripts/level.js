import {
  Group,
  PlaneGeometry,
  MeshPhongMaterial,
  Mesh,
} from 'three';

export default class Level {

  constructor(args = {}) {

    // set size;
    this.width = args.size || 100;
    this.height = args.size || 100;

    this.enemyCount = args.enemyCount || 10;
    this.ememies = new Group();

    this.plane = this.createPlane();

    this.level = new Group();
    this.level.add(this.plane);
    this.level.add(this.enemies);

  }

  randomColor() {
    return '#ffffff';
  }

  createPlane() {

    // create a plane
    let planeColor = this.randomColor();
    let planeGeometry = new PlaneGeometry( this.width, this.height );
    let planeMaterial = new MeshPhongMaterial( { color: planeColor } );

    let plane = new Mesh( planeGeometry, planeMaterial);
    plane.position.z = -1;
    plane.rotation.x -= Math.PI/2;
    plane.receiveShadow = true;

    return plane;

  }

}
