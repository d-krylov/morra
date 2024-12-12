#ifndef LIGHT_FRAG
#define LIGHT_FRAG

#include "common.frag"

vec3 ACES(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);
}

vec3 gamma(vec3 color) {
  return pow(max(color, 0.0), vec3(0.45));
}

#endif // LIGHT_FRAG