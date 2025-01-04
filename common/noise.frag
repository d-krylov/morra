#ifndef NOISE_FRAG
#define NOISE_FRAG

// https://iquilezles.org/articles/fbm/
// https://iquilezles.org/articles/gradientnoise/
// https://iquilezles.org/articles/morenoise/

#include "random.frag"

#ifndef HASH
#define HASH(p) hash(p)
#endif

#ifndef NOISE
#define NOISE(p) noise(p)
#endif

float noise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
    
  float a = HASH(i + vec2(0.0, 0.0));
  float b = HASH(i + vec2(1.0, 0.0));
  float c = HASH(i + vec2(0.0, 1.0));
  float d = HASH(i + vec2(1.0, 1.0));
    
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);

  f = f * f * (3.0 - 2.0 * f);

  float A = HASH(i + vec3(0.0, 0.0, 0.0));
  float B = HASH(i + vec3(1.0, 0.0, 0.0));
  float C = HASH(i + vec3(0.0, 1.0, 0.0));
  float D = HASH(i + vec3(1.0, 1.0, 0.0));
  float E = HASH(i + vec3(0.0, 0.0, 1.0));
  float F = HASH(i + vec3(1.0, 0.0, 1.0));
  float G = HASH(i + vec3(0.0, 1.0, 1.0));
  float H = HASH(i + vec3(1.0, 1.0, 1.0));

  return mix(mix(mix(A, B, f.x), mix(C, D, f.x), f.y),
             mix(mix(E, F, f.x), mix(G, H, f.x), f.y), f.z);
}

vec4 noise_derivatives(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);

  vec3 u = f * f * (3.0 - 2.0 * f);
  vec3 du = 6.0 * f * (1.0 - f);

  float A = HASH(i + vec3(0.0, 0.0, 0.0));
  float B = HASH(i + vec3(1.0, 0.0, 0.0));
  float C = HASH(i + vec3(0.0, 1.0, 0.0));
  float D = HASH(i + vec3(1.0, 1.0, 0.0));
  float E = HASH(i + vec3(0.0, 0.0, 1.0));
  float F = HASH(i + vec3(1.0, 0.0, 1.0));
  float G = HASH(i + vec3(0.0, 1.0, 1.0));
  float H = HASH(i + vec3(1.0, 1.0, 1.0));

  float k0 = A;
  float k1 = B - A;
  float k2 = C - A;
  float k3 = E - A;
  float k4 = A - B - C + D;
  float k5 = A - C - E + G;
  float k6 = A - B - E + F;
  float k7 = -A + B + C - D + E - F - G + H;

  float r = mix(mix(mix(A, B, u.x), mix(C, D, u.x), u.y),
            mix(mix(E, F, u.x), mix(G, H, u.x), u.y), u.z);

  vec3 dr = du * vec3(k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
                      k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
                      k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y);
  
  return vec4(r, dr);
}

vec4 fbm_derivatives(vec3 x, float H, int octaves) {
  float G = pow(2.0, -H);    
  float f = 1.0;
  float a = 0.5;
  float v = 0.0;
  vec3  d = vec3(0.0);
  for (int i = 0; i < octaves; i++) {
    vec4 n = noise_derivatives(f * x);
    v += a * n.x;		
    d += float(i < 4) * a * f * n.yzw;
    a *= G;
    f *= 2.0;
  }
	return vec4(v, d);
}

float fbm(vec2 x, float H, int octaves) {    
  float G = pow(2.0, -H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  for (int i = 0; i < octaves; i++) {
    t += a * NOISE(f * x);
    f *= 2.0;
    a *= G;
  }
  return t;
}

float fbm(vec3 x, float H, int octaves) {    
  float G = pow(2.0, -H);
  float f = 1.0;
  float a = 1.0;
  float t = 0.0;
  for (int i = 0; i < octaves; i++) {
    t += a * noise(f * x);
    f *= 2.0;
    a *= G;
  }
  return t;
}

#endif // NOISE_FRAG