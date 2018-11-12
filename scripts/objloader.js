import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader';

export default class ObjLoader {

  constructor() {

    this.mtlLoader = new MTLLoader();
    this.objLoader = new OBJLoader();

  }

  load(mtl = '', obj = '', callback = () => {}) {

    this.mtlLoader.load(mtl, (materials) => {
      materials.preload();
      this.objLoader.setMaterials(materials);
      this.objLoader.load(obj, (object) => {
        callback(object);
      });
    });

  }

}
