#ifndef COMMON_FRAG
#define COMMON_FRAG

// STRUCTURES

struct Triangle {
  vec3 a;
  vec3 b;
  vec3 c;
  vec2 uvA;
  vec2 uvB;
  vec2 uvC;
};

mat4 translate(vec3 v) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    v.x, v.y, v.z, 0.0
  );
}


mat4 rotate(vec3 p) {
  return mat4(0.0);
}

#endif // COMMON_FRAG