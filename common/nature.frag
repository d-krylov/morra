#ifndef NATURE_FRAG
#define NATURE_FRAG

#include "common.frag"
#include "distance.frag"

vec2 pythagoras_tree(vec3 p, float r, float h, float branches, float angle, float height_divisor, float radius_divisor, int iterations) {
  vec2 tree = vec2(sd_capsule(p, r, h), 0.0);
  for (int i = 0; i < iterations; i++) {
    float xz = repeat_angle(p.xz, branches);
    p.y -= h;
    p.xz *= rotate(xz + PI / branches);
    p.xy *= rotate(angle);
    p = p.yxz;
    h /= height_divisor;
    r /= radius_divisor;
    tree = min_object(tree, vec2(sd_capsule(p, r, h), float(i + 1)));
  }
  return tree;
}

vec2 pythagoras_tree(vec3 p, float r, float h, float branches, int iterations) {
  return pythagoras_tree(p, r, h, branches, PI / 4.0, 1.5, 1.5, iterations);
}

vec2 pythagoras_tree(vec3 p, float r, float h, float branches, float angle, int iterations) {
  return pythagoras_tree(p, r, h, branches, angle, 1.5, 1.5, iterations);
}

#endif // NATURE_FRAG