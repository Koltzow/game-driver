import BufferLoader from './bufferloader.js';

export default class Audio {

  constructor() {

    this.soundClips = [];
    this.context = new AudioContext();


  }

  load(sound = null, name = '', play = false, callback) {
    if(!sound) {
      throw new Error('missing path to load');
    }

    if(name.length < 1) {
      throw new Error('missing sound name');
    }

    if(this.soundClips[name]) {
      throw new Error('sound already exists');
    }

    const bufferLoader = new BufferLoader(
      this.context,
      [sound],
      (bufferList)=> {

        bufferList.forEach(buffer => {
          let audioSource = this.context.createBufferSource();
          audioSource.buffer = buffer;
          audioSource.connect(this.context.destination);

          if(play) {
            audioSource.start(0);
          }

          this.soundClips[name] = audioSource;
        });

        callback();

      }
    );

    bufferLoader.load();

  }

  play(name = '') {
    if(name.length < 1) {
      throw new Error('missing sound name');
    }

    if(!this.soundClips[name]){
      console.log('no sounds with that name or not ready');
      return
    }

    this.soundClips[name].start(0);
  }

}
