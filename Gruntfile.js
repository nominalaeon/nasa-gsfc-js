module.exports = function (grunt) {

    var rootConfig = {
        src: 'src',
        dist: 'dist',
        livereload: 2211,
        port: 1920,
        templates: 'src/templates'
    };

    require('connect-livereload')({
        port: '<%= root.livereload %>'
    });
    require('handlebars-helper-partial');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({

        root: rootConfig,

        assemble: {
            options: {
                expand: true,
                helpers: ['handlebars-helper-partial'],
                layout: ['<%= root.templates %>/page.hbs'],
                partials: [
                    '<%= root.templates %>/partials/*.hbs'
                ],
                data: '<%= root.src %>/data/*.json'
            },
            pages: {
                options: {
                    flatten: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= root.templates %>/pages',
                    src: ['*.hbs', '**/*.hbs'],
                    dest: '<%= root.src %>'
                }]
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 10']
            },
            main: {
                src: '<%= root.src %>assets/css/app.css',
                dest: '<%= root.src %>assets/css/app.css'
            }
        },

        clean: {
            dist: {
                src: [
                    '<%= root.dist %>'
                ]
            },
            src: {
                src: [
                    '<%= root.src %>/assets/css',
                    '<%= root.src %>/assets/js'
                ]
            }
        },

        compass: {
            src: {
                options: {
                    outputStyle: 'expanded',
                    sassDir: '<%= root.src %>/scss',
                    cssDir: '<%= root.src %>/assets/css'
                }
            }
        },

        concat: {
            src: {
                src: [
                    '<%= root.src %>/js/utils.js', // needs to be first
                    '<%= root.src %>/js/app.js',
                    '<%= root.src %>/js/components/*.js',
                ],
                dest: '<%= root.src %>/assets/js/app.js'
            }
        },

        connect: {
            app: {
                options: {
                    host: '*',
                    port: '<%= root.port %>',
                    base: '<%= root.src %>',
                    hostname: '0.0.0.0',
                    livereload: true
                }
            }
        },

        copy: {
            css: {
                files: [{
                    expand: true,
                    cwd: '<%= root.src %>/assets/css',
                    src: [
                        '*.css',
                        '**/*.css'
                    ],
                    dest: '<%= root.dist %>/assets/css'
                }]
            },
            html: {
                files: [{
                    expand: true,
                    cwd: '<%= root.src %>',
                    src: [
                        '*.html',
                        '**/*.html'
                    ],
                    dest: '<%= root.dist %>'
                }]
            },
            images: {
                files: [{
                    expand: true,
                    cwd: '<%= root.src %>/assets/images',
                    src: [
                        '*',
                        '**/*'
                    ],
                    dest: '<%= root.dist %>/assets/images'
                }]
            },
            js: {
                files: [{
                    expand: true,
                    cwd: '<%= root.src %>/assets/js',
                    src: [
                        '*.js',
                        '**/*.js'
                    ],
                    dest: '<%= root.dist %>/assets/js'
                }]
            },
            vendor: {
                files: [{
                    expand: true,
                    cwd: '<%= root.src %>/vendor',
                    src: [
                        '*.js',
                        '**/*.js'
                    ],
                    dest: '<%= root.dist %>/vendor'
                }]
            }
        },

        modernizr: {
            dist: {
                "parseFiles": true,
                "customTests": [],
                "dest": "<%= root.src %>/assets/vendor/modernizr.custom.js",
                "tests": [
                    "svg",
                    "touchevents",
                    "svgasimg",
                    "inlinesvg"
                ],
                "options": [
                    "setClasses"
                ],
                "uglify": true
            }
        },

        watch: {
            hbs: {
                files: [
                    '<%= root.src %>/templates/*.hbs',
                    '<%= root.src %>/templates/**/*.hbs'
                ],
                tasks: ['assemble'],
                options: {
                    livereload: '<%= root.livereload %>'
                }
            },
            js: {
                files: [
                    '<%= root.src %>/js/*.js',
                    '<%= root.src %>/js/**/*.js'
                ],
                tasks: ['concat:src'],
                options: {
                    livereload: '<%= root.livereload %>'
                }
            },
            scss: {
                files: [
                    '<%= root.src %>/scss/*.scss',
                    '<%= root.src %>/scss/**/*.scss'
                ],
                tasks: ['compass:src'],
                options: {
                    livereload: '<%= root.livereload %>'
                }
            }
        },

        wiredep: {
            target: {
                src: [
                    'src/index.html'
                ]
            }
        }
    });

    grunt.registerTask('default', [
        'clean:src',
        'assemble',
        'compass:src',
        'autoprefixer',
        'concat:src',
        'connect:app',
        'watch'
    ]);

    grunt.registerTask('dist', [
        'clean:src',
        'clean:dist',
        'assemble',
        'compass:src',
        'autoprefixer',
        'concat:src',
        'copy'
    ]);

};