const animationConfig = {
  blue: {
    feed: {
      file: "./models/FEED.fbx",
      pose: {
        scale: [0.0009, 0.0009, 0.0009],
        position: [-1, 0.1, -1],
        rotationY: -Math.PI / 3,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/first_dance.fbx",
      pose: {
        scale: [0.0025, 0.0025, 0.0025],
        position: [0, -3, -6.3],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/cat_FREEZE.fbx",
      pose: {
        scale: [0.00291, 0.00291, 0.00291],
        position: [-1.5, -3, -6.7],
        rotationY: Math.PI / 7,
        rotationX: 18.7,
      },
    },
    sleep: {
      file: "./models/SLEEP.fbx",
      pose: {
        scale: [0.0019, 0.0019, 0.0019],
        position: [-5.8, -2.8, -4.9],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    train: {
      file: "./models/cat_punch_kick.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.9, -4],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/cat_knee-upper.fbx",
      pose: {
        scale: [0.0016, 0.0016, 0.0016],
        position: [0, -2, -4.5],
        rotationY: Math.PI / -4,
        rotationX: -0.15,
      },
    },
    idle: {
      file: "./models/blue_happy_idle.fbx",
      pose: {
        scale: [0.0017, 0.0017, 0.0017],
        position: [0, 0.2, -3],
        rotationY: -Math.PI / -16,
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

  // ================YELOW==================== \\
  yellow: {
    feed: {
      file: "./models/yellow_eats.fbx",
      pose: {
        scale: [0.0029, 0.0029, 0.0029],
        position: [-3.9, -1, -9],
        rotationY: -Math.PI / 3,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/yellow_robot.fbx",
      pose: {
        scale: [0.0025, 0.0025, 0.0025],
        position: [0, -3, -6.4],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/yellow_sleep.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [-5.9, -2.8, -4.6],
        rotationY: Math.PI / 10,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/Yellow_tut.fbx",
      pose: {
        scale: [0.003, 0.003, 0.003],
        position: [0, -3.3, -7.2],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    train: {
      file: "./models/yellow_round_k.fbx",
      pose: {
        scale: [0.00251, 0.00251, 0.00251],
        position: [0, -0.5, -6],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/yellow_capo.fbx",
      pose: {
        scale: [0.0038, 0.0038, 0.0038],
        position: [0, -4.55, -9.9],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/yellow_spin_idle.fbx",
      pose: {
        scale: [0.00176, 0.00176, 0.00176],
        position: [0, 0.3, -3],
        rotationY: -Math.PI / -12,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/yellow_spin_idle.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/yellow_spin_idle.fbx",
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
        position: [-3, -1.55, -11],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
  },

  // ================GREEN==================== \\
  green: {
    feed: {
      file: "./models/green_eat.fbx",
      pose: {
        scale: [0.00312, 0.00312, 0.00312],
        position: [-4, -1, -9],
        rotationY: -Math.PI / 2.2,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/salsa.fbx",
      pose: {
        scale: [0.00392, 0.003912, 0.003912],
        position: [0, -5, -9.7],
        rotationY: Math.PI / 16,
        rotationX: -0.2,
      },
    },
    sleep: {
      file: "./models/green_sleep.fbx",
      pose: {
        scale: [0.00539, 0.00539, 0.00539],
        position: [-14.3, -3.5, -15.9],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/green_thriller.fbx",
      pose: {
        scale: [0.00461, 0.00461, 0.00461],
        position: [-1, 0, -12.9],
        rotationY: Math.PI / -6,
        rotationX: 0,
      },
    },

    train: {
      file: "./models/green_butterfly.fbx",
      pose: {
        scale: [0.0038, 0.0038, 0.0039],
        position: [-3.5, -5, -18],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/green_back_k.fbx",
      pose: {
        scale: [0.0109, 0.0109, 0.0109],
        position: [10, -16, -43],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.00188, 0.00188, 0.00188],
        position: [0, -1.5, -3],
        rotationY: -Math.PI / -16,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [0, -1, -9],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.0035, 0.0035, 0.0035],
        position: [0, -5, -8],
        rotationY: Math.PI / 10,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [-4, -1.55, -9.8],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.0044, 0.0044, 0.0044],
        position: [1, -5.5, -11],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
  },

  // ================RED==================== \\
  red: {
    feed: {
      file: "./models/red_eats.fbx",
      pose: {
        scale: [0.0032, 0.0032, 0.0032],
        position: [-3.9, -1, -9],
        rotationY: -Math.PI / 2,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/green_bboy_last.fbx",
      pose: {
        scale: [0.0032, 0.0032, 0.0032],
        position: [0, -1, -7],
        rotationY: Math.PI / -2,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/red_sleep.fbx",
      pose: {
        scale: [0.0022, 0.0022, 0.0022],
        position: [-5.5, -1, -4.7],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/green_thriller.fbx",
      pose: {
        scale: [0.0064, 0.0064, 0.0064],
        position: [-1, -3.8, -18],
        rotationY: Math.PI / 15,
        rotationX: -0.1,
      },
    },

    train: {
      file: "./models/red_uppercut.fbx",
      pose: {
        scale: [0.0072, 0.0072, 0.0072],
        position: [-2, -9, -20],
        rotationY: Math.PI / 6,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/red_elbow.fbx",
      pose: {
        scale: [0.011, 0.011, 0.011],
        position: [5, -16, -47],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/rojo_spell.fbx",
      pose: {
        scale: [0.00197, 0.00197, 0.00197],
        position: [0.2, -1.4, -3.4],
        rotationY: -Math.PI / -24,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [0, -1, -9],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.0035, 0.0035, 0.0035],
        position: [0, -5, -8],
        rotationY: Math.PI / 10,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [-4, -1.55, -9.8],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.0044, 0.0044, 0.0044],
        position: [1, -5.5, -11],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
  },

  // ================WHITE==================== \\
  white: {
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
      file: "./models/green_bboy_last.fbx",
      pose: {
        scale: [0.0032, 0.0032, 0.0032],
        position: [0, -1, -7],
        rotationY: Math.PI / -2,
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
    dance2: {
      file: "./models/green_thriller.fbx",
      pose: {
        scale: [0.0064, 0.0064, 0.0064],
        position: [-1, -3.8, -18],
        rotationY: Math.PI / 15,
        rotationX: -0.1,
      },
    },

    train: {
      file: "./models/green_butterfly.fbx",
      pose: {
        scale: [0.0042, 0.0042, 0.0042],
        position: [-1, -1.55, -11],
        rotationY: Math.PI / 6,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/green_back_k.fbx",
      pose: {
        scale: [0.011, 0.011, 0.011],
        position: [5, -16, -39],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/SLOW_QI.fbx",
      pose: {
        scale: [0.0021, 0.00209, 0.00209],
        position: [0, -1.5, -3.5],
        rotationY: -Math.PI / -6,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [0, -1, -9],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.0035, 0.0035, 0.0035],
        position: [0, -5, -8],
        rotationY: Math.PI / 10,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [-4, -1.55, -9.8],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.0044, 0.0044, 0.0044],
        position: [1, -5.5, -11],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
  },
};

export default animationConfig;
