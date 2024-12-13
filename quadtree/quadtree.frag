#define STEPS 5.0

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color;

  float s = 1.0;
  for (int i = 0; i < 5; i++) {
    vec2 a = mod(uv * s, 2.0) - 1.0;
    s *= 3.0;

    color.x += float(2 * (i % 2) - 1) * step(length(a) - 0.5, 0.0);
  }






  out_color = vec4(color, 1.0);
}