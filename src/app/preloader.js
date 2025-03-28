import * as THREE from "three";
import { GLTFLoader } from "three/examples/loaders/GLTFLoader.js";
import { DRACOLoader } from 'three/examples/loaders/DRACOLoader.js';

export class Preloader {
    // pass an array of texture paths and an object
    // is returned with the path as key to the texture value
    // this will replace the load blocking awaits for
    // texture loading - await is convenient but disrupts
    // program flow - convenient but wanky
    static preloadTextures(textureUrlArray, callback) {
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;
        let loadedTextures = {};
        let hasError = false;

        function checkAllLoaded() {
            loadedCount++;
            if (loadedCount === textureUrlArray.length && !hasError) {
                callback("textures", loadedTextures);
            }
        }

        try {
            textureUrlArray.forEach((url) => {
                loadedTextures[url] = textureLoader.load(
                    url,
                    checkAllLoaded,
                    (xhr) => console.log(`${url}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
                    (error) => {
                        hasError = true;
                        console.error(`Error loading texture ${url}:`, error);
                    }
                );
            });
        } catch (error) {
            hasError = true;
            console.error("Texture loading failed:", error);
        }
    }

    static preloadGLTF(gltfUrlArray, callback) {
        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        const decoderPath = "./draco/";
        dracoLoader.setDecoderPath(decoderPath);
        gltfLoader.setDRACOLoader(dracoLoader);

        let loadedCount = 0;
        let loadedGLTF = {};
        let hasError = false;

        function checkAllLoaded(url) {
            loadedCount++;
            if (loadedCount === gltfUrlArray.length && !hasError) {
                if (callback) {
                    callback("gltf", loadedGLTF);
                } else {
                    return loadedGLTF;
                }
            }
        }

        try {
            gltfUrlArray.forEach((url) => {
                loadedGLTF[url] = gltfLoader.load(
                    url,
                    function (object) {
                        loadedGLTF[url] = object;
                        checkAllLoaded(url);
                    },
                    (xhr) => console.log(`${url}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
                    (error) => {
                        hasError = true;
                        console.error(`Error loading texture ${url}:`, error);
                    }
                );
            });
        } catch (error) {
            hasError = true;
            console.error("Texture loading failed:", error);
        }
    }

    static preloadShaders(shaderUrlArray, callback) {
        let loadedCount = 0;
        let loadedShaders = {};
        let hasError = false;

        function checkAllLoaded(url, response) {
            loadedCount++;
            loadedShaders[url] = response.responseText;
            if (loadedCount === shaderUrlArray.length && !hasError) {
                if (callback) {
                    callback("shaders", loadedShaders);
                } else {
                    return loadedShaders;
                }
            }
        }

        function loadShader(url) {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
                    checkAllLoaded(url, this);
                } else {
                    hasError = true;
                    console.log("There was a shader load problem:");
                    console.log("...status;" + xhttp.status + " : " + xhttp.statusText);
                }
            };
            xhttp.open("GET", url);
            xhttp.responseType = "text";
            xhttp.send();
        }

        shaderUrlArray.forEach((url) => {
            loadShader(url);
        });
    }
}
