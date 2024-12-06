mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}


void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = in_position / iResolution.xy;

  vec3 color = vec3(0.0);
  vec2 center = vec2(0.5);

  uv /= 2.0;

  for (float i = 0.0; i < 5.0; i++) {

    vec2 ch = step(center, uv);

    uv = 2.0 * uv - ch;

    color.x += smoothstep(0.2, 0.0, length(uv - center));
  }

  out_color = vec4(color, 1.0);
}