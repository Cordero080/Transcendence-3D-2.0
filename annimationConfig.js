const animationConfig = {
  blue: {
    feed: {
      file: "./models/FEED.fbx",
      pose: {
        scale: [0.0008, 0.0008, 0.0008],
        position: [1, 0.1, -1],
        rotationY: -Math.PI / 1,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/blue_robot.fbx",
      pose: {
        scale: [0.00247, 0.00247, 0.00247],
        position: [0, -3, -6.5],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/cat_FREEZE.fbx",
      pose: {
        scale: [0.0027, 0.0027, 0.0027],
        position: [-1.5, -3, -6.7],
        rotationY: Math.PI / 7,
        rotationX: 18.7,
      },
    },
    idleAfterDance: {
      file: "./models/blue_happy_idle.fbx",
      pose: {
        scale: [0.0016, 0.0016, 0.0016],
        position: [0, 0.2, -4],
        rotationY: -Math.PI / -16,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/SLEEP.fbx",
      pose: {
        scale: [0.0018, 0.0018, 0.0018],
        position: [-7.8, -2.8, -4.9],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    train: {
      file: "./models/cat_punch_kick.fbx",
      pose: {
        scale: [0.00189, 0.00189, 0.00189],
        position: [0, -1.9, -4],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/cat_knee-upper.fbx",
      pose: {
        scale: [0.0019, 0.0019, 0.0019],
        position: [0, -2, -5],
        rotationY: Math.PI / -9,
        rotationX: -0.15,
      },
    },
    idleAfterTrain: {
      file: "./models/blue_offensive.fbx",
      pose: {
        scale: [0.00379, 0.0039, 0.00379],
        position: [0, -5, -11.1],
        rotationY: Math.PI / 35,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/blue_happy_idle.fbx",
      pose: {
        scale: [0.00163, 0.00163, 0.00163],
        position: [0, 0.2, -3],
        rotationY: -Math.PI / -16,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/blue_happy_idle.fbx",
      pose: {
        scale: [0.0016, 0.0016, 0.0016],
        position: [0, 0.2, -3],
        rotationY: -Math.PI / -16,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/cat_warrior.fbx",
      pose: {
        scale: [0.00374, 0.00374, 0.00374],
        position: [0, -1.55, -10.9],
        rotationY: Math.PI / 29,
        rotationX: 0,
      },
    },
    death: {
      file: "./models/cat_dies.fbx",
      pose: {
        scale: [0.00176, 0.00176, 0.00176],
        position: [0.1, -1.5, -3.7],
        rotationY: -Math.PI / -30,
        rotationX: 0,
      },
    },
  },

  // ================YELOW==================== \\
  yellow: {
    feed: {
      file: "./models/yellow_eats.fbx",
      pose: {
        scale: [0.0025, 0.0025, 0.0025],
        position: [-3.9, -1, -9],
        rotationY: -Math.PI / 1.5,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/yellow_robot.fbx",
      pose: {
        scale: [0.0026, 0.0026, 0.0026],
        position: [0, -3, -6.4],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/Yellow_tut.fbx",
      pose: {
        scale: [0.0031, 0.0031, 0.0031],
        position: [0, -3.3, -7.2],
        rotationY: Math.PI / 9,
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
    sleep: {
      file: "./models/yellow_sleep.fbx",
      pose: {
        scale: [0.0020, 0.0020, 0.0020],
        position: [-7.9, -2.8, -4.9],
        rotationY: Math.PI / 10,
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
        scale: [0.0035, 0.0035, 0.0035],
        position: [-1, -4.55, -9.7],
        rotationY: Math.PI / 9,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/yellow_agree.fbx",
      pose: {
        scale: [0.00395, 0.00395, 0.00395],
        position: [0, -4.9, -11],
        rotationY: Math.PI / 16,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/yellow_spin_idle.fbx",
      pose: {
        scale: [0.001615, 0.001615, 0.001615],
        position: [0, 0.3, -3.1],
        rotationY: -Math.PI / -30,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/yellow_looking.fbx",
      pose: {
        scale: [0.00365, 0.00365, 0.00365],
        position: [0, -4.5, -10],
        rotationY: Math.PI / 40,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/yellow_looking.fbx",
      pose: {
        scale: [0.0039, 0.0039, 0.0039],
        position: [0, -5, -11],
        rotationY: Math.PI / 21,
        rotationX: 0,
      },
    },
    death: {
      file: "./models/yellow_dies.fbx",
      pose: {
        scale: [0.00161, 0.00161, 0.00161],
        position: [0.1, -1.1, -2.5],
        rotationY: -Math.PI / -30,
        rotationX: 0,
      },
    },
  },

  // ================GREEN==================== \\
  green: {
    feed: {
      file: "./models/green_eat.fbx",
      pose: {
        scale: [0.00427, 0.00427, 0.00427],
        position: [-5.5, -4.5, -14],
        rotationY: -Math.PI / 1.2,
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
    dance2: {
      file: "./models/green_thrille4.fbx",
      pose: {
        scale: [0.00463, 0.00463, 0.00463],
        position: [7, -6, -20.9],
        rotationY: Math.PI / -6,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.00425, 0.00425, 0.00425],
        position: [0, -5, -11],
        rotationY: Math.PI / 21,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/green_sleep.fbx",
      pose: {
        scale: [0.00539, 0.00539, 0.00539],
        position: [-18.3, -3.5, -15.9],
        rotationY: Math.PI / 5,
        rotationX: 0,
      },
    },
    train: {
      file: "./models/green_butterfly.fbx",
      pose: {
        scale: [0.0039, 0.0039, 0.0039],
        position: [-3.5, -5.2, -18],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
    train2: {
      file: "./models/green_back_k.fbx",
      pose: {
        scale: [0.0112, 0.0112, 0.0112],
        position: [10, -16, -43],
        rotationY: Math.PI / -7,
        rotationX: 0,
      },
    },
    idleAfterTrain: {
      file: "./models/green_smoke.fbx",
      pose: {
        scale: [0.00412, 0.00412, 0.00412],
        position: [0, -5.5, -11],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/green_drunk.fbx",
      pose: {
        scale: [0.00186, 0.00186, 0.00186],
        position: [0, -1.5, -3],
        rotationY: -Math.PI / -16,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/green_cocky.fbx",
      pose: {
        scale: [0.0042, 0.0042, 0.0042],
        position: [0, -5, -10.5],
        rotationY: Math.PI / 18,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/green_teeter.fbx",
      pose: {
        scale: [0.00321, 0.00321, 0.00321],
        position: [-7.5, -3.72, -9.8],
        rotationY: Math.PI / 3,
        rotationX: 0,
      },
    },
    death: {
      file: "./models/green_dies.fbx",
      pose: {
        scale: [0.00186, 0.00186, 0.00186],
        position: [0.1, -1.5, -3.2],
        rotationY: -Math.PI / -50,
        rotationX: 0,
      },
    },
  },

  // ================RED==================== \\
  red: {
    feed: {
      file: "./models/red_eats.fbx",
      pose: {
        scale: [0.00290, 0.00290, 0.00290],
        position: [-1.9, -1, -9],
        rotationY: -Math.PI / 1,
        rotationX: 0,
      },
    },
    dance: {
      file: "./models/red_break2.fbx",
      pose: {
        scale: [0.0025, 0.0025, 0.0025],
        position: [0.3, -2.6, -5.3],
        rotationY: Math.PI / -14,
        rotationX: 0,
      },
    },
    dance2: {
      file: "./models/red_bboy.fbx",
      pose: {
        scale: [0.0018, 0.0018, 0.0018],
        position: [-1, -1.4, -3],
        rotationY: -Math.PI / -10,
        rotationX: 0,
      },
    },
    idleAfterDance: {
      file: "./models/red_ready.fbx",
      pose: {
        scale: [0.0042, 0.0042, 0.0042],
        position: [0, -5, -10.5],
        rotationY: Math.PI / 22,
        rotationX: 0,
      },
    },
    sleep: {
      file: "./models/red_sleep.fbx",
      pose: {
        scale: [0.0029, 0.0029, 0.0029],
        position: [0, .5, -8.7],
        rotationY: Math.PI / -3,
        rotationX: 6,
       
      },
    },
    train: {
      file: "./models/red_uppercut.fbx",
      pose: {
        scale: [0.0072, 0.0072, 0.0072],
        position: [-3, -9, -22],
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
    idleAfterTrain: {
      file: "./models/red_bounce.fbx",
      pose: {
        scale: [0.0041, 0.0041, 0.0041],
        position: [0, -5, -10],
        rotationY: Math.PI / 14,
        rotationX: 0,
      },
    },
    idle: {
      file: "./models/rojo_spell.fbx",
      pose: {
        scale: [0.001967, 0.001967, 0.001967],
        position: [0.2, -1.4, -4],
        rotationY: -Math.PI / -24,
        rotationX: 0,
      },
    },

    idleAfterFeed: {
      file: "./models/red_mad_idle.fbx",
      pose: {
        scale: [0.00412, 0.00412, 0.00412],
        position: [0, -5, -10.5],
        rotationY: Math.PI / 12,
        rotationX: 0,
      },
    },
    idleAfterSleep: {
      file: "./models/red_hadouken.fbx",
      pose: {
        scale: [0.004, 0.004, 0.004],
        position: [0, -5, -11],
        rotationY: Math.PI / 14,
        rotationX: 0,
      },
    },
    death: {
      file: "./models/red_dies.fbx",
      pose: {
        scale: [0.0019, 0.0019, 0.0019],
        position: [0, -1.4, -3],
        rotationY: -Math.PI / -35,
        rotationX: 0,
      },
    },
  },

  // ================WHITE==================== \\
  white: {
    // feed: {
    //   file: "./models/yellow_eats.fbx",
    //   pose: {
    //     scale: [0.0028, 0.0028, 0.0028],
    //     position: [-3.9, -1, -9],
    //     rotationY: -Math.PI / 3,
    //     rotationX: 0,
    //   },
    // },
    dance: {
      file: "./models/white_thriller.fbx",
      pose: {
        scale: [0.0023, 0.0023, 0.0023],
        position: [-2, -2, -8],
        rotationY: -Math.PI / -7,
        rotationX: 0,
      },
    },
    // sleep: {
    //   file: "./models/yellow_sleep.fbx",
    //   pose: {
    //     scale: [0.002, 0.002, 0.002],
    //     position: [-5.3, -2.8, -4.6],
    //     rotationY: Math.PI / 5,
    //     rotationX: 0,
    //   },
    // },
    // dance2: {
    //   file: "./models/green_thriller.fbx",
    //   pose: {
    //     scale: [0.0064, 0.0064, 0.0064],
    //     position: [-1, -3.8, -18],
    //     rotationY: Math.PI / 15,
    //     rotationX: -0.1,
    //   },
    // },

    train: {
      file: "./models/white_spell.fbx",
      pose: {
        scale: [0.0021, 0.0021, 0.0021],
        position: [0, -1.5, -3.5],
        rotationY: -Math.PI / -11,
        rotationX: 0,
      },
    },
    // train2: {
    //   file: "./white_spell.fbx",
    //   pose: {
    //    scale: [0.003, 0.003, 0.003],
    //     position: [0, -1.5, -11],
    //     rotationY: -Math.PI / -6,
    //     rotationX: 0,
    //   },
    // },
    idle: {
      file: "./models/SLOW_QI.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3],
        rotationY: -Math.PI / -6,
        rotationX: 0,
      },
    },

    death: {
      file: "./models/white_dies.fbx",
      pose: {
        scale: [0.002, 0.002, 0.002],
        position: [0, -1.5, -3.2],
        rotationY: -Math.PI / -50,
        rotationX: 0,

        // idleAfterFeed: {
        //   file: "./models/green_cocky.fbx",
        //   pose: {
        //     scale: [0.004, 0.004, 0.004],
        //     position: [0, -1, -9],
        //     rotationY: Math.PI / -7,
        //     rotationX: 0,
        //   },
        // },
        // idleAfterDance: {
        //   file: "./models/green_cocky.fbx",
        //   pose: {
        //     scale: [0.0035, 0.0035, 0.0035],
        //     position: [0, -5, -8],
        //     rotationY: Math.PI / 10,
        //     rotationX: 0,
        //   },
        // },
        // idleAfterSleep: {
        //   file: "./models/green_drunk.fbx",
        //   pose: {
        //     scale: [0.004, 0.004, 0.004],
        //     position: [-4, -1.55, -9.8],
        //     rotationY: Math.PI / 9,
        //     rotationX: 0,
        //   },
        // },
        // idleAfterTrain: {
        //   file: "./models/green_drunk.fbx",
        //   pose: {
        //     scale: [0.0044, 0.0044, 0.0044],
        //     position: [1, -5.5, -11],
        //     rotationY: Math.PI / 12,
        //     rotationX: 0,
        //   },
        // },
      },
    },
  },
};

export default animationConfig;
