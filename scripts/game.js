// import local classes
import Engine from './engine.js';
import Audio from './audio.js';
import Player from './player.js';
import Keyboard from './keyboard.js';
import ObjLoader from './objloader.js';

// import THREE
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  MeshNormalMaterial,
  DirectionalLight,
  AmbientLight,
  Vector2,
  Vector3,
  PCFSoftShadowMap
} from 'three';

// import postprocessing
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  DotScreenEffect,
  ChromaticAberrationEffect
} from 'postprocessing';



// setup game class
export default class Game {

  constructor() {

    // construct engine
    this.engine = new Engine();
    this.engine.update = this.update.bind(this);

    // construct keyboard manager
    this.keyboard = new Keyboard();

    // construct audio mananger
    this.audio = new Audio();
    this.audioLoaded = false;

    // load audio files
    this.loadAudio([
      {
        url: '../assets/music/music.mp3',
        name: 'main',
        autoplay: false,
      },
      {
        url: '../assets/music/car-start.mp3',
        name: 'car-start',
        autoplay: false,
      }
    ]);

    // construct camera
    this.camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );

    // create a new scene
    this.scene = new Scene();

    // setup renderer
    this.renderer = new WebGLRenderer({
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.autoClearColor = false;


    // style and add renderer to dom
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.left = '0px';
    this.renderer.domElement.style.top = '0px';

    // style body
    document.body.style.overflow = 'hidden';
    document.body.appendChild( this.renderer.domElement );

    // define model array
    this.models = [];
    this.modelsLoaded = false;
    // load all models
    this.loadModels([
      {
        mtl: './models/car.mtl',
        obj: './models/car.obj',
        name: 'player'
      }
    ]);

    // setup composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.addEffects();


    // add eventlisteners
    window.addEventListener('resize', this.resize.bind(this));

  }

  setup() {

    if(!this.modelsLoaded || !this.audioLoaded) return;

    var near = 0.1;
    var far = 20;

    var light = new AmbientLight( 0x3E00AE ); // soft white light
    this.scene.add( light );

    var directionalLight = new DirectionalLight( 0xFF0071, 1 );
    directionalLight.position.set(0, 1, -1);
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = near;
    directionalLight.shadow.camera.far = far;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.bottom = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top	= 5;
    directionalLight.shadow.camera.radius	= 2;
    directionalLight.castShadow = true;
    // this.scene.add( directionalLight );

    this.geometry = new BoxGeometry( 0.2, 0.2, 0.2 );
    this.material = new MeshPhongMaterial();
    this.material.castShadow = true;

    this.mesh = new Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );

    var plane = new Mesh( new PlaneGeometry( 100, 100 ), new MeshPhongMaterial( { color: 0x1A0056, opacity: 1 } ) );
    plane.position.z = -1;
    plane.rotation.x -= Math.PI/2;
    plane.receiveShadow = true;
    this.scene.add( plane );

    this.player = new Player(this.models['player']);
    this.player.model.scale.set(0.001, 0.001, 0.001);
    this.player.model.add(directionalLight);
    this.player.model.receiveShadow = true;
    this.player.model.children.forEach(child => {
      if (child.isMesh) child.castShadow = true;
    });
    this.scene.add(this.player.model);
    this.scene.add(this.player.trail);

    this.camera.up = new Vector3(0,0,-1);
    this.camera.lookAt(this.player.model.position);


    this.run();

    this.audio.play('car-start');

  }

  addEffects() {

    // add ChromaticAberrationEffect
    this.chroma = new EffectPass(this.camera, new ChromaticAberrationEffect());
    this.chroma.effects[0].uniforms.get('offset').value = new Vector2(0.01, 0.01);
    this.composer.addPass(this.chroma);

    // add DotScreenEffect
    let dotscreen = new EffectPass(this.camera, new DotScreenEffect());
    console.log(dotscreen.effects[0]);
    dotscreen.effects[0].uniforms.get('scale').value = 0.75;
    dotscreen.effects[0].blendMode.blendFunction = 12;
    dotscreen.effects[0].blendMode.opacity.value = 0.1;
    this.composer.addPass( dotscreen );


    // add BloomEffect
    let bloom = new EffectPass(this.camera, new BloomEffect());
    bloom.renderToScreen = true;
		this.composer.addPass( bloom );

  }

  loadAudio(manifest) {

    let count = 0;

    manifest.forEach(audio => {
      this.audio.load(audio.url, audio.name, audio.autoplay, () => {
        count++;

        if(count >= manifest.length) {
          this.audioLoaded = true;
          this.setup();
        }

      });

    });

  }

  loadModels(manifest) {

    const loader = new ObjLoader();

    let count = 0;

    manifest.forEach(model => {
      loader.load(model.mtl, model.obj, (object) => {
        count++;

        this.models[model.name] = object;

        if(count >= manifest.length) {
          this.modelsLoaded = true;
          this.setup();
        }
      });
    });

  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.composer.setSize( window.innerWidth * this.pixelRatio, window.innerHeight * this.pixelRatio);
  }

  update() {

    this.chroma.effects[0].uniforms.get('offset').value = new Vector2(
      0.001 + 0.1 * this.player.vx,
      0.001 + 0.1 * this.player.vz
    );

    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;

    this.player.update(this);

    //update camera position
    this.camera.position.set(
      this.player.model.position.x,
      this.player.model.position.y+1,
      this.player.model.position.z+1
    );
    this.camera.lookAt(this.player.model.position);

    //this.renderer.render( this.scene, this.camera );

    this.composer.render();


    this.keyboard.clear();

  }

  render() {

    this.display.clear();
    this.display.background('#1D0751');
    this.display.translate(this.display.width/2 - this.camera.x, this.display.height/2 - this.camera.y);

    this.display.circle(200, 200, 50, 'yellow');

    //render stuff here
    this.player.render(this.display.context);

    this.display.translate(-(this.display.width/2 - this.camera.x), -(this.display.height/2 - this.camera.y));

  }

  run() {
    this.engine.run();
  }
}
