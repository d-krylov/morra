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

float fresnel_schlick(float u, float f0, float f90) {
  return f0 + (f90 - f0) * pow(1.0 - u, 5.0);
}

float fd_burley(float linear_roughness, float NdotV, float NdotL, float LdotH) {
  float f90 = 0.5 + 2.0 * linear_roughness * LdotH * LdotH;
  float light_scatter = fresnel_schlick(1.0, f90, NdotL);
  float view_scatter  = fresnel_schlick(1.0, f90, NdotV);
  return light_scatter * view_scatter / PI;
}

float trowbridge_reitz_ndf(float NdotH, float roughness) {
  roughness *= roughness; 
  float distribution = NdotH * NdotH * (roughness - 1.0) + 1.0;
  return roughness / (PI * distribution * distribution);
}

float smith_ggx_correlated(float NdotV, float NdotL, float roughness) {
  float a2 = roughness * roughness;
  float ggxv = NdotL * sqrt(NdotV * NdotV * (1.0 - a2) + a2);
  float ggxl = NdotV * sqrt(NdotL * NdotL * (1.0 - a2) + a2);
  return 0.5 / (ggxv + ggxl);
}


vec3 get_light() {
  return vec3(0.0);
}



#endif // LIGHT_FRAG