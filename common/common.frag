#ifndef COMMON_FRAG
#define COMMON_FRAG

// STRUCTURES

#define PI 3.141592653589793

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Hit {
  float id;
  float t;
  vec3 position;
  vec3 normal;
};

struct Material {
  vec3 albedo;
  float metallic;
  float roughness;
};

// TOOLS

vec2 MIN(vec2 p, vec2 q) {
  return (p.x < q.x) ? p : q;
}

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

mat2 rotate_tangent(float atg) {
  float sn = atg / sqrt(1.0 + atg * atg);
  float cs = 1.0 / sqrt(1.0 + atg * atg);
  return mat2(cs, sn, -sn, cs);
}

vec3 get_texture(sampler2D s, vec3 p, vec3 n) {
  return texture(s, p.xy).xyz * abs(n.z) +
         texture(s, p.xz).xyz * abs(n.y) +
         texture(s, p.zy).xyz * abs(n.x); 
}

float repeat_angle(vec2 p, float n) {
  float sp = 2.0 * PI / n;
  float an = atan(p.y, p.x);
  float id = floor(an / sp);
  return sp * id;
}

float get_angle_id(vec2 p, float n) {
  float sp = 2.0 * PI / n;
  float an = atan(p.y, p.x);
  return floor(an / sp);
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

float smin(float a, float b, float k) {
  k *= 2.0;
  float x = b - a;
  return 0.5 * (a + b - sqrt(x * x + k * k));
}

vec3 fibonacci_lattice(float i, float count) {
  float f = 0.5 * sqrt(5.0) - 0.5;
  float z = 1.0 - 2.0 * (i + 0.5) / count;
  float r = sqrt(1.0 - z * z);
  float phi = PI * f * i;
  float x = r * cos(phi);
  float y = r * sin(phi);
  return vec3(x, y, z);
}

#endif // COMMON_FRAG