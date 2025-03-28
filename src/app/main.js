import * as THREE from 'three';
import { EffectComposer } from 'three/examples/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/postprocessing/OutputPass.js';
import { setupUI } from './ui.js';
import { createScene } from './scene.js';

export class MainEZTree {
  static init(preloads) {

    this.preloads = preloads;
    const container = document.getElementById('app');

    // User needs to interact with the page before audio will play
    container.addEventListener('click', this.toggleAudio);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 2;
    container.appendChild(renderer.domElement);

    //const sceneElements = createScene(renderer);
    const { scene, environment, tree, camera, controls } = createScene(renderer, preloads);

    // the only thing I can see changed with
    // the EffectComposer items is more fog
    const composer = new EffectComposer(renderer);

    composer.addPass(new RenderPass(scene, camera));

    const smaaPass = new SMAAPass(
      container.clientWidth * renderer.getPixelRatio(),
      container.clientHeight * renderer.getPixelRatio(),
    );
    composer.addPass(smaaPass);

    composer.addPass(new OutputPass());

    const clock = new THREE.Clock();
    function animate() {
      // Update time for wind sway shaders
      const t = clock.getElapsedTime();
      tree.update(t);
      scene.getObjectByName('Forest').children.forEach((o) => o.update(t));
      environment.update(t);

      controls.update();
      composer.render();
      requestAnimationFrame(animate);
    }

    function resize() {
      renderer.setSize(container.clientWidth, container.clientHeight);
      smaaPass.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);

    setupUI(tree, environment, renderer, scene, camera, controls, 'Ash Medium');
    animate();
    resize();

    document.getElementById('audio-status').style.display = 'block';
  }

  static toggleAudio() {
    document.getElementById('app').removeEventListener('click', this.toggleAudio);

    if (window.isAudioPlaying) {
      window.isAudioPlaying = false;
      document.getElementById('audio-status').src = './public/icon_muted.png';
      document.getElementById('background-audio').pause();
    } else {
      window.isAudioPlaying = true;
      document.getElementById('audio-status').src = './public/icon_playing.png';
      document.getElementById('background-audio').play();
    }
  }
}
