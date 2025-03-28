export class Preload {
    static installShaders = function (callback) {
        var vertexShader = null;
        var fragmentShader = null;

        function shadersDone() {
            if (vertexShader && fragmentShader) {
                window.vertexShader = vertexShader;
                window.fragmentShader = fragmentShader;
                console.log("shaders in");
                callback();
            }
        }

        function vertexDone(code) {
            vertexShader = code;
            if (fragmentShader !== null) {
                shadersDone();
            }
        }

        function fragmentDone(code) {
            fragmentShader = code;
            if (vertexShader !== null) {
                shadersDone();
            }
        }

        var xhr1 = new XMLHttpRequest();
        var xhr2 = new XMLHttpRequest();

        xhr1.open("GET", "./shaders/skybox.vert", true);
        xhr2.open("GET", "./shaders/skybox.frag", true);

        xhr1.responseType = "text";
        xhr2.responseType = "text";

        xhr1.onload = function () {
            if (xhr1.readyState === xhr1.DONE && xhr1.status === 200) {
                vertexDone(xhr1.responseText);
            }
        };

        xhr2.onload = function () {
            if (xhr2.readyState === xhr2.DONE && xhr2.status === 200) {
                fragmentDone(xhr2.responseText);
            }
        };

        xhr1.send(null);
        xhr2.send(null);
    };

    // pass an array of texture paths and an object
    // is returned with the path as key to the texture value
    // this will replace the load blocking awaits for
    // texture loading - await is convenient but disrupts
    // program flow - convenient but wanky
    static textureLoad(textureUrlArray, callback) {
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;
        let loadedTextures = {};
        let hasError = false;

        function checkAllLoaded() {
            loadedCount++;
            if (loadedCount === textureUrlArray.length && !hasError) {
                callback(loadedTextures);
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
}
