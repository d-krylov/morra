#ifndef MATERIAL_FRAG
#define MATERIAL_FRAG

struct Property {
  vec3 color;
  float chance;
  float roughness;
};

struct Material {
  vec3 albedo;
  vec3 emissive;
  Property reflection;
  Property refraction;
  float ior;
};

Material make_material(vec3 albedo, float reflection_chance, float reflection_roughness) {
  Property refraction; refraction.chance = 0.0;
  Property reflection = Property(albedo, reflection_chance, reflection_roughness);
  return Material(albedo, vec3(0.0), reflection, refraction, 1.5);
}

Material make_material(vec3 albedo, float reflection_chance, float reflection_roughness, float ior) {
  Property refraction; refraction.chance = 0.0;
  Property reflection = Property(albedo, reflection_chance, reflection_roughness);
  return Material(albedo, vec3(0.0), reflection, refraction, ior);
}

Material make_material(vec3 albedo, float reflection_chance, float reflection_roughness, 
                                    float refraction_chance, float refraction_roughness, float ior) {
  Property refraction = Property(albedo, refraction_chance, refraction_roughness);
  Property reflection = Property(albedo, reflection_chance, reflection_roughness);
  return Material(albedo, vec3(0.0), reflection, refraction, ior);
}

Material make_emissive_material(vec3 emissive) {
  Property empty; empty.chance = 0.0;
  return Material(vec3(0.0), emissive, empty, empty, 1.0);
}

#endif // MATERIAL_FRAG