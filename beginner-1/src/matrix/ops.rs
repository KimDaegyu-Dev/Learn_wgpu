use crate::scalar::Scalar;
use crate::vector::Vector;

pub trait MatrixOps<T: Scalar, const N: usize> {
    fn transpose(&self) -> Self;
    fn mul_vec(&self, rhs: &Vector<T, N>) -> Vector<T, N>;
    fn mul_mat(&self, rhs: &Self) -> Self;
}
pub trait TransformOps<T: Scalar, const N: usize> {
    fn translate(v: &Vector<T, N>) -> Self;
    fn scale(v: &Vector<T, N>) -> Self;
    fn rotate(angle: T, axis: &Vector<T, N>) -> Self;
    fn perspective(fov: T, aspect: T, near: T, far: T) -> Self;
    fn look_at(eye: &Vector<T, N>, target: &Vector<T, N>, up: &Vector<T, N>) -> Self;
}
