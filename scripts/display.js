export default class Display {

  constructor() {

    this.canvas = document.createElement('canvas');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.context = this.canvas.getContext('2d');

    this.addDisplay();


    window.addEventListener('resize', this.resize.bind(this));

  }

  addDisplay() {

    this.canvas.style.position = 'fixed';
    this.canvas.style.left = '0px';
    this.canvas.style.top = '0px';
    document.body.style.overflow = 'hidden';


    document.body.appendChild(this.canvas);
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  background(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  translate(x, y) {
    this.context.translate(x, y);
  }

  circle(x = 0, y = 0, radius = 10, color = 'black') {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x,y,radius,0,2*Math.PI);
    this.context.fill();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
  }

}
