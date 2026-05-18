AFRAME.registerComponent("gltf-animation-player", {
  schema: {
    clip: { type: "string", default: "" },
    active: { type: "boolean", default: true },
  },

  init() {
    this.mixer = null;
    this.action = null;
    this.clock = new THREE.Clock();
    this._onModelLoaded = () => this.setup();
    this._raf = this._loop.bind(this);
    this.el.addEventListener("model-loaded", this._onModelLoaded);
    this._rafId = requestAnimationFrame(this._raf);
  },

  _loop() {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
    this._rafId = requestAnimationFrame(this._raf);
  },

  setup() {
    this.teardownMixer();
    if (!this.data.active) return;

    const model = this.el.getObject3D("mesh");
    if (!model?.animations?.length) return;

    const clips = model.animations;
    const wanted = (this.data.clip || "").toLowerCase();
    const clip =
      clips.find((c) => c.name.toLowerCase() === wanted) ||
      clips.find((c) => c.name === this.data.clip) ||
      clips[0];

    this.mixer = new THREE.AnimationMixer(model);
    this.action = this.mixer.clipAction(clip);
    this.action.enabled = true;
    this.action.setEffectiveWeight(1);
    this.action.setLoop(THREE.LoopRepeat, Infinity);
    this.action.clampWhenFinished = false;
    this.action.reset();
    this.action.play();

    this.el.emit("anim-started", {
      clip: clip.name,
      running: this.action.isRunning(),
      tracks: clip.tracks.length,
    });
  },

  teardownMixer() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    this.mixer = null;
    this.action = null;
    this.clock = new THREE.Clock();
  },

  tick(_t, dt) {
    if (this.mixer && dt > 0) {
      this.mixer.update(dt / 1000);
    }
  },

  update(oldData) {
    if (
      oldData.clip !== this.data.clip ||
      oldData.active !== this.data.active
    ) {
      this.setup();
    }
  },

  remove() {
    this.el.removeEventListener("model-loaded", this._onModelLoaded);
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    this.teardownMixer();
  },
});
