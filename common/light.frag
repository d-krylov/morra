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

float fresnel_reflect_amount(float n1, float n2, vec3 normal, vec3 ray_direction, float f0, float f90) {
  float R0 = (n1 - n2) / (n1 + n2); R0 *= R0;
  float cos_theta = -dot(normal, ray_direction);
  if (n1 > n2) {
    float n = n1 / n2;
    float sin_theta_square = n * n * (1.0 - cos_theta * cos_theta);
    if (sin_theta_square > 1.0) return f90;
    cos_theta = sqrt(1.0 - sin_theta_square);
  }
  float result = R0 + (1.0 - R0) * pow(1.0 - cos_theta, 5.0);
  return mix(f0, f90, result);
}



#endif // LIGHT_FRAG