const animationConfig = {
  blue: {
    feed: {
      file: "./models/FEED.fbx",
      pose: {
        scale: [0.001, 0.001, 0.001],
        position: [-1, 0.1, -1],
        rotationY: -Math.PI / 3,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/first_dance.fbx",
      pose: {
        scale: [0.003, 0.003, 0.003],
        position: [0, -3, -6.3],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/SLEEP.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [-5.3, -2.8, -4.6],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    train: {
      file: "./models/cat_flip_upper.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.55, -4.5],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/blue_cat_idle2.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3],
        rotationY: -Math.PI / -7,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/blue_cat_idle2.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/blue_cat_idle2.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.55, -3.5],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/cat_warrior.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [-4, -1.55, -9.8],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/cat_warrior.fbx",
      pose: {
        scale: [0.0044, 0.0044, 0.0044],
        position: [1, -1.55, -11],
        rotationY: Math.PI / 9.5,
        rotationX: 0,
      },
    },
  },
  yellow: {
    feed: {
      file: "./models/yellow_eats.fbx",
      pose: {
        scale: [0.0028, 0.0028, 0.0028],
        position: [-3.9, -1, -9],
        rotationY: -Math.PI / 3,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/Yellow_tut.fbx",
      pose: {
        scale: [0.003, 0.003, 0.003],
        position: [0, -3, -6.3],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/yellow_sleep.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [-5.3, -2.8, -4.6],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    train: {
      file: "./models/cat_flip_upper.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.55, -4.5],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/blue_cat_idle2.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3],
        rotationY: -Math.PI / -7,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/yellow_idle_agree.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/yellow_idle_agree.fbx",
      pose: {
        scale: [0.0035, 0.0035, 0.0035],
        position: [0, -1.55, -8],
        rotationY: Math.PI / 10,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/yellow_idle_agree.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [-4, -1.55, -9.8],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/yellow_idle_agree.fbx",
      pose: {
        scale: [0.0044, 0.0044, 0.0044],
        position: [1, -1.55, -11],
        rotationY: Math.PI / 9.5,
        rotationX: 0,
      },
    },
  },
};

export default animationConfig;
