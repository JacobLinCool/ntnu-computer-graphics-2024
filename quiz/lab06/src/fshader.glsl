precision mediump float;
uniform vec3 u_LightPosition;
uniform vec3 u_ViewPosition;
uniform float u_Ka;
uniform float u_Kd;
uniform float u_Ks;
uniform float u_shininess;
varying vec3 v_Normal;
varying vec3 v_PositionInWorld;
varying vec4 v_Color;
void main() {
    // let ambient and diffuse color are v_Color 
    // (you can also input them from ouside and make them different)
    vec3 ambientLightColor = v_Color.rgb;
    vec3 diffuseLightColor = v_Color.rgb;
    // assume white specular light (you can also input it from ouside)
    vec3 specularLightColor = vec3(1.0, 1.0, 1.0);        

    //TODO-5: calculate ambient light color using "ambientLightColor" and "u_Ka"
    vec3 ambient = ambientLightColor * u_Ka;
    
    vec3 normal = normalize(v_Normal); //normalize the v_Normal before using it, before it comes from normal vectors interpolation
    //TODO-6: calculate diffuse light color using "normal", "u_LightPosition", "v_PositionInWorld", "diffuseLightColor", and "u_Kd"
    vec3 lightDirection = normalize(u_LightPosition - v_PositionInWorld);
    float nDotL = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = diffuseLightColor * u_Kd * nDotL;
    
    vec3 specular = vec3(0.0, 0.0, 0.0); 
    if (nDotL > 0.0) {
        //TODO-7: calculate specular light color using "normal", "u_LightPosition", "v_PositionInWorld", 
        //       "u_ViewPosition", "u_shininess", "specularLightColor", and "u_Ks"
        //   You probably can store the result of specular calculation into "specular" variable
        vec3 viewDirection = normalize(u_ViewPosition - v_PositionInWorld);
        vec3 halfVector = normalize(viewDirection + lightDirection);
        float nDotH = max(dot(normal, halfVector), 0.0);
        specular = specularLightColor * u_Ks * pow(nDotH, u_shininess);
    }

    //TODO-8: sum up ambient, diffuse, specular light color from above calculation and put them into "gl_FragColor"
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
