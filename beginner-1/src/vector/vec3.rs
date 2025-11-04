use crate::scalar::Scalar;
use crate::vector::ops::{Cross, VectorOps};
use std::ops::Mul;

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec3<T: Scalar> {
    pub x: T,
    pub y: T,
    pub z: T,
}

impl<T: Scalar> Vec3<T> {
    pub fn new(x: T, y: T, z: T) -> Self {
        Self { x, y, z }
    }
}

// 벡터 연산
impl<T: Scalar> VectorOps for Vec3<T> {
    type Output = T;

    fn dot(&self, rhs: &Self) -> T {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z
    }
    fn hadamard(&self, rhs: &Self) -> Self {
        Self {
            x: self.x * rhs.x,
            y: self.y * rhs.y,
            z: self.z * rhs.z,
        }
    }
    fn norm(&self) -> T {
        self.dot(self).sqrt()
    }

    fn normalize(&self) -> Self {
        let len = self.norm();
        let inv = T::one() / len;
        Self::new(self.x * inv, self.y * inv, self.z * inv)
    }
}

// Product
impl<T: Scalar> Mul for Vec3<T> {
    type Output = T;
    fn mul(self, rhs: Self) -> Self::Output {
        self.dot(&rhs)
    }
}

// 스칼라 곱
impl<T: Scalar> Mul<T> for Vec3<T> {
    type Output = Self;
    fn mul(self, rhs: T) -> Self::Output {
        Self {
            x: self.x * rhs,
            y: self.y * rhs,
            z: self.z * rhs,
        }
    }
}

// 외적
impl<T: Scalar> Cross for Vec3<T> {
    type Output = Self;

    fn cross(&self, rhs: &Self) -> Self {
        Self::new(
            self.y * rhs.z - self.z * rhs.y,
            self.z * rhs.x - self.x * rhs.z,
            self.x * rhs.y - self.y * rhs.x,
        )
    }
}
