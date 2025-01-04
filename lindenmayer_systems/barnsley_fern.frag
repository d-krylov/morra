#include "common/random.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  vec3 color = vec3(0.0);

  uv *= 10.0;

  uint seed = uint(uint(in_position.x) * uint(1973) + uint(in_position.y) * uint(9277)) | uint(1);

  float x = 0.0;
  float y = 0.0;
  float t = 0.0;
  float xn = 0.0;
  float yn = 0.0;
  
  for (int i = 0; i < 200; i++) {
    float r = random(seed);
    
      xn = 0.0;
      yn = 0.16 * y;

      color.x += step(length(uv - vec2(xn, yn)), 0.1);

      xn = 0.85 * x + 0.04 * y;
      yn = -0.04 * x + 0.85 * y + 1.6;

      color.x += step(length(uv - vec2(xn, yn)), 0.1);

      xn = 0.2 * x - 0.26 * y;
      yn = 0.23 * x + 0.22 * y + 1.6;

      color.x += step(length(uv - vec2(xn, yn)), 0.1);

      xn = -0.15 * x + 0.28 * y;
      yn = 0.26 * x + 0.24 * y + 0.44;
    
      color.x += step(length(uv - vec2(xn, yn)), 0.1);

    x = xn;
    y = yn;
  }


  out_color = vec4(color, 1.0);
}