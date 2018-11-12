const THREE = require('three');
const { MeshLine, MeshLineMaterial } = require('three.meshline');

const defaultOptions = {
  ttl: 16,
};

const defaultTrailOptions = {
  offset: new THREE.Vector3(0, 0, 0),
  color: '#fff',
  maxLen: 0,
};

export default class Trails extends THREE.Object3D {
  constructor(options) {
    super();
    
    this.opts = {
      ...defaultOptions,
      ...options,
    };

    this.trails = {};
    this.trailIds = [];
  }

  addTrail(target, { id, ...options }) {
    if (this.trails[id]) {
      throw Error(`A trail with the id ${id} already exists`);
    }

    const trail = {
      ...defaultTrailOptions,
      ...options,
      items: []
    };
    
    const geometry = new THREE.Geometry();
    const line = new MeshLine();
    
    const material = new MeshLineMaterial({
      color: new THREE.Color(trail.color),
      resolution: new THREE.Vector2(global.innerWidth, global.innerHeight),
      sizeAttenuation: 1,
      lineWidth: 0.015,
      near: 0.01,
      far: 200,
      // lights: false,
      // side: THREE.DoubleSide
      // depthTest: false,
    });
    // material.transparent = true;

    for (let i = 0; i < trail.maxLen; i++) {
      const startTime = (i / trail.maxLen) * this.opts.ttl;

      const item = new TrailItem(
        this.opts.ttl,
        target,
        trail.offset,
        trail.color,
        startTime
      );

      // this.add(item.mesh);
      trail.items.push(item);
      
      geometry.vertices.push(item.position);
    }
    
    line.setGeometry(geometry);
    
    trail.geometry = geometry;
    trail.material = material;
    trail.line = line;
    trail.mesh = new THREE.Mesh(line.geometry, material);
    trail.mesh.frustumCulled = false;
    
    this.add(trail.mesh);

    this.trails[id] = trail;
    this.trailIds.push(id);
  }

  update(delta) {
    if (!this.trailIds.length) return;

    for (let i = 0; i < this.trailIds.length; i++) {
      const { items, line, geometry } = this.trails[this.trailIds[i]];

      for (let j = 0; j < items.length; j++) {
        const item = items[j];

        item.update(delta);
      }

      const sortedItems = items.sort((a, b) => a.elapsed - b.elapsed);
      
      for (let j = 0; j < geometry.vertices.length; j++) {
        geometry.vertices[j].copy(sortedItems[j].position);
      }
      
      line.setGeometry(geometry);
      
      // console.log('line', line);
      // console.log('trailGeometry', trailGeometry.vertices);
      // console.log(trailMesh.geometry.vertices);

      // console.log(...sortedPositions.map(a => a.elapsed));
    }
  }
}

export class TrailItem {
  constructor(ttl, target, offset, color, startTime) {
    this.ttl = ttl;
    this.elapsed = startTime;

    this.target = target;
    this.offset = offset;

    this.position = this.setStartPos();

    // const geometry = new THREE.BoxGeometry(0.02, 0.01, 0.01);
    // const material = new THREE.MeshBasicMaterial({ color });
    // material.transparent = true;
    // 
    // this.mesh = new THREE.Mesh(geometry, material);

    this.update = this.update.bind(this);
    this.reset = this.reset.bind(this);

    this.reset(startTime);
  }

  setStartPos() {
    const target = this.target.position.clone();
    const offset = this.offset.clone();

    return target.add(offset.applyQuaternion(this.target.quaternion));
  }

  update(delta = 1) {
    this.elapsed += delta;

    // this.mesh.material.opacity = 1 - this.elapsed / this.ttl;

    if (this.elapsed >= this.ttl) {
      this.reset();
    }
  }

  reset(startTime = 0) {
    this.elapsed = startTime;
    this.position = this.setStartPos();

    // this.mesh.position.copy(this.position);
  }
}

// var geometry = new THREE.Geometry();
// for (var j = 0; j < Math.PI; j += (2 * Math.PI) / 100) {
//   var v = new THREE.Vector3(Math.cos(j), Math.sin(j), 0);
//   geometry.vertices.push(v);
// }
