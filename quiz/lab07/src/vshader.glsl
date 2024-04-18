attribute vec4 a_Position;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_normalMatrix;
varying vec3 v_Normal;
varying vec3 v_PositionInWorld;
void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
    v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
}
