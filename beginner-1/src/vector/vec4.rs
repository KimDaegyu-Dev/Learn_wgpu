use crate::scalar::Scalar;
use crate::vector::ops::VectorOps;
use std::ops::Mul;
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec4<T: Scalar> {
    pub x: T,
    pub y: T,
    pub z: T,
    pub w: T,
}

impl<T: Scalar> Vec4<T> {
    pub fn new(x: T, y: T, z: T, w: T) -> Self {
        Self { x, y, z, w }
    }
}

impl<T: Scalar> VectorOps for Vec4<T> {
    type Output = T;

    fn dot(&self, rhs: &Self) -> T {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z + self.w * rhs.w
    }
    fn hadamard(&self, rhs: &Self) -> Self {
        Self {
            x: self.x * rhs.x,
            y: self.y * rhs.y,
            z: self.z * rhs.z,
            w: self.w * rhs.w,
        }
    }

    fn norm(&self) -> T {
        self.dot(self).sqrt()
    }

    fn normalize(&self) -> Self {
        let len = self.norm();
        let inv = T::one() / len;
        Self::new(self.x * inv, self.y * inv, self.z * inv, self.w * inv)
    }
}

// Product
impl<T: Scalar> Mul for Vec4<T> {
    type Output = T;
    fn mul(self, rhs: Self) -> Self::Output {
        self.dot(&rhs)
    }
}

// 스칼라 곱
impl<T: Scalar> Mul<T> for Vec4<T> {
    type Output = Self;
    fn mul(self, rhs: T) -> Self::Output {
        Self {
            x: self.x * rhs,
            y: self.y * rhs,
            z: self.z * rhs,
            w: self.w * rhs,
        }
    }
}
