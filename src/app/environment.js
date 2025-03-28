import * as THREE from 'three';
import { Skybox } from './skybox.js';
import { Ground } from './ground.js';
import { Grass } from './grass.js';
import { Rocks } from './rocks.js';
import { Clouds } from './clouds.js';

export class Environment extends THREE.Object3D {
  constructor(preloads) {
    super();

    this.preloads = preloads;

    this.ground = new Ground(preloads);
    this.add(this.ground);

    this.grass = new Grass(preloads);
    this.add(this.grass);

    this.skybox = new Skybox(preloads);
    this.add(this.skybox);

    this.rocks = new Rocks(preloads);
    this.add(this.rocks);

    this.clouds = new Clouds();
    this.clouds.position.set(0, 200, 0);
    this.clouds.rotation.x = Math.PI / 2;
    this.add(this.clouds);
  }

  update(elapsedTime) {
    this.grass.update(elapsedTime);
    this.clouds.update(elapsedTime);
  }
}